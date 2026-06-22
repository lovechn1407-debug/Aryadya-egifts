import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ContinueButton from "./ContinueButton";
import { SITE_DATA } from "./siteData";

const COLORS = ["#D4AF37", "#FFB6C1", "#FFFFFF", "#FF4444", "#FF8C00", "#C084FC"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  trail: { x: number; y: number }[];
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
  trail: { x: number; y: number }[];
}

export default function Scene6Fireworks({ onNext }: { onNext: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showText, setShowText] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const w = canvas.width;
    const h = canvas.height;

    const fireworks: Firework[] = [];
    const particles: Particle[] = [];
    let rafId = 0;

    const launch = () => {
      fireworks.push({
        x: w * (0.2 + Math.random() * 0.6),
        y: h,
        targetY: h * (0.15 + Math.random() * 0.3),
        vy: 8 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        exploded: false,
        trail: [],
      });
    };

    let launchCount = 0;
    const launchInterval = setInterval(() => {
      launch();
      launchCount++;
      if (launchCount >= 9) clearInterval(launchInterval);
    }, 750);

    const tick = () => {
      ctx.fillStyle = "rgba(5,5,20,0.18)";
      ctx.fillRect(0, 0, w, h);

      for (let i = fireworks.length - 1; i >= 0; i--) {
        const f = fireworks[i];
        if (!f.exploded) {
          f.trail.push({ x: f.x, y: f.y });
          if (f.trail.length > 5) f.trail.shift();
          f.y -= f.vy;
          ctx.fillStyle = f.color;
          ctx.beginPath();
          ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
          ctx.fill();
          f.trail.forEach((t, idx) => {
            ctx.globalAlpha = idx / f.trail.length * 0.6;
            ctx.beginPath();
            ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.globalAlpha = 1;
          if (f.y <= f.targetY) {
            f.exploded = true;
            const count = 85 + Math.floor(Math.random() * 25);
            for (let k = 0; k < count; k++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 2 + Math.random() * 6;
              particles.push({
                x: f.x,
                y: f.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 90,
                color: f.color,
                trail: [],
              });
            }
            fireworks.splice(i, 1);
          }
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 3) p.trail.shift();
        p.vy += 0.18;
        p.vx *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        const op = Math.max(0, p.life / 90);
        ctx.globalAlpha = op;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        p.trail.forEach((t, idx) => {
          ctx.globalAlpha = op * (idx / p.trail.length) * 0.6;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 1.5 - idx * 0.3, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        if (p.life <= 0) particles.splice(i, 1);
      }

      rafId = requestAnimationFrame(tick);
    };
    tick();

    const t1 = setTimeout(() => setShowText(true), 2000);
    const t2 = setTimeout(() => setShowContinue(true), 7000);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(launchInterval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#05051a", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
      {showText && (
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          style={{
            position: "fixed",
            top: "40%",
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "'Great Vibes', cursive",
            fontSize: "32px",
            color: "#D4AF37",
            textShadow: "0 0 24px rgba(212,175,55,0.6)",
            zIndex: 20,
            pointerEvents: "none",
            margin: 0,
          }}
        >
          {SITE_DATA.fireworks_text}
        </motion.h2>
      )}
      {showContinue && <ContinueButton onClick={onNext} />}
    </div>
  );
}
