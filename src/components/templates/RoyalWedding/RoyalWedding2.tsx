"use client";
import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { Play, Pause, Compass, Music, Share2, MapPin, Calendar, Clock, Heart, Flower } from "lucide-react";
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
      display: "block", width: "100%", border: "2px solid #C8960A", borderRadius: 8,
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
      position: "relative", cursor: "text", border: "1.5px dashed rgba(200, 150, 10, 0.7)",
      borderRadius: 6, padding: "4px 8px 18px 8px",
      background: "rgba(200, 150, 10, 0.04)", display: "inline-block", width: "100%"
    }}>
      <span style={style}>{value || "(click to edit)"}</span>
      <span style={{
        position: "absolute", bottom: 2, right: 6, fontSize: 8,
        color: "#C8960A", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5
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
    <div style={{ padding: "8px 12px", background: "rgba(200, 150, 10, 0.04)", borderTop: "1px dashed rgba(200, 150, 10, 0.3)", width: "100%", borderRadius: 8, marginTop: 8 }}>
      {preview && (
        <div style={{ marginBottom: 6, textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" style={{ maxHeight: 80, borderRadius: 8, border: "2px solid #C8960A" }} />
        </div>
      )}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
          background: "#C84060", color: "#fff", border: "none", borderRadius: 8,
          padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer",
          opacity: uploading ? 0.6 : 1,
        }}>{uploading ? "Uploading…" : "📷 Change Image"}</button>
        {currentSrc && (
          <button onClick={useDefault} style={{
            background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb",
            borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer"
          }}>
            {fid.startsWith("photo") && parseInt(fid.replace("photo", ""), 10) > 4 ? "🗑️ Remove Photo" : "🗑️ Reset to Default"}
          </button>
        )}
      </div>
    </div>
  );
}

const getPhotoDefault = (key: string) => {
  if (key === "photo1") return "/templates/royal-wedding-2/photo1.jpg";
  if (key === "photo2") return "/templates/royal-wedding-2/photo2.jpg";
  if (key === "photo3") return "/templates/royal-wedding-2/photo3.png";
  if (key === "photo4") return "/templates/royal-wedding-2/photo4.png";
  return "/templates/royal-wedding-2/photo1.jpg";
};

const getPhotoConfig = (key: string, index: number) => {
  // Rotate frames based on index
  const frames = [
    "/templates/royal-wedding-2/kolam-frame.png",
    "/templates/royal-wedding-2/kolam-frame.png",
    "/templates/royal-wedding-2/kolam-frame.png",
    "/templates/royal-wedding-2/kolam-frame.png",
  ];
  const frame = frames[index % frames.length];
  // Determine if it takes full width (landscape style)
  const colSpan = index === 0 && (index % 4 === 0);
  return { frame, colSpan };
};

// Web Audio API Synthesizer (Bells and chimes)
const PlaySynth = {
  bell() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const c = new AudioCtx();
      const now = c.currentTime;
      // High chime bell layers
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.04 - i * 0.005, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 2.5 - i * 0.3);
        osc.start(now);
        osc.stop(now + 2.6);
      });
    } catch (_) {}
  }
};

export default function RoyalWedding2({
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

  // States
  const [introState, setIntroState] = useState<"preload" | "away" | "complete">(em ? "complete" : "preload");
  const [preloaderClass, setPreloaderClass] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [bgModalOpen, setBgModalOpen] = useState(false);

  // Parallax / Scroll states
  const [scrollY, setScrollY] = useState(0);
  const [curtainPart, setCurtainPart] = useState(0); // 0 to 1
  const [unrolledScrolls, setUnrolledScrolls] = useState<Record<number, boolean>>({});

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const storySectionRef = useRef<HTMLDivElement>(null);

  // Preloader run sequence
  useEffect(() => {
    if (em) return;
    const t1 = setTimeout(() => setPreloaderClass("li"), 340);
    const t2 = setTimeout(() => setPreloaderClass("li ni"), 820);
    const t3 = setTimeout(() => setPreloaderClass("li ni away"), 1900);
    const t4 = setTimeout(() => {
      setIntroState("complete");
      if (audioRef.current && !em) {
        audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
      }
    }, 2650);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [em]);

  // Prevent mobile browser pull-to-refresh during preloader
  useEffect(() => {
    if (introState !== "complete") {
      document.documentElement.style.overscrollBehaviorY = "contain";
      document.body.style.overscrollBehaviorY = "contain";
    } else {
      document.documentElement.style.overscrollBehaviorY = "";
      document.body.style.overscrollBehaviorY = "";
    }
    return () => {
      document.documentElement.style.overscrollBehaviorY = "";
      document.body.style.overscrollBehaviorY = "";
    };
  }, [introState]);

  // Setup unrolling scroll observers for events / items
  useEffect(() => {
    if (introState !== "complete") return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.getAttribute("data-idx") || "0", 10);
          setUnrolledScrolls(prev => ({ ...prev, [idx]: true }));
        }
      });
    }, { threshold: 0.15 });

    const targets = document.querySelectorAll(".scroll-card");
    targets.forEach(t => observer.observe(t));

    return () => targets.forEach(t => observer.unobserve(t));
  }, [introState]);

  // Scroll listeners for parallax and curtains parting
  useEffect(() => {
    if (introState !== "complete") return;

    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Curtains calculation
      if (storySectionRef.current) {
        const rect = storySectionRef.current.getBoundingClientRect();
        const start = window.innerHeight * 0.55;
        const range = window.innerHeight * 0.90;
        const p = Math.min(1, Math.max(0, (start - rect.top) / range));
        setCurtainPart(p);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [introState]);

  // Smooth scroll to slide section in editMode
  useEffect(() => {
    if (!em || forcedSlide === undefined || introState !== "complete") return;
    const sectionMap: Record<number, string> = {
      1: "welcome-section",
      2: "invite-section",
      3: "events-section",
      4: "couple-section",
      5: "gallery-section",
      6: "rsvp-section",
    };
    const id = sectionMap[forcedSlide];
    if (id) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [forcedSlide, em, introState]);

  // Audio Setup
  useEffect(() => {
    if (em) return;
    const songUrl = d.bg_song_url || "https://pub-1cc0f6e993214be9a36badeeb631f4b6.r2.dev/templates/template05/assets/song/Template_05.mp3";
    const audio = new Audio(songUrl);
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [d.bg_song_url, em]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  };

  const handleSkip = () => {
    setIntroState("complete");
    if (audioRef.current && !em) {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  };

  const handleRSVP = () => {
    PlaySynth.bell();
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.7 },
      colors: ["#C8960A", "#C84060", "#F8F2E4", "#E8C890"]
    });

    const phone = d.rsvp_phone || "910000000000";
    const bride = d.bride_name || "Priya";
    const groom = d.groom_name || "Arjun";
    const msg = encodeURIComponent(`Hi ${bride} & ${groom}! I would be honoured to join your grand celebration!`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const handleCalendar = () => {
    const title = encodeURIComponent(`${d.bride_name || "Priya"} weds ${d.groom_name || "Arjun"}`);
    const gCal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261212/20261213&location=${encodeURIComponent(d.wedding_venue || "Chennai")}`;
    window.open(gCal, "_blank");
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMenuOpen(false);
    }
  };

  // Parallax factors
  const heroProgress = scrollY / (window.innerHeight || 800);
  const heroP = Math.min(1, Math.max(0, heroProgress));
  const heroScale = 1.0 + heroP * 0.45;
  const leafTranslateY = heroP * -18;
  const namesOpacity = Math.max(0, 1 - (heroP - 0.55) / (0.88 - 0.55));
  const namesTranslateY = heroP * -18;
  const namesBlur = heroP > 0.55 ? `${((heroP - 0.55) / 0.33 * 14).toFixed(1)}px` : "0px";
  const namesSpacing = heroP > 0.55 ? `${((heroP - 0.55) / 0.33 * 0.08).toFixed(3)}em` : "normal";

  // Google Maps helper
  const handleMapSearch = (venueName: string) => {
    const query = encodeURIComponent(venueName);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  return (
    <div style={{
      background: "#F2EAD4", color: "#1A0C2E", fontFamily: "'Raleway', sans-serif",
      minHeight: "100vh", overflowX: "hidden", position: "relative"
    }}>
      {/* Dynamic embedded styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;700&family=Lato:ital,wght@0,300;0,400;1,300&family=Raleway:wght@200;300;400;700&display=swap');
        
        .royal-display {
          font-family: 'Cinzel', Georgia, serif;
          font-weight: 500;
        }
        .royal-script {
          font-family: 'Cinzel', Georgia, serif;
          font-style: italic;
        }
        .lato-text {
          font-family: 'Lato', sans-serif;
        }
        
        /* Preloader classes */
        .preloader {
          position: fixed; inset: 0; z-index: 2000;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(170deg,#1A0C2E 0%,#4A1E6E 40%,#C8960A 75%,#F8F2E4 100%);
          transition: opacity .75s ease, visibility .75s ease;
        }
        .preloader.away { opacity: 0; visibility: hidden; pointer-events: none; }
        .pl-mandala-wrap { opacity: 0; transform: scale(.85); transition: opacity .6s ease, transform .6s cubic-bezier(0.22,1.2,0.36,1); }
        .preloader.li .pl-mandala-wrap { opacity: 1; transform: scale(1); }
        .pl-mandala { animation: mandalaSpin 8s linear infinite; }
        @keyframes mandalaSpin { to { transform: rotate(360deg); } }
        
        .pl-m-ring { stroke-dasharray: 0 1000; transition: none; }
        .preloader.li .pl-m-r1 { stroke-dasharray: 163 1000; transition: stroke-dasharray 1.0s cubic-bezier(0.22,1.2,0.36,1) .10s; }
        .preloader.li .pl-m-r2 { stroke-dasharray: 251 1000; transition: stroke-dasharray 1.1s cubic-bezier(0.22,1.2,0.36,1) .20s; }
        .preloader.li .pl-m-r3 { stroke-dasharray: 339 1000; transition: stroke-dasharray 1.2s cubic-bezier(0.22,1.2,0.36,1) .30s; }
        
        .pl-m-petals { opacity: 0; transition: opacity .8s ease .5s; }
        .preloader.li .pl-m-petals { opacity: 1; }
        
        .pl-m-dot { transform-origin: 60px 60px; transform: scale(0); transition: transform .5s cubic-bezier(0.22,1.2,0.36,1) .7s; }
        .preloader.li .pl-m-dot { transform: scale(1); }
        
        .pl-names {
          font-family: 'Cinzel', Georgia, serif;
          font-weight: 400; letter-spacing: .12em; font-size: clamp(1.1rem,4.5vw,1.7rem); color: #F8F2E4;
          display: flex; align-items: baseline; gap: 12px;
          opacity: 0; transform: translateY(14px) scale(.96); transition: opacity .7s cubic-bezier(0.22,1.2,0.36,1), transform .7s cubic-bezier(0.22,1.2,0.36,1);
        }
        .preloader.ni .pl-names { opacity: 1; transform: translateY(0) scale(1); }
        .pl-weds { font-size: .58em; color: #E8C890; opacity: .80; font-weight: 300; letter-spacing: .16em; text-transform: uppercase; }

        /* Floating sparks */
        @keyframes sparkUp {
          0% { opacity: 0; transform: translateY(100vh) scale(0.4); }
          12% { opacity: 0.75; }
          50% { opacity: 0.4; transform: translateY(40vh) translateX(var(--dx)) scale(1.0); }
          90% { opacity: 0.15; }
          100% { opacity: 0; transform: translateY(-10vh) translateX(var(--dx)) scale(0.5); }
        }
        .spark-particle {
          position: absolute; border-radius: 50%;
          animation: sparkUp var(--dur) var(--del) ease-in-out infinite;
        }

        /* Ganesha icon breathing */
        @keyframes ganeshaPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          30% { transform: scale(1.06) rotate(-1deg); }
          60% { transform: scale(1.03) rotate(1deg); }
        }
        .ganesha-pulse {
          animation: ganeshaPulse 4.8s ease-in-out infinite;
        }

        /* Floating swans */
        @keyframes swimSwanL {
          0% { left: -15%; opacity: 0; }
          8% { opacity: 1; }
          92% { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
        @keyframes swimSwanR {
          0% { right: -15%; opacity: 0; }
          8% { opacity: 1; }
          92% { opacity: 1; }
          100% { right: 110%; opacity: 0; }
        }
        @keyframes bobSwan {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
        .swan-l { animation: swimSwanL 35s linear infinite, bobSwan 4s ease-in-out infinite; }
        .swan-r { animation: swimSwanR 40s linear infinite, bobSwan 4.5s ease-in-out infinite; }

        /* Card Bloom glow animation */
        @keyframes cardBloom {
          0% { box-shadow: 0 6px 36px rgba(26,12,46,0.1), 0 0 0 0 rgba(200,150,10,0.3); }
          50% { box-shadow: 0 6px 36px rgba(26,12,46,0.15), 0 0 0 20px rgba(200,150,10,0.08); }
          100% { box-shadow: 0 6px 36px rgba(26,12,46,0.12), 0 0 0 40px rgba(200,150,10,0); }
        }
        .card-bloom-effect {
          animation: cardBloom 2.8s ease-in-out infinite;
        }

        /* Floating elements */
        @keyframes floatLeaves {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .float-leaves { animation: floatLeaves 5.5s ease-in-out infinite; }
      `}} />

      {/* ──────────────────────────────────────────────────────────
          1. CINEMATIC MANDALA PRELOADER
          ────────────────────────────────────────────────────────── */}
      {introState !== "complete" && (
        <div 
          className={`preloader ${preloaderClass}`}
          style={{
            overscrollBehaviorY: "contain", overscrollBehavior: "none", touchAction: "none"
          }}
        >
          <div className="pl-content">
            <div className="pl-mandala-wrap">
              <svg className="pl-mandala" viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
                {/* Ring 3 — outer */}
                <circle className="pl-m-ring pl-m-r3" cx="60" cy="60" r="54" fill="none" stroke="#C8960A" strokeWidth="1.2" strokeLinecap="round"/>
                {/* Ring 2 — mid */}
                <circle className="pl-m-ring pl-m-r2" cx="60" cy="60" r="40" fill="none" stroke="#4A1E6E" strokeWidth="1.0" strokeLinecap="round"/>
                {/* Ring 1 — inner */}
                <circle className="pl-m-ring pl-m-r1" cx="60" cy="60" r="26" fill="none" stroke="#C8960A" strokeWidth="0.8" strokeLinecap="round"/>
                {/* Petals */}
                <g className="pl-m-petals">
                  <ellipse cx="60" cy="14" rx="4" ry="9" fill="#C8960A" opacity=".55" transform="rotate(0 60 60)"/>
                  <ellipse cx="60" cy="14" rx="4" ry="9" fill="#4A1E6E" opacity=".50" transform="rotate(45 60 60)"/>
                  <ellipse cx="60" cy="14" rx="4" ry="9" fill="#C8960A" opacity=".55" transform="rotate(90 60 60)"/>
                  <ellipse cx="60" cy="14" rx="4" ry="9" fill="#4A1E6E" opacity=".50" transform="rotate(135 60 60)"/>
                  <ellipse cx="60" cy="14" rx="4" ry="9" fill="#C8960A" opacity=".55" transform="rotate(180 60 60)"/>
                  <ellipse cx="60" cy="14" rx="4" ry="9" fill="#4A1E6E" opacity=".50" transform="rotate(225 60 60)"/>
                  <ellipse cx="60" cy="14" rx="4" ry="9" fill="#C8960A" opacity=".55" transform="rotate(270 60 60)"/>
                  <ellipse cx="60" cy="14" rx="4" ry="9" fill="#4A1E6E" opacity=".50" transform="rotate(315 60 60)"/>
                </g>
                <circle className="pl-m-dot" cx="60" cy="60" r="4" fill="#C8960A" opacity=".80"/>
              </svg>
            </div>
            
            <div className="pl-names">
              <span>{d.bride_name || "Priya"}</span>
              <span className="pl-weds">weds</span>
              <span>{d.groom_name || "Arjun"}</span>
            </div>
          </div>

          {/* Skip Intro CTA */}
          <button
            onClick={handleSkip}
            style={{
              position: "absolute", bottom: 24, right: 24, zIndex: 12, background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(200,150,10,0.4)", borderRadius: 20, padding: "8px 16px",
              color: "#F8F2E4", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5,
              cursor: "pointer"
            }}
          >
            Skip Intro
          </button>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          2. MAIN WEB SITE SHELL
          ────────────────────────────────────────────────────────── */}
      {introState === "complete" && (
        <div style={{ animation: "fadeIn 1s ease-in-out" }}>
          
          {/* ──────────────────────────────────────────────────────────
              HERO / WELCOME SLIDE
              ────────────────────────────────────────────────────────── */}
          <header id="welcome-section" style={{
            position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: "0 24px",
            background: "linear-gradient(to bottom, #1A0C2E, #2E0D52)"
          }}>
            {/* Background Parallax Layers */}
            <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
              {/* Desktop background */}
              <img
                className="hidden md:block"
                src="/templates/royal-wedding-2/Hero_Background_Desktop.png"
                alt="Courtyard"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center bottom" }}
              />
              {/* Mobile background */}
              <img
                className="block md:hidden"
                src="/templates/royal-wedding-2/Hero_Background_Mobile.png"
                alt="Courtyard"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center bottom" }}
              />
            </div>

            {/* Ambient atmospheric orbs */}
            <div className="rangoli-orb rangoli-orb--1" />
            <div className="rangoli-orb rangoli-orb--2" />
            <div className="rangoli-orb rangoli-orb--3" />

            {/* Sparks rising (Flames style particles) */}
            <div className="hero-particles">
              {[...Array(15)].map((_, i) => {
                const colors = ["#C8960A", "#E8A820", "#F8F2E4", "#E8C890", "#C84060"];
                const size = Math.random() < 0.3 ? 3.5 : 2;
                return (
                  <div
                    key={i}
                    className="spark-particle"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      width: size, height: size,
                      background: colors[i % colors.length],
                      // custom properties for CSS animation
                      //@ts-ignore
                      "--dur": `${10 + Math.random() * 12}s`,
                      "--del": `${Math.random() * -18}s`,
                      "--dx": `${(Math.random() - 0.5) * 80}px`
                    }}
                  />
                );
              })}
            </div>

            {/* Subject Gopuram Temple (zooms on scroll) */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
              display: "flex", alignItems: "flex-end", justifyContent: "center"
            }}>
              <img
                className="hidden md:block"
                src="/templates/royal-wedding-2/Hero_subject_Desktop.png"
                alt="Gopuram"
                style={{
                  height: "80vh", objectFit: "contain", transformOrigin: "bottom center",
                  transform: `scale(${heroScale})`
                }}
              />
              <img
                className="block md:hidden"
                src="/templates/royal-wedding-2/Hero_subject_Mobile.png"
                alt="Gopuram"
                style={{
                  height: "70vh", objectFit: "contain", transformOrigin: "bottom center",
                  transform: `scale(${heroScale})`
                }}
              />
            </div>

            {/* Foreground Banana Leaves (gentle sway and translation counter-parallax) */}
            <div style={{
              position: "absolute", inset: "-4%", zIndex: 3, pointerEvents: "none",
              transform: `translateY(${leafTranslateY}px)`
            }}>
              <img
                className="hidden md:block float-leaves"
                src="/templates/royal-wedding-2/Hero_foreground_Desktop.png"
                alt="Banana Leaves"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <img
                className="block md:hidden float-leaves"
                src="/templates/royal-wedding-2/Hero_foreground_mobile.png"
                alt="Banana Leaves"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Floating falling leaves */}
            <div style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }}>
              <img
                className="swan-l"
                src="/templates/royal-wedding-2/Element_4.png"
                alt="Leaf"
                style={{ position: "absolute", width: 64, top: "25%", left: "10%", opacity: 0.85 }}
              />
              <img
                className="swan-r"
                src="/templates/royal-wedding-2/Element_5.png"
                alt="Leaf"
                style={{ position: "absolute", width: 56, top: "35%", right: "12%", opacity: 0.85 }}
              />
            </div>

            {/* Couple names & countdown */}
            <div 
              className="hero-copy"
              style={{
                position: "absolute", top: "10%", left: 0, right: 0, zIndex: 9,
                display: "flex", flexDirection: "column", alignItems: "center",
                textAlign: "center", pointerEvents: "none",
                opacity: namesOpacity,
                transform: `translateY(${namesTranslateY}px)`,
                filter: `blur(${namesBlur})`,
                letterSpacing: namesSpacing
              }}
            >
              <h1 className="royal-display" style={{
                fontSize: "clamp(2rem, 7vw, 4.5rem)", color: "#E8C890", fontWeight: 400,
                lineHeight: 1.1, textShadow: "0 2px 28px rgba(200,150,10,0.6)"
              }}>
                <ET fid="bride_name" data={d} onChange={oc} editMode={em} />
                <span className="royal-script block md:inline" style={{ fontSize: "0.6em", margin: "0 16px", color: "#F8F2E4" }}>weds</span>
                <ET fid="groom_name" data={d} onChange={oc} editMode={em} />
              </h1>
              
              <p className="royal-display" style={{ fontSize: "1.1rem", letterSpacing: 3, textTransform: "uppercase", color: "#F8F2E4", marginTop: 14 }}>
                <ET fid="wedding_date" data={d} onChange={oc} editMode={em} />
              </p>
              
              <div className="hc-countdown" style={{ marginTop: 20 }}>
                <div className="hc-cd-unit">
                  <span className="hc-cd-num">Kapaleeshwarar</span>
                  <span className="hc-cd-label">Temple, Chennai</span>
                </div>
              </div>
            </div>

            {/* Scroll Nudge */}
            <div className="scroll-nudge" style={{ opacity: Math.max(0, 1 - heroP / 0.18) }}>
              <span>Scroll down</span>
              <div className="sn-line"><div className="sn-dot" /></div>
            </div>

            {/* Music Control floating button */}
            {!em && (
              <button
                onClick={toggleMusic}
                style={{
                  position: "fixed", bottom: 24, left: 24, zIndex: 100,
                  width: 52, height: 52, borderRadius: "50%", background: "rgba(26,12,46,0.9)",
                  border: "2px solid #C8960A", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.5)", cursor: "pointer", transition: "transform 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                {musicPlaying ? (
                  <Pause size={18} color="#E8C890" />
                ) : (
                  <Play size={18} color="#E8C890" style={{ marginLeft: 3 }} />
                )}
              </button>
            )}
          </header>

          {/* ──────────────────────────────────────────────────────────
              WATER FLOW BRIDGE (Swans swimming across waves)
              ────────────────────────────────────────────────────────── */}
          <div className="water-bridge">
            <div className="wb-sky" />
            <div className="wb-horizon" />
            
            <div className="wb-water-wrap">
              {/* Back Wave */}
              <div className="wb-wave wb-wave--1" style={{ opacity: 0.7 }}>
                <svg viewBox="0 0 2880 320" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                  <path d="M0,160 C240,100 480,220 720,160 C960,100 1200,220 1440,160 C1680,100 1920,220 2160,160 C2400,100 2640,220 2880,160 L2880,320 L0,320 Z" fill="#3A1060" />
                </svg>
              </div>

              {/* Mid Wave */}
              <div className="wb-wave wb-wave--2" style={{ opacity: 0.85 }}>
                <svg viewBox="0 0 2880 280" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                  <path d="M0,130 C360,60  720,200 1080,130 C1440,60  1800,200 2160,130 C2520,60  2760,180 2880,130 L2880,280 L0,280 Z" fill="#220A42" />
                </svg>
              </div>

              {/* Front Wave */}
              <div className="wb-wave wb-wave--3">
                <svg viewBox="0 0 2880 220" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                  <path d="M0,100 C180,50  360,150 540,100 C720,50  900,150 1080,100 C1260,50 1440,150 1620,100 C1800,50 1980,150 2160,100 C2340,50 2610,140 2880,100 L2880,220 L0,220 Z" fill="#2A0C50" />
                </svg>
              </div>

              {/* Shimmer Streaks */}
              <div className="wb-shimmer">
                <div className="wb-sh wb-sh--1" />
                <div className="wb-sh wb-sh--2" />
                <div className="wb-sh wb-sh--3" />
                <div className="wb-sh wb-sh--4" />
              </div>

              {/* Swan A (swimming left-to-right) */}
              <div className="wb-swan swan-l" style={{ bottom: "25%", left: "-10%" }}>
                <img src="/templates/royal-wedding-2/Element_7.png" alt="Swan" style={{ width: 100 }} />
                <div className="wb-swan-wake wb-swan-wake--b" />
              </div>

              {/* Swan B (swimming right-to-left flipped) */}
              <div className="wb-swan swan-r" style={{ bottom: "15%", right: "-10%" }}>
                <img src="/templates/royal-wedding-2/Element_7.png" alt="Swan" style={{ width: 85, transform: "scaleX(-1)" }} />
                <div className="wb-swan-wake wb-swan-wake--a" />
              </div>
            </div>
            
            <div className="wb-veil-bottom" />
          </div>

          {/* ──────────────────────────────────────────────────────────
              3. INVITATION & BLESSINGS
              ────────────────────────────────────────────────────────── */}
          <section id="invite-section" className="s-invite">
            {/* Ambient moving lotuses inside the purple water */}
            <div className="si-water-bg">
              <div className="si-water-base" />
              <div className="si-lotuses">
                <img className="si-lotus si-lotus--1" src="/templates/royal-wedding-2/Element_8.png" alt="Lotus" />
                <img className="si-lotus si-lotus--2" src="/templates/royal-wedding-2/Element_8.png" alt="Lotus" />
                <img className="si-lotus si-lotus--3" src="/templates/royal-wedding-2/Element_8.png" alt="Lotus" />
              </div>
            </div>

            {/* Banana Toran Swaying */}
            <div className="toran">
              <img src="/templates/royal-wedding-2/Background_4.png" alt="Toran" className="toran-img" />
            </div>

            <div className="container" style={{ position: "relative", zIndex: 5 }}>
              <div className="invite-card card-bloom-effect">
                {/* Corner ornaments */}
                <div className="card-tl" style={{ opacity: 0.35 }}>
                  <svg viewBox="0 0 52 52" width="46">
                    <path d="M6,46 Q24,-6 48,14 Q62,32 36,44Z" fill="none" stroke="#C8960A" strokeWidth=".8" />
                  </svg>
                </div>
                <div className="card-tr" style={{ opacity: 0.35 }}>
                  <svg viewBox="0 0 52 52" width="46">
                    <path d="M46,46 Q28,-6 4,14 Q-10,32 16,44Z" fill="none" stroke="#C8960A" strokeWidth=".8" />
                  </svg>
                </div>

                {/* Tanjore Ganesha Breathing */}
                <div className="i-ganesha">
                  <img src="/templates/royal-wedding-2/Element_6.png" alt="Ganesha" className="i-ganesha-img ganesha-pulse" />
                </div>

                <p className="i-bless royal-display">
                  With the blessings of the Almighty<br />
                  and in the loving memory of our ancestors
                </p>
                <p className="i-bless" style={{ color: "#E8C890", fontSize: 13, textTransform: "uppercase", letterSpacing: 2 }}>
                  <ET fid="blessings" data={d} onChange={oc} editMode={em} />
                </p>
                <p className="i-bless" style={{ color: "#E8C890", fontSize: 13, textTransform: "uppercase", letterSpacing: 2, marginTop: -4 }}>
                  <ET fid="blessings_2" data={d} onChange={oc} editMode={em} />
                </p>

                <p className="i-label">Together with our families, we invite you to celebrate the wedding of</p>

                <div className="i-names royal-display">
                  <span className="i-bride"><ET fid="bride_name" data={d} onChange={oc} editMode={em} /></span>
                  <span className="i-amp">&amp;</span>
                  <span className="i-groom"><ET fid="groom_name" data={d} onChange={oc} editMode={em} /></span>
                </div>

                <div className="i-fam">
                  <div className="fam-side">
                    <em>Daughter of</em>
                    <p style={{ color: "#F8F2E4", fontWeight: 700, margin: 0 }}>
                      <ET fid="bride_parents" data={d} onChange={oc} editMode={em} />
                    </p>
                  </div>
                  <div className="fam-dot">◆</div>
                  <div className="fam-side">
                    <em>Son of</em>
                    <p style={{ color: "#F8F2E4", fontWeight: 700, margin: 0 }}>
                      <ET fid="groom_parents" data={d} onChange={oc} editMode={em} />
                    </p>
                  </div>
                </div>

                <p className="i-close" style={{ color: "#C8960A", letterSpacing: 1 }}>Join us on these auspicious ceremonies</p>
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────
              4. EVENTS SCHEDULE (TIMELINE JOURNEY DRAWN ON SCROLL)
              ────────────────────────────────────────────────────────── */}
          <section id="events-section" className="s-events">
            {/* Background pattern */}
            <img className="bg-fill" src="/templates/royal-wedding-2/Background_3.png" alt="Pattern" />
            <div className="ev-paper-veil" />

            <div className="container">
              <div className="s-head">
                <span className="sh-eye">Celebration Timings</span>
                <h2 className="sh-h royal-display">Our <em>Ceremonies</em></h2>
                
                {/* Kolam underline divider */}
                <div className="sh-line-wrap drawn" style={{ marginTop: 16 }}>
                  <svg viewBox="0 0 320 18" width="320" height="18" style={{ overflow: "visible" }}>
                    <path d="M10,9 L55,9 L65,4 L75,9 L85,14 L95,9 L160,9 L225,9 L235,4 L245,9 L255,14 L265,9 L310,9" fill="none" stroke="#C8960A" strokeWidth="1" />
                    <circle cx="160" cy="9" r="4" fill="#4A1E6E" />
                  </svg>
                </div>
              </div>

              {/* Event grid schedule */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 32, position: "relative", zIndex: 5, padding: "0 12px"
              }}>
                {[
                  { key: "mehendi", name: "Mehendi", defaultIcon: "icon-mehendi.png", defaultDate: "11 Dec · 3:00 PM" },
                  { key: "haldi", name: "Haldi", defaultIcon: "icon-haldi.png", defaultDate: "11 Dec · 9:00 AM" },
                  { key: "cocktail", name: "Cocktail", defaultIcon: "icon-cocktail.png", defaultDate: "11 Dec · 7:00 PM" },
                  { key: "sagan", name: "Nischayathartham", defaultIcon: "icon-sagan.png", defaultDate: "11 Dec · 5:00 PM" },
                  { key: "shaadi", name: "Kalyanam", defaultIcon: "icon-shaadi.png", defaultDate: "12 Dec · 8:00 AM" },
                  { key: "reception", name: "Reception", defaultIcon: "icon-reception.png", defaultDate: "12 Dec · 7:00 PM" }
                ].map((evt, idx) => {
                  const date = d[`${evt.key}_date`] || evt.defaultDate;
                  const venue = d[`${evt.key}_venue`] || "Kapaleeshwarar Mandapam";
                  const note = d[`${evt.key}_note`] || "Traditional Indian ethnic dress encouraged";

                  return (
                    <article
                      key={evt.key}
                      data-idx={idx}
                      className="scroll-card"
                      style={{
                        background: "rgba(255, 255, 255, 0.65)",
                        border: "1px solid rgba(200, 150, 10, 0.4)",
                        borderRadius: 16, padding: 24, textAlign: "center",
                        boxShadow: "0 8px 30px rgba(74,30,110,0.06)",
                        transition: "all 0.3s ease"
                      }}
                    >
                      {/* Icon */}
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                        <div style={{ position: "relative", width: 72, height: 72 }}>
                          <img
                            src={`/templates/royal-wedding-2/${evt.defaultIcon}`}
                            alt={evt.name}
                            style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
                          />
                        </div>
                      </div>

                      {/* Details */}
                      <h3 className="royal-display" style={{ fontSize: "1.45rem", color: "#4A1E6E", fontWeight: 700, margin: "0 0 6px" }}>
                        {evt.name}
                      </h3>
                      
                      <p className="lato-text" style={{ fontSize: 12, fontWeight: 700, color: "#C8960A", letterSpacing: 1, margin: "0 0 10px" }}>
                        <ET fid={`${evt.key}_date`} data={d} onChange={oc} editMode={em} />
                      </p>

                      <div style={{ borderTop: "1px dashed rgba(200,150,10,0.25)", paddingTop: 10, marginTop: 8 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1A0C2E" }}>
                          📍 <ET fid={`${evt.key}_venue`} data={d} onChange={oc} editMode={em} />
                        </p>
                        <p style={{ margin: "4px 0 12px", fontSize: 12, fontStyle: "italic", color: "rgba(26,12,46,0.6)" }}>
                          <ET fid={`${evt.key}_note`} data={d} onChange={oc} editMode={em} />
                        </p>

                        {/* Interactive Google Map buttons */}
                        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                          <button
                            onClick={() => handleMapSearch(venue)}
                            style={{
                              background: "none", border: "1px solid rgba(200,64,96,0.3)", borderRadius: 14,
                              padding: "4px 10px", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5,
                              color: "#C84060", cursor: "pointer", fontWeight: 700
                            }}
                          >
                            🔍 Search Location
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────
              5. STORY (KANJIVARAM SILK CURTAIN REVEAL ON SCROLL)
              ────────────────────────────────────────────────────────── */}
          <section id="couple-section" className="s-story" ref={storySectionRef}>
            <div className="st-paper-bg" />
            
            <div className="st-stage">
              {/* Parted Curtains container */}
              <div className="st-curtains">
                {/* Left Curtain */}
                <div className="st-curt st-curt-l" style={{ transform: `translateX(-${(curtainPart * 100).toFixed(2)}%)` }}>
                  <img src="/templates/royal-wedding-2/Element_Curtain.png" alt="Curtain" className="st-curt-img" style={{ right: 0 }} />
                  <div className="st-curt-shadow st-curt-shadow-l" />
                </div>

                {/* Right Curtain */}
                <div className="st-curt st-curt-r" style={{ transform: `translateX(${(curtainPart * 100).toFixed(2)}%)` }}>
                  <img src="/templates/royal-wedding-2/Element_Curtain.png" alt="Curtain" className="st-curt-img" style={{ left: 0, transform: "scaleX(-1)" }} />
                  <div className="st-curt-shadow st-curt-shadow-r" />
                </div>
              </div>

              {/* Reveal Couple Characters */}
              <div 
                className="st-char st-bride" 
                style={{ 
                  transform: `translateX(-${(curtainPart * 26).toFixed(1)}px) scale(${(1 - curtainPart * 0.034).toFixed(3)})`,
                  opacity: curtainPart > 0.15 ? 1 : 0, transition: "opacity 0.6s ease"
                }}
              >
                <img src="/templates/royal-wedding-2/Element_Bride.png" alt="Bride" className="st-char-img" />
              </div>

              <div 
                className="st-char st-groom" 
                style={{ 
                  transform: `translateX(${(curtainPart * 26).toFixed(1)}px) scale(${(1 - curtainPart * 0.034).toFixed(3)})`,
                  opacity: curtainPart > 0.15 ? 1 : 0, transition: "opacity 0.6s ease"
                }}
              >
                <img src="/templates/royal-wedding-2/Element_Groom.png" alt="Groom" className="st-char-img" />
              </div>

              {/* Story Content (revealed behind parted curtains) */}
              <div className={`st-reveal ${curtainPart > 0.6 ? "revealed" : ""}`}>
                <div className="st-mandala" style={{ opacity: curtainPart > 0.6 ? 0.14 : 0 }}>
                  <svg viewBox="0 0 320 320" width="320" height="320">
                    <circle cx="160" cy="160" r="138" fill="none" stroke="rgba(74,30,110,.25)" strokeWidth="1" />
                    <circle cx="160" cy="160" r="104" fill="none" stroke="rgba(200,150,10,.2)" strokeWidth=".8" />
                  </svg>
                </div>

                <div className="st-rv-inner" style={{ opacity: curtainPart > 0.65 ? 1 : 0, transition: "opacity 1s ease" }}>
                  <div className="st-rv-header">
                    <span className="sh-eye">Meet the Couple</span>
                    <h2 className="sh-h royal-display" style={{ color: "#F8F2E4" }}>Our <em>Story</em></h2>
                  </div>
                  
                  <div className="st-rv-names royal-display">
                    <span className="st-rv-bride">{d.bride_name || "Priya"}</span>
                    <span className="st-rv-amp">&amp;</span>
                    <span className="st-rv-groom">{d.groom_name || "Arjun"}</span>
                  </div>

                  <p className="st-rv-verse lato-text" style={{ fontSize: "1.05rem", maxWidth: 440, margin: "10px auto 20px" }}>
                    <ET fid="story_body" data={d} onChange={oc} editMode={em} multiline={true} />
                  </p>

                  <div className="st-rv-tags" style={{ margin: "0 auto" }}>
                    <span className="st-rv-tag">Temple Mornings</span>
                    <span className="st-rv-tag">Filter Coffee</span>
                    <span className="st-rv-tag">Jasmine Buds</span>
                    <span className="st-rv-tag">Sandalwood paste</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="diya-div">
            <svg viewBox="0 0 600 52" width="100%" preserveAspectRatio="xMidYMid meet">
              <path d="M0,16 Q150,8 300,16 Q450,24 600,16" fill="none" stroke="#C8960A" strokeWidth=".8" opacity=".35"/>
              <path d="M293,16 L300,9 L307,16 L300,23Z" fill="#C8960A" opacity=".40"/>
            </svg>
          </div>

          {/* ──────────────────────────────────────────────────────────
              6. MEMORIES GALLERY (Polaroids hanging with light zoom)
              ────────────────────────────────────────────────────────── */}
          <section id="gallery-section" className="s-gallery">
            <div className="container">
              <div className="s-head">
                <span className="sh-eye">Our Memories</span>
                <h2 className="sh-h royal-display">The <em>Gallery</em></h2>
                
                <div className="sh-line-wrap drawn" style={{ marginTop: 16 }}>
                  <svg viewBox="0 0 320 18" width="320" height="18" style={{ overflow: "visible" }}>
                    <path d="M10,9 L55,9 L65,4 L75,9 L85,14 L95,9 L160,9 L225,9 L235,4 L245,9 L255,14 L265,9 L310,9" fill="none" stroke="#C8960A" strokeWidth="1" />
                    <circle cx="160" cy="9" r="4" fill="#4A1E6E" />
                  </svg>
                </div>
              </div>

              {/* Dynamic Photo Render */}
              <div className="gal-grid">
                {(() => {
                  const photoKeys = ["photo1", "photo2", "photo3", "photo4"];
                  Object.keys(d).forEach(k => {
                    if (k.startsWith("photo") && !photoKeys.includes(k) && /^\d+$/.test(k.replace("photo", ""))) {
                      if (d[k]) {
                        photoKeys.push(k);
                      }
                    }
                  });
                  photoKeys.sort((a, b) => {
                    const numA = parseInt(a.replace("photo", ""), 10);
                    const numB = parseInt(b.replace("photo", ""), 10);
                    return numA - numB;
                  });

                  return photoKeys.map((key, index) => {
                    const item = getPhotoConfig(key, index);
                    const imgUrl = d[key] || getPhotoDefault(key);

                    return (
                      <div 
                        key={key} 
                        className={`gal-item ${item.colSpan ? "gal-tall" : ""}`}
                        style={{ position: "relative", cursor: "pointer" }}
                      >
                        <div 
                          className="gal-ph"
                          onClick={() => !em && setActivePhoto(imgUrl)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={imgUrl} 
                            alt={`Gallery ${index + 1}`} 
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }} 
                          />
                        </div>

                        {/* Hanging Frame overlay */}
                        <img 
                          className="gal-frame" 
                          src={item.frame} 
                          alt="Frame" 
                          style={{ pointerEvents: "none" }}
                        />

                        {em && (
                          <div style={{ position: "relative", zIndex: 10, background: "rgba(26,12,46,0.9)", borderBottomLeftRadius: 8, borderBottomRightRadius: 8, padding: 4 }}>
                            <ImageUploader fid={key} data={d} onChange={oc} defaultSrc={getPhotoDefault(key)} />
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Add/Remove Images in Edit Mode */}
              {em && (() => {
                const photoKeys = ["photo1", "photo2", "photo3", "photo4"];
                Object.keys(d).forEach(k => {
                  if (k.startsWith("photo") && !photoKeys.includes(k) && /^\d+$/.test(k.replace("photo", ""))) {
                    if (d[k]) {
                      photoKeys.push(k);
                    }
                  }
                });
                photoKeys.sort((a, b) => {
                  const numA = parseInt(a.replace("photo", ""), 10);
                  const numB = parseInt(b.replace("photo", ""), 10);
                  return numA - numB;
                });
                return (
                  <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center" }}>
                    <button
                      onClick={() => {
                        const nextIdx = photoKeys.length + 1;
                        const nextKey = "photo" + nextIdx;
                        oc?.(nextKey, "/templates/royal-wedding-2/photo1.jpg");
                      }}
                      style={{
                        background: "linear-gradient(135deg, #C8960A, #b8860b)", color: "#fff",
                        border: "none", borderRadius: 24, padding: "12px 28px", fontSize: 12,
                        fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
                        boxShadow: "0 6px 16px rgba(200,150,10,0.3)"
                      }}
                    >
                      ＋ Add More Images
                    </button>
                    {photoKeys.length > 4 && (
                      <button
                        onClick={() => {
                          const lastKey = photoKeys[photoKeys.length - 1];
                          oc?.(lastKey, "");
                        }}
                        style={{
                          background: "rgba(255,255,255,0.08)", color: "#f7eedc",
                          border: "1px solid rgba(200,150,10,0.3)", borderRadius: 24,
                          padding: "12px 24px", fontSize: 12, fontWeight: 700,
                          letterSpacing: 1, textTransform: "uppercase", cursor: "pointer"
                        }}
                      >
                        － Remove Last Image
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Photo Zoom Lightbox */}
            {activePhoto && (
              <div 
                style={{
                  position: "fixed", inset: 0, zIndex: 10000, background: "rgba(26, 12, 46, 0.95)",
                  display: "flex", alignItems: "center", justifyContent: "center", padding: 24
                }}
                onClick={() => setActivePhoto(null)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activePhoto} alt="Zoomed view" style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: 12, border: "2px solid #C8960A" }} />
                <button 
                  onClick={() => setActivePhoto(null)}
                  style={{
                    position: "absolute", top: 24, right: 24, background: "rgba(255,255,255,0.1)", border: "none",
                    width: 44, height: 44, borderRadius: "50%", color: "#fff", fontSize: 20, cursor: "pointer"
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </section>

          {/* ──────────────────────────────────────────────────────────
              7. RSVP & FINALE (Fireworks background & Whatsapp Invite)
              ────────────────────────────────────────────────────────── */}
          <section id="rsvp-section" className="s-rsvp" style={{ background: "#F8F2E4", padding: "100px 0" }}>
            <div className="rsvp-paper-veil" />
            
            <div className="container rsvp-body" style={{ position: "relative", zIndex: 5, textAlign: "center" }}>
              <div className="rsvp-rule">
                <svg viewBox="0 0 400 12" width="100%" style={{ maxWidth: 400, margin: "0 auto" }}>
                  <line x1="0" y1="6" x2="168" y2="6" stroke="#C8960A" strokeWidth=".7" opacity=".35" />
                  <path d="M184,6 L192,1 L200,6 L192,11Z" fill="#C8960A" opacity=".52" />
                  <line x1="208" y1="6" x2="400" y2="6" stroke="#C8960A" strokeWidth=".7" opacity=".35" />
                </svg>
              </div>

              <span className="rsvp-eye" style={{ display: "block", marginTop: 24 }}>Join the Celebrations</span>
              <h2 className="rsvp-heading royal-display" style={{ fontSize: "2.8rem", color: "#4A1E6E", margin: "8px 0 16px" }}>
                <ET fid="rsvp_headline" data={d} onChange={oc} editMode={em} />
              </h2>
              
              <p className="rsvp-sub lato-text" style={{ maxWidth: 540, margin: "0 auto 32px", fontSize: "1rem", lineHeight: 1.7, color: "rgba(26,12,46,0.7)" }}>
                <ET fid="rsvp_body" data={d} onChange={oc} editMode={em} multiline={true} />
              </p>

              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={handleRSVP}
                  style={{
                    background: "linear-gradient(135deg, #C84060, #a6384f)", color: "#fff",
                    border: "none", borderRadius: 30, padding: "14px 36px", fontSize: 13,
                    fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(200,64,96,0.3)"
                  }}
                >
                  🙏 Yes, We Will Be There
                </button>
                <button
                  onClick={handleCalendar}
                  style={{
                    background: "none", border: "2px solid #C8960A", color: "#C8960A",
                    borderRadius: 30, padding: "12px 30px", fontSize: 13,
                    fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer"
                  }}
                >
                  📅 Add to Calendar
                </button>
              </div>

              <p className="rsvp-ps" style={{ marginTop: 14, fontSize: 12, color: "rgba(26,12,46,0.4)" }}>
                You will be redirected to WhatsApp to confirm your attendance.
              </p>

              <div className="rsvp-rule" style={{ marginTop: 24 }}>
                <svg viewBox="0 0 400 12" width="100%" style={{ maxWidth: 400, margin: "0 auto" }}>
                  <line x1="0" y1="6" x2="168" y2="6" stroke="#C8960A" strokeWidth=".7" opacity=".35" />
                  <path d="M184,6 L192,1 L200,6 L192,11Z" fill="#C8960A" opacity=".52" />
                  <line x1="208" y1="6" x2="400" y2="6" stroke="#C8960A" strokeWidth=".7" opacity=".35" />
                </svg>
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────
              FOOTER
              ────────────────────────────────────────────────────────── */}
          <footer style={{
            background: "#1A0C2E", padding: "48px 24px", textAlign: "center",
            borderTop: "1px solid rgba(200,150,10,0.25)"
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              {/* Kolam design */}
              <svg viewBox="0 0 80 44" width="66" aria-hidden="true">
                <ellipse cx="40" cy="36" rx="7" ry="14" fill="#C8960A" opacity=".18" transform="rotate(-45 40 36)"/>
                <ellipse cx="40" cy="36" rx="7" ry="14" fill="#4A1E6E" opacity=".16" transform="rotate(0 40 36)"/>
                <circle cx="40" cy="36" r="5" fill="#C8960A" opacity=".45"/>
              </svg>
            </div>
            
            <p className="royal-display" style={{ fontSize: "1.45rem", color: "#E8C890", margin: "0 0 8px", letterSpacing: 2 }}>
              {d.bride_name || "Priya"} &amp; {d.groom_name || "Arjun"}
            </p>
            <p style={{ fontSize: 11, color: "rgba(232,200,144,0.4)", textTransform: "uppercase", letterSpacing: 1.5 }}>
              Thank you for sharing our joy
            </p>
          </footer>

          {/* Background Music Settings (Slide 0 in editor) */}
          {em && forcedSlide === 0 && (
            <div style={{
              position: "fixed", top: "98px", bottom: 0, left: 0, right: 0, zIndex: 400,
              background: "rgba(26, 12, 46, 0.88)", backdropFilter: "blur(8px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: 24, textAlign: "center"
            }}>
              <div style={{
                background: "#fcf8f0", border: "4px double #C8960A", borderRadius: 20,
                padding: "40px 24px", maxWidth: 420, width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
              }}>
                <h3 className="royal-display" style={{ fontStyle: "italic", fontSize: "2rem", color: "#4A1E6E", marginBottom: 12 }}>
                  Background Music Settings
                </h3>
                <p style={{ fontSize: 14, color: "#1A0C2E", lineHeight: 1.6, marginBottom: 28 }}>
                  Select a traditional background soundtrack for your South Indian Wedding invitation card from our curated library.
                </p>

                <div style={{ background: "rgba(200,150,10,0.06)", border: "1px dashed rgba(200,150,10,0.3)", borderRadius: 12, padding: "14px 18px", marginBottom: 28 }}>
                  <p style={{ margin: 0, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#6B8E7A", fontWeight: 700 }}>Active Soundtrack</p>
                  <p style={{ margin: "6px 0 0", fontSize: 16, fontWeight: 700, color: "#1A0C2E" }}>
                    {d.bg_song_name || "Default South Indian Music"}
                  </p>
                  {d.bg_song_url && (
                    <button
                      onClick={() => {
                        oc?.("bg_song_name", "Default South Indian Music");
                        oc?.("bg_song_url", "");
                      }}
                      style={{
                        marginTop: 10, background: "none", border: "none", color: "#C84060",
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
                    background: "linear-gradient(135deg, #C84060, #a6384f)", color: "#fff",
                    border: "none", borderRadius: 30, padding: "14px 36px", fontSize: 13,
                    fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(200,64,96,0.3)"
                  }}
                >
                  🎵 Open Audio Library
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
      )}
    </div>
  );
}
