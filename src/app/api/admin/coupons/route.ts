// POST /api/admin/coupons — save a coupon (used by admin affiliate coupon generator)
import { NextRequest, NextResponse } from "next/server";
import { saveCouponDB } from "@/lib/db";
import type { Coupon } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const coupon: Coupon = {
      id: String(body.id).toUpperCase(),
      active: body.active !== false,
      discountType: body.discountType || "percentage",
      discountAmount: Number(body.discountAmount),
      totalStocks: Number(body.totalStocks) || 100,
      usedCount: Number(body.usedCount) || 0,
      validFrom: body.validFrom || new Date().toISOString(),
      validTo: body.validTo || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      perPersonLimit: Number(body.perPersonLimit) || 1,
      minimumOrderValue: Number(body.minimumOrderValue) || 0,
      description: String(body.description || ""),
      createdAt: body.createdAt || new Date().toISOString(),
      // Affiliate fields
      ...(body.creatorId ? { creatorId: body.creatorId } : {}),
      ...(body.commissionPercentage ? { commissionPercentage: Number(body.commissionPercentage) } : {}),
    };

    if (!coupon.id) {
      return NextResponse.json({ success: false, message: "Coupon code is required." }, { status: 400 });
    }

    await saveCouponDB(coupon);
    return NextResponse.json({ success: true, coupon });
  } catch (err) {
    console.error("[admin/coupons POST] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
