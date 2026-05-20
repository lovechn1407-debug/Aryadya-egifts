import { FC } from "react";

interface BearProps {
  variant?: "single" | "couple";
  size?: number;
  withHeadphones?: boolean;
  withBouquet?: boolean;
}

const SingleBear: FC<{ bow?: "pink" | "red"; heartBadge?: boolean; withHeadphones?: boolean; withBouquet?: boolean }> = ({ bow, heartBadge, withHeadphones, withBouquet }) => (
  <svg viewBox="0 0 140 170" width="100%" height="100%">
    {/* Ears */}
    <circle cx="35" cy="35" r="22" fill="#8B5E3C" />
    <circle cx="105" cy="35" r="22" fill="#8B5E3C" />
    <circle cx="35" cy="35" r="13" fill="#C4917A" />
    <circle cx="105" cy="35" r="13" fill="#C4917A" />
    {/* Headphones */}
    {withHeadphones && (
      <>
        <path d="M20 45 Q70 -5 120 45" stroke="#2A1A1F" strokeWidth="5" fill="none" />
        <ellipse cx="20" cy="48" rx="9" ry="11" fill="#C0395A" />
        <ellipse cx="120" cy="48" rx="9" ry="11" fill="#C0395A" />
      </>
    )}
    {/* Head */}
    <circle cx="70" cy="60" r="38" fill="#8B5E3C" />
    {/* Cheeks */}
    <circle cx="42" cy="70" r="9" fill="rgba(255,182,193,0.7)" />
    <circle cx="98" cy="70" r="9" fill="rgba(255,182,193,0.7)" />
    {/* Eyes */}
    <circle cx="55" cy="58" r="5" fill="#1A0A0F" />
    <circle cx="85" cy="58" r="5" fill="#1A0A0F" />
    <circle cx="57" cy="56" r="1.6" fill="#fff" />
    <circle cx="87" cy="56" r="1.6" fill="#fff" />
    {/* Nose */}
    <ellipse cx="70" cy="72" rx="5" ry="4" fill="#2A1A1F" />
    {/* Mouth */}
    <path d="M62 80 Q70 87 78 80" stroke="#2A1A1F" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Body */}
    <rect x="30" y="92" width="80" height="70" rx="36" fill="#8B5E3C" />
    <ellipse cx="70" cy="130" rx="28" ry="26" fill="#C4917A" />
    {/* Bow */}
    {bow && (
      <g transform="translate(70 95)">
        <path d="M-12 0 L0 -6 L0 6 Z" fill={bow === "pink" ? "#F2C4CE" : "#C0395A"} />
        <path d="M12 0 L0 -6 L0 6 Z" fill={bow === "pink" ? "#F2C4CE" : "#C0395A"} />
        <circle r="3" fill={bow === "pink" ? "#C0395A" : "#8B1A3A"} />
      </g>
    )}
    {heartBadge && (
      <path d="M70 125 c-5 -8 -18 -3 -18 6 c0 8 18 18 18 18 c0 0 18 -10 18 -18 c0 -9 -13 -14 -18 -6 z" fill="#C0395A" />
    )}
    {withBouquet && (
      <g transform="translate(70 155)">
        <circle cx="-12" cy="-2" r="9" fill="#8B1A3A" />
        <circle cx="0" cy="-8" r="9" fill="#C0395A" />
        <circle cx="12" cy="-2" r="9" fill="#8B1A3A" />
        <path d="M0 0 L-4 14 M0 0 L0 16 M0 0 L4 14" stroke="#2d5a2d" strokeWidth="2" />
      </g>
    )}
  </svg>
);

export const BearCharacter: FC<BearProps> = ({ variant = "single", size = 160, withHeadphones, withBouquet }) => {
  if (variant === "couple") {
    return (
      <div style={{ width: size * 1.6, height: size }} className="relative animate-bob">
        <div className="absolute left-0 top-0" style={{ width: size * 0.9, height: size }}>
          <SingleBear bow="pink" />
        </div>
        <div className="absolute right-0 top-0" style={{ width: size * 0.9, height: size }}>
          <SingleBear heartBadge />
        </div>
        {/* Floating hearts */}
        <svg className="absolute -top-6 left-1/2 -translate-x-1/2" width="60" height="40" viewBox="0 0 60 40">
          <path d="M15 10 c-3 -5 -10 -2 -10 3 c0 5 10 12 10 12 s10 -7 10 -12 c0 -5 -7 -8 -10 -3 z" fill="#C0395A">
            <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-15; 0,0" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M45 14 c-2 -4 -8 -1.5 -8 2 c0 4 8 10 8 10 s8 -6 8 -10 c0 -3.5 -6 -6 -8 -2 z" fill="#F2C4CE">
            <animate attributeName="opacity" values="1;0;1" dur="3.5s" repeatCount="indefinite" begin="0.5s" />
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-12; 0,0" dur="3.5s" repeatCount="indefinite" begin="0.5s" />
          </path>
        </svg>
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size * 1.2 }} className="animate-bob">
      <SingleBear withHeadphones={withHeadphones} withBouquet={withBouquet} />
    </div>
  );
};
