import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";
import { finalizeOrderDB } from "@/lib/db";
import { OrderIdSchema, formatZodError } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  // 1. Check rate limit (authenticated category)
  const rateLimitResponse = await checkRateLimit(req, "authenticated");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const validationResult = OrderIdSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ message: "Validation error: " + formatZodError(validationResult.error) }, { status: 400 });
    }
    
    const { orderId } = validationResult.data;

    // 2. Perform DB finalization
    await finalizeOrderDB(orderId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[finalize-order] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
