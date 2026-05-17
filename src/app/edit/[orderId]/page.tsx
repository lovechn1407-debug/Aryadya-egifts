"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProductDB, getOrderDB, updateOrderCustomizationsDB, finalizeOrderDB } from "@/lib/db";
import type { Order, Product } from "@/lib/data";
import BirthdayMagicBox from "@/components/templates/BirthdayMagicBox";
import SweetApologyBox from "@/components/templates/SweetApologyBox";
import BirthdayBliss from "@/components/templates/BirthdayBliss/BirthdayBliss";
import QRSharePopup from "@/components/QRSharePopup";
import Link from "next/link";
import { sendFinalizationEmail } from "@/lib/email";


// Slide map for the top tab bar
const BIRTHDAY_SLIDES = [
  { n: 0, label: "BG Music" },
  { n: 1, label: "Welcome" },
  { n: 2, label: "Envelope" },
  { n: 3, label: "Letter" },
  { n: 4, label: "Cake" },
  { n: 5, label: "Wish" },
  { n: 6, label: "Playlist" },
  { n: 7, label: "Cards" },
  { n: 9, label: "Final" },
];

const APOLOGY_SLIDES = [
  { n: -1, label: "BG Music" },
  { n: 0, label: "Sorry" },
  { n: 1, label: "Hearts" },
  { n: 2, label: "Cards" },
  { n: 3, label: "Music" },
  { n: 4, label: "Transition" },
  { n: 5, label: "Final" },
];

const BLISS_SLIDES = [
  { n: -1, label: "BG Music" },
  { n: 0, label: "Intro" },
  { n: 1, label: "Balloons" },
  { n: 2, label: "Cake" },
  { n: 3, label: "Memories" },
  { n: 4, label: "Envelope" },
  { n: 5, label: "Letter" },
];

function getSlideList(productId: string) {
  if (productId === "birthday-magic-box") return BIRTHDAY_SLIDES;
  if (productId === "sweet-apology-box") return APOLOGY_SLIDES;
  if (productId === "birthday-bliss-microsite") return BLISS_SLIDES;
  return [];
}

function renderEditorTemplate(
  productId: string,
  customData: Record<string, string>,
  onFieldChange: (id: string, val: string) => void,
  forcedSlide: number
) {
  if (productId === "birthday-bliss-microsite") {
    return (
      <BirthdayBliss
        customData={customData}
        editMode={true}
        onFieldChange={onFieldChange}
        forcedSlide={forcedSlide}
      />
    );
  }
  if (productId === "birthday-magic-box") {
    return (
      <BirthdayMagicBox
        customData={customData}
        editMode={true}
        onFieldChange={onFieldChange}
        forcedSlide={forcedSlide}
      />
    );
  }
  if (productId === "sweet-apology-box") {
    return (
      <SweetApologyBox
        customData={customData}
        editMode={true}
        onFieldChange={onFieldChange}
        forcedSlide={forcedSlide}
      />
    );
  }
  return <div style={{ color: "#fff", padding: 40 }}>Template not found.</div>;
}

export default function EditorPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  const [activeSlide, setActiveSlide] = useState(-1);
  const [locked, setLocked] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [showFinalPanel, setShowFinalPanel] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    (async () => {
      const o = await getOrderDB(orderId);
      if (!o) return;
      setOrder(o);
      if (o.status === "finalized") setLocked(true);
      const p = await getProductDB(o.productId);
      if (!p) return;
      setProduct(p);
      const defaults: Record<string, string> = {};
      const cust = o.customizations || {};
      p.slides.forEach(sl => sl.fields.forEach(f => {
        defaults[f.id] = cust[f.id] ?? f.defaultValue;
      }));
      setCustomizations(defaults);
      const slides = getSlideList(o.productId);
      if (slides.length > 0) setActiveSlide(slides[0].n);
    })();
  }, [orderId]);

  const handleFieldChange = (id: string, val: string) => {
    setCustomizations(prev => ({ ...prev, [id]: val }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateOrderCustomizationsDB(orderId, customizations);
    setTimeout(() => { setSaving(false); setSaved(true); }, 700);
  };

  const handleFinalize = async () => {
    if (!agreed || !order || !product) return;
    setFinalizing(true);
    await updateOrderCustomizationsDB(orderId, customizations);
    setTimeout(async () => {
      await finalizeOrderDB(orderId);
      
      const viewLink = `${window.location.origin}/view/${orderId}`;
      sendFinalizationEmail({
        buyer_name: order.buyerName,
        email: order.buyerEmail,
        order_id: orderId,
        product_name: product.name,
        product_emoji: product.thumbnail || "🎁",
        view_link: viewLink,
      });

      setFinalizing(false);
      setShowFinalPanel(false);
      setLocked(true);
      setShowQR(true);
    }, 1200);
  };

  if (!order || !product) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <p style={{ fontSize: 48 }}>🔍</p>
          <h2 style={{ fontWeight: 700, marginTop: 12 }}>Order not found</h2>
          <Link href="/" className="btn-primary" style={{ display: "inline-flex", marginTop: 20 }}>Go Home</Link>
        </div>
      </div>
    );
  }

  const slides = getSlideList(product.id);

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>

      {/* ── FLOATING TOP TOOLBAR ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
        background: locked
          ? "linear-gradient(135deg,rgba(0,30,20,0.97),rgba(0,20,15,0.97))"
          : "linear-gradient(135deg,rgba(20,0,30,0.97),rgba(10,0,20,0.97))",
        backdropFilter: "blur(20px)",
        borderBottom: locked
          ? "1px solid rgba(0,217,160,0.3)"
          : "1px solid rgba(155,89,252,0.3)",
        padding: "0 16px",
      }}>
        {/* Row 1: brand + status + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 48, flexWrap: "nowrap", overflow: "hidden" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 12, flexShrink: 0 }}>← Home</Link>
          <span style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>|</span>

          {locked ? (
            <span className="badge badge-green" style={{ flexShrink: 0, fontSize: 11 }}>Finalized</span>
          ) : (
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", flexShrink: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span style={{ color: "#C4A3FF" }}>Click text</span> to edit
            </span>
          )}

          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
            {saved && !saving && (
              <span style={{ color: "#00D9A0", fontSize: 12, fontWeight: 600 }}>✓ Saved</span>
            )}
            {!locked && (
              <>
                <button className="btn-secondary" style={{ padding: "5px 10px", fontSize: 12 }}
                  onClick={handleSave} disabled={saving}>
                  {saving ? "…" : "Save"}
                </button>
                <button
                  onClick={() => setShowFinalPanel(p => !p)}
                  className="btn-primary"
                  style={{ padding: "5px 12px", fontSize: 12, background: showFinalPanel ? "#00D9A0" : undefined }}
                >
                  {showFinalPanel ? "✕" : "Finalise"}
                </button>
              </>
            )}
            {locked && (
              <Link href={`/view/${orderId}`} className="btn-primary" style={{ padding: "5px 12px", fontSize: 12 }}>
                View Page
              </Link>
            )}
          </div>
        </div>

        {/* Row 2: slide tabs */}
        {slides.length > 0 && (
          <div style={{ display: "flex", gap: 6, paddingBottom: 10, overflowX: "auto" }}>
            {slides.map(sl => (
              <button
                key={sl.n}
                onClick={() => setActiveSlide(sl.n)}
                style={{
                  padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: "1px solid",
                  borderColor: activeSlide === sl.n ? "rgba(155,89,252,0.8)" : "rgba(255,255,255,0.1)",
                  background: activeSlide === sl.n ? "rgba(155,89,252,0.25)" : "rgba(255,255,255,0.04)",
                  color: activeSlide === sl.n ? "#C4A3FF" : "rgba(255,255,255,0.5)",
                  cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
                }}
              >
                {sl.n}. {sl.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── FINALIZE PANEL (slides down from toolbar) ── */}
      {showFinalPanel && !locked && (
        <div style={{
          position: "fixed", top: 90, right: 16, zIndex: 490, width: 340,
          background: "rgba(17,17,24,0.98)", border: "1px solid rgba(255,45,120,0.25)",
          borderRadius: 20, padding: 24, boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
        }} className="fade-in-up">
          <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>🎯 Finalise Your Page</h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 16 }}>
            Once you finalise, your page is <strong style={{ color: "#fff" }}>locked permanently</strong> and a unique shareable link is generated.{" "}
            <strong style={{ color: "#FF6B6B" }}>You cannot edit after this.</strong>
          </p>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 18 }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop: 3, width: 17, height: 17, accentColor: "#FF2D78", flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
              I've reviewed all slides and I'm happy with my edits. This action is <strong style={{ color: "#fff" }}>final</strong>.
            </span>
          </label>
          <button
            className="btn-primary pulse-glow"
            style={{ width: "100%", justifyContent: "center", opacity: agreed ? 1 : 0.4, cursor: agreed ? "pointer" : "not-allowed" }}
            disabled={!agreed || finalizing}
            onClick={handleFinalize}
          >
            {finalizing ? "Finalising…" : "✅ Lock & Get My Link 🔗"}
          </button>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 12, textAlign: "center" }}>
            Order: {orderId.slice(0, 20)}…
          </p>
        </div>
      )}

      {/* ── LOCKED OVERLAY HINT ── */}
      {locked && (
        <div style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,217,160,0.15)", border: "1px solid rgba(0,217,160,0.4)",
          borderRadius: 999, padding: "10px 24px", zIndex: 490, color: "#00D9A0",
          fontSize: 14, fontWeight: 700, backdropFilter: "blur(12px)",
        }}>
          🔒 This page is finalized — no further edits allowed
        </div>
      )}

      {/* ── TEMPLATE (full page, offset top for toolbar) ── */}
      <div style={{ paddingTop: slides.length > 0 ? 88 : 48, pointerEvents: locked ? "none" : "auto" }}>
        {renderEditorTemplate(product.id, customizations, handleFieldChange, activeSlide)}
      </div>

      {/* ── QR SHARE POPUP ── */}
      {showQR && (
        <QRSharePopup
          url={`${typeof window !== "undefined" ? window.location.origin : ""}/view/${orderId}`}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
