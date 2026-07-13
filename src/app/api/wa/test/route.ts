import { NextRequest, NextResponse } from "next/server";
import { getSettingsDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const settings = await getSettingsDB();
    return NextResponse.json({ ok: true, botUrl: settings.whatsappBotUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
