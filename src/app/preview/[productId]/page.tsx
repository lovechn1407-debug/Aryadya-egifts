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
          background: "rgba(10, 10, 18, 0.75)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.3s ease both",
          fontFamily: "'Nunito', 'Inter', sans-serif"
        }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes pulse-heart {
              0%, 100% { transform: scale(1) translate(-50%, -50%); opacity: 0.9; filter: drop-shadow(0 0 10px rgba(255,45,120,0.6)); }
              50% { transform: scale(1.15) translate(-50%, -50%); opacity: 0.55; filter: drop-shadow(0 0 24px rgba(233,30,140,0.9)); }
            }
            @keyframes textGlow {
              0%, 100% { opacity: 0.8; text-shadow: 0 0 10px rgba(255,255,255,0.2); }
              50% { opacity: 1; text-shadow: 0 0 20px rgba(255,45,120,0.4); }
            }
          `}</style>
          <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              position: "absolute",
              width: 100,
              height: 100,
              borderRadius: "50%",
              border: "4px solid rgba(255, 45, 120, 0.15)",
              borderTopColor: "#FF2D78",
              borderBottomColor: "#9B59FC",
              animation: "spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite"
            }} />
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 48,
              height: 48,
              transformOrigin: "top left",
              animation: "pulse-heart 1.5s ease-in-out infinite"
            }}>
              <svg viewBox="0 0 24 24" fill="#FF2D78" width="48" height="48">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
          <h3 style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: 800,
            marginTop: 24,
            letterSpacing: "0.5px",
            animation: "textGlow 2s ease-in-out infinite",
            textAlign: "center"
          }}>
            Opening Magic...
          </h3>
          <p style={{
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: 13,
            marginTop: 6,
            fontWeight: 500,
            textAlign: "center"
          }}>
            Preparing your personalised space
          </p>
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
