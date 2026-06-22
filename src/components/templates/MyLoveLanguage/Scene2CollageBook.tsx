import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ContinueButton from "./ContinueButton";
import { useMllData, ET } from "./MllDataContext";
import { paperRustle, playSound } from "./audio";

const TOTAL_PAGES = 4;

export default function Scene2CollageBook({ onNext }: { onNext: () => void }) {
  const data = useMllData();
  const [opened, setOpened] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [turning, setTurning] = useState(false);
  const [closing, setClosing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpened(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (closing) {
      const t = setTimeout(() => setDone(true), 1100);
      return () => clearTimeout(t);
    }
  }, [closing]);

  const turnNext = () => {
    if (turning) return;
    if (currentPage >= TOTAL_PAGES - 1) return;
    playSound(paperRustle);
    setTurning(true);
    setTimeout(() => {
      setCurrentPage((p) => p + 1);
      setTurning(false);
    }, 700);
  };

  const turnPrev = () => {
    if (turning || currentPage === 0) return;
    playSound(paperRustle);
    setCurrentPage((p) => p - 1);
  };

  const startClose = () => setClosing(true);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at center, #2D1A1A 0%, #0A0505 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        perspective: "1400px",
        perspectiveOrigin: "center",
      }}
    >
      {!done && (
        <div
          style={{
            position: "relative",
            width: "320px",
            height: "420px",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Pages container */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Static left page (always visible when book open) */}
            <div style={pageStyle("left")}>
              <LeftPageContent page={currentPage} />
            </div>
            {/* Right page (turns) */}
            <div style={{ ...pageStyle("right"), position: "relative" }}>
              <motion.div
                key={currentPage}
                initial={turning ? { rotateY: 0 } : false}
                animate={turning ? { rotateY: -180 } : { rotateY: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  transformOrigin: "left center",
                  transformStyle: "preserve-3d",
                  boxShadow: turning ? "0 20px 40px rgba(0,0,0,0.5)" : "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <RightPageContent page={currentPage} />
                </div>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "#FFF8F0",
                  }}
                >
                  {currentPage + 1 < TOTAL_PAGES && <LeftPageContent page={currentPage + 1} />}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Cover (closes on top via 3D) */}
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: closing ? 0 : opened ? -160 : 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
              zIndex: closing ? 5 : opened ? 1 : 5,
            }}
          >
            <BookCover />
          </motion.div>

          {/* Nav arrows */}
          {opened && !closing && (
            <>
              {currentPage > 0 && (
                <button onClick={turnPrev} style={arrowStyle("left")}>‹</button>
              )}
              {currentPage < TOTAL_PAGES - 1 && (
                <button onClick={turnNext} style={arrowStyle("right")}>›</button>
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: "-30px",
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "11px",
                  color: "#D4AF37",
                  letterSpacing: "0.1em",
                }}
              >
                Page {currentPage + 1} of {TOTAL_PAGES}
              </div>
            </>
          )}
        </div>
      )}

      {opened && !closing && currentPage === TOTAL_PAGES - 1 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={startClose}
          style={{
            position: "absolute",
            bottom: `calc(40px + env(safe-area-inset-bottom))`,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 26px",
            borderRadius: "999px",
            background: "linear-gradient(135deg, #D4AF37, #F5D16A)",
            color: "#1A0A0A",
            border: "none",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(212,175,55,0.4)",
            zIndex: 100,
          }}
        >
          Close the Book
        </motion.button>
      )}

      {done && <ContinueButton onClick={onNext} />}
    </div>
  );
}

function pageStyle(side: "left" | "right"): React.CSSProperties {
  return {
    width: "50%",
    height: "100%",
    background: "#FFF8F0",
    borderRadius: side === "left" ? "4px 0 0 4px" : "0 4px 4px 0",
    boxShadow: "inset 0 0 12px rgba(0,0,0,0.08)",
    overflow: "hidden",
    position: "relative",
  };
}

function arrowStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    [side]: "-44px",
    transform: "translateY(-50%)",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "rgba(212,175,55,0.85)",
    color: "#1A0A0A",
    border: "none",
    fontSize: "22px",
    cursor: "pointer",
    fontFamily: "serif",
    zIndex: 10,
  } as React.CSSProperties;
}

function BookCover() {
  const data = useMllData();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 30% 30%, #8B0000 0%, #5A0000 60%, #3A0000 100%)",
        border: "3px solid #8B0000",
        borderRadius: "4px 14px 14px 4px",
        boxShadow:
          "8px 8px 30px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.3)",
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
      <div style={{ position: "absolute", top: "20px", left: "30px", right: "20px", height: "1px", background: "#D4AF37", opacity: 0.4 }} />
      <h1
        style={{
          fontFamily: "'Great Vibes', cursive",
          fontSize: "36px",
          color: "#D4AF37",
          textAlign: "center",
          margin: 0,
          textShadow: "0 2px 4px rgba(0,0,0,0.5), 0 0 16px rgba(212,175,55,0.3)",
          lineHeight: 1.1,
        }}
      >
        My Love Language
      </h1>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "18px",
          color: "#D4AF37",
          marginTop: "16px",
          opacity: 0.85,
        }}
      >
        <ET fid="mll_book_author" />
      </p>
      <svg width="40" height="40" viewBox="0 0 100 100" style={{ marginTop: "20px" }}>
        <path
          d="M50 80 C20 55, 20 30, 38 30 C44 30, 50 36, 50 42 C50 36, 56 30, 62 30 C80 30, 80 55, 50 80 Z"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="2"
        />
      </svg>
      <div style={{ position: "absolute", bottom: "20px", left: "30px", right: "20px", height: "1px", background: "#D4AF37", opacity: 0.4 }} />
    </div>
  );
}

function LeftPageContent({ page }: { page: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "20px 14px",
        background: "#FFF8F0",
        boxShadow: "inset 4px 0 8px -4px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "6px",
          border: "1px solid #D4AF37",
          opacity: 0.3,
          borderRadius: "2px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          width: "120px",
          height: "110px",
          background: "#E8E0D8",
          border: "2px solid #D4AF37",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          color: "#8B7355",
          fontFamily: "'Outfit', sans-serif",
          fontSize: "10px",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="1.5">
          <rect x="3" y="6" width="18" height="14" rx="2" />
          <circle cx="12" cy="13" r="3.5" />
          <path d="M8 6l1.5-2h5L16 6" />
        </svg>
        <span style={{ marginTop: "4px" }}>Your Photo</span>
      </div>
      <div
        style={{
          marginTop: "12px",
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "44px",
          animation: "heartBeat 1.4s ease-in-out infinite",
        }}
      >
        💖
      </div>
      <span
        style={{
          position: "absolute",
          bottom: "8px",
          left: "12px",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "10px",
          color: "#D4AF37",
        }}
      >
        Page {page + 1}
      </span>
    </div>
  );
}

function RightPageContent({ page }: { page: number }) {
  const data = useMllData();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "20px 16px",
        background:
          "repeating-linear-gradient(transparent 0, transparent 27px, #D4C5B2 27px, #D4C5B2 28px), #FFF8F0",
        boxShadow: "inset -4px 0 8px -4px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        <WaxSealMini />
      </div>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "14px",
          lineHeight: "28px",
          color: "#3D2B2B",
          marginTop: "28px",
        }}
      >
        <ET fid={`mll_page${page + 1}`} multiline />
      </p>
      <span
        style={{
          position: "absolute",
          bottom: "8px",
          right: "12px",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "10px",
          color: "#D4AF37",
        }}
      >
        Pg. {page + 1}
      </span>
    </div>
  );
}

function WaxSealMini() {
  return (
    <svg width="28" height="28" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="42" fill="#8B0000" stroke="#4A0000" strokeWidth="2" />
      <path d="M50 70 C30 55, 30 38, 42 38 C46 38, 50 42, 50 46 C50 42, 54 38, 58 38 C70 38, 70 55, 50 70 Z" fill="#FFD7D7" />
    </svg>
  );
}
