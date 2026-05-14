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
      {/* Share/Info banner */}
      {showBanner && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 300,
          background: isFinalized
            ? "linear-gradient(135deg, #0F3D2E, #0A2D1F)"
            : "linear-gradient(135deg, #3D0F2E, #1F0A1A)",
          borderBottom: isFinalized ? "1px solid rgba(0,217,160,0.3)" : "1px solid rgba(255,45,120,0.3)",
          padding: "12px 20px",
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
        }}>
          {isFinalized ? (
            <>
              <span style={{ fontSize: 20 }}>✅</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#00D9A0" }}>
                  Your personalised page is ready!
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                  For: {order.buyerName} · Created by Aradhya E-Gifts
                </p>
              </div>
              <button
                onClick={copyLink}
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: 13 }}
              >
                {copied ? "✓ Copied!" : "Copy Link 🔗"}
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
          <button
            onClick={() => setShowBanner(false)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, padding: 4 }}
          >
            ×
          </button>
        </div>
      )}

      {/* The actual personalized page content */}
      <div style={{ paddingTop: showBanner ? 58 : 0 }}>
        {renderFinalTemplate(product.id, mergedData)}
      </div>
    </div>
  );
}
