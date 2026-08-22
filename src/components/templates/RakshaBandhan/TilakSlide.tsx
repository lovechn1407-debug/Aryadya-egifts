"use client";
import React, { useState, useRef } from "react";
import { ChevronUp, Sparkles, Move, ZoomIn, Sliders } from "lucide-react";
import { Burst, Confetti } from "./Confetti";
import ImageUploader from "@/components/ImageCropperUploader";

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
  const tilakSize = Number(d.rb_tilak_size || 60);

  // View Mode state: Wiping progress controlled by hand drag
  const [wipeProgress, setWipeProgress] = useState(editMode ? 100 : 0);
  const [draggingHand, setDraggingHand] = useState(false);
  const [handY, setHandY] = useState(0); // relative Y offset for sliding hand
  const isComplete = wipeProgress >= 95 || editMode;

  // Editor state: Zoom level & Target Drag state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [draggingTarget, setDraggingTarget] = useState(false);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const startDragYRef = useRef<number | null>(null);

  // Calculate & update target spot from pointer position (supports both click and smooth drag)
  const updateTargetFromPointer = (clientX: number, clientY: number) => {
    if (!imageFrameRef.current || !onFieldChange) return;
    const rect = imageFrameRef.current.getBoundingClientRect();
    const xPct = Math.round(((clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((clientY - rect.top) / rect.height) * 100);
    onFieldChange("rb_tilak_x", String(Math.max(5, Math.min(95, xPct))));
    onFieldChange("rb_tilak_y", String(Math.max(5, Math.min(95, yPct))));
  };

  // Pointer event handlers (editMode: drag target spot; viewMode: swipe hand to reveal tilak)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (editMode) {
      setDraggingTarget(true);
      e.currentTarget.setPointerCapture(e.pointerId);
      updateTargetFromPointer(e.clientX, e.clientY);
      return;
    }

    if (isComplete) return;
    startDragYRef.current = e.clientY;
    setDraggingHand(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (editMode && draggingTarget) {
      updateTargetFromPointer(e.clientX, e.clientY);
      return;
    }

    if (!draggingHand || startDragYRef.current === null || isComplete || editMode) return;
    const deltaY = startDragYRef.current - e.clientY; // Positive when dragging UP
    const maxDragPx = 100; // Drag distance required for 100% wipe
    const currentProgress = Math.min(100, Math.max(0, (deltaY / maxDragPx) * 100));

    setWipeProgress(currentProgress);
    setHandY(-deltaY);

    if (currentProgress >= 95) {
      setWipeProgress(100);
      setDraggingHand(false);
      startDragYRef.current = null;
    }
  };

  const handlePointerUp = () => {
    if (editMode) {
      setDraggingTarget(false);
      return;
    }

    setDraggingHand(false);
    startDragYRef.current = null;
    if (wipeProgress < 95) {
      // Reset if drag incomplete
      setWipeProgress(0);
      setHandY(0);
    }
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
      {isComplete && !editMode && <Confetti count={35} />}

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

      <p style={{ marginTop: 0, textAlign: "center", fontSize: 14, color: "#f0cfa8", marginBottom: 20 }}>
        {editMode
          ? "Upload sibling photo & drag pin to position forehead target spot"
          : isComplete
          ? "Tilak applied with love & blessings ✨"
          : "Slide your hand upwards over the forehead to apply Tilak"}
      </p>

      {/* Editor Controls: Image Uploader, Target Zoom & Tilak Size Slider */}
      {editMode && (
        <div
          className="raksha-glass-card"
          style={{
            width: "100%",
            maxWidth: 420,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            border: "1px solid rgba(245,200,66,0.4)",
          }}
        >
          {/* Explicit Image Uploader */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#ffe0a0", display: "block", marginBottom: 6 }}>
              Upload Sibling Photo (Hosts to ImgBB):
            </label>
            <ImageUploader
              fid="rb_face_img"
              data={d}
              onChange={onFieldChange}
              defaultSrc="/templates/raksha-bandhan/default_brother.png"
              aspect={3 / 4}
            />
          </div>

          {/* Zoom & Tilak Size Controls */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            {/* Zoom Control */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ZoomIn size={14} style={{ color: "#f5c842" }} />
              <span style={{ fontSize: 12, color: "#f0cfa8" }}>Zoom:</span>
              {[1, 1.5, 2, 2.5].map((z) => (
                <button
                  key={z}
                  onClick={() => setZoomLevel(z)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    border: "none",
                    background: zoomLevel === z ? "#ff7c1a" : "rgba(255,255,255,0.1)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  {z}x
                </button>
              ))}
            </div>

            {/* Tilak Size Slider */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Sliders size={14} style={{ color: "#f5c842" }} />
              <span style={{ fontSize: 12, color: "#f0cfa8" }}>Tilak Size:</span>
              <input
                type="range"
                min="30"
                max="100"
                value={tilakSize}
                onChange={(e) => onFieldChange?.("rb_tilak_size", e.target.value)}
                style={{ width: 80, accentColor: "#ff7c1a" }}
              />
              <span style={{ fontSize: 11, color: "#ffe0a0" }}>{tilakSize}px</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Face Photo Frame */}
      <div
        ref={imageFrameRef}
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
          cursor: editMode ? "crosshair" : isComplete ? "default" : "grab",
        }}
      >
        {/* Face Image Container with Target Zoom in Editor Mode */}
        <div
          style={{
            width: "100%",
            height: "100%",
            transition: "transform 0.25s ease-out",
            transformOrigin: `${targetX}% ${targetY}%`,
            transform: editMode ? `scale(${zoomLevel})` : "none",
          }}
        >
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
        </div>

        {/* Forehead Target Spot Indicator (View Mode when not wiped) */}
        {!isComplete && !editMode && (
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
                width: 46,
                height: 46,
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
          </div>
        )}

        {/* Animated Direction Guide Banner */}
        {!isComplete && !editMode && (
          <div
            className="raksha-animate-slide-hint"
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: "rgba(0,0,0,0.7)",
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
              Slide Hand Upwards to Apply Tilak 🔴
            </span>
          </div>
        )}

        {/* Sliding Hand Icon Follower during drag */}
        {!isComplete && !editMode && (
          <div
            style={{
              position: "absolute",
              left: `${targetX}%`,
              top: `calc(${targetY}% + 40px + ${handY}px)`,
              transform: "translateX(-50%)",
              fontSize: 32,
              filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.6))",
              zIndex: 30,
              pointerEvents: "none",
              transition: draggingHand ? "none" : "all 0.2s ease-out",
            }}
          >
            👆
          </div>
        )}

        {/* Authentic Red Tilak PNG Image without Red Glow (Clean Display) */}
        {(wipeProgress > 0 || editMode) && (
          <div
            style={{
              position: "absolute",
              left: `${targetX}%`,
              top: `${targetY}%`,
              width: tilakSize,
              height: tilakSize * 1.8,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 25,
              /* Vertical Wiping Transition: reveals Tilak PNG from bottom to top as wipeProgress increases */
              clipPath: `inset(${100 - wipeProgress}% 0 0 0)`,
              WebkitClipPath: `inset(${100 - wipeProgress}% 0 0 0)`,
              transition: draggingHand ? "none" : "clip-path 0.2s ease-out, -webkit-clip-path 0.2s ease-out",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/templates/raksha-bandhan/tilak_mark.png"
              alt="Authentic Red Tilak Mark"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        )}

        {/* Particle Burst on Full Wipe Complete */}
        {wipeProgress >= 95 && (
          <span
            style={{
              position: "absolute",
              left: `${targetX}%`,
              top: `${targetY}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 35,
              pointerEvents: "none",
            }}
          >
            <Burst count={24} colors={["#dc2626", "#f59e0b", "#facc15"]} spread={80} />
          </span>
        )}

        {/* Draggable Pinpoint Target Marker in Edit Mode */}
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
              cursor: "move",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
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
              <Move size={14} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#ffe0a0", background: "rgba(0,0,0,0.85)", padding: "2px 6px", borderRadius: 4, marginTop: 4 }}>
              Drag Target ({targetX}%, {targetY}%)
            </span>
          </div>
        )}
      </div>

      {/* Celebration & Continue Card */}
      {(isComplete || editMode) && (
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
