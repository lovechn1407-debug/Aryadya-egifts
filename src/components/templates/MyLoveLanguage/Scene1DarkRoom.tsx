import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMllContext, ET } from "./MllDataContext";
import { clickSound, playSound } from "./audio";

type Stage =
  | "switch"
  | "light_on_video"
  | "go_to_book_btn"
  | "book_showing_video"
  | "open_book_btn"
  | "book_opening_video"
  | "done";

export default function Scene1DarkRoom({ onNext }: { onNext: () => void }) {
  const { data, editMode } = useMllContext();
  const [stage, setStage] = useState<Stage>("switch");
  const [flipped, setFlipped] = useState(false);

  const [video2Started, setVideo2Started] = useState(false);
  const [video3Started, setVideo3Started] = useState(false);

  const [video1Hidden, setVideo1Hidden] = useState(false);
  const [video2Hidden, setVideo2Hidden] = useState(false);

  const video2Ref = useRef<HTMLVideoElement>(null);
  const video3Ref = useRef<HTMLVideoElement>(null);

  // Play controls based on stage transition
  useEffect(() => {
    if (stage === "book_showing_video") {
      video2Ref.current?.play().catch(() => {});
    }
    if (stage === "book_opening_video") {
      video3Ref.current?.play().catch(() => {});
    }
  }, [stage]);

  // Reset helper when restarting or mounting
  useEffect(() => {
    if (stage === "switch" || stage === "light_on_video") {
      setVideo2Started(false);
      setVideo3Started(false);
      setVideo1Hidden(false);
      setVideo2Hidden(false);
    }
  }, [stage]);

  const handleSwitch = () => {
    if (flipped) return;
    setFlipped(true);
    playSound(clickSound);
    setTimeout(() => setStage("light_on_video"), 400);
  };

  const handleGoToBook = () => {
    playSound(clickSound);
    setStage("book_showing_video");
  };

  const handleOpenBook = () => {
    playSound(clickSound);
    setStage("book_opening_video");
  };

  // Skip video helper
  const skipVideo = (nextStage: Stage) => {
    if (nextStage === "done") {
      onNext();
    } else {
      setStage(nextStage);
    }
  };

  const handleVideo2Started = () => {
    setVideo2Started(true);
    // Delay unmounting Video 1 to ensure Video 2's first frames are fully painted
    setTimeout(() => {
      setVideo1Hidden(true);
    }, 500);
  };

  const handleVideo3Started = () => {
    setVideo3Started(true);
    // Delay unmounting Video 2 to ensure Video 3's first frames are fully painted
    setTimeout(() => {
      setVideo2Hidden(true);
    }, 500);
  };

  // Editor mode view: displays all editable text components of Scene 1 in a beautiful static view
  if (editMode) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflowY: "auto",
          padding: "40px 24px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "36px",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Section 1: Hint Text */}
          <div style={{ width: "100%" }}>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "13px",
                color: "#D4AF37",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "8px",
                opacity: 0.8,
              }}
            >
              Light Switch Hint Text
            </div>
            <p
              style={{
                fontFamily: "'Great Vibes', cursive",
                fontSize: "26px",
                color: "#FFB6C1",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              <ET fid="mll_scene1_hint" multiline />
            </p>
          </div>

          {/* Switch preview */}
          <div style={{ opacity: 0.7, transform: "scale(0.75)", margin: "-10px 0" }}>
            <div
              style={{
                width: "130px",
                height: "190px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, #FFF2B2 0%, #D4AF37 35%, #AA7C11 70%, #543D0A 100%)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "96px",
                  borderRadius: "10px",
                  background: "#0F0C08",
                  boxShadow: "inset 0 6px 12px rgba(0,0,0,0.95)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "88px",
                    borderRadius: "8px",
                    background: "linear-gradient(to bottom, #2c2c2e 0%, #151517 100%)",
                    border: "1px solid #09090a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: "rotateX(20deg) translateY(-2px)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    style={{
                      width: "24px",
                      height: "24px",
                      fill: "#501A24",
                    }}
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Go to Book Button Label */}
          <div style={{ width: "100%" }}>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "13px",
                color: "#D4AF37",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "8px",
                opacity: 0.8,
              }}
            >
              Go to Book Button Text
            </div>
            <div
              style={{
                display: "inline-block",
                padding: "4px 8px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #D4AF37 0%, #F5D16A 50%, #D4AF37 100%)",
                boxShadow: "0 0 20px rgba(212,175,55,0.4)",
                width: "90%",
              }}
            >
              <ET fid="mll_btn_go_to_book" />
            </div>
          </div>

          {/* Section 3: Open Book Button Label */}
          <div style={{ width: "100%" }}>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "13px",
                color: "#D4AF37",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "8px",
                opacity: 0.8,
              }}
            >
              Open Book Button Text
            </div>
            <div
              style={{
                display: "inline-block",
                padding: "4px 8px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #D4AF37 0%, #F5D16A 50%, #D4AF37 100%)",
                boxShadow: "0 0 20px rgba(212,175,55,0.4)",
                width: "90%",
              }}
            >
              <ET fid="mll_btn_open_book" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper component for premium gold action buttons positioned at the bottom area
  const PremiumActionButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onClick={onClick}
      onTouchEnd={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="continue-btn"
      style={{
        position: "absolute",
        bottom: `calc(50px + env(safe-area-inset-bottom))`,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "16px 36px",
        borderRadius: "999px",
        background: "linear-gradient(135deg, #D4AF37 0%, #F5D16A 50%, #D4AF37 100%)",
        color: "#1A0A0A",
        border: "none",
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 700,
        fontSize: "16px",
        letterSpacing: "0.06em",
        boxShadow: "0 0 32px rgba(212,175,55,0.6), 0 6px 20px rgba(0,0,0,0.4)",
        cursor: "pointer",
        zIndex: 100,
        animation: "goldPulse 2.4s ease-in-out infinite",
      }}
    >
      {label}
    </motion.button>
  );

  const renderVideo1 = stage !== "switch" && !video1Hidden;

  const renderVideo2 =
    !video2Hidden &&
    (stage === "go_to_book_btn" ||
      stage === "book_showing_video" ||
      stage === "open_book_btn" ||
      stage === "book_opening_video");

  const renderVideo3 =
    stage === "open_book_btn" ||
    stage === "book_opening_video" ||
    stage === "done";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* 1. SWITCH STAGE */}
      {stage === "switch" && (
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity }}
            style={{
              fontFamily: "'Great Vibes', cursive",
              fontSize: "26px",
              color: "#FFB6C1",
              textAlign: "center",
              padding: "0 24px",
              marginBottom: "48px",
              maxWidth: "360px",
              lineHeight: 1.3,
            }}
          >
            {data.scene1_hint}
          </motion.p>

          <motion.button
            onClick={handleSwitch}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleSwitch();
            }}
            whileTap={{ scale: 0.96 }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              outline: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
            }}
            aria-label="Light switch"
          >
            {/* Elegant 3D Gold Plate backplate */}
            <div
              style={{
                width: "130px",
                height: "190px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, #FFF2B2 0%, #D4AF37 35%, #AA7C11 70%, #543D0A 100%)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                boxShadow: flipped
                  ? "0 8px 30px rgba(212,175,55,0.4), inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.5)"
                  : "0 12px 24px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "box-shadow 0.4s",
              }}
            >
              {/* Corner screws */}
              {[
                { top: "10px", left: "10px" },
                { top: "10px", right: "10px" },
                { bottom: "10px", left: "10px" },
                { bottom: "10px", right: "10px" },
              ].map((pos, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#3D2B07",
                    boxShadow: "inset 0 1px 1px rgba(0,0,0,0.8), 0 0.5px 0.5px rgba(255,255,255,0.2)",
                    ...pos,
                  }}
                />
              ))}

              {/* Recessed black socket */}
              <div
                style={{
                  width: "56px",
                  height: "96px",
                  borderRadius: "10px",
                  background: "#0F0C08",
                  boxShadow: "inset 0 6px 12px rgba(0,0,0,0.95), 0 1px 1px rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  perspective: "200px",
                  overflow: "hidden",
                }}
              >
                {/* 3D Rocker Key */}
                <motion.div
                  style={{
                    width: "48px",
                    height: "88px",
                    borderRadius: "8px",
                    background: "linear-gradient(to bottom, #2c2c2e 0%, #151517 100%)",
                    border: "1px solid #09090a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transformStyle: "preserve-3d",
                  }}
                  animate={{
                    rotateX: flipped ? -24 : 24,
                    y: flipped ? 3 : -3,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 16 }}
                >
                  {/* Neon heart indicator in center */}
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {/* SVG Heart Icon */}
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: "100%",
                        height: "100%",
                        fill: flipped ? "#FF497C" : "#501A24",
                        filter: flipped ? "drop-shadow(0 0 8px #FF497C) drop-shadow(0 0 2px #FF497C)" : "none",
                        transition: "fill 0.4s, filter 0.4s",
                      }}
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.button>
        </div>
      )}

      {/* 2. VIDEO 1 (Light On) */}
      {renderVideo1 && (
        <video
          src={data.video_light_on}
          muted
          playsInline
          autoPlay
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 40,
            background: "#000",
          }}
          onEnded={() => setStage("go_to_book_btn")}
          onError={() => setTimeout(() => setStage("go_to_book_btn"), 1500)}
        />
      )}

      {/* Video 1 Skip & Button Overlays */}
      {stage === "light_on_video" && (
        <button
          onClick={() => skipVideo("go_to_book_btn")}
          onTouchEnd={(e) => {
            e.preventDefault();
            skipVideo("go_to_book_btn");
          }}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "8px 16px",
            borderRadius: "20px",
            background: "rgba(0, 0, 0, 0.6)",
            color: "#FFF",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            cursor: "pointer",
            zIndex: 60,
            fontFamily: "'Outfit', sans-serif",
            fontSize: "14px",
          }}
        >
          Skip ➔
        </button>
      )}

      {stage === "go_to_book_btn" && (
        <AnimatePresence>
          <PremiumActionButton label={data.btn_go_to_book} onClick={handleGoToBook} />
        </AnimatePresence>
      )}

      {/* 3. VIDEO 2 (Book Showing) */}
      {renderVideo2 && (
        <video
          ref={video2Ref}
          src={data.video_book_showing}
          muted
          playsInline
          preload="auto"
          onPlaying={handleVideo2Started}
          onPlay={handleVideo2Started}
          onTimeUpdate={(e) => {
            if (e.currentTarget.currentTime > 0) {
              handleVideo2Started();
            }
          }}
          onEnded={() => setStage("open_book_btn")}
          onError={() => {
            handleVideo2Started();
            setTimeout(() => setStage("open_book_btn"), 1500);
          }}
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 41,
            opacity: video2Started ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
          }}
        />
      )}

      {/* Video 2 Skip & Button Overlays */}
      {stage === "book_showing_video" && (
        <button
          onClick={() => skipVideo("open_book_btn")}
          onTouchEnd={(e) => {
            e.preventDefault();
            skipVideo("open_book_btn");
          }}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "8px 16px",
            borderRadius: "20px",
            background: "rgba(0, 0, 0, 0.6)",
            color: "#FFF",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            cursor: "pointer",
            zIndex: 60,
            fontFamily: "'Outfit', sans-serif",
            fontSize: "14px",
          }}
        >
          Skip ➔
        </button>
      )}

      {stage === "open_book_btn" && (
        <AnimatePresence>
          <PremiumActionButton label={data.btn_open_book} onClick={handleOpenBook} />
        </AnimatePresence>
      )}

      {/* 4. VIDEO 3 (Book Opening) */}
      {renderVideo3 && (
        <video
          ref={video3Ref}
          src={data.video_book_open}
          muted
          playsInline
          preload="auto"
          onPlaying={handleVideo3Started}
          onPlay={handleVideo3Started}
          onTimeUpdate={(e) => {
            if (e.currentTarget.currentTime > 0) {
              handleVideo3Started();
            }
          }}
          onEnded={() => skipVideo("done")}
          onError={() => {
            handleVideo3Started();
            setTimeout(() => skipVideo("done"), 1500);
          }}
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 42,
            opacity: video3Started ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
          }}
        />
      )}

      {/* Video 3 Skip Overlay */}
      {stage === "book_opening_video" && (
        <button
          onClick={() => skipVideo("done")}
          onTouchEnd={(e) => {
            e.preventDefault();
            skipVideo("done");
          }}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "8px 16px",
            borderRadius: "20px",
            background: "rgba(0, 0, 0, 0.6)",
            color: "#FFF",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            cursor: "pointer",
            zIndex: 60,
            fontFamily: "'Outfit', sans-serif",
            fontSize: "14px",
          }}
        >
          Skip ➔
        </button>
      )}
    </div>
  );
}
