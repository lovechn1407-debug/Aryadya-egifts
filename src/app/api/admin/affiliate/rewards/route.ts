// GET /api/admin/affiliate/rewards — fetch all rewards
// POST /api/admin/affiliate/rewards — create or update a reward
import { NextRequest, NextResponse } from "next/server";
import { getRewardsDB, saveRewardDB } from "@/lib/db";
import type { AffiliateReward } from "@/lib/db";

export async function GET() {
  try {
    const rewards = await getRewardsDB();
    return NextResponse.json({ success: true, rewards });
  } catch (err) {
    console.error("[admin/affiliate/rewards GET] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, referrals, rewardAmountPaise, label, description, order } = body;
    if (!referrals || !label) {
      return NextResponse.json({ success: false, message: "referrals and label are required." }, { status: 400 });
    }
    const reward: AffiliateReward = {
      id: id || `rw_${Date.now()}`,
      referrals: Number(referrals),
      rewardAmountPaise: Number(rewardAmountPaise) || 0,
      label: String(label),
      description: String(description || ""),
      order: Number(order) || 0,
    };
    await saveRewardDB(reward);
    return NextResponse.json({ success: true, reward });
  } catch (err) {
    console.error("[admin/affiliate/rewards POST] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
