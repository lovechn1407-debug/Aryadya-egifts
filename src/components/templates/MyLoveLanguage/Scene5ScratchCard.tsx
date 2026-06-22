import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import ContinueButton from "./ContinueButton";
import { useMllData, ET } from "./MllDataContext";
import { stampSlam, playSound } from "./audio";

const W = 320;
const H = 200;

export default function Scene5ScratchCard({ onNext }: { onNext: () => void }) {
  const data = useMllData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [shake, setShake] = useState(false);
  const scratchingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "#B8960C");
    grad.addColorStop(0.4, "#F5D16A");
    grad.addColorStop(0.6, "#D4AF37");
    grad.addColorStop(1, "#9A7B0A");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "italic 18px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ Scratch to reveal ✨", W / 2, H / 2);

    const interval = setInterval(() => {
      const ctx2 = canvas.getContext("2d");
      if (!ctx2) return;
      const img = ctx2.getImageData(0, 0, W, H);
      let cleared = 0;
      const samples = 200;
      for (let i = 0; i < samples; i++) {
        const idx = (Math.floor(Math.random() * W * H)) * 4 + 3;
        if (img.data[idx] < 10) cleared++;
      }
      const pct = (cleared / samples) * 100;
      if (pct >= 65 && !revealed) {
        setRevealed(true);
        ctx2.clearRect(0, 0, W, H);
        confetti({
          particleCount: 200,
          spread: 120,
          colors: ["#D4AF37", "#FFB6C1", "#FFFFFF"],
          origin: { y: 0.5 },
        });
        playSound(stampSlam);
        setShake(true);
        setTimeout(() => setShake(false), 350);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [revealed]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (W / rect.width),
      y: (clientY - rect.top) * (H / rect.height),
    };
  };

  const scratchAt = (x: number, y: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  };

  return (
    <motion.div
      ref={containerRef}
      animate={shake ? { x: [-5, 5, -3, 3, 0] } : {}}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at center, #2D1F3D 0%, #1A0A0A 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Gold particle field */}
      {Array.from({ length: 20 }).map((_, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            bottom: `-10px`,
            color: "#D4AF37",
            fontSize: `${10 + Math.random() * 8}px`,
            opacity: 0.6,
            animation: `goldFloat ${6 + Math.random() * 2}s linear ${Math.random() * 6}s infinite`,
          }}
        >
          ✦
        </span>
      ))}

      {/* Card */}
      <div
        style={{
          position: "relative",
          width: `${W}px`,
          maxWidth: "92vw",
          height: `${H}px`,
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(212,175,55,0.3)",
          overflow: "hidden",
        }}
      >
        {/* Reveal layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#FFF8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "22px",
              color: "#8B0000",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            <ET fid="mll_scratch_message" multiline />
          </p>
        </div>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            cursor: "crosshair",
            borderRadius: "12px",
            touchAction: "none",
            display: revealed ? "none" : "block",
          }}
          onMouseDown={(e) => {
            scratchingRef.current = true;
            const p = getPos(e);
            scratchAt(p.x, p.y);
          }}
          onMouseMove={(e) => {
            if (!scratchingRef.current) return;
            const p = getPos(e);
            scratchAt(p.x, p.y);
          }}
          onMouseUp={() => (scratchingRef.current = false)}
          onMouseLeave={() => (scratchingRef.current = false)}
          onTouchStart={(e) => {
            scratchingRef.current = true;
            const p = getPos(e);
            scratchAt(p.x, p.y);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const p = getPos(e);
            scratchAt(p.x, p.y);
          }}
          onTouchEnd={() => (scratchingRef.current = false)}
        />
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ scale: 3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <SealWithText />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {revealed && <ContinueButton onClick={onNext} />}
    </motion.div>
  );
}

function SealWithText() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="seal5" cx="0.35" cy="0.35">
          <stop offset="0%" stopColor="#C62828" />
          <stop offset="100%" stopColor="#4A0000" />
        </radialGradient>
        <path id="arc" d="M 18 50 A 32 32 0 0 1 82 50" fill="none" />
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#seal5)" stroke="#3D0000" strokeWidth="1.5" />
      <path d="M50 70 C32 56, 32 40, 42 40 C46 40, 50 44, 50 48 C50 44, 54 40, 58 40 C68 40, 68 56, 50 70 Z" fill="#FFD7D7" />
      <text fill="#D4AF37" fontSize="7" fontFamily="Outfit" letterSpacing="1.5">
        <textPath href="#arc" startOffset="50%" textAnchor="middle">
          SEALED WITH LOVE
        </textPath>
      </text>
    </svg>
  );
}
