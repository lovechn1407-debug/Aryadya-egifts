"use client";
import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Play, Pause, Music, Heart, Sparkles, Smile, Gift, Award, Check } from "lucide-react";
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
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (_) {}
  },
  bell() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const c = new AudioCtx();
      const now = c.currentTime;
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.05 - i * 0.01, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 - i * 0.2);
        osc.start(now);
        osc.stop(now + 1.3);
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
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.1);
      osc.frequency.setValueAtTime(659.25, now + 0.2);
      osc.frequency.setValueAtTime(880, now + 0.3);
      g.gain.setValueAtTime(0.06, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch (_) {}
  }
};

export default function DuduBirthday({
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

  const [preloading, setPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadText, setPreloadText] = useState("");

  useEffect(() => {
    if (editMode || autoPlay) return;
    setPreloading(true);
    let isCancelled = false;
    
    const runPreload = async () => {
      setPreloadProgress(10);
      setPreloadText("Warming up the lights...");
      await new Promise(r => setTimeout(r, 600));
      
      if (isCancelled) return;
      setPreloadProgress(30);
      setPreloadText("Tuning the background music...");
      await new Promise(r => setTimeout(r, 500));
      
      if (isCancelled) return;
      setPreloadProgress(60);
      setPreloadText("Loading polaroids and stars...");
      
      const assets = [
        customData.photo1, customData.photo2, customData.photo3, customData.photo4,
        customData.bg_song_url
      ].filter(Boolean);
      
      let loaded = 0;
      await Promise.all(assets.map(src => new Promise(res => {
        if (!src) { res(null); return; }
        const img = new Image();
        img.onload = () => {
          loaded++;
          if (!isCancelled) setPreloadProgress(60 + Math.floor((loaded/Math.max(assets.length, 1))*30));
          res(null);
        };
        img.onerror = () => res(null);
        img.src = src;
      })));
      
      if (isCancelled) return;
      setPreloadProgress(95);
      setPreloadText("Preparing the magic...");
      await new Promise(r => setTimeout(r, 400));
      
      if (isCancelled) return;
      setPreloadProgress(100);
      setPreloadText("Ready.");
      await new Promise(r => setTimeout(r, 200));
      
      if (!isCancelled) setPreloading(false);
    };
    
    runPreload();
    return () => { isCancelled = true; };
  }, [editMode, autoPlay, customData]);

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

  // ──────────────────────────────────────────────────────────
  // SLIDE 1 GAME: BALLOON POPPER
  // ──────────────────────────────────────────────────────────
  const [poppedBalloons, setPoppedBalloons] = useState<Record<number, boolean>>({});
  const balloonsText = "HAPPY BIRTHDAY!";
  const balloonsCount = balloonsText.length;
  const isBalloonGameWon = Object.keys(poppedBalloons).length === balloonsCount;

  const handlePopBalloon = (idx: number) => {
    if (poppedBalloons[idx]) return;
    PlaySynth.pop();
    setPoppedBalloons(prev => ({ ...prev, [idx]: true }));
    
    // Spawn local sparkles
    confetti({
      particleCount: 15,
      spread: 40,
      origin: { y: 0.6 }
    });
  };

  // ──────────────────────────────────────────────────────────
  // SLIDE 2 GAME: CLAW MACHINE OF LOVE
  // ──────────────────────────────────────────────────────────
  const [clawX, setClawX] = useState(150); // percentage range
  const [clawState, setClawState] = useState<"idle" | "dropping" | "grabbing" | "delivering" | "dropped">("idle");
  const [clawCapsule, setClawCapsule] = useState<string | null>(null);

  const handleDropClaw = () => {
    if (clawState !== "idle") return;
    setClawState("dropping");
    PlaySynth.pop();

    setTimeout(() => {
      setClawState("grabbing");
      setClawCapsule("💖");
      PlaySynth.bell();

      setTimeout(() => {
        setClawState("delivering");
        
        setTimeout(() => {
          setClawState("dropped");
          PlaySynth.success();
          confetti({ particleCount: 30, spread: 50 });
        }, 1200);
      }, 1000);
    }, 1000);
  };

  const resetClaw = () => {
    setClawState("idle");
    setClawCapsule(null);
  };

  // ──────────────────────────────────────────────────────────
  // SLIDE 3 GAME: PHOTO GALLERY CARD FLIPPING
  // ──────────────────────────────────────────────────────────
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const toggleFlip = (idx: number) => {
    PlaySynth.pop();
    setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // ──────────────────────────────────────────────────────────
  // SLIDE 4 GAME: CAKE BAKING drag and drop
  // ──────────────────────────────────────────────────────────
  const [addedIngredients, setAddedIngredients] = useState<Record<string, boolean>>({});
  const [bakeProgress, setBakeProgress] = useState(0);
  const [bakingComplete, setBakingComplete] = useState(false);

  const dragIngredient = (id: string) => {
    if (addedIngredients[id]) return;
    PlaySynth.pop();
    setAddedIngredients(prev => ({ ...prev, [id]: true }));
  };

  const handleStir = () => {
    if (bakeProgress >= 100) return;
    setBakeProgress(prev => {
      const next = prev + 5;
      if (next >= 100) {
        PlaySynth.success();
        confetti({ particleCount: 50, spread: 80 });
        setTimeout(() => setBakingComplete(true), 800);
        return 100;
      }
      if (next % 20 === 0) PlaySynth.pop();
      return next;
    });
  };

  const resetBake = () => {
    setAddedIngredients({});
    setBakeProgress(0);
    setBakingComplete(false);
  };

  // ──────────────────────────────────────────────────────────
  // SLIDE 5 GAME: 3D CAKE CUTTING (Tap candles + Drag Knife)
  // ──────────────────────────────────────────────────────────
  const [blownCandles, setBlownCandles] = useState<Record<number, boolean>>({});
  const [knifePosition, setKnifePosition] = useState(0); // 0 to 100
  const [cakeCutComplete, setCakeCutComplete] = useState(false);
  const candlesCount = 3;
  const allCandlesBlown = Object.keys(blownCandles).length === candlesCount;

  const handleBlowCandle = (idx: number) => {
    if (blownCandles[idx]) return;
    PlaySynth.pop();
    setBlownCandles(prev => ({ ...prev, [idx]: true }));
  };

  const handleKnifeDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!allCandlesBlown || cakeCutComplete) return;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    // Simulate drag progression simply by moving knife down
    setKnifePosition(prev => {
      const next = prev + 8;
      if (next >= 100) {
        PlaySynth.success();
        confetti({ particleCount: 80, spread: 90 });
        setCakeCutComplete(true);
        return 100;
      }
      return next;
    });
  };

  const resetCakeCut = () => {
    setBlownCandles({});
    setKnifePosition(0);
    setCakeCutComplete(false);
  };

  // ──────────────────────────────────────────────────────────
  // SLIDE 6 GAME: WISHING WELL AND STARS
  // ──────────────────────────────────────────────────────────
  const [wishUnlocked, setWishUnlocked] = useState(false);
  const triggerWishWell = () => {
    if (wishUnlocked) return;
    PlaySynth.bell();
    confetti({ particleCount: 40, spread: 70 });
    setWishUnlocked(true);
  };

  // ──────────────────────────────────────────────────────────
  // SLIDE 7 GAME: RHYTHM DANCE
  // ──────────────────────────────────────────────────────────
  const [rhythmHits, setRhythmHits] = useState(0);
  const [danceActive, setDanceActive] = useState(false);
  const totalRhythmTarget = 5;

  const handleRhythmTap = () => {
    if (rhythmHits >= totalRhythmTarget) return;
    PlaySynth.pop();
    setRhythmHits(prev => {
      const next = prev + 1;
      if (next >= totalRhythmTarget) {
        PlaySynth.success();
        confetti({ particleCount: 60, spread: 80 });
        setDanceActive(true);
      }
      return next;
    });
  };

  const resetRhythm = () => {
    setRhythmHits(0);
    setDanceActive(false);
  };

  // ──────────────────────────────────────────────────────────
  // SLIDE 8 GAME: SCRATCH CARD CANVAS
  // ──────────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [scratchComplete, setScratchComplete] = useState(false);

  // Initialize canvas scratch coating
  useEffect(() => {
    if (activeSlide !== 8 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw cute pink/glittery cover
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#FFB7CE");
    grad.addColorStop(0.5, "#FFD3E0");
    grad.addColorStop(1, "#FF69B4");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Write instruction text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ Rub to Scratch Off Glitter ✨", canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText("💌 Read Your Love Letter 💌", canvas.width / 2, canvas.height / 2 + 15);
  }, [activeSlide]);

  const handleScratchMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (scratchComplete || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Check coverage occasionally
    if (Math.random() < 0.1) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      let transparentCount = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparentCount++;
      }
      const pct = (transparentCount / (pixels.length / 4)) * 100;
      setScratchedPercentage(pct);
      
      if (pct >= 55) {
        setScratchComplete(true);
        PlaySynth.success();
        confetti({ particleCount: 50, spread: 80 });
      }
    }
  };

  const resetScratch = () => {
    setScratchedPercentage(0);
    setScratchComplete(false);
  };

  // ──────────────────────────────────────────────────────────
  // SLIDE 9: FINALE & WAX SEAL
  // ──────────────────────────────────────────────────────────
  const [sealed, setSealed] = useState(false);
  const handleSeal = () => {
    if (sealed) return;
    PlaySynth.success();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.65 }
    });
    setSealed(true);
  };

  return (
    <div style={{
      background: "#FFFDF0", color: "#4A2E35", fontFamily: "'Nunito', sans-serif",
      minHeight: "100vh", padding: "16px 8px 80px 8px", position: "relative",
      display: "flex", flexDirection: "column", alignItems: "center", overflowX: "hidden"
    }}>
      {/* Google fonts link inside style element */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Nunito:wght@400;600;700;800&family=Sacramento&display=swap');
        
        .dudu-script {
          font-family: 'Sacramento', cursive;
          font-weight: bold;
        }
        .dudu-vibes {
          font-family: 'Great Vibes', cursive;
        }
        
        /* Floating animations */
        @keyframes balloonFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1.5deg); }
        }
        .balloon-floating {
          animation: balloonFloat 4s ease-in-out infinite;
        }

        /* Twinkle stars */
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .star-twinkling {
          animation: starTwinkle 2s infinite ease-in-out;
        }
      `}} />

      {/* Floating Music Toggle Button */}
      {preloading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "#06060A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3.5px solid rgba(255, 105, 180, 0.15)", borderTopColor: "#FF69B4", animation: "tmpl-spin 0.9s cubic-bezier(0.16, 1, 0.3, 1) infinite", marginBottom: 20 }} />
          <h2 style={{ fontWeight: 800, color: "#FFFDF0", fontSize: 18, letterSpacing: -0.3, animation: "tmpl-pulse 2s infinite", marginBottom: 16 }}>Opening Your Surprise</h2>
          
          <div style={{ width: 240, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", background: "#FF69B4", width: `${preloadProgress}%`, transition: "width 0.3s ease" }} />
          </div>
          <p style={{ color: "#FF69B4", fontSize: 13, opacity: 0.8 }}>{preloadText}</p>
          
          <style>{`
            @keyframes tmpl-spin { 100% { transform: rotate(360deg); } }
            @keyframes tmpl-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
          `}</style>
        </div>
      )}
      {!em && !preloading && (
        <button
          onClick={toggleMusic}
          style={{
            position: "fixed", bottom: 20, left: 20, zIndex: 1000,
            width: 48, height: 48, borderRadius: "50%", background: "#FFB7CE",
            border: "2px solid #FFFDF0", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 16px rgba(255, 105, 180, 0.3)", cursor: "pointer"
          }}
        >
          {musicPlaying ? <Pause size={18} color="#FFFDF0" /> : <Play size={18} color="#FFFDF0" style={{ marginLeft: 2 }} />}
        </button>
      )}

      {/* ──────────────────────────────────────────────────────────
          MAIN SLIDES CONTAINER (SPRINGY TRANSITIONS)
          ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center", position: "relative" }}>
        
        <AnimatePresence mode="wait">
          {activeSlide === 1 && (
            <motion.div
              key="slide1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
            >
              <span style={{ textTransform: "uppercase", fontSize: 11, fontWeight: 800, color: "#FF69B4", letterSpacing: 2 }}>Dudu Bear's Dreamland</span>
              <h1 className="dudu-script" style={{ fontSize: "2.8rem", color: "#FF69B4", margin: "8px 0" }}>
                <ET fid="s1_heading" data={d} onChange={oc} editMode={em} />
              </h1>
              
              {/* Balloon Popper Board */}
              <div style={{ background: "#FFE5D9", padding: "16px 12px", borderRadius: 20, margin: "20px 0", border: "3px dashed #FFB7CE" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#FF69B4", marginBottom: 12 }}>Pop all balloons to reveal the magic! 🎈</p>
                
                {/* Popped target frame spelling "HAPPY BIRTHDAY!" */}
                <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap", minHeight: 30, background: "#FFF", borderRadius: 12, padding: "8px 6px", border: "1px solid #FFE5D9", marginBottom: 20 }}>
                  {balloonsText.split("").map((char, i) => {
                    const isPopped = poppedBalloons[i];
                    return (
                      <span key={i} style={{
                        width: 24, height: 24, background: isPopped ? "#FFB7CE" : "#F3F4F6",
                        color: isPopped ? "#fff" : "transparent", display: "inline-flex",
                        alignItems: "center", justifyContent: "center", borderRadius: 4,
                        fontSize: 12, fontWeight: 900, transition: "all 0.3s"
                      }}>
                        {char}
                      </span>
                    );
                  })}
                </div>

                {/* Balloons grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, justifyItems: "center" }}>
                  {[...Array(balloonsCount)].map((_, i) => {
                    const popped = poppedBalloons[i];
                    const bgColors = ["#FFB7CE", "#FFD3E0", "#FFFDF0", "#FFE5D9", "#F3E5F5"];
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ scale: popped ? 1 : 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="balloon-floating"
                        onClick={() => handlePopBalloon(i)}
                        style={{
                          width: 38, height: 48, background: popped ? "transparent" : bgColors[i % bgColors.length],
                          borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%", display: "flex",
                          alignItems: "center", justifyContent: "center", cursor: popped ? "default" : "pointer",
                          boxShadow: popped ? "none" : "0 6px 12px rgba(255, 105, 180, 0.15)",
                          border: popped ? "none" : "1.5px solid rgba(255, 105, 180, 0.2)",
                          position: "relative",
                          animationDelay: `${i * 0.2}s`
                        }}
                      >
                        {!popped && (
                          <>
                            {/* Balloon string knots */}
                            <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, background: "rgba(0,0,0,0.1)", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
                            <div style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", width: 1, height: 16, background: "rgba(0,0,0,0.15)" }} />
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <p className="lato-text" style={{ fontSize: 15, lineHeight: 1.7, color: "#6E5B60", margin: "16px 0" }}>
                <ET fid="s1_message" data={d} onChange={oc} editMode={em} multiline={true} />
              </p>

              {/* Decorative Bear */}
              <div style={{ margin: "24px 0" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/templates/pastel-dudu-birthday/bear1.gif" alt="Balloons Dudu" style={{ width: 120, height: 120, objectFit: "contain", margin: "0 auto" }} />
              </div>

              {isBalloonGameWon && (
                <motion.button
                  onClick={nextSlide}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: "linear-gradient(135deg, #FF69B4, #FFB7CE)", color: "#fff",
                    border: "none", borderRadius: 30, padding: "14px 44px", fontSize: 15,
                    fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(255, 105, 180, 0.4)",
                    marginTop: 16
                  }}
                >
                  <ET fid="s1_cta" data={d} onChange={oc} editMode={em} /> ➜
                </motion.button>
              )}
            </motion.div>
          )}

          {activeSlide === 2 && (
            <motion.div
              key="slide2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
            >
              <span style={{ textTransform: "uppercase", fontSize: 11, fontWeight: 800, color: "#FF69B4", letterSpacing: 2 }}>Interactive Arcade</span>
              <h2 className="dudu-script" style={{ fontSize: "2.5rem", color: "#FF69B4", margin: "8px 0" }}>Claw Machine of Love 🧸</h2>
              
              <div style={{ background: "#F3E5F5", padding: 20, borderRadius: 24, border: "3px solid #D946EF", margin: "20px 0", position: "relative", minHeight: 320, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                
                {/* Claw Machine Box Viewport */}
                <div style={{ background: "rgba(255, 255, 255, 0.7)", border: "2px solid #E2E8F0", height: 180, borderRadius: 14, position: "relative", overflow: "hidden" }}>
                  
                  {/* The Claw */}
                  <motion.div
                    animate={{
                      x: clawX,
                      y: clawState === "dropping" || clawState === "grabbing" ? 110 : 10
                    }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    style={{ position: "absolute", top: 0, left: 10, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}
                  >
                    {/* Metal string */}
                    <div style={{ width: 2, height: 60, background: "#888" }} />
                    {/* Metal hand */}
                    <div style={{ display: "flex", gap: 10, fontSize: 20 }}>
                      <span style={{ transform: "scaleX(-1)", display: "inline-block" }}>☝️</span>
                      {clawCapsule && <span style={{ position: "absolute", bottom: -18, fontSize: 14 }}>{clawCapsule}</span>}
                      <span>☝️</span>
                    </div>
                  </motion.div>

                  {/* Floating capsules inside machine */}
                  <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "space-around", gap: 8, padding: "0 10px" }}>
                    <div style={{ fontSize: 22, animation: "balloonFloat 3s ease-in-out infinite" }}>💛</div>
                    <div style={{ fontSize: 24, animation: "balloonFloat 3.8s ease-in-out infinite" }}>❤️</div>
                    <div style={{ fontSize: 22, animation: "balloonFloat 2.9s ease-in-out infinite" }}>💖</div>
                    <div style={{ fontSize: 20, animation: "balloonFloat 3.3s ease-in-out infinite" }}>💚</div>
                  </div>

                  {/* Win Delivery chute */}
                  <div style={{ position: "absolute", bottom: 0, left: 20, width: 44, height: 36, background: "#4A4A68", borderRadius: "10px 10px 0 0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10 }}>Chute</div>
                </div>

                {/* Joystick Control board */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12 }}>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.5)", borderRadius: 12, padding: "8px 10px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, margin: 0, textTransform: "uppercase" }}><ET fid="s2_joystick_label" data={d} onChange={oc} editMode={em} /></p>
                    <input
                      type="range" min="0" max="280" value={clawX}
                      onChange={(e) => clawState === "idle" && setClawX(parseInt(e.target.value, 10))}
                      disabled={clawState !== "idle"}
                      style={{ width: "100%", accentColor: "#FF69B4", marginTop: 6 }}
                    />
                  </div>

                  <button
                    onClick={handleDropClaw}
                    disabled={clawState !== "idle"}
                    style={{
                      background: "#FF69B4", color: "#fff", border: "none", borderRadius: "50%",
                      width: 58, height: 58, fontSize: 11, fontWeight: 900, cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(255,105,180,0.3)", opacity: clawState !== "idle" ? 0.6 : 1
                    }}
                  >
                    DROP
                  </button>
                </div>
              </div>

              {/* Reveal capsules drop */}
              {clawState === "dropped" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ background: "#FFFDF0", border: "2px solid #FF69B4", borderRadius: 16, padding: "16px 12px", margin: "20px 0", position: "relative" }}
                >
                  <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>🎁</span>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: "#FF69B4", margin: 0 }}>
                    <ET fid="s2_win_message" data={d} onChange={oc} editMode={em} />
                  </h4>
                  <button onClick={resetClaw} style={{ marginTop: 10, fontSize: 11, background: "none", border: "none", color: "#666", textDecoration: "underline", cursor: "pointer" }}>Try Again</button>
                </motion.div>
              )}

              {/* Decorative Bear */}
              <div style={{ margin: "20px 0" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/templates/pastel-dudu-birthday/bear7.gif" alt="Claw Dudu" style={{ width: 100, height: 100, objectFit: "contain", margin: "0 auto" }} />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
                <button onClick={prevSlide} style={{ background: "none", border: "2px solid #FFB7CE", color: "#FF69B4", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Back</button>
                <button onClick={nextSlide} style={{ background: "#FF69B4", color: "#fff", border: "none", padding: "10px 28px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Next ➜</button>
              </div>
            </motion.div>
          )}

          {activeSlide === 3 && (
            <motion.div
              key="slide3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
            >
              <span style={{ textTransform: "uppercase", fontSize: 11, fontWeight: 800, color: "#FF69B4", letterSpacing: 2 }}>Interactive Stack</span>
              <h2 className="dudu-script" style={{ fontSize: "2.5rem", color: "#FF69B4", margin: "8px 0" }}>Polaroid Memory Lane 📸</h2>
              <p style={{ fontSize: 12, color: "#6E5B60", margin: "0 0 16px 0" }}>Click cards to flip them and read sweet notes!</p>
              
              {/* Draggable Stack Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, margin: "20px 0" }}>
                {[1, 2, 3, 4].map((num) => {
                  const key = `photo${num}`;
                  const noteKey = `photo${num}_note`;
                  const defaultImg = `/templates/royal-wedding-2/photo${num}.jpg`;
                  const imgUrl = d[key] || defaultImg;
                  const isFlipped = flippedCards[num];

                  return (
                    <div key={num} style={{ perspective: 1000, height: 230, position: "relative" }}>
                      <motion.div
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6 }}
                        style={{
                          width: "100%", height: "100%", transformStyle: "preserve-3d",
                          position: "relative", cursor: "pointer"
                        }}
                        onClick={() => toggleFlip(num)}
                      >
                        {/* Front of card */}
                        <div style={{
                          position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
                          background: "#fff", border: "5px solid #fff", borderRadius: 8,
                          boxShadow: "0 8px 20px rgba(0,0,0,0.12)", padding: 8, display: "flex",
                          flexDirection: "column", justifyContent: "space-between"
                        }}>
                          <div style={{ width: "100%", height: 160, background: "#f3f4f6", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imgUrl} alt={`Memory ${num}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                          <span style={{ fontSize: 11, fontStyle: "italic", color: "#888", display: "block", marginTop: 8 }}>Click to flip 🌸</span>
                        </div>

                        {/* Back of card */}
                        <div style={{
                          position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(180deg)", background: "#FFF0F5", border: "5px solid #fff",
                          borderRadius: 8, boxShadow: "0 8px 20px rgba(0,0,0,0.12)", padding: 12,
                          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
                        }}>
                          <Heart size={20} color="#FF69B4" style={{ marginBottom: 12 }} />
                          <p className="dudu-vibes" style={{ fontSize: "1.45rem", color: "#FF69B4", margin: "0 0 10px 0", lineHeight: 1.3 }}>
                            <ET fid={noteKey} data={d} onChange={oc} editMode={em} />
                          </p>
                          {em && <ImageUploader fid={key} data={d} onChange={oc} defaultSrc={defaultImg} />}
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
                <button onClick={prevSlide} style={{ background: "none", border: "2px solid #FFB7CE", color: "#FF69B4", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Back</button>
                <button onClick={nextSlide} style={{ background: "#FF69B4", color: "#fff", border: "none", padding: "10px 28px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Next ➜</button>
              </div>
            </motion.div>
          )}

          {activeSlide === 4 && (
            <motion.div
              key="slide4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
            >
              <span style={{ textTransform: "uppercase", fontSize: 11, fontWeight: 800, color: "#FF69B4", letterSpacing: 2 }}>Kitchen Magic</span>
              <h2 className="dudu-script" style={{ fontSize: "2.5rem", color: "#FF69B4", margin: "8px 0" }}>
                <ET fid="s4_recipe_title" data={d} onChange={oc} editMode={em} />
              </h2>
              
              <div style={{ background: "#FFF5F5", padding: 20, borderRadius: 24, border: "2px dashed #FFB7CE", margin: "20px 0" }}>
                <p style={{ fontSize: 13, color: "#8E7278", marginBottom: 16 }}>Tap ingredients to add them to the mixing bowl, then stir!</p>

                {/* Recipe checklist */}
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
                  {["Sugar 🍬", "Eggs 🥚", "Flour 🌾", "Syrup 🍓"].map((ing) => {
                    const id = ing.split(" ")[0].toLowerCase();
                    const added = addedIngredients[id];
                    return (
                      <button
                        key={id} onClick={() => dragIngredient(id)}
                        style={{
                          background: added ? "#FFB7CE" : "#fff", color: added ? "#fff" : "#4A2E35",
                          border: "1.5px solid #FFB7CE", borderRadius: 20, padding: "6px 14px",
                          fontSize: 12, fontWeight: 700, cursor: added ? "default" : "pointer",
                          display: "flex", alignItems: "center", gap: 6
                        }}
                      >
                        {added ? "✓" : "+"} {ing}
                      </button>
                    );
                  })}
                </div>

                {/* Mixing bowl & stirring panel */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #FFE5D9", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* Bowl Graphic */}
                  <div style={{ width: 100, height: 60, background: "#FFD3E0", borderRadius: "10px 10px 40px 40px", border: "2px solid #FF69B4", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <div style={{ width: 80, height: 10, background: "#FFFDF0", borderBottom: "1px solid #FFB7CE", position: "absolute", top: 4, borderRadius: "50%" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#D92478" }}>MIXING BOWL</span>
                  </div>

                  {/* Circular stirring gesture panel */}
                  {Object.keys(addedIngredients).length === 4 && !bakingComplete && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ marginTop: 16, width: "100%" }}
                    >
                      <button
                        onClick={handleStir}
                        style={{
                          background: "linear-gradient(135deg, #FF69B4, #FFD3E0)", color: "#fff",
                          border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13,
                          fontWeight: 800, cursor: "pointer", width: "100%"
                        }}
                      >
                        🔄 Tap to Stir Batter ({bakeProgress}%)
                      </button>
                      <div style={{ width: "100%", height: 6, background: "#F1F5F9", borderRadius: 4, marginTop: 10, overflow: "hidden" }}>
                        <div style={{ width: `${bakeProgress}%`, height: "100%", background: "#FF69B4" }} />
                      </div>
                    </motion.div>
                  )}

                  {bakingComplete && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ marginTop: 16, color: "#D92478", fontWeight: 800 }}
                    >
                      🍰 <ET fid="s4_success_message" data={d} onChange={oc} editMode={em} />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Decorative Bear */}
              <div style={{ margin: "20px 0" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/templates/pastel-dudu-birthday/bear9.gif" alt="Baking Dudu" style={{ width: 100, height: 100, objectFit: "contain", margin: "0 auto" }} />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
                <button onClick={() => { prevSlide(); resetBake(); }} style={{ background: "none", border: "2px solid #FFB7CE", color: "#FF69B4", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Back</button>
                <button onClick={nextSlide} style={{ background: "#FF69B4", color: "#fff", border: "none", padding: "10px 28px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Next ➜</button>
              </div>
            </motion.div>
          )}

          {activeSlide === 5 && (
            <motion.div
              key="slide5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
            >
              <span style={{ textTransform: "uppercase", fontSize: 11, fontWeight: 800, color: "#FF69B4", letterSpacing: 2 }}>Birthday Ritual</span>
              <h2 className="dudu-script" style={{ fontSize: "2.5rem", color: "#FF69B4", margin: "8px 0" }}>Cut the Cake! 🎂</h2>
              
              <div style={{ background: "#FFF5F5", padding: 20, borderRadius: 24, border: "2px solid #FFB7CE", margin: "20px 0", position: "relative" }}>
                
                {/* Blowing Candles Stage */}
                {!allCandlesBlown && (
                  <p style={{ fontSize: 12, color: "#8E7278", marginBottom: 14 }}>Tap each candle to blow it out! 🕯️</p>
                )}

                {allCandlesBlown && !cakeCutComplete && (
                  <p style={{ fontSize: 12, color: "#8E7278", marginBottom: 14 }}>Tap the knife repeatedly to slice the cake! 🔪</p>
                )}

                {/* Cake Graphic Wrapper */}
                <div style={{ display: "flex", justifyContent: "center", gap: 16, height: 160, position: "relative", alignItems: "flex-end", overflow: "hidden" }}>
                  
                  {/* Left part of cake */}
                  <motion.div
                    animate={{ x: cakeCutComplete ? -40 : 0, rotate: cakeCutComplete ? -6 : 0 }}
                    style={{ width: 80, height: 90, background: "#FFD3E0", borderRadius: "16px 0 0 16px", border: "3px solid #FF69B4", borderRight: "none", position: "relative" }}
                  >
                    <div style={{ position: "absolute", top: -8, left: 10, width: 24, height: 8, background: "#FFF", borderRadius: "50% 0 0 50%" }} />
                  </motion.div>

                  {/* Right part of cake */}
                  <motion.div
                    animate={{ x: cakeCutComplete ? 40 : 0, rotate: cakeCutComplete ? 6 : 0 }}
                    style={{ width: 80, height: 90, background: "#FFD3E0", borderRadius: "0 16px 16px 0", border: "3px solid #FF69B4", borderLeft: "none", position: "relative" }}
                  >
                    <div style={{ position: "absolute", top: -8, right: 10, width: 24, height: 8, background: "#FFF", borderRadius: "0 50% 50% 0" }} />
                  </motion.div>

                  {/* Dynamic Candles (placed on top of cake parts) */}
                  {!cakeCutComplete && (
                    <div style={{ position: "absolute", top: 25, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
                      {[0, 1, 2].map((idx) => {
                        const blown = blownCandles[idx];
                        return (
                          <div
                            key={idx} onClick={() => handleBlowCandle(idx)}
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: blown ? "default" : "pointer" }}
                          >
                            {!blown && (
                              <motion.div
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ repeat: Infinity, duration: 0.6 }}
                                style={{ width: 10, height: 14, background: "radial-gradient(#FFF 10%, #FFA500 50%, #FF0000 100%)", borderRadius: "50% 50% 20% 20%" }}
                              />
                            )}
                            <div style={{ width: 6, height: 26, background: "#B2F5EA", border: "1.5px solid #FF69B4", borderRadius: 2 }} />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* The virtual knife */}
                  {allCandlesBlown && !cakeCutComplete && (
                    <motion.div
                      onClick={handleKnifeDrag}
                      animate={{ y: [0, 15, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      style={{ position: "absolute", top: 10, zIndex: 30, fontSize: 36, cursor: "pointer", pointerEvents: "auto" }}
                    >
                      🔪
                    </motion.div>
                  )}

                  {/* Dotted Cut Guideline */}
                  {allCandlesBlown && !cakeCutComplete && (
                    <div style={{ position: "absolute", top: 40, bottom: 10, left: "50%", width: 2, borderLeft: "3px dashed #FF69B4", transform: "translateX(-50%)" }} />
                  )}

                  {/* Wish revealed in between parted cake halves */}
                  {cakeCutComplete && (
                    <motion.div
                      initial={{ scale: 0.5, y: 60, opacity: 0 }}
                      animate={{ scale: 1, y: -10, opacity: 1 }}
                      style={{ position: "absolute", top: 30, zIndex: 25, background: "#FFFDF0", border: "2px solid #FF69B4", borderRadius: 14, padding: "10px 14px", width: "70%" }}
                    >
                      <span style={{ fontSize: 24, display: "block" }}>⭐️</span>
                      <h4 className="dudu-vibes" style={{ fontSize: "1.35rem", color: "#FF69B4", margin: "4px 0 0" }}>
                        <ET fid="s5_wish_message" data={d} onChange={oc} editMode={em} multiline={true} />
                      </h4>
                      <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 700, color: "#888" }}>Turning <ET fid="s5_age" data={d} onChange={oc} editMode={em} />!</p>
                    </motion.div>
                  )}
                </div>

                {cakeCutComplete && (
                  <button onClick={resetCakeCut} style={{ marginTop: 14, fontSize: 11, background: "none", border: "none", color: "#666", textDecoration: "underline", cursor: "pointer" }}>Bake & Cut Again</button>
                )}
              </div>

              {/* Decorative Bear */}
              <div style={{ margin: "20px 0" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/templates/pastel-dudu-birthday/bear11.gif" alt="Cake Dudu" style={{ width: 100, height: 100, objectFit: "contain", margin: "0 auto" }} />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
                <button onClick={() => { prevSlide(); resetCakeCut(); }} style={{ background: "none", border: "2px solid #FFB7CE", color: "#FF69B4", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Back</button>
                <button onClick={nextSlide} style={{ background: "#FF69B4", color: "#fff", border: "none", padding: "10px 28px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Next ➜</button>
              </div>
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
              <span style={{ textTransform: "uppercase", fontSize: 11, fontWeight: 800, color: "#FF69B4", letterSpacing: 2 }}>Twilight Starfall</span>
              <h2 className="dudu-script" style={{ fontSize: "2.5rem", color: "#FF69B4", margin: "8px 0" }}>The Wishing Well 🌟</h2>
              
              <div style={{
                background: "linear-gradient(to bottom, #1A0C2E, #4A1E6E)", padding: 20, borderRadius: 24,
                border: "2px solid #FFB7CE", margin: "20px 0", position: "relative", minHeight: 280,
                display: "flex", flexDirection: "column", justifyContent: "space-between"
              }}>
                
                {/* Stars shooting across twilit sky */}
                <div style={{ position: "relative", height: 120, overflow: "hidden" }}>
                  <motion.div
                    animate={{ x: [-20, 240], y: [-20, 100] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    style={{ position: "absolute", fontSize: 16 }}
                  >
                    💫
                  </motion.div>
                  <motion.div
                    animate={{ x: [-40, 280], y: [10, 80] }}
                    transition={{ repeat: Infinity, duration: 4, delay: 1.5, ease: "linear" }}
                    style={{ position: "absolute", fontSize: 18 }}
                  >
                    ✨
                  </motion.div>

                  {/* Drop star trigger target */}
                  {!wishUnlocked && (
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      onClick={triggerWishWell}
                      style={{
                        position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)",
                        background: "rgba(255,255,255,0.15)", border: "2px dashed #C8960A", borderRadius: "50%",
                        width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, color: "#fff", cursor: "pointer", boxShadow: "0 0 16px #C8960A"
                      }}
                    >
                      ⭐
                    </motion.div>
                  )}
                </div>

                {/* Stone well graphic */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 80, height: 48, background: "#8E8E9F", border: "2px solid #C8960A", borderRadius: 8, position: "relative" }}>
                    <div style={{ width: 72, height: 10, background: "#111", borderRadius: "50%", margin: "4px auto 0" }} />
                    <span style={{ fontSize: 9, color: "#FFD700", fontWeight: 800 }}>WELL</span>
                  </div>
                  <p style={{ color: "#FFE5D9", fontSize: 12, marginTop: 8 }}><ET fid="s6_well_label" data={d} onChange={oc} editMode={em} /></p>
                </div>
              </div>

              {/* Reveal Wish */}
              {wishUnlocked && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ background: "#FFE5D9", border: "2px solid #FF69B4", borderRadius: 20, padding: 18, margin: "20px 0" }}
                >
                  <p className="dudu-vibes" style={{ fontSize: "1.65rem", color: "#FF69B4", margin: 0, lineHeight: 1.4 }}>
                    <ET fid="s6_sender_wish" data={d} onChange={oc} editMode={em} multiline={true} />
                  </p>
                  <button onClick={() => setWishUnlocked(false)} style={{ marginTop: 10, fontSize: 11, background: "none", border: "none", color: "#666", textDecoration: "underline", cursor: "pointer" }}>Wish Again</button>
                </motion.div>
              )}

              {/* Decorative Bear */}
              <div style={{ margin: "20px 0" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/templates/pastel-dudu-birthday/bear12.gif" alt="Well Dudu" style={{ width: 100, height: 100, objectFit: "contain", margin: "0 auto" }} />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
                <button onClick={() => { prevSlide(); setWishUnlocked(false); }} style={{ background: "none", border: "2px solid #FFB7CE", color: "#FF69B4", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Back</button>
                <button onClick={nextSlide} style={{ background: "#FF69B4", color: "#fff", border: "none", padding: "10px 28px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Next ➜</button>
              </div>
            </motion.div>
          )}

          {activeSlide === 7 && (
            <motion.div
              key="slide7"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
            >
              <span style={{ textTransform: "uppercase", fontSize: 11, fontWeight: 800, color: "#FF69B4", letterSpacing: 2 }}>Rhythm Beat</span>
              <h2 className="dudu-script" style={{ fontSize: "2.5rem", color: "#FF69B4", margin: "8px 0" }}>
                <ET fid="s7_dance_label" data={d} onChange={oc} editMode={em} />
              </h2>
              
              <div style={{ background: "#FFFDF0", padding: 20, borderRadius: 24, border: "2px dashed #FF69B4", margin: "20px 0" }}>
                <p style={{ fontSize: 12, color: "#6E5B60", marginBottom: 14 }}>Tap the button matching the beats! ({rhythmHits}/{totalRhythmTarget})</p>
                
                {/* Fall path simulation visual */}
                <div style={{ display: "flex", justifyContent: "center", gap: 14, height: 90, position: "relative", marginBottom: 20 }}>
                  {[0, 1, 2, 3].map((col) => {
                    const active = rhythmHits % 4 === col;
                    return (
                      <div key={col} style={{ width: 44, height: "100%", background: "rgba(255, 183, 206, 0.08)", border: "1px solid rgba(255,183,206,0.3)", borderRadius: 8, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 6 }}>
                        {active && !danceActive && (
                          <motion.span
                            animate={{ y: [-70, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            style={{ fontSize: 18 }}
                          >
                            💖
                          </motion.span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Dance game hit targets */}
                <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
                  <button
                    onClick={handleRhythmTap}
                    style={{
                      background: "linear-gradient(135deg, #FF69B4, #FFB7CE)", color: "#fff",
                      border: "none", borderRadius: 14, padding: "12px 30px", fontSize: 14,
                      fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 12px rgba(255,105,180,0.3)"
                    }}
                  >
                    TAP BEAT 🎵
                  </button>
                </div>
              </div>

              {danceActive && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ background: "#FFD3E0", borderRadius: 16, padding: "12px", margin: "16px 0", color: "#FF69B4", fontWeight: 800 }}
                >
                  🎀 <ET fid="s7_success_banner" data={d} onChange={oc} editMode={em} /> 🎀
                  <button onClick={resetRhythm} style={{ display: "block", margin: "6px auto 0", fontSize: 10, background: "none", border: "none", color: "#666", textDecoration: "underline", cursor: "pointer" }}>Dance Again</button>
                </motion.div>
              )}

              {/* Decorative Bear */}
              <div style={{ margin: "20px 0" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/templates/pastel-dudu-birthday/bear13.gif" alt="Dance Dudu" style={{ width: 120, height: 120, objectFit: "contain", margin: "0 auto" }} />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
                <button onClick={() => { prevSlide(); resetRhythm(); }} style={{ background: "none", border: "2px solid #FFB7CE", color: "#FF69B4", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Back</button>
                <button onClick={nextSlide} style={{ background: "#FF69B4", color: "#fff", border: "none", padding: "10px 28px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Next ➜</button>
              </div>
            </motion.div>
          )}

          {activeSlide === 8 && (
            <motion.div
              key="slide8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
            >
              <span style={{ textTransform: "uppercase", fontSize: 11, fontWeight: 800, color: "#FF69B4", letterSpacing: 2 }}>Canvas Scratch</span>
              <h2 className="dudu-script" style={{ fontSize: "2.5rem", color: "#FF69B4", margin: "8px 0" }}>
                <ET fid="s8_scratch_label" data={d} onChange={oc} editMode={em} />
              </h2>
              
              <div style={{ position: "relative", width: 320, height: 180, margin: "20px auto", borderRadius: 16, overflow: "hidden", border: "3px solid #FFB7CE", boxShadow: "0 8px 24px rgba(255,105,180,0.12)" }}>
                {/* Underneath secret love letter */}
                <div style={{ position: "absolute", inset: 0, background: "#FFFDF0", padding: 16, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                  <p className="dudu-vibes" style={{ fontSize: "1.35rem", color: "#FF69B4", margin: 0, lineHeight: 1.4, whiteSpace: "pre-line" }}>
                    <ET fid="s8_secret_letter" data={d} onChange={oc} editMode={em} multiline={true} />
                  </p>
                </div>

                {/* Scratch Coating Canvas */}
                {!scratchComplete && (
                  <canvas
                    ref={canvasRef} width={320} height={180}
                    onMouseMove={isScratching ? handleScratchMove : undefined}
                    onMouseDown={() => setIsScratching(true)}
                    onMouseUp={() => setIsScratching(false)}
                    onMouseLeave={() => setIsScratching(false)}
                    onTouchStart={() => setIsScratching(true)}
                    onTouchEnd={() => setIsScratching(false)}
                    onTouchMove={handleScratchMove}
                    style={{ position: "absolute", inset: 0, zIndex: 10, cursor: "crosshair", width: "100%", height: "100%" }}
                  />
                )}
              </div>

              {scratchComplete && (
                <button onClick={resetScratch} style={{ fontSize: 11, background: "none", border: "none", color: "#666", textDecoration: "underline", cursor: "pointer", marginTop: 8 }}>Scratch Cover Again</button>
              )}

              {/* Decorative Bear */}
              <div style={{ margin: "20px 0" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/templates/pastel-dudu-birthday/bear14.gif" alt="Scratch Dudu" style={{ width: 100, height: 100, objectFit: "contain", margin: "0 auto" }} />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
                <button onClick={() => { prevSlide(); resetScratch(); }} style={{ background: "none", border: "2px solid #FFB7CE", color: "#FF69B4", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Back</button>
                <button onClick={nextSlide} style={{ background: "#FF69B4", color: "#fff", border: "none", padding: "10px 28px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Next ➜</button>
              </div>
            </motion.div>
          )}

          {activeSlide === 9 && (
            <motion.div
              key="slide9"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
            >
              <span style={{ textTransform: "uppercase", fontSize: 11, fontWeight: 800, color: "#FF69B4", letterSpacing: 2 }}>Wax Seal Envelope</span>
              <h2 className="dudu-script" style={{ fontSize: "2.5rem", color: "#FF69B4", margin: "8px 0" }}>Lock with Love 💌</h2>
              
              <div style={{ background: "#FFE5D9", padding: 24, borderRadius: 24, border: "2px dashed #FF69B4", margin: "20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ position: "relative", width: 160, height: 110, background: "#FFF", borderRadius: 12, border: "1.5px solid #FFB7CE", boxShadow: "0 6px 14px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  
                  {/* Wax Seal Overlay */}
                  {sealed ? (
                    <motion.div
                      initial={{ scale: 3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 120 }}
                      style={{
                        background: "radial-gradient(circle, #C2185B 30%, #E91E63 100%)",
                        width: 50, height: 50, borderRadius: "50%", border: "2.5px solid #C8960A",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                        fontWeight: 900, fontSize: 10, textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                        boxShadow: "0 4px 10px rgba(194,24,91,0.4)"
                      }}
                    >
                      SEALED
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{ fontSize: 32 }}
                    >
                       Stamp ⬇️
                    </motion.div>
                  )}
                </div>

                {!sealed ? (
                  <button
                    onClick={handleSeal}
                    style={{
                      background: "linear-gradient(135deg, #FF69B4, #FFB7CE)", color: "#fff",
                      border: "none", borderRadius: 24, padding: "12px 30px", fontSize: 13,
                      fontWeight: 800, cursor: "pointer", marginTop: 20,
                      boxShadow: "0 6px 16px rgba(255,105,180,0.3)"
                    }}
                  >
                    <ET fid="s9_seal_label" data={d} onChange={oc} editMode={em} />
                  </button>
                ) : (
                  <div style={{ marginTop: 20, color: "#C2185B", fontWeight: 800, fontSize: 14 }}>
                    💖 Sealed Permanently! 💖
                  </div>
                )}
              </div>

              {/* Decorative Bear */}
              <div style={{ margin: "20px 0" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/templates/pastel-dudu-birthday/bear9.gif" alt="Baking Dudu" style={{ width: 100, height: 100, objectFit: "contain", margin: "0 auto" }} />
              </div>

              <p style={{ fontSize: 12, color: "#8E7278", textTransform: "uppercase", letterSpacing: 1 }}>
                <ET fid="s9_footer_sig" data={d} onChange={oc} editMode={em} />
              </p>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
                <button onClick={() => { prevSlide(); setSealed(false); }} style={{ background: "none", border: "2px solid #FFB7CE", color: "#FF69B4", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Back</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Music Settings (Slide 0 in editor) */}
      {em && activeSlide === 0 && (
        <div style={{
          position: "fixed", top: "98px", bottom: 0, left: 0, right: 0, zIndex: 400,
          background: "rgba(255, 253, 240, 0.94)", backdropFilter: "blur(8px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 24, textAlign: "center"
        }}>
          <div style={{
            background: "#fff", border: "4px double #FF69B4", borderRadius: 20,
            padding: "40px 24px", maxWidth: 420, width: "100%", boxShadow: "0 20px 50px rgba(255, 105, 180, 0.2)"
          }}>
            <h3 className="dudu-script" style={{ fontSize: "2rem", color: "#FF69B4", marginBottom: 12 }}>
              Soundtrack Settings
            </h3>
            <p style={{ fontSize: 14, color: "#6E5B60", lineHeight: 1.6, marginBottom: 28 }}>
              Select a sweet, cute chiptune background music track for Dudu Bear's Pastel Dreamland.
            </p>

            <div style={{ background: "rgba(255, 105, 180, 0.04)", border: "1px dashed rgba(255, 105, 180, 0.3)", borderRadius: 12, padding: "14px 18px", marginBottom: 28 }}>
              <p style={{ margin: 0, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#FF69B4", fontWeight: 700 }}>Active Soundtrack</p>
              <p style={{ margin: "6px 0 0", fontSize: 16, fontWeight: 700, color: "#4A2E35" }}>
                {d.bg_song_name || "Default Sweet Chiptunes"}
              </p>
              {d.bg_song_url && (
                <button
                  onClick={() => {
                    oc?.("bg_song_name", "Default Sweet Chiptunes");
                    oc?.("bg_song_url", "");
                  }}
                  style={{
                    marginTop: 10, background: "none", border: "none", color: "#FF69B4",
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
                background: "linear-gradient(135deg, #FF69B4, #FFB7CE)", color: "#fff",
                border: "none", borderRadius: 30, padding: "14px 36px", fontSize: 13,
                fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
                boxShadow: "0 6px 20px rgba(255,105,180,0.3)"
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
