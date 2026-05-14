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
    pending: { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" },
    paid: { bg: "#FEF3C7", color: "#92400E", border: "#FCD34D" },
    editing: { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
    finalized: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff", borderRadius: 16, padding: 24,
    border: "1px solid #F3F4F6", boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  };

  return (
    <div style={{ padding: "32px 28px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Nunito',sans-serif", color: "#1F2937" }}>
          Dashboard <span style={{ background: "linear-gradient(135deg,#7C3AED,#E91E8C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Overview</span>
        </h1>
        <p style={{ color: "#9CA3AF", fontSize: 14, marginTop: 4 }}>
          Welcome back! Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 14, marginBottom: 32 }}>
        {[
          { label: "Total Revenue", value: `₹${Math.floor(totalRevenue / 100)}`, icon: "💰", accent: "#F59E0B" },
          { label: "Total Orders", value: orders.length, icon: "📦", accent: "#7C3AED" },
          { label: "Finalized", value: finalized, icon: "✅", accent: "#16A34A" },
          { label: "In Progress", value: editing, icon: "✍️", accent: "#E91E8C" },
          { label: "Products", value: visible, icon: "🎁", accent: "#EC4899" },
        ].map(s => (
          <div key={s.label} style={{
            ...cardStyle, padding: "20px 18px",
            borderLeft: `4px solid ${s.accent}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>
                {s.label}
              </span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 900, color: s.accent, fontFamily: "'Nunito',sans-serif" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Products */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1F2937" }}>🎁 Products</h2>
            <Link href="/admin/products" style={{ color: "#7C3AED", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>Manage →</Link>
          </div>
          {products.map(p => (
            <div key={p.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
              borderBottom: "1px solid #F3F4F6",
            }}>
              <span style={{ fontSize: 26 }}>{p.thumbnail}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: "#1F2937" }}>{p.name}</p>
                <p style={{ fontSize: 12, color: "#9CA3AF" }}>₹{Math.floor(p.price / 100)}</p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                background: p.visible ? "#F0FDF4" : "#F3F4F6",
                color: p.visible ? "#16A34A" : "#9CA3AF",
                border: `1px solid ${p.visible ? "#BBF7D0" : "#E5E7EB"}`,
              }}>{p.visible ? "Visible" : "Hidden"}</span>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1F2937" }}>📦 Recent Orders</h2>
            <Link href="/admin/orders" style={{ color: "#7C3AED", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ color: "#9CA3AF", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              No orders yet. Share your products!
            </p>
          ) : (
            recentOrders.map(o => {
              const st = statusStyles[o.status] || statusStyles.pending;
              return (
                <div key={o.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                  borderBottom: "1px solid #F3F4F6",
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: "#1F2937" }}>{o.buyerName}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF" }}>{o.productName}</p>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                    background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                    textTransform: "capitalize",
                  }}>{o.status}</span>
                  {o.status === "finalized" && (
                    <Link href={`/view/${o.id}`} style={{ color: "#16A34A", fontSize: 14, textDecoration: "none" }}>🔗</Link>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
