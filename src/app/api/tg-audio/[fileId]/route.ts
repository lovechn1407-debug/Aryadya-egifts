import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = "8832668653:AAER53dyUKzFn6lXK3ex2dtEEgErTTNSjlw";

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const { fileId } = params;
  
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

    // 2. We can either return a 302 Redirect to the Telegram file, OR stream it.
    // A 302 Redirect is infinitely faster and uses 0 bandwidth on Vercel!
    // Since the frontend is just an <audio> tag, a redirect works perfectly and avoids Vercel timeout limits.
    
    return NextResponse.redirect(downloadUrl);
  } catch (error: any) {
    console.error("TG Audio Proxy Error:", error);
    return new NextResponse("Error fetching audio", { status: 500 });
  }
}
