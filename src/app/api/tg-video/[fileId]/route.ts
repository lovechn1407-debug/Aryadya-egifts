import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = "8832668653:AAER53dyUKzFn6lXK3ex2dtEEgErTTNSjlw";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  
  if (!fileId) {
    return new NextResponse("Missing fileId", { status: 400 });
  }

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
