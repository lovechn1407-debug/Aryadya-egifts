import { NextRequest, NextResponse } from "next/server";
import { getSettingsDB } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  // Check rate limits
  const rateLimitResponse = await checkRateLimit(req, "public");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Get current database settings
    const settings = await getSettingsDB();
    const botUrl = settings.whatsappBotUrl;
    const botSecret = settings.whatsappBotSecret;
    const waEnabled = settings.whatsappOtpEnabled;

    if (!waEnabled || !botUrl || !botSecret) {
      return NextResponse.json(
        { error: "WhatsApp login is currently disabled or unconfigured." },
        { status: 503 }
      );
    }

    // Call WhatsApp Bot Microservice
    const response = await fetch(`${botUrl.replace(/\/$/, "")}/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bot-secret": botSecret,
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.error || "Failed to send WhatsApp OTP. Please try again." },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[wa/send-otp] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
