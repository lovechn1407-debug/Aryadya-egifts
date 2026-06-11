"use client";

import { useState, useEffect } from "react";

interface AdSequenceModalProps {
  requiredAds: number;
  onComplete: () => void;
  onCancel: () => void;
}

export default function AdSequenceModal({ requiredAds, onComplete, onCancel }: AdSequenceModalProps) {
  const [currentAd, setCurrentAd] = useState(1);
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds per ad
  const [isFinished, setIsFinished] = useState(false);
  const [hasClickedAd, setHasClickedAd] = useState(false);

  useEffect(() => {
    if (hasClickedAd && timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasClickedAd, timeLeft, isFinished]);

  const handleAdClick = () => {
    window.open("https://www.effectivecpmnetwork.com/qwwhwdqkx?key=4580e62c4f36e8e176f4b34dc57cb5bd", "_blank");
    setHasClickedAd(true);
  };

  const handleNext = () => {
    if (currentAd < requiredAds) {
      setCurrentAd(currentAd + 1);
      setTimeLeft(15); // Reset timer for next ad
      setHasClickedAd(false); // Require click for next ad
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
              padding: 24,
              position: "relative",
              overflow: "hidden"
            }}>
              {!hasClickedAd ? (
                <>
                  <div style={{
                    width: 60, height: 60, borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.4)", marginBottom: 16
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </div>
                  <h3 style={{ color: "#FFF", fontSize: 18, marginBottom: 12 }}>Unlock Required</h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 24, maxWidth: 300 }}>
                    Click the button below to view our sponsor's page. The countdown will begin immediately after.
                  </p>
                  <button
                    onClick={handleAdClick}
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                      color: "#FFF", border: "none", padding: "14px 28px", borderRadius: 12,
                      fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "0.2s",
                      boxShadow: "0 4px 12px rgba(37,99,235,0.3)"
                    }}
                  >
                    View Sponsor to Unlock
                  </button>
                </>
              ) : (
                <>
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#FFF", fontSize: 32, fontWeight: 800, marginBottom: 16
                  }}>
                    {timeLeft}
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, maxWidth: 250 }}>
                    Please wait for the timer to finish before proceeding.
                  </p>
                </>
              )}
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
