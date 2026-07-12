// =============================================
// POST /api/order/create-pending
// Creates a pending Firebase order without payment.
// Used for the Post-Pay checkout flow.
// =============================================
import { NextRequest, NextResponse } from "next/server";
import { getProductDB, createPendingOrderDB } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limiter";
import { CreatePendingOrderSchema, formatZodError } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const rateLimitResponse = await checkRateLimit(req, "public");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const validationResult = CreatePendingOrderSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ message: "Validation error: " + formatZodError(validationResult.error) }, { status: 400 });
    }
    
    const { productId, buyerName, buyerEmail, buyerPhone } = validationResult.data;

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
    console.error("[create-pending] Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
