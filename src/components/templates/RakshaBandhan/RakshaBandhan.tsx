"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronUp, RotateCcw, Share2, Sparkles, Stamp as StampIcon } from "lucide-react";
import html2canvas from "html2canvas";
import { Burst, Confetti, Orbs } from "./Confetti";
import { Diya } from "./Diya";
import { RakhiTie } from "./RakhiTie";

/* ─── Props ─────────────────────────────────────────────────────── */
interface RakshaProps {
  customData?: Record<string, string>;
  editMode?: boolean;
  onFieldChange?: (id: string, val: string) => void;
  forcedSlide?: number;
  autoPlay?: boolean;
}

/* ─── Stage type ─────────────────────────────────────────────────── */
type Stage = "intro" | "rakhi" | "diyas" | "promises" | "envelope" | "letter";

/* ─── Slide # → Stage map ────────────────────────────────────────── */
function stageFromSlide(n?: number): Stage {
  if (n === 0) return "intro";
  if (n === 1) return "rakhi";
  if (n === 2) return "diyas";
  if (n === 3) return "promises";
  if (n === 4) return "envelope";
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
  def = "",
  darkText = false,
}: {
  fid: string;
  d: Record<string, string>;
  onChange?: (id: string, v: string) => void;
  multiline?: boolean;
  editMode?: boolean;
  def?: string;
  darkText?: boolean;
}) {
  const value = d[fid] !== undefined ? d[fid] : def;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(d[fid] !== undefined ? d[fid] : def), [d, fid, def]);
  const commit = () => { onChange?.(fid, draft); setEditing(false); };
  if (!editMode) return <span>{value}</span>;
  if (editing) {
    const s: React.CSSProperties = {
      display: "block", width: "100%", border: "2px solid #ff7c1a",
      borderRadius: 8, padding: "8px 12px",
      background: "rgba(255,255,255,0.92)", outline: "none",
      color: "#333", fontFamily: "sans-serif",
    };
    return multiline
      ? <textarea value={draft} rows={3} autoFocus onChange={e => setDraft(e.target.value)} onBlur={commit} style={{ ...s, resize: "vertical" }} />
      : <input value={draft} autoFocus onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={e => e.key === "Enter" && commit()} style={s} />;
  }
  return (
    <div
      onClick={e => { e.stopPropagation(); setEditing(true); }}
      title="Click to edit"
      style={{
        position: "relative", cursor: "text",
        border: "2px dashed rgba(255,124,26,0.7)",
        borderRadius: 8, padding: "8px 12px 22px",
        background: darkText ? "rgba(255,255,255,0.8)" : "rgba(255,124,26,0.05)",
        marginBottom: 4, display: "inline-block", width: "100%",
      }}
    >
      <span style={{ display: "block", color: darkText ? "#333" : "rgba(255,255,255,0.95)", WebkitTextFillColor: darkText ? "#333" : "rgba(255,255,255,0.95)" }}>
        {value || <em style={{ opacity: 0.4, fontSize: 13 }}>Click to edit</em>}
      </span>
      <span style={{ position: "absolute", bottom: 3, right: 8, fontSize: 10, color: "#ff7c1a", fontWeight: 700, WebkitTextFillColor: "#ff7c1a" }}>✏️ click to edit</span>
    </div>
  );
}

/* ─── Stage wrapper ──────────────────────────────────────────────── */
function Stagewrap({ children, soft }: { children: React.ReactNode; soft?: boolean }) {
  return (
    <section
      className={soft ? "raksha-gradient-soft" : "raksha-gradient-bg"}
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
        animation: "raksha-fade-in-up 0.7s cubic-bezier(0.2,0.8,0.2,1) both",
      }}
    >
      <Orbs />
      <div style={{ position: "relative", zIndex: 10, display: "flex", width: "100%", flexDirection: "column", alignItems: "center" }}>
        {children}
      </div>
    </section>
  );
}

/* ─── Decorative rakhi motif ─────────────────────────────────────── */
function RakhiMotif() {
  return (
    <svg
      width="96"
      height="48"
      viewBox="0 0 96 48"
      className="raksha-animate-float-soft"
      style={{ position: "absolute", right: 20, top: 20, zIndex: 10, opacity: 0.9 }}
      aria-hidden="true"
    >
      <path d="M2 24 C12 12, 20 36, 30 24" stroke="#ff7c1a" strokeWidth="2.5" fill="none" />
      <path d="M66 24 C76 12, 84 36, 94 24" stroke="#ff7c1a" strokeWidth="2.5" fill="none" />
      <circle cx="48" cy="24" r="15" fill="#ff7c1a" stroke="#f5c842" strokeWidth="2" />
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse
          key={i}
          cx="48"
          cy="15"
          rx="3.5"
          ry="7"
          fill="#f5c842"
          transform={`rotate(${i * 60} 48 24)`}
        />
      ))}
      <circle cx="48" cy="24" r="3.5" fill="#fff4c2" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════ */
export default function RakshaBandhan({
  customData = {},
  editMode = false,
  onFieldChange,
  forcedSlide,
  autoPlay,
}: RakshaProps) {
  const d = customData;

  const [stage, setStage] = useState<Stage>(forcedSlide != null ? stageFromSlide(forcedSlide) : "intro");

  useEffect(() => {
    if (forcedSlide != null) setStage(stageFromSlide(forcedSlide));
  }, [forcedSlide]);

  // Auto-play cycling for homepage preview
  useEffect(() => {
    if (!autoPlay || editMode) return;
    const stages: Stage[] = ["intro", "rakhi", "diyas", "promises", "envelope", "letter"];
    const timer = setInterval(() => {
      setStage(current => {
        const idx = stages.indexOf(current);
        return stages[(idx + 1) % stages.length];
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [autoPlay, editMode]);

  const go = (s: Stage) => { if (!editMode) setStage(s); };
  const reset = () => setStage("intro");

  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Inter:wght@300;400;500;600&family=Pacifico&display=swap');
      `}</style>

      {stage === "intro"    && <IntroSlide    onDone={() => go("rakhi")}     d={d} editMode={editMode} onFieldChange={onFieldChange} />}
      {stage === "rakhi"    && <RakhiSlide    onComplete={() => go("diyas")} d={d} editMode={editMode} />}
      {stage === "diyas"    && <DiyaSlide     onContinue={() => go("promises")} d={d} editMode={editMode} />}
      {stage === "promises" && <PromiseSlide  onContinue={() => go("envelope")} d={d} editMode={editMode} onFieldChange={onFieldChange} />}
      {stage === "envelope" && <EnvelopeSlide onOpen={() => go("letter")}    editMode={editMode} />}
      {stage === "letter"   && <LetterSlide   onReset={reset} d={d} editMode={editMode} onFieldChange={onFieldChange} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STAGE 1 — INTRO
══════════════════════════════════════════════════════ */
const INTRO_MESSAGES = [
  { text: "Hey {name},", sub: "this is for you 🎀", icon: "✦" },
  { text: "A little something", sub: "crafted with all my love.", icon: "✦" },
  { text: "This Raksha Bandhan,", sub: "I wanted to do something special.", icon: "✦" },
];

function IntroSlide({ onDone, d, editMode, onFieldChange }: {
  onDone: () => void;
  d: Record<string, string>;
  editMode: boolean;
  onFieldChange?: (id: string, v: string) => void;
}) {
  const siblingName = d.rb_sibling_name || "Didi";
  const [index, setIndex] = useState(editMode ? 2 : 0);
  const [leaving, setLeaving] = useState(false);
  const [ready, setReady] = useState(editMode);

  useEffect(() => {
    if (ready || editMode) return;
    const out = setTimeout(() => setLeaving(true), 2600);
    const next = setTimeout(() => {
      setLeaving(false);
      if (index === INTRO_MESSAGES.length - 1) setReady(true);
      else setIndex(i => i + 1);
    }, 3200);
    return () => { clearTimeout(out); clearTimeout(next); };
  }, [index, ready, editMode]);

  const m = INTRO_MESSAGES[index] ?? INTRO_MESSAGES[0]!;
  const displayText = m.text.replace("{name}", siblingName);

  return (
    <Stagewrap>
      <RakhiMotif />
      {!ready ? (
        <div
          key={index}
          style={{ textAlign: "center" }}
          className={leaving ? "raksha-animate-fade-out-up" : "raksha-animate-fade-in-up"}
        >
          <div style={{ color: "#f5c842", marginBottom: 16, fontSize: 22 }}>{m.icon}</div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 8vw, 3.5rem)",
              lineHeight: 1.1,
              margin: 0,
              background: "linear-gradient(135deg, #ffe0a0 0%, #ff7c1a 50%, #e0185a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {displayText}
          </h1>
          <p style={{ marginTop: 16, fontSize: "1rem", color: "#f0cfa8" }}>{m.sub}</p>
        </div>
      ) : (
        <div className="raksha-animate-fade-in-up raksha-glass-card" style={{ width: "100%", maxWidth: 440, padding: "40px 28px", textAlign: "center" }}>
          <Sparkles style={{ margin: "0 auto 16px", color: "#f5c842", display: "block" }} size={24} />
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.6rem, 6vw, 2.5rem)",
              margin: "0 0 8px",
              background: "linear-gradient(135deg, #ffe0a0 0%, #ff7c1a 50%, #e0185a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Shall we begin?
          </h1>
          {editMode && (
            <div style={{ marginBottom: 16, marginTop: 12 }}>
              <label style={{ fontSize: 12, color: "#f0cfa8", display: "block", marginBottom: 4 }}>Sibling&apos;s Name</label>
              <ET fid="rb_sibling_name" d={d} onChange={onFieldChange} editMode={editMode} def="Didi" />
            </div>
          )}
          <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <button className="raksha-btn-pill raksha-btn-pill-saffron" onClick={onDone}>
              Yes, of course 🎀
            </button>
            <button className="raksha-btn-pill" onClick={onDone}>
              Let&apos;s go 💛
            </button>
          </div>
          <p style={{ fontFamily: "'Pacifico', cursive", marginTop: 32, fontSize: 18, color: "#f5c842" }}>made with love</p>
        </div>
      )}
    </Stagewrap>
  );
}

/* ══════════════════════════════════════════════════════
   STAGE 2 — RAKHI TIE
══════════════════════════════════════════════════════ */
function RakhiSlide({ onComplete, d, editMode }: {
  onComplete: () => void;
  d: Record<string, string>;
  editMode: boolean;
}) {
  const [progress, setProgress] = useState(editMode ? 1 : 0);
  const [tied, setTied] = useState(editMode);

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
        Tie the Rakhi 🎀
      </h2>
      <p style={{ marginTop: 0, textAlign: "center", fontSize: 14, color: "#f0cfa8" }}>
        {editMode ? "Preview — rakhi shown tied" : "Drag the thread across the wrist to tie it"}
      </p>

      {/* Progress bar */}
      <div style={{ marginTop: 24, height: 8, width: "100%", maxWidth: 320, overflow: "hidden", borderRadius: 999, background: "rgba(255,255,255,0.1)" }}>
        <div
          style={{
            height: "100%",
            borderRadius: 999,
            transition: "width 0.15s",
            width: `${Math.round(progress * 100)}%`,
            background: "linear-gradient(90deg, #f5c842, #ff7c1a)",
            boxShadow: "0 0 16px 2px rgba(255,124,26,0.7)",
          }}
        />
      </div>

      <div className="raksha-glass-card" style={{ marginTop: 32, padding: "16px 12px" }}>
        <RakhiTie
          progress={progress}
          onProgress={setProgress}
          tied={tied}
          onTied={() => { setProgress(1); setTied(true); }}
          editMode={editMode}
        />
      </div>

      {(tied || editMode) && (
        <div className="raksha-animate-fade-in-up raksha-glass-card" style={{ marginTop: 32, width: "100%", maxWidth: 360, padding: "28px 24px", textAlign: "center" }}>
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.5rem",
              margin: "0 0 8px",
              background: "linear-gradient(135deg, #ffe0a0 0%, #ff7c1a 50%, #e0185a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Rakhi tied! 🎉
          </h3>
          <p style={{ marginTop: 8, fontSize: 14, color: "#f0cfa8" }}>
            A thread of protection, tied with a thousand memories.
          </p>
          <button className="raksha-btn-pill raksha-btn-pill-saffron" style={{ marginTop: 24 }} onClick={onComplete}>
            Continue →
          </button>
        </div>
      )}
    </Stagewrap>
  );
}

/* ══════════════════════════════════════════════════════
   STAGE 3 — LIGHT THE DIYAS
══════════════════════════════════════════════════════ */
function DiyaSlide({ onContinue, d, editMode }: {
  onContinue: () => void;
  d: Record<string, string>;
  editMode: boolean;
}) {
  const [litStates, setLitStates] = useState(
    editMode ? [true, true, true, true, true] : [false, false, false, false, false]
  );
  const litCount = litStates.filter(Boolean).length;
  const allLit = litCount === 5;

  return (
    <Stagewrap>
      {allLit && !editMode && <Confetti count={30} />}
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.6rem, 6vw, 2.5rem)",
          textAlign: "center",
          margin: "0 0 8px",
          background: "linear-gradient(135deg, #ffe0a0 0%, #ff7c1a 50%, #e0185a 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Light the Diyas 🪔
      </h2>
      <p style={{ marginTop: 0, textAlign: "center", fontSize: 14, color: "#f0cfa8" }}>
        {editMode ? "Preview — all diyas shown lit" : "Tap each diya to light it"}
      </p>

      <div
        className="raksha-glass-card"
        style={{
          marginTop: 40,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 24,
          padding: "32px 24px",
        }}
      >
        {litStates.map((lit, i) => (
          <span key={i} style={{ transform: `translateY(${[10, 0, -8, 0, 10][i]}px)`, display: "inline-block" }}>
            <Diya
              lit={lit}
              onLight={() => !editMode && setLitStates(s => s.map((v, j) => (j === i ? true : v)))}
            />
          </span>
        ))}
      </div>

      <p style={{ marginTop: 24, fontSize: 14, color: "#f0cfa8" }}>{litCount} / 5 lit</p>

      {(allLit || editMode) && (
        <div className="raksha-animate-fade-in-up" style={{ marginTop: 32, textAlign: "center" }}>
          <p style={{ fontFamily: "'Pacifico', cursive", fontSize: 20, color: "#f5c842" }}>
            may your life always glow like this
          </p>
          <button className="raksha-btn-pill raksha-btn-pill-saffron" style={{ marginTop: 24 }} onClick={onContinue}>
            Continue →
          </button>
        </div>
      )}
    </Stagewrap>
  );
}

/* ══════════════════════════════════════════════════════
   STAGE 4 — PROMISE CARDS
══════════════════════════════════════════════════════ */
function PromiseSlide({ onContinue, d, editMode, onFieldChange }: {
  onContinue: () => void;
  d: Record<string, string>;
  editMode: boolean;
  onFieldChange?: (id: string, v: string) => void;
}) {
  const defaultPromises = [
    "I'll always be\nyour safe space",
    "I'll protect you,\nalways & forever",
    "I'll celebrate\nevery win with you",
    "I'll be there\nin every storm",
  ];
  const defaultGifs = [
    "/templates/raksha-bandhan/bear1.gif",
    "/templates/raksha-bandhan/bear2.gif",
    "/templates/raksha-bandhan/bear3.gif",
    "/templates/raksha-bandhan/bear4.gif",
  ];

  const [flipped, setFlipped] = useState(editMode ? [true, true, true, true] : [false, false, false, false]);
  const flippedCount = flipped.filter(Boolean).length;

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
        My Promises to You 💛
      </h2>
      <p style={{ marginTop: 0, textAlign: "center", fontSize: 14, color: "#f0cfa8" }}>
        {editMode ? "Edit promise texts below" : "Click each card to reveal"}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          width: "100%",
          maxWidth: 480,
          margin: "40px auto 0",
        }}
      >
        {[0, 1, 2, 3].map(i => {
          const fid = `rb_promise${i + 1}`;
          const imgFid = `rb_img${i + 1}`;
          const promiseText = d[fid] !== undefined ? d[fid] : defaultPromises[i];
          const bearGif = d[imgFid] || defaultGifs[i];
          const isFlipped = flipped[i];

          return (
            <div
              key={i}
              className="raksha-promise-card-scene"
              style={{ position: "relative", height: editMode ? "auto" : 185, cursor: isFlipped || editMode ? "default" : "pointer" }}
              onClick={() => !editMode && setFlipped(f => f.map((v, j) => (j === i ? true : v)))}
            >
              {editMode ? (
                /* In edit mode: show the back (promise text) directly — editable */
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(255,124,26,0.15), rgba(245,200,66,0.15))",
                    border: "1px solid rgba(245,200,66,0.4)",
                    backdropFilter: "blur(16px)",
                    borderRadius: 20,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={bearGif}
                    alt={`bear-${i + 1}`}
                    style={{ width: 60, height: 60, objectFit: "contain", marginBottom: 8, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
                  />
                  <ET
                    fid={fid}
                    d={d}
                    onChange={onFieldChange}
                    editMode={editMode}
                    multiline
                    def={defaultPromises[i]}
                  />
                </div>
              ) : (
                <div className={`raksha-promise-card-inner ${isFlipped ? "flipped" : ""}`} style={{ height: "100%", width: "100%" }}>
                  {/* Front */}
                  <div
                    className="raksha-promise-card-face"
                    style={{
                      background: "linear-gradient(135deg, rgba(124,28,58,0.55), rgba(30,10,0,0.7))",
                      border: "1px solid rgba(224,24,90,0.4)",
                      boxShadow: "0 20px 50px -20px rgba(0,0,0,0.7)",
                    }}
                  >
                    <img
                      src={bearGif}
                      alt={`bear-${i + 1}`}
                      style={{ width: 72, height: 72, objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}
                    />
                    <span style={{ marginTop: 8, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: "#f0cfa8" }}>
                      Tap to reveal
                    </span>
                  </div>
                  {/* Back */}
                  <div
                    className="raksha-promise-card-face raksha-promise-card-back"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,124,26,0.15), rgba(245,200,66,0.15))",
                      border: "1px solid rgba(245,200,66,0.4)",
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        whiteSpace: "pre-line",
                        textAlign: "center",
                        fontSize: "1.05rem",
                        lineHeight: 1.4,
                        color: "#fff0e0",
                        margin: 0,
                      }}
                    >
                      {promiseText}
                    </p>
                  </div>
                  {isFlipped && <Burst count={10} spread={80} />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(flippedCount === 4 || editMode) && (
        <button className="raksha-btn-pill raksha-btn-pill-saffron raksha-animate-fade-in-up" style={{ marginTop: 40 }} onClick={onContinue}>
          Continue →
        </button>
      )}
    </Stagewrap>
  );
}

/* ══════════════════════════════════════════════════════
   STAGE 5 — ENVELOPE
══════════════════════════════════════════════════════ */
function EnvelopeSlide({ onOpen, editMode }: { onOpen: () => void; editMode: boolean }) {
  const startY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [open, setOpen] = useState(editMode);

  const begin = (y: number) => { startY.current = y; };
  const move = (y: number) => {
    if (open || startY.current === null || editMode) return;
    const delta = y - startY.current;
    if (delta < 0) setDragY(delta * 0.4);
    if (delta < -70) {
      setOpen(true);
      setTimeout(onOpen, 1500);
    }
  };
  const end = () => {
    startY.current = null;
    if (!open) setDragY(0);
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
        One Last Thing… 💌
      </h2>
      <p style={{ marginTop: 0, textAlign: "center", fontSize: 14, color: "#f0cfa8" }}>
        {editMode ? "Preview — envelope shown open" : "A letter — just for you"}
      </p>

      <div className="raksha-envelope-wrap" style={{ marginTop: 48 }}>
        <div
          className={`raksha-envelope ${open ? "open" : ""} raksha-animate-float-soft`}
          style={{
            transform: `translateY(${dragY}px)`,
            touchAction: "none",
            cursor: open || editMode ? "default" : "grab",
          }}
          onPointerDown={editMode ? undefined : (e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            begin(e.clientY);
          }}
          onPointerMove={editMode ? undefined : (e) => move(e.clientY)}
          onPointerUp={editMode ? undefined : end}
          onPointerCancel={editMode ? undefined : end}
        >
          <div className="raksha-envelope-letter-peek" />
          <div className="raksha-envelope-flap" />
          <div className="raksha-envelope-body-front" />
        </div>
      </div>

      {!open && !editMode && (
        <div className="raksha-animate-slide-hint" style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "#f0cfa8" }}>
          <ChevronUp size={24} />
          <span style={{ fontSize: 14 }}>Slide up to open</span>
        </div>
      )}
    </Stagewrap>
  );
}

/* ══════════════════════════════════════════════════════
   STAGE 6 — LETTER
══════════════════════════════════════════════════════ */
function LetterSlide({ onReset, d, editMode, onFieldChange }: {
  onReset: () => void;
  d: Record<string, string>;
  editMode: boolean;
  onFieldChange?: (id: string, v: string) => void;
}) {
  const letterRef = useRef<HTMLDivElement>(null);
  const [sealed, setSealed] = useState(false);
  const [sharing, setSharing] = useState(false);

  const siblingName = d.rb_sibling_name || "Didi";
  const senderName = d.rb_sender_name || "Your Bhai";
  const finalMessage = d.rb_final_message || "No matter how far life takes us, this thread always finds its way back to you.";

  const date = useMemo(
    () => new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }),
    [],
  );

  const share = async () => {
    if (!letterRef.current) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(letterRef.current, { backgroundColor: "#fffbf0", scale: 2 });
      const blob: Blob | null = await new Promise(r => canvas.toBlob(r, "image/png"));
      if (!blob) return;
      const file = new File([blob], "raksha-bandhan-letter.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: "Happy Raksha Bandhan 🎀" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "raksha-bandhan-letter.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

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
          <span>A Letter</span>
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
          <p style={{ margin: "0 0 16px" }}>Happy Raksha Bandhan, my favorite person in the whole world.</p>
          <p style={{ margin: "0 0 16px" }}>
            {editMode
              ? <ET fid="rb_final_message" d={d} onChange={onFieldChange} editMode={editMode} multiline darkText def={finalMessage} />
              : <>{finalMessage} This little thread is a symbol of everything I can never quite say out loud — but today I&apos;m trying.</>
            }
          </p>
          {!editMode && (
            <p style={{ margin: 0 }}>
              Thank you for growing up with me, for every fight that made us stronger, for every laugh that made life lighter. Here&apos;s to forever.
            </p>
          )}
        </div>

        {/* Sign-off */}
        <p style={{ marginTop: 32, textAlign: "right", fontSize: "1.15rem", color: "#7c1c3a", fontFamily: "'Pacifico', cursive" }}>
          — with love,{" "}
          {editMode
            ? <ET fid="rb_sender_name" d={d} onChange={onFieldChange} editMode={editMode} darkText def={senderName} />
            : <>{senderName} 🎀</>
          }
        </p>

        {/* Stamp */}
        {sealed && !editMode && (
          <div
            className="raksha-stamp"
            style={{ top: "auto", bottom: -26, left: "22%" }}
          >
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
            onClick={() => !editMode && setSealed(true)}
          >
            <StampIcon size={14} /> Seal the letter
          </button>
        ) : (
          <button
            className="raksha-btn-pill raksha-btn-pill-rose"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            onClick={share}
            disabled={sharing}
          >
            <Share2 size={14} /> {sharing ? "Preparing…" : "Share 💌"}
          </button>
        )}
      </div>
    </Stagewrap>
  );
}
