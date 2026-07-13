import { NextRequest, NextResponse } from "next/server";
import { getSettingsDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const settings = await getSettingsDB();
    const botUrl = settings.whatsappBotUrl;
    const botSecret = settings.whatsappBotSecret;

    if (!botUrl || !botSecret) {
      return NextResponse.json({ status: "unconfigured" });
    }

    const response = await fetch(`${botUrl.replace(/\/$/, "")}/status`, {
      headers: {
        "x-bot-secret": botSecret,
      },
      next: { revalidate: 0 } // disable fetch cache
    });

    if (!response.ok) {
      return NextResponse.json({ status: "offline" });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[wa/status] Error:", error);
    return NextResponse.json({ status: "offline" });
  }
}
