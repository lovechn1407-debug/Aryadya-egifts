"use client";
import { use, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProduct } from "@/lib/data";
import BirthdayMagicBox from "@/components/templates/BirthdayMagicBox";
import SweetApologyBox from "@/components/templates/SweetApologyBox";
import BirthdayBliss from "@/components/templates/BirthdayBliss/BirthdayBliss";
import MyLoveUniverse from "@/components/templates/MyLoveUniverse/MyLoveUniverse";
import Link from "next/link";
import { notFound } from "next/navigation";

function renderTemplate(productId: string, customData: Record<string, string>, autoPlay?: boolean) {
  switch (productId) {
    case "my-love-s-universe":
      return <MyLoveUniverse customData={customData} autoPlay={autoPlay} />;
    case "birthday-bliss-microsite":
      return <BirthdayBliss customData={customData} autoPlay={autoPlay} />;
    case "birthday-magic-box":
      return <BirthdayMagicBox customData={customData} autoPlay={autoPlay} />;
    case "sweet-apology-box":
      return <SweetApologyBox customData={customData} autoPlay={autoPlay} />;
    default:
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#fff" }}>
          <p>Template not found.</p>
        </div>
      );
  }
}

function PreviewContent({ productId }: { productId: string }) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "1";
  const product = getProduct(productId);

  if (!product) return notFound();

  const defaultData: Record<string, string> = {};
  product.slides.forEach(sl => sl.fields.forEach(f => { defaultData[f.id] = f.defaultValue; }));

  if (isEmbed) {
    // Embed mode: no top bar, auto-play slides, no padding
    return renderTemplate(productId, defaultData, true);
  }

  return (
    <div style={{ position: "relative" }}>
      {/* ── Page Loader Overlay ── */}
      {isNavigating && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <style>{`
            @keyframes simple-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "3px solid #E2E8F0",
            borderTopColor: "#7C3AED",
            animation: "simple-spin 0.8s linear infinite"
          }} />
        </div>
      )}

      {/* Top bar overlay */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: "linear-gradient(135deg,#FF2D78,#9B59FC)",
        padding: "0 12px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 8, height: 46,
        boxShadow: "0 2px 20px rgba(255,45,120,0.4)",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1, overflow: "hidden" }}>
          <Link 
            href="/" 
            onClick={(e) => {
              e.preventDefault();
              setIsNavigating(true);
              router.push("/");
            }}
            style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: 12, fontWeight: 600, flexShrink: 0 }}
          >
            ← Back
          </Link>
          <span style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>|</span>
          <span style={{
            color: "#fff", fontWeight: 700, fontSize: 12,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {product.name.replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim() || product.name}
          </span>
        </div>
        <Link
          href={`/order/${productId}`}
          onClick={(e) => {
            e.preventDefault();
            setIsNavigating(true);
            router.push(`/order/${productId}`);
          }}
          style={{
            flexShrink: 0,
            background: "rgba(255,255,255,0.22)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: 999,
            padding: "6px 12px",
            fontWeight: 700,
            fontSize: 11,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Buy — ₹{Math.floor(product.price / 100)}
        </Link>
      </div>

      <div style={{ paddingTop: 46 }}>
        {renderTemplate(productId, defaultData, false)}
      </div>
    </div>
  );
}

export default function PreviewPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  return (
    <Suspense fallback={null}>
      <PreviewContent productId={productId} />
    </Suspense>
  );
}
