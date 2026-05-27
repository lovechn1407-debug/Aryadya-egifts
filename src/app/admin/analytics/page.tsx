"use client";
import { useEffect, useState } from "react";
import { getAnalyticsEventsDB, getProductsDB, AnalyticsEvent } from "@/lib/db";
import type { Product } from "@/lib/data";
import Link from "next/link";

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalyticsEventsDB(), getProductsDB()]).then(([evts, prods]) => {
      setEvents(evts);
      setProducts(prods);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading analytics data...</div>;

  // Basic Metrics
  const uniqueSessions = new Set(events.map(e => e.sessionId)).size;
  const pageViews = events.filter(e => e.eventType === "page_view").length;
  const productClicks = events.filter(e => e.eventType === "product_click").length;
  const previewViews = events.filter(e => e.eventType === "preview_view").length;
  const personalizeClicks = events.filter(e => e.eventType === "preview_personalize_click").length;
  const checkoutDetails = events.filter(e => e.eventType === "checkout_step" && e.eventData?.step === "details").length;
  const checkoutPayments = events.filter(e => e.eventType === "checkout_step" && e.eventData?.step === "payment").length;
  const checkoutProcessing = events.filter(e => e.eventType === "checkout_step" && e.eventData?.step === "processing").length;

  // Funnel Data
  const funnel = [
    { label: "Total Sessions", value: uniqueSessions },
    { label: "Product Clicks", value: productClicks },
    { label: "Previews Viewed", value: previewViews },
    { label: "Clicked Personalise", value: personalizeClicks },
    { label: "Reached Checkout (Details)", value: checkoutDetails },
    { label: "Reached Payment", value: checkoutPayments },
    { label: "Completed Payment", value: checkoutProcessing },
  ];

  const maxFunnel = Math.max(...funnel.map(f => f.value), 1); // prevent div by zero

  // Product Popularity
  const productViewCounts: Record<string, number> = {};
  events.filter(e => e.eventType === "product_click" || e.eventType === "preview_view").forEach(e => {
    const pid = e.eventData?.productId;
    if (pid) {
      productViewCounts[pid] = (productViewCounts[pid] || 0) + 1;
    }
  });

  const topProducts = Object.entries(productViewCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const p = products.find(prod => prod.id === id);
      return { id, name: p ? p.name : id, count };
    });

  const cardStyle = {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: 0 }}>Analytics & Insights</h1>
          <p style={{ color: "#64748B", fontSize: 14, margin: "4px 0 0 0" }}>Track user journeys and product performance.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: 13, background: "#F1F5F9", padding: "6px 12px", borderRadius: 8, color: "#475569", fontWeight: 600 }}>Total Events Logged: {events.length}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
        {[
          { label: "Unique Visitors", value: uniqueSessions, icon: "👥" },
          { label: "Page Views", value: pageViews, icon: "👀" },
          { label: "Avg. Drop-off to Payment", value: uniqueSessions > 0 ? `${Math.round(100 - (checkoutPayments / uniqueSessions * 100))}%` : "0%", icon: "📉" },
          { label: "Completed Orders", value: checkoutProcessing, icon: "🛍️" },
        ].map(m => (
          <div key={m.label} style={{ ...cardStyle, padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{m.label}</span>
              <span style={{ fontSize: 20 }}>{m.icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0F172A" }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Funnel Chart */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 24 }}>Conversion Funnel</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {funnel.map((step, idx) => {
              const widthPct = Math.round((step.value / maxFunnel) * 100);
              return (
                <div key={step.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: "#475569" }}>{idx + 1}. {step.label}</span>
                    <span style={{ fontWeight: 700, color: "#0F172A" }}>{step.value}</span>
                  </div>
                  <div style={{ width: "100%", height: 10, background: "#F1F5F9", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ 
                      width: `${widthPct}%`, 
                      height: "100%", 
                      background: "linear-gradient(90deg, #7C3AED, #EC4899)",
                      borderRadius: 999,
                      transition: "width 1s ease-out"
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 20 }}>Most Viewed Products</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {topProducts.length === 0 ? (
              <p style={{ fontSize: 13, color: "#64748B" }}>No data yet.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontWeight: 800, color: "#94A3B8", fontSize: 14 }}>#{idx + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{p.name}</span>
                  </div>
                  <span style={{ background: "#F1F5F9", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: "#475569" }}>
                    {p.count} views
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Live Feed */}
      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Recent Live Activity</h2>
        <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {events.length === 0 ? (
            <p style={{ fontSize: 13, color: "#64748B" }}>No events logged yet.</p>
          ) : (
            events.slice(0, 50).map(evt => (
              <div key={evt.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px", background: "#F8FAFC", borderRadius: 8, border: "1px solid #F1F5F9" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
                <div style={{ flex: 1, display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#334155", width: 140 }}>{evt.eventType}</span>
                  <span style={{ fontSize: 12, color: "#64748B", fontFamily: "monospace" }}>{JSON.stringify(evt.eventData)}</span>
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8", whiteSpace: "nowrap" }}>
                  {new Date(evt.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
