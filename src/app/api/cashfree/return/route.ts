// =============================================
// GET /api/cashfree/return?order_id=xxx
// Browser is redirected here by Cashfree after payment.
// Verifies payment status server-side before sending user to editor.
// =============================================
import { NextRequest, NextResponse } from "next/server";
import { getOrderDB, updateOrderStatusDB, saveCouponDB, getCouponDB, getSettingsDB } from "@/lib/db";
import { sendOrderConfirmationEmailServer } from "@/lib/email-server";

const CASHFREE_BASE =
  process.env.CASHFREE_MODE === "production"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";

const CF_VERSION = "2023-08-01";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const orderId = searchParams.get("order_id");
  // Use the actual request origin so localhost:3000 works in dev
  const siteUrl = origin;

  if (!orderId) {
    return NextResponse.redirect(`${siteUrl}/?payment=error`);
  }

  // ── Fetch the order from Firebase ─────────────────────────────────────────
  const order = await getOrderDB(orderId);
  if (!order) {
    return NextResponse.redirect(`${siteUrl}/?payment=error`);
  }

  const shouldFinalize = searchParams.get("finalize") === "true";

  // ── If already paid (webhook processed first), just redirect ──────────────
  if (order.status === "finalized") {
    return NextResponse.redirect(`${siteUrl}/view/${orderId}`);
  }
  if (order.status === "paid" || order.status === "editing") {
    // Webhook fired first — if this was a post-pay finalize flow, complete it now
    if (shouldFinalize) {
      try {
        await updateOrderStatusDB(orderId, "finalized", { finalizedAt: new Date().toISOString() });
        const settings = await getSettingsDB();
        if (settings.emailServiceFinalize) {
          const { sendFinalizationEmail } = await import("@/lib/email");
          sendFinalizationEmail({
            buyer_name: order.buyerName,
            email: order.buyerEmail,
            order_id: orderId,
            product_name: order.productName,
            product_emoji: "🎁",
            view_link: `${siteUrl}/view/${orderId}`,
          });
        }
      } catch (_) { /* non-fatal */ }
      return NextResponse.redirect(`${siteUrl}/view/${orderId}`);
    }
    return NextResponse.redirect(`${siteUrl}/edit/${orderId}`);
  }

  // ── Verify payment status with Cashfree API ───────────────────────────────
  try {
    const cfRes = await fetch(
      `${CASHFREE_BASE}/pg/orders/${orderId}/payments`,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID!,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
          "x-api-version": CF_VERSION,
        },
      }
    );

    if (!cfRes.ok) {
      console.error("[return] Cashfree payments fetch failed:", await cfRes.text());
      // Redirect to a waiting/failed page
      return NextResponse.redirect(
        `${siteUrl}/order/${order.productId}?payment=failed&order_id=${orderId}`
      );
    }

    const payments: Array<{ payment_status: string }> = await cfRes.json();
    const successPayment = payments.find(
      (p) => p.payment_status === "SUCCESS"
    );

    if (successPayment) {
      const newStatus = shouldFinalize ? "finalized" : "paid";
      const extraPayload = shouldFinalize ? { finalizedAt: new Date().toISOString() } : {};

      // Mark as paid or finalized
      await updateOrderStatusDB(orderId, newStatus, extraPayload);

      // Increment coupon usage
      if (order.couponCode) {
        const coupon = await getCouponDB(order.couponCode);
        if (coupon) {
          await saveCouponDB({ ...coupon, usedCount: coupon.usedCount + 1 });
        }
      }

      // Send confirmation email (if webhook hasn't already done it)
      try {
        const settings = await getSettingsDB();
        
        if (shouldFinalize && settings.emailServiceFinalize) {
          // Send finalize email if we just finalized it
          const { sendFinalizationEmail } = await import("@/lib/email");
          const editLink = `${siteUrl}/view/${orderId}`;
          sendFinalizationEmail({
            buyer_name: order.buyerName,
            email: order.buyerEmail,
            order_id: orderId,
            product_name: order.productName,
            product_emoji: "🎁",
            view_link: editLink,
          });
        } else if (settings.emailServiceBuy) {
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
      } catch (_) {
        // Non-fatal
      }

      return NextResponse.redirect(
        shouldFinalize
          ? `${siteUrl}/view/${orderId}`
          : `${siteUrl}/edit/${orderId}`
      );
    } else {
      // Payment failed or pending
      return NextResponse.redirect(
        `${siteUrl}/order/${order.productId}?payment=failed&order_id=${orderId}`
      );
    }
  } catch (err) {
    console.error("[return] Error verifying payment:", err);
    return NextResponse.redirect(
      `${siteUrl}/order/${order.productId}?payment=failed&order_id=${orderId}`
    );
  }
}
