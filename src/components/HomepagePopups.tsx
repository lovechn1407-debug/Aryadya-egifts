"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PopupData } from "@/lib/db";
import type { Product } from "@/lib/data";
import { getProducts } from "@/lib/data";
import Link from "next/link";

interface Props {
  popups?: PopupData[];
}

export default function HomepagePopups({ popups }: Props) {
  const [activePopupIndex, setActivePopupIndex] = useState<number>(0);
  const [eligiblePopups, setEligiblePopups] = useState<PopupData[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [now, setNow] = useState(new Date());

  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Sort popups by order and filter enabled ones
    const active = (popups || []).filter(p => p.enabled).sort((a, b) => a.order - b.order);
    
    const valid: PopupData[] = [];
    
    const todayStr = new Date().toLocaleDateString();

    for (const p of active) {
      if (p.frequency === "always") {
        valid.push(p);
      } else if (p.frequency === "once_a_day") {
        const lastSeen = localStorage.getItem(`popup_${p.id}_last_seen`);
        if (lastSeen !== todayStr) {
          valid.push(p);
        }
      } else if (p.frequency === "dont_show_again") {
        const dsa = localStorage.getItem(`popup_${p.id}_dsa`);
        if (dsa !== "true") {
          valid.push(p);
        }
      }
    }

    setEligiblePopups(valid);

    // Setup interval for variables like {current_date}, {countdown_time}
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [popups]);

  // Handle Auto-close
  useEffect(() => {
    if (eligiblePopups.length > 0 && activePopupIndex < eligiblePopups.length) {
      const currentPopup = eligiblePopups[activePopupIndex];
      if (currentPopup.autoCloseSeconds) {
        const t = setTimeout(() => {
          handleClosePopup(currentPopup);
        }, currentPopup.autoCloseSeconds * 1000);
        return () => clearTimeout(t);
      }
    }
  }, [eligiblePopups, activePopupIndex]);


  const handleClosePopup = (popup: PopupData) => {
    // Save state before closing
    if (popup.frequency === "once_a_day") {
      localStorage.setItem(`popup_${popup.id}_last_seen`, new Date().toLocaleDateString());
    } else if (popup.frequency === "dont_show_again" && dontShowAgain) {
      localStorage.setItem(`popup_${popup.id}_dsa`, "true");
    }
    
    // Reset local state for next popup
    setDontShowAgain(false);
    
    // Move to next
    setActivePopupIndex(prev => prev + 1);
  };

  if (!isClient || eligiblePopups.length === 0 || activePopupIndex >= eligiblePopups.length) return null;

  const currentPopup = eligiblePopups[activePopupIndex];

  // Prepare text replacements
  let finalHtml = currentPopup.contentHtml;
  
  // Date & Day
  finalHtml = finalHtml.replace(/{current_date}/g, now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
  finalHtml = finalHtml.replace(/{current_day}/g, now.toLocaleDateString(undefined, { weekday: 'long' }));

  // Countdown Target
  let countdownText = "";
  if (currentPopup.showCountdown && currentPopup.countdownTarget) {
    const target = new Date(currentPopup.countdownTarget).getTime();
    const diff = target - now.getTime();
    if (diff > 0) {
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      countdownText = `${d}d ${h}h ${m}m ${s}s`;
    } else {
      countdownText = "Time's up!";
    }
    finalHtml = finalHtml.replace(/{countdown_time}/g, countdownText);
  } else {
    finalHtml = finalHtml.replace(/{countdown_time}/g, "");
  }

  const allProds = getProducts();
  const linkedProds = (currentPopup.linkedProductIds || [])
    .map(id => allProds.find(p => p.id === id))
    .filter(Boolean) as Product[];

  return (
    <AnimatePresence>
      <motion.div
        key={currentPopup.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 9999, 
          display: "flex", alignItems: "center", justifyContent: "center", 
          background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)",
          padding: 20
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            background: "#fff", width: "100%", maxWidth: 600, 
            borderRadius: 24, overflow: "hidden", 
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            position: "relative",
            display: "flex", flexDirection: "column",
            maxHeight: "90vh"
          }}
        >
          {/* Close button */}
          <button 
            onClick={() => handleClosePopup(currentPopup)} 
            style={{ 
              position: "absolute", top: 16, right: 16, zIndex: 10,
              width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)",
              border: "none", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#0F172A", fontSize: 20, boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            &times;
          </button>

          {/* Auto Close Progress Bar */}
          {currentPopup.autoCloseSeconds && (
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: currentPopup.autoCloseSeconds, ease: "linear" }}
              style={{ position: "absolute", top: 0, left: 0, height: 4, background: "#10B981", zIndex: 11 }}
            />
          )}

          <div style={{ overflowY: "auto", flex: 1 }}>
            {currentPopup.imageUrl && (
              <img src={currentPopup.imageUrl} alt="Promo" style={{ width: "100%", height: "auto", maxHeight: 250, objectFit: "cover" }} />
            )}
            
            <div style={{ padding: "32px 24px" }}>
              <div dangerouslySetInnerHTML={{ __html: finalHtml }} style={{ lineHeight: 1.6, color: "#334155" }} />
              
              {/* Product Showcase */}
              {linkedProds.length > 0 && (
                <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: linkedProds.length === 1 ? "1fr" : "1fr 1fr", gap: 16 }}>
                  {linkedProds.map(p => (
                    <Link key={p.id} href={`#gifts`} onClick={() => handleClosePopup(currentPopup)} style={{ textDecoration: "none" }}>
                      <div style={{ 
                        border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden", 
                        display: "flex", flexDirection: "column", background: "#F8FAFC",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                      }}>
                        <div style={{ width: "100%", height: 120, background: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                          {p.thumbnail?.length < 5 ? p.thumbnail : "🎁"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "center", padding: 12 }}>
                          {p.cuttedPrice && <div style={{ fontSize: 10, color: "#94A3B8", textDecoration: "line-through" }}>₹{p.cuttedPrice / 100}</div>}
                          <div style={{ fontSize: 13, color: "#10B981", fontWeight: 800 }}>{p.price === 0 ? "FREE" : `₹${p.price / 100}`}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid #E2E8F0", background: "#F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {currentPopup.frequency === "dont_show_again" ? (
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748B", cursor: "pointer" }}>
                <input type="checkbox" checked={dontShowAgain} onChange={e => setDontShowAgain(e.target.checked)} />
                Don't show this again today
              </label>
            ) : <div />}
            <button onClick={() => handleClosePopup(currentPopup)} style={{ background: "#0F172A", color: "#fff", border: "none", padding: "8px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
              Continue
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
