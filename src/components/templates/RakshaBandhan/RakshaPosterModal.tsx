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

  // Generate PNG & handle Download / Share
  const handleExport = async (action: "download" | "share") => {
    if (!posterRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 3, // High-resolution output for crisp 9:16 export
        backgroundColor: null,
      });

      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
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
        background: "rgba(10, 4, 14, 0.92)",
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
          <Sparkles size={16} style={{ color: "#f5c842" }} /> 9:16 Rakhi Memory Poster
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

      {/* 9:16 Poster Card Container with Baked-in Frames */}
      <div
        ref={posterRef}
        style={{
          position: "relative",
          width: "min(340px, 84vw)",
          height: "min(604px, 78vh)",
          aspectRatio: "9/16",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.15)",
          backgroundImage: "url(/templates/raksha-bandhan/card_bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          userSelect: "none",
        }}
      >
        {/* Photo 1: Tilak Sibling Photo (Precisely aligned inside Left Top Frame "TILAK") */}
        <div
          style={{
            position: "absolute",
            left: "5.3%",
            top: "14.7%",
            width: "43%",
            height: "23.5%",
            overflow: "hidden",
            background: "#000",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={faceImgUrl}
            alt="Sibling Tilak Photo"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Authentic Red Tilak Mark overlay on forehead */}
          <div
            style={{
              position: "absolute",
              left: `${targetX}%`,
              top: `${targetY}%`,
              width: Math.min(36, tilakSize * 0.6),
              height: Math.min(65, tilakSize * 1.1),
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

        {/* Photo 2: Tied Rakhi Hand Photo (Precisely aligned inside Right Bottom Frame "CUSTOM RAKHI") */}
        <div
          style={{
            position: "absolute",
            left: "51.3%",
            top: "35.8%",
            width: "43%",
            height: "26.8%",
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
          {/* Tied Custom Medallion */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "66%",
              transform: "translate(-50%, -50%) scale(0.68)",
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
