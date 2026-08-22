"use client";
import { useRef, useState } from "react";
import { Burst } from "./Confetti";
import { RakhiDesignState, RenderRakhiMedallion, DEFAULT_RAKHI_DESIGN } from "./RakhiDesigner";

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

    // Track drag across container width
    const relX = clientX - rect.left;
    const centerPoint = rect.width * 0.5; // Center of wrist
    const startPoint = rect.width * 0.15; // Left start area

    const p = Math.min(1, Math.max(0, (relX - startPoint) / (centerPoint - startPoint)));
    if (p > progress) onProgress(p);
    if (p >= 0.98) onTied();
  };

  const effectiveProgress = editMode ? 1 : progress;
  const effectiveTied = editMode ? true : tied;

  // Medallion position: from left (18%) smoothly to wrist center (50%)
  const medallionXPercent = 18 + 32 * effectiveProgress;
  // Wrist center vertical placement on real_hand.png
  const wristYPercent = 66;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        userSelect: "none",
        width: "min(380px, 94vw)",
        height: "clamp(380px, 58vh, 520px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        touchAction: "none",
        cursor: effectiveTied || editMode ? "default" : "grab",
        margin: "0 auto",
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
      {/* 3D Vertical Real Hand Image with Bottom-to-Top Slide-Up Entrance Transition */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/templates/raksha-bandhan/real_hand.png"
        alt="Real Cartoon Hand Top View"
        className="raksha-animate-hand-slide-up"
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          maxHeight: "100%",
          maxWidth: "100%",
          objectFit: "contain",
          filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))",
          pointerEvents: "none",
          transformOrigin: "bottom center",
        }}
      />

      {/* SVG Thread & Bow Overlay across the Wrist */}
      <svg
        viewBox="0 0 380 500"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <defs>
          <linearGradient id="raksha-wristSilkThread" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f5c842" />
            <stop offset="50%" stopColor="#ff7c1a" />
            <stop offset="100%" stopColor="#e0185a" />
          </linearGradient>
        </defs>

        {/* Wrist Guide Track Line */}
        <line
          x1="60"
          y1="330"
          x2="190"
          y2="330"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="4"
          strokeDasharray="4 6"
        />

        {/* Saffron Silk Thread wrapping around wrist */}
        <path
          d={`M60 330 C 110 ${330 - 15 * effectiveProgress}, 150 ${330 + 15 * effectiveProgress}, 190 330`}
          fill="none"
          stroke="url(#raksha-wristSilkThread)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="300"
          strokeDashoffset={300 - 300 * effectiveProgress}
        />
        {/* Shimmer thread */}
        <path
          d={`M60 330 C 110 ${330 - 15 * effectiveProgress}, 150 ${330 + 15 * effectiveProgress}, 190 330`}
          fill="none"
          stroke="#fff4c2"
          strokeWidth="1.8"
          strokeDasharray="6 10"
          strokeDashoffset={300 - 300 * effectiveProgress}
          opacity={effectiveProgress > 0 ? 0.9 : 0}
        />

        {/* Bow tie ribbons when tied around wrist */}
        {effectiveTied && (
          <g
            style={{
              transformOrigin: "190px 330px",
              animation: "raksha-fade-in-up 0.5s ease-out both",
            }}
          >
            <ellipse cx="170" cy="330" rx="16" ry="9" fill="#e0185a" transform="rotate(-20 170 330)" />
            <ellipse cx="210" cy="330" rx="16" ry="9" fill="#e0185a" transform="rotate(20 210 330)" />
            <circle cx="190" cy="330" r="6" fill="#f5c842" />
          </g>
        )}
      </svg>

      {/* Dynamic Custom-Designed Rakhi Medallion (Lands directly on Wrist Center) */}
      <div
        style={{
          position: "absolute",
          left: `${medallionXPercent}%`,
          top: `${wristYPercent}%`,
          transform: "translate(-50%, -50%)",
          transition: dragging ? "none" : "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
          filter: effectiveTied
            ? "drop-shadow(0 0 20px rgba(245,200,66,0.9))"
            : "drop-shadow(0 6px 16px rgba(0,0,0,0.6))",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <RenderRakhiMedallion design={activeDesign} size={90} />
      </div>

      {/* Celebration Burst Particles directly over Wrist Center */}
      {effectiveTied && (
        <span style={{ position: "absolute", left: "50%", top: `${wristYPercent}%` }}>
          <Burst count={20} colors={["#ff7c1a", "#f5c842", "#e0185a"]} spread={120} />
        </span>
      )}
    </div>
  );
}
