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
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [cuttedPriceInput, setCuttedPriceInput] = useState("");
  const [editingRating, setEditingRating] = useState<string | null>(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewInput, setReviewInput] = useState("");
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
    await updateProductOverrideDB(id, { rating: ratingInput, reviewCount: parseInt(reviewInput) || undefined });
    setEditingRating(null);
    reload();
  };

  return (
    <div style={{ padding: "32px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Nunito',sans-serif" }}>
            <span className="gradient-text">Products</span> Manager
          </h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>
            {PRODUCT_REGISTRY.length} products in registry · Control visibility and pricing
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 20, padding: 16, background: "#F5F3FF", borderRadius: 14, border: "1px solid #EDE9FE" }}>
        <p style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.7 }}>
          <strong style={{ color: "#7C3AED" }}>ℹ️ How products work:</strong> Products are code-defined in <code style={{ color: "#EC4899", fontSize: 12 }}>src/lib/data.ts</code>.
          To add a new template, modify the code and it will automatically appear here. Use this panel to control visibility, pricing, and view orders.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {products.map(product => (
          <div key={product.id} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderBottom: "1px solid #E5E7EB" }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16, fontSize: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg,rgba(255,45,120,0.1),rgba(155,89,252,0.1))"
              }}>
                {product.thumbnail}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1F2937" }}>{product.name}</h2>
                  <span className="badge badge-purple">{CATEGORY_LABELS[product.category]}</span>
                  <span className={`badge ${product.visible ? "badge-green" : "badge-gray"}`}>
                    {product.visible ? "🟢 Visible" : "⚫ Hidden"}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{product.tagline}</p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", padding: "16px 24px", gap: 16, borderBottom: "1px solid #E5E7EB" }}>
              <div>
                <p style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8 }}>Total Orders</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: "#7C3AED", marginTop: 2 }}>{orderCounts[product.id] || 0}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8 }}>Revenue</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: "#F59E0B", marginTop: 2 }}>₹{Math.floor((revenueCounts[product.id] || 0) / 100)}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8 }}>Rating</p>
                {editingRating === product.id ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => setRatingInput(s)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: s <= ratingInput ? "#F59E0B" : "#E5E7EB" }}>★</button>
                      ))}
                    </div>
                    <input className="input-field" type="number" placeholder="Reviews" value={reviewInput} onChange={e => setReviewInput(e.target.value)} style={{ padding: "4px 8px", fontSize: 12, width: 80 }} />
                    <button className="btn-primary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => saveRating(product.id)}>Save</button>
                    <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => setEditingRating(null)}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span style={{ color: "#F59E0B", fontSize: 18 }}>{'★'.repeat(Math.round((product as any).rating || 5))}</span>
                    <span style={{ fontSize: 14, color: "#6B7280" }}>{((product as any).rating || 5).toFixed(1)}</span>
                    <button onClick={() => { setEditingRating(product.id); setRatingInput((product as any).rating || 5); setReviewInput(String((product as any).reviewCount || "")); }}
                      style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 13 }}>✏️</button>
                  </div>
                )}
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <p style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8 }}>Pricing</p>
                {editingPrice === product.id ? (
                  <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                    <input
                      className="input-field"
                      type="number"
                      placeholder="Real Price (₹)"
                      value={priceInput}
                      onChange={e => setPriceInput(e.target.value)}
                      style={{ padding: "6px 10px", fontSize: 14, width: 100 }}
                      autoFocus
                    />
                    <input
                      className="input-field"
                      type="number"
                      placeholder="Cutted Price (₹)"
                      value={cuttedPriceInput}
                      onChange={e => setCuttedPriceInput(e.target.value)}
                      style={{ padding: "6px 10px", fontSize: 14, width: 110, color: "#9CA3AF", textDecoration: "line-through" }}
                    />
                    <button className="btn-primary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => savePrice(product.id)}>Save</button>
                    <button className="btn-secondary" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => setEditingPrice(null)}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <p style={{ fontSize: 24, fontWeight: 800, color: "#EC4899" }}>₹{Math.floor(product.price / 100)}</p>
                    {product.cuttedPrice && (
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#9CA3AF", textDecoration: "line-through" }}>
                        ₹{Math.floor(product.cuttedPrice / 100)}
                      </p>
                    )}
                    <button
                      onClick={() => { 
                        setEditingPrice(product.id); 
                        setPriceInput(String(Math.floor(product.price / 100))); 
                        setCuttedPriceInput(product.cuttedPrice ? String(Math.floor(product.cuttedPrice / 100)) : "");
                      }}
                      style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 14 }}
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, padding: "14px 24px", flexWrap: "wrap", alignItems: "center" }}>
              {/* Badge Selection */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#6B7280" }}>Badge:</span>
                <select 
                  className="input-field" 
                  value={product.badge || ""} 
                  onChange={(e) => updateBadge(product.id, e.target.value)}
                  style={{ padding: "4px 8px", fontSize: 12, width: 100 }}
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
                  <input
                    type="checkbox"
                    checked={product.visible}
                    onChange={() => toggleVisibility(product.id, product.visible)}
                  />
                  <span className="toggle-slider" />
                </label>
                <span style={{ fontSize: 13, color: "#6B7280" }}>
                  {product.visible ? "Visible on public site" : "Hidden from public"}
                </span>
              </div>

              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <Link
                  href={`/preview/${product.id}`}
                  target="_blank"
                  className="btn-secondary"
                  style={{ padding: "8px 14px", fontSize: 13 }}
                >
                  Preview 👀
                </Link>
                <Link
                  href={`/admin/orders?product=${product.id}`}
                  className="btn-secondary"
                  style={{ padding: "8px 14px", fontSize: 13 }}
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
