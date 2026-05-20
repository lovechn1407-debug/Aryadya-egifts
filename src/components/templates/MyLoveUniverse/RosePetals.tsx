import { useEffect, useRef } from "react";
import gsap from "gsap";

export function RosePetals({ count = 30 }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const petals = containerRef.current.querySelectorAll<HTMLDivElement>(".petal");
    const w = window.innerWidth;
    const h = window.innerHeight;
    petals.forEach((petal) => {
      const startX = Math.random() * w;
      const drift = (Math.random() - 0.5) * 200;
      const duration = 8 + Math.random() * 10;
      const delay = Math.random() * 10;
      gsap.set(petal, { x: startX, y: -50, rotation: 0, opacity: 0.6 });
      gsap.to(petal, {
        y: h + 50,
        x: startX + drift,
        rotation: 720,
        duration,
        delay,
        repeat: -1,
        ease: "none",
      });
    });
  }, [count]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0">
      {Array.from({ length: count }).map((_, i) => {
        const size = 8 + Math.random() * 12;
        const colors = ["#F2C4CE", "#C0395A", "#8B1A3A", "#D4869A"];
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            className="petal"
            style={{
              width: size,
              height: size,
              background: `radial-gradient(circle at 30% 30%, ${color}, ${color}88)`,
              opacity: 0.5 + Math.random() * 0.4,
            }}
          />
        );
      })}
    </div>
  );
}
