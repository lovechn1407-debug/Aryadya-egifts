import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ContinueButton from "./ContinueButton";
import { useMllData, useMllContext, ET } from "./MllDataContext";

export default function Scene3TVRoom({ onNext }: { onNext: () => void }) {
  const data = useMllData();
  const [showContinue, setShowContinue] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [tip, setTip] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowContinue(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
      setTip("▶");
    } else {
      v.pause();
      setPlaying(false);
      setTip("⏸");
    }
    setTimeout(() => setTip(null), 900);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#F5ECD7",
        overflow: "hidden",
      }}
    >
      {/* Ambient warm overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 80% 70%, rgba(255,200,120,0.35), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Left bookshelf */}
      <Bookshelf side="left" />
      <Bookshelf side="right" />

      {/* TV */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "240px",
        }}
      >
        <div
          style={{
            width: "240px",
            height: "145px",
            background: "#0A0A0A",
            border: "8px solid #1A1A1A",
            borderRadius: "6px",
            boxShadow:
              "0 6px 20px rgba(0,0,0,0.5), 0 0 30px rgba(100,150,255,0.15), inset 0 0 20px rgba(0,0,0,0.8)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <video
            ref={videoRef}
            src={data.video_story}
            muted
            autoPlay
            loop
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              background: "linear-gradient(135deg, #2a1a3a, #1a2a4a)",
            }}
          />
          <AnimatePresence>
            {tip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  top: "8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.6)",
                  color: "#FFF",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {tip}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Stand */}
        <div
          style={{
            width: "70px",
            height: "30px",
            background: "linear-gradient(180deg, #2A2A2A, #1A1A1A)",
            margin: "0 auto",
            borderRadius: "0 0 6px 6px",
          }}
        />
        <div
          style={{
            width: "130px",
            height: "6px",
            background: "#1A1A1A",
            margin: "0 auto",
            borderRadius: "3px",
          }}
        />
      </div>

      {/* Caption */}
      <p
        style={{
          position: "absolute",
          top: "calc(28% + 230px)",
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "16px",
          color: "#D4AF37",
          padding: "0 30px",
        }}
      >
        <ET fid="mll_tv_caption" />
      </p>

      {/* Floor */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "120px",
          background:
            "repeating-linear-gradient(90deg, #8B6914 0px, #A07820 40px, #7A5C10 41px, #8B6914 80px)",
          boxShadow: "inset 0 8px 16px rgba(0,0,0,0.3)",
        }}
      />

      {/* Lamp */}
      <div
        style={{
          position: "absolute",
          right: "16px",
          bottom: "120px",
          width: "60px",
          height: "180px",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "27px",
            width: "6px",
            height: "120px",
            background: "linear-gradient(90deg, #2A1A0A, #4A2A0A, #2A1A0A)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "5px",
            width: "50px",
            height: "60px",
            background: "linear-gradient(180deg, #C9A565, #8B6914)",
            clipPath: "polygon(15% 0, 85% 0, 100% 100%, 0 100%)",
            boxShadow: "0 0 40px rgba(255,200,100,0.6)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "-50px",
            width: "150px",
            height: "150px",
            background:
              "radial-gradient(circle, rgba(255,210,140,0.5) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Side table + remote */}
      <div
        style={{
          position: "absolute",
          right: "90px",
          bottom: "130px",
          width: "70px",
          height: "10px",
          background: "#5A3A1A",
          borderRadius: "2px",
        }}
      />
      <motion.button
        onClick={toggle}
        whileTap={{ scale: 0.9 }}
        style={{
          position: "absolute",
          right: "100px",
          bottom: "145px",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
        aria-label="Remote"
      >
        <svg width="40" height="64" viewBox="0 0 40 64">
          <rect x="2" y="2" width="36" height="60" rx="6" fill="#222" stroke="#000" />
          <circle cx="20" cy="14" r="4" fill="#D4AF37" />
          <rect x="10" y="24" width="20" height="6" rx="2" fill={playing ? "#4A8" : "#A44"} />
          <circle cx="14" cy="40" r="3" fill="#888" />
          <circle cx="26" cy="40" r="3" fill="#888" />
          <rect x="14" y="48" width="12" height="8" rx="2" fill="#D4AF37" />
        </svg>
      </motion.button>

      {showContinue && <ContinueButton onClick={onNext} />}
    </div>
  );
}

function Bookshelf({ side }: { side: "left" | "right" }) {
  return (
    <div
      style={{
        position: "absolute",
        [side]: 0,
        top: "5%",
        height: "75%",
        width: "70px",
        background: "linear-gradient(180deg, #3A2410, #2A1808)",
        borderRight: side === "left" ? "2px solid #1A0A05" : "none",
        borderLeft: side === "right" ? "2px solid #1A0A05" : "none",
      }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${(i + 1) * 18}%`,
            left: 0,
            right: 0,
            height: "3px",
            background: "#1A0A05",
          }}
        />
      ))}
      {[0, 1, 2, 3, 4].map((row) => (
        <div
          key={row}
          style={{
            position: "absolute",
            top: `${row * 18 + 4}%`,
            left: "6px",
            right: "6px",
            display: "flex",
            gap: "3px",
            height: "12%",
            alignItems: "flex-end",
          }}
        >
          {[0, 1, 2, 3, 4].map((b) => {
            const colors = ["#8B0000", "#D4AF37", "#3D2B2B", "#5A3A1A", "#FFB6C1", "#2D1A1A"];
            return (
              <div
                key={b}
                style={{
                  flex: 1,
                  height: `${70 + ((row * 7 + b * 11) % 30)}%`,
                  background: colors[(row * 3 + b) % colors.length],
                  borderRadius: "1px 1px 0 0",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
