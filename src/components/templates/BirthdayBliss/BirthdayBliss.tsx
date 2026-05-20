"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Balloon, generateBalloons } from "./Balloon";
import { Cake } from "./Cake";
import { Confetti, Popper } from "./Confetti";
import { Sparkles, Play, Pause, Share2, RotateCcw, Stamp, ChevronUp } from "lucide-react";
import html2canvas from "html2canvas";
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

  return (
    <div className="relative min-h-screen overflow-hidden">
      {d.bg_song_url && !editMode && <audio src={d.bg_song_url} autoPlay loop />}
      
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
  const [sharing, setSharing] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);
  const date = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

  const handleSeal = () => {
    setSealed(true);
    setAnimationDone(false);
    setTimeout(() => {
      setAnimationDone(true);
    }, 1000);
  };

  const handleShare = async () => {
    if (!letterRef.current) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(letterRef.current, { backgroundColor: null, scale: 2 });
      const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/png"));
      if (!blob) throw new Error("blob failed");
      const file = new File([blob], "birthday-letter.png", { type: "image/png" });
      // @ts-ignore
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "A Birthday Letter", text: `Happy Birthday ${d.s0_recipient||"Madam Ji"} ✨` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "birthday-letter.png"; a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) { console.error(e); }
    setSharing(false);
  };

  return (
    <section className="min-h-screen bliss-gradient-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <Confetti count={50} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full animate-bliss-shimmer" style={{ background: "radial-gradient(circle, #ff2d8755, transparent 70%)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full animate-bliss-shimmer" style={{ background: "radial-gradient(circle, #b266ff55, transparent 70%)", animationDelay: "1.5s" }} />
      </div>

      <div className="relative z-10 w-[92%] md:w-full max-w-lg flex flex-col items-center gap-6 animate-bliss-fade-in-up">
        <div ref={letterRef} className="bliss-letter-paper relative w-full p-8 md:p-14">
          <div className="flex items-center justify-between text-[#7a4a5c] text-[11px] font-sans tracking-widest uppercase mb-10">
            <span>A Letter</span>
            <span>{date}</span>
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

          {sealed && (
            <div
              className="bliss-stamp"
              style={animationDone ? {
                animation: "none",
                transform: "translate(-50%, -50%) rotate(-12deg) scale(1)",
                opacity: 1
              } : {}}
            >
              Seen by {d.s0_recipient||"Madam Ji"}<br />
              <span className="text-[10px] opacity-80">on {date}</span><br />
              <span className="text-[10px] opacity-80">Made by ARADHYA E-GIFT</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={onReset} className="bliss-btn-pill inline-flex items-center gap-2">
            <RotateCcw size={14} /> Experience again
          </button>
          {!sealed ? (
            <button onClick={handleSeal} className="bliss-btn-pill bliss-btn-pill-pink inline-flex items-center gap-2">
              <Stamp size={14} /> Seal the letter
            </button>
          ) : (
            <button onClick={handleShare} disabled={sharing} className="bliss-btn-pill bliss-btn-pill-pink inline-flex items-center gap-2">
              <Share2 size={14} /> {sharing ? "Preparingâ€¦" : "Share"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

