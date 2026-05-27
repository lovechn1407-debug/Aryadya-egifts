"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Balloon, generateBalloons } from "./Balloon";
import { Cake } from "./Cake";
import { Confetti, Popper } from "./Confetti";
import { Sparkles, Play, Pause, Share2, RotateCcw, Stamp, ChevronUp } from "lucide-react";
import SongLibraryPopup from "@/components/SongLibraryPopup";

type Stage = "intro" | "balloons" | "cake" | "memories" | "envelope" | "letter";

interface BlissProps {
  customData?: Record<string, string>;
  editMode?: boolean;
  onFieldChange?: (id: string, val: string) => void;
  forcedSlide?: number;
  autoPlay?: boolean;
}

export default function BirthdayBliss({ customData = {}, editMode = false, onFieldChange, forcedSlide, autoPlay }: BlissProps) {
  const d = customData;
  // Map forcedSlide to stage
  const stageFromSlide = (n?: number): Stage => {
    if (n === 0) return "intro";
    if (n === 1) return "balloons";
    if (n === 2) return "cake";
    if (n === 3) return "memories";
    if (n === 4) return "envelope";
    if (n === 5) return "letter";
    return "intro";
  };
  const [stage, setStage] = useState<Stage>(forcedSlide != null ? stageFromSlide(forcedSlide) : "intro");
  useEffect(() => { if (forcedSlide != null) setStage(stageFromSlide(forcedSlide)); }, [forcedSlide]);

  // Auto-play preview cycling every 1.5s
  useEffect(() => {
    if (!autoPlay || editMode) return;
    const stages: Stage[] = ["intro", "balloons", "cake", "memories", "envelope", "letter"];
    const timer = setInterval(() => {
      setStage(current => {
        const idx = stages.indexOf(current);
        return stages[(idx + 1) % stages.length];
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [autoPlay, editMode]);
  const reset = () => setStage("intro");
  const go = (s: Stage) => { if (!editMode) setStage(s); };

  const [bgModalOpen, setBgModalOpen] = useState(false);

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
        customData.p_img1, customData.p_img2, customData.p_img3
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

  return (
    <div className="relative min-h-screen overflow-hidden">
      {preloading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "#06060A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3.5px solid rgba(255,45,135,0.15)", borderTopColor: "#ff2d87", animation: "tmpl-spin 0.9s cubic-bezier(0.16, 1, 0.3, 1) infinite", marginBottom: 20 }} />
          <h2 style={{ fontWeight: 800, color: "#FFF8F0", fontSize: 18, letterSpacing: -0.3, animation: "tmpl-pulse 2s infinite", marginBottom: 16 }}>Opening Your Surprise</h2>
          
          <div style={{ width: 240, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", background: "#ff2d87", width: `${preloadProgress}%`, transition: "width 0.3s ease" }} />
          </div>
          <p style={{ color: "#F2C4CE", fontSize: 13 }}>{preloadText}</p>
          
          <style>{`
            @keyframes tmpl-spin { 100% { transform: rotate(360deg); } }
            @keyframes tmpl-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
          `}</style>
        </div>
      )}
      {autoPlay && (
        <div style={{ display: "none" }}>
          <img src={d.p_img1 || "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=600"} alt="preload" />
          <img src={d.p_img2 || "https://images.unsplash.com/photo-1518199266791-5375a83164ba?auto=format&fit=crop&w=600"} alt="preload" />
          <img src={d.p_img3 || "https://images.unsplash.com/photo-1478147424044-16b7eb0a006c?auto=format&fit=crop&w=600"} alt="preload" />
        </div>
      )}
      {d.bg_song_url && !editMode && <audio id="bliss-bg-audio" src={d.bg_song_url} autoPlay loop />}
      
      {stage === "intro" && <IntroSlide onDone={() => go("balloons")} d={d} editMode={editMode} onFieldChange={onFieldChange} />}
      {stage === "balloons" && <BalloonsSlide onContinue={() => go("cake")} d={d} editMode={editMode} onFieldChange={onFieldChange} />}
      {stage === "cake" && <CakeSlide onComplete={() => go("memories")} d={d} editMode={editMode} onFieldChange={onFieldChange} />}
      {stage === "memories" && <MemoriesSlide onContinue={() => go("envelope")} d={d} editMode={editMode} onFieldChange={onFieldChange} />}
      {stage === "envelope" && <EnvelopeSlide onOpen={() => go("letter")} editMode={editMode} />}
      {stage === "letter" && <LetterSlide onReset={reset} d={d} editMode={editMode} onFieldChange={onFieldChange} />}

      {editMode && forcedSlide === -1 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <button
            onClick={() => setBgModalOpen(true)}
            className="bliss-btn-pill bliss-btn-pill-pink px-8 py-4 text-lg shadow-2xl"
          >
            🎵 Choose Background Music
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

// ── Editor Sub-Header ──
function SubHeader({ tabs, activeKey, onSelect }: { tabs: {key:string|number, label:string}[], activeKey: string|number, onSelect: (k:any)=>void }) {
  return (
    <div style={{ display: "flex", gap: 6, padding: "16px", overflowX: "auto", position: "relative", zIndex: 50, width: "100%", justifyContent: "center", marginBottom: "2rem" }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onSelect(tab.key)}
          style={{
            padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            border: "1px solid",
            borderColor: activeKey === tab.key ? "rgba(155,89,252,0.8)" : "rgba(255,255,255,0.1)",
            background: activeKey === tab.key ? "rgba(155,89,252,0.25)" : "rgba(255,255,255,0.04)",
            color: activeKey === tab.key ? "#C4A3FF" : "rgba(255,255,255,0.5)",
            cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Editable Text ──
function ET({ fid, d, onChange, multiline = false, editMode = false, def = "", darkText = false }: {
  fid: string; d: Record<string, string>; onChange?: (id: string, v: string) => void;
  multiline?: boolean; editMode?: boolean; def?: string; darkText?: boolean;
}) {
  const value = d[fid] || def;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(d[fid] || def), [d, fid, def]);
  const commit = () => { onChange?.(fid, draft); setEditing(false); };
  if (!editMode) return <span>{value}</span>;
  if (editing) {
    const s: React.CSSProperties = { display:"block",width:"100%",border:"2px solid #ff2d87",borderRadius:8,padding:"8px 12px",background:"rgba(255,255,255,0.9)",outline:"none",color:"#333",fontFamily:"sans-serif" };
    return multiline ? <textarea value={draft} rows={3} autoFocus onChange={e=>setDraft(e.target.value)} onBlur={commit} style={{...s,resize:"vertical"}} /> : <input value={draft} autoFocus onChange={e=>setDraft(e.target.value)} onBlur={commit} onKeyDown={e=>e.key==="Enter"&&commit()} style={s} />;
  }
  return (
    <div onClick={e=>{e.stopPropagation();setEditing(true);}} title="Click to edit" style={{position:"relative",cursor:"text",border:"2px dashed rgba(255,45,135,0.6)",borderRadius:8,padding:"8px 12px 22px",background: darkText ? "rgba(255,255,255,0.8)" : "rgba(255,45,135,0.05)",marginBottom:4,display:"inline-block",width:"100%"}}>
      <span style={{display:"block", color: darkText ? "#333" : "rgba(255,255,255,0.95)", WebkitTextFillColor: darkText ? "#333" : "rgba(255,255,255,0.95)"}}>{value||<em style={{opacity:0.4,fontSize:13}}>Click to edit</em>}</span>
      <span style={{position:"absolute",bottom:3,right:8,fontSize:10,color:"#ff2d87",fontWeight:700, WebkitTextFillColor: "#ff2d87"}}>✏️ click to edit</span>
    </div>
  );
}

// ── Image Uploader (imgbb) ──
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

  if (!onChange) return null;

  return (
    <div style={{ padding: "8px 12px", background: "rgba(255,45,135,0.04)", borderTop: "1px dashed rgba(255,45,135,0.3)" }}>
      {preview && (
        <div style={{ marginBottom: 6, textAlign: "center" }}>
          <img src={preview} alt="Preview" style={{ maxHeight: 80, borderRadius: 8, border: "2px solid #ff2d87" }} />
        </div>
      )}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
          background: "#ff2d87", color: "#fff", border: "none", borderRadius: 8,
          padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer",
          opacity: uploading ? 0.6 : 1,
        }}>{uploading ? "Uploading…" : "📷 Change Image"}</button>
        {currentSrc && (
          <button onClick={useDefault} style={{
            background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb",
            borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>↩ Use Default</button>
        )}
      </div>
    </div>
  );
}

/* ============ INTRO ============ */
function IntroSlide({ onDone, d, editMode, onFieldChange }: { onDone: () => void; d: Record<string,string>; editMode: boolean; onFieldChange?: (id:string,v:string)=>void }) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [confirmed, setConfirmed] = useState(false);
  const msgs = [
    { textFid: "s0_recipient", subFid: "s0_sub", icon: "✦", defText: "Madam Ji", defSub: "it's your day to shine.", isName: true },
    { textFid: "s0_p1", subFid: "s0_p1_sub", icon: "✦", defText: "I've set up something", defSub: "a little special — just for you.", isName: false },
    { textFid: "s0_p2", subFid: "s0_p2_sub", icon: "✦", defText: "Your light", defSub: "is pretty much your magic.", isName: false },
  ];

  useEffect(() => {
    if (editMode || confirmed || step >= msgs.length) return;
    const inTimer = setTimeout(() => setPhase("out"), 2600);
    const outTimer = setTimeout(() => {
      if (step < msgs.length - 1) { setStep(s => s + 1); setPhase("in"); }
      else { setConfirmed(true); }
    }, 3200);
    return () => { clearTimeout(inTimer); clearTimeout(outTimer); };
  }, [step, editMode, confirmed]);

  const msg = msgs[Math.min(step, msgs.length - 1)];

  const activeStepKey = confirmed ? "ready" : step;

  return (
    <section className="min-h-screen bliss-gradient-bg flex flex-col items-center justify-start p-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full animate-bliss-shimmer" style={{ background: "radial-gradient(circle, #ff2d8755, transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full animate-bliss-shimmer" style={{ background: "radial-gradient(circle, #b266ff55, transparent 70%)", animationDelay: "1.5s" }} />
      </div>

      {editMode && (
        <SubHeader
          tabs={[
            { key: 0, label: "Para 1" },
            { key: 1, label: "Para 2" },
            { key: 2, label: "Para 3" },
            { key: "ready", label: "Ready Screen" },
          ]}
          activeKey={activeStepKey}
          onSelect={(k) => {
            if (k === "ready") { setConfirmed(true); }
            else { setConfirmed(false); setStep(k as number); setPhase("in"); }
          }}
        />
      )}

      <div className="relative z-10 max-w-2xl w-full text-center mt-16 md:mt-24 flex-1 flex flex-col justify-center">
        {!confirmed ? (
          <div key={step} className={phase === "in" ? "animate-bliss-fade-in-up" : "animate-bliss-fade-out-up"}>
            <div className="text-[10px] tracking-[0.4em] text-pink-200/70 mb-6 uppercase">{msg.icon} A Little Note {msg.icon}</div>
            <h1 className="text-4xl md:text-[5rem] bliss-font-display font-normal bg-gradient-to-r from-pink-300 to-[#c175ff] text-transparent bg-clip-text leading-[1.1] pb-2">
              <ET fid={msg.textFid} d={d} onChange={onFieldChange} editMode={editMode} def={msg.defText} />{msg.isName && !editMode && ","}
            </h1>
            <p className="mt-4 text-2xl md:text-3xl bliss-font-display italic text-white/90">
              <ET fid={msg.subFid} d={d} onChange={onFieldChange} editMode={editMode} def={msg.defSub} />
            </p>
          </div>
        ) : (
          <div className="animate-bliss-fade-in-up">
            <div className="text-[10px] tracking-[0.4em] text-pink-200/70 mb-6 uppercase">✦ Ready? ✦</div>
            <h1 className="text-4xl md:text-[5rem] bliss-font-display font-normal bg-gradient-to-r from-pink-300 to-[#c175ff] text-transparent bg-clip-text leading-[1.1] mb-12 pb-2">
              Shall we begin?
            </h1>
            <div className="flex flex-wrap gap-5 justify-center mt-12">
              <button className="bg-gradient-to-r from-[#ef417b] to-[#d81e5f] text-white px-12 py-4 text-[17px] rounded-full font-medium shadow-[0_4px_20px_rgba(230,46,110,0.4)] hover:scale-105 transition-transform" onClick={onDone}>Yes, please</button>
              <button className="bg-transparent border border-white/20 text-white px-12 py-4 text-[17px] rounded-full font-medium hover:bg-white/10 transition-colors" onClick={onDone}>Absolutely</button>
            </div>
          </div>
        )}
        <div className="mt-auto pb-10">
          <p className="font-sans text-[13px] font-medium tracking-widest text-pink-200/50 mt-20">made with love</p>
        </div>
      </div>
    </section>
  );
}

/* ============ BALLOONS ============ */
function BalloonsSlide({ onContinue, d, editMode, onFieldChange }: { onContinue: ()=>void; d: Record<string,string>; editMode: boolean; onFieldChange?: (id:string,v:string)=>void }) {
  const balloons = useMemo(() => generateBalloons(22), []);
  const [popped, setPopped] = useState(0);
  const [poppers, setPoppers] = useState<{ id: number; x: number; y: number }[]>([]);
  const TARGET = 8;

  const handlePop = (e?: React.MouseEvent) => {
    if (editMode) return;
    setPopped((p) => p + 1);
    if (e) {
      const id = Date.now() + Math.random();
      setPoppers((arr) => [...arr, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setPoppers((arr) => arr.filter((p) => p.id !== id)), 1200);
    }
  };

  return (
    <section className="min-h-screen relative overflow-hidden bliss-gradient-soft">
      <div className="relative z-10 pt-12 px-6 text-center pointer-events-none">
        <div className="text-xs tracking-[0.4em] text-pink-200/70 mb-3 uppercase">✦ Slide One ✦</div>
        <h2 className="text-4xl md:text-6xl bliss-font-display font-medium bliss-text-gradient-warm leading-tight">
          Pop a few balloons
        </h2>
        <p className="mt-4 text-sm text-pink-100/70 max-w-md mx-auto">Hover or tap. Get to {TARGET} to unlock the cake.</p>
        <div className="mt-6 inline-flex items-center gap-3 px-5 py-2 rounded-full glass-card text-sm">
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
          <span className="text-pink-100">{popped} / {TARGET} popped</span>
        </div>
      </div>

      <div className="absolute inset-0 z-0">
        {balloons.map((b) => (
          <Balloon key={b.id} {...b} onPop={handlePop as any} />
        ))}
      </div>

      {poppers.map((p) => (
        <Popper key={p.id} x={p.x} y={p.y} />
      ))}

      {(popped >= TARGET || editMode) && (
        <button onClick={() => !editMode && onContinue()} className="bliss-btn-pill bliss-btn-pill-pink fixed bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bliss-fade-in-up">
          Continue to the cake →
        </button>
      )}
    </section>
  );
}

/* ============ CAKE ============ */
function CakeSlide({ onComplete, d, editMode, onFieldChange }: { onComplete: ()=>void; d: Record<string,string>; editMode: boolean; onFieldChange?: (id:string,v:string)=>void }) {
  return (
    <section className="min-h-screen relative bliss-gradient-soft flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full animate-bliss-shimmer" style={{ background: "radial-gradient(circle, #ff2d8740, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-10 w-72 h-72 rounded-full animate-bliss-shimmer" style={{ background: "radial-gradient(circle, #b266ff40, transparent 70%)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-xl">
        <div className="text-[10px] tracking-[0.4em] text-pink-200/70 mb-4 uppercase">✦ Slide Two ✦</div>
        <h2 className="text-4xl md:text-[5rem] bliss-font-display font-normal bg-gradient-to-r from-[#f9a8d4] to-[#c084fc] text-transparent bg-clip-text text-center leading-tight mb-4 pb-2">
          A cake, for you
        </h2>
        <p className="text-[16px] text-white/80 text-center mb-32 max-w-md font-sans">
          Light the candles, make a wish, then drag down to cut.
        </p>
        <Cake onComplete={onComplete} />
      </div>
    </section>
  );
}

/* ============ MEMORIES ============ */
function MemoriesSlide({ onContinue, d, editMode, onFieldChange }: { onContinue: ()=>void; d: Record<string,string>; editMode: boolean; onFieldChange?: (id:string,v:string)=>void }) {
  const [activeSong, setActiveSong] = useState(1);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [bgModalOpen, setBgModalOpen] = useState(false);

  const playlist = [
    { id:1, title: d.p_song1||"Sia", artist: d.p_artist1||"Special Vibe", image: d.p_img1||"https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=600", caption: d.p_cap1||"Happy Birthday to the one who knows all my secrets and still chooses to stay.", url: d.p_url1||"", urlFid: "p_url1", imgFid: "p_img1", titleFid: "p_song1", artistFid: "p_artist1", capFid: "p_cap1" },
    { id:2, title: d.p_song2||"Tum Hi Ho", artist: d.p_artist2||"Forever Mood", image: d.p_img2||"https://images.unsplash.com/photo-1518199266791-5375a83164ba?auto=format&fit=crop&w=600", caption: d.p_cap2||"My love will love you through every season, every reason.", url: d.p_url2||"", urlFid: "p_url2", imgFid: "p_img2", titleFid: "p_song2", artistFid: "p_artist2", capFid: "p_cap2" },
    { id:3, title: d.p_song3||"Whenever You Need", artist: d.p_artist3||"Always Yours", image: d.p_img3||"https://images.unsplash.com/photo-1478147424044-16b7eb0a006c?auto=format&fit=crop&w=600", caption: d.p_cap3||"Whenever you need me, I'll be right there. Always.", url: d.p_url3||"", urlFid: "p_url3", imgFid: "p_img3", titleFid: "p_song3", artistFid: "p_artist3", capFid: "p_cap3" },
  ];
  const song = playlist.find((s) => s.id === activeSong)!;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(console.error);
    }
  };

  return (
    <section className="min-h-screen bliss-gradient-bg p-4 md:p-12 flex flex-col items-center relative py-6">
      
      {editMode && (
        <SubHeader
          tabs={[
            { key: 1, label: "Image 1" },
            { key: 2, label: "Image 2" },
            { key: 3, label: "Image 3" },
          ]}
          activeKey={activeSong}
          onSelect={(k) => setActiveSong(k as number)}
        />
      )}

      <div className="text-[10px] tracking-[0.4em] text-pink-200/70 mb-3 uppercase mt-6 md:mt-2">✦ Slide Three ✦</div>
      <h2 className="text-4xl md:text-[5rem] bliss-font-display font-normal bg-gradient-to-r from-[#f9a8d4] to-[#c084fc] text-transparent bg-clip-text text-center mb-12 md:mb-16 flex items-center justify-center gap-3 pb-2">
        Our memories <Sparkles className="inline text-pink-200" size={32} />
      </h2>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 max-w-[65rem] w-full px-4 items-center justify-center">
        
        {/* POLAROID CARD */}
        <div className="bliss-glass-card p-6 md:p-10 rounded-[2rem] w-full max-w-[28rem] mx-auto flex flex-col items-center justify-center shadow-2xl border border-white/10 bg-white/5 backdrop-blur-2xl animate-bliss-fade-in-up" key={`polaroid-${song.id}`}>
          <div className="bg-white p-3 pb-6 shadow-xl rounded-md w-full transition-transform hover:scale-[1.02] duration-500">
            <img src={song.image} alt={song.title} className="w-full aspect-[4/3] object-cover rounded-[4px]" />
            <div className="bliss-font-script text-[2.5rem] text-center mt-6 mb-1 text-[#6b318a] leading-none px-2">
              <ET fid={song.titleFid} d={d} onChange={onFieldChange} editMode={editMode} def={song.title} />
            </div>
          </div>
          
          <div className="mt-8 text-center text-white/90 italic font-serif text-[15px] leading-relaxed px-4">
            "<ET fid={song.capFid} d={d} onChange={onFieldChange} editMode={editMode} def={song.caption} multiline />"
          </div>
          
          {editMode && <div className="mt-6 w-full"><ImageUploader fid={song.imgFid} data={d} onChange={onFieldChange} defaultSrc={song.image} /></div>}
        </div>

        {/* PLAYLIST CARD */}
        <div className="bliss-glass-card p-8 md:p-10 rounded-[2rem] w-full max-w-[28rem] mx-auto shadow-2xl border border-white/10 bg-white/5 backdrop-blur-2xl flex flex-col">
          <div className="text-[11px] tracking-[0.3em] text-white/50 uppercase mb-3">Our Playlist</div>
          <h3 className="text-3xl md:text-[2.2rem] bliss-font-display font-medium text-white mb-8 flex items-center gap-3">
            Songs for you <span className="text-3xl">🎵</span>
          </h3>
          <div className="space-y-3 flex-1">
            {playlist.map((s) => {
              const active = s.id === activeSong;
              return (
                <div
                  key={s.id}
                  className="w-full flex items-center gap-2 transition-all relative group"
                >
                  <button
                    onClick={() => {
                      if (active) togglePlay();
                      else {
                        setActiveSong(s.id);
                        if (!editMode && s.url) {
                          setPlaying(true);
                          setTimeout(() => audioRef.current?.play().catch(console.error), 50);
                        }
                      }
                    }}
                    className="flex-1 text-left p-4 rounded-2xl flex items-center gap-4 transition-all"
                    style={{
                      background: active ? "linear-gradient(90deg, #b84c8a, #823e8e)" : "transparent",
                      border: active ? "none" : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="w-10 h-10 rounded-full border border-white/60 flex items-center justify-center shrink-0" style={{ background: "transparent" }}>
                      {active && playing ? <Pause size={16} color="white" /> : <Play size={16} color="white" className="ml-0.5" />}
                    </div>
                    <div className="flex-1 min-w-0" onClick={(e) => editMode && e.stopPropagation()}>
                      <div className="font-semibold text-[15px] text-white">
                        <ET fid={s.titleFid} d={d} onChange={onFieldChange} editMode={editMode} def={s.title} />
                      </div>
                      <div className="text-[13px] text-white/60 mt-0.5">
                        <ET fid={s.artistFid} d={d} onChange={onFieldChange} editMode={editMode} def={s.artist} />
                      </div>
                    </div>
                    {active && playing && (
                      <div className="flex gap-1 items-end h-5 mr-1">
                        {[1,2,3,4].map((i) => (
                          <span key={i} className="w-[3px] bg-white rounded-full animate-pulse"
                                style={{ height: `${30 + (i * 17) % 70}%`, animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                    )}
                  </button>
                  {editMode && (
                    <button
                      onClick={() => { setActiveSong(s.id); setBgModalOpen(true); }}
                      style={{
                        padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "rgba(255,255,255,0.1)",
                        color: "white", cursor: "pointer", transition: "all 0.2s",
                        flexShrink: 0
                      }}
                      title="Choose Song"
                    >
                      Choose Audio
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={() => !editMode && onContinue()} className="w-full mt-8 bg-gradient-to-r from-[#ef417b] to-[#d81e5f] text-white py-4 rounded-[1rem] font-medium text-[15px] shadow-[0_4px_15px_rgba(230,46,110,0.4)] hover:scale-[1.02] transition-transform">
            Continue →
          </button>
        </div>
      </div>

      {song.url && (
        <audio
          ref={audioRef}
          src={song.url}
          onEnded={() => setPlaying(false)}
        />
      )}

      {bgModalOpen && (
        <SongLibraryPopup
          onClose={() => setBgModalOpen(false)}
          onSelect={(selectedSong) => {
            onFieldChange?.(song.urlFid, selectedSong.url);
            onFieldChange?.(song.titleFid, selectedSong.name);
            onFieldChange?.(song.artistFid, "Library Song");
            setBgModalOpen(false);
          }}
        />
      )}
    </section>
  );
}

/* ============ ENVELOPE ============ */
function EnvelopeSlide({ onOpen, editMode }: { onOpen: () => void; editMode: boolean }) {
  const [open, setOpen] = useState(false);
  const startY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  const begin = (y: number) => { startY.current = y; };
  const move = (y: number) => {
    if (startY.current === null) return;
    const dy = Math.min(0, y - startY.current);
    setDragY(dy);
    if (dy < -70 && !open) { setOpen(true); setTimeout(onOpen, 1500); }
  };
  const end = () => { startY.current = null; if (!open) setDragY(0); };

  return (
    <section className="min-h-screen bliss-gradient-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-bliss-shimmer" style={{ background: "radial-gradient(circle, #ff2d8744, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full animate-bliss-shimmer" style={{ background: "radial-gradient(circle, #b266ff44, transparent 70%)", animationDelay: "1.5s" }} />
      </div>

      <div className="relative z-10 text-center">
        <div className="text-xs tracking-[0.4em] text-pink-200/70 mb-3 uppercase">✦ One Last Thing ✦</div>
        <h2 className="text-3xl md:text-5xl bliss-font-display font-medium bliss-text-gradient-warm mb-10 leading-tight">
          A letter, just for you
        </h2>

        <div
          className={`bliss-envelope-wrap flex justify-center select-none touch-none ${editMode ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"}`}
          onMouseDown={(e) => !editMode && begin(e.clientY)}
          onMouseMove={(e) => startY.current !== null && move(e.clientY)}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={(e) => !editMode && begin(e.touches[0].clientY)}
          onTouchMove={(e) => !editMode && move(e.touches[0].clientY)}
          onTouchEnd={end}
          style={{ transform: (open||editMode) ? "none" : `translateY(${dragY * 0.4}px)`, transition: open ? "none" : "transform 0.2s" }}
        >
          <div className={`bliss-envelope ${(open||editMode) ? "open" : ""}`}>
            <div className="bliss-envelope-letter-peek" />
            <div className="bliss-envelope-body-front" />
            <div className="bliss-envelope-flap" />
          </div>
        </div>

        <div className={`mt-10 flex flex-col items-center gap-1 text-pink-100/80 ${(open||editMode) ? "opacity-0" : "animate-bliss-slide-hint"}`}>
          <ChevronUp size={22} />
          <p className="text-sm tracking-[0.2em] uppercase">Slide up to open</p>
        </div>
      </div>
    </section>
  );
}

/* ============ LETTER ============ */
function LetterSlide({ onReset, d, editMode, onFieldChange }: { onReset: ()=>void; d: Record<string,string>; editMode: boolean; onFieldChange?: (id:string,v:string)=>void }) {
  const [sealed, setSealed] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const letterRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  const handleSeal = () => {
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

      const element = letterRef.current;
      if (!element) {
        console.error("Capture element not found");
        const fallbackSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23fff5f8'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23e91e8c' font-size='16'>Sealed with Love! 💖</text></svg>`;
        const fallbackData = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(fallbackSvg)))}`;
        setScreenshotData(fallbackData);
        setOpenModal(true);
        return;
      }

      try {
        const { domToPng } = await import("modern-screenshot");
        const dataUrl = await domToPng(element, {
          scale: 2,
          backgroundColor: "rgba(255,245,248,0.97)",
          filter: (el) => {
            if (el.nodeType === 1) {
              const htmlEl = el as HTMLElement;
              return !htmlEl.classList.contains("no-screenshot") && htmlEl.tagName !== "BUTTON";
            }
            return true;
          }
        });
        setScreenshotData(dataUrl);
        setOpenModal(true);
      } catch (err) {
        console.error("Screenshot capture failed", err);
        const fallbackSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23fff5f8'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23e91e8c' font-size='16'>Sealed with Love! 💖</text></svg>`;
        const fallbackData = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(fallbackSvg)))}`;
        setScreenshotData(fallbackData);
        setOpenModal(true);
      }
    }, 1500);
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
            title: "Birthday Sealed Proof 💖",
            text: "My birthday letter is sealed and proof is locked! 🎂"
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

    // 2. Fallback to ImgBB upload and WhatsApp Link
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

        // Open WhatsApp Share with the generated link
        const whatsappText = `My birthday letter is sealed and proof is locked! Check out the seen proof here: 🎂\n${url}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
        window.open(whatsappUrl, '_blank');
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
    <section className="min-h-screen bliss-gradient-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <style>{`
        @keyframes sealSlam {
          0% { transform: scale(3.5) rotate(-45deg); opacity: 0; filter: blur(6px); }
          70% { transform: scale(0.9) rotate(5deg); opacity: 1; filter: none; }
          85% { transform: scale(1.15) rotate(-3deg); }
          100% { transform: scale(1) rotate(-5deg); }
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
      <Confetti count={50} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full animate-bliss-shimmer" style={{ background: "radial-gradient(circle, #ff2d8755, transparent 70%)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full animate-bliss-shimmer" style={{ background: "radial-gradient(circle, #b266ff55, transparent 70%)", animationDelay: "1.5s" }} />
      </div>

      <div className="relative z-10 w-[92%] md:w-full max-w-lg flex flex-col items-center gap-6 animate-bliss-fade-in-up">
        <div ref={letterRef} className="bliss-letter-paper relative w-full p-8 md:p-14">
          <div className="flex items-center justify-between text-[#7a4a5c] text-[11px] font-sans tracking-widest uppercase mb-10">
            <span>A Letter</span>
            <span>{currentDate}</span>
          </div>
          <h1 className="bliss-font-display text-4xl md:text-[2.75rem] font-medium text-[#5a1d3a] mb-2 leading-tight">
            <ET darkText fid="l_greeting" d={d} onChange={onFieldChange} editMode={editMode} def={d.l_greeting||"Happy Birthday, my favorite person."} />
          </h1>
          <div className="h-px bg-[#c0392b]/20 my-8" />
          <p className="text-xl md:text-[1.35rem] leading-relaxed text-[#3a1d2a] mb-6">
            <ET darkText fid="l_msg" d={d} onChange={onFieldChange} editMode={editMode} multiline def={d.l_msg||"Thanks for coming into my life and making it better with your presence."} />
          </p>
          <p className="text-xl md:text-[1.35rem] leading-relaxed text-[#3a1d2a] mb-10">
            <ET darkText fid="l_closing" d={d} onChange={onFieldChange} editMode={editMode} multiline def={d.l_closing||"Here's to your laughter, your light, and every wish I'm quietly making for you tonight."} />
          </p>
          <p className="text-2xl md:text-3xl text-[#5a1d3a]"><ET darkText fid="l_signoff" d={d} onChange={onFieldChange} editMode={editMode} def={d.l_signoff||"— with all my heart ❤"} /></p>

          {sealed && !editMode && (
            <div className="seal-backdrop" style={{ position:"absolute", inset:0, background:"rgba(255,245,248,0.95)", borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center", zIndex:20, ...(animationDone ? { animation: "none", opacity: 1 } : {}) }}>
              <div className="seal-pressing" style={{ transform: "rotate(-5deg)", filter: "drop-shadow(0 8px 24px rgba(183,28,28,0.4))", ...(animationDone ? { animation: "none" } : {}) }}>
                <svg width="210" height="210" viewBox="0 0 200 200">
                  <defs>
                    <path id="stamp-top-path" d="M 35, 100 A 65,65 0 0,1 165, 100" fill="none" />
                    <path id="stamp-bottom-path" d="M 165, 100 A 65,65 0 0,1 35, 100" fill="none" />
                  </defs>
                  
                  {/* Irregular scalloped circle edge for a hyper-realistic hot wax look */}
                  <path d="M 100, 15 A 85,85 0 0,0 20, 110 A 80,85 0 0,0 100, 185 A 85,80 0 0,0 180, 95 A 85,85 0 0,0 100, 15 Z" fill="#B71C1C" stroke="#D32F2F" strokeWidth="4" />
                  <circle cx="100" cy="100" r="78" fill="none" stroke="#FFCDD2" strokeWidth="2" strokeDasharray="4 2" opacity="0.6" />
                  <circle cx="100" cy="100" r="62" fill="#800F0F" stroke="#B71C1C" strokeWidth="3" />
                  
                  <text fill="#FFCDD2" fontSize="9.5" fontFamily="'Inter', sans-serif" fontWeight="900" letterSpacing="1.5">
                    <textPath href="#stamp-top-path" startOffset="50%" textAnchor="middle">
                      ARADHYA EGIFTS
                    </textPath>
                  </text>
                  
                  <text fill="#FFCDD2" fontSize="8" fontFamily="'Inter', sans-serif" fontWeight="700" letterSpacing="0.8">
                    <textPath href="#stamp-bottom-path" startOffset="50%" textAnchor="middle">
                      {`SEEN ON ${currentDate}`}
                    </textPath>
                  </text>
                  
                  <text x="100" y="92" textAnchor="middle" fill="#FFF" fontSize="12" fontFamily="'Inter', sans-serif" fontWeight="900" letterSpacing="0.5">
                    SEEN BY
                  </text>
                  <text x="100" y="112" textAnchor="middle" fill="#FFEB3B" fontSize="16" fontFamily="'Dancing Script', cursive" fontWeight="bold">
                    {d.s0_recipient || "Princess"}
                  </text>
                  
                  <text x="54" y="103" fill="#FFEB3B" fontSize="9">❤</text>
                  <text x="146" y="103" fill="#FFEB3B" fontSize="9">❤</text>
                </svg>
              </div>
            </div>
          )}
        </div>

        {!editMode && (
          <div className="flex flex-wrap gap-3 justify-center no-screenshot">
            <button onClick={onReset} className="bliss-btn-pill inline-flex items-center gap-2">
              <RotateCcw size={14} /> Experience again
            </button>
            <button onClick={handleSeal} className="bliss-btn-pill bliss-btn-pill-pink inline-flex items-center gap-2">
              <Stamp size={14} /> Seal the letter
            </button>
          </div>
        )}
      </div>

      {/* Screenshot Framed Preview Modal */}
      {openModal && screenshotData && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(10, 5, 8, 0.8)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} className="fade-in">
          <div style={{
            background: "rgba(255, 248, 250, 0.95)",
            border: "2px solid #E91E8C",
            borderRadius: 24,
            padding: "24px 20px",
            width: "100%",
            maxWidth: 440,
            boxShadow: "0 24px 64px rgba(233, 30, 140, 0.3)",
            textAlign: "center",
            position: "relative",
          }} className="pop-in-modal">
            <h3 style={{
              fontFamily: "'Nunito', sans-serif", fontWeight: 900,
              fontSize: 22, color: "#E91E8C", marginBottom: 6
            }}>
              💖 Seen Proof Sealed! 💖
            </h3>
            <p style={{ fontSize: 13, color: "#7a6b73", marginBottom: 16 }}>
              Your letter is sealed and proof is captured!
            </p>

            <div style={{
              background: "#fff",
              padding: "12px 12px 24px",
              borderRadius: 12,
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              border: "1px solid #FFE4EE",
              marginBottom: 20,
              transform: "rotate(-1deg)",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={screenshotData} alt="Sealed Proof" style={{
                width: "100%", borderRadius: 6, display: "block",
                maxHeight: 280, objectFit: "contain",
                border: "1px solid rgba(233, 30, 140, 0.1)"
              }} />
              <div style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: 18, color: "#E91E8C", marginTop: 12, textAlign: "center"
              }}>
                Sealed with Love ✨
              </div>
            </div>

            {shareUrl && (
              <div style={{
                background: "rgba(76, 175, 138, 0.08)",
                border: "1px solid rgba(76, 175, 138, 0.3)",
                borderRadius: 12, padding: "10px 14px", marginBottom: 16,
                fontSize: 12, color: "#2E7D32", fontWeight: 600,
                lineHeight: 1.4
              }} className="fade-in">
                <span style={{ fontSize: 14 }}>🎉</span> Link Copied to Clipboard!
                <div style={{
                  marginTop: 4, fontStyle: "italic", fontWeight: 400,
                  color: "#388E3C", wordBreak: "break-all", background: "#fff",
                  padding: "4px 8px", borderRadius: 6, border: "1px solid #E8F5E9"
                }}>{shareUrl}</div>
              </div>
            )}

            {error && (
              <div style={{
                background: "rgba(211, 47, 47, 0.08)",
                border: "1px solid rgba(211, 47, 47, 0.3)",
                borderRadius: 12, padding: "10px 14px", marginBottom: 16,
                fontSize: 12, color: "#C62828", fontWeight: 600
              }}>
                ❌ {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={handleShare}
                disabled={uploading}
                style={{
                  background: "#25D366", color: "#fff",
                  border: "none", borderRadius: 999,
                  padding: "12px 24px", fontSize: 13, fontWeight: 800,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 6px 16px rgba(37, 211, 102, 0.3)",
                  opacity: uploading ? 0.7 : 1, transition: "all 0.2s",
                  flex: 1
                }}
              >
                {uploading ? (
                  "Uploading... ⏳"
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Share to WhatsApp
                  </>
                )}
              </button>
              <button
                onClick={() => setOpenModal(false)}
                style={{
                  background: "#E0E0E0", color: "#333",
                  border: "none", borderRadius: 999,
                  padding: "12px 24px", fontSize: 13, fontWeight: 800,
                  cursor: "pointer", transition: "all 0.2s", flex: 0.5
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

