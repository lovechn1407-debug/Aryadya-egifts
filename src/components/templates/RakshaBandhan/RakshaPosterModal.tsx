"use client";
import React, { useRef, useState, useEffect } from "react";
import { Download, Share2, X, Sparkles } from "lucide-react";
import html2canvas from "html2canvas";
import { RakhiDesignState, RenderRakhiMedallion, DEFAULT_RAKHI_DESIGN } from "./RakhiDesigner";

interface RakshaPosterModalProps {
  d: Record<string, string>;
  design?: RakhiDesignState;
  onClose: () => void;
}

export function RakshaPosterModal({ d, design, onClose }: RakshaPosterModalProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(0.6);

  const activeDesign = design || DEFAULT_RAKHI_DESIGN;
  const faceImgUrl = d.rb_face_img || "/templates/raksha-bandhan/default_brother.png";
  const targetX = Number(d.rb_tilak_x || 50);
  const targetY = Number(d.rb_tilak_y || 28);
  const tilakSize = Number(d.rb_tilak_size || 60);

  // Dynamically scale 540x960 poster for responsive mobile display without distorting
  useEffect(() => {
    const updateScale = () => {
      const targetW = Math.min(340, window.innerWidth * 0.82);
      const targetH = Math.min(604, window.innerHeight * 0.72);
      const s = Math.min(targetW / 540, targetH / 960);
      setScaleFactor(s);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Generate Ultra-HD 1080x1920 PNG & handle Download / Share
  const handleExport = async (action: "download" | "share") => {
    if (!posterRef.current) return;
    setExporting(true);
    try {
      // Unscale temporarily for pristine 1:1 canvas capture
      const currentTransform = posterRef.current.style.transform;
      posterRef.current.style.transform = "none";

      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // Produces crisp 1080x1920 Ultra-HD export
        width: 540,
        height: 960,
        backgroundColor: null,
      });

      // Restore responsive display transform
      posterRef.current.style.transform = currentTransform;

      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png", 1.0));
      if (!blob) return;

      const file = new File([blob], "raksha-bandhan-memories.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };

      if (action === "share" && nav.canShare?.({ files: [file] })) {
        await nav.share({
          files: [file],
          title: "Happy Raksha Bandhan 🎀",
          text: "Cherished Raksha Bandhan memories!",
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "raksha-bandhan-memories.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Poster export error:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 4, 14, 0.94)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Bar with Close Button */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          color: "#ffe0a0",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={16} style={{ color: "#f5c842" }} /> 9:16 Memory Poster HD
        </span>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Screen Display Container (Scales 540x960 poster cleanly for mobile view) */}
      <div
        style={{
          width: 540 * scaleFactor,
          height: 960 * scaleFactor,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Fixed Native HD 540x960 Poster DOM Element (100% Unstretched Quality) */}
        <div
          ref={posterRef}
          style={{
            width: 540,
            height: 960,
            position: "relative",
            transform: `scale(${scaleFactor})`,
            transformOrigin: "center center",
            boxShadow: "0 24px 60px rgba(0,0,0,0.9)",
            userSelect: "none",
            overflow: "hidden",
            background: "#180614",
          }}
        >
          {/* Explicit Full-Resolution Background Graphic Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/templates/raksha-bandhan/card_bg.png"
            alt="Raksha Bandhan Background"
            style={{
              width: 540,
              height: 960,
              objectFit: "fill",
              display: "block",
              position: "absolute",
              inset: 0,
            }}
          />

          {/* Cutout 1: Tilak Sibling Photo (Exact 540x960 pixel coordinates inside Left Top Frame) */}
          <div
            style={{
              position: "absolute",
              left: 28,
              top: 141,
              width: 232,
              height: 226,
              overflow: "hidden",
              background: "#000",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={faceImgUrl}
              alt="Sibling Tilak Photo"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {/* Authentic Red Tilak Mark overlay on forehead */}
            <div
              style={{
                position: "absolute",
                left: `${targetX}%`,
                top: `${targetY}%`,
                width: Math.min(50, tilakSize * 0.75),
                height: Math.min(90, tilakSize * 1.35),
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/templates/raksha-bandhan/tilak_mark.png"
                alt="Tilak Mark"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>

          {/* Cutout 2: Tied Rakhi Hand Photo (Exact 540x960 pixel coordinates inside Right Bottom Frame) */}
          <div
            style={{
              position: "absolute",
              left: 277,
              top: 344,
              width: 232,
              height: 257,
              overflow: "hidden",
              background: "linear-gradient(180deg, #2a0e1a 0%, #15060d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* 3D Hand */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/templates/raksha-bandhan/real_hand.png"
              alt="Tied Hand"
              style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.95 }}
            />
            {/* Smaller, Proportional Tied Rakhi Medallion on Wrist */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "65%",
                transform: "translate(-50%, -50%) scale(0.42)",
                filter: "drop-shadow(0 0 10px rgba(245,200,66,0.9))",
              }}
            >
              <RenderRakhiMedallion design={activeDesign} size={90} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: Download PNG & Native Share */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          maxWidth: 340,
        }}
      >
        <button
          onClick={() => handleExport("download")}
          disabled={exporting}
          className="raksha-btn-pill"
          style={{
            flex: 1,
            padding: "12px",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Download size={16} /> {exporting ? "Saving…" : "Save Poster HD"}
        </button>

        <button
          onClick={() => handleExport("share")}
          disabled={exporting}
          className="raksha-btn-pill raksha-btn-pill-saffron"
          style={{
            flex: 1,
            padding: "12px",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Share2 size={16} /> Share Memory 🎀
        </button>
      </div>
    </div>
  );
}
