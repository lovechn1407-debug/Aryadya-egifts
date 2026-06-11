"use client";

import { useState, useEffect, useRef } from "react";
import "fluid-player/src/css/fluidplayer.css";

interface AdSequenceModalProps {
  requiredAds: number;
  onComplete: () => void;
  onCancel: () => void;
}

export default function AdSequenceModal({ requiredAds, onComplete, onCancel }: AdSequenceModalProps) {
  const [currentAd, setCurrentAd] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  const handleNext = () => {
    if (currentAd < requiredAds) {
      setCurrentAd(currentAd + 1);
      setIsPlayingAd(false);
    } else {
      setIsFinished(true);
      onComplete();
    }
  };

  useEffect(() => {
    if (isFinished || !videoRef.current) return;

    // Dynamically import fluid-player to avoid Next.js SSR window errors
    import("fluid-player").then((module) => {
      const fluidPlayer = module.default;
      
      // Initialize Fluid Player
      playerRef.current = fluidPlayer(videoRef.current!, {
        layoutControls: {
          fillToContainer: true,
          playButtonShowing: true,
          logo: { imageUrl: "" }, // Hide logo
          controlBar: { autoHide: true }
        },
        vastOptions: {
          adList: [
            {
              roll: "preRoll",
              // Replace YOUR_VAST_TAG_URL with your actual Adsterra VAST XML URL
              vastTag: "YOUR_VAST_TAG_URL"
            }
          ]
        }
      });

      // Listen for the end of the video ad
      playerRef.current.on("adEnded", () => {
        handleNext();
      });
      
      playerRef.current.on("play", () => {
        setIsPlayingAd(true);
      });
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [currentAd, isFinished]); // Re-initialize when currentAd changes if there are multiple ads



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
              background: "#000",
              borderRadius: 16,
              minHeight: 250,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              border: "1px solid rgba(255,255,255,0.2)",
              position: "relative",
              overflow: "hidden",
              width: "100%",
              aspectRatio: "16/9"
            }}>
              <video 
                ref={videoRef}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                playsInline
              />
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
