"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronUp, Sparkles, Move } from "lucide-react";
import { Burst, Confetti } from "./Confetti";

interface TilakSlideProps {
  onContinue: () => void;
  d: Record<string, string>;
  editMode: boolean;
  onFieldChange?: (id: string, v: string) => void;
}

export function TilakSlide({ onContinue, d, editMode, onFieldChange }: TilakSlideProps) {
  const faceImgUrl = d.rb_face_img || "/templates/raksha-bandhan/default_brother.png";
  const targetX = Number(d.rb_tilak_x || 50);
  const targetY = Number(d.rb_tilak_y || 28);

  const [applied, setApplied] = useState(editMode);
  const [swiping, setSwiping] = useState(false);
  const startYRef = useRef<number | null>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);

  // In edit mode: click on image to set forehead target spot
  const handleFrameClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editMode || !imageFrameRef.current) return;
    const rect = imageFrameRef.current.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onFieldChange?.("rb_tilak_x", String(Math.max(10, Math.min(90, xPct))));
    onFieldChange?.("rb_tilak_y", String(Math.max(10, Math.min(90, yPct))));
  };

  // Swipe up gesture detection on view mode
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (applied || editMode) return;
    startYRef.current = e.clientY;
    setSwiping(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!swiping || startYRef.current === null || applied || editMode) return;
    const deltaY = e.clientY - startYRef.current;
    // If swiped up by more than 35px
    if (deltaY < -35) {
      setApplied(true);
      setSwiping(false);
      startYRef.current = null;
    }
  };

  const handlePointerUp = () => {
    setSwiping(false);
    startYRef.current = null;
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
      {applied && !editMode && <Confetti count={35} />}

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
        }}
      >
        Apply Tilak 🔴
      </h2>

      <p style={{ marginTop: 0, textAlign: "center", fontSize: 14, color: "#f0cfa8", marginBottom: 24 }}>
        {editMode
          ? "Tap photo below to position forehead spot for Tilak"
          : applied
          ? "Tilak applied with love & blessings ✨"
          : "Swipe up on the forehead to apply Tilak"}
      </p>

      {/* Main Face Photo Frame */}
      <div
        ref={imageFrameRef}
        onClick={handleFrameClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="raksha-glass-card"
        style={{
          position: "relative",
          width: "min(340px, 88vw)",
          height: "min(420px, 58vh)",
          borderRadius: 24,
          overflow: "hidden",
          border: "2px solid rgba(245,200,66,0.5)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.2)",
          touchAction: "none",
          cursor: applied || editMode ? "pointer" : "grab",
        }}
      >
        {/* Face Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faceImgUrl}
          alt="Sibling Face"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            userSelect: "none",
          }}
        />

        {/* Highlighted Forehead Target Spot Indicator (View Mode when not applied) */}
        {!applied && !editMode && (
          <div
            style={{
              position: "absolute",
              left: `${targetX}%`,
              top: `${targetY}%`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 15,
            }}
          >
            {/* Pulsing Target Ring */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "2px dashed #f5c842",
                background: "rgba(245,200,66,0.25)",
                boxShadow: "0 0 16px rgba(245,200,66,0.8)",
                animation: "raksha-shimmer 1.5s ease-in-out infinite",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
            </div>

            {/* Target Label */}
            <div
              style={{
                position: "absolute",
                top: 48,
                left: "50%",
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                fontSize: 10,
                fontWeight: 700,
                color: "#ffe0a0",
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(4px)",
                padding: "2px 8px",
                borderRadius: 999,
                border: "1px solid rgba(245,200,66,0.4)",
              }}
            >
              Forehead Spot 🔴
            </div>
          </div>
        )}

        {/* Animated Swipe Up Gesture Direction Hint */}
        {!applied && !editMode && (
          <div
            className="raksha-animate-slide-hint"
            style={{
              position: "absolute",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(8px)",
              padding: "8px 18px",
              borderRadius: 999,
              border: "1px solid rgba(245,200,66,0.5)",
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            <ChevronUp size={22} style={{ color: "#f5c842" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff0e0" }}>
              Swipe Up to Apply Tilak 🔴
            </span>
          </div>
        )}

        {/* Applied Tilak Mark (Red Vermillion Kumkum & Yellow Rice Grains Akshat) */}
        {applied && (
          <div
            style={{
              position: "absolute",
              left: `${targetX}%`,
              top: `${targetY}%`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 25,
              animation: "raksha-stamp-down 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          >
            <Burst count={16} colors={["#ef4444", "#f59e0b", "#facc15"]} spread={70} />

            {/* Traditional Vertical Tilak (Kumkum + Rice) */}
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
              }}
            >
              {/* Vertical Red Tilak Stroke */}
              <div
                style={{
                  width: 10,
                  height: 32,
                  borderRadius: "5px 5px 8px 8px",
                  background: "linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)",
                  boxShadow: "0 0 10px rgba(220,38,38,0.8)",
                }}
              />
              {/* Yellow Rice Grains (Akshat) scattered over tilak */}
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  display: "flex",
                  gap: 3,
                }}
              >
                <div style={{ width: 3, height: 6, borderRadius: "50%", background: "#fef08a", transform: "rotate(-15deg)" }} />
                <div style={{ width: 3, height: 6, borderRadius: "50%", background: "#ffffff", transform: "rotate(10deg)" }} />
                <div style={{ width: 3, height: 6, borderRadius: "50%", background: "#fef08a", transform: "rotate(-5deg)" }} />
              </div>
            </div>
          </div>
        )}

        {/* Pinpoint Position Marker in Edit Mode */}
        {editMode && (
          <div
            style={{
              position: "absolute",
              left: `${targetX}%`,
              top: `${targetY}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 30,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#ef4444",
                border: "2px solid #fff",
                boxShadow: "0 0 12px rgba(239,68,68,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <Move size={12} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#ffe0a0", background: "rgba(0,0,0,0.7)", padding: "1px 6px", borderRadius: 4, marginTop: 2 }}>
              Target ({targetX}%, {targetY}%)
            </span>
          </div>
        )}
      </div>

      {/* Confirmation & Continue Button */}
      {(applied || editMode) && (
        <div
          className="raksha-animate-fade-in-up raksha-glass-card"
          style={{ marginTop: 24, width: "100%", maxWidth: 360, padding: "20px 24px", textAlign: "center" }}
        >
          <Sparkles style={{ margin: "0 auto 8px", color: "#f5c842", display: "block" }} size={20} />
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.3rem",
              margin: "0 0 6px",
              background: "linear-gradient(135deg, #ffe0a0 0%, #ff7c1a 50%, #e0185a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Tilak Applied! 🔴
          </h3>
          <p style={{ marginTop: 4, fontSize: 13, color: "#f0cfa8", margin: "0 0 16px" }}>
            May protection, prosperity & happiness shine bright always.
          </p>
          <button className="raksha-btn-pill raksha-btn-pill-saffron" onClick={onContinue}>
            Continue →
          </button>
        </div>
      )}
    </section>
  );
}
