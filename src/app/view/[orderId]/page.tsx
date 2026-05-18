"use client";
import { use, useEffect, useState } from "react";
import { getOrderDB, getProductDB } from "@/lib/db";
import type { Order, Product } from "@/lib/data";
import BirthdayMagicBox from "@/components/templates/BirthdayMagicBox";
import BirthdayBliss from "@/components/templates/BirthdayBliss/BirthdayBliss";
import SweetApologyBox from "@/components/templates/SweetApologyBox";
import Link from "next/link";

/* ── Vector SVG Components ── */
function InfoCircleSVG({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function PenSVG({ size = 13, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function ShareSVG({ size = 13, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function CheckSVG({ size = 13, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertTriangleSVG({ size = 48, color = "#EF4444" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function renderFinalTemplate(productId: string, customData: Record<string, string>) {
  switch (productId) {
    case "birthday-bliss-microsite":
      return <BirthdayBliss customData={customData} />;
    case "birthday-magic-box":
      return <BirthdayMagicBox customData={customData} />;
    case "sweet-apology-box":
      return <SweetApologyBox customData={customData} />;
    default:
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#FFF" }}>
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
      <div style={{ minHeight: "100vh", background: "#06060A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes viewSpin { 100% { transform: rotate(360deg); } }
          @keyframes pulseText { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        ` }} />
        <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3.5px solid rgba(124,58,237,0.15)", borderTopColor: "#7C3AED", animation: "viewSpin 0.9s cubic-bezier(0.16, 1, 0.3, 1) infinite", marginBottom: 20 }} />
        <h2 style={{ fontWeight: 800, color: "#F8FAFC", fontSize: 18, letterSpacing: -0.3, animation: "pulseText 2s infinite" }}>Opening Your Surprise</h2>
        <p style={{ color: "#64748B", fontSize: 13, marginTop: 6 }}>Loading interactive templates securely...</p>
      </div>
    );
  }

  if (!order || !product) {
    return (
      <div style={{ minHeight: "100vh", background: "#06060A", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ 
          maxWidth: 400, 
          width: "100%", 
          background: "rgba(255,255,255,0.02)", 
          border: "1px solid rgba(255,255,255,0.06)", 
          borderRadius: 24, 
          padding: "40px 32px", 
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
        }}>
          <AlertTriangleSVG size={44} color="#EF4444" />
          <h2 style={{ fontWeight: 900, color: "#F8FAFC", fontSize: 20, letterSpacing: -0.5, marginTop: 20 }}>Order Not Found</h2>
          <p style={{ color: "#64748B", fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
            This custom link may be invalid, deleted by the owner, or requires a correct URL sequence.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
            <Link 
              href="/my-orders" 
              style={{ 
                padding: "12px", 
                borderRadius: 12, 
                background: "linear-gradient(135deg, #7C3AED, #4F46E5)", 
                color: "#FFF", 
                fontWeight: 800, 
                fontSize: 14, 
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)"
              }}
            >
              Go to My Orders Section
            </Link>
            <Link 
              href="/" 
              style={{ 
                padding: "12px", 
                borderRadius: 12, 
                background: "transparent", 
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#94A3B8", 
                fontWeight: 700, 
                fontSize: 14, 
                textDecoration: "none"
              }}
            >
              Browse Gift Catalogue
            </Link>
          </div>
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
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* For Unfinalized Pages: Warning Banner */}
      {showBanner && !isFinalized && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 300,
          background: "rgba(31, 10, 26, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1.5px solid rgba(239, 68, 68, 0.3)",
          padding: "12px 24px",
          display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}>
          <span style={{ color: "#EF4444", display: "flex", alignItems: "center" }}>
            <InfoCircleSVG size={18} color="#EF4444" />
          </span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontWeight: 800, fontSize: 13, color: "#F8FAFC", margin: 0 }}>
              Draft Mode Preview
            </p>
            <p style={{ fontSize: 11, color: "#A1A1AA", marginTop: 2, margin: 0 }}>
              This page has not been finalized yet. Go back to personalizer to complete your gift details.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link 
              href={`/edit/${orderId}`} 
              style={{ 
                background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                color: "#FFF",
                padding: "8px 16px", 
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 10px rgba(124,58,237,0.2)"
              }}
            >
              <PenSVG size={12} />
              Edit Personalization
            </Link>
            <button
              onClick={() => setShowBanner(false)}
              aria-label="Close banner"
              style={{ 
                background: "none", 
                border: "none", 
                color: "#64748B", 
                cursor: "pointer", 
                fontSize: 18, 
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* For Finalized Pages: Full Width Dark Blue Header */}
      {isFinalized && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 300,
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "10px 24px",
          display: "flex", alignItems: "center", gap: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)"
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 900, color: "#F8FAFC", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
              {product.name.replace(/[\u{1F000}-\u{1FFFF}]/gu,"").trim()}
            </p>
            <p style={{ fontSize: 11, color: "#64748B", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0, fontWeight: 600 }}>
              Ordered by: {order.buyerName}
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                await navigator.share({ title: `A gift for you`, url: pageUrl });
              } catch {
                copyLink();
              }
            }}
            style={{
              background: copied ? "#10B981" : "linear-gradient(135deg, #7C3AED, #4F46E5)",
              color: "#FFF",
              padding: "8px 16px", 
              borderRadius: 8,
              fontSize: 12, 
              fontWeight: 800,
              gap: 6, 
              display: "flex", 
              alignItems: "center",
              border: "none",
              cursor: "pointer",
              boxShadow: copied ? "0 4px 10px rgba(16,185,129,0.2)" : "0 4px 10px rgba(124,58,237,0.2)",
              transition: "all 0.2s"
            }}
          >
            {copied ? <CheckSVG size={12} /> : <ShareSVG size={12} />}
            {copied ? "Link Copied" : "Share surprise"}
          </button>
        </div>
      )}

      {/* The actual personalized page content */}
      <div style={{ paddingTop: (!isFinalized && showBanner) ? 62 : 0 }}>
        {renderFinalTemplate(product.id, mergedData)}
      </div>
    </div>
  );
}
