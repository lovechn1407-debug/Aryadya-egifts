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
      display: "block", width: "100%", border: "2px solid #d8a957", borderRadius: 8,
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
      position: "relative", cursor: "text", border: "1.5px dashed rgba(216,169,87,0.7)",
      borderRadius: 6, padding: "4px 8px 18px 8px",
      background: "rgba(216,169,87,0.04)", display: "inline-block", width: "100%"
    }}>
      <span style={style}>
        {value || <em style={{ opacity: 0.4, fontSize: 13 }}>Edit field…</em>}
      </span>
      <span style={{ position: "absolute", bottom: 2, right: 6, fontSize: 9, color: "#d8a957", textTransform: "uppercase", fontWeight: 700 }}>Edit</span>
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
    <div style={{ padding: "8px 12px", background: "rgba(216,169,87,0.04)", borderTop: "1px dashed rgba(216,169,87,0.3)", width: "100%", borderRadius: 8, marginTop: 8 }}>
      {preview && (
        <div style={{ marginBottom: 6, textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" style={{ maxHeight: 80, borderRadius: 8, border: "2px solid #d8a957" }} />
        </div>
      )}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
          background: "#a6384f", color: "#fff", border: "none", borderRadius: 8,
          padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer",
          opacity: uploading ? 0.6 : 1,
        }}>{uploading ? "Uploading…" : "📷 Upload Image"}</button>
        {currentSrc && (
          <button onClick={useDefault} style={{
            background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb",
            borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer"
          }}>Reset</button>
        )}
      </div>
    </div>
  );
}

const getPhotoDefault = (key: string) => {
  if (key === "photo1") return "/templates/royal-wedding/Arch_Demo2.png";
  if (key === "photo2") return "/templates/royal-wedding/Arch_demo.png";
  if (key === "photo3") return "/templates/royal-wedding/landscape_demo.png";
  if (key === "photo4") return "/templates/royal-wedding/hero-arch_demo.png";
  return "/templates/royal-wedding/Arch_Demo2.png";
};

const getPhotoConfig = (key: string, index: number) => {
  if (key === "photo1") return { frame: "/templates/royal-wedding/pn-gal-fr-hanging-portrait-x-v01.webp", colSpan: false };
  if (key === "photo2") return { frame: "/templates/royal-wedding/pn-gal-fr-hanging-portrait-x-v01.webp", colSpan: false };
  if (key === "photo3") return { frame: "/templates/royal-wedding/pn-gal-fr-hanging-landscape-x-v01.webp", colSpan: true };
  if (key === "photo4") return { frame: "/templates/royal-wedding/pn-gal-fr-hanging-portrait-x-v01.webp", colSpan: true };
  
  const isLandscape = index % 3 === 0;
  return {
    frame: isLandscape
      ? "/templates/royal-wedding/pn-gal-fr-hanging-landscape-x-v01.webp"
      : "/templates/royal-wedding/pn-gal-fr-hanging-portrait-x-v01.webp",
    colSpan: isLandscape || index % 4 === 0
  };
};

// Sound Synthesizer via Web Audio API (identical bell & ambient effects)
const PlaySynth = {
  bell() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const c = new AudioCtx();
      const now = c.currentTime;
      [[528, 0.25, 2.0], [1056, 0.12, 1.4], [792, 0.08, 1.7]].forEach(([freq, vol, dur]) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        g.gain.setValueAtTime(vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.start(now);
        osc.stop(now + dur + 0.05);
      });
    } catch (_) {}
  },
  ambient() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const c = new AudioCtx();
      const now = c.currentTime;
      [[220, 0.04, 3.5], [330, 0.03, 3.0], [440, 0.035, 4.0], [660, 0.02, 2.8]].forEach(([f, v, d], i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.type = "sine";
        const start = now + i * 0.15;
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(v, start + 0.5);
        g.gain.exponentialRampToValueAtTime(0.0001, start + d);
        osc.start(start);
        osc.stop(start + d + 0.1);
      });
    } catch (_) {}
  }
};

export default function RoyalWedding({
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

  // State controls
  const [introState, setIntroState] = useState<"dark" | "lit" | "complete">(em ? "complete" : "dark");
  const [ropePulledDistance, setRopePulledDistance] = useState(0);
  const [isPullingRope, setIsPullingRope] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [bgModalOpen, setBgModalOpen] = useState(false);

  // Audio elements
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Parallax / Scroll states
  const [treeOffset, setTreeOffset] = useState(0);
  const [unrolledScrolls, setUnrolledScrolls] = useState<Record<number, boolean>>({});

  // Canvas Refs
  const starCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fireworkCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Rope drag setup
  const dragStartY = useRef(0);
  const pullThreshold = 95;

  // Setup unrolling scroll observers
  useEffect(() => {
    if (introState !== "complete") return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.getAttribute("data-idx") || "0", 10);
          setUnrolledScrolls(prev => ({ ...prev, [idx]: true }));
        }
      });
    }, { threshold: 0.25 });

    const targets = document.querySelectorAll(".scroll-card");
    targets.forEach(t => observer.observe(t));

    return () => targets.forEach(t => observer.unobserve(t));
  }, [introState]);

  // Setup Scroll listener for tree parting reveal
  useEffect(() => {
    if (introState !== "complete") return;
    const handleScroll = () => {
      const coupleSection = document.getElementById("couple-section");
      if (!coupleSection) return;
      const rect = coupleSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how far through the couple section the user has scrolled
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      if (elementTop < viewportHeight && elementTop + elementHeight > 0) {
        const scrolledPercentage = (viewportHeight - elementTop) / (viewportHeight + elementHeight);
        setTreeOffset(Math.min(100, Math.max(0, scrolledPercentage * 120)));
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
    const targetId = sectionMap[forcedSlide];
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [forcedSlide, em, introState]);

  // Starfield loop
  useEffect(() => {
    if (introState !== "complete" || !starCanvasRef.current) return;
    const canvas = starCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const stars: { x: number; y: number; r: number; phase: number; spd: number }[] = Array.from({ length: 60 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.7,
      r: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      spd: 0.02 + Math.random() * 0.03
    }));

    const resize = () => {
      canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || 400;
    };
    resize();
    window.addEventListener("resize", resize);

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        const alpha = 0.2 + 0.8 * Math.sin(time * s.spd + s.phase);
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 235, 180, ${alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [introState]);

  // Fireworks loop in RSVP
  useEffect(() => {
    if (introState !== "complete" || !fireworkCanvasRef.current) return;
    const canvas = fireworkCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: { x: number; y: number; vx: number; vy: number; color: string; alpha: number; size: number }[] = [];

    const resize = () => {
      canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || 500;
    };
    resize();
    window.addEventListener("resize", resize);

    const createExplosion = (x: number, y: number) => {
      const colors = ["#ffccd5", "#ffb3c1", "#ff8fa3", "#ff4d6d", "#d8a957", "#fffdf0"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          color,
          alpha: 1,
          size: 1 + Math.random() * 2
        });
      }
    };

    let timer = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timer++;
      
      if (timer % 80 === 0) {
        createExplosion(
          0.2 * canvas.width + Math.random() * 0.6 * canvas.width,
          0.2 * canvas.height + Math.random() * 0.3 * canvas.height
        );
      }

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.alpha -= 0.015;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (p.alpha <= 0) {
          particles.splice(idx, 1);
        }
      });

      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [introState]);

  // Audio setup
  useEffect(() => {
    if (em) return;
    const songUrl = d.bg_song_url || "https://pub-1cc0f6e993214be9a36badeeb631f4b6.r2.dev/templates/template09/assets/song/Template_09.mp3";
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

  // Rope drag handlers
  const handleRopeTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (introState !== "dark") return;
    setIsPullingRope(true);
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
  };

  const handleRopeTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isPullingRope) return;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const diff = clientY - dragStartY.current;
    
    // Apply soft resistance curve
    if (diff > 0) {
      const resistance = diff < 40 ? diff * 0.9 : 36 + (diff - 40) * 0.4;
      setRopePulledDistance(Math.min(pullThreshold + 20, resistance));
    }
  };

  const handleRopeTouchEnd = () => {
    if (!isPullingRope) return;
    setIsPullingRope(false);
    
    if (ropePulledDistance >= pullThreshold) {
      // Trigger lighting ritual
      PlaySynth.bell();
      setIntroState("lit");
      setRopePulledDistance(0);
      
      // Auto transition to full site after lights are on
      setTimeout(() => {
        PlaySynth.ambient();
      }, 800);
      
      setTimeout(() => {
        setIntroState("complete");
        // Start background music automatically
        if (audioRef.current && !em) {
          audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
        }
      }, 2500);
    } else {
      // Snap back
      setRopePulledDistance(0);
    }
  };

  // Skip preloader
  const handleSkip = () => {
    setIntroState("complete");
    if (audioRef.current && !em) {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  };

  // RSVP redirection
  const handleRSVP = () => {
    const groom = d.groom_name || "Rohan";
    const bride = d.bride_name || "Tanya";
    const text = encodeURIComponent(`Yes, I'll be there! Congratulations ${bride} & ${groom}! 🎉🥂`);
    const num = d.rsvp_phone || "910000000000";
    window.open(`https://wa.me/${num}?text=${text}`, "_blank");
  };

  // Google Calendar URL
  const gcalUrl = () => {
    const bride = d.bride_name || "Tanya";
    const groom = d.groom_name || "Rohan";
    const title = encodeURIComponent(`${bride} & ${groom}'s Wedding Celebration`);
    const venue = encodeURIComponent(d.wedding_venue || "The Oberoi Udaivilas, Udaipur");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261212/20261213&details=Wedding+Celebration&location=${venue}`;
  };

  // Apple Calendar File (.ics)
  const icalUrl = () => {
    const bride = d.bride_name || "Tanya";
    const groom = d.groom_name || "Rohan";
    const title = `${bride} %26 ${groom}'s Wedding`;
    return `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:20261212%0ADTEND:20261213%0ASUMMARY:${title}%0AEND:VEVENT%0AEND:VCALENDAR`;
  };

  // Scroll to section
  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div style={{ background: "#060d0b", minHeight: "100vh", color: "#3e2b22", fontFamily: "'EB Garamond', Georgia, serif", overflowX: "hidden" }}>
      {/* ── Google Fonts Import ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Parisienne&family=Nunito:wght@400;700&display=swap');
        
        .royal-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .royal-script { font-family: 'Parisienne', cursive; }
        
        @keyframes floatRope {
          0%, 100% { transform: translate(-50%, 0) rotate(0deg); }
          50% { transform: translate(-50%, 2px) rotate(0.4deg); }
        }
        .rope-float {
          animation: floatRope 4s ease-in-out infinite;
        }
        
        @keyframes pulseHalo {
          0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.35; }
          50% { transform: translate(-50%, 0) scale(1.15); opacity: 0.65; }
        }
        .halo-pulse {
          animation: pulseHalo 2.5s ease-in-out infinite;
        }

        @keyframes flowerSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .flower-spin {
          animation: flowerSpin 25s linear infinite;
        }

        .scroll-card {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scroll-card.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .scroll-inner-content {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease;
        }
        .scroll-card.is-unrolled .scroll-inner-content {
          max-height: 500px;
          opacity: 1;
        }

        @media (max-width: 480px) {
          .preloader-title { font-size: 2.3rem !important; }
          .hero-title { font-size: 2.5rem !important; }
          .hero-subtitle { font-size: 2rem !important; }
          .invite-card { padding: 32px 16px !important; border-width: 4px double !important; }
          .scroll-details { padding: 12px 18px !important; }
          .scroll-details img { width: 32px !important; height: 32px !important; margin-bottom: 4px !important; }
          .scroll-event-title { font-size: 1.25rem !important; }
          .scroll-details p { font-size: 11px !important; margin-top: 1px !important; }
          .scroll-details a { font-size: 10px !important; margin-top: 4px !important; }
          .couple-story-container { padding: 20px 14px !important; font-size: 14px !important; line-height: 1.6 !important; }
        }
      ` }} />

      {/* ──────────────────────────────────────────────────────────
          1. CINEMATIC PRELOADER
          ────────────────────────────────────────────────────────── */}
      {introState !== "complete" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000, background: "#060d0b",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          transition: "opacity 1.2s ease", overflow: "hidden"
        }}>
          {/* Chandelier Overlay */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", pointerEvents: "none" }}>
            <div style={{
              position: "absolute", inset: 0,
              background: introState === "lit"
                ? "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(216,169,87,0.35) 0%, transparent 75%)"
                : "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(216,169,87,0.12) 0%, transparent 60%)",
              mixBlendMode: "screen", transition: "all 1.5s ease"
            }} />
          </div>

          {/* Dark / Lit Background Images */}
          <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
            {/* Dark background */}
            <img
              src="/templates/royal-wedding/pn-hro-bg-courtyard-dark-m-v03.webp"
              alt="Udaivilas Dark"
              style={{
                width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0,
                opacity: introState === "dark" ? 0.9 : 0, transition: "opacity 1.2s ease"
              }}
            />
            {/* Lit background */}
            <img
              src="/templates/royal-wedding/pn-hro-bg-courtyard-lit-m-v03.webp"
              alt="Udaivilas Lit"
              style={{
                width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0,
                opacity: introState === "lit" ? 1 : 0, transition: "opacity 1.2s ease"
              }}
            />
          </div>

          {/* Golden flower corners & hanging Jhoomer */}
          {introState === "lit" && (
            <>
              {/* Jhoomer */}
              <img
                src="/templates/royal-wedding/pn-shr-mot-jhoomer-hanging-x-v01.webp"
                alt="Jhoomer"
                style={{
                  position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
                  width: 220, zIndex: 2, pointerEvents: "none"
                }}
              />
              {/* Diyas (lit bases) */}
              <div style={{ position: "absolute", bottom: "25%", left: "8%", width: 64, pointerEvents: "none" }}>
                <img src="/templates/royal-wedding/pn-shr-mot-diya-glow-x-v01.webp" alt="Diya" style={{ width: "100%" }} />
              </div>
              <div style={{ position: "absolute", bottom: "25%", right: "8%", width: 64, pointerEvents: "none" }}>
                <img src="/templates/royal-wedding/pn-shr-mot-diya-glow-x-v01.webp" alt="Diya" style={{ width: "100%" }} />
              </div>
            </>
          )}

          {/* Interactive Rope (Dark state only) */}
          {introState === "dark" && (
            <div
              className={isPullingRope ? "" : "rope-float"}
              onTouchStart={handleRopeTouchStart}
              onTouchMove={handleRopeTouchMove}
              onTouchEnd={handleRopeTouchEnd}
              onMouseDown={handleRopeTouchStart}
              onMouseMove={handleRopeTouchMove}
              onMouseUp={handleRopeTouchEnd}
              style={{
                position: "absolute", top: 0, left: "50%",
                width: 100, height: "60vh", zIndex: 10, cursor: isPullingRope ? "grabbing" : "grab",
                transformOrigin: "top center",
                transform: `translateX(-50%) translateY(${ropePulledDistance}px)`
              }}
            >
              <img
                src="/templates/royal-wedding/pn-hro-el-rope-hemp-pull-x-v01.webp"
                alt="Hemp Pull Rope"
                style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "top center" }}
              />
              {/* Tassel Halo */}
              <div className="halo-pulse" style={{
                position: "absolute", top: "135px", left: "50%", width: 84, height: 84,
                borderRadius: "50%", background: "radial-gradient(circle, rgba(216,169,87,0.3) 0%, transparent 70%)"
              }} />
            </div>
          )}

          {/* Ritual instruction text */}
          {introState === "dark" && (
            <div style={{ position: "absolute", bottom: "18vh", left: "50%", transform: "translateX(-50%)", textAlign: "center", pointerEvents: "none", zIndex: 5 }}>
              <div style={{ width: 24, height: 24, margin: "0 auto 8px", background: "radial-gradient(circle, #f0c86a, #d8a957)", borderRadius: "50%", boxShadow: "0 0 10px #f0c86a", animation: "pulseHalo 1.8s infinite" }} />
              <p className="royal-display" style={{ fontStyle: "italic", fontSize: 22, color: "#fffdf0", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                Pull rope to light our celebration
              </p>
            </div>
          )}

          {/* Names Reveal (Lit state) */}
          {introState === "lit" && (
            <div style={{ position: "absolute", top: "42%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", zIndex: 5, width: "90%", maxWidth: 440 }}>
              <h1 className="royal-display preloader-title" style={{ fontStyle: "italic", fontSize: "3.5rem", fontWeight: 300, color: "#fffdf0", lineHeight: 1.1, textShadow: "0 4px 12px rgba(0,0,0,0.8), 0 0 40px rgba(216,169,87,0.6)" }}>
                {d.bride_name || "Tanya"} <span className="royal-script" style={{ color: "#f0c86a", fontSize: "2.8rem" }}>&amp;</span> {d.groom_name || "Rohan"}
              </h1>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "14px 0" }}>
                <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg, transparent, #d8a957, transparent)" }} />
                <span style={{ width: 8, height: 8, background: "#d8a957", transform: "rotate(45deg)" }} />
                <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg, transparent, #d8a957, transparent)" }} />
              </div>
              <p className="royal-display" style={{ fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: "#fffdf0", opacity: 0.9, textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>
                {d.wedding_date || "12 · December · 2026"}
              </p>
            </div>
          )}

          {/* Skip CTA */}
          <button
            onClick={handleSkip}
            style={{
              position: "absolute", bottom: 24, right: 24, zIndex: 12, background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(216,169,87,0.3)", borderRadius: 20, padding: "8px 16px",
              color: "#f7eedc", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5,
              cursor: "pointer"
            }}
          >
            Skip Intro
          </button>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MAIN WEB SITE SHELL
          ────────────────────────────────────────────────────────── */}
      {introState === "complete" && (
        <div style={{ animation: "fadeIn 1s ease-in-out" }}>
          
          {/* ──────────────────────────────────────────────────────────
              HERO / WELCOME SLIDE
              ────────────────────────────────────────────────────────── */}
          <header id="welcome-section" style={{
            position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: "0 24px",
            background: "linear-gradient(to bottom, #060d0b, #12211b)"
          }}>
            {/* Ambient background decoration */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
              <img src="/templates/royal-wedding/pn-hro-bg-courtyard-lit-m-v03.webp" alt="Welcome Background" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.25 }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 160, background: "linear-gradient(to bottom, #060d0b, transparent)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 160, background: "linear-gradient(to top, #12211b, transparent)" }} />
            </div>

            <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 500, width: "100%" }}>
              {/* Top flower ornament */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <img src="/templates/royal-wedding/pn-shr-div-floral-corner-top-left-x-v01.webp" className="flower-spin" alt="Flower Accent" style={{ width: 100, height: 100, opacity: 0.8 }} />
              </div>

              <p className="royal-display" style={{ textTransform: "uppercase", fontSize: 13, letterSpacing: 4, color: "#d8a957", marginBottom: 12, fontWeight: 700 }}>
                THE ROYAL WEDDING OF
              </p>

              <h1 className="royal-display hero-title" style={{ fontSize: "3.75rem", fontStyle: "italic", fontWeight: 300, color: "#f7eedc", lineHeight: 1.1, marginBottom: 16 }}>
                <ET fid="bride_name" data={d} onChange={oc} editMode={em} style={{ display: "block" }} />
                <span className="royal-script hero-subtitle" style={{ color: "#d8a957", fontSize: "3rem", display: "block", margin: "4px 0" }}>&amp;</span>
                <ET fid="groom_name" data={d} onChange={oc} editMode={em} style={{ display: "block" }} />
              </h1>

              <div style={{ width: 160, height: 1, background: "linear-gradient(90deg, transparent, #d8a957, transparent)", margin: "16px auto" }} />

              <p className="royal-display" style={{ fontSize: 19, letterSpacing: 2, color: "#f7eedc", opacity: 0.9 }}>
                <ET fid="wedding_date" data={d} onChange={oc} editMode={em} style={{ fontWeight: 500 }} />
              </p>
              <p className="royal-display" style={{ fontSize: 14, fontStyle: "italic", color: "#d8a957", marginTop: 4, letterSpacing: 0.5 }}>
                at <ET fid="wedding_venue" data={d} onChange={oc} editMode={em} />
              </p>
               <p className="royal-display" style={{ fontSize: 16, fontWeight: 700, color: "#f7eedc", opacity: 0.8, letterSpacing: 2, textTransform: "uppercase", marginTop: 24 }}>
                <ET fid="hashtag" data={d} onChange={oc} editMode={em} />
              </p>

              {/* View details button */}
              <button
                onClick={() => scrollToSection("invite-section")}
                style={{
                  marginTop: 40, background: "none", border: "1px solid #d8a957",
                  color: "#f7eedc", borderRadius: 30, padding: "14px 28px",
                  fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700,
                  cursor: "pointer", boxShadow: "0 4px 12px rgba(216,169,87,0.15)",
                  transition: "all 0.3s"
                }}
              >
                Join the Celebration
              </button>
            </div>
          </header>

          {/* ──────────────────────────────────────────────────────────
              2. INVITATION & BLESSINGS
              ────────────────────────────────────────────────────────── */}
          <section id="invite-section" style={{
            position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: "64px 24px",
            background: "linear-gradient(to bottom, #12211b, #0f1c16)"
          }}>
            {/* Pichwai Frame Card border */}
            <div className="invite-card" style={{
              position: "relative", maxWidth: 440, width: "100%", background: "#fcf8f0",
              border: "8px double #d8a957", borderRadius: 20, padding: "48px 24px",
              boxShadow: "0 20px 48px rgba(0,0,0,0.5)", textAlign: "center"
            }}>
              {/* Grandparents blessing */}
              <div style={{ color: "#3e2b22", fontSize: 13, marginBottom: 24 }}>
                <p style={{ textTransform: "uppercase", letterSpacing: 1.5, fontSize: 10, color: "#8d9a7a", fontWeight: 700, marginBottom: 6 }}>
                  With the blessings of
                </p>
                <p style={{ fontWeight: 500, fontStyle: "italic" }}>
                  <ET fid="blessings" data={d} onChange={oc} editMode={em} />
                </p>
                <p style={{ fontWeight: 500, fontStyle: "italic", marginTop: 2 }}>
                  <ET fid="blessings_2" data={d} onChange={oc} editMode={em} />
                </p>
              </div>

              {/* Flower divider */}
              <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
                <img src="/templates/royal-wedding/pn-inv-div-lotus-divider-x-v01.webp" alt="Lotus divider" style={{ width: 44 }} />
              </div>

              <p className="royal-display" style={{ fontStyle: "italic", fontSize: 18, color: "#8d9a7a", marginBottom: 12 }}>
                Together with their families
              </p>

              <h2 className="royal-display" style={{ fontStyle: "italic", fontSize: "2.5rem", color: "#a6384f", marginBottom: 16 }}>
                {d.bride_name || "Tanya"} <span className="royal-script" style={{ color: "#d8a957", fontSize: "2.2rem" }}>&amp;</span> {d.groom_name || "Rohan"}
              </h2>

              <div style={{ color: "#3e2b22", fontSize: 13, lineHeight: 1.7, margin: "16px 0" }}>
                <p style={{ fontWeight: 500 }}><ET fid="bride_parents" data={d} onChange={oc} editMode={em} /></p>
                <p style={{ fontStyle: "italic", color: "#8d9a7a", margin: "4px 0" }}>and</p>
                <p style={{ fontWeight: 500 }}><ET fid="groom_parents" data={d} onChange={oc} editMode={em} /></p>
              </div>

              <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
                <img src="/templates/royal-wedding/pn-inv-div-lotus-divider-x-v01.webp" alt="Lotus divider" style={{ width: 44 }} />
              </div>

              <p className="royal-display" style={{ fontSize: 16, fontStyle: "italic", color: "#8d9a7a", marginBottom: 20 }}>
                cordially invite you to share in the joy of their union
              </p>

              <div style={{ background: "rgba(216,169,87,0.05)", border: "1px dashed #d8a957", borderRadius: 12, padding: "16px", marginTop: 24 }}>
                <h4 style={{ textTransform: "uppercase", letterSpacing: 2, fontSize: 11, fontWeight: 700, color: "#a6384f", marginBottom: 6 }}>Celebration Schedule</h4>
                <p style={{ fontSize: 15, fontWeight: 600 }}>{d.wedding_date || "12 December 2026"}</p>
                <p style={{ fontSize: 13, fontStyle: "italic", color: "#6e5d53", marginTop: 4 }}>{d.wedding_venue || "The Oberoi Udaivilas, Udaipur"}</p>
              </div>

              {/* View events scroll CTA */}
              <button
                onClick={() => scrollToSection("events-section")}
                style={{
                  marginTop: 32, background: "#a6384f", border: "none", color: "#fff",
                  borderRadius: 24, padding: "12px 24px", fontSize: 12, textTransform: "uppercase",
                  fontWeight: 700, letterSpacing: 1.5, cursor: "pointer",
                  boxShadow: "0 6px 16px rgba(166,56,79,0.3)"
                }}
              >
                View Ceremonies
              </button>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────
              3. EVENTS SCHEDULE (UNROLLING SCROLLS)
              ────────────────────────────────────────────────────────── */}
          <section id="events-section" style={{
            position: "relative", minHeight: "100vh", padding: "80px 24px",
            background: "linear-gradient(to bottom, #0f1c16, #060d0b)"
          }}>
            {/* Stars canvas overlay */}
            <canvas ref={starCanvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />

            <div style={{ position: "relative", zIndex: 1, maxWidth: 500, width: "100%", margin: "0 auto" }}>
              
              {/* Section Header */}
              <div style={{ textAlign: "center", marginBottom: 54 }}>
                <p style={{ textTransform: "uppercase", fontSize: 11, letterSpacing: 3, color: "#d8a957", fontWeight: 700 }}>CELEBRATION JOURNEY</p>
                <h2 className="royal-display" style={{ fontStyle: "italic", fontSize: "2.4rem", color: "#f7eedc", marginTop: 4 }}>Our Ceremonies</h2>
                <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                  <img src="/templates/royal-wedding/pn-evt-div-lotus-vine-x-v01.webp" alt="divider" style={{ width: 120, opacity: 0.8 }} />
                </div>
              </div>

              {/* Vines / Path layout */}
              <div style={{ display: "flex", flexDirection: "column", gap: 64, position: "relative" }}>
                
                {/* Connecting vine line in background */}
                <div style={{
                  position: "absolute", top: 120, bottom: 120, left: "50%", transform: "translateX(-50%)",
                  width: 3, background: "linear-gradient(to bottom, transparent, rgba(216,169,87,0.3) 10%, rgba(216,169,87,0.3) 90%, transparent)",
                  zIndex: 0
                }} />

                {/* Event Scrolls (unroll automatically on scroll) */}
                {[
                  {
                    idx: 0, id: "mehendi", name: "Mehendi", icon: "/templates/royal-wedding/pn-evt-ico-mehendi-x-v01.webp",
                    dateKey: "mehendi_date", venueKey: "mehendi_venue", noteKey: "mehendi_note"
                  },
                  {
                    idx: 1, id: "haldi", name: "Haldi", icon: "/templates/royal-wedding/pn-evt-ico-haldi-x-v01.webp",
                    dateKey: "haldi_date", venueKey: "haldi_venue", noteKey: "haldi_note"
                  },
                  {
                    idx: 2, id: "sangeet", name: "Sangeet", icon: "/templates/royal-wedding/pn-evt-ico-sangeet-x-v01.webp",
                    dateKey: "sangeet_date", venueKey: "sangeet_venue", noteKey: "sangeet_note"
                  },
                  {
                    idx: 3, id: "shaadi", name: "Shaadi", icon: "/templates/royal-wedding/pn-evt-ico-shaadi-x-v01.webp",
                    dateKey: "shaadi_date", venueKey: "shaadi_venue", noteKey: "shaadi_note"
                  },
                  {
                    idx: 4, id: "reception", name: "Reception", icon: "/templates/royal-wedding/pn-evt-ico-reception-x-v01.webp",
                    dateKey: "reception_date", venueKey: "reception_venue", noteKey: "reception_note"
                  }
                ].map(evt => {
                  const visible = unrolledScrolls[evt.idx] || em;
                  return (
                    <div
                      key={evt.idx}
                      data-idx={evt.idx}
                      className={`scroll-card ${visible ? "is-visible is-unrolled" : ""}`}
                      style={{ position: "relative", zIndex: 1 }}
                    >
                      {/* Rolled Scroll Silhouette (placeholder while hidden) */}
                      {!visible && (
                        <div style={{ display: "flex", justifyContent: "center", cursor: "pointer" }} onClick={() => setUnrolledScrolls(p => ({...p, [evt.idx]: true}))}>
                          <img src="/templates/royal-wedding/pn-evt-farman-rolled-x-v01.webp" alt="Rolled Farman" style={{ width: 130 }} />
                        </div>
                      )}

                      {/* Unrolled Farman (opens with clipPath height / opacity transition) */}
                      <div className="scroll-inner-content" style={{ display: "flex", justifyContent: "center" }}>
                        <div style={{ position: "relative", maxWidth: 360, width: "100%" }}>
                          {/* Parchment background */}
                          <img src="/templates/royal-wedding/pn-evt-farman-open-x-v01.webp" alt="Farman Open" style={{ width: "100%", display: "block" }} />
                          
                          {/* Scroll Details Content */}
                          <div className="scroll-details" style={{
                            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center", padding: "24px 36px",
                            textAlign: "center"
                          }}>
                            {/* Ceremony Icon */}
                            <img src={evt.icon} alt={evt.name} style={{ width: 44, height: 44, marginBottom: 8, objectFit: "contain" }} />
                            
                            <h3 className="royal-display scroll-event-title" style={{ fontStyle: "italic", fontSize: "1.8rem", color: "#a6384f", marginBottom: 2 }}>
                              {evt.name}
                            </h3>
                            <div style={{ width: 60, height: 1, background: "#d8a957", marginBottom: 6 }} />
                            
                            <p style={{ fontSize: 15, fontWeight: 800, color: "#3e2b22" }}>
                              <ET fid={evt.dateKey} data={d} onChange={oc} editMode={em} />
                            </p>
                            <p style={{ fontSize: 14, fontStyle: "italic", color: "#8d9a7a", marginTop: 2 }}>
                              <ET fid={evt.venueKey} data={d} onChange={oc} editMode={em} />
                            </p>
                            <p style={{ fontSize: 12, textTransform: "uppercase", color: "#a6384f", fontWeight: 700, marginTop: 4, letterSpacing: 0.5 }}>
                              <ET fid={evt.noteKey} data={d} onChange={oc} editMode={em} />
                            </p>
                            
                            {/* Google Maps link */}
                            {(() => {
                              const customMapUrl = d[`${evt.id}_map_url`] || "";
                              const defaultSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d[evt.venueKey] || "The Oberoi Udaivilas Udaipur")}`;
                              const finalMapUrl = customMapUrl ? customMapUrl : defaultSearchUrl;
                              return (
                                <>
                                  <a
                                    href={finalMapUrl}
                                    target="_blank" rel="noreferrer"
                                    style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#a6384f", fontWeight: 700, marginTop: 10, textDecoration: "none" }}
                                  >
                                    <MapPin size={12} />
                                    Open in Maps
                                  </a>

                                  {/* Map Editing Options in Edit Mode */}
                                  {em && (
                                    <div style={{
                                      marginTop: 8, padding: "8px", background: "rgba(166,56,79,0.03)",
                                      border: "1px dashed rgba(166,56,79,0.2)", borderRadius: 8, display: "flex",
                                      flexDirection: "column", gap: 6, width: "100%", alignItems: "center"
                                    }}>
                                      <span style={{ fontSize: 9, textTransform: "uppercase", color: "#a6384f", fontWeight: 700, letterSpacing: 1 }}>Map Action</span>
                                      <div style={{ display: "flex", gap: 6 }}>
                                        <button
                                          onClick={() => {
                                            const defaultSearchQuery = d[evt.venueKey] || "The Oberoi Udaivilas Udaipur";
                                            const query = prompt("Enter location name to search on Google Maps:", defaultSearchQuery);
                                            if (query) {
                                              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank");
                                              setTimeout(() => {
                                                const url = prompt(`Google Maps has been opened in a new tab to search for "${query}".\n\n1. Find the suitable location.\n2. Copy the URL from the browser address bar.\n3. Paste the URL here to save it:`);
                                                if (url) {
                                                  oc?.(`${evt.id}_map_url`, url);
                                                }
                                              }, 1000);
                                            }
                                          }}
                                          style={{
                                            background: !customMapUrl ? "#a6384f" : "rgba(0,0,0,0.05)",
                                            color: !customMapUrl ? "#fff" : "#3e2b22",
                                            border: "1px solid rgba(166,56,79,0.3)", padding: "3px 8px",
                                            borderRadius: 4, fontSize: 9, fontWeight: 700, cursor: "pointer"
                                          }}
                                        >
                                          Search Location
                                        </button>
                                        <button
                                          onClick={() => {
                                            const url = prompt("Paste your Google Maps link here:", customMapUrl || "");
                                            if (url !== null) {
                                              oc?.(`${evt.id}_map_url`, url);
                                            }
                                          }}
                                          style={{
                                            background: customMapUrl ? "#a6384f" : "rgba(0,0,0,0.05)",
                                            color: customMapUrl ? "#fff" : "#3e2b22",
                                            border: "1px solid rgba(166,56,79,0.3)", padding: "3px 8px",
                                            borderRadius: 4, fontSize: 9, fontWeight: 700, cursor: "pointer"
                                          }}
                                        >
                                          Paste Map URL
                                        </button>
                                      </div>
                                      {customMapUrl && (
                                        <span style={{ fontSize: 8, color: "#8d9a7a", wordBreak: "break-all", maxWidth: 180, display: "block" }}>
                                          URL: {customMapUrl}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────
              4. MEET THE COUPLE (SECRET GARDEN TREE PARTING)
              ────────────────────────────────────────────────────────── */}
          <section id="couple-section" style={{
            position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex",
            alignItems: "center", justifyContent: "center", background: "#0c0205"
          }}>
            {/* Central Secret Garden painting layer */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, rgba(12,2,5,0.4) 30%, #0c0205 95%)", zIndex: 1 }} />
              <img
                src="/templates/royal-wedding/pn-hro-bg-courtyard-dark-m-v03.webp"
                alt="Secret Garden"
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }}
              />
            </div>

            {/* Tree Overlay Foliage Left (Transforms left on scroll) */}
            <div style={{
              position: "absolute", top: 0, bottom: 0, left: 0, width: "55%", zIndex: 2,
              transform: `translateX(-${treeOffset * 0.8}%)`, transition: "transform 0.1s ease-out",
              pointerEvents: "none"
            }}>
              <img
                src="/templates/royal-wedding/pn-cpl-ovl-tree-left-m-v01.webp"
                alt="Tree Left"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "right center" }}
              />
            </div>

            {/* Tree Overlay Foliage Right (Transforms right on scroll) */}
            <div style={{
              position: "absolute", top: 0, bottom: 0, right: 0, width: "55%", zIndex: 2,
              transform: `translateX(${treeOffset * 0.8}%)`, transition: "transform 0.1s ease-out",
              pointerEvents: "none"
            }}>
              <img
                src="/templates/royal-wedding/pn-cpl-ovl-tree-right-m-v01.webp"
                alt="Tree Right"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "left center" }}
              />
            </div>

            {/* Couple story content (Reveals when trees part) */}
            <div style={{
              position: "relative", zIndex: 1, maxWidth: 440, width: "90%",
              textAlign: "center", color: "#f7eedc", padding: "24px",
              opacity: Math.min(1, treeOffset / 40), transition: "opacity 0.2s"
            }}>
              <p style={{ textTransform: "uppercase", letterSpacing: 3, fontSize: 10, color: "#d8a957", fontWeight: 700, marginBottom: 8 }}>A LOVE STORY</p>
              <h2 className="royal-display" style={{ fontStyle: "italic", fontSize: "2.4rem", color: "#f7eedc", marginBottom: 20 }}>Meet the Couple</h2>
              
              <div style={{ display: "inline-flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
                <Flower size={18} className="flower-spin" color="#d8a957" />
              </div>

              <div className="couple-story-container" style={{ fontSize: 15, lineHeight: 1.8, color: "#e9d7b8", background: "rgba(0,0,0,0.45)", padding: "28px 20px", borderRadius: 16, border: "1px solid rgba(216,169,87,0.15)", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
                <ET fid="story_body" data={d} onChange={oc} editMode={em} multiline />
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────
              5. MEMORIES GALLERY (LIGHTBOX HANGING FRAMES)
              ────────────────────────────────────────────────────────── */}
          <section id="gallery-section" style={{
            position: "relative", minHeight: "100vh", padding: "80px 24px",
            background: "linear-gradient(to bottom, #060d0b, #0d0c12)",
            textAlign: "center"
          }}>
            {/* Background pattern */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.1, pointerEvents: "none" }}>
              <img src="/templates/royal-wedding/Menu_background.webp" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            <div style={{ position: "relative", zIndex: 1, maxWidth: 500, width: "100%", margin: "0 auto" }}>
              
              {/* Section Header */}
              <div style={{ marginBottom: 48 }}>
                <p style={{ textTransform: "uppercase", fontSize: 11, letterSpacing: 3, color: "#d8a957", fontWeight: 700 }}>MEMORIES</p>
                <h2 className="royal-display" style={{ fontStyle: "italic", fontSize: "2.4rem", color: "#f7eedc", marginTop: 4 }}>Gallery Wall</h2>
              </div>

              {/* Grid of hanging polaroids */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
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
                        key={index}
                        onClick={() => !em && setActivePhoto(imgUrl)}
                        style={{
                          position: "relative", cursor: "pointer",
                          gridColumn: item.colSpan ? "span 2" : "span 1",
                          transform: index % 2 === 0 ? "rotate(-1deg)" : "rotate(1deg)",
                          transition: "transform 0.3s"
                        }}
                      >
                        {/* Outer Frame wrapper */}
                        <div style={{ padding: "8px", background: "#fff", borderRadius: 8, boxShadow: "0 8px 20px rgba(0,0,0,0.3)", border: "1px solid #e9d7b8" }}>
                          <div style={{ position: "relative", width: "100%", paddingTop: item.colSpan ? "56.25%" : "120%", overflow: "hidden", borderRadius: 4 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`Gallery ${index}`}
                              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                          {em && (
                            <ImageUploader fid={key} data={d} onChange={oc} defaultSrc={getPhotoDefault(key)} />
                          )}
                        </div>
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
                        oc?.(nextKey, "/templates/royal-wedding/Arch_Demo2.png");
                      }}
                      style={{
                        background: "linear-gradient(135deg, #d8a957, #b8860b)", color: "#fff",
                        border: "none", borderRadius: 24, padding: "12px 28px", fontSize: 12,
                        fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
                        boxShadow: "0 6px 16px rgba(216,169,87,0.3)"
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
                          border: "1px solid rgba(216,169,87,0.3)", borderRadius: 24,
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

            {/* Lightbox Overlay */}
            {activePhoto && (
              <div
                onClick={() => setActivePhoto(null)}
                style={{
                  position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.9)",
                  display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
                  animation: "fadeIn 0.3s"
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activePhoto} alt="Zoomed view" style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: 8, border: "2px solid #d8a957" }} />
                <button
                  onClick={() => setActivePhoto(null)}
                  style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", color: "#fff", fontSize: 32, cursor: "pointer" }}
                >
                  ×
                </button>
              </div>
            )}
          </section>

          {/* ──────────────────────────────────────────────────────────
              6. RSVP & FINALE (LIVE FIREWORKS CANVAS)
              ────────────────────────────────────────────────────────── */}
          <section id="rsvp-section" style={{
            position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: "80px 24px",
            background: "linear-gradient(to bottom, #0d0c12, #060d0b)"
          }}>
            {/* Fireworks canvas background */}
            <canvas ref={fireworkCanvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />

            <div style={{ position: "relative", zIndex: 1, maxWidth: 440, width: "100%", textAlign: "center", color: "#f7eedc" }}>
              
              {/* Top golden crown motif */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <img src="/templates/royal-wedding/pn-rsvp-div-finale-lotus-x-v01.webp" alt="Finale Lotus" style={{ width: 84 }} />
              </div>

              <p style={{ textTransform: "uppercase", letterSpacing: 3, fontSize: 11, color: "#d8a957", fontWeight: 700 }}>Join the celebration</p>

              <h2 className="royal-display" style={{ fontStyle: "italic", fontSize: "3rem", margin: "12px 0 16px", color: "#fffdf0" }}>
                <ET fid="rsvp_headline" data={d} onChange={oc} editMode={em} />
              </h2>

              <p style={{ fontSize: 15, lineHeight: 1.8, color: "#e9d7b8", marginBottom: 32, padding: "0 10px" }}>
                <ET fid="rsvp_body" data={d} onChange={oc} editMode={em} multiline />
              </p>

              {/* RSVP Call-to-action button */}
              <button
                onClick={handleRSVP}
                style={{
                  background: "linear-gradient(135deg, #a6384f, #77283a)", color: "#fff",
                  border: "none", borderRadius: 30, padding: "14px 44px", fontSize: 13,
                  fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
                  boxShadow: "0 10px 25px rgba(166,56,79,0.45)"
                }}
              >
                Yes, I'll be there
              </button>
              
              <p style={{ fontSize: 11, color: "#8d9a7a", marginTop: 8, fontStyle: "italic" }}>
                You will be redirected to WhatsApp to confirm your attendance.
              </p>

              {/* Save the Date block */}
              <div style={{ marginTop: 48, borderTop: "1px solid rgba(216,169,87,0.15)", paddingTop: 32 }}>
                <p className="royal-display" style={{ fontSize: 12, letterSpacing: 2, color: "#d8a957", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Save the Date</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <a
                    href={gcalUrl()} target="_blank" rel="noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(216,169,87,0.3)",
                      background: "rgba(216,169,87,0.05)", borderRadius: 8, padding: "8px 14px",
                      color: "#f7eedc", fontSize: 12, textDecoration: "none", fontWeight: 600
                    }}
                  >
                    <Calendar size={14} />
                    Google Calendar
                  </a>
                  <a
                    href={icalUrl()} download="wedding-invitation.ics"
                    style={{
                      display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(216,169,87,0.3)",
                      background: "rgba(216,169,87,0.05)", borderRadius: 8, padding: "8px 14px",
                      color: "#f7eedc", fontSize: 12, textDecoration: "none", fontWeight: 600
                    }}
                  >
                    <Calendar size={14} />
                    Apple Calendar
                  </a>
                </div>
              </div>

            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────
              FLOATING MUSIC CONTROLS (CASSETTE / MUSIC TOGGLE)
              ────────────────────────────────────────────────────────── */}
          <div style={{ position: "fixed", bottom: 24, left: 24, zIndex: 200, display: "flex", gap: 8 }}>
            <button
              onClick={toggleMusic}
              style={{
                width: 44, height: 44, borderRadius: "50%", background: "#a6384f",
                color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 16px rgba(166,56,79,0.3)", cursor: "pointer"
              }}
            >
              {musicPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />}
            </button>
          </div>

          {/* ──────────────────────────────────────────────────────────
              FLOATING COMPASS MENU
              ────────────────────────────────────────────────────────── */}
          <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200 }}>
            {/* Compass Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: 48, height: 48, borderRadius: "50%", background: "#d8a957",
                color: "#060d0b", border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 20px rgba(216,169,87,0.4)", cursor: "pointer"
              }}
            >
              <Compass size={24} style={{ transform: menuOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.4s" }} />
            </button>

            {/* Menu Circle items (shows when menuOpen) */}
            {menuOpen && (
              <div
                onClick={() => setMenuOpen(false)}
                style={{
                  position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 190
                }}
              >
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    position: "absolute", bottom: 84, right: 24, background: "#fcf8f0",
                    border: "2px solid #d8a957", borderRadius: 16, padding: "16px 8px", width: 180,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)", zIndex: 200
                  }}
                >
                  <p style={{ textTransform: "uppercase", fontSize: 10, fontWeight: 700, color: "#d8a957", letterSpacing: 2, padding: "0 8px 8px", borderBottom: "1px solid rgba(216,169,87,0.15)", marginBottom: 8, textAlign: "center" }}>Navigation</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    {[
                      { label: "Home", target: "invite-section" },
                      { label: "Ceremonies", target: "events-section" },
                      { label: "Love Story", target: "couple-section" },
                      { label: "Gallery Wall", target: "gallery-section" },
                      { label: "RSVP", target: "rsvp-section" }
                    ].map((lnk, idx) => (
                      <li key={idx}>
                        <button
                          onClick={() => scrollToSection(lnk.target)}
                          style={{
                            width: "100%", padding: "8px 12px", background: "none", border: "none",
                            color: "#3e2b22", fontSize: 13, textAlign: "left", cursor: "pointer",
                            fontWeight: 600, display: "block", borderRadius: 6,
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(216,169,87,0.08)"}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}
                        >
                          {lnk.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Background Music Settings (Slide 0 in editor) */}
          {em && forcedSlide === 0 && (
            <div style={{
              position: "fixed", top: "98px", bottom: 0, left: 0, right: 0, zIndex: 400,
              background: "rgba(6, 13, 11, 0.88)", backdropFilter: "blur(8px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: 24, textAlign: "center"
            }}>
              <div style={{
                background: "#fcf8f0", border: "4px double #d8a957", borderRadius: 20,
                padding: "40px 24px", maxWidth: 420, width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
              }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <img src="/templates/royal-wedding/pn-inv-div-lotus-divider-x-v01.webp" alt="Lotus" style={{ width: 64 }} />
                </div>
                <h3 className="royal-display" style={{ fontStyle: "italic", fontSize: "2rem", color: "#a6384f", marginBottom: 12 }}>
                  Background Music Settings
                </h3>
                <p style={{ fontSize: 14, color: "#3e2b22", lineHeight: 1.6, marginBottom: 28 }}>
                  Select a majestic background soundtrack for your Royal Wedding invitation card from our curated library.
                </p>

                <div style={{ background: "rgba(216,169,87,0.06)", border: "1px dashed rgba(216,169,87,0.3)", borderRadius: 12, padding: "14px 18px", marginBottom: 28 }}>
                  <p style={{ margin: 0, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#8d9a7a", fontWeight: 700 }}>Active Soundtrack</p>
                  <p style={{ margin: "6px 0 0", fontSize: 16, fontWeight: 700, color: "#3e2b22" }}>
                    {d.bg_song_name || "Default Royal Music"}
                  </p>
                  {d.bg_song_url && (
                    <button
                      onClick={() => {
                        oc?.("bg_song_name", "Default Royal Music");
                        oc?.("bg_song_url", "");
                      }}
                      style={{
                        marginTop: 10, background: "none", border: "none", color: "#a6384f",
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
                    background: "linear-gradient(135deg, #a6384f, #77283a)", color: "#fff",
                    border: "none", borderRadius: 30, padding: "14px 36px", fontSize: 13,
                    fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(166,56,79,0.3)"
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
