"use client";
import { lazy, Suspense, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MllDataContext } from "./MllDataContext";
import { SITE_DATA } from "./siteData";
import Scene1DarkRoom from "./Scene1DarkRoom";
import Scene2CollageBook from "./Scene2CollageBook";
import Scene3TVRoom from "./Scene3TVRoom";
import Scene4BeachBottle from "./Scene4BeachBottle";
import Scene5ScratchCard from "./Scene5ScratchCard";
import Scene6Fireworks from "./Scene6Fireworks";

// Lazy load Three.js heavy scenes
const Scene7RingBox = lazy(() => import("./Scene7RingBox"));
const Scene8FinalLetter = lazy(() => import("./Scene8FinalLetter"));

// Product CSS injected as a scoped style tag — never pollutes global styles
const PRODUCT_CSS = `
@keyframes goldPulse {
  0%, 100% { box-shadow: 0 0 24px rgba(212,175,55,0.5), 0 4px 16px rgba(0,0,0,0.3); }
  50% { box-shadow: 0 0 40px rgba(212,175,55,0.85), 0 4px 20px rgba(0,0,0,0.35); }
}
@keyframes twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}
@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  30% { transform: scale(1.15); }
  60% { transform: scale(0.95); }
}
@keyframes goldFloat {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.7; }
  90% { opacity: 0.7; }
  100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
}
@keyframes flashFade {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
`;

function Fallback() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#1A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#D4AF37",
        fontFamily: "'Great Vibes', cursive",
        fontSize: "28px",
      }}
    >
      Loading...
    </div>
  );
}

interface Props {
  customData?: Record<string, string>;
  editMode?: boolean;
  onFieldChange?: (id: string, value: string) => void;
  forcedSlide?: number;
  autoPlay?: boolean;
}

export default function MyLoveLanguage({
  customData = {},
  autoPlay = false,
  editMode = false,
  onFieldChange,
  forcedSlide,
}: Props) {
  const [scene, setScene] = useState(1);
  const next = () => setScene((s) => Math.min(8, s + 1));

  // AutoPlay cycling for homepage product frame preview
  useEffect(() => {
    if (autoPlay) {
      setScene(1);
      const interval = setInterval(() => {
        setScene((prev) => (prev >= 8 ? 1 : prev + 1));
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [autoPlay]);

  // Editor forced slide sync: MLL_SLIDES uses n=0..7 → scene 1..8
  useEffect(() => {
    if (editMode && forcedSlide !== undefined) {
      setScene(forcedSlide + 1);
    }
  }, [forcedSlide, editMode]);

  // Build merged data: SITE_DATA defaults overridden by customData field values
  const mergedData = {
    ...SITE_DATA,
    rawCustomData: customData,
    scene1_hint: customData.mll_scene1_hint ?? SITE_DATA.scene1_hint,
    video_light_on: customData.mll_video_light_on ?? SITE_DATA.video_light_on,
    video_book_showing: customData.mll_video_book_showing ?? SITE_DATA.video_book_showing,
    video_book_open: customData.mll_video_book_open ?? SITE_DATA.video_book_open,
    btn_go_to_book: customData.mll_btn_go_to_book ?? SITE_DATA.btn_go_to_book,
    btn_open_book: customData.mll_btn_open_book ?? SITE_DATA.btn_open_book,
    book_author: customData.mll_book_author ?? SITE_DATA.book_author,
    page_text: [
      customData.mll_page1 ?? SITE_DATA.page_text[0],
      customData.mll_page2 ?? SITE_DATA.page_text[1],
      customData.mll_page3 ?? SITE_DATA.page_text[2],
      customData.mll_page4 ?? SITE_DATA.page_text[3],
    ],
    video_story: customData.mll_video_story ?? SITE_DATA.video_story,
    tv_caption: customData.mll_tv_caption ?? SITE_DATA.tv_caption,
    shake_hint: customData.mll_shake_hint ?? SITE_DATA.shake_hint,
    bottle_message: customData.mll_bottle_message ?? SITE_DATA.bottle_message,
    scratch_message: customData.mll_scratch_message ?? SITE_DATA.scratch_message,
    fireworks_text: customData.mll_fireworks_text ?? SITE_DATA.fireworks_text,
    proposal_question: customData.mll_proposal_question ?? SITE_DATA.proposal_question,
    no_button_text: customData.mll_no_button_text ?? SITE_DATA.no_button_text,
    final_letter: customData.mll_final_letter ?? SITE_DATA.final_letter,
  };

  const onNext = (autoPlay || editMode) ? () => {} : next;

  const renderScene = () => {
    switch (scene) {
      case 1: return <Scene1DarkRoom key="s1" onNext={onNext} />;
      case 2: return <Scene2CollageBook key="s2" onNext={onNext} />;
      case 3: return <Scene3TVRoom key="s3" onNext={onNext} />;
      case 4: return <Scene4BeachBottle key="s4" onNext={onNext} />;
      case 5: return <Scene5ScratchCard key="s5" onNext={onNext} />;
      case 6: return <Scene6Fireworks key="s6" onNext={onNext} />;
      case 7:
        return (
          <Suspense key="s7" fallback={<Fallback />}>
            <Scene7RingBox onNext={onNext} />
          </Suspense>
        );
      case 8:
        return (
          <Suspense key="s8" fallback={<Fallback />}>
            <Scene8FinalLetter />
          </Suspense>
        );
      default: return null;
    }
  };

  return (
    <MllDataContext.Provider value={{ data: mergedData, editMode, onFieldChange }}>
      {/* Inject product CSS without touching global styles */}
      <style dangerouslySetInnerHTML={{ __html: PRODUCT_CSS }} />
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Outfit:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ position: "fixed", inset: 0 }}
          >
            {renderScene()}
          </motion.div>
        </AnimatePresence>
      </div>
    </MllDataContext.Provider>
  );
}
