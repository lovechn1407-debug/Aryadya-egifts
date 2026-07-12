import { NextRequest, NextResponse } from "next/server";
import { ref, get, set, runTransaction } from "firebase/database";
import { database } from "./firebase";
import { getSettingsDB } from "./db";
import { RATE_LIMIT_CONFIG as DEFAULT_RATE_LIMIT_CONFIG } from "./rate-limit-config";
import crypto from "crypto";

// Helper to hash IPs and account identifiers for secure and valid Firebase keys
function hashKey(val: string): string {
  return crypto.createHash("sha256").update(val).digest("hex");
}

// Extract IP address from request headers
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP if multiple are forwarded
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  
  return "127.0.0.1";
}

interface BackoffRecord {
  failedAttempts: number;
  lastAttemptTime: string;
}

/**
 * Checks rate limits for a request based on category.
 * Returns a 429 NextResponse if limited, or null if allowed.
 */
export async function checkRateLimit(
  req: NextRequest,
  category: "public" | "authenticated" | "auth",
  accountId?: string
): Promise<NextResponse | null> {
  try {
  const ip = getClientIp(req);
  const ipHash = hashKey(ip);
  const now = Date.now();

  // Fetch dynamic settings from database
  const settings = await getSettingsDB();
  const configAuth = {
    maxAttemptsPerIp: settings.rateLimitAuthMaxIP ?? DEFAULT_RATE_LIMIT_CONFIG.auth.maxAttemptsPerIp,
    maxAttemptsPerAccount: settings.rateLimitAuthMaxAccount ?? DEFAULT_RATE_LIMIT_CONFIG.auth.maxAttemptsPerAccount,
    windowMs: settings.rateLimitAuthWindowMs ?? DEFAULT_RATE_LIMIT_CONFIG.auth.windowMs,
    baseBackoffMs: DEFAULT_RATE_LIMIT_CONFIG.auth.baseBackoffMs,
    maxBackoffMs: DEFAULT_RATE_LIMIT_CONFIG.auth.maxBackoffMs
  };

  const configPublic = {
    maxRequests: settings.rateLimitPublicMax ?? DEFAULT_RATE_LIMIT_CONFIG.public.maxRequests,
    windowMs: settings.rateLimitPublicWindowMs ?? DEFAULT_RATE_LIMIT_CONFIG.public.windowMs
  };

  const configAuthenticated = {
    maxRequests: settings.rateLimitAuthUserMax ?? DEFAULT_RATE_LIMIT_CONFIG.authenticated.maxRequests,
    windowMs: settings.rateLimitAuthUserWindowMs ?? DEFAULT_RATE_LIMIT_CONFIG.authenticated.windowMs
  };

  // ── AUTH CATEGORY (IP + ACCOUNT WITH EXPONENTIAL BACKOFF) ──────────────────
  if (category === "auth") {
    const config = configAuth;
    const checks: { path: string; name: string }[] = [
      { path: `rate_limits/auth_backoff/ip_${ipHash}`, name: "IP" }
    ];

    if (accountId) {
      const accountHash = hashKey(accountId.toLowerCase().trim());
      checks.push({ path: `rate_limits/auth_backoff/account_${accountHash}`, name: "Account" });
    }

    // Check backoffs
    for (const check of checks) {
      const dbRef = ref(database, check.path);
      const snap = await get(dbRef);
      if (snap.exists()) {
        const record = snap.val() as BackoffRecord;
        if (record.failedAttempts > 0) {
          // Calculate exponential backoff delay: baseBackoffMs * 2^(failedAttempts - 1)
          const multiplier = Math.pow(2, record.failedAttempts - 1);
          const delay = Math.min(config.baseBackoffMs * multiplier, config.maxBackoffMs);
          const lastAttempt = new Date(record.lastAttemptTime).getTime();
          const elapsed = now - lastAttempt;

          if (elapsed < delay) {
            const retryAfterSec = Math.ceil((delay - elapsed) / 1000);
            return NextResponse.json(
              {
                success: false,
                message: `Too many failed login attempts. Please try again in ${retryAfterSec} seconds.`,
                retryAfter: retryAfterSec
              },
              {
                status: 429,
                headers: {
                  "Retry-After": String(retryAfterSec)
                }
              }
            );
          }
        }
      }
    }
    return null;
  }

  // ── PUBLIC & AUTHENTICATED CATEGORIES (SLIDING WINDOW RATE LIMIT) ──────────
  const config = category === "authenticated" ? configAuthenticated : configPublic;
  const slidingWindowPath = `rate_limits/sliding_window/${category}/${ipHash}`;
  const dbRef = ref(database, slidingWindowPath);

  let limitExceeded = false;
  let retryAfterSec = 0;
  
  await runTransaction(dbRef, (currentData: number[] | null) => {
    const timestamps = currentData || [];
    // Filter out timestamps older than the window
    const windowStart = now - config.windowMs;
    const activeTimestamps = timestamps.filter(t => t > windowStart);

    if (activeTimestamps.length >= config.maxRequests) {
      limitExceeded = true;
      const oldestActive = activeTimestamps[0];
      retryAfterSec = Math.ceil((oldestActive + config.windowMs - now) / 1000);
      return activeTimestamps; // Don't write new timestamp, just return active ones
    }

    activeTimestamps.push(now);
    return activeTimestamps;
  });

  if (limitExceeded) {
    return NextResponse.json(
      {
        success: false,
        message: `Rate limit exceeded. Please try again in ${retryAfterSec} seconds.`,
        retryAfter: retryAfterSec
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec)
        }
      }
    );
  }

  return null;
  } catch (e) {
    // Fail open: if rate limiter DB is unavailable, allow the request through
    console.error("[rate-limiter] Firebase error, failing open:", e);
    return null;
  }
}

/**
 * Record a login result (success or failure) to update the exponential backoff trackers.
 */
export async function recordAuthResult(
  req: NextRequest,
  accountId: string | undefined,
  success: boolean
): Promise<void> {
  const ip = getClientIp(req);
  const ipHash = hashKey(ip);
  
  const paths = [`rate_limits/auth_backoff/ip_${ipHash}`];
  if (accountId) {
    const accountHash = hashKey(accountId.toLowerCase().trim());
    paths.push(`rate_limits/auth_backoff/account_${accountHash}`);
  }

  for (const path of paths) {
    const dbRef = ref(database, path);
    if (success) {
      // Clear backoff tracking on successful login
      await set(dbRef, null);
    } else {
      // Increment failed attempts on failure
      await runTransaction(dbRef, (currentData: BackoffRecord | null) => {
        const record = currentData || { failedAttempts: 0, lastAttemptTime: "" };
        return {
          failedAttempts: record.failedAttempts + 1,
          lastAttemptTime: new Date().toISOString()
        };
      });
    }
  }
}
