import { NextRequest, NextResponse } from "next/server";
import { verifyUPI } from "bhimupijs";

export async function POST(req: NextRequest) {
  try {
    const { upiId } = await req.json();

    if (!upiId) {
      return NextResponse.json({ success: false, message: "Missing upiId parameter" }, { status: 400 });
    }

    const response = await verifyUPI(upiId);

    if (response.result && response.isVpaVerified) {
      return NextResponse.json({
        success: true,
        payeeAccountName: response.payeeAccountName,
        message: "UPI Verified Successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        isQueryPatternValid: response.isQueryPatternValid,
        message: response.message || "Invalid UPI ID"
      });
    }

  } catch (error: any) {
    console.error("UPI Verification Error:", error.message || error);
    return NextResponse.json({ success: false, message: "Verification failed. Please enter details manually." }, { status: 500 });
  }
}
