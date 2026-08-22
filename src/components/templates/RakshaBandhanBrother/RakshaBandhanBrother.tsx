"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Sparkles, RotateCcw, Share2, Music, Check } from "lucide-react";

import { Burst, Confetti, Orbs } from "../RakshaBandhan/Confetti";
import { Diya } from "../RakshaBandhan/Diya";
import { RakhiTieBrother, RAKHI_OPTIONS } from "./RakhiTieBrother";
import { PhotoCollageSlide } from "./PhotoCollageSlide";
import { RakshaPosterModalBrother } from "./RakshaPosterModalBrother";
import SongLibraryPopup from "@/components/SongLibraryPopup";

/* ─── Props ─────────────────────────────────────────────────────── */
interface RakshaBrotherProps {
  customData?: Record<string, string>;
  editMode?: boolean;
  onFieldChange?: (id: string, val: string) => void;
  forcedSlide?: number;
  autoPlay?: boolean;
}

/* ─── Stage type ─────────────────────────────────────────────────── */
type Stage = "intro" | "rakhi" | "collage" | "diyas" | "promises" | "letter";

/* ─── Slide # → Stage map ────────────────────────────────────────── */
function stageFromSlide(n?: number): Stage {
  if (n === 0) return "intro";
  if (n === 1) return "rakhi";
  if (n === 2) return "collage";
  if (n === 3) return "diyas";
  if (n === 4) return "promises";
  if (n === 5) return "letter";
  return "intro";
}

/* ─── Inline Editable Text (ET) ─────────────────────────────────── */
function ET({
  fid,
  d,
  onChange,
  multiline = false,
  editMode = false,
  darkText = false,
  def = "",
}: {
  fid: string;
  d: Record<string, string>;
  onChange?: (id: string, val: string) => void;
  multiline?: boolean;
  editMode?: boolean;
  darkText?: boolean;
  def?: string;
}) {
  const text = d[fid] !== undefined ? d[fid] : def;

  if (!editMode) {
    if (multiline) {
      return (
        <>
          {text.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </>
      );
    }
    return <>{text}</>;
  }

  const baseStyle: React.CSSProperties = {
    background: darkText ? "rgba(180, 80, 20, 0.12)" : "rgba(255, 255, 255, 0.18)",
    border: darkText ? "1.5px dashed #b45014" : "1.5px dashed #f5c842",
    borderRadius: 8,
    padding: "3px 8px",
    color: "inherit",
    fontFamily: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
    outline: "none",
    width: multiline ? "100%" : "auto",
    minWidth: 80,
    boxSizing: "border-box",
  };

  if (multiline) {
    return (
      <textarea
        value={text}
        onChange={(e) => onChange?.(fid, e.target.value)}
        style={{ ...baseStyle, resize: "vertical", minHeight: 70 }}
      />
    );
  }

  return (
    <input
      type="text"
      value={text}
      onChange={(e) => onChange?.(fid, e.target.value)}
      style={baseStyle}
    />
  );
}

/* ─── Generic Stage Wrapper ──────────────────────────────────────── */
function Stagewrap({
  children,
  soft = false,
}: {
  children: React.ReactNode;
  soft?: boolean;
}) {
  return (
    <section
      className={soft ? "raksha-gradient-bg-soft" : "raksha-gradient-bg"}
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
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          width: "100%",
          maxWidth: 520,
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   STAGE 0 — INTRO
══════════════════════════════════════════════════════ */
function IntroSlide({
  onDone,
  d,
  editMode,
  onFieldChange,
}: {
  onDone: () => void;
  d: Record<string, string>;
  editMode: boolean;
  onFieldChange?: (id: string, val: string) => void;
}) {
  const siblingName = d.rb_sibling_name || "Bhaiya";

  return (
    <Stagewrap>
      <div className="raksha-marigold-ring">
        <div style={{ fontSize: "clamp(3.5rem, 12vw, 5.5rem)" }}>🎀</div>
      </div>

      <p className="raksha-animate-fade-in-up" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.3em", color: "#f5c842", marginTop: 24 }}>
        Raksha Bandhan Greetings
      </p>

      <h1
        className="raksha-animate-fade-in-up"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(2.2rem, 8vw, 3.8rem)",
          textAlign: "center",
          lineHeight: 1.15,
          margin: "12px 0 20px",
          background: "linear-gradient(135deg, #fff4c2 0%, #f5c842 50%, #ff9d00 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Happy Raksha Bandhan, <br />
        <ET fid="rb_sibling_name" d={d} onChange={onFieldChange} editMode={editMode} def={siblingName} />!
      </h1>

      <p style={{ textAlign: "center", maxWidth: 360, color: "#f0cfa8", lineHeight: 1.6 }}>
        A special gift crafted with endless love, laughter, and lifelong memories just for you.
      </p>

      <button className="raksha-btn-pill raksha-btn-pill-saffron raksha-animate-fade-in-up" style={{ marginTop: 32 }} onClick={onDone}>
        Begin Experience ✨
      </button>
    </Stagewrap>
  );
}

/* ══════════════════════════════════════════════════════
   STAGE 3 — DIYAS
══════════════════════════════════════════════════════ */
function DiyaSlide({ onContinue, editMode }: { onContinue: () => void; editMode: boolean }) {
  const [litCount, setLitCount] = useState(editMode ? 5 : 0);

  const toggle = (i: number) => {
    if (editMode) return;
    setLitCount((c) => {
      const next = Math.min(5, c + 1);
      if (next === 5) setTimeout(onContinue, 1800);
      return next;
    });
  };

  return (
    <Stagewrap soft>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.6rem, 6vw, 2.5rem)",
          textAlign: "center",
          margin: "0 0 8px",
          background: "linear-gradient(135deg, #fff4c2 0%, #f5c842 50%, #ff9d00 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Light the Aarti Diyas 🪔
      </h2>
      <p style={{ marginTop: 0, textAlign: "center", fontSize: 14, color: "#f0cfa8" }}>
        {editMode ? "Preview — diyas lit" : "Tap each diya to light the sacred flame"}
      </p>

      <div style={{ marginTop: 40, display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {[0, 1, 2, 3, 4].map((idx) => (
          <Diya key={idx} lit={idx < litCount} onLight={() => toggle(idx)} />
        ))}
      </div>

      {(litCount === 5 || editMode) && (
        <button className="raksha-btn-pill raksha-btn-pill-saffron raksha-animate-fade-in-up" style={{ marginTop: 40 }} onClick={onContinue}>
          Continue →
        </button>
      )}
    </Stagewrap>
  );
}

/* ══════════════════════════════════════════════════════
   STAGE 4 — PROMISES
══════════════════════════════════════════════════════ */
const DEFAULT_PROMISES_BROTHER = [
  { id: "rb_promise1", def: "I'll always save the last slice of pizza for you" },
  { id: "rb_promise2", def: "I'll always cover for you when you're late" },
  { id: "rb_promise3", def: "I'll always celebrate every one of your big wins" },
  { id: "rb_promise4", def: "I'll always be here whenever you need me" },
];

function PromiseSlide({
  onContinue,
  d,
  editMode,
  onFieldChange,
}: {
  onContinue: () => void;
  d: Record<string, string>;
  editMode: boolean;
  onFieldChange?: (id: string, v: string) => void;
}) {
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false, false]);
  const flip = (i: number) => {
    if (editMode) return;
    setFlipped((f) => {
      const next = [...f];
      next[i] = true;
      return next;
    });
  };

  const flippedCount = flipped.filter(Boolean).length;

  return (
    <Stagewrap>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.6rem, 6vw, 2.5rem)",
          textAlign: "center",
          margin: "0 0 8px",
          background: "linear-gradient(135deg, #fff4c2 0%, #f5c842 50%, #ff9d00 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Promises for Bhaiya 📜
      </h2>
      <p style={{ marginTop: 0, textAlign: "center", fontSize: 14, color: "#f0cfa8" }}>
        {editMode ? "Preview — cards shown flipped" : "Tap each card to reveal my promises for you"}
      </p>

      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%", maxWidth: 440 }}>
        {DEFAULT_PROMISES_BROTHER.map((p, idx) => {
          const isFlipped = editMode || flipped[idx];
          return (
            <div
              key={p.id}
              className="raksha-promise-card-scene"
              style={{ height: 170, cursor: editMode ? "default" : "pointer" }}
              onClick={() => flip(idx)}
            >
              <div className={`raksha-promise-card-inner ${isFlipped ? "flipped" : ""}`} style={{ height: "100%" }}>
                {/* Front */}
                <div
                  className="raksha-promise-card-face raksha-glass-card"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(245,200,66,0.15))" }}
                >
                  <span style={{ fontSize: 24, marginBottom: 8 }}>🎁</span>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#ffe0a0" }}>
                    Promise #{idx + 1}
                  </span>
                  <span style={{ fontSize: 10, color: "#f0cfa8", marginTop: 4 }}>Tap to reveal</span>
                </div>

                {/* Back */}
                <div
                  className="raksha-promise-card-face raksha-promise-card-back raksha-glass-card"
                  style={{ background: "linear-gradient(135deg, rgba(224,24,90,0.25), rgba(245,200,66,0.3))", border: "1.5px solid #f5c842" }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", textAlign: "center", lineHeight: 1.5 }}>
                    <ET fid={p.id} d={d} onChange={onFieldChange} editMode={editMode} multiline def={p.def} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(flippedCount === 4 || editMode) && (
        <button className="raksha-btn-pill raksha-btn-pill-saffron raksha-animate-fade-in-up" style={{ marginTop: 32 }} onClick={onContinue}>
          Continue →
        </button>
      )}
    </Stagewrap>
  );
}

/* ══════════════════════════════════════════════════════
   STAGE 5 — LETTER
══════════════════════════════════════════════════════ */
function LetterSlideBrother({
  onReset,
  d,
  editMode,
  onFieldChange,
}: {
  onReset: () => void;
  d: Record<string, string>;
  editMode: boolean;
  onFieldChange?: (id: string, v: string) => void;
}) {
  const letterRef = useRef<HTMLDivElement>(null);
  const [sealed, setSealed] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);

  const siblingName = d.rb_sibling_name || "Bhaiya";
  const senderName = d.rb_sender_name || "Your Didi";
  const finalMessage =
    d.rb_final_message ||
    "No matter how much we fight, you'll always be my favorite protector & partner in crime.";

  const date = useMemo(
    () => new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }),
    [],
  );

  return (
    <Stagewrap>
      {!editMode && <Confetti count={50} />}

      {/* Letter Paper */}
      <div
        ref={letterRef}
        className="raksha-letter-paper"
        style={{ position: "relative", width: "100%", maxWidth: 520, padding: "36px 28px" }}
      >
        {/* Header */}
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "#9a5a20",
          }}
        >
          <span>A Letter for Bhaiya</span>
          <span>{date}</span>
        </div>

        {/* Greeting */}
        <h2
          style={{
            fontFamily: "'Pacifico', cursive",
            marginTop: 24,
            fontSize: "clamp(1.4rem, 5vw, 2rem)",
            color: "#7c1c3a",
          }}
        >
          Dear {siblingName},
        </h2>

        {/* Divider */}
        <div style={{ margin: "20px 0", height: 1, background: "linear-gradient(90deg, #ff7c1a55, transparent)" }} />

        {/* Body */}
        <div style={{ fontSize: "clamp(14px, 3vw, 16px)", lineHeight: 2, color: "#3a1d0a" }}>
          <p style={{ margin: "0 0 16px" }}>Happy Raksha Bandhan to my world&apos;s best brother.</p>
          <p style={{ margin: "0 0 16px" }}>
            {editMode ? (
              <ET fid="rb_final_message" d={d} onChange={onFieldChange} editMode={editMode} multiline darkText def={finalMessage} />
            ) : (
              <>{finalMessage} This thread binds our bond with eternal happiness, laughter, and unbreakable support.</>
            )}
          </p>
          {!editMode && (
            <p style={{ margin: 0 }}>
              Thank you for always protecting me, standing by my side, and bringing joy to my life. Here&apos;s to forever!
            </p>
          )}
        </div>

        {/* Sign-off */}
        <p style={{ marginTop: 32, textAlign: "right", fontSize: "1.15rem", color: "#7c1c3a", fontFamily: "'Pacifico', cursive" }}>
          — with love,{" "}
          {editMode ? (
            <ET fid="rb_sender_name" d={d} onChange={onFieldChange} editMode={editMode} darkText def={senderName} />
          ) : (
            <>{senderName} 🎀</>
          )}
        </p>

        {/* Stamp */}
        {sealed && !editMode && (
          <div className="raksha-stamp" style={{ top: "auto", bottom: -26, left: "22%" }}>
            <div>Seen by {siblingName}</div>
            <div>on {date}</div>
            <div style={{ marginTop: 4, fontSize: 9 }}>Made by ARADHYA E-GIFT</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ position: "relative", zIndex: 30, marginTop: 36, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <button className="raksha-btn-pill" style={{ display: "inline-flex", alignItems: "center", gap: 8 }} onClick={onReset}>
          <RotateCcw size={14} /> Experience again
        </button>
        {!sealed ? (
          <button
            className="raksha-btn-pill raksha-btn-pill-saffron"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            onClick={() => {
              if (!editMode) {
                setSealed(true);
                setPosterOpen(true);
              }
            }}
          >
            <Sparkles size={14} /> Seal & Generate Memory Poster 💌
          </button>
        ) : (
          <button
            className="raksha-btn-pill raksha-btn-pill-saffron"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            onClick={() => setPosterOpen(true)}
          >
            <Sparkles size={14} /> 9:16 Memory Poster 🖼️
          </button>
        )}
      </div>

      {/* Poster Modal */}
      {posterOpen && <RakshaPosterModalBrother d={d} onClose={() => setPosterOpen(false)} />}
    </Stagewrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN EXPORT COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function RakshaBandhanBrother({
  customData = {},
  editMode = false,
  onFieldChange,
  forcedSlide,
  autoPlay,
}: RakshaBrotherProps) {
  const d = customData;

  const [selectedRakhi, setSelectedRakhi] = useState(d.rb_selected_rakhi || "dietcoke");
  const [stage, setStage] = useState<Stage>(forcedSlide != null ? stageFromSlide(forcedSlide) : "intro");
  const [bgModalOpen, setBgModalOpen] = useState(false);

  useEffect(() => {
    if (forcedSlide != null) setStage(stageFromSlide(forcedSlide));
  }, [forcedSlide]);

  const handleRakhiSelect = (id: string) => {
    setSelectedRakhi(id);
    onFieldChange?.("rb_selected_rakhi", id);
  };

  const go = (s: Stage) => { if (!editMode) setStage(s); };
  const reset = () => setStage("intro");

  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Inter:wght@300;400;500;600&family=Pacifico&display=swap');
      `}</style>

      {d.bg_song_url && !editMode && (
        <audio id="raksha-bg-audio" src={d.bg_song_url} autoPlay loop />
      )}

      {stage === "intro"    && <IntroSlide    onDone={() => go("rakhi")}     d={d} editMode={editMode} onFieldChange={onFieldChange} />}
      {stage === "rakhi"    && <RakhiTieBrother selectedRakhi={selectedRakhi} onSelectRakhi={handleRakhiSelect} onContinue={() => go("collage")} editMode={editMode} />}
      {stage === "collage"  && <PhotoCollageSlide onContinue={() => go("diyas")} d={d} editMode={editMode} onFieldChange={onFieldChange} />}
      {stage === "diyas"    && <DiyaSlide     onContinue={() => go("promises")} editMode={editMode} />}
      {stage === "promises" && <PromiseSlide  onContinue={() => go("letter")} d={d} editMode={editMode} onFieldChange={onFieldChange} />}
      {stage === "letter"   && <LetterSlideBrother onReset={reset} d={d} editMode={editMode} onFieldChange={onFieldChange} />}

      {editMode && forcedSlide === -1 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            background: "rgba(10, 4, 14, 0.95)",
            backdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            color: "#fff",
            textAlign: "center",
          }}
        >
          <Music size={48} style={{ color: "#f5c842", marginBottom: 16 }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, margin: "0 0 8px", color: "#ffe0a0" }}>
            Background Music Settings
          </h2>
          <p style={{ fontSize: 14, color: "#f0cfa8", maxWidth: 360, margin: "0 0 20px" }}>
            Choose a background song from the song library to play during the website experience.
          </p>

          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "16px 20px",
              width: "100%",
              maxWidth: 340,
              border: "1px solid rgba(245,200,66,0.3)",
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 12, textTransform: "uppercase", color: "#f5c842", fontWeight: 700, marginBottom: 4 }}>
              Current Selected Song
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
              {d.bg_song_name || "Classic Saffron Tune"}
            </div>
            {d.bg_song_url ? (
              <div style={{ fontSize: 12, color: "#4ade80", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <Check size={14} /> Song audio linked
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#f87171", marginTop: 4 }}>No song URL selected</div>
            )}
          </div>

          <button
            className="raksha-btn-pill raksha-btn-pill-saffron"
            onClick={() => setBgModalOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Music size={16} /> Open Song Library 🎵
          </button>
        </div>
      )}

      {bgModalOpen && (
        <SongLibraryPopup
          onClose={() => setBgModalOpen(false)}
          onSelect={(song) => {
            onFieldChange?.("bg_song_name", song.name);
            onFieldChange?.("bg_song_url", song.url);
            setBgModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
