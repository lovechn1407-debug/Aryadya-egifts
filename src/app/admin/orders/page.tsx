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

  return (
    <div style={{ padding: "32px 28px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Nunito',sans-serif" }}>
          <span className="gradient-text">Orders</span> & Links
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 4 }}>
          {orders.length} total orders{productFilter ? ` for this product` : ""}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input
          className="input-field"
          placeholder="Search by name, email, product…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        {["all", "paid", "editing", "finalized"].map(s => (
          <button
            key={s}
            className={`slide-tab ${statusFilter === s ? "active" : ""}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === "all" ? "All" : `${STATUS_ICON[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
          </button>
        ))}
      </div>

      {loadErr && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "14px 18px", marginBottom: 20, color: "#FCA5A5", fontSize: 13 }}>
          ⚠️ Firebase error: {loadErr}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ fontSize: 48 }}>📭</p>
          <p style={{ color: "rgba(255,255,255,0.3)", marginTop: 12 }}>No orders found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(order => (
            <div key={order.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span className={`badge ${STATUS_BADGE[order.status]}`}>
                      {STATUS_ICON[order.status]} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>{order.buyerName}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{order.buyerEmail} · {order.buyerPhone}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                    Product: <span style={{ color: "#C4A3FF" }}>{order.productName}</span>
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                    Order ID: <code style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{order.id}</code>
                  </p>
                </div>

                {/* Amount */}
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 20, fontWeight: 800 }}>₹{Math.floor(order.amount / 100)}</p>
                  {order.finalizedAt && (
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                      Finalized: {new Date(order.finalizedAt).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                {order.status === "finalized" && (
                  <>
                    <Link
                      href={`/view/${order.id}`}
                      target="_blank"
                      className="btn-primary"
                      style={{ padding: "7px 14px", fontSize: 12 }}
                    >
                      View Page 🔗
                    </Link>
                    <button
                      onClick={() => copyLink(order.id)}
                      className="btn-secondary"
                      style={{ padding: "7px 14px", fontSize: 12 }}
                    >
                      Copy Link 📋
                    </button>
                  </>
                )}
                {(order.status === "paid" || order.status === "editing") && (
                  <Link
                    href={`/edit/${order.id}`}
                    target="_blank"
                    className="btn-secondary"
                    style={{ padding: "7px 14px", fontSize: 12 }}
                  >
                    Open Editor ✍️
                  </Link>
                )}
                <Link
                  href={`/preview/${order.productId}`}
                  target="_blank"
                  className="btn-secondary"
                  style={{ padding: "7px 14px", fontSize: 12 }}
                >
                  Preview Template 👀
                </Link>
              </div>

              {/* Customizations summary */}
              {Object.keys(order.customizations || {}).length > 0 && (
                <details style={{ marginTop: 12 }}>
                  <summary style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                    View customizations ({Object.keys(order.customizations || {}).length} fields)
                  </summary>
                  <div style={{ marginTop: 10, padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                    {Object.entries(order.customizations || {}).map(([k, v]) => (
                      <div key={k} style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{k}: </span>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{v.length > 80 ? v.slice(0, 80) + "…" : v}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: "#fff" }}>Loading…</div>}>
      <OrdersContent />
    </Suspense>
  );
}
