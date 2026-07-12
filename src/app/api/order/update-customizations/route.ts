import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";
import { updateOrderCustomizationsDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  // 1. Check rate limit (authenticated category)
  const rateLimitResponse = await checkRateLimit(req, "authenticated");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { orderId, customizations } = await req.json();

    if (!orderId || !customizations) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // 2. Perform DB update
    await updateOrderCustomizationsDB(orderId, customizations);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[update-customizations] Error:", message);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
