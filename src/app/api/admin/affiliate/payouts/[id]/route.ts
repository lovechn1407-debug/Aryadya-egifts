// PATCH /api/admin/affiliate/payouts/[id] — mark a payout as paid
import { NextRequest, NextResponse } from "next/server";
import { markPayoutPaidDB } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { reference } = body;
    await markPayoutPaidDB(id, reference);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/affiliate/payouts/[id] PATCH] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
