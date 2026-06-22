import { useState } from "react";
import { motion } from "framer-motion";
import ContinueButton from "./ContinueButton";
import { SITE_DATA } from "./siteData";
import { clickSound, playSound } from "./audio";

export default function Scene1DarkRoom({ onNext }: { onNext: () => void }) {
  const [stage, setStage] = useState<"switch" | "video" | "done">("switch");
  const [flipped, setFlipped] = useState(false);

  const handleSwitch = () => {
    if (flipped) return;
    setFlipped(true);
    playSound(clickSound);
    setTimeout(() => setStage("video"), 400);
  };

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
      {stage === "switch" && (
        <>
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
            {SITE_DATA.scene1_hint}
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
        </>
      )}

      {stage === "video" && (
        <motion.video
          src={SITE_DATA.video_room}
          muted
          playsInline
          autoPlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onEnded={() => setStage("done")}
          onError={() => setTimeout(() => setStage("done"), 1500)}
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 50,
            background: "#000",
          }}
        />
      )}

      {stage === "done" && <ContinueButton onClick={onNext} />}
    </div>
  );
}
