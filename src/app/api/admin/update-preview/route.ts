import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";
import { updateProductOverrideDB } from "@/lib/db";
import { UpdatePreviewSchema, formatZodError } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  // 1. Check rate limit (authenticated category)
  const rateLimitResponse = await checkRateLimit(req, "authenticated");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const validationResult = UpdatePreviewSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ message: "Validation error: " + formatZodError(validationResult.error) }, { status: 400 });
    }
    
    const { targetId, customizations } = validationResult.data;

    // 2. Perform DB update
    await updateProductOverrideDB(targetId, { previewData: customizations as Record<string, string> });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[update-preview] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
