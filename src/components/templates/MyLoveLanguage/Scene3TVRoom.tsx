import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ContinueButton from "./ContinueButton";
import { useMllData, useMllContext, ET } from "./MllDataContext";

export default function Scene3TVRoom({ onNext }: { onNext: () => void }) {
  const data = useMllData();
  const { editMode } = useMllContext();
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
      setTip("▶ PLAY");
    } else {
      v.pause();
      setPlaying(false);
      setTip("⏸ PAUSE");
    }
    setTimeout(() => setTip(null), 900);
  };

  // Heart fairy lights coordinates along the wire curve
  const fairyLights = [
    { left: 15, top: 22 },
    { left: 30, top: 32 },
    { left: 45, top: 26 },
    { left: 60, top: 27 },
    { left: 75, top: 32 },
    { left: 90, top: 20 },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at center, #1b0a1a 0%, #050106 100%)",
        overflow: "hidden",
      }}
    >
      {/* Pulsing Pink Ambient Glow behind the TV */}
      <motion.div
        animate={playing ? { scale: [1, 1.06, 1], opacity: [0.18, 0.28, 0.18] } : { scale: 1, opacity: 0.05 }}
        transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "440px",
          height: "320px",
          background: "radial-gradient(circle, rgba(255, 105, 180, 0.45) 0%, transparent 70%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Fairy lights string wire */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: "5%",
          width: "90%",
          height: "60px",
          zIndex: 20,
          pointerEvents: "none",
        }}
        viewBox="0 0 1000 60"
        preserveAspectRatio="none"
      >
        <path d="M 0 0 Q 250 45 500 20 Q 750 45 1000 0" fill="none" stroke="#222" strokeWidth="1.5" />
      </svg>

      {/* Glowing Heart Fairy Lights */}
      {fairyLights.map((l, idx) => (
        <motion.div
          key={idx}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.08, 0.95] }}
          transition={{ duration: 2.0, repeat: Infinity, delay: idx * 0.3 }}
          style={{
            position: "absolute",
            left: `${l.left}%`,
            top: `${l.top}px`,
            transform: "translateX(-50%)",
            width: "16px",
            height: "16px",
            filter: "drop-shadow(0 0 8px rgba(255,105,180,0.85))",
            zIndex: 21,
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 24 24" fill="#FF69B4">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}

      {/* LEFT VELVET CURTAIN */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "56px",
          background: "linear-gradient(90deg, #4A0000 0%, #8B0000 45%, #6A0000 85%, #2A0000 100%)",
          boxShadow: "4px 0 16px rgba(0,0,0,0.6)",
          zIndex: 15,
        }}
      >
        {/* Left tieback */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "60%",
            width: "56px",
            height: "8px",
            background: "linear-gradient(180deg, #D4AF37, #F5D16A, #D4AF37)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            borderRadius: "0 2px 2px 0",
          }}
        />
      </div>

      {/* RIGHT VELVET CURTAIN */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "56px",
          background: "linear-gradient(-90deg, #4A0000 0%, #8B0000 45%, #6A0000 85%, #2A0000 100%)",
          boxShadow: "-4px 0 16px rgba(0,0,0,0.6)",
          zIndex: 15,
        }}
      >
        {/* Right tieback */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "60%",
            width: "56px",
            height: "8px",
            background: "linear-gradient(180deg, #D4AF37, #F5D16A, #D4AF37)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            borderRadius: "2px 0 0 2px",
          }}
        />
      </div>

      {/* RETRO VALENTINE TV CABINET & SET */}
      <div
        style={{
          position: "absolute",
          top: "23%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "250px",
          zIndex: 10,
        }}
      >
        {/* TV Wire Antennae with Heart Tips */}
        <div
          style={{
            position: "absolute",
            top: "-28px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "70px",
            height: "28px",
            pointerEvents: "none",
            zIndex: 4,
          }}
        >
          <svg width="70" height="28" viewBox="0 0 70 28">
            <path d="M 35 28 L 15 4" fill="none" stroke="#D49E8D" strokeWidth="2" />
            <path d="M 35 28 L 55 4" fill="none" stroke="#D49E8D" strokeWidth="2" />
          </svg>
          {/* Pulsing hearts on tips */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ position: "absolute", left: "9px", top: "-4px", width: "12px", height: "12px" }}
          >
            <svg viewBox="0 0 24 24" fill="#FF1493">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.55 }}
            style={{ position: "absolute", right: "9px", top: "-4px", width: "12px", height: "12px" }}
          >
            <svg viewBox="0 0 24 24" fill="#FF1493">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        </div>

        {/* TV Body Frame */}
        <div
          style={{
            width: "250px",
            height: "155px",
            background: "#0F0A0F",
            border: "8px solid #C5988A", // Rose-Gold/Brass retro frame
            borderRadius: "16px 16px 12px 12px",
            boxShadow:
              "0 12px 36px rgba(0,0,0,0.7), 0 0 30px rgba(255,105,180,0.1), inset 0 0 24px rgba(0,0,0,0.85)",
            overflow: "hidden",
            position: "relative",
            zIndex: 5,
          }}
        >
          {/* TV Screen playing memory story */}
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
            }}
          />

          {/* Interactive feedback tip */}
          <AnimatePresence>
            {tip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.75)",
                  color: "#D4AF37",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                  border: "1px solid rgba(212,175,55,0.4)",
                  letterSpacing: "0.06em",
                }}
              >
                {tip}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TV Cabinet / Stand */}
        <div
          style={{
            width: "80px",
            height: "18px",
            background: "linear-gradient(180deg, #A27B62, #6B4D39)",
            margin: "0 auto",
            borderRadius: "0 0 8px 8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
          }}
        />
        <div
          style={{
            width: "160px",
            height: "8px",
            background: "#5A3D2A",
            margin: "0 auto",
            borderRadius: "4px",
            boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
          }}
        />
      </div>

      {/* Memory Caption Text */}
      <p
        style={{
          position: "absolute",
          top: "calc(23% + 225px)",
          left: "64px",
          right: "64px",
          textAlign: "center",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "17px",
          lineHeight: 1.4,
          color: "#D4AF37",
          textShadow: "0 1px 3px rgba(0,0,0,0.6)",
        }}
      >
        <ET fid="mll_tv_caption" />
      </p>

      {/* Wood Floor Planks */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "115px",
          background:
            "repeating-linear-gradient(90deg, #4A2B15 0px, #5A361C 50px, #3A210F 51px, #4A2B15 100px)",
          boxShadow: "inset 0 10px 24px rgba(0,0,0,0.6)",
          zIndex: 3,
        }}
      />

      {/* Red Loveseat Couch Silhouette with Hearts Pillows */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "320px",
          height: "60px",
          background: "linear-gradient(180deg, #7A0A0A 0%, #4A0000 100%)",
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -8px 24px rgba(0,0,0,0.6)",
          zIndex: 8,
        }}
      >
        {/* Heart throw pillow 1 */}
        <div style={{ position: "absolute", left: "48px", top: "-18px", width: "42px", height: "42px", transform: "rotate(-12deg)", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }}>
          <svg viewBox="0 0 24 24" fill="#FF5E7E">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        {/* Heart throw pillow 2 */}
        <div style={{ position: "absolute", right: "48px", top: "-18px", width: "42px", height: "42px", transform: "rotate(12deg)", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }}>
          <svg viewBox="0 0 24 24" fill="#FF5E7E">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>

      {/* Side cabinet console block */}
      <div
        style={{
          position: "absolute",
          right: "80px",
          bottom: "105px",
          width: "60px",
          height: "8px",
          background: "#422812",
          borderRadius: "2px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
          zIndex: 4,
        }}
      />

      {/* Heart-Shaped Remote Controller */}
      <motion.button
        onClick={toggle}
        onTouchEnd={(e) => {
          e.preventDefault();
          toggle();
        }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: "absolute",
          right: "92px",
          bottom: "115px",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          zIndex: 6,
          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.4))",
        }}
        aria-label="Heart Remote"
      >
        <svg width="36" height="42" viewBox="0 0 100 100">
          {/* Heart shaped casing */}
          <path d="M50 85 C20 60, 20 35, 38 35 C44 35, 50 41, 50 47 C50 41, 56 35, 62 35 C80 35, 80 60, 50 85 Z" fill="#8B0000" stroke="#D4AF37" strokeWidth="3" />
          {/* Small button inside casing */}
          <circle cx="50" cy="50" r="10" fill={playing ? "#00FF7F" : "#FF3E3E"} stroke="#FFF" strokeWidth="2" />
        </svg>
      </motion.button>

      {showContinue && <ContinueButton onClick={onNext} />}
    </div>
  );
}
