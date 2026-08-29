import { NextRequest, NextResponse } from "next/server";
import { getRewardClaimsDB, fulfillRewardClaimDB } from "@/lib/db";

export async function GET() {
  try {
    const claims = await getRewardClaimsDB();
    return NextResponse.json({ success: true, claims });
  } catch (err) {
    console.error("[admin/affiliate/reward-claims GET] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { claimId, voucherCode, voucherPin, hasPin, utr } = body;

    if (!claimId) {
      return NextResponse.json({ success: false, message: "claimId is required." }, { status: 400 });
    }

    const payload: { voucherCode?: string; voucherPin?: string; hasPin?: boolean; utr?: string } = {
      hasPin: Boolean(hasPin),
    };

    if (voucherCode && String(voucherCode).trim() !== "") {
      payload.voucherCode = String(voucherCode).trim();
    }
    if (voucherPin && String(voucherPin).trim() !== "") {
      payload.voucherPin = String(voucherPin).trim();
    }
    if (utr && String(utr).trim() !== "") {
      payload.utr = String(utr).trim();
    }

    await fulfillRewardClaimDB(claimId, payload);

    return NextResponse.json({ success: true, message: "Reward claim fulfilled successfully." });
  } catch (err: any) {
    console.error("[admin/affiliate/reward-claims POST] Error:", err);
    return NextResponse.json({ success: false, message: err?.message || "Internal server error." }, { status: 500 });
  }
}
