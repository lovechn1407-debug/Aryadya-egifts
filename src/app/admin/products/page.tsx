"use client";
import { useEffect, useState } from "react";
import { getProductsDB, updateProductOverrideDB, getOrdersByProductDB } from "@/lib/db";
import type { Product } from "@/lib/data";
import { PRODUCT_REGISTRY } from "@/lib/data";
import Link from "next/link";

const CATEGORY_LABELS: Record<string, string> = {
  birthday: "🎂 Birthday",
  proposal: "💍 Proposal",
  anniversary: "💑 Anniversary",
  friendship: "🤝 Friendship",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [cuttedPriceInput, setCuttedPriceInput] = useState("");
  const [editingRating, setEditingRating] = useState<string | null>(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewInput, setReviewInput] = useState("");
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockInput, setStockInput] = useState("");
  const [showStockInput, setShowStockInput] = useState(false);
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  const [revenueCounts, setRevenueCounts] = useState<Record<string, number>>({});

  const reload = async () => {
    const ps = await getProductsDB();
    setProducts(ps);
    const counts: Record<string, number> = {};
    const revs: Record<string, number> = {};
    await Promise.all(ps.map(async p => {
      const orders = await getOrdersByProductDB(p.id);
      counts[p.id] = orders.length;
      revs[p.id] = orders.filter(o => o.status !== "pending").reduce((s, o) => s + o.amount, 0);
    }));
    setOrderCounts(counts);
    setRevenueCounts(revs);
  };

  useEffect(() => { reload(); }, []);

  const toggleVisibility = async (id: string, current: boolean) => {
    await updateProductOverrideDB(id, { visible: !current });
    reload();
  };

  const saveName = async (id: string) => {
    if (nameInput.trim()) {
      await updateProductOverrideDB(id, { name: nameInput.trim() });
    }
    setEditingName(null);
    reload();
  };

  const savePrice = async (id: string) => {
    const n = parseInt(priceInput, 10);
    const cn = parseInt(cuttedPriceInput, 10);
    
    const updates: Partial<Product> = {};
    if (!isNaN(n) && n > 0) updates.price = n * 100;
    if (!isNaN(cn) && cn > 0) updates.cuttedPrice = cn * 100;
    else if (cuttedPriceInput === "") updates.cuttedPrice = undefined; // allow clearing
    
    if (Object.keys(updates).length > 0) {
      await updateProductOverrideDB(id, updates);
    }
    setEditingPrice(null);
    reload();
  };

  const updateBadge = async (id: string, badge: any) => {
    await updateProductOverrideDB(id, { badge });
    reload();
  };

  const saveRating = async (id: string) => {
    const rc = parseInt(reviewInput, 10);
    const updates: Record<string, any> = {
      rating: ratingInput
    };
    if (!isNaN(rc)) updates.reviewCount = rc;
    await updateProductOverrideDB(id, updates);
    setEditingRating(null);
    reload();
  };

  const saveStock = async (id: string) => {
    const s = parseInt(stockInput, 10);
    const updates: Record<string, any> = {
      showStock: showStockInput
    };
    if (!isNaN(s)) updates.stockLeft = s;
    await updateProductOverrideDB(id, updates);
    setEditingStock(null);
    reload();
  };

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF", borderRadius: 12, border: "1px solid #E2E8F0",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
  };

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px", borderRadius: 6, border: "1px solid #CBD5E1", 
    fontSize: 13, color: "#0F172A", background: "#FFFFFF", outline: "none",
    transition: "border-color 0.2s"
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: -0.5 }}>
            Products Manager
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
            {PRODUCT_REGISTRY.length} products in registry · Control visibility and pricing
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 24, padding: 16, background: "#EFF6FF", borderRadius: 12, border: "1px solid #BFDBFE", display: "flex", gap: 12 }}>
        <span style={{ fontSize: 18 }}>ℹ️</span>
        <p style={{ fontSize: 13, color: "#1D4ED8", lineHeight: 1.6, margin: 0 }}>
          <strong>How products work:</strong> Products are code-defined in <code style={{ background: "#DBEAFE", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>src/lib/data.ts</code>.
          To add a new template, modify the code and it will automatically appear here. Use this panel to control visibility, pricing, and view orders.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {products.map(product => (
          <div key={product.id} style={{ ...cardStyle, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderBottom: "1px solid #F1F5F9", background: "#F8FAFC" }}>
              <div style={{
                width: 64, height: 64, borderRadius: 12, fontSize: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}>
                {product.thumbnail}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
                  {editingName === product.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input style={{...inputStyle, minWidth: 200}} type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} autoFocus />
                      <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#0F172A", color: "#FFFFFF", border: "none", cursor: "pointer" }} onClick={() => saveName(product.id)}>Save</button>
                      <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#F1F5F9", color: "#334155", border: "none", cursor: "pointer" }} onClick={() => setEditingName(null)}>✕</button>
                    </div>
                  ) : (
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      {product.name}
                      <button onClick={() => { setEditingName(product.id); setNameInput(product.name); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#94A3B8" }}>✏️</button>
                    </h2>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: "#E0E7FF", color: "#4338CA", border: "1px solid #C7D2FE" }}>
                    {CATEGORY_LABELS[product.category]}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: product.visible ? "#ECFDF5" : "#F1F5F9", color: product.visible ? "#059669" : "#64748B", border: `1px solid ${product.visible ? "#A7F3D0" : "#E2E8F0"}` }}>
                    {product.visible ? "🟢 Visible" : "⚫ Hidden"}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>{product.tagline}</p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", padding: "20px 24px", gap: 24, borderBottom: "1px solid #E2E8F0" }}>
              <div>
                <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500, marginBottom: 4 }}>Total Orders</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: "#0F172A" }}>{orderCounts[product.id] || 0}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500, marginBottom: 4 }}>Revenue</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: "#10B981" }}>₹{Math.floor((revenueCounts[product.id] || 0) / 100)}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500, marginBottom: 4 }}>Rating</p>
                {editingRating === product.id ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input style={{...inputStyle, width: 60, padding: "6px"}} type="number" placeholder="Reviews" value={reviewInput} onChange={e => setReviewInput(e.target.value)} />
                    <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#0F172A", color: "#FFFFFF", border: "none", cursor: "pointer" }} onClick={() => saveRating(product.id)}>Save</button>
                    <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#F1F5F9", color: "#334155", border: "none", cursor: "pointer" }} onClick={() => setEditingRating(null)}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#F59E0B", fontSize: 18 }}>{'★'.repeat(Math.round((product as any).rating || 5))}</span>
                    <span style={{ fontSize: 14, color: "#334155", fontWeight: 600 }}>{((product as any).rating || 5).toFixed(1)}</span>
                    <button onClick={() => { setEditingRating(product.id); setRatingInput((product as any).rating || 5); setReviewInput(String((product as any).reviewCount || "")); }}
                      style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 14 }}>✏️</button>
                  </div>
                )}
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500, marginBottom: 4 }}>Inventory & Stock Tag</p>
                {editingStock === product.id ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                      style={{...inputStyle, width: 80, padding: "6px"}}
                      type="number" placeholder="Left" value={stockInput} onChange={e => setStockInput(e.target.value)} autoFocus
                    />
                    <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                      <input type="checkbox" checked={showStockInput} onChange={e => setShowStockInput(e.target.checked)} />
                      Show "Left" Tag
                    </label>
                    <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#0F172A", color: "#FFFFFF", border: "none", cursor: "pointer", marginLeft: 8 }} onClick={() => saveStock(product.id)}>Save</button>
                    <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#F1F5F9", color: "#334155", border: "none", cursor: "pointer" }} onClick={() => setEditingStock(null)}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                      {(product as any).stockLeft || 0} left
                    </p>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: (product as any).showStock ? "#ECFDF5" : "#F1F5F9", color: (product as any).showStock ? "#059669" : "#64748B" }}>
                      {(product as any).showStock ? "Tag Visible" : "Tag Hidden"}
                    </span>
                    <button onClick={() => { setEditingStock(product.id); setStockInput(String((product as any).stockLeft || "")); setShowStockInput(!!(product as any).showStock); }} style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 14 }}>✏️</button>
                  </div>
                )}
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500, marginBottom: 4 }}>Pricing</p>
                {editingPrice === product.id ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                      style={{...inputStyle, width: 100, padding: "6px"}}
                      type="number" placeholder="Real (₹)" value={priceInput} onChange={e => setPriceInput(e.target.value)} autoFocus
                    />
                    <input
                      style={{...inputStyle, width: 110, padding: "6px", color: "#94A3B8", textDecoration: "line-through"}}
                      type="number" placeholder="Cutted (₹)" value={cuttedPriceInput} onChange={e => setCuttedPriceInput(e.target.value)}
                    />
                    <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#0F172A", color: "#FFFFFF", border: "none", cursor: "pointer" }} onClick={() => savePrice(product.id)}>Save</button>
                    <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#F1F5F9", color: "#334155", border: "none", cursor: "pointer" }} onClick={() => setEditingPrice(null)}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", margin: 0 }}>₹{Math.floor(product.price / 100)}</p>
                    {product.cuttedPrice && (
                      <p style={{ fontSize: 15, fontWeight: 500, color: "#94A3B8", textDecoration: "line-through", margin: 0 }}>
                        ₹{Math.floor(product.cuttedPrice / 100)}
                      </p>
                    )}
                    <button
                      onClick={() => { 
                        setEditingPrice(product.id); 
                        setPriceInput(String(Math.floor(product.price / 100))); 
                        setCuttedPriceInput(product.cuttedPrice ? String(Math.floor(product.cuttedPrice / 100)) : "");
                      }}
                      style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 14 }}
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 16, padding: "16px 24px", flexWrap: "wrap", alignItems: "center", background: "#FFFFFF" }}>
              {/* Badge Selection */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>Badge:</span>
                <select 
                  style={{...inputStyle, padding: "6px 10px", cursor: "pointer"}}
                  value={product.badge || ""} 
                  onChange={(e) => updateBadge(product.id, e.target.value)}
                >
                  <option value="">None</option>
                  <option value="hot">🔥 HOT</option>
                  <option value="new">✨ NEW</option>
                  <option value="specials">🎁 SPECIAL</option>
                  <option value="premium">💎 PREMIUM</option>
                </select>
              </div>

              {/* Visibility toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label className="toggle">
                  <input type="checkbox" checked={product.visible} onChange={() => toggleVisibility(product.id, product.visible)} />
                  <span className="toggle-slider" style={{ background: product.visible ? "#10B981" : "#CBD5E1" }} />
                </label>
                <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>
                  {product.visible ? "Visible to public" : "Hidden"}
                </span>
              </div>

              <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
                <Link
                  href={`/preview/${product.id}`}
                  target="_blank"
                  style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, color: "#334155", textDecoration: "none" }}
                >
                  Preview 👀
                </Link>
                <Link
                  href={`/admin/orders?product=${product.id}`}
                  style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, color: "#1D4ED8", textDecoration: "none" }}
                >
                  View Orders 📦
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
