import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ContinueButton from "./ContinueButton";
import { SITE_DATA } from "./siteData";
import { corkPop, playSound } from "./audio";

const stars = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 60,
  size: 2 + Math.random() * 2,
  delay: Math.random() * 4,
  dur: 2 + Math.random() * 3,
}));

export default function Scene4BeachBottle({ onNext }: { onNext: () => void }) {
  const [opened, setOpened] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);

  useEffect(() => {
    if (opened) return;
    let handler: ((e: DeviceMotionEvent) => void) | null = null;
    const attach = () => {
      handler = (e) => {
        const a = e.accelerationIncludingGravity;
        if (!a) return;
        const m = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
        if (m > 22) trigger();
      };
      window.addEventListener("devicemotion", handler);
    };
    const anyDM = (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> });
    if (typeof anyDM.requestPermission !== "function") {
      attach();
    }
    return () => {
      if (handler) window.removeEventListener("devicemotion", handler);
    };
  }, [opened]);

  const requestMotion = async () => {
    setPermissionAsked(true);
    const anyDM = (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> });
    if (typeof anyDM.requestPermission === "function") {
      try {
        const r = await anyDM.requestPermission();
        if (r === "granted") {
          const handler = (e: DeviceMotionEvent) => {
            const a = e.accelerationIncludingGravity;
            if (!a) return;
            const m = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
            if (m > 22) trigger();
          };
          window.addEventListener("devicemotion", handler);
        }
      } catch {
        // ignore
      }
    }
  };

  const trigger = () => {
    if (opened) return;
    setOpened(true);
    playSound(corkPop);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "linear-gradient(180deg, #0A0A2E 0%, #1B1B4B 60%, #2D1F3D 100%)",
        overflow: "hidden",
      }}
    >
      {/* Stars */}
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: "#FFF",
            borderRadius: "50%",
            opacity: 0.2,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            boxShadow: "0 0 4px #FFF",
          }}
        />
      ))}

      {/* Moon */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          right: "12%",
          width: "60px",
          height: "60px",
          background: "radial-gradient(circle at 40% 40%, #FFF, #E8E8FF)",
          borderRadius: "50%",
          boxShadow: "0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.2)",
        }}
      />

      {/* Waves */}
      <svg
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          bottom: "70px",
          left: 0,
          width: "100%",
          height: "150px",
        }}
      >
        <motion.path
          d="M0,100 C360,40 720,160 1440,80 L1440,200 L0,200 Z"
          fill="#0D3340"
          animate={{ x: [0, -40, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,120 C360,60 720,180 1440,100 L1440,200 L0,200 Z"
          fill="#1B4F5A"
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Beach sand */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "70px",
          background: "linear-gradient(180deg, #D4B896, #A0805A)",
        }}
      />

      {/* Bottle */}
      <motion.button
        onClick={() => {
          if (!permissionAsked) void requestMotion();
          trigger();
        }}
        animate={opened ? { rotate: [0, -8, 8, -5, 5, 0], y: 0 } : { y: [0, -12, 0] }}
        transition={opened ? { duration: 0.5 } : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "32%",
          left: "50%",
          transform: "translateX(-50%)",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          filter: opened ? "drop-shadow(0 0 30px rgba(150,220,230,0.7))" : "drop-shadow(0 0 12px rgba(150,220,230,0.3))",
        }}
      >
        <svg width="100" height="220" viewBox="0 0 100 220">
          <defs>
            <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9ECFD6" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#C8E5E8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7AB8C2" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {/* Cork */}
          <motion.g
            animate={opened ? { y: -180, opacity: 0 } : {}}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <rect x="38" y="10" width="24" height="22" rx="3" fill="#A0764A" stroke="#5A3A1A" />
            <ellipse cx="50" cy="10" rx="12" ry="3" fill="#8B6014" />
          </motion.g>
          {/* Neck */}
          <path d="M40 30 L40 60 L30 80 L30 200 Q30 215 50 215 Q70 215 70 200 L70 80 L60 60 L60 30 Z" fill="url(#glass)" stroke="#5A8088" strokeWidth="1.5" />
          {/* Parchment inside */}
          <rect x="38" y="100" width="24" height="80" rx="2" fill="#FFF8DC" opacity="0.85" transform="rotate(8 50 140)" />
        </svg>
      </motion.button>

      {/* Hint */}
      {!opened && (
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          style={{
            position: "absolute",
            top: "70%",
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "'Great Vibes', cursive",
            color: "#FFB6C1",
            fontSize: "22px",
            padding: "0 30px",
            lineHeight: 1.3,
          }}
        >
          {SITE_DATA.shake_hint}
          <br />
          <span style={{ fontSize: "14px", fontFamily: "'Outfit', sans-serif", fontStyle: "italic", opacity: 0.7 }}>
            (or tap the bottle)
          </span>
        </motion.p>
      )}

      {/* Parchment */}
      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ maxHeight: 0, opacity: 0 }}
            animate={{ maxHeight: 320, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "28%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(320px, 86vw)",
              background: "#FFF8DC",
              padding: "28px 22px 36px",
              borderRadius: "4px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.6), inset 0 0 24px rgba(180,140,80,0.25)",
              overflow: "hidden",
              textAlign: "center",
              zIndex: 10,
            }}
          >
            <p
              style={{
                fontFamily: "'Great Vibes', cursive",
                fontSize: "22px",
                color: "#8B0000",
                lineHeight: 1.3,
                margin: 0,
              }}
            >
              {SITE_DATA.bottle_message}
            </p>
            <div style={{ marginTop: "12px", fontSize: "28px" }}>❤</div>
          </motion.div>
        )}
      </AnimatePresence>

      {opened && <ContinueButton onClick={onNext} />}
    </div>
  );
}
