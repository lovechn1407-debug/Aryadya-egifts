// DELETE /api/admin/affiliate/rewards/[id]
import { NextRequest, NextResponse } from "next/server";
import { deleteRewardDB } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteRewardDB(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/affiliate/rewards/[id] DELETE] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
