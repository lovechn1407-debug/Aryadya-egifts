// =============================================
// POST /api/creator/register
// Saves creator profile on first Google sign-in.
// =============================================
import { NextRequest, NextResponse } from "next/server";
import { getCreatorDB, saveCreatorDB } from "@/lib/db";
import type { Creator } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, name, email, phone, photoURL, googleId, instagramHandle, youtubeHandle, otherHandle } = body;

    if (!uid || !email) {
      return NextResponse.json({ success: false, message: "uid and email are required." }, { status: 400 });
    }

    const existing = await getCreatorDB(uid);
    if (existing) {
      // Update profile fields but preserve earnings data
      await saveCreatorDB({
        ...existing,
        name: name || existing.name,
        photoURL: photoURL || existing.photoURL,
        phone: phone || existing.phone,
        instagramHandle: instagramHandle || existing.instagramHandle,
        youtubeHandle: youtubeHandle || existing.youtubeHandle,
        otherHandle: otherHandle || existing.otherHandle,
      });
      return NextResponse.json({ success: true, creator: { ...existing, name, photoURL } });
    }

    // First time — create new creator profile
    const creator: Creator = {
      uid,
      name: name || "Creator",
      email,
      phone: phone || "",
      photoURL: photoURL || "",
      googleId: googleId || uid,
      instagramHandle: instagramHandle || "",
      youtubeHandle: youtubeHandle || "",
      otherHandle: otherHandle || "",
      totalReferrals: 0,
      totalEarningsPaise: 0,
      totalPaidPaise: 0,
      registeredAt: new Date().toISOString(),
    };

    await saveCreatorDB(creator);
    return NextResponse.json({ success: true, creator });
  } catch (err) {
    console.error("[creator/register] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
