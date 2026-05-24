"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProductDB, getOrderDB, updateOrderCustomizationsDB, finalizeOrderDB, updateProductOverrideDB } from "@/lib/db";
import type { Order, Product } from "@/lib/data";
import BirthdayMagicBox from "@/components/templates/BirthdayMagicBox";
import SweetApologyBox from "@/components/templates/SweetApologyBox";
import BirthdayBliss from "@/components/templates/BirthdayBliss/BirthdayBliss";
import MyLoveUniverse from "@/components/templates/MyLoveUniverse/MyLoveUniverse";
import LoversEnchantedJourney from "@/components/templates/LoversEnchantedJourney/LoversEnchantedJourney";
import RoyalWedding from "@/components/templates/RoyalWedding/RoyalWedding";
import RoyalWedding2 from "@/components/templates/RoyalWedding/RoyalWedding2";
import DuduBirthday from "@/components/templates/DuduBirthday/DuduBirthday";
import Propose3 from "@/components/templates/Propose3/Propose3";
import Confess from "@/components/templates/Confess/Confess";
import QRSharePopup from "@/components/QRSharePopup";
import Link from "next/link";
import { sendFinalizationEmail } from "@/lib/email";
import { isAdminLoggedIn } from "@/lib/data";


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

const UNIVERSE_SLIDES = [
  { n: -1, label: "BG Music" },
  { n: 0, label: "Welcome" },
  { n: 1, label: "Envelope" },
  { n: 2, label: "Puzzle" },
  { n: 3, label: "Jar" },
  { n: 4, label: "Playlist" },
  { n: 5, label: "Stars" },
  { n: 6, label: "Finale" },
];

const LOVERS_SLIDES = [
  { n: 0, label: "BG Music" },
  { n: 1, label: "Room" },
  { n: 2, label: "Polaroids" },
  { n: 3, label: "Tape" },
  { n: 4, label: "Scratch" },
  { n: 5, label: "Stars" },
  { n: 6, label: "Wheel" },
  { n: 7, label: "Bottle" },
  { n: 8, label: "Garden" },
  { n: 9, label: "Finale" },
];

const WEDDING_SLIDES = [
  { n: 0, label: "BG Music" },
  { n: 1, label: "Couple" },
  { n: 2, label: "Blessings" },
  { n: 3, label: "Ceremonies" },
  { n: 4, label: "Story" },
  { n: 5, label: "Gallery" },
  { n: 6, label: "RSVP" }
];

const DUDU_BIRTHDAY_SLIDES = [
  { n: 0, label: "BG Music" },
  { n: 1, label: "Welcome" },
  { n: 2, label: "Claw Machine" },
  { n: 3, label: "Polaroids" },
  { n: 4, label: "Bake Cake" },
  { n: 5, label: "Cake Cutting" },
  { n: 6, label: "Wishing Well" },
  { n: 7, label: "Rhythm Dance" },
  { n: 8, label: "Scratch Card" },
  { n: 9, label: "Finale" }
];

const PROPOSE3_SLIDES = [
  { n: 0, label: "BG Music" },
  { n: 1, label: "Intro" },
  { n: 2, label: "Trust" },
  { n: 3, label: "Love" },
  { n: 4, label: "Mine?" },
  { n: 5, label: "Carousel" },
  { n: 6, label: "Letter" },
  { n: 7, label: "Choice" },
  { n: 8, label: "Celebration" }
];

const CONFESS_SLIDES = [
  { n: -1, label: "BG Music" },
  { n: 0, label: "Welcome" },
  { n: 1, label: "Why" },
  { n: 2, label: "Moods" },
  { n: 3, label: "Chat" },
  { n: 4, label: "Gallery" },
  { n: 5, label: "Envelope" },
  { n: 6, label: "Quiz" },
  { n: 7, label: "Promise" }
];

function getSlideList(productId: string) {
  if (productId === "lovers-enchanted-journey") return LOVERS_SLIDES;
  if (productId === "birthday-magic-box") return BIRTHDAY_SLIDES;
  if (productId === "sweet-apology-box") return APOLOGY_SLIDES;
  if (productId === "birthday-bliss-microsite") return BLISS_SLIDES;
  if (productId === "my-love-s-universe") return UNIVERSE_SLIDES;
  if (productId === "royal-wedding-card") return WEDDING_SLIDES;
  if (productId === "royal-wedding-card-2") return WEDDING_SLIDES;
  if (productId === "pastel-dudu-birthday") return DUDU_BIRTHDAY_SLIDES;
  if (productId === "propose3") return PROPOSE3_SLIDES;
  if (productId === "confess") return CONFESS_SLIDES;
  return [];
}

function renderEditorTemplate(
  productId: string,
  customData: Record<string, string>,
  onFieldChange: (id: string, val: string) => void,
  forcedSlide: number
) {
  if (productId === "lovers-enchanted-journey") {
    return (
      <LoversEnchantedJourney
        customData={customData}
        editMode={true}
        onFieldChange={onFieldChange}
        forcedSlide={forcedSlide}
      />
    );
  }
  if (productId === "my-love-s-universe") {
    return (
      <MyLoveUniverse
        customData={customData}
        editMode={true}
        onFieldChange={onFieldChange}
        forcedSlide={forcedSlide}
      />
    );
  }
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
  if (productId === "royal-wedding-card") {
    return (
      <RoyalWedding
        customData={customData}
        editMode={true}
        onFieldChange={onFieldChange}
        forcedSlide={forcedSlide}
      />
    );
  }
  if (productId === "royal-wedding-card-2") {
    return (
      <RoyalWedding2
        customData={customData}
        editMode={true}
        onFieldChange={onFieldChange}
        forcedSlide={forcedSlide}
      />
    );
  }
  if (productId === "pastel-dudu-birthday") {
    return (
      <DuduBirthday
        customData={customData}
        editMode={true}
        onFieldChange={onFieldChange}
        forcedSlide={forcedSlide}
      />
    );
  }
  if (productId === "propose3") {
    return (
      <Propose3
        customData={customData}
        editMode={true}
        onFieldChange={onFieldChange}
        forcedSlide={forcedSlide}
      />
    );
  }
  if (productId === "confess") {
    return (
      <Confess
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
  
  const isPreviewEditor = orderId.startsWith("preview_");

  const [order, setOrder] = useState<Order | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  const [activeSlide, setActiveSlide] = useState(-1);
  const [locked, setLocked] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [showFinalPanel, setShowFinalPanel] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  // Tutorial State
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (isPreviewEditor) {
          if (!isAdminLoggedIn()) {
            router.replace("/admin");
            return;
          }
          const targetId = orderId.replace("preview_", "");
          const p = await getProductDB(targetId);
          if (!p) { setLoading(false); return; }
          setProduct(p);
          
          const cust = (p as any).previewData || {};
          const defaults: Record<string, string> = { ...cust };
          p.slides.forEach(sl => sl.fields.forEach(f => {
            defaults[f.id] = cust[f.id] ?? f.defaultValue;
          }));
          setCustomizations(defaults);
          const slides = getSlideList(p.id);
          if (slides.length > 0) setActiveSlide(slides[0].n);
        } else {
          const o = await getOrderDB(orderId);
          if (!o) { setLoading(false); return; }
          setOrder(o);
          if (o.status === "finalized") setLocked(true);
          const p = await getProductDB(o.productId);
          if (!p) { setLoading(false); return; }
          setProduct(p);
          const defaults: Record<string, string> = { ...o.customizations };
          const cust = o.customizations || {};
          p.slides.forEach(sl => sl.fields.forEach(f => {
            defaults[f.id] = cust[f.id] ?? f.defaultValue;
          }));
          setCustomizations(defaults);
          const slides = getSlideList(o.productId);
          if (slides.length > 0) setActiveSlide(slides[0].n);
        }
      } catch (err) {
        console.error("Error loading editor:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, isPreviewEditor]);

  useEffect(() => {
    if (!loading && order && !locked) {
      const hasSeen = localStorage.getItem(`hasSeenTutorial_${orderId}`);
      if (!hasSeen) {
        setTutorialStep(0);
      }
    }
  }, [loading, order, locked, orderId]);

  const handleFieldChange = (id: string, val: string) => {
    setCustomizations(prev => ({ ...prev, [id]: val }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    if (isPreviewEditor) {
      const targetId = orderId.replace("preview_", "");
      await updateProductOverrideDB(targetId, { previewData: customizations });
    } else {
      await updateOrderCustomizationsDB(orderId, customizations);
    }
    setTimeout(() => { setSaving(false); setSaved(true); }, 700);
  };

  const handleFinalize = async () => {
    if (!agreed || !product) return;
    if (!isPreviewEditor && !order) return;

    setFinalizing(true);

    if (isPreviewEditor) {
      const targetId = orderId.replace("preview_", "");
      await updateProductOverrideDB(targetId, { previewData: customizations });
      setTimeout(() => {
        setFinalizing(false);
        setShowFinalPanel(false);
        setLocked(true);
        router.push("/admin/products");
      }, 1200);
      return;
    }

    await updateOrderCustomizationsDB(orderId, customizations);
    setTimeout(async () => {
      await finalizeOrderDB(orderId);
      
      const viewLink = `${window.location.origin}/view/${orderId}`;
      const { getSettingsDB } = await import("@/lib/db");
      const settings = await getSettingsDB();

      if (settings.emailServiceFinalize && order) {
        sendFinalizationEmail({
          buyer_name: order.buyerName,
          email: order.buyerEmail,
          order_id: orderId,
          product_name: product.name,
          product_emoji: product.thumbnail || "🎁",
          view_link: viewLink,
        });
      }

      setFinalizing(false);
      setShowFinalPanel(false);
      setLocked(true);
      setShowQR(true);
    }, 1200);
  };

  const renderTutorial = () => {
    if (tutorialStep === null) return null;

    const handleNext = () => {
      if (tutorialStep < 3) {
        setTutorialStep(tutorialStep + 1);
      } else {
        handleCloseTutorial();
      }
    };

    const handleCloseTutorial = () => {
      localStorage.setItem(`hasSeenTutorial_${orderId}`, "true");
      setTutorialStep(null);
    };

    const steps = [
      {
        title: "Welcome to your Web Editor! 🪄",
        text: "Let's take a quick 1-minute tour to show you how to customise this magical gift box and make it unforgettable.",
        btnText: "Let's Go! 🚀",
        style: { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "90%", maxWidth: 400, zIndex: 1000 } as React.CSSProperties,
        hasBackdrop: true,
      },
      {
        title: "Step 1: Page Navigation Tabs 📁",
        text: "Click these tabs to cycle through all the slides. Customize everything—from envelope letters to interactive card choices!",
        btnText: "Next Slide ➜",
        style: { position: "fixed", top: "150px", left: "20px", width: "90%", maxWidth: 360, zIndex: 1000 } as React.CSSProperties,
        hasBackdrop: false,
        arrow: "up-left",
      },
      {
        title: "Step 2: Interactive Customization ✍️",
        text: "Click on any text or image area inside the box workspace that has a dashed-pink outline to edit its text in real-time. Simply click outside to save!",
        btnText: "Next Step ➜",
        style: { position: "fixed", top: "55%", left: "50%", transform: "translate(-50%, -50%)", width: "90%", maxWidth: 360, zIndex: 1000 } as React.CSSProperties,
        hasBackdrop: false,
        arrow: "down",
      },
      {
        title: "Step 3: Save & Finalise! 🎁",
        text: "Your edits are saved automatically, but you can also click 'Save' manually. Once you are 100% happy, click 'Finalise' to seal the box forever and generate your permanent link!",
        btnText: "Got It! 🎉",
        style: { position: "fixed", top: "100px", right: "20px", width: "90%", maxWidth: 360, zIndex: 1000 } as React.CSSProperties,
        hasBackdrop: false,
        arrow: "up-right",
      }
    ];

    const currentStep = steps[tutorialStep];

    return (
      <>
        {/* Backdrop for welcome/workspace steps to focus attention */}
        {(currentStep.hasBackdrop || tutorialStep === 2) && (
          <div
            onClick={handleCloseTutorial}
            style={{
              position: "fixed", inset: 0, zIndex: 990,
              background: currentStep.hasBackdrop ? "rgba(10, 10, 15, 0.85)" : "rgba(10, 10, 15, 0.4)",
              backdropFilter: "blur(4px)",
              transition: "all 0.3s"
            }}
          />
        )}

        {/* Floating tooltip/card */}
        <div
          style={{
            background: "linear-gradient(145deg, #1A1A26 0%, #11111A 100%)",
            border: "1.5px solid rgba(155, 89, 252, 0.5)",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(155, 89, 252, 0.15)",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            transition: "all 0.3s ease",
            ...currentStep.style
          }}
        >
          {/* Arrow visual */}
          {currentStep.arrow === "up-left" && (
            <div className="tutorial-arrow-bounce" style={{ position: "absolute", top: -20, left: 30, color: "#9B59FC", fontSize: 24, textShadow: "0 0 10px #9B59FC" }}>▲</div>
          )}
          {currentStep.arrow === "up-right" && (
            <div className="tutorial-arrow-bounce" style={{ position: "absolute", top: -20, right: 30, color: "#9B59FC", fontSize: 24, textShadow: "0 0 10px #9B59FC" }}>▲</div>
          )}
          {currentStep.arrow === "down" && (
            <div className="tutorial-arrow-bounce" style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", color: "#9B59FC", fontSize: 24, textShadow: "0 0 10px #9B59FC" }}>▼</div>
          )}

          <div>
            <h4 style={{ fontSize: 17, fontWeight: 800, color: "#C4A3FF", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              {currentStep.title}
            </h4>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: "10px 0 0 0" }}>
              {currentStep.text}
            </p>
          </div>

          {/* Dots Indicator */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: tutorialStep === i ? "#9B59FC" : "rgba(255,255,255,0.15)",
                    transition: "all 0.3s"
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {tutorialStep < 3 && (
                <button
                  onClick={handleCloseTutorial}
                  style={{
                    background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                    fontSize: 12, cursor: "pointer", fontWeight: 600, padding: "6px 12px",
                    borderRadius: 8, transition: "color 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                style={{
                  background: "linear-gradient(135deg, #9B59FC 0%, #7928CA 100%)",
                  color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(155,89,252,0.3)", transition: "transform 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >
                {currentStep.btnText}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div style={{
          width: 50,
          height: 50,
          border: "4px solid rgba(155, 89, 252, 0.15)",
          borderTop: "4px solid #9B59FC",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
        <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 16, fontWeight: 600, letterSpacing: 0.5 }}>Loading Web Editor...</p>
      </div>
    );
  }

  if ((!isPreviewEditor && !order) || !product) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#fff", maxWidth: 440, padding: 24 }}>
          <p style={{ fontSize: 56, marginBottom: 16 }}>🔍</p>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Order Not Found</h2>
          <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            We couldn't retrieve the details for this order. It might be due to a slow network or an incorrect link. Please check your order history.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href="/" className="btn-primary" style={{ display: "inline-flex", justifyContent: "center", padding: "12px 24px", fontWeight: 700, textDecoration: "none", borderRadius: 10 }}>Go Home</Link>
            <Link href="/my-orders" style={{ display: "inline-flex", justifyContent: "center", background: "rgba(255, 255, 255, 0.08)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.15)", padding: "12px 24px", fontWeight: 700, borderRadius: 10, textDecoration: "none", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>Go to Order Section</Link>
          </div>
        </div>
      </div>
    );
  }

  const slides = getSlideList(product.id);

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(155, 89, 252, 0.7); }
          70% { box-shadow: 0 0 0 12px rgba(155, 89, 252, 0); }
          100% { box-shadow: 0 0 0 0 rgba(155, 89, 252, 0); }
        }
        .tutorial-pulse {
          animation: pulse-glow 1.6s infinite;
          border: 1.5px solid #9B59FC !important;
        }
        @keyframes bounce-arrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .tutorial-arrow-bounce {
          animation: bounce-arrow 1.2s infinite ease-in-out;
        }
      `}} />

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

          <div
            id="editor-tutorial-actions"
            className={tutorialStep === 3 ? "tutorial-pulse" : ""}
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 6,
              alignItems: "center",
              flexShrink: 0,
              padding: tutorialStep === 3 ? "4px 8px" : undefined,
              borderRadius: tutorialStep === 3 ? "8px" : undefined,
              background: tutorialStep === 3 ? "rgba(155, 89, 252, 0.15)" : undefined,
              transition: "all 0.3s"
            }}
          >
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
          <div
            id="editor-tutorial-tabs"
            className={tutorialStep === 1 ? "tutorial-pulse" : ""}
            style={{
              display: "flex",
              gap: 6,
              padding: "4px 8px 10px 8px",
              margin: "0 -8px",
              borderRadius: tutorialStep === 1 ? "8px" : undefined,
              background: tutorialStep === 1 ? "rgba(155, 89, 252, 0.15)" : undefined,
              overflowX: "auto",
              transition: "all 0.3s"
            }}
          >
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
      <div style={{ paddingTop: slides.length > 0 ? 100 : 48, pointerEvents: locked ? "none" : "auto" }}>
        {renderEditorTemplate(product.id, customizations, handleFieldChange, activeSlide)}
      </div>

      {/* ── QR SHARE POPUP ── */}
      {showQR && (
        <QRSharePopup
          url={`${typeof window !== "undefined" ? window.location.origin : ""}/view/${orderId}`}
          onClose={() => setShowQR(false)}
        />
      )}

      {/* ── INTERACTIVE TUTORIAL OVERLAY ── */}
      {renderTutorial()}
    </div>
  );
}
