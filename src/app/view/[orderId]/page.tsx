"use client";
import { use, useEffect, useState } from "react";
import { getOrderDB, getProductDB } from "@/lib/db";
import type { Order, Product } from "@/lib/data";
import BirthdayMagicBox from "@/components/templates/BirthdayMagicBox";
import SweetApologyBox from "@/components/templates/SweetApologyBox";
import Link from "next/link";

function renderFinalTemplate(productId: string, customData: Record<string, string>) {
  switch (productId) {
    case "birthday-magic-box":
      return <BirthdayMagicBox customData={customData} />;
    case "sweet-apology-box":
      return <SweetApologyBox customData={customData} />;
    default:
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#fff" }}>
          Template not found.
        </div>
      );
  }
}

export default function ViewPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [copied, setCopied] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const o = await getOrderDB(orderId);
      if (!o) { setLoading(false); return; }
      setOrder(o);
      const p = await getProductDB(o.productId);
      if (p) setProduct(p);
      setLoading(false);
    })();
  }, [orderId]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes viewSpin { 100% { transform: rotate(360deg); } }
        ` }} />
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(255,45,120,0.2)", borderTopColor: "#FF2D78", animation: "viewSpin 1s linear infinite", marginBottom: 24 }} />
        <h2 style={{ fontWeight: 700, color: "#fff", fontSize: 20 }}>Please wait...</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 8 }}>Loading your customized experience ✨</p>
      </div>
    );
  }

  if (!order || !product) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <p style={{ fontSize: 48 }}>😔</p>
          <h2 style={{ fontWeight: 700, marginTop: 12 }}>Page not found</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 8 }}>This link may be invalid or expired.</p>
          <Link href="/" className="btn-primary" style={{ display: "inline-flex", marginTop: 20 }}>Browse Gifts</Link>
        </div>
      </div>
    );
  }

  // Build final data: merge defaults + customizations
  const mergedData: Record<string, string> = {};
  const cust = order.customizations || {};
  product.slides.forEach(slide => {
    slide.fields.forEach(f => {
      mergedData[f.id] = cust[f.id] ?? f.defaultValue;
    });
  });

  const isFinalized = order.status === "finalized";

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      
      {/* For Unfinalized Pages: Warning Banner */}
      {showBanner && !isFinalized && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 300,
          background: "linear-gradient(135deg, #3D0F2E, #1F0A1A)",
          borderBottom: "1px solid rgba(255,45,120,0.3)",
          padding: "12px 20px",
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#FF6B6B" }}>
              Page not yet finalized
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              Go back to the editor to finalize your page.
            </p>
          </div>
          <Link href={`/edit/${orderId}`} className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
            Back to Editor ✍️
          </Link>
          <button
            onClick={() => setShowBanner(false)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, padding: 4 }}
          >
            ×
          </button>
        </div>
      )}

      {/* For Finalized Pages: Full Width Dark Blue Header */}
      {isFinalized && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 300,
          background: "linear-gradient(135deg, #0F172A, #1E1B4B)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          padding: "12px 20px",
          display: "flex", alignItems: "center", gap: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {product.name.replace(/[\u{1F000}-\u{1FFFF}]/gu,"").trim()}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              For: {order.buyerName}
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                await navigator.share({ title: `A gift for ${order.buyerName}`, url: pageUrl });
              } catch {
                copyLink();
              }
            }}
            className="btn-primary"
            style={{
              background: copied ? "#10B981" : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              padding: "8px 16px", fontSize: 13, gap: 6, display: "flex", alignItems: "center",
              border: "none"
            }}
          >
            {copied ? "✓ Copied" : "📤 Share"}
          </button>
        </div>
      )}

      {/* The actual personalized page content */}
      <div style={{ paddingTop: (!isFinalized && showBanner) ? 58 : 0 }}>
        {renderFinalTemplate(product.id, mergedData)}
      </div>
    </div>
  );
}
