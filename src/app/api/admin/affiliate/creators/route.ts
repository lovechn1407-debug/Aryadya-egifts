// GET /api/admin/affiliate/creators — fetch all creators with summary stats
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAllCreatorsDB, getCouponsDB, getAllOrdersDB } from "@/lib/db";

export async function GET() {
  try {
    const creators = await getAllCreatorsDB();
    const allCoupons = await getCouponsDB();
    const allOrders = await getAllOrdersDB();

    // Enrich each creator with coupon count and effective commission
    const enriched = creators.map(creator => {
      const myCoupons = allCoupons.filter(c => c.creatorId === creator.uid);
      const myCodes = new Set(myCoupons.map(c => c.id));
      const myOrders = allOrders.filter(o =>
        o.affiliateCouponCreatorId === creator.uid ||
        (o.couponCode && myCodes.has(o.couponCode))
      );
      const paidOrders = myOrders.filter(o =>
        o.status === "paid" || o.status === "editing" || o.status === "finalized"
      );
      // Get the latest/primary commission percentage from their coupons
      const latestCoupon = myCoupons.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      return {
        uid: creator.uid,
        name: creator.name,
        email: creator.email,
        photoURL: creator.photoURL,
        totalReferrals: creator.totalReferrals,
        totalEarningsPaise: creator.totalEarningsPaise,
        totalPaidPaise: creator.totalPaidPaise,
        pendingPaise: Math.max(0, creator.totalEarningsPaise - creator.totalPaidPaise),
        couponCount: myCoupons.length,
        paidOrderCount: paidOrders.length,
        currentCommissionPercentage: latestCoupon?.commissionPercentage || 0,
        registeredAt: creator.registeredAt,
      };
    });

    return NextResponse.json({ success: true, creators: enriched });
  } catch (err) {
    console.error("[admin/affiliate/creators GET] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
