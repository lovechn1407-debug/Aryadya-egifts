"use client";
import { useState, useEffect, useRef, useMemo, FC } from "react";
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragOverEvent, closestCenter, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import confetti from "canvas-confetti";
import gsap from "gsap";
import { Music, VolumeX, Volume2 } from "lucide-react";
import YouTube from "react-youtube";
import SongLibraryPopup from "../../SongLibraryPopup";
import { BearCharacter } from "./BearCharacter";
import { RosePetals } from "./RosePetals";

// ── SHARED HEART SVG PATH (70x70 viewBox) ─────────────────────────────────────
const HEART_PATH = "M35,62 C10,48 3,37 3,22 C3,10 12,3 22,3 C28,3 33,6 35,12 C37,6 42,3 48,3 C58,3 67,10 67,22 C67,37 60,48 35,62 Z";

// ── Editable Text Component ───────────────────────────────────────────────────
function ET({
  fid, data, onChange, style, multiline = false, editMode = false,
}: {
  fid: string; data: Record<string, string>; onChange?: (id: string, v: string) => void;
  style?: React.CSSProperties; multiline?: boolean; editMode?: boolean;
}) {
  const value = data[fid] ?? "";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(data[fid] ?? ""), [data, fid]);
  const commit = () => { onChange?.(fid, draft); setEditing(false); };

  if (!editMode) return <span style={{ display: "block", ...style }}>{value}</span>;

  if (editing) {
    const base: React.CSSProperties = {
      display: "block", width: "100%",
      border: "2px solid #D4AF37", borderRadius: 8,
      padding: "8px 10px", background: "rgba(255,255,255,0.95)", outline: "none",
      fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit",
      color: "#1a1a1a", lineHeight: "inherit",
    };
    return multiline
      ? <textarea value={draft} rows={4} autoFocus onChange={e => setDraft(e.target.value)}
          onBlur={commit} style={{ ...style, ...base, resize: "vertical", color: "#1a1a1a" }} />
      : <input value={draft} autoFocus onChange={e => setDraft(e.target.value)}
          onBlur={commit} onKeyDown={e => e.key === "Enter" && commit()}
          style={{ ...style, ...base, color: "#1a1a1a" }} />;
  }

  return (
    <div onClick={() => setEditing(true)} title="Click to edit" style={{
      position: "relative", cursor: "text",
      border: "2px dashed rgba(212,175,55,0.6)",
      borderRadius: 8, padding: "6px 10px 22px 10px",
      background: "rgba(212,175,55,0.05)", marginBottom: 6,
    }}>
      <span style={{ display: "block", ...style }}>
        {value || <em style={{ opacity: 0.4, fontSize: 13 }}>Click to edit…</em>}
      </span>
      <span style={{
        position: "absolute", bottom: 3, right: 8, fontSize: 10, color: "#D4AF37",
        fontWeight: 700, fontFamily: "'Inter',sans-serif",
      }}>✏️ edit</span>
    </div>
  );
}

// ── Nav Bar ───────────────────────────────────────────────────────────────────
const NavBar: FC<{ onBack?: () => void; onNext?: () => void; nextLabel?: string; backLabel?: string }> = ({
  onBack, onNext, nextLabel = "Next →", backLabel = "← Back",
}) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 40, flexWrap: "wrap", zIndex: 10, position: "relative" }}>
    {onBack && (
      <button onClick={onBack} style={{
        background: "transparent", color: "#FFF8F0", border: "1.5px solid rgba(192,57,90,0.7)",
        borderRadius: 999, padding: "12px 28px",
        fontFamily: "'Inter', sans-serif", fontSize: 14, cursor: "pointer",
        transition: "all 0.2s ease",
      }}>{backLabel}</button>
    )}
    {onNext && (
      <button onClick={onNext} style={{
        background: "#C0395A", color: "#FFF8F0", border: "1.5px solid #D4AF37",
        borderRadius: 999, padding: "12px 28px",
        fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
        cursor: "pointer", boxShadow: "0 8px 24px rgba(192,57,90,0.4)",
        transition: "all 0.2s ease",
      }}>{nextLabel}</button>
    )}
  </div>
);

// ── Slide –1: Background Music ────────────────────────────────────────────────
function S_Minus1({ d, ch, em, oc, bgProps }: {
  d: Record<string, string>; ch: () => void; em: boolean;
  oc?: (id: string, v: string) => void; bgProps: { isPicking: boolean; setIsPicking: (v: boolean) => void };
}) {
  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{
        background: "rgba(255,248,240,0.97)", borderRadius: 24, padding: "40px 32px",
        width: "100%", maxWidth: 420,
        border: "1.5px solid #D4AF37",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "clamp(1.5rem, 4vw, 2rem)", color: "#8B1A3A", textAlign: "center", marginBottom: 8,
        }}>Global Background Music 🎵</h2>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", color: "#9B7B84", fontSize: 14, textAlign: "center", marginBottom: 24 }}>
          Plays continuously throughout the website
        </p>

        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(192,57,90,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#8B1A3A" }}>
          <Music size={28} />
        </div>

        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, textAlign: "center", fontSize: 16, color: "#2A1A1F", marginBottom: 24 }}>
          {d.bg_song_name || "No song selected"}
        </div>

        {em && (
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <button onClick={() => bgProps.setIsPicking(true)} style={{
              background: "#C0395A", color: "#FFF8F0", border: "1.5px solid #D4AF37",
              borderRadius: 999, padding: "10px 24px", fontFamily: "'Inter', sans-serif",
              fontSize: 14, cursor: "pointer",
            }}>
              {d.bg_song_url ? "Change Background Music" : "Select Background Music"}
            </button>
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          <button onClick={ch} style={{
            background: "transparent", color: "#C0395A",
            border: "1.5px solid #C0395A", borderRadius: 999,
            padding: "10px 24px", fontFamily: "'Inter', sans-serif",
            fontSize: 14, cursor: "pointer",
          }}>
            Next: Welcome Slide →
          </button>
        </div>
      </div>

      {bgProps.isPicking && (
        <SongLibraryPopup
          onClose={() => bgProps.setIsPicking(false)}
          onSelect={(song) => {
            if (oc) {
              oc("bg_song_name", song.name);
              oc("bg_song_url", song.url || "");
              oc("bg_song_type", song.type || "direct");
              oc("bg_song_youtube_id", song.youtubeId || "");
              oc("bg_song_start", String(song.startTime || 0));
              oc("bg_song_end", String(song.endTime || 0));
            }
            bgProps.setIsPicking(false);
          }}
        />
      )}
    </section>
  );
}

// ── Slide 0: Welcome Hero ─────────────────────────────────────────────────────
function S0({ d, ch, em, oc }: { d: Record<string, string>; ch: () => void; em: boolean; oc?: (id: string, v: string) => void }) {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "60px 24px", boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <ET fid="s1_title" data={d} onChange={oc} editMode={em} style={{
          fontFamily: "'Inter', sans-serif", textTransform: "uppercase",
          letterSpacing: "0.4em", fontSize: 12, color: "#D4AF37", display: "block", marginBottom: 16,
        }} />

        <div style={{ height: 1, width: 120, background: "linear-gradient(90deg, transparent, #D4AF37, transparent)", margin: "0 auto 24px" }} />

        <ET fid="beloved_name" data={d} onChange={oc} editMode={em} style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 700,
          fontSize: "clamp(3rem, 10vw, 5.5rem)", color: "#FFF8F0", lineHeight: 1, display: "block", marginBottom: 16,
        }} />

        <div style={{ height: 1, width: 100, background: "linear-gradient(90deg, transparent, #D4AF37, transparent)", margin: "0 auto 20px" }} />

        <ET fid="s1_tagline" data={d} onChange={oc} editMode={em} multiline style={{
          fontFamily: "'Lora', serif", fontStyle: "italic",
          fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: "#F2C4CE",
          lineHeight: 1.7, display: "block", marginBottom: 32,
        }} />

        <div style={{ margin: "8px 0 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div className="animate-bob" style={{ width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/templates/my-love-universe/bear1.gif" alt="Welcome Bear" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 16, objectFit: "contain" }} />
          </div>
        </div>

        <NavBar onNext={ch} nextLabel={d.s1_cta || "Begin Our Story →"} />
      </div>
    </section>
  );
}

// ── Slide 1: Envelope Letter ──────────────────────────────────────────────────
function S1({ d, ch, em, oc, onBack }: {
  d: Record<string, string>; ch: () => void; em: boolean;
  oc?: (id: string, v: string) => void; onBack: () => void;
}) {
  const [open, setOpen] = useState(em);
  useEffect(() => {
    if (em) setOpen(true);
  }, [em]);

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 16px", boxSizing: "border-box",
    }}>
      <ET fid="s2_title" data={d} onChange={oc} editMode={em} style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
        fontSize: "clamp(1.6rem, 4vw, 2.3rem)", color: "#FFF8F0",
        marginBottom: 36, textAlign: "center", display: "block",
      }} />

      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div key="env" exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setOpen(true)} style={{ cursor: "pointer", perspective: 800 }}>
            {/* Envelope */}
            <div style={{ position: "relative", width: 300, height: 210 }}>
              {/* Body */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "0 0 16px 16px",
                background: "#FFF8F0", border: "1.5px solid #D4AF37",
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              }} />
              {/* Flap */}
              <motion.div
                initial={{ rotateX: 0 }} whileHover={{ rotateX: -25 }}
                style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 110,
                  background: "#C0395A",
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  transformOrigin: "top", transformStyle: "preserve-3d",
                }}
              />
              {/* Seal */}
              <div style={{
                position: "absolute", left: "50%", top: 78, transform: "translateX(-50%)",
                width: 52, height: 52, borderRadius: "50%",
                background: "#8B1A3A", boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#F2C4CE", fontSize: 22, fontWeight: 700,
              }}>♡</div>
              <span style={{ position: "absolute", bottom: 8, left: 8, color: "#D4AF37", fontSize: 16 }}>✦</span>
              <span style={{ position: "absolute", bottom: 8, right: 8, color: "#D4AF37", fontSize: 16 }}>✦</span>
            </div>
            <p style={{
              textAlign: "center", marginTop: 20,
              fontFamily: "'Sacramento', cursive", fontSize: "1.6rem", color: "#F2C4CE",
            }}>
              {d.s2_envelope_hint || "Click to open ✨"}
            </p>
          </motion.div>
        ) : (
          <motion.div key="letter"
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7 }}
            style={{
              background: "#FFF8F0",
              border: "1.5px solid #D4AF37",
              borderRadius: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              padding: "clamp(24px, 5vw, 48px)",
              width: "100%", maxWidth: 520,
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(192,57,90,0.06) 28px, rgba(192,57,90,0.06) 29px)",
              overflowY: "auto", maxHeight: "65vh",
            }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <svg width="36" height="36" viewBox="0 0 70 70">
                <path d={HEART_PATH} fill="#C0395A" />
              </svg>
            </div>
            <ET fid="s2_letter_greeting" data={d} onChange={oc} editMode={em} style={{
              fontFamily: "'Sacramento', cursive", fontSize: "clamp(1.8rem, 4vw, 2.3rem)",
              color: "#C0395A", display: "block", marginBottom: 20,
            }} />
            <ET fid="s2_letter_body" data={d} onChange={oc} editMode={em} multiline style={{
              fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 16,
              color: "#2A1A1F", lineHeight: 1.9, display: "block", marginBottom: 24,
            }} />
            <div style={{ textAlign: "right" }}>
              <ET fid="s2_letter_sign" data={d} onChange={oc} editMode={em} style={{
                fontFamily: "'Sacramento', cursive",
                fontSize: "clamp(1.6rem, 3.5vw, 2rem)", color: "#8B1A3A", display: "block",
              }} />
              <span style={{ fontSize: 22, color: "#C0395A" }}>♡</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NavBar onBack={onBack} onNext={open ? ch : undefined} nextLabel="Keep Reading →" />
    </section>
  );
}

// ── Slide 2: Heart Puzzle ─────────────────────────────────────────────────────
// Pieces defined in SVG coordinate space (viewBox 0 0 70 70)
interface PieceData {
  id: string;
  color: string;
  clipPoints: string;
  slotLeft: string;
  slotTop: string;
  slotWidth: string;
  slotHeight: string;
}

const PUZZLE_PIECES: PieceData[] = [
  { id: "p1", color: "#C0395A", clipPoints: "0,0 35,0 35,33 0,33",   slotLeft: "0%",  slotTop: "0%",  slotWidth: "50%", slotHeight: "50%" },
  { id: "p2", color: "#8B1A3A", clipPoints: "35,0 70,0 70,33 35,33", slotLeft: "50%", slotTop: "0%",  slotWidth: "50%", slotHeight: "50%" },
  { id: "p3", color: "#C0395A", clipPoints: "0,33 35,33 35,70 0,70", slotLeft: "0%",  slotTop: "50%", slotWidth: "50%", slotHeight: "50%" },
  { id: "p4", color: "#8B1A3A", clipPoints: "35,33 70,33 70,70 35,70",slotLeft: "50%", slotTop: "50%", slotWidth: "50%", slotHeight: "50%" },
];

// Transparent heart-slice draggable — NO box, NO border, purely the SVG shape
function JigsawPiece({ p }: { p: PieceData }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: p.id });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}
      className="jigsaw-piece"
      style={{
        cursor: "grab", touchAction: "none",
        opacity: isDragging ? 0 : 1, flexShrink: 0,
        filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.55))",
        userSelect: "none",
      }}>
      <svg width="100" height="100" viewBox="0 0 70 70" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <clipPath id={`tclip-${p.id}`}><polygon points={p.clipPoints} /></clipPath>
          <linearGradient id={`tgrad-${p.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.color} />
            <stop offset="100%" stopColor={p.color + "cc"} />
          </linearGradient>
        </defs>
        <path d={HEART_PATH} fill={`url(#tgrad-${p.id})`} stroke="#D4AF37" strokeWidth="1.8"
              clipPath={`url(#tclip-${p.id})`} />
      </svg>
    </div>
  );
}

// Invisible Drop Zone
function DropZone({ p }: { p: PieceData }) {
  const { setNodeRef } = useDroppable({ id: p.id });
  return (
    <div ref={setNodeRef} style={{
      position: "absolute",
      left: p.slotLeft, top: p.slotTop,
      width: p.slotWidth, height: p.slotHeight,
      zIndex: 12, pointerEvents: "all",
    }} />
  );
}

function S2({ d, ch, em, oc, onBack, ap }: {
  d: Record<string, string>; ch: () => void; em: boolean;
  oc?: (id: string, v: string) => void; onBack: () => void; ap?: boolean;
}) {
  const [previewSolved, setPreviewSolved] = useState(em);
  const [filled, setFilled] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const trayOrder = useMemo(() => [...PUZZLE_PIECES].sort(() => Math.random() - 0.5), []);
  const won = previewSolved || Object.keys(filled).length === PUZZLE_PIECES.length || ap;

  useEffect(() => {
    if (won && !em && !ap) {
      confetti({
        particleCount: 120, spread: 180, origin: { y: 0.5 },
        colors: ["#C0395A", "#F2C4CE", "#D4AF37", "#FFF8F0"],
        shapes: ["circle"] as never,
      });
      const t = setTimeout(ch, 3200);
      return () => clearTimeout(t);
    }
  }, [won, ch, em, ap]);

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));
  const handleDragOver = (event: DragOverEvent) => setOverId(event.over ? String(event.over.id) : null);
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);
    if (event.over && event.over.id === event.active.id) {
      setFilled(p => ({ ...p, [String(event.active.id)]: true }));
    }
  };

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 16px", boxSizing: "border-box",
    }}>
      <ET fid="s3_title" data={d} onChange={oc} editMode={em} style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
        fontSize: "clamp(1.6rem, 4vw, 2.3rem)", color: "#D4AF37",
        marginBottom: 8, textAlign: "center", display: "block",
      }} />
      <ET fid="s3_subtitle" data={d} onChange={oc} editMode={em} style={{
        fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 14,
        color: "#F2C4CE", marginBottom: 20, textAlign: "center", display: "block",
      }} />

      {em && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(93, 18, 38, 0.6)", border: "1px solid #D4AF37",
          borderRadius: 999, padding: "4px 6px", marginBottom: 24,
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)", backdropFilter: "blur(8px)",
        }}>
          <button onClick={() => setPreviewSolved(true)}
            style={{
              background: previewSolved ? "#C0395A" : "transparent", color: "#FFF8F0",
              border: "none", borderRadius: 999, padding: "6px 16px",
              fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s ease",
              boxShadow: previewSolved ? "0 2px 8px rgba(192, 57, 90, 0.4)" : "none",
            }}>
            👁️ Preview Solved
          </button>
          <button onClick={() => setPreviewSolved(false)}
            style={{
              background: !previewSolved ? "#C0395A" : "transparent", color: "#FFF8F0",
              border: "none", borderRadius: 999, padding: "6px 16px",
              fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s ease",
              boxShadow: !previewSolved ? "0 2px 8px rgba(192, 57, 90, 0.4)" : "none",
            }}>
            🧩 Edit/Test Puzzle
          </button>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        {/* Heart board — 300x300, pure SVG slices, no boxes */}
        <div style={{ position: "relative", width: 300, height: 300, margin: "0 auto 20px" }}>

          {/* When won, display a solid, unified red heart without any piece cracks */}
          {won ? (
            <svg width="300" height="300" viewBox="0 0 70 70"
              style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <path d={HEART_PATH}
                fill="#C0395A"
                stroke="#D4AF37" strokeWidth="1.8"
                style={{ filter: "drop-shadow(0 4px 16px rgba(192, 57, 90, 0.6))" }}
              />
            </svg>
          ) : (
            <>
              {/* Background trace grid */}
              {PUZZLE_PIECES.map(p => (
                <svg key={`bg-${p.id}`} width="300" height="300" viewBox="0 0 70 70"
                  style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
                  <defs>
                    <clipPath id={`bclip-${p.id}`}><polygon points={p.clipPoints} /></clipPath>
                  </defs>
                  {filled[p.id] ? (
                    <path d={HEART_PATH}
                      fill={p.color}
                      stroke="#D4AF37" strokeWidth="1.8"
                      clipPath={`url(#bclip-${p.id})`}
                      style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))" }}
                    />
                  ) : (
                    <path d={HEART_PATH}
                      fill="rgba(212,175,55,0.06)"
                      stroke="rgba(212,175,55,0.45)" strokeWidth="1.5" strokeDasharray="3.5 3"
                      clipPath={`url(#bclip-${p.id})`}
                    />
                  )}
                </svg>
              ))}

              {/* Glowing piece trace for active drop zone */}
              {overId && (
                <svg width="300" height="300" viewBox="0 0 70 70"
                  style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none", zIndex: 11 }}>
                  <defs>
                    <clipPath id="hover-clip">
                      <polygon points={PUZZLE_PIECES.find(p => p.id === overId)?.clipPoints} />
                    </clipPath>
                  </defs>
                  <path d={HEART_PATH}
                    fill="rgba(255, 248, 240, 0.4)"
                    clipPath="url(#hover-clip)"
                    style={{ filter: "drop-shadow(0 0 10px rgba(255, 248, 240, 0.6))" }}
                  />
                </svg>
              )}

              {/* Invisible drop zones */}
              {PUZZLE_PIECES.map(p => (
                <DropZone key={p.id} p={p} />
              ))}
            </>
          )}

          <AnimatePresence>
            {won && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: em ? "all" : "none", zIndex: 20 }}>
                <ET fid="s3_win_text" data={d} onChange={oc} editMode={em} style={{
                  fontFamily: "'Sacramento', cursive", fontSize: "2.2rem", color: "#FFF8F0",
                  textShadow: "0 0 20px #C0395A", textAlign: "center", display: "block"
                }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tray — transparent floating heart slices, no boxes */}
        {!won && (
          <div style={{
            marginTop: 20,
            background: "linear-gradient(145deg, #5D1226 0%, #2A040E 100%)",
            border: "2px dashed #D4AF37",
            borderRadius: 24, padding: "24px 20px",
            display: "flex", flexWrap: "wrap",
            alignItems: "center", justifyContent: "center", gap: 20,
            width: "100%", maxWidth: 440,
            boxSizing: "border-box",
            boxShadow: "inset 0 10px 30px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.4)",
          }}>
            {trayOrder.map(p =>
              filled[p.id] ? (
                <div key={p.id} style={{ width: 100, height: 100, opacity: 0.12 }}>
                  <svg width="100" height="100" viewBox="0 0 70 70" style={{ overflow: "visible" }}>
                    <defs><clipPath id={`ph-${p.id}`}><polygon points={p.clipPoints} /></clipPath></defs>
                    <path d={HEART_PATH} fill="none" stroke="rgba(212,175,55,0.5)" strokeWidth="1.5"
                          strokeDasharray="3 3" clipPath={`url(#ph-${p.id})`} />
                  </svg>
                </div>
              ) : (
                <JigsawPiece key={p.id} p={p} />
              )
            )}
          </div>
        )}
        {won && <div style={{ height: 80 }} />}

        <DragOverlay>
          {activeId ? (() => {
            const ap2 = PUZZLE_PIECES.find(p => p.id === activeId);
            if (!ap2) return null;
            return (
              <div style={{
                cursor: "grabbing",
                transform: "scale(1.18) rotate(-6deg)",
                transition: "transform 0.1s ease",
                filter: "drop-shadow(0 15px 30px rgba(212, 175, 55, 0.6))",
              }}>
                <svg width="100" height="100" viewBox="0 0 70 70" style={{ display: "block", overflow: "visible" }}>
                  <defs>
                    <clipPath id={`oclip-${ap2.id}`}><polygon points={ap2.clipPoints} /></clipPath>
                  </defs>
                  <path d={HEART_PATH} fill={ap2.color} stroke="#D4AF37" strokeWidth="1.8"
                        clipPath={`url(#oclip-${ap2.id})`} />
                </svg>
              </div>
            );
          })() : null}
        </DragOverlay>
      </DndContext>

      <NavBar onBack={onBack} onNext={won ? ch : undefined} />
    </section>
  );
}
// ── Slide 3: Memory Jar ───────────────────────────────────────────────────────
function S3({ d, ch, em, oc, onBack }: {
  d: Record<string, string>; ch: () => void; em: boolean;
  oc?: (id: string, v: string) => void; onBack: () => void;
}) {
  const [index, setIndex] = useState(-1);
  const [shake, setShake] = useState(0);

  const memories = useMemo(() => [
    d.s4_mem1 || "The first time I saw you smile at me 🌸",
    d.s4_mem2 || "Our late night conversations about everything ✨",
    d.s4_mem3 || "The way you laugh — it's my favourite sound 🎶",
    d.s4_mem4 || "Every moment I get to hold your hand 🤝",
    d.s4_mem5 || "Right now. Reading this. You. ♡",
  ].filter(Boolean), [d]);

  const shakeSpring = useSpring({ rotate: shake, config: { tension: 300, friction: 10 } });

  const pull = () => {
    if (index >= memories.length - 1) return;
    setShake(6);
    setTimeout(() => setShake(-6), 100);
    setTimeout(() => setShake(0), 200);
    setIndex(i => i + 1);
  };

  const offsets = useMemo(() => [
    { x: -20, y: -190, rotate: -8 },
    { x: 20, y: -210, rotate: 6 },
    { x: -15, y: -160, rotate: -12 },
    { x: 15, y: -180, rotate: 10 },
    { x: 0, y: -200, rotate: -3 },
  ], []);

  const currentOffset = index >= 0 ? offsets[index % offsets.length] : { x: 0, y: -170, rotate: -8 };

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 16px", boxSizing: "border-box",
    }}>
      <ET fid="s4_title" data={d} onChange={oc} editMode={em} style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
        fontSize: "clamp(1.6rem, 4vw, 2.3rem)", color: "#D4AF37",
        marginBottom: 6, textAlign: "center", display: "block",
      }} />
      <ET fid="s4_subtitle" data={d} onChange={oc} editMode={em} style={{
        fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 14,
        color: "#F2C4CE", marginBottom: em ? 20 : 30, textAlign: "center", display: "block",
      }} />

      {/* Edit mode: memory cards panel shown above visual */}
      {em && (
        <div style={{
          background: "rgba(255,248,240,0.97)", border: "1.5px solid #D4AF37",
          borderRadius: 16, padding: "20px 24px", width: "100%", maxWidth: 400,
          marginBottom: 24, zIndex: 20, position: "relative",
        }}>
          <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: "#8B1A3A", marginBottom: 14 }}>
            Edit Memory Cards:
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(["s4_mem1","s4_mem2","s4_mem3","s4_mem4","s4_mem5"] as const).map((fid, i) => (
              <ET key={fid} fid={fid} data={d} onChange={oc} editMode={em}
                style={{ fontSize: 14, color: "#2A1A1F", fontFamily: "'Lora', serif" }} />
            ))}
          </div>
        </div>
      )}

      {/* Visual: jar + pulled memory */}
      <div style={{ position: "relative", height: 400, width: "100%", maxWidth: 320 }}>
        {/* Pulled memory card */}
        <AnimatePresence>
          {index >= 0 && (
            <motion.div key={index}
              initial={{ opacity: 0, y: 50, x: "-50%", scale: 0.8, rotate: 0 }}
              animate={{
                opacity: 1,
                x: `calc(-50% + ${currentOffset.x}px)`,
                y: currentOffset.y,
                rotate: currentOffset.rotate,
                scale: 1
              }}
              exit={{ opacity: 0, y: -240, scale: 0.8 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 120, damping: 14 }}
              style={{
                position: "absolute", left: "50%",
                width: 260, top: 120, zIndex: 10,
                background: "#FFF8F0", border: "1.5px solid #D4AF37",
                borderRadius: 20, padding: "20px 24px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
              }}>
              <span style={{ position: "absolute", top: 8, left: 12, color: "#C0395A", fontSize: 18 }}>♡</span>
              <p style={{ fontFamily: "'Sacramento', cursive", fontSize: "1.6rem", textAlign: "center", paddingTop: 12, color: "#8B1A3A", lineHeight: 1.4 }}>
                {memories[index]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jar */}
        <animated.div
          onClick={pull}
          style={{
            transform: shakeSpring.rotate.to(r => `translateX(-50%) rotate(${r}deg)`),
            cursor: index >= memories.length - 1 ? "default" : "pointer",
            position: "absolute", bottom: 0, left: "50%",
          }}>
          <svg width="160" height="210" viewBox="0 0 180 240">
            <rect x="50" y="10" width="80" height="20" rx="4" fill="#D4AF37" />
            <rect x="40" y="28" width="100" height="14" rx="3" fill="rgba(255,248,240,0.4)" />
            <path d="M40,42 L40,210 Q40,230 60,230 L120,230 Q140,230 140,210 L140,42 Z"
              fill="rgba(255,248,240,0.18)" stroke="rgba(255,248,240,0.5)" strokeWidth="2" />
            <rect x="55" y="180" width="20" height="14" rx="2" fill="#FFF8F0" transform="rotate(-10 65 187)" opacity="0.9" />
            <rect x="85" y="175" width="20" height="14" rx="2" fill="#FFF8F0" transform="rotate(5 95 182)" opacity="0.9" />
            <rect x="110" y="185" width="20" height="14" rx="2" fill="#FFF8F0" transform="rotate(-3 120 192)" opacity="0.9" />
            <path d="M55,60 L60,180" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
            <text x="90" y="135" textAnchor="middle" fontFamily="Sacramento" fontSize="20" fill="#C0395A">Our Memories</text>
          </svg>
        </animated.div>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
        {memories.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: "50%",
            background: i <= index ? "#C0395A" : "rgba(242,196,206,0.25)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>

      <NavBar onBack={onBack} onNext={(index >= memories.length - 1 || em) ? ch : undefined} />
    </section>
  );
}

// ── Slide 4: Playlist ─────────────────────────────────────────────────────────
function S4({ d, ch, em, oc, onBack, onPlayStateChange }: {
  d: Record<string, string>; ch: () => void; em: boolean;
  oc?: (id: string, v: string) => void; onBack: () => void;
  onPlayStateChange?: (playing: boolean) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pickingFor, setPickingFor] = useState<number | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(17);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const songs = useMemo(() => [
    { n: "s5_song1_name", a: "s5_song1_artist", u: "s5_song1_url", defName: "Tum Hi Ho", defArtist: "Arijit Singh" },
    { n: "s5_song2_name", a: "s5_song2_artist", u: "s5_song2_url", defName: "Tera Ban Jaunga", defArtist: "Akhil Sachdeva" },
    { n: "s5_song3_name", a: "s5_song3_artist", u: "s5_song3_url", defName: "Mere Naam Tu", defArtist: "Abbas–Mustan" },
  ], []);

  const songName = d[songs[current].n] || songs[current].defName;
  const songArtist = d[songs[current].a] || songs[current].defArtist;
  const songUrl = d[songs[current].u] || "";

  const prevCurrentRef = useRef(current);
  useEffect(() => {
    const isSongChange = prevCurrentRef.current !== current;
    prevCurrentRef.current = current;

    if (audioObj) { audioObj.pause(); audioObj.currentTime = 0; }
    setProgress(0);
    if (isSongChange) {
      setPlaying(true);
    } else {
      setPlaying(false);
    }
    if (songUrl && !em) {
      const a = new Audio(songUrl);
      a.onloadedmetadata = () => setDuration(Math.floor(a.duration) || 17);
      a.ontimeupdate = () => setProgress((a.currentTime / (a.duration || 1)) * 100);
      a.onended = () => { setPlaying(false); setProgress(0); };
      setAudioObj(a);
    } else { setAudioObj(null); setDuration(17); }
    return () => { if (audioObj) { audioObj.pause(); audioObj.currentTime = 0; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, songUrl, em]);

  useEffect(() => {
    onPlayStateChange?.(playing);
    if (audioObj) {
      if (playing) audioObj.play().catch(() => {});
      else audioObj.pause();
    } else if (playing) {
      intervalRef.current = setInterval(() => setProgress(p => p >= 100 ? 0 : p + 0.5), 100);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, audioObj, onPlayStateChange]);

  const fmt = (s: number) => `0:${Math.floor(s).toString().padStart(2, "0")}`;
  const curSec = Math.floor((progress / 100) * duration);

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 16px", boxSizing: "border-box",
    }}>
      <ET fid="s5_title" data={d} onChange={oc} editMode={em} style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
        fontSize: "clamp(1.6rem, 4vw, 2.3rem)", color: "#D4AF37",
        marginBottom: 28, textAlign: "center", display: "block",
      }} />

      <div style={{
        background: "#FFF8F0", border: "1.5px solid #D4AF37",
        borderRadius: 24, padding: "32px 28px",
        width: "100%", maxWidth: 380, position: "relative",
        boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
      }}>
        {/* Vinyl */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{
            width: 160, height: 160, borderRadius: "50%",
            background: "radial-gradient(circle, #2A1A1F 28%, #0a0a0a 29%, #1a1a1a 48%, #0a0a0a 49%, #1a1a1a 70%, #0a0a0a 71%, #1a1a1a 88%)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            animation: playing ? "spin-vinyl 3s linear infinite" : "none",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              width: 56, height: 56, borderRadius: "50%",
              background: "#C0395A", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "'Inter', sans-serif", color: "white", fontSize: 9, textAlign: "center", lineHeight: 1.2 }}>
                Our<br />Song
              </span>
            </div>
          </div>
        </div>

        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, textAlign: "center", fontSize: 20, color: "#2A1A1F", marginBottom: 4 }}>
          {songName}
        </h3>
        <p style={{ fontFamily: "'Inter', sans-serif", textAlign: "center", fontSize: 13, color: "#9B7B84", marginBottom: 16 }}>
          {songArtist}
        </p>

        {/* Progress bar */}
        <div style={{ height: 4, borderRadius: 999, background: "rgba(212,175,55,0.2)", marginBottom: 8 }}>
          <div style={{ height: "100%", borderRadius: 999, background: "#D4AF37", width: `${progress}%`, transition: "width 0.1s linear" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9B7B84", marginBottom: 20 }}>
          <span>{fmt(curSec)}</span><span>{fmt(duration)}</span>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, marginBottom: 20 }}>
          <button onClick={() => setCurrent(c => (c - 1 + songs.length) % songs.length)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#2A1A1F", fontSize: 22 }}>⏮</button>
          <button onClick={() => setPlaying(p => !p)}
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "#C0395A", border: "2px solid #D4AF37",
              color: "white", fontSize: 22, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
            {playing ? "⏸" : "▶"}
          </button>
          <button onClick={() => setCurrent(c => (c + 1) % songs.length)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#2A1A1F", fontSize: 22 }}>⏭</button>
        </div>

        {/* Song list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {songs.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <button onClick={() => { setCurrent(i); setProgress(0); }}
                style={{
                  flex: 1, textAlign: "left", padding: "8px 12px", borderRadius: 10,
                  border: "none", fontFamily: "'Inter', sans-serif", fontSize: 13,
                  background: i === current ? "rgba(192,57,90,0.1)" : "transparent",
                  color: i === current ? "#8B1A3A" : "#2A1A1F", cursor: "pointer",
                }}>
                {d[s.n] || s.defName} —{" "}
                <span style={{ color: "#9B7B84" }}>{d[s.a] || s.defArtist}</span>
              </button>
              {em && (
                <button onClick={() => setPickingFor(i)}
                  style={{ padding: "4px 8px", fontSize: 12, borderRadius: 8, cursor: "pointer",
                    border: "1px dashed #C0395A", background: "transparent", color: "#C0395A" }}>
                  🎵 Swap
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bear decoration */}
        <div style={{ position: "absolute", bottom: -24, right: -16, width: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="animate-bob" style={{ width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/templates/my-love-universe/bear2.gif" alt="Music Bear" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12, objectFit: "contain" }} />
          </div>
        </div>
      </div>

      {pickingFor !== null && (
        <SongLibraryPopup
          onClose={() => setPickingFor(null)}
          onSelect={(song) => {
            const slot = songs[pickingFor];
            if (oc) {
              oc(slot.n, song.name);
              oc(slot.a, song.description || "Unknown Artist");
              oc(slot.u, song.url);
            }
            setPickingFor(null);
          }}
        />
      )}

      <NavBar onBack={onBack} onNext={ch} />
    </section>
  );
}

// ── Slide 5: Wish Stars (full-screen, dark sky) ───────────────────────────────
const STAR_POSITIONS = [
  { x: 15, y: 22 }, { x: 78, y: 18 }, { x: 32, y: 52 }, { x: 68, y: 48 },
  { x: 18, y: 72 }, { x: 82, y: 68 }, { x: 50, y: 32 },
];

function S5({ d, ch, em, oc, onBack, ap }: {
  d: Record<string, string>; ch: () => void; em: boolean;
  oc?: (id: string, v: string) => void; onBack: () => void; ap?: boolean;
}) {
  const [clicked, setClicked] = useState<Set<number>>(new Set());
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const shootRef = useRef<HTMLDivElement>(null);

  const starReasons = useMemo(() => [
    d.s6_star1 || "The way your eyes light up when you're happy",
    d.s6_star2 || "How you make even ordinary days feel magical",
    d.s6_star3 || "Your laugh — it's my favorite melody",
    d.s6_star4 || "The way you care, deeply and genuinely",
    d.s6_star5 || "How safe I feel just being near you",
    d.s6_star6 || "Your kindness — it radiates from everything you do",
    d.s6_star7 || "Simply — you. All of you. Always.",
  ], [d]);

  const stars = useMemo(() =>
    Array.from({ length: 120 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100,
      s: 1 + Math.random() * 2.5, o: 0.3 + Math.random() * 0.7,
    })), []);

  useEffect(() => {
    if (!shootRef.current) return;
    const shoots = shootRef.current.querySelectorAll<HTMLDivElement>(".shoot");
    shoots.forEach((s, i) => {
      gsap.fromTo(s,
        { x: -120, y: Math.random() * 250, opacity: 0 },
        { x: window.innerWidth + 120, y: `+=${80 + Math.random() * 180}`, opacity: 0.9,
          duration: 1.2, repeat: -1, delay: i * 4 + Math.random() * 3,
          repeatDelay: 8, ease: "power1.out" });
    });
  }, []);

  const handleClick = (i: number) => {
    if (clicked.has(i)) return;
    setClicked(s => new Set(s).add(i));
    setActiveIdx(i);
    setTimeout(() => setActiveIdx(a => (a === i ? null : a)), 3200);
  };

  const allDone = clicked.size === STAR_POSITIONS.length || em || ap;

  return (
    <section style={{
      minHeight: "100vh", position: "relative", overflow: "hidden",
      background: "#060C1E", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      {/* Star field */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {stars.map((s, i) => (
          <div key={i} style={{
            position: "absolute", borderRadius: "50%", background: "#ffffff",
            left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, opacity: s.o,
          }} />
        ))}
      </div>

      {/* Shooting stars */}
      <div ref={shootRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="shoot" style={{
            position: "absolute", width: 90, height: 2,
            background: "linear-gradient(90deg, transparent, white)",
            borderRadius: 999, boxShadow: "0 0 10px white",
          }} />
        ))}
      </div>

      {/* Moon */}
      <div style={{
        position: "absolute", top: 24, right: 24, width: 80, height: 80, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, #FFF8F0, #D4AF37)",
        boxShadow: allDone ? "0 0 60px rgba(255,248,240,0.7), 0 0 120px rgba(212,175,55,0.4)" : "0 0 24px rgba(255,248,240,0.25)",
        transition: "box-shadow 1s ease",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#060C1E", transform: "translate(18%, -10%)" }} />
      </div>

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 900, padding: "40px 20px", boxSizing: "border-box" }}>
        <ET fid="s6_title" data={d} onChange={oc} editMode={em} style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "clamp(1.6rem, 4vw, 2.3rem)", color: "#D4AF37",
          marginBottom: 6, textAlign: "center", display: "block",
        }} />
        <ET fid="s6_subtitle" data={d} onChange={oc} editMode={em} style={{
          fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 14,
          color: "#FFF8F0", marginBottom: 16, textAlign: "center", display: "block",
        }} />

        {/* Edit mode: reasons panel */}
        {em && (
          <div style={{
            background: "rgba(255,248,240,0.97)", border: "1.5px solid #D4AF37",
            borderRadius: 16, padding: "20px 24px",
            marginBottom: 24, zIndex: 30, position: "relative",
          }}>
            <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: "#8B1A3A", marginBottom: 12 }}>
              Edit Star Reasons:
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 160, overflowY: "auto" }}>
              {(["s6_star1","s6_star2","s6_star3","s6_star4","s6_star5","s6_star6","s6_star7"] as const).map(fid => (
                <ET key={fid} fid={fid} data={d} onChange={oc} editMode={em}
                  style={{ fontSize: 13, color: "#2A1A1F", fontFamily: "'Lora', serif" }} />
              ))}
            </div>
          </div>
        )}

        {/* Interactive stars */}
        <div style={{ position: "relative", width: "100%", height: 340 }}>
          {STAR_POSITIONS.map((pos, i) => {
            const isClicked = clicked.has(i) || em || ap;
            return (
              <button key={i} onClick={() => handleClick(i)}
                style={{
                  position: "absolute",
                  left: `${pos.x}%`, top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                  background: "transparent", border: "none",
                  cursor: isClicked ? "default" : "pointer",
                  filter: `drop-shadow(0 0 ${isClicked ? 16 : 8}px ${isClicked ? "#FFF8F0" : "#D4AF37"})`,
                  zIndex: 10,
                  transition: "filter 0.4s",
                  animation: isClicked ? "none" : "pulse-star 2s ease-in-out infinite",
                }}>
                <svg width="36" height="36" viewBox="0 0 24 24">
                  <path
                    d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21 L12 17 L6 21 L8 14 L2 9.5 L9.5 9 Z"
                    fill={isClicked ? "#FFF8F0" : "#D4AF37"}
                  />
                </svg>
              </button>
            );
          })}

          {/* Tooltip for clicked star — clamped so it never goes off either edge */}
          <AnimatePresence>
            {activeIdx !== null && (
              <motion.div key={activeIdx}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  position: "absolute",
                  // clamp centers tooltip on star but keeps it fully inside the container
                  left: `clamp(4px, calc(${STAR_POSITIONS[activeIdx].x}% - 100px), calc(100% - 204px))`,
                  top: `calc(${STAR_POSITIONS[activeIdx].y}% + 28px)`,
                  width: 200, zIndex: 20,
                  background: "#FFF8F0",
                  border: "1.5px solid #D4AF37",
                  borderRadius: 16, padding: "14px 16px",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
                }}>
                <p style={{ textAlign: "center", color: "#C0395A", marginBottom: 4, fontSize: 16 }}>♡</p>
                <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", textAlign: "center", fontSize: 13, color: "#8B1A3A", lineHeight: 1.5 }}>
                  {starReasons[activeIdx]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Win message */}
        <AnimatePresence>
          {allDone && (
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: "'Sacramento', cursive", fontSize: "clamp(2.5rem, 6vw, 3.5rem)",
                textAlign: "center", color: "#FFF8F0",
                textShadow: "0 0 20px #D4AF37, 0 0 40px rgba(212,175,55,0.5)",
                marginTop: 8,
              }}>
              {d.s6_win_text || "You are my universe. ♡"}
            </motion.p>
          )}
        </AnimatePresence>

        <NavBar onBack={onBack} onNext={allDone ? ch : undefined} nextLabel="Almost there… →" />
      </div>
    </section>
  );
}

// ── Slide 6: Finale ───────────────────────────────────────────────────────────
function S6({ d, em, oc, onBack, onReset }: {
  d: Record<string, string>; em: boolean;
  oc?: (id: string, v: string) => void; onBack: () => void; onReset: () => void;
}) {
  const emberRef = useRef<HTMLDivElement>(null);
  const [sealed, setSealed] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const viewerName = d.beloved_name || "My Jaan";
  const stampText = `★ ARADHYA EGIFTS ★ SEEN BY ${viewerName.toUpperCase()} ★ ${currentDate.toUpperCase()} ★ FOREVER & ALWAYS`;

  useEffect(() => {
    if (!emberRef.current) return;
    const embers = emberRef.current.querySelectorAll<HTMLDivElement>(".ember");
    embers.forEach(e => {
      const startX = Math.random() * (typeof window !== "undefined" ? window.innerWidth : 400);
      gsap.fromTo(e,
        { x: startX, y: (typeof window !== "undefined" ? window.innerHeight : 800) + 20, opacity: 0 },
        { y: -100, opacity: 0.7, duration: 6 + Math.random() * 6,
          repeat: -1, delay: Math.random() * 8, ease: "power1.out",
          onRepeat: () => gsap.set(e, { x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 400) }),
        });
    });
  }, []);

  const handleSeal = () => {
    const fire = (x: number, y: number) => confetti({
      particleCount: 60, spread: 100, origin: { x, y },
      colors: ["#C0395A", "#F2C4CE", "#D4AF37", "#FFF8F0", "#8B1A3A"],
    });
    fire(0.1, 0.5); fire(0.9, 0.5); fire(0.5, 0.4);

    setSealed(true);
    setAnimationDone(false);

    // After animation completes (1000ms), remove animation class to make stamp static
    setTimeout(() => {
      setAnimationDone(true);
    }, 1000);

    // Wait for stamp pressing animation to complete, then capture screenshot
    setTimeout(async () => {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 700);

      const element = document.getElementById("my-love-universe-card-to-capture");
      if (!element) {
        console.error("Capture element not found");
        const fallbackSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23060c1e'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='16'>Sealed with Love! 💖</text></svg>`;
        const fallbackData = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(fallbackSvg)))}`;
        setScreenshotData(fallbackData);
        setOpenModal(true);
        return;
      }

      try {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(element, {
          useCORS: true,
          scale: 2,
          backgroundColor: "#060c1e", // Cosmic dark background matching My Love's Universe
          logging: false,
          
          onclone: (_clonedDoc, clonedEl) => {
            // iOS Safari crash fix: backdrop-filter often causes SecurityError or blank canvas
            clonedEl.style.setProperty('backdrop-filter', 'none', 'important');
            clonedEl.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            // Give it a solid background since the blur is gone
            clonedEl.style.setProperty('background-color', '#120509', 'important');

            // Remove any ignored elements from the clone so Safari doesn't attempt to load them
            const ignored = clonedEl.querySelectorAll('.no-screenshot');
            ignored.forEach(el => el.remove());

            // Force the seal overlay fully visible in html2canvas cloned DOM.
            // html2canvas re-applies CSS in the clone which can reset running
            // animations to their initial frame (opacity:0). Overriding here
            // with setProperty guarantees the stamp is always captured.
            const backdrop = clonedEl.querySelector('.seal-backdrop') as HTMLElement | null;
            if (backdrop) {
              backdrop.style.setProperty('animation', 'none', 'important');
              backdrop.style.setProperty('opacity', '1', 'important');
              backdrop.style.setProperty('visibility', 'visible', 'important');
            }
            const stamp = clonedEl.querySelector('.seal-pressing') as HTMLElement | null;
            if (stamp) {
              stamp.style.setProperty('animation', 'none', 'important');
              stamp.style.setProperty('transform', 'rotate(-12deg) scale(1)', 'important');
              stamp.style.setProperty('opacity', '1', 'important');
              stamp.style.setProperty('visibility', 'visible', 'important');
            }
          },
          ignoreElements: (el) => {
            return el.classList.contains('no-screenshot') || el.tagName === 'BUTTON';
          }
        });
        const dataUrl = canvas.toDataURL("image/png");
        setScreenshotData(dataUrl);
        setOpenModal(true);
      } catch (err) {
        console.error("Screenshot capture failed", err);
        // Fallback so the share modal is never blocked from opening
        const fallbackSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23060c1e'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='16'>Sealed with Love! 💖</text></svg>`;
        const fallbackData = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(fallbackSvg)))}`;
        setScreenshotData(fallbackData);
        setOpenModal(true);
      }
    }, 2000);
  };

  const handleShare = async () => {
    if (!screenshotData) return;
    setUploading(true);
    setError(null);

    let isShared = false;

    // 1. Try direct image file sharing if supported by browser/device
    try {
      if (screenshotData.includes(";base64,")) {
        const base64Data = screenshotData.split(",")[1];
        const byteString = atob(base64Data);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: "image/png" });
        const file = new File([blob], `seen-proof-${Date.now()}.png`, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Cosmic Sealed Proof 🌟",
            text: "Our love letter is sealed in the stars! ✨"
          });
          isShared = true;
        }
      }
    } catch (err) {
      console.log("Direct raw file sharing not supported or cancelled, trying link upload...", err);
    }

    if (isShared) {
      setUploading(false);
      return;
    }

    // 2. Fallback to ImgBB upload and Native Share Sheet / Clipboard Copy
    try {
      let base64Data = "";
      if (screenshotData.includes(";base64,")) {
        base64Data = screenshotData.split(",")[1];
      } else {
        base64Data = btoa(unescape(encodeURIComponent(screenshotData.split(",")[1] || screenshotData)));
      }

      const fd = new FormData();
      fd.append("image", base64Data);

      const res = await fetch("https://api.imgbb.com/1/upload?key=83e3f88941efd1059a89f016ff302d9e", {
        method: "POST",
        body: fd
      });
      const json = await res.json();
      if (json.success) {
        const url = json.data.url;
        setShareUrl(url);

        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 5000);
        } catch (clipErr) {
          console.log("Clipboard write failed", clipErr);
        }

        // Try to trigger native share box with the uploaded link
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Cosmic Sealed Proof 🌟",
              text: "Our love letter is sealed in the stars! Check out the seen proof here: ✨",
              url: url
            });
          } catch (shareErr) {
            console.log("Native link sharing cancelled or failed", shareErr);
          }
        }
      } else {
        setError("Failed to upload image. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section style={{
      minHeight: "100vh", position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "60px 20px", boxSizing: "border-box",
    }}>
      <style>{`
        @keyframes sealSlam {
          0% { transform: scale(3.5) rotate(-45deg); opacity: 0; filter: blur(6px); }
          70% { transform: scale(0.9) rotate(5deg); opacity: 1; filter: none; }
          85% { transform: scale(1.15) rotate(-3deg); }
          100% { transform: scale(1) rotate(-12deg); }
        }
        .seal-pressing {
          animation: sealSlam 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .seal-backdrop {
          animation: fadeIn 0.4s ease forwards;
        }
        @keyframes cameraFlash {
          0% { opacity: 0; }
          15% { opacity: 1; }
          100% { opacity: 0; }
        }
        .camera-flash-overlay {
          position: fixed; inset: 0; background: #fff; z-index: 99999; pointer-events: none;
          animation: cameraFlash 0.7s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
        @keyframes popIn {
          0% { transform: scale(0.9) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .pop-in-modal {
          animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {showFlash && <div className="camera-flash-overlay" />}

      {/* Ember particles */}
      <div ref={emberRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="ember" style={{
            position: "absolute", width: 4, height: 4, borderRadius: "50%",
            background: "#D4AF37", boxShadow: "0 0 8px #D4AF37",
          }} />
        ))}
      </div>

      {/* Content wrapper with ID to capture */}
      <div
        id="my-love-universe-card-to-capture"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 480,
          background: "rgba(18, 5, 9, 0.65)",
          backdropFilter: "blur(12px)",
          border: "2px solid #D4AF37",
          borderRadius: 24,
          padding: "36px 24px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5), inset 0 0 32px rgba(212, 175, 55, 0.05)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <div className="animate-bob no-screenshot" style={{ width: 240, height: 160, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/templates/my-love-universe/bear3.gif" alt="Finale Bear Couple" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 16, objectFit: "contain" }} />
        </div>

        <ET fid="s7_title" data={d} onChange={oc} editMode={em} style={{
          fontFamily: "'Inter', sans-serif", textTransform: "uppercase",
          letterSpacing: "0.4em", fontSize: 12, marginTop: 12, color: "#D4AF37", display: "block",
        }} />

        <div style={{ margin: "16px 0 8px" }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 700,
            fontSize: "clamp(2.5rem, 8vw, 4.5rem)", color: "#FFF8F0", lineHeight: 1,
          }}>
            {viewerName}{" "}
            <span style={{ color: "#F2C4CE" }}>♡</span>
          </h1>
        </div>

        <div style={{ height: 1, width: 120, background: "linear-gradient(90deg, transparent, #D4AF37, transparent)", margin: "16px auto" }} />

        <ET fid="s7_letter_body" data={d} onChange={oc} editMode={em} multiline style={{
          fontFamily: "'Lora', serif", fontStyle: "italic",
          color: "#F2C4CE", lineHeight: 1.8, fontSize: 16, display: "block", marginBottom: 16,
        }} />

        <ET fid="s7_closing" data={d} onChange={oc} editMode={em} style={{
          fontFamily: "'Sacramento', cursive", fontSize: "clamp(1.8rem, 4vw, 2.2rem)",
          color: "#D4AF37", display: "block", marginBottom: 8,
        }} />

        {/* Sealed heart overlay inside the card wrapper so it gets screenshotted */}
        {sealed && (
          <div
            className="seal-backdrop"
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center", zIndex: 20,
              background: "rgba(18, 5, 9, 0.96)", borderRadius: 22,
              pointerEvents: "none",
              ...(animationDone ? { animation: "none", opacity: 1 } : {})
            }}>
            <div className="seal-pressing" style={{
              width: 220, height: 220,
              filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6))",
              transform: "rotate(-12deg)",
              ...(animationDone ? { animation: "none" } : {})
            }}>
              <svg width="220" height="220" viewBox="0 0 200 200">
                <defs>
                  <path id="universe-stamp-top-path" d="M 30, 100 A 70,70 0 0,1 170, 100" fill="none" />
                  <path id="universe-stamp-bottom-path" d="M 170, 100 A 70,70 0 0,1 30, 100" fill="none" />
                </defs>
                
                {/* Irregular scalloped circle edge for a hyper-realistic solid wax look */}
                <path d="M 100, 12 A 88,88 0 0,0 12, 105 A 82,88 0 0,0 100, 188 A 88,82 0 0,0 188, 95 A 88,88 0 0,0 100, 12 Z" fill="#D4AF37" stroke="#AA7C11" strokeWidth="4" />
                <circle cx="100" cy="100" r="82" fill="none" stroke="#FFF8F0" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
                <circle cx="100" cy="100" r="64" fill="#6A1B29" stroke="#D4AF37" strokeWidth="3" />
                
                <text fill="#FFF8F0" fontSize="8.2" fontFamily="'Inter', sans-serif" fontWeight="900" letterSpacing="1">
                  <textPath href="#universe-stamp-top-path" startOffset="50%" textAnchor="middle">
                    {`★ ARADHYA EGIFTS ★ SEEN BY ${viewerName.toUpperCase()} ★`}
                  </textPath>
                </text>
                
                <text fill="#FFF8F0" fontSize="7.8" fontFamily="'Inter', sans-serif" fontWeight="800" letterSpacing="0.8">
                  <textPath href="#universe-stamp-bottom-path" startOffset="50%" textAnchor="middle">
                    {`★ ${currentDate.toUpperCase()} ★ FOREVER & ALWAYS ★`}
                  </textPath>
                </text>
                
                <text x="100" y="94" textAnchor="middle" fill="#FFF8F0" fontSize="22" fontFamily="'Sacramento', cursive" fontWeight="bold">
                  {viewerName}
                </text>
                <text x="100" y="118" textAnchor="middle" fill="#D4AF37" fontSize="8" fontFamily="'Inter', sans-serif" fontWeight="700" letterSpacing="1">
                  FOREVER & ALWAYS
                </text>
                <circle cx="100" cy="130" r="3" fill="#D4AF37" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="no-screenshot" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 32, position: "relative", zIndex: 10 }}>
        {!em && (
          <button onClick={handleSeal} style={{
            background: "#C0395A", color: "#FFF8F0", border: "1.5px solid #D4AF37",
            borderRadius: 999, padding: "12px 28px",
            fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
            cursor: "pointer", boxShadow: "0 8px 24px rgba(192,57,90,0.4)",
          }}>
            {d.s7_seal_btn || "Seal It With Love 💌"}
          </button>
        )}
        <button onClick={onReset} style={{
          background: "transparent", color: "#FFF8F0",
          border: "1.5px solid rgba(192,57,90,0.6)", borderRadius: 999,
          padding: "12px 28px", fontFamily: "'Inter', sans-serif",
          fontSize: 14, cursor: "pointer",
        }}>
          {d.s7_replay_btn || "Experience Again 🔄"}
        </button>
        <button onClick={onBack} style={{
          background: "transparent", color: "#FFF8F0",
          border: "1.5px solid rgba(192,57,90,0.6)", borderRadius: 999,
          padding: "12px 28px", fontFamily: "'Inter', sans-serif",
          fontSize: 14, cursor: "pointer",
        }}>← Back</button>
      </div>

      {/* Screenshot Framed Preview Modal */}
      {openModal && screenshotData && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(6, 12, 30, 0.85)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} className="fade-in">
          <div style={{
            background: "rgba(18, 5, 9, 0.95)",
            border: "2px solid #D4AF37",
            borderRadius: 24,
            padding: "24px 20px",
            width: "100%",
            maxWidth: 440,
            boxShadow: "0 24px 64px rgba(212, 175, 55, 0.25)",
            textAlign: "center",
            position: "relative",
          }} className="pop-in-modal">
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
              fontSize: 24, color: "#D4AF37", marginBottom: 6, fontStyle: "italic"
            }}>
              🌟 Cosmic Seal Locked! 🌟
            </h3>
            <p style={{ fontSize: 13, color: "#F2C4CE", marginBottom: 16, fontFamily: "'Lora', serif" }}>
              Your love letter is sealed forever in the universe!
            </p>

            {/* Polaroid frame preview */}
            <div style={{
              background: "#060C1E",
              padding: "12px 12px 24px",
              borderRadius: 12,
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              marginBottom: 20,
              transform: "rotate(-1.5deg)",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={screenshotData} alt="Sealed Proof" style={{
                width: "100%", borderRadius: 6, display: "block",
                maxHeight: 280, objectFit: "contain",
                border: "1px solid rgba(212, 175, 55, 0.2)"
              }} />
              <div style={{
                fontFamily: "'Sacramento', cursive",
                fontSize: 22, color: "#D4AF37", marginTop: 12, textAlign: "center"
              }}>
                Written in the Stars ✨
              </div>
            </div>

            {shareUrl && (
              <div style={{
                background: "rgba(46, 125, 50, 0.1)",
                border: "1px solid rgba(76, 175, 80, 0.4)",
                borderRadius: 12, padding: "10px 14px", marginBottom: 16,
                fontSize: 12, color: "#81C784", fontWeight: 600,
                lineHeight: 1.4
              }} className="fade-in">
                <span style={{ fontSize: 14 }}>🎉</span> Link Copied to Clipboard!
                <div style={{
                  marginTop: 4, fontStyle: "italic", fontWeight: 400,
                  color: "#A5D6A7", wordBreak: "break-all", background: "rgba(0,0,0,0.3)",
                  padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(212, 175, 55, 0.1)"
                }}>{shareUrl}</div>
              </div>
            )}

            {error && (
              <div style={{
                background: "rgba(211, 47, 47, 0.1)",
                border: "1px solid rgba(211, 47, 47, 0.4)",
                borderRadius: 12, padding: "10px 14px", marginBottom: 16,
                fontSize: 12, color: "#EF5350", fontWeight: 600
              }}>
                ❌ {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={handleShare}
                disabled={uploading}
                style={{
                  background: "#C0395A", color: "#FFF8F0",
                  border: "1px solid #D4AF37", borderRadius: 999,
                  padding: "12px 24px", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  boxShadow: "0 6px 16px rgba(192, 57, 90, 0.3)",
                  opacity: uploading ? 0.7 : 1, transition: "all 0.2s",
                  flex: 1, fontFamily: "'Inter', sans-serif"
                }}
              >
                {uploading ? "Uploading... ⏳" : "🔗 Share Seen Proof"}
              </button>
              <button
                onClick={() => setOpenModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.1)", color: "#FFF8F0",
                  border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: 999,
                  padding: "12px 24px", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.2s", flex: 0.5,
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Main Template Container ───────────────────────────────────────────────────
export default function MyLoveUniverse({
  customData = {}, editMode = false, onFieldChange, forcedSlide, autoPlay,
}: {
  customData?: Record<string, string>;
  editMode?: boolean;
  onFieldChange?: (id: string, value: string) => void;
  forcedSlide?: number;
  autoPlay?: boolean;
}) {
  const [slide, setSlide] = useState(editMode ? -1 : 0);
  const [isPickingBgSong, setIsPickingBgSong] = useState(false);
  const activeSlide = editMode && forcedSlide !== undefined ? forcedSlide : slide;
  const go = (n: number) => setSlide(n);

  // Background Audio
  const [bgAudio, setBgAudio] = useState<HTMLAudioElement | null>(null);
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const isYt = customData.bg_song_type === "youtube" && !!customData.bg_song_youtube_id;
  const [globalMuted, setGlobalMuted] = useState(false);
  const [slideAudioPlaying, setSlideAudioPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const ytPlayerRef = useRef<any>(null);
  const fadeIntervalRef = useRef<any>(null);

  useEffect(() => { ytPlayerRef.current = ytPlayer; }, [ytPlayer]);

  useEffect(() => {
    const onInteract = () => {
      setHasInteracted(true);
      if (isYt && ytPlayerRef.current?.playVideo) ytPlayerRef.current.playVideo();
    };
    window.addEventListener("click", onInteract);
    window.addEventListener("touchstart", onInteract);
    return () => { window.removeEventListener("click", onInteract); window.removeEventListener("touchstart", onInteract); };
  }, [isYt]);

  useEffect(() => {
    if (editMode) return;
    const audio = new Audio();
    audio.loop = true;
    setBgAudio(audio);
    return () => { audio.pause(); audio.src = ""; };
  }, [editMode]);

  useEffect(() => {
    if (!bgAudio || isYt || !customData.bg_song_url) return;
    if (bgAudio.src !== customData.bg_song_url) bgAudio.src = customData.bg_song_url;
  }, [bgAudio, customData.bg_song_url, isYt]);

  const isAudible = !editMode && hasInteracted && !globalMuted && !slideAudioPlaying;

  useEffect(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    if (editMode) return;

    if (isAudible) {
      if (isYt) {
        if (ytPlayer && typeof ytPlayer.playVideo === "function") {
          ytPlayer.unMute();
          ytPlayer.setVolume(0);
          ytPlayer.playVideo();
          
          let currentVol = 0;
          fadeIntervalRef.current = setInterval(() => {
            currentVol = Math.min(currentVol + 5, 100);
            if (ytPlayer && typeof ytPlayer.setVolume === "function") {
              ytPlayer.setVolume(currentVol);
            }
            if (currentVol >= 100) {
              if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;
              }
            }
          }, 100);
        }
      } else {
        if (bgAudio) {
          bgAudio.muted = false;
          bgAudio.volume = 0;
          bgAudio.play().catch(e => console.log("Bg audio play prevented", e));
          
          let currentVol = 0;
          fadeIntervalRef.current = setInterval(() => {
            currentVol = Math.min(currentVol + 0.05, 1.0);
            bgAudio.volume = currentVol;
            if (currentVol >= 1.0) {
              if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;
              }
            }
          }, 100);
        }
      }
    } else {
      if (isYt) {
        if (ytPlayer) {
          if (globalMuted) {
            ytPlayer.mute();
          } else {
            ytPlayer.pauseVideo?.();
          }
          ytPlayer.setVolume?.(0);
        }
      } else {
        if (bgAudio) {
          if (globalMuted) {
            bgAudio.muted = true;
          } else {
            bgAudio.pause();
          }
          bgAudio.volume = 0;
        }
      }
    }

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    };
  }, [isAudible, bgAudio, ytPlayer, isYt, globalMuted]);

  // Auto-play preview cycling
  useEffect(() => {
    if (!autoPlay || editMode) return;
    const timer = setInterval(() => setSlide(s => (s + 1) % 7), 1500);
    return () => clearInterval(timer);
  }, [autoPlay, editMode]);

  const renderSlide = () => {
    const p = { d: customData, em: editMode, oc: onFieldChange };
    switch (activeSlide) {
      case -1: return <S_Minus1 {...p} ch={() => go(0)} bgProps={{ isPicking: isPickingBgSong, setIsPicking: setIsPickingBgSong }} />;
      case 0:  return <S0 {...p} ch={() => go(1)} />;
      case 1:  return <S1 {...p} ch={() => go(2)} onBack={() => go(0)} />;
      case 2:  return <S2 {...p} ch={() => go(3)} onBack={() => go(1)} ap={autoPlay} />;
      case 3:  return <S3 {...p} ch={() => go(4)} onBack={() => go(2)} />;
      case 4:  return <S4 {...p} ch={() => go(5)} onBack={() => go(3)} onPlayStateChange={setSlideAudioPlaying} />;
      case 5:  return <S5 {...p} ch={() => go(6)} onBack={() => go(4)} ap={autoPlay} />;
      case 6:  return <S6 {...p} onBack={() => go(5)} onReset={() => go(0)} />;
      default: return null;
    }
  };

  return (
    <div style={{
      position: "relative", minHeight: "100vh", overflow: "hidden",
      background: "linear-gradient(160deg, #120509 0%, #4A1020 50%, #7A1530 100%)",
      color: "#FFF8F0",
    }}>
      {/* Injected styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Lora:ital,wght@0,400;0,600;1,400&family=Sacramento&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes spin-vinyl { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-star { 0%,100%{transform:translate(-50%,-50%) scale(1);} 50%{transform:translate(-50%,-50%) scale(1.15);} }
        @keyframes bob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
        .animate-bob { animation: bob 2.5s ease-in-out infinite; }
        .pulse-star { animation: pulse-star 2s ease-in-out infinite; }
        .petal { position: fixed; pointer-events: none; z-index: 0; border-radius: 50% 0 50% 0; }
        .jigsaw-piece { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
        .jigsaw-piece:hover { transform: translateY(-8px) scale(1.1); filter: drop-shadow(0 12px 20px rgba(212,175,55,0.7)) !important; }
      `}</style>

      {/* Rose petals (not on starfield slide) */}
      {activeSlide !== 5 && <RosePetals count={20} />}

      {/* Main - no maxWidth constraint, let each section control its own */}
      <main style={{ position: "relative", zIndex: 10, minHeight: "100vh" }}>
        <div key={activeSlide} style={{ width: "100%" }}>
          {renderSlide()}
        </div>
      </main>

      {/* Mute button */}
      {customData.bg_song_url && !editMode && (
        <button
          onClick={() => setGlobalMuted(!globalMuted)}
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 100,
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(212,175,55,0.2)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: globalMuted ? "#888" : "#C0395A", transition: "all 0.3s",
          }}>
          {globalMuted ? <VolumeX size={22} strokeWidth={2.5} /> : <Volume2 size={22} strokeWidth={2.5} />}
        </button>
      )}

      {/* YouTube headless player */}
      {isYt && !editMode && (
        <div style={{ position: "absolute", top: -9999, left: -9999, opacity: 0, pointerEvents: "none" }}>
          <YouTube
            videoId={customData.bg_song_youtube_id}
            opts={{
              height: "10", width: "10",
              playerVars: {
                autoplay: 0, loop: 1, controls: 0,
                start: parseInt(customData.bg_song_start || "0", 10) || undefined,
                end: parseInt(customData.bg_song_end || "0", 10) || undefined,
              },
            }}
            onReady={e => { setYtPlayer(e.target); if (globalMuted) e.target.mute(); }}
            onStateChange={e => { if (e.data === 0) e.target.playVideo(); }}
          />
        </div>
      )}
    </div>
  );
}
