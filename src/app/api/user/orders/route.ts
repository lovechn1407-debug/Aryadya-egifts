export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getOrdersByUserIdDB, updateOrderStatusDB, getCouponDB, saveCouponDB } from "@/lib/db";

const CASHFREE_BASE =
  process.env.CASHFREE_MODE === "production"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";

const CF_VERSION = "2023-08-01";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = authHeader.split("Bearer ")[1];
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const orders = await getOrdersByUserIdDB(userId);
    
    // Dynamically sync any pending orders with Cashfree status in case webhook missed it or user exited early
    const syncedOrders = await Promise.all(
      (orders || []).map(async (order) => {
        if (order.status === "pending") {
          try {
            const cfRes = await fetch(
              `${CASHFREE_BASE}/pg/orders/${order.id}/payments`,
              {
                headers: {
                  "x-client-id": process.env.CASHFREE_APP_ID!,
                  "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
                  "x-api-version": CF_VERSION,
                },
              }
            );

            if (cfRes.ok) {
              const payments = await cfRes.json();
              if (Array.isArray(payments)) {
                const successPayment = payments.find(
                  (p: any) => p.payment_status === "SUCCESS"
                );

                if (successPayment) {
                  const isPostPay = order.paymentMode === "post-pay";
                  const newStatus = isPostPay ? "finalized" : "paid";
                  const extraPayload = isPostPay ? { finalizedAt: new Date().toISOString() } : {};

                  // Update Firebase DB order status
                  await updateOrderStatusDB(order.id, newStatus, extraPayload);
                  
                  // Increment coupon usage if order had a coupon
                  if (order.couponCode) {
                    const coupon = await getCouponDB(order.couponCode);
                    if (coupon) {
                      await saveCouponDB({ ...coupon, usedCount: coupon.usedCount + 1 });
                    }
                  }

                  // Return the updated status to client immediately
                  return { ...order, status: newStatus, ...extraPayload };
                }
              }
            }
          } catch (err) {
            console.error(`[user/orders] Cashfree sync failed for order ${order.id}:`, err);
          }
        }
        return order;
      })
    );
    
    return NextResponse.json({ success: true, orders: syncedOrders });
  } catch (e: unknown) {
    console.error("[user/orders] Error fetching orders:", e);
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 });
  }
}
