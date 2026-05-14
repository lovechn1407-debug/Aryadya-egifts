"use client";
import { useState } from "react";
import Link from "next/link";
import { getOrdersByBuyerDB } from "@/lib/db";
import type { Order } from "@/lib/data";

export default function MyOrdersPage() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async () => {
    if (!phone.trim() || !email.trim()) { setError("Please fill both fields"); return; }
    setLoading(true); setError("");
    const found = await getOrdersByBuyerDB(phone, email);
    if (found.length === 0) setError("No orders found with these details");
    else setOrders(found);
    setLoading(false);
  };

  const drafts = orders?.filter(o => o.status === "paid" || o.status === "editing") ?? [];
  const finalized = orders?.filter(o => o.status === "finalized") ?? [];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: 12,
    border: "1.5px solid #E5E7EB", fontSize: 15, color: "#1F2937",
    background: "#F9FAFB", outline: "none", fontFamily: "'Inter',sans-serif",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FFF0F5, #FAFAFA)" }}>
      {/* Header */}
      <div style={{
        padding: "20px clamp(16px,4vw,48px)",
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Link href="/" style={{ textDecoration: "none", fontSize: 14, color: "#9CA3AF", fontWeight: 600 }}>← Back</Link>
        <span style={{ color: "#E5E7EB" }}>|</span>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: "#1F2937", fontFamily: "'Nunito',sans-serif" }}>📦 My Orders</h1>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px clamp(16px,4vw,32px)" }}>
        {/* Login form */}
        {orders === null && (
          <div style={{
            background: "#fff", borderRadius: 20, padding: "36px 28px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)",
          }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1F2937", fontFamily: "'Nunito',sans-serif" }}>
                Find Your Orders
              </h2>
              <p style={{ fontSize: 14, color: "#6B7280", marginTop: 6 }}>
                Enter the phone &amp; email you used when purchasing
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input style={inputStyle} placeholder="Phone (e.g. 9876543210)" value={phone} onChange={e => setPhone(e.target.value)} />
              <input style={inputStyle} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
              {error && <p style={{ color: "#EF4444", fontSize: 13, fontWeight: 600 }}>{error}</p>}
              <button onClick={handleLookup} disabled={loading} style={{
                padding: "15px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #7C3AED, #E91E8C)",
                color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer",
                fontFamily: "'Nunito',sans-serif", opacity: loading ? 0.7 : 1,
              }}>
                {loading ? "Searching…" : "Find My Orders →"}
              </button>
            </div>
          </div>
        )}

        {/* Orders list */}
        {orders !== null && (
          <>
            {/* Drafts */}
            {drafts.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
                  padding: "10px 16px", background: "#FEF3C7", borderRadius: 12, border: "1px solid #FCD34D",
                }}>
                  <span style={{ fontSize: 20 }}>⚠️</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#92400E" }}>
                    {drafts.length} draft{drafts.length > 1 ? "s" : ""} awaiting personalisation
                  </span>
                </div>
                {drafts.map(o => (
                  <div key={o.id} style={{
                    background: "#fff", borderRadius: 16, padding: 20, marginBottom: 12,
                    border: "1.5px solid #DDD6FE", boxShadow: "0 4px 16px rgba(124,58,237,0.06)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 28 }}>✍️</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 800, color: "#1F2937", fontSize: 16, fontFamily: "'Nunito',sans-serif" }}>{o.productName}</p>
                        <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                          {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {" · "}₹{Math.floor(o.amount / 100)} · For: {o.buyerName}
                        </p>
                      </div>
                      <Link href={`/edit/${o.id}`} style={{
                        background: "linear-gradient(135deg, #7C3AED, #E91E8C)", color: "#fff",
                        padding: "10px 20px", borderRadius: 999, textDecoration: "none",
                        fontSize: 13, fontWeight: 700,
                      }}>Continue Editing ✍️</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Finalized */}
            {finalized.length > 0 && (
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1F2937", marginBottom: 16, fontFamily: "'Nunito',sans-serif" }}>
                  ✅ Completed Gifts ({finalized.length})
                </h3>
                {finalized.map(o => (
                  <div key={o.id} style={{
                    background: "#fff", borderRadius: 16, padding: 20, marginBottom: 12,
                    border: "1px solid #BBF7D0", boxShadow: "0 4px 16px rgba(16,185,129,0.06)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 28 }}>🎁</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 800, color: "#1F2937", fontSize: 16, fontFamily: "'Nunito',sans-serif" }}>{o.productName}</p>
                        <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                          For: {o.buyerName} · ₹{Math.floor(o.amount / 100)} · {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    {/* Receipt + Actions */}
                    <div style={{
                      marginTop: 14, padding: "14px 16px", background: "#F0FDF4", borderRadius: 12,
                      display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                    }}>
                      <div style={{ flex: 1, minWidth: 150 }}>
                        <p style={{ fontSize: 11, color: "#6B7280", fontWeight: 600 }}>ORDER ID</p>
                        <p style={{ fontSize: 12, color: "#374151", fontFamily: "monospace", marginTop: 2 }}>{o.id.slice(0, 24)}…</p>
                      </div>
                      <Link href={`/view/${o.id}`} style={{
                        background: "#10B981", color: "#fff", padding: "8px 18px",
                        borderRadius: 999, textDecoration: "none", fontSize: 13, fontWeight: 700,
                      }}>View Page 🔗</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {drafts.length === 0 && finalized.length === 0 && (
              <div style={{ textAlign: "center", padding: 48 }}>
                <p style={{ fontSize: 40 }}>📭</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginTop: 12 }}>No orders found</p>
              </div>
            )}

            <button onClick={() => setOrders(null)} style={{
              display: "block", margin: "24px auto 0", background: "none", border: "none",
              color: "#9CA3AF", cursor: "pointer", fontSize: 14, fontWeight: 600,
            }}>← Try different details</button>
          </>
        )}
      </div>
    </div>
  );
}
