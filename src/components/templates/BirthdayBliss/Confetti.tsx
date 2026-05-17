import { useMemo } from "react";

const COLORS = ["#ff2d87", "#ffd700", "#b266ff", "#00ced1", "#ff6bb0", "#ffffff"];

export function Confetti({ count = 80 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        cx: (Math.random() - 0.5) * 200,
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 2,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-30">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            // @ts-ignore
            "--cx": `${p.cx}px`,
          }}
        />
      ))}
    </div>
  );
}

export function Popper({ x, y, onDone }: { x: number; y: number; onDone?: () => void }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const angle = (i / 22) * Math.PI * 2;
        const dist = 60 + Math.random() * 80;
        return {
          id: i,
          tx: Math.cos(angle) * dist,
          ty: Math.sin(angle) * dist,
          color: COLORS[i % COLORS.length],
          size: 4 + Math.random() * 6,
        };
      }),
    []
  );

  setTimeout(() => onDone?.(), 1100);

  return (
    <div className="pointer-events-none absolute z-40" style={{ left: x, top: y }}>
      {particles.map((p) => (
        <span
          key={p.id}
          className="popper-particle"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            // @ts-ignore
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
          }}
        />
      ))}
    </div>
  );
}
