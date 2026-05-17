"use client";
import { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";

// ── Editable Text (shared pattern) ──
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
      display: "block", width: "100%", border: "2px solid #e91e8c", borderRadius: 8,
      padding: "8px 10px", background: "rgba(233,30,140,0.06)", outline: "none",
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
      position: "relative", cursor: "text", border: "2px dashed rgba(233,30,140,0.5)",
      borderRadius: 8, padding: "6px 10px 20px", background: "rgba(233,30,140,0.03)",
      marginBottom: 4, transition: "border-color 0.2s",
    }}>
      <span style={{ display: "block", ...style }}>
        {value || <em style={{ opacity: 0.4, fontSize: 13 }}>Click to edit</em>}
      </span>
      <span style={{ position: "absolute", bottom: 3, right: 8, fontSize: 10, color: "#e91e8c",
        fontWeight: 700, fontFamily: "'Inter',sans-serif", opacity: 0.8 }}>✏️ click to edit</span>
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

  return (
    <div style={{ padding: "8px 12px", background: "rgba(233,30,140,0.04)", borderTop: "1px dashed rgba(233,30,140,0.3)" }}>
      {preview && (
        <div style={{ marginBottom: 6, textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" style={{ maxHeight: 80, borderRadius: 8, border: "2px solid #e91e8c" }} />
        </div>
      )}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
          background: "#e91e8c", color: "#fff", border: "none", borderRadius: 8,
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

// ── Sub-components ──
const IMG = "/templates/sweet-apology";

function PillBtn({ onClick, children, disabled }: { onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: "#f8c8c8", color: "#2d2d2d", borderRadius: 50, padding: "12px 28px",
      fontWeight: 600, fontFamily: "'Nunito',sans-serif", fontSize: 14, border: "none",
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
      boxShadow: "0 4px 12px rgba(200,150,150,0.3)", transition: "transform 0.2s",
    }}>{children}</button>
  );
}

function NavBtns({ onBack, onNext, nextLabel = "Next →", nextDisabled }: {
  onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 40 }}>
      {onBack && <PillBtn onClick={onBack}>← Back</PillBtn>}
      {onNext && <PillBtn onClick={onNext} disabled={nextDisabled}>{nextLabel}</PillBtn>}
    </div>
  );
}

// ── Slide -1: Background Music ──
function S_Minus1({ d, ch, em, oc, bgProps }: { d: Record<string,string>; ch: () => void; em: boolean; oc?: (id:string,v:string)=>void; bgProps: any }) {
  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "64px 24px" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#333", marginBottom: 8, fontFamily: "sans-serif" }}>
          Global Background Music 🎵
        </h2>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 24, fontFamily: "sans-serif" }}>Plays continuously throughout the website</p>
        
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f5f5f5", color: "#333", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Music size={28} />
        </div>
        
        <div style={{ display: "block", fontSize: 16, fontWeight: 600, color: "#222", marginBottom: 16, fontFamily: "sans-serif" }}>
          {d.bg_song_name || "No song selected"}
        </div>
        
        {em && (
          <div style={{ marginTop: 16 }}>
            <button onClick={() => bgProps.setIsPicking(true)} style={{ background: "#222", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "sans-serif" }}>
              <Music size={16} />
              {d.bg_song_url ? "Change Background Music" : "Select Background Music"}
            </button>
          </div>
        )}
        
        <div style={{ marginTop: 24 }}>
          <button onClick={ch} style={{ background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "sans-serif" }}>
            Next: Intro Slide →
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

// ── Slide 1: Apology intro ──
function S1({ d, ch, em, oc }: { d: Record<string,string>; ch: () => void; em: boolean; oc?: (id:string,v:string)=>void }) {
  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "64px 24px" }}>
      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, letterSpacing: "0.3em", color: "#2d2d2d", marginBottom: 16 }}>FOR MY</p>

      <ET fid="s1_recipient" data={d} onChange={oc} editMode={em}
        style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(40px,8vw,64px)", color: "#e91e8c", letterSpacing: "0.05em" }} />

      <div style={{ position: "relative", display: "inline-block", margin: "8px 0" }}>
        <span style={{
          position: "absolute", top: -22, left: -8, background: "#fff", borderRadius: 20,
          padding: "3px 12px", fontSize: 13, fontWeight: 700, color: "#2d2d2d",
          transform: "rotate(-8deg)", boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          fontFamily: "'Nunito',sans-serif",
        }}>really</span>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "clamp(48px,8vw,64px)", color: "#e91e8c" }}>I am</h2>
      </div>

      <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(56px,10vw,96px)", color: "#1a1a1a", letterSpacing: "-0.02em", marginBottom: 24 }}>SORRY</h2>

      <ET fid="s1_message" data={d} onChange={oc} editMode={em} multiline
        style={{ maxWidth: 440, fontSize: 16, color: "#555", lineHeight: 1.7 }} />

      <div style={{ fontSize: 24, color: "#e91e8c", margin: "16px 0" }}>✦</div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${IMG}/kitty-heart.png`} alt="Kitty" width={200} style={{ animation: "floatUp 0.8s ease 0.2s both" }} />

      <NavBtns onNext={ch} />
    </section>
  );
}

// ── Slide 2: Heart grid ──
function S2({ d, ch, em, oc, ap }: { d: Record<string,string>; ch: () => void; em: boolean; oc?: (id:string,v:string)=>void; ap?: boolean }) {
  const [tiles, setTiles] = useState<boolean[]>(Array(9).fill(false));
  const allHearts = tiles.every(Boolean);

  useEffect(() => {
    if (allHearts && !em && !ap) {
      const t = setTimeout(ch, 1600);
      return () => clearTimeout(t);
    }
  }, [allHearts, ch, em, ap]);

  const toggle = (i: number) => setTiles(ts => ts.map((v, idx) => idx === i ? !v : v));

  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
      <ET fid="s2_title" data={d} onChange={oc} editMode={em}
        style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(24px,4vw,32px)", color: "#e91e8c", marginBottom: 32, textAlign: "center" }} />

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(8px,2vw,12px)",
        padding: "clamp(14px,3vw,24px)", borderRadius: 24, background: "#fff",
        boxShadow: "0 8px 30px rgba(0,0,0,0.06)", width: "min(340px, 90vw)",
      }}>
        {tiles.map((revealed, i) => (
          <div key={i} onClick={() => !em && toggle(i)}
            style={{ width: "clamp(68px,20vw,88px)", height: "clamp(68px,20vw,88px)", perspective: 800, cursor: em ? "default" : "pointer" }}>
            <div style={{
              position: "relative", width: "100%", height: "100%",
              transformStyle: "preserve-3d", transition: "transform 0.5s",
              transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
            }}>
              {/* Front: X */}
              <div style={{
                position: "absolute", inset: 0, backfaceVisibility: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#fff", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                fontSize: 40, color: "#e74c3c",
              }}>✕</div>
              {/* Back: Heart */}
              <div style={{
                position: "absolute", inset: 0, backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#fff", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                fontSize: 40, color: "#c0392b",
                animation: allHearts ? "heartPulse 0.6s ease 3" : "none",
              }}>❤</div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 20, fontSize: 14, color: "#888" }}>
        {tiles.filter(Boolean).length} / 9 hearts revealed
      </p>

      <NavBtns onNext={ch} nextDisabled={!allHearts && !em} />
    </section>
  );
}

// ── Slide 3: Cards carousel ──
function S3({ d, ch, em, oc }: { d: Record<string,string>; ch: () => void; em: boolean; oc?: (id:string,v:string)=>void }) {
  const cards = [
    { img: `${IMG}/cat-flower.png`, fid: "s3_card1" },
    { img: `${IMG}/cat-tulips.png`, fid: "s3_card2" },
    { img: `${IMG}/kitty-hearts.png`, fid: "s3_card3" },
  ];
  const [idx, setIdx] = useState(0);

  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(28px,4vw,36px)", color: "#e91e8c", marginBottom: 12 }}>Special Cards</h3>

      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 360, marginBottom: 20, fontSize: 11, letterSpacing: "0.3em", color: "#888" }}>
        <span>FROM: ME</span><span>TO: MY LOVE</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "clamp(6px,2vw,12px)", maxWidth: "95vw" }}>
        <button onClick={() => setIdx(i => (i - 1 + 3) % 3)} style={{
          width: 36, height: 36, borderRadius: "50%", background: "#fff", flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "none", cursor: "pointer",
          fontSize: 18, color: "#e91e8c", display: "flex", alignItems: "center", justifyContent: "center",
        }}>‹</button>

        <div key={idx} style={{
          width: "clamp(240px,65vw,300px)", borderRadius: 16, overflow: "hidden", background: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)", animation: "fadeSlide 0.4s ease both",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div style={{ padding: 12, background: "#fff" }}>
            <img src={d[`s3_img${idx+1}`] || cards[idx].img} alt="" width={280} style={{ width: "100%", height: "clamp(150px,40vw,200px)", objectFit: "contain" }} />
          </div>
          {em && (
            <ImageUploader fid={`s3_img${idx+1}`} data={d} onChange={oc} defaultSrc={cards[idx].img} />
          )}
          <div style={{ padding: "10px 14px", background: "#fdf0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <ET fid={cards[idx].fid} data={d} onChange={oc} editMode={em}
              style={{ fontFamily: "'Dancing Script',cursive", fontSize: "clamp(16px,4vw,20px)", color: "#e91e8c" }} />
            <span style={{ color: "#c0392b" }}>❤</span>
          </div>
        </div>

        <button onClick={() => setIdx(i => (i + 1) % 3)} style={{
          width: 40, height: 40, borderRadius: "50%", background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "none", cursor: "pointer",
          fontSize: 20, color: "#e91e8c", display: "flex", alignItems: "center", justifyContent: "center",
        }}>›</button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 360, marginTop: 16, fontSize: 11, letterSpacing: "0.3em", color: "#888" }}>
        <span>DATE: NOW</span><span>VALID FOR: FOREVER</span>
      </div>

      <ET fid="s3_sign" data={d} onChange={oc} editMode={em}
        style={{ fontFamily: "'Dancing Script',cursive", fontSize: 20, color: "#e91e8c", marginTop: 8 }} />

      <NavBtns onNext={ch} />
    </section>
  );
}

import SongLibraryPopup from "../SongLibraryPopup";
import { Play, Pause, Music, SkipBack, SkipForward, VolumeX, Volume2 } from "lucide-react";

// ── Slide 4: Music player ──
function S4({ d, ch, em, oc, onPlayStateChange }: { d: Record<string,string>; ch: () => void; em: boolean; oc?: (id:string,v:string)=>void; onPlayStateChange?: (playing: boolean) => void }) {
  const [playing, setPlaying] = useState(false);
  const [songIdx, setSongIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [pickingFor, setPickingFor] = useState<number | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(17);

  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const songs = [
    { n: "s4_song1", a: "s4_artist1", u: "s4_url1", fallback: "Dil Cheez Tujhe Dedi" },
    { n: "s4_song2", a: "s4_artist2", u: "s4_url2", fallback: "Tere Bina" },
    { n: "s4_song3", a: "s4_artist3", u: "s4_url3", fallback: "Tera Hone Laga Hoon" },
  ];

  useEffect(() => {
    if (audioObj) {
      audioObj.pause();
      audioObj.currentTime = 0;
    }
    setProgress(0);
    setPlaying(false);
    
    const url = d[songs[songIdx].u];
    if (url && !em) {
      const newAudio = new Audio(url);
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
  }, [songIdx, d, em]);

  useEffect(() => {
    onPlayStateChange?.(playing);
    if (audioObj) {
      if (playing) audioObj.play().catch(e => console.error(e));
      else audioObj.pause();
    } else {
      // Fake progress
      if (playing) {
        ref.current = setInterval(() => setProgress(p => p >= 100 ? 0 : p + 1), 170);
      }
      return () => { if (ref.current) clearInterval(ref.current); };
    }
  }, [playing, audioObj]);

  const curSec = audioObj ? Math.floor((progress / 100) * duration) : Math.floor((progress / 100) * duration);
  const fmt = (s: number) => `0:${Math.floor(s).toString().padStart(2, "0")}`;

  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(24px,4vw,30px)", color: "#e91e8c", marginBottom: 24, textAlign: "center" }}>
        Songs Dedicated To You ❤
      </h3>

      <div style={{
        background: "#fff", borderRadius: 24, padding: 24, width: "100%", maxWidth: 360,
        display: "flex", flexDirection: "column", alignItems: "center",
        boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/album-art.png`} alt="Album" width={180} style={{ borderRadius: 16, marginBottom: 16 }} />
        <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "#e91e8c", marginBottom: 4 }}>
          {playing ? "PLAYING" : "PAUSED"}
        </p>

        {em ? (
          <div style={{ width: "100%", marginBottom: 12 }}>
            {songs.map((s, i) => (
              <div key={i} style={{ marginBottom: 10, background: "#fdf0f0", padding: 12, borderRadius: 12 }}>
                <ET fid={s.n} data={d} onChange={oc} editMode={em} style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }} />
                <ET fid={s.a} data={d} onChange={oc} editMode={em} style={{ fontSize: 12, color: "#888", marginBottom: 8 }} />
                <div style={{ textAlign: "right" }}>
                  <button onClick={() => setPickingFor(i)} style={{ background: "none", border: "1px dashed #e91e8c", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#e91e8c", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {d[s.u] ? <><Music size={12} /> Change Audio</> : <><Music size={12} /> Add Audio</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{d[songs[songIdx].n] || songs[songIdx].fallback}</p>
            <p style={{ fontSize: 13, color: "#888" }}>{d[songs[songIdx].a] || "Unknown Artist"}</p>
          </div>
        )}

        {/* Progress bar */}
        <div style={{ width: "100%", marginBottom: 16 }}>
          <div style={{ position: "relative", height: 6, borderRadius: 99, background: "#f0f0f0" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 99, background: "#e91e8c", width: `${progress}%` }} />
            <div style={{ position: "absolute", top: -4, width: 14, height: 14, borderRadius: "50%", background: "#e91e8c", left: `calc(${progress}% - 7px)` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginTop: 4 }}>
            <span>{fmt(curSec)}</span><span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, opacity: em ? 0.4 : 1, pointerEvents: em ? "none" : "auto" }}>
          <button onClick={() => setSongIdx(i => (i - 1 + songs.length) % songs.length)} style={{
            width: 40, height: 40, borderRadius: "50%", border: "1px solid #f8c8c8",
            background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#e91e8c"
          }}>
            <SkipBack size={18} fill="currentColor" />
          </button>
          <button onClick={() => setPlaying(p => !p)} style={{
            width: 56, height: 56, borderRadius: "50%", border: "none",
            background: "#e91e8c", color: "#fff", cursor: "pointer",
            boxShadow: "0 6px 16px rgba(233,30,140,0.35)", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: 3 }} />}
          </button>
          <button onClick={() => setSongIdx(i => (i + 1) % songs.length)} style={{
            width: 40, height: 40, borderRadius: "50%", border: "1px solid #f8c8c8",
            background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#e91e8c"
          }}>
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>
      </div>

      <NavBtns onNext={ch} />

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
    </section>
  );
}

// ── Slide 5: Transition ──
function S5({ ch, em, ap }: { ch: () => void; em: boolean; ap?: boolean }) {
  useEffect(() => {
    if (!em && !ap) { const t = setTimeout(ch, 2200); return () => clearTimeout(t); }
  }, [ch, em, ap]);

  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,5vw,36px)", color: "#e91e8c", marginBottom: 32 }}>
        Almost there... ✨
      </p>
      <div style={{ fontSize: 72, color: "#c0392b", animation: "softPulse 1.4s ease infinite" }}>❤</div>
      <NavBtns onNext={ch} nextLabel="Continue →" />
    </section>
  );
}

// ── Slide 6: Final message ──
function S6({ d, em, oc }: { d: Record<string,string>; em: boolean; oc?: (id:string,v:string)=>void }) {
  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
      <div style={{
        position: "relative", background: "#fff", borderRadius: 24, padding: "clamp(20px,4vw,32px) clamp(16px,4vw,40px)",
        width: "100%", maxWidth: 580, boxShadow: "0 16px 50px rgba(0,0,0,0.08)",
        backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 30px,rgba(200,150,150,0.07) 30px,rgba(200,150,150,0.07) 31px)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, letterSpacing: "0.3em" }}>FOR MY LOVE ✦</p>
          <span style={{ fontSize: 20, color: "#e91e8c" }}>✦</span>
        </div>

        <div style={{ textAlign: "center" }}>
          <ET fid="s6_heading" data={d} onChange={oc} editMode={em}
            style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "clamp(36px,6vw,52px)", color: "#e91e8c", marginBottom: 12 }} />
          <ET fid="s6_subheading" data={d} onChange={oc} editMode={em}
            style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(24px,4vw,36px)", color: "#1a1a1a", marginBottom: 24 }} />
          <ET fid="s6_message" data={d} onChange={oc} editMode={em} multiline
            style={{ maxWidth: 440, margin: "0 auto", fontSize: 16, color: "#555", lineHeight: 1.7 }} />
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/kitty-sticker.png`} alt="" width={120}
          style={{ position: "absolute", bottom: -24, right: -16 }} />

        <p style={{ fontFamily: "'Dancing Script',cursive", textAlign: "center", fontSize: 16, color: "#888", marginTop: 16 }}>
          made with ❤ and sparkles — forever yours ✨
        </p>
      </div>
    </section>
  );
}

// ── Main Component ──
export default function SweetApologyBox({
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

  useEffect(() => {
    if (editMode) return;
    const audio = new Audio();
    audio.loop = true;
    setBgAudio(audio);

    const startBgAudio = () => {
      if (isYt) {
        if (ytPlayer && typeof ytPlayer.playVideo === "function") {
          ytPlayer.playVideo();
        }
      } else {
        if (audio.paused && customData.bg_song_url) {
          audio.play().catch(e => console.log("Bg audio autoplay prevented", e));
        }
      }
    };
    window.addEventListener("click", startBgAudio, { once: true });

    return () => {
      window.removeEventListener("click", startBgAudio);
      audio.pause();
      audio.src = "";
    };
  }, [editMode, isYt, ytPlayer, customData.bg_song_url]);

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
    } else {
      if (!globalMuted) {
        if (isYt) {
          ytPlayer?.playVideo?.();
        } else {
          bgAudio?.play().catch(e => console.log("Bg audio play prevented", e));
        }
      }
    }
  }, [slideAudioPlaying, bgAudio, globalMuted, editMode, isYt, ytPlayer]);

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
      setSlide(s => (s + 1) % 6);
    }, 1500);
    return () => clearInterval(timer);
  }, [autoPlay, editMode]);

  const renderSlide = () => {
    const p = { d: customData, em: editMode, oc: onFieldChange };
    switch (activeSlide) {
      case -1: return <S_Minus1 {...p} ch={() => go(0)} bgProps={{ isPicking: isPickingBgSong, setIsPicking: setIsPickingBgSong }} />;
      case 0: return <S1 {...p} ch={() => go(1)} />;
      case 1: return <S2 {...p} ch={() => go(2)} ap={autoPlay} />;
      case 2: return <S3 {...p} ch={() => go(3)} />;
      case 3: return <S4 {...p} ch={() => go(4)} onPlayStateChange={setSlideAudioPlaying} />;
      case 4: return <S5 ch={() => go(5)} em={editMode} ap={autoPlay} />;
      case 5: return <S6 {...p} />;
      default: return null;
    }
  };

  return (
    <div style={{
      position: "relative", minHeight: "100vh", overflow: "hidden",
    }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "#fdf5f5",
        backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 30px,rgba(200,150,150,0.07) 30px,rgba(200,150,150,0.07) 31px)",
      }} />
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
            backdropFilter: "blur(12px)", border: "1px solid rgba(233,30,140,0.15)",
            boxShadow: "0 8px 24px rgba(233,30,140,0.15)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: globalMuted ? "#888" : "#e91e8c", transition: "all 0.3s",
          }}
        >
          {globalMuted ? <VolumeX size={24} strokeWidth={2.5} /> : <Volume2 size={24} strokeWidth={2.5} />}
        </button>
      )}

      {!editMode && (
        <div style={{ position: "absolute", bottom: 16, width: "100%", textAlign: "center", fontSize: 12, color: "#c89a9a", zIndex: 1 }}>
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
