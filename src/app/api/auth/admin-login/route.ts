import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, recordAuthResult } from "@/lib/rate-limiter";
import { AdminLoginSchema, formatZodError } from "@/lib/schemas";
import { ADMIN_PASSWORD } from "@/lib/data";

export async function POST(req: NextRequest) {
  const accountId = "admin";
  
  // 1. Check rate limit (auth category)
  const rateLimitResponse = await checkRateLimit(req, "auth", accountId);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const validationResult = AdminLoginSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ message: "Validation error: " + formatZodError(validationResult.error) }, { status: 400 });
    }
    
    const { password } = validationResult.data;

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required." },
        { status: 400 }
      );
    }

    // 2. Validate password
    if (password === ADMIN_PASSWORD) {
      // Record success to clear rate limiting backoff state
      await recordAuthResult(req, accountId, true);
      return NextResponse.json({ success: true });
    } else {
      // Record failure to increment backoff tracking
      await recordAuthResult(req, accountId, false);
      return NextResponse.json(
        { success: false, message: "Incorrect password." },
        { status: 401 }
      );
    }
  } catch (err: unknown) {
    console.error("[admin-login] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
