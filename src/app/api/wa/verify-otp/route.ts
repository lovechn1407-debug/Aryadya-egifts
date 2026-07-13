import { NextRequest, NextResponse } from "next/server";
import { getSettingsDB } from "@/lib/db";
import { adminAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone number and OTP are required" }, { status: 400 });
    }

    // Get settings
    const settings = await getSettingsDB();
    const botUrl = settings.whatsappBotUrl;
    const botSecret = settings.whatsappBotSecret;
    const waEnabled = settings.whatsappOtpEnabled;

    if (!waEnabled || !botUrl || !botSecret) {
      return NextResponse.json(
        { error: "WhatsApp verification is disabled or unconfigured." },
        { status: 503 }
      );
    }

    // Call WhatsApp Bot to verify OTP
    const response = await fetch(`${botUrl.replace(/\/$/, "")}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bot-secret": botSecret,
      },
      body: JSON.stringify({ phone, otp }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.error || "Invalid OTP code" },
        { status: response.status }
      );
    }

    // OTP verified successfully. Now create a Firebase custom token.
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }

    const uid = `phone_${cleanPhone}`;

    // Mint custom token using Firebase Admin SDK
    const customToken = await adminAuth.createCustomToken(uid, {
      phoneNumber: `+${cleanPhone}`
    });

    return NextResponse.json({ success: true, customToken });
  } catch (error: any) {
    console.error("[wa/verify-otp] Error:", error);
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}
