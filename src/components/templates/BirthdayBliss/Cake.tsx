import { useState, useRef } from "react";

interface Props {
  onComplete: () => void;
}

export function Cake({ onComplete }: Props) {
  const [candles, setCandles] = useState([false, false, false]);
  const [cut, setCut] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const cakeRef = useRef<HTMLDivElement>(null);

  const allLit = candles.every(Boolean);

  const lightCandle = (i: number) => {
    const next = [...candles];
    next[i] = true;
    setCandles(next);
  };

  const handleDragStart = (clientY: number) => {
    if (!allLit || cut) return;
    setDragStartY(clientY);
  };

  const handleDragMove = (clientY: number) => {
    if (dragStartY === null || cut) return;
    if (clientY - dragStartY > 50) {
      setCut(true);
      setDragStartY(null);
      setTimeout(onComplete, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center select-none">
      {cut && (
        <p className="text-2xl md:text-3xl font-display italic text-gradient-warm mb-6 animate-bliss-fade-in-up">
          Make a wish ✨
        </p>
      )}

      <div
        ref={cakeRef}
        className="relative"
        style={{ width: 260, height: 240, touchAction: "none" }}
        onMouseDown={(e) => handleDragStart(e.clientY)}
        onMouseMove={(e) => handleDragMove(e.clientY)}
        onMouseUp={() => setDragStartY(null)}
        onMouseLeave={() => setDragStartY(null)}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
        onTouchEnd={() => setDragStartY(null)}
      >
        {/* Candles */}
        <div className="absolute top-0 left-0 right-0 flex justify-around px-14 z-10">
          {candles.map((lit, i) => (
            <div key={i} className="relative flex flex-col items-center" style={{ width: 20 }}>
              {lit && (
                <div
                  className="absolute animate-bliss-flame"
                  style={{
                    bottom: 30, left: "50%",
                    width: 12, height: 20,
                    background: "radial-gradient(ellipse at bottom, #fff5b8 0%, #ffa030 60%, transparent 100%)",
                    borderRadius: "50% 50% 20% 20% / 70% 70% 30% 30%",
                    transform: "translateX(-50%)",
                    boxShadow: "0 0 24px #ffb84d, 0 0 60px #ff6b3055",
                  }}
                />
              )}
              <button
                onClick={() => lightCandle(i)}
                className="cursor-pointer transition-transform hover:scale-110"
                style={{
                  width: 8, height: 30,
                  background: `linear-gradient(180deg, ${["#ffd4e8","#fff0c9","#e0d4ff"][i]} 0%, ${["#ff8fc5","#ffd76b","#a98aff"][i]} 100%)`,
                  borderRadius: 2,
                  border: "none",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                }}
                aria-label={`Light candle ${i + 1}`}
              />
            </div>
          ))}
        </div>

        {/* Cake plate / stand */}
        <div className="absolute" style={{ bottom: -8, left: -20, right: -20, height: 16, background: "linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))", borderRadius: "50%", filter: "blur(2px)" }} />

        {/* Cake halves */}
        <div className="absolute" style={{ top: 50, left: 0, right: 0, height: 180, display: "flex" }}>
          <div
            className="transition-transform duration-1000"
            style={{
              width: "50%", height: "100%",
              transform: cut ? "translateX(-36px) rotate(-4deg)" : "none",
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          >
            <CakeHalf side="left" />
          </div>
          <div
            className="transition-transform duration-1000"
            style={{
              width: "50%", height: "100%",
              transform: cut ? "translateX(36px) rotate(4deg)" : "none",
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          >
            <CakeHalf side="right" />
          </div>
        </div>
      </div>

      <p className="mt-8 text-pink-100/70 text-xs md:text-sm text-center max-w-md tracking-wide">
        {!allLit && "Tap each candle to light it"}
        {allLit && !cut && "Drag down through the cake to cut"}
      </p>
    </div>
  );
}

function CakeHalf({ side }: { side: "left" | "right" }) {
  const cornerL = side === "left";
  const bodyRadius = cornerL ? "14px 0 0 6px" : "0 14px 6px 0";
  const topRadius = cornerL ? "14px 0 0 0" : "0 14px 0 0";
  return (
    <div className="relative w-full h-full">
      {/* Frosting top with drips */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: 32,
          background: "linear-gradient(180deg, #ffe4f0 0%, #ffb8d9 60%, #ff8fc5 100%)",
          borderRadius: topRadius,
          boxShadow: "0 4px 8px rgba(180, 30, 100, 0.15) inset",
        }}
      />
      {/* drips */}
      <div className="absolute" style={{ top: 30, left: cornerL ? "22%" : "18%", width: 12, height: 10, background: "#ff8fc5", borderRadius: "0 0 50% 50%" }} />
      <div className="absolute" style={{ top: 30, left: cornerL ? "62%" : "55%", width: 16, height: 14, background: "#ff8fc5", borderRadius: "0 0 50% 50%" }} />

      {/* Cake body - elegant cream with subtle layer line */}
      <div
        className="absolute"
        style={{
          top: 32, left: 0, right: 0, bottom: 0,
          background: "linear-gradient(180deg, #fbeed3 0%, #f5dcb0 50%, #e8c594 100%)",
          borderRadius: bodyRadius,
          boxShadow: "inset 0 -8px 16px rgba(120, 70, 30, 0.15)",
        }}
      >
        {/* layer line */}
        <div className="absolute left-0 right-0" style={{ top: "45%", height: 2, background: "rgba(180, 100, 60, 0.25)" }} />

        {/* refined dots instead of garish sprinkles */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            top: `${15 + i * 14}%`,
            left: `${20 + (i * 19) % 60}%`,
            width: 4, height: 4,
            background: ["#ff8fc5", "#b266ff", "#ffd76b"][i % 3],
            opacity: 0.7,
          }} />
        ))}
      </div>
    </div>
  );
}
