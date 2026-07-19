// GET /api/admin/affiliate/milestones — fetch all milestones
// POST /api/admin/affiliate/milestones — create or update a milestone
import { NextRequest, NextResponse } from "next/server";
import { getMilestonesDB, saveMilestoneDB } from "@/lib/db";
import type { AffiliateMilestone } from "@/lib/db";

export async function GET() {
  try {
    const milestones = await getMilestonesDB();
    return NextResponse.json({ success: true, milestones });
  } catch (err) {
    console.error("[admin/affiliate/milestones GET] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, referrals, bonusPercentage, label, order } = body;
    if (!referrals || !label) {
      return NextResponse.json({ success: false, message: "referrals and label are required." }, { status: 400 });
    }
    const milestone: AffiliateMilestone = {
      id: id || `ms_${Date.now()}`,
      referrals: Number(referrals),
      bonusPercentage: Number(bonusPercentage) || 0,
      label: String(label),
      order: Number(order) || 0,
    };
    await saveMilestoneDB(milestone);
    return NextResponse.json({ success: true, milestone });
  } catch (err) {
    console.error("[admin/affiliate/milestones POST] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
