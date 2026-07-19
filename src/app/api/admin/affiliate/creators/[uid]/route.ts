// GET /api/admin/affiliate/creators/[uid] — full creator detail for admin
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  getCreatorDB,
  getCouponsDB,
  getAllOrdersDB,
  getPayoutsByCreatorDB,
} from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;
    const creator = await getCreatorDB(uid);
    if (!creator) {
      return NextResponse.json({ success: false, message: "Creator not found." }, { status: 404 });
    }

    const allCoupons = await getCouponsDB();
    const myCoupons = allCoupons.filter(c => c.creatorId === uid);
    const myCodes = new Set(myCoupons.map(c => c.id));

    const allOrders = await getAllOrdersDB();
    const myOrders = allOrders.filter(o =>
      o.affiliateCouponCreatorId === uid ||
      (o.couponCode && myCodes.has(o.couponCode))
    );

    const payouts = await getPayoutsByCreatorDB(uid);
    const pendingPayout = payouts.filter(p => p.status === "pending").reduce((s, p) => s + p.amountPaise, 0);

    // Group by month
    const monthlyEarnings: Record<string, number> = {};
    for (const order of myOrders) {
      if ((order.status === "paid" || order.status === "editing" || order.status === "finalized") && order.commissionAmount) {
        const month = order.createdAt.slice(0, 7);
        monthlyEarnings[month] = (monthlyEarnings[month] || 0) + order.commissionAmount;
      }
    }

    return NextResponse.json({
      success: true,
      creator,
      coupons: myCoupons,
      orders: myOrders,
      payouts,
      pendingPayoutPaise: pendingPayout,
      monthlyEarnings,
    });
  } catch (err) {
    console.error("[admin/affiliate/creators/[uid] GET] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
