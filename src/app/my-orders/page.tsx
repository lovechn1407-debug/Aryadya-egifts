"use client";
import { useState } from "react";
import Link from "next/link";
import { getOrdersByBuyerDB } from "@/lib/db";
import type { Order } from "@/lib/data";

/* ── Vector SVG Components ── */
function ArrowLeftSVG({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ArrowRightSVG({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function LockSVG({ size = 48, color = "#7C3AED" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function WarningSVG({ size = 20, color = "#B45309" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function PenSVG({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function GiftCardSVG({ size = 28, color = "#7C3AED" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function ClipboardSVG({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

function EmptyBoxSVG({ size = 48, color = "#94A3B8" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <line x1="22" y1="12" x2="2" y2="12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

export default function MyOrdersPage() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async () => {
    if (!phone.trim() || !email.trim()) { setError("Please fill both phone and email address"); return; }
    setLoading(true); setError("");
    const found = await getOrdersByBuyerDB(phone, email);
    if (found.length === 0) setError("No orders found matching these details");
    else setOrders(found);
    setLoading(false);
  };

  const drafts = orders?.filter(o => o.status === "paid" || o.status === "editing") ?? [];
  const finalized = orders?.filter(o => o.status === "finalized") ?? [];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: 12,
    border: "1.5px solid #E2E8F0", fontSize: 14, color: "#1F2937",
    background: "#F8FAFC", outline: "none", fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box", transition: "all 0.2s"
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F8F5FF 0%, #FFF0F8 100%)", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{
        padding: "16px clamp(16px, 4vw, 48px)",
        background: "rgba(255,255,255,0.9)", 
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Link href="/" style={{ textDecoration: "none", fontSize: 13, color: "#7C3AED", fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
          <ArrowLeftSVG /> Home
        </Link>
        <span style={{ color: "#E2E8F0" }}>|</span>
        <h1 style={{ fontSize: 16, fontWeight: 900, color: "#1E293B", fontFamily: "'Nunito', sans-serif", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <GiftCardSVG size={18} color="#7C3AED" /> Track Orders
        </h1>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Login form */}
        {orders === null && (
          <div style={{
            background: "#fff", 
            borderRadius: 24, 
            padding: "40px 32px",
            boxShadow: "0 10px 30px rgba(124, 58, 237, 0.04)", 
            border: "1px solid #F3E8FF",
          }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "rgba(124, 58, 237, 0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <LockSVG size={28} color="#7C3AED" />
                </div>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1F2937", fontFamily: "'Nunito', sans-serif", margin: 0, letterSpacing: -0.5 }}>
                Find Your Orders
              </h2>
              <p style={{ fontSize: 13, color: "#64748B", marginTop: 6, marginInline: 0 }}>
                Enter the phone and email address used when placing your purchase.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Phone Number</label>
                <input 
                  style={inputStyle} 
                  placeholder="e.g. 9876543210" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  onFocus={e => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.background = "#FFF"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Email Address</label>
                <input 
                  style={inputStyle} 
                  type="email" 
                  placeholder="e.g. buyer@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  onFocus={e => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.background = "#FFF"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; }}
                />
              </div>

              {error && <p style={{ color: "#EF4444", fontSize: 12, fontWeight: 700, margin: "6px 0 0" }}>{error}</p>}
              
              <button 
                onClick={handleLookup} 
                disabled={loading} 
                style={{
                  width: "100%", marginTop: 12, padding: "14px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif", opacity: loading ? 0.7 : 1,
                  boxShadow: "0 6px 20px rgba(124, 58, 237, 0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                }}
              >
                {loading ? "Searching Database..." : "Locate Orders"}
                {!loading && <ArrowRightSVG size={14} />}
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
                  display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
                  padding: "12px 18px", background: "#FFFBEB", borderRadius: 16, border: "1px solid #FCD34D",
                }}>
                  <WarningSVG size={18} color="#D97706" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#B45309" }}>
                    {drafts.length} order draft{drafts.length > 1 ? "s" : ""} awaiting personalization
                  </span>
                </div>

                {drafts.map(o => (
                  <div key={o.id} style={{
                    background: "#fff", 
                    borderRadius: 20, 
                    padding: 24, 
                    marginBottom: 14,
                    border: "1.5px solid #E2E8F0", 
                    boxShadow: "0 8px 24px rgba(124,58,237,0.03)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(124, 58, 237, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <PenSVG size={20} color="#7C3AED" />
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <p style={{ fontWeight: 850, color: "#1E293B", fontSize: 16, fontFamily: "'Nunito', sans-serif", margin: 0 }}>{o.productName}</p>
                        <p style={{ fontSize: 12, color: "#64748B", marginTop: 4, margin: 0, fontWeight: 600 }}>
                          Ordered: {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {" · "}₹{Math.floor(o.amount / 100)}
                        </p>
                      </div>
                      <Link href={`/edit/${o.id}`} style={{
                        background: "linear-gradient(135deg, #7C3AED, #EC4899)", 
                        color: "#fff",
                        padding: "10px 20px", 
                        borderRadius: 10, 
                        textDecoration: "none",
                        fontSize: 12, 
                        fontWeight: 800,
                        boxShadow: "0 4px 12px rgba(124,58,237,0.2)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6
                      }}>
                        <PenSVG size={12} /> Personalise Draft
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Finalized */}
            {finalized.length > 0 && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#1E293B", marginBottom: 16, fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Completed Personalizations ({finalized.length})
                </h3>

                {finalized.map(o => (
                  <div key={o.id} style={{
                    background: "#fff", 
                    borderRadius: 20, 
                    padding: 24, 
                    marginBottom: 14,
                    border: "1px solid #E2E8F0", 
                    boxShadow: "0 8px 24px rgba(16,185,129,0.02)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16, 185, 129, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <GiftCardSVG size={20} color="#10B981" />
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <p style={{ fontWeight: 850, color: "#1E293B", fontSize: 16, fontFamily: "'Nunito', sans-serif", margin: 0 }}>{o.productName}</p>
                        <p style={{ fontSize: 12, color: "#64748B", marginTop: 4, margin: 0, fontWeight: 600 }}>
                          For: {o.buyerName} · ₹{Math.floor(o.amount / 100)} · {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    {/* Receipt + Actions */}
                    <div style={{
                      marginTop: 18, 
                      padding: "14px 18px", 
                      background: "#F0FDF4", 
                      borderRadius: 14,
                      border: "1px solid #DCFCE7",
                      display: "flex", 
                      alignItems: "center", 
                      gap: 12, 
                      flexWrap: "wrap",
                    }}>
                      <div style={{ flex: 1, minWidth: 150 }}>
                        <p style={{ fontSize: 10, color: "#15803D", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, margin: 0 }}>ORDER REFERENCE ID</p>
                        <p style={{ fontSize: 12, color: "#1E293B", fontFamily: "monospace", marginTop: 4, margin: 0 }}>{o.id}</p>
                      </div>
                      <Link href={`/view/${o.id}`} style={{
                        background: "#10B981", 
                        color: "#fff", 
                        padding: "8px 18px",
                        borderRadius: 8, 
                        textDecoration: "none", 
                        fontSize: 12, 
                        fontWeight: 800,
                        boxShadow: "0 4px 10px rgba(16,185,129,0.2)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6
                      }}>
                        <ClipboardSVG size={12} /> View Personalised Site
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {drafts.length === 0 && finalized.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 24px", background: "#FFF", borderRadius: 24, border: "1px solid #E2E8F0" }}>
                <EmptyBoxSVG size={40} color="#94A3B8" />
                <p style={{ fontSize: 15, fontWeight: 800, color: "#1F2937", marginTop: 16, marginInline: 0 }}>No Orders Found</p>
                <p style={{ fontSize: 13, color: "#64748B", marginTop: 6, marginInline: 0 }}>Double check that you entered the exact credentials used at the checkout page.</p>
              </div>
            )}

            <button 
              onClick={() => setOrders(null)} 
              style={{
                display: "block", margin: "32px auto 0", background: "none", border: "none",
                color: "#7C3AED", cursor: "pointer", fontSize: 13, fontWeight: 800,
              }}
            >
              ← Search with different details
            </button>
          </>
        )}
      </div>
    </div>
  );
}
