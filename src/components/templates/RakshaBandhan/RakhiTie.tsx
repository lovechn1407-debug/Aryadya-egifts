"use client";
import { useRef, useState } from "react";
import { Burst } from "./Confetti";

const START_X = 40;
const END_X = 300;

export function RakhiTie({
  progress,
  onProgress,
  tied,
  onTied,
  editMode = false,
}: {
  progress: number;
  onProgress: (p: number) => void;
  tied: boolean;
  onTied: () => void;
  editMode?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const move = (clientX: number) => {
    if (tied || editMode) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 380;
    const p = Math.min(1, Math.max(0, (x - START_X) / (END_X - START_X)));
    if (p > progress) onProgress(p);
    if (p >= 0.99) onTied();
  };

  const effectiveProgress = editMode ? 1 : progress;
  const effectiveTied = editMode ? true : tied;

  return (
    <div style={{ position: "relative", userSelect: "none" }}>
      <svg
        ref={svgRef}
        viewBox="0 0 380 240"
        style={{
          width: "min(380px, 90vw)",
          height: 240,
          touchAction: "none",
          cursor: effectiveTied || editMode ? "default" : "grab",
          display: "block",
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
        <defs>
          <linearGradient id="raksha-skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fadcb4" />
            <stop offset="100%" stopColor="#e9bd8a" />
          </linearGradient>
          <radialGradient id="raksha-medGrad" cx="0.35" cy="0.3">
            <stop offset="0%" stopColor="#ffa757" />
            <stop offset="100%" stopColor="#e2600a" />
          </radialGradient>
        </defs>

        {/* wrist */}
        <rect
          x="20"
          y="90"
          width="340"
          height="70"
          rx="35"
          fill="url(#raksha-skinGrad)"
          stroke="#d4a870"
          strokeWidth="2"
        />

        {/* thread — main saffron */}
        <path
          d="M40 125 C90 92, 140 158, 190 125 C230 98, 250 150, 282 125"
          fill="none"
          stroke="#ff7c1a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="600"
          strokeDashoffset={600 - 600 * effectiveProgress}
        />
        {/* thread — gold shimmer */}
        <path
          d="M40 125 C90 92, 140 158, 190 125 C230 98, 250 150, 282 125"
          fill="none"
          stroke="#f5c842"
          strokeWidth="1.2"
          strokeDasharray="6 10"
          strokeDashoffset={600 - 600 * effectiveProgress}
          opacity={effectiveProgress > 0 ? 0.9 : 0}
        />

        {/* medallion */}
        <g className={effectiveTied ? "raksha-animate-glow-svg" : ""}>
          <circle cx="300" cy="125" r="32" fill="url(#raksha-medGrad)" stroke="#f5c842" strokeWidth="2.5" />
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse
              key={i}
              cx="300"
              cy="107"
              rx="7"
              ry="15"
              fill="#f5c842"
              opacity="0.9"
              transform={`rotate(${i * 60} 300 125)`}
            />
          ))}
          <circle cx="300" cy="125" r="7" fill="#fff4c2" />
        </g>

        {/* bow — appears when tied */}
        {effectiveTied && (
          <g
            style={{
              transformOrigin: "300px 168px",
              animation: "raksha-fade-in-up 0.5s ease-out both",
            }}
          >
            <ellipse cx="280" cy="172" rx="20" ry="12" fill="#e0185a" transform="rotate(-20 280 172)" />
            <ellipse cx="320" cy="172" rx="20" ry="12" fill="#e0185a" transform="rotate(20 320 172)" />
            <circle cx="300" cy="170" r="8" fill="#f5c842" />
          </g>
        )}
      </svg>

      {effectiveTied && (
        <span style={{ position: "absolute", left: "78%", top: "52%" }}>
          <Burst count={16} colors={["#ff7c1a", "#f5c842", "#e0185a"]} spread={110} />
        </span>
      )}
    </div>
  );
}
