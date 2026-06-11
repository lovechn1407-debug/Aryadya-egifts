// =============================================
// POST /api/order/create-pending
// Creates a pending Firebase order without payment.
// Used for the Post-Pay checkout flow.
// =============================================
import { NextRequest, NextResponse } from "next/server";
import { getProductDB, createPendingOrderDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, buyerName, buyerEmail, buyerPhone } = body;

    // Validate required fields
    if (!productId || !buyerName || !buyerEmail || !buyerPhone) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // Fetch product
    const product = await getProductDB(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    // Create a PENDING order in Firebase (with 0 discount initially)
    const order = await createPendingOrderDB({
      productId: product.id,
      productName: product.name,
      buyerName,
      buyerEmail,
      buyerPhone,
      amount: product.price, // Initial full price
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[create-pending] Error:", message);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
