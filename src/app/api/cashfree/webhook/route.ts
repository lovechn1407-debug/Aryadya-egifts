// =============================================
// POST /api/cashfree/webhook
// Receives payment events from Cashfree.
// Verifies signature → updates Firebase order status → sends confirmation email.
// =============================================
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";
import { createHmac } from "crypto";
import { getOrderDB, updateOrderStatusDB, saveCouponDB, getCouponDB, getSettingsDB } from "@/lib/db";
import { sendOrderConfirmationEmailServer } from "@/lib/email-server";

const CF_VERSION = "2023-08-01";
const CASHFREE_BASE =
  process.env.CASHFREE_MODE === "production"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";

// ── Cashfree webhook signature verification ───────────────────────────────────
function verifyWebhookSignature(
  rawBody: string,
  timestamp: string,
  receivedSignature: string
): boolean {
  const secret = process.env.CASHFREE_SECRET_KEY!;
  const data = `${timestamp}${rawBody}`;
  const expectedSignature = createHmac("sha256", secret)
    .update(data)
    .digest("base64");
  return expectedSignature === receivedSignature;
}

export async function POST(req: NextRequest) {
  const rateLimitResponse = await checkRateLimit(req, "public");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const rawBody = await req.text();
    const timestamp = req.headers.get("x-webhook-timestamp") || "";
    const signature = req.headers.get("x-webhook-signature") || "";

    // ── Verify authenticity ──────────────────────────────────────────────────
    if (timestamp && signature) {
      const isValid = verifyWebhookSignature(rawBody, timestamp, signature);
      if (!isValid) {
        console.warn("[webhook] Invalid Cashfree signature — ignoring.");
        return NextResponse.json({ status: "invalid_signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event?.type || "";
    const orderId: string = event?.data?.order?.order_id || "";

    if (!orderId) {
      return NextResponse.json({ status: "no_order_id" }, { status: 200 });
    }

    // ── Fetch order from Firebase ────────────────────────────────────────────
    const order = await getOrderDB(orderId);
    if (!order) {
      console.warn(`[webhook] Order ${orderId} not found in Firebase.`);
      return NextResponse.json({ status: "order_not_found" }, { status: 200 });
    }

    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
      // Idempotency guard — don't double-process
      if (order.status === "paid" || order.status === "finalized" || order.status === "editing") {
        return NextResponse.json({ status: "already_processed" });
      }

      // Mark as paid
      await updateOrderStatusDB(orderId, "paid");

      // Increment coupon usage if applicable
      if (order.couponCode) {
        const coupon = await getCouponDB(order.couponCode);
        if (coupon) {
          await saveCouponDB({ ...coupon, usedCount: coupon.usedCount + 1 });
        }
      }

      // Send confirmation email
      try {
        const settings = await getSettingsDB();
        if (settings.emailServiceBuy) {
          const siteUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "https://aradhyagifts.in";
          const editLink = `${siteUrl}/edit/${orderId}`;

          await sendOrderConfirmationEmailServer({
            buyer_name: order.buyerName,
            email: order.buyerEmail,
            order_id: orderId,
            product_name: order.productName,
            product_emoji: "🎁",
            subtotal: String(
              Math.floor((order.amount + (order.discountAmount || 0)) / 100)
            ),
            discount: String(Math.floor((order.discountAmount || 0) / 100)),
            amount: String(Math.floor(order.amount / 100)),
            coupon_code: order.couponCode || "NONE",
            edit_link: editLink,
          });
        }
      } catch (emailErr) {
        console.error("[webhook] Email send failed:", emailErr);
        // Non-fatal — order is still marked paid
      }

      return NextResponse.json({ status: "success" });
    }

    if (
      eventType === "PAYMENT_FAILED_WEBHOOK" ||
      eventType === "PAYMENT_USER_DROPPED_WEBHOOK"
    ) {
      // Keep order as pending so user can retry
      if (order.status === "pending") {
        // Leave as-is (or optionally mark failed)
      }
      return NextResponse.json({ status: "payment_failed_noted" });
    }

    // Unknown event — acknowledge to avoid retries
    return NextResponse.json({ status: "event_ignored" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook] Error:", message);
    // Return 200 so Cashfree doesn't retry unnecessarily
    return NextResponse.json({ status: "error", message }, { status: 200 });
  }
}
