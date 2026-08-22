"use client";
import { useRef, useState } from "react";
import { Burst } from "./Confetti";
import { RakhiDesignState, RenderRakhiMedallion, DEFAULT_RAKHI_DESIGN } from "./RakhiDesigner";

const START_X = 40;
const END_X = 300;

export function RakhiTie({
  progress,
  onProgress,
  tied,
  onTied,
  editMode = false,
  design,
}: {
  progress: number;
  onProgress: (p: number) => void;
  tied: boolean;
  onTied: () => void;
  editMode?: boolean;
  design?: RakhiDesignState;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const activeDesign = design || DEFAULT_RAKHI_DESIGN;

  const move = (clientX: number) => {
    if (tied || editMode) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 380;
    const p = Math.min(1, Math.max(0, (x - START_X) / (END_X - START_X)));
    if (p > progress) onProgress(p);
    if (p >= 0.99) onTied();
  };

  const effectiveProgress = editMode ? 1 : progress;
  const effectiveTied = editMode ? true : tied;

  // Medallion position along path
  const medallionX = START_X + (END_X - START_X) * effectiveProgress;
  const medallionY = 125;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        userSelect: "none",
        width: "min(420px, 92vw)",
        height: 250,
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)",
        background: "linear-gradient(180deg, rgba(30,10,20,0.7) 0%, rgba(15,5,10,0.85) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "none",
        cursor: effectiveTied || editMode ? "default" : "grab",
      }}
      onPointerDown={(e) => {
        if (editMode) return;
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => dragging && move(e.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      {/* Cartoon Hand Top-View Background Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/templates/raksha-bandhan/cartoon_hand.png"
        alt="Cartoon Hand Top View"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.85,
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
          pointerEvents: "none",
        }}
      />

      {/* SVG Thread & Bow Overlay */}
      <svg
        viewBox="0 0 380 240"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <defs>
          <linearGradient id="raksha-saffronThread" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f5c842" />
            <stop offset="50%" stopColor="#ff7c1a" />
            <stop offset="100%" stopColor="#e0185a" />
          </linearGradient>
        </defs>

        {/* Wrist Guide Track */}
        <path
          d="M40 125 C90 92, 140 158, 190 125 C230 98, 250 150, 282 125"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="6"
          strokeDasharray="4 6"
        />

        {/* Dynamic Saffron/Silk Thread */}
        <path
          d="M40 125 C90 92, 140 158, 190 125 C230 98, 250 150, 282 125"
          fill="none"
          stroke="url(#raksha-saffronThread)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="600"
          strokeDashoffset={600 - 600 * effectiveProgress}
        />
        {/* Shimmer thread overlay */}
        <path
          d="M40 125 C90 92, 140 158, 190 125 C230 98, 250 150, 282 125"
          fill="none"
          stroke="#fff4c2"
          strokeWidth="1.5"
          strokeDasharray="6 10"
          strokeDashoffset={600 - 600 * effectiveProgress}
          opacity={effectiveProgress > 0 ? 0.9 : 0}
        />

        {/* Bow tie on wrist when tied */}
        {effectiveTied && (
          <g
            style={{
              transformOrigin: "295px 125px",
              animation: "raksha-fade-in-up 0.5s ease-out both",
            }}
          >
            <ellipse cx="275" cy="125" rx="18" ry="10" fill="#e0185a" transform="rotate(-20 275 125)" />
            <ellipse cx="315" cy="125" rx="18" ry="10" fill="#e0185a" transform="rotate(20 315 125)" />
            <circle cx="295" cy="125" r="7" fill="#f5c842" />
          </g>
        )}
      </svg>

      {/* Dynamic Custom-Designed Rakhi Medallion */}
      <div
        style={{
          position: "absolute",
          left: `${(medallionX / 380) * 100}%`,
          top: `${(medallionY / 240) * 100}%`,
          transform: "translate(-50%, -50%)",
          transition: dragging ? "none" : "all 0.2s ease-out",
          filter: effectiveTied ? "drop-shadow(0 0 16px rgba(245,200,66,0.8))" : "drop-shadow(0 6px 16px rgba(0,0,0,0.5))",
          pointerEvents: "none",
        }}
      >
        <RenderRakhiMedallion design={activeDesign} size={88} />
      </div>

      {/* Burst Particles on Tie Complete */}
      {effectiveTied && (
        <span style={{ position: "absolute", left: "76%", top: "52%" }}>
          <Burst count={18} colors={["#ff7c1a", "#f5c842", "#e0185a"]} spread={110} />
        </span>
      )}
    </div>
  );
}
