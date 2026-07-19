// POST /api/admin/affiliate/payouts — create a payout record
import { NextRequest, NextResponse } from "next/server";
import { createPayoutDB, getCreatorDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creatorId, amountPaise, method, reference, note } = body;

    if (!creatorId || !amountPaise) {
      return NextResponse.json({ success: false, message: "creatorId and amountPaise are required." }, { status: 400 });
    }

    const creator = await getCreatorDB(creatorId);
    if (!creator) {
      return NextResponse.json({ success: false, message: "Creator not found." }, { status: 404 });
    }

    const payout = await createPayoutDB({
      creatorId,
      creatorName: creator.name,
      amountPaise: Number(amountPaise),
      status: "pending",
      method: method || "",
      reference: reference || "",
      note: note || "",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, payout });
  } catch (err) {
    console.error("[admin/affiliate/payouts POST] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
