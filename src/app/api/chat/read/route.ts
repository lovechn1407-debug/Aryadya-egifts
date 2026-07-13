import { NextRequest, NextResponse } from "next/server";
import { markChatReadDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { chatId, by } = await req.json();
    if (!chatId || !by) {
      return NextResponse.json({ success: false, message: "chatId and by are required." }, { status: 400 });
    }
    await markChatReadDB(chatId, by);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[chat/read POST]", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
