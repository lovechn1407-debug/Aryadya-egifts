"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import ScratchCard from "./ScratchCard";
import SongLibraryPopup from "@/components/SongLibraryPopup";
import ImageUploader from "@/components/ImageCropperUploader";
import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ThreeDScene from "./ThreeDScene";
import PolaroidCard from "./PolaroidCard";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
interface SerenadeProps {
  customData?: Record<string, string>;
  editMode?: boolean;
  onFieldChange?: (id: string, val: string) => void;
  forcedSlide?: number;
  autoPlay?: boolean;
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function d(data: Record<string, string>, key: string, def = "") {
  return data[key] || def;
}

/** Editable text field — click to edit in editor, plain text in view */
export function ET({
  fid, data, onChange, editMode = false, def = "", multiline = false, darkText = false,
}: {
  fid: string; data: Record<string, string>; onChange?: (id: string, v: string) => void;
  multiline?: boolean; editMode?: boolean; def?: string; darkText?: boolean;
}) {
  const value = data[fid] || def;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(data[fid] || def), [data, fid, def]);
  const commit = () => { onChange?.(fid, draft); setEditing(false); };
  if (!editMode) return <span>{value}</span>;
  const s: React.CSSProperties = { display:"block", width:"100%", border:"2px solid #E91E8C", borderRadius:8, padding:"8px 12px", background:"rgba(255,255,255,0.9)", outline:"none", color:"#333", fontFamily:"sans-serif" };
  if (editing) return multiline
    ? <textarea value={draft} rows={3} autoFocus onChange={e => setDraft(e.target.value)} onBlur={commit} style={{...s, resize:"vertical"}} />
    : <input value={draft} autoFocus onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={e => e.key==="Enter" && commit()} style={s} />;
  return (
    <div onClick={e => {e.stopPropagation(); setEditing(true);}} title="Click to edit"
      style={{ position:"relative", cursor:"text", border:"2px dashed rgba(233,30,140,0.6)", borderRadius:8, padding:"8px 12px 22px", background: darkText ? "rgba(255,255,255,0.8)" : "rgba(233,30,140,0.05)", marginBottom:4, display:"inline-block", width:"100%" }}>
      <span style={{ display:"block", color: darkText ? "#333" : "rgba(255,255,255,0.95)" }}>{value || <em style={{opacity:0.4, fontSize:13}}>Click to edit</em>}</span>
      <span style={{ position:"absolute", bottom:3, right:8, fontSize:10, color:"#E91E8C", fontWeight:700 }}>✏️ click to edit</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   FIREWORKS UTILITY
───────────────────────────────────────── */
function runFireworks(canvas: HTMLCanvasElement, durationMs: number): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const COLORS = ["#E91E8C","#F59E0B","#8B5CF6","#06B6D4","#10B981","#EF4444","#FBBF24"];
  type Particle = { x:number; y:number; vx:number; vy:number; alpha:number; color:string };
  type Firework = { x:number; y:number; vx:number; vy:number; color:string; exploded:boolean; particles:Particle[] };
  const fireworks: Firework[] = [];
  let stopped = false;
  let rafId: number;

  const spawnFW = () => {
    fireworks.push({ x: 80 + Math.random() * (canvas.width - 160), y: canvas.height, vx: (Math.random()-0.5)*3, vy: -(12 + Math.random()*8), color: COLORS[Math.floor(Math.random()*COLORS.length)], exploded:false, particles:[] });
  };

  const spawnInterval = setInterval(spawnFW, 600);
  const stopTimer = setTimeout(() => { stopped = true; clearInterval(spawnInterval); }, durationMs);

  const loop = () => {
    ctx.fillStyle = "rgba(15,23,42,0.18)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = fireworks.length - 1; i >= 0; i--) {
      const fw = fireworks[i];
      if (!fw.exploded) {
        fw.x += fw.vx; fw.y += fw.vy; fw.vy += 0.3;
        ctx.beginPath(); ctx.arc(fw.x, fw.y, 3, 0, Math.PI*2);
        ctx.fillStyle = fw.color; ctx.fill();
        if (fw.vy > 0) {
          fw.exploded = true;
          for (let p = 0; p < 100; p++) {
            const ang = Math.random() * Math.PI * 2, spd = 3 + Math.random() * 9;
            fw.particles.push({ x:fw.x, y:fw.y, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd, alpha:1, color:fw.color });
          }
        }
      } else {
        fw.particles = fw.particles.filter(p => p.alpha > 0);
        fw.particles.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.alpha -= 0.012;
          ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
          ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color; ctx.fill(); ctx.globalAlpha = 1;
        });
        if (fw.particles.length === 0) fireworks.splice(i, 1);
      }
    }
    if (!stopped || fireworks.length > 0) rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);
  return () => { stopped = true; clearInterval(spawnInterval); clearTimeout(stopTimer); cancelAnimationFrame(rafId); };
}

/* ─────────────────────────────────────────
   CHAPTER PROGRESS DOT NAV
───────────────────────────────────────── */
function ChapterNav({ total, active, onSelect }: { total:number; active:number; onSelect:(i:number)=>void }) {
  return (
    <div style={{ position:"fixed", right:18, top:"50%", transform:"translateY(-50%)", zIndex:200, display:"flex", flexDirection:"column", gap:10 }}>
      {Array.from({length:total}).map((_,i) => (
        <button key={i} onClick={() => onSelect(i)} aria-label={`Go to chapter ${i+1}`}
          style={{ width:10, height:10, borderRadius:"50%", border:"none", cursor:"pointer", transition:"all 0.3s",
            background: active===i ? "#E91E8C" : "rgba(255,255,255,0.4)",
            boxShadow: active===i ? "0 0 0 3px rgba(233,30,140,0.3)" : "none",
            outline:"none", padding:0 }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN TEMPLATE COMPONENT
───────────────────────────────────────── */
export default function BirthdaySerenade({ customData = {}, editMode = false, onFieldChange, forcedSlide, autoPlay }: SerenadeProps) {
  const [activeChapter, setActiveChapter] = useState(0);
  const [showSongLibrary, setShowSongLibrary] = useState(false);
  const [songLibraryTarget, setSongLibraryTarget] = useState<string>("");

  // Chapter refs for IntersectionObserver
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (editMode && forcedSlide != null) { setActiveChapter(Math.max(0, forcedSlide)); return; }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = Number((e.target as HTMLElement).dataset.chapter);
          if (!isNaN(idx)) setActiveChapter(idx);
        }
      });
    }, { threshold: 0.5 });
    chapterRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, [editMode, forcedSlide]);

  const scrollTo = (idx: number) => {
    document.getElementById(`bs-chapter-${idx}`)?.scrollIntoView({ behavior: "smooth" });
  };

  const openSongLibrary = (target: string) => { setSongLibraryTarget(target); setShowSongLibrary(true); };

  // Background music
  const bgSongUrl = d(customData, "bs_bg_song_url");

  const setRef = (idx: number) => (el: HTMLElement | null) => { chapterRefs.current[idx] = el; };

  return (
    <div style={{ position:"relative", fontFamily:"'Nunito', sans-serif" }}>
      {/* Global CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Nunito:wght@400;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&display=swap');
        .bs-snap { scroll-snap-align: start; min-height: 100vh; overflow: hidden; }
        @keyframes bs-envelope-float { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-10px) rotate(1deg)} }
        @keyframes bs-box-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes bs-sparkle-float { 0%{transform:translateY(0) scale(1);opacity:0.7} 100%{transform:translateY(-80px) scale(0.3);opacity:0} }
        @keyframes bs-shimmer { 0%,100%{opacity:0.7} 50%{opacity:1} }
        @keyframes bs-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes bs-gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes bs-confetti-fall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes bs-heart-orbit { from{transform:rotate(0deg) translateX(50px) rotate(0deg)} to{transform:rotate(360deg) translateX(50px) rotate(-360deg)} }
        @keyframes bs-spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes bs-glow-pulse { 0%,100%{text-shadow:0 0 10px rgba(253,224,71,0.5)} 50%{text-shadow:0 0 30px rgba(253,224,71,0.9)} }
        .bs-envelope-float { animation: bs-envelope-float 3s ease-in-out infinite; }
        .bs-box-float { animation: bs-box-float 2.5s ease-in-out infinite; }
        .bs-shimmer { animation: bs-shimmer 2s ease-in-out infinite; }
        .bs-pulse-btn { animation: bs-pulse 1.5s ease-in-out infinite; }
        .bs-glow-pulse { animation: bs-glow-pulse 2s ease-in-out infinite; }
        .bs-spin-slow { animation: bs-spin-slow 10s linear infinite; }
        .bs-font-script { font-family: 'Dancing Script', cursive; }
        .bs-font-display { font-family: 'Playfair Display', serif; }
        .bs-font-body { font-family: 'Nunito', sans-serif; }
        .bs-lined-paper { background: #FFFBF5 repeating-linear-gradient(transparent, transparent 27px, #E8D5C4 28px); }
        .bs-cta-btn { background: linear-gradient(135deg,#E91E8C,#F59E0B); color:#fff; border:none; border-radius:999px; padding:14px 36px; font-family:'Nunito',sans-serif; font-weight:700; font-size:16px; cursor:pointer; box-shadow:0 12px 32px rgba(233,30,140,0.45); transition:transform 0.2s; }
        .bs-cta-btn:hover { transform:scale(1.05); }
      `}</style>

      {/* Sound Toggle */}
      {bgSongUrl && !editMode && <audio src={bgSongUrl} autoPlay loop style={{display:"none"}} />}

      {/* Chapter Progress */}
      {editMode && <ChapterNav total={9} active={activeChapter} onSelect={scrollTo} />}

      {/* Song Library */}
      {showSongLibrary && (
        <SongLibraryPopup
          onClose={() => setShowSongLibrary(false)}
          onSelect={song => {
            onFieldChange?.(songLibraryTarget + "_url", song.url);
            onFieldChange?.(songLibraryTarget + "_name", song.name);
            setShowSongLibrary(false);
          }}
        />
      )}

      {/* CHAPTER 0 — BG MUSIC */}
      {editMode && (
        <Chapter0
          id="bs-chapter-0" ref={setRef(0)} data={0}
          customData={customData} editMode={editMode} onFieldChange={onFieldChange}
          onNext={() => scrollTo(1)} onSongLibrary={openSongLibrary}
        />
      )}

      {/* CHAPTER 1 — ENVELOPE */}
      <Chapter1
        id="bs-chapter-1" ref={setRef(1)} data={1}
        customData={customData} editMode={editMode} onFieldChange={onFieldChange}
        onNext={() => scrollTo(2)} onSongLibrary={openSongLibrary}
      />

      {/* CHAPTER 2 — CAKE BOX */}
      <Chapter2
        id="bs-chapter-2" ref={setRef(2)} data={2}
        customData={customData} editMode={editMode}
        onNext={() => scrollTo(3)}
      />

      {/* CHAPTER 2.5 — THREE D SCENE */}
      <Chapter2_5
        id="bs-chapter-3" ref={setRef(3)} data={3}
        onNext={() => scrollTo(4)}
      />

      {/* CHAPTER 3 — FIREWORKS */}
      <Chapter3
        id="bs-chapter-4" ref={setRef(4)} data={4}
        customData={customData} editMode={editMode} onFieldChange={onFieldChange}
        onNext={() => scrollTo(5)}
      />

      {/* CHAPTER 4 — ALBUM */}
      <Chapter4
        id="bs-chapter-5" ref={setRef(5)} data={5}
        customData={customData} editMode={editMode} onFieldChange={onFieldChange}
        onNext={() => scrollTo(6)}
      />

      {/* CHAPTER 5 — SCRATCH CARD */}
      <Chapter5
        id="bs-chapter-6" ref={setRef(6)} data={6}
        customData={customData} editMode={editMode} onFieldChange={onFieldChange}
        onNext={() => scrollTo(7)}
      />

      {/* CHAPTER 6 — LETTER / SEAL */}
      <Chapter6
        id="bs-chapter-7" ref={setRef(7)} data={7}
        customData={customData} editMode={editMode} onFieldChange={onFieldChange}
        onNext={() => scrollTo(8)}
      />

      {/* CHAPTER 7 — OUTRO */}
      <Chapter7
        id="bs-chapter-8" ref={setRef(8)} data={8}
        customData={customData} editMode={editMode} onFieldChange={onFieldChange}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   CH0 — BG MUSIC
───────────────────────────────────────── */
const Chapter0 = React.forwardRef<HTMLElement, any>(function Chapter0({ id, customData, editMode, onNext, onSongLibrary }, ref) {
  const songName = d(customData, "bs_bg_song_name");
  return (
    <section id={id} data-chapter="8" ref={ref as any} className="bs-snap"
      style={{ background:"#1A1A2E", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", padding:"40px 20px" }}>
      <div style={{ textAlign: "center", color: "#fff", maxWidth: 400 }}>
        <h2 className="bs-font-display" style={{ fontSize: 32, marginBottom: 16 }}>Set the Mood 🎵</h2>
        <p className="bs-font-body" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 32 }}>Choose a beautiful background song for your gift.</p>
        
        {editMode ? (
          <button onClick={() => onSongLibrary("bs_bg_song")} style={{ padding: "12px 24px", borderRadius: 30, background: "linear-gradient(135deg, #E91E8C, #F59E0B)", border: "none", color: "#fff", fontWeight: "bold", cursor: "pointer", fontSize: 16 }}>
            {songName ? `Selected: ${songName}` : "Choose Background Music"}
          </button>
        ) : (
          <div style={{ padding: "12px 24px", borderRadius: 30, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
            Playing: {songName || "Default Music"}
          </div>
        )}

        <div style={{ marginTop: 40 }}>
          <button className="bs-cta-btn" onClick={onNext}>Continue to Gift →</button>
        </div>
      </div>
    </section>
  );
});

/* ─────────────────────────────────────────
   CH1 — ENVELOPE & LETTER
───────────────────────────────────────── */
import React from "react";

const Chapter1 = React.forwardRef<HTMLElement, any>(function Chapter1({ id, customData, editMode, onFieldChange, onNext, onSongLibrary }, ref) {
  const [opened, setOpened] = useState(false);
  const flapRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [showBgModal, setShowBgModal] = useState(false);

  const handleOpen = () => {
    if (opened) return;
    setOpened(true);
    // Seal crack
    if (sealRef.current) {
      sealRef.current.style.transition = "transform 0.12s";
      sealRef.current.style.transform = "scale(1.2)";
      setTimeout(() => { if (sealRef.current) sealRef.current.style.transform = "scale(0)"; }, 200);
    }
    // Particle burst
    if (particlesRef.current) {
      Array.from(particlesRef.current.children).forEach(p => {
        const el = p as HTMLElement;
        const x = (Math.random()-0.5)*140, y = (Math.random()-0.5)*140;
        el.style.transition = "transform 0.6s, opacity 0.6s";
        el.style.transform = `translate(${x}px, ${y}px) scale(0.3)`;
        el.style.opacity = "0";
      });
    }
    // Flap open
    setTimeout(() => {
      if (flapRef.current) { flapRef.current.style.transform = "rotateX(-160deg)"; flapRef.current.style.transition = "transform 0.6s ease-out"; }
    }, 200);
    // Letter rise
    setTimeout(() => {
      if (letterRef.current) {
        letterRef.current.style.opacity = "1";
        letterRef.current.style.transform = "translate(-50%, -260px)";
        letterRef.current.style.transition = "all 0.8s cubic-bezier(0.22,1,0.36,1)";
      }
    }, 600);
  };

  return (
    <section id={id} data-chapter="0" ref={ref as any} className="bs-snap"
      style={{ background:"radial-gradient(ellipse at 20% 10%, #FFE0EC 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, #FFF3C4 0%, transparent 55%), linear-gradient(180deg, #FFFBF5 0%, #FCE4EC 100%)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", padding:"40px 20px", position:"relative" }}>
      
      

      {/* Decorative background confetti */}
      <div aria-hidden style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        {Array.from({length:20}).map((_,i) => {
          const colors = ["#E91E8C","#F59E0B","#8B5CF6","#06B6D4","#10B981"];
          return (
            <span key={i} style={{
              position:"absolute", left:`${(i*53)%100}%`, top:`${(i*37)%100}%`,
              width:6+(i%4)*3, height:6+(i%4)*3,
              background:colors[i%5], opacity:0.5, borderRadius:i%3===0?"50%":i%3===1?"2px":"0",
              animation:`bs-sparkle-float ${4+(i%5)}s ease-in-out ${(i%7)*0.4}s infinite`
            }} />
          );
        })}
      </div>

      {/* Envelope + Letter */}
      <div style={{ position:"relative", width:"min(320px, 85vw)" }}>
        {/* Letter (pops up from envelope) */}
        <div ref={letterRef} style={{ position:"absolute", left:"50%", top:0, width:"min(440px, 92vw)", zIndex:5, opacity:0, transform:"translate(-50%, 0)", pointerEvents: opened || editMode ? "auto" : "none" }}>
          <div className="bs-lined-paper bs-font-script"
            style={{ borderLeft:"3px solid #E91E8C", borderRadius:12, padding:28, boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }}>
            <h3 style={{ fontSize:28, color:"#C2185B", marginBottom:12 }}>
              Dear <ET fid="bs_recipient" data={customData} onChange={onFieldChange} editMode={editMode} def="Priya" />, ✨
            </h3>
            <p style={{ fontSize:18, lineHeight:1.8, color:"#4A4A68" }}>
              <ET fid="bs_letter_msg" data={customData} onChange={onFieldChange} editMode={editMode} multiline def="Every single day I spend knowing you exist in this world feels like a gift I never deserved. You walk into a room and everything gets a little warmer. Happy Birthday, my love." />
            </p>
            <p style={{ fontSize:22, color:"#E91E8C", marginTop:16 }}>
              With all my love, <ET fid="bs_sender" data={customData} onChange={onFieldChange} editMode={editMode} def="Rohan" /> 💕
            </p>
            {(opened || editMode) && (
              <button className="bs-cta-btn" style={{ marginTop:24 }} onClick={onNext}>Open Your Gift 🎁</button>
            )}
          </div>
        </div>

        {/* Envelope body */}
        <div className={editMode ? "" : "bs-envelope-float"} onClick={handleOpen} role="button" aria-label="Open birthday letter"
          tabIndex={0} onKeyDown={e => (e.key==="Enter"||e.key===" ") && handleOpen()}
          style={{ cursor:opened?"default":"pointer", position:"relative" }}>
          <div style={{ width:"100%", aspectRatio:"5/3", background:"#E91E8C", borderRadius:6, boxShadow:"0 20px 60px rgba(233,30,140,0.35), 0 4px 20px rgba(0,0,0,0.12)", overflow:"visible", position:"relative" }}>
            {/* Bottom triangle */}
            <div style={{ position:"absolute", inset:0, background:"#D81B7E", clipPath:"polygon(0 100%, 100% 100%, 50% 40%)" }} />
            {/* Side flaps */}
            <div style={{ position:"absolute", inset:0, background:"#F06292", clipPath:"polygon(0 0, 50% 50%, 0 100%)", opacity:0.5 }} />
            <div style={{ position:"absolute", inset:0, background:"#F06292", clipPath:"polygon(100% 0, 50% 50%, 100% 100%)", opacity:0.5 }} />
            {/* Top flap */}
            <div ref={flapRef} style={{ position:"absolute", inset:0, background:"#C2185B", clipPath:"polygon(0 0, 100% 0, 50% 60%)", transformOrigin:"top center", transformStyle:"preserve-3d", zIndex:3 }}>
              {/* Wax seal */}
              <div ref={sealRef} style={{ position:"absolute", left:"50%", top:"30%", transform:"translate(-50%, -50%)", width:44, height:44, borderRadius:"50%", background:"radial-gradient(circle at 30% 30%, #FDE68A, #F59E0B 50%, #D97706)", boxShadow:"0 2px 12px rgba(245,158,11,0.7)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:20 }}>♥</div>
              {/* Particles */}
              <div ref={particlesRef} style={{ position:"absolute", left:"50%", top:"30%", transform:"translate(-50%, -50%)", pointerEvents:"none", zIndex:4 }}>
                {Array.from({length:10}).map((_,i) => (
                  <span key={i} style={{ position:"absolute", width:8, height:8, borderRadius:"50%", background:i%2?"#F59E0B":"#FDE68A", opacity:1 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!opened && !editMode && (
        <div style={{ textAlign:"center", marginTop:40 }}>
          <p className="bs-font-script bs-shimmer" style={{ fontSize:20, color:"#C2185B" }}>A special letter awaits you... 💌</p>
          <p className="bs-font-body" style={{ fontSize:14, color:"#9D174D", marginTop:8 }}>👆 tap to open</p>
        </div>
      )}
    </section>
  );
});

/* ─────────────────────────────────────────
   CH2 — CAKE BOX
───────────────────────────────────────── */
const Chapter2 = React.forwardRef<HTMLElement, any>(function Chapter2({ id, customData, editMode, onNext }, ref) {
  const [opened, setOpened] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [fadeBlack, setFadeBlack] = useState(false);
  const lidRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (opened || editMode) return;
    setOpened(true);
    if (lidRef.current) { lidRef.current.style.transition = "transform 0.7s ease-in-out"; lidRef.current.style.transform = "rotateX(-130deg)"; }
    setTimeout(() => setShowVideo(true), 1000);
    setTimeout(() => setFadeBlack(true), 4000);
    setTimeout(() => { setShowVideo(false); setFadeBlack(false); onNext(); }, 4800);
  };

  return (
    <section id={id} data-chapter="1" ref={ref as any} className="bs-snap"
      style={{ background:"linear-gradient(180deg, #FDE68A 0%, #FCE4EC 50%, #FFFBF5 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <div className={editMode ? "" : "bs-box-float"} onClick={handleOpen} role="button" aria-label="Open gift box"
        tabIndex={0} onKeyDown={e => (e.key==="Enter"||e.key===" ") && handleOpen()}
        style={{ cursor:opened?"default":"pointer", position:"relative", perspective:800 }}>
        {/* Box body */}
        <div style={{ width:"min(260px, 70vw)", aspectRatio:"1", borderRadius:8, background:"linear-gradient(135deg, #F472B6, #FB923C, #FCA5A5)", boxShadow:"0 30px 80px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)", position:"relative" }}>
          <div style={{ position:"absolute", top:0, bottom:0, left:"50%", width:14, transform:"translateX(-50%)", background:"#F59E0B" }} />
          <div style={{ position:"absolute", left:0, right:0, top:"50%", height:14, transform:"translateY(-50%)", background:"#F59E0B" }} />
        </div>
        {/* Lid */}
        <div ref={lidRef} style={{ position:"absolute", left:"50%", top:-28, transform:"translateX(-50%)", width:"calc(min(260px, 70vw) + 24px)", height:56, background:"linear-gradient(135deg, #FB923C, #F472B6)", borderRadius:8, transformOrigin:"top center", boxShadow:"0 8px 24px rgba(0,0,0,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {/* Bow */}
          <div style={{ position:"relative", width:80, height:36 }}>
            <div style={{ position:"absolute", left:0, top:0, width:36, height:36, borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%", background:"#F59E0B", transform:"rotate(-25deg)" }} />
            <div style={{ position:"absolute", right:0, top:0, width:36, height:36, borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%", background:"#F59E0B", transform:"rotate(25deg)" }} />
            <div style={{ position:"absolute", left:"50%", top:"50%", width:14, height:14, borderRadius:"50%", background:"#D97706", transform:"translate(-50%,-50%)" }} />
          </div>
        </div>
      </div>
      <p className="bs-font-body bs-shimmer" style={{ marginTop:40, fontSize:18, color:"#C2185B", fontWeight:700, textAlign:"center" }}>✨ Tap the box to reveal your surprise ✨</p>

      {showVideo && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"#000", opacity: fadeBlack ? 1 : undefined, transition: fadeBlack ? "opacity 0.8s" : undefined }}>
          <video autoPlay muted playsInline src={d(customData, "bs_box_video_url", "https://www.w3schools.com/html/mov_bbb.mp4")} style={{ width:"100%", height:"100%", objectFit:"cover", opacity: fadeBlack ? 0 : 1, transition:"opacity 0.4s" }} />
        </div>
      )}
      {fadeBlack && <div style={{ position:"fixed", inset:0, zIndex:600, background:"#000", pointerEvents:"none" }} />}
    </section>
  );
});

/* ─────────────────────────────────────────
   CH2.5 — 3D CAKE SCENE
───────────────────────────────────────── */
const Chapter2_5 = React.forwardRef<HTMLElement, any>(function Chapter2_5({ id, onNext }, ref) {
  const [fade, setFade] = useState(false);
  const triggerNext = () => {
    setFade(true);
    setTimeout(() => { onNext(); setTimeout(() => setFade(false), 600); }, 900);
  };
  return (
    <section id={id} data-chapter="3" ref={ref as any} className="bs-snap" style={{ background: "#0F172A", position:"relative", overflow:"hidden" }}>
      <Suspense fallback={<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>Loading...</div>}>
        <ThreeDScene onCut={triggerNext} />
      </Suspense>
      <AnimatePresence>
        {fade && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} style={{ position: "fixed", inset: 0, zIndex: 600, background: "black", pointerEvents: "none" }} />}
      </AnimatePresence>
    </section>
  );
});

/* ─────────────────────────────────────────
   CH3 — FIREWORKS + FADING MESSAGES
───────────────────────────────────────── */
const Chapter3 = React.forwardRef<HTMLElement, any>(function Chapter3({ id, customData, editMode, onFieldChange, onNext }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(true);

  const recipientName = d(customData, "bs_recipient", "You");
  const messages = [
    { text:`🎂 Happy Birthday, ${recipientName}! 🎂`, ms:2500, big:true },
    { text:"This day belongs to you 🌟", ms:2000, color:"#FDE68A" },
    { text: d(customData, "bs_wish1", "May every dream you've whispered to the stars finally come true 🌟"), ms:2200, color:"#FCE4EC" },
    { text: d(customData, "bs_wish2", "May joy follow you like a loyal friend wherever you go 💛"), ms:2200, color:"#FCE4EC" },
    { text: d(customData, "bs_wish3", "May this chapter of your life be your most magical yet ✨"), ms:2200, color:"#FCE4EC" },
    { text:`You are so loved, ${recipientName}. Always. 💕`, ms:2500, big:true, italic:true },
  ];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => { entries.forEach(e => { if(e.isIntersecting && e.intersectionRatio > 0.4) setActive(true); }); }, { threshold:[0,0.4,0.8] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active || editMode) return;
    const c = canvasRef.current;
    if (!c) return;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const stop = runFireworks(c, 26000);
    return () => { window.removeEventListener("resize", resize); stop(); };
  }, [active, editMode]);

  useEffect(() => {
    if (!active || editMode) return;
    if (msgIdx >= messages.length) { setDone(true); setTimeout(() => onNext(), 2500); return; }
    const t = setTimeout(() => { setVisible(false); setTimeout(() => { setMsgIdx(i => i+1); setVisible(true); }, 500); }, messages[msgIdx].ms);
    return () => clearTimeout(t);
  }, [msgIdx, active, editMode]);

  const m = messages[Math.min(msgIdx, messages.length-1)];

  return (
    <section id={id} data-chapter="3" ref={(el) => { (ref as any)(el); (sectionRef as any).current = el; }} className="bs-snap"
      style={{ background:"radial-gradient(ellipse at top, #1e1b4b 0%, #0F172A 70%)", position:"relative" }}>
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:1 }} />
      
      {/* Edit: wish fields */}
      {editMode && (
        <div style={{ position:"absolute", top:20, left:20, zIndex:50, display:"flex", flexDirection:"column", gap:8, maxWidth:300 }}>
          {["bs_wish1","bs_wish2","bs_wish3"].map((fid,i) => (
            <div key={fid}>
              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:11, marginBottom:2 }}>Wish {i+1}</div>
              <ET fid={fid} data={customData} onChange={onFieldChange} editMode={editMode} def={messages[2+i].text} />
            </div>
          ))}
        </div>
      )}

      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:10, pointerEvents:"none" }}>
        <h2 className={m.big ? "bs-font-display" : "bs-font-script"}
          style={{ color: m.color||"#fff", fontSize: m.big ? "clamp(32px,6vw,64px)" : 26,
            fontWeight: m.big ? 900 : 700, textAlign:"center", maxWidth:900, lineHeight:1.3, padding:"0 24px",
            textShadow: m.big ? "0 0 40px rgba(233,30,140,0.8)" : "0 0 20px rgba(255,255,255,0.2)",
            fontStyle: (m as any).italic ? "italic" : undefined,
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(-20px) scale(1.02)",
            transition:"opacity 0.5s ease, transform 0.5s ease"
          }}>
          {m.text}
        </h2>
      </div>

      {done && (
        <button className="bs-cta-btn" onClick={onNext} style={{ position:"absolute", bottom:64, left:"50%", transform:"translateX(-50%)", zIndex:20 }}>
          📸 See our Memories
        </button>
      )}
    </section>
  );
});

/* ─────────────────────────────────────────
   CH4 — PHOTO ALBUM (MASONRY)
───────────────────────────────────────── */
const Chapter4 = React.forwardRef<HTMLElement, any>(function Chapter4({ id, customData, editMode, onFieldChange, onNext }, ref) {
  const photos = [
    { imgFid:"bs_p_img1", capFid:"bs_p_cap1", def_img:"https://picsum.photos/seed/bday1/400/500", def_cap:"Our first adventure together 🌊" },
    { imgFid:"bs_p_img2", capFid:"bs_p_cap2", def_img:"https://picsum.photos/seed/bday2/400/600", def_cap:"The day we laughed till we cried 😂" },
    { imgFid:"bs_p_img3", capFid:"bs_p_cap3", def_img:"https://picsum.photos/seed/bday3/400/500", def_cap:"This moment is everything 💕" },
  ];

  return (
    <section id={id} data-chapter="4" ref={ref as any} className="bs-snap"
      style={{ background:"linear-gradient(180deg, #FFFBF5 0%, rgba(253,230,138,0.13) 100%)", padding:"60px 20px" }}>
      <div style={{ textAlign:"center", maxWidth:700, margin:"0 auto" }}>
        <div className="bs-spin-slow" style={{ display:"inline-block", fontSize:48 }}>📷</div>
        <h2 className="bs-font-display" style={{ fontSize:"clamp(28px,5vw,48px)", fontWeight:700, color:"#1A1A2E", marginTop:12 }}>
          📸 Our Precious Moments
        </h2>
        <p className="bs-font-body" style={{ fontSize:16, color:"#64748B", marginTop:8 }}>
          A collection of memories from <ET fid="bs_sender" data={customData} onChange={onFieldChange} editMode={editMode} def="Rohan" />, made for <ET fid="bs_recipient" data={customData} onChange={onFieldChange} editMode={editMode} def="Priya" />
        </p>
        <div style={{ height:2, width:200, background:"linear-gradient(90deg, transparent, #E91E8C, #F59E0B, transparent)", margin:"16px auto 0" }} />
      </div>

      <div style={{ marginTop:48, maxWidth:1152, margin:"48px auto 0" }}>
        {/* Desktop masonry */}
        <div className="hidden md:block" style={{ columnCount: 3, columnGap: 24 }}>
          {photos.map((p, i) => (
            <PolaroidCard key={i} index={i} src={d(customData, p.imgFid, p.def_img)} caption={d(customData, p.capFid, p.def_cap)} captionId={p.capFid} imageId={p.imgFid} editMode={editMode} onFieldChange={onFieldChange} />
          ))}
        </div>
        {/* Mobile horizontal scroll */}
        <div className="md:hidden flex gap-5 px-1 pb-4" style={{ overflowX: "auto", scrollSnapType: "x mandatory", display:"flex" }}>
          {photos.map((p, i) => (
            <div key={i} style={{ scrollSnapAlign: "start", flexShrink: 0 }}>
              <PolaroidCard index={i} src={d(customData, p.imgFid, p.def_img)} caption={d(customData, p.capFid, p.def_cap)} captionId={p.capFid} imageId={p.imgFid} editMode={editMode} onFieldChange={onFieldChange} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"center", marginTop:40 }}>
        <button className="bs-cta-btn" onClick={onNext}>🎁 Tap to reveal your gift!</button>
      </div>
    </section>
  );
});

/* ─────────────────────────────────────────
   CH5 — SCRATCH CARD GIFT
───────────────────────────────────────── */
const Chapter5 = React.forwardRef<HTMLElement, any>(function Chapter5({ id, customData, editMode, onFieldChange, onNext }, ref) {
  const [revealed, setRevealed] = useState(false);
  const [toast, setToast] = useState(false);

  const giftCode = d(customData, "bs_gift_code", "BDAY2025LOVE");
  const giftBrand = d(customData, "bs_gift_brand", "Myntra");
  const giftWorth = d(customData, "bs_gift_worth", "500");
  const giftValid = d(customData, "bs_gift_valid", "31 Dec 2025");
  const recipientName = d(customData, "bs_recipient", "You");

  const sparkles = useMemo(() => Array.from({length:30}).map(() => ({
    top:Math.random()*100, left:Math.random()*100, size:3+Math.random()*4,
    color:Math.random()>0.5?"#F59E0B":"#E91E8C", delay:Math.random()*8, duration:4+Math.random()*6
  })), []);

  const copy = async () => {
    try { await navigator.clipboard.writeText(giftCode); } catch {}
    setToast(true); setTimeout(() => setToast(false), 2500);
  };

  return (
    <section id={id} data-chapter="7" ref={ref as any} className="bs-snap"
      style={{ background:"linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 20px", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        {sparkles.map((s,i) => (
          <span key={i} style={{ position:"absolute", top:`${s.top}%`, left:`${s.left}%`, width:s.size, height:s.size, borderRadius:"50%", background:s.color, opacity:0.7, animation:`bs-sparkle-float ${s.duration}s ease-in infinite`, animationDelay:`${s.delay}s` }} />
        ))}
      </div>

      <div style={{ position:"relative", zIndex:10, textAlign:"center", maxWidth:440, width:"100%" }}>
        <div className="bs-pulse-btn" style={{ fontSize:56 }}>🎁</div>
        <h2 className="bs-font-display" style={{ color:"#fff", fontWeight:700, fontSize:"clamp(24px,4vw,42px)", marginTop:12 }}>
          A Special Gift For You, {recipientName}!
        </h2>
        <p className="bs-font-body" style={{ color:"#94A3B8", fontSize:16, marginTop:8 }}>
          Scratch the card below to reveal your {giftBrand} gift code
        </p>

        {/* Gift card edit fields */}
        {editMode && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12, marginBottom:12 }}>
            {[["bs_gift_brand","Brand","Myntra"],["bs_gift_code","Code","BDAY2025LOVE"],["bs_gift_worth","Worth (₹)","500"],["bs_gift_valid","Valid Till","31 Dec 2025"]].map(([fid,label,def]) => (
              <div key={fid} style={{ textAlign:"left" }}>
                <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11, marginBottom:2 }}>{label}</div>
                <ET fid={fid} data={customData} onChange={onFieldChange} editMode={editMode} def={def} />
              </div>
            ))}
          </div>
        )}

        {/* Scratch card */}
        <div style={{ marginTop:32, maxWidth:360, width:"100%", margin:"32px auto 0", background:"linear-gradient(135deg, #F59E0B, #FDE68A, #F59E0B)", borderRadius:20, padding:6, boxShadow:"0 20px 60px rgba(245,158,11,0.45), 0 4px 20px rgba(0,0,0,0.3)" }}>
          <div style={{ position:"relative", borderRadius:16, overflow:"hidden", height:200, background:"linear-gradient(135deg, #FF3F6C 0%, #FF6B9D 100%)" }}>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, zIndex:1, color:"white", textAlign:"center" }}>
              <div style={{ fontWeight:800, fontSize:26, letterSpacing:2 }}>{giftBrand}</div>
              <div style={{ fontSize:13, fontWeight:600 }}>🎀 Your Gift Code</div>
              <div className={revealed ? "bs-glow-pulse" : ""} style={{ fontFamily:"'Courier New', monospace", fontSize:22, fontWeight:900, background:"rgba(255,255,255,0.2)", padding:"8px 20px", borderRadius:8, letterSpacing:4 }}>{giftCode}</div>
              <div style={{ color:"#FDE68A", fontWeight:800, fontSize:18 }}>Worth ₹{giftWorth}</div>
              <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>Valid till {giftValid}</div>
            </div>
            {!editMode && <ScratchCard onRevealed={() => setRevealed(true)} />}
          </div>
        </div>

        {revealed && (
          <div style={{ marginTop:24, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
            <button onClick={copy} className="bs-font-body" style={{ background:"linear-gradient(135deg, #FDE68A, #F59E0B)", color:"#1A1A2E", border:"none", borderRadius:999, padding:"12px 28px", fontWeight:700, fontSize:15, cursor:"pointer", boxShadow:"0 8px 24px rgba(245,158,11,0.5)" }}>📋 Copy Code</button>
            <a href={`https://www.${giftBrand.toLowerCase()}.com`} target="_blank" rel="noopener noreferrer" style={{ color:"#FDE68A", fontSize:14, fontWeight:600, textDecoration:"underline" }}>🛍️ Open {giftBrand} App</a>
            <p className="bs-font-body" style={{ fontSize:14, color:"#94A3B8", maxWidth:320 }}>💡 Real gift code, redeemable on {giftBrand}. Tap above to copy!</p>
            <button className="bs-cta-btn" style={{ marginTop:8 }} onClick={onNext}>See the final surprise 💌</button>
          </div>
        )}
      </div>

      {toast && (
        <div style={{ position:"fixed", bottom:40, left:"50%", transform:"translateX(-50%)", zIndex:300, background:"#10B981", color:"white", padding:"12px 22px", borderRadius:12, fontWeight:700, boxShadow:"0 12px 32px rgba(16,185,129,0.45)" }}>
          ✅ Code Copied! 🎉
        </div>
      )}
    </section>
  );
});

/* ─────────────────────────────────────────
   CH6 — BIRTHDAY LETTER + SEAL STAMP
───────────────────────────────────────── */
const Chapter6 = React.forwardRef<HTMLElement, any>(function Chapter6({ id, customData, editMode, onFieldChange, onNext }, ref) {
  const [sealed, setSealed] = useState(false);
  const [animDone, setAnimDone] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const currentDate = new Date().toLocaleDateString("en-US", { day:"numeric", month:"short", year:"numeric" });

  const handleSeal = () => {
    if (sealed || editMode) return;
    setSealed(true);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 700);
    setTimeout(() => setAnimDone(true), 1000);
  };

  return (
    <section id={id} data-chapter="7" ref={ref as any} className="bs-snap"
      style={{ background:"linear-gradient(180deg, #0F172A 0%, #1a0a2e 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px", position:"relative", overflow:"hidden" }}>
      <style>{`
        @keyframes seal-slam { 0%{transform:scale(3.5) rotate(-45deg);opacity:0;filter:blur(6px)} 70%{transform:scale(0.9) rotate(5deg);opacity:1;filter:none} 85%{transform:scale(1.15) rotate(-3deg)} 100%{transform:scale(1) rotate(-5deg)} }
        .seal-pressing { animation: seal-slam 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes camera-flash { 0%{opacity:0} 15%{opacity:1} 100%{opacity:0} }
        .camera-flash { position:fixed;inset:0;background:#fff;z-index:99999;pointer-events:none; animation:camera-flash 0.7s cubic-bezier(0.1,0.8,0.3,1) forwards; }
      `}</style>

      {showFlash && <div className="camera-flash" />}

      <div style={{ background:"rgba(255,255,255,0.06)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, padding:"40px 36px", maxWidth:480, width:"100%", position:"relative" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:32 }}>
          <span>A Letter</span><span>{currentDate}</span>
        </div>
        <h1 className="bs-font-display" style={{ color:"#FCE4EC", fontSize:"clamp(28px,4vw,40px)", fontWeight:700, marginBottom:16, lineHeight:1.2 }}>
          <ET fid="bs_l_greeting" data={customData} onChange={onFieldChange} editMode={editMode} darkText={false} def="Happy Birthday, my favorite person." />
        </h1>
        <div style={{ height:1, background:"rgba(233,30,140,0.2)", margin:"20px 0" }} />
        <p className="bs-font-body" style={{ fontSize:17, lineHeight:1.8, color:"rgba(255,255,255,0.85)", marginBottom:16 }}>
          <ET fid="bs_l_msg" data={customData} onChange={onFieldChange} editMode={editMode} multiline def="Thanks for coming into my life and making it better with your presence." />
        </p>
        <p className="bs-font-body" style={{ fontSize:17, lineHeight:1.8, color:"rgba(255,255,255,0.85)", marginBottom:24 }}>
          <ET fid="bs_l_closing" data={customData} onChange={onFieldChange} editMode={editMode} multiline def="Here's to your laughter, your light, and every wish I'm quietly making for you tonight." />
        </p>
        <p className="bs-font-script" style={{ fontSize:26, color:"#E91E8C" }}>
          <ET fid="bs_l_signoff" data={customData} onChange={onFieldChange} editMode={editMode} def="— with all my heart ❤" />
        </p>

        {/* Seal overlay */}
        {sealed && (
          <div style={{ position:"absolute", inset:0, background:"rgba(255,245,248,0.95)", borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center", zIndex:20 }}>
            <div className={animDone ? "" : "seal-pressing"} style={{ transform:"rotate(-5deg)", filter:"drop-shadow(0 8px 24px rgba(183,28,28,0.4))" }}>
              <svg width="180" height="180" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#C2185B" strokeWidth="6" strokeDasharray="8 6" />
                <circle cx="100" cy="100" r="72" fill="rgba(233,30,140,0.95)" />
                <text x="100" y="88" textAnchor="middle" fill="white" fontSize="32">💌</text>
                <text x="100" y="115" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" letterSpacing="1">SEALED WITH</text>
                <text x="100" y="132" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" letterSpacing="1">LOVE</text>
              </svg>
            </div>
          </div>
        )}
      </div>

      <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)", display:"flex", gap:12 }}>
        {!sealed && !editMode && (
          <button onClick={handleSeal} style={{ background:"linear-gradient(135deg, #C2185B, #E91E8C)", color:"white", border:"none", borderRadius:999, padding:"12px 28px", fontWeight:700, fontSize:15, cursor:"pointer", boxShadow:"0 8px 24px rgba(194,24,91,0.5)" }}>
            💌 Seal with Love
          </button>
        )}
        <button className="bs-cta-btn" onClick={onNext}>Continue 🎊</button>
      </div>
    </section>
  );
});

/* ─────────────────────────────────────────
   CH7 — OUTRO
───────────────────────────────────────── */
const Chapter7 = React.forwardRef<HTMLElement, any>(function Chapter7({ id, customData, editMode, onFieldChange }, ref) {
  const recipientName = d(customData, "bs_recipient", "You");
  const senderName = d(customData, "bs_sender", "Your Special Someone");

  const confetti = useMemo(() => Array.from({length:50}).map(() => ({
    left:Math.random()*100, delay:Math.random()*8, duration:4+Math.random()*6,
    color:["#E91E8C","#F59E0B","#FDE68A","#8B5CF6","#06B6D4","#FCE4EC"][Math.floor(Math.random()*6)],
    size:6+Math.random()*6, round:Math.random()>0.5
  })), []);

  return (
    <section id={id} data-chapter="7" ref={ref as any} className="bs-snap"
      style={{ background:"linear-gradient(135deg, #E91E8C, #7C3AED, #0F172A, #C2185B)", backgroundSize:"400% 400%", animation:"bs-gradient-shift 8s ease infinite", position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>

      {/* Confetti rain */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {confetti.map((c,i) => (
          <span key={i} style={{ position:"absolute", top:-20, left:`${c.left}%`, width:c.size, height:c.size, background:c.color, borderRadius:c.round?"50%":2, animation:`bs-confetti-fall ${c.duration}s linear infinite`, animationDelay:`${c.delay}s` }} />
        ))}
      </div>

      <div style={{ position:"relative", zIndex:10, textAlign:"center", maxWidth:520 }}>
        {/* Pulsing heart */}
        <div style={{ position:"relative", width:160, height:160, margin:"0 auto" }}>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", animation:"bs-pulse 1.8s ease-in-out infinite" }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="#E91E8C"><path d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 8-2.83A4.5 4.5 0 0 1 19 11c0 5.65-7 10-7 10z" /></svg>
          </div>
          {[0,1,2,3,4,5].map(i => (
            <span key={i} style={{ position:"absolute", left:"50%", top:"50%", fontSize:16, animation:`bs-heart-orbit ${6+i}s linear infinite`, animationDelay:`${i*-0.8}s`, color:["#FCE4EC","#FDE68A","#E91E8C"][i%3] }}>♥</span>
          ))}
        </div>

        {/* Frosted glass card */}
        <div style={{ background:"rgba(255,255,255,0.08)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:24, padding:"36px 28px", boxShadow:"0 32px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)", marginTop:8 }}>
          <div className="bs-spin-slow" style={{ display:"inline-block", fontSize:48 }}>🎂</div>
          <h1 className="bs-font-display" style={{ fontWeight:900, fontStyle:"italic", fontSize:"clamp(26px,5vw,44px)", color:"#fff", textShadow:"0 0 30px rgba(233,30,140,0.5)", marginTop:12 }}>
            Happy Birthday, {recipientName}! 🌟
          </h1>
          <p className="bs-font-script" style={{ color:"#FDE68A", fontSize:22, fontWeight:700, marginTop:6 }}>
            From {senderName}, with all my heart 💕
          </p>
          <div style={{ height:2, width:160, background:"linear-gradient(90deg, transparent, #E91E8C, transparent)", margin:"16px auto" }} />
          <p className="bs-font-body" style={{ fontSize:16, lineHeight:1.8, color:"rgba(255,255,255,0.88)", maxWidth:380, margin:"0 auto" }}>
            <ET fid="bs_final_msg" data={customData} onChange={onFieldChange} editMode={editMode} multiline def="You make the world a more beautiful place just by being in it. Thank you for being you. Here's to you — the most incredible person I know. Happy Birthday, always and forever." />
          </p>
          <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:20, flexWrap:"wrap" }}>
            {["🎉","🎈","🎁","🎂","💕","✨","🌟","🥂"].map((e,i) => (
              <span key={i} style={{ fontSize:28 }}>{e}</span>
            ))}
          </div>
        </div>

        <div style={{ marginTop:24 }}>
          <span className="bs-font-body" style={{ color:"rgba(255,255,255,0.65)", fontSize:14, fontStyle:"italic", border:"2px dashed rgba(255,255,255,0.2)", borderRadius:20, padding:"8px 20px", display:"inline-block" }}>
            Made with ❤️ just for {recipientName}
          </span>
        </div>
        <button onClick={() => window.scrollTo({top:0, behavior:"smooth"})} style={{ marginTop:20, background:"transparent", border:"1px solid rgba(255,255,255,0.35)", color:"white", borderRadius:999, padding:"12px 28px", fontFamily:"'Nunito',sans-serif", fontWeight:600, cursor:"pointer", fontSize:14 }}>
          🔁 Replay from the beginning
        </button>
      </div>
    </section>
  );
});
