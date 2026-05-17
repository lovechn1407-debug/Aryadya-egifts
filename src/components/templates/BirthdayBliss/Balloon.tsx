import { useState } from "react";

const COLORS = ["#FF1493", "#FFD700", "#7B68EE", "#00CED1", "#FF6347", "#32CD32", "#FF69B4", "#C792EA"];

interface Props {
  left: number;
  duration: number;
  delay: number;
  color: string;
  drift: number;
  onPop: (e?: React.MouseEvent) => void;
}

export function Balloon({ left, duration, delay, color, drift, onPop }: Props) {
  const [popped, setPopped] = useState(false);

  const handlePop = (e?: React.MouseEvent) => {
    if (popped) return;
    setPopped(true);
    onPop(e);
  };

  if (popped) return null;

  return (
    <button
      onClick={handlePop}
      onMouseEnter={handlePop}
      aria-label="Pop balloon"
      className="absolute cursor-pointer focus:outline-none group"
      style={{
        left: `${left}%`,
        top: 0,
        animation: `balloon-rise ${duration}s linear ${delay}s infinite`,
        width: 56,
        height: 80,
        // @ts-ignore
        "--drift": `${drift}px`,
      }}
    >
      <div
        className="relative transition-transform group-hover:scale-110"
        style={{
          width: 56,
          height: 70,
          background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.7), ${color} 55%, ${color} 100%)`,
          borderRadius: "50% 50% 50% 50% / 45% 45% 55% 55%",
          boxShadow: `inset -5px -8px 16px rgba(0,0,0,0.18), 0 8px 24px ${color}55`,
        }}
      />
      <div
        style={{
          width: 0, height: 0, margin: "0 auto",
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: `7px solid ${color}`,
        }}
      />
      <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.5)", margin: "0 auto" }} />
    </button>
  );
}

export function generateBalloons(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 88 + 4,
    duration: 9 + Math.random() * 5,
    delay: -Math.random() * 8,
    drift: (Math.random() - 0.5) * 80,
    color: COLORS[i % COLORS.length],
  }));
}
