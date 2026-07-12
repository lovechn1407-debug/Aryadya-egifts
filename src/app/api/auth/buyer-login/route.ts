import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, recordAuthResult } from "@/lib/rate-limiter";
import { BuyerLoginSchema, formatZodError } from "@/lib/schemas";
import { getOrdersByBuyerDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  const rateLimitResponse = await checkRateLimit(req, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const validationResult = BuyerLoginSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ message: "Validation error: " + formatZodError(validationResult.error) }, { status: 400 });
    }
    
    const { phone, email } = validationResult.data;

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
    console.error("[buyer-login] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
