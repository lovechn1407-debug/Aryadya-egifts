import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMllContext, ET } from "./MllDataContext";
import { clickSound, playSound } from "./audio";

type Stage =
  | "switch"
  | "light_on_video"
  | "go_to_book_btn"
  | "book_showing_video"
  | "open_book_btn"
  | "book_opening_video"
  | "done";

export default function Scene1DarkRoom({ onNext }: { onNext: () => void }) {
  const { data, editMode } = useMllContext();
  const [stage, setStage] = useState<Stage>("switch");
  const [flipped, setFlipped] = useState(false);

  const handleSwitch = () => {
    if (flipped) return;
    setFlipped(true);
    playSound(clickSound);
    setTimeout(() => setStage("light_on_video"), 400);
  };

  const handleGoToBook = () => {
    playSound(clickSound);
    setStage("book_showing_video");
  };

  const handleOpenBook = () => {
    playSound(clickSound);
    setStage("book_opening_video");
  };

  // Skip video helper
  const skipVideo = (nextStage: Stage) => {
    if (nextStage === "done") {
      onNext();
    } else {
      setStage(nextStage);
    }
  };

  // Editor mode view: displays all editable text components of Scene 1 in a beautiful static view
  if (editMode) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflowY: "auto",
          padding: "40px 24px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "36px",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Section 1: Hint Text */}
          <div style={{ width: "100%" }}>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "13px",
                color: "#D4AF37",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "8px",
                opacity: 0.8,
              }}
            >
              Light Switch Hint Text
            </div>
            <p
              style={{
                fontFamily: "'Great Vibes', cursive",
                fontSize: "26px",
                color: "#FFB6C1",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              <ET fid="mll_scene1_hint" multiline />
            </p>
          </div>

          {/* Switch preview */}
          <div style={{ opacity: 0.5, transform: "scale(0.7)", margin: "-10px 0" }}>
            <svg width="140" height="200" viewBox="0 0 140 200">
              <defs>
                <linearGradient id="plate_ed" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#E8E8EC" />
                  <stop offset="50%" stopColor="#B8B8BD" />
                  <stop offset="100%" stopColor="#7A7A80" />
                </linearGradient>
                <linearGradient id="rocker_ed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FAFAFA" />
                  <stop offset="100%" stopColor="#C0C0C5" />
                </linearGradient>
              </defs>
              <rect x="10" y="10" width="120" height="180" rx="8" fill="url(#plate_ed)" stroke="#3A3A3D" strokeWidth="1.5" />
              <rect x="45" y="60" width="50" height="80" rx="6" fill="#2A2A2D" />
              <rect x="48" y="65" width="44" height="70" rx="4" fill="url(#rocker_ed)" stroke="#3A3A3D" strokeWidth="0.8" />
            </svg>
          </div>

          {/* Section 2: Go to Book Button Label */}
          <div style={{ width: "100%" }}>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "13px",
                color: "#D4AF37",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "8px",
                opacity: 0.8,
              }}
            >
              Go to Book Button Text
            </div>
            <div
              style={{
                display: "inline-block",
                padding: "4px 8px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #D4AF37 0%, #F5D16A 50%, #D4AF37 100%)",
                boxShadow: "0 0 20px rgba(212,175,55,0.4)",
                width: "90%",
              }}
            >
              <ET fid="mll_btn_go_to_book" />
            </div>
          </div>

          {/* Section 3: Open Book Button Label */}
          <div style={{ width: "100%" }}>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "13px",
                color: "#D4AF37",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "8px",
                opacity: 0.8,
              }}
            >
              Open Book Button Text
            </div>
            <div
              style={{
                display: "inline-block",
                padding: "4px 8px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #D4AF37 0%, #F5D16A 50%, #D4AF37 100%)",
                boxShadow: "0 0 20px rgba(212,175,55,0.4)",
                width: "90%",
              }}
            >
              <ET fid="mll_btn_open_book" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper component for premium gold action buttons positioned at the bottom area
  const PremiumActionButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onClick={onClick}
      onTouchEnd={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="continue-btn"
      style={{
        position: "absolute",
        bottom: `calc(50px + env(safe-area-inset-bottom))`,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "16px 36px",
        borderRadius: "999px",
        background: "linear-gradient(135deg, #D4AF37 0%, #F5D16A 50%, #D4AF37 100%)",
        color: "#1A0A0A",
        border: "none",
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 700,
        fontSize: "16px",
        letterSpacing: "0.06em",
        boxShadow: "0 0 32px rgba(212,175,55,0.6), 0 6px 20px rgba(0,0,0,0.4)",
        cursor: "pointer",
        zIndex: 100,
        animation: "goldPulse 2.4s ease-in-out infinite",
      }}
    >
      {label}
    </motion.button>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* 1. SWITCH STAGE */}
      {stage === "switch" && (
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity }}
            style={{
              fontFamily: "'Great Vibes', cursive",
              fontSize: "26px",
              color: "#FFB6C1",
              textAlign: "center",
              padding: "0 24px",
              marginBottom: "48px",
              maxWidth: "360px",
              lineHeight: 1.3,
            }}
          >
            {data.scene1_hint}
          </motion.p>

          <motion.button
            onClick={handleSwitch}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleSwitch();
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              filter: flipped
                ? "drop-shadow(0 0 30px rgba(212,175,55,0.8))"
                : "drop-shadow(0 0 12px rgba(212,175,55,0.25))",
              transition: "filter 0.4s",
            }}
            aria-label="Light switch"
          >
            <svg width="140" height="200" viewBox="0 0 140 200">
              <defs>
                <linearGradient id="plate" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#E8E8EC" />
                  <stop offset="50%" stopColor="#B8B8BD" />
                  <stop offset="100%" stopColor="#7A7A80" />
                </linearGradient>
                <linearGradient id="rocker" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FAFAFA" />
                  <stop offset="100%" stopColor="#C0C0C5" />
                </linearGradient>
              </defs>
              <rect x="10" y="10" width="120" height="180" rx="8" fill="url(#plate)" stroke="#3A3A3D" strokeWidth="1.5" />
              <rect x="20" y="20" width="100" height="160" rx="4" fill="none" stroke="#6A6A6E" strokeWidth="0.6" opacity="0.5" />
              <circle cx="22" cy="22" r="2" fill="#4A4A4D" />
              <circle cx="118" cy="22" r="2" fill="#4A4A4D" />
              <circle cx="22" cy="178" r="2" fill="#4A4A4D" />
              <circle cx="118" cy="178" r="2" fill="#4A4A4D" />
              <rect x="45" y="60" width="50" height="80" rx="6" fill="#2A2A2D" />
              <motion.rect
                x="48"
                y="65"
                width="44"
                height="70"
                rx="4"
                fill="url(#rocker)"
                stroke="#3A3A3D"
                strokeWidth="0.8"
                style={{ transformOrigin: "70px 100px" }}
                animate={{ rotate: flipped ? -10 : 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              />
            </svg>
          </motion.button>
        </div>
      )}

      {/* 2. LIGHT ON VIDEO & BUTTON STAGES */}
      {(stage === "light_on_video" || stage === "go_to_book_btn") && (
        <>
          <motion.video
            src={data.video_light_on}
            muted
            playsInline
            autoPlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onEnded={() => setStage("go_to_book_btn")}
            onError={() => setTimeout(() => setStage("go_to_book_btn"), 1500)}
            style={{
              position: "fixed",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 40,
              background: "#000",
            }}
          />
          {stage === "light_on_video" && (
            <button
              onClick={() => skipVideo("go_to_book_btn")}
              onTouchEnd={(e) => {
                e.preventDefault();
                skipVideo("go_to_book_btn");
              }}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                padding: "8px 16px",
                borderRadius: "20px",
                background: "rgba(0, 0, 0, 0.6)",
                color: "#FFF",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                cursor: "pointer",
                zIndex: 60,
                fontFamily: "'Outfit', sans-serif",
                fontSize: "14px",
              }}
            >
              Skip ➔
            </button>
          )}
          {stage === "go_to_book_btn" && (
            <AnimatePresence>
              <PremiumActionButton label={data.btn_go_to_book} onClick={handleGoToBook} />
            </AnimatePresence>
          )}
        </>
      )}

      {/* 3. BOOK SHOWING VIDEO & BUTTON STAGES */}
      {(stage === "book_showing_video" || stage === "open_book_btn") && (
        <>
          <motion.video
            src={data.video_book_showing}
            muted
            playsInline
            autoPlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onEnded={() => setStage("open_book_btn")}
            onError={() => setTimeout(() => setStage("open_book_btn"), 1500)}
            style={{
              position: "fixed",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 41,
              background: "#000",
            }}
          />
          {stage === "book_showing_video" && (
            <button
              onClick={() => skipVideo("open_book_btn")}
              onTouchEnd={(e) => {
                e.preventDefault();
                skipVideo("open_book_btn");
              }}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                padding: "8px 16px",
                borderRadius: "20px",
                background: "rgba(0, 0, 0, 0.6)",
                color: "#FFF",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                cursor: "pointer",
                zIndex: 60,
                fontFamily: "'Outfit', sans-serif",
                fontSize: "14px",
              }}
            >
              Skip ➔
            </button>
          )}
          {stage === "open_book_btn" && (
            <AnimatePresence>
              <PremiumActionButton label={data.btn_open_book} onClick={handleOpenBook} />
            </AnimatePresence>
          )}
        </>
      )}

      {/* 4. BOOK OPENING VIDEO STAGE */}
      {stage === "book_opening_video" && (
        <>
          <motion.video
            src={data.video_book_open}
            muted
            playsInline
            autoPlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onEnded={() => skipVideo("done")}
            onError={() => setTimeout(() => skipVideo("done"), 1500)}
            style={{
              position: "fixed",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 42,
              background: "#000",
            }}
          />
          {/* Skip Button */}
          <button
            onClick={() => skipVideo("done")}
            onTouchEnd={(e) => {
              e.preventDefault();
              skipVideo("done");
            }}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              padding: "8px 16px",
              borderRadius: "20px",
              background: "rgba(0, 0, 0, 0.6)",
              color: "#FFF",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              cursor: "pointer",
              zIndex: 60,
              fontFamily: "'Outfit', sans-serif",
              fontSize: "14px",
            }}
          >
            Skip ➔
          </button>
        </>
      )}
    </div>
  );
}
