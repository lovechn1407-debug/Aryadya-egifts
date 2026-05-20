"use client";
import { useState, useEffect, useRef, useMemo, FC } from "react";
import { DndContext, useDraggable, useDroppable, DragEndEvent, closestCenter, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import confetti from "canvas-confetti";
import gsap from "gsap";
import { Music, Play, Pause, SkipBack, SkipForward, VolumeX, Volume2 } from "lucide-react";
import YouTube from "react-youtube";
import SongLibraryPopup from "../../SongLibraryPopup";
import { BearCharacter } from "./BearCharacter";
import { RosePetals } from "./RosePetals";

// ── Editable Text Component (shared pattern) ──
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
      display: "block", width: "100%", border: "2px solid #D4AF37", borderRadius: 8,
      padding: "8px 10px", background: "rgba(212,175,55,0.06)", outline: "none",
      fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit",
      color: "inherit", lineHeight: "inherit",
    };
    return multiline
      ? <textarea value={draft} rows={4} autoFocus onChange={e => setDraft(e.target.value)}
          onBlur={commit} style={{ ...style, ...base, resize: "vertical" }} />
      : <input value={draft} autoFocus onChange={e => setDraft(e.target.value)}
          onBlur={commit} onKeyDown={e => e.key === "Enter" && commit()}
          style={{ ...style, ...base }} />;
  }

  return (
    <div onClick={() => setEditing(true)} title="Click to edit" style={{
      position: "relative", cursor: "text", border: "2px dashed rgba(212,175,55,0.5)",
      borderRadius: 8, padding: "6px 10px 20px", background: "rgba(212,175,55,0.03)",
      marginBottom: 4, transition: "border-color 0.2s",
    }}>
      <span style={{ display: "block", ...style }}>
        {value || <em style={{ opacity: 0.4, fontSize: 13 }}>Click to edit</em>}
      </span>
      <span style={{ position: "absolute", bottom: 3, right: 8, fontSize: 10, color: "#D4AF37",
        fontWeight: 700, fontFamily: "'Inter',sans-serif", opacity: 0.8 }}>✏️ click to edit</span>
    </div>
  );
}

// ── Nav Bar component inside slides ──
const NavBar: FC<{ onBack?: () => void; onNext?: () => void; nextLabel?: string; backLabel?: string }> = ({
  onBack,
  onNext,
  nextLabel = "Next →",
  backLabel = "← Back",
}) => (
  <div className="flex items-center justify-center gap-4 mt-10" style={{ zIndex: 10 }}>
    {onBack && <button onClick={onBack} className="btn-ghost">{backLabel}</button>}
    {onNext && <button onClick={onNext} className="btn-rose">{nextLabel}</button>}
  </div>
);

// ── Slide -1: Background Music Editor ──
function S_Minus1({ d, ch, em, oc, bgProps }: { d: Record<string,string>; ch: () => void; em: boolean; oc?: (id:string,v:string)=>void; bgProps: any }) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-16">
      <div className="gold-card p-8 w-full max-w-md" style={{ background: "#FFF8F0" }}>
        <h2 className="font-display italic text-2xl text-center mb-2" style={{ color: "#8B1A3A" }}>
          Global Background Music 🎵
        </h2>
        <p className="font-body italic mb-6 text-center text-sm" style={{ color: "#9B7B84" }}>
          Plays continuously throughout the website
        </p>
        
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(192,57,90,0.1)", color: "#8B1A3A" }}>
          <Music size={28} />
        </div>
        
        <div className="font-ui font-semibold text-center text-lg mb-6" style={{ color: "#2A1A1F" }}>
          {d.bg_song_name || "No song selected"}
        </div>
        
        {em && (
          <div className="mb-6">
            <button onClick={() => bgProps.setIsPicking(true)} className="btn-rose text-sm">
              {d.bg_song_url ? "Change Background Music" : "Select Background Music"}
            </button>
          </div>
        )}
        
        <div>
          <button onClick={ch} className="btn-ghost text-sm" style={{ color: "#C0395A", borderColor: "#C0395A" }}>
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

// ── Slide 0: Welcome Hero ──
function S0({ d, ch, em, oc }: { d: Record<string,string>; ch: () => void; em: boolean; oc?: (id:string,v:string)=>void }) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative z-10">
      <div className="flex flex-col items-center justify-center max-w-2xl">
        <ET fid="s1_title" data={d} onChange={oc} editMode={em}
          style={{ fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.4em", fontSize: 13, color: "#D4AF37" }} />
        
        <div className="h-px w-40 my-6" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
        
        <div className="my-2">
          <ET fid="beloved_name" data={d} onChange={oc} editMode={em}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: "bold", fontSize: "clamp(3rem, 8vw, 6rem)", color: "#FFF8F0", lineHeight: "1" }} />
        </div>
        
        <div className="h-px w-32 my-6" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
        
        <ET fid="s1_tagline" data={d} onChange={oc} editMode={em} multiline
          style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "clamp(1.1rem, 2vw, 1.3rem)", color: "#F2C4CE", maxWidth: 500, lineHeight: 1.6 }} />
        
        <div className="my-8">
          <BearCharacter size={160} withBouquet />
        </div>
        
        <NavBar onNext={ch} nextLabel={d.s1_cta || "Begin Our Story →"} />
      </div>
    </section>
  );
}

// ── Slide 1: Envelope Letter ──
function S1({ d, ch, em, oc, onBack }: { d: Record<string,string>; ch: () => void; em: boolean; oc?: (id:string,v:string)=>void; onBack: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10 py-16">
      <ET fid="s2_title" data={d} onChange={oc} editMode={em}
        style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#FFF8F0", marginBottom: 40, textAlign: "center" }} />

      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div key="env" exit={{ opacity: 0, scale: 0.9 }}
            className="cursor-pointer" onClick={() => setOpen(true)}
            style={{ perspective: 800 }}>
            <div className="relative" style={{ width: 340, height: 240 }}>
              <div className="absolute inset-0 rounded-b-lg gold-card" style={{ background: "#FFF8F0" }} />
              <motion.div
                initial={{ rotateX: 0 }}
                whileHover={{ rotateX: -20 }}
                className="absolute top-0 left-0 right-0 origin-top"
                style={{
                  height: 120,
                  background: "#C0395A",
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  transformStyle: "preserve-3d",
                }}
              />
              <div className="absolute left-1/2 top-[80px] -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ background: "#8B1A3A", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
                ♡
              </div>
              <span className="absolute bottom-2 left-2" style={{ color: "#D4AF37" }}>✦</span>
              <span className="absolute bottom-2 right-2" style={{ color: "#D4AF37" }}>✦</span>
            </div>
            <p className="text-center mt-6 font-script text-2xl" style={{ color: "#F2C4CE" }}>
              {d.s2_envelope_hint || "Click to open ✨"}
            </p>
          </motion.div>
        ) : (
          <motion.div key="letter"
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="gold-card max-w-xl p-10 md:p-14"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(192,57,90,0.08) 28px, rgba(192,57,90,0.08) 29px)",
            }}>
            <div className="text-center mb-4">
              <svg width="40" height="40" viewBox="0 0 40 40" className="inline-block">
                <circle cx="20" cy="18" r="8" fill="#8B1A3A" />
                <circle cx="14" cy="22" r="6" fill="#C0395A" />
                <circle cx="26" cy="22" r="6" fill="#C0395A" />
                <path d="M20 26 L20 36" stroke="#2d5a2d" strokeWidth="2" />
              </svg>
            </div>
            <ET fid="s2_letter_greeting" data={d} onChange={oc} editMode={em}
              style={{ fontFamily: "'Sacramento', cursive", fontSize: "clamp(2rem, 5vw, 2.5rem)", color: "#C0395A", marginBottom: 24 }} />
            
            <ET fid="s2_letter_body" data={d} onChange={oc} editMode={em} multiline
              style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 16, color: "#2A1A1F", lineHeight: "1.9", marginBottom: 24 }} />

            <div className="mt-8 text-right flex flex-col items-end">
              <ET fid="s2_letter_sign" data={d} onChange={oc} editMode={em}
                style={{ fontFamily: "'Sacramento', cursive", fontSize: "clamp(1.8rem, 4vw, 2.2rem)", color: "#8B1A3A" }} />
              <span className="text-2xl" style={{ color: "#C0395A" }}>♡</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NavBar onBack={onBack} onNext={open ? ch : undefined} nextLabel="Keep Reading... →" />
    </section>
  );
}

// ── Slide 2: Heart Puzzle ──
const TILE = 70;
const SLOTS = [
  { id: "s1", col: -1.5, row: -1, color: "#C0395A" },
  { id: "s2", col: -0.5, row: -1.3, color: "#8B1A3A" },
  { id: "s3", col: 0.5, row: -1.3, color: "#8B1A3A" },
  { id: "s4", col: 1.5, row: -1, color: "#C0395A" },
  { id: "s5", col: -0.5, row: 0, color: "#C0395A" },
  { id: "s6", col: 0.5, row: 0, color: "#8B1A3A" },
];

function Piece({ id, color, dragging }: { id: string; color: string; dragging: boolean }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center text-2xl"
      style={{
        width: TILE,
        height: TILE,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        border: "2px solid #D4AF37",
        boxShadow: dragging
          ? "0 12px 28px rgba(0,0,0,0.5), 0 0 0 3px rgba(212,175,55,0.6)"
          : "0 6px 14px rgba(0,0,0,0.35)",
        color: "#FFF8F0",
        cursor: "grab",
        userSelect: "none",
      }}
    >
      ♡
    </div>
  );
}

function Draggable({ id, color }: { id: string; color: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0 : 1, touchAction: "none" }}
    >
      <Piece id={id} color={color} dragging={false} />
    </div>
  );
}

function Slot({
  id,
  col,
  row,
  color,
  filled,
}: {
  id: string;
  col: number;
  row: number;
  color: string;
  filled: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        left: `calc(50% + ${col * TILE}px - ${TILE / 2}px)`,
        top: `calc(50% + ${row * TILE}px - ${TILE / 2}px)`,
        width: TILE,
        height: TILE,
      }}
    >
      {filled ? (
        <motion.div
          initial={{ scale: 1.25 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="w-full h-full rounded-2xl flex items-center justify-center text-2xl"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            border: "2px solid #D4AF37",
            boxShadow: "0 0 16px rgba(212,175,55,0.6)",
            color: "#FFF8F0",
          }}
        >
          ♡
        </motion.div>
      ) : (
        <div
          className="w-full h-full rounded-2xl border-2 border-dashed transition-all"
          style={{
            borderColor: isOver ? "#D4AF37" : "rgba(212,175,55,0.35)",
            background: isOver ? "rgba(212,175,55,0.1)" : "transparent",
          }}
        />
      )}
    </div>
  );
}

function S2({ d, ch, em, oc, onBack, ap }: { d: Record<string,string>; ch: () => void; em: boolean; oc?: (id:string,v:string)=>void; onBack: () => void; ap?: boolean }) {
  const [filled, setFilled] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const trayOrder = useMemo(() => [...SLOTS].sort(() => Math.random() - 0.5), []);
  const won = Object.keys(filled).length === SLOTS.length || em || ap;

  useEffect(() => {
    if (won && !em && !ap) {
      confetti({
        particleCount: 100, spread: 180, origin: { y: 0.5 },
        colors: ["#C0395A", "#F2C4CE", "#D4AF37", "#FFF8F0"],
        shapes: ["circle"] as never,
      });
      const t = setTimeout(ch, 3200);
      return () => clearTimeout(t);
    }
  }, [won, ch, em, ap]);

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    if (event.over && event.over.id === event.active.id) {
      setFilled((p) => ({ ...p, [String(event.active.id)]: true }));
    }
  };

  const activeSlot = activeId ? SLOTS.find((s) => s.id === activeId) : null;

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10 py-16">
      <ET fid="s3_title" data={d} onChange={oc} editMode={em}
        style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#D4AF37", marginBottom: 8, textAlign: "center" }} />
      <ET fid="s3_subtitle" data={d} onChange={oc} editMode={em}
        style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "14px", color: "#F2C4CE", marginBottom: 24, textAlign: "center" }} />

      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Heart board */}
        <div className="relative w-full max-w-md" style={{ height: 340 }}>
          <svg
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{ transform: "translate(-50%, -50%)" }}
            width="320" height="300" viewBox="-160 -150 320 300"
          >
            <path
              d="M0,120 C-160,40 -160,-100 -80,-110 C-30,-115 0,-80 0,-50 C0,-80 30,-115 80,-110 C160,-100 160,40 0,120 Z"
              fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="6 4" opacity="0.55"
            />
          </svg>

          {SLOTS.map((s) => (
            <Slot key={s.id} id={s.id} col={s.col} row={s.row} color={s.color} filled={won ? true : !!filled[s.id]} />
          ))}

          <AnimatePresence>
            {won && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <p className="font-script text-5xl text-center" style={{ color: "#FFF8F0", textShadow: "0 0 20px #C0395A" }}>
                  {d.s3_win_text || "You complete me. ♡"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tray */}
        {!won && (
          <div className="mt-6 gold-card px-6 py-5 flex flex-wrap items-center justify-center gap-3" style={{ minHeight: 100 }}>
            {trayOrder.map((s) =>
              filled[s.id] ? (
                <div key={s.id} style={{ width: TILE, height: TILE, opacity: 0.25 }}
                  className="rounded-2xl border-2 border-dashed" />
              ) : (
                <Draggable key={s.id} id={s.id} color={s.color} />
              )
            )}
          </div>
        )}
        {won && (
          <div style={{ height: 100 }} />
        )}

        <DragOverlay>
          {activeSlot ? <Piece id={activeSlot.id} color={activeSlot.color} dragging /> : null}
        </DragOverlay>
      </DndContext>

      <NavBar onBack={onBack} onNext={won ? ch : undefined} />
    </section>
  );
}

// ── Slide 3: Memory Jar ──
function S3({ d, ch, em, oc, onBack }: { d: Record<string,string>; ch: () => void; em: boolean; oc?: (id:string,v:string)=>void; onBack: () => void }) {
  const [index, setIndex] = useState(-1);
  const [shake, setShake] = useState(0);

  const memories = useMemo(() => [
    d.s4_mem1 || "The first time I saw you smile at me 🌸",
    d.s4_mem2 || "Our late night conversations about everything ✨",
    d.s4_mem3 || "The way you laugh — it's my favourite sound 🎶",
    d.s4_mem4 || "Every moment I get to hold your hand 🤝",
    d.s4_mem5 || "Right now. Reading this. You. ♡",
  ].filter(Boolean), [d]);

  const shakeSpring = useSpring({
    rotate: shake,
    config: { tension: 300, friction: 10 },
  });

  const pull = () => {
    if (index >= memories.length - 1) return;
    setShake(5);
    setTimeout(() => setShake(-5), 100);
    setTimeout(() => setShake(0), 200);
    setIndex((i) => i + 1);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10 py-16">
      <ET fid="s4_title" data={d} onChange={oc} editMode={em}
        style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#D4AF37", marginBottom: 2, textAlign: "center" }} />
      <ET fid="s4_subtitle" data={d} onChange={oc} editMode={em}
        style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "14px", color: "#F2C4CE", marginBottom: 24, textAlign: "center" }} />

      {em && (
        <div className="gold-card p-6 w-full max-w-md mb-6" style={{ background: "#FFF8F0", zIndex: 20 }}>
          <h4 className="font-ui text-sm mb-4 font-bold" style={{ color: "#8B1A3A" }}>Edit Memory Cards:</h4>
          <div className="space-y-4">
            <ET fid="s4_mem1" data={d} onChange={oc} editMode={em} style={{ fontSize: 14, color: "#2A1A1F" }} />
            <ET fid="s4_mem2" data={d} onChange={oc} editMode={em} style={{ fontSize: 14, color: "#2A1A1F" }} />
            <ET fid="s4_mem3" data={d} onChange={oc} editMode={em} style={{ fontSize: 14, color: "#2A1A1F" }} />
            <ET fid="s4_mem4" data={d} onChange={oc} editMode={em} style={{ fontSize: 14, color: "#2A1A1F" }} />
            <ET fid="s4_mem5" data={d} onChange={oc} editMode={em} style={{ fontSize: 14, color: "#2A1A1F" }} />
          </div>
        </div>
      )}

      <div className="relative" style={{ height: 420, width: "100%", maxWidth: 360 }}>
        <AnimatePresence>
          {index >= 0 && (
            <motion.div key={index}
              initial={{ opacity: 0, y: 0, rotate: 0 }}
              animate={{ opacity: 1, y: -180, rotate: -8 }}
              exit={{ opacity: 0, y: -250 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="gold-card absolute left-1/2 -translate-x-1/2 p-6"
              style={{ width: 280, top: 100, zIndex: 10 }}>
              <span className="absolute top-2 left-3 text-xl" style={{ color: "#C0395A" }}>♡</span>
              <p className="font-script text-2xl text-center pt-4" style={{ color: "#8B1A3A" }}>
                {memories[index]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <animated.div
          onClick={pull}
          style={{
            transform: shakeSpring.rotate.to((r) => `rotate(${r}deg)`),
            cursor: index >= memories.length - 1 ? "default" : "pointer",
          }}
          className="absolute left-1/2 -translate-x-1/2"
        >
          {/* Jar SVG */}
          <svg width="180" height="240" viewBox="0 0 180 240" style={{ marginTop: 160 }}>
            <rect x="50" y="10" width="80" height="20" rx="4" fill="#D4AF37" />
            <rect x="40" y="28" width="100" height="14" rx="3" fill="rgba(255,248,240,0.5)" />
            <path d="M40,42 L40,210 Q40,230 60,230 L120,230 Q140,230 140,210 L140,42 Z"
              fill="rgba(255,248,240,0.25)" stroke="rgba(255,248,240,0.6)" strokeWidth="2" />
            {/* notes inside */}
            <rect x="55" y="180" width="20" height="14" rx="2" fill="#FFF8F0" transform="rotate(-10 65 187)" />
            <rect x="85" y="175" width="20" height="14" rx="2" fill="#FFF8F0" transform="rotate(5 95 182)" />
            <rect x="110" y="185" width="20" height="14" rx="2" fill="#FFF8F0" transform="rotate(-3 120 192)" />
            {/* highlight */}
            <path d="M55,60 L60,180" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
            <text x="90" y="135" textAnchor="middle" fontFamily="Sacramento" fontSize="22" fill="#C0395A">
              Our Memories
            </text>
          </svg>
        </animated.div>
      </div>

      <div className="flex gap-2 mt-6">
        {memories.map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full transition-colors"
            style={{ background: i <= index ? "#C0395A" : "rgba(242,196,206,0.3)" }} />
        ))}
      </div>

      <NavBar onBack={onBack} onNext={(index >= memories.length - 1 || em) ? ch : undefined} />
    </section>
  );
}

// ── Slide 4: Playlist Music Player ──
function S4({ d, ch, em, oc, onBack, onPlayStateChange }: { d: Record<string,string>; ch: () => void; em: boolean; oc?: (id:string,v:string)=>void; onBack: () => void; onPlayStateChange?: (playing: boolean) => void }) {
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

  useEffect(() => {
    if (audioObj) {
      audioObj.pause();
      audioObj.currentTime = 0;
    }
    setProgress(0);
    setPlaying(false);

    if (songUrl && !em) {
      const newAudio = new Audio(songUrl);
      newAudio.onloadedmetadata = () => {
        setDuration(Math.floor(newAudio.duration) || 17);
      };
      newAudio.ontimeupdate = () => {
        setProgress((newAudio.currentTime / (newAudio.duration || 1)) * 100);
      };
      newAudio.onended = () => {
        setPlaying(false);
        setProgress(0);
      };
      setAudioObj(newAudio);
    } else {
      setAudioObj(null);
      setDuration(17);
    }

    return () => {
      if (audioObj) {
        audioObj.pause();
        audioObj.currentTime = 0;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, songUrl, em]);

  useEffect(() => {
    onPlayStateChange?.(playing);
    if (audioObj) {
      if (playing) {
        audioObj.play().catch(e => console.error("Error playing audio: ", e));
      } else {
        audioObj.pause();
      }
    } else {
      if (playing) {
        intervalRef.current = setInterval(() => {
          setProgress((p) => {
            if (p >= 100) return 0;
            return p + 0.5;
          });
        }, 100);
      }
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [playing, audioObj, onPlayStateChange]);

  const fmt = (s: number) => `0:${Math.floor(s).toString().padStart(2, "0")}`;
  const curSec = audioObj ? Math.floor((progress / 100) * duration) : Math.floor((progress / 100) * duration);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10 py-16">
      <ET fid="s5_title" data={d} onChange={oc} editMode={em}
        style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#D4AF37", marginBottom: 24, textAlign: "center" }} />

      <div className="gold-card p-8 relative w-full max-w-sm" style={{ background: "#FFF8F0" }}>
        {/* Vinyl */}
        <div className="flex justify-center mb-6">
          <div className={`relative rounded-full ${playing ? "spin-vinyl" : ""}`}
            style={{
              width: 180, height: 180,
              background: "radial-gradient(circle, #2A1A1F 30%, #0a0a0a 31%, #1a1a1a 50%, #0a0a0a 51%, #1a1a1a 70%, #0a0a0a 71%, #1a1a1a 90%)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}>
            <div className="absolute inset-0 m-auto rounded-full flex items-center justify-center"
              style={{ width: 60, height: 60, background: "#C0395A", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
              <span className="font-ui text-white text-[10px] text-center px-1">Our Song</span>
            </div>
            <div className="absolute rounded-full bg-gray-300"
              style={{ width: 8, height: 8, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
          </div>
        </div>

        <h3 className="font-display font-bold text-center text-xl" style={{ color: "#2A1A1F" }}>{songName}</h3>
        <p className="font-ui text-center text-sm mb-4" style={{ color: "#9B7B84" }}>{songArtist}</p>

        <div className="h-1 rounded-full mb-4" style={{ background: "rgba(212,175,55,0.2)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "#D4AF37" }} />
        </div>
        <div className="flex justify-between fontSize-11 color-888 mb-4" style={{ fontSize: 11, color: "#9B7B84" }}>
          <span>{fmt(curSec)}</span><span>{fmt(duration)}</span>
        </div>

        <div className="flex justify-center items-center gap-6 mb-4">
          <button onClick={() => setCurrent((c) => (c - 1 + songs.length) % songs.length)}
            style={{ color: "#2A1A1F", fontSize: 22, cursor: "pointer" }}>⏮</button>
          <button onClick={() => setPlaying((p) => !p)}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl"
            style={{ background: "#C0395A", border: "2px solid #D4AF37", cursor: "pointer" }}>
            {playing ? "⏸" : "▶"}
          </button>
          <button onClick={() => setCurrent((c) => (c + 1) % songs.length)}
            style={{ color: "#2A1A1F", fontSize: 22, cursor: "pointer" }}>⏭</button>
        </div>

        <div className="space-y-1">
          {songs.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <button onClick={() => { setCurrent(i); setProgress(0); }}
                className="text-left px-3 py-2 rounded-lg font-ui text-sm transition-colors flex-1"
                style={{
                  background: i === current ? "rgba(192,57,90,0.1)" : "transparent",
                  color: i === current ? "#8B1A3A" : "#2A1A1F",
                }}>
                {d[s.n] || s.defName} — <span style={{ color: "#9B7B84" }}>{d[s.a] || s.defArtist}</span>
              </button>
              {em && (
                <button onClick={() => setPickingFor(i)} className="p-1 text-xs text-rose-500 border border-dashed border-rose-500 rounded" style={{ cursor: "pointer" }}>
                  🎵 Swap
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="absolute -bottom-6 -right-4" style={{ width: 110 }}>
          <BearCharacter size={110} withHeadphones />
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

// ── Slide 5: Wish Stars ──
const STAR_POSITIONS = [
  { x: 15, y: 25 }, { x: 75, y: 20 }, { x: 30, y: 55 }, { x: 65, y: 45 },
  { x: 20, y: 75 }, { x: 80, y: 70 }, { x: 50, y: 35 },
];

function S5({ d, ch, em, oc, onBack, ap }: { d: Record<string,string>; ch: () => void; em: boolean; oc?: (id:string,v:string)=>void; onBack: () => void; ap?: boolean }) {
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

  const stars = useMemo(
    () => Array.from({ length: 100 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100,
      s: 1 + Math.random() * 3, o: 0.4 + Math.random() * 0.6,
    })), []
  );

  useEffect(() => {
    if (!shootRef.current) return;
    const shoots = shootRef.current.querySelectorAll<HTMLDivElement>(".shoot");
    shoots.forEach((s, i) => {
      gsap.fromTo(s,
        { x: -100, y: Math.random() * 300, opacity: 0 },
        { x: window.innerWidth + 100, y: `+=${100 + Math.random() * 200}`, opacity: 1,
          duration: 1.2, repeat: -1, delay: i * 4 + Math.random() * 3, repeatDelay: 6,
          ease: "power1.out" });
    });
  }, []);

  const handleClick = (i: number) => {
    if (clicked.has(i)) return;
    setClicked((s) => new Set(s).add(i));
    setActiveIdx(i);
    setTimeout(() => setActiveIdx((a) => (a === i ? null : a)), 3000);
  };

  const allDone = clicked.size === STAR_POSITIONS.length || em || ap;

  return (
    <section className="min-h-screen relative z-10 overflow-hidden w-full" style={{ background: "#050A18", minWidth: "100vw", marginLeft: "calc(-50vw + 50%)" }}>
      {/* Starfield */}
      <div className="absolute inset-0">
        {stars.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, opacity: s.o }} />
        ))}
      </div>
      {/* Shooting stars */}
      <div ref={shootRef} className="absolute inset-0 pointer-events-none">
        {[0, 1, 2].map((i) => (
          <div key={i} className="shoot absolute" style={{ width: 80, height: 2, background: "linear-gradient(90deg, transparent, white)", borderRadius: 999, boxShadow: "0 0 8px white" }} />
        ))}
      </div>
      {/* Moon */}
      <div className="absolute top-10 right-10 w-24 h-24 rounded-full transition-all duration-1000"
        style={{
          background: "radial-gradient(circle at 35% 35%, #FFF8F0, #D4AF37)",
          boxShadow: allDone ? "0 0 80px rgba(255,248,240,0.8), 0 0 160px rgba(212,175,55,0.5)" : "0 0 30px rgba(255,248,240,0.3)",
        }}>
        <div className="absolute inset-0 rounded-full" style={{ background: "#050A18", transform: "translate(20%, -10%)" }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <ET fid="s6_title" data={d} onChange={oc} editMode={em}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#D4AF37", marginBottom: 2, textAlign: "center" }} />
        <ET fid="s6_subtitle" data={d} onChange={oc} editMode={em}
          style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "14px", color: "#FFF8F0", marginBottom: 10, textAlign: "center" }} />

        {em && (
          <div className="gold-card p-6 w-full max-w-md mb-6" style={{ background: "#FFF8F0", zIndex: 30 }}>
            <h4 className="font-ui text-sm mb-4 font-bold" style={{ color: "#8B1A3A" }}>Edit Reasons on Stars:</h4>
            <div className="space-y-4 max-h-40 overflow-y-auto">
              <ET fid="s6_star1" data={d} onChange={oc} editMode={em} style={{ fontSize: 13, color: "#2A1A1F" }} />
              <ET fid="s6_star2" data={d} onChange={oc} editMode={em} style={{ fontSize: 13, color: "#2A1A1F" }} />
              <ET fid="s6_star3" data={d} onChange={oc} editMode={em} style={{ fontSize: 13, color: "#2A1A1F" }} />
              <ET fid="s6_star4" data={d} onChange={oc} editMode={em} style={{ fontSize: 13, color: "#2A1A1F" }} />
              <ET fid="s6_star5" data={d} onChange={oc} editMode={em} style={{ fontSize: 13, color: "#2A1A1F" }} />
              <ET fid="s6_star6" data={d} onChange={oc} editMode={em} style={{ fontSize: 13, color: "#2A1A1F" }} />
              <ET fid="s6_star7" data={d} onChange={oc} editMode={em} style={{ fontSize: 13, color: "#2A1A1F" }} />
            </div>
          </div>
        )}

        <div className="relative w-full max-w-4xl" style={{ height: 380 }}>
          {STAR_POSITIONS.map((pos, i) => {
            const isClicked = clicked.has(i) || em || ap;
            return (
              <button key={i} onClick={() => handleClick(i)}
                className={!isClicked ? "pulse-star" : ""}
                style={{
                  position: "absolute",
                  left: `${pos.x}%`, top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                  background: "transparent", border: "none", cursor: isClicked ? "default" : "pointer",
                  filter: `drop-shadow(0 0 12px ${isClicked ? "#FFF8F0" : "#D4AF37"})`,
                  zIndex: 10
                }}>
                <svg width="32" height="32" viewBox="0 0 24 24">
                  <path d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21 L12 17 L6 21 L8 14 L2 9.5 L9.5 9 Z"
                    fill={isClicked ? "#FFF8F0" : "#D4AF37"} />
                </svg>
              </button>
            );
          })}

          <AnimatePresence>
            {activeIdx !== null && (
              <motion.div key={activeIdx}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="gold-card p-4 absolute"
                style={{
                  left: `${STAR_POSITIONS[activeIdx].x}%`,
                  top: `calc(${STAR_POSITIONS[activeIdx].y}% + 40px)`,
                  transform: "translateX(-50%)",
                  width: 220, zIndex: 20,
                  background: "#FFF8F0"
                }}>
                <p className="text-center text-xl" style={{ color: "#C0395A" }}>♡</p>
                <p className="font-body italic text-center text-sm" style={{ color: "#8B1A3A" }}>
                  {starReasons[activeIdx]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {allDone && (
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="font-script text-5xl text-center mt-4" style={{ color: "#FFF8F0", textShadow: "0 0 20px #D4AF37" }}>
              {d.s6_win_text || "You are my universe. ♡"}
            </motion.p>
          )}
        </AnimatePresence>

        <NavBar onBack={onBack} onNext={allDone ? ch : undefined} nextLabel="Almost there... →" />
      </div>
    </section>
  );
}

// ── Slide 6: Finale Slide ──
function S6({ d, em, oc, onBack, onReset }: { d: Record<string,string>; em: boolean; oc?: (id:string,v:string)=>void; onBack: () => void; onReset: () => void }) {
  const emberRef = useRef<HTMLDivElement>(null);
  const [sealed, setSealed] = useState(false);

  useEffect(() => {
    if (!emberRef.current) return;
    const embers = emberRef.current.querySelectorAll<HTMLDivElement>(".ember");
    embers.forEach((e) => {
      const startX = Math.random() * window.innerWidth;
      gsap.fromTo(e,
        { x: startX, y: window.innerHeight + 20, opacity: 0 },
        { y: -100, opacity: 0.7, duration: 6 + Math.random() * 6,
          repeat: -1, delay: Math.random() * 8, ease: "power1.out",
          onRepeat: () => gsap.set(e, { x: Math.random() * window.innerWidth }) });
    });
  }, []);

  const seal = () => {
    const fire = (x: number, y: number) => confetti({
      particleCount: 60, spread: 100, origin: { x, y },
      colors: ["#C0395A", "#F2C4CE", "#D4AF37", "#FFF8F0", "#8B1A3A"],
    });
    fire(0.1, 0.5); fire(0.9, 0.5); fire(0.5, 0.5); fire(0.2, 0.1); fire(0.8, 0.1);
    setTimeout(() => setSealed(true), 1500);
  };

  return (
    <section className="min-h-screen relative z-10 overflow-hidden flex flex-col items-center justify-center text-center px-6 py-16">
      <div ref={emberRef} className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="ember absolute rounded-full"
            style={{ width: 4, height: 4, background: "#D4AF37", boxShadow: "0 0 8px #D4AF37" }} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center max-w-xl">
        <BearCharacter variant="couple" size={180} />

        <ET fid="s7_title" data={d} onChange={oc} editMode={em}
          style={{ fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.4em", fontSize: 13, marginTop: 24, color: "#D4AF37" }} />

        <div className="my-4">
          <h1 className="font-display italic font-bold" style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)", color: "#FFF8F0" }}>
            {d.beloved_name || "My Jaan"} <span style={{ color: "#F2C4CE" }}>♡</span>
          </h1>
        </div>

        <div className="h-px w-40 my-4" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />

        <ET fid="s7_letter_body" data={d} onChange={oc} editMode={em} multiline
          style={{ fontFamily: "'Lora', serif", fontStyle: "italic", color: "#F2C4CE", lineHeight: 1.8, fontSize: 16 }} />

        <ET fid="s7_closing" data={d} onChange={oc} editMode={em}
          style={{ fontFamily: "'Sacramento', cursive", fontSize: "clamp(2rem, 5vw, 2.5rem)", color: "#D4AF37", marginTop: 24 }} />

        <div className="flex flex-wrap items-center justify-center gap-4 mt-10" style={{ zIndex: 10 }}>
          <button onClick={seal} className="btn-rose">{d.s7_seal_btn || "Seal It With Love 💌"}</button>
          <button onClick={onReset} className="btn-ghost">{d.s7_replay_btn || "Experience Again 🔄"}</button>
          <button onClick={onBack} className="btn-ghost">← Back</button>
        </div>

        <AnimatePresence>
          {sealed && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="w-40 h-40 rounded-full flex items-center justify-center text-white text-6xl"
                style={{ background: "#8B1A3A", border: "4px solid #D4AF37", boxShadow: "0 0 60px rgba(192,57,90,0.7)" }}>
                ♡
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ── Main Template Container ──
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

  // Background Audio State
  const [bgAudio, setBgAudio] = useState<HTMLAudioElement | null>(null);
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const isYt = customData.bg_song_type === "youtube" && !!customData.bg_song_youtube_id;

  const [globalMuted, setGlobalMuted] = useState(false);
  const [slideAudioPlaying, setSlideAudioPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Store ytPlayer in a ref so the event listener always has the latest instance
  const ytPlayerRef = useRef<any>(null);
  useEffect(() => { ytPlayerRef.current = ytPlayer; }, [ytPlayer]);

  useEffect(() => {
    const onInteract = () => {
      setHasInteracted(true);
      if (isYt && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        ytPlayerRef.current.playVideo();
      }
    };
    window.addEventListener("click", onInteract);
    window.addEventListener("touchstart", onInteract);
    return () => {
      window.removeEventListener("click", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
  }, [isYt]);

  useEffect(() => {
    if (editMode) return;
    const audio = new Audio();
    audio.loop = true;
    setBgAudio(audio);

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [editMode]);

  useEffect(() => {
    if (!bgAudio) return;
    if (!isYt && customData.bg_song_url && bgAudio.src !== customData.bg_song_url) {
      bgAudio.src = customData.bg_song_url;
    }
  }, [bgAudio, customData.bg_song_url, isYt]);

  useEffect(() => {
    if (editMode) return;
    if (slideAudioPlaying) {
      bgAudio?.pause();
      ytPlayer?.pauseVideo?.();
    } else if (hasInteracted) {
      if (!globalMuted) {
        if (isYt) {
          ytPlayer?.playVideo?.();
        } else {
          bgAudio?.play().catch(e => console.log("Bg audio play prevented", e));
        }
      }
    }
  }, [slideAudioPlaying, bgAudio, globalMuted, editMode, isYt, ytPlayer, hasInteracted]);

  useEffect(() => {
    if (bgAudio) bgAudio.muted = globalMuted;
    if (ytPlayer && typeof ytPlayer.isMuted === "function") {
      if (globalMuted) ytPlayer.mute(); else ytPlayer.unMute();
    }
  }, [globalMuted, bgAudio, ytPlayer]);

  const onYtReady = (event: any) => {
    setYtPlayer(event.target);
    if (globalMuted) event.target.mute();
  };

  const onYtStateChange = (event: any) => {
    if (event.data === 0) { // 0 = ended
      event.target.playVideo();
    }
  };

  // Auto-play: cycle slides every 3s (for homepage modal preview)
  useEffect(() => {
    if (!autoPlay || editMode) return;
    const timer = setInterval(() => {
      setSlide(s => (s + 1) % 7);
    }, 3000);
    return () => clearInterval(timer);
  }, [autoPlay, editMode]);

  const renderSlide = () => {
    const p = { d: customData, em: editMode, oc: onFieldChange };
    switch (activeSlide) {
      case -1: return <S_Minus1 {...p} ch={() => go(0)} bgProps={{ isPicking: isPickingBgSong, setIsPicking: setIsPickingBgSong }} />;
      case 0: return <S0 {...p} ch={() => go(1)} />;
      case 1: return <S1 {...p} ch={() => go(2)} onBack={() => go(0)} />;
      case 2: return <S2 {...p} ch={() => go(3)} onBack={() => go(1)} ap={autoPlay} />;
      case 3: return <S3 {...p} ch={() => go(4)} onBack={() => go(2)} />;
      case 4: return <S4 {...p} ch={() => go(5)} onBack={() => go(3)} onPlayStateChange={setSlideAudioPlaying} />;
      case 5: return <S5 {...p} ch={() => go(6)} onBack={() => go(4)} ap={autoPlay} />;
      case 6: return <S6 {...p} onBack={() => go(5)} onReset={() => go(0)} />;
      default: return null;
    }
  };

  return (
    <div style={{
      position: "relative", minHeight: "100vh", overflow: "hidden",
      background: "linear-gradient(160deg, #1A0A0F 0%, #5C1428 50%, #8B1A3A 100%)",
      color: "#FFF8F0",
      fontFamily: "'Lora', serif",
    }}>
      {/* Dynamic styles injected locally to keep the component fully self-contained */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Lora:ital,wght@0,400;0,600;1,400&family=Sacramento&family=Inter:wght@300;400;500&display=swap');

        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-body { font-family: 'Lora', serif; }
        .font-script { font-family: 'Sacramento', cursive; }
        .font-ui { font-family: 'Inter', sans-serif; }

        .gold-card {
          border: 1.5px solid transparent;
          background: linear-gradient(#FFF8F0, #FFF8F0) padding-box,
                      linear-gradient(135deg, #D4AF37, #F5E6A3, #D4AF37) border-box;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(212,175,55,0.15);
        }

        .btn-rose {
          position: relative;
          overflow: hidden;
          background: #C0395A;
          color: #FFF8F0;
          border: 1.5px solid #D4AF37;
          border-radius: 999px;
          padding: 12px 28px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 8px 24px rgba(192,57,90,0.4);
        }
        .btn-rose:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(192,57,90,0.6); }
        .btn-rose::after {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(245,230,163,0.5), transparent);
          transition: left 0.6s ease;
        }
        .btn-rose:hover::after { left: 100%; }

        .btn-ghost {
          background: transparent;
          color: #FFF8F0;
          border: 1.5px solid #C0395A;
          border-radius: 999px;
          padding: 12px 28px;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-ghost:hover { background: rgba(192,57,90,0.15); }

        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bob { animation: bob 2.5s ease-in-out infinite; }

        @keyframes spin-vinyl { from { transform: rotate(0); } to { transform: rotate(360deg); } }
        .spin-vinyl { animation: spin-vinyl 3s linear infinite; }

        @keyframes pulse-star {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .pulse-star { animation: pulse-star 2s ease-in-out infinite; }

        .petal {
          position: fixed;
          pointer-events: none;
          z-index: 0;
          border-radius: 50% 0 50% 0;
        }
      `}</style>

      {/* Floating Rose Petals (disabled in starfield slide to prevent style clashing) */}
      {activeSlide !== 5 && <RosePetals count={30} />}

      <main style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div key={activeSlide} className="fade-in-up" style={{ width: "100%", maxWidth: 600 }}>
          {renderSlide()}
        </div>
      </main>

      {/* Global Mute Button */}
      {customData.bg_song_url && !editMode && (
        <button
          onClick={() => setGlobalMuted(!globalMuted)}
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 100,
            width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)", border: "1px solid rgba(212,175,55,0.15)",
            boxShadow: "0 8px 24px rgba(212,175,55,0.15)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: globalMuted ? "#888" : "#C0395A", transition: "all 0.3s",
          }}
        >
          {globalMuted ? <VolumeX size={24} strokeWidth={2.5} /> : <Volume2 size={24} strokeWidth={2.5} />}
        </button>
      )}

      {!editMode && (
        <div style={{ position: "absolute", bottom: 16, width: "100%", textAlign: "center", fontSize: 12, color: "rgba(255,248,240,0.4)", zIndex: 1 }}>
          Preview — Purchase to personalise ✨
        </div>
      )}

      {isYt && !editMode && (
        <div style={{ position: "absolute", top: -9999, left: -9999, opacity: 0, pointerEvents: "none" }}>
          <YouTube 
            videoId={customData.bg_song_youtube_id} 
            opts={{
              height: '10',
              width: '10',
              playerVars: {
                autoplay: 0,
                loop: 1,
                controls: 0,
                start: parseInt(customData.bg_song_start || "0", 10) || undefined,
                end: parseInt(customData.bg_song_end || "0", 10) || undefined,
              },
            }} 
            onReady={onYtReady}
            onStateChange={onYtStateChange}
          />
        </div>
      )}
    </div>
  );
}
