import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ContinueButton from "./ContinueButton";
import { useMllData, useMllContext, ET } from "./MllDataContext";
import { paperRustle, playSound } from "./audio";

const TOTAL_PAGES = 4;

const PARTICLE_STYLE = `
@keyframes mllFloat {
  0% { transform: translateY(105vh) translateX(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.7; }
  90% { opacity: 0.7; }
  100% { transform: translateY(-5vh) translateX(80px) rotate(360deg); opacity: 0; }
}
@keyframes pageTurnShadow {
  0%, 100% { box-shadow: 0 0 0 rgba(0,0,0,0); }
  50% { box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
}
`;

const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 6,
  duration: 9 + Math.random() * 7,
  size: 14 + Math.random() * 14,
  isHeart: Math.random() > 0.4,
}));

export default function Scene2CollageBook({ onNext }: { onNext: () => void }) {
  const { data, editMode } = useMllContext();
  const [currentPage, setCurrentPage] = useState(0);
  const [turningState, setTurningState] = useState<"none" | "next" | "prev">("none");
  const [closing, setClosing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (closing) {
      const t = setTimeout(() => setDone(true), 1100);
      return () => clearTimeout(t);
    }
  }, [closing]);

  const turnNext = () => {
    if (turningState !== "none") return;
    if (currentPage >= TOTAL_PAGES - 1) return;
    playSound(paperRustle);
    setTurningState("next");
    setTimeout(() => {
      setCurrentPage((p) => p + 1);
      setTurningState("none");
    }, 700);
  };

  const turnPrev = () => {
    if (turningState !== "none" || currentPage === 0) return;
    playSound(paperRustle);
    setTurningState("prev");
    setTimeout(() => {
      setCurrentPage((p) => p - 1);
      setTurningState("none");
    }, 700);
  };

  const startClose = () => {
    playSound(paperRustle);
    setClosing(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at center, #251212 0%, #060202 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: PARTICLE_STYLE }} />

      {/* Floating Particles Background */}
      {!done &&
        particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.left}%`,
              bottom: "-20px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              pointerEvents: "none",
              animation: `mllFloat ${p.duration}s linear ${p.delay}s infinite`,
              zIndex: 1,
            }}
          >
            {p.isHeart ? (
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="#FF69B4" opacity="0.4">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="#B22222" opacity="0.35">
                <path d="M21 16v-2c-2.24 0-4-1.76-4-4 0-.55-.45-1-1-1s-1 .45-1 1c0 3.31 2.69 6 6 6zM3 16c3.31 0 6-2.69 6-6 0-.55-.45-1-1-1s-1 .45-1 1c0 2.24-1.76 4-4 4v2z" />
              </svg>
            )}
          </div>
        ))}

      {/* 3D BOOK STAGE */}
      {!done && (
        <div
          style={{
            position: "relative",
            width: "min(640px, 92vw)",
            height: "min(440px, 66vh)",
            perspective: "1600px",
            zIndex: 10,
          }}
        >
          {/* Depth effect: left/right margins behind the book simulating stack of pages */}
          <div
            style={{
              position: "absolute",
              inset: "8px -6px 8px -6px",
              background: "#FFF3E6",
              border: "1.5px solid #D4AF37",
              borderRadius: "6px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              zIndex: 1,
              opacity: 0.85,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "4px -3px 4px -3px",
              background: "#FFF6ED",
              border: "1.5px solid #E5C158",
              borderRadius: "5px",
              zIndex: 2,
              opacity: 0.9,
            }}
          />

          {/* Book Wrapper */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              transformStyle: "preserve-3d",
              zIndex: 3,
            }}
          >
            {/* LEFT SIDE PANEL (Inside Left Page + Outside Front Cover) */}
            <motion.div
              animate={{ rotateY: closing ? 180 : 0 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "50%",
                height: "100%",
                transformOrigin: "right center",
                transformStyle: "preserve-3d",
                zIndex: closing ? 20 : 10,
              }}
            >
              {/* Inside Left Page (visible when open) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  zIndex: 2,
                  background: "#FFF8F0",
                  borderRadius: "4px 0 0 4px",
                  boxShadow: "inset 10px 0 20px rgba(0,0,0,0.06)",
                  border: "1.5px solid #D4AF37",
                  borderRight: "none",
                  overflow: "hidden",
                }}
              >
                {/* Static Left page display */}
                {turningState === "prev" ? (
                  <LeftPageContent page={currentPage - 1} />
                ) : (
                  <LeftPageContent page={currentPage} />
                )}
              </div>

              {/* Outside Front Cover (backface - visible when closed) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  zIndex: 1,
                }}
              >
                <BookCover />
              </div>
            </motion.div>

            {/* RIGHT SIDE PANEL (Inside Right Page + Outside Back Cover) */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "50%",
                height: "100%",
                transformStyle: "preserve-3d",
                zIndex: 9,
              }}
            >
              {/* Inside Right Page (visible when open) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#FFF8F0",
                  borderRadius: "0 4px 4px 0",
                  boxShadow: "inset -10px 0 20px rgba(0,0,0,0.06)",
                  border: "1.5px solid #D4AF37",
                  borderLeft: "none",
                  overflow: "hidden",
                }}
              >
                {/* Static Right page display */}
                {turningState === "next" ? (
                  <RightPageContent page={currentPage + 1} />
                ) : (
                  <RightPageContent page={currentPage} />
                )}
              </div>
            </div>

            {/* FLIPPING PAGE SHEET (Runs transition on turn) */}
            {turningState === "next" && (
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -180 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  width: "50%",
                  height: "100%",
                  transformOrigin: "left center",
                  transformStyle: "preserve-3d",
                  zIndex: 15,
                  animation: "pageTurnShadow 0.7s ease-in-out",
                }}
              >
                {/* Front of flipping sheet (page we are leaving) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    background: "#FFF8F0",
                    border: "1.5px solid #D4AF37",
                    borderLeft: "none",
                    borderRadius: "0 4px 4px 0",
                    zIndex: 2,
                  }}
                >
                  <RightPageContent page={currentPage} />
                </div>
                {/* Back of flipping sheet (page we are entering) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "#FFF8F0",
                    border: "1.5px solid #D4AF37",
                    borderRight: "none",
                    borderRadius: "4px 0 0 4px",
                    zIndex: 1,
                  }}
                >
                  <LeftPageContent page={currentPage + 1} />
                </div>
              </motion.div>
            )}

            {turningState === "prev" && (
              <motion.div
                initial={{ rotateY: -180 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  width: "50%",
                  height: "100%",
                  transformOrigin: "left center",
                  transformStyle: "preserve-3d",
                  zIndex: 15,
                  animation: "pageTurnShadow 0.7s ease-in-out",
                }}
              >
                {/* Front of flipping sheet (page we are entering) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    background: "#FFF8F0",
                    border: "1.5px solid #D4AF37",
                    borderLeft: "none",
                    borderRadius: "0 4px 4px 0",
                    zIndex: 2,
                  }}
                >
                  <RightPageContent page={currentPage - 1} />
                </div>
                {/* Back of flipping sheet (page we are leaving) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "#FFF8F0",
                    border: "1.5px solid #D4AF37",
                    borderRight: "none",
                    borderRadius: "4px 0 0 4px",
                    zIndex: 1,
                  }}
                >
                  <LeftPageContent page={currentPage} />
                </div>
              </motion.div>
            )}

            {/* Spine shadow overlay */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: "12px",
                transform: "translateX(-50%)",
                background: "linear-gradient(90deg, rgba(0,0,0,0.15), rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15))",
                zIndex: 30,
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Nav arrows */}
          {!closing && turningState === "none" && (
            <>
              {currentPage > 0 && (
                <button
                  onClick={turnPrev}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    turnPrev();
                  }}
                  style={arrowStyle("left")}
                >
                  ‹
                </button>
              )}
              {currentPage < TOTAL_PAGES - 1 && (
                <button
                  onClick={turnNext}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    turnNext();
                  }}
                  style={arrowStyle("right")}
                >
                  ›
                </button>
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: "-36px",
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "12px",
                  color: "#D4AF37",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Page {currentPage + 1} of {TOTAL_PAGES}
              </div>
            </>
          )}
        </div>
      )}

      {/* Close book button */}
      {!closing && currentPage === TOTAL_PAGES - 1 && (
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={startClose}
          onTouchEnd={(e) => {
            e.preventDefault();
            startClose();
          }}
          className="continue-btn"
          style={{
            position: "absolute",
            bottom: `calc(40px + env(safe-area-inset-bottom))`,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "14px 32px",
            borderRadius: "999px",
            background: "linear-gradient(135deg, #D4AF37 0%, #F5D16A 50%, #D4AF37 100%)",
            color: "#1A0A0A",
            border: "none",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize: "15px",
            letterSpacing: "0.06em",
            boxShadow: "0 0 24px rgba(212,175,55,0.5), 0 4px 16px rgba(0,0,0,0.3)",
            cursor: "pointer",
            zIndex: 100,
            animation: "goldPulse 2.4s ease-in-out infinite",
          }}
        >
          Close the Book ➔
        </motion.button>
      )}

      {done && <ContinueButton onClick={onNext} />}
    </div>
  );
}

function arrowStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    [side]: "-56px",
    transform: "translateY(-50%)",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #D4AF37, #F5D16A)",
    color: "#1A0A0A",
    border: "none",
    fontSize: "26px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3), 0 0 10px rgba(212,175,55,0.3)",
    zIndex: 35,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties;
}

function BookCover() {
  const data = useMllData();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 30% 30%, #8B0000 0%, #5A0000 60%, #3A0000 100%)",
        border: "3.5px solid #8B0000",
        borderRadius: "4px 14px 14px 4px",
        boxShadow: "8px 8px 30px rgba(0,0,0,0.6), inset 0 0 24px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        backfaceVisibility: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "14px",
          background: "linear-gradient(90deg, #D4AF37, #8B6914, #D4AF37)",
          opacity: 0.45,
        }}
      />
      <div style={{ position: "absolute", top: "24px", left: "30px", right: "20px", height: "1.5px", background: "#D4AF37", opacity: 0.35 }} />
      
      <h1
        style={{
          fontFamily: "'Great Vibes', cursive",
          fontSize: "38px",
          color: "#D4AF37",
          textAlign: "center",
          margin: 0,
          textShadow: "0 2px 4px rgba(0,0,0,0.5), 0 0 16px rgba(212,175,55,0.35)",
          lineHeight: 1.1,
        }}
      >
        My Love Language
      </h1>

      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "19px",
          color: "#E5C158",
          marginTop: "16px",
          opacity: 0.9,
          fontWeight: 600,
        }}
      >
        <ET fid="mll_book_author" />
      </p>

      <svg width="48" height="48" viewBox="0 0 100 100" style={{ marginTop: "24px" }}>
        <path
          d="M50 80 C20 55, 20 30, 38 30 C44 30, 50 36, 50 42 C50 36, 56 30, 62 30 C80 30, 80 55, 50 80 Z"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="2.5"
          filter="drop-shadow(0 2px 6px rgba(0,0,0,0.3))"
        />
      </svg>
      <div style={{ position: "absolute", bottom: "24px", left: "30px", right: "20px", height: "1.5px", background: "#D4AF37", opacity: 0.35 }} />
    </div>
  );
}

function LeftPageContent({ page }: { page: number }) {
  const data = useMllData();
  const imageSrc = data.img_pages?.[page] ?? `/templates/my-love-language/collage-${page + 1}.png`;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "24px 20px",
        background: "#FFF8F0",
        boxShadow: "inset 6px 0 12px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "8px",
          border: "1px solid #D4AF37",
          opacity: 0.25,
          borderRadius: "3px",
          pointerEvents: "none",
        }}
      />

      {/* Polaroid Frame */}
      <div
        style={{
          position: "relative",
          width: "82%",
          maxWidth: "210px",
          background: "#FFFFFF",
          padding: "10px 10px 24px 10px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
          transform: "rotate(-3.5deg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Washi Tape */}
        <div
          style={{
            position: "absolute",
            top: "-14px",
            left: "50%",
            transform: "translateX(-50%) rotate(-4deg)",
            width: "66px",
            height: "20px",
            background: "rgba(240, 235, 220, 0.7)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            borderLeft: "1px dashed rgba(0,0,0,0.15)",
            borderRight: "1px dashed rgba(0,0,0,0.15)",
            zIndex: 10,
          }}
        />

        {/* Polaroid Picture */}
        <div
          style={{
            width: "100%",
            aspectRatio: "1/1",
            background: "#EBE6DE",
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "1px",
          }}
        >
          <img
            src={imageSrc}
            alt="Collage Moment"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Polaroid Caption */}
        <p
          style={{
            fontFamily: "'Great Vibes', cursive",
            fontSize: "22px",
            color: "#4A3B32",
            margin: 0,
            marginTop: "12px",
            lineHeight: 1.1,
            textAlign: "center",
            width: "100%",
          }}
        >
          <ET fid={`mll_caption${page + 1}`} />
        </p>
      </div>

      {/* Gold Heart Pressed Emblem */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "20px",
          fontSize: "18px",
          opacity: 0.45,
          color: "#D4AF37",
        }}
      >
        ✦
      </div>

      <span
        style={{
          position: "absolute",
          bottom: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "11px",
          color: "#C19E37",
          letterSpacing: "0.08em",
        }}
      >
        Page {page + 1}
      </span>
    </div>
  );
}

function RightPageContent({ page }: { page: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "36px 24px",
        background:
          "repeating-linear-gradient(transparent 0, transparent 29px, #EADCC9 29px, #EADCC9 30px), #FFF8F0",
        boxShadow: "inset -6px 0 12px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "8px",
          border: "1px solid #D4AF37",
          opacity: 0.25,
          borderRadius: "3px",
          pointerEvents: "none",
        }}
      />

      {/* Wax Seal */}
      <div style={{ position: "absolute", top: "16px", right: "16px", zIndex: 10 }}>
        <WaxSealMini />
      </div>

      {/* Letter text */}
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "15px",
          lineHeight: "30px",
          color: "#302222",
          marginTop: "16px",
          paddingRight: "16px",
        }}
      >
        <ET fid={`mll_page${page + 1}`} multiline />
      </p>

      {/* Mini gold separator at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#D4AF37",
          opacity: 0.35,
          fontSize: "12px",
        }}
      >
        ❦
      </div>

      <span
        style={{
          position: "absolute",
          bottom: "12px",
          right: "24px",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "11px",
          color: "#C19E37",
        }}
      >
        Pg. {page + 1}
      </span>
    </div>
  );
}

function WaxSealMini() {
  return (
    <svg width="34" height="34" viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.25))" }}>
      <circle cx="50" cy="50" r="42" fill="#8B0000" stroke="#4A0000" strokeWidth="2.5" />
      <path d="M50 70 C30 55, 30 38, 42 38 C46 38, 50 42, 50 46 C50 42, 54 38, 58 38 C70 38, 70 55, 50 70 Z" fill="#FFD7D7" />
    </svg>
  );
}
