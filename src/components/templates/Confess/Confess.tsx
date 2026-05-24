"use client";
import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Heart, Sparkles, Send, Volume2, VolumeX, ChevronLeft, ChevronRight, RotateCcw, Check } from "lucide-react";

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

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white/40 animate-twinkle"
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

// Side floating emojis component for Dj
function FloatingEmojis() {
  const [emojis, setEmojis] = useState<Array<{ id: number; x: number; y: number; size: number; rotation: number; delay: number; duration: number; emoji: string }>>([]);
  useEffect(() => {
    const symbols = ["💕", "💖", "💗", "✨", "💜", "🩷", "💫", "🌸"];
    const list = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 14 + Math.random() * 20,
      rotation: Math.random() * 360,
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 3,
      emoji: symbols[Math.floor(Math.random() * symbols.length)]
    }));
    setEmojis(list);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {emojis.map(e => (
        <div
          key={e.id}
          className="absolute animate-float-emoji"
          style={{
            left: `${e.x}%`,
            top: `${e.y}%`,
            fontSize: e.size,
            animationDelay: `${e.delay}s`,
            animationDuration: `${e.duration}s`,
          }}
        >
          {e.emoji}
        </div>
      ))}
    </div>
  );
}

// Helper typing animation component
function TypingIndicator() {
  return (
    <div className="flex gap-1.5 bg-card/85 backdrop-blur-md border border-white/5 px-3.5 py-3 rounded-2xl rounded-bl-sm w-fit shadow-md items-center">
      <div className="w-1.5 h-1.5 rounded-full bg-[#eb4799] animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-1.5 h-1.5 rounded-full bg-[#eb4799] animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-1.5 h-1.5 rounded-full bg-[#eb4799] animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

// Interactive Typewriter Helper
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
    }, 45);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span>
      {typed}
      {started && typed.length < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-[#eb4799] ml-0.5 align-middle animate-pulse" />
      )}
    </span>
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

  const [activeSlide, setActiveSlide] = useState(1);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [showMusicHint, setShowMusicHint] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync forcedSlide inside editor
  useEffect(() => {
    if (em && forcedSlide !== undefined) {
      // Shift forcedSlide since background configuration is slide index 0 in the database schema
      const mappedIndex = forcedSlide === 0 ? 1 : forcedSlide;
      setActiveSlide(mappedIndex);
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
      subtitle: d.s3_rad_sub || "When you're glowing",
      desc: d.s3_rad_desc || "There is nothing more infectious than your pure happiness. Your smile lights up every room, and seeing you genuinely happy is my favorite sight in the world.",
      img: d.s3_rad_img || "/templates/confess/bear4.gif"
    },
    {
      id: "exhausted",
      title: d.s3_exh_title || "The Exhausted You",
      subtitle: d.s3_exh_sub || "When things get heavy",
      desc: d.s3_exh_desc || "When you're burnt out and need a quiet place to hide, my arms will always be that safe space. You never have to pretend to be strong around me.",
      img: d.s3_exh_img || "/templates/confess/bear6.gif"
    },
    {
      id: "passionate",
      title: d.s3_pas_title || "The Passionate You",
      subtitle: d.s3_pas_sub || "When talking about passions",
      desc: d.s3_pas_desc || "The way your eyes light up and you start talking faster when explaining something you deeply care about—it's incredibly captivating. I could listen forever.",
      img: d.s3_pas_img || "/templates/confess/bear5.gif"
    },
    {
      id: "flawed",
      title: d.s3_fla_title || "The Imperfect You",
      subtitle: d.s3_fla_sub || "When you doubt yourself",
      desc: d.s3_fla_desc || "The parts of yourself you try to hide or feel insecure about? Those are the very pieces that make you entirely irreplaceable. I love every single flaw.",
      img: d.s3_fla_img || "/templates/confess/bear9.gif"
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

  useEffect(() => {
    if (activeSlide !== 4) return;
    if (chatStep >= qrMessages.length || !chatAutoplay) return;

    const currentMsg = qrMessages[chatStep];
    const typingTime = currentMsg.sender === "them" ? Math.max(1200, currentMsg.text.length * 25) : 700;

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
  }, [activeSlide, chatStep, chatAutoplay]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const advanceChatManual = () => {
    if (chatStep >= qrMessages.length) return;
    const currentMsg = qrMessages[chatStep];
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
    }, 850);
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
    }, 350);
  };

  const getQuizResult = () => {
    if (quizScore >= 35) {
      return {
        title: d.s7_res_high_title || "Absolute Soulmates, Kinza 💫",
        msg: d.s7_res_high_msg || "You know my heart inside and out! Every perfectly answered question just proves what I already knew: we are absolutely meant to be forever."
      };
    } else if (quizScore >= 20) {
      return {
        title: d.s7_res_med_title || "My Favorite Person, Kinza 💖",
        msg: d.s7_res_med_msg || "You know me so wonderfully well. I love that no matter what, we're always learning new beautiful things about each other."
      };
    } else {
      return {
        title: d.s7_res_low_title || "A Never-ending Discovery, Kinza ✨",
        msg: d.s7_res_low_msg || "The best part of this relationship isn't knowing everything perfectly—it's that I get to spend the rest of my life letting you explore my heart."
      };
    }
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
  };

  // Replay
  const handleReplay = () => {
    setChatMessages([]);
    setChatStep(0);
    setChatAutoplay(true);
    setEnvelopeOpen(false);
    setShowLetter(false);
    restartQuiz();
    setActiveSlide(1);
  };

  const slideTitle = d.s1_name || "Kinza";

  return (
    <div className="confess-container relative min-h-screen w-full overflow-hidden select-none bg-[#060814] text-[#f8fafc] font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Quicksand:wght@400;500;600;700&display=swap');
        
        .confess-container {
          --rose: 330 80% 65%;
          --primary: 180 80% 60%;
        }

        .confess-container .font-display {
          font-family: 'Dancing Script', cursive;
        }
        .confess-container .font-body {
          font-family: 'Quicksand', sans-serif;
        }

        .confess-container .text-glow-rose {
          text-shadow: 0 0 20px hsl(var(--rose) / 0.5), 0 0 40px hsl(var(--rose) / 0.3);
        }
        .confess-container .glow-rose {
          filter: drop-shadow(0 0 20px hsl(var(--rose) / 0.5));
        }

        .confess-container .btn-primary-depth {
          background: linear-gradient(180deg, #eb4799, #e61980);
          border: 1px solid hsl(330 80% 40%);
          color: #fff;
          box-shadow: 0 1px #f075b366 inset, 0 6px #a11259, 0 8px 20px -5px #b814664d;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateY(-2px);
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .confess-container .btn-primary-depth:hover {
          background: linear-gradient(180deg, #ed5ea6, #e8308c);
          box-shadow: 0 1px #f28cbf80 inset, 0 8px #8a0f4d, 0 12px 25px -4px #a1125966;
          transform: translateY(-4px);
        }
        .confess-container .btn-primary-depth:active {
          transform: translateY(2px);
          box-shadow: 0 1px #e619804d inset, 0 2px #8a0f4d, 0 4px 10px -2px #a1125933;
        }

        .confess-container .btn-ghost-depth {
          background: linear-gradient(180deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.6));
          border: 1px solid rgba(235, 71, 153, 0.3);
          box-shadow: 0 1px rgba(250, 209, 230, 0.1) inset, 0 4px rgba(184, 20, 102, 0.5), 0 6px 12px -2px rgba(230, 25, 128, 0.1);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateY(-1px);
        }
        .confess-container .btn-ghost-depth:hover {
          background: linear-gradient(180deg, rgba(30, 41, 59, 1), rgba(15, 23, 42, 0.8));
          border-color: rgba(230, 25, 128, 0.5);
          box-shadow: 0 1px rgba(250, 209, 230, 0.15) inset, 0 6px rgba(161, 18, 89, 0.6), 0 8px 16px -3px rgba(230, 25, 128, 0.15);
          transform: translateY(-3px);
        }
        .confess-container .btn-ghost-depth:active {
          transform: translateY(1px);
          box-shadow: 0 1px rgba(250, 209, 230, 0.05) inset, 0 2px rgba(138, 15, 77, 0.4), 0 4px 8px -2px rgba(230, 25, 128, 0.1);
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .confess-container .animate-twinkle {
          animation: twinkle 4s ease-in-out infinite;
          will-change: opacity, transform;
        }

        @keyframes floatEmoji {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-300px) rotate(180deg); opacity: 0; }
        }
        .confess-container .animate-float-emoji {
          animation: floatEmoji 4s ease-out infinite;
        }

        .confess-container .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .confess-container .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` }} />

      {/* Global backgrounds */}
      <TwinkleBackground />

      {/* Radiant Glowing Orbs */}
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] rounded-full pointer-events-none opacity-30 z-0"
        style={{ background: "radial-gradient(ellipse, hsl(330 80% 65% / 0.3) 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="fixed bottom-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] rounded-full pointer-events-none opacity-20 z-0"
        style={{ background: "radial-gradient(ellipse, hsl(260 60% 65% / 0.4) 0%, transparent 70%)", filter: "blur(100px)" }} />
      <div className="fixed top-1/2 right-[-10%] w-[30%] h-[30%] rounded-full pointer-events-none opacity-15 z-0"
        style={{ background: "radial-gradient(ellipse, hsl(180 80% 60% / 0.3) 0%, transparent 70%)", filter: "blur(60px)" }} />

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
                className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1e293b]/90 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-2xl"
              >
                <span className="text-xs md:text-sm text-[#f8fafc]/80 font-medium">🎵 Turn on music for the full experience</span>
                <button
                  onClick={toggleMusic}
                  className="bg-[#eb4799]/20 border border-[#eb4799]/40 text-[#eb4799] px-3 py-1 rounded-full text-xs font-semibold hover:bg-[#eb4799]/30 transition-colors"
                >
                  Play
                </button>
                <button onClick={() => setShowMusicHint(false)} className="text-[#f8fafc]/40 hover:text-[#f8fafc] text-xs">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={toggleMusic}
            className="fixed top-4 right-4 z-50 w-11 h-11 rounded-full bg-[#1e293b]/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-[#1e293b]/80 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={musicPlaying ? "Mute music" : "Play music"}
          >
            {musicPlaying ? (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Volume2 className="w-5 h-5 text-[#eb4799]" />
              </motion.div>
            ) : (
              <VolumeX className="w-5 h-5 text-[#f8fafc]/40" />
            )}
          </motion.button>
        </>
      )}

      {/* Floating Sparkle Bears decoration (Left/Right margins) */}
      {activeSlide > 1 && activeSlide < 8 && (
        <div className="fixed inset-0 pointer-events-none z-[-5] overflow-hidden opacity-60 md:opacity-80">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1, y: [0, -10, 0] }}
            transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
            className="absolute left-[2%] top-[10%] w-24 md:w-32"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/templates/confess/bear7.gif" alt="Sparkle Bear" className="w-full h-auto drop-shadow-lg" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1, y: [0, 10, 0] }}
            transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }}
            className="absolute right-[2%] bottom-[12%] w-24 md:w-32"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/templates/confess/bear8.gif" alt="Heart Mascot" className="w-full h-auto drop-shadow-lg" />
          </motion.div>
        </div>
      )}

      {/* MAIN CAROUSEL */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* SLIDE 1: Landing Page */}
          {activeSlide === 1 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center text-center px-6 max-w-lg mx-auto w-full py-16"
            >
              <div className="relative mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0, y: [0, -8, 0] }}
                  transition={{
                    scale: { type: "spring", stiffness: 180, damping: 12 },
                    y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                  }}
                  className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center glow-rose"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.s1_img || "/templates/confess/dudu1.png"}
                    alt="Cute Bear Mascot"
                    className="w-full h-full object-contain"
                  />
                </motion.div>
                {em && <ImageUploader fid="s1_img" data={d} onChange={oc} defaultSrc="/templates/confess/dudu1.png" />}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-wide flex flex-col items-center gap-1">
                <span className="font-body text-lg md:text-xl text-[#f8fafc]/50 font-normal uppercase tracking-[0.2em] mb-1">Hey there</span>
                <span className="font-display text-[#eb4799] text-glow-rose text-6xl md:text-7xl block pt-2">
                  <ET fid="s1_name" data={d} onChange={oc} editMode={em} />
                </span>
              </h1>

              <p className="font-body text-base md:text-lg text-slate-350 max-w-sm mb-6 leading-relaxed">
                <TypewriterSpan text={d.s1_welcome_text || "I created a little something just for you, because there are words my heart needs you to hear."} delay={1.2} />
              </p>

              <p className="font-display text-2xl text-[#eb4799]/85 mb-10 italic">
                <ET fid="s1_signature" data={d} onChange={oc} editMode={em} />
              </p>

              {!em && (
                <motion.button
                  onClick={() => setActiveSlide(2)}
                  className="flex items-center gap-3.5 btn-primary-depth px-10 py-4.5 rounded-full font-bold text-lg md:text-xl shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{d.s1_btn_text || "Open My Heart 💌"}</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* SLIDE 2: Why It's You */}
          {activeSlide === 2 && (
            <motion.div
              key="why-its-you"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-start px-4 pb-20 pt-16 w-full max-w-2xl mx-auto min-h-screen overflow-y-auto no-scrollbar"
            >
              {/* Back button */}
              {!em && (
                <button
                  onClick={() => setActiveSlide(1)}
                  className="fixed top-6 left-6 z-50 flex items-center gap-2 btn-ghost-depth text-[#f8fafc]/70 px-4 py-2 rounded-full text-xs font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}

              <div className="text-center mb-10 mt-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-glow-rose text-[#eb4799] mb-3">
                  <ET fid="s2_heading" data={d} onChange={oc} editMode={em} />
                </h2>
                <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                  <ET fid="s2_subtext" data={d} onChange={oc} editMode={em} multiline={true} />
                </p>
              </div>

              <div className="w-full flex flex-col gap-4.5 mb-12">
                {defaultReasons.map((reason, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -25, y: 15 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.15, type: "spring", stiffness: 100 }}
                    className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-5 text-left shadow-lg relative overflow-hidden group hover:border-[#eb4799]/30 transition-colors"
                  >
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-[#eb4799]/40 to-[#eb4799]/80 group-hover:from-[#eb4799] group-hover:to-[#eb4799]/90 transition-colors" />
                    <div className="flex gap-4 items-center pl-2">
                      <div className="w-10 h-10 rounded-full bg-[#eb4799]/10 flex items-center justify-center shrink-0 border border-[#eb4799]/20 text-[#eb4799] group-hover:bg-[#eb4799] group-hover:text-white transition-all duration-300">
                        <Check className="w-4.5 h-4.5" />
                      </div>
                      <p className="text-[#f8fafc]/90 text-sm md:text-base font-medium leading-relaxed flex-grow">
                        <ET fid={`reason${idx + 1}`} data={d} onChange={oc} editMode={em} />
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {!em && (
                <motion.button
                  onClick={() => setActiveSlide(3)}
                  className="flex items-center justify-center gap-3.5 btn-primary-depth px-10 py-4.5 rounded-full font-bold text-lg md:text-xl w-[90%] md:w-auto shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{d.s2_btn_text || "And so much more 💖"}</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* SLIDE 3: Every Version of You */}
          {activeSlide === 3 && (
            <motion.div
              key="versions-accordion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-start px-4 pb-20 pt-16 w-full max-w-2xl mx-auto min-h-screen overflow-y-auto no-scrollbar"
            >
              {!em && (
                <button
                  onClick={() => setActiveSlide(2)}
                  className="fixed top-6 left-6 z-50 flex items-center gap-2 btn-ghost-depth text-[#f8fafc]/70 px-4 py-2 rounded-full text-xs font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}

              <div className="text-center mb-8 mt-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-glow-rose text-[#eb4799] mb-3">
                  <ET fid="s3_heading" data={d} onChange={oc} editMode={em} />
                </h2>
                <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                  <ET fid="s3_subtext" data={d} onChange={oc} editMode={em} multiline={true} />
                </p>
              </div>

              {/* Accordion List */}
              <div className="w-full flex flex-col gap-3.5 mb-12">
                {moods.map((m, idx) => {
                  const isOpen = activeMood === m.id || em;
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1, type: "spring", stiffness: 100 }}
                      onClick={() => !em && setActiveMood(activeMood === m.id ? null : m.id)}
                      className={`w-full bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden cursor-pointer shadow-md transition-all duration-300 ${isOpen ? "ring-1 ring-[#eb4799]/30" : "hover:bg-slate-800/40"}`}
                    >
                      <div className="flex items-center justify-between p-5 md:p-6">
                        <div className="text-left flex flex-col">
                          <h3 className="font-bold text-base md:text-lg text-slate-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#eb4799]" />
                            <ET fid={`s3_${m.id.substring(0,3)}_title`} data={d} onChange={oc} editMode={em} />
                          </h3>
                          <span className="text-xs text-slate-400 font-medium mt-0.5">
                            <ET fid={`s3_${m.id.substring(0,3)}_sub`} data={d} onChange={oc} editMode={em} />
                          </span>
                        </div>
                        {!em && (
                          <div className={`w-8 h-8 rounded-full bg-[#eb4799]/10 text-[#eb4799] flex items-center justify-center transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden border-t border-white/5"
                          >
                            <div className="p-5 md:p-6 bg-slate-950/40 flex flex-col md:flex-row items-center gap-5 text-left">
                              <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={m.img}
                                  alt={m.title}
                                  className="w-full h-full object-contain rounded-xl"
                                />
                                {em && <ImageUploader fid={`s3_${m.id.substring(0,3)}_img`} data={d} onChange={oc} defaultSrc={m.img} />}
                              </div>
                              <p className="text-slate-350 text-sm font-medium leading-relaxed leading-loose">
                                <ET fid={`s3_${m.id.substring(0,3)}_desc`} data={d} onChange={oc} editMode={em} multiline={true} />
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {!em && (
                <motion.button
                  onClick={() => setActiveSlide(4)}
                  className="flex items-center justify-center gap-3.5 btn-primary-depth px-10 py-4.5 rounded-full font-bold text-lg md:text-xl w-[90%] md:w-auto shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{d.s3_btn_text || "Continue Our Story"}</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* SLIDE 4: Chat Simulator */}
          {activeSlide === 4 && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center px-4 pb-12 pt-20 w-full max-w-2xl mx-auto min-h-screen"
            >
              {!em && (
                <button
                  onClick={() => setActiveSlide(3)}
                  className="fixed top-6 left-6 z-50 flex items-center gap-2 btn-ghost-depth text-[#f8fafc]/70 px-4 py-2 rounded-full text-xs font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}

              {/* Messaging Window Container */}
              <div className="w-full flex flex-col rounded-[2.5rem] bg-[#060814]/85 backdrop-blur-2xl border-4 border-slate-900 shadow-2xl relative overflow-hidden h-[68vh] md:h-[70vh]">
                {/* Header Profile */}
                <div className="w-full flex items-center justify-between bg-slate-950 border-b border-white/5 p-4 z-20 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#eb4799]/15 flex items-center justify-center text-[#eb4799] relative border border-white/5">
                      <Heart className="w-5 h-5 fill-current" />
                      <div className="absolute w-3 h-3 bg-green-500 rounded-full border-2 border-[#060814] -bottom-0.5 -right-0.5" />
                    </div>
                    <div className="text-left flex flex-col">
                      <h3 className="font-bold text-slate-100 text-xs md:text-sm tracking-wide">
                        <ET fid="s4_title" data={d} onChange={oc} editMode={em} />
                      </h3>
                      <span className="text-[9px] md:text-xs text-green-400 font-semibold tracking-wide mt-0.5">
                        <ET fid="s4_status" data={d} onChange={oc} editMode={em} />
                      </span>
                    </div>
                  </div>
                  {!em && (
                    <button
                      onClick={() => setChatAutoplay(!chatAutoplay)}
                      className={`p-2 rounded-full transition-colors text-xs font-bold flex items-center gap-1.5 ${chatAutoplay ? "bg-[#eb4799]/10 text-[#eb4799] hover:bg-[#eb4799]/20" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                    >
                      {chatAutoplay ? "Pause Auto" : "Auto Play"}
                    </button>
                  )}
                </div>

                {/* Message Log Body */}
                <div className="w-full flex-grow p-4 md:p-5 overflow-y-auto flex flex-col gap-3 relative scroll-smooth no-scrollbar">
                  <p className="text-[10px] text-slate-500 font-bold mb-4 uppercase tracking-widest text-center mt-1">Today</p>
                  
                  {chatMessages.map(msg => {
                    const isMe = msg.sender === "me";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 180, damping: 15 }}
                        className={`w-full flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] md:max-w-[75%] p-3.5 shadow-md flex flex-col text-left relative rounded-2xl ${isMe ? "bg-[#eb4799] text-white rounded-br-sm ml-8" : "bg-slate-900 border border-white/5 text-[#f8fafc] rounded-bl-sm mr-8"}`}>
                          <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                          <span className={`text-[9px] mt-1.5 self-end font-bold tracking-wider ${isMe ? "text-white/60" : "text-slate-500"}`}>
                            {msg.time} {isMe && "✓✓"}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full flex justify-start"
                    >
                      <TypingIndicator />
                    </motion.div>
                  )}

                  <div ref={chatScrollRef} className="h-4" />
                </div>

                {/* Footer Send */}
                <div className="w-full bg-slate-950 p-3 md:p-4 border-t border-white/5 shrink-0 flex items-center gap-2">
                  <div className="flex-grow h-11 bg-slate-900 rounded-full border border-white/5 px-5 flex items-center">
                    <span className="text-slate-500 text-xs md:text-sm italic font-medium">Message...</span>
                  </div>
                  {!chatAutoplay && !em && chatStep < qrMessages.length && (
                    <button
                      onClick={advanceChatManual}
                      className="w-11 h-11 rounded-full bg-[#eb4799] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shrink-0 shadow-lg shadow-[#eb4799]/35"
                    >
                      <Send className="w-5 h-5 rotate-45" />
                    </button>
                  )}
                </div>
              </div>

              {!em && chatStep >= qrMessages.length && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 w-full flex justify-center"
                >
                  <motion.button
                    onClick={() => setActiveSlide(5)}
                    className="flex items-center justify-center gap-3.5 btn-primary-depth px-10 py-4 rounded-full font-bold text-lg shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{d.s4_btn_text || "Continue"}</span>
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* SLIDE 5: Memory Gallery */}
          {activeSlide === 5 && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-start px-4 md:px-6 py-16 w-full max-w-4xl mx-auto min-h-screen"
            >
              {!em && (
                <button
                  onClick={() => setActiveSlide(4)}
                  className="fixed top-6 left-6 z-50 flex items-center gap-2 btn-ghost-depth text-[#f8fafc]/70 px-4 py-2 rounded-full text-xs font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}

              <div className="text-center mb-8 mt-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-glow-rose text-[#eb4799] mb-3">
                  <ET fid="s5_title" data={d} onChange={oc} editMode={em} />{" "}
                  <span className="text-white font-sans text-glow-none">
                    <ET fid="s5_name" data={d} onChange={oc} editMode={em} />
                  </span>
                </h2>
                <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                  <ET fid="s5_subtext" data={d} onChange={oc} editMode={em} multiline={true} />
                </p>
              </div>

              {/* Grid of memory polaroid frames */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6.5 w-full mb-10">
                {memories.map((m, idx) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.12, duration: 0.5 }}
                    whileHover={{ scale: 1.03, rotate: idx % 2 === 0 ? 1.5 : -1.5 }}
                    onClick={() => !em && setSelectedPhoto(m.src)}
                    className="relative bg-slate-900 border border-white/5 rounded-3xl p-4 shadow-2xl cursor-pointer flex flex-col items-center overflow-hidden hover:border-[#eb4799]/30 transition-all duration-300"
                  >
                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.src}
                        alt={m.caption}
                        className="w-full h-full object-cover"
                      />
                      {em && <ImageUploader fid={`photo${m.id}`} data={d} onChange={oc} defaultSrc={m.src} />}
                    </div>
                    <div className="pt-4 pb-2 w-full text-center shrink-0">
                      <p className="text-slate-200 text-sm font-semibold tracking-wide leading-relaxed">
                        <ET fid={`photo${m.id}_caption`} data={d} onChange={oc} editMode={em} />
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Expanded Polaroid Modal */}
              <AnimatePresence>
                {selectedPhoto && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedPhoto(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.9 }}
                      transition={{ type: "spring", damping: 25 }}
                      onClick={e => e.stopPropagation()}
                      className="relative max-w-full max-h-[85vh] bg-slate-900 rounded-3xl p-5 border border-white/10 shadow-2xl flex flex-col items-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedPhoto}
                        alt="Zoomed memory"
                        className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-xl"
                      />
                      <button
                        className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 rounded-full w-9 h-9 flex items-center justify-center transition-colors font-bold"
                        onClick={() => setSelectedPhoto(null)}
                      >
                        ✕
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!em && (
                <motion.button
                  onClick={() => setActiveSlide(6)}
                  className="flex items-center gap-3.5 btn-primary-depth px-10 py-4.5 rounded-full font-bold text-lg shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{d.s5_btn_text || "Continue 💘"}</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* SLIDE 6: 3D Envelope reveal */}
          {activeSlide === 6 && (
            <motion.div
              key="loveletter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center text-center px-6 max-w-xl mx-auto w-full min-h-screen py-16"
            >
              {!em && (
                <button
                  onClick={() => setActiveSlide(5)}
                  className="fixed top-6 left-6 z-50 flex items-center gap-2 btn-ghost-depth text-[#f8fafc]/70 px-4 py-2 rounded-full text-xs font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}

              {/* Title Section */}
              <AnimatePresence>
                {!showLetter && (
                  <motion.div
                    initial={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center mb-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                      transition={{
                        scale: { type: "spring", stiffness: 140, damping: 10 },
                        y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="w-24 h-24 md:w-32 md:h-32 mb-4 relative"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={d.s6_envelope_img || "/templates/confess/bear14.gif"}
                        alt="Kitten Envelope Mascot"
                        className="w-full h-full object-contain"
                      />
                      {em && <ImageUploader fid="s6_envelope_img" data={d} onChange={oc} defaultSrc="/templates/confess/bear14.gif" />}
                    </motion.div>

                    <h2 className="text-3xl md:text-4xl font-bold leading-tight flex items-center gap-2">
                      <ET fid="s6_heading" data={d} onChange={oc} editMode={em} />{" "}
                      <span className="font-display text-[#eb4799] text-glow-rose text-4xl md:text-5xl text-black font-semibold">
                        <ET fid="s6_span" data={d} onChange={oc} editMode={em} />
                      </span>{" "}
                      <ET fid="s6_suffix" data={d} onChange={oc} editMode={em} />
                    </h2>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Isometric Envelope */}
              <div className="relative w-full max-w-md aspect-[4/3] flex items-center justify-center mb-10">
                <AnimatePresence mode="wait">
                  {showLetter ? (
                    // Open Letter Sheet
                    <motion.div
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      className="w-full bg-[#fffcf8] rounded-3xl p-6 md:p-8 shadow-2xl border-t-8 border-[#eb4799] relative overflow-hidden"
                      style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')", color: "#1c1917" }}
                    >
                      {/* Inner Letter Content */}
                      <div className="space-y-4 md:space-y-6 relative z-10 flex flex-col text-left">
                        <div className="border-b border-rose-900/10 pb-3 flex justify-between items-end">
                          <span className="font-display text-2xl md:text-3xl text-stone-850 font-bold">
                            <ET fid="s6_letter_title" data={d} onChange={oc} editMode={em} />
                          </span>
                          <span className="text-[9px] md:text-xs font-sans tracking-widest text-rose-800/40 uppercase italic font-bold">
                            <ET fid="s6_letter_tag" data={d} onChange={oc} editMode={em} />
                          </span>
                        </div>
                        <div className="space-y-3.5 text-stone-800 font-medium text-xs md:text-sm leading-relaxed font-body">
                          <p><ET fid="s6_letter_p1" data={d} onChange={oc} editMode={em} multiline={true} /></p>
                          <p><ET fid="s6_letter_p2" data={d} onChange={oc} editMode={em} multiline={true} /></p>
                          <p className="italic text-stone-800/80"><ET fid="s6_letter_p3" data={d} onChange={oc} editMode={em} multiline={true} /></p>
                        </div>
                        <div className="pt-4 border-t border-rose-900/5 text-right font-display text-xl md:text-2xl text-stone-850 font-bold">
                          <ET fid="s6_signoff" data={d} onChange={oc} editMode={em} />
                        </div>

                        {!em && (
                          <motion.button
                            onClick={() => setActiveSlide(7)}
                            className="w-full mt-5 flex items-center justify-center gap-2 btn-primary-depth py-4 rounded-2xl font-bold text-lg shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span>{d.s6_btn_text || "Continue 💘"}</span>
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    // Closed envelope click trigger
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.08, opacity: 0 }}
                      onClick={openEnvelope}
                      className="relative w-72 h-44 sm:w-80 sm:h-48 cursor-pointer group"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {/* Envelope Background Card */}
                      <div className="absolute inset-0 bg-[#e6d0bc] rounded-2xl shadow-xl overflow-hidden border border-[#d6bfab]">
                        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')" }} />
                      </div>

                      {/* Sides Isometric ClipPaths */}
                      <div className="absolute inset-0 z-20 pointer-events-none">
                        <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 50% 50%, 0 100%)", background: "linear-gradient(to right, #dec4ae, #ceb49c)" }} />
                        <div className="absolute inset-0" style={{ clipPath: "polygon(100% 0, 50% 50%, 100% 100%)", background: "linear-gradient(to left, #dec4ae, #ceb49c)" }} />
                        <div className="absolute inset-0" style={{ clipPath: "polygon(0 100%, 50% 50%, 100% 100%)", background: "linear-gradient(to top, #edd1bb, #dec4ae)", filter: "drop-shadow(0 -4px 8px rgba(0,0,0,0.06))" }} />
                      </div>

                      {/* Top flap */}
                      <div className={`absolute top-0 left-0 right-0 z-30 origin-top h-full transition-transform duration-700 ${envelopeOpen ? "rotate-x-180 -translate-y-full" : ""}`} style={{ perspective: 1200 }}>
                        <div className="absolute inset-0 w-full h-[51%] bg-[#edd1bb]" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "linear-gradient(to bottom, #edd1bb, #dec4ae)", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.08))" }} />
                      </div>

                      {/* Wax Heart seal */}
                      <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#eb4799]/30 blur-lg rounded-full animate-ping" />
                          <div className="w-14 h-14 rounded-full bg-[#eb4799] border-4 border-white flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300 text-white">
                            <Heart className="w-6 h-6 fill-current" />
                          </div>
                        </div>
                      </div>

                      <p className="absolute -bottom-10 left-0 right-0 text-[#eb4799]/80 text-xs font-bold tracking-[0.25em] uppercase animate-pulse text-center">
                        <ET fid="s6_hint" data={d} onChange={oc} editMode={em} />
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* SLIDE 7: Quiz Question Slider */}
          {activeSlide === 7 && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center px-4 py-12 w-full max-w-2xl mx-auto min-h-screen"
            >
              {!em && (
                <button
                  onClick={() => {
                    if (quizFinished) restartQuiz();
                    else if (quizIndex > 0) setQuizIndex(prev => prev - 1);
                    else setActiveSlide(6);
                  }}
                  className="fixed top-6 left-6 z-50 flex items-center gap-2 btn-ghost-depth text-[#f8fafc]/70 px-4 py-2 rounded-full text-xs font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}

              <AnimatePresence mode="wait">
                {quizFinished ? (
                  // Quiz Outcome Screen
                  <motion.div
                    key="quiz-outcome"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl w-[95%] max-w-lg relative overflow-hidden text-center"
                  >
                    <div className="w-20 h-20 bg-[#eb4799]/10 rounded-full flex items-center justify-center mx-auto mb-6 outline outline-4 outline-[#eb4799]/25 outline-offset-4 shadow-lg text-[#eb4799]">
                      <Heart className="w-10 h-10 fill-[#eb4799] origin-center animate-pulse" />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#eb4799] via-rose-400 to-[#eb4799] mb-4">
                      {getQuizResult().title}
                    </h2>
                    
                    <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed mb-10 leading-loose">
                      {getQuizResult().msg}
                    </p>

                    <div className="flex flex-col gap-4">
                      {!em && (
                        <motion.button
                          onClick={() => setActiveSlide(8)}
                          className="flex justify-center items-center gap-3 w-full btn-primary-depth px-8 py-4.5 rounded-full font-bold text-base md:text-lg shadow-lg"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <span>{d.s7_btn_text || "See my final promise"}</span>
                          <ChevronRight className="w-5 h-5" />
                        </motion.button>
                      )}
                      
                      <button
                        onClick={restartQuiz}
                        className="text-[#eb4799]/60 hover:text-[#eb4799] font-bold text-xs uppercase tracking-widest mt-2 p-2 transition-colors"
                      >
                        Retake Quiz ↺
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  // Quiz Question Card
                  <motion.div
                    key={`q-${quizIndex}`}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 140, damping: 18 }}
                    className="w-full flex flex-col items-center"
                  >
                    {/* Header Score/ProgressBar */}
                    <div className="mb-8 w-full flex flex-col items-center">
                      <p className="text-[#eb4799] tracking-widest text-xs font-bold uppercase mb-3">
                        <ET fid="s7_heading" data={d} onChange={oc} editMode={em} />
                      </p>
                      <div className="flex gap-2.5 mb-2 w-full max-w-xs justify-center">
                        {quizQuestions.map((_, qIdx) => (
                          <div
                            key={qIdx}
                            className={`h-2.5 w-12 md:w-16 rounded-full transition-all duration-300 ${qIdx <= quizIndex ? "bg-[#eb4799]" : "bg-slate-800"}`}
                          />
                        ))}
                      </div>
                      <p className="text-slate-500 text-xs mt-2 font-semibold">
                        Question {quizIndex + 1} of {quizQuestions.length}
                      </p>
                    </div>

                    {/* Question Card Box */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-9 shadow-2xl w-full relative">
                      <div className="absolute -top-7 -right-7 text-[#eb4799]/5 rotate-12 blur-sm pointer-events-none">
                        <Heart className="w-24 h-24 fill-current" />
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-body font-bold leading-snug mb-8 text-slate-100">
                        <ET fid={`q${quizIndex + 1}_text`} data={d} onChange={oc} editMode={em} />
                      </h3>

                      <div className="space-y-4 w-full">
                        {quizQuestions[quizIndex].options.map((opt, optIdx) => (
                          <motion.button
                            key={optIdx}
                            onClick={() => !em && handleQuizAnswer(opt.points)}
                            className="w-full text-left p-4.5 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-[#eb4799] hover:bg-[#eb4799]/5 transition-all outline-none flex items-center justify-between group"
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="text-slate-200 font-semibold text-sm md:text-base pr-4">
                              <ET fid={`q${quizIndex + 1}_o${optIdx + 1}`} data={d} onChange={oc} editMode={em} />
                            </span>
                            <div className="w-5 h-5 rounded-full border-2 border-slate-700 group-hover:border-[#eb4799] flex items-center justify-center shrink-0 transition-colors">
                              <div className="w-2 h-2 rounded-full bg-[#eb4799] opacity-0 group-hover:opacity-100 transition-opacity" />
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

          {/* SLIDE 8: Promise & Replay Slide */}
          {activeSlide === 8 && (
            <motion.div
              key="promise"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center text-center px-4 py-16 w-full max-w-lg mx-auto min-h-screen"
            >
              {/* Confetti particles shower */}
              <FloatingEmojis />

              {!em && (
                <button
                  onClick={() => setActiveSlide(7)}
                  className="fixed top-6 left-6 z-50 flex items-center gap-2 btn-ghost-depth text-[#f8fafc]/70 px-4 py-2 rounded-full text-xs font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}

              {/* Kiss Bear Mascot */}
              <div className="relative mb-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="w-52 h-52 md:w-60 md:h-60 flex items-center justify-center drop-shadow-2xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.s8_img || "/templates/confess/bear3.gif"}
                    alt="Cute Couple Kiss Mascot"
                    className="w-full h-full object-contain"
                  />
                </motion.div>
                {em && <ImageUploader fid="s8_img" data={d} onChange={oc} defaultSrc="/templates/confess/bear3.gif" />}
              </div>

              {/* Title heading */}
              <h2 className="text-3xl md:text-4xl font-bold mb-5 tracking-wide leading-tight">
                My{" "}
                <span className="font-display text-[#eb4799] text-glow-rose text-5xl md:text-6xl font-bold">
                  <ET fid="s8_title" data={d} onChange={oc} editMode={em} />
                </span>
              </h2>

              {/* Promise card container */}
              <div className="bg-slate-900/50 backdrop-blur-md border border-[#eb4799]/15 rounded-3xl p-6.5 max-w-sm mb-8 shadow-2xl mx-auto leading-relaxed">
                <p className="text-slate-100 text-sm md:text-base font-semibold leading-relaxed mb-4 leading-loose">
                  <ET fid="s8_promise_bold" data={d} onChange={oc} editMode={em} multiline={true} />
                </p>
                <div className="w-6 h-0.5 bg-[#eb4799]/25 mx-auto mb-4" />
                <p className="text-slate-350 text-xs md:text-sm font-medium leading-relaxed italic leading-loose">
                  <ET fid="s8_promise_italic" data={d} onChange={oc} editMode={em} multiline={true} />
                </p>
              </div>

              {/* Signoff */}
              <p className="font-display text-[#eb4799] text-glow-rose text-4xl md:text-5xl mb-8">
                <ET fid="s8_footer" data={d} onChange={oc} editMode={em} />
              </p>

              {!em && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <motion.button
                    onClick={handleReplay}
                    className="flex items-center justify-center gap-2.5 btn-primary-depth px-9 py-4 rounded-full font-bold text-base md:text-lg shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-4.5 h-4.5 animate-spin-slow" />
                    <span>{d.s8_btn_text || "Replay Story"}</span>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
