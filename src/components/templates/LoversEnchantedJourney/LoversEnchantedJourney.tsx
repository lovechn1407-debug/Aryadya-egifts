"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import confetti from "canvas-confetti";
import gsap from "gsap";
import SongLibraryPopup from "../../SongLibraryPopup";

// ── CSS Keyframes (injected as style tag) ─────────────────────────────────────
const KEYFRAMES = `
  @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@100..900&family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Sacramento&family=Nunito:wght@300..800&family=Lora:ital,wght@0,400..700;1,400..700&family=Dancing+Script:wght@400..700&family=Caveat:wght@400..700&display=swap");
  @keyframes lej-flicker { from { opacity: 1; } to { opacity: 0.82; } }
  .lej-bulb { width:14px;height:18px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;display:inline-block;box-shadow:0 0 8px currentColor,0 0 20px currentColor; }
  .lej-bulb-flicker { animation: lej-flicker 0.12s ease infinite alternate; }
  @keyframes lej-star { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
  .lej-star { animation: lej-star 3s ease-in-out infinite; }
  @keyframes lej-wave { 0%,100% { border-radius:45% 55% 50% 50%/30% 30% 70% 70%; } 50% { border-radius:55% 45% 50% 50%/70% 70% 30% 30%; } }
  .lej-wave { animation: lej-wave 5s ease-in-out infinite; }
  @keyframes lej-bob { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-10px) rotate(2deg); } }
  .lej-bob { animation: lej-bob 4s ease-in-out infinite; }
  @keyframes lej-bear { 0%,100% { transform:rotate(-8deg) translateY(0); } 25% { transform:rotate(0deg) translateY(-6px); } 50% { transform:rotate(8deg) translateY(0); } 75% { transform:rotate(0deg) translateY(-6px); } }
  .lej-dance { animation: lej-bear 1.2s ease-in-out infinite; }
  @keyframes lej-glow { 0%,100%{text-shadow:0 0 20px rgba(255,200,100,.5),0 0 40px rgba(255,180,80,.3);} 50%{text-shadow:0 0 30px rgba(255,200,100,.8),0 0 60px rgba(255,180,80,.5);} }
  .lej-glow { animation: lej-glow 2s ease-in-out infinite; }

  /* Premium Card Stack Helpers */
  .lej-stack-container {
    position: relative;
    width: 320px;
    height: 450px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .lej-swipable-card {
    width: 290px;
    height: 400px;
  }
  .lej-premium-card {
    background: #fdfaf4;
    padding: 16px 16px 32px;
    box-shadow: 0 15px 45px rgba(0,0,0,0.3);
    border-radius: 16px;
    border: 3px solid #D4AF37;
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: box-shadow 0.3s ease;
  }
  .lej-premium-card-image {
    height: 230px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(212,175,55,0.3);
  }
  .lej-premium-card-caption {
    margin-top: 12px;
    text-align: center;
    font-family: 'Dancing Script', cursive !important;
    font-weight: 700;
    color: #4a2f1b;
    font-size: 1.8rem !important;
    line-height: 1.2;
    text-shadow: 0 1px 1px rgba(0,0,0,0.05);
  }

  .lej-garden-pots-wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: center;
    gap: 32px 16px;
    padding: 32px 16px;
    width: 100%;
    margin: 0 auto;
  }
  .lej-garden-pot {
    position: relative;
    width: 90px;
    height: 230px;
  }
  .lej-garden-tooltip {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 176px;
    padding: 8px 12px;
    text-align: center;
    border-radius: 20px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    background: #fdf6e3;
    border: 2px solid #C0395A;
    top: -75px;
    z-index: 30;
  }

  @media (max-width: 768px) {
    .lej-garden-pots-wrapper {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 20px 8px !important;
      padding: 24px 8px 12px 8px !important;
    }
  }

  @media (max-width: 480px) {
    .lej-stack-container {
      width: 280px;
      height: 420px;
    }
    .lej-swipable-card {
      width: 260px !important;
      height: 380px !important;
    }
    .lej-premium-card-image {
      height: 200px !important;
    }
    .lej-premium-card-caption {
      font-size: 1.6rem !important;
    }
    .lej-garden-pots-wrapper {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 12px 4px !important;
      padding: 20px 4px 12px 4px !important;
    }
    .lej-garden-pot {
      width: 70px !important;
      height: 180px !important;
    }
    .lej-garden-pot-inner {
      transform: scale(0.72) !important;
      transform-origin: bottom center !important;
    }
    .lej-garden-tooltip {
      width: 130px !important;
      font-size: 0.8rem !important;
      padding: 4px 8px !important;
      top: -55px !important;
    }
  }
`;

/* ── Premium Inline Vector SVG Component Helpers ── */
function SVGCamera({ size = 24, style = {}, className = "" }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={style} className={className}>
      <rect x="6" y="16" width="52" height="36" rx="6" fill="url(#goldGrad)" stroke="#FFE57F" strokeWidth="1.5" />
      <path d="M22 16 L26 8 H38 L42 16 Z" fill="url(#goldGrad)" stroke="#FFE57F" strokeWidth="1.5" />
      <circle cx="32" cy="34" r="13" fill="#1a0a14" stroke="#FFE57F" strokeWidth="2.5" />
      <circle cx="32" cy="34" r="9" fill="url(#goldGrad)" />
      <circle cx="32" cy="34" r="4" fill="#1a0a14" />
      <circle cx="35" cy="31" r="1.5" fill="#fdf6e3" />
      <rect x="46" y="20" width="6" height="4" rx="1" fill="#FF1744" />
    </svg>
  );
}

function SVGHeart({ size = 24, fill = "url(#roseGrad)", stroke = "none", strokeWidth = 0, style = {}, className = "" }: { size?: number; fill?: string; stroke?: string; strokeWidth?: number; style?: React.CSSProperties; className?: string }) {
  const actualFill = fill === "currentColor" || fill === "url(#roseGrad)" ? "url(#roseGrad)" : fill;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth={strokeWidth} style={style} className={className}>
      {/* Outer Gold Shadow & Border */}
      <path d="M32 55.3l-3.8-3.5C14.4 39.5 5.3 31.2 5.3 21 5.3 12.7 11.8 6.2 20.1 6.2c4.7 0 9.2 2.2 11.9 5.6C34.7 8.4 39.2 6.2 43.9 6.2 52.2 6.2 58.7 12.7 58.7 21c0 10.2-9.1 18.5-22.9 30.8L32 55.3z" fill="url(#goldGrad)" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }} />
      {/* Main Heart */}
      <path d="M32 53l-3.2-2.9C15.5 38.3 7 30.5 7 21c0-7.8 6-13.8 13.8-13.8 4.4 0 8.6 2 11.2 5.2 2.6-3.2 6.8-5.2 11.2-5.2C51 7.2 57 13.2 57 21c0 9.5-8.5 17.3-21.8 29.1L32 53z" fill={actualFill} />
      {/* Highlight Gloss Shape */}
      <path d="M20.1 9.2c-5.5 0-9.8 4.3-9.8 9.8 0 7.2 6.8 14.1 18.2 24.3l3.5-3.5C22 29.8 15.6 23.5 15.6 19c0-3.5 2.5-6 6-6c1.5 0 3 .5 4 1.5L20.1 9.2" fill="#FFFFFF" opacity="0.25" />
    </svg>
  );
}

function SVGRose({ size = 24, style = {}, className = "" }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={style} className={className}>
      {/* Green Stem & Leaves */}
      <path d="M32 30 Q32 46 32 58" stroke="url(#stemGrad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 38 Q46 38 48 34" stroke="url(#stemGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M48 34 c2-2 1-7-4-5-4 1.5-10 7-12 9" fill="url(#stemGrad)" opacity="0.9" />
      <path d="M32 46 Q18 46 16 42" stroke="url(#stemGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M16 42 c-2-2-1-7 4-5 4 1.5 10 7 12 9" fill="url(#stemGrad)" opacity="0.9" />
      {/* Thorns */}
      <path d="M32 42 L27 40" stroke="url(#stemGrad)" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 50 L37 48" stroke="url(#stemGrad)" strokeWidth="2" strokeLinecap="round" />
      {/* Layered Rose Head */}
      <circle cx="32" cy="22" r="15" fill="url(#roseGrad)" stroke="#5A0010" strokeWidth="0.5" />
      <path d="M22 22 C22 14 42 14 42 22 C42 30 22 30 22 22 Z" fill="url(#roseGrad)" opacity="0.9" />
      <path d="M26 22 C26 17 38 17 38 22 C38 27 26 27 26 22 Z" fill="#E60026" opacity="0.95" />
      <path d="M29 22 C29 19 35 19 35 22 C35 25 29 25 29 22 Z" fill="#FF3366" />
      <ellipse cx="32" cy="22" rx="2" ry="3" fill="#FFD700" opacity="0.8" />
    </svg>
  );
}

function SVGEnvelope({ size = 24, style = {}, className = "" }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={style} className={className}>
      <rect x="6" y="16" width="52" height="36" rx="4" fill="black" opacity="0.15" />
      <rect x="12" y="10" width="40" height="20" rx="2" fill="#FFFFFF" stroke="#FFE57F" strokeWidth="1" />
      <line x1="18" y1="16" x2="34" y2="16" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="21" x2="46" y2="21" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="6" y="18" width="52" height="34" rx="4" fill="url(#goldGrad)" stroke="#FFE57F" strokeWidth="1.2" />
      <path d="M6 18 L32 36 L58 18" stroke="#7A5800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 52 L24 33.5" stroke="#7A5800" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M58 52 L40 33.5" stroke="#7A5800" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="32" cy="35" r="7.5" fill="#B22222" stroke="#FFD700" strokeWidth="1" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
      <path d="M32 38.5l-.8-.7c-2.8-2.6-4.7-4.3-4.7-6.5 0-1.8 1.4-3.2 3.2-3.2 1 0 2 .5 2.5 1.2.5-.7 1.5-1.2 2.5-1.2 1.8 0 3.2 1.4 3.2 3.2 0 2.2-1.9 3.9-4.7 6.5l-.7.7z" fill="#FF4D4D" transform="translate(-32, -35) scale(0.6) translate(32, 35)" />
    </svg>
  );
}

function SVGSparkle({ size = 24, style = {}, className = "" }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={style} className={className}>
      <circle cx="32" cy="32" r="16" fill="url(#goldGrad)" opacity="0.3" style={{ filter: "blur(8px)" }} />
      <path d="M32 6 Q32 32 6 32 Q32 32 32 58 Q32 32 58 32 Q32 32 32 6 Z" fill="url(#goldGrad)" />
      <path d="M32 14 Q32 32 14 32 Q32 32 32 50 Q32 32 50 32 Q32 32 32 14 Z" fill="#FFF8E1" opacity="0.8" transform="rotate(45 32 32)" />
      <circle cx="32" cy="32" r="4.5" fill="#FFFFFF" style={{ filter: "drop-shadow(0 0 6px #FFFFFF)" }} />
    </svg>
  );
}

function SVGMusic({ size = 24, style = {}, className = "" }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={style} className={className}>
      <path d="M22 45V14l26-5v31" stroke="url(#goldGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 18L48 13.5" stroke="#FFE57F" strokeWidth="2.5" />
      <ellipse cx="16" cy="45" rx="9" ry="6.5" fill="url(#goldGrad)" transform="rotate(-15 16 45)" />
      <ellipse cx="42" cy="40" rx="9" ry="6.5" fill="url(#goldGrad)" transform="rotate(-15 42 40)" />
      <circle cx="16" cy="45" r="3" fill="#FFF59D" />
      <circle cx="42" cy="40" r="3" fill="#FFF59D" />
    </svg>
  );
}

function SVGButterfly({ size = 24, style = {}, className = "" }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={style} className={className}>
      <path d="M30 18 Q26 8 18 10" stroke="#FFE57F" strokeWidth="1.5" fill="none" />
      <path d="M34 18 Q38 8 46 10" stroke="#FFE57F" strokeWidth="1.5" fill="none" />
      <circle cx="18" cy="10" r="1.5" fill="#FFE57F" />
      <circle cx="46" cy="10" r="1.5" fill="#FFE57F" />
      <path d="M31 28 C26 12 6 16 12 32 C15 38 24 35 31 38" fill="url(#roseGrad)" stroke="#5A0010" strokeWidth="0.8" />
      <path d="M31 36 C24 34 10 40 14 50 C18 56 26 48 31 40" fill="url(#goldGrad)" stroke="#7A5800" strokeWidth="0.8" />
      <path d="M33 28 C38 12 58 16 52 32 C49 38 40 35 33 38" fill="url(#roseGrad)" stroke="#5A0010" strokeWidth="0.8" />
      <path d="M33 36 C40 34 54 40 50 50 C46 56 38 48 33 40" fill="url(#goldGrad)" stroke="#7A5800" strokeWidth="0.8" />
      <circle cx="18" cy="24" r="3" fill="#FFFFFF" opacity="0.4" />
      <circle cx="46" cy="24" r="3" fill="#FFFFFF" opacity="0.4" />
      <circle cx="20" cy="44" r="2" fill="#FFFFFF" opacity="0.4" />
      <circle cx="44" cy="44" r="2" fill="#FFFFFF" opacity="0.4" />
      <rect x="30" y="16" width="4" height="32" rx="2" fill="url(#goldGrad)" stroke="#4A2F1B" strokeWidth="1.2" />
    </svg>
  );
}

function SVGMoon({ size = 24, style = {}, className = "" }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={style} className={className}>
      <path d="M48 32 C48 46.4 36.4 58 22 58 C16.5 58 11.5 56.3 7.3 53.4 C18.7 51 27.2 41 27.2 28.8 C27.2 16.6 18.7 6.6 7.3 4.2 C11.5 1.3 16.5-0.4 22-0.4 C36.4-0.4 48 11.2 48 25.6 z" fill="url(#goldGrad)" transform="translate(10, 6)" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }} />
      <path d="M34 28 q3 3 6 0" stroke="#4A2F1B" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="37" cy="33" r="3.5" fill="#FF8A80" opacity="0.6" />
      <path d="M12 16 l1 2 l2 1 l-2 1 l-1 2 l-1-2 l-2-1 l2-1 z" fill="#FFF8E1" />
      <path d="M48 48 l0.5 1 l1 0.5 l-1 0.5 l-0.5 1 l-0.5-1 l-1-0.5 l1-0.5 z" fill="#FFF8E1" />
    </svg>
  );
}

function SVGStar({ size = 24, style = {}, className = "" }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={style} className={className}>
      <circle cx="32" cy="32" r="22" fill="url(#goldGrad)" opacity="0.25" style={{ filter: "blur(10px)" }} />
      <polygon points="32,4 40.5,21.5 59.5,24.5 45.8,37.8 49,56.8 32,47.8 15,56.8 18.2,37.8 4.5,24.5 23.5,21.5" fill="url(#goldGrad)" stroke="#FFE57F" strokeWidth="1" />
      <polygon points="32,4 32,47.8 49,56.8" fill="rgba(255,255,255,0.22)" />
      <polygon points="32,4 32,47.8 15,56.8" fill="rgba(0,0,0,0.15)" />
      <polygon points="32,4 32,47.8 40.5,21.5" fill="rgba(255,255,255,0.3)" />
      <polygon points="32,4 32,47.8 23.5,21.5" fill="rgba(0,0,0,0.2)" />
    </svg>
  );
}

function SVGSmile({ size = 24, style = {}, className = "" }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={style} className={className}>
      <circle cx="32" cy="32" r="28" fill="url(#goldGrad)" stroke="#FFE57F" strokeWidth="1.5" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }} />
      <path d="M12 24 C16 12 48 12 52 24 C44 14 20 14 12 24" fill="#FFFFFF" opacity="0.35" />
      <circle cx="22" cy="26" r="3.5" fill="#3D0C1A" />
      <circle cx="23" cy="25" r="1" fill="#FFF" />
      <circle cx="42" cy="26" r="3.5" fill="#3D0C1A" />
      <circle cx="43" cy="25" r="1" fill="#FFF" />
      <path d="M20 38 Q32 50 44 38" stroke="#3D0C1A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="37" r="3" fill="#FF8A80" opacity="0.8" />
      <circle cx="48" cy="37" r="3" fill="#FF8A80" opacity="0.8" />
    </svg>
  );
}

function SVGSunset({ size = 24, style = {}, className = "" }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={style} className={className}>
      <path d="M52 44 a20 20 0 0 0-40 0 Z" fill="url(#goldGrad)" stroke="#FFE57F" strokeWidth="1" />
      <line x1="32" y1="12" x2="32" y2="6" stroke="#FFC107" strokeWidth="3" strokeLinecap="round" />
      <line x1="16" y1="20" x2="11" y2="15" stroke="#FFC107" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="48" y1="20" x2="53" y2="15" stroke="#FFC107" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="36" x2="4" y2="36" stroke="#FFC107" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="54" y1="36" x2="60" y2="36" stroke="#FFC107" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="58" y1="46" x2="6" y2="46" stroke="#FFE57F" strokeWidth="3" strokeLinecap="round" />
      <path d="M 6 46 Q 20 50 32 46 Q 44 42 58 46" stroke="#C0395A" strokeWidth="2" fill="none" />
      <path d="M 12 52 Q 24 55 32 52 Q 40 49 52 52" stroke="#C0395A" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function SVGSunflower({ size = 24, style = {}, className = "" }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={style} className={className}>
      <circle cx="32" cy="32" r="10" fill="#3D0C1A" stroke="#5D4037" strokeWidth="2.5" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
        <path key={i} d="M 32 20 C 28 10 36 10 32 20" fill="url(#goldGrad)" transform={`rotate(${deg} 32 32)`} stroke="#D4AF37" strokeWidth="0.5" />
      ))}
      <circle cx="32" cy="32" r="5" fill="#fbbf24" opacity="0.45" />
    </svg>
  );
}

function renderPhotoSVG(id: string) {
  const size = 76;
  const style = { filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.3))" };
  switch(id) {
    case "p1": return <SVGRose size={size} style={style} />;
    case "p2": return <SVGSmile size={size} style={style} />;
    case "p3": return <SVGSunset size={size} style={style} />;
    case "p4": return <SVGHeart size={size} style={style} />;
    case "p5": return <SVGSunflower size={size} style={style} />;
    case "p6": return <SVGSparkle size={size} style={style} />;
    default: return <SVGHeart size={size} style={style} />;
  }
}

function renderWheelIcon(iconName: string, x: number, y: number, angleDegrees: number) {
  const size = 28;
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angleDegrees + 90}) translate(${-size / 2}, ${-size / 2})`}>
      {iconName === "envelope" && <SVGEnvelope size={size} />}
      {iconName === "rose" && <SVGRose size={size} />}
      {iconName === "heart" && <SVGHeart size={size} />}
      {iconName === "sparkle" && <SVGSparkle size={size} />}
      {iconName === "music" && <SVGMusic size={size} />}
      {iconName === "butterfly" && <SVGButterfly size={size} />}
      {iconName === "moon" && <SVGMoon size={size} />}
      {iconName === "star" && <SVGStar size={size} />}
    </g>
  );
}

function renderResultIcon(iconName: string) {
  const size = 44;
  switch(iconName) {
    case "envelope": return <SVGEnvelope size={size} />;
    case "rose": return <SVGRose size={size} />;
    case "heart": return <SVGHeart size={size} />;
    case "sparkle": return <SVGSparkle size={size} />;
    case "music": return <SVGMusic size={size} />;
    case "butterfly": return <SVGButterfly size={size} />;
    case "moon": return <SVGMoon size={size} />;
    case "star": return <SVGStar size={size} />;
    default: return <SVGHeart size={size} />;
  }
}

const getFormattedDate = () => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options).toUpperCase(); // e.g., "MAY 21, 2026"
};

function CircularWaxStamp({ viewerName = "MY LOVE", dateText = "MAY 21, 2026" }) {
  const brandText = "ARADHYA E-GIFTS";
  const fullText = `${brandText}   •   ${viewerName.toUpperCase()}   •   ${dateText}   •   `;
  
  return (
    <svg viewBox="0 0 200 200" style={{ width: 190, height: 190, filter: "drop-shadow(0 12px 30px rgba(139,0,0,0.6))" }}>
      <defs>
        {/* Organic wax shading gradients */}
        <radialGradient id="waxGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#DF2020" />
          <stop offset="65%" stopColor="#8A0808" />
          <stop offset="100%" stopColor="#3F0000" />
        </radialGradient>
        {/* Luxury Gold Metallic text path gradient */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE57F" />
          <stop offset="45%" stopColor="#FFC107" />
          <stop offset="75%" stopColor="#FF8F00" />
          <stop offset="100%" stopColor="#A66800" />
        </linearGradient>
        {/* Perfect text path radius */}
        <path id="stampTextPath" d="M 100 100 m -66, 0 a 66,66 0 1,1 132,0 a 66,66 0 1,1 -132,0" fill="none" />
      </defs>
      
      {/* Outer irregular handmade wax seal shapes */}
      <path d="M 100,8 C 148,3 194,15 191,62 C 196,112 195,162 153,190 C 109,199 58,195 16,163 C 2,126 5,76 15,39 C 24,10 61,11 100,8 Z" fill="url(#waxGrad)" />
      <path d="M 100,12 C 136,14 186,6 183,57 C 191,102 183,152 146,180 C 106,190 56,184 26,154 C 5,117 13,67 23,37 C 33,17 66,9 100,12 Z" fill="url(#waxGrad)" opacity="0.38" transform="rotate(22 100 100)" />
      
      {/* Inner thin golden circle borders */}
      <circle cx="100" cy="100" r="74" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.75" />
      <circle cx="100" cy="100" r="56" fill="none" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.4" />
      
      {/* Curved Text Path */}
      <text fill="url(#goldGrad)" style={{ fontFamily: "'Outfit', sans-serif", fontSize: "8px", fontWeight: 900, letterSpacing: "2.1px", textTransform: "uppercase" }}>
        <textPath href="#stampTextPath" startOffset="0%">
          {fullText}
        </textPath>
      </text>
      
      {/* Central Majestic Gold Emblem: Gold Hearts */}
      <g transform="translate(100, 102) scale(1.2)">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#goldGrad)" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
      </g>
    </svg>
  );
}

// ── Editable Text ──────────────────────────────────────────────────────────────
function ET({ fid, data, onChange, style, multiline = false, editMode = false }: {
  fid: string; data: Record<string, string>; onChange?: (id: string, v: string) => void;
  style?: React.CSSProperties; multiline?: boolean; editMode?: boolean;
}) {
  const value = data[fid] ?? "";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(data[fid] ?? ""), [data, fid]);
  const commit = () => { onChange?.(fid, draft); setEditing(false); };

  if (!editMode) return <span style={{ display: "block", ...style }}>{value}</span>;

  if (editing) {
    const base: React.CSSProperties = {
      display: "block", width: "100%", border: "2px solid #D4AF37", borderRadius: 8,
      padding: "8px 10px", background: "rgba(255,255,255,0.95)", outline: "none",
      fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit",
      color: "#1a1a1a", lineHeight: "inherit",
    };
    return multiline
      ? <textarea value={draft} rows={4} autoFocus onChange={e => setDraft(e.target.value)}
          onBlur={commit} style={{ ...style, ...base, resize: "vertical", color: "#1a1a1a" }} />
      : <input value={draft} autoFocus onChange={e => setDraft(e.target.value)}
          onBlur={commit} onKeyDown={e => e.key === "Enter" && commit()}
          style={{ ...style, ...base, color: "#1a1a1a" }} />;
  }

  return (
    <div onClick={() => setEditing(true)} title="Click to edit" style={{
      position: "relative", cursor: "text", border: "2px dashed rgba(212,175,55,0.6)",
      borderRadius: 8, padding: "6px 10px 22px 10px",
      background: "rgba(212,175,55,0.05)", marginBottom: 6,
    }}>
      <span style={{ display: "block", ...style }}>
        {value || <em style={{ opacity: 0.4, fontSize: 13 }}>Click to edit…</em>}
      </span>
      <span style={{ position: "absolute", bottom: 3, right: 8, fontSize: 10, color: "#D4AF37", fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>✏️ edit</span>
    </div>
  );
}

// ── Bear Character ─────────────────────────────────────────────────────────────
type BearVariant = "plain" | "headphones" | "lantern" | "sailor" | "couple";
function SingleBear({ size = 100, variant = "plain" as BearVariant, dancing = false }: { size?: number; variant?: BearVariant; dancing?: boolean }) {
  const s = size / 100;
  return (
    <div className={dancing ? "lej-dance" : ""} style={{ width: size, height: size * 1.25, position: "relative", flexShrink: 0 }}>
      {variant === "sailor" && (
        <div style={{ position:"absolute", top:-8*s, left:"50%", transform:"translateX(-50%)", width:70*s, height:22*s, background:"#fff", borderRadius:"50% 50% 4px 4px", border:"2px solid #1A4F8B", zIndex:5 }}>
          <div style={{ position:"absolute", bottom:4*s, left:0, right:0, height:4*s, background:"#C0392B" }} />
        </div>
      )}
      {variant === "headphones" && (<>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:76*s, height:30*s, border:`${4*s}px solid #2D2D3A`, borderRadius:"50% 50% 0 0", borderBottom:"none", zIndex:5 }} />
        <div style={{ position:"absolute", top:18*s, left:6*s, width:18*s, height:22*s, background:"#FF6B9D", borderRadius:"50%", zIndex:5 }} />
        <div style={{ position:"absolute", top:18*s, right:6*s, width:18*s, height:22*s, background:"#FF6B9D", borderRadius:"50%", zIndex:5 }} />
      </>)}
      <div style={{ position:"absolute", top:4*s, left:8*s, width:26*s, height:26*s, background:"#8B5E3C", borderRadius:"50%" }}>
        <div style={{ position:"absolute", top:6*s, left:6*s, width:14*s, height:14*s, background:"#C4917A", borderRadius:"50%" }} />
      </div>
      <div style={{ position:"absolute", top:4*s, right:8*s, width:26*s, height:26*s, background:"#8B5E3C", borderRadius:"50%" }}>
        <div style={{ position:"absolute", top:6*s, left:6*s, width:14*s, height:14*s, background:"#C4917A", borderRadius:"50%" }} />
      </div>
      <div style={{ position:"absolute", top:10*s, left:"50%", transform:"translateX(-50%)", width:70*s, height:64*s, background:"#8B5E3C", borderRadius:"50%", boxShadow:"inset -4px -6px 0 rgba(0,0,0,0.08)" }}>
        <div style={{ position:"absolute", top:24*s, left:16*s, width:8*s, height:8*s, background:"#1a1a1a", borderRadius:"50%" }}><div style={{ position:"absolute", top:1*s, left:1*s, width:3*s, height:3*s, background:"#fff", borderRadius:"50%" }} /></div>
        <div style={{ position:"absolute", top:24*s, right:16*s, width:8*s, height:8*s, background:"#1a1a1a", borderRadius:"50%" }}><div style={{ position:"absolute", top:1*s, left:1*s, width:3*s, height:3*s, background:"#fff", borderRadius:"50%" }} /></div>
        <div style={{ position:"absolute", top:36*s, left:8*s, width:12*s, height:8*s, background:"rgba(255,182,193,0.6)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", top:36*s, right:8*s, width:12*s, height:8*s, background:"rgba(255,182,193,0.6)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", top:32*s, left:"50%", transform:"translateX(-50%)", width:28*s, height:22*s, background:"#C4917A", borderRadius:"50%" }}>
          <div style={{ position:"absolute", top:4*s, left:"50%", transform:"translateX(-50%)", width:6*s, height:4*s, background:"#1a1a1a", borderRadius:"50%" }} />
          <svg style={{ position:"absolute", top:10*s, left:"50%", transform:"translateX(-50%)" }} width={16*s} height={8*s} viewBox="0 0 16 8">
            <path d="M2 1 Q8 7 14 1" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div style={{ position:"absolute", top:62*s, left:"50%", transform:"translateX(-50%)", width:60*s, height:56*s, background:"#8B5E3C", borderRadius:"40% 40% 45% 45%" }}>
        <div style={{ position:"absolute", top:8*s, left:"50%", transform:"translateX(-50%)", width:38*s, height:32*s, background:"#C4917A", borderRadius:"50%" }} />
      </div>
      {variant === "sailor" && <div style={{ position:"absolute", top:60*s, left:"50%", transform:"translateX(-50%)", width:50*s, height:8*s, background:"#2563eb", borderRadius:4, zIndex:6 }} />}
      {variant === "lantern" && (
        <div style={{ position:"absolute", top:70*s, right:-4*s, width:16*s, height:22*s, background:"#FF8C00", borderRadius:"40% 40% 50% 50%", boxShadow:"0 0 16px #FFB347,0 0 30px rgba(255,179,71,0.7)", zIndex:4 }}>
          <div style={{ position:"absolute", top:-4*s, left:"50%", transform:"translateX(-50%)", width:2*s, height:8*s, background:"#5b3a1f" }} />
        </div>
      )}
      {variant === "headphones" && <div style={{ position:"absolute", top:72*s, right:-8*s, fontSize:18*s, color:"#FF6B9D", filter:"drop-shadow(0 0 6px rgba(255,107,157,0.7))" }}>♡</div>}
    </div>
  );
}
function BearChar({ size = 100, variant = "plain" as BearVariant, extStyle }: { size?: number; variant?: BearVariant; extStyle?: React.CSSProperties }) {
  if (variant === "couple") return (
    <div style={{ display:"flex", alignItems:"flex-end", ...extStyle }}>
      <div style={{ marginRight: -size * 0.15 }}><SingleBear size={size} variant="lantern" /></div>
      <SingleBear size={size} variant="lantern" />
    </div>
  );
  return <div style={extStyle}><SingleBear size={size} variant={variant} /></div>;
}

// ── ImageUploader ───────────────────────────────────────────────────────────────
const IMGBB_KEY = "83e3f88941efd1059a89f016ff302d9e";
function ImageUploader({ fid, data, onChange, defaultSrc }: {
  fid: string; data: Record<string, string>; onChange?: (id: string, v: string) => void; defaultSrc: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const currentSrc = data[fid] || "";
  void defaultSrc;
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPreview(URL.createObjectURL(file)); setUploading(true);
    try {
      const fd = new FormData(); fd.append("image", file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) { onChange?.(fid, json.data.url); setPreview(null); }
    } catch { /* ignore */ }
    setUploading(false);
  };
  const useDefault = () => { onChange?.(fid, ""); setPreview(null); };
  return (
    <div style={{ padding: "8px 12px", background: "rgba(212,175,55,0.06)", borderTop: "1px dashed rgba(212,175,55,0.4)", borderRadius: "0 0 12px 12px", marginTop: 4 }}>
      {preview && <div style={{ marginBottom: 6, textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Preview" style={{ maxHeight: 80, borderRadius: 8, border: "2px solid #D4AF37" }} />
      </div>}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
          background: "linear-gradient(135deg,#D4AF37,#FFB347)", color: "#3D0C1A", border: "none", borderRadius: 8,
          padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer",
          opacity: uploading ? 0.6 : 1,
        }}>{uploading ? "Uploading…" : "📷 Replace Image"}</button>
        {currentSrc && <button onClick={useDefault} style={{
          background: "rgba(255,255,255,0.1)", color: "#fdf6e3", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer",
        }}>↩ Use Default</button>}
      </div>
    </div>
  );
}

// ── SlideShell ─────────────────────────────────────────────────────────────────
function SlideShell({ children, onBack, onNext, backLabel = "← Back", nextLabel = "Next →", showNext = true, background, isEditMode = false }: {
  children: React.ReactNode; onBack?: () => void; onNext?: () => void;
  backLabel?: string; nextLabel?: string; showNext?: boolean; background?: string; isEditMode?: boolean;
}) {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 15 }}
      style={{
        position:"relative",
        height:"100dvh",
        width:"100%",
        overflowX:"hidden",
        overflowY: isEditMode ? "auto" : "hidden",
        ...(background ? { background } : {})
      }}
    >
      {children}
      <div style={{ position:"absolute", bottom:24, left:0, right:0, zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"space-between", padding:"0 20px", pointerEvents:"none" }}>
        <div style={{ pointerEvents:"auto" }}>
          {onBack && <button onClick={onBack} style={{ borderRadius:9999, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.1)", padding:"10px 20px", fontSize:14, fontWeight:500, color:"rgba(255,255,255,0.9)", backdropFilter:"blur(8px)", cursor:"pointer" }}>{backLabel}</button>}
        </div>
        <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", pointerEvents:"none" }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontFamily:"'Caveat',cursive", fontWeight:600 }}>made with love ♡</span>
        </div>
        <div style={{ pointerEvents:"auto" }}>
          {onNext && showNext && <button onClick={onNext} style={{ borderRadius:9999, background:"linear-gradient(to right,#D4AF37,#FFB347)", padding:"10px 24px", fontSize:14, fontWeight:600, color:"#3D0C1A", boxShadow:"0 8px 30px rgba(212,175,55,0.4)", cursor:"pointer", border:"none" }}>{nextLabel}</button>}
        </div>
      </div>
    </motion.div>
  );
}

// ── BULB COLORS ────────────────────────────────────────────────────────────────
const BULB_COLORS = ["#FF6B6B","#FFD700","#FF69B4","#00CED1","#FF8C00","#9B59B6"];

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 0: BACKGROUND MUSIC
// ─────────────────────────────────────────────────────────────────────────────
function Slide0BgMusic({ d, onNext, em, oc }: { d:Record<string,string>; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void }) {
  const [isPicking, setIsPicking] = useState(false);
  return (
    <SlideShell onNext={onNext} showNext={true} nextLabel="Room →" background="linear-gradient(160deg,#0D0818 0%,#1A0A2E 100%)" isEditMode={em}>
      <div style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px 80px" }}>
        {/* Floating decorative notes */}
        {["♪","♫","♩","♬"].map((n,i) => (
          <div key={i} style={{ position:"absolute", fontSize:28, opacity:0.07, top:`${18+i*18}%`, left:`${8+i*24}%`, color:"#FFD700", pointerEvents:"none", userSelect:"none" }}>{n}</div>
        ))}
        <motion.div initial={{ opacity:0, scale:0.88 }} animate={{ opacity:1, scale:1 }} transition={{ type:"spring", stiffness:80, damping:16 }}
          style={{ position:"relative", width:"100%", maxWidth:420, background:"linear-gradient(135deg,rgba(20,6,36,0.96),rgba(52,8,24,0.94))", border:"1.5px solid rgba(212,175,55,0.4)", borderRadius:28, padding:"40px 32px", textAlign:"center", boxShadow:"0 30px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
          <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:2, borderRadius:1, background:"linear-gradient(90deg,transparent,#FFD700,transparent)" }} />
          <div style={{ width:68, height:68, borderRadius:"50%", background:"rgba(212,175,55,0.1)", border:"1.5px solid rgba(212,175,55,0.35)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <SVGMusic size={32} style={{ color:"#D4AF37" }} />
          </div>
          <div style={{ fontSize:10, letterSpacing:"0.45em", fontWeight:700, color:"#D4AF37", fontFamily:"'Outfit',sans-serif", marginBottom:12 }}>✦ BACKGROUND MUSIC ✦</div>
          <h2 style={{ fontFamily:"'Dancing Script',cursive", fontSize:"clamp(1.6rem,4vw,2.2rem)", color:"#fdf6e3", fontWeight:700, marginBottom:8 }}>Set the Mood</h2>
          <p style={{ fontFamily:"'Lora',serif", fontStyle:"italic", color:"rgba(253,246,227,0.6)", fontSize:13, lineHeight:1.7, marginBottom:24 }}>
            Choose a song that plays softly throughout the entire experience
          </p>
          {d.bg_song_name ? (
            <div style={{ background:"rgba(212,175,55,0.08)", border:"1px solid rgba(212,175,55,0.25)", borderRadius:12, padding:"10px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
              <SVGMusic size={16} style={{ color:"#D4AF37", flexShrink:0 }} />
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, color:"#fdf6e3", textAlign:"left" }}>{d.bg_song_name}</span>
            </div>
          ) : (
            <p style={{ fontFamily:"'Caveat',cursive", fontSize:"1.15rem", color:"rgba(255,255,255,0.28)", marginBottom:20 }}>No background song selected yet</p>
          )}
          {em && (
            <button onClick={() => setIsPicking(true)} style={{ display:"inline-flex", alignItems:"center", gap:8, borderRadius:9999, background:"linear-gradient(135deg,#D4AF37,#FFB347)", color:"#3D0C1A", border:"none", padding:"12px 28px", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 8px 24px rgba(212,175,55,0.4)" }}>
              <SVGMusic size={14} />{d.bg_song_url ? "Change Music" : "Pick a Song"}
            </button>
          )}
          <div style={{ position:"absolute", bottom:0, left:"30%", right:"30%", height:1, borderRadius:1, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)" }} />
        </motion.div>
      </div>
      {isPicking && (
        <SongLibraryPopup
          onClose={() => setIsPicking(false)}
          onSelect={(song) => {
            oc?.("bg_song_name", song.name);
            oc?.("bg_song_url", song.url || "");
            oc?.("bg_song_type", song.type || "direct");
            oc?.("bg_song_youtube_id", song.youtubeId || "");
            oc?.("bg_song_start", String(song.startTime || 0));
            oc?.("bg_song_end", String(song.endTime || 0));
            setIsPicking(false);
          }}
        />
      )}
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 1: DARK ROOM
// ─────────────────────────────────────────────────────────────────────────────
function LightString({ y, sag, count }: { y:number; sag:number; count:number }) {
  const bulbs = useMemo(() => Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    const x = 2 * (1 - t) * t * 50 + t * t * 100;
    const yPos = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + sag) + t * t * y;
    return { x, y: yPos, color: BULB_COLORS[i % BULB_COLORS.length] };
  }), [count, y, sag]);
  return (<>
    <svg style={{ position:"absolute", top:0, left:0, width:"100%", height:200, overflow:"visible" }} preserveAspectRatio="none" viewBox="0 0 100 200">
      <path d={`M 0 ${y} Q 50 ${y + sag} 100 ${y}`} stroke="#2a2a2a" strokeWidth="0.3" fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
    {bulbs.map((b, i) => (
      <motion.span key={i} initial={{ opacity:0, scale:0 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.4+i*0.04, type:"spring", stiffness:200 }}
        className="lej-bulb lej-bulb-flicker" style={{ position:"absolute", left:`${b.x}%`, top:b.y, color:b.color, background:b.color, transform:"translate(-50%,-50%)", animationDelay:`${i*0.05}s` }} />
    ))}
  </>);
}

function Slide1DarkRoom({ d, onNext, em, oc, ap }: { d:Record<string,string>; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void; ap?:boolean }) {
  const [lightsOn, setLightsOn] = useState(em || ap || false);
  useEffect(() => { if (em || ap) setLightsOn(true); }, [em, ap]);

  const bearSpring = useSpring({
    from: { scale: 0 },
    to: { scale: lightsOn ? 1 : 0 },
    config: { tension:180, friction:12 },
    delay: 800,
  });

  return (
    <SlideShell onNext={lightsOn || em ? onNext : undefined} showNext={lightsOn || em} background={lightsOn ? "#1A0A1A" : "#080408"} isEditMode={em}>
      <div style={{ position:"relative", height:"100%", transition:"background 700ms" }}>
        {/* Room silhouette */}
        <div style={{ pointerEvents:"none", position:"absolute", inset:0 }}>
          <div style={{ position:"absolute", top:"18%", left:"12%", width:220, height:280, border:`2px solid ${lightsOn?"rgba(255,220,180,0.25)":"rgba(255,255,255,0.05)"}`, borderRadius:8, transition:"all 800ms" }}>
            <div style={{ position:"absolute", left:"50%", top:0, height:"100%", width:1, background:lightsOn?"rgba(255,220,180,0.18)":"rgba(255,255,255,0.04)" }} />
            <div style={{ position:"absolute", top:"50%", height:1, width:"100%", background:lightsOn?"rgba(255,220,180,0.18)":"rgba(255,255,255,0.04)" }} />
            {lightsOn && <div style={{ position:"absolute", right:24, top:24, height:64, width:64, borderRadius:"50%", background:"radial-gradient(circle,#fef3c7,#fcd34d)", boxShadow:"0 0 40px rgba(252,211,77,0.5)" }} />}
          </div>
          <div style={{ position:"absolute", bottom:"30%", right:"14%", width:220, height:4, background:lightsOn?"rgba(180,120,80,0.5)":"rgba(255,255,255,0.04)", transition:"all 800ms" }} />
          <div style={{ position:"absolute", top:"15%", left:"8%", width:12, height:320, background:lightsOn?"rgba(150,40,60,0.6)":"rgba(255,255,255,0.03)", borderRadius:2, transition:"all 800ms" }} />
          <div style={{ position:"absolute", top:"15%", left:"calc(12% + 220px - 4px)", width:12, height:320, background:lightsOn?"rgba(150,40,60,0.6)":"rgba(255,255,255,0.03)", borderRadius:2, transition:"all 800ms" }} />
          <div style={{ position:"absolute", bottom:"8%", left:"50%", transform:"translateX(-50%)", width:380, height:60, borderRadius:"50%", background:lightsOn?"radial-gradient(ellipse,rgba(180,40,60,0.4),rgba(120,30,50,0.2))":"rgba(255,255,255,0.02)", transition:"all 800ms" }} />
        </div>

        {/* Diwali light strings */}
        {lightsOn && (<>
          <LightString y={50} sag={45} count={14} />
          <LightString y={70} sag={55} count={13} />
          <LightString y={90} sag={50} count={12} />
          <LightString y={110} sag={60} count={14} />
          <LightString y={130} sag={45} count={13} />
        </>)}

        {/* Bear GIF – bear7 – positioned to left of light switch */}
        <animated.div style={{ position:"absolute", bottom:66, right:116, transform:bearSpring.scale.to(sc=>`scale(${sc})`), opacity:bearSpring.scale, zIndex:2 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/templates/lovers-enchanted-journey/bear7.gif" alt="bear" style={{ width: 108, height: 108, objectFit: "contain" }} />
        </animated.div>

        {/* Light switch */}
        {!lightsOn && (
          <button onClick={() => setLightsOn(true)} style={{ position:"absolute", bottom:80, right:40, width:60, height:90, background:"#f4f1e8", borderRadius:4, border:"1px solid rgba(255,230,150,0.3)", boxShadow:"0 0 12px rgba(255,230,150,0.3),0 0 30px rgba(255,200,100,0.15)", cursor:"pointer" }}>
            <span style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", top:18, width:24, height:40, background:"linear-gradient(180deg,#d4cfbf,#f4f1e8)", borderRadius:4, boxShadow:"inset 0 -4px 6px rgba(0,0,0,0.15)", display:"block" }} />
            <span style={{ position:"absolute", left:"50%", top:-32, transform:"translateX(-50%)", whiteSpace:"nowrap", fontSize:16, fontFamily:"'Caveat',cursive", color:"rgba(255,215,150,0.55)", fontWeight:600 }}>Turn me on ✦</span>
          </button>
        )}

        {/* Title text */}
        <AnimatePresence>
          {lightsOn && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.4, duration:0.8 }} style={{ position:"absolute", left:0, right:0, top:"42%", textAlign:"center", padding:"0 24px" }}>
              <ET fid="s1_light_text" data={d} onChange={oc} editMode={em} style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1.4rem,3vw,2rem)", color:"#fce7c8" }} />
            </motion.div>
          )}
        </AnimatePresence>
        {!lightsOn && (
          <div style={{ position:"absolute", left:0, right:0, top:"40%", textAlign:"center", color:"rgba(255,255,255,0.2)", fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.2rem" }}>
            ... it&apos;s dark in here ...
          </div>
        )}
      </div>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 2: PHOTOS
// ─────────────────────────────────────────────────────────────────────────────
interface PhotoData { id:string; emoji:string; bg:string; rotate:number; pinColor:string; top:string; left:string; fidCaption:string; }
const PHOTOS_DEF: PhotoData[] = [
  { id:"p1", emoji:"🌸", bg:"linear-gradient(135deg,#fbcfe8,#f9a8d4)", rotate:-6, pinColor:"#dc2626", top:"8%", left:"6%", fidCaption:"s2_p1_caption" },
  { id:"p2", emoji:"😄", bg:"linear-gradient(135deg,#fde68a,#fbbf24)", rotate:5, pinColor:"#16a34a", top:"10%", left:"38%", fidCaption:"s2_p2_caption" },
  { id:"p3", emoji:"🌅", bg:"linear-gradient(135deg,#fdba74,#f97316)", rotate:-4, pinColor:"#2563eb", top:"6%", left:"70%", fidCaption:"s2_p3_caption" },
  { id:"p4", emoji:"💑", bg:"linear-gradient(135deg,#a78bfa,#7c3aed)", rotate:7, pinColor:"#fbbf24", top:"48%", left:"12%", fidCaption:"s2_p4_caption" },
  { id:"p5", emoji:"🌻", bg:"linear-gradient(135deg,#fcd34d,#fbbf24)", rotate:-5, pinColor:"#dc2626", top:"50%", left:"42%", fidCaption:"s2_p5_caption" },
  { id:"p6", emoji:"💕", bg:"linear-gradient(135deg,#fda4af,#f43f5e)", rotate:4, pinColor:"#7c3aed", top:"46%", left:"72%", fidCaption:"s2_p6_caption" },
];

function PremiumGoldPolaroid({ photo, caption, editMode = false, onChange, onClick, data = {} }: {
  photo: PhotoData; caption: string; editMode?: boolean; onChange?: (id: string, v: string) => void; onClick?: () => void; data?: Record<string, string>;
}) {
  const customImg = data[`s2_${photo.id}_img`] || "";
  return (
    <div
      onClick={!editMode ? onClick : undefined}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#fffdf9",
        borderRadius: 20,
        border: "4px solid transparent",
        backgroundImage: "linear-gradient(#fffdf9, #fffdf9), linear-gradient(135deg, #FFE57F, #FFC107, #FF8F00, #A66800)",
        backgroundOrigin: "border-box",
        backgroundClip: "content-box, border-box",
        boxShadow: "0 15px 35px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.5)",
        padding: "16px 16px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      {/* Gold Heart Push-Pin anchored at top center */}
      <div style={{
        position: "absolute",
        top: -14,
        left: "50%",
        transform: "translateX(-50%)",
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "radial-gradient(circle at 30% 30%, #FFE57F 0%, #FFC107 40%, #A66800 100%)",
        boxShadow: "0 4px 6px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10
      }}>
        <SVGHeart size={14} fill="url(#goldGrad)" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }} />
      </div>

      <div className="lej-premium-card-image" style={{
        width: "100%",
        height: editMode ? "160px" : undefined,
        borderRadius: 12,
        background: customImg ? "#000" : photo.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "inset 0 4px 10px rgba(0,0,0,0.15)",
        border: "1px solid rgba(212,175,55,0.25)",
        overflow: "hidden"
      }}>
        {customImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={customImg} alt="memory" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : renderPhotoSVG(photo.id)}
      </div>
      {editMode && (
        <ImageUploader fid={`s2_${photo.id}_img`} data={data} onChange={onChange} defaultSrc="" />
      )}

      <div style={{ marginTop: 12, width: "100%" }}>
        {editMode ? (
          <ET fid={photo.fidCaption} data={{ [photo.fidCaption]: caption }} onChange={onChange} editMode={editMode}
            style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: "1.4rem", color: "#3D0C1A", textAlign: "center" }} />
        ) : (
          <div style={{
            textAlign: "center",
            fontFamily: "'Dancing Script', cursive",
            fontWeight: 700,
            fontSize: "1.6rem",
            color: "#3D0C1A",
            textShadow: "0 1px 1px rgba(255,255,255,0.8)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%"
          }}>
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}

function SwipableCard({
  photo,
  caption,
  isTop,
  absoluteIndex,
  onSwipe,
  swipeDir,
  onClick,
  data = {}
}: {
  photo: PhotoData;
  caption: string;
  isTop: boolean;
  absoluteIndex: number;
  onSwipe: (dir: "left" | "right") => void;
  swipeDir?: "left" | "right";
  onClick: () => void;
  data?: Record<string, string>;
}) {
  const x = useMotionValue(0);
  const rotateDrag = useTransform(x, [-200, 200], [-15, 15]);
  const opacityDrag = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 80;
    if (info.offset.x > swipeThreshold) {
      onSwipe("right");
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      layoutId={`lej-photo-${photo.id}`}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={isTop ? handleDragEnd : undefined}
      className="lej-swipable-card"
      style={{
        position: "absolute",
        zIndex: 100 - absoluteIndex,
        cursor: isTop ? "grab" : "default",
        transformOrigin: "bottom center",
        x: isTop ? x : 0,
        rotate: isTop ? rotateDrag : (absoluteIndex % 2 === 0 ? 3 : -3) * absoluteIndex,
        opacity: isTop ? opacityDrag : 1 - absoluteIndex * 0.15,
      }}
      animate={isTop ? {
        scale: 1,
        y: 0,
      } : {
        scale: 1 - absoluteIndex * 0.05,
        y: absoluteIndex * 12,
      }}
      exit={{
        x: swipeDir === "right" ? 400 : -400,
        opacity: 0,
        rotate: swipeDir === "right" ? 45 : -45,
        scale: 0.8,
        transition: { duration: 0.35 }
      }}
    >
      <PremiumGoldPolaroid photo={photo} caption={caption} editMode={false} onClick={onClick} data={data} />
    </motion.div>
  );
}

function Slide2Photos({ d, onBack, onNext, em, oc }: { d:Record<string,string>; onBack:()=>void; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void }) {
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [swipeDirs, setSwipeDirs] = useState<Record<string, "left" | "right">>({});
  const [expanded, setExpanded] = useState<PhotoData | null>(null);

  const rawTitle = d.s2_title || "Our Moments Together";
  const displayTitle = rawTitle.replace(/📸/g, "").trim();

  const swipe = (dir: "left" | "right") => {
    const visibleCards = PHOTOS_DEF.filter(p => !swipedIds.has(p.id));
    if (visibleCards.length === 0) return;
    const topCardId = visibleCards[0].id;
    setSwipedIds(prev => {
      const next = new Set(prev);
      next.add(topCardId);
      return next;
    });
    setSwipeDirs(prev => ({ ...prev, [topCardId]: dir }));
  };

  const visibleCards = PHOTOS_DEF.filter(p => !swipedIds.has(p.id));

  if (em) {
    return (
      <SlideShell onBack={onBack} onNext={onNext} background="radial-gradient(ellipse at center,#a87a3d 0%,#6b4a1f 70%,#3d2810 100%)" isEditMode={true}>
        <div style={{ position:"absolute", inset:0, opacity:0.08, mixBlendMode:"overlay", pointerEvents:"none", background:"repeating-linear-gradient(45deg,rgba(255,255,255,0.05) 0px,rgba(255,255,255,0.05) 1px,transparent 1px,transparent 10px)" }} />
        
        <div style={{ position:"relative", paddingTop:64, paddingBottom:128, minHeight:"100%" }}>
          <h2 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, textAlign:"center", marginBottom: 32, fontFamily:"'Dancing Script',cursive", color:"#fdf6e3", fontSize:"clamp(2rem,5vw,3.2rem)", textShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>
            <ET fid="s2_title" data={d} onChange={oc} editMode={em} style={{ fontFamily:"'Dancing Script',cursive", color:"#fdf6e3", fontSize:"clamp(2rem,5vw,3.2rem)", fontWeight: 700 }} />
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "24px", maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
            {PHOTOS_DEF.map(p => (
              <div key={p.id} style={{ width: 220, margin: "0 auto" }}>
                <PremiumGoldPolaroid photo={p} caption={d[p.fidCaption] || ""} editMode={true} onChange={oc} data={d} />
              </div>
            ))}
          </div>
        </div>
      </SlideShell>
    );
  }

  return (
    <SlideShell onBack={onBack} onNext={onNext} background="radial-gradient(ellipse at center,#a87a3d 0%,#6b4a1f 70%,#3d2810 100%)" isEditMode={false}>
      <div style={{ position:"absolute", inset:0, opacity:0.08, mixBlendMode:"overlay", pointerEvents:"none", background:"repeating-linear-gradient(45deg,rgba(255,255,255,0.05) 0px,rgba(255,255,255,0.05) 1px,transparent 1px,transparent 10px)" }} />
      {/* Fairy lights */}
      <div style={{ position:"absolute", left:0, right:0, top:0, pointerEvents:"none" }}>
        <svg width="100%" height="80" viewBox="0 0 100 80" preserveAspectRatio="none">
          <path d="M 0 10 Q 50 50 100 10" stroke="#2a1a0a" strokeWidth="0.3" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
        {Array.from({ length:16 }).map((_, i) => {
          const t = (i+0.5)/16; const x = 2*(1-t)*t*50+t*t*100; const y = 2*(1-t)*t*50+10;
          return <span key={i} className="lej-bulb lej-bulb-flicker" style={{ position:"absolute", left:`${x}%`, top:y, color:"#fff5d0", background:"#fff5d0", transform:"translate(-50%,-50%)", animationDelay:`${i*0.07}s` }} />;
        })}
      </div>

      <div style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", paddingBottom: 64 }}>
        <h2 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, textAlign:"center", marginBottom: 20, fontFamily:"'Dancing Script',cursive", color:"#fdf6e3", fontSize:"clamp(1.8rem,4vw,2.8rem)", textShadow:"0 4px 20px rgba(0,0,0,0.4)", fontWeight: 700 }}>
          {displayTitle}
          <SVGCamera size={34} style={{ color: "#FFD700", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
        </h2>

        <div className="lej-stack-container" style={{ position: "relative", width: 320, height: 420 }}>
          <AnimatePresence>
            {visibleCards.length === 0 ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: "100%", height: "100%" }}>
                <div style={{
                  width: "100%",
                  height: "100%",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "2px dashed rgba(212, 175, 55, 0.4)",
                  borderRadius: 20,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 24,
                  textAlign: "center",
                  color: "#fff"
                }}>
                  <div style={{ marginBottom: 16 }}>
                    <SVGHeart size={48} fill="url(#goldGrad)" className="lej-bob" />
                  </div>
                  <h3 style={{ fontFamily: "'Dancing Script', cursive", fontSize: "2rem", color: "#FFD700", marginBottom: 12, fontWeight: 700 }}>
                    Our Magical Memories
                  </h3>
                  <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 24 }}>
                    That&apos;s all of our magical memories... for now! ♡
                  </p>
                  <button onClick={() => { setSwipedIds(new Set()); setSwipeDirs({}); }}
                    style={{
                      borderRadius: 9999,
                      background: "linear-gradient(to right,#D4AF37,#FFB347)",
                      padding: "10px 24px",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#3D0C1A",
                      boxShadow: "0 8px 30px rgba(212, 175, 55, 0.4)",
                      cursor: "pointer",
                      border: "none",
                      transition: "all 0.3s"
                    }}>
                    Replay Memories Stack ↺
                  </button>
                </div>
              </motion.div>
            ) : (
              visibleCards.slice().reverse().map((photo, relativeIndex) => {
                const absoluteIndex = visibleCards.length - 1 - relativeIndex;
                const isTop = absoluteIndex === 0;

                return (
                  <SwipableCard
                    key={photo.id}
                    photo={photo}
                    caption={d[photo.fidCaption] || ""}
                    isTop={isTop}
                    absoluteIndex={absoluteIndex}
                    swipeDir={swipeDirs[photo.id]}
                    onSwipe={(dir) => {
                      setSwipedIds(prev => {
                        const next = new Set(prev);
                        next.add(photo.id);
                        return next;
                      });
                      setSwipeDirs(prev => ({ ...prev, [photo.id]: dir }));
                    }}
                    onClick={() => setExpanded(photo)}
                    data={d}
                  />
                );
              })
            )}
          </AnimatePresence>
        </div>

        {visibleCards.length > 0 && (
          <div style={{ display: "flex", gap: 24, marginTop: 24, justifyContent: "center", width: "100%", zIndex: 10 }}>
            <button onClick={() => swipe("left")} style={{
              width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg, #1e293b, #0f172a)", border: "2px solid #D4AF37",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)", fontSize: 18, color: "#FDA4AF"
            }} title="Swipe Left">
              ✕
            </button>
            <button onClick={() => swipe("right")} style={{
              width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg, #D4AF37, #FFB347)", border: "2px solid #fff",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              boxShadow: "0 8px 20px rgba(212,175,55,0.4)", fontSize: 18, color: "#3D0C1A"
            }} title="Swipe Right">
              ♥
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setExpanded(null)}
            style={{ position:"fixed", inset:0, zIndex:120, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.85)", backdropFilter:"blur(6px)", padding:24 }}
          >
            <motion.div layoutId={`lej-photo-${expanded.id}`} style={{ position:"relative", width:"min(400px,90vw)", background:"#fffdf9", padding:"16px 16px 32px", borderRadius:20, border:"4px solid #D4AF37", boxShadow:"0 30px 80px rgba(0,0,0,0.6)" }}
              onClick={e => e.stopPropagation()}
            >
              {d[`s2_${expanded.id}_img`] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d[`s2_${expanded.id}_img`]!} alt="memory" style={{ width:"100%", height:320, objectFit:"cover", borderRadius:12, display:"block" }} />
              ) : (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", background:expanded.bg, height:320, borderRadius:12 }}>
                  {renderPhotoSVG(expanded.id)}
                </div>
              )}
              <div style={{ marginTop:16, textAlign:"center", fontFamily:"'Dancing Script',cursive", color:"#3D0C1A", fontSize:"2rem", fontWeight: 700 }}>{d[expanded.fidCaption] || ""}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 3: MUSIC
// ─────────────────────────────────────────────────────────────────────────────
function Waveform() {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:40 }}>
      {Array.from({ length:22 }).map((_, i) => (
        <motion.span key={i} style={{ width:4, borderRadius:4, background:"#FF69B4", display:"block" }}
          animate={{ height:[8, 24+Math.random()*18, 12, 32, 8] }}
          transition={{ duration:0.8+(i%5)*0.1, repeat:Infinity, delay:i*0.04 }} />
      ))}
    </div>
  );
}

function CassetteSVG({ spinning }: { spinning: boolean }) {
  return (
    <motion.div
      animate={spinning ? { rotate:360, scale:[1,1.15,1] } : { y:[0,-8,0] }}
      transition={spinning ? { duration:0.6 } : { duration:3, repeat:Infinity, ease:"easeInOut" }}
      style={{ width:220, height:140, background:"linear-gradient(135deg,#1A1A2E,#2D2D4A)", borderRadius:14, boxShadow:"0 20px 60px rgba(255,100,150,0.25),inset 0 2px 4px rgba(255,255,255,0.1)", position:"relative", flexShrink:0 }}
    >
      <div style={{ position:"absolute", left:16, right:16, top:12, height:40, borderRadius:4, background:"linear-gradient(180deg,#fdf6e3,#e8dcc0)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontFamily:"'Dancing Script',cursive", fontWeight:700, color:"#7a4a2a", fontSize:16 }}>Songs For You ♡</span>
      </div>
      <div style={{ position:"absolute", left:28, bottom:24, width:64, height:64, borderRadius:"50%", border:"4px solid #0a0a14", background:"#1a1a2e", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <motion.div animate={{ rotate:360 }} transition={{ duration:4, repeat:Infinity, ease:"linear" }} style={{ width:12, height:12, borderRadius:"50%", background:"#FF69B4" }} />
      </div>
      <div style={{ position:"absolute", right:28, bottom:24, width:64, height:64, borderRadius:"50%", border:"4px solid #0a0a14", background:"#1a1a2e", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <motion.div animate={{ rotate:360 }} transition={{ duration:4, repeat:Infinity, ease:"linear" }} style={{ width:12, height:12, borderRadius:"50%", background:"#FF69B4" }} />
      </div>
    </motion.div>
  );
}

function Slide3Music({ d, onBack, onNext, em, oc }: { d:Record<string,string>; onBack:()=>void; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void }) {
  const [playing, setPlaying] = useState(false);
  const [songIdx, setSongIdx] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pickingFor, setPickingFor] = useState<number|null>(null);
  const audioRef = useRef<HTMLAudioElement|null>(null);
  const songs = [
    { nFid:"s3_song1_title", aFid:"s3_song1_artist", uFid:"s3_song1_url" },
    { nFid:"s3_song2_title", aFid:"s3_song2_artist", uFid:"s3_song2_url" },
    { nFid:"s3_song3_title", aFid:"s3_song3_artist", uFid:"s3_song3_url" },
  ];

  const startPlay = () => {
    setSpinning(true);
    setTimeout(() => { setSpinning(false); setPlaying(true); }, 600);
  };

  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const url = d[songs[songIdx].uFid];
    if (url && playing && !em) {
      const a = new Audio(url);
      a.play().catch(()=>{});
      audioRef.current = a;
    }
    return () => { audioRef.current?.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songIdx, playing, em]);

  return (
    <SlideShell onBack={onBack} onNext={playing || em ? onNext : undefined} showNext={playing || em} background="linear-gradient(180deg,#0D1B2A 0%,#1B2A3B 100%)" isEditMode={em}>
      {/* Stars */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {Array.from({ length:60 }).map((_, i) => (
          <span key={i} className="lej-star" style={{ position:"absolute", top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, width:Math.random()*2+1, height:Math.random()*2+1, borderRadius:"50%", background:"#fff", opacity:Math.random()*0.7+0.2, animationDelay:`${Math.random()*3}s`, display:"block" }} />
        ))}
      </div>

      <div style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 24px 64px" }}>
        {!playing && !em && (<>
          <CassetteSVG spinning={spinning} />
          <motion.p animate={{ scale:[1,1.05,1], opacity:[0.7,1,0.7] }} transition={{ duration:2, repeat:Infinity }}
            style={{ display: "flex", alignItems: "center", gap: 8, marginTop:40, textAlign:"center", fontFamily:"'Cormorant Garamond',serif", color:"#fdf6e3", fontSize:"1.4rem", fontStyle:"italic" }}>
            Tap to play your song...
            <SVGMusic size={20} style={{ color: "#FF69B4" }} />
          </motion.p>
          <button onClick={startPlay} style={{ display: "flex", alignItems: "center", gap: 10, marginTop:32, borderRadius:9999, background:"linear-gradient(to right,#FF69B4,#C0395A)", padding:"12px 32px", color:"#fff", fontWeight:600, boxShadow:"0 10px 30px rgba(255,105,180,0.4)", border:"none", cursor:"pointer", fontSize:15 }}>
            <SVGMusic size={18} /> Press Play
          </button>
        </>)}

        {em && (
          <div style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:20, padding:24, width:"100%", maxWidth:420, marginBottom:24 }}>
            <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily:"'Cormorant Garamond',serif", color:"#FFD700", fontSize:18, marginBottom:16, textAlign:"center" }}>
              <SVGMusic size={18} /> Edit Songs
            </p>
            {songs.map((s, i) => (
              <div key={i} style={{ marginBottom:16, background:"rgba(255,105,180,0.1)", borderRadius:12, padding:12 }}>
                <ET fid={s.nFid} data={d} onChange={oc} editMode={em} style={{ fontWeight:700, fontSize:14, color:"#fdf6e3", marginBottom:4 }} />
                <ET fid={s.aFid} data={d} onChange={oc} editMode={em} style={{ fontSize:12, color:"#FF69B4", marginBottom:8 }} />
                <button onClick={() => setPickingFor(i)} style={{ display: "flex", alignItems: "center", gap: 6, background:"none", border:"1px dashed #FF69B4", borderRadius:6, padding:"4px 10px", fontSize:11, color:"#FF69B4", cursor:"pointer", fontWeight:600 }}>
                  <SVGMusic size={12} /> {d[s.uFid] ? "Change Audio" : "Add Audio"}
                </button>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {(playing || em) && (
            <motion.div initial={{ y:200, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ type:"spring", stiffness:80, damping:14 }}
              style={{ background:"rgba(255,255,255,0.08)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:20, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", width:"100%", maxWidth:440, padding:24 }}
            >
              <CassetteSVG spinning={false} />
              <div style={{ marginTop:24, textAlign:"center" }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", color:"#fdf6e3" }}>{d[songs[songIdx].nFid] || "Song Title"}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", color:"#FF69B4", marginTop:4 }}>{d[songs[songIdx].aFid] || "Artist"}</div>
              </div>
              <div style={{ marginTop:20, display:"flex", justifyContent:"center" }}><Waveform /></div>
              <div style={{ marginTop:16, display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
                {songs.map((s, i) => (
                  <button key={i} onClick={() => setSongIdx(i)}
                    style={{ borderRadius:9999, padding:"6px 12px", fontSize:12, border:"none", cursor:"pointer",
                      background:i===songIdx?"#FF69B4":"rgba(255,255,255,0.1)", color:i===songIdx?"#fff":"rgba(255,255,255,0.7)" }}>
                    {d[s.nFid] || `Song ${i+1}`}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {pickingFor !== null && (
        <SongLibraryPopup onClose={() => setPickingFor(null)} onSelect={song => {
          if (oc && pickingFor !== null) {
            oc(songs[pickingFor].nFid, song.name);
            oc(songs[pickingFor].aFid, song.description || "Unknown Artist");
            oc(songs[pickingFor].uFid, song.url || "");
          }
          setPickingFor(null);
        }} />
      )}
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 4: SCRATCH
// ─────────────────────────────────────────────────────────────────────────────
function Slide4Scratch({ d, onBack, onNext, em, oc, ap }: { d:Record<string,string>; onBack:()=>void; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void; ap?:boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(em || ap || false);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (em || ap) { setRevealed(true); return; }
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = 380 * dpr; c.height = 280 * dpr;
    ctx.scale(dpr, dpr);
    const grad = ctx.createLinearGradient(0,0,380,280);
    grad.addColorStop(0,"#C0C0C0"); grad.addColorStop(0.5,"#E8E8E8"); grad.addColorStop(1,"#A8A8A8");
    ctx.fillStyle = grad; ctx.fillRect(0,0,380,280);
    for (let i=0;i<50;i++) { ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.3})`; ctx.beginPath(); ctx.arc(Math.random()*380,Math.random()*280,Math.random()*2,0,Math.PI*2); ctx.fill(); }
    ctx.fillStyle="#888"; ctx.font='bold 18px "Nunito",sans-serif'; ctx.textAlign="center";
    ctx.fillText("✦ SCRATCH HERE ✦",190,140);
    ctx.font='12px "Nunito",sans-serif'; ctx.fillStyle="#999";
    ctx.fillText("a surprise awaits...",190,165);
  }, [em, ap]);

  const scratchAt = (x:number,y:number) => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.globalCompositeOperation="destination-out"; ctx.beginPath(); ctx.arc(x,y,26,0,Math.PI*2); ctx.fill();
  };
  const checkPercent = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const data = ctx.getImageData(0,0,c.width,c.height).data;
    let cleared=0; for (let i=3;i<data.length;i+=80) if(data[i]===0) cleared++;
    if (cleared/(data.length/80)>0.55 && !revealed) {
      setRevealed(true);
      confetti({ particleCount:120, spread:80, origin:{y:0.6}, colors:["#FFD700","#FF69B4","#C0395A","#fdf6e3"] });
    }
  };

  return (
    <SlideShell onBack={onBack} onNext={revealed ? onNext : undefined} showNext={revealed} background="linear-gradient(180deg,#3D0C1A 0%,#6B1628 100%)" isEditMode={em}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {Array.from({ length:30 }).map((_,i) => (
          <motion.span key={i} style={{ position:"absolute", left:`${Math.random()*100}%`, bottom:-20, width:3, height:3, borderRadius:"50%", background:"rgba(255,215,100,0.6)", boxShadow:"0 0 8px rgba(255,215,100,0.8)", display:"block" }}
            animate={{ y:[0,-800], opacity:[0,1,0] }}
            transition={{ duration:8+Math.random()*6, repeat:Infinity, delay:Math.random()*6, ease:"linear" }} />
        ))}
      </div>
      <div style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
        <h2 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textAlign:"center", marginBottom:8, fontFamily:"'Cormorant Garamond',serif", color:"#FFD700", fontSize:"clamp(1.6rem,3.5vw,2.4rem)" }}>
          Scratch to reveal your surprise...
          <SVGSparkle size={22} style={{ color: "#FFD700" }} />
        </h2>
        <p style={{ fontSize:14, color:"rgba(253,246,227,0.7)", marginBottom:32 }}>Use your finger or mouse to scratch</p>
        <div style={{ position:"relative", width:380, maxWidth:"92vw" }}>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center", background:"linear-gradient(135deg,#fdf6e3,#f5e6c8)", borderRadius:16, border:"3px solid #D4AF37", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <SVGHeart size={32} fill="#C0395A" />
            </div>
            <div style={{ marginTop:8, fontFamily:"'Dancing Script',cursive", color:"#C0395A", fontSize:"1.9rem", lineHeight:1.1 }}>
              <ET fid="s4_reveal_title" data={d} onChange={oc} editMode={em} style={{ fontFamily:"'Dancing Script',cursive", color:"#C0395A", fontSize:"1.9rem" }} />
            </div>
            <div style={{ marginTop:12, fontFamily:"'Lora',serif", color:"#3a2418", fontSize:"0.95rem", lineHeight:1.5 }}>
              <ET fid="s4_reveal_body" data={d} onChange={oc} editMode={em} multiline style={{ fontFamily:"'Lora',serif", color:"#3a2418", fontSize:"0.95rem" }} />
            </div>
            <div style={{ marginTop:12, color:"#D4AF37", letterSpacing:"0.2em", fontSize:14 }}>✦ ✦ ✦</div>
          </div>
          <canvas ref={canvasRef}
            onPointerDown={e => { isDrawing.current=true; (e.target as HTMLElement).setPointerCapture(e.pointerId); const r=canvasRef.current!.getBoundingClientRect(); scratchAt(((e.clientX-r.left)/r.width)*380,((e.clientY-r.top)/r.height)*280); }}
            onPointerMove={e => { if(!isDrawing.current)return; const r=canvasRef.current!.getBoundingClientRect(); scratchAt(((e.clientX-r.left)/r.width)*380,((e.clientY-r.top)/r.height)*280); checkPercent(); }}
            onPointerUp={() => isDrawing.current=false}
            style={{ width:"100%", height:280, borderRadius:16, cursor:"grab", touchAction:"none", opacity:revealed?0:1, transition:"opacity 600ms", position:"relative", zIndex:2, display:"block" }} />
        </div>
      </div>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 5: CONSTELLATION
// ─────────────────────────────────────────────────────────────────────────────
const STARS = [
  { x: 300, y: 190 },
  { x: 230, y: 140 },
  { x: 160, y: 170 },
  { x: 130, y: 240 },
  { x: 190, y: 340 },
  { x: 300, y: 430 },
  { x: 410, y: 340 },
  { x: 470, y: 240 },
  { x: 440, y: 170 },
  { x: 370, y: 140 }
];

function Slide5Constellation({ d, onBack, onNext, em, oc, ap }: { d:Record<string,string>; onBack:()=>void; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void; ap?:boolean }) {
  const [connected, setConnected] = useState<number[]>(em||ap ? STARS.map((_,i)=>i) : []);
  const [shake, setShake] = useState<number|null>(null);
  const done = connected.length === STARS.length;

  const handleClick = (i:number) => {
    if (connected.includes(i)) return;
    if (i === connected.length) {
      const next = [...connected, i];
      setConnected(next);
      if (next.length === STARS.length) setTimeout(() => confetti({ particleCount:200, spread:90, origin:{y:0.4}, colors:["#FFD700","#FF69B4","#fdf6e3"] }), 400);
    } else { setShake(i); setTimeout(()=>setShake(null),400); }
  };

  const rawTitle = d.s5_title || "Connect the stars to reveal what I see";
  const displayTitle = rawTitle.replace(/✨/g, "").trim();

  const rawReveal = d.s5_reveal_text || "That's how I see you — a constellation I'll always find";
  const displayReveal = rawReveal.replace(/♡/g, "").trim();

  return (
    <SlideShell onBack={onBack} onNext={done||em ? onNext : undefined} nextLabel="Keep going... →" showNext={done||em} background="#020818" isEditMode={em}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {Array.from({ length:120 }).map((_,i) => (
          <span key={i} className="lej-star" style={{ position:"absolute", top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, width:Math.random()*2.5+0.5, height:Math.random()*2.5+0.5, borderRadius:"50%", background:"#fff", opacity:Math.random()*0.8+0.1, animationDelay:`${Math.random()*3}s`, display:"block" }} />
        ))}
      </div>
      <div style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
        <h2 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, textAlign:"center", fontFamily:"'Cormorant Garamond',serif", color:"#FFD700", fontSize:"clamp(1.6rem,3.5vw,2.4rem)" }}>
          {em ? (
            <ET fid="s5_title" data={d} onChange={oc} editMode={em} style={{ fontFamily:"'Cormorant Garamond',serif", color:"#FFD700", fontSize:"clamp(1.6rem,3.5vw,2.4rem)" }} />
          ) : (
            <>
              {displayTitle}
              <SVGSparkle size={24} style={{ color: "#FFD700" }} />
            </>
          )}
        </h2>
        <p style={{ marginTop:8, fontSize:14, color:"rgba(253,246,227,0.6)" }}>Click each star in order — 1 through 10</p>
        <div style={{ position:"relative", marginTop:32, width:600, maxWidth:"95vw", aspectRatio:"600/500" }}>
          <svg viewBox="0 0 600 500" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
            {connected.slice(0,-1).map((idx,k) => {
              const a=STARS[idx]; const b=STARS[connected[k+1]];
              return <motion.line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#FFD700" strokeWidth="2" strokeLinecap="round" initial={{ pathLength:0, opacity:0 }} animate={{ pathLength:1, opacity:1 }} transition={{ duration:0.4 }} style={{ filter:"drop-shadow(0 0 6px #FFD700)" }} />;
            })}
            {done && <motion.path initial={{ opacity:0 }} animate={{ opacity:[0,1,0.6,1] }} transition={{ duration:2, repeat:Infinity }}
              d={`M ${STARS[0].x} ${STARS[0].y} ${STARS.slice(1).map(s=>`L ${s.x} ${s.y}`).join(" ")} Z`}
              fill="rgba(255,215,0,0.1)" stroke="#FFD700" strokeWidth="1" />}
          </svg>
          {STARS.map((s,i) => {
            const lit = connected.includes(i);
            return (
              <motion.button key={i} onClick={() => handleClick(i)}
                animate={shake===i ? {x:[-6,6,-6,6,0]} : {scale:lit?[1,1.15,1]:[1,1.08,1]}}
                transition={shake===i ? {duration:0.4} : {duration:2,repeat:Infinity}}
                style={{ position:"absolute", left:`${(s.x/600)*100}%`, top:`${(s.y/500)*100}%`, transform:"translate(-50%,-50%)", width:36, height:36, cursor:"pointer", background:"none", border:"none" }}
              >
                <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, color:lit?"#FFD700":"#FFE89A", filter:`drop-shadow(0 0 ${lit?14:6}px #FFD700)` }}>✦</span>
                <span style={{ position:"absolute", top:-16, left:"50%", transform:"translateX(-50%)", fontSize:10, fontWeight:700, color:lit?"#FFD700":"rgba(255,255,255,0.7)" }}>{i+1}</span>
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {done && (
            <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8, marginTop:32, textAlign:"center", maxWidth:600, padding:"0 24px", fontFamily:"'Dancing Script',cursive", color:"#FFD700", fontSize:"clamp(1.4rem,3vw,2.2rem)" }}>
              {em ? (
                <ET fid="s5_reveal_text" data={d} onChange={oc} editMode={em} style={{ fontFamily:"'Dancing Script',cursive", color:"#FFD700", fontSize:"clamp(1.4rem,3vw,2.2rem)" }} />
              ) : (
                <>
                  {displayReveal}
                  <SVGHeart size={20} fill="#FFD700" />
                </>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 6: WHEEL
// ─────────────────────────────────────────────────────────────────────────────
const WHEEL_SEGS_DEF = [
  { color:"#C0395A", icon:"envelope" }, { color:"#E8A0B0", icon:"rose" },
  { color:"#8B1A3A", icon:"heart" }, { color:"#F2C4CE", icon:"sparkle" },
  { color:"#D4AF37", icon:"music" }, { color:"#FAEBD7", icon:"butterfly" },
  { color:"#9B1A40", icon:"moon" }, { color:"#FFB6C1", icon:"star" },
];

function Slide6Wheel({ d, onBack, onNext, em, oc, ap }: { d:Record<string,string>; onBack:()=>void; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void; ap?:boolean }) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<number|null>(null);
  const [spinCount, setSpinCount] = useState(ap ? 3 : 0);
  const [spinning, setSpinning] = useState(false);
  const rotation = useRef(0);
  const segAngle = 360 / 8;

  const spin = () => {
    if (spinning || !wheelRef.current) return;
    setResult(null); setSpinning(true);
    const turns = 720 + Math.random()*360 + Math.floor(Math.random()*360);
    rotation.current += turns;
    gsap.to(wheelRef.current, {
      rotation: rotation.current, duration:3.6, ease:"power4.out",
      onComplete: () => {
        const final = ((rotation.current%360)+360)%360;
        const landing = (360-final+90+segAngle/2)%360;
        const idx = Math.floor(landing/segAngle)%8;
        setResult(idx); setSpinCount(c=>c+1); setSpinning(false);
      }
    });
  };

  const segs = WHEEL_SEGS_DEF.map((s,i) => ({ ...s, text: d[`s6_seg${i+1}`] || "" }));
  const radius=160; const cx=170; const cy=170;

  return (
    <SlideShell onBack={onBack} onNext={spinCount>=3||em ? onNext : undefined} showNext={spinCount>=3||em} background="linear-gradient(135deg,#2D0A15 0%,#8B1A3A 100%)" isEditMode={em}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {[{l:"10%",t:"20%",sz:200,c:"rgba(255,150,180,0.15)"},{l:"80%",t:"30%",sz:280,c:"rgba(212,175,55,0.12)"},{l:"30%",t:"80%",sz:240,c:"rgba(255,100,140,0.18)"},{l:"70%",t:"75%",sz:180,c:"rgba(255,200,210,0.12)"}].map((b,i) => (
          <div key={i} style={{ position:"absolute", left:b.l, top:b.t, width:b.sz, height:b.sz, borderRadius:"50%", background:`radial-gradient(circle,${b.c},transparent 70%)`, filter:"blur(20px)" }} />
        ))}
      </div>
      <div style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
        <h2 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, textAlign:"center", fontFamily:"'Cormorant Garamond',serif", color:"#fdf6e3", fontSize:"clamp(1.8rem,4vw,2.6rem)" }}>
          Spin to discover something beautiful <SVGRose size={28} style={{ color: "#FFD700" }} />
        </h2>

        {em && (
          <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(212,175,55,0.3)", borderRadius:16, padding:16, marginTop:16, width:"100%", maxWidth:400 }}>
            <p style={{ color:"#D4AF37", fontSize:13, marginBottom:12, textAlign:"center" }}>✏️ Edit Wheel Messages</p>
            {segs.map((_,i) => (
              <ET key={i} fid={`s6_seg${i+1}`} data={d} onChange={oc} editMode={em}
                style={{ fontSize:13, color:"#fdf6e3", marginBottom:4 }} />
            ))}
          </div>
        )}

        <div style={{ position:"relative", marginTop:20, width:"min(340px, 80vw)", height:"min(340px, 80vw)" }}>
          <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", top:-8, zIndex:20, width:0, height:0, borderLeft:"16px solid transparent", borderRight:"16px solid transparent", borderTop:"30px solid #FFD700", filter:"drop-shadow(0 4px 6px rgba(0,0,0,0.5))" }} />
          <div ref={wheelRef} style={{ position:"absolute", inset:0 }}>
            <svg viewBox="0 0 340 340" style={{ width:"100%", height:"100%" }}>
              <circle cx={cx} cy={cy} r={radius+6} fill="#D4AF37" />
              <circle cx={cx} cy={cy} r={radius+2} fill="#1a0a14" />
              {segs.map((seg,i) => {
                const a1=(i*segAngle-90)*(Math.PI/180); const a2=((i+1)*segAngle-90)*(Math.PI/180);
                const x1=cx+radius*Math.cos(a1); const y1=cy+radius*Math.sin(a1);
                const x2=cx+radius*Math.cos(a2); const y2=cy+radius*Math.sin(a2);
                const la=(i*segAngle+segAngle/2-90)*(Math.PI/180);
                const lx=cx+radius*0.65*Math.cos(la); const ly=cy+radius*0.65*Math.sin(la);
                return (<g key={i}>
                  <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`} fill={seg.color} stroke="#D4AF37" strokeWidth="1" />
                  {renderWheelIcon(seg.icon, lx, ly, i * segAngle + segAngle / 2 - 90)}
                </g>);
              })}
              <circle cx={cx} cy={cy} r={26} fill="#D4AF37" stroke="#1a0a14" strokeWidth="3" />
              <text x={cx} y={cy+2} textAnchor="middle" dominantBaseline="middle" fontSize="22" fill="#1a0a14">♡</text>
            </svg>
          </div>
        </div>

        <button onClick={spin} disabled={spinning}
          style={{ display: "flex", alignItems: "center", gap: 8, marginTop:24, borderRadius:9999, background:"linear-gradient(to right,#FF69B4,#C0395A)", padding:"12px 32px", color:"#fff", fontWeight:600, boxShadow:"0 10px 30px rgba(255,105,180,0.4)", border:"none", cursor:spinning?"not-allowed":"pointer", opacity:spinning?0.6:1, fontSize:15 }}>
          {spinning ? "Spinning..." : (
            <>
              Spin the wheel! <SVGSparkle size={18} />
            </>
          )}
        </button>

        <AnimatePresence mode="wait">
          {result !== null && (
            <motion.div key={`${result}-${spinCount}`} initial={{ opacity:0, y:30, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-20 }} transition={{ type:"spring", stiffness:120, damping:14 }}
              style={{ marginTop:24, display:"flex", alignItems:"center", gap:12, maxWidth:440 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/templates/lovers-enchanted-journey/bear8.gif" alt="bear" style={{ width: 55, height: 55, objectFit: "contain", flexShrink: 0 }} />
              <div style={{ background:"#fdf6e3", border:"2px solid #D4AF37", borderRadius:20, padding:"16px 24px", textAlign:"center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                  {renderResultIcon(segs[result].icon)}
                </div>
                <div style={{ marginTop:4, fontFamily:"'Dancing Script',cursive", color:"#C0395A", fontSize:"1.8rem", lineHeight:1.15 }}>
                  &ldquo;{segs[result].text}&rdquo;
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/templates/lovers-enchanted-journey/bear8.gif" alt="bear" style={{ width: 55, height: 55, objectFit: "contain", flexShrink: 0 }} />
            </motion.div>
          )}
        </AnimatePresence>
        {spinCount>0 && spinCount<3 && <p style={{ marginTop:12, fontSize:14, color:"rgba(253,246,227,0.7)" }}>Spin {spinCount}/3 — keep going for more ♡</p>}
      </div>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 7: BOTTLE
// ─────────────────────────────────────────────────────────────────────────────
function BottleSVG({ corkOff }: { corkOff: boolean }) {
  return (
    <svg viewBox="0 0 200 360" style={{ width:"100%", height:"100%" }}>
      <defs>
        <linearGradient id="lej-glass" x1="0" x2="1">
          <stop offset="0" stopColor="rgba(120,200,150,0.4)" />
          <stop offset="0.5" stopColor="rgba(180,230,200,0.55)" />
          <stop offset="1" stopColor="rgba(80,150,110,0.4)" />
        </linearGradient>
      </defs>
      {!corkOff && <rect x="86" y="20" width="28" height="26" rx="4" fill="#7a4a2a" />}
      <rect x="80" y="44" width="40" height="50" fill="url(#lej-glass)" stroke="#3a6b4a" strokeWidth="1.5" />
      <path d="M 60 94 Q 30 110 30 160 L 30 320 Q 30 350 60 350 L 140 350 Q 170 350 170 320 L 170 160 Q 170 110 140 94 Z" fill="url(#lej-glass)" stroke="#3a6b4a" strokeWidth="2" />
      <path d="M 50 130 Q 45 200 50 320" stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="76" y="180" width="48" height="140" rx="6" fill="#fdf6e3" opacity="0.9" />
      <line x1="76" y1="200" x2="124" y2="200" stroke="#c4a06a" strokeWidth="1" />
      <line x1="76" y1="240" x2="124" y2="240" stroke="#c4a06a" strokeWidth="1" />
      <line x1="76" y1="280" x2="124" y2="280" stroke="#c4a06a" strokeWidth="1" />
    </svg>
  );
}

function Slide7Bottle({ d, onBack, onNext, em, oc, ap }: { d:Record<string,string>; onBack:()=>void; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void; ap?:boolean }) {
  const [shake, setShake] = useState(em||ap ? 100 : 0);
  const [opened, setOpened] = useState(em||ap||false);
  const lastX = useRef(0);
  const lastDir = useRef(0);

  useEffect(() => { if (em||ap) setOpened(true); }, [em, ap]);

  const doShake = (dx:number) => {
    if (opened) return;
    const dir = Math.sign(dx);
    if (dir!==0 && dir!==lastDir.current) {
      lastDir.current = dir;
      setShake(s => {
        const ns = Math.min(100, s+6);
        if (ns>=100 && !opened) {
          setOpened(true);
          setTimeout(() => confetti({ particleCount:100, spread:70, origin:{y:0.5}, colors:["#FFD700","#fdf6e3","#FFB347"] }), 500);
        }
        return ns;
      });
    }
  };

  const tapShake = () => {
    if (opened) return;
    setShake(s => {
      const ns = Math.min(100,s+12);
      if (ns>=100) { setOpened(true); setTimeout(()=>confetti({ particleCount:100, spread:70, origin:{y:0.5}, colors:["#FFD700","#fdf6e3","#FFB347"] }),500); }
      return ns;
    });
  };

  const wobble = (shake/100)*8;

  return (
    <SlideShell onBack={onBack} onNext={opened||em ? onNext : undefined} showNext={opened||em} isEditMode={em}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,#1A1A2E 0%,#1A1A2E 50%,#1A6FA8 50%,#0A3D62 100%)" }} />
      <div style={{ position:"absolute", right:"12%", top:"10%", width:80, height:80, borderRadius:"50%", background:"radial-gradient(circle,#fef3c7 30%,#fcd34d 70%)", boxShadow:"0 0 60px rgba(252,211,77,0.4)" }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {Array.from({ length:50 }).map((_,i) => <span key={i} className="lej-star" style={{ position:"absolute", top:`${Math.random()*45}%`, left:`${Math.random()*100}%`, width:Math.random()*2+0.5, height:Math.random()*2+0.5, borderRadius:"50%", background:"#fff", opacity:Math.random()*0.8, animationDelay:`${Math.random()*3}s`, display:"block" }} />)}
      </div>
      <div style={{ position:"absolute", left:"-10%", right:"-10%", bottom:0, top:"50%" }}>
        {[0,1,2].map(i => <div key={i} className="lej-wave" style={{ position:"absolute", left:0, right:0, top:i*30, height:60, background:`rgba(255,255,255,${0.04+i*0.02})`, animationDelay:`${i*0.6}s` }} />)}
      </div>

      <div style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Cormorant Garamond',serif", color:"#fdf6e3", fontSize:"clamp(1.6rem,3.5vw,2.4rem)", fontStyle:"italic" }}>A bottle drifted ashore...</h2>
        <p style={{ marginTop:8, fontSize:14, color:"rgba(253,246,227,0.7)" }}>
          {opened ? "Read the message ♡" : "Drag the bottle or tap rapidly to shake it"}
        </p>

        {/* Bottle */}
        <div style={{ position:"relative", marginTop:48, width:200, height:360, touchAction:"none", cursor:"grab" }}
          onPointerDown={e => { lastX.current=e.clientX; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); tapShake(); }}
          onPointerMove={e => { const dx=e.clientX-lastX.current; lastX.current=e.clientX; doShake(dx); }}
        >
          <AnimatePresence>
            {!opened && (
              <motion.div className="lej-bob" style={{ position:"absolute", inset:0 }}>
                <motion.div animate={{ rotate:[-wobble,wobble,-wobble] }} transition={{ duration:0.18, repeat:Infinity }}>
                  <BottleSVG corkOff={false} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {opened && (
            <>
              <motion.div initial={{ y:0, opacity:1 }} animate={{ y:-200, opacity:0 }} transition={{ duration:0.5 }}
                style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", top:22, width:28, height:22, background:"#7a4a2a", borderRadius:4 }} />
              <div style={{ position:"absolute", inset:0, opacity:0.6 }}><BottleSVG corkOff={true} /></div>
            </>
          )}
        </div>

        {!opened && (
          <div style={{ marginTop:24, width:256, height:8, borderRadius:9999, background:"rgba(255,255,255,0.15)", overflow:"hidden" }}>
            <motion.div animate={{ width:`${shake}%` }} style={{ height:"100%", background:"linear-gradient(90deg,#FF69B4,#FFD700)", borderRadius:9999 }} />
          </div>
        )}

        <AnimatePresence>
          {opened && (
            <motion.div initial={{ scaleY:0, opacity:0, y:-20 }} animate={{ scaleY:1, opacity:1, y:0 }} transition={{ delay:0.6, duration:0.6, type:"spring", stiffness:90, damping:14 }}
              style={{ transformOrigin:"top center", width:340, maxWidth:"92vw", background:"linear-gradient(180deg,#fdf6e3,#f5e6c8)", backgroundImage:`repeating-linear-gradient(180deg,transparent,transparent 28px,rgba(180,140,90,0.25) 28px,rgba(180,140,90,0.25) 29px),linear-gradient(180deg,#fdf6e3,#f5e6c8)`, borderRadius:8, boxShadow:"0 30px 80px rgba(0,0,0,0.5)", padding:"32px 28px", marginTop:-160, position:"relative", zIndex:5 }}
            >
              <h3 style={{ textAlign:"center", fontFamily:"'Dancing Script',cursive", color:"#C0395A", fontSize:"1.8rem" }}>A note from across the ocean...</h3>
              <ET fid="s7_letter_body" data={d} onChange={oc} editMode={em} multiline style={{ marginTop:16, textAlign:"center", fontFamily:"'Lora',serif", color:"#3a2418", fontSize:"1rem", fontStyle:"italic", lineHeight:1.7 }} />
              <div style={{ marginTop:12, textAlign:"right" }}>
                <ET fid="s7_sign" data={d} onChange={oc} editMode={em} style={{ fontFamily:"'Caveat',cursive", color:"#C0395A", fontSize:"1.7rem", fontWeight:700 }} />
              </div>
              <div style={{ position:"absolute", right:-20, bottom:-20 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/templates/lovers-enchanted-journey/bear2.gif" alt="bear" style={{ width: 75, height: 75, objectFit: "contain" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 8: GARDEN
// ─────────────────────────────────────────────────────────────────────────────
const ROSE_COLORS: [string,string][] = [
  ["#8B1A1A","#C0395A"],["#C0395A","#FF69B4"],["#FF1744","#FF69B4"],["#D4145A","#FFB6C1"],
  ["#9B1A40","#E8A0B0"],["#FF4081","#FFC1D1"],["#B71C50","#F472B6"],["#7B1842","#EC4899"],
];

function GardenRose({ colors }: { colors:[string,string] }) {
  return (
    <div style={{ position:"absolute", left:"50%", bottom:58, transform:"translateX(-50%)", width:80, height:130, pointerEvents:"none" }}>
      <motion.div initial={{ height:0 }} animate={{ height:95 }} transition={{ duration:0.4 }} style={{ position:"absolute", left:"50%", bottom:0, transform:"translateX(-50%)", width:4, borderRadius:2, background:"linear-gradient(180deg,#3f7a3a,#2d5a28)" }} />
      <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ duration:0.3, delay:0.4 }} style={{ position:"absolute", left:"50%", bottom:40, width:18, height:10, background:"#3f7a3a", borderRadius:"0 50% 50% 50%", transform:"translateX(-110%) rotate(-30deg)" }} />
      <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ duration:0.3, delay:0.5 }} style={{ position:"absolute", left:"50%", bottom:55, width:18, height:10, background:"#3f7a3a", borderRadius:"50% 0 50% 50%", transform:"translateX(10%) rotate(30deg)" }} />
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ duration:0.5, delay:0.7, type:"spring", stiffness:180 }} style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", top:-15, width:50, height:50 }}>
        {[0,45,90,135,180,225,270,315].map((deg,i) => (
          <motion.div key={i} initial={{ scale:0, rotate:deg }} animate={{ scale:1, rotate:deg }} transition={{ duration:0.3, delay:0.85+i*0.05 }}
            style={{ position:"absolute", left:"50%", top:"50%", width:18, height:22, background:`radial-gradient(circle at 60% 40%,${colors[1]},${colors[0]})`, borderRadius:"50% 50% 50% 0", x: "-50%", y: "-100%", transformOrigin:"50% 100%" }} />
        ))}
        <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:12, height:12, borderRadius:"50%", background:"#fbbf24" }} />
      </motion.div>
    </div>
  );
}

function GardenPot({ index, bloomed, onClick, reason }: { index:number; bloomed:boolean; onClick:()=>void; reason:string }) {
  const [showCard, setShowCard] = useState(false);
  const handle = () => { if(bloomed) return; onClick(); setShowCard(true); setTimeout(()=>setShowCard(false),3000); };
  return (
    <div className="lej-garden-pot">
      <div className="lej-garden-pot-inner" style={{ position:"relative", width:"100%", height:"100%" }}>
        {bloomed && <GardenRose colors={ROSE_COLORS[index]} />}
        <button onClick={handle} disabled={bloomed} style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:76, height:64, cursor:bloomed?"default":"pointer", background:"none", border:"none" }}>
          <div style={{ position:"absolute", left:0, right:0, bottom:0, height:60, background:"linear-gradient(180deg,#D4845A,#A85A30)", clipPath:"polygon(8% 100%,92% 100%,100% 0,0 0)" }} />
          <div style={{ position:"absolute", left:-4, right:-4, top:0, height:12, background:"linear-gradient(180deg,#E89060,#B86838)", borderRadius:2 }} />
          <div style={{ position:"absolute", left:4, right:4, top:8, height:8, background:"#3a1f10", borderRadius:2 }} />
          <div style={{ position:"absolute", left:"50%", top:28, transform:"translateX(-50%)", fontSize:10, color:"rgba(253,246,227,0.8)" }}>{index+1}</div>
        </button>
      </div>
      <AnimatePresence>
        {showCard && bloomed && (
          <motion.div
            initial={{ opacity:0, y:10, scale:0.9 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-10 }}
            className="lej-garden-tooltip"
          >
            <div style={{ color:"#f472b6", display: "flex", justifyContent: "center", marginBottom: 2 }}>
              <SVGHeart size={14} fill="#f472b6" />
            </div>
            <div style={{ fontFamily:"'Dancing Script',cursive", color:"#C0395A", fontSize:"1.2rem", lineHeight:1.15, fontWeight:700 }}>{reason}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Slide8Garden({ d, onBack, onNext, em, oc, ap }: { d:Record<string,string>; onBack:()=>void; onNext:()=>void; em:boolean; oc?:(id:string,v:string)=>void; ap?:boolean }) {
  const [bloomed, setBloomed] = useState<Set<number>>(em||ap ? new Set([0,1,2,3,4,5,6,7]) : new Set());
  const allBloomed = bloomed.size===8;

  useEffect(() => { if(em||ap) setBloomed(new Set([0,1,2,3,4,5,6,7])); }, [em, ap]);

  const reasons = Array.from({length:8},(_,i)=>d[`s8_reason${i+1}`]||"");

  const rawTitle = d.s8_title || "Grow our garden of love";
  const displayTitle = rawTitle.replace(/🌹/g, "").trim();

  return (
    <SlideShell onBack={onBack} onNext={allBloomed||em ? onNext : undefined} nextLabel="Final chapter... →" showNext={allBloomed||em} background="linear-gradient(180deg,#1A0A2E 0%,#2D1B4E 40%,#3D5A2A 100%)" isEditMode={em}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {Array.from({length:60}).map((_,i) => <span key={i} className="lej-star" style={{ position:"absolute", top:`${Math.random()*50}%`, left:`${Math.random()*100}%`, width:Math.random()*2+0.5, height:Math.random()*2+0.5, borderRadius:"50%", background:"#fff", opacity:Math.random()*0.7, animationDelay:`${Math.random()*3}s`, display:"block" }} />)}
      </div>
      {allBloomed && Array.from({length:14}).map((_,i) => (
        <motion.div key={i} style={{ position:"absolute", left:`${10+Math.random()*80}%`, bottom:`${15+Math.random()*30}%`, width:6, height:6, borderRadius:"50%", background:"#fef9c3", boxShadow:"0 0 12px #fbbf24,0 0 24px rgba(251,191,36,0.6)" }}
          animate={{ y:[0,-40,0], x:[0,30,0], opacity:[0.3,1,0.3] }}
          transition={{ duration:4+Math.random()*3, repeat:Infinity, delay:Math.random()*2 }} />
      ))}

      <div style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>
        <h2 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, textAlign:"center", fontFamily:"'Cormorant Garamond',serif", color:"#FFD700", fontSize:"clamp(1.8rem,4vw,2.6rem)" }}>
          {em ? (
            <ET fid="s8_title" data={d} onChange={oc} editMode={em} style={{ fontFamily:"'Cormorant Garamond',serif", color:"#FFD700", fontSize:"clamp(1.8rem,4vw,2.6rem)" }} />
          ) : (
            <>
              {displayTitle}
              <SVGRose size={28} style={{ color: "#FFD700" }} />
            </>
          )}
        </h2>
        <p style={{ marginTop:8, fontSize:14, color:"rgba(253,246,227,0.75)" }}>Click each pot to plant a rose</p>

        {em && (
          <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(212,175,55,0.3)", borderRadius:16, padding:16, marginTop:16, width:"100%", maxWidth:400 }}>
            <p style={{ color:"#D4AF37", fontSize:13, marginBottom:12, textAlign:"center" }}>✏️ Edit Reasons</p>
            {Array.from({length:8},(_,i) => (
              <ET key={i} fid={`s8_reason${i+1}`} data={d} onChange={oc} editMode={em} style={{ fontSize:13, color:"#fdf6e3", marginBottom:4 }} />
            ))}
          </div>
        )}

        <AnimatePresence>
          {allBloomed && (
            <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
              style={{ marginTop:24, textAlign:"center", maxWidth:600, padding:"0 16px", fontFamily:"'Dancing Script',cursive", color:"#FFD700", fontSize:"clamp(1.6rem,3.5vw,2.6rem)", fontWeight:700 }}>
              This garden will always bloom for you. ♡
            </motion.p>
          )}
        </AnimatePresence>

        <div style={{ marginTop: "40px", width: "100%", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 12, borderRadius: 4, background: "linear-gradient(180deg,#4a6b2a,#2d4818)", zIndex: 1 }} />
          <div className="lej-garden-pots-wrapper" style={{ position: "relative", zIndex: 2 }}>
            {Array.from({length:8},(_,i) => (
              <motion.div key={i} animate={bloomed.has(i)&&allBloomed ? {rotate:[-2,2,-2]} : {}} transition={{ duration:3, repeat:Infinity, ease:"easeInOut", delay:i*0.2 }} style={{ display: "flex", justifyContent: "center" }}>
                <GardenPot index={i} bloomed={bloomed.has(i)} onClick={()=>setBloomed(s=>new Set(s).add(i))} reason={reasons[i]} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 9: FINALE
// ─────────────────────────────────────────────────────────────────────────────
interface FWParticle { x:number;y:number;vx:number;vy:number;life:number;maxLife:number;color:string;size:number; }
interface FWRocket { x:number;y:number;targetY:number;vx:number;vy:number;color:string;exploded:boolean; }
const FW_COLORS=["#FFD700","#FF6B6B","#FF69B4","#fdf6e3","#9B59B6","#FF8C00"];

function Fireworks({ flash }: { flash:boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const particles = useRef<FWParticle[]>([]);
  const rockets = useRef<FWRocket[]>([]);
  const lastSpawn = useRef(0);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf=0; let running=true;
    const resize = () => { const dpr=window.devicePixelRatio||1; canvas.width=window.innerWidth*dpr; canvas.height=window.innerHeight*dpr; ctx.scale(dpr,dpr); };
    resize(); window.addEventListener("resize",resize);
    const explode=(x:number,y:number,color:string)=>{
      for(let i=0;i<70;i++){const angle=(Math.PI*2*i)/70;const speed=Math.random()*4+2;particles.current.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:0,maxLife:60+Math.random()*30,color:Math.random()>0.7?FW_COLORS[Math.floor(Math.random()*FW_COLORS.length)]:color,size:Math.random()*2+1.5});}
    };
    const loop=(t:number)=>{
      if(!running)return;
      ctx.fillStyle="rgba(5,10,24,0.18)";ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
      if(t-lastSpawn.current>900+Math.random()*800){lastSpawn.current=t;const x=window.innerWidth*(0.15+Math.random()*0.7);const ty=window.innerHeight*(0.15+Math.random()*0.3);rockets.current.push({x,y:window.innerHeight,targetY:ty,vx:0,vy:-8-Math.random()*3,color:FW_COLORS[Math.floor(Math.random()*FW_COLORS.length)],exploded:false});}
      rockets.current=rockets.current.filter(r=>{r.x+=r.vx;r.y+=r.vy;ctx.beginPath();ctx.arc(r.x,r.y,2,0,Math.PI*2);ctx.fillStyle=r.color;ctx.shadowBlur=12;ctx.shadowColor=r.color;ctx.fill();ctx.shadowBlur=0;if(r.y<=r.targetY){explode(r.x,r.y,r.color);return false;}return true;});
      particles.current=particles.current.filter(p=>{p.life++;p.x+=p.vx;p.y+=p.vy;p.vy+=0.05;p.vx*=0.99;p.vy*=0.99;const alpha=1-p.life/p.maxLife;if(alpha<=0)return false;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fillStyle=p.color;ctx.globalAlpha=alpha;ctx.shadowBlur=8;ctx.shadowColor=p.color;ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=0;return true;});
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>{running=false;cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  }, []);

  useEffect(()=>{
    if(!flash)return;
    for(let i=0;i<6;i++) setTimeout(()=>{const x=window.innerWidth*(0.1+Math.random()*0.8);rockets.current.push({x,y:window.innerHeight,targetY:window.innerHeight*0.25,vx:0,vy:-10,color:FW_COLORS[i%FW_COLORS.length],exploded:false});},i*100);
  },[flash]);

  return <canvas ref={ref} style={{ position:"absolute", inset:0, pointerEvents:"none" }} />;
}

function Slide9Finale({ d, onBack, onReset, em, oc }: { d:Record<string,string>; onBack:()=>void; onReset:()=>void; em:boolean; oc?:(id:string,v:string)=>void }) {
  const [sealed, setSealed] = useState(false);
  const [flash, setFlash] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const viewerName = (d.s9_viewer_name || d.beloved_name || "MY LOVE").toUpperCase();
  const dateText = getFormattedDate();

  const fireConfetti = () => {
    const opts:confetti.Options={ particleCount:60, spread:80, ticks:200, colors:["#FFD700","#FF69B4","#fdf6e3","#FF6B6B","#C0395A"], shapes:["circle"] as never };
    confetti({ ...opts, origin:{x:0.1,y:0.6}, angle:60 });
    confetti({ ...opts, origin:{x:0.9,y:0.6}, angle:120 });
    confetti({ ...opts, origin:{x:0.5,y:0.5}, spread:360 });
  };

  const seal = () => { setSealed(true); setFlash(true); fireConfetti(); setTimeout(()=>setFlash(false),1500); };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setShareLoading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#050A18",
        onclone: (_doc, el) => {
          // Strip backdrop-filter to prevent blank canvas on Safari/Firefox
          el.style.setProperty("backdrop-filter", "none", "important");
          el.style.setProperty("-webkit-backdrop-filter", "none", "important");
          el.style.setProperty("background-color", "#14081E", "important");
          el.querySelectorAll<HTMLElement>("*").forEach(child => {
            child.style.backdropFilter = "none";
            (child.style as unknown as Record<string,string>)["-webkit-backdrop-filter"] = "none";
          });
        },
        ignoreElements: (el) => el.tagName === "BUTTON",
      });
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("no blob");
      const fd = new FormData();
      fd.append("image", blob, "lovers-enchanted-proof.png");
      const res = await fetch(`https://api.imgbb.com/1/upload?key=83e3f88941efd1059a89f016ff302d9e`, { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) { setShareUrl(json.data.url); setShowShareModal(true); }
    } catch { /* ignore */ }
    setShareLoading(false);
  };

  return (
    <SlideShell onBack={onBack} showNext={false} isEditMode={em}>
      <div style={{ position:"absolute", inset:0, background:"#050A18" }} />
      <Fireworks flash={flash} />
      {/* Diwali strings */}
      <div style={{ position:"absolute", left:0, right:0, top:0, pointerEvents:"none" }}>
        {[60,90,120,150,180].map((y,k) => (
          <div key={k} style={{ position:"absolute", left:0, right:0 }}>
            {Array.from({length:14}).map((_,i) => {
              const t=(i+0.5)/14; const x=t*100; const yPos=y+4*t*(1-t)*50;
              return <motion.span key={i} className="lej-bulb" animate={flash?{scale:[1,1.6,1,1.6,1]}:{opacity:[1,0.85,1]}} transition={flash?{duration:1}:{duration:0.15,repeat:Infinity,repeatType:"reverse"}}
                style={{ position:"absolute", left:`${x}%`, top:yPos, color:BULB_COLORS[i%BULB_COLORS.length], background:BULB_COLORS[i%BULB_COLORS.length], transform:"translate(-50%,-50%)" }} />;
            })}
          </div>
        ))}
      </div>

      <div style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 16px 48px", textAlign:"center" }}>

        {/* Glassmorphic hero card */}
        <motion.div
          ref={cardRef}
          id="lej-finale-card"
          initial={{ opacity:0, y:30, scale:0.95 }}
          animate={{ opacity:1, y:0, scale:1 }}
          transition={{ delay:0.2, type:"spring", stiffness:80, damping:16 }}
          style={{
            position:"relative",
            maxWidth:520,
            width:"100%",
            background:"linear-gradient(135deg,rgba(20,8,32,0.82),rgba(60,12,28,0.76))",
            backdropFilter:"blur(24px)",
            WebkitBackdropFilter:"blur(24px)",
            border:"1px solid rgba(212,175,55,0.35)",
            borderRadius:28,
            boxShadow:"0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 60px rgba(212,175,55,0.08)",
            padding:"clamp(24px, 6vw, 40px) clamp(16px, 5vw, 36px)",
          }}
        >
          {/* Gold shimmer top bar */}
          <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:2, borderRadius:1, background:"linear-gradient(90deg,transparent,#FFD700,transparent)" }} />

          <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}
            style={{ fontSize:11, letterSpacing:"0.45em", fontWeight:700, color:"#D4AF37", fontFamily:"'Outfit', sans-serif", marginBottom:20 }}>
            ✦ ALWAYS &amp; FOREVER ✦
          </motion.div>

          <motion.h1 initial={{ opacity:0,y:15 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.5 }} className="lej-glow"
            style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontWeight:700, fontSize:"clamp(2rem,6vw,3.6rem)", color:"#fdf6e3", lineHeight:1.05, marginBottom:20, textShadow:"0 2px 20px rgba(212,175,55,0.3)" }}>
            <ET fid="s9_title" data={d} onChange={oc} editMode={em} style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontWeight:700, fontSize:"clamp(2rem,6vw,3.6rem)", color:"#fdf6e3" }} />
          </motion.h1>

          {/* Divider line */}
          <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ delay:0.7, duration:0.6 }}
            style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.5),transparent)", marginBottom:20 }} />

          <motion.div initial={{ opacity:0,y:15 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.9 }}
            style={{ marginBottom:20 }}>
            <ET fid="s9_body" data={d} onChange={oc} editMode={em} multiline
              style={{ fontFamily:"'Lora',serif", fontStyle:"italic", color:"rgba(253,246,227,0.9)", fontSize:"1.05rem", lineHeight:1.9 }} />
          </motion.div>

          <motion.div initial={{ opacity:0,y:15 }} animate={{ opacity:1,y:0 }} transition={{ delay:1.3 }}>
            <ET fid="s9_sign" data={d} onChange={oc} editMode={em}
              style={{ fontFamily:"'Dancing Script',cursive", color:"#FFD700", fontSize:"2.2rem", fontWeight:700, textShadow:"0 2px 12px rgba(212,175,55,0.4)" }} />
          </motion.div>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}
            style={{ marginTop:6, fontSize:11, letterSpacing:"0.25em", fontWeight:600, color:"rgba(212,175,55,0.45)", fontFamily:"'Outfit', sans-serif" }}>
            ARADHYA E-GIFTS
          </motion.div>

          {/* Gold shimmer bottom bar */}
          <div style={{ position:"absolute", bottom:0, left:"30%", right:"30%", height:1, borderRadius:1, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.4),transparent)" }} />
        </motion.div>

        {/* Buttons row */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:1.6 }}
          style={{ marginTop:28, display:"flex", flexWrap:"wrap", justifyContent:"center", gap:14 }}>
          {!sealed && !em && (
            <button onClick={seal}
              style={{ display:"flex", alignItems:"center", gap:8, borderRadius:9999, padding:"12px 32px", fontWeight:700, color:"#3D0C1A", boxShadow:"0 10px 40px rgba(212,175,55,0.5)", background:"linear-gradient(135deg,#FFD700,#FFB347)", border:"2px solid rgba(255,255,255,0.4)", cursor:"pointer", fontSize:15, letterSpacing:"0.02em" }}>
              Seal It With Love <SVGHeart size={18} fill="#3D0C1A" />
            </button>
          )}
          <button onClick={handleShare} disabled={shareLoading}
            style={{ display:"flex", alignItems:"center", gap:8, borderRadius:9999, background:"linear-gradient(135deg,#C0395A,#8B1A3A)", padding:"12px 24px", color:"#fdf6e3", cursor:shareLoading?"wait":"pointer", fontSize:14, fontWeight:700, boxShadow:"0 8px 24px rgba(192,57,90,0.4)", border:"1px solid rgba(255,255,255,0.15)", opacity: shareLoading ? 0.7 : 1 }}>
            {shareLoading ? "Capturing…" : <><SVGSparkle size={14} /> Share Proof ✦</>}
          </button>
          <button onClick={onReset}
            style={{ display:"flex", alignItems:"center", gap:6, borderRadius:9999, border:"1px solid rgba(212,175,55,0.4)", background:"rgba(212,175,55,0.08)", backdropFilter:"blur(8px)", padding:"12px 24px", color:"#FFD700", cursor:"pointer", fontSize:14, fontWeight:600 }}>
            Live it again <SVGSparkle size={14} style={{ color:"#FFD700" }} />
          </button>
        </motion.div>

        {/* Bear GIF – bear10 + floating hearts */}
        <motion.div animate={sealed?{y:[0,-20,0]}:{}} transition={{ duration:0.6 }}
          style={{ marginTop:28, position:"relative", display:"flex", justifyContent:"center" }}>
          <div style={{ position:"absolute", left:-80, right:-80, top:-40, bottom:-40, background:"radial-gradient(ellipse,rgba(255,215,100,0.2),transparent 70%)" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/templates/lovers-enchanted-journey/bear10.gif" alt="bear" style={{ width: 110, height: 110, objectFit: "contain", position: "relative", zIndex: 1 }} />
          {[0,1,2].map(i => (
            <motion.div key={i} style={{ position:"absolute", left:"50%", bottom:40, color:"#FF69B4", pointerEvents:"none", zIndex: 2 }}
              animate={{ y:[0,-100], opacity:[1,0], x:[(i-1)*30,(i-1)*60] }}
              transition={{ duration:3, repeat:Infinity, delay:i*0.7 }}>
              <SVGHeart size={20} fill="#FF69B4" />
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence>
          {sealed && (
            <motion.div initial={{ scale:0, rotate:-30 }} animate={{ scale:[0,1.2,1], rotate:0 }} transition={{ type:"spring", stiffness:180, damping:12 }}
              style={{ position:"fixed", left:"50%", top:"50%", transform:"translate(-50%,-50%)", zIndex:40, pointerEvents:"none" }}>
              <CircularWaxStamp viewerName={viewerName} dateText={dateText} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Share Proof Modal ── */}
        <AnimatePresence>
          {showShareModal && shareUrl && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setShowShareModal(false)}
              style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.88)", backdropFilter:"blur(10px)", padding:24 }}>
              <motion.div initial={{ scale:0.88, y:24 }} animate={{ scale:1, y:0 }} exit={{ scale:0.88, opacity:0 }}
                onClick={e => e.stopPropagation()}
                style={{ width:"min(460px,92vw)", background:"linear-gradient(135deg,rgba(14,4,26,0.97),rgba(52,8,24,0.97))", border:"1px solid rgba(212,175,55,0.45)", borderRadius:24, padding:28, textAlign:"center", boxShadow:"0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:2, borderRadius:1, background:"linear-gradient(90deg,transparent,#FFD700,transparent)" }} />
                <div style={{ fontSize:10, letterSpacing:"0.45em", fontWeight:700, color:"#D4AF37", fontFamily:"'Outfit',sans-serif", marginBottom:14 }}>✦ SEEN PROOF ✦</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shareUrl} alt="Proof" style={{ width:"100%", maxHeight:200, objectFit:"contain", borderRadius:12, border:"1px solid rgba(212,175,55,0.3)", marginBottom:18, display:"block" }} />
                <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={() => { navigator.clipboard?.writeText(shareUrl); }}
                    style={{ display:"flex", alignItems:"center", gap:6, borderRadius:9999, background:"linear-gradient(135deg,#FFD700,#FFB347)", color:"#3D0C1A", fontWeight:700, border:"none", padding:"10px 22px", fontSize:13, cursor:"pointer", boxShadow:"0 6px 20px rgba(212,175,55,0.45)" }}>
                    📋 Copy Link
                  </button>
                  <a href={shareUrl} target="_blank" rel="noreferrer"
                    style={{ display:"flex", alignItems:"center", gap:6, borderRadius:9999, background:"rgba(255,255,255,0.07)", color:"#fdf6e3", fontWeight:600, border:"1px solid rgba(255,255,255,0.15)", padding:"10px 22px", fontSize:13, cursor:"pointer", textDecoration:"none" }}>
                    🔗 Open Image
                  </a>
                  <button onClick={() => setShowShareModal(false)}
                    style={{ display:"flex", alignItems:"center", gap:6, borderRadius:9999, background:"rgba(192,57,90,0.15)", color:"#FF69B4", fontWeight:600, border:"1px solid rgba(192,57,90,0.35)", padding:"10px 22px", fontSize:13, cursor:"pointer" }}>
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SlideShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export interface LoversEnchantedJourneyProps {
  customData?: Record<string, string>;
  editMode?: boolean;
  onFieldChange?: (id: string, val: string) => void;
  forcedSlide?: number;
  autoPlay?: boolean;
}

export default function LoversEnchantedJourney({ customData = {}, editMode = false, onFieldChange, forcedSlide, autoPlay = false }: LoversEnchantedJourneyProps) {
  const defaults: Record<string, string> = {
    s1_light_text: "I lit up the world for you, just like you lit up mine. ✦",
    s2_title: "Our Moments Together",
    s2_p1_caption: "The day everything changed",
    s2_p2_caption: "Always laughing with you",
    s2_p3_caption: "My favourite view",
    s2_p4_caption: "Us, always",
    s2_p5_caption: "Golden hours with you",
    s2_p6_caption: "Forever in my heart",
    s3_song1_title: "Tere Bina", s3_song1_artist: "Arijit Singh", s3_song1_url: "",
    s3_song2_title: "Pehli Nazar Mein", s3_song2_artist: "Atif Aslam", s3_song2_url: "",
    s3_song3_title: "Tu Hi Meri Shab Hai", s3_song3_artist: "Mohit Chauhan", s3_song3_url: "",
    s4_reveal_title: "You are my favourite person",
    s4_reveal_body: "Not just today. Not just on special days.\nEvery single day.",
    s5_title: "Connect the stars to reveal what I see",
    s5_reveal_text: "That's how I see you — a constellation I'll always find",
    s6_seg1: "You deserve every love song ever written",
    s6_seg2: "I choose you. Every single day.",
    s6_seg3: "Being loved by you is my greatest gift",
    s6_seg4: "You make ordinary moments extraordinary",
    s6_seg5: "My heart plays your favourite song on repeat",
    s6_seg6: "You give me butterflies, always",
    s6_seg7: "I think of you in every quiet moment",
    s6_seg8: "You are the best part of my story",
    s7_letter_body: "No matter where life takes us,\nI will always find my way back to you.\nYou are my home, my peace,\nmy favourite place to be.\nWith every wave, I think of you.",
    s7_sign: "— Yours, always",
    s8_title: "Grow our garden of love",
    s8_reason1: "Your laugh", s8_reason2: "The way you care", s8_reason3: "Your kindness",
    s8_reason4: "Being with you", s8_reason5: "Your eyes", s8_reason6: "How you make me feel",
    s8_reason7: "Your strength", s8_reason8: "All of you. Always.",
    s9_title: "YOU ARE MY EVERYTHING",
    s9_body: "From the lights we lit together,\nto every song, every memory, every moment —\nit has all been for you.\nThank you for existing.\nThank you for being mine.",
    s9_sign: "— Yours, in every lifetime",
  };

  const d = useMemo(() => ({ ...defaults, ...customData }), [customData]);
  const [slide, setSlide] = useState(() => forcedSlide ?? 1);

  useEffect(() => { if (forcedSlide !== undefined) setSlide(forcedSlide); }, [forcedSlide]);

  const next = () => setSlide(s => Math.min(9, s + 1));
  const back = () => setSlide(s => Math.max(1, s - 1));
  const reset = () => setSlide(1);

  const em = editMode;
  const oc = onFieldChange;
  const ap = autoPlay;

  const commonProps = { d, em, oc, ap };

  // ── Global Background Audio ────────────────────────────────────────────────
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const [globalMuted, setGlobalMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const onInteract = () => setHasInteracted(true);
    window.addEventListener("click", onInteract, { once: true });
    window.addEventListener("touchstart", onInteract, { once: true });
    return () => {
      window.removeEventListener("click", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
  }, []);

  useEffect(() => {
    if (editMode) return;
    const url = d.bg_song_url;
    if (!url || globalMuted) { bgAudioRef.current?.pause(); return; }
    if (hasInteracted) {
      if (!bgAudioRef.current || bgAudioRef.current.src !== url) {
        bgAudioRef.current?.pause();
        const a = new Audio(url);
        a.loop = true;
        a.volume = 0.45;
        bgAudioRef.current = a;
      }
      bgAudioRef.current.play().catch(() => {});
    }
    return () => { bgAudioRef.current?.pause(); };
  }, [editMode, d.bg_song_url, hasInteracted, globalMuted]);

  return (
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "'Nunito', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* Global SVG Gradients Container */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <defs>
          {/* Luxury Gold Metallic text path gradient */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE57F" />
            <stop offset="45%" stopColor="#FFC107" />
            <stop offset="75%" stopColor="#FF8F00" />
            <stop offset="100%" stopColor="#A66800" />
          </linearGradient>
          {/* Layered Rose Head / Crimson-Pink gradient */}
          <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="50%" stopColor="#E60026" />
            <stop offset="100%" stopColor="#8A0808" />
          </linearGradient>
          {/* Green Stem and Leaf gradient */}
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          {/* Organic wax shading gradients */}
          <radialGradient id="waxGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#DF2020" />
            <stop offset="65%" stopColor="#8A0808" />
            <stop offset="100%" stopColor="#3F0000" />
          </radialGradient>
        </defs>
      </svg>

      {/* Slide number indicator */}
      <div style={{ position: "fixed", top: editMode ? 110 : 20, left: "50%", transform: "translateX(-50%)", zIndex: 50, display: "flex", gap: 6, pointerEvents: "none" }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} style={{ height: 6, borderRadius: 9999, transition: "all 0.3s", background: i + 1 === slide ? "#FFD700" : "rgba(255,255,255,0.25)", width: i + 1 === slide ? 24 : 6, display: "block" }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {slide === 0 && <Slide0BgMusic key="s0" d={d} onNext={next} em={em} oc={oc} />}
        {slide === 1 && <Slide1DarkRoom key="s1" {...commonProps} onNext={next} />}
        {slide === 2 && <Slide2Photos key="s2" {...commonProps} onBack={back} onNext={next} />}
        {slide === 3 && <Slide3Music key="s3" {...commonProps} onBack={back} onNext={next} />}
        {slide === 4 && <Slide4Scratch key="s4" {...commonProps} onBack={back} onNext={next} />}
        {slide === 5 && <Slide5Constellation key="s5" {...commonProps} onBack={back} onNext={next} />}
        {slide === 6 && <Slide6Wheel key="s6" {...commonProps} onBack={back} onNext={next} />}
        {slide === 7 && <Slide7Bottle key="s7" {...commonProps} onBack={back} onNext={next} />}
        {slide === 8 && <Slide8Garden key="s8" {...commonProps} onBack={back} onNext={next} />}
        {slide === 9 && <Slide9Finale key="s9" {...commonProps} onBack={back} onReset={reset} />}
      </AnimatePresence>

      {/* BG Audio mute/unmute button */}
      {!editMode && d.bg_song_url && (
        <button
          onClick={() => setGlobalMuted(m => !m)}
          title={globalMuted ? "Unmute background music" : "Mute background music"}
          style={{ position:"fixed", bottom:24, right:24, zIndex:200, width:46, height:46, borderRadius:"50%", background:"rgba(255,255,255,0.88)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", border:"1px solid rgba(212,175,55,0.25)", boxShadow:"0 8px 24px rgba(0,0,0,0.22)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color: globalMuted ? "#888" : "#C0395A", transition:"all 0.3s" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {globalMuted ? (<><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></>) : (<><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></>)}
          </svg>
        </button>
      )}
    </div>
  );
}
