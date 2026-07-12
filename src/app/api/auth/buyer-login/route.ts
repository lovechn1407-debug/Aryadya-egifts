import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, recordAuthResult } from "@/lib/rate-limiter";
import { getOrdersByBuyerDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { phone, email } = await req.json();

    if (!phone || !email) {
      return NextResponse.json(
        { success: false, message: "Phone and email are required." },
        { status: 400 }
      );
    }

    const sanitizedPhone = phone.trim().replace(/\D/g, "").slice(-10);
    const sanitizedEmail = email.toLowerCase().trim();
    const accountId = `buyer_${sanitizedPhone}_${sanitizedEmail}`;

    // 1. Check rate limit (auth category)
    const rateLimitResponse = await checkRateLimit(req, "auth", accountId);
    if (rateLimitResponse) return rateLimitResponse;

    // 2. Fetch orders from DB
    const orders = await getOrdersByBuyerDB(phone, email);

    if (orders.length > 0) {
      // Record success to clear rate limiting backoff state
      await recordAuthResult(req, accountId, true);
      return NextResponse.json({ success: true, orders });
    } else {
      // Record failure to increment backoff tracking (incorrect credentials)
      await recordAuthResult(req, accountId, false);
      return NextResponse.json(
        { success: false, message: "No orders found matching these details." },
        { status: 404 }
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[buyer-login] Error:", message);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
