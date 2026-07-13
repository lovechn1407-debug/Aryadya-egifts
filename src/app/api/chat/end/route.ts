import { NextRequest, NextResponse } from "next/server";
import { endChatSessionDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { chatId } = await req.json();
    if (!chatId) {
      return NextResponse.json({ success: false, message: "chatId is required." }, { status: 400 });
    }
    await endChatSessionDB(chatId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[chat/end POST]", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
