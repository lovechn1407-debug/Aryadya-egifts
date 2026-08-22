"use client";
import React, { useRef, useState } from "react";
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

  const activeDesign = design || DEFAULT_RAKHI_DESIGN;
  const faceImgUrl = d.rb_face_img || "/templates/raksha-bandhan/default_brother.png";
  const targetX = Number(d.rb_tilak_x || 50);
  const targetY = Number(d.rb_tilak_y || 28);
  const tilakSize = Number(d.rb_tilak_size || 60);

  // Generate High-Resolution PNG & handle Download / Share
  const handleExport = async (action: "download" | "share") => {
    if (!posterRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 3, // High-resolution output for crisp export on all mobile devices
        backgroundColor: null,
      });

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

      {/* Responsive 9:16 Poster Card Container (100% Centered, Zero Overflow) */}
      <div
        ref={posterRef}
        style={{
          position: "relative",
          width: "min(340px, 80vw)",
          height: "min(604px, 74vh)",
          aspectRatio: "9/16",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.9)",
          backgroundImage: "url(/templates/raksha-bandhan/card_bg.png)",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          userSelect: "none",
        }}
      >
        {/* Cutout 1: Tilak Sibling Photo (Aligned inside Left Top Frame "TILAK") */}
        <div
          style={{
            position: "absolute",
            left: "5.4%",
            top: "14.8%",
            width: "42.6%",
            height: "22.8%",
            borderRadius: 0,
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
              width: Math.min(32, tilakSize * 0.55),
              height: Math.min(58, tilakSize * 1.05),
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

        {/* Cutout 2: Tied Rakhi Hand Photo (Aligned inside Right Bottom Frame "CUSTOM RAKHI") */}
        <div
          style={{
            position: "absolute",
            left: "51.5%",
            top: "35.8%",
            width: "42.6%",
            height: "26.2%",
            borderRadius: 0,
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
          {/* Proportional Tied Rakhi Medallion on Wrist */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "65%",
              transform: "translate(-50%, -50%) scale(0.40)",
              filter: "drop-shadow(0 0 10px rgba(245,200,66,0.9))",
            }}
          >
            <RenderRakhiMedallion design={activeDesign} size={80} />
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
          <Download size={16} /> {exporting ? "Saving…" : "Save Poster"}
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
