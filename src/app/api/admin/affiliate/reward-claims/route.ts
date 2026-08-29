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

    await fulfillRewardClaimDB(claimId, {
      voucherCode: voucherCode ? String(voucherCode).trim() : undefined,
      voucherPin: voucherPin ? String(voucherPin).trim() : undefined,
      hasPin: Boolean(hasPin),
      utr: utr ? String(utr).trim() : undefined,
    });

    return NextResponse.json({ success: true, message: "Reward claim fulfilled successfully." });
  } catch (err) {
    console.error("[admin/affiliate/reward-claims POST] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
