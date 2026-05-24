"use client";
import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Heart, Sparkles, Send, Volume2, VolumeX, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import SongLibraryPopup from "@/components/SongLibraryPopup";

// Local ET Component for inline editing in Personalizer
function ET({ fid, data, onChange, style, multiline = false, editMode = false }: {
  fid: string; data: Record<string, string>; onChange?: (id: string, v: string) => void;
  style?: React.CSSProperties; multiline?: boolean; editMode?: boolean;
}) {
  const value = data[fid] ?? "";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(data[fid] ?? ""), [data, fid]);
  const commit = () => { onChange?.(fid, draft); setEditing(false); };

  if (!editMode) return <span style={style}>{value}</span>;

  if (editing) {
    const base: React.CSSProperties = {
      display: "block", width: "100%", border: "2px solid #FF69B4", borderRadius: 8,
      padding: "6px 8px", background: "#fff", outline: "none",
      fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit",
      color: "#1a1a1a", lineHeight: "inherit", textAlign: "inherit"
    };
    return multiline
      ? <textarea value={draft} rows={3} autoFocus onChange={e => setDraft(e.target.value)}
          onBlur={commit} style={{ ...style, ...base, resize: "vertical" }} />
      : <input value={draft} autoFocus onChange={e => setDraft(e.target.value)}
          onBlur={commit} onKeyDown={e => e.key === "Enter" && commit()}
          style={{ ...style, ...base }} />;
  }

  return (
    <div onClick={() => setEditing(true)} title="Click to edit" style={{
      position: "relative", cursor: "text", border: "1.5px dashed rgba(255, 105, 180, 0.7)",
      borderRadius: 6, padding: "4px 8px 18px 8px",
      background: "rgba(255, 105, 180, 0.04)", display: "inline-block", width: "100%"
    }}>
      <span style={style}>{value || "(click to edit)"}</span>
      <span style={{
        position: "absolute", bottom: 2, right: 6, fontSize: 8,
        color: "#FF69B4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5
      }}>Edit Text</span>
    </div>
  );
}

const IMGBB_KEY = "83e3f88941efd1059a89f016ff302d9e";

function ImageUploader({ fid, data, onChange, defaultSrc }: {
  fid: string; data: Record<string, string>; onChange?: (id: string, v: string) => void; defaultSrc: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const currentSrc = data[fid] || "";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) {
        onChange?.(fid, json.data.url);
        setPreview(null);
      }
    } catch { /* ignore */ }
    setUploading(false);
  };

  const useDefault = () => { onChange?.(fid, ""); setPreview(null); };

  return (
    <div style={{ padding: "6px 8px", background: "rgba(255, 105, 180, 0.04)", borderTop: "1px dashed rgba(255, 105, 180, 0.3)", width: "100%", borderRadius: 8, marginTop: 8 }}>
      {preview && (
        <div style={{ marginBottom: 6, textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" style={{ maxHeight: 60, borderRadius: 8, border: "2px solid #FF69B4" }} />
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
          background: "#FF69B4", color: "#fff", border: "none", borderRadius: 8,
          padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer",
          opacity: uploading ? 0.6 : 1, width: "100%", whiteSpace: "normal", wordBreak: "break-word"
        }}>{uploading ? "Uploading…" : "📷 Change"}</button>
        {currentSrc && (
          <button onClick={useDefault} style={{
            background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb",
            borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer",
            width: "100%", whiteSpace: "normal", wordBreak: "break-word"
          }}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

// Audio Synthesizer chimes
const PlaySynth = {
  pop() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const c = new AudioCtx();
      const now = c.currentTime;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.connect(g);
      g.connect(c.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.08);
      g.gain.setValueAtTime(0.06, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch (_) {}
  },
  clickNo() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const c = new AudioCtx();
      const now = c.currentTime;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.connect(g);
      g.connect(c.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.setValueAtTime(150, now + 0.15);
      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (_) {}
  },
  bell() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const c = new AudioCtx();
      const now = c.currentTime;
      [440, 554.37, 659.25, 880].forEach((f, i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.04 - i * 0.008, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.0 - i * 0.15);
        osc.start(now);
        osc.stop(now + 1.1);
      });
    } catch (_) {}
  },
  success() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const c = new AudioCtx();
      const now = c.currentTime;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.connect(g);
      g.connect(c.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      osc.frequency.setValueAtTime(1046.5, now + 0.3);
      g.gain.setValueAtTime(0.06, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch (_) {}
  }
};

// Twinkling particles background component
function ParticleBackground() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number; type: string; opacity: number }>>([]);

  useEffect(() => {
    const list = [];
    const types = ["heart", "sparkle", "bubble"];
    for (let i = 0; i < 28; i++) {
      list.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 6,
        delay: Math.random() * 8,
        duration: Math.random() * 15 + 15,
        type: types[Math.floor(Math.random() * types.length)],
        opacity: Math.random() * 0.25 + 0.15
      });
    }
    setParticles(list);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
      {particles.map(p => {
        const style: React.CSSProperties = {
          position: "absolute",
          left: `${p.x}%`,
          top: `${p.y}%`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
          opacity: p.opacity,
          fontSize: `${p.size}px`
        };
        if (p.type === "heart") {
          return <div key={p.id} className="propose-float text-rose-500/30" style={style}>♥</div>;
        } else if (p.type === "sparkle") {
          return <div key={p.id} className="propose-float text-amber-300/25" style={style}>✦</div>;
        } else {
          return (
            <div
              key={p.id}
              className="propose-float rounded-full bg-gradient-to-br from-pink-400/20 to-purple-400/10"
              style={{ ...style, width: p.size, height: p.size, filter: "blur(0.5px)" }}
            />
          );
        }
      })}
    </div>
  );
}

// Escaping Button component that runs away
function EscapeButton({
  children, yesScale, setYesScale, onTriggerWarning
}: {
  children: React.ReactNode;
  yesScale: number;
  setYesScale: React.Dispatch<React.SetStateAction<number>>;
  onTriggerWarning: () => void;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [escaped, setEscaped] = useState(false);

  const handleEscape = () => {
    // Generate random translations in bounding bounds
    const rx = (Math.random() - 0.5) * 240;
    const ry = (Math.random() - 0.5) * 160;
    setOffset({ x: rx, y: ry });
    setEscaped(true);
    // Increase yes button size
    setYesScale(prev => Math.min(prev + 0.15, 2.5));
    // Trigger fun text warning
    onTriggerWarning();
    PlaySynth.clickNo();
  };

  const handleTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEscape();
  };

  return (
    <button
      onMouseEnter={handleEscape}
      onTouchStart={handleTouch}
      onClick={e => e.preventDefault()}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) ${escaped ? "rotate(10deg) scale(0.95)" : ""}`,
        boxShadow: escaped ? "0 10px 30px rgba(220,38,38,0.2)" : "0 4px 12px rgba(0,0,0,0.15)",
        transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        background: "rgba(255, 255, 255, 0.12)",
        border: "2px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "16px",
        padding: "12px 28px",
        fontSize: "15px",
        fontWeight: 700,
        color: "rgba(255, 255, 255, 0.65)",
        cursor: "not-allowed",
        backdropFilter: "blur(4px)"
      }}
    >
      {children}
    </button>
  );
}

export default function Propose3({
  customData = {}, editMode = false, onFieldChange, forcedSlide, autoPlay = false
}: {
  customData?: Record<string, string>;
  editMode?: boolean;
  onFieldChange?: (id: string, value: string) => void;
  forcedSlide?: number;
  autoPlay?: boolean;
}) {
  const d = customData;
  const em = editMode;
  const oc = onFieldChange;

  const [activeSlide, setActiveSlide] = useState(1);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [bgModalOpen, setBgModalOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync forcedSlide inside editor
  useEffect(() => {
    if (em && forcedSlide !== undefined) {
      setActiveSlide(forcedSlide);
    }
  }, [forcedSlide, em]);

  // Audio setup
  useEffect(() => {
    if (em) return;
    const songUrl = d.bg_song_url || "https://pub-1cc0f6e993214be9a36badeeb631f4b6.r2.dev/templates/template09/assets/song/Template_09.mp3";
    const audio = new Audio(songUrl);
    audio.loop = true;
    audioRef.current = audio;

    // Silence if embedded inside iframe
    const isEmbedded = typeof window !== "undefined" && (window.self !== window.top || window.location.search.includes("embed=1"));
    if (!isEmbedded && !em && autoPlay) {
      audio.play().then(() => setMusicPlaying(true)).catch(() => {});
    }

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [d.bg_song_url, em, autoPlay]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  };

  const nextSlide = () => {
    PlaySynth.pop();
    if (activeSlide < 9) {
      setActiveSlide(activeSlide + 1);
    }
  };

  const prevSlide = () => {
    PlaySynth.pop();
    if (activeSlide > 1) {
      setActiveSlide(activeSlide - 1);
    }
  };

  // Fun escapist warning texts
  const [warningText, setWarningText] = useState<string | null>(null);
  const triggerWarningText = (text: string) => {
    setWarningText(text);
  };

  // Clean warning when switching slides
  useEffect(() => {
    setWarningText(null);
    setYesScale(1);
  }, [activeSlide]);

  // Escape button Yes scaling
  const [yesScale, setYesScale] = useState(1);

  // Carousel memory index
  const [carouselIdx, setCarouselIdx] = useState(0);

  // Envelope Open state
  const [letterOpen, setLetterOpen] = useState(false);
  const triggerLetterOpen = () => {
    if (letterOpen) return;
    PlaySynth.bell();
    setLetterOpen(true);
  };

  // Celebration effects
  useEffect(() => {
    if (activeSlide === 9 && !em) {
      PlaySynth.success();
      // Massive confetti spray
      const duration = 4 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [activeSlide, em]);

  return (
    <div style={{
      background: "linear-gradient(to bottom, #0F081D, #200B32, #0A0314)",
      color: "#FFFFFF",
      fontFamily: "'Nunito', sans-serif",
      minHeight: "100vh",
      padding: "16px 8px 80px 8px",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflowX: "hidden"
    }}>
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Nunito:wght@400;600;700;800&family=Outfit:wght@300;400;700&display=swap');
        
        .prop-title {
          font-family: 'Dancing Script', cursive;
        }
        
        .prop-sans {
          font-family: 'Outfit', sans-serif;
        }
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(4deg); }
        }
        .propose-float {
          animation: floatSlow 6s ease-in-out infinite;
        }
        
        @keyframes beatHeart {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          40% { transform: scale(1.05); }
          60% { transform: scale(1.15); }
        }
        .animate-prop-beat {
          animation: beatHeart 1.6s infinite ease-in-out;
        }

        .pulse-pink-glow {
          box-shadow: 0 0 20px rgba(236,72,153,0.3);
          animation: pulseGlow 2s infinite alternate;
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 15px rgba(236,72,153,0.3); }
          100% { box-shadow: 0 0 35px rgba(236,72,153,0.7); }
        }
      `}} />

      <ParticleBackground />

      {/* Floating Music Toggle Button */}
      {!em && (
        <button
          onClick={toggleMusic}
          style={{
            position: "fixed", bottom: 20, right: 20, zIndex: 1000,
            width: 46, height: 46, borderRadius: "50%", background: "#EC4899",
            border: "2px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 20px rgba(236,72,153,0.4)", cursor: "pointer"
          }}
        >
          {musicPlaying ? <Volume2 size={18} color="#FFFFFF" /> : <VolumeX size={18} color="#FFFFFF" />}
        </button>
      )}

      {/* Floating Back Navigation Button */}
      {!em && activeSlide > 1 && activeSlide < 9 && (
        <button
          onClick={prevSlide}
          style={{
            position: "fixed", top: 20, left: 20, zIndex: 1000,
            background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "30px", padding: "8px 16px", fontSize: 13, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 6, color: "#FFFFFF", cursor: "pointer",
            backdropFilter: "blur(4px)"
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>
      )}

      {/* ──────────────────────────────────────────────────────────
          MAIN SLIDES CONTAINER
          ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 440, width: "100%", zIndex: 10, textAlign: "center", position: "relative", marginTop: 40 }}>
        
        <AnimatePresence mode="wait">
          
          {activeSlide === 1 && (
            <motion.div
              key="slide1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
            >
              {/* Mascot decoration */}
              <div style={{ position: "relative", marginBottom: 20 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.s1_img || "/templates/propose3/cat-cute.png"}
                  alt="Intro Cat"
                  style={{ width: 220, height: 220, objectFit: "contain", margin: "0 auto", filter: "drop-shadow(0 10px 25px rgba(236,72,153,0.3))" }}
                />
                {em && <ImageUploader fid="s1_img" data={d} onChange={oc} defaultSrc="/templates/propose3/cat-cute.png" />}
              </div>

              {/* Title & Messages */}
              <h1 className="prop-title" style={{ fontSize: "2.8rem", color: "#EC4899", margin: "12px 0", lineHeight: 1.2, textShadow: "0 4px 12px rgba(236,72,153,0.2)" }}>
                <ET fid="s1_heading" data={d} onChange={oc} editMode={em} />
              </h1>
              <p className="prop-sans" style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", fontWeight: 300, marginBottom: 40 }}>
                <ET fid="s1_subtext" data={d} onChange={oc} editMode={em} />
              </p>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextSlide}
                style={{
                  background: "linear-gradient(135deg, #EC4899, #F43F5E)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "50px",
                  padding: "16px 44px",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 10px 30px rgba(236,72,153,0.4)"
                }}
              >
                <ET fid="s1_btn" data={d} onChange={oc} editMode={em} />
              </motion.button>
            </motion.div>
          )}

          {activeSlide === 2 && (
            <motion.div
              key="slide2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Mascot decoration */}
              <div style={{ position: "relative", marginBottom: 20 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.s2_img || "/templates/propose3/cat-sad.png"}
                  alt="Trust Question Cat"
                  style={{ width: 180, height: 180, objectFit: "contain", margin: "0 auto", filter: "drop-shadow(0 10px 20px rgba(139,92,246,0.3))" }}
                />
                {em && <ImageUploader fid="s2_img" data={d} onChange={oc} defaultSrc="/templates/propose3/cat-sad.png" />}
              </div>

              {/* Heading */}
              <span className="prop-sans" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: "#8B5CF6", fontWeight: 700 }}>
                <ET fid="s2_heading" data={d} onChange={oc} editMode={em} />
              </span>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: "6px 0 20px 0" }}>
                <ET fid="s2_subtext" data={d} onChange={oc} editMode={em} />
              </p>

              {/* Question */}
              <h2 className="prop-title" style={{ fontSize: "2.3rem", color: "#FFFFFF", marginBottom: 30 }}>
                <ET fid="s2_question" data={d} onChange={oc} editMode={em} />
              </h2>

              {/* Warning box */}
              {warningText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#F87171",
                    borderRadius: "16px",
                    padding: "12px 16px",
                    marginBottom: 20,
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  {warningText}
                </motion.div>
              )}

              {/* Escape Button Layout */}
              <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center", minHeight: 80, position: "relative" }}>
                <motion.button
                  onClick={nextSlide}
                  className="pulse-pink-glow"
                  style={{
                    background: "#EC4899",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "16px",
                    padding: "14px 32px",
                    fontSize: "16px",
                    fontWeight: 800,
                    cursor: "pointer",
                    transform: `scale(${yesScale})`,
                    transition: "transform 0.2s"
                  }}
                >
                  <ET fid="s2_yes_btn" data={d} onChange={oc} editMode={em} />
                </motion.button>

                <EscapeButton
                  yesScale={yesScale}
                  setYesScale={setYesScale}
                  onTriggerWarning={() => triggerWarningText(d.s2_no_msg || "Aww, please give me a chance! Just say yes 🥺💕")}
                >
                  <ET fid="s2_no_btn" data={d} onChange={oc} editMode={em} />
                </EscapeButton>
              </div>
            </motion.div>
          )}

          {activeSlide === 3 && (
            <motion.div
              key="slide3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Mascot decoration */}
              <div style={{ position: "relative", marginBottom: 20 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.s3_img || "/templates/propose3/cat-flowers.png"}
                  alt="Love Question Cat"
                  style={{ width: 190, height: 190, objectFit: "contain", margin: "0 auto", filter: "drop-shadow(0 10px 20px rgba(236,72,153,0.3))" }}
                />
                {em && <ImageUploader fid="s3_img" data={d} onChange={oc} defaultSrc="/templates/propose3/cat-flowers.png" />}
              </div>

              {/* Heading */}
              <span className="prop-sans" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: "#EC4899", fontWeight: 700 }}>
                <ET fid="s3_heading" data={d} onChange={oc} editMode={em} />
              </span>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: "6px 0 20px 0" }}>
                <ET fid="s3_subtext" data={d} onChange={oc} editMode={em} />
              </p>

              {/* Question */}
              <h2 className="prop-title" style={{ fontSize: "2.3rem", color: "#FFFFFF", marginBottom: 30 }}>
                <ET fid="s3_question" data={d} onChange={oc} editMode={em} />
              </h2>

              {/* Warning box */}
              {warningText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#F87171",
                    borderRadius: "16px",
                    padding: "12px 16px",
                    marginBottom: 20,
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  {warningText}
                </motion.div>
              )}

              {/* Escape Button Layout */}
              <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center", minHeight: 80, position: "relative" }}>
                <motion.button
                  onClick={nextSlide}
                  className="pulse-pink-glow"
                  style={{
                    background: "#EC4899",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "16px",
                    padding: "14px 32px",
                    fontSize: "16px",
                    fontWeight: 800,
                    cursor: "pointer",
                    transform: `scale(${yesScale})`,
                    transition: "transform 0.2s"
                  }}
                >
                  <ET fid="s3_yes_btn" data={d} onChange={oc} editMode={em} />
                </motion.button>

                <EscapeButton
                  yesScale={yesScale}
                  setYesScale={setYesScale}
                  onTriggerWarning={() => triggerWarningText(d.s3_no_msg || "Come on, I know you do! Just admit it 🥰💕")}
                >
                  <ET fid="s3_no_btn" data={d} onChange={oc} editMode={em} />
                </EscapeButton>
              </div>
            </motion.div>
          )}

          {activeSlide === 4 && (
            <motion.div
              key="slide4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Mascot decoration */}
              <div style={{ position: "relative", marginBottom: 20 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.s4_img || "/templates/propose3/doodle-love.png"}
                  alt="Final Confirm Mascot"
                  style={{ width: 180, height: 180, objectFit: "contain", margin: "0 auto", filter: "drop-shadow(0 10px 20px rgba(168,85,247,0.3))" }}
                />
                {em && <ImageUploader fid="s4_img" data={d} onChange={oc} defaultSrc="/templates/propose3/doodle-love.png" />}
              </div>

              {/* Heading */}
              <span className="prop-sans" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: "#A855F7", fontWeight: 700 }}>
                <ET fid="s4_heading" data={d} onChange={oc} editMode={em} />
              </span>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: "6px 0 20px 0" }}>
                <ET fid="s4_subtext" data={d} onChange={oc} editMode={em} />
              </p>

              {/* Question */}
              <h2 className="prop-title" style={{ fontSize: "2.3rem", color: "#FFFFFF", marginBottom: 30 }}>
                <ET fid="s4_question" data={d} onChange={oc} editMode={em} />
              </h2>

              {/* Warning box */}
              {warningText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#F87171",
                    borderRadius: "16px",
                    padding: "12px 16px",
                    marginBottom: 20,
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  {warningText}
                </motion.div>
              )}

              {/* Escape Button Layout */}
              <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center", minHeight: 80, position: "relative" }}>
                <motion.button
                  onClick={nextSlide}
                  className="pulse-pink-glow"
                  style={{
                    background: "#EC4899",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "16px",
                    padding: "14px 32px",
                    fontSize: "16px",
                    fontWeight: 800,
                    cursor: "pointer",
                    transform: `scale(${yesScale})`,
                    transition: "transform 0.2s"
                  }}
                >
                  <ET fid="s4_yes_btn" data={d} onChange={oc} editMode={em} />
                </motion.button>

                <EscapeButton
                  yesScale={yesScale}
                  setYesScale={setYesScale}
                  onTriggerWarning={() => triggerWarningText(d.s4_no_msg || "Don't overthink it! Your heart knows the answer 💕")}
                >
                  <ET fid="s4_no_btn" data={d} onChange={oc} editMode={em} />
                </EscapeButton>
              </div>
            </motion.div>
          )}

          {activeSlide === 5 && (
            <motion.div
              key="slide5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
              style={{ padding: "0 12px" }}
            >
              <h2 className="prop-title" style={{ fontSize: "2.4rem", color: "#EC4899", marginBottom: 6 }}>
                <ET fid="s5_heading" data={d} onChange={oc} editMode={em} />
              </h2>
              <p className="prop-sans" style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", fontWeight: 300, marginBottom: 24 }}>
                <ET fid="s5_subtext" data={d} onChange={oc} editMode={em} />
              </p>

              {/* Photo Polaroid Carousel */}
              <div style={{
                background: "#FFFFFF",
                color: "#1E293B",
                borderRadius: "16px",
                padding: "12px 12px 24px 12px",
                maxWidth: 340,
                margin: "0 auto 24px auto",
                boxShadow: "0 15px 35px rgba(0,0,0,0.4)"
              }}>
                <div style={{ position: "relative", width: "100%", height: 260, background: "#F1F5F9", borderRadius: "10px", overflow: "hidden", marginBottom: 12 }}>
                  {/* Photo displays based on index */}
                  {carouselIdx === 0 && (
                    <motion.img
                      key="pic1"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      src={d.photo1 || "/templates/propose3/couple-meadow.png"}
                      alt="Meadow Note"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                  {carouselIdx === 1 && (
                    <motion.img
                      key="pic2"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      src={d.photo2 || "/templates/propose3/couple-beach.png"}
                      alt="Beach Note"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                  {carouselIdx === 2 && (
                    <motion.img
                      key="pic3"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      src={d.photo3 || "/templates/propose3/couple-stars.png"}
                      alt="Stars Note"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}

                  {/* Left / Right overlays */}
                  <button
                    onClick={() => { PlaySynth.pop(); setCarouselIdx(prev => (prev === 0 ? 2 : prev - 1)); }}
                    style={{
                      position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                      background: "rgba(255,255,255,0.7)", border: "none", width: 34, height: 34,
                      borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: "#1E293B"
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => { PlaySynth.pop(); setCarouselIdx(prev => (prev === 2 ? 0 : prev + 1)); }}
                    style={{
                      position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                      background: "rgba(255,255,255,0.7)", border: "none", width: 34, height: 34,
                      borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: "#1E293B"
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Polaroid Captions */}
                <p className="prop-title" style={{ fontSize: "1.4rem", margin: "8px 0 0 0", color: "#D946EF", lineHeight: 1.3 }}>
                  {carouselIdx === 0 && <ET fid="photo1_caption" data={d} onChange={oc} editMode={em} />}
                  {carouselIdx === 1 && <ET fid="photo2_caption" data={d} onChange={oc} editMode={em} />}
                  {carouselIdx === 2 && <ET fid="photo3_caption" data={d} onChange={oc} editMode={em} />}
                </p>

                {/* Upload tools under active cards */}
                {em && (
                  <div style={{ marginTop: 10 }}>
                    {carouselIdx === 0 && <ImageUploader fid="photo1" data={d} onChange={oc} defaultSrc="/templates/propose3/couple-meadow.png" />}
                    {carouselIdx === 1 && <ImageUploader fid="photo2" data={d} onChange={oc} defaultSrc="/templates/propose3/couple-beach.png" />}
                    {carouselIdx === 2 && <ImageUploader fid="photo3" data={d} onChange={oc} defaultSrc="/templates/propose3/couple-stars.png" />}
                  </div>
                )}
              </div>

              <p style={{ fontStyle: "italic", fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
                <ET fid="s5_footer" data={d} onChange={oc} editMode={em} />
              </p>

              {/* Next Action */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={nextSlide}
                style={{
                  background: "linear-gradient(135deg, #EC4899, #8B5CF6)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "50px",
                  padding: "14px 40px",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                <ET fid="s5_btn" data={d} onChange={oc} editMode={em} />
              </motion.button>
            </motion.div>
          )}

          {activeSlide === 6 && (
            <motion.div
              key="slide6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
            >
              <h2 className="prop-title" style={{ fontSize: "2.3rem", color: "#EC4899", marginBottom: 12 }}>
                <ET fid="s6_heading" data={d} onChange={oc} editMode={em} />
              </h2>
              
              {/* Envelope Board */}
              <div style={{ margin: "30px 0", position: "relative" }}>
                {!letterOpen ? (
                  // Closed Envelope View
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    onClick={triggerLetterOpen}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "2.5px dashed #EC4899",
                      borderRadius: "24px",
                      padding: "40px 20px",
                      cursor: "pointer",
                      maxWidth: 340,
                      margin: "0 auto"
                    }}
                  >
                    {/* Closed image mascot */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.s6_img_closed || "/templates/propose3/cat-hearts.png"}
                      alt="Closed Envelope Mascot"
                      style={{ width: 140, height: 140, objectFit: "contain", margin: "0 auto 16px auto", filter: "drop-shadow(0 8px 16px rgba(236,72,153,0.3))" }}
                    />
                    <p className="prop-sans" style={{ fontSize: 14, fontWeight: 700, color: "#EC4899", margin: 0 }}>
                      <ET fid="s6_tap_text" data={d} onChange={oc} editMode={em} />
                    </p>
                  </motion.div>
                ) : (
                  // Open Letter View
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      background: "#FFFFFF",
                      color: "#1E293B",
                      borderRadius: "24px",
                      padding: "24px 20px",
                      maxWidth: 360,
                      margin: "0 auto",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                      textAlign: "left",
                      border: "3px solid #EC4899"
                    }}
                  >
                    {/* Open mascot */}
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={d.s6_img_open || "/templates/propose3/cat-aiming.png"}
                        alt="Open Letter Mascot"
                        style={{ width: 110, height: 110, objectFit: "contain", margin: "0 auto" }}
                      />
                    </div>

                    <p className="prop-title" style={{ fontSize: "1.6rem", color: "#EC4899", margin: "0 0 12px 0", fontWeight: 700 }}>
                      My Love,
                    </p>
                    
                    <p className="prop-sans" style={{ fontSize: 14, lineHeight: 1.6, color: "#334155", whiteSpace: "pre-line", marginBottom: 20 }}>
                      <ET fid="s6_letter_body" data={d} onChange={oc} editMode={em} multiline={true} />
                    </p>

                    <div style={{ borderTop: "1px dashed #E2E8F0", paddingTop: 12, textAlign: "right" }}>
                      <span className="prop-title" style={{ fontSize: "1.45rem", color: "#EC4899", display: "block" }}>
                        <ET fid="s6_signoff" data={d} onChange={oc} editMode={em} />
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Upload settings */}
              {em && (
                <div style={{ display: "flex", gap: 10, maxWidth: 360, margin: "10px auto" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Envelope Mascot</span>
                    <ImageUploader fid="s6_img_closed" data={d} onChange={oc} defaultSrc="/templates/propose3/cat-hearts.png" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Letter Mascot</span>
                    <ImageUploader fid="s6_img_open" data={d} onChange={oc} defaultSrc="/templates/propose3/cat-aiming.png" />
                  </div>
                </div>
              )}

              {letterOpen && (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={nextSlide}
                  style={{
                    background: "#EC4899",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "50px",
                    padding: "14px 44px",
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(236,72,153,0.3)",
                    marginTop: 20
                  }}
                >
                  Continue ➜
                </motion.button>
              )}
            </motion.div>
          )}

          {activeSlide === 7 && (
            <motion.div
              key="slide7"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
            >
              {/* Mascot decoration */}
              <div style={{ marginBottom: 20 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.s6_img_closed || "/templates/propose3/cat-hearts.png"}
                  alt="Final Choice Mascot"
                  style={{ width: 170, height: 170, objectFit: "contain", margin: "0 auto", filter: "drop-shadow(0 10px 25px rgba(236,72,153,0.4))" }}
                />
              </div>

              {/* Subtitle / Category */}
              <span className="prop-sans" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: "#EC4899", fontWeight: 700 }}>
                <ET fid="s7_heading" data={d} onChange={oc} editMode={em} />
              </span>

              {/* Question */}
              <h2 className="prop-title animate-prop-beat" style={{ fontSize: "2.6rem", color: "#FFFFFF", margin: "20px 0 40px 0", lineHeight: 1.25 }}>
                <ET fid="s7_question" data={d} onChange={oc} editMode={em} />
              </h2>

              {/* The big proposal yes button */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                onClick={nextSlide}
                className="pulse-pink-glow"
                style={{
                  background: "linear-gradient(135deg, #EC4899, #F43F5E)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "50px",
                  padding: "18px 48px",
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: "pointer",
                  letterSpacing: 0.5
                }}
              >
                <ET fid="s7_btn" data={d} onChange={oc} editMode={em} />
              </motion.button>
            </motion.div>
          )}

          {activeSlide === 8 && (
            <motion.div
              key="slide8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
            >
              {/* Floating Hearts Array */}
              <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 24 }}>
                {["💕", "🎉", "💖", "✨", "💕"].map((emoji, idx) => (
                  <motion.span
                    key={idx}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: idx * 0.2 }}
                    style={{ fontSize: 44 }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </div>

              {/* Success headings */}
              <h1 className="prop-title" style={{ fontSize: "3.4rem", color: "#EC4899", margin: "12px 0 6px 0", lineHeight: 1.15, textShadow: "0 0 30px rgba(236,72,153,0.5)" }}>
                <ET fid="s8_heading" data={d} onChange={oc} editMode={em} />
              </h1>
              
              <p className="prop-sans" style={{ fontSize: 20, color: "rgba(255,255,255,0.8)", fontWeight: 300, marginBottom: 24 }}>
                <ET fid="s8_subtext" data={d} onChange={oc} editMode={em} />
              </p>

              {/* Promise card container */}
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "2px solid rgba(255,255,255,0.1)",
                borderRadius: "24px",
                padding: "24px 20px",
                maxWidth: 360,
                margin: "0 auto 30px auto",
                backdropFilter: "blur(8px)"
              }}>
                <p className="prop-sans" style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.75)", margin: 0, whiteSpace: "pre-line" }}>
                  <ET fid="s8_promise" data={d} onChange={oc} editMode={em} multiline={true} />
                </p>
              </div>

              {/* Giant Beating Heart */}
              <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
                <motion.div
                  className="animate-prop-beat"
                  style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Heart size={110} color="#EC4899" fill="#EC4899" style={{ filter: "drop-shadow(0 0 25px rgba(236,72,153,0.6))" }} />
                </motion.div>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(236,72,153,0.25)", filter: "blur(24px)", transform: "scale(1.1)" }} />
              </div>

              {em && (
                <button
                  onClick={() => { setActiveSlide(1); setLetterOpen(false); }}
                  style={{
                    background: "none", border: "1px dashed rgba(255,255,255,0.3)",
                    borderRadius: "16px", padding: "8px 20px", fontSize: 12,
                    color: "rgba(255,255,255,0.5)", marginTop: 24, cursor: "pointer"
                  }}
                >
                  Replay preview 🔄
                </button>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Background Music Settings (Slide 0 in editor) */}
      {em && activeSlide === 0 && (
        <div style={{
          position: "fixed", top: "98px", bottom: 0, left: 0, right: 0, zIndex: 400,
          background: "rgba(15, 8, 29, 0.95)", backdropFilter: "blur(8px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 24, textAlign: "center"
        }}>
          <div style={{
            background: "#1E1B4B", border: "4px double #EC4899", borderRadius: 20,
            padding: "40px 24px", maxWidth: 420, width: "100%", boxShadow: "0 20px 50px rgba(236,72,153,0.3)"
          }}>
            <h3 className="prop-title" style={{ fontSize: "2rem", color: "#EC4899", marginBottom: 12 }}>
              Soundtrack Settings
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 28 }}>
              Select a sweet, romantic background music track for this proposal journey.
            </p>

            <div style={{ background: "rgba(236, 72, 153, 0.08)", border: "1px dashed rgba(236, 72, 153, 0.3)", borderRadius: 12, padding: "14px 18px", marginBottom: 28 }}>
              <p style={{ margin: 0, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#EC4899", fontWeight: 700 }}>Active Soundtrack</p>
              <p style={{ margin: "6px 0 0", fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>
                {d.bg_song_name || "Sweet Romantic Piano"}
              </p>
              {d.bg_song_url && (
                <button
                  onClick={() => {
                    oc?.("bg_song_name", "Sweet Romantic Piano");
                    oc?.("bg_song_url", "");
                  }}
                  style={{
                    marginTop: 10, background: "none", border: "none", color: "#EC4899",
                    fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline"
                  }}
                >
                  Reset to Default
                </button>
              )}
            </div>

            <button
              onClick={() => setBgModalOpen(true)}
              style={{
                background: "linear-gradient(135deg, #EC4899, #F43F5E)", color: "#fff",
                border: "none", borderRadius: 30, padding: "14px 36px", fontSize: 13,
                fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
                boxShadow: "0 6px 20px rgba(236,72,153,0.3)"
              }}
            >
              🎵 Choose Song
            </button>
          </div>
        </div>
      )}

      {bgModalOpen && (
        <SongLibraryPopup
          onClose={() => setBgModalOpen(false)}
          onSelect={(song) => {
            oc?.("bg_song_name", song.name);
            oc?.("bg_song_url", song.url || "");
            setBgModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
