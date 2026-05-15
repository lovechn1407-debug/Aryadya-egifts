"use client";
import { useEffect, useState } from "react";
import { getProductsDB, getAllOrdersDB } from "@/lib/db";
import type { Product, Order } from "@/lib/data";
import Link from "next/link";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getProductsDB().then(setProducts);
    getAllOrdersDB().then(setOrders);
  }, []);

  const totalRevenue = orders
    .filter(o => o.status !== "pending")
    .reduce((sum, o) => sum + o.amount, 0);

  const finalized = orders.filter(o => o.status === "finalized").length;
  const editing = orders.filter(o => o.status === "editing" || o.status === "paid").length;
  const visible = products.filter(p => p.visible).length;

  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const statusStyles: Record<string, { bg: string; color: string; border: string }> = {
    pending: { bg: "#F1F5F9", color: "#64748B", border: "#E2E8F0" },
    paid: { bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" },
    editing: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
    finalized: { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
  };

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF", borderRadius: 12, padding: 24,
    border: "1px solid #E2E8F0",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: -0.5 }}>
          Overview
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
          Metrics and recent activity across your store.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Revenue", value: `₹${Math.floor(totalRevenue / 100)}`, desc: "+12.5% from last month", icon: "💰" },
          { label: "Total Orders", value: orders.length, desc: "Across all time", icon: "📦" },
          { label: "Finalized Pages", value: finalized, desc: "Completed orders", icon: "✅" },
          { label: "Active Sessions", value: editing, desc: "Currently personalizing", icon: "✍️" },
        ].map(s => (
          <div key={s.label} style={cardStyle}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>
                {s.label}
              </span>
              <span style={{ fontSize: 18, opacity: 0.8 }}>{s.icon}</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", letterSpacing: -0.5 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent orders */}
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8FAFC" }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>Recent Orders</h2>
            <Link href="/admin/orders" style={{ color: "#3B82F6", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>View all</Link>
          </div>
          <div style={{ padding: "0 24px" }}>
            {recentOrders.length === 0 ? (
              <p style={{ color: "#64748B", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                No orders yet.
              </p>
            ) : (
              recentOrders.map((o, idx) => {
                const st = statusStyles[o.status] || statusStyles.pending;
                return (
                  <div key={o.id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "16px 0",
                    borderBottom: idx === recentOrders.length - 1 ? "none" : "1px solid #E2E8F0",
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: "#0F172A" }}>{o.buyerName}</p>
                      <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{o.productName}</p>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
                      background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                      textTransform: "capitalize",
                    }}>{o.status}</span>
                    {o.status === "finalized" && (
                      <Link href={`/view/${o.id}`} style={{ color: "#10B981", fontSize: 14, textDecoration: "none" }}>🔗</Link>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Products */}
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8FAFC" }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>Top Products</h2>
            <Link href="/admin/products" style={{ color: "#3B82F6", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>Manage</Link>
          </div>
          <div style={{ padding: "0 24px" }}>
            {products.slice(0, 5).map((p, idx) => (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "16px 0",
                borderBottom: idx === Math.min(products.length, 5) - 1 ? "none" : "1px solid #E2E8F0",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  {p.thumbnail}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: "#0F172A" }}>{p.name}</p>
                  <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>₹{Math.floor(p.price / 100)}</p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
                  background: p.visible ? "#ECFDF5" : "#F1F5F9",
                  color: p.visible ? "#059669" : "#64748B",
                  border: `1px solid ${p.visible ? "#A7F3D0" : "#E2E8F0"}`,
                }}>{p.visible ? "Active" : "Draft"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
