import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";
import { FileIdSchema, formatZodError } from "@/lib/schemas";

const BOT_TOKEN = "8832668653:AAER53dyUKzFn6lXK3ex2dtEEgErTTNSjlw";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const rateLimitResponse = await checkRateLimit(req, "public");
  if (rateLimitResponse) return rateLimitResponse;
  
  const rawParams = await params;
  const validationResult = FileIdSchema.safeParse(rawParams);
  
  if (!validationResult.success) {
    return new NextResponse("Validation error: " + formatZodError(validationResult.error), { status: 400 });
  }
  
  const { fileId } = validationResult.data;

  try {
    // 1. Get the file path from Telegram
    const getFileUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;
    const fileResp = await fetch(getFileUrl);
    const fileData = await fileResp.json();

    if (!fileData.ok) {
      return new NextResponse("Failed to get file from Telegram", { status: 404 });
    }

    const filePath = fileData.result.file_path;
    const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    // 2. 302 Redirect to the Telegram file download URL
    return NextResponse.redirect(downloadUrl);
  } catch (error: any) {
    console.error("TG Video Proxy Error:", error);
    return new NextResponse("Error fetching video", { status: 500 });
  }
}
