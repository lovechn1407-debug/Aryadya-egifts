export const RATE_LIMIT_CONFIG = {
  auth: {
    // Stricter limits for authentication routes (admin login, buyer login)
    maxAttemptsPerIp: parseInt(process.env.RATE_LIMIT_AUTH_MAX_IP_ATTEMPTS || "5"),
    maxAttemptsPerAccount: parseInt(process.env.RATE_LIMIT_AUTH_MAX_ACCOUNT_ATTEMPTS || "5"),
    windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || "900000"), // 15 minutes window for resetting attempt counts
    baseBackoffMs: parseInt(process.env.RATE_LIMIT_AUTH_BASE_BACKOFF_MS || "2000"), // Starting backoff: 2 seconds
    maxBackoffMs: parseInt(process.env.RATE_LIMIT_AUTH_MAX_BACKOFF_MS || "60000"), // Maximum backoff delay: 1 minute
  },
  public: {
    // Moderate limits for public endpoints (order creation, etc.)
    maxRequests: parseInt(process.env.RATE_LIMIT_PUBLIC_MAX_REQUESTS || "30"),
    windowMs: parseInt(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS || "60000"), // 1 minute
  },
  authenticated: {
    // Looser limits for authenticated user actions (saving customizations, etc.)
    maxRequests: parseInt(process.env.RATE_LIMIT_AUTH_USER_MAX_REQUESTS || "100"),
    windowMs: parseInt(process.env.RATE_LIMIT_AUTH_USER_WINDOW_MS || "60000"), // 1 minute
  }
};
