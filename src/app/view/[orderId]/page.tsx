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

  useEffect(() => {
    (async () => {
      const o = await getOrderDB(orderId);
      if (!o) return;
      setOrder(o);
      const p = await getProductDB(o.productId);
      if (p) setProduct(p);
    })();
  }, [orderId]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      {/* For Finalized Pages: Minimal Glass Header */}
      {isFinalized && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 300,
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: 999, padding: "8px 16px 8px 20px",
          display: "flex", alignItems: "center", gap: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          width: "max-content", maxWidth: "calc(100vw - 32px)"
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {product.name.replace(/[\u{1F000}-\u{1FFFF}]/gu,"").trim()}
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", textShadow: "0 1px 2px rgba(0,0,0,0.2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              A gift for {order.buyerName}
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
            style={{
              background: copied ? "#10B981" : "rgba(255,255,255,0.25)",
              color: "#fff", border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: 999, padding: "6px 14px", fontSize: 12, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s"
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
