import { useState, useEffect, useMemo, useRef } from "react";
import { Balloon, generateBalloons } from "./Balloon";
import { Cake } from "./Cake";
import { Confetti, Popper } from "./Confetti";
import { Sparkles, Play, Pause, Share2, RotateCcw, Stamp, ChevronUp } from "lucide-react";
import html2canvas from "html2canvas";

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

  if (!editMode) return <>{value}</>;

  if (editing) {
    const base: React.CSSProperties = {
      display: "block", width: "100%", border: "1px solid #ff2d87", borderRadius: 4, padding: 4,
      background: "rgba(255,255,255,0.1)", outline: "none", color: "inherit", zIndex: 1000, position: "relative"
    };
    return multiline
      ? <textarea value={draft} rows={4} autoFocus onChange={e => setDraft(e.target.value)} onBlur={commit} style={{ ...style, ...base, resize: "vertical" }} />
      : <input value={draft} autoFocus onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={e => e.key === "Enter" && commit()} style={{ ...style, ...base }} />;
  }

  return (
    <span onClick={(e) => { e.stopPropagation(); setEditing(true); }} style={{ cursor: "text", borderBottom: "1px dashed #ff2d87", minWidth: 20, display: "inline-block", position: "relative", zIndex: 50, ...style }}>
      {value || <em style={{ opacity: 0.5 }}>Empty</em>}
    </span>
  );
}

type Stage = "intro" | "balloons" | "cake" | "memories" | "envelope" | "letter";

export default function BirthdayBliss({
  customData = {}, editMode = false, onFieldChange, forcedSlide, autoPlay = false,
}: {
  customData?: Record<string, string>;
  editMode?: boolean;
  onFieldChange?: (id: string, value: string) => void;
  forcedSlide?: number;
  autoPlay?: boolean;
}) {
  const [stage, setStage] = useState<Stage>("intro");
  const reset = () => setStage("intro");

  useEffect(() => {
    if (forcedSlide !== undefined) {
      const slideMap: Stage[] = ["intro", "balloons", "cake", "memories", "envelope", "letter"];
      if (slideMap[forcedSlide]) {
        setStage(slideMap[forcedSlide]);
      }
    }
  }, [forcedSlide]);

  const RECIPIENT_NAME = customData.s0_recipient || "Madam Ji";
  const SUBTITLE = customData.s0_sub || "it's your day to shine.";
  const FINAL_MESSAGE = customData.l_msg || "Thanks for coming into my life and making it better with your presence.";

  const PLAYLIST = [
    { id: 1, title: customData.p_song1 || "Sia", artist: customData.p_artist1 || "Special Vibe", image: customData.p_img1 || "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=600", caption: customData.p_cap1 || "Happy Birthday to the one who knows all my secrets and still chooses to stay.", url: customData.p_url1 || "" },
    { id: 2, title: customData.p_song2 || "Tum Hi Ho", artist: customData.p_artist2 || "Forever Mood", image: customData.p_img2 || "https://images.unsplash.com/photo-1518199266791-5375a83164ba?auto=format&fit=crop&w=600", caption: customData.p_cap2 || "My love will love you through every season, every reason.", url: customData.p_url2 || "" },
    { id: 3, title: customData.p_song3 || "Whenever You Need", artist: customData.p_artist3 || "Always Yours", image: customData.p_img3 || "https://images.unsplash.com/photo-1478147424044-16b7eb0a006c?auto=format&fit=crop&w=600", caption: customData.p_cap3 || "Whenever you need me, I'll be right there. Always.", url: customData.p_url3 || "" },
  ];

  const INTRO_MESSAGES = [
    { text: `Hey ${RECIPIENT_NAME},`, sub: SUBTITLE, icon: "✦" },
    { text: "I've set up something", sub: "a little special — just for you.", icon: "✦" },
    { text: "Your light", sub: "is pretty much your magic.", icon: "✦" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-left">
      {stage === "intro" && <IntroSlide onDone={() => setStage("balloons")} customData={customData} editMode={editMode} onFieldChange={onFieldChange} />}
      {stage === "balloons" && <BalloonsSlide onContinue={() => setStage("cake")} />}
      {stage === "cake" && <CakeSlide onComplete={() => setStage("memories")} />}
      {stage === "memories" && <MemoriesSlide onContinue={() => setStage("envelope")} customData={customData} editMode={editMode} onFieldChange={onFieldChange} />}
      {stage === "envelope" && <EnvelopeSlide onOpen={() => setStage("letter")} />}
      {stage === "letter" && <LetterSlide onReset={reset} customData={customData} editMode={editMode} onFieldChange={onFieldChange} />}
    </div>
  );
}

/* ============ INTRO ============ */
function IntroSlide({ onDone, customData, editMode, onFieldChange }: { onDone: () => void, customData: any, editMode: boolean, onFieldChange?: any }) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (editMode) return;
    if (step >= 3) return;
    const inTimer = setTimeout(() => setPhase("out"), 2600);
    const outTimer = setTimeout(() => {
      if (step < 2) {
        setStep(step + 1);
        setPhase("in");
      } else {
        setConfirmed(true);
      }
    }, 3200);
    return () => { clearTimeout(inTimer); clearTimeout(outTimer); };
  }, [step, editMode]);

  return (
    <section className="min-h-screen bliss-gradient-bg flex items-center justify-center p-6 relative">
      {/* ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full animate-bliss-shimmer" style={{ background: "radial-gradient(circle, #ff2d8755, transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full animate-bliss-shimmer" style={{ background: "radial-gradient(circle, #b266ff55, transparent 70%)", animationDelay: "1.5s" }} />
            <div className="relative z-10 max-w-2xl w-full text-center">
        {!confirmed && !editMode ? (
          <div key={step} className={phase === "in" ? "animate-bliss-fade-in-up" : "animate-bliss-fade-out-up"}>
            <div className="text-xs tracking-[0.4em] text-pink-200/70 mb-6 uppercase">✦ A Little Note ✦</div>
            <h1 className="text-4xl md:text-6xl font-display font-medium text-gradient-warm leading-[1.1]">
              {step === 0 && <>Hey {customData.s0_recipient || "Madam Ji"},</>}
              {step === 1 && "I've set up something"}
              {step === 2 && "Your light"}
            </h1>
            <p className="mt-3 text-2xl md:text-3xl font-display italic text-pink-100/90">
              {step === 0 && <>{customData.s0_sub || "it's your day to shine."}</>}
              {step === 1 && "a little special — just for you."}
              {step === 2 && "is pretty much your magic."}
            </p>
          </div>
        ) : (
          <div className="animate-bliss-fade-in-up">
            <div className="text-xs tracking-[0.4em] text-pink-200/70 mb-6 uppercase">✦ Ready? ✦</div>
            <h1 className="text-3xl md:text-5xl font-display font-medium text-gradient-warm leading-[1.1] mb-4">
              {editMode ? (
                <>
                  <ET fid="s0_recipient" data={customData} editMode={editMode} onChange={onFieldChange} />
                  <br />
                  <span className="text-2xl mt-2 block"><ET fid="s0_sub" data={customData} editMode={editMode} onChange={onFieldChange} /></span>
                </>
              ) : "Shall we begin?"}
            </h1>
            <div className="flex flex-wrap gap-3 justify-center mt-10">
              <button className="bliss-btn-pill bliss-btn-pill-pink" onClick={onDone}>Yes, please</button>
              <button className="bliss-btn-pill" onClick={onDone}>Absolutely</button>
            </div>
          </div>
        )}
        <p className="font-script text-xl text-pink-200/60 mt-16">made with love</p>
      </div>      </div>
    </section>
  );
}

/* ============ BALLOONS ============ */
function BalloonsSlide({ onContinue }: { onContinue: () => void }) {
  const balloons = useMemo(() => generateBalloons(22), []);
  const [popped, setPopped] = useState(0);
  const [poppers, setPoppers] = useState<{ id: number; x: number; y: number }[]>([]);
  const TARGET = 8;

  const handlePop = (e?: React.MouseEvent) => {
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
        <h2 className="text-4xl md:text-6xl font-display font-medium text-gradient-warm leading-tight">
          Pop a few balloons
        </h2>
        <p className="mt-4 text-sm text-pink-100/70 max-w-md mx-auto">Hover or tap. Get to {TARGET} to unlock the cake.</p>
        <div className="mt-6 inline-flex items-center gap-3 px-5 py-2 rounded-full bliss-glass-card text-sm">
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

      {popped >= TARGET && (
        <button onClick={onContinue} className="bliss-btn-pill bliss-btn-pill-pink fixed bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bliss-fade-in-up">
          Continue to the cake →
        </button>
      )}
    </section>
  );
}

/* ============ CAKE ============ */
function CakeSlide({ onComplete }: { onComplete: () => void }) {
  return (
    <section className="min-h-screen relative bliss-gradient-soft flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full animate-bliss-shimmer" style={{ background: "radial-gradient(circle, #ff2d8740, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-10 w-72 h-72 rounded-full animate-bliss-shimmer" style={{ background: "radial-gradient(circle, #b266ff40, transparent 70%)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-xl">
        <div className="text-xs tracking-[0.4em] text-pink-200/70 mb-3 uppercase">✦ Slide Two ✦</div>
        <h2 className="text-3xl md:text-5xl font-display font-medium text-gradient-warm text-center leading-tight mb-3">
          A cake, for you
        </h2>
        <p className="text-sm text-pink-100/70 text-center mb-10 max-w-sm">
          Light the candles, make a wish, then drag down to cut.
        </p>
        <Cake onComplete={onComplete} />
      </div>
    </section>
  );
}

/* ============ MEMORIES ============ */
function MemoriesSlide({ onContinue, customData, editMode, onFieldChange }: { onContinue: () => void, customData: any, editMode: boolean, onFieldChange?: any }) {
  const [activeSong, setActiveSong] = useState(1);
  const [playing, setPlaying] = useState(false);
  
  const playlist = [
    { id: 1, title: customData.p_song1 || "Sia", artist: customData.p_artist1 || "Special Vibe", image: customData.p_img1 || "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=600", caption: customData.p_cap1 || "Happy Birthday to the one who knows all my secrets and still chooses to stay." },
    { id: 2, title: customData.p_song2 || "Tum Hi Ho", artist: customData.p_artist2 || "Forever Mood", image: customData.p_img2 || "https://images.unsplash.com/photo-1518199266791-5375a83164ba?auto=format&fit=crop&w=600", caption: customData.p_cap2 || "My love will love you through every season, every reason." },
    { id: 3, title: customData.p_song3 || "Whenever You Need", artist: customData.p_artist3 || "Always Yours", image: customData.p_img3 || "https://images.unsplash.com/photo-1478147424044-16b7eb0a006c?auto=format&fit=crop&w=600", caption: customData.p_cap3 || "Whenever you need me, I'll be right there. Always." },
  ];

  const song = playlist.find((s) => s.id === activeSong)!;

  return (
    <section className="min-h-screen bliss-gradient-bg p-6 md:p-12 flex flex-col items-center">
      <div className="text-xs tracking-[0.4em] text-pink-200/70 mb-3 uppercase mt-4">✦ Slide Three ✦</div>
      <h2 className="text-3xl md:text-5xl font-display font-medium text-gradient-warm text-center mb-12 flex items-center gap-3">
        Our memories <Sparkles className="inline text-pink-200" size={28} />
      </h2>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Polaroid */}
        <div className="bliss-glass-card p-6 flex flex-col items-center animate-bliss-fade-in-up" key={song.id}>
          <div className="bg-white p-3 pb-5 shadow-2xl rounded-md w-full max-w-xs rotate-[-2deg]">
            <img src={song.image} alt={song.title} className="w-full h-56 object-cover rounded-sm" />
            <p className="font-script text-2xl text-center mt-3 text-purple-800">
              <ET fid={`p_song${song.id}`} data={customData} editMode={editMode} onChange={onFieldChange} />
            </p>
          </div>
          <p className="text-pink-100/80 text-center mt-6 text-sm italic px-4 leading-relaxed">
            "<ET fid={`p_cap${song.id}`} data={customData} editMode={editMode} onChange={onFieldChange} multiline />"
          </p>
        </div>

        {/* Playlist */}
        <div className="bliss-glass-card p-6 md:p-7">
          <div className="text-xs tracking-[0.3em] text-pink-200/60 uppercase mb-2">Our Playlist</div>
          <h3 className="text-2xl font-display font-medium text-white mb-6">Songs for you 🎵</h3>
          <div className="space-y-2">
            {playlist.map((s) => {
              const active = s.id === activeSong;
              return (
                <button
                  key={s.id}
                  onClick={() => { setActiveSong(s.id); if (!playing) setPlaying(true); }}
                  className="w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all"
                  style={{
                    background: active ? "linear-gradient(135deg, rgba(255,45,135,0.4), rgba(178,102,255,0.3))" : "rgba(255,255,255,0.05)",
                    border: active ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                       style={{ background: active ? "rgba(255,255,255,0.2)" : "rgba(255,45,135,0.8)", color: "white" }}>
                    {active && playing ? <Pause size={16} /> : <Play size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white truncate"><ET fid={`p_song${s.id}`} data={customData} editMode={editMode} onChange={onFieldChange} /></p>
                    <p className="text-xs text-pink-100/60"><ET fid={`p_artist${s.id}`} data={customData} editMode={editMode} onChange={onFieldChange} /></p>
                  </div>
                  {active && (
                    <div className="flex gap-0.5 items-end h-5">
                      {[1,2,3,4].map((i) => (
                        <span key={i} className="w-0.5 bg-pink-200 rounded animate-pulse"
                              style={{ height: `${30 + (i * 17) % 70}%`, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <button onClick={onContinue} className="bliss-btn-pill bliss-btn-pill-pink w-full mt-6">
            Continue →
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============ ENVELOPE ============ */
function EnvelopeSlide({ onOpen }: { onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const startY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  const begin = (y: number) => { startY.current = y; };
  const move = (y: number) => {
    if (startY.current === null) return;
    const d = Math.min(0, y - startY.current);
    setDragY(d);
    if (d < -70 && !open) {
      setOpen(true);
      setTimeout(onOpen, 1500);
    }
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
        <h2 className="text-3xl md:text-5xl font-display font-medium text-gradient-warm mb-10 leading-tight">
          A letter, just for you
        </h2>

        <div
          className="bliss-envelope-wrap flex justify-center select-none touch-none cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => begin(e.clientY)}
          onMouseMove={(e) => startY.current !== null && move(e.clientY)}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={(e) => begin(e.touches[0].clientY)}
          onTouchMove={(e) => move(e.touches[0].clientY)}
          onTouchEnd={end}
          style={{ transform: open ? "none" : `translateY(${dragY * 0.4}px)`, transition: open ? "none" : "transform 0.2s" }}
        >
          <div className={`bliss-envelope ${open ? "open" : ""}`}>
            <div className="bliss-envelope-letter-peek" />
            <div className="bliss-envelope-body-front" />
            <div className="bliss-envelope-flap" />
          </div>
        </div>

        <div className={`mt-10 flex flex-col items-center gap-1 text-pink-100/80 ${open ? "opacity-0" : "animate-slide-hint"}`}>
          <ChevronUp size={22} />
          <p className="text-sm tracking-[0.2em] uppercase">Slide up to open</p>
        </div>
      </div>
    </section>
  );
}

/* ============ LETTER ============ */
function LetterSlide({ onReset, customData, editMode, onFieldChange }: { onReset: () => void, customData: any, editMode: boolean, onFieldChange?: any }) {
  const [sealed, setSealed] = useState(false);
  const [sharing, setSharing] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);
  const date = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

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
        await navigator.share({ files: [file], title: "A Birthday Letter", text: `Happy Birthday ${customData.s0_recipient || "Madam Ji"} ✨` });
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

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-6 animate-bliss-fade-in-up">
        <div ref={letterRef} className="bliss-letter-paper relative w-full p-8 md:p-12">
          <div className="flex items-center justify-between text-[#7a4a5c] text-xs font-sans tracking-widest uppercase mb-6">
            <span>A Letter</span>
            <span>{date}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-medium text-[#5a1d3a] mb-1">
            Dear <ET fid="s0_recipient" data={customData} editMode={editMode} onChange={onFieldChange} />,
          </h1>
          <div className="h-px bg-[#c0392b]/30 my-4" />
          <p className="text-xl md:text-2xl leading-snug text-[#3a1d2a]">
            Happy Birthday, my favorite person.
          </p>
          <p className="text-lg md:text-xl leading-relaxed text-[#3a1d2a] mt-3">
            <ET fid="l_msg" data={customData} editMode={editMode} onChange={onFieldChange} multiline /> You make every ordinary day feel like a celebration, and today the whole world gets to celebrate <em>you</em>.
          </p>
          <p className="text-lg md:text-xl leading-relaxed text-[#3a1d2a] mt-3">
            Here's to your laughter, your light, and every wish I'm quietly making for you tonight.
          </p>
          <p className="text-2xl mt-6 text-[#5a1d3a]">— with all my heart ❤</p>

          {sealed && (
            <div className="bliss-stamp">
              Seen by {customData.s0_recipient || "Madam Ji"}<br />
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
            <button onClick={() => setSealed(true)} className="bliss-btn-pill bliss-btn-pill-pink inline-flex items-center gap-2">
              <Stamp size={14} /> Seal the letter
            </button>
          ) : (
            <button onClick={handleShare} disabled={sharing} className="bliss-btn-pill bliss-btn-pill-pink inline-flex items-center gap-2">
              <Share2 size={14} /> {sharing ? "Preparing…" : "Share"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
