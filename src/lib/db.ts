// =============================================
// FIREBASE DATA LAYER
// =============================================
import { ref, get, set, update, remove } from "firebase/database";
import { database } from "./firebase";
import { PRODUCT_REGISTRY } from "./data";
import type { Product, DisplaySection, Order } from "./data";

// ── PRODUCT OVERRIDES (price / visible / rating stored in Firebase) ──────────
export interface ProductOverride {
  id: string;
  visible?: boolean;
  price?: number;
  rating?: number;
  reviewCount?: number;
}

export async function getProductsDB(): Promise<Product[]> {
  const snap = await get(ref(database, "productOverrides"));
  const overrides: Record<string, ProductOverride> = snap.exists() ? snap.val() : {};
  return PRODUCT_REGISTRY.map(p => ({ ...p, ...(overrides[p.id] || {}) }));
}

export async function getProductDB(id: string): Promise<Product | null> {
  const all = await getProductsDB();
  return all.find(p => p.id === id) ?? null;
}

export async function updateProductOverrideDB(id: string, changes: Partial<ProductOverride>): Promise<void> {
  await update(ref(database, `productOverrides/${id}`), { id, ...changes });
}

// ── SECTIONS ─────────────────────────────────────────────────────────────────
export async function getSectionsDB(): Promise<DisplaySection[]> {
  const snap = await get(ref(database, "sections"));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, DisplaySection>);
}

export async function getVisibleSectionsDB(): Promise<DisplaySection[]> {
  const all = await getSectionsDB();
  return all.filter(s => s.visible).sort((a, b) => a.order - b.order);
}

export async function saveSectionDB(section: DisplaySection): Promise<void> {
  await set(ref(database, `sections/${section.id}`), section);
}

export async function deleteSectionDB(id: string): Promise<void> {
  await remove(ref(database, `sections/${id}`));
}

// ── ORDERS ────────────────────────────────────────────────────────────────────
export async function createOrderDB(data: {
  productId: string;
  productName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amount: number;
}): Promise<Order> {
  const id = `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const order: Order = {
    id, ...data,
    status: "paid",
    customizations: {},
    createdAt: new Date().toISOString(),
  };
  await set(ref(database, `orders/${id}`), order);
  return order;
}

export async function getOrderDB(id: string): Promise<Order | null> {
  const snap = await get(ref(database, `orders/${id}`));
  return snap.exists() ? (snap.val() as Order) : null;
}

export async function getAllOrdersDB(): Promise<Order[]> {
  const snap = await get(ref(database, "orders"));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Order>)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrdersByProductDB(productId: string): Promise<Order[]> {
  const all = await getAllOrdersDB();
  return all.filter(o => o.productId === productId);
}

export async function updateOrderCustomizationsDB(
  orderId: string,
  customizations: Record<string, string>
): Promise<void> {
  await update(ref(database, `orders/${orderId}`), { customizations, status: "editing" });
}

export async function finalizeOrderDB(orderId: string): Promise<void> {
  await update(ref(database, `orders/${orderId}`), {
    status: "finalized",
    finalizedAt: new Date().toISOString(),
  });
}

// ── BUYER LOGIN LOOKUP ────────────────────────────────────────────────────────
export async function getOrdersByBuyerDB(phone: string, email: string): Promise<Order[]> {
  const all = await getAllOrdersDB();
  const ph = phone.trim().replace(/\D/g, "").slice(-10);
  const em = email.toLowerCase().trim();
  return all.filter(o => {
    const op = o.buyerPhone.replace(/\D/g, "").slice(-10);
    return op === ph && o.buyerEmail.toLowerCase().trim() === em;
  });
}
