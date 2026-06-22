"use client";
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MllDataContext } from "./MllDataContext";
import { SITE_DATA } from "./siteData";
import Scene1DarkRoom from "./Scene1DarkRoom";
import Scene2CollageBook from "./Scene2CollageBook";
import Scene3TVRoom from "./Scene3TVRoom";
import Scene4BeachBottle from "./Scene4BeachBottle";
import Scene5ScratchCard from "./Scene5ScratchCard";
import Scene6Fireworks from "./Scene6Fireworks";
import YouTube from "react-youtube";
import { Music, Volume2, VolumeX } from "lucide-react";
import SongLibraryPopup from "@/components/SongLibraryPopup";

// Lazy load Three.js heavy scenes
const Scene7RingBox = lazy(() => import("./Scene7RingBox"));
const Scene8FinalLetter = lazy(() => import("./Scene8FinalLetter"));

// Product CSS injected as a scoped style tag — never pollutes global styles
const PRODUCT_CSS = `
@keyframes goldPulse {
  0%, 100% { box-shadow: 0 0 24px rgba(212,175,55,0.5), 0 4px 16px rgba(0,0,0,0.3); }
  50% { box-shadow: 0 0 40px rgba(212,175,55,0.85), 0 4px 20px rgba(0,0,0,0.35); }
}
@keyframes twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}
@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  30% { transform: scale(1.15); }
  60% { transform: scale(0.95); }
}
@keyframes goldFloat {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.7; }
  90% { opacity: 0.7; }
  100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
}
@keyframes flashFade {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
`;

function Fallback() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#1A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#D4AF37",
        fontFamily: "'Great Vibes', cursive",
        fontSize: "28px",
      }}
    >
      Loading...
    </div>
  );
}

function Scene0Music({
  d,
  onNext,
  em,
  oc,
  bgProps,
}: {
  d: any;
  onNext: () => void;
  em: boolean;
  oc?: (id: string, v: string) => void;
  bgProps: { isPicking: boolean; setIsPicking: (v: boolean) => void };
}) {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "radial-gradient(ellipse at center, #1b0a1a 0%, #050106 100%)",
        position: "relative",
      }}
    >
      <div
        style={{
          background: "rgba(27, 10, 26, 0.95)",
          borderRadius: 24,
          padding: "40px 32px",
          width: "100%",
          maxWidth: 420,
          border: "2px solid #D4AF37",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(212,175,55,0.15)",
          textAlign: "center",
          position: "relative",
        }}
      >
        <h2
          style={{
            fontFamily: "'Great Vibes', cursive",
            fontSize: "36px",
            color: "#D4AF37",
            marginBottom: 8,
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          Background Music 🎵
        </h2>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            color: "#F2C4CE",
            fontSize: 15,
            marginBottom: 24,
          }}
        >
          Plays continuously throughout the website
        </p>

        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background: "rgba(212,175,55,0.1)",
            border: "1.5px solid rgba(212,175,55,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            color: "#D4AF37",
          }}
        >
          <Music size={30} />
        </div>

        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            textAlign: "center",
            fontSize: 16,
            color: "#FFF",
            marginBottom: 28,
            background: "rgba(255, 255, 255, 0.05)",
            padding: "12px 18px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {d.bg_song_name || "No song selected"}
        </div>

        {em && (
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => bgProps.setIsPicking(true)}
              style={{
                background: "linear-gradient(135deg, #FF69B4, #FF1493)",
                color: "#FFF",
                border: "none",
                borderRadius: 999,
                padding: "12px 28px",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(255,20,147,0.3)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {d.bg_song_url ? "Change Song" : "Select Song"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

interface Props {
  customData?: Record<string, string>;
  editMode?: boolean;
  onFieldChange?: (id: string, value: string) => void;
  forcedSlide?: number;
  autoPlay?: boolean;
}

export default function MyLoveLanguage({
  customData = {},
  autoPlay = false,
  editMode = false,
  onFieldChange,
  forcedSlide,
}: Props) {
  const [scene, setScene] = useState(1);
  const next = () => setScene((s) => Math.min(8, s + 1));

  // Audio state management
  const [isPickingBgSong, setIsPickingBgSong] = useState(false);
  const [globalMuted, setGlobalMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [bgAudio, setBgAudio] = useState<HTMLAudioElement | null>(null);
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const ytPlayerRef = useRef<any>(null);
  const fadeIntervalRef = useRef<any>(null);

  // AutoPlay cycling for homepage product frame preview
  useEffect(() => {
    if (autoPlay) {
      setScene(1);
      const interval = setInterval(() => {
        setScene((prev) => (prev >= 8 ? 1 : prev + 1));
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [autoPlay]);

  // Editor forced slide sync: MLL_SLIDES uses n=-1..7 → scene 0..8
  useEffect(() => {
    if (editMode && forcedSlide !== undefined) {
      setScene(forcedSlide + 1);
    }
  }, [forcedSlide, editMode]);

  const totalPagesVal = customData.mll_total_pages ?? "4";
  const totalPages = parseInt(totalPagesVal, 10) || 4;

  const dynamicImgPages = [];
  const dynamicCaptionPages = [];
  const dynamicPageTexts = [];

  for (let i = 1; i <= totalPages; i++) {
    const defaultImg = SITE_DATA.img_pages[i - 1] ?? "/templates/my-love-language/collage-1.png";
    const defaultCaption = SITE_DATA.caption_pages[i - 1] ?? `Our Moment ${i}`;
    const defaultText = SITE_DATA.page_text[i - 1] ?? "Write something beautiful here...";

    dynamicImgPages.push(customData[`mll_img${i}`] ?? defaultImg);
    dynamicCaptionPages.push(customData[`mll_caption${i}`] ?? defaultCaption);
    dynamicPageTexts.push(customData[`mll_page${i}`] ?? defaultText);
  }

  // Build merged data: SITE_DATA defaults overridden by customData field values
  const mergedData = {
    ...SITE_DATA,
    rawCustomData: customData,
    bg_song_name: customData.mll_bg_song_name ?? "",
    bg_song_url: customData.mll_bg_song_url ?? "",
    bg_song_type: customData.mll_bg_song_type ?? "direct",
    bg_song_youtube_id: customData.mll_bg_song_youtube_id ?? "",
    bg_song_start: customData.mll_bg_song_start ?? "0",
    bg_song_end: customData.mll_bg_song_end ?? "0",
    scene1_hint: customData.mll_scene1_hint ?? SITE_DATA.scene1_hint,
    video_light_on: customData.mll_video_light_on ?? SITE_DATA.video_light_on,
    video_book_showing: customData.mll_video_book_showing ?? SITE_DATA.video_book_showing,
    video_book_open: customData.mll_video_book_open ?? SITE_DATA.video_book_open,
    btn_go_to_book: customData.mll_btn_go_to_book ?? SITE_DATA.btn_go_to_book,
    btn_open_book: customData.mll_btn_open_book ?? SITE_DATA.btn_open_book,
    book_author: customData.mll_book_author ?? SITE_DATA.book_author,
    img_pages: dynamicImgPages,
    caption_pages: dynamicCaptionPages,
    page_text: dynamicPageTexts,
    video_story: customData.mll_video_story ?? SITE_DATA.video_story,
    tv_caption: customData.mll_tv_caption ?? SITE_DATA.tv_caption,
    shake_hint: customData.mll_shake_hint ?? SITE_DATA.shake_hint,
    bottle_message: customData.mll_bottle_message ?? SITE_DATA.bottle_message,
    scratch_message: customData.mll_scratch_message ?? SITE_DATA.scratch_message,
    fireworks_text: customData.mll_fireworks_text ?? SITE_DATA.fireworks_text,
    proposal_question: customData.mll_proposal_question ?? SITE_DATA.proposal_question,
    no_button_text: customData.mll_no_button_text ?? SITE_DATA.no_button_text,
    final_letter: customData.mll_final_letter ?? SITE_DATA.final_letter,
  };

  const isYt = mergedData.bg_song_type === "youtube" && !!mergedData.bg_song_youtube_id;

  useEffect(() => {
    ytPlayerRef.current = ytPlayer;
  }, [ytPlayer]);

  // Handle interaction to start audio (bypass browser security)
  useEffect(() => {
    const onInteract = () => {
      setHasInteracted(true);
      if (isYt && ytPlayerRef.current?.playVideo) {
        ytPlayerRef.current.playVideo();
      }
    };
    window.addEventListener("click", onInteract);
    window.addEventListener("touchstart", onInteract);
    return () => {
      window.removeEventListener("click", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
  }, [isYt]);

  // Set up audio source
  useEffect(() => {
    if (editMode) return;
    const audio = new Audio();
    audio.loop = true;
    setBgAudio(audio);
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [editMode]);

  useEffect(() => {
    if (!bgAudio || isYt || !mergedData.bg_song_url) return;
    if (bgAudio.src !== mergedData.bg_song_url) {
      bgAudio.src = mergedData.bg_song_url;
    }
  }, [bgAudio, mergedData.bg_song_url, isYt]);

  // Continuous background audio pauses on Scene 3 (TV room)
  const isAudible = !editMode && hasInteracted && !globalMuted && scene !== 3;

  useEffect(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    if (editMode) return;

    if (isAudible) {
      if (isYt) {
        if (ytPlayer && typeof ytPlayer.playVideo === "function") {
          ytPlayer.unMute();
          ytPlayer.setVolume(0);
          ytPlayer.playVideo();
          
          let currentVol = 0;
          fadeIntervalRef.current = setInterval(() => {
            currentVol = Math.min(currentVol + 5, 100);
            if (ytPlayer && typeof ytPlayer.setVolume === "function") {
              ytPlayer.setVolume(currentVol);
            }
            if (currentVol >= 100) {
              if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;
              }
            }
          }, 100);
        }
      } else {
        if (bgAudio) {
          bgAudio.muted = false;
          bgAudio.volume = 0;
          bgAudio.play().catch((e) => console.log("Bg audio play prevented", e));
          
          let currentVol = 0;
          fadeIntervalRef.current = setInterval(() => {
            currentVol = Math.min(currentVol + 0.05, 1.0);
            bgAudio.volume = currentVol;
            if (currentVol >= 1.0) {
              if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;
              }
            }
          }, 100);
        }
      }
    } else {
      if (isYt) {
        if (ytPlayer) {
          if (globalMuted) {
            ytPlayer.mute();
          } else {
            ytPlayer.pauseVideo?.();
          }
          ytPlayer.setVolume?.(0);
        }
      } else {
        if (bgAudio) {
          if (globalMuted) {
            bgAudio.muted = true;
          } else {
            bgAudio.pause();
          }
          bgAudio.volume = 0;
        }
      }
    }

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    };
  }, [isAudible, bgAudio, ytPlayer, isYt, globalMuted]);

  useEffect(() => {
    const forceAudio = () => {
      if (isAudible && bgAudio && bgAudio.paused) {
        bgAudio.play().catch(() => {});
      }
    };
    window.addEventListener("click", forceAudio);
    window.addEventListener("touchstart", forceAudio);
    return () => {
      window.removeEventListener("click", forceAudio);
      window.removeEventListener("touchstart", forceAudio);
    };
  }, [isAudible, bgAudio]);

  const onNext = autoPlay || editMode ? () => {} : next;

  const renderScene = () => {
    switch (scene) {
      case 0:
        return (
          <Scene0Music
            key="s0"
            d={mergedData}
            onNext={onNext}
            em={editMode}
            oc={(fid, val) => onFieldChange?.(fid, val)}
            bgProps={{ isPicking: isPickingBgSong, setIsPicking: setIsPickingBgSong }}
          />
        );
      case 1: return <Scene1DarkRoom key="s1" onNext={onNext} />;
      case 2: return <Scene2CollageBook key="s2" onNext={onNext} />;
      case 3: return <Scene3TVRoom key="s3" onNext={onNext} />;
      case 4: return <Scene4BeachBottle key="s4" onNext={onNext} />;
      case 5: return <Scene5ScratchCard key="s5" onNext={onNext} />;
      case 6: return <Scene6Fireworks key="s6" onNext={onNext} />;
      case 7:
        return (
          <Suspense key="s7" fallback={<Fallback />}>
            <Scene7RingBox onNext={onNext} />
          </Suspense>
        );
      case 8:
        return (
          <Suspense key="s8" fallback={<Fallback />}>
            <Scene8FinalLetter />
          </Suspense>
        );
      default: return null;
    }
  };

  return (
    <MllDataContext.Provider value={{ data: mergedData, editMode, onFieldChange }}>
      {/* Inject product CSS without touching global styles */}
      <style dangerouslySetInnerHTML={{ __html: PRODUCT_CSS }} />
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Outfit:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      
      {/* Preload TV Room video at the very start of the page */}
      <video
        src={mergedData.video_story}
        preload="auto"
        style={{ display: "none" }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ position: "fixed", inset: 0 }}
          >
            {renderScene()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* BG Audio mute/unmute button */}
      {!editMode && mergedData.bg_song_url && (
        <button
          onClick={() => setGlobalMuted((m) => !m)}
          title={globalMuted ? "Unmute background music" : "Mute background music"}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 200,
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(212,175,55,0.25)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: globalMuted ? "#888" : "#C0395A",
            transition: "all 0.3s",
          }}
        >
          {globalMuted ? <VolumeX size={20} strokeWidth={2.5} /> : <Volume2 size={20} strokeWidth={2.5} />}
        </button>
      )}

      {/* YouTube headless player */}
      {isYt && !editMode && (
        <div style={{ position: "absolute", top: -9999, left: -9999, opacity: 0, pointerEvents: "none" }}>
          <YouTube
            videoId={mergedData.bg_song_youtube_id}
            opts={{
              height: "10",
              width: "10",
              playerVars: {
                autoplay: 0,
                loop: 1,
                controls: 0,
                start: parseInt(mergedData.bg_song_start || "0", 10) || undefined,
                end: parseInt(mergedData.bg_song_end || "0", 10) || undefined,
              },
            }}
            onReady={(e) => {
              setYtPlayer(e.target);
              if (globalMuted) e.target.mute();
            }}
            onStateChange={(e) => {
              if (e.data === 0) e.target.playVideo();
            }}
          />
        </div>
      )}

      {/* Song Library popup for background music editing */}
      {isPickingBgSong && (
        <SongLibraryPopup
          onClose={() => setIsPickingBgSong(false)}
          onSelect={(song) => {
            onFieldChange?.("mll_bg_song_name", song.name);
            onFieldChange?.("mll_bg_song_url", song.url || "");
            onFieldChange?.("mll_bg_song_type", song.type || "direct");
            onFieldChange?.("mll_bg_song_youtube_id", song.youtubeId || "");
            onFieldChange?.("mll_bg_song_start", String(song.startTime || 0));
            onFieldChange?.("mll_bg_song_end", String(song.endTime || 0));
            setIsPickingBgSong(false);
          }}
        />
      )}
    </MllDataContext.Provider>
  );
}
