"use client";

import { useState, useEffect } from "react";
import AdsterraBannerAd from "./AdsterraBannerAd";

interface AdSequenceModalProps {
  requiredAds: number;
  onComplete: () => void;
  onCancel: () => void;
}

export default function AdSequenceModal({ requiredAds, onComplete, onCancel }: AdSequenceModalProps) {
  const [currentAd, setCurrentAd] = useState(1);
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds per ad
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isFinished]);

  const handleNext = () => {
    if (currentAd < requiredAds) {
      setCurrentAd(currentAd + 1);
      setTimeLeft(15); // Reset timer for next ad
    } else {
      setIsFinished(true);
      onComplete();
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0, 0, 0, 0.9)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: "#111118",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 24,
        padding: 40,
        maxWidth: 500,
        width: "90%",
        textAlign: "center",
        boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
      }}>
        {!isFinished ? (
          <>
            <h2 style={{ color: "#FFF", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Sponsor Message
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 24 }}>
              Ad {currentAd} of {requiredAds}
            </p>

            <div style={{
              background: "#1A1A24",
              borderRadius: 16,
              minHeight: 250,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              border: "1px dashed rgba(255,255,255,0.2)",
              padding: 16,
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Adsterra Banner Ad */}
              {/* Replace adKey with your actual Adsterra banner key */}
              <AdsterraBannerAd adKey="YOUR_ADSTERRA_KEY" width={300} height={250} />
              
              <div style={{
                position: "absolute", top: 12, right: 12,
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#FFF", fontSize: 16, fontWeight: 800,
                border: "1px solid rgba(255,255,255,0.2)"
              }}>
                {timeLeft}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={onCancel}
                style={{
                  background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#FFF",
                  padding: "12px 24px", borderRadius: 12, fontWeight: 600, cursor: "pointer", transition: "0.2s"
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleNext}
                disabled={timeLeft > 0}
                style={{
                  background: timeLeft === 0 ? "linear-gradient(135deg, #10B981, #059669)" : "rgba(255,255,255,0.1)",
                  color: timeLeft === 0 ? "#FFF" : "rgba(255,255,255,0.3)",
                  border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 700, 
                  cursor: timeLeft === 0 ? "pointer" : "not-allowed", transition: "0.2s",
                  boxShadow: timeLeft === 0 ? "0 4px 12px rgba(16,185,129,0.3)" : "none"
                }}
              >
                {timeLeft > 0 ? `Wait ${timeLeft}s...` : (currentAd < requiredAds ? "Next Ad" : "Unlock Now")}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", margin: "0 auto 20px",
              background: "linear-gradient(135deg, #10B981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF"
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{ color: "#FFF", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Unlocked!
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 24 }}>
              Thanks for watching. Processing your request...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
