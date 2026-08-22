"use client";
import { Burst } from "./Confetti";

export function Diya({ lit, onLight }: { lit: boolean; onLight: () => void }) {
  return (
    <button
      type="button"
      aria-label={lit ? "Diya lit" : "Light this diya"}
      onClick={() => !lit && onLight()}
      style={{
        position: "relative",
        background: "none",
        border: "none",
        padding: 0,
        cursor: lit ? "default" : "pointer",
        transition: "transform 0.3s",
        display: "inline-block",
      }}
      onMouseEnter={(e) => {
        if (!lit) e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {lit && (
        <span
          className="raksha-animate-glow"
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: "50%",
            top: 8,
            width: 24,
            height: 24,
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,190,60,0.9) 0%, transparent 70%)",
          }}
        />
      )}
      {lit && <Burst count={8} colors={["#f5c842", "#ff9d00", "#fff0a0"]} spread={55} />}

      <svg width="70" height="90" viewBox="0 0 70 90" style={{ position: "relative" }}>
        <defs>
          <linearGradient id="raksha-flameGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff5500" />
            <stop offset="60%" stopColor="#ff9d00" />
            <stop offset="100%" stopColor="#ffcc00" />
          </linearGradient>
          <linearGradient id="raksha-bowlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eda323" />
            <stop offset="100%" stopColor="#a05c00" />
          </linearGradient>
        </defs>

        {/* wick */}
        <line x1="35" y1="60" x2="35" y2="46" stroke="#5a3a10" strokeWidth="2.5" />

        {/* flame */}
        {lit && (
          <g
            className="raksha-animate-flame"
            style={{ transformOrigin: "35px 46px" }}
          >
            <path
              d="M35 12 C43 26, 47 34, 47 41 C47 50, 41 56, 35 56 C29 56, 23 50, 23 41 C23 34, 27 26, 35 12 Z"
              fill="url(#raksha-flameGrad)"
              opacity="0.95"
            />
            <path
              d="M35 26 C39 34, 41 38, 41 42 C41 47, 38 51, 35 51 C32 51, 29 47, 29 42 C29 38, 31 34, 35 26 Z"
              fill="#fff3b0"
              opacity="0.85"
            />
          </g>
        )}

        {/* bowl */}
        <path
          d="M8 62 C8 62, 14 84, 35 84 C56 84, 62 62, 62 62 Z"
          fill="url(#raksha-bowlGrad)"
          stroke="#7a4400"
          strokeWidth="1.5"
        />
        <ellipse
          cx="35"
          cy="62"
          rx="27"
          ry="7"
          fill={lit ? "#ffb43c" : "#c98a2e"}
          stroke="#a05c00"
          strokeWidth="1.5"
        />
        <ellipse cx="35" cy="87" rx="16" ry="3" fill="rgba(0,0,0,0.35)" />
      </svg>
    </button>
  );
}
