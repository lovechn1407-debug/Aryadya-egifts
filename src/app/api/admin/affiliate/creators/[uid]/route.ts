// GET /api/admin/affiliate/creators/[uid] — full creator detail for admin
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  syncCreatorStatsDB,
} from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;
    
    // Call unified sync and self-healing stats function
    const { creator, coupons, orders, payouts } = await syncCreatorStatsDB(uid);

    const pendingPayout = payouts.filter(p => p.status === "pending").reduce((s, p) => s + p.amountPaise, 0);

    // Group by month
    const monthlyEarnings: Record<string, number> = {};
    for (const order of orders) {
      if ((order.status === "paid" || order.status === "editing" || order.status === "finalized") && order.commissionAmount) {
        const month = order.createdAt.slice(0, 7);
        monthlyEarnings[month] = (monthlyEarnings[month] || 0) + order.commissionAmount;
      }
    }

    return NextResponse.json({
      success: true,
      creator,
      coupons,
      orders,
      payouts,
      pendingPayoutPaise: pendingPayout,
      monthlyEarnings,
    });
  } catch (err) {
    console.error("[admin/affiliate/creators/[uid] GET] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
