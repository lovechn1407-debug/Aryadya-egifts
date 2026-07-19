// =============================================
// POST /api/admin/affiliate/payouts/cashfree
// Initiates an instant UPI transfer payout to a creator via Cashfree Payouts API.
// =============================================
import { NextRequest, NextResponse } from "next/server";
import { getCreatorDB, markPayoutPaidDB, getPayoutsByCreatorDB } from "@/lib/db";

const CASHFREE_PAYOUT_BASE =
  process.env.CASHFREE_PAYOUT_STAGE === "PRODUCTION" || process.env.CASHFREE_MODE === "production"
    ? "https://payout-api.cashfree.com"
    : "https://payout-api-gamma.cashfree.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payoutId, creatorId } = body;

    if (!payoutId || !creatorId) {
      return NextResponse.json(
        { success: false, message: "payoutId and creatorId are required." },
        { status: 400 }
      );
    }

    // 1. Fetch Creator details
    const creator = await getCreatorDB(creatorId);
    if (!creator) {
      return NextResponse.json({ success: false, message: "Creator not found." }, { status: 404 });
    }

    if (!creator.upiId) {
      return NextResponse.json(
        { success: false, message: "Creator has not configured their UPI ID in Settings." },
        { status: 400 }
      );
    }

    // 2. Fetch Payout details
    const payouts = await getPayoutsByCreatorDB(creatorId);
    const payout = payouts.find((p) => p.id === payoutId);
    if (!payout) {
      return NextResponse.json({ success: false, message: "Payout record not found." }, { status: 404 });
    }

    if (payout.status === "paid") {
      return NextResponse.json({ success: false, message: "Payout is already marked as paid." }, { status: 400 });
    }

    const clientId = process.env.CASHFREE_PAYOUT_CLIENT_ID || process.env.CASHFREE_APP_ID;
    const clientSecret = process.env.CASHFREE_PAYOUT_CLIENT_SECRET || process.env.CASHFREE_SECRET_KEY;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cashfree Payout credentials (CASHFREE_PAYOUT_CLIENT_ID and CASHFREE_PAYOUT_CLIENT_SECRET) are not configured in .env.local.",
        },
        { status: 400 }
      );
    }

    // Amount in Rupees (payout.amountPaise is in paise)
    const amountRs = (payout.amountPaise / 100).toFixed(2);
    const transferId = `TR_${payoutId}_${Date.now()}`;

    // 3. Request Cashfree Payout API
    const response = await fetch(`${CASHFREE_PAYOUT_BASE}/payout/v1.1/transfers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": clientId,
        "X-Client-Secret": clientSecret,
      },
      body: JSON.stringify({
        transferId: transferId,
        transferAmount: parseFloat(amountRs),
        transferMode: "upi",
        vpa: creator.upiId,
        name: creator.upiName || creator.name,
        remarks: `Creator Payout ${payoutId}`,
      }),
    });

    const resJson = await response.json().catch(() => null);

    if (response.ok && (resJson?.status === "SUCCESS" || resJson?.subCode === "200")) {
      const referenceId = resJson?.data?.referenceId || resJson?.utr || transferId;
      await markPayoutPaidDB(payoutId, referenceId);
      return NextResponse.json({
        success: true,
        message: "Payout successfully processed via Cashfree!",
        referenceId,
      });
    } else {
      // If Cashfree returns an error or status pending
      const errorMsg = resJson?.message || resJson?.subCodeMessage || "Cashfree transfer failed.";
      console.error("[Cashfree Payout Error]:", resJson);
      return NextResponse.json(
        { success: false, message: `Cashfree Payout Failed: ${errorMsg}`, details: resJson },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("[Cashfree Payout Route Error]:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error during Cashfree payout." },
      { status: 500 }
    );
  }
}
