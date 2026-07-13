import { NextRequest, NextResponse } from "next/server";
import { sendChatMessageDB, getChatSessionDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { chatId, sender, text, replyTo } = await req.json();
    if (!chatId || !sender || !text?.trim()) {
      return NextResponse.json({ success: false, message: "chatId, sender, and text are required." }, { status: 400 });
    }

    const session = await getChatSessionDB(chatId);
    if (!session) {
      return NextResponse.json({ success: false, message: "Chat session not found." }, { status: 404 });
    }
    if (session.status === "closed") {
      return NextResponse.json({ success: false, message: "Chat session is closed." }, { status: 403 });
    }

    await sendChatMessageDB(chatId, sender, text.trim(), replyTo);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[chat/message POST]", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
