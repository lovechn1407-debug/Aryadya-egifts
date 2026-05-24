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
    <div style={{ padding: "6px 8px", background: "rgba(200, 150, 10, 0.04)", borderTop: "1px dashed rgba(200, 150, 10, 0.3)", width: "100%", borderRadius: 8, marginTop: 8 }}>
      {preview && (
        <div style={{ marginBottom: 6, textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" style={{ maxHeight: 60, borderRadius: 8, border: "2px solid #C8960A" }} />
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
          background: "#C84060", color: "#fff", border: "none", borderRadius: 8,
          padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer",
          opacity: uploading ? 0.6 : 1, width: "100%", whiteSpace: "normal", wordBreak: "break-word"
        }}>{uploading ? "Uploading…" : "📷 Change"}</button>
        {currentSrc && (
          <button onClick={useDefault} style={{
            background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb",
            borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer",
            width: "100%", whiteSpace: "normal", wordBreak: "break-word"
          }}>
            {fid.startsWith("photo") && parseInt(fid.replace("photo", ""), 10) > 4 ? "🗑️ Remove" : "🗑️ Reset"}
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
  // Determine if it takes full width (landscape style / tall span)
  const colSpan = index === 0 || (index % 4 === 0);
  const frame = colSpan
    ? "/templates/royal-wedding-2/pn-gal-fr-hanging-portrait-x-v01.webp"
    : "/templates/royal-wedding-2/pn-gal-fr-hanging-landscape-x-v01.webp";
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
  const [heroZoomProgress, setHeroZoomProgress] = useState(0);

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

      // Robust Hero Zoom Progress
      const heroEl = document.getElementById("welcome-section");
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        const travel = rect.height - window.innerHeight;
        if (travel > 0) {
          const progress = -rect.top / travel;
          const p = Math.min(1, Math.max(0, progress));
          setHeroZoomProgress(p);
        }
      }

      // Curtains calculation (early and fast)
      if (storySectionRef.current) {
        const rect = storySectionRef.current.getBoundingClientRect();
        const start = window.innerHeight * 0.95;
        const range = window.innerHeight * 0.45;
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
  const heroP = heroZoomProgress;
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
      minHeight: "100vh", position: "relative"
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
        
        /* Hero Sticky Parallax Pinning */
        .hero-wrap {
          position: relative;
          height: 112vh;
          background: #1A0C2E;
        }
        @media(max-width: 767px) {
          .hero-wrap {
            height: 108vh;
          }
        }
        .hero-pin {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
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

        /* ── Section and Container ── */
        .container {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 24px;
        }
        section {
          position: relative;
          overflow: hidden;
          padding: 100px 0;
        }
        .bg-fill {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          pointer-events: none;
          z-index: 0;
        }
        .s-head {
          text-align: center;
          margin-bottom: 56px;
          position: relative;
          z-index: 1;
        }
        .sh-eye {
          display: block;
          font-weight: 300;
          font-size: .52rem;
          letter-spacing: .40em;
          text-transform: uppercase;
          color: #C8960A;
          margin-bottom: 12px;
        }
        .sh-h {
          font-family: 'Cinzel', Georgia, serif;
          font-weight: 400;
          letter-spacing: .06em;
          font-size: clamp(1.9rem, 5vw, 3.2rem);
          color: #1A0C2E;
          line-height: 1.15;
        }
        .sh-h em {
          font-style: italic;
          color: #4A1E6E;
        }
        .sh-line-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 40px;
        }

        /* ── Water Flow Bridge ── */
        .water-bridge {
          position: relative;
          width: 100%;
          height: 420px;
          overflow: hidden;
          z-index: 10;
        }
        @media(max-width:768px) {
          .water-bridge { height: 320px; }
        }
        .wb-sky {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #1A0530 0%, #2E0D52 25%, #3C1268 55%, #2A0D4A 80%, #1A0835 100%);
        }
        .wb-horizon {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: radial-gradient(ellipse 70% 100% at 50% 0%, rgba(200,120,10,.22) 0%, rgba(180,80,10,.08) 40%, transparent 100%);
          pointer-events: none;
          z-index: 2;
        }
        .wb-water-wrap {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 68%;
          overflow: hidden;
        }
        .wb-wave {
          position: absolute;
          top: 0;
          left: 0;
          width: 200%;
          height: 100%;
          will-change: transform;
        }
        .wb-wave--1 {
          animation: wbScroll 18s linear infinite;
          top: -10px;
        }
        .wb-wave--2 {
          animation: wbScroll 12s linear infinite reverse;
          top: -5px;
        }
        .wb-wave--3 {
          animation: wbScroll 7s linear infinite;
          top: 0;
        }
        @keyframes wbScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .wb-shimmer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 4;
          overflow: hidden;
        }
        .wb-sh {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,150,10,.35), rgba(255,200,80,.55), rgba(200,150,10,.35), transparent);
          border-radius: 50%;
          filter: blur(1px);
          animation: shimmerDrift 6s ease-in-out infinite;
        }
        .wb-sh--1 { width: 28%; top: 22%; left: 8%; animation-delay: 0s; animation-duration: 7s; }
        .wb-sh--2 { width: 18%; top: 44%; left: 55%; animation-delay: 2.2s; animation-duration: 9s; }
        .wb-sh--3 { width: 22%; top: 33%; left: 30%; animation-delay: 4.1s; animation-duration: 6s; }
        .wb-sh--4 { width: 14%; top: 58%; left: 72%; animation-delay: 1.5s; animation-duration: 8s; }
        @keyframes shimmerDrift {
          0%, 100% { opacity: .4; transform: translateX(0) scaleX(1); }
          50% { opacity: .9; transform: translateX(18px) scaleX(1.12); }
        }
        .wb-swan {
          position: absolute;
          bottom: 20%;
          z-index: 6;
          filter: drop-shadow(0 8px 24px rgba(200,150,10,.50)) drop-shadow(0 2px 8px rgba(74,30,110,.60));
        }
        .wb-swan-wake {
          position: absolute;
          bottom: -4px;
          height: 6px;
          background: linear-gradient(90deg, rgba(200,150,10,.25), transparent);
          border-radius: 0 50% 50% 0;
          pointer-events: none;
          filter: blur(2px);
          animation: wakeBreath 4s ease-in-out infinite;
        }
        .wb-swan-wake--a { right: 100%; width: 60px; transform-origin: right center; }
        .wb-swan-wake--b { left: 100%; width: 60px; transform: scaleX(-1); transform-origin: left center; }
        @keyframes wakeBreath {
          0%, 100% { opacity: .5; width: 50px; }
          50% { opacity: .9; width: 80px; }
        }
        .wb-veil-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: linear-gradient(180deg, transparent 0%, #1A0535 100%);
          pointer-events: none;
          z-index: 20;
        }

        /* ── Toran ── */
        .toran {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 160px;
          overflow: hidden;
          z-index: 2;
          pointer-events: none;
        }
        .toran-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          animation: toranSway 9s ease-in-out infinite;
          transform-origin: top center;
        }
        @keyframes toranSway {
          0%, 100% { transform: scaleX(1) translateX(0); }
          33% { transform: scaleX(1.005) translateX(-8px); }
          66% { transform: scaleX(1.005) translateX(6px); }
        }

        /* ── Invitation Card ── */
        .s-invite {
          background: #1A0535;
          padding-top: 0;
          padding-bottom: 100px;
          overflow: hidden;
        }
        .si-water-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .si-water-base {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #1A0535 0%, #2A0A48 20%, #350E58 45%, #2A0A48 75%, #1A0535 100%);
        }
        .si-lotuses {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .si-lotus {
          position: absolute;
          mix-blend-mode: screen;
          filter: drop-shadow(0 6px 20px rgba(200,150,10,.45)) drop-shadow(0 0 40px rgba(200,150,10,.20));
          will-change: transform;
        }
        .si-lotus--1 {
          width: clamp(80px, 9vw, 130px);
          bottom: 8%;
          left: 4%;
          opacity: .70;
          animation: siLotusFloat 7s ease-in-out infinite 0s, siLotusDrift 28s linear infinite 0s;
        }
        .si-lotus--2 {
          width: clamp(60px, 7vw, 100px);
          bottom: 14%;
          right: 6%;
          opacity: .65;
          animation: siLotusFloat 8s ease-in-out infinite 2s, siLotusDrift 34s linear infinite reverse 0s;
        }
        .si-lotus--3 {
          width: clamp(50px, 5.5vw, 80px);
          bottom: 4%;
          left: 30%;
          opacity: .45;
          animation: siLotusFloat 6s ease-in-out infinite 4s, siLotusDrift 40s linear infinite 5s;
        }
        @keyframes siLotusFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg) scale(1); }
          50% { transform: translateY(-10px) rotate(2deg) scale(1.02); }
        }
        @keyframes siLotusDrift {
          0% { margin-left: 0; }
          50% { margin-left: 30px; }
          100% { margin-left: 0; }
        }
        .invite-card {
          max-width: 540px;
          margin: 0 auto;
          background: rgba(248, 242, 228, 0.12);
          backdrop-filter: blur(24px) saturate(160%) brightness(1.10);
          -webkit-backdrop-filter: blur(24px) saturate(160%) brightness(1.10);
          border-top: 1px solid rgba(255, 255, 255, 0.50);
          border-left: 1px solid rgba(255, 255, 255, 0.38);
          border-right: 1px solid rgba(200, 150, 10, .35);
          border-bottom: 1px solid rgba(200, 150, 10, .35);
          padding: 52px 44px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.40), 0 8px 60px rgba(0,0,0,.45), 0 0 0 1px rgba(200,150,10,.15), 0 0 80px rgba(200,100,10,.12);
        }
        @media(max-width:480px) {
          .invite-card { padding: 36px 18px; }
        }
        .card-tl, .card-tr {
          position: absolute;
          top: 0;
        }
        .card-tl { left: 0; }
        .card-tr { right: 0; }
        .i-ganesha {
          margin-bottom: 16px;
          display: flex;
          justify-content: center;
        }
        .i-ganesha-img {
          width: 100px;
          height: 100px;
          object-fit: contain;
          mix-blend-mode: screen;
          filter: drop-shadow(0 6px 20px rgba(200,150,10,.50));
        }
        .i-bless {
          font-family: 'Lato', sans-serif;
          font-style: italic;
          font-size: .88rem;
          line-height: 2.1;
          color: #F8F2E4;
          margin-bottom: 12px;
          text-shadow: 0 1px 8px rgba(0,0,0,.40);
        }
        .i-label {
          font-size: .50rem;
          font-weight: 400;
          letter-spacing: .34em;
          text-transform: uppercase;
          color: #E8C890;
          margin-bottom: 12px;
          opacity: .90;
        }
        .i-names {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 10px;
          margin: 4px 0 16px;
          flex-wrap: wrap;
        }
        .i-bride, .i-groom {
          font-family: 'Cinzel', Georgia, serif;
          font-weight: 400;
          letter-spacing: .08em;
          font-size: clamp(1.9rem, 5.8vw, 3.2rem);
          color: #F8F2E4;
          text-shadow: 0 2px 20px rgba(200,150,10,.50);
        }
        .i-amp {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 1.4rem;
          color: #C8960A;
        }
        .i-fam {
          display: flex;
          gap: 22px;
          justify-content: center;
          flex-wrap: wrap;
          margin: 14px 0;
          font-family: 'Raleway', sans-serif;
          font-weight: 300;
          font-size: .77rem;
          line-height: 2;
          color: rgba(232, 200, 144, .75);
        }
        .i-fam em {
          font-style: italic;
          font-weight: 700;
          color: #E8C890;
          display: block;
          font-size: .86rem;
        }
        .fam-dot {
          color: #C8960A;
          align-self: center;
          font-size: .7rem;
          opacity: .75;
        }
        .i-close {
          font-family: 'Lato', sans-serif;
          font-style: italic;
          font-size: .83rem;
          color: rgba(248, 242, 228, .70);
          margin-top: 12px;
        }

        /* ── Events Schedule ── */
        .s-events {
          background: #E8E0F4;
          padding: 120px 0 160px;
          position: relative;
        }
        .s-events .bg-fill {
          opacity: .09;
          mix-blend-mode: multiply;
        }
        .ev-paper-veil {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: linear-gradient(180deg, rgba(238,232,248,.90) 0%, rgba(230,220,245,.82) 100%);
          pointer-events: none;
        }

        /* ── Story Section (Parting Curtains & Couples) ── */
        .s-story {
          position: relative;
          background: #1A0C2E;
          padding: 0;
          overflow: hidden;
        }
        .st-paper-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 75% 60% at 50% 48%, rgba(200,120,10,.22) 0%, rgba(200,100,10,.10) 35%, transparent 65%),
            radial-gradient(ellipse 55% 45% at 20% 80%, rgba(74,30,110,.35) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 80% 75%, rgba(74,30,110,.28) 0%, transparent 50%),
            linear-gradient(180deg, #1A0C2E 0%, #2E0D52 30%, #3C1268 55%, #220A3A 80%, #120828 100%);
        }
        .st-stage {
          position: relative;
          width: 100%;
          height: 720px;
          overflow: hidden;
        }
        @media(max-width:900px) {
          .st-stage { height: 600px; }
        }
        @media(max-width:600px) {
          .st-stage { height: 520px; }
        }
        @media(max-width:420px) {
          .st-stage { height: 460px; }
        }
        .st-reveal {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          text-align: center;
          pointer-events: none;
          padding: 48px 24px 60px;
        }
        .st-mandala {
          position: absolute;
          top: 38%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 1.6s ease .8s;
          animation: storyMandalaSpin 45s linear infinite;
        }
        .st-reveal.revealed .st-mandala {
          opacity: 0.14;
        }
        @keyframes storyMandalaSpin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .st-rv-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .st-rv-header {
          margin-bottom: 14px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 1.0s cubic-bezier(0.22,1.2,0.36,1), transform 1.0s cubic-bezier(0.22,1.2,0.36,1);
        }
        .st-reveal.revealed .st-rv-header {
          opacity: 1;
          transform: translateY(0);
        }
        .st-rv-header .sh-eye {
          color: rgba(200, 150, 10, .85);
        }
        .st-rv-header .sh-h {
          font-size: clamp(1.7rem, 4vw, 2.8rem);
          line-height: 1.15;
          color: #F8F2E4;
        }
        .st-rv-header .sh-h em {
          color: #C8960A;
        }
        .st-rv-names {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 10px;
          opacity: 0;
          transform: translateY(28px) scale(.82);
          transition: opacity 1.2s cubic-bezier(0.22,1.2,0.36,1) .22s, transform 1.2s cubic-bezier(0.22,1.2,0.36,1) .22s;
        }
        .st-reveal.revealed .st-rv-names {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .st-rv-bride, .st-rv-groom {
          font-family: 'Cinzel', Georgia, serif;
          font-weight: 400;
          letter-spacing: .08em;
          font-size: clamp(2.2rem, 5.2vw, 4rem);
          color: #E8C890;
          text-shadow: 0 2px 24px rgba(200, 150, 10, .40);
        }
        .st-rv-amp {
          font-family: 'Cinzel', Georgia, serif;
          font-size: clamp(1.1rem, 2.4vw, 1.7rem);
          color: #C8960A;
        }
        .st-rv-verse {
          font-family: 'Lato', sans-serif;
          font-style: italic;
          font-size: clamp(.84rem, 1.8vw, .98rem);
          color: rgba(232, 200, 144, .80);
          line-height: 2;
          margin-bottom: 16px;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity .9s ease .44s, transform .9s ease .44s;
        }
        .st-reveal.revealed .st-rv-verse {
          opacity: .80;
          transform: translateY(0);
        }
        .st-rv-tags {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 10px;
          width: min(360px, 88%);
          justify-items: stretch;
        }
        .st-rv-tag {
          font-size: .52rem;
          font-weight: 300;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: #E8C890;
          padding: 7px 14px;
          background: rgba(255, 255, 255, .06);
          border: 1px solid rgba(200, 150, 10, .30);
          text-align: center;
          opacity: 0;
          transform: translateY(10px) scale(.95);
          transition: opacity .6s cubic-bezier(0.22,1.2,0.36,1), transform .6s cubic-bezier(0.22,1.2,0.36,1);
          backdrop-filter: blur(4px);
        }
        .st-reveal.revealed .st-rv-tag {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .st-rv-tag:nth-child(1) { transition-delay: .58s; }
        .st-rv-tag:nth-child(2) { transition-delay: .72s; }
        .st-rv-tag:nth-child(3) { transition-delay: .86s; }
        .st-rv-tag:nth-child(4) { transition-delay: 1.00s; }
        .st-curtains {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 4;
          pointer-events: none;
        }
        .st-curt {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 50%;
          overflow: hidden;
          will-change: transform;
          transition: filter 1.6s ease;
          background: linear-gradient(180deg, #2E0D52 0%, #3C1268 35%, #4A1878 60%, #2E0D52 100%);
        }
        .st-curt-l { left: 0; transform-origin: left center; }
        .st-curt-r { right: 0; transform-origin: right center; }
        .st-curt-img {
          display: block;
          position: absolute;
          top: 0;
          height: 100%;
          width: auto;
          max-width: none;
        }
        .st-curt-l .st-curt-img { right: 0; left: auto; filter: drop-shadow(8px 0 40px rgba(0, 0, 0, .60)); }
        .st-curt-r .st-curt-img { left: 0; right: auto; transform: scaleX(-1); filter: drop-shadow(-8px 0 40px rgba(0, 0, 0, .60)); }
        .st-curt-shadow {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 60px;
          pointer-events: none;
          z-index: 2;
        }
        .st-curt-shadow-l { right: 0; background: linear-gradient(to right, transparent, rgba(0,0,0,.45)); }
        .st-curt-shadow-r { left: 0; background: linear-gradient(to left, transparent, rgba(0,0,0,.45)); }
        .st-char {
          position: absolute;
          bottom: 0;
          z-index: 6;
          pointer-events: none;
          width: clamp(150px, 18vw, 240px);
        }
        .st-bride { left: calc(50% - clamp(150px, 18vw, 240px) - 10px); transform-origin: right bottom; }
        .st-groom { right: calc(50% - clamp(150px, 18vw, 240px) - 10px); transform-origin: left bottom; }
        .st-char-img {
          display: block;
          width: 100%;
          height: clamp(260px, 52vh, 460px);
          object-fit: contain;
          object-position: bottom center;
          mix-blend-mode: normal;
          filter: drop-shadow(0 8px 32px rgba(0,0,0,.50));
        }
        .st-groom .st-char-img { height: clamp(312px, 62vh, 552px); }
        @media(max-width:600px) {
          .st-bride { left: 0; }
          .st-groom { right: 0; }
          .st-char { width: clamp(110px, 28vw, 170px); }
          .st-char-img { height: clamp(200px, 42vh, 320px); }
        }

        /* Divider */
        .diya-div {
          padding: 4px 0;
          background: linear-gradient(180deg, #F2EAD4 0%, #1A0C2E 100%);
          line-height: 0;
        }
        .diya-div svg {
          width: 100%;
          display: block;
        }

        /* ── Gallery Section ── */
        .s-gallery {
          background: linear-gradient(180deg, #1A0C2E 0%, #220A3A 40%, #1A0C2E 100%);
          position: relative;
          overflow: hidden;
        }
        .s-gallery::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(ellipse 70% 55% at 50% 42%, rgba(200,150,10,.12) 0%, transparent 65%),
            radial-gradient(ellipse 40% 35% at 10% 80%, rgba(74,30,110,.18) 0%, transparent 55%),
            radial-gradient(ellipse 35% 30% at 90% 15%, rgba(74,30,110,.14) 0%, transparent 55%);
        }
        .gal-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media(min-width:640px) {
          .gal-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }
        .gal-item {
          background: #FDFBF7;
          border: 4px solid #4A0E17; /* Deep Kanjivaram Maroon Red */
          box-shadow: inset 0 0 0 2px #C8960A, 0 10px 25px rgba(26, 12, 46, 0.22); /* Inset gold border + soft shadow */
          border-radius: 8px;
          padding: 12px 12px 18px 12px;
          transition: transform 0.4s cubic-bezier(0.22,1.2,0.36,1), box-shadow 0.4s;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
          margin-top: 14px; /* Room for the hanging pin */
        }
        .gal-item:hover {
          transform: translateY(-8px) scale(1.03) rotate(1.5deg);
          box-shadow: inset 0 0 0 2px #E8C890, 0 20px 40px rgba(26, 12, 46, 0.35); /* Brighter gold line on hover */
          border-color: #5C0612;
        }
        /* Pure CSS Golden Push-pins and Strings for hanging gallery feel */
        .gal-item::before {
          content: '✿';
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          color: #C8960A;
          font-size: 18px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.4);
          z-index: 3;
          line-height: 1;
        }
        .gal-item::after {
          content: '';
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 1.5px;
          height: 14px;
          background: linear-gradient(to bottom, #C8960A, rgba(200,150,10,0.4));
          z-index: 2;
        }
        .gal-tall {
          aspect-ratio: 3/4.5;
        }
        @media(min-width:640px) {
          .gal-tall {
            grid-row: span 2;
            aspect-ratio: 3/5.2;
          }
        }
        .gal-item:not(.gal-tall) {
          aspect-ratio: 4/4.5;
        }
        .gal-ph {
          width: 100%;
          position: relative;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          border: 1.5px solid #C8960A; /* Fine gold border around image */
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.15);
        }
        /* 3:4 aspect ratio for tall portrait cards */
        .gal-tall .gal-ph {
          aspect-ratio: 3/4;
        }
        /* 4:3 aspect ratio for wide landscape cards */
        .gal-item:not(.gal-tall) .gal-ph {
          aspect-ratio: 4/3;
        }
        .gal-ph img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ── RSVP ── */
        .s-rsvp {
          position: relative;
          background: #F8F2E4;
          padding: 120px 0 100px;
          overflow: hidden;
        }
        .rsvp-paper-veil {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: radial-gradient(ellipse 62% 52% at 50% 32%, rgba(200,150,10,.14) 0%, transparent 60%), linear-gradient(180deg, #F8F2E4 0%, #E8C890 100%);
        }

        /* ── Floating leaf rules ── */
        .hero-floats {
          position: absolute;
          inset: 0;
          z-index: 8;
          pointer-events: none;
        }
        .fl {
          position: absolute;
          mix-blend-mode: multiply;
        }
        .fall-l {
          width: clamp(44px, 5.8vw, 80px);
          left: 7%;
          animation: fallLeaf 9s ease-in-out infinite;
          opacity: .88;
          filter: drop-shadow(0 4px 12px rgba(26,12,46,.18));
        }
        .fall-r {
          width: clamp(38px, 5.2vw, 70px);
          right: 7%;
          animation: fallLeaf 11s ease-in-out infinite 3s;
          opacity: .88;
          filter: drop-shadow(0 4px 12px rgba(26,12,46,.18));
        }
        @keyframes fallLeaf {
          0% { transform: translateY(-70px) rotate(-20deg); opacity: 0; }
          6% { opacity: .75; }
          40% { transform: translateY(28vh) rotate(14deg) translateX(18px); opacity: .75; }
          75% { transform: translateY(62vh) rotate(-14deg) translateX(-12px); opacity: .45; }
          100% { transform: translateY(102vh) rotate(7deg) translateX(9px); opacity: 0; }
        }
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
          <div className="hero-wrap" id="welcome-section">
            <div className="hero-pin">
              <header style={{
                position: "relative", height: "100%", display: "flex", flexDirection: "column",
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
            <div className="hero-floats" aria-hidden="true">
              <img
                className="fl fall-l"
                src="/templates/royal-wedding-2/Element_204.png"
                alt="Leaf"
              />
              <img
                className="fl fall-r"
                src="/templates/royal-wedding-2/Element_205.png"
                alt="Leaf"
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
            </div>
          </div>

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
              <img src="/templates/royal-wedding-2/Background_204.png" alt="Toran" className="toran-img" />
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
                  <img src="/templates/royal-wedding-2/Element_206.png" alt="Ganesha" className="i-ganesha-img ganesha-pulse" />
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
            <img className="bg-fill" src="/templates/royal-wedding-2/Background_203.png" alt="Pattern" />
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
                      
                      <p className="lato-text" style={{ fontSize: 13, fontWeight: 700, color: "#C8960A", letterSpacing: 1, margin: "0 0 10px" }}>
                        <ET fid={`${evt.key}_date`} data={d} onChange={oc} editMode={em} />
                      </p>

                      <div style={{ borderTop: "1px dashed rgba(200,150,10,0.25)", paddingTop: 10, marginTop: 8 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1A0C2E" }}>
                          📍 <ET fid={`${evt.key}_venue`} data={d} onChange={oc} editMode={em} />
                        </p>
                        <p style={{ margin: "4px 0 12px", fontSize: 14, fontStyle: "italic", color: "rgba(26,12,46,0.6)" }}>
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

                        {/* Traditional South Indian Kolam motif below photo */}
                        <div style={{ display: "flex", justifyContent: "center", marginTop: 4, opacity: 0.7 }}>
                          <svg viewBox="0 0 40 20" width="30" height="15" fill="none" stroke="#C8960A" strokeWidth="0.8">
                            <path d="M20,2 Q10,18 2,10 Q20,10 38,10 Q30,18 20,2 Z" />
                            <circle cx="20" cy="10" r="1.5" fill="#4A0E17" />
                          </svg>
                        </div>

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
                  <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", width: "100%" }}>
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
