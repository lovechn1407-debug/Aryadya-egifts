// =============================================
// GET /api/creator/me?uid=xxx
// Returns the full creator profile, their coupons, referred orders, payouts,
// milestones, and rewards for the creator dashboard.
// =============================================
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  getMilestonesDB,
  getRewardsDB,
  syncCreatorStatsDB,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ success: false, message: "uid is required." }, { status: 400 });
    }

    // Call unified sync and self-healing stats function
    const { creator, coupons, orders, payouts } = await syncCreatorStatsDB(uid);

    // Get milestones and rewards
    const milestones = await getMilestonesDB();
    const rewards = await getRewardsDB();

    // Compute monthly earnings from orders
    const monthlyEarnings: Record<string, number> = {};
    for (const order of orders) {
      if ((order.status === "paid" || order.status === "editing" || order.status === "finalized") && order.commissionAmount) {
        const month = order.createdAt.slice(0, 7); // "2026-07"
        monthlyEarnings[month] = (monthlyEarnings[month] || 0) + order.commissionAmount;
      }
    }

    // Compute unpaid balance
    const pendingPayoutTotal = payouts
      .filter(p => p.status === "pending")
      .reduce((s, p) => s + p.amountPaise, 0);

    return NextResponse.json({
      success: true,
      creator,
      coupons,
      orders: orders.map(o => ({
        id: o.id,
        productName: o.productName,
        buyerName: o.buyerName,
        amount: o.amount,
        commissionAmount: o.commissionAmount || 0,
        couponCode: o.couponCode,
        status: o.status,
        createdAt: o.createdAt,
      })),
      payouts,
      milestones,
      rewards,
      monthlyEarnings,
      pendingPayoutPaise: pendingPayoutTotal,
    });
  } catch (err) {
    console.error("[creator/me] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
