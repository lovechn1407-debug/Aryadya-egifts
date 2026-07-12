import { NextResponse } from "next/server";
import { getOrdersByUserIdDB } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = authHeader.split("Bearer ")[1];
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    // In a real app we'd verify the token with firebase-admin.
    // For now, we trust the UID sent from the client (since this is an MVP without Admin SDK).
    // Note: If you want to secure this properly in the future, use firebase-admin's auth().verifyIdToken()
    
    // We need to add getOrdersByUserIdDB to lib/db.ts
    const orders = await getOrdersByUserIdDB(userId);
    
    return NextResponse.json({ success: true, orders: Object.values(orders || {}) });
  } catch (e: unknown) {
    console.error("[user/orders] Error fetching orders:", e);
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 });
  }
}
