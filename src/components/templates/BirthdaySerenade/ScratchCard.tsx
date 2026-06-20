"use client";
import { useEffect, useRef, useState } from "react";

export default function ScratchCard({ onRevealed }: { onRevealed: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDown = useRef(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);

    const w = rect.width;
    const h = rect.height;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#9CA3AF");
    grad.addColorStop(0.3, "#D1D5DB");
    grad.addColorStop(0.6, "#9CA3AF");
    grad.addColorStop(1, "#6B7280");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "white";
    ctx.font = "bold 18px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCRATCH HERE ✨", w / 2, h / 2);

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillText("+", x, y);
    }

    const point = (e: MouseEvent | TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      const t = "touches" in e ? e.touches[0] : (e as MouseEvent);
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    };

    const scratch = (e: MouseEvent | TouchEvent) => {
      if (!isDown.current || revealed) return;
      e.preventDefault();
      const { x, y } = point(e);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.fill();
    };
    const down = (e: MouseEvent | TouchEvent) => { isDown.current = true; scratch(e); };
    const up = () => (isDown.current = false);

    canvas.addEventListener("mousedown", down);
    canvas.addEventListener("mousemove", scratch);
    window.addEventListener("mouseup", up);
    canvas.addEventListener("touchstart", down, { passive: false });
    canvas.addEventListener("touchmove", scratch, { passive: false });
    window.addEventListener("touchend", up);

    const interval = setInterval(() => {
      if (revealed) return;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      const samples = 400;
      for (let i = 0; i < samples; i++) {
        const idx = Math.floor(Math.random() * (data.length / 4)) * 4;
        if (data[idx + 3] < 128) cleared++;
      }
      if (cleared / samples > 0.6) {
        setRevealed(true);
        let r = 0;
        const cx = w / 2;
        const cy = h / 2;
        const maxR = Math.hypot(w, h);
        const anim = () => {
          ctx.globalCompositeOperation = "destination-out";
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          r += 22;
          if (r < maxR) requestAnimationFrame(anim);
        };
        anim();
        onRevealed();
      }
    }, 200);

    const keyHandler = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !revealed) {
        e.preventDefault();
        setRevealed(true);
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillRect(0, 0, w, h);
        onRevealed();
      }
    };
    canvas.addEventListener("keydown", keyHandler);

    return () => {
      clearInterval(interval);
      canvas.removeEventListener("mousedown", down);
      canvas.removeEventListener("mousemove", scratch);
      window.removeEventListener("mouseup", up);
      canvas.removeEventListener("touchstart", down);
      canvas.removeEventListener("touchmove", scratch);
      window.removeEventListener("touchend", up);
      canvas.removeEventListener("keydown", keyHandler);
    };
  }, [onRevealed, revealed]);

  return (
    <canvas
      ref={canvasRef}
      tabIndex={0}
      role="button"
      aria-label="Scratch to reveal your gift code"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "grab", zIndex: 5 }}
    />
  );
}
