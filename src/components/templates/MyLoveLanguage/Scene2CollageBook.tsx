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
  const [bookStage, setBookStage] = useState<"closed" | "open" | "closing">(editMode ? "open" : "closed");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (bookStage === "closing") {
      const t = setTimeout(() => setDone(true), 1100);
      return () => clearTimeout(t);
    }
  }, [bookStage]);

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
    setBookStage("closing");
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
            width: "min(340px, 92vw)",
            height: "min(480px, 70vh)",
            perspective: "1500px",
            zIndex: 10,
          }}
        >
          {/* Backing Red Leather Board (Cover Base) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at 30% 30%, #8B0000 0%, #5A0000 60%, #3A0000 100%)",
              border: "3px solid #8B0000",
              borderRadius: "12px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.6), inset 0 0 24px rgba(0,0,0,0.4)",
              zIndex: 1,
            }}
          >
            {/* Gold foil outline inside backing board */}
            <div style={{ position: "absolute", inset: "8px", border: "1.5px solid #D4AF37", borderRadius: "8px", opacity: 0.35 }} />
            {/* Gold metallic corners */}
            <BookCorners />
          </div>

          {/* Pages stack container */}
          <div
            style={{
              position: "absolute",
              inset: "10px",
              zIndex: 5,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Page Thickness stack (page depth effect) */}
            <div style={{ position: "absolute", inset: "4px -4px 4px 4px", background: "#FFF3E6", border: "1px solid #D4AF37", borderRadius: "4px", zIndex: 1, opacity: 0.8 }} />
            <div style={{ position: "absolute", inset: "2px -2px 2px 2px", background: "#FFF6ED", border: "1px solid #E5C158", borderRadius: "4px", zIndex: 2, opacity: 0.9 }} />

            {/* Closed Cover View */}
            {bookStage === "closed" && (
              <div style={{ position: "absolute", inset: 0, zIndex: 20 }}>
                <BookCover onOpen={() => {
                  playSound(paperRustle);
                  setBookStage("open");
                }} />
              </div>
            )}

            {/* Opened Pages View */}
            {bookStage === "open" && (
              <div style={{ position: "absolute", inset: 0, zIndex: 10, transformStyle: "preserve-3d" }}>
                {/* Static Underneath Page */}
                {turningState === "next" ? (
                  <SinglePageContent page={currentPage + 1} />
                ) : turningState === "prev" ? (
                  <SinglePageContent page={currentPage - 1} />
                ) : (
                  <SinglePageContent page={currentPage} />
                )}

                {/* Flipping Page (Next) */}
                {turningState === "next" && (
                  <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: -180 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      transformOrigin: "left center",
                      transformStyle: "preserve-3d",
                      zIndex: 15,
                    }}
                  >
                    {/* Front face (Current page text/images) */}
                    <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", zIndex: 2 }}>
                      <SinglePageContent page={currentPage} />
                    </div>
                    {/* Back face (Flipped blank parchment texture) */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        background: "#FFF8F0",
                        border: "1.5px solid #D4AF37",
                        borderRadius: "4px",
                        zIndex: 1,
                      }}
                    />
                  </motion.div>
                )}

                {/* Flipping Page (Prev) */}
                {turningState === "prev" && (
                  <motion.div
                    initial={{ rotateY: -180 }}
                    animate={{ rotateY: 0 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      transformOrigin: "left center",
                      transformStyle: "preserve-3d",
                      zIndex: 15,
                    }}
                  >
                    {/* Front face (Previous page content) */}
                    <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", zIndex: 2 }}>
                      <SinglePageContent page={currentPage - 1} />
                    </div>
                    {/* Back face */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        background: "#FFF8F0",
                        border: "1.5px solid #D4AF37",
                        borderRadius: "4px",
                        zIndex: 1,
                      }}
                    />
                  </motion.div>
                )}
              </div>
            )}

            {/* Closing Cover Panel (3D overlay) */}
            {bookStage === "closing" && (
              <motion.div
                initial={{ rotateY: -180 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  transformOrigin: "left center",
                  transformStyle: "preserve-3d",
                  zIndex: 30,
                }}
              >
                {/* Inside cover backing (rotated 180) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "#5A0000",
                    border: "3px solid #8B0000",
                    borderRadius: "4px",
                  }}
                />
                {/* Outside front cover (visible face when closed) */}
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
                  <BookCover onOpen={() => {}} />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar */}
      {!done && bookStage === "open" && (
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "200px",
            zIndex: 40,
          }}
        >
          {currentPage > 0 ? (
            <button
              onClick={turnPrev}
              onTouchEnd={(e) => {
                e.preventDefault();
                turnPrev();
              }}
              style={navButtonStyle()}
            >
              ‹
            </button>
          ) : (
            <div style={{ width: "36px" }} />
          )}

          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "12px",
              color: "#D4AF37",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            {currentPage + 1} / {TOTAL_PAGES}
          </span>

          {currentPage < TOTAL_PAGES - 1 ? (
            <button
              onClick={turnNext}
              onTouchEnd={(e) => {
                e.preventDefault();
                turnNext();
              }}
              style={navButtonStyle()}
            >
              ›
            </button>
          ) : (
            <div style={{ width: "36px" }} />
          )}
        </div>
      )}

      {/* Close the book overlay button */}
      {bookStage !== "closing" && bookStage === "open" && currentPage === TOTAL_PAGES - 1 && (
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

function navButtonStyle(): React.CSSProperties {
  return {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #D4AF37, #F5D16A)",
    color: "#1A0A0A",
    border: "none",
    fontSize: "22px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3), 0 0 8px rgba(212,175,55,0.2)",
  };
}

function BookCorners() {
  const cornerStyle = (pos: "tl" | "tr" | "bl" | "br"): React.CSSProperties => {
    const isTop = pos.startsWith("t");
    const isLeft = pos.endsWith("l");
    return {
      position: "absolute",
      width: "20px",
      height: "20px",
      borderTop: isTop ? "3.5px solid #D4AF37" : "none",
      borderBottom: !isTop ? "3.5px solid #D4AF37" : "none",
      borderLeft: isLeft ? "3.5px solid #D4AF37" : "none",
      borderRight: !isLeft ? "3.5px solid #D4AF37" : "none",
      [isTop ? "top" : "bottom"]: "6px",
      [isLeft ? "left" : "right"]: "6px",
      borderRadius: isTop
        ? (isLeft ? "4px 0 0 0" : "0 4px 0 0")
        : (isLeft ? "0 0 0 4px" : "0 0 4px 0"),
      pointerEvents: "none",
      boxShadow: "0 0 4px rgba(212,175,55,0.3)",
    };
  };

  return (
    <>
      <div style={cornerStyle("tl")} />
      <div style={cornerStyle("tr")} />
      <div style={cornerStyle("bl")} />
      <div style={cornerStyle("br")} />
    </>
  );
}

function BookCover({ onOpen }: { onOpen: () => void }) {
  const data = useMllData();
  return (
    <div
      onClick={onOpen}
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 30% 30%, #8B0000 0%, #5A0000 60%, #3A0000 100%)",
        border: "3px solid #8B0000",
        borderRadius: "4px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        boxSizing: "border-box",
        cursor: "pointer",
        backfaceVisibility: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: "24px", left: "20px", right: "20px", height: "1.5px", background: "#D4AF37", opacity: 0.35 }} />
      <BookCorners />

      <h1
        style={{
          fontFamily: "'Great Vibes', cursive",
          fontSize: "36px",
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
          fontSize: "18px",
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

      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.0, repeat: Infinity }}
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "12px",
          color: "#D4AF37",
          marginTop: "32px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        Click to Open ➔
      </motion.p>

      <div style={{ position: "absolute", bottom: "24px", left: "20px", right: "20px", height: "1.5px", background: "#D4AF37", opacity: 0.35 }} />
    </div>
  );
}

function SinglePageContent({ page }: { page: number }) {
  const data = useMllData();
  const imageSrc = data.img_pages?.[page] ?? `/templates/my-love-language/collage-${page + 1}.png`;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#FFF8F0",
        borderRadius: "4px",
        border: "1.5px solid #D4AF37",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.06)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Decorative gold inner frame */}
      <div
        style={{
          position: "absolute",
          inset: "6px",
          border: "1px solid #D4AF37",
          opacity: 0.25,
          borderRadius: "2px",
          pointerEvents: "none",
        }}
      />

      {/* Top Part: Polaroid Photo Frame */}
      <div
        style={{
          position: "relative",
          width: "82%",
          maxWidth: "200px",
          background: "#FFFFFF",
          padding: "8px 8px 20px 8px",
          boxShadow: "0 6px 16px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)",
          transform: "rotate(-2deg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "12px",
          zIndex: 5,
        }}
      >
        {/* Washi Tape */}
        <div
          style={{
            position: "absolute",
            top: "-12px",
            left: "50%",
            transform: "translateX(-50%) rotate(3deg)",
            width: "60px",
            height: "18px",
            background: "rgba(240, 235, 220, 0.7)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            borderLeft: "1px dashed rgba(0,0,0,0.12)",
            borderRight: "1px dashed rgba(0,0,0,0.12)",
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
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <img
            src={imageSrc}
            alt="Moments"
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
            fontSize: "20px",
            color: "#4A3B32",
            margin: 0,
            marginTop: "10px",
            lineHeight: 1.1,
            textAlign: "center",
            width: "100%",
          }}
        >
          <ET fid={`mll_caption${page + 1}`} />
        </p>
      </div>

      {/* Bottom Part: Text Content with notebook ruled lines */}
      <div
        style={{
          width: "90%",
          flex: 1,
          background:
            "repeating-linear-gradient(transparent 0, transparent 27px, #EADCC9 27px, #EADCC9 28px)",
          position: "relative",
          marginTop: "4px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "14px",
            lineHeight: "28px",
            color: "#302222",
            margin: 0,
            paddingTop: "6px",
            paddingBottom: "10px",
          }}
        >
          <ET fid={`mll_page${page + 1}`} multiline />
        </p>
      </div>

      {/* Wax Seal at the bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <WaxSealMini />
      </div>

      {/* Page number */}
      <span
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "11px",
          color: "#C19E37",
        }}
      >
        Page {page + 1}
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
