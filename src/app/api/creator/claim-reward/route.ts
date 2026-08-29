import { NextRequest, NextResponse } from "next/server";
import { getCreatorDB, getRewardsDB, getRewardClaimsByCreatorDB, saveRewardClaimDB } from "@/lib/db";
import type { RewardClaim } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rewardId, creatorId } = body;

    if (!rewardId || !creatorId) {
      return NextResponse.json({ success: false, message: "rewardId and creatorId are required." }, { status: 400 });
    }

    const creator = await getCreatorDB(creatorId);
    if (!creator) {
      return NextResponse.json({ success: false, message: "Creator profile not found." }, { status: 404 });
    }

    const rewards = await getRewardsDB();
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) {
      return NextResponse.json({ success: false, message: "Reward mission not found." }, { status: 404 });
    }

    if ((creator.totalReferrals || 0) < reward.referrals) {
      return NextResponse.json({
        success: false,
        message: `You need ${reward.referrals} referred sales to unlock this reward. (Current: ${creator.totalReferrals || 0})`
      }, { status: 400 });
    }

    // Check existing claims for this reward
    const existingClaims = await getRewardClaimsByCreatorDB(creatorId);
    const existing = existingClaims.find(c => c.rewardId === rewardId);
    if (existing) {
      return NextResponse.json({
        success: true,
        claim: existing,
        message: existing.status === "fulfilled"
          ? "Reward has already been fulfilled."
          : "Reward claim is currently being processed."
      });
    }

    const claimId = `claim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const claim: RewardClaim = {
      id: claimId,
      rewardId: reward.id,
      creatorId: creator.uid,
      creatorName: creator.name,
      creatorEmail: creator.email,
      rewardLabel: reward.label,
      rewardType: reward.rewardType || "other",
      rewardAmountPaise: reward.rewardAmountPaise,
      status: "pending",
      claimedAt: new Date().toISOString(),
    };

    await saveRewardClaimDB(claim);
    return NextResponse.json({ success: true, claim, message: "Reward claim submitted! It will be credited within 24 hours." });
  } catch (err) {
    console.error("[creator/claim-reward POST] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
