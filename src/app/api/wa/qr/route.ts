import { NextRequest, NextResponse } from "next/server";
import { getSettingsDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const settings = await getSettingsDB();
    const botUrl = settings.whatsappBotUrl;
    const botSecret = settings.whatsappBotSecret;

    if (!botUrl || !botSecret) {
      return NextResponse.json({ error: "WhatsApp Bot is not configured yet." }, { status: 400 });
    }

    const response = await fetch(`${botUrl.replace(/\/$/, "")}/qr`, {
      headers: {
        "x-bot-secret": botSecret,
      },
      next: { revalidate: 0 } // disable fetch cache
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to get QR code. Bot might be offline." }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[wa/qr] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
