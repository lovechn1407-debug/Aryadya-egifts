"use client";
import React, { useRef, useState, useEffect } from "react";
import { Sparkles, Undo2, Trash2, Check, Palette, Shield, Shapes, Stamp } from "lucide-react";

export interface RakhiDesignState {
  shape: "circle" | "square" | "verified" | "flower" | "oval";
  bgColor: string;
  borderStyle: "zari" | "pearl" | "marigold" | "rainbow" | "glow";
  sticker: "spiderman" | "bheem" | "ironman" | "avengers" | "peacock" | "om" | "bear" | "star" | "none";
  doodles: Array<{ color: string; size: number; points: Array<{ x: number; y: number }> }>;
  threadStyle: "saffron" | "silk_red" | "kalava" | "pearl_string";
}

export const DEFAULT_RAKHI_DESIGN: RakhiDesignState = {
  shape: "verified",
  bgColor: "linear-gradient(135deg, #ffa757 0%, #e2600a 100%)",
  borderStyle: "zari",
  sticker: "spiderman",
  doodles: [],
  threadStyle: "saffron",
};

/* ── Vector Character & Sticker Badges ────────────────────────────── */
export function StickerBadge({ type, size = 48 }: { type: RakhiDesignState["sticker"]; size?: number }) {
  if (type === "spiderman") {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}>
        <circle cx="30" cy="30" r="26" fill="#e11d48" stroke="#9f1239" strokeWidth="2" />
        {/* Web pattern */}
        <line x1="30" y1="4" x2="30" y2="56" stroke="#000" strokeWidth="1" opacity="0.6" />
        <line x1="4" y1="30" x2="56" y2="30" stroke="#000" strokeWidth="1" opacity="0.6" />
        <line x1="11" y1="11" x2="49" y2="49" stroke="#000" strokeWidth="1" opacity="0.6" />
        <line x1="49" y1="11" x2="11" y2="49" stroke="#000" strokeWidth="1" opacity="0.6" />
        <circle cx="30" cy="30" r="10" fill="none" stroke="#000" strokeWidth="1" opacity="0.6" />
        <circle cx="30" cy="30" r="18" fill="none" stroke="#000" strokeWidth="1" opacity="0.6" />
        {/* Spidey eyes */}
        <polygon points="14,20 27,27 24,14" fill="#ffffff" stroke="#000" strokeWidth="2" />
        <polygon points="46,20 33,27 36,14" fill="#ffffff" stroke="#000" strokeWidth="2" />
      </svg>
    );
  }

  if (type === "bheem") {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}>
        {/* Chhota Bheem character emblem */}
        <circle cx="30" cy="30" r="26" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
        {/* Face */}
        <circle cx="30" cy="32" r="18" fill="#fdba74" />
        {/* Hair */}
        <path d="M12,28 C14,14 46,14 48,28 C42,20 18,20 12,28 Z" fill="#451a03" />
        {/* Tilak */}
        <ellipse cx="30" cy="24" rx="3" ry="5" fill="#dc2626" />
        <circle cx="30" cy="24" r="1.5" fill="#facc15" />
        {/* Eyes & Smile */}
        <circle cx="23" cy="32" r="2.5" fill="#1c1917" />
        <circle cx="37" cy="32" r="2.5" fill="#1c1917" />
        <path d="M23,38 Q30,44 37,38" fill="none" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" />
        {/* Laddu in corner */}
        <circle cx="44" cy="44" r="6" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
      </svg>
    );
  }

  if (type === "ironman") {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}>
        <circle cx="30" cy="30" r="26" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2" />
        {/* Helmet faceplate */}
        <polygon points="18,16 42,16 46,36 30,48 14,36" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
        {/* Glowing eyes */}
        <rect x="20" y="26" width="7" height="3" rx="1.5" fill="#38bdf8" />
        <rect x="33" y="26" width="7" height="3" rx="1.5" fill="#38bdf8" />
        {/* Mouth slot */}
        <line x1="24" y1="40" x2="36" y2="40" stroke="#854d0e" strokeWidth="2" />
      </svg>
    );
  }

  if (type === "avengers") {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}>
        <circle cx="30" cy="30" r="26" fill="#0284c7" stroke="#075985" strokeWidth="2" />
        <circle cx="30" cy="30" r="21" fill="none" stroke="#f0f9ff" strokeWidth="2" />
        {/* Avengers A */}
        <path d="M22,44 L30,12 L35,12 L43,44 L36,44 L34,36 L24,36 L22,44 Z M26,28 L32,28 L29,17 Z" fill="#ffffff" />
        <polygon points="34,26 44,26 40,32 34,32" fill="#facc15" />
      </svg>
    );
  }

  if (type === "peacock") {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}>
        <circle cx="30" cy="30" r="26" fill="#0f766e" stroke="#134e4a" strokeWidth="2" />
        {/* Peacock feather eye */}
        <ellipse cx="30" cy="30" rx="16" ry="20" fill="#0284c7" />
        <ellipse cx="30" cy="30" rx="11" ry="14" fill="#0d9488" />
        <ellipse cx="30" cy="32" rx="7" ry="9" fill="#1e1b4b" />
        <ellipse cx="30" cy="33" rx="4" ry="5" fill="#818cf8" />
        <circle cx="30" cy="12" r="2" fill="#facc15" />
      </svg>
    );
  }

  if (type === "om") {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}>
        <circle cx="30" cy="30" r="26" fill="#ea580c" stroke="#9a3412" strokeWidth="2" />
        <circle cx="30" cy="30" r="22" fill="none" stroke="#fde047" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="30" y="38" textAnchor="middle" fontSize="24" fontFamily="serif" fontWeight="bold" fill="#fef08a">
          ॐ
        </text>
      </svg>
    );
  }

  if (type === "bear") {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}>
        <circle cx="16" cy="18" r="9" fill="#78350f" />
        <circle cx="44" cy="18" r="9" fill="#78350f" />
        <circle cx="16" cy="18" r="5" fill="#fde68a" />
        <circle cx="44" cy="18" r="5" fill="#fde68a" />
        <circle cx="30" cy="32" r="22" fill="#92400e" />
        <ellipse cx="30" cy="36" rx="11" ry="8" fill="#fde68a" />
        <ellipse cx="30" cy="33" rx="4" ry="2.5" fill="#451a03" />
        <circle cx="22" cy="28" r="2.5" fill="#1c1917" />
        <circle cx="38" cy="28" r="2.5" fill="#1c1917" />
      </svg>
    );
  }

  if (type === "star") {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: "drop-shadow(0 2px 8px rgba(250,204,21,0.7))" }}>
        <circle cx="30" cy="30" r="26" fill="#854d0e" stroke="#eab308" strokeWidth="2" />
        <polygon points="30,8 36,22 51,22 38,31 43,45 30,36 17,45 22,31 9,22 24,22" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      </svg>
    );
  }

  return null;
}

/* ── Main Rakhi Medallion Preview Renderer ───────────────────────── */
export function RenderRakhiMedallion({
  design,
  size = 140,
}: {
  design: RakhiDesignState;
  size?: number;
}) {
  const d = design || DEFAULT_RAKHI_DESIGN;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render doodles onto overlay canvas
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    d.doodles?.forEach((path) => {
      if (!path.points || path.points.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(path.points[0].x, path.points[0].y);
      path.points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.stroke();
    });
  }, [d.doodles, size]);

  const radius = size / 2;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      {/* Outer Border Effects */}
      {d.borderStyle === "pearl" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: 14 }, (_, i) => {
            const angle = (i * 360) / 14;
            const r = size / 2 + 4;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 10,
                  height: 10,
                  marginLeft: -5,
                  marginTop: -5,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #ffffff 0%, #fef08a 70%, #ca8a04 100%)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  transform: `rotate(${angle}deg) translateY(-${r}px)`,
                }}
              />
            );
          })}
        </div>
      )}

      {d.borderStyle === "marigold" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: 14 }, (_, i) => {
            const angle = (i * 360) / 14;
            const r = size / 2 + 6;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 14,
                  height: 14,
                  marginLeft: -7,
                  marginTop: -7,
                  borderRadius: "50%",
                  background: i % 2 === 0 ? "#f97316" : "#facc15",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.35)",
                  transform: `rotate(${angle}deg) translateY(-${r}px)`,
                }}
              />
            );
          })}
        </div>
      )}

      {d.borderStyle === "rainbow" && (
        <div
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: d.shape === "square" ? "24px" : "50%",
            background: "linear-gradient(45deg, #ef4444, #f59e0b, #10b981, #06b6d4, #8b5cf6, #ec4899)",
            filter: "blur(2px)",
            animation: "raksha-shimmer 2s linear infinite",
          }}
        />
      )}

      {/* Main Base Medallion */}
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          background: d.bgColor,
          borderRadius:
            d.shape === "square"
              ? "24px"
              : d.shape === "oval"
              ? "50% / 35%"
              : d.shape === "verified"
              ? "50%"
              : "50%",
          border:
            d.borderStyle === "zari"
              ? "4px double #fef08a"
              : d.borderStyle === "glow"
              ? "3px solid #38bdf8"
              : "3px solid #f5c842",
          boxShadow:
            d.borderStyle === "glow"
              ? "0 0 20px #38bdf8"
              : "0 12px 28px -6px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Flower Scallop Petals if shape === flower */}
        {d.shape === "flower" && (
          <div style={{ position: "absolute", inset: 0, opacity: 0.25 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: size * 0.7,
                  height: size * 0.7,
                  marginLeft: -(size * 0.35),
                  marginTop: -(size * 0.35),
                  borderRadius: "30%",
                  border: "2px stroke #fef08a",
                  transform: `rotate(${i * 45}deg)`,
                }}
              />
            ))}
          </div>
        )}

        {/* Verified Notch Ring */}
        {d.shape === "verified" && (
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            <circle cx="50" cy="50" r="46" fill="none" stroke="#fef08a" strokeWidth="2.5" strokeDasharray="6 4" />
          </svg>
        )}

        {/* Overlay Doodle Canvas */}
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}
        />

        {/* Sticker / Character Emblem */}
        {d.sticker && d.sticker !== "none" && (
          <div style={{ position: "relative", zIndex: 5 }}>
            <StickerBadge type={d.sticker} size={size * 0.55} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FULL RAKHI DESIGNER STUDIO MODAL / COMPONENT
═══════════════════════════════════════════════════════════════════ */
export function RakhiDesigner({
  initialState,
  onSave,
  onClose,
}: {
  initialState?: RakhiDesignState;
  onSave: (design: RakhiDesignState) => void;
  onClose: () => void;
}) {
  const [design, setDesign] = useState<RakhiDesignState>(initialState || DEFAULT_RAKHI_DESIGN);
  const [activeTab, setActiveTab] = useState<"shape" | "color" | "border" | "sticker" | "doodle">("shape");

  // Doodle state
  const [drawing, setDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#fef08a");
  const [brushSize, setBrushSize] = useState(4);
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = [
    { name: "Saffron Gold", value: "linear-gradient(135deg, #ffa757 0%, #e2600a 100%)" },
    { name: "Royal Maroon", value: "linear-gradient(135deg, #be123c 0%, #881337 100%)" },
    { name: "Emerald Green", value: "linear-gradient(135deg, #10b981 0%, #047857 100%)" },
    { name: "Peacock Blue", value: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" },
    { name: "Mystic Purple", value: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" },
    { name: "Golden Velvet", value: "linear-gradient(135deg, #facc15 0%, #ca8a04 100%)" },
  ];

  const stickers: Array<{ id: RakhiDesignState["sticker"]; label: string }> = [
    { id: "spiderman", label: "Spiderman" },
    { id: "bheem", label: "Chhota Bheem" },
    { id: "ironman", label: "Iron Man" },
    { id: "avengers", label: "Avengers" },
    { id: "peacock", label: "Peacock" },
    { id: "om", label: "Om / Ganesha" },
    { id: "bear", label: "Cute Bear" },
    { id: "star", label: "Gold Star" },
    { id: "none", label: "No Sticker" },
  ];

  const borders: Array<{ id: RakhiDesignState["borderStyle"]; label: string }> = [
    { id: "zari", label: "Golden Zari" },
    { id: "pearl", label: "Pearl String" },
    { id: "marigold", label: "Marigold Flowers" },
    { id: "rainbow", label: "Rainbow Gems" },
    { id: "glow", label: "Neon Glow" },
  ];

  const shapes: Array<{ id: RakhiDesignState["shape"]; label: string }> = [
    { id: "verified", label: "Verified Circle" },
    { id: "circle", label: "Classic Circle" },
    { id: "square", label: "Soft Square" },
    { id: "flower", label: "Flower Petal" },
    { id: "oval", label: "Royal Oval" },
  ];

  // Draw on canvas for freehand doodle tool
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const cvs = canvasRef.current;
    if (!cvs) return { x: 0, y: 0 };
    const rect = cvs.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * 180,
      y: ((clientY - rect.top) / rect.height) * 180,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeTab !== "doodle") return;
    setDrawing(true);
    const pos = getCanvasPos(e);
    setCurrentPath([pos]);
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing || activeTab !== "doodle") return;
    const pos = getCanvasPos(e);
    setCurrentPath((p) => [...p, pos]);
  };

  const endDraw = () => {
    if (!drawing) return;
    setDrawing(false);
    if (currentPath.length > 1) {
      setDesign((prev) => ({
        ...prev,
        doodles: [...prev.doodles, { color: brushColor, size: brushSize, points: currentPath }],
      }));
    }
    setCurrentPath([]);
  };

  const handleUndoDoodle = () => {
    setDesign((prev) => ({ ...prev, doodles: prev.doodles.slice(0, -1) }));
  };

  const handleClearDoodles = () => {
    setDesign((prev) => ({ ...prev, doodles: [] }));
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 4, 12, 0.88)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="raksha-glass-card"
        style={{
          width: "100%",
          maxWidth: 540,
          background: "linear-gradient(180deg, #240a16 0%, #14040c 100%)",
          border: "1.5px solid rgba(245,200,66,0.4)",
          borderRadius: 24,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
        }}
      >
        {/* Studio Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "between",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                margin: 0,
                color: "#ffe0a0",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Sparkles size={18} style={{ color: "#f5c842" }} /> DIY Rakhi Designer Studio
            </h3>
            <p style={{ fontSize: 11, color: "#f0cfa8", margin: "2px 0 0" }}>
              Customize shape, colors, superhero stickers & doodles
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#9ca3af",
              fontSize: 22,
              cursor: "pointer",
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Live Interactive Preview Canvas */}
        <div
          style={{
            padding: "24px 16px",
            background: "radial-gradient(circle, rgba(255,124,26,0.15) 0%, transparent 70%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            minHeight: 200,
          }}
        >
          <div style={{ position: "relative" }}>
            <RenderRakhiMedallion design={design} size={170} />

            {/* Doodle Drawing Touch Surface overlay when Doodle tab active */}
            {activeTab === "doodle" && (
              <canvas
                ref={canvasRef}
                width={180}
                height={180}
                style={{
                  position: "absolute",
                  inset: -5,
                  cursor: "crosshair",
                  touchAction: "none",
                  zIndex: 20,
                }}
                onMouseDown={startDraw}
                onMouseMove={drawMove}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={drawMove}
                onTouchEnd={endDraw}
              />
            )}
          </div>
        </div>

        {/* Toolbar Category Tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "8px 12px",
            background: "rgba(0,0,0,0.4)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            overflowX: "auto",
          }}
        >
          <button
            onClick={() => setActiveTab("shape")}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              background: activeTab === "shape" ? "#ff7c1a" : "transparent",
              color: activeTab === "shape" ? "#fff" : "#f0cfa8",
              cursor: "pointer",
            }}
          >
            Shape
          </button>
          <button
            onClick={() => setActiveTab("color")}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              background: activeTab === "color" ? "#ff7c1a" : "transparent",
              color: activeTab === "color" ? "#fff" : "#f0cfa8",
              cursor: "pointer",
            }}
          >
            Color
          </button>
          <button
            onClick={() => setActiveTab("border")}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              background: activeTab === "border" ? "#ff7c1a" : "transparent",
              color: activeTab === "border" ? "#fff" : "#f0cfa8",
              cursor: "pointer",
            }}
          >
            Borders
          </button>
          <button
            onClick={() => setActiveTab("sticker")}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              background: activeTab === "sticker" ? "#ff7c1a" : "transparent",
              color: activeTab === "sticker" ? "#fff" : "#f0cfa8",
              cursor: "pointer",
            }}
          >
            Stickers
          </button>
          <button
            onClick={() => setActiveTab("doodle")}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              background: activeTab === "doodle" ? "#ff7c1a" : "transparent",
              color: activeTab === "doodle" ? "#fff" : "#f0cfa8",
              cursor: "pointer",
            }}
          >
            Doodle
          </button>
        </div>

        {/* Tab Controls Content */}
        <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>
          {activeTab === "shape" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {shapes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setDesign((prev) => ({ ...prev, shape: s.id }))}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: "1.5px solid",
                    borderColor: design.shape === s.id ? "#f5c842" : "rgba(255,255,255,0.1)",
                    background: design.shape === s.id ? "rgba(245,200,66,0.15)" : "rgba(255,255,255,0.04)",
                    color: design.shape === s.id ? "#ffe0a0" : "#d1d5db",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {activeTab === "color" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setDesign((prev) => ({ ...prev, bgColor: c.value }))}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: "1.5px solid",
                    borderColor: design.bgColor === c.value ? "#f5c842" : "rgba(255,255,255,0.1)",
                    background: c.value,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "center",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {activeTab === "border" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {borders.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setDesign((prev) => ({ ...prev, borderStyle: b.id }))}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: "1.5px solid",
                    borderColor: design.borderStyle === b.id ? "#f5c842" : "rgba(255,255,255,0.1)",
                    background: design.borderStyle === b.id ? "rgba(245,200,66,0.15)" : "rgba(255,255,255,0.04)",
                    color: design.borderStyle === b.id ? "#ffe0a0" : "#d1d5db",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}

          {activeTab === "sticker" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {stickers.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setDesign((prev) => ({ ...prev, sticker: st.id }))}
                  style={{
                    padding: "10px 6px",
                    borderRadius: 12,
                    border: "1.5px solid",
                    borderColor: design.sticker === st.id ? "#f5c842" : "rgba(255,255,255,0.1)",
                    background: design.sticker === st.id ? "rgba(245,200,66,0.15)" : "rgba(255,255,255,0.04)",
                    color: design.sticker === st.id ? "#ffe0a0" : "#d1d5db",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <StickerBadge type={st.id} size={32} />
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === "doodle" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "#f0cfa8" }}>Brush Color:</span>
                {["#fef08a", "#ef4444", "#38bdf8", "#4ade80", "#a855f7", "#ffffff"].map((clr) => (
                  <button
                    key={clr}
                    onClick={() => setBrushColor(clr)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: clr,
                      border: brushColor === clr ? "2px solid #fff" : "none",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "#f0cfa8" }}>Size:</span>
                {[2, 4, 8].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setBrushSize(sz)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      border: "none",
                      background: brushSize === sz ? "#ff7c1a" : "rgba(255,255,255,0.1)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {sz}px
                  </button>
                ))}

                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <button
                    onClick={handleUndoDoodle}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      border: "none",
                      background: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Undo2 size={12} /> Undo
                  </button>
                  <button
                    onClick={handleClearDoodles}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      border: "none",
                      background: "rgba(239,68,68,0.2)",
                      color: "#f87171",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <button onClick={onClose} className="raksha-btn-pill">
            Cancel
          </button>
          <button
            onClick={() => onSave(design)}
            className="raksha-btn-pill raksha-btn-pill-saffron"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Check size={16} /> Confirm Design & Tie Rakhi 🎀
          </button>
        </div>
      </div>
    </div>
  );
}
