"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";
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

function PenSVG({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
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
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else if (!authLoading) {
      setLoadingOrders(false);
      setShowLogin(true); // Automatically prompt login if not authenticated
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/user/orders?t=${Date.now()}`, {
        headers: {
          // In a real app we'd pass an ID token, but since Next.js can't read client firebase state easily, 
          // we'll pass the UID for this simple setup.
          "Authorization": `Bearer ${user?.uid}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders);
      } else {
        setError(data.error || "Failed to fetch orders");
      }
    } catch (e) {
      console.error(e);
      setError("An unexpected error occurred");
    } finally {
      setLoadingOrders(false);
    }
  };

  const displayName = userProfile?.name || user?.displayName || "User";
  const displayEmail = userProfile?.email || user?.email || "No Email Provided";
  const displayPhoto = userProfile?.photoURL || user?.photoURL;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "var(--font-inter), sans-serif" }}>
      <div style={{ background: "#fff", padding: "16px clamp(16px,4vw,48px)", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#64748B", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
          <ArrowLeftSVG /> Back to Home
        </Link>
        {user && (
          <button onClick={() => signOut()} style={{
            background: "none", border: "1px solid #E2E8F0", padding: "8px 16px", borderRadius: 8,
            color: "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>
            Sign Out
          </button>
        )}
      </div>

      <div style={{ maxWidth: 800, margin: "48px auto", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 900, color: "#1A1A2E", margin: "0 0 12px 0", letterSpacing: -0.5 }}>
            My Account & Orders
          </h1>
          <p style={{ fontSize: 16, color: "#64748B", margin: 0 }}>
            Manage your profile and track your customized digital gifts.
          </p>
        </div>

        {authLoading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Loading your account...</div>
        ) : !user ? (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "#fff", borderRadius: 24, border: "1px solid #E2E8F0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 32, background: "#F1F5F9", color: "#94A3B8", marginBottom: 24 }}>
              <LockSVG size={32} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1E293B", margin: "0 0 12px 0" }}>Please Log In</h2>
            <p style={{ color: "#64748B", fontSize: 15, marginBottom: 32, maxWidth: 300, margin: "0 auto 32px" }}>
              You need to be logged in to view your orders and manage your profile.
            </p>
            <button onClick={() => setShowLogin(true)} style={{
              background: "#7C3AED", color: "#fff", border: "none", padding: "14px 32px", borderRadius: 12,
              fontSize: 15, fontWeight: 700, cursor: "pointer"
            }}>
              Log In Now
            </button>
          </div>
        ) : (
          <>
            {/* Profile Section */}
            <div style={{
              background: "#fff", padding: 32, borderRadius: 24, border: "1px solid #E2E8F0", 
              display: "flex", alignItems: "center", gap: 24, marginBottom: 32, flexWrap: "wrap"
            }}>
              {displayPhoto ? (
                <img src={displayPhoto} alt={displayName} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #7C3AED" }} />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#7C3AED", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800 }}>
                  {displayName[0].toUpperCase()}
                </div>
              )}
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1E293B", margin: "0 0 4px 0" }}>{displayName}</h2>
                <div style={{ color: "#64748B", fontSize: 15 }}>{displayEmail}</div>
                {userProfile?.phone || user.phoneNumber ? (
                  <div style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>{userProfile?.phone || user.phoneNumber}</div>
                ) : null}
              </div>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", marginBottom: 20 }}>Your Orders</h2>

            {loadingOrders ? (
              <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Loading orders...</div>
            ) : error ? (
              <div style={{ background: "#FEF2F2", color: "#EF4444", padding: 16, borderRadius: 12, textAlign: "center" }}>{error}</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 24, border: "1px dashed #CBD5E1" }}>
                <div style={{ marginBottom: 16 }}><EmptyBoxSVG /></div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#334155", margin: "0 0 8px 0" }}>No orders found</h3>
                <p style={{ color: "#64748B", fontSize: 14, margin: "0 0 24px 0" }}>Looks like you haven't bought any gifts yet.</p>
                <Link href="/" style={{
                  display: "inline-flex", background: "#7C3AED", color: "#fff", padding: "12px 24px", 
                  borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14
                }}>
                  Browse Gifts
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {orders.map(order => {
                  const displayStatus = (order.paymentMode === "post-pay" && order.status === "pending") ? "editing" : order.status;
                  const badgeColor = displayStatus === "finalized" ? "#10B981" : (displayStatus === "editing" || displayStatus === "paid") ? "#7C3AED" : "#64748B";
                  const badgeBg = displayStatus === "finalized" ? "#D1FAE5" : (displayStatus === "editing" || displayStatus === "paid") ? "#F5F3FF" : "#F1F5F9";

                  return (
                    <div key={order.id} style={{ background: "#fff", borderRadius: 20, border: "1px solid #E2E8F0", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: badgeColor, background: badgeBg, padding: "4px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                              {displayStatus}
                            </span>
                          </div>
                          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", margin: "0 0 4px 0" }}>{order.productName || "Interactive E-Gift"}</h3>
                          <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 8px 0", fontFamily: "monospace", wordBreak: "break-all" }}>ID: {order.id}</p>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#64748B" }}>
                            <div>
                              <strong>Created:</strong> {new Date(order.createdAt).toLocaleString("en-IN")}
                            </div>
                            <div>
                              <strong>Last Opened:</strong> {order.lastOpenedAt ? new Date(order.lastOpenedAt).toLocaleString("en-IN") : "Never opened"}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "#1E293B" }}>₹{order.amount}</div>
                        </div>
                      </div>
                      
                      <div style={{ height: 1, background: "#F1F5F9" }} />
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {order.paymentMode === "post-pay" && order.status === "pending" && (
                          <div style={{ fontSize: 13, color: "#D97706", display: "flex", alignItems: "center", gap: 6, fontWeight: 600, background: "#FFFBEB", padding: "8px 12px", borderRadius: 8, border: "1px solid #FDE68A" }}>
                            ⚠️ This product is not purchased yet.
                          </div>
                        )}
                        
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                          {order.status === "finalized" ? (
                            <Link href={`/view/${order.id}`} style={{
                              flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                              background: "#10B981", color: "#fff", padding: "10px 16px", borderRadius: 10,
                              textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "all 0.2s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#059669"}
                            onMouseLeave={e => e.currentTarget.style.background = "#10B981"}
                            >
                              <ClipboardSVG size={14} /> View Finalized Surprise
                            </Link>
                          ) : (order.status === "paid" || order.status === "editing" || (order.paymentMode === "post-pay" && order.status === "pending")) ? (
                            <>
                              <Link href={`/edit/${order.id}`} style={{
                                flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                                background: "#7C3AED", color: "#fff", padding: "10px 16px", borderRadius: 10,
                                textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "all 0.2s"
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "#6D28D9"}
                              onMouseLeave={e => e.currentTarget.style.background = "#7C3AED"}
                              >
                                <PenSVG size={14} /> Customize Gift (Draft)
                              </Link>
                              <Link href={`/preview/${order.productId}?orderId=${order.id}`} style={{
                                flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                                background: "#F8FAFC", color: "#475569", padding: "10px 16px", borderRadius: 10, border: "1px solid #E2E8F0",
                                textDecoration: "none", fontSize: 13, fontWeight: 600, transition: "all 0.2s"
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                              onMouseLeave={e => e.currentTarget.style.background = "#F8FAFC"}
                              >
                                <ClipboardSVG size={14} /> Preview Draft
                              </Link>
                            </>
                          ) : (
                            <div style={{ fontSize: 13, color: "#B45309", display: "flex", alignItems: "center", gap: 6 }}>
                              Payment incomplete or pending.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}

function LockSVG({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
