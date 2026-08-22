"use client";
import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Burst, Confetti, Orbs } from "../RakshaBandhan/Confetti";

export interface RakhiOption {
  id: string;
  name: string;
  badge: string;
  imgSrc: string;
}

export const RAKHI_OPTIONS: RakhiOption[] = [
  {
    id: "dietcoke",
    name: "Diet Coke Rakhi",
    badge: "🥤 Chill Vibe",
    imgSrc: "/templates/raksha-bandhan-brother/rakhi_dietcoke.png",
  },
  {
    id: "spiderman",
    name: "Spiderman Rakhi",
    badge: "🕷️ Superhero",
    imgSrc: "/templates/raksha-bandhan-brother/rakhi_spiderman.png",
  },
  {
    id: "om",
    name: "Om Silver Rakhi",
    badge: "🕉️ Divine",
    imgSrc: "/templates/raksha-bandhan-brother/rakhi_om.png",
  },
  {
    id: "traditional",
    name: "Traditional Pearl",
    badge: "🌸 Festive",
    imgSrc: "/templates/raksha-bandhan-brother/rakhi_traditional.png",
  },
];

interface RakhiTieBrotherProps {
  selectedRakhi: string;
  onSelectRakhi: (id: string) => void;
  onContinue: () => void;
  editMode: boolean;
}

export function RakhiTieBrother({
  selectedRakhi,
  onSelectRakhi,
  onContinue,
  editMode,
}: RakhiTieBrotherProps) {
  const currentOption = RAKHI_OPTIONS.find((r) => r.id === selectedRakhi) || RAKHI_OPTIONS[0];

  const [phase, setPhase] = useState<"select" | "tying" | "tied">(
    editMode ? "tied" : "select"
  );
  const [threadProgress, setThreadProgress] = useState(editMode ? 1 : 0);

  // User taps a Rakhi card to select/highlight it
  const handleSelectCard = (id: string) => {
    onSelectRakhi(id);
  };

  // User clicks the explicit "Confirm & Tie Rakhi 🎀" button
  const handleConfirmTie = () => {
    if (editMode) return;

    setPhase("tying");
    // Animate hand slide up and ribbon thread wrapping
    setTimeout(() => {
      setThreadProgress(1);
    }, 400);

    setTimeout(() => {
      setPhase("tied");
    }, 1200);
  };

  return (
    <section
      className="raksha-gradient-bg"
      style={{
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "56px 20px",
        color: "#fff0e0",
      }}
    >
      <Orbs />

      {phase === "tied" && !editMode && <Confetti count={40} />}

      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.6rem, 6vw, 2.5rem)",
          textAlign: "center",
          margin: "0 0 6px",
          background: "linear-gradient(135deg, #fff4c2 0%, #f5c842 50%, #ff9d00 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          position: "relative",
          zIndex: 10,
        }}
      >
        Tie Rakhi for Bhaiya 🎀
      </h2>

      <p
        style={{
          marginTop: 0,
          textAlign: "center",
          fontSize: 14,
          color: "#f0cfa8",
          marginBottom: 24,
          position: "relative",
          zIndex: 10,
        }}
      >
        {phase === "select"
          ? "Select your favorite Rakhi for Bhaiya and tap confirm"
          : phase === "tying"
          ? "Tying Rakhi on Bhaiya's wrist…"
          : `Tied the ${currentOption.name} with love ✨`}
      </p>

      {/* PHASE 1: Rakhi Selector Cards Grid */}
      {phase === "select" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: 380,
            zIndex: 10,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 16,
              width: "100%",
              marginBottom: 24,
            }}
          >
            {RAKHI_OPTIONS.map((rakhi) => (
              <button
                key={rakhi.id}
                onClick={() => handleSelectCard(rakhi.id)}
                className="raksha-glass-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "16px 12px",
                  borderRadius: 20,
                  border: selectedRakhi === rakhi.id ? "2px solid #f5c842" : "1px solid rgba(255,255,255,0.15)",
                  background: selectedRakhi === rakhi.id ? "rgba(245,200,66,0.22)" : "rgba(255,255,255,0.06)",
                  boxShadow: selectedRakhi === rakhi.id ? "0 0 20px rgba(245,200,66,0.4)" : "none",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  textAlign: "center",
                }}
              >
                {/* Rakhi Center Image Preview */}
                <div
                  style={{
                    position: "relative",
                    width: 76,
                    height: 76,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                    filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.5))",
                  }}
                >
                  {/* Ribbon background line */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "-10px",
                      right: "-10px",
                      height: 6,
                      background: "linear-gradient(90deg, #f5c842, #ff7c1a, #e0185a)",
                      transform: "translateY(-50%)",
                      borderRadius: 4,
                    }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rakhi.imgSrc}
                    alt={rakhi.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      position: "relative",
                      zIndex: 2,
                    }}
                  />
                </div>

                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff0e0" }}>{rakhi.name}</span>
                <span style={{ fontSize: 10, color: "#ffe0a0", marginTop: 2 }}>{rakhi.badge}</span>
              </button>
            ))}
          </div>

          {/* Explicit Confirm & Tie Rakhi Button */}
          <button
            className="raksha-btn-pill raksha-btn-pill-saffron raksha-animate-fade-in-up"
            style={{
              padding: "14px 28px",
              fontSize: 15,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 10px 25px rgba(255,124,26,0.5)",
            }}
            onClick={handleConfirmTie}
          >
            <Sparkles size={18} /> Confirm & Tie {currentOption.name} 🎀
          </button>
        </div>
      )}

      {/* PHASE 2 & 3: 3D Hand Canvas with Automatic Ribbon Tying */}
      {(phase === "tying" || phase === "tied" || editMode) && (
        <div
          style={{
            position: "relative",
            width: "min(380px, 94vw)",
            height: "clamp(380px, 58vh, 520px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            margin: "0 auto",
            zIndex: 10,
          }}
        >
          {/* 3D Hand with Slide-Up Entrance Transition */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/templates/raksha-bandhan/real_hand.png"
            alt="Real 3D Cartoon Hand"
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

          {/* SVG Thread Ribbon Wrapping across Wrist */}
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
              <linearGradient id="raksha-brotherRibbon" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f5c842" />
                <stop offset="50%" stopColor="#ff7c1a" />
                <stop offset="100%" stopColor="#e0185a" />
              </linearGradient>
            </defs>

            {/* Saffron Silk Thread wrapping around wrist */}
            <path
              d={`M90 330 C 130 ${330 - 15 * threadProgress}, 250 ${330 + 15 * threadProgress}, 290 330`}
              fill="none"
              stroke="url(#raksha-brotherRibbon)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="300"
              strokeDashoffset={300 - 300 * threadProgress}
              style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
            />
            {/* Gold highlight shimmer */}
            <path
              d={`M90 330 C 130 ${330 - 15 * threadProgress}, 250 ${330 + 15 * threadProgress}, 290 330`}
              fill="none"
              stroke="#fff4c2"
              strokeWidth="2"
              strokeDasharray="8 10"
              strokeDashoffset={300 - 300 * threadProgress}
              opacity={threadProgress > 0 ? 0.9 : 0}
            />

            {/* Ribbon Bow ties on completion */}
            {phase === "tied" && (
              <g
                style={{
                  transformOrigin: "190px 330px",
                  animation: "raksha-fade-in-up 0.5s ease-out both",
                }}
              >
                <ellipse cx="168" cy="330" rx="16" ry="9" fill="#e0185a" transform="rotate(-20 168 330)" />
                <ellipse cx="212" cy="330" rx="16" ry="9" fill="#e0185a" transform="rotate(20 212 330)" />
                <circle cx="190" cy="330" r="6" fill="#f5c842" />
              </g>
            )}
          </svg>

          {/* Chosen Rakhi Medallion Centered on Wrist */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "66%",
              transform: "translate(-50%, -50%)",
              filter: phase === "tied"
                ? "drop-shadow(0 0 20px rgba(245,200,66,0.9))"
                : "drop-shadow(0 6px 16px rgba(0,0,0,0.6))",
              pointerEvents: "none",
              zIndex: 10,
              animation: phase === "tying" ? "raksha-stamp-down 0.6s ease-out forwards" : "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentOption.imgSrc}
              alt={currentOption.name}
              style={{
                width: 90,
                height: 90,
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          {/* Particle Burst directly over Wrist Center */}
          {phase === "tied" && (
            <span style={{ position: "absolute", left: "50%", top: "66%" }}>
              <Burst count={24} colors={["#ff7c1a", "#f5c842", "#e0185a"]} spread={120} />
            </span>
          )}
        </div>
      )}

      {/* Confirmation & Change Choice Action Bar */}
      {phase === "tied" && (
        <div
          className="raksha-animate-fade-in-up raksha-glass-card"
          style={{
            marginTop: 20,
            width: "100%",
            maxWidth: 360,
            padding: "18px 24px",
            textAlign: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          <Sparkles style={{ margin: "0 auto 6px", color: "#f5c842", display: "block" }} size={20} />
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.3rem",
              margin: "0 0 4px",
              background: "linear-gradient(135deg, #ffe0a0 0%, #ff7c1a 50%, #e0185a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {currentOption.name} Tied! 🎀
          </h3>
          <p style={{ marginTop: 2, fontSize: 13, color: "#f0cfa8", margin: "0 0 16px" }}>
            Tied with endless love, laughter & sibling blessings!
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!editMode && (
              <button
                onClick={() => setPhase("select")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Change Rakhi
              </button>
            )}
            <button
              className="raksha-btn-pill raksha-btn-pill-saffron"
              style={{ flex: 1.5, padding: "10px" }}
              onClick={onContinue}
            >
              Continue →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
