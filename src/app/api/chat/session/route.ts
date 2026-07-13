import { NextRequest, NextResponse } from "next/server";
import { createChatSessionDB, getChatSessionDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();
    if (!name || !email) {
      return NextResponse.json({ success: false, message: "Name and email are required." }, { status: 400 });
    }
    const chatId = await createChatSessionDB(name.trim(), email.trim());
    return NextResponse.json({ success: true, chatId });
  } catch (err) {
    console.error("[chat/session POST]", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const chatId = new URL(req.url).searchParams.get("chatId");
    if (!chatId) return NextResponse.json({ success: false }, { status: 400 });
    const session = await getChatSessionDB(chatId);
    if (!session) return NextResponse.json({ success: false }, { status: 404 });
    return NextResponse.json({ success: true, session });
  } catch (err) {
    console.error("[chat/session GET]", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
