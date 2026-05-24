"use client";
import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Heart, Send, Volume2, VolumeX, ChevronDown, Smile, Frown, Flame } from "lucide-react";

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
      display: "block", width: "100%", border: "2px solid #eb4799", borderRadius: 8,
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
      position: "relative", cursor: "text", border: "1.5px dashed rgba(235, 71, 153, 0.7)",
      borderRadius: 6, padding: "4px 8px 18px 8px",
      background: "rgba(235, 71, 153, 0.04)", display: "inline-block", width: "100%"
    }}>
      <span style={style}>{value || "(click to edit)"}</span>
      <span style={{
        position: "absolute", bottom: 2, right: 6, fontSize: 8,
        color: "#eb4799", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5
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
    <div style={{ padding: "6px 8px", background: "rgba(235, 71, 153, 0.04)", borderTop: "1px dashed rgba(235, 71, 153, 0.3)", width: "100%", borderRadius: 8, marginTop: 8 }}>
      {preview && (
        <div style={{ marginBottom: 6, textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" style={{ maxHeight: 60, borderRadius: 8, border: "2px solid #eb4799" }} />
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
          background: "#eb4799", color: "#fff", border: "none", borderRadius: 8,
          padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer",
          opacity: uploading ? 0.6 : 1, width: "100%", whiteSpace: "normal", wordBreak: "break-word"
        }}>{uploading ? "Uploading…" : "📷 Change Image"}</button>
        {currentSrc && (
          <button onClick={useDefault} style={{
            background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb",
            borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer",
            width: "100%", whiteSpace: "normal", wordBreak: "break-word"
          }}>Reset to Default</button>
        )}
      </div>
    </div>
  );
}

// Sparkle background component
function TwinkleBackground() {
  const stars = b_useMemoStars();
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-foreground/30 animate-twinkle"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function b_useMemoStars() {
  const [stars, setStars] = useState<Array<{ id: number; left: string; top: string; size: number; delay: number; duration: number }>>([]);
  useEffect(() => {
    const list = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 4,
    }));
    setStars(list);
  }, []);
  return stars;
}

// Floating emoji rain inside promise slide
function FloatingEmojis() {
  const [emojis, setEmojis] = useState<Array<{ id: number; x: number; y: number; size: number; rotation: number; delay: number; duration: number; emoji: string }>>([]);
  useEffect(() => {
    const symbols = ["💕", "💖", "💗", "✨", "💜", "🩷", "💫", "🌸"];
    const list = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 14 + Math.random() * 20,
      rotation: Math.random() * 360,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      emoji: symbols[Math.floor(Math.random() * symbols.length)]
    }));
    setEmojis(list);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      <AnimatePresence>
        {emojis.map(n => (
          <motion.div
            key={n.id}
            className="absolute"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              fontSize: n.size,
            }}
            initial={{ opacity: 0, scale: 0, rotate: n.rotation }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.2, 1, 0.5], y: [0, -100 - Math.random() * 200], rotate: n.rotation + 180 }}
            transition={{ duration: n.duration, delay: n.delay, repeat: Infinity, repeatDelay: 1, ease: "easeOut" }}
          >
            {n.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Helper typing animation component
function TypingIndicator() {
  return (
    <div className="flex gap-1.5 bg-card/60 backdrop-blur-md border border-border/20 px-3.5 py-3.5 rounded-2xl rounded-bl-sm w-fit shadow-md items-center">
      <motion.div className="w-1.5 h-1.5 rounded-full bg-primary/80" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
      <motion.div className="w-1.5 h-1.5 rounded-full bg-primary/80" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
      <motion.div className="w-1.5 h-1.5 rounded-full bg-primary/80" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
    </div>
  );
}

// Typewriter Span
function TypewriterSpan({ text, delay = 0 }: { text: string; delay?: number }) {
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setTyped(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span>
      {typed}
      {started && typed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[2px] h-[1em] bg-primary ml-0.5 align-middle"
        />
      )}
    </span>
  );
}

// Back Button Component
function BackButton({ onClick, editMode = false }: { onClick: () => void; editMode?: boolean }) {
  if (editMode) return null;
  return (
    <motion.button
      onClick={onClick}
      className="fixed top-6 left-6 z-50 flex items-center gap-2 btn-ghost-depth text-foreground/70 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md"
      initial={{ opacity: 0, x: -20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ x: -3, scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
    >
      <motion.svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        animate={{ x: [0, -2, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </motion.svg>
      Back
    </motion.button>
  );
}

// Floating Sparkles Bear components for slide margins
function Oj({ currentPage }: { currentPage: number }) {
  if (currentPage === 0 || currentPage === 7) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[-10] overflow-hidden opacity-80 md:opacity-100">
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.7, scale: 1, y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
        transition={{
          opacity: { duration: 1 },
          scale: { type: "spring", stiffness: 100, damping: 10 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute left-[-2%] top-[5%] md:left-[2%] w-24 md:w-32 opacity-70"
      >
        <img src="/templates/confess/bear7.gif" alt="Sparkle Heart" className="w-full h-auto drop-shadow-md" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 0.8, x: 0, y: [0, -10, 0], rotate: [0, -10, 10, 0] }}
        transition={{
          opacity: { duration: 1, delay: 0.3 },
          x: { type: "spring", stiffness: 80, damping: 12, delay: 0.3 },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
          rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute right-[-5%] bottom-[5%] md:right-[2%] w-28 md:w-36 opacity-80"
      >
        <img src="/templates/confess/bear8.gif" alt="Star Bear" className="w-full h-auto drop-shadow-lg" />
      </motion.div>
    </div>
  );
}

// Floating Kinza Codes badge at bottom right
function Fj({ editMode = false }: { editMode?: boolean }) {
  const [open, setOpen] = useState(false);
  if (editMode) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[999] flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="mb-3 flex gap-3 p-2 rounded-full bg-card/90 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <a
              href="https://kinzacodes.site/products"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:scale-110"
              title="Kinza Codes Products"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </a>
            <a
              href="https://www.instagram.com/kinzacodes/"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:scale-110"
              title="Kinza Codes Instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg cursor-pointer bg-[#060814] flex items-center justify-center relative p-0.5 outline-none"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          src="/templates/confess/ahmii-logo-DK6Kl5L5.png"
          alt="Kinza Codes"
          className="w-full h-full object-cover rounded-full"
          onError={n => {
            n.currentTarget.style.display = "none";
          }}
        />
      </motion.button>
    </div>
  );
}

export default function Confess({
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

  const [activeSlide, setActiveSlide] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [showMusicHint, setShowMusicHint] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Show button state after intro animation
  const [showIntroBtn, setShowIntroBtn] = useState(em);

  useEffect(() => {
    if (em) {
      setShowIntroBtn(true);
      return;
    }
    const timer = setTimeout(() => setShowIntroBtn(true), 2800);
    return () => clearTimeout(timer);
  }, [em]);

  // Load stylesheet dynamically on mount and cleanup on unmount
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/templates/confess/style.css";
    link.id = "confess-theme-css";
    document.head.appendChild(link);

    const fonts = document.createElement("link");
    fonts.rel = "stylesheet";
    fonts.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Quicksand:wght@400;500;600;700&display=swap";
    fonts.id = "confess-fonts-css";
    document.head.appendChild(fonts);

    return () => {
      document.getElementById("confess-theme-css")?.remove();
      document.getElementById("confess-fonts-css")?.remove();
    };
  }, []);

  // Sync forcedSlide inside editor
  useEffect(() => {
    if (em && forcedSlide !== undefined) {
      if (forcedSlide === -1) {
        // Stay on the welcome slide when configuring background music
        setActiveSlide(0);
      } else {
        setActiveSlide(forcedSlide);
      }
    }
  }, [forcedSlide, em]);

  // Audio setup
  useEffect(() => {
    if (em) return;
    const songUrl = d.bg_song_url || "https://listenplaycreate.wordpress.com/wp-content/uploads/2019/06/ed-sheeran-perfect.mp3";
    const audio = new Audio(songUrl);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    const isEmbedded = typeof window !== "undefined" && (window.self !== window.top || window.location.search.includes("embed=1"));
    if (!isEmbedded && !em && autoPlay) {
      audio.play().then(() => setMusicPlaying(true)).catch(() => {});
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [d.bg_song_url, em, autoPlay]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
      setShowMusicHint(false);
    }
  };

  // Why It's You Checklists
  const defaultReasons = [
    d.reason1 || "Because you make the completely mundane feel extraordinary.",
    d.reason2 || "Because no one else can read my mind exactly the way you endlessly do.",
    d.reason3 || "Because my restless heart finally found its quiet, safe place residing with you.",
    d.reason4 || "Because you naturally challenge me to be a beautifully better version of myself.",
    d.reason5 || "Because loving you is the easiest, most peaceful thing I've ever inexplicably done."
  ];

  // Every Version of You (Mood Accordion states)
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const moods = [
    {
      id: "radiant",
      title: d.s3_rad_title || "The Radiant You",
      subtitle: d.s3_rad_sub || "When you're absolutely glowing",
      desc: d.s3_rad_desc || "There is nothing more infectious than your pure happiness. Your smile lights up every room, and seeing you genuinely happy is my favorite sight in the world.",
      icon: Smile,
      glow: "rgba(255,160,200,0.5)"
    },
    {
      id: "exhausted",
      title: d.s3_exh_title || "The Exhausted You",
      subtitle: d.s3_exh_sub || "When the world gets too heavy",
      desc: d.s3_exh_desc || "When you're burnt out and need a quiet place to hide, my arms will always be that safe space. You never have to pretend to be strong around me.",
      icon: Frown,
      glow: "rgba(100,100,255,0.4)"
    },
    {
      id: "passionate",
      title: d.s3_pas_title || "The Passionate You",
      subtitle: d.s3_pas_sub || "When you talk about what you love",
      desc: d.s3_pas_desc || "The way your eyes physically light up and you start talking faster when explaining something you deeply care about—it's incredibly captivating. I could listen forever.",
      icon: Flame,
      glow: "rgba(255,100,100,0.5)"
    },
    {
      id: "flawed",
      title: d.s3_fla_title || "The Imperfect You",
      subtitle: d.s3_fla_sub || "When you doubt yourself",
      desc: d.s3_fla_desc || "The parts of yourself you try to hide or feel insecure about? Those are the very pieces that make you entirely irreplaceable. I love every single flaw.",
      icon: Heart,
      glow: "rgba(236,72,153,0.5)"
    }
  ];

  // Chat Simulator states
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; sender: "them" | "me"; text: string; time: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatStep, setChatStep] = useState(0);
  const [chatAutoplay, setChatAutoplay] = useState(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const qrMessages: Array<{ id: number; sender: "them" | "me"; text: string; time: string }> = [
    { id: 1, sender: "them", text: "Hey... I realized something today.", time: "11:42 PM" },
    { id: 2, sender: "me", text: "What is it? Is everything okay?", time: "11:43 PM" },
    { id: 3, sender: "them", text: "Everything is beautifully perfect. I just wanted to say thank you.", time: "11:44 PM" },
    { id: 4, sender: "me", text: "Thank you for what? 🥺", time: "11:45 PM" },
    { id: 5, sender: "them", text: "For being my absolute favorite part of every single day. You make my world so much brighter just by being in it.", time: "11:46 PM" },
    { id: 6, sender: "me", text: "You always know exactly how to make my heart melt ❤️", time: "11:46 PM" },
    { id: 7, sender: "them", text: "I mean it. Forever.", time: "11:47 PM" }
  ];

  const [chatMessagesList, setChatMessagesList] = useState<Array<{ id: number; sender: "them" | "me"; text: string; time: string }>>([]);

  useEffect(() => {
    let initial = qrMessages;
    if (d.chat_messages_json) {
      try {
        initial = JSON.parse(d.chat_messages_json);
      } catch (e) {
        console.error("Error parsing chat_messages_json", e);
      }
    }
    setChatMessagesList(initial);
  }, [d.chat_messages_json]);

  const updateMessageText = (id: number, text: string) => {
    const updated = chatMessagesList.map(m => m.id === id ? { ...m, text } : m);
    setChatMessagesList(updated);
    oc?.("chat_messages_json", JSON.stringify(updated));
  };

  const toggleSender = (id: number) => {
    const updated = chatMessagesList.map(m => m.id === id ? { ...m, sender: (m.sender === "me" ? "them" : "me") as "me" | "them" } : m);
    setChatMessagesList(updated);
    oc?.("chat_messages_json", JSON.stringify(updated));
  };

  const deleteMessage = (id: number) => {
    const updated = chatMessagesList.filter(m => m.id !== id);
    setChatMessagesList(updated);
    oc?.("chat_messages_json", JSON.stringify(updated));
  };

  const addMessage = (sender: "me" | "them") => {
    const newId = chatMessagesList.length > 0 ? Math.max(...chatMessagesList.map(m => m.id)) + 1 : 1;
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0'+minutes : minutes;
    const timeStr = `${hours}:${minutesStr} ${ampm}`;

    const newMsg = {
      id: newId,
      sender,
      text: sender === "me" ? "New message..." : "New message...",
      time: timeStr
    };
    const updated = [...chatMessagesList, newMsg];
    setChatMessagesList(updated);
    oc?.("chat_messages_json", JSON.stringify(updated));
  };

  useEffect(() => {
    if (em) return;
    if (activeSlide !== 3) return;
    if (chatStep >= chatMessagesList.length || !chatAutoplay) return;

    const currentMsg = chatMessagesList[chatStep];
    const typingTime = currentMsg.sender === "them" ? Math.max(1200, currentMsg.text.length * 30) : 800;

    const mainTimer = setTimeout(() => {
      if (currentMsg.sender === "them") {
        setIsTyping(true);
      }
      const deliveryTimer = setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [...prev, currentMsg]);
        setChatStep(prev => prev + 1);
      }, typingTime);

      return () => clearTimeout(deliveryTimer);
    }, 400);

    return () => clearTimeout(mainTimer);
  }, [activeSlide, chatStep, chatAutoplay, chatMessagesList, em]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const advanceChatManual = () => {
    if (chatStep >= chatMessagesList.length) return;
    const currentMsg = chatMessagesList[chatStep];
    setChatMessages(prev => [...prev, currentMsg]);
    setChatStep(prev => prev + 1);
  };

  // Memory Gallery
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const memories = [
    { id: 1, caption: d.photo1_caption || "Our first adventure 🌄", src: d.photo1 || "/templates/confess/bear11.gif" },
    { id: 2, caption: d.photo2_caption || "That perfect sunset 🌅", src: d.photo2 || "/templates/confess/bear12.gif" },
    { id: 3, caption: d.photo3_caption || "Laughing together 😂", src: d.photo3 || "/templates/confess/bear13.gif" }
  ];

  // Letter envelope flap trigger
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const openEnvelope = () => {
    setEnvelopeOpen(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.75 } });
    setTimeout(() => {
      setShowLetter(true);
    }, 800);
  };

  // Soulmate Quiz
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const quizQuestions = [
    {
      id: 1,
      question: d.q1_text || "If I could be anywhere in the universe right now, where would it be?",
      options: [
        { text: d.q1_o1 || "Exploring a beautiful new country ✈️", points: 5 },
        { text: d.q1_o2 || "Right here, by your side indefinitely 💕", points: 10 },
        { text: d.q1_o3 || "Stargazing on a quiet mountain 🌌", points: 5 }
      ]
    },
    {
      id: 2,
      question: d.q2_text || "When I look at you, what is my very first thought?",
      options: [
        { text: d.q2_o1 || "'How did I get so incredibly lucky?' ✨", points: 15 },
        { text: d.q2_o2 || "'I love their gorgeous smile.' 😊", points: 5 },
        { text: d.q2_o3 || "'We are going to have so much fun today.' 🎉", points: 5 }
      ]
    },
    {
      id: 3,
      question: d.q3_text || "What is my absolute favorite thing about 'us'?",
      options: [
        { text: d.q3_o1 || "The way we can laugh about anything 🤣", points: 5 },
        { text: d.q3_o2 || "Our deep, late-night conversations 🌙", points: 5 },
        { text: d.q3_o3 || "Knowing I found my forever best friend 💖", points: 15 }
      ]
    }
  ];

  const handleQuizAnswer = (pts: number) => {
    setQuizScore(prev => prev + pts);
    setTimeout(() => {
      if (quizIndex + 1 < quizQuestions.length) {
        setQuizIndex(prev => prev + 1);
      } else {
        setQuizFinished(true);
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      }
    }, 400);
  };

  const getQuizResult = () => {
    const loverName = d.s1_name || "Kinza";
    if (quizScore >= 35) {
      return {
        title: d.s7_res_high_title || `Absolute Soulmates, ${loverName} 💫`,
        msg: d.s7_res_high_msg || "You know my heart inside and out! Every perfectly answered question just proves what I already knew: we are absolutely meant to be forever."
      };
    } else if (quizScore >= 20) {
      return {
        title: d.s7_res_med_title || `My Favorite Person, ${loverName} 💖`,
        msg: d.s7_res_med_msg || "You know me so wonderfully well. I love that no matter what, we're always learning new beautiful things about each other."
      };
    } else {
      return {
        title: d.s7_res_low_title || `A Never-ending Discovery, ${loverName} ✨`,
        msg: d.s7_res_low_msg || "The best part of this relationship isn't knowing everything perfectly—it's that I get to spend the rest of my life letting you explore my heart."
      };
    }
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const handleReplay = () => {
    setChatMessages([]);
    setChatStep(0);
    setChatAutoplay(true);
    setEnvelopeOpen(false);
    setShowLetter(false);
    restartQuiz();
    setActiveSlide(0);
  };

  const slideTitle = d.s1_name || "Kinza";

  return (
    <div className="relative min-h-screen w-full overflow-hidden select-none noise-overlay bg-background text-foreground font-sans">
      {/* Background Twinkle Stars */}
      <TwinkleBackground />

      {/* Background Glowing Orbs */}
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] rounded-full pointer-events-none opacity-30 z-0"
        style={{ background: "radial-gradient(ellipse, hsl(var(--rose) / 0.3) 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="fixed bottom-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] rounded-full pointer-events-none opacity-20 z-0"
        style={{ background: "radial-gradient(ellipse, hsl(var(--lavender) / 0.4) 0%, transparent 70%)", filter: "blur(100px)" }} />
      <div className="fixed top-1/2 right-[-10%] w-[30%] h-[30%] rounded-full pointer-events-none opacity-15 z-0"
        style={{ background: "radial-gradient(ellipse, hsl(var(--accent) / 0.3) 0%, transparent 70%)", filter: "blur(60px)" }} />

      {/* Floating Sparkle Bears */}
      <Oj currentPage={activeSlide} />

      {/* Audio Setup / Sound Bar Widget */}
      {!em && (
        <>
          <AnimatePresence>
            {showMusicHint && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 1.5 }}
                className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-card/80 backdrop-blur-md border border-border/40 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-2xl"
              >
                <span className="text-sm text-foreground/80 font-medium">🎵 Turn on music for a better experience</span>
                <button
                  onClick={toggleMusic}
                  className="bg-primary/20 border border-primary/40 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold hover:bg-[#eb4799]/30 transition-colors"
                >
                  Play
                </button>
                <button onClick={() => setShowMusicHint(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={toggleMusic}
            className="fixed top-4 right-4 z-50 w-11 h-11 rounded-full bg-card/60 backdrop-blur-md border border-border/40 flex items-center justify-center hover:bg-card/80 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={musicPlaying ? "Mute music" : "Play music"}
          >
            {musicPlaying ? (
              <motion.svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </motion.svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </motion.button>
        </>
      )}

      {/* Main Slides Selector */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* SLIDE 0: Landing Slide */}
          {activeSlide === 0 && (
            <motion.div
              key="landing"
              className="flex flex-col items-center justify-center text-center z-10 min-h-screen px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-full h-full absolute inset-0 pointer-events-none z-[-1]" style={{ willChange: "transform" }} />
              
              <div className="relative mb-8">
                <motion.img
                  src="/templates/confess/dudu1.png"
                  alt="Cute bear holding a rose"
                  width={220}
                  height={220}
                  className="mb-8 glow-rose drop-shadow-lg relative z-10"
                  style={{ objectFit: "contain", willChange: "transform" }}
                  initial={{ opacity: 0, scale: 0, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, -10, 0] }}
                  transition={{
                    opacity: { duration: 0.6 },
                    scale: { type: "spring", stiffness: 200, damping: 15 },
                    rotate: { type: "spring", stiffness: 100, damping: 12 },
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }
                  }}
                />
              </div>

              <motion.h1
                className="text-4xl md:text-6xl font-bold mb-4 tracking-wide"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              >
                Hey{" "}
                <motion.span
                  className="font-display text-primary text-glow-rose text-6xl md:text-8xl inline-block"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 150, damping: 12 }}
                >
                  <ET fid="s1_name" data={d} onChange={oc} editMode={em} />...
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-muted-foreground mb-4 max-w-md font-light leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <TypewriterSpan text={d.s1_welcome_text || "I created a little something just for you, because there are words my heart needs you to hear."} delay={1.2} />
              </motion.p>

              <motion.p
                className="text-sm text-primary/80 mb-10 italic font-display text-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 1 }}
              >
                <ET fid="s1_signature" data={d} onChange={oc} editMode={em} />
              </motion.p>

              {showIntroBtn && (
                <motion.button
                  onClick={() => setActiveSlide(1)}
                  className="flex items-center gap-4 btn-primary-depth text-primary-foreground px-12 py-5 rounded-full font-bold text-xl md:text-2xl backdrop-blur-md shadow-2xl"
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                    {d.s1_btn_text || "Open My Heart 💌"}
                  </motion.span>
                  <motion.svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </motion.svg>
                </motion.button>
              )}
            </motion.div>
          )}

          {/* SLIDE 1: Why It's You */}
          {activeSlide === 1 && (
            <motion.div
              key="whyitsyou"
              className="flex flex-col items-center justify-start text-center z-10 min-h-screen px-4 pb-20 pt-20 w-full max-w-2xl mx-auto overflow-y-auto no-scrollbar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <BackButton onClick={() => setActiveSlide(0)} editMode={em} />

              <div className="mb-10 w-full">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-accent drop-shadow-md mb-4 pb-1">
                  Why It's You, <ET fid="s1_name" data={d} onChange={oc} editMode={em} />.
                </h2>
                <p className="text-foreground/70 text-sm md:text-base font-medium max-w-xs md:max-w-sm mx-auto leading-relaxed">
                  <ET fid="s2_subtext" data={d} onChange={oc} editMode={em} multiline={true} />
                </p>
              </div>

              <div className="w-full flex flex-col gap-5 md:gap-6 mb-16 relative">
                <div className="absolute left-6 md:left-[3.25rem] top-8 bottom-8 w-px bg-primary/20 pointer-events-none hidden sm:block" />
                
                {defaultReasons.map((reason, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.4, type: "spring", stiffness: 90, damping: 15 }}
                    className="bg-card/60 backdrop-blur-xl border border-primary/10 rounded-3xl p-5 md:p-6 text-left shadow-xl relative overflow-hidden group hover:border-primary/40 transition-colors"
                  >
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-primary/40 to-primary/80 group-hover:from-primary group-hover:to-accent transition-colors" />
                    
                    <div className="flex gap-4 md:gap-5 items-center pl-2 md:pl-3 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-inner text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all">
                        <Heart className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                      </div>
                      <p className="text-foreground/90 md:text-[17px] font-medium leading-relaxed">
                        <ET fid={`reason${idx + 1}`} data={d} onChange={oc} editMode={em} />
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="w-full flex justify-center pb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + defaultReasons.length * 0.4 }}
              >
                <motion.button
                  onClick={() => setActiveSlide(2)}
                  className="flex items-center justify-center gap-3 btn-primary-depth text-primary-foreground px-10 py-4 rounded-full font-bold text-lg md:text-xl w-[95%] md:w-auto shadow-[0_0_40px_rgba(var(--primary),0.3)] transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{d.s2_btn_text || "And so much more 💖"}</span>
                  <motion.svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </motion.svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* SLIDE 2: Every Version of You */}
          {activeSlide === 2 && (
            <motion.div
              key="versions"
              className="flex flex-col items-center justify-start text-center z-10 min-h-screen px-4 pb-24 pt-20 w-full max-w-2xl mx-auto overflow-y-auto no-scrollbar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <BackButton onClick={() => setActiveSlide(1)} editMode={em} />

              <div className="mb-8 md:mb-12 w-full">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-accent drop-shadow-md mb-4 pb-1">
                  Every Version of {slideTitle}.
                </h2>
                <p className="text-foreground/70 text-sm md:text-base font-medium max-w-xs md:max-w-sm mx-auto leading-relaxed">
                  <ET fid="s3_subtext" data={d} onChange={oc} editMode={em} multiline={true} />
                </p>
              </div>

              <div className="w-full flex-grow flex flex-col gap-4 mb-16 relative">
                {moods.map((m, s) => {
                  const isOpen = activeMood === m.id || em;
                  const Icon = m.icon;
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + s * 0.15, type: "spring", stiffness: 100 }}
                      className={`w-full bg-card/60 backdrop-blur-xl border-2 transition-all duration-300 rounded-3xl overflow-hidden cursor-pointer shadow-lg ${isOpen ? "border-primary/50" : "border-primary/10 hover:border-primary/30"}`}
                      style={{ boxShadow: isOpen ? `0 0 30px ${m.glow}` : "none" }}
                      onClick={() => !em && setActiveMood(activeMood === m.id ? null : m.id)}
                    >
                      <div className="px-5 py-4 md:px-6 md:py-5 flex items-center justify-between w-full select-none bg-black/10">
                        <div className="flex items-center gap-4 text-left">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                            <Icon className="w-5 h-5 md:w-6 md:h-6" />
                          </div>
                          <div className="flex flex-col">
                            <h3 className={`font-bold text-[17px] md:text-lg transition-colors ${isOpen ? "text-primary" : "text-foreground"}`}>
                              <ET fid={`s3_${m.id.substring(0,3)}_title`} data={d} onChange={oc} editMode={em} />
                            </h3>
                            <p className="text-xs md:text-sm text-foreground/50 font-medium">
                              <ET fid={`s3_${m.id.substring(0,3)}_sub`} data={d} onChange={oc} editMode={em} />
                            </p>
                          </div>
                        </div>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="text-primary/50 shrink-0 ml-2">
                          <ChevronDown size={24} />
                        </motion.div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pt-2 md:px-6 md:pb-6 text-left">
                              <div className="w-full h-px bg-primary/10 mb-5" />
                              <p className="text-foreground/80 md:text-base font-medium leading-relaxed italic border-l-2 border-primary/40 pl-4">
                                "<ET fid={`s3_${m.id.substring(0,3)}_desc`} data={d} onChange={oc} editMode={em} multiline={true} />"
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                className="w-full flex justify-center pb-8 sticky bottom-0 z-50 pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <motion.button
                  onClick={() => setActiveSlide(3)}
                  className="flex items-center justify-center gap-3 btn-primary-depth text-primary-foreground px-10 py-4 rounded-full font-bold text-lg md:text-xl w-[95%] md:w-auto shadow-[0_0_40px_rgba(var(--primary),0.3)] transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{d.s3_btn_text || "Continue Our Story"}</span>
                  <motion.svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </motion.svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* SLIDE 3: Chat Simulator */}
          {activeSlide === 3 && (
            <motion.div
              key="chat"
              className="flex flex-col items-center justify-center text-center z-10 min-h-screen px-4 pb-12 pt-20 w-full max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <BackButton onClick={() => setActiveSlide(2)} editMode={em} />

              {/* Chat Frame */}
              <div className="w-full flex flex-col rounded-[2.5rem] bg-[#060814]/80 backdrop-blur-2xl border-4 border-primary/20 shadow-[0_0_50px_rgba(var(--primary),0.15)] relative overflow-hidden h-[75vh]">
                {/* Header */}
                <div className="w-full flex items-center justify-between bg-card/90 backdrop-blur-xl border-b border-white/5 p-4 shadow-sm z-20 shrink-0">
                  <div className="flex items-center gap-3 ml-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary relative">
                      <Heart size={18} className="fill-primary animate-pulse" />
                      <div className="absolute w-3 h-3 bg-green-500 rounded-full border-2 border-[#060814] -bottom-0.5 -right-0.5" />
                    </div>
                    <div className="text-left flex flex-col">
                      <h3 className="font-bold text-foreground leading-tight text-sm md:text-base">
                        <ET fid="s4_title" data={d} onChange={oc} editMode={em} />
                      </h3>
                      <p className="text-[10px] md:text-xs text-green-400 font-medium tracking-wide">
                        <ET fid="s4_status" data={d} onChange={oc} editMode={em} />
                      </p>
                    </div>
                  </div>
                  {!em && (
                    <button
                      onClick={() => setChatAutoplay(!chatAutoplay)}
                      className="p-2 md:p-2.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center gap-2 mr-2"
                      title={chatAutoplay ? "Pause Autoplay" : "Start Autoplay"}
                    >
                      {chatAutoplay ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  )}
                </div>

                {/* Msg log */}
                <div className="w-full flex-grow p-4 md:p-6 overflow-y-auto flex flex-col gap-3 relative scroll-smooth no-scrollbar">
                  <p className="text-xs text-foreground/40 font-semibold mb-6 uppercase tracking-widest text-center mt-2">Today 11:42 PM</p>
                  
                  <AnimatePresence initial={false}>
                    {(em ? chatMessagesList : chatMessages).map(h => {
                      const isMe = h.sender === "me";
                      return (
                        <motion.div
                          key={h.id}
                          initial={em ? false : { opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          className={`w-full flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[85%] md:max-w-[75%] p-3 md:p-4 shadow-md flex flex-col text-left relative group rounded-2xl ${isMe ? "bg-primary text-primary-foreground rounded-br-sm ml-8" : "bg-card/80 backdrop-blur-md border border-white/5 text-foreground rounded-bl-sm mr-8"}`}>
                            {em ? (
                              <textarea
                                value={h.text}
                                onChange={(e) => updateMessageText(h.id, e.target.value)}
                                className="bg-transparent text-inherit border-none outline-none resize-none w-full text-[15px] md:text-base leading-relaxed font-medium"
                                style={{ color: isMe ? "#fff" : "inherit" }}
                                rows={Math.max(1, Math.ceil(h.text.length / 30))}
                              />
                            ) : (
                              <p className="text-[15px] md:text-base leading-relaxed font-medium">{h.text}</p>
                            )}
                            <div className="flex items-center justify-between gap-4 mt-1.5">
                              {em && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => toggleSender(h.id)}
                                    className="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded bg-black/20 hover:bg-black/40 text-white font-semibold transition-colors"
                                  >
                                    Role: {h.sender === "me" ? "Me" : "Them"}
                                  </button>
                                  <button
                                    onClick={() => deleteMessage(h.id)}
                                    className="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300 font-semibold transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                              <span className={`text-[9px] md:text-[10px] self-end font-semibold tracking-wider ${isMe ? "text-primary-foreground/70" : "text-foreground/40"}`}>
                                {h.time} {isMe && "✓✓"}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {isTyping && (
                      <motion.div
                        key="typing"
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="w-full flex justify-start"
                      >
                        <TypingIndicator />
                      </motion.div>
                    )}

                    {em && (
                      <div className="flex gap-2 justify-center mt-4">
                        <button
                          onClick={() => addMessage("them")}
                          className="px-4 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
                        >
                          + Add Message from Them
                        </button>
                        <button
                          onClick={() => addMessage("me")}
                          className="px-4 py-2 rounded-full border border-accent/40 bg-accent/10 text-accent-foreground text-xs font-semibold hover:bg-accent/20 transition-all"
                        >
                          + Add Message from Me
                        </button>
                      </div>
                    )}
                  </AnimatePresence>

                  <div ref={chatScrollRef} className="h-4" />
                </div>

                {/* Send footer */}
                <div className="w-full bg-card/80 backdrop-blur-md p-3 md:p-4 border-t border-white/5 shrink-0 flex items-center gap-2">
                  <div className="flex-grow h-11 bg-black/40 rounded-full border border-white/10 px-5 flex items-center">
                    <span className="text-foreground/40 text-sm italic font-medium">Message...</span>
                  </div>
                  {!chatAutoplay && !em && chatStep < chatMessagesList.length && (
                    <button
                      onClick={advanceChatManual}
                      className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shrink-0 shadow-lg shadow-primary/30"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-8 relative z-40 w-full flex justify-center">
                <AnimatePresence>
                  {(chatStep >= chatMessagesList.length || em) && (
                    <motion.button
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      onClick={() => setActiveSlide(4)}
                      className="flex items-center justify-center gap-3 btn-primary-depth text-primary-foreground px-8 py-4 w-full max-w-[90vw] md:w-auto rounded-full font-bold text-lg md:text-xl backdrop-blur-md shadow-2xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{d.s4_btn_text || "Continue"}</span>
                      <motion.svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </motion.svg>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* SLIDE 4: Memory Gallery */}
          {activeSlide === 4 && (
            <motion.div
              key="gallery"
              className="flex flex-col items-center justify-center text-center z-10 min-h-screen px-4 md:px-6 py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <BackButton onClick={() => setActiveSlide(3)} editMode={em} />

              <motion.div
                className="mb-4"
                initial={{ opacity: 0, scale: 0, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.3 }}
              >
                <img src="/templates/confess/bear1.gif" alt="Heart Sparkle" className="w-20 md:w-28 h-auto glow-rose" />
              </motion.div>

              <motion.h2
                className="text-4xl md:text-6xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Our{" "}
                <span className="font-display text-primary text-glow-rose text-5xl md:text-7xl">
                  memories
                </span>{" "}
                {slideTitle}
              </motion.h2>

              <motion.p
                className="text-muted-foreground text-base mb-10 max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <ET fid="s5_subtext" data={d} onChange={oc} editMode={em} multiline={true} />
              </motion.p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
                {memories.map((m, o) => (
                  <motion.div
                    key={m.id}
                    className="relative aspect-[3/4] md:aspect-square rounded-2xl overflow-hidden shadow-2xl cursor-pointer bg-card border border-border/40"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + o * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.03, boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.5)" }}
                    onClick={() => !em && setSelectedPhoto(m.src)}
                  >
                    <img
                      src={m.src}
                      alt={m.caption}
                      className="w-full h-full object-cover"
                      onError={s => {
                        s.currentTarget.src = "https://images.unsplash.com/photo-1518199266791-5375a83164ba?w=500&h=500&fit=crop";
                      }}
                    />
                    {em && <ImageUploader fid={`photo${m.id}`} data={d} onChange={oc} defaultSrc={m.src} />}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-center items-end h-1/2">
                      <p className="text-white/90 text-sm font-medium drop-shadow-md">
                        <ET fid={`photo${m.id}_caption`} data={d} onChange={oc} editMode={em} />
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Lightbox expanded memory */}
              <AnimatePresence>
                {selectedPhoto && (
                  <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedPhoto(null)}
                  >
                    <motion.img
                      src={selectedPhoto}
                      className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      onClick={i => i.stopPropagation()}
                      onError={s => {
                        s.currentTarget.src = "https://images.unsplash.com/photo-1518199266791-5375a83164ba?w=800&fit=crop";
                      }}
                    />
                    <button
                      className="absolute top-6 right-6 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 h-10 w-10 flex items-center justify-center transition-colors"
                      onClick={() => setSelectedPhoto(null)}
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="w-full flex justify-center pb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  onClick={() => setActiveSlide(5)}
                  className="flex items-center gap-3 btn-primary-depth text-primary-foreground px-8 py-4 rounded-full font-bold text-lg backdrop-blur-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{d.s5_btn_text || "Continue 💘"}</span>
                  <motion.svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </motion.svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* SLIDE 5: 3D Envelope reveal */}
          {activeSlide === 5 && (
            <motion.div
              key="loveletter"
              className="flex flex-col items-center justify-center text-center z-10 min-h-screen px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <BackButton onClick={() => setActiveSlide(4)} editMode={em} />

              <AnimatePresence mode="wait">
                {!envelopeOpen && (
                  <motion.div
                    key="envelope-header"
                    initial={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      className="mb-4"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                      transition={{ scale: { type: "spring", stiffness: 150, damping: 10 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                    >
                      <img
                        src="/templates/confess/bear14.gif"
                        alt="Cute closed letter bear"
                        className="w-24 md:w-32 h-auto"
                      />
                    </motion.div>
                    
                    <motion.h2
                      className="text-3xl md:text-5xl font-bold mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.7 }}
                    >
                      A <span className="font-display text-primary text-glow-rose text-4xl md:text-6xl text-black">secret</span> for you
                    </motion.h2>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Envelope Morphing Container */}
              <div className={`relative ${envelopeOpen ? "w-[95%] max-w-xl h-auto" : "w-[90vw] max-w-[22rem] h-[60vw] max-h-[15rem] sm:w-[32rem] sm:max-w-none sm:h-[22rem] sm:max-h-none"} mb-10 transition-all duration-700`}>
                <AnimatePresence mode="wait">
                  {envelopeOpen ? (
                    // Open letter view
                    <motion.div
                      key="letter"
                      className="w-full flex items-center justify-center p-4 relative"
                      initial={{ opacity: 0, y: 50, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
                    >
                      <div
                        className="w-full max-w-sm md:max-w-md bg-[#fffcf9] rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-t-8 border-primary relative overflow-hidden"
                        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')", color: "#1c1917" }}
                      >
                        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                        <div className="space-y-4 md:space-y-6 relative z-10 text-left">
                          <p className="font-display text-black text-2xl md:text-3xl mb-2 md:mb-4 border-b border-black/20 pb-2 flex justify-between items-end">
                            <ET fid="s6_letter_title" data={d} onChange={oc} editMode={em} />
                            <span className="text-xs font-sans tracking-widest text-black/40 uppercase italic font-bold">
                              <ET fid="s6_letter_tag" data={d} onChange={oc} editMode={em} />
                            </span>
                          </p>
                          <div className="space-y-3 md:space-y-4 text-black font-sans font-medium text-sm md:text-base leading-relaxed">
                            <p><ET fid="s6_letter_p1" data={d} onChange={oc} editMode={em} multiline={true} /></p>
                            <p><ET fid="s6_letter_p2" data={d} onChange={oc} editMode={em} multiline={true} /></p>
                            <p className="italic text-black/80"><ET fid="s6_letter_p3" data={d} onChange={oc} editMode={em} multiline={true} /></p>
                          </div>
                          <div className="pt-4 md:pt-6 border-t border-primary/10 text-right">
                            <p className="font-display text-black text-xl md:text-2xl font-bold">
                              <ET fid="s6_signoff" data={d} onChange={oc} editMode={em} />
                            </p>
                          </div>

                          {!em && (
                            <motion.button
                              onClick={() => setActiveSlide(6)}
                              className="w-full mt-6 md:mt-8 flex items-center justify-center gap-2 btn-primary-depth text-primary-foreground py-3.5 md:py-4 rounded-xl font-bold text-lg md:text-xl shadow-xl"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 1 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span>{d.s6_btn_text || "Continue 💘"}</span>
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    // Closed envelope 3D mockup
                    <motion.div
                      key="envelope"
                      className="relative cursor-pointer group w-full h-full"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                      transition={{ duration: 0.5 }}
                      onClick={openEnvelope}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="absolute inset-0 bg-[#f5f5dc] rounded-2xl shadow-2xl overflow-hidden border border-[#e5e5c5]">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')" }} />
                      </div>
                      <div className="absolute inset-0 z-20 pointer-events-none">
                        <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 50% 50%, 0 100%)", background: "linear-gradient(to right, #ececd1, #e1e1b5)", filter: "drop-shadow(2px 0 5px rgba(0,0,0,0.05))" }} />
                        <div className="absolute inset-0" style={{ clipPath: "polygon(100% 0, 50% 50%, 100% 100%)", background: "linear-gradient(to left, #ececd1, #e1e1b5)", filter: "drop-shadow(-2px 0 5px rgba(0,0,0,0.05))" }} />
                        <div className="absolute inset-0" style={{ clipPath: "polygon(0 100%, 50% 50%, 100% 100%)", background: "linear-gradient(to top, #fdf5e6, #f5f5dc)", filter: "drop-shadow(0 -4px 10px rgba(0,0,0,0.08))" }} />
                      </div>
                      <div className="absolute top-0 left-0 right-0 z-30 origin-top h-full" style={{ perspective: 1200 }}>
                        <div className="absolute inset-0 w-full h-[51%] bg-[#fffdd0]" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "linear-gradient(to bottom, #fffef0, #f5f5dc)", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.1))" }} />
                      </div>
                      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                          <div className="w-16 h-16 rounded-full bg-primary border-4 border-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                            <Heart className="w-8 h-8 text-white fill-current" />
                          </div>
                        </div>
                      </div>
                      <motion.p
                        className="absolute -bottom-12 left-0 right-0 text-primary/80 text-sm font-medium tracking-[0.3em] uppercase text-center"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ET fid="s6_hint" data={d} onChange={oc} editMode={em} />
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* SLIDE 6: Quiz Screen */}
          {activeSlide === 6 && (
            <motion.div
              key="quiz"
              className="flex flex-col items-center justify-center text-center z-10 min-h-screen px-4 py-12 w-full max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <BackButton
                onClick={() => {
                  if (quizFinished) restartQuiz();
                  else if (quizIndex > 0) setQuizIndex(prev => prev - 1);
                  else setActiveSlide(5);
                }}
                editMode={em}
              />

              <AnimatePresence mode="wait">
                {quizFinished ? (
                  // Outcome card
                  <motion.div
                    key="quiz-outcome"
                    className="w-full flex flex-col items-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <div className="bg-card/80 backdrop-blur-xl border-t-4 border-primary rounded-3xl p-8 md:p-12 shadow-[0_0_60px_rgba(var(--primary),0.2)] w-[95%] max-w-lg relative overflow-hidden text-center">
                      <Heart className="absolute -top-10 -right-10 w-48 h-48 text-primary/5 -rotate-12 fill-primary/5 pointer-events-none" />
                      
                      <motion.div
                        className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 outline outline-4 outline-primary/20 outline-offset-4"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring", damping: 12 }}
                      >
                        <Heart className="w-10 h-10 text-primary fill-primary origin-center" />
                      </motion.div>

                      <motion.h2
                        className="text-3xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4 drop-shadow-md"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        {getQuizResult().title}
                      </motion.h2>
                      
                      <motion.p
                        className="text-foreground/80 md:text-lg font-medium leading-relaxed mb-10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        {getQuizResult().msg}
                      </motion.p>

                      <motion.div
                        className="flex flex-col gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        {!em && (
                          <motion.button
                            onClick={() => setActiveSlide(7)}
                            className="flex justify-center items-center gap-3 w-full btn-primary-depth text-primary-foreground px-8 py-4 rounded-full font-bold text-lg md:text-xl backdrop-blur-md shadow-xl"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <span>{d.s7_btn_text || "See my final promise"}</span>
                            <motion.svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </motion.svg>
                          </motion.button>
                        )}

                        <button
                          onClick={restartQuiz}
                          className="text-primary/60 hover:text-primary font-medium text-sm transition-colors uppercase tracking-widest mt-2 p-2"
                        >
                          Retake Quiz ↺
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  // Quiz questions
                  <motion.div
                    key={`q-${quizIndex}`}
                    className="w-full flex flex-col items-center"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                  >
                    <div className="mb-8 w-full flex flex-col items-center">
                      <p className="text-primary tracking-widest text-sm font-bold uppercase mb-3">
                        Match My Heart
                      </p>
                      
                      <div className="flex gap-2 mb-2">
                        {quizQuestions.map((_, f) => (
                          <motion.div
                            key={f}
                            className={`h-2 w-10 md:w-16 rounded-full ${f <= quizIndex ? "bg-primary" : "bg-primary/20"}`}
                            initial={false}
                            animate={{ scale: f === quizIndex ? 1.1 : 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        ))}
                      </div>
                      <p className="text-foreground/50 text-xs mt-1">
                        Question {quizIndex + 1} of {quizQuestions.length}
                      </p>
                    </div>

                    <div className="bg-card/70 backdrop-blur-xl border border-primary/20 rounded-3xl p-6 md:p-10 shadow-[0_0_40px_rgba(var(--primary),0.15)] w-full relative">
                      <Heart className="absolute -top-6 -right-6 text-primary/30 rotate-12 blur-sm pointer-events-none w-20 h-20 fill-current" />
                      
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-medium leading-tight mb-8 text-foreground drop-shadow-sm">
                        <ET fid={`q${quizIndex + 1}_text`} data={d} onChange={oc} editMode={em} />
                      </h3>

                      <div className="space-y-4 w-full">
                        {quizQuestions[quizIndex].options.map((opt, optIdx) => (
                          <motion.button
                            key={optIdx}
                            onClick={() => !em && handleQuizAnswer(opt.points)}
                            className="w-full text-left p-4 md:p-5 rounded-2xl bg-background/50 border border-primary/10 hover:border-primary hover:bg-primary/5 transition-all outline-none focus:ring-2 focus:ring-primary shadow-sm hover:shadow-md flex items-center justify-between group"
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="text-foreground/90 font-medium text-base md:text-lg">
                              <ET fid={`q${quizIndex + 1}_o${optIdx + 1}`} data={d} onChange={oc} editMode={em} />
                            </span>
                            <div className="w-6 h-6 rounded-full border-2 border-primary/30 group-hover:border-primary flex items-center justify-center transition-colors">
                              <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* SLIDE 7: Final Promise Page */}
          {activeSlide === 7 && (
            <motion.div
              key="promise"
              className="flex flex-col items-center justify-center text-center z-10 min-h-screen px-4 py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Rain confetti particles */}
              <FloatingEmojis />

              <BackButton onClick={() => setActiveSlide(6)} editMode={em} />

              <div className="mb-6 w-full max-w-[280px] md:max-w-xs">
                <motion.img
                  src="/templates/confess/bear3.gif"
                  alt="Cute bear and panda kissing"
                  className="w-full h-auto drop-shadow-2xl"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                />
              </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                My{" "}
                <span className="font-display text-primary text-glow-rose text-5xl md:text-7xl">
                  promise
                </span>{" "}
                to <ET fid="s1_name" data={d} onChange={oc} editMode={em} />
              </h2>

              <div className="bg-card/40 backdrop-blur-md border border-primary/20 rounded-2xl p-6 max-w-sm mb-6 shadow-xl mx-auto">
                <p className="text-foreground/90 text-base md:text-lg font-medium leading-relaxed mb-3">
                  <ET fid="s8_promise_bold" data={d} onChange={oc} editMode={em} multiline={true} />
                </p>
                <p className="text-foreground/70 text-sm md:text-base font-normal leading-relaxed italic">
                  <ET fid="s8_promise_italic" data={d} onChange={oc} editMode={em} multiline={true} />
                </p>
              </div>

              <p className="font-display text-primary text-4xl md:text-5xl text-glow-rose mb-8">
                <ET fid="s8_footer" data={d} onChange={oc} editMode={em} />
              </p>

              {!em && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
                  <motion.button
                    onClick={handleReplay}
                    className="flex items-center justify-center gap-2 btn-primary-depth text-primary-foreground px-8 py-4 w-full max-w-[90vw] md:w-auto rounded-full font-bold text-lg md:text-xl backdrop-blur-md shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      animate={{ rotate: [0, -360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </motion.svg>
                    <span>{d.s8_btn_text || "Replay Story"}</span>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating brand button for Kinza Codes */}
      <Fj editMode={em} />
    </div>
  );
}
