// =============================================
// POST /api/cashfree/create-order
// Creates a pending Firebase order and a Cashfree PG order.
// Returns: { payment_session_id, order_id, cashfree_order_id }
// =============================================
import { NextRequest, NextResponse } from "next/server";
import { getProductDB, createPendingOrderDB } from "@/lib/db";
import { getCouponDB, getOrdersByBuyerDB, saveCouponDB } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limiter";
import { CreateCashfreeOrderSchema, formatZodError } from "@/lib/schemas";

const CASHFREE_BASE =
  process.env.CASHFREE_MODE === "production"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";

const CF_VERSION = "2023-08-01";

// ── Helper: fetch Cashfree with timeout + 1 auto-retry ────────────────────────
async function fetchCashfree(
  url: string,
  options: RequestInit,
  timeoutMs = 15000,
  retries = 2
): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err: unknown) {
      clearTimeout(timer);
      const isAbort =
        err instanceof Error && err.name === "AbortError";
      const isLast = attempt === retries;
      if (isLast) throw err;
      // Wait 1.5s before retrying
      console.warn(`[Cashfree] Attempt ${attempt} failed (${isAbort ? "timeout" : "network"}). Retrying…`);
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw new Error("Cashfree unreachable after retries");
}

export async function POST(req: NextRequest) {
  const rateLimitResponse = await checkRateLimit(req, "public");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const validationResult = CreateCashfreeOrderSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ message: "Validation error: " + formatZodError(validationResult.error) }, { status: 400 });
    }
    
    const {
      productId,
      buyerName,
      buyerEmail,
      buyerPhone,
      couponCode,
    } = validationResult.data;

    // ── Fetch product price (server-side, can't be spoofed) ──────────────────
    const product = await getProductDB(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    // ── Coupon validation & discount calculation ──────────────────────────────
    let discountAmount = 0;
    let validatedCoupon = null;

    if (couponCode) {
      const c = await getCouponDB(couponCode);
      if (c && c.active && c.usedCount < c.totalStocks) {
        const now = new Date();
        const notExpired =
          (!c.validFrom || now >= new Date(c.validFrom)) &&
          (!c.validTo || now <= new Date(c.validTo));
        const meetsMin = c.minimumOrderValue <= product.price;

        if (notExpired && meetsMin) {
          const pastOrders = await getOrdersByBuyerDB(buyerPhone, buyerEmail);
          const usedByPerson = pastOrders.filter(
            (o) => o.couponCode === c.id
          ).length;

          if (usedByPerson < c.perPersonLimit) {
            if (c.discountType === "percentage") {
              discountAmount = Math.floor(
                product.price * (c.discountAmount / 100)
              );
            } else {
              discountAmount = c.discountAmount * 100;
            }
            validatedCoupon = c;
          }
        }
      }
    }

    const finalPrice = Math.max(0, product.price - discountAmount);

    // ── Create a PENDING order in Firebase ───────────────────────────────────
    const order = await createPendingOrderDB({
      productId: product.id,
      productName: product.name,
      buyerName,
      buyerEmail,
      buyerPhone,
      amount: finalPrice,
      couponCode: validatedCoupon?.id,
      discountAmount,
    });

    // ── If free (after coupon), skip Cashfree ────────────────────────────────
    if (finalPrice === 0) {
      if (validatedCoupon) {
        await saveCouponDB({
          ...validatedCoupon,
          usedCount: validatedCoupon.usedCount + 1,
        });
      }
      return NextResponse.json({
        success: true,
        free: true,
        order_id: order.id,
      });
    }

    // ── Build the correct base URL from the incoming request ─────────────────
    // This ensures localhost:3000 is used in dev and the live domain in prod.
    const origin = req.headers.get("origin") ||
      req.headers.get("referer")?.replace(/\/$/, "").split("/").slice(0, 3).join("/") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://aradhyagifts.in";

    // Sanitize phone: Cashfree needs exactly 10 digits
    const phone10 = buyerPhone.replace(/\D/g, "").slice(-10);
    // customer_id must be alphanumeric, min 3 chars
    const customerId = `cust_${phone10}`;

    const cfPayload = {
      order_id: order.id,
      order_amount: parseFloat((finalPrice / 100).toFixed(2)),
      order_currency: "INR",
      customer_details: {
        customer_id: customerId,
        customer_name: buyerName.slice(0, 50), // max 50 chars
        customer_email: buyerEmail,
        customer_phone: phone10,
      },
      order_meta: {
        return_url: `${origin}/api/cashfree/return?order_id=${order.id}`,
        notify_url: `${process.env.NEXT_PUBLIC_SITE_URL || origin}/api/cashfree/webhook`,
      },
      order_note: `E-Gift: ${product.name.replace(/[^\x00-\x7F]/g, "").trim()}`,
    };

    // ── Call Cashfree with timeout + retry ────────────────────────────────────
    let cfRes: Response;
    try {
      cfRes = await fetchCashfree(
        `${CASHFREE_BASE}/pg/orders`,
        {
          method: "POST",
          headers: {
            "x-client-id": process.env.CASHFREE_APP_ID!,
            "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
            "x-api-version": CF_VERSION,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cfPayload),
        },
        15000, // 15s timeout per attempt
        2      // 2 attempts total
      );
    } catch (fetchErr) {
      console.error("[Cashfree] Network/timeout error:", fetchErr);
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment gateway is temporarily unavailable. Please try again in a few seconds.",
          retryable: true,
        },
        { status: 503 }
      );
    }

    if (!cfRes.ok) {
      const errText = await cfRes.text();
      console.error("[Cashfree] Create order failed:", cfRes.status, errText);
      return NextResponse.json(
        {
          success: false,
          message: "Payment gateway error. Please try again.",
          retryable: true,
        },
        { status: 502 }
      );
    }

    const cfData = await cfRes.json();

    if (!cfData.payment_session_id) {
      console.error("[Cashfree] No payment_session_id in response:", cfData);
      return NextResponse.json(
        { success: false, message: "Invalid response from payment gateway.", retryable: true },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      free: false,
      payment_session_id: cfData.payment_session_id,
      cashfree_order_id: cfData.cf_order_id,
      order_id: order.id,
      cashfree_mode: process.env.CASHFREE_MODE || "sandbox",
    });
  } catch (err: unknown) {
    console.error("[create-order] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error.", retryable: true }, { status: 500 });
  }
}
