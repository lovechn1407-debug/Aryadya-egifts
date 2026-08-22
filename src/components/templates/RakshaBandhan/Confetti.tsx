"use client";
import { useMemo } from "react";

const COLORS = ["#ff7c1a", "#f5c842", "#e0185a", "#ff9d50", "#fff0a0"];

export function Confetti({ count = 40 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        color: COLORS[i % COLORS.length],
        delay: `${Math.random() * 3}s`,
        duration: `${2 + Math.random() * 2}s`,
        px: `${(Math.random() - 0.5) * 80}px`,
        pr: `${Math.random() * 720}deg`,
      })),
    [count],
  );

  return (
    <div
      style={{
        pointerEvents: "none",
        position: "fixed",
        inset: 0,
        zIndex: 20,
        overflow: "hidden",
      }}
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="raksha-petal-piece"
          style={
            {
              left: p.left,
              background: p.color,
              animationDelay: p.delay,
              animationDuration: p.duration,
              "--raksha-px": p.px,
              "--raksha-pr": p.pr,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** One-shot particle burst rendered at the parent's origin. */
export function Burst({
  count = 12,
  colors = ["#ff7c1a", "#f5c842", "#e0185a"],
  spread = 90,
}: {
  count?: number;
  colors?: string[];
  spread?: number;
}) {
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const dist = spread * (0.5 + Math.random() * 0.7);
        return {
          id: i,
          bx: `${Math.cos(angle) * dist}px`,
          by: `${Math.sin(angle) * dist}px`,
          color: colors[i % colors.length],
          size: 4 + Math.random() * 5,
        };
      }),
    [count, colors, spread],
  );

  return (
    <span
      style={{
        pointerEvents: "none",
        position: "absolute",
        left: "50%",
        top: "50%",
        zIndex: 30,
      }}
    >
      {parts.map((p) => (
        <span
          key={p.id}
          className="raksha-burst-particle"
          style={
            {
              width: p.size,
              height: p.size,
              background: p.color,
              "--raksha-bx": p.bx,
              "--raksha-by": p.by,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

export function Orbs() {
  return (
    <div
      style={{
        pointerEvents: "none",
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      <div
        className="raksha-animate-shimmer"
        style={{
          position: "absolute",
          left: -96,
          top: -96,
          height: "26rem",
          width: "26rem",
          borderRadius: "50%",
          filter: "blur(48px)",
          background:
            "radial-gradient(circle, rgba(255,124,26,0.35) 0%, transparent 70%)",
        }}
      />
      <div
        className="raksha-animate-shimmer"
        style={{
          position: "absolute",
          bottom: -128,
          right: -80,
          height: "30rem",
          width: "30rem",
          borderRadius: "50%",
          filter: "blur(48px)",
          background:
            "radial-gradient(circle, rgba(224,24,90,0.32) 0%, transparent 70%)",
          animationDelay: "1.4s",
        }}
      />
    </div>
  );
}
