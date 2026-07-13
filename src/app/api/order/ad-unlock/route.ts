import { NextRequest, NextResponse } from "next/server";
import { getOrderDB, updateOrderStatusDB, getSettingsDB } from "@/lib/db";
import { sendOrderConfirmationEmailServer } from "@/lib/email-server";
import { checkRateLimit } from "@/lib/rate-limiter";
import { AdUnlockSchema, formatZodError } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const rateLimitResponse = await checkRateLimit(req, "public");
  if (rateLimitResponse) return rateLimitResponse;
  try {
    const body = await req.json();
    const validationResult = AdUnlockSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ message: "Validation error: " + formatZodError(validationResult.error) }, { status: 400 });
    }
    
    const { orderId, finalize } = validationResult.data;

    const order = await getOrderDB(orderId);
    if (!order) return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });

    const newStatus = finalize ? "finalized" : "editing";
    const extraPayload = finalize ? { finalizedAt: new Date().toISOString() } : {};

    await updateOrderStatusDB(orderId, newStatus, extraPayload);

    // Send emails
    try {
      const settings = await getSettingsDB();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || "https://aradhyagifts.in";
      
      if (finalize && settings.emailServiceFinalize) {
        const { sendFinalizationEmail } = await import("@/lib/email");
        sendFinalizationEmail({
          buyer_name: order.buyerName,
          email: order.buyerEmail,
          order_id: orderId,
          product_name: order.productName,
          product_emoji: "🎁",
          view_link: `${siteUrl}/view/${orderId}`,
        });
      } else if (!finalize && settings.emailServiceBuy) {
        await sendOrderConfirmationEmailServer({
          buyer_name: order.buyerName,
          email: order.buyerEmail,
          order_id: orderId,
          product_name: order.productName,
          product_emoji: "🎁",
          subtotal: "0",
          discount: "0",
          amount: "0",
          coupon_code: "FREE_AD_UNLOCK",
          edit_link: `${siteUrl}/edit/${orderId}`,
        });
      }
    } catch (_) {
      // Non-fatal
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[ad-unlock]", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
