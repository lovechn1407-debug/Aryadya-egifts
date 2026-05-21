"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import confetti from "canvas-confetti";
import gsap from "gsap";
import SongLibraryPopup from "../../SongLibraryPopup";

// ── CSS Keyframes (injected as style tag) ─────────────────────────────────────
const KEYFRAMES = `
  @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700&family=Sacramento&family=Nunito:wght@400..800&family=Lora:ital,wght@0,400..600;1,400..600&display=swap");
  @keyframes lej-flicker { from { opacity: 1; } to { opacity: 0.82; } }
  .lej-bulb { width:14px;height:18px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;display:inline-block;box-shadow:0 0 8px currentColor,0 0 20px currentColor; }
  .lej-bulb-flicker { animation: lej-flicker 0.12s ease infinite alternate; }
  @keyframes lej-star { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
  .lej-star { animation: lej-star 3s ease-in-out infinite; }
  @keyframes lej-wave { 0%,100% { border-radius:45% 55% 50% 50%/30% 30% 70% 70%; } 50% { border-radius:55% 45% 50% 50%/70% 70% 30% 30%; } }
  .lej-wave { animation: lej-wave 5s ease-in-out infinite; }
  @keyframes lej-bob { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-10px) rotate(2deg); } }
  .lej-bob { animation: lej-bob 4s ease-in-out infinite; }
  @keyframes lej-bear { 0%,100% { transform:rotate(-8deg) translateY(0); } 25% { transform:rotate(0deg) translateY(-6px); } 50% { transform:rotate(8deg) translateY(0); } 75% { transform:rotate(0deg) translateY(-6px); } }
  .lej-dance { animation: lej-bear 1.2s ease-in-out infinite; }
  @keyframes lej-glow { 0%,100%{text-shadow:0 0 20px rgba(255,200,100,.5),0 0 40px rgba(255,180,80,.3);} 50%{text-shadow:0 0 30px rgba(255,200,100,.8),0 0 60px rgba(255,180,80,.5);} }
  .lej-glow { animation: lej-glow 2s ease-in-out infinite; }
`;

// ── Editable Text ──────────────────────────────────────────────────────────────
function ET({ fid, data, onChange, style, multiline = false, editMode = false }: {
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
      position: "relative", cursor: "text", border: "2px dashed rgba(212,175,55,0.6)",
      borderRadius: 8, padding: "6px 10px 22px 10px",
      background: "rgba(212,175,55,0.05)", marginBottom: 6,
    }}>
      <span style={{ display: "block", ...style }}>
        {value || <em style={{ opacity: 0.4, fontSize: 13 }}>Click to edit…</em>}
      </span>
      <span style={{ position: "absolute", bottom: 3, right: 8, fontSize: 10, color: "#D4AF37", fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>✏️ edit</span>
    </div>
  );
}

// ── Bear Character ─────────────────────────────────────────────────────────────
type BearVariant = "plain" | "headphones" | "lantern" | "sailor" | "couple";
function SingleBear({ size = 100, variant = "plain" as BearVariant, dancing = false }: { size?: number; variant?: BearVariant; dancing?: boolean }) {
  const s = size / 100;
  return (
    <div className={dancing ? "lej-dance" : ""} style={{ width: size, height: size * 1.25, position: "relative", flexShrink: 0 }}>
      {variant === "sailor" && (
        <div style={{ position:"absolute", top:-8*s, left:"50%", transform:"translateX(-50%)", width:70*s, height:22*s, background:"#fff", borderRadius:"50% 50% 4px 4px", border:"2px solid #1A4F8B", zIndex:5 }}>
          <div style={{ position:"absolute", bottom:4*s, left:0, right:0, height:4*s, background:"#C0392B" }} />
        </div>
      )}
      {variant === "headphones" && (<>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:76*s, height:30*s, border:`${4*s}px solid #2D2D3A`, borderRadius:"50% 50% 0 0", borderBottom:"none", zIndex:5 }} />
        <div style={{ position:"absolute", top:18*s, left:6*s, width:18*s, height:22*s, background:"#FF6B9D", borderRadius:"50%", zIndex:5 }} />
        <div style={{ position:"absolute", top:18*s, right:6*s, width:18*s, height:22*s, background:"#FF6B9D", borderRadius:"50%", zIndex:5 }} />
      </>)}
      <div style={{ position:"absolute", top:4*s, left:8*s, width:26*s, height:26*s, background:"#8B5E3C", borderRadius:"50%" }}>
        <div style={{ position:"absolute", top:6*s, left:6*s, width:14*s, height:14*s, background:"#C4917A", borderRadius:"50%" }} />
      </div>
      <div style={{ position:"absolute", top:4*s, right:8*s, width:26*s, height:26*s, background:"#8B5E3C", borderRadius:"50%" }}>
        <div style={{ position:"absolute", top:6*s, left:6*s, width:14*s, height:14*s, background:"#C4917A", borderRadius:"50%" }} />
      </div>
      <div style={{ position:"absolute", top:10*s, left:"50%", transform:"translateX(-50%)", width:70*s, height:64*s, background:"#8B5E3C", borderRadius:"50%", boxShadow:"inset -4px -6px 0 rgba(0,0,0,0.08)" }}>
        <div style={{ position:"absolute", top:24*s, left:16*s, width:8*s, height:8*s, background:"#1a1a1a", borderRadius:"50%" }}><div style={{ position:"absolute", top:1*s, left:1*s, width:3*s, height:3*s, background:"#fff", borderRadius:"50%" }} /></div>
        <div style={{ position:"absolute", top:24*s, right:16*s, width:8*s, height:8*s, background:"#1a1a1a", borderRadius:"50%" }}><div style={{ position:"absolute", top:1*s, left:1*s, width:3*s, height:3*s, background:"#fff", borderRadius:"50%" }} /></div>
        <div style={{ position:"absolute", top:36*s, left:8*s, width:12*s, height:8*s, background:"rgba(255,182,193,0.6)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", top:36*s, right:8*s, width:12*s, height:8*s, background:"rgba(255,182,193,0.6)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", top:32*s, left:"50%", transform:"translateX(-50%)", width:28*s, height:22*s, background:"#C4917A", borderRadius:"50%" }}>
          <div style={{ position:"absolute", top:4*s, left:"50%", transform:"translateX(-50%)", width:6*s, height:4*s, background:"#1a1a1a", borderRadius:"50%" }} />
          <svg style={{ position:"absolute", top:10*s, left:"50%", transform:"translateX(-50%)" }} width={16*s} height={8*s} viewBox="0 0 16 8">
            <path d="M2 1 Q8 7 14 1" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div style={{ position:"absolute", top:62*s, left:"50%", transform:"translateX(-50%)", width:60*s, height:56*s, background:"#8B5E3C", borderRadius:"40% 40% 45% 45%" }}>
        <div style={{ position:"absolute", top:8*s, left:"50%", transform:"translateX(-50%)", width:38*s, height:32*s, background:"#C4917A", borderRadius:"50%" }} />
      </div>
      {variant === "sailor" && <div style={{ position:"absolute", top:60*s, left:"50%", transform:"translateX(-50%)", width:50*s, height:8*s, background:"#2563eb", borderRadius:4, zIndex:6 }} />}
      {variant === "lantern" && (
        <div style={{ position:"absolute", top:70*s, right:-4*s, width:16*s, height:22*s, background:"#FF8C00", borderRadius:"40% 40% 50% 50%", boxShadow:"0 0 16px #FFB347,0 0 30px rgba(255,179,71,0.7)", zIndex:4 }}>
          <div style={{ position:"absolute", top:-4*s, left:"50%", transform:"translateX(-50%)", width:2*s, height:8*s, background:"#5b3a1f" }} />
        </div>
      )}
      {variant === "headphones" && <div style={{ position:"absolute", top:72*s, right:-8*s, fontSize:18*s, color:"#FF6B9D", filter:"drop-shadow(0 0 6px rgba(255,107,157,0.7))" }}>♡</div>}
    </div>
  );
}
function BearChar({ size = 100, variant = "plain" as BearVariant, extStyle }: { size?: number; variant?: BearVariant; extStyle?: React.CSSProperties }) {
  if (variant === "couple") return (
    <div style={{ display:"flex", alignItems:"flex-end", ...extStyle }}>
      <div style={{ marginRight: -size * 0.15 }}><SingleBear size={size} variant="lantern" /></div>
      <SingleBear size={size} variant="lantern" />
    </div>
  );
  return <div style={extStyle}><SingleBear size={size} variant={variant} /></div>;
}

// ── SlideShell ─────────────────────────────────────────────────────────────────
function SlideShell({ children, onBack, onNext, backLabel = "← Back", nextLabel = "Next →", showNext = true, background }: {
  children: React.ReactNode; onBack?: () => void; onNext?: () => void;
  backLabel?: string; nextLabel?: string; showNext?: boolean; background?: string;
}) {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 15 }}
      style={{ position:"relative", minHeight:"100vh", width:"100%", overflow:"hidden", ...(background ? { background } : {}) }}
    >
      {children}
      <div style={{ position:"absolute", bottom:24, left:0, right:0, zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"space-between", padding:"0 20px", pointerEvents:"none" }}>
        <div style={{ pointerEvents:"auto" }}>
          {onBack && <button onClick={onBack} style={{ borderRadius:9999, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.1)", padding:"10px 20px", fontSize:14, fontWeight:500, color:"rgba(255,255,255,0.9)", backdropFilter:"blur(8px)", cursor:"pointer" }}>{backLabel}</button>}
        </div>
        <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", pointerEvents:"none" }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontFamily:"'Sacramento',cursive" }}>made with love ♡</span>
        </div>
        <div style={{ pointerEvents:"auto" }}>
          {onNext && showNext && <button onClick={onNext} style={{ borderRadius:9999, background:"linear-gradient(to right,#D4AF37,#FFB347)", padding:"10px 24px", fontSize:14, fontWeight:600, color:"#3D0C1A", boxShadow:"0 8px 30px rgba(212,175,55,0.4)", cursor:"pointer", border:"none" }}>{nextLabel}</button>}
        </div>
      </div>
    </motion.div>
  );
}

// ── BULB COLORS ────────────────────────────────────────────────────────────────
const BULB_COLORS = ["#FF6B6B","#FFD700","#FF69B4","#00CED1","#FF8C00","#9B59B6"];

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 1: DARK ROOM
// ─────────────────────────────────────────────────────────────────────────────
function LightString({ y, sag, count }: { y:number; sag:number; count:number }) {
  const bulbs = useMemo(() => Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    const x = 2 * (1 - t) * t * 50 + t * t * 100;
    const yPos = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + sag) + t * t * y;
    return { x, y: yPos, color: BULB_COLORS[i % BULB_COLORS.length] };
  }), [count, y, sag]);
  return (<>
    <svg style={{ position:"absolute", top:0, left:0, width:"100%", height:200, overflow:"visible" }} preserveAspectRatio="none" viewBox="0 0 100 200">
      <path d={`M 0 ${y} Q 50 ${y + sag} 100 ${y}`} stroke="#2a2a2a" strokeWidth="0.3" fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
    {bulbs.map((b, i) => (
      <motion.span key={i} initial={{ opacity:0, scale:0 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.4+i*0.04, type:"spring", stiffness:200 }}
        className="lej-bulb lej-bulb-flicker" style={{ position:"absolute", left:`${b.x}%`, top:b.y, color:b.color, background:b.color, transform:"translate(-50%,-50%)", animationDelay:`${i*0.05}s` }} />
    ))}
  </>);
}

function Slide1DarkRoom({ d, onNext, em, oc, ap }: { d:Record<string,string>; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void; ap?:boolean }) {
  const [lightsOn, setLightsOn] = useState(em || ap || false);
  useEffect(() => { if (em || ap) setLightsOn(true); }, [em, ap]);

  const bearSpring = useSpring({
    from: { scale: 0 },
    to: { scale: lightsOn ? 1 : 0 },
    config: { tension:180, friction:12 },
    delay: 800,
  });

  return (
    <SlideShell onNext={lightsOn || em ? onNext : undefined} showNext={lightsOn || em} background={lightsOn ? "#1A0A1A" : "#080408"}>
      <div style={{ position:"relative", minHeight:"100vh", transition:"background 700ms" }}>
        {/* Room silhouette */}
        <div style={{ pointerEvents:"none", position:"absolute", inset:0 }}>
          <div style={{ position:"absolute", top:"18%", left:"12%", width:220, height:280, border:`2px solid ${lightsOn?"rgba(255,220,180,0.25)":"rgba(255,255,255,0.05)"}`, borderRadius:8, transition:"all 800ms" }}>
            <div style={{ position:"absolute", left:"50%", top:0, height:"100%", width:1, background:lightsOn?"rgba(255,220,180,0.18)":"rgba(255,255,255,0.04)" }} />
            <div style={{ position:"absolute", top:"50%", height:1, width:"100%", background:lightsOn?"rgba(255,220,180,0.18)":"rgba(255,255,255,0.04)" }} />
            {lightsOn && <div style={{ position:"absolute", right:24, top:24, height:64, width:64, borderRadius:"50%", background:"radial-gradient(circle,#fef3c7,#fcd34d)", boxShadow:"0 0 40px rgba(252,211,77,0.5)" }} />}
          </div>
          <div style={{ position:"absolute", bottom:"30%", right:"14%", width:220, height:4, background:lightsOn?"rgba(180,120,80,0.5)":"rgba(255,255,255,0.04)", transition:"all 800ms" }} />
          <div style={{ position:"absolute", top:"15%", left:"8%", width:12, height:320, background:lightsOn?"rgba(150,40,60,0.6)":"rgba(255,255,255,0.03)", borderRadius:2, transition:"all 800ms" }} />
          <div style={{ position:"absolute", top:"15%", left:"calc(12% + 220px - 4px)", width:12, height:320, background:lightsOn?"rgba(150,40,60,0.6)":"rgba(255,255,255,0.03)", borderRadius:2, transition:"all 800ms" }} />
          <div style={{ position:"absolute", bottom:"8%", left:"50%", transform:"translateX(-50%)", width:380, height:60, borderRadius:"50%", background:lightsOn?"radial-gradient(ellipse,rgba(180,40,60,0.4),rgba(120,30,50,0.2))":"rgba(255,255,255,0.02)", transition:"all 800ms" }} />
        </div>

        {/* Diwali light strings */}
        {lightsOn && (<>
          <LightString y={50} sag={45} count={14} />
          <LightString y={70} sag={55} count={13} />
          <LightString y={90} sag={50} count={12} />
          <LightString y={110} sag={60} count={14} />
          <LightString y={130} sag={45} count={13} />
        </>)}

        {/* Bear */}
        <animated.div style={{ position:"absolute", bottom:"18%", right:"18%", transform:bearSpring.scale.to(sc=>`scale(${sc})`), opacity:bearSpring.scale }}>
          <BearChar size={130} variant="lantern" />
        </animated.div>

        {/* Light switch */}
        {!lightsOn && (
          <button onClick={() => setLightsOn(true)} style={{ position:"absolute", bottom:80, right:40, width:60, height:90, background:"#f4f1e8", borderRadius:4, border:"1px solid rgba(255,230,150,0.3)", boxShadow:"0 0 12px rgba(255,230,150,0.3),0 0 30px rgba(255,200,100,0.15)", cursor:"pointer" }}>
            <span style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", top:18, width:24, height:40, background:"linear-gradient(180deg,#d4cfbf,#f4f1e8)", borderRadius:4, boxShadow:"inset 0 -4px 6px rgba(0,0,0,0.15)", display:"block" }} />
            <span style={{ position:"absolute", left:"50%", top:-32, transform:"translateX(-50%)", whiteSpace:"nowrap", fontSize:14, fontFamily:"'Sacramento',cursive", color:"rgba(255,215,150,0.55)" }}>Turn me on ✦</span>
          </button>
        )}

        {/* Title text */}
        <AnimatePresence>
          {lightsOn && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.4, duration:0.8 }} style={{ position:"absolute", left:0, right:0, top:"42%", textAlign:"center", padding:"0 24px" }}>
              <ET fid="s1_light_text" data={d} onChange={oc} editMode={em} style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1.4rem,3vw,2rem)", color:"#fce7c8" }} />
            </motion.div>
          )}
        </AnimatePresence>
        {!lightsOn && (
          <div style={{ position:"absolute", left:0, right:0, top:"40%", textAlign:"center", color:"rgba(255,255,255,0.2)", fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.2rem" }}>
            ... it&apos;s dark in here ...
          </div>
        )}
      </div>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 2: PHOTOS
// ─────────────────────────────────────────────────────────────────────────────
interface PhotoData { id:string; emoji:string; bg:string; rotate:number; pinColor:string; top:string; left:string; fidCaption:string; }
const PHOTOS_DEF: PhotoData[] = [
  { id:"p1", emoji:"🌸", bg:"linear-gradient(135deg,#fbcfe8,#f9a8d4)", rotate:-6, pinColor:"#dc2626", top:"8%", left:"6%", fidCaption:"s2_p1_caption" },
  { id:"p2", emoji:"😄", bg:"linear-gradient(135deg,#fde68a,#fbbf24)", rotate:5, pinColor:"#16a34a", top:"10%", left:"38%", fidCaption:"s2_p2_caption" },
  { id:"p3", emoji:"🌅", bg:"linear-gradient(135deg,#fdba74,#f97316)", rotate:-4, pinColor:"#2563eb", top:"6%", left:"70%", fidCaption:"s2_p3_caption" },
  { id:"p4", emoji:"💑", bg:"linear-gradient(135deg,#a78bfa,#7c3aed)", rotate:7, pinColor:"#fbbf24", top:"48%", left:"12%", fidCaption:"s2_p4_caption" },
  { id:"p5", emoji:"🌻", bg:"linear-gradient(135deg,#fcd34d,#fbbf24)", rotate:-5, pinColor:"#dc2626", top:"50%", left:"42%", fidCaption:"s2_p5_caption" },
  { id:"p6", emoji:"💕", bg:"linear-gradient(135deg,#fda4af,#f43f5e)", rotate:4, pinColor:"#7c3aed", top:"46%", left:"72%", fidCaption:"s2_p6_caption" },
];

function Polaroid({ photo, caption, onClick }: { photo:PhotoData; caption:string; onClick:()=>void }) {
  return (
    <motion.div layoutId={`lej-photo-${photo.id}`} onClick={onClick}
      whileHover={{ y:-10, rotate:0, scale:1.05, zIndex:20 }}
      initial={{ rotate:photo.rotate }} animate={{ rotate:photo.rotate }}
      transition={{ type:"spring", stiffness:200, damping:18 }}
      style={{ position:"absolute", top:photo.top, left:photo.left, width:220, background:"#fefefe", padding:"12px 12px 28px", boxShadow:"0 12px 30px rgba(0,0,0,0.35)", borderRadius:4, cursor:"pointer" }}
    >
      <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", top:-8, width:16, height:16, borderRadius:"50%", background:photo.pinColor, boxShadow:`0 2px 4px rgba(0,0,0,0.3),inset -2px -2px 3px rgba(0,0,0,0.2)` }} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", fontSize:48, background:photo.bg, height:200, borderRadius:2 }}>{photo.emoji}</div>
      <div style={{ marginTop:12, textAlign:"center", fontFamily:"'Sacramento',cursive", color:"#3a2418", fontSize:"1.15rem", lineHeight:1.1 }}>{caption}</div>
    </motion.div>
  );
}

function Slide2Photos({ d, onBack, onNext, em, oc }: { d:Record<string,string>; onBack:()=>void; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void }) {
  const [expanded, setExpanded] = useState<PhotoData | null>(null);
  return (
    <SlideShell onBack={onBack} onNext={onNext} background="radial-gradient(ellipse at center,#a87a3d 0%,#6b4a1f 70%,#3d2810 100%)">
      <div style={{ position:"absolute", inset:0, opacity:0.3, mixBlendMode:"overlay", pointerEvents:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")` }} />
      {/* Fairy lights */}
      <div style={{ position:"absolute", left:0, right:0, top:0, pointerEvents:"none" }}>
        <svg width="100%" height="80" viewBox="0 0 100 80" preserveAspectRatio="none">
          <path d="M 0 10 Q 50 50 100 10" stroke="#2a1a0a" strokeWidth="0.3" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
        {Array.from({ length:16 }).map((_, i) => {
          const t = (i+0.5)/16; const x = 2*(1-t)*t*50+t*t*100; const y = 2*(1-t)*t*50+10;
          return <span key={i} className="lej-bulb lej-bulb-flicker" style={{ position:"absolute", left:`${x}%`, top:y, color:"#fff5d0", background:"#fff5d0", transform:"translate(-50%,-50%)", animationDelay:`${i*0.07}s` }} />;
        })}
      </div>

      <div style={{ position:"relative", paddingTop:80, paddingBottom:128 }}>
        <h2 style={{ textAlign:"center", marginBottom:32, fontFamily:"'Sacramento',cursive", color:"#fdf6e3", fontSize:"clamp(2rem,5vw,3.2rem)", textShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>
          {d.s2_title || "Our Moments Together 📸"}
        </h2>
        <div style={{ position:"relative", margin:"0 auto", maxWidth:1200, height:720 }}>
          {PHOTOS_DEF.map(p => (
            <Polaroid key={p.id} photo={p} caption={d[p.fidCaption] || ""} onClick={() => setExpanded(p)} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setExpanded(null)}
            style={{ position:"fixed", inset:0, zIndex:60, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.8)", backdropFilter:"blur(4px)", padding:24 }}
          >
            <motion.div layoutId={`lej-photo-${expanded.id}`} style={{ position:"relative", width:"min(420px,90vw)", background:"#fefefe", padding:"20px 20px 48px", borderRadius:6, boxShadow:"0 30px 80px rgba(0,0,0,0.5)" }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", fontSize:90, background:expanded.bg, height:360, borderRadius:2 }}>{expanded.emoji}</div>
              <div style={{ marginTop:20, textAlign:"center", fontFamily:"'Sacramento',cursive", color:"#3a2418", fontSize:"1.8rem" }}>{d[expanded.fidCaption] || ""}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 3: MUSIC
// ─────────────────────────────────────────────────────────────────────────────
function Waveform() {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:40 }}>
      {Array.from({ length:22 }).map((_, i) => (
        <motion.span key={i} style={{ width:4, borderRadius:4, background:"#FF69B4", display:"block" }}
          animate={{ height:[8, 24+Math.random()*18, 12, 32, 8] }}
          transition={{ duration:0.8+(i%5)*0.1, repeat:Infinity, delay:i*0.04 }} />
      ))}
    </div>
  );
}

function CassetteSVG({ spinning }: { spinning: boolean }) {
  return (
    <motion.div
      animate={spinning ? { rotate:360, scale:[1,1.15,1] } : { y:[0,-8,0] }}
      transition={spinning ? { duration:0.6 } : { duration:3, repeat:Infinity, ease:"easeInOut" }}
      style={{ width:220, height:140, background:"linear-gradient(135deg,#1A1A2E,#2D2D4A)", borderRadius:14, boxShadow:"0 20px 60px rgba(255,100,150,0.25),inset 0 2px 4px rgba(255,255,255,0.1)", position:"relative", flexShrink:0 }}
    >
      <div style={{ position:"absolute", left:16, right:16, top:12, height:40, borderRadius:4, background:"linear-gradient(180deg,#fdf6e3,#e8dcc0)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontFamily:"'Sacramento',cursive", color:"#7a4a2a", fontSize:14 }}>Songs For You ♡</span>
      </div>
      <div style={{ position:"absolute", left:28, bottom:24, width:64, height:64, borderRadius:"50%", border:"4px solid #0a0a14", background:"#1a1a2e", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <motion.div animate={{ rotate:360 }} transition={{ duration:4, repeat:Infinity, ease:"linear" }} style={{ width:12, height:12, borderRadius:"50%", background:"#FF69B4" }} />
      </div>
      <div style={{ position:"absolute", right:28, bottom:24, width:64, height:64, borderRadius:"50%", border:"4px solid #0a0a14", background:"#1a1a2e", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <motion.div animate={{ rotate:360 }} transition={{ duration:4, repeat:Infinity, ease:"linear" }} style={{ width:12, height:12, borderRadius:"50%", background:"#FF69B4" }} />
      </div>
    </motion.div>
  );
}

function Slide3Music({ d, onBack, onNext, em, oc }: { d:Record<string,string>; onBack:()=>void; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void }) {
  const [playing, setPlaying] = useState(false);
  const [songIdx, setSongIdx] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pickingFor, setPickingFor] = useState<number|null>(null);
  const audioRef = useRef<HTMLAudioElement|null>(null);
  const songs = [
    { nFid:"s3_song1_title", aFid:"s3_song1_artist", uFid:"s3_song1_url" },
    { nFid:"s3_song2_title", aFid:"s3_song2_artist", uFid:"s3_song2_url" },
    { nFid:"s3_song3_title", aFid:"s3_song3_artist", uFid:"s3_song3_url" },
  ];

  const startPlay = () => {
    setSpinning(true);
    setTimeout(() => { setSpinning(false); setPlaying(true); }, 600);
  };

  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const url = d[songs[songIdx].uFid];
    if (url && playing && !em) {
      const a = new Audio(url);
      a.play().catch(()=>{});
      audioRef.current = a;
    }
    return () => { audioRef.current?.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songIdx, playing, em]);

  return (
    <SlideShell onBack={onBack} onNext={playing || em ? onNext : undefined} showNext={playing || em} background="linear-gradient(180deg,#0D1B2A 0%,#1B2A3B 100%)">
      {/* Stars */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {Array.from({ length:60 }).map((_, i) => (
          <span key={i} className="lej-star" style={{ position:"absolute", top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, width:Math.random()*2+1, height:Math.random()*2+1, borderRadius:"50%", background:"#fff", opacity:Math.random()*0.7+0.2, animationDelay:`${Math.random()*3}s`, display:"block" }} />
        ))}
      </div>

      <div style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 24px 128px" }}>
        {!playing && !em && (<>
          <CassetteSVG spinning={spinning} />
          <motion.p animate={{ scale:[1,1.05,1], opacity:[0.7,1,0.7] }} transition={{ duration:2, repeat:Infinity }}
            style={{ marginTop:40, textAlign:"center", fontFamily:"'Cormorant Garamond',serif", color:"#fdf6e3", fontSize:"1.4rem", fontStyle:"italic" }}>
            Tap to play your song... 🎵
          </motion.p>
          <button onClick={startPlay} style={{ marginTop:32, borderRadius:9999, background:"linear-gradient(to right,#FF69B4,#C0395A)", padding:"12px 32px", color:"#fff", fontWeight:600, boxShadow:"0 10px 30px rgba(255,105,180,0.4)", border:"none", cursor:"pointer", fontSize:15 }}>▶ Press Play</button>
        </>)}

        {em && (
          <div style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:20, padding:24, width:"100%", maxWidth:420, marginBottom:24 }}>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", color:"#FFD700", fontSize:18, marginBottom:16, textAlign:"center" }}>🎵 Edit Songs</p>
            {songs.map((s, i) => (
              <div key={i} style={{ marginBottom:16, background:"rgba(255,105,180,0.1)", borderRadius:12, padding:12 }}>
                <ET fid={s.nFid} data={d} onChange={oc} editMode={em} style={{ fontWeight:700, fontSize:14, color:"#fdf6e3", marginBottom:4 }} />
                <ET fid={s.aFid} data={d} onChange={oc} editMode={em} style={{ fontSize:12, color:"#FF69B4", marginBottom:8 }} />
                <button onClick={() => setPickingFor(i)} style={{ background:"none", border:"1px dashed #FF69B4", borderRadius:6, padding:"4px 10px", fontSize:11, color:"#FF69B4", cursor:"pointer", fontWeight:600 }}>
                  {d[s.uFid] ? "🎵 Change Audio" : "🎵 Add Audio"}
                </button>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {(playing || em) && (
            <motion.div initial={{ y:200, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ type:"spring", stiffness:80, damping:14 }}
              style={{ background:"rgba(255,255,255,0.08)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:20, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", width:"100%", maxWidth:440, padding:24 }}
            >
              <CassetteSVG spinning={false} />
              <div style={{ marginTop:24, textAlign:"center" }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", color:"#fdf6e3" }}>{d[songs[songIdx].nFid] || "Song Title"}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", color:"#FF69B4", marginTop:4 }}>{d[songs[songIdx].aFid] || "Artist"}</div>
              </div>
              <div style={{ marginTop:20, display:"flex", justifyContent:"center" }}><Waveform /></div>
              <div style={{ marginTop:16, display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
                {songs.map((s, i) => (
                  <button key={i} onClick={() => setSongIdx(i)}
                    style={{ borderRadius:9999, padding:"6px 12px", fontSize:12, border:"none", cursor:"pointer",
                      background:i===songIdx?"#FF69B4":"rgba(255,255,255,0.1)", color:i===songIdx?"#fff":"rgba(255,255,255,0.7)" }}>
                    {d[s.nFid] || `Song ${i+1}`}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {pickingFor !== null && (
        <SongLibraryPopup onClose={() => setPickingFor(null)} onSelect={song => {
          if (oc && pickingFor !== null) {
            oc(songs[pickingFor].nFid, song.name);
            oc(songs[pickingFor].aFid, song.description || "Unknown Artist");
            oc(songs[pickingFor].uFid, song.url || "");
          }
          setPickingFor(null);
        }} />
      )}
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 4: SCRATCH
// ─────────────────────────────────────────────────────────────────────────────
function Slide4Scratch({ d, onBack, onNext, em, oc, ap }: { d:Record<string,string>; onBack:()=>void; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void; ap?:boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(em || ap || false);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (em || ap) { setRevealed(true); return; }
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = 380 * dpr; c.height = 280 * dpr;
    ctx.scale(dpr, dpr);
    const grad = ctx.createLinearGradient(0,0,380,280);
    grad.addColorStop(0,"#C0C0C0"); grad.addColorStop(0.5,"#E8E8E8"); grad.addColorStop(1,"#A8A8A8");
    ctx.fillStyle = grad; ctx.fillRect(0,0,380,280);
    for (let i=0;i<50;i++) { ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.3})`; ctx.beginPath(); ctx.arc(Math.random()*380,Math.random()*280,Math.random()*2,0,Math.PI*2); ctx.fill(); }
    ctx.fillStyle="#888"; ctx.font='bold 18px "Nunito",sans-serif'; ctx.textAlign="center";
    ctx.fillText("✦ SCRATCH HERE ✦",190,140);
    ctx.font='12px "Nunito",sans-serif'; ctx.fillStyle="#999";
    ctx.fillText("a surprise awaits...",190,165);
  }, [em, ap]);

  const scratchAt = (x:number,y:number) => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.globalCompositeOperation="destination-out"; ctx.beginPath(); ctx.arc(x,y,26,0,Math.PI*2); ctx.fill();
  };
  const checkPercent = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const data = ctx.getImageData(0,0,c.width,c.height).data;
    let cleared=0; for (let i=3;i<data.length;i+=80) if(data[i]===0) cleared++;
    if (cleared/(data.length/80)>0.55 && !revealed) {
      setRevealed(true);
      confetti({ particleCount:120, spread:80, origin:{y:0.6}, colors:["#FFD700","#FF69B4","#C0395A","#fdf6e3"] });
    }
  };

  return (
    <SlideShell onBack={onBack} onNext={revealed ? onNext : undefined} showNext={revealed} background="linear-gradient(180deg,#3D0C1A 0%,#6B1628 100%)">
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {Array.from({ length:30 }).map((_,i) => (
          <motion.span key={i} style={{ position:"absolute", left:`${Math.random()*100}%`, bottom:-20, width:3, height:3, borderRadius:"50%", background:"rgba(255,215,100,0.6)", boxShadow:"0 0 8px rgba(255,215,100,0.8)", display:"block" }}
            animate={{ y:[0,-800], opacity:[0,1,0] }}
            transition={{ duration:8+Math.random()*6, repeat:Infinity, delay:Math.random()*6, ease:"linear" }} />
        ))}
      </div>
      <div style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"64px 24px 128px" }}>
        <h2 style={{ textAlign:"center", marginBottom:8, fontFamily:"'Cormorant Garamond',serif", color:"#FFD700", fontSize:"clamp(1.6rem,3.5vw,2.4rem)" }}>Scratch to reveal your surprise... ✨</h2>
        <p style={{ fontSize:14, color:"rgba(253,246,227,0.7)", marginBottom:32 }}>Use your finger or mouse to scratch</p>
        <div style={{ position:"relative", width:380, maxWidth:"92vw" }}>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center", background:"linear-gradient(135deg,#fdf6e3,#f5e6c8)", borderRadius:16, border:"3px solid #D4AF37", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize:24 }}>♡</div>
            <div style={{ marginTop:8, fontFamily:"'Sacramento',cursive", color:"#C0395A", fontSize:"1.9rem", lineHeight:1.1 }}>
              <ET fid="s4_reveal_title" data={d} onChange={oc} editMode={em} style={{ fontFamily:"'Sacramento',cursive", color:"#C0395A", fontSize:"1.9rem" }} />
            </div>
            <div style={{ marginTop:12, fontFamily:"'Lora',serif", color:"#3a2418", fontSize:"0.95rem", lineHeight:1.5 }}>
              <ET fid="s4_reveal_body" data={d} onChange={oc} editMode={em} multiline style={{ fontFamily:"'Lora',serif", color:"#3a2418", fontSize:"0.95rem" }} />
            </div>
            <div style={{ marginTop:12, color:"#D4AF37", letterSpacing:"0.2em", fontSize:14 }}>✦ ✦ ✦</div>
          </div>
          <canvas ref={canvasRef}
            onPointerDown={e => { isDrawing.current=true; (e.target as HTMLElement).setPointerCapture(e.pointerId); const r=canvasRef.current!.getBoundingClientRect(); scratchAt(((e.clientX-r.left)/r.width)*380,((e.clientY-r.top)/r.height)*280); }}
            onPointerMove={e => { if(!isDrawing.current)return; const r=canvasRef.current!.getBoundingClientRect(); scratchAt(((e.clientX-r.left)/r.width)*380,((e.clientY-r.top)/r.height)*280); checkPercent(); }}
            onPointerUp={() => isDrawing.current=false}
            style={{ width:"100%", height:280, borderRadius:16, cursor:"grab", touchAction:"none", opacity:revealed?0:1, transition:"opacity 600ms", position:"relative", zIndex:2, display:"block" }} />
        </div>
      </div>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 5: CONSTELLATION
// ─────────────────────────────────────────────────────────────────────────────
const STARS = [
  {x:150,y:220},{x:200,y:170},{x:260,y:195},{x:320,y:170},{x:370,y:220},
  {x:410,y:280},{x:380,y:360},{x:320,y:430},{x:250,y:360},{x:200,y:280},
];

function Slide5Constellation({ d, onBack, onNext, em, oc, ap }: { d:Record<string,string>; onBack:()=>void; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void; ap?:boolean }) {
  const [connected, setConnected] = useState<number[]>(em||ap ? STARS.map((_,i)=>i) : []);
  const [shake, setShake] = useState<number|null>(null);
  const done = connected.length === STARS.length;

  const handleClick = (i:number) => {
    if (connected.includes(i)) return;
    if (i === connected.length) {
      const next = [...connected, i];
      setConnected(next);
      if (next.length === STARS.length) setTimeout(() => confetti({ particleCount:200, spread:90, origin:{y:0.4}, colors:["#FFD700","#FF69B4","#fdf6e3"] }), 400);
    } else { setShake(i); setTimeout(()=>setShake(null),400); }
  };

  return (
    <SlideShell onBack={onBack} onNext={done||em ? onNext : undefined} nextLabel="Keep going... →" showNext={done||em} background="#020818">
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {Array.from({ length:120 }).map((_,i) => (
          <span key={i} className="lej-star" style={{ position:"absolute", top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, width:Math.random()*2.5+0.5, height:Math.random()*2.5+0.5, borderRadius:"50%", background:"#fff", opacity:Math.random()*0.8+0.1, animationDelay:`${Math.random()*3}s`, display:"block" }} />
        ))}
      </div>
      <div style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start", padding:"56px 24px 128px" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Cormorant Garamond',serif", color:"#FFD700", fontSize:"clamp(1.6rem,3.5vw,2.4rem)" }}>
          {d.s5_title || "Connect the stars to reveal what I see ✨"}
        </h2>
        <p style={{ marginTop:8, fontSize:14, color:"rgba(253,246,227,0.6)" }}>Click each star in order — 1 through 10</p>
        <div style={{ position:"relative", marginTop:32, width:600, maxWidth:"95vw", aspectRatio:"600/500" }}>
          <svg viewBox="0 0 600 500" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
            {connected.slice(0,-1).map((idx,k) => {
              const a=STARS[idx]; const b=STARS[connected[k+1]];
              return <motion.line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#FFD700" strokeWidth="2" strokeLinecap="round" initial={{ pathLength:0, opacity:0 }} animate={{ pathLength:1, opacity:1 }} transition={{ duration:0.4 }} style={{ filter:"drop-shadow(0 0 6px #FFD700)" }} />;
            })}
            {done && <motion.path initial={{ opacity:0 }} animate={{ opacity:[0,1,0.6,1] }} transition={{ duration:2, repeat:Infinity }}
              d={`M ${STARS[0].x} ${STARS[0].y} ${STARS.slice(1).map(s=>`L ${s.x} ${s.y}`).join(" ")} Z`}
              fill="rgba(255,215,0,0.1)" stroke="#FFD700" strokeWidth="1" />}
          </svg>
          {STARS.map((s,i) => {
            const lit = connected.includes(i);
            return (
              <motion.button key={i} onClick={() => handleClick(i)}
                animate={shake===i ? {x:[-6,6,-6,6,0]} : {scale:lit?[1,1.15,1]:[1,1.08,1]}}
                transition={shake===i ? {duration:0.4} : {duration:2,repeat:Infinity}}
                style={{ position:"absolute", left:`${(s.x/600)*100}%`, top:`${(s.y/500)*100}%`, transform:"translate(-50%,-50%)", width:36, height:36, cursor:"pointer", background:"none", border:"none" }}
              >
                <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, color:lit?"#FFD700":"#FFE89A", filter:`drop-shadow(0 0 ${lit?14:6}px #FFD700)` }}>✦</span>
                <span style={{ position:"absolute", top:-16, left:"50%", transform:"translateX(-50%)", fontSize:10, fontWeight:700, color:lit?"#FFD700":"rgba(255,255,255,0.7)" }}>{i+1}</span>
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {done && (
            <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
              style={{ marginTop:32, textAlign:"center", maxWidth:600, padding:"0 24px", fontFamily:"'Sacramento',cursive", color:"#FFD700", fontSize:"clamp(1.4rem,3vw,2rem)" }}>
              {d.s5_reveal_text || "That's how I see you — a constellation I'll always find ♡"}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 6: WHEEL
// ─────────────────────────────────────────────────────────────────────────────
const WHEEL_SEGS_DEF = [
  { color:"#C0395A", emoji:"💌" }, { color:"#E8A0B0", emoji:"🌹" },
  { color:"#8B1A3A", emoji:"💕" }, { color:"#F2C4CE", emoji:"✨" },
  { color:"#D4AF37", emoji:"🎶" }, { color:"#FAEBD7", emoji:"🦋" },
  { color:"#9B1A40", emoji:"🌙" }, { color:"#FFB6C1", emoji:"💫" },
];

function Slide6Wheel({ d, onBack, onNext, em, oc, ap }: { d:Record<string,string>; onBack:()=>void; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void; ap?:boolean }) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<number|null>(null);
  const [spinCount, setSpinCount] = useState(ap ? 3 : 0);
  const [spinning, setSpinning] = useState(false);
  const rotation = useRef(0);
  const segAngle = 360 / 8;

  const spin = () => {
    if (spinning || !wheelRef.current) return;
    setResult(null); setSpinning(true);
    const turns = 720 + Math.random()*360 + Math.floor(Math.random()*360);
    rotation.current += turns;
    gsap.to(wheelRef.current, {
      rotation: rotation.current, duration:3.6, ease:"power4.out",
      onComplete: () => {
        const final = ((rotation.current%360)+360)%360;
        const landing = (360-final+90+segAngle/2)%360;
        const idx = Math.floor(landing/segAngle)%8;
        setResult(idx); setSpinCount(c=>c+1); setSpinning(false);
      }
    });
  };

  const segs = WHEEL_SEGS_DEF.map((s,i) => ({ ...s, text: d[`s6_seg${i+1}`] || "" }));
  const radius=160; const cx=170; const cy=170;

  return (
    <SlideShell onBack={onBack} onNext={spinCount>=3||em ? onNext : undefined} showNext={spinCount>=3||em} background="linear-gradient(135deg,#2D0A15 0%,#8B1A3A 100%)">
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {[{l:"10%",t:"20%",sz:200,c:"rgba(255,150,180,0.15)"},{l:"80%",t:"30%",sz:280,c:"rgba(212,175,55,0.12)"},{l:"30%",t:"80%",sz:240,c:"rgba(255,100,140,0.18)"},{l:"70%",t:"75%",sz:180,c:"rgba(255,200,210,0.12)"}].map((b,i) => (
          <div key={i} style={{ position:"absolute", left:b.l, top:b.t, width:b.sz, height:b.sz, borderRadius:"50%", background:`radial-gradient(circle,${b.c},transparent 70%)`, filter:"blur(20px)" }} />
        ))}
      </div>
      <div style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start", padding:"48px 24px 128px" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Cormorant Garamond',serif", color:"#fdf6e3", fontSize:"clamp(1.8rem,4vw,2.6rem)" }}>Spin to discover something beautiful 🌹</h2>

        {em && (
          <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(212,175,55,0.3)", borderRadius:16, padding:16, marginTop:16, width:"100%", maxWidth:400 }}>
            <p style={{ color:"#D4AF37", fontSize:13, marginBottom:12, textAlign:"center" }}>✏️ Edit Wheel Messages</p>
            {segs.map((_,i) => (
              <ET key={i} fid={`s6_seg${i+1}`} data={d} onChange={oc} editMode={em}
                style={{ fontSize:13, color:"#fdf6e3", marginBottom:4 }} />
            ))}
          </div>
        )}

        <div style={{ position:"relative", marginTop:32, width:340, height:340 }}>
          <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", top:-8, zIndex:20, width:0, height:0, borderLeft:"16px solid transparent", borderRight:"16px solid transparent", borderTop:"30px solid #FFD700", filter:"drop-shadow(0 4px 6px rgba(0,0,0,0.5))" }} />
          <div ref={wheelRef} style={{ position:"absolute", inset:0 }}>
            <svg viewBox="0 0 340 340" style={{ width:"100%", height:"100%" }}>
              <circle cx={cx} cy={cy} r={radius+6} fill="#D4AF37" />
              <circle cx={cx} cy={cy} r={radius+2} fill="#1a0a14" />
              {segs.map((seg,i) => {
                const a1=(i*segAngle-90)*(Math.PI/180); const a2=((i+1)*segAngle-90)*(Math.PI/180);
                const x1=cx+radius*Math.cos(a1); const y1=cy+radius*Math.sin(a1);
                const x2=cx+radius*Math.cos(a2); const y2=cy+radius*Math.sin(a2);
                const la=(i*segAngle+segAngle/2-90)*(Math.PI/180);
                const lx=cx+radius*0.65*Math.cos(la); const ly=cy+radius*0.65*Math.sin(la);
                return (<g key={i}>
                  <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`} fill={seg.color} stroke="#D4AF37" strokeWidth="1" />
                  <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="28">{seg.emoji}</text>
                </g>);
              })}
              <circle cx={cx} cy={cy} r={26} fill="#D4AF37" stroke="#1a0a14" strokeWidth="3" />
              <text x={cx} y={cy+2} textAnchor="middle" dominantBaseline="middle" fontSize="22" fill="#1a0a14">♡</text>
            </svg>
          </div>
        </div>

        <button onClick={spin} disabled={spinning}
          style={{ marginTop:24, borderRadius:9999, background:"linear-gradient(to right,#FF69B4,#C0395A)", padding:"12px 32px", color:"#fff", fontWeight:600, boxShadow:"0 10px 30px rgba(255,105,180,0.4)", border:"none", cursor:spinning?"not-allowed":"pointer", opacity:spinning?0.6:1, fontSize:15 }}>
          {spinning ? "Spinning..." : "Spin the wheel! 🌸"}
        </button>

        <AnimatePresence mode="wait">
          {result !== null && (
            <motion.div key={`${result}-${spinCount}`} initial={{ opacity:0, y:30, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-20 }} transition={{ type:"spring", stiffness:120, damping:14 }}
              style={{ marginTop:24, display:"flex", alignItems:"center", gap:12, maxWidth:440 }}
            >
              <BearChar size={50} />
              <div style={{ background:"#fdf6e3", border:"2px solid #D4AF37", borderRadius:20, padding:"16px 24px", textAlign:"center" }}>
                <div style={{ fontSize:24 }}>{segs[result].emoji}</div>
                <div style={{ marginTop:4, fontFamily:"'Sacramento',cursive", color:"#C0395A", fontSize:"1.6rem", lineHeight:1.15 }}>
                  &ldquo;{segs[result].text}&rdquo;
                </div>
              </div>
              <BearChar size={50} />
            </motion.div>
          )}
        </AnimatePresence>
        {spinCount>0 && spinCount<3 && <p style={{ marginTop:12, fontSize:14, color:"rgba(253,246,227,0.7)" }}>Spin {spinCount}/3 — keep going for more ♡</p>}
      </div>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 7: BOTTLE
// ─────────────────────────────────────────────────────────────────────────────
function BottleSVG({ corkOff }: { corkOff: boolean }) {
  return (
    <svg viewBox="0 0 200 360" style={{ width:"100%", height:"100%" }}>
      <defs>
        <linearGradient id="lej-glass" x1="0" x2="1">
          <stop offset="0" stopColor="rgba(120,200,150,0.4)" />
          <stop offset="0.5" stopColor="rgba(180,230,200,0.55)" />
          <stop offset="1" stopColor="rgba(80,150,110,0.4)" />
        </linearGradient>
      </defs>
      {!corkOff && <rect x="86" y="20" width="28" height="26" rx="4" fill="#7a4a2a" />}
      <rect x="80" y="44" width="40" height="50" fill="url(#lej-glass)" stroke="#3a6b4a" strokeWidth="1.5" />
      <path d="M 60 94 Q 30 110 30 160 L 30 320 Q 30 350 60 350 L 140 350 Q 170 350 170 320 L 170 160 Q 170 110 140 94 Z" fill="url(#lej-glass)" stroke="#3a6b4a" strokeWidth="2" />
      <path d="M 50 130 Q 45 200 50 320" stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="76" y="180" width="48" height="140" rx="6" fill="#fdf6e3" opacity="0.9" />
      <line x1="76" y1="200" x2="124" y2="200" stroke="#c4a06a" strokeWidth="1" />
      <line x1="76" y1="240" x2="124" y2="240" stroke="#c4a06a" strokeWidth="1" />
      <line x1="76" y1="280" x2="124" y2="280" stroke="#c4a06a" strokeWidth="1" />
    </svg>
  );
}

function Slide7Bottle({ d, onBack, onNext, em, oc, ap }: { d:Record<string,string>; onBack:()=>void; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void; ap?:boolean }) {
  const [shake, setShake] = useState(em||ap ? 100 : 0);
  const [opened, setOpened] = useState(em||ap||false);
  const lastX = useRef(0);
  const lastDir = useRef(0);

  useEffect(() => { if (em||ap) setOpened(true); }, [em, ap]);

  const doShake = (dx:number) => {
    if (opened) return;
    const dir = Math.sign(dx);
    if (dir!==0 && dir!==lastDir.current) {
      lastDir.current = dir;
      setShake(s => {
        const ns = Math.min(100, s+6);
        if (ns>=100 && !opened) {
          setOpened(true);
          setTimeout(() => confetti({ particleCount:100, spread:70, origin:{y:0.5}, colors:["#FFD700","#fdf6e3","#FFB347"] }), 500);
        }
        return ns;
      });
    }
  };

  const tapShake = () => {
    if (opened) return;
    setShake(s => {
      const ns = Math.min(100,s+12);
      if (ns>=100) { setOpened(true); setTimeout(()=>confetti({ particleCount:100, spread:70, origin:{y:0.5}, colors:["#FFD700","#fdf6e3","#FFB347"] }),500); }
      return ns;
    });
  };

  const wobble = (shake/100)*8;

  return (
    <SlideShell onBack={onBack} onNext={opened||em ? onNext : undefined} showNext={opened||em}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,#1A1A2E 0%,#1A1A2E 50%,#1A6FA8 50%,#0A3D62 100%)" }} />
      <div style={{ position:"absolute", right:"12%", top:"10%", width:80, height:80, borderRadius:"50%", background:"radial-gradient(circle,#fef3c7 30%,#fcd34d 70%)", boxShadow:"0 0 60px rgba(252,211,77,0.4)" }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {Array.from({ length:50 }).map((_,i) => <span key={i} className="lej-star" style={{ position:"absolute", top:`${Math.random()*45}%`, left:`${Math.random()*100}%`, width:Math.random()*2+0.5, height:Math.random()*2+0.5, borderRadius:"50%", background:"#fff", opacity:Math.random()*0.8, animationDelay:`${Math.random()*3}s`, display:"block" }} />)}
      </div>
      <div style={{ position:"absolute", left:"-10%", right:"-10%", bottom:0, top:"50%" }}>
        {[0,1,2].map(i => <div key={i} className="lej-wave" style={{ position:"absolute", left:0, right:0, top:i*30, height:60, background:`rgba(255,255,255,${0.04+i*0.02})`, animationDelay:`${i*0.6}s` }} />)}
      </div>

      <div style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", padding:"56px 24px 128px" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Cormorant Garamond',serif", color:"#fdf6e3", fontSize:"clamp(1.6rem,3.5vw,2.4rem)", fontStyle:"italic" }}>A bottle drifted ashore...</h2>
        <p style={{ marginTop:8, fontSize:14, color:"rgba(253,246,227,0.7)" }}>
          {opened ? "Read the message ♡" : "Drag the bottle or tap rapidly to shake it"}
        </p>

        {/* Bottle */}
        <div style={{ position:"relative", marginTop:48, width:200, height:360, touchAction:"none", cursor:"grab" }}
          onPointerDown={e => { lastX.current=e.clientX; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); tapShake(); }}
          onPointerMove={e => { const dx=e.clientX-lastX.current; lastX.current=e.clientX; doShake(dx); }}
        >
          <AnimatePresence>
            {!opened && (
              <motion.div className="lej-bob" style={{ position:"absolute", inset:0 }}>
                <motion.div animate={{ rotate:[-wobble,wobble,-wobble] }} transition={{ duration:0.18, repeat:Infinity }}>
                  <BottleSVG corkOff={false} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {opened && (
            <>
              <motion.div initial={{ y:0, opacity:1 }} animate={{ y:-200, opacity:0 }} transition={{ duration:0.5 }}
                style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", top:22, width:28, height:22, background:"#7a4a2a", borderRadius:4 }} />
              <div style={{ position:"absolute", inset:0, opacity:0.6 }}><BottleSVG corkOff={true} /></div>
            </>
          )}
        </div>

        {!opened && (
          <div style={{ marginTop:24, width:256, height:8, borderRadius:9999, background:"rgba(255,255,255,0.15)", overflow:"hidden" }}>
            <motion.div animate={{ width:`${shake}%` }} style={{ height:"100%", background:"linear-gradient(90deg,#FF69B4,#FFD700)", borderRadius:9999 }} />
          </div>
        )}

        <AnimatePresence>
          {opened && (
            <motion.div initial={{ scaleY:0, opacity:0, y:-20 }} animate={{ scaleY:1, opacity:1, y:0 }} transition={{ delay:0.6, duration:0.6, type:"spring", stiffness:90, damping:14 }}
              style={{ transformOrigin:"top center", width:340, maxWidth:"92vw", background:"linear-gradient(180deg,#fdf6e3,#f5e6c8)", backgroundImage:`repeating-linear-gradient(180deg,transparent,transparent 28px,rgba(180,140,90,0.25) 28px,rgba(180,140,90,0.25) 29px),linear-gradient(180deg,#fdf6e3,#f5e6c8)`, borderRadius:8, boxShadow:"0 30px 80px rgba(0,0,0,0.5)", padding:"32px 28px", marginTop:-160, position:"relative", zIndex:5 }}
            >
              <h3 style={{ textAlign:"center", fontFamily:"'Sacramento',cursive", color:"#C0395A", fontSize:"1.7rem" }}>A note from across the ocean...</h3>
              <ET fid="s7_letter_body" data={d} onChange={oc} editMode={em} multiline style={{ marginTop:16, textAlign:"center", fontFamily:"'Lora',serif", color:"#3a2418", fontSize:"1rem", fontStyle:"italic", lineHeight:1.7 }} />
              <div style={{ marginTop:12, textAlign:"right" }}>
                <ET fid="s7_sign" data={d} onChange={oc} editMode={em} style={{ fontFamily:"'Sacramento',cursive", color:"#C0395A", fontSize:"1.4rem" }} />
              </div>
              <div style={{ position:"absolute", right:-16, bottom:-16 }}><BearChar size={70} variant="sailor" /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 8: GARDEN
// ─────────────────────────────────────────────────────────────────────────────
const ROSE_COLORS: [string,string][] = [
  ["#8B1A1A","#C0395A"],["#C0395A","#FF69B4"],["#FF1744","#FF69B4"],["#D4145A","#FFB6C1"],
  ["#9B1A40","#E8A0B0"],["#FF4081","#FFC1D1"],["#B71C50","#F472B6"],["#7B1842","#EC4899"],
];

function GardenRose({ colors }: { colors:[string,string] }) {
  return (
    <div style={{ position:"absolute", left:"50%", bottom:58, transform:"translateX(-50%)", width:80, height:130, pointerEvents:"none" }}>
      <motion.div initial={{ height:0 }} animate={{ height:95 }} transition={{ duration:0.4 }} style={{ position:"absolute", left:"50%", bottom:0, transform:"translateX(-50%)", width:4, borderRadius:2, background:"linear-gradient(180deg,#3f7a3a,#2d5a28)" }} />
      <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ duration:0.3, delay:0.4 }} style={{ position:"absolute", left:"50%", bottom:40, width:18, height:10, background:"#3f7a3a", borderRadius:"0 50% 50% 50%", transform:"translateX(-110%) rotate(-30deg)" }} />
      <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ duration:0.3, delay:0.5 }} style={{ position:"absolute", left:"50%", bottom:55, width:18, height:10, background:"#3f7a3a", borderRadius:"50% 0 50% 50%", transform:"translateX(10%) rotate(30deg)" }} />
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ duration:0.5, delay:0.7, type:"spring", stiffness:180 }} style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", top:0, width:50, height:50 }}>
        {[0,45,90,135,180,225,270,315].map((deg,i) => (
          <motion.div key={i} initial={{ scale:0, rotate:deg }} animate={{ scale:1, rotate:deg }} transition={{ duration:0.3, delay:0.85+i*0.05 }}
            style={{ position:"absolute", left:"50%", top:"50%", width:18, height:22, background:`radial-gradient(circle at 60% 40%,${colors[1]},${colors[0]})`, borderRadius:"50% 50% 50% 0", transform:`translate(-50%,-100%) rotate(${deg}deg)` }} />
        ))}
        <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:12, height:12, borderRadius:"50%", background:"#fbbf24" }} />
      </motion.div>
    </div>
  );
}

function GardenPot({ index, bloomed, onClick, reason }: { index:number; bloomed:boolean; onClick:()=>void; reason:string }) {
  const [showCard, setShowCard] = useState(false);
  const handle = () => { if(bloomed) return; onClick(); setShowCard(true); setTimeout(()=>setShowCard(false),3000); };
  return (
    <div style={{ position:"relative", width:90, height:230 }}>
      {bloomed && <GardenRose colors={ROSE_COLORS[index]} />}
      <button onClick={handle} disabled={bloomed} style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:76, height:64, cursor:bloomed?"default":"pointer", background:"none", border:"none" }}>
        <div style={{ position:"absolute", left:0, right:0, bottom:0, height:60, background:"linear-gradient(180deg,#D4845A,#A85A30)", clipPath:"polygon(8% 100%,92% 100%,100% 0,0 0)" }} />
        <div style={{ position:"absolute", left:-4, right:-4, top:0, height:12, background:"linear-gradient(180deg,#E89060,#B86838)", borderRadius:2 }} />
        <div style={{ position:"absolute", left:4, right:4, top:8, height:8, background:"#3a1f10", borderRadius:2 }} />
        <div style={{ position:"absolute", left:"50%", top:28, transform:"translateX(-50%)", fontSize:10, color:"rgba(253,246,227,0.8)" }}>{index+1}</div>
      </button>
      <AnimatePresence>
        {showCard && bloomed && (
          <motion.div initial={{ opacity:0, y:10, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-10 }}
            style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", width:176, padding:"8px 12px", textAlign:"center", borderRadius:20, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", background:"#fdf6e3", border:"2px solid #C0395A", top:-60, zIndex:30 }}
          >
            <div style={{ color:"#f472b6" }}>♡</div>
            <div style={{ fontFamily:"'Sacramento',cursive", color:"#C0395A", fontSize:"1.15rem", lineHeight:1.1 }}>{reason}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Slide8Garden({ d, onBack, onNext, em, oc, ap }: { d:Record<string,string>; onBack:()=>void; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void; ap?:boolean }) {
  const [bloomed, setBloomed] = useState<Set<number>>(em||ap ? new Set([0,1,2,3,4,5,6,7]) : new Set());
  const allBloomed = bloomed.size===8;

  useEffect(() => { if(em||ap) setBloomed(new Set([0,1,2,3,4,5,6,7])); }, [em, ap]);

  const reasons = Array.from({length:8},(_,i)=>d[`s8_reason${i+1}`]||"");

  return (
    <SlideShell onBack={onBack} onNext={allBloomed||em ? onNext : undefined} nextLabel="Final chapter... →" showNext={allBloomed||em} background="linear-gradient(180deg,#1A0A2E 0%,#2D1B4E 40%,#3D5A2A 100%)">
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {Array.from({length:60}).map((_,i) => <span key={i} className="lej-star" style={{ position:"absolute", top:`${Math.random()*50}%`, left:`${Math.random()*100}%`, width:Math.random()*2+0.5, height:Math.random()*2+0.5, borderRadius:"50%", background:"#fff", opacity:Math.random()*0.7, animationDelay:`${Math.random()*3}s`, display:"block" }} />)}
      </div>
      {allBloomed && Array.from({length:14}).map((_,i) => (
        <motion.div key={i} style={{ position:"absolute", left:`${10+Math.random()*80}%`, bottom:`${15+Math.random()*30}%`, width:6, height:6, borderRadius:"50%", background:"#fef9c3", boxShadow:"0 0 12px #fbbf24,0 0 24px rgba(251,191,36,0.6)" }}
          animate={{ y:[0,-40,0], x:[0,30,0], opacity:[0.3,1,0.3] }}
          transition={{ duration:4+Math.random()*3, repeat:Infinity, delay:Math.random()*2 }} />
      ))}

      <div style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", padding:"56px 24px 160px" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Cormorant Garamond',serif", color:"#FFD700", fontSize:"clamp(1.8rem,4vw,2.6rem)" }}>
          {d.s8_title || "Grow our garden of love 🌹"}
        </h2>
        <p style={{ marginTop:8, fontSize:14, color:"rgba(253,246,227,0.75)" }}>Click each pot to plant a rose</p>

        {em && (
          <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(212,175,55,0.3)", borderRadius:16, padding:16, marginTop:16, width:"100%", maxWidth:400 }}>
            <p style={{ color:"#D4AF37", fontSize:13, marginBottom:12, textAlign:"center" }}>✏️ Edit Reasons</p>
            {Array.from({length:8},(_,i) => (
              <ET key={i} fid={`s8_reason${i+1}`} data={d} onChange={oc} editMode={em} style={{ fontSize:13, color:"#fdf6e3", marginBottom:4 }} />
            ))}
          </div>
        )}

        <AnimatePresence>
          {allBloomed && (
            <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
              style={{ marginTop:24, textAlign:"center", maxWidth:600, padding:"0 16px", fontFamily:"'Sacramento',cursive", color:"#FFD700", fontSize:"clamp(1.6rem,3.5vw,2.4rem)" }}>
              This garden will always bloom for you. ♡
            </motion.p>
          )}
        </AnimatePresence>

        <div style={{ marginTop:"auto", width:"100%", overflowX:"auto" }}>
          <div style={{ position:"relative", maxWidth:980, margin:"0 auto" }}>
            <div style={{ position:"absolute", left:0, right:0, bottom:0, height:12, borderRadius:4, background:"linear-gradient(180deg,#4a6b2a,#2d4818)" }} />
            <div style={{ position:"relative", display:"flex", alignItems:"flex-end", justifyContent:"center", gap:8, padding:"0 12px" }}>
              {Array.from({length:8},(_,i) => (
                <motion.div key={i} animate={bloomed.has(i)&&allBloomed ? {rotate:[-2,2,-2]} : {}} transition={{ duration:3, repeat:Infinity, ease:"easeInOut", delay:i*0.2 }}>
                  <GardenPot index={i} bloomed={bloomed.has(i)} onClick={()=>setBloomed(s=>new Set(s).add(i))} reason={reasons[i]} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 9: FINALE
// ─────────────────────────────────────────────────────────────────────────────
interface FWParticle { x:number;y:number;vx:number;vy:number;life:number;maxLife:number;color:string;size:number; }
interface FWRocket { x:number;y:number;targetY:number;vx:number;vy:number;color:string;exploded:boolean; }
const FW_COLORS=["#FFD700","#FF6B6B","#FF69B4","#fdf6e3","#9B59B6","#FF8C00"];

function Fireworks({ flash }: { flash:boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const particles = useRef<FWParticle[]>([]);
  const rockets = useRef<FWRocket[]>([]);
  const lastSpawn = useRef(0);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf=0; let running=true;
    const resize = () => { const dpr=window.devicePixelRatio||1; canvas.width=window.innerWidth*dpr; canvas.height=window.innerHeight*dpr; ctx.scale(dpr,dpr); };
    resize(); window.addEventListener("resize",resize);
    const explode=(x:number,y:number,color:string)=>{
      for(let i=0;i<70;i++){const angle=(Math.PI*2*i)/70;const speed=Math.random()*4+2;particles.current.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:0,maxLife:60+Math.random()*30,color:Math.random()>0.7?FW_COLORS[Math.floor(Math.random()*FW_COLORS.length)]:color,size:Math.random()*2+1.5});}
    };
    const loop=(t:number)=>{
      if(!running)return;
      ctx.fillStyle="rgba(5,10,24,0.18)";ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
      if(t-lastSpawn.current>900+Math.random()*800){lastSpawn.current=t;const x=window.innerWidth*(0.15+Math.random()*0.7);const ty=window.innerHeight*(0.15+Math.random()*0.3);rockets.current.push({x,y:window.innerHeight,targetY:ty,vx:0,vy:-8-Math.random()*3,color:FW_COLORS[Math.floor(Math.random()*FW_COLORS.length)],exploded:false});}
      rockets.current=rockets.current.filter(r=>{r.x+=r.vx;r.y+=r.vy;ctx.beginPath();ctx.arc(r.x,r.y,2,0,Math.PI*2);ctx.fillStyle=r.color;ctx.shadowBlur=12;ctx.shadowColor=r.color;ctx.fill();ctx.shadowBlur=0;if(r.y<=r.targetY){explode(r.x,r.y,r.color);return false;}return true;});
      particles.current=particles.current.filter(p=>{p.life++;p.x+=p.vx;p.y+=p.vy;p.vy+=0.05;p.vx*=0.99;p.vy*=0.99;const alpha=1-p.life/p.maxLife;if(alpha<=0)return false;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fillStyle=p.color;ctx.globalAlpha=alpha;ctx.shadowBlur=8;ctx.shadowColor=p.color;ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=0;return true;});
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>{running=false;cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  }, []);

  useEffect(()=>{
    if(!flash)return;
    for(let i=0;i<6;i++) setTimeout(()=>{const x=window.innerWidth*(0.1+Math.random()*0.8);rockets.current.push({x,y:window.innerHeight,targetY:window.innerHeight*0.25,vx:0,vy:-10,color:FW_COLORS[i%FW_COLORS.length],exploded:false});},i*100);
  },[flash]);

  return <canvas ref={ref} style={{ position:"absolute", inset:0, pointerEvents:"none" }} />;
}

function Slide9Finale({ d, onBack, onReset, em, oc }: { d:Record<string,string>; onBack:()=>void; onReset:()=>void; em:boolean; oc?:(id:string,v:string)=>void }) {
  const [sealed, setSealed] = useState(false);
  const [flash, setFlash] = useState(false);

  const fireConfetti = () => {
    const opts:confetti.Options={ particleCount:60, spread:80, ticks:200, colors:["#FFD700","#FF69B4","#fdf6e3","#FF6B6B","#C0395A"], shapes:["circle"] as never };
    confetti({ ...opts, origin:{x:0.1,y:0.6}, angle:60 });
    confetti({ ...opts, origin:{x:0.9,y:0.6}, angle:120 });
    confetti({ ...opts, origin:{x:0.5,y:0.5}, spread:360 });
  };

  const seal = () => { setSealed(true); setFlash(true); fireConfetti(); setTimeout(()=>setFlash(false),1500); };

  return (
    <SlideShell onBack={onBack} showNext={false}>
      <div style={{ position:"absolute", inset:0, background:"#050A18" }} />
      <Fireworks flash={flash} />
      {/* Diwali strings */}
      <div style={{ position:"absolute", left:0, right:0, top:0, pointerEvents:"none" }}>
        {[60,90,120,150,180].map((y,k) => (
          <div key={k} style={{ position:"absolute", left:0, right:0 }}>
            {Array.from({length:14}).map((_,i) => {
              const t=(i+0.5)/14; const x=t*100; const yPos=y+4*t*(1-t)*50;
              return <motion.span key={i} className="lej-bulb" animate={flash?{scale:[1,1.6,1,1.6,1]}:{opacity:[1,0.85,1]}} transition={flash?{duration:1}:{duration:0.15,repeat:Infinity,repeatType:"reverse"}}
                style={{ position:"absolute", left:`${x}%`, top:yPos, color:BULB_COLORS[i%BULB_COLORS.length], background:BULB_COLORS[i%BULB_COLORS.length], transform:"translate(-50%,-50%)" }} />;
            })}
          </div>
        ))}
      </div>

      <div style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"96px 24px 128px", textAlign:"center" }}>
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }} style={{ fontSize:11, letterSpacing:"0.4em", fontWeight:600, color:"#FFD700" }}>✦ ALWAYS &amp; FOREVER ✦</motion.div>

        <motion.h1 initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.5 }} className="lej-glow"
          style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontWeight:700, fontSize:"clamp(2.4rem,7vw,4.5rem)", color:"#fdf6e3", lineHeight:1.05, marginTop:16 }}>
          <ET fid="s9_title" data={d} onChange={oc} editMode={em} style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontWeight:700, fontSize:"clamp(2.4rem,7vw,4.5rem)", color:"#fdf6e3" }} />
        </motion.h1>

        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.9 }} style={{ marginTop:24, maxWidth:480 }}>
          <ET fid="s9_body" data={d} onChange={oc} editMode={em} multiline style={{ fontFamily:"'Lora',serif", fontStyle:"italic", color:"#F2C4CE", fontSize:"1.1rem", lineHeight:2 }} />
        </motion.div>

        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:1.3 }} style={{ marginTop:24 }}>
          <ET fid="s9_sign" data={d} onChange={oc} editMode={em} style={{ fontFamily:"'Sacramento',cursive", color:"#FFD700", fontSize:"2.2rem" }} />
        </motion.div>

        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:1.6 }} style={{ marginTop:40, display:"flex", flexWrap:"wrap", justifyContent:"center", gap:16 }}>
          {!sealed && !em && (
            <button onClick={seal} style={{ borderRadius:9999, padding:"12px 32px", fontWeight:600, color:"#3D0C1A", boxShadow:"0 10px 40px rgba(212,175,55,0.5)", background:"linear-gradient(135deg,#FFD700,#FFB347)", border:"2px solid #fdf6e3", cursor:"pointer", fontSize:15 }}>
              Seal It With Love 💘
            </button>
          )}
          <button onClick={onReset} style={{ borderRadius:9999, border:"1px solid rgba(255,255,255,0.3)", background:"transparent", padding:"12px 24px", color:"rgba(255,255,255,0.85)", cursor:"pointer", fontSize:14 }}>
            Live it again 🔄
          </button>
        </motion.div>

        <motion.div animate={sealed?{y:[0,-20,0]}:{}} transition={{ duration:0.6 }} style={{ marginTop:40, position:"relative" }}>
          <div style={{ position:"absolute", left:-80, right:-80, top:-40, bottom:-40, background:"radial-gradient(ellipse,rgba(255,215,100,0.25),transparent 70%)" }} />
          <BearChar size={120} variant="couple" />
          {[0,1,2].map(i => (
            <motion.span key={i} style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", bottom:40, fontSize:24, color:"#FF69B4" }}
              animate={{ y:[0,-100], opacity:[1,0], x:[(i-1)*30,(i-1)*60] }}
              transition={{ duration:3, repeat:Infinity, delay:i*0.7 }}>♡</motion.span>
          ))}
        </motion.div>

        <AnimatePresence>
          {sealed && (
            <motion.div initial={{ scale:0, rotate:-30 }} animate={{ scale:[0,1.2,1], rotate:0 }} transition={{ type:"spring", stiffness:180, damping:12 }}
              style={{ position:"fixed", left:"50%", top:"50%", transform:"translate(-50%,-50%)", zIndex:40, pointerEvents:"none", width:180, height:180, borderRadius:"50%", background:"radial-gradient(circle,#8B0000,#4A0008)", border:"4px solid #FFD700", boxShadow:"0 0 60px rgba(139,0,0,0.6),inset 0 0 30px rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:90, color:"#FFD700", filter:"drop-shadow(0 0 12px rgba(255,215,0,0.6))" }}>♡</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export interface LoversEnchantedJourneyProps {
  customData?: Record<string, string>;
  editMode?: boolean;
  onFieldChange?: (id: string, val: string) => void;
  forcedSlide?: number;
  autoPlay?: boolean;
}

export default function LoversEnchantedJourney({ customData = {}, editMode = false, onFieldChange, forcedSlide, autoPlay = false }: LoversEnchantedJourneyProps) {
  const defaults: Record<string, string> = {
    s1_light_text: "I lit up the world for you, just like you lit up mine. ✨",
    s2_title: "Our Moments Together 📸",
    s2_p1_caption: "The day everything changed 🌸",
    s2_p2_caption: "Always laughing with you ✨",
    s2_p3_caption: "My favourite view 🌅",
    s2_p4_caption: "Us, always ♡",
    s2_p5_caption: "Golden hours with you 🌻",
    s2_p6_caption: "Forever in my heart 💕",
    s3_song1_title: "Tere Bina", s3_song1_artist: "Arijit Singh", s3_song1_url: "",
    s3_song2_title: "Pehli Nazar Mein", s3_song2_artist: "Atif Aslam", s3_song2_url: "",
    s3_song3_title: "Tu Hi Meri Shab Hai", s3_song3_artist: "Mohit Chauhan", s3_song3_url: "",
    s4_reveal_title: "You are my favourite person",
    s4_reveal_body: "Not just today. Not just on special days.\nEvery single day.",
    s5_title: "Connect the stars to reveal what I see ✨",
    s5_reveal_text: "That's how I see you — a constellation I'll always find ♡",
    s6_seg1: "You deserve every love song ever written",
    s6_seg2: "I choose you. Every single day.",
    s6_seg3: "Being loved by you is my greatest gift",
    s6_seg4: "You make ordinary moments extraordinary",
    s6_seg5: "My heart plays your favourite song on repeat",
    s6_seg6: "You give me butterflies, always",
    s6_seg7: "I think of you in every quiet moment",
    s6_seg8: "You are the best part of my story",
    s7_letter_body: "No matter where life takes us,\nI will always find my way back to you.\nYou are my home, my peace,\nmy favourite place to be.\nWith every wave, I think of you. ♡",
    s7_sign: "— Yours, always",
    s8_title: "Grow our garden of love 🌹",
    s8_reason1: "Your laugh 😄", s8_reason2: "The way you care ♡", s8_reason3: "Your kindness 🌸",
    s8_reason4: "Being with you ✨", s8_reason5: "Your eyes 🌟", s8_reason6: "How you make me feel 💕",
    s8_reason7: "Your strength 🦁", s8_reason8: "All of you. Always. 💘",
    s9_title: "You Are My Everything ♡",
    s9_body: "From the lights we lit together,\nto every song, every memory, every moment —\nit has all been for you.\nThank you for existing.\nThank you for being mine.",
    s9_sign: "— Yours, in every lifetime ♡",
  };

  const d = useMemo(() => ({ ...defaults, ...customData }), [customData]);
  const [slide, setSlide] = useState(() => forcedSlide ?? 1);

  useEffect(() => { if (forcedSlide !== undefined) setSlide(forcedSlide); }, [forcedSlide]);

  const next = () => setSlide(s => Math.min(9, s + 1));
  const back = () => setSlide(s => Math.max(1, s - 1));
  const reset = () => setSlide(1);

  const em = editMode;
  const oc = onFieldChange;
  const ap = autoPlay;

  const commonProps = { d, em, oc, ap };

  return (
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "'Nunito', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* Slide number indicator */}
      <div style={{ position: "fixed", top: editMode ? 110 : 20, left: "50%", transform: "translateX(-50%)", zIndex: 50, display: "flex", gap: 6, pointerEvents: "none" }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} style={{ height: 6, borderRadius: 9999, transition: "all 0.3s", background: i + 1 === slide ? "#FFD700" : "rgba(255,255,255,0.25)", width: i + 1 === slide ? 24 : 6, display: "block" }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {slide === 1 && <Slide1DarkRoom key="s1" {...commonProps} onNext={next} />}
        {slide === 2 && <Slide2Photos key="s2" {...commonProps} onBack={back} onNext={next} />}
        {slide === 3 && <Slide3Music key="s3" {...commonProps} onBack={back} onNext={next} />}
        {slide === 4 && <Slide4Scratch key="s4" {...commonProps} onBack={back} onNext={next} />}
        {slide === 5 && <Slide5Constellation key="s5" {...commonProps} onBack={back} onNext={next} />}
        {slide === 6 && <Slide6Wheel key="s6" {...commonProps} onBack={back} onNext={next} />}
        {slide === 7 && <Slide7Bottle key="s7" {...commonProps} onBack={back} onNext={next} />}
        {slide === 8 && <Slide8Garden key="s8" {...commonProps} onBack={back} onNext={next} />}
        {slide === 9 && <Slide9Finale key="s9" {...commonProps} onBack={back} onReset={reset} />}
      </AnimatePresence>
    </div>
  );
}
