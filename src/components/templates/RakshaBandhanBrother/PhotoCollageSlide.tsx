"use client";
import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, Sparkles, Trash2 } from "lucide-react";
import { Burst, Confetti } from "../RakshaBandhan/Confetti";
import ImageUploader from "@/components/ImageCropperUploader";

interface PhotoCollageSlideProps {
  onContinue: () => void;
  d: Record<string, string>;
  editMode: boolean;
  onFieldChange?: (id: string, v: string) => void;
}

export function PhotoCollageSlide({ onContinue, d, editMode, onFieldChange }: PhotoCollageSlideProps) {
  // Extract collage images from customData (rb_collage_img_1 .. rb_collage_img_8)
  const defaultImages = [
    d.rb_collage_img_1 || "/templates/raksha-bandhan/default_brother.png",
  ];
  
  // Collect all non-empty collage photos
  const uploadedList: string[] = [];
  for (let i = 1; i <= 8; i++) {
    const val = d[`rb_collage_img_${i}`];
    if (val) uploadedList.push(val);
  }
  const images = uploadedList.length > 0 ? uploadedList : defaultImages;

  // View Mode: Carousel index & swipe gesture state
  const [activeIdx, setActiveIdx] = useState(0);
  const [photoCount, setPhotoCount] = useState(() => {
    let max = 1;
    for (let i = 1; i <= 8; i++) {
      if (d[`rb_collage_img_${i}`]) max = i;
    }
    return Math.max(1, max);
  });

  const startXRef = useRef<number | null>(null);

  // Swipe gesture handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (editMode) return;
    startXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (editMode || startXRef.current === null) return;
    const deltaX = e.clientX - startXRef.current;
    if (deltaX < -40 && activeIdx < images.length - 1) {
      setActiveIdx((prev) => prev + 1);
    } else if (deltaX > 40 && activeIdx > 0) {
      setActiveIdx((prev) => prev - 1);
    }
    startXRef.current = null;
  };

  const addPhotoSlot = () => {
    if (photoCount < 8) {
      setPhotoCount((prev) => prev + 1);
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
        Brotherhood Memories 📸
      </h2>

      <p style={{ marginTop: 0, textAlign: "center", fontSize: 14, color: "#f0cfa8", marginBottom: 20 }}>
        {editMode
          ? "Upload cherished photos of you and Bhaiya"
          : `Swipe to view memory ${activeIdx + 1} of ${images.length}`}
      </p>

      {/* WEB EDITOR MODE: Multiple Photo Upload Slots */}
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
            maxHeight: "50vh",
            overflowY: "auto",
            border: "1px solid rgba(245,200,66,0.4)",
          }}
        >
          <label style={{ fontSize: 12, fontWeight: 700, color: "#ffe0a0" }}>
            Collage Photos ({photoCount} slots):
          </label>

          {Array.from({ length: photoCount }).map((_, idx) => {
            const fid = `rb_collage_img_${idx + 1}`;
            return (
              <div
                key={fid}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#f0cfa8" }}>
                    Photo #{idx + 1}
                  </span>
                </div>
                <ImageUploader
                  fid={fid}
                  data={d}
                  onChange={onFieldChange}
                  defaultSrc="/templates/raksha-bandhan/default_brother.png"
                  aspect={3 / 4}
                />
              </div>
            );
          })}

          {photoCount < 8 && (
            <button
              onClick={addPhotoSlot}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px",
                borderRadius: 12,
                border: "1px dashed #f5c842",
                background: "rgba(245,200,66,0.1)",
                color: "#ffe0a0",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                marginTop: 4,
              }}
            >
              <Plus size={16} /> Add Another Photo Slot
            </button>
          )}
        </div>
      )}

      {/* VIEWING SITE MODE: Interactive Swipeable Photo Carousel */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
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
          cursor: "grab",
          userSelect: "none",
        }}
      >
        {/* Active Photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[activeIdx] || images[0]}
          alt={`Memory ${activeIdx + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "all 0.3s ease-out",
          }}
        />

        {/* Carousel Navigation Arrows */}
        {!editMode && images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
              disabled={activeIdx === 0}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.55)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                opacity: activeIdx === 0 ? 0.3 : 1,
                cursor: activeIdx === 0 ? "default" : "pointer",
                zIndex: 20,
              }}
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={() => setActiveIdx((prev) => Math.min(images.length - 1, prev + 1))}
              disabled={activeIdx === images.length - 1}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.55)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                opacity: activeIdx === images.length - 1 ? 0.3 : 1,
                cursor: activeIdx === images.length - 1 ? "default" : "pointer",
                zIndex: 20,
              }}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 6,
              zIndex: 20,
              background: "rgba(0,0,0,0.6)",
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            {images.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setActiveIdx(idx)}
                style={{
                  width: activeIdx === idx ? 16 : 8,
                  height: 8,
                  borderRadius: 999,
                  background: activeIdx === idx ? "#f5c842" : "rgba(255,255,255,0.4)",
                  transition: "all 0.25s ease-out",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div
        className="raksha-animate-fade-in-up raksha-glass-card"
        style={{ marginTop: 24, width: "100%", maxWidth: 360, padding: "18px 24px", textAlign: "center" }}
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
          Special Memories 📸
        </h3>
        <p style={{ marginTop: 2, fontSize: 13, color: "#f0cfa8", margin: "0 0 16px" }}>
          Unforgettable moments shared together forever.
        </p>
        <button className="raksha-btn-pill raksha-btn-pill-saffron" onClick={onContinue}>
          Continue →
        </button>
      </div>
    </section>
  );
}
