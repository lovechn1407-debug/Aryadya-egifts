"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAllOrdersDB } from "@/lib/db";
import type { Order } from "@/lib/data";
import Link from "next/link";

const STATUS_BADGE: Record<string, string> = {
  pending: "badge-gray",
  paid: "badge-gold",
  editing: "badge-purple",
  finalized: "badge-green",
};

const STATUS_ICON: Record<string, string> = {
  pending: "⏳",
  paid: "💳",
  editing: "✍️",
  finalized: "✅",
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const productFilter = searchParams.get("product");
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loadErr, setLoadErr] = useState("");

  useEffect(() => {
    setLoadErr("");
    getAllOrdersDB()
      .then(all => {
        const result = productFilter ? all.filter(o => o.productId === productFilter) : all;
        setOrders(result);
      })
      .catch(e => setLoadErr(String(e)));
  }, [productFilter]);

  const filtered = orders.filter(o => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search && !o.buyerName.toLowerCase().includes(search.toLowerCase()) &&
      !o.buyerEmail.toLowerCase().includes(search.toLowerCase()) &&
      !o.productName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const copyLink = (orderId: string) => {
    const url = `${window.location.origin}/view/${orderId}`;
    navigator.clipboard.writeText(url);
  };

  const statusStyles: Record<string, { bg: string; color: string; border: string }> = {
    pending: { bg: "#F1F5F9", color: "#64748B", border: "#E2E8F0" },
    paid: { bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" },
    editing: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
    finalized: { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: -0.5 }}>
          Orders & Links
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
          {orders.length} total orders{productFilter ? ` for this product` : ""}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="Search by name, email, product…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            maxWidth: 280, width: "100%", padding: "10px 16px", borderRadius: 8,
            border: "1px solid #CBD5E1", fontSize: 14, color: "#0F172A",
            background: "#FFFFFF", outline: "none", boxSizing: "border-box",
            transition: "all 0.2s",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "#CBD5E1"; e.currentTarget.style.boxShadow = "none"; }}
        />
        <div style={{ display: "flex", background: "#E2E8F0", padding: 4, borderRadius: 10, gap: 4 }}>
          {["all", "paid", "editing", "finalized"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "8px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                border: "none", cursor: "pointer", transition: "all 0.2s",
                background: statusFilter === s ? "#FFFFFF" : "transparent",
                color: statusFilter === s ? "#0F172A" : "#64748B",
                boxShadow: statusFilter === s ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {s === "all" ? "All" : `${STATUS_ICON[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {loadErr && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#EF4444", fontSize: 13 }}>
          ⚠️ Firebase error: {loadErr}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12 }}>
          <p style={{ fontSize: 48 }}>📭</p>
          <p style={{ color: "#64748B", marginTop: 12, fontWeight: 500 }}>No orders found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(order => {
            const st = statusStyles[order.status] || statusStyles.pending;
            return (
              <div key={order.id} style={{
                background: "#FFFFFF", borderRadius: 12, padding: 20,
                border: "1px solid #E2E8F0", boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
                        background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                        textTransform: "capitalize",
                      }}>
                        {STATUS_ICON[order.status]} {order.status}
                      </span>
                      <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: "#0F172A" }}>{order.buyerName}</h3>
                    <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{order.buyerEmail} · {order.buyerPhone}</p>
                    <p style={{ fontSize: 13, color: "#334155", marginTop: 6, fontWeight: 500 }}>
                      Product: {order.productName}
                    </p>
                    <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2, fontFamily: "monospace" }}>
                      ID: {order.id}
                    </p>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>₹{Math.floor(order.amount / 100)}</p>
                    {order.finalizedAt && (
                      <p style={{ fontSize: 12, color: "#10B981", marginTop: 4, fontWeight: 500 }}>
                        Finalized: {new Date(order.finalizedAt).toLocaleDateString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", paddingTop: 16, borderTop: "1px solid #F1F5F9" }}>
                  {order.status === "finalized" && (
                    <>
                      <Link
                        href={`/view/${order.id}`}
                        target="_blank"
                        style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#10B981", color: "#FFFFFF", textDecoration: "none" }}
                      >
                        View Page 🔗
                      </Link>
                      <button
                        onClick={() => copyLink(order.id)}
                        style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#F1F5F9", color: "#334155", border: "none", cursor: "pointer" }}
                      >
                        Copy Link 📋
                      </button>
                    </>
                  )}
                  {(order.status === "paid" || order.status === "editing") && (
                    <Link
                      href={`/edit/${order.id}`}
                      target="_blank"
                      style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#3B82F6", color: "#FFFFFF", textDecoration: "none" }}
                    >
                      Open Editor ✍️
                    </Link>
                  )}
                  <Link
                    href={`/preview/${order.productId}`}
                    target="_blank"
                    style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#FFFFFF", color: "#334155", border: "1px solid #E2E8F0", textDecoration: "none" }}
                  >
                    Preview Template 👀
                  </Link>
                </div>

                {/* Customizations summary */}
                {Object.keys(order.customizations || {}).length > 0 && (
                  <details style={{ marginTop: 16 }}>
                    <summary style={{ fontSize: 13, color: "#64748B", cursor: "pointer", fontWeight: 500 }}>
                      View customizations ({Object.keys(order.customizations || {}).length} fields)
                    </summary>
                    <div style={{ marginTop: 12, padding: 16, background: "#F8FAFC", borderRadius: 8, border: "1px solid #E2E8F0" }}>
                      {Object.entries(order.customizations || {}).map(([k, v]) => (
                        <div key={k} style={{ marginBottom: 8, fontSize: 13 }}>
                          <span style={{ color: "#64748B", fontWeight: 600 }}>{k}: </span>
                          <span style={{ color: "#334155", wordBreak: "break-all" }}>{v.length > 100 ? v.slice(0, 100) + "…" : v}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: "#0F172A" }}>Loading orders…</div>}>
      <OrdersContent />
    </Suspense>
  );
}
