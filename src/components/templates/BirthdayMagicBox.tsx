"use client";
import { useState, useEffect } from "react";

// ── Editable Text ────────────────────────────────────────────────────────
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

  // ─ Preview / final view: just render the text ─
  if (!editMode) {
    return <span style={{ display: "block", ...style }}>{value}</span>;
  }

  // ─ Edit mode, active input ─
  if (editing) {
    const base: React.CSSProperties = {
      display: "block", width: "100%",
      border: "2px solid #E91E8C", borderRadius: 8, padding: "8px 10px",
      background: "rgba(233,30,140,0.06)", outline: "none",
      fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit",
      color: "inherit", lineHeight: "inherit",
    };
    return multiline
      ? <textarea value={draft} rows={4} autoFocus
          onChange={e => setDraft(e.target.value)} onBlur={commit}
          style={{ ...style, ...base, resize: "vertical" }} />
      : <input value={draft} autoFocus
          onChange={e => setDraft(e.target.value)} onBlur={commit}
          onKeyDown={e => e.key === "Enter" && commit()}
          style={{ ...style, ...base }} />;
  }

  // ─ Edit mode, idle: traced dashed box ─
  return (
    <div
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{
        position: "relative", cursor: "text",
        border: "2px dashed rgba(233,30,140,0.55)",
        borderRadius: 8, padding: "6px 10px 18px",
        background: "rgba(233,30,140,0.03)",
        marginBottom: 4, transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E91E8C"; (e.currentTarget as HTMLElement).style.background = "rgba(233,30,140,0.08)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(233,30,140,0.55)"; (e.currentTarget as HTMLElement).style.background = "rgba(233,30,140,0.03)"; }}
    >
      <span style={{ display: "block", ...style }}>
        {value || <em style={{ opacity: 0.4, fontSize: 13 }}>Empty — click to fill</em>}
      </span>
      <span style={{
        position: "absolute", bottom: 3, right: 8,
        fontSize: 10, color: "#E91E8C", fontWeight: 700,
        fontFamily: "'Inter',sans-serif", letterSpacing: 0.3, opacity: 0.8,
      }}>✏️ click to edit</span>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function Card({ children, withDots }: { children: React.ReactNode; withDots?: boolean }) {
  return (
    <div style={{
      position: "relative", background: "rgba(255,245,248,0.97)", borderRadius: 24,
      padding: "32px 28px", maxWidth: 560, margin: "0 auto", color: "#2D2D2D",
      boxShadow: "0 16px 48px rgba(233,30,140,0.14)", border: "1px solid rgba(233,30,140,0.10)",
      backgroundImage: withDots ? "repeating-linear-gradient(45deg,rgba(233,30,140,0.04) 0 1px,transparent 1px 14px)" : "none",
    }}>{children}</div>
  );
}
function PinkBtn({ onClick, children, variant = "pink" }: { onClick?: () => void; children: React.ReactNode; variant?: string }) {
  return (
    <button onClick={onClick} style={{
      background: variant === "mint" ? "#4CAF8A" : "#E91E8C",
      color: "#fff", borderRadius: 9999, padding: "12px 28px", fontWeight: 800,
      fontSize: 15, border: "none", cursor: "pointer", fontFamily: "'Nunito',sans-serif",
      boxShadow: variant === "mint" ? "0 6px 18px rgba(76,175,138,.35)" : "0 6px 18px rgba(233,30,140,.35)",
    }}>{children}</button>
  );
}
function Title({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 20 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#E91E8C", fontFamily: "'Nunito',sans-serif" }}>{title}</h2>
      <p style={{ fontSize: 13, color: "#7a6b73", marginTop: 4 }}>{sub}</p>
    </div>
  );
}

// ── Slides ────────────────────────────────────────────────────────────────────
function S1({ d, ch, em, oc }: { d: Record<string,string>; ch: ()=>void; em: boolean; oc?: (id:string,v:string)=>void }) {
  return (
    <Card withDots>
      <div style={{ position:"absolute", top:-16, right:-8, fontSize:48 }} className="float-bob">🐱</div>
      <div style={{ position:"absolute", bottom:-16, left:-8, fontSize:48 }} className="float-bob">🐱</div>
      <div style={{ textAlign:"center", paddingTop:8 }}>
        <p style={{ fontSize:13, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"#E91E8C" }}>Happy Birthday!</p>
        <ET fid="s1_heading" data={d} onChange={oc} editMode={em}
          style={{ display:"block", marginTop:16, fontSize:"clamp(26px,5vw,44px)", fontWeight:900, color:"#E91E8C", lineHeight:1.2, fontFamily:"'Nunito',sans-serif" }} />
        <ET fid="s1_message" data={d} onChange={oc} editMode={em} multiline
          style={{ display:"block", marginTop:16, fontSize:15, color:"#5a4b55", lineHeight:1.7 }} />
        <p style={{ marginTop:14, fontFamily:"'Dancing Script',cursive", fontSize:22, color:"#E91E8C" }}>Ready for your birthday surprise?</p>
        <div style={{ marginTop:24 }}><PinkBtn onClick={ch}>
          <ET fid="s1_cta" data={d} onChange={oc} editMode={em} />
        </PinkBtn></div>
      </div>
    </Card>
  );
}

function S2({ d, ch, em, oc }: { d: Record<string,string>; ch: ()=>void; em: boolean; oc?: (id:string,v:string)=>void }) {
  const [open, setOpen] = useState(false);
  const [letterUp, setLetterUp] = useState(false);

  const handleOpen = () => {
    if (em || open) return;
    setOpen(true);
    setTimeout(() => setLetterUp(true), 600);
  };

  return (
    <div>
      <Title title="A Special Surprise Awaits! 💌" sub="Click the envelope to reveal your message..." />
      <Card>
        <div style={{ textAlign:"center" }}>
          <ET fid="s2_title" data={d} onChange={oc} editMode={em}
            style={{ fontSize:20, fontWeight:700, color:"#E91E8C", marginBottom:16 }} />

          {/* ── Envelope ── */}
          <div style={{ display:"flex", justifyContent:"center", margin:"30px 0 16px", perspective:800 }}>
            <div
              onClick={handleOpen}
              style={{
                position:"relative", width:280, height:190, cursor: em||open?"default":"pointer",
                transformStyle:"preserve-3d",
              }}
            >
              {/* Envelope body */}
              <div style={{
                position:"absolute", inset:0, borderRadius:10,
                background:"linear-gradient(145deg,#FFB6D5 0%,#FFD56B 100%)",
                boxShadow:"0 14px 36px rgba(233,30,140,0.28), inset 0 -3px 6px rgba(0,0,0,0.06)",
                overflow:"hidden",
              }}>
                {/* Left fold */}
                <div style={{ position:"absolute", top:0, left:0, bottom:0, width:"50%",
                  background:"linear-gradient(135deg,#FFC4DB,#FFD068)",
                  clipPath:"polygon(0 0,100% 50%,0 100%)", opacity:0.7 }} />
                {/* Right fold */}
                <div style={{ position:"absolute", top:0, right:0, bottom:0, width:"50%",
                  background:"linear-gradient(225deg,#FFB6CC,#FFCE68)",
                  clipPath:"polygon(100% 0,0 50%,100% 100%)", opacity:0.7 }} />
                {/* Bottom fold */}
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"55%",
                  background:"linear-gradient(160deg,#FFCCE5,#FFB6D5)",
                  clipPath:"polygon(0 100%,50% 15%,100% 100%)", opacity:0.8 }} />
                {/* Decorative line */}
                <div style={{ position:"absolute", top:"50%", left:"15%", right:"15%", height:2,
                  background:"rgba(233,30,140,0.15)", borderRadius:2 }} />
              </div>

              {/* Top flap (3D) */}
              <div style={{
                position:"absolute", top:0, left:0, right:0, height:"60%",
                background:"linear-gradient(160deg,#FF9AC8 0%,#FFCA5A 100%)",
                clipPath:"polygon(0 0,50% 100%,100% 0)",
                transformOrigin:"top center",
                transform: open ? "rotateX(-180deg)" : "rotateX(0deg)",
                transition:"transform 0.8s cubic-bezier(0.4,0,0.2,1)",
                zIndex:10, borderRadius:"10px 10px 0 0",
                boxShadow: open ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
              }} />

              {/* Heart seal */}
              <div style={{
                position:"absolute", top:"38%", left:"50%",
                transform:"translate(-50%,-50%)", fontSize:28, zIndex:12,
                opacity: open ? 0 : 1, transition:"opacity 0.3s",
                filter:"drop-shadow(0 2px 4px rgba(233,30,140,0.4))",
              }}>💗</div>

              {/* Letter card that rises out */}
              <div style={{
                position:"absolute", left:24, right:24, bottom:20,
                height:100, background:"#fff", borderRadius:8,
                boxShadow:"0 4px 16px rgba(0,0,0,0.1)",
                display:"flex", alignItems:"center", justifyContent:"center",
                flexDirection:"column", gap:4,
                transform: letterUp ? "translateY(-90px) scale(1.05)" : "translateY(10px)",
                opacity: letterUp ? 1 : open ? 0.6 : 0,
                transition:"transform 0.7s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease",
                zIndex:5,
              }}>
                <span style={{ fontSize:24 }}>💌</span>
                <span style={{ fontSize:11, color:"#E91E8C", fontWeight:700, fontFamily:"'Nunito',sans-serif" }}>A letter for you!</span>
                {/* Paper lines */}
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:`${60-i*10}%`, height:2, background:"rgba(233,30,140,0.12)", borderRadius:2 }} />
                ))}
              </div>
            </div>
          </div>

          {!em && !open && (
            <p style={{ fontSize:14, color:"#E91E8C", fontWeight:600 }} className="float-bob">👆 Tap the envelope to open!</p>
          )}
          {letterUp && !em && (
            <div className="fade-in" style={{ marginTop:12 }}>
              <p style={{ fontFamily:"'Dancing Script',cursive", fontSize:24, color:"#E91E8C", marginBottom:16 }}>You opened it! 🎉</p>
              <PinkBtn onClick={ch}>Read My Letter 💌</PinkBtn>
            </div>
          )}
          {em && <div style={{ marginTop:12 }}><PinkBtn onClick={ch}>Read My Letter 💌</PinkBtn></div>}
        </div>
      </Card>
    </div>
  );
}

function S3({ d, ch, em, oc }: { d: Record<string,string>; ch: ()=>void; em: boolean; oc?: (id:string,v:string)=>void }) {
  return (
    <div>
      <Title title="A Birthday Love Letter 📩" sub="From my heart to the birthday queen" />
      <Card>
        <div style={{ position:"absolute", top:-20, right:-12, fontSize:48 }} className="float-bob">🐱</div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:"#FFE4EE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💗</div>
          <h3 style={{ fontWeight:800, fontSize:16 }}>To My Birthday Princess</h3>
        </div>
        <ET fid="s3_greeting" data={d} onChange={oc} editMode={em}
          style={{ display:"block", fontFamily:"'Dancing Script',cursive", fontSize:26, color:"#E91E8C", marginBottom:10 }} />
        <ET fid="s3_para1" data={d} onChange={oc} editMode={em} multiline
          style={{ display:"block", fontFamily:"'Special Elite',monospace", fontSize:14, lineHeight:1.8, color:"#4a3d45", marginBottom:10 }} />
        <ET fid="s3_para2" data={d} onChange={oc} editMode={em} multiline
          style={{ display:"block", fontFamily:"'Special Elite',monospace", fontSize:14, lineHeight:1.8, color:"#4a3d45", marginBottom:12 }} />
        <ET fid="s3_sign" data={d} onChange={oc} editMode={em}
          style={{ display:"block", textAlign:"right", fontFamily:"'Dancing Script',cursive", fontSize:22, color:"#E91E8C" }} />
      </Card>
      <div style={{ textAlign:"center", marginTop:20 }}><PinkBtn onClick={ch}>Continue It ✨</PinkBtn></div>
    </div>
  );
}

function CakeCandle({ left, color }: { left: number; color: string }) {
  return (
    <div style={{ position:"absolute", top:-42, left, display:"flex", flexDirection:"column", alignItems:"center" }}>
      {/* Flame */}
      <div style={{
        width:14, height:20, borderRadius:"50% 50% 30% 30%",
        background:`radial-gradient(ellipse at bottom, #FFFDE7 0%, #FFD700 40%, ${color} 100%)`,
        animation:"flicker 0.5s ease-in-out infinite alternate",
        transformOrigin:"bottom center",
        filter:"brightness(1.2)",
        boxShadow:`0 0 8px 2px ${color}44`,
      }} />
      {/* Wick */}
      <div style={{ width:2, height:4, background:"#333", borderRadius:1 }} />
      {/* Candle body */}
      <div style={{
        width:12, height:28, borderRadius:4,
        background:`linear-gradient(180deg, ${color}, ${color}cc)`,
        border:`1px solid ${color}88`,
        boxShadow:"inset 2px 0 4px rgba(255,255,255,0.3)",
      }} />
    </div>
  );
}

function S4({ d, ch, em, oc }: { d: Record<string,string>; ch: ()=>void; em: boolean; oc?: (id:string,v:string)=>void }) {
  const [phase, setPhase] = useState<"idle"|"knife"|"cut">("idle");

  const handleCut = () => {
    if (em || phase !== "idle") return;
    setPhase("knife");
    setTimeout(() => setPhase("cut"), 800);
  };

  const isCut = phase === "cut";

  return (
    <div>
      <Title title="Cut The Birthday Cake! 🎂" sub={`Happy ${d.s4_age || "??"}th Birthday!`} />
      <Card>
        <div style={{ textAlign:"center" }}>
          {/* ── CSS Cake ── */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20, position:"relative" }}>
            <div
              onClick={handleCut}
              style={{
                display:"inline-flex", flexDirection:"column", alignItems:"center",
                cursor: em||isCut?"default":"pointer", position:"relative",
                transform: phase==="knife" ? "scale(0.97)" : "scale(1)",
                transition:"transform 0.3s",
              }}
            >
              {/* Plate */}
              <div style={{ position:"absolute", bottom:-12, left:"50%", transform:"translateX(-50%)",
                width:200, height:20, borderRadius:"50%",
                background:"linear-gradient(180deg,#f0e6ea,#e8d8df)",
                boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }} />

              {/* Top tier */}
              <div style={{
                width:130, height:55, position:"relative",
                background:"linear-gradient(180deg,#FFB6D5 0%,#FF8FC8 100%)",
                borderRadius:"10px 10px 6px 6px",
                border:"3px solid #FF6FAE",
                boxShadow:"inset 0 -4px 8px rgba(0,0,0,0.08), 0 4px 8px rgba(233,30,140,0.15)",
              }}>
                {/* Frosting drip */}
                <div style={{ position:"absolute", top:-10, left:-6, right:-6, height:20,
                  background:"white", borderRadius:"14px 14px 0 0",
                  boxShadow:"0 2px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ position:"absolute", bottom:-8, left:10, right:10, height:14, background:"white",
                    borderRadius:"0 0 10px 10px",
                    clipPath:"polygon(0 0,6% 100%,12% 0,18% 100%,24% 0,30% 100%,36% 0,42% 100%,48% 0,54% 100%,60% 0,66% 100%,72% 0,78% 100%,84% 0,90% 100%,100% 0)" }} />
                </div>
                {/* Candles */}
                <CakeCandle left={20} color="#E91E8C" />
                <CakeCandle left={58} color="#9C27B0" />
                <CakeCandle left={96} color="#FF9800" />
                {/* Sprinkles on tier */}
                {[{l:15,t:25,c:"#FFD700"},{l:40,t:32,c:"#4CAF8A"},{l:70,t:22,c:"#9C27B0"},{l:95,t:35,c:"#FF6FA3"},{l:110,t:28,c:"#FFD700"}].map((s,i)=>(
                  <div key={i} style={{ position:"absolute", left:s.l, top:s.t, width:6, height:3, borderRadius:2, background:s.c, transform:`rotate(${i*35}deg)` }} />
                ))}
              </div>

              {/* Bottom tier */}
              <div style={{
                width:180, height:65, position:"relative",
                background:"linear-gradient(180deg,#FFC8DC 0%,#FFB0CC 100%)",
                borderRadius:"6px 6px 12px 12px",
                border:"3px solid #FF8FC0",
                boxShadow:"inset 0 -4px 8px rgba(0,0,0,0.08), 0 6px 12px rgba(233,30,140,0.12)",
              }}>
                {/* Frosting drip */}
                <div style={{ position:"absolute", top:-10, left:-6, right:-6, height:18,
                  background:"white", borderRadius:"12px 12px 0 0" }}>
                  <div style={{ position:"absolute", bottom:-7, left:8, right:8, height:12, background:"white",
                    clipPath:"polygon(0 0,5% 100%,10% 0,15% 100%,20% 0,25% 100%,30% 0,35% 100%,40% 0,45% 100%,50% 0,55% 100%,60% 0,65% 100%,70% 0,75% 100%,80% 0,85% 100%,90% 0,95% 100%,100% 0)" }} />
                </div>
                {/* Decorative dots */}
                {[18,48,78,108,138,160].map((x,i)=>(
                  <div key={i} style={{ position:"absolute", top:28, left:x, width:10, height:10,
                    borderRadius:"50%", background:["#E91E8C","#FFD700","#9C27B0","#4CAF8A","#FF6FA3","#FFD700"][i],
                    boxShadow:"inset 0 -2px 3px rgba(0,0,0,0.1)" }} />
                ))}
                {/* Cherry on side */}
                <div style={{ position:"absolute", top:10, right:12, fontSize:16 }}>🍒</div>
              </div>
            </div>

            {/* Knife animation */}
            {phase === "knife" && (
              <div style={{
                position:"absolute", top:0, right:"20%", zIndex:20,
                fontSize:40, transform:"rotate(-45deg)",
                animation:"knifeSlash 0.8s ease-in-out forwards",
              }}>🔪</div>
            )}
          </div>

          {!em && phase==="idle" && <p style={{ fontSize:14, color:"#E91E8C", fontWeight:600 }} className="float-bob">🔪 Tap the cake to cut it!</p>}

          {isCut && (
            <div className="pop-in">
              <p style={{ fontFamily:"'Dancing Script',cursive", fontSize:28, color:"#E91E8C", margin:"8px 0" }}>Happy Birthday! 🎊🎉</p>
              <ET fid="s4_wish" data={d} onChange={oc} editMode={em} multiline
                style={{ fontSize:14, color:"#7a6b73", lineHeight:1.7 }} />
              <div style={{ marginTop:16 }}><PinkBtn onClick={ch}>Next Surprise 🎁</PinkBtn></div>
            </div>
          )}

          {em && (
            <div style={{ marginTop:8 }}>
              <ET fid="s4_age" data={d} onChange={oc} editMode={em}
                style={{ fontSize:16, fontWeight:700, color:"#E91E8C" }} />
              <ET fid="s4_wish" data={d} onChange={oc} editMode={em} multiline
                style={{ fontSize:14, color:"#7a6b73", lineHeight:1.7 }} />
              <div style={{ marginTop:16 }}><PinkBtn onClick={ch}>Next Surprise 🎁</PinkBtn></div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function S5({ d, ch, em, oc }: { d: Record<string,string>; ch: ()=>void; em: boolean; oc?: (id:string,v:string)=>void }) {
  return (
    <div>
      <Title title={d.s5_title || "It's Cake Time! 🎂"} sub="Make your wish!" />
      <Card>
        <div style={{ textAlign:"center" }}>
          {em && <ET fid="s5_title" data={d} onChange={oc} editMode={em}
            style={{ display:"block", fontSize:22, fontWeight:800, color:"#E91E8C", marginBottom:12 }} />}
          <div style={{ background:"linear-gradient(135deg,#FFE4EE,#FFF59D)", borderRadius:20, padding:20, maxWidth:240, margin:"0 auto" }}>
            <div style={{ fontSize:48 }}>🐱🐻🐹</div>
            <div style={{ fontSize:40 }}>🎂</div>
          </div>
          <ET fid="s5_message" data={d} onChange={oc} editMode={em} multiline
            style={{ display:"block", fontSize:14, color:"#7a6b73", marginTop:12, lineHeight:1.7 }} />
          <div style={{ marginTop:20 }}><PinkBtn onClick={ch}>I've Made My Wish! 🐾</PinkBtn></div>
        </div>
      </Card>
    </div>
  );
}

function S6({ d, ch, em, oc }: { d: Record<string,string>; ch: ()=>void; em: boolean; oc?: (id:string,v:string)=>void }) {
  const songs = [
    { n:"s6_song1", a:"s6_artist1", e:"🎵" },
    { n:"s6_song2", a:"s6_artist2", e:"🎶" },
    { n:"s6_song3", a:"s6_artist3", e:"🎸" },
  ];
  return (
    <div>
      <Title title="Birthday Playlist 🎵" sub="" />
      <Card>
        <ET fid="s6_note" data={d} onChange={oc} editMode={em}
          style={{ display:"block", textAlign:"center", fontFamily:"'Dancing Script',cursive", fontSize:20, color:"#E91E8C", marginBottom:16 }} />
        {songs.map((s,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(233,30,140,0.06)", borderRadius:14, padding:"12px 14px", marginBottom:10, border:"1px solid rgba(233,30,140,0.1)" }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"#FFE4EE", display:"flex", alignItems:"center", justifyContent:"center" }}>{s.e}</div>
            <div style={{ flex:1 }}>
              <ET fid={s.n} data={d} onChange={oc} editMode={em} style={{ display:"block", fontWeight:700, fontSize:14 }} />
              <ET fid={s.a} data={d} onChange={oc} editMode={em} style={{ display:"block", fontSize:12, color:"#7a6b73" }} />
            </div>
            <span>▶️</span>
          </div>
        ))}
        <div style={{ textAlign:"center", marginTop:16 }}><PinkBtn onClick={ch}>Next 🎁</PinkBtn></div>
      </Card>
    </div>
  );
}

function S7({ d, em, oc, onAll }: { d: Record<string,string>; em: boolean; oc?: (id:string,v:string)=>void; onAll: ()=>void }) {
  const [flipped, setFlipped] = useState([false,false,false]);
  const cards = [
    { fi:"🎉🌹", bg:"linear-gradient(135deg,#FFB6D5,#FFD56B)", fid:"s7_card1" },
    { fi:"💌💖", bg:"linear-gradient(135deg,#FFE4EE,#FF8FBF)", fid:"s7_card2" },
    { fi:"🐱✨", bg:"linear-gradient(135deg,#FF6FAE,#9C27B0)", fid:"s7_card3" },
  ];
  const count = flipped.filter(Boolean).length;
  const toggle = (i:number) => {
    if (em) return;
    const next = [...flipped]; next[i] = !next[i]; setFlipped(next);
    if (next.filter(Boolean).length === 3) setTimeout(onAll, 700);
  };
  return (
    <div>
      <Title title="Birthday Wishes Cards 🎁" sub={em ? "Edit each card message below" : "Click each card to reveal!"} />
      <Card>
        {em ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {cards.map((c,i) => (
              <div key={i} style={{ background:"rgba(233,30,140,0.05)", borderRadius:14, padding:14, border:"1px solid rgba(233,30,140,0.12)" }}>
                <p style={{ fontSize:12, color:"#7a6b73", marginBottom:6 }}>Card {i+1} Message:</p>
                <ET fid={c.fid} data={d} onChange={oc} editMode={em} multiline style={{ display:"block", fontSize:13, color:"#2D2D2D" }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12 }}>
            {cards.map((c,i) => (
              <div key={i} onClick={() => toggle(i)} className={`flip-card ${flipped[i]?"flipped":""}`} style={{ height:190, cursor:"pointer" }}>
                <div className="flip-inner">
                  <div className="flip-face" style={{ background:c.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:38 }}>{c.fi}</div>
                  <div className="flip-face flip-back" style={{ background:"#fff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:12, border:"1px solid #FFE4EE" }}>
                    <p style={{ fontSize:12, fontWeight:700, textAlign:"center", lineHeight:1.6 }}>{d[c.fid]}</p>
                    <p style={{ fontSize:10, color:"#7a6b73", marginTop:6 }}>Tap to flip back</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop:16, textAlign:"center" }}>
          <p style={{ fontWeight:700, color:"#E91E8C", fontSize:13 }}>{count} of 3 unlocked 🎉</p>
          <div className="progress-bar-bg" style={{ marginTop:8 }}>
            <div className="progress-bar-fill" style={{ width:`${(count/3)*100}%`, background:"#E91E8C" }} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function S9({ d, em, oc, onRestart }: { d: Record<string,string>; em: boolean; oc?: (id:string,v:string)=>void; onRestart: ()=>void }) {
  const [sealed, setSealed] = useState(false);
  return (
    <div>
      <Title title="Final Birthday Letter" sub="Sealed with love 💗" />
      <Card>
        <div style={{ position:"absolute", top:-20, right:-12, fontSize:48 }} className="float-bob">🐱</div>
        <ET fid="s9_greeting" data={d} onChange={oc} editMode={em}
          style={{ display:"block", fontFamily:"'Dancing Script',cursive", fontSize:26, color:"#E91E8C", marginBottom:10 }} />
        <ET fid="s9_message" data={d} onChange={oc} editMode={em} multiline
          style={{ display:"block", fontFamily:"'Special Elite',monospace", fontSize:14, lineHeight:1.8, color:"#4a3d45", marginBottom:10 }} />
        <ET fid="s9_closing" data={d} onChange={oc} editMode={em}
          style={{ display:"block", fontFamily:"'Dancing Script',cursive", fontSize:20, color:"#E91E8C" }} />
        {sealed && !em && (
          <div className="pop-in" style={{ position:"absolute", inset:0, background:"rgba(255,245,248,0.92)", borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:80 }}>💌</span>
          </div>
        )}
      </Card>
      {!em && (
        <div style={{ textAlign:"center", marginTop:20, display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <PinkBtn onClick={() => setSealed(true)}>Seal The Letter 🎂</PinkBtn>
          <PinkBtn variant="mint" onClick={onRestart}>Experience Again</PinkBtn>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BirthdayMagicBox({
  customData = {}, editMode = false, onFieldChange, forcedSlide, autoPlay = false,
}: {
  customData?: Record<string, string>;
  editMode?: boolean;
  onFieldChange?: (id: string, value: string) => void;
  forcedSlide?: number;
  autoPlay?: boolean;
}) {
  const SLIDE_ORDER = [1, 2, 3, 4, 5, 6, 7, 9];
  const [slide, setSlide] = useState(1);
  const [showModal, setShowModal] = useState(false);

  // Auto-cycle slides for card thumbnail preview
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setSlide(prev => {
        const idx = SLIDE_ORDER.indexOf(prev);
        return SLIDE_ORDER[(idx + 1) % SLIDE_ORDER.length];
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const activeSlide = editMode && forcedSlide !== undefined ? forcedSlide : slide;
  const go = (n: number) => setSlide(n);

  const renderSlide = () => {
    const p = { d: customData, em: editMode, oc: onFieldChange };
    switch (activeSlide) {
      case 1: return <S1 {...p} ch={() => go(2)} />;
      case 2: return <S2 {...p} ch={() => go(3)} />;
      case 3: return <S3 {...p} ch={() => go(4)} />;
      case 4: return <S4 {...p} ch={() => go(5)} />;
      case 5: return <S5 {...p} ch={() => go(6)} />;
      case 6: return <S6 {...p} ch={() => go(7)} />;
      case 7: return <S7 {...p} onAll={() => setShowModal(true)} />;
      case 9: return <S9 {...p} onRestart={() => { setShowModal(false); go(1); }} />;
      default: return null;
    }
  };

  return (
    <div style={{ position:"relative", minHeight:"100vh", overflow:"hidden" }}>
      <div style={{ position:"fixed", inset:0, zIndex:0,
        background:"radial-gradient(ellipse at top left,#FFE4EE 0%,transparent 55%),radial-gradient(ellipse at bottom right,#FFF9C4 0%,transparent 55%),linear-gradient(135deg,#FFF0F5 0%,#FFFDE7 100%)" }} />
      <main style={{ position:"relative", zIndex:10, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div key={activeSlide} className="fade-in-up" style={{ width:"100%", maxWidth:600 }}>
          {renderSlide()}
        </div>
      </main>
      {showModal && slide === 7 && !editMode && (
        <div className="fade-in" style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div className="pop-in" style={{ background:"#fff", borderRadius:24, padding:32, maxWidth:340, textAlign:"center" }}>
            <div style={{ fontSize:56 }}>💌</div>
            <h3 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:20, color:"#E91E8C", marginTop:12 }}>A Final Message Awaits!</h3>
            <div style={{ display:"flex", gap:12, justifyContent:"center", marginTop:16 }}>
              <PinkBtn onClick={() => { setShowModal(false); go(9); }}>Open Final Letter 💌</PinkBtn>
            </div>
            <button onClick={() => setShowModal(false)} style={{ marginTop:10, background:"none", border:"none", color:"#7a6b73", fontSize:13, cursor:"pointer" }}>Maybe later</button>
          </div>
        </div>
      )}
      {!editMode && (
        <div style={{ position:"fixed", bottom:8, left:0, right:0, textAlign:"center", fontSize:12, color:"#E91E8C", opacity:0.6, zIndex:20, fontWeight:600 }}>
          Preview — Purchase to personalise ✨
        </div>
      )}
    </div>
  );
}

