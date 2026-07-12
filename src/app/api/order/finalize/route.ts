import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";
import { finalizeOrderDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  // 1. Check rate limit (authenticated category)
  const rateLimitResponse = await checkRateLimit(req, "authenticated");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Missing order ID." },
        { status: 400 }
      );
    }

    // 2. Perform DB finalization
    await finalizeOrderDB(orderId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[finalize-order] Error:", message);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
