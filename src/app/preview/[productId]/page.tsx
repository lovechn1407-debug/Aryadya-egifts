"use client";
import { use, Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProduct } from "@/lib/data";
import BirthdayMagicBox from "@/components/templates/BirthdayMagicBox";
import SweetApologyBox from "@/components/templates/SweetApologyBox";
import BirthdayBliss from "@/components/templates/BirthdayBliss/BirthdayBliss";
import MyLoveUniverse from "@/components/templates/MyLoveUniverse/MyLoveUniverse";
import LoversEnchantedJourney from "@/components/templates/LoversEnchantedJourney/LoversEnchantedJourney";
import RoyalWedding from "@/components/templates/RoyalWedding/RoyalWedding";
import RoyalWedding2 from "@/components/templates/RoyalWedding/RoyalWedding2";
import Link from "next/link";
import { notFound } from "next/navigation";

function renderTemplate(productId: string, customData: Record<string, string>, autoPlay?: boolean) {
  switch (productId) {
    case "lovers-enchanted-journey":
      return <LoversEnchantedJourney customData={customData} autoPlay={autoPlay} />;
    case "my-love-s-universe":
      return <MyLoveUniverse customData={customData} autoPlay={autoPlay} />;
    case "birthday-bliss-microsite":
      return <BirthdayBliss customData={customData} autoPlay={autoPlay} />;
    case "birthday-magic-box":
      return <BirthdayMagicBox customData={customData} autoPlay={autoPlay} />;
    case "sweet-apology-box":
      return <SweetApologyBox customData={customData} autoPlay={autoPlay} />;
    case "royal-wedding-card":
      return <RoyalWedding customData={customData} autoPlay={autoPlay} />;
    case "royal-wedding-card-2":
      return <RoyalWedding2 customData={customData} autoPlay={autoPlay} />;
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
  const [showTip, setShowTip] = useState(true);
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "1";
  const product = getProduct(productId);
  const [dbData, setDbData] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    import("@/lib/db").then(({ getProductDB }) => {
      getProductDB(productId).then(p => {
        if (p && (p as any).previewData) {
          setDbData((p as any).previewData);
        } else {
          setDbData({});
        }
      });
    });
  }, [productId]);

  if (!product) return notFound();

  if (!dbData) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: isEmbed ? "transparent" : "#0F172A" }}>
      <div style={{ width: 30, height: 30, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#7C3AED", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const defaultData: Record<string, string> = { ...dbData };
  product.slides.forEach(sl => sl.fields.forEach(f => {
    defaultData[f.id] = defaultData[f.id] ?? f.defaultValue;
  }));

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

      {/* Guider Note */}
      {showTip && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: 100,
          padding: "10px 14px 10px 20px", color: "#F8FAFC", fontSize: 13, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          zIndex: 9999, width: "calc(100% - 32px)", maxWidth: 500, justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "none" }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span style={{ whiteSpace: "normal", textAlign: "left", lineHeight: 1.4 }}>Tip: You can always change the background song, photos, and messages when you customize!</span>
          </div>
          <button onClick={() => setShowTip(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}
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
