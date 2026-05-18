"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getSectionTheme } from "@/lib/data";
import type { Product, DisplaySection, SectionThemeConfig } from "@/lib/data";
import type { Order } from "@/lib/data";
import { getProductsDB, getVisibleSectionsDB, getOrdersByBuyerDB, getSettingsDB, Settings } from "@/lib/db";

/* ── Modern UI SVG Icons ── */
function GiftSVG({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function LockSVG({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LightningSVG({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function CustomizeSVG({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  );
}

function FireSVG({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function SparklesSVG({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M12 3l1.912 5.813 6.088.087-4.872 3.652 1.83 5.861L12 14.838l-4.958 3.575 1.83-5.861L4 8.9l6.088-.087L12 3z" />
    </svg>
  );
}

function PremiumSVG({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M6 3h12l4 6-10 12L2 9z" />
      <path d="M11 3 8 9l4 12 4-12-3-6" />
      <path d="M2 9h20" />
    </svg>
  );
}

function HomeSVG({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function MailSVG({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneSVG({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MapPinSVG({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PencilSVG({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function ShieldKeySVG({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M12 2a5 5 0 0 0-5 5v4h10V7a5 5 0 0 0-5-5z" />
      <circle cx="12" cy="16" r="1.5" />
    </svg>
  );
}

/* ── Marquee Bar ── */
function MarqueeBar({ marquees }: { marquees: NonNullable<Settings["marquees"]> }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (marquees.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % marquees.length);
    }, 4000); // 4 seconds per message
    return () => clearInterval(interval);
  }, [marquees.length]);

  if (marquees.length === 0) return null;

  return (
    <div style={{ height: 40, overflow: "hidden", position: "relative", background: "#fff", borderBottom: "1px solid #F3F4F6", zIndex: 101 }}>
      {marquees.map((mq, index) => {
        let yPos = "100%";
        let opacity = 0;
        let zIndex = 0;
        let transition = "transform 0.5s ease, opacity 0.5s ease";

        if (index === currentIndex) {
          yPos = "0";
          opacity = 1;
          zIndex = 2;
        } else if (index === (currentIndex - 1 + marquees.length) % marquees.length) {
          // Just left the screen (moved up)
          yPos = "-100%";
          opacity = 0;
          zIndex = 1;
        } else {
          // Waiting to enter from bottom
          yPos = "100%";
          opacity = 0;
          zIndex = 0;
          transition = "none"; // Reset instantly to bottom
        }

        return (
          <div
            key={mq.id}
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              transform: `translateY(${yPos})`,
              opacity,
              transition,
              zIndex,
              fontSize: 13,
              fontWeight: 600,
              color: mq.color || "#1F2937",
              textAlign: "center",
              padding: "0 16px"
            }}
            dangerouslySetInnerHTML={{ __html: mq.text }}
          />
        );
      })}
    </div>
  );
}

/* ── Navbar ── */
function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      padding: "0 clamp(16px,4vw,48px)",
      display: "flex", alignItems: "center", height: 60, gap: 14,
    }}>
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
        <img src="/logo.png" alt="Aradhya E-Gifts" style={{ height: 44, objectFit: "contain" }} />
      </Link>
      <div style={{ flex: 1 }} />
      <Link href="/my-orders" style={{
        fontSize: 13, fontWeight: 700, color: "#7C3AED", cursor: "pointer",
        padding: "8px 16px", borderRadius: 999, border: "1.5px solid #7C3AED",
        background: "transparent", textDecoration: "none", whiteSpace: "nowrap",
      }} className="nav-my-orders-btn">
        My Orders
      </Link>

      {/* Hamburger Menu Icon */}
      <button 
        onClick={onMenuClick}
        aria-label="Toggle navigation menu"
        style={{
          background: "rgba(124, 58, 237, 0.08)",
          border: "none",
          borderRadius: 10,
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#7C3AED",
          transition: "background 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(124, 58, 237, 0.15)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(124, 58, 237, 0.08)"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 580px) {
          .nav-my-orders-btn {
            display: none !important;
          }
        }
      `}} />
    </nav>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <section style={{
      position: "relative", overflow: "hidden",
      padding: "80px clamp(16px,4vw,48px) 60px",
      background: "linear-gradient(180deg, #FFF0F5 0%, #FFFFFF 100%)",
    }}>
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: -80, right: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(233,30,140,0.08),transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: -80, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.06),transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{
          display: "inline-block", padding: "6px 18px", borderRadius: 999, fontSize: 13, fontWeight: 700,
          background: "linear-gradient(135deg,rgba(233,30,140,0.1),rgba(124,58,237,0.1))",
          color: "#E91E8C", marginBottom: 20,
        }}>
          ✨ India&apos;s Most Loved E-Gifting Platform
        </div>

        <h1 style={{
          fontSize: "clamp(32px,6vw,56px)", fontWeight: 900,
          fontFamily: "'Nunito',sans-serif", lineHeight: 1.15,
          color: "#1A1A2E",
        }}>
          Send <span style={{ color: "#E91E8C" }}>Magical</span> Digital
          <br />Surprises to Your Loved Ones
        </h1>

        <p style={{
          fontSize: "clamp(15px,2vw,18px)", color: "#4A4A68",
          lineHeight: 1.7, maxWidth: 540, margin: "20px auto 0",
        }}>
          Beautiful, personalised webpages for birthdays, proposals,
          anniversaries &amp; more. Preview it, pay once, customise &amp; share.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
          <a href="#gifts" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg,#E91E8C,#7C3AED)", color: "#fff",
            borderRadius: 999, padding: "14px 32px", fontWeight: 700, fontSize: 15,
            textDecoration: "none", boxShadow: "0 8px 24px rgba(233,30,140,0.25)",
            transition: "transform 0.2s",
          }}>
            Browse Gifts <GiftSVG size={18} color="#fff" />
          </a>
          <a href="#how" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#fff", color: "#1A1A2E",
            border: "1px solid rgba(0,0,0,0.1)", borderRadius: 999,
            padding: "14px 32px", fontWeight: 600, fontSize: 15,
            textDecoration: "none", transition: "all 0.2s",
          }}>
            How it Works
          </a>
        </div>

        {/* Trust indicators */}
        <div style={{ display: "flex", gap: 28, justifyContent: "center", marginTop: 36, flexWrap: "wrap" }}>
          {[
            { icon: <LockSVG size={16} color="#E91E8C" />, text: "Secure Payments" },
            { icon: <LightningSVG size={16} color="#7C3AED" />, text: "Instant Delivery" },
            { icon: <CustomizeSVG size={16} color="#6366F1" />, text: "Fully Customisable" },
          ].map(t => (
            <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>
              <span style={{ display: "inline-flex", alignItems: "center" }}>{t.icon}</span> {t.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it Works (Interactive CSS Mockups) ── */
function HowItWorks() {
  return (
    <section id="how" style={{ padding: "100px clamp(16px,4vw,48px)", background: "#FAFAFA", overflow: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 70 }}>
          <span style={{ background: "linear-gradient(135deg, #E91E8C 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", color: "transparent", fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: 2 }}>
            The Process
          </span>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, color: "#1A1A2E", margin: "12px 0 16px", letterSpacing: -1 }}>
            How the Magic Works
          </h2>
          <p style={{ fontSize: 16, color: "#64748B", maxWidth: 500, margin: "0 auto" }}>
            Create an unforgettable, personalized digital experience for your loved ones in 5 simple steps.
          </p>
        </div>

        {/* Step 1: Browse */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5vw", marginBottom: 100 }}>
          <div style={{ flex: "1 1 400px", order: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: "#FEF2F2", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>1</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1A1A2E", margin: 0 }}>Browse & Preview</h3>
            </div>
            <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.7, marginBottom: 24 }}>
              Explore our stunning collection of professionally designed digital gift templates. From birthdays to anniversaries, every template is fully animated and interactive. You can preview exactly how they look before you buy.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Responsive on all devices", "Smooth animations & interactions", "Thematic designs for every occasion"].map((t, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "#334155", fontWeight: 600 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#10B981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✓</div> {t}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: "1 1 400px", order: 2, position: "relative" }}>
            <div style={{ background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)", border: "1px solid #E2E8F0", position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#EF4444" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#F59E0B" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10B981" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #F1F5F9" }}>
                  <div style={{ height: 120, background: "linear-gradient(135deg, #FF9A9E, #FECFEF)", position: "relative" }}>
                    <div style={{ position: "absolute", top: 8, left: 8, background: "#EF4444", color: "#fff", fontSize: 8, fontWeight: 800, padding: "4px 8px", borderRadius: 4 }}>🔥 HOT</div>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🎂</div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#1A1A2E", marginBottom: 2 }}>Birthday Site 1</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>₹99.00</div>
                    <div style={{ width: "100%", padding: "4px 0", background: "#F1F5F9", color: "#475569", fontSize: 10, fontWeight: 700, textAlign: "center", borderRadius: 4 }}>Live Preview</div>
                  </div>
                </div>
                <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #F1F5F9" }}>
                  <div style={{ height: 120, background: "linear-gradient(135deg, #A18CD1, #FBC2EB)", position: "relative" }}>
                    <div style={{ position: "absolute", top: 8, left: 8, background: "#8B5CF6", color: "#fff", fontSize: 8, fontWeight: 800, padding: "4px 8px", borderRadius: 4 }}>✨ NEW</div>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>💌</div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#1A1A2E", marginBottom: 2 }}>Love Letter</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>₹149.00</div>
                    <div style={{ width: "100%", padding: "4px 0", background: "#F1F5F9", color: "#475569", fontSize: 10, fontWeight: 700, textAlign: "center", borderRadius: 4 }}>Live Preview</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", top: -20, right: -20, width: 200, height: 200, background: "radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)", zIndex: 1, pointerEvents: "none" }} />
          </div>
        </div>

        {/* Step 2: Payment */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5vw", marginBottom: 100 }}>
          <div style={{ flex: "1 1 400px", order: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: "#FFFBEB", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>2</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1A1A2E", margin: 0 }}>Secure Checkout</h3>
            </div>
            <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.7, marginBottom: 24 }}>
              Make a secure one-time payment. Once completed, your order is locked in and you get instant access to the Live Editor.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["100% Secure UPI & Card payments", "No hidden fees or subscriptions", "Instant editor access"].map((t, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "#334155", fontWeight: 600 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#F59E0B", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✓</div> {t}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: "1 1 400px", order: 1, position: "relative" }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: 30, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)", border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #E2E8F0", paddingBottom: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1A1A2E" }}>Order Total</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#10B981" }}>₹99</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 8, textTransform: "uppercase" }}>Payment Method</div>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 36, background: "#F1F5F9", borderRadius: 6, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#334155" }}>UPI</div>
                <div style={{ flex: 1, height: 36, background: "#F1F5F9", borderRadius: 6, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#334155" }}>Card</div>
                <div style={{ flex: 1, height: 36, background: "#F1F5F9", borderRadius: 6, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#334155" }}>NetBank</div>
              </div>
              <div style={{ width: "100%", height: 44, background: "#F8FAFC", borderRadius: 8, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", padding: "0 12px", boxSizing: "border-box", marginBottom: 16, fontSize: 13, color: "#94A3B8" }}>
                name@example.com
              </div>
              <div style={{ width: "100%", height: 48, background: "#1A1A2E", color: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, boxShadow: "0 4px 12px rgba(26,26,46,0.3)" }}>
                Pay Securely
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 200, height: 200, background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)", zIndex: -1, pointerEvents: "none" }} />
          </div>
        </div>

        {/* Step 3: Edit Texts */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5vw", marginBottom: 100 }}>
          <div style={{ flex: "1 1 400px", order: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: "#EEF2FF", color: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>3</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1A1A2E", margin: 0 }}>Edit Texts & Details</h3>
            </div>
            <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.7, marginBottom: 24 }}>
              Use our Live Editor to customize every single text, message, and name. Watch the preview update instantly as you type to make the gift truly yours.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Real-time Live Preview", "Change names & paragraphs", "Save progress anytime"].map((t, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "#334155", fontWeight: 600 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#6366F1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✓</div> {t}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: "1 1 400px", order: 2, position: "relative" }}>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1, background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)", border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#1A1A2E", marginBottom: 16 }}>Live Editor</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 4 }}>Main Heading</div>
                  <div style={{ width: "100%", background: "#F8FAFC", borderRadius: 6, border: "1px solid #E2E8F0", padding: "8px 10px", boxSizing: "border-box", fontSize: 12, color: "#0F172A", fontWeight: 600 }}>
                    Happy Birthday Love!
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 4 }}>Personal Message</div>
                  <div style={{ width: "100%", height: 60, background: "#F8FAFC", borderRadius: 6, border: "1px solid #E2E8F0", padding: "8px 10px", boxSizing: "border-box", fontSize: 11, color: "#475569", lineHeight: 1.5 }}>
                    Wishing you the most amazing day ever. You mean the world to me.
                  </div>
                </div>
                <div style={{ width: "100%", padding: "10px 0", background: "#6366F1", color: "#fff", borderRadius: 8, textAlign: "center", fontSize: 13, fontWeight: 700 }}>Save Changes</div>
              </div>
              <div style={{ width: 140, flexShrink: 0, background: "#0F172A", borderRadius: 24, padding: 6, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)" }}>
                <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: 60, background: "#FF9A9E", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 24 }}>🎂</span></div>
                  <div style={{ padding: "16px 10px", flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#0F172A", marginBottom: 8, lineHeight: 1.2 }}>Happy Birthday Love!</div>
                    <div style={{ fontSize: 7, color: "#64748B", marginBottom: 12, lineHeight: 1.4 }}>Wishing you the most amazing day ever. You mean the world to me.</div>
                    <div style={{ width: "80%", padding: "6px 0", background: "#E91E8C", color: "#fff", borderRadius: 99, margin: "0 auto", fontSize: 8, fontWeight: 700 }}>Open Gift</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Music */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5vw", marginBottom: 100 }}>
          <div style={{ flex: "1 1 400px", order: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: "#FDF4FF", color: "#D946EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>4</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1A1A2E", margin: 0 }}>Select Background Music</h3>
            </div>
            <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.7, marginBottom: 24 }}>
              Set the perfect mood by assigning custom background music. Choose from our audio library, upload your own MP3, or use multi-part songs.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Custom MP3 uploads & YouTube links", "Multi-part playlist support", "Live audio preview"].map((t, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "#334155", fontWeight: 600 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#D946EF", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✓</div> {t}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: "1 1 400px", order: 1, position: "relative" }}>
            <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)", border: "1px solid #E2E8F0", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, #F8FAFC, #F1F5F9)", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, color: "#0F172A", fontSize: 15 }}>Audio Library</span>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#fff", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: 12 }}>✕</div>
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ border: "2px solid #D946EF", borderRadius: 12, padding: "12px", background: "#FDF4FF", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#D946EF", color: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>❚❚</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#701A75", marginBottom: 4 }}>A Thousand Years</div>
                    <div style={{ width: "100%", height: 4, background: "#F5D0FE", borderRadius: 4, position: "relative" }}>
                      <div style={{ width: "40%", height: "100%", background: "#D946EF", borderRadius: 4 }} />
                    </div>
                  </div>
                  <div style={{ padding: "6px 12px", background: "#A21CAF", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 6 }}>Select</div>
                </div>
                <div style={{ border: "2px solid #E2E8F0", borderRadius: 12, padding: "12px", background: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F1F5F9", color: "#64748B", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, paddingLeft: 2 }}>▶</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 2 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Birthday Mashup</div>
                      <div style={{ padding: "2px 6px", background: "#FDF4FF", color: "#A21CAF", fontSize: 8, fontWeight: 800, borderRadius: 99 }}>🎶 3 Parts</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>Lo-fi Beats</div>
                  </div>
                  <div style={{ padding: "6px 12px", background: "#EEF2FF", color: "#4338CA", fontSize: 10, fontWeight: 700, borderRadius: 6 }}>Parts ▼</div>
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 200, height: 200, background: "radial-gradient(circle, rgba(217,70,239,0.1) 0%, transparent 70%)", zIndex: -1, pointerEvents: "none" }} />
          </div>
        </div>

        {/* Step 5: Finalize & Share */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5vw" }}>
          <div style={{ flex: "1 1 400px", order: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: "#F0FDF4", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>5</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1A1A2E", margin: 0 }}>Finalize & Share</h3>
            </div>
            <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.7, marginBottom: 24 }}>
              Click "Finalize" to generate a permanent link and a scannable QR code! Send it via WhatsApp, email, or print it out on a physical gift.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Permanent sharable URL generation", "High-quality scannable QR Code", "One-click share to WhatsApp"].map((t, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "#334155", fontWeight: 600 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#10B981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✓</div> {t}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: "1 1 400px", order: 2, position: "relative", display: "flex", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: 24, padding: 32, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)", border: "1px solid #E2E8F0", textAlign: "center", width: "100%", maxWidth: 320 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#10B981", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24 }}>✓</div>
              <h4 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "0 0 8px" }}>Gift Ready!</h4>
              <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 24px" }}>Your custom digital gift is finalized.</p>

              <div style={{ border: "2px dashed #E2E8F0", borderRadius: 16, padding: 16, background: "#F8FAFC", marginBottom: 20 }}>
                {/* QR Code Mockup */}
                <div style={{ width: 140, height: 140, background: "#fff", borderRadius: 8, margin: "0 auto", padding: 8, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                  <div style={{ background: "#0F172A", borderRadius: 4, gridColumn: "span 2", gridRow: "span 2" }} />
                  <div style={{ background: "#0F172A", borderRadius: 4 }} />
                  <div style={{ background: "#0F172A", borderRadius: 4 }} />
                  <div style={{ background: "#0F172A", borderRadius: 4 }} />
                  <div style={{ background: "#0F172A", borderRadius: 4 }} />
                  <div style={{ background: "#0F172A", borderRadius: 4 }} />
                  <div style={{ background: "#0F172A", borderRadius: 4, gridColumn: "span 2" }} />
                  <div style={{ background: "#0F172A", borderRadius: 4 }} />
                  <div style={{ background: "#0F172A", borderRadius: 4 }} />
                  <div style={{ background: "#0F172A", borderRadius: 4, gridColumn: "span 2", gridRow: "span 2" }} />
                  <div style={{ background: "#0F172A", borderRadius: 4 }} />
                  <div style={{ background: "#0F172A", borderRadius: 4 }} />
                  <div style={{ background: "#0F172A", borderRadius: 4 }} />
                  <div style={{ background: "#0F172A", borderRadius: 4 }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, height: 44, background: "#F1F5F9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontWeight: 700, fontSize: 13 }}>🔗 Copy Link</div>
                <div style={{ flex: 1, height: 44, background: "#25D366", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>WhatsApp</div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -20, right: -20, width: 200, height: 200, background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)", zIndex: -1, pointerEvents: "none" }} />
          </div>
        </div>

      </div>
    </section>
  );
}

/* ── Product Card ── */
function ProductCard({ product, accent, onCardClick }: { product: Product; accent?: string; onCardClick: (p: Product) => void }) {
  const color = accent || "#E91E8C";
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / 390);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const IW = 390, IH = IW * 4 / 3;
  const rating = (product as any).rating ?? 4.5;

  return (
    <div onClick={() => onCardClick(product)}
      style={{ cursor: "pointer", borderRadius: 10, overflow: "hidden", border: `1.5px solid ${color}22`, boxShadow: `0 4px 16px ${color}12`, transition: "transform 0.22s, box-shadow 0.22s", background: "#fff", display: "flex", flexDirection: "column", position: "relative" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 14px 36px ${color}28`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 16px ${color}12`; }}
    >
      {product.badge && (
        <div style={{
          position: "absolute", top: 8, left: 8, zIndex: 10,
          padding: "4px 8px",
          background: product.badge === "hot" ? "#EF4444" : product.badge === "new" ? "#3B82F6" : product.badge === "specials" ? "#10B981" : "#F59E0B",
          color: "#fff", fontSize: 10, fontWeight: 900, borderRadius: 6,
          textTransform: "uppercase", letterSpacing: 0.5,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", gap: 5
        }}>
          {product.badge === "hot" && <FireSVG size={11} color="#fff" />}
          {product.badge === "new" && <SparklesSVG size={11} color="#fff" />}
          {product.badge === "specials" && <GiftSVG size={11} color="#fff" />}
          {product.badge === "premium" && <PremiumSVG size={11} color="#fff" />}
          {product.badge === "hot" ? "HOT" : product.badge === "new" ? "NEW" : product.badge === "specials" ? "SPECIAL" : "PREMIUM"}
        </div>
      )}
      {(product as any).showStock && (product as any).stockLeft > 0 && (
        <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10, padding: "4px 8px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", color: "#EF4444", fontSize: 10, fontWeight: 800, borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5, border: "1px solid rgba(239,68,68,0.3)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          Only {(product as any).stockLeft} left
        </div>
      )}
      {/* Iframe — maintains 3:4 ratio */}
      <div ref={containerRef} style={{ aspectRatio: "3/4", position: "relative", overflow: "hidden", background: `${color}08`, flexShrink: 0 }}>
        <iframe src={`/preview/${product.id}?embed=1`} style={{ width: IW, height: IH, border: "none", transformOrigin: "top left", transform: `scale(${scale})`, pointerEvents: "none" }} scrolling="no" loading="lazy" />
      </div>
      {/* Solid footer — always visible below iframe */}
      <div style={{ background: "#fff", padding: "10px 12px 12px", borderTop: `2px solid ${color}15`, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 82, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#1F2937", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {product.name.replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim()}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 5 }}>
          {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: i <= Math.round(rating) ? "#F59E0B" : "#E5E7EB", fontSize: 11 }}>★</span>)}
          <span style={{ fontSize: 10, color: "#9CA3AF", marginLeft: 2 }}>{rating.toFixed(1)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 7 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {product.cuttedPrice && <span style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "line-through", lineHeight: 1 }}>₹{Math.floor(product.cuttedPrice / 100)}</span>}
            <span style={{ fontSize: 17, fontWeight: 900, color: "#1F2937", fontFamily: "'Nunito',sans-serif", lineHeight: 1.1 }}>₹{Math.floor(product.price / 100)}</span>
          </div>
          <button style={{ background: `linear-gradient(135deg,${color},${color}CC)`, color: "#fff", border: "none", borderRadius: 7, padding: "6px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 10px ${color}30` }}>
            View →
          </button>
        </div>
      </div>
    </div>
  );
}


/* ── Login Modal ── */
function LoginModal({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!phone.trim() || !email.trim()) { setError("Enter both phone and email."); return; }
    setLoading(true); setError("");
    try {
      const found = await getOrdersByBuyerDB(phone, email);
      setOrders(found);
      if (found.length === 0) setError("No orders found. Check your details.");
    } catch { setError("Something went wrong. Try again."); }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 14, color: "#1F2937", background: "#F9FAFB", outline: "none", boxSizing: "border-box" };
  const drafts = orders?.filter(o => o.status === "paid" || o.status === "editing") ?? [];
  const finalized = orders?.filter(o => o.status === "finalized") ?? [];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1000 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1001, width: "min(460px,92vw)", background: "#fff", borderRadius: 22, padding: "28px 24px", boxShadow: "0 32px 80px rgba(0,0,0,0.22)", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1F2937", fontFamily: "'Nunito',sans-serif" }}>My Orders</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9CA3AF" }}>×</button>
        </div>
        {orders === null ? (
          <>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 20, lineHeight: 1.6 }}>Enter the phone & email you used when purchasing.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input style={inputStyle} placeholder="Phone (e.g. 9876543210)" value={phone} onChange={e => setPhone(e.target.value)} />
              <input style={inputStyle} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
              {error && <p style={{ color: "#EF4444", fontSize: 13 }}>{error}</p>}
              <button onClick={handleLogin} disabled={loading} style={{ padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7C3AED,#EC4899)", color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Looking up…" : "Find My Orders →"}
              </button>
            </div>
          </>
        ) : (
          <>
            {drafts.length > 0 && (<div style={{ background: "#FEF3C7", borderRadius: 12, padding: "12px 16px", marginBottom: 14, border: "1px solid #FCD34D" }}><p style={{ fontWeight: 700, color: "#92400E", fontSize: 13 }}>⚠️ {drafts.length} draft{drafts.length > 1 ? "s" : ""} awaiting personalisation</p></div>)}
            {drafts.map(o => (
              <div key={o.id} style={{ background: "#F5F3FF", borderRadius: 12, padding: 16, border: "1px solid #DDD6FE", marginBottom: 10 }}>
                <p style={{ fontWeight: 700, color: "#1F2937", fontSize: 14 }}>{o.productName}</p>
                <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                <Link href={`/edit/${o.id}`} onClick={onClose} style={{ display: "inline-block", marginTop: 10, background: "linear-gradient(135deg,#7C3AED,#EC4899)", color: "#fff", padding: "8px 18px", borderRadius: 999, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>Continue Editing ✍️</Link>
              </div>
            ))}
            {finalized.map(o => (
              <div key={o.id} style={{ background: "#F0FDF4", borderRadius: 12, padding: 16, border: "1px solid #BBF7D0", marginBottom: 10 }}>
                <p style={{ fontWeight: 700, color: "#1F2937", fontSize: 14 }}>{o.productName}</p>
                <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>For: {o.buyerName} · ₹{Math.floor(o.amount / 100)}</p>
                <Link href={`/view/${o.id}`} onClick={onClose} style={{ display: "inline-block", marginTop: 10, background: "#10B981", color: "#fff", padding: "8px 18px", borderRadius: 999, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>View Your Page 🔗</Link>
              </div>
            ))}
            <button onClick={() => setOrders(null)} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 13, marginTop: 8 }}>← Try different details</button>
          </>
        )}
      </div>
    </>
  );
}

/* ── Product Quick-View Modal ── */
function ProductModal({ product, accent, onClose }: { product: Product; accent: string; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const u = () => setScale(el.offsetWidth / 390);
    u(); const ro = new ResizeObserver(u); ro.observe(el); return () => ro.disconnect();
  }, []);
  const IW = 390, IH = IW * 4 / 3;
  const rating = (product as any).rating ?? 4.5;
  const reviewCount = (product as any).reviewCount;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 900 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 901, width: "min(860px,95vw)", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 22, boxShadow: "0 40px 100px rgba(0,0,0,0.28)", display: "flex", flexWrap: "wrap" }}>
        {/* Preview pane */}
        <div ref={containerRef} style={{ flex: "1 1 300px", minHeight: 280, position: "relative", overflow: "hidden", borderRadius: "22px 0 0 22px", background: `${accent}10` }}>
          <iframe src={`/preview/${product.id}?embed=1`} style={{ width: IW, height: IH, border: "none", transformOrigin: "top left", transform: `scale(${scale})`, pointerEvents: "none" }} scrolling="no" loading="lazy" />
        </div>
        {/* Details pane */}
        <div style={{ flex: "1 1 260px", padding: "28px 24px" }}>
          <button onClick={onClose} style={{ float: "right", background: "#F3F4F6", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 18, color: "#6B7280" }}>×</button>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1F2937", fontFamily: "'Nunito',sans-serif", lineHeight: 1.3, marginTop: 4, paddingRight: 36 }}>{product.name.replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim()}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10 }}>
            {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: i <= Math.round(rating) ? "#F59E0B" : "#E5E7EB", fontSize: 18 }}>★</span>)}
            <span style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginLeft: 4 }}>{rating.toFixed(1)}{reviewCount ? ` (${reviewCount})` : ""}</span>
          </div>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 14, lineHeight: 1.7 }}>{product.tagline}</p>
          <div style={{ marginTop: 16 }}>{product.slides.slice(0, 5).map(s => <div key={s.slideNumber} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: accent, flexShrink: 0 }} /><span style={{ fontSize: 13, color: "#374151" }}>{s.title}</span></div>)}</div>
          <div style={{ margin: "20px 0", padding: "14px 0", borderTop: "1px solid #F3F4F6", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: "#1F2937", fontFamily: "'Nunito',sans-serif" }}>₹{Math.floor(product.price / 100)}</span>
            {product.cuttedPrice && <span style={{ fontSize: 16, color: "#9CA3AF", textDecoration: "line-through", fontWeight: 600 }}>₹{Math.floor(product.cuttedPrice / 100)}</span>}
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>one-time</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href={`/order/${product.id}`} style={{ display: "block", textAlign: "center", background: `linear-gradient(135deg,${accent},${accent}BB)`, color: "#fff", padding: "15px", borderRadius: 13, textDecoration: "none", fontWeight: 900, fontSize: 15, fontFamily: "'Nunito',sans-serif", boxShadow: `0 8px 24px ${accent}35` }}>Buy &amp; Personalise ₹{Math.floor(product.price / 100)} →</Link>
            <Link href={`/preview/${product.id}`} style={{ display: "block", textAlign: "center", background: "#F9FAFB", color: "#374151", padding: "12px", borderRadius: 13, textDecoration: "none", fontWeight: 700, fontSize: 13, border: "1px solid #E5E7EB" }}>🔍 View Full Preview</Link>
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 16 }}>{["🔒 Secure", "📩 Instant", "💌 Shareable"].map(b => <span key={b} style={{ fontSize: 11, color: "#9CA3AF" }}>{b}</span>)}</div>
        </div>
      </div>
    </>
  );
}

/* ── SVG Decorators per theme ── */
function HeartSVG({ size = 32, color = "#fff", opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ opacity }}>
      <path d="M16 28S4 20 4 11.5C4 8 7 5 10.5 5c2.2 0 4.1 1.1 5.5 2.8C17.4 6.1 19.3 5 21.5 5 25 5 28 8 28 11.5 28 20 16 28 16 28Z" fill={color} />
    </svg>
  );
}
function StarSVG({ size = 28, color = "#fff", opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={{ opacity }}>
      <path d="M14 2l2.9 8.6H26l-7.4 5.3 2.9 8.6L14 19.2l-7.5 5.3 2.9-8.6L2 10.6h9.1Z" fill={color} />
    </svg>
  );
}
function DiamondSVG({ size = 28, color = "#fff", opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={{ opacity }}>
      <path d="M14 2L26 11l-12 15L2 11Z" fill={color} />
      <path d="M2 11h24" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    </svg>
  );
}
function RibbonSVG({ width = 80, color = "#fff", opacity = 0.18 }: { width?: number; color?: string; opacity?: number }) {
  return (
    <svg width={width} height={32} viewBox="0 0 80 32" fill="none" style={{ opacity }}>
      <path d="M0 16 Q20 2 40 16 Q60 30 80 16" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M0 22 Q20 8 40 22 Q60 36 80 22" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
function RingSVG({ size = 36, color = "#fff", opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" style={{ opacity }}>
      <circle cx="18" cy="18" r="12" stroke={color} strokeWidth="3" fill="none" />
      <circle cx="18" cy="18" r="7" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M12 10 L18 6 L24 10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function SunRaySVG({ size = 44, color = "#fff", opacity = 0.25 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" style={{ opacity }}>
      <circle cx="22" cy="22" r="8" fill={color} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <line key={i} x1="22" y1="22"
          x2={22 + 16 * Math.cos(deg * Math.PI / 180)}
          y2={22 + 16 * Math.sin(deg * Math.PI / 180)}
          stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </svg>
  );
}
function SparkSVG({ size = 20, color = "#fff", opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ opacity }}>
      <path d="M10 1v18M1 10h18M3.5 3.5l13 13M16.5 3.5l-13 13" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* Theme → decorator renderer */
function OccasionDecorators({ theme }: { theme: ReturnType<typeof getSectionTheme> }) {
  const c = "rgba(255,255,255,0.9)";

  if (theme.isPremium) {
    if (theme.id === "festival_plus") {
      // Rangoli / Mandala inspired background
      return (
        <>
          <div style={{ position: "absolute", right: "-10%", top: "-30%", opacity: 0.15, pointerEvents: "none" }}>
            <svg width="240" height="240" viewBox="0 0 100 100" fill="none">
              <path d="M50 0 C60 40 100 50 100 50 C60 60 50 100 50 100 C40 60 0 50 0 50 C40 40 50 0 50 0 Z" fill="#fff" />
              <circle cx="50" cy="50" r="25" stroke="#fff" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="50" cy="50" r="15" stroke="#fff" strokeWidth="1" />
            </svg>
          </div>
          <div style={{ position: "absolute", left: "-5%", bottom: "-20%", opacity: 0.1, pointerEvents: "none" }}>
            <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
              <path d="M50 0 C60 40 100 50 100 50 C60 60 50 100 50 100 C40 60 0 50 0 50 C40 40 50 0 50 0 Z" fill="#fff" />
            </svg>
          </div>
          <div className="twinkle-1" style={{ position: "absolute", top: 10, right: 40, pointerEvents: "none" }}><SparkSVG size={32} color={c} opacity={0.4} /></div>
          <div className="twinkle-2" style={{ position: "absolute", bottom: 20, right: 120, pointerEvents: "none" }}><SparkSVG size={20} color={c} opacity={0.3} /></div>
        </>
      );
    }
    if (theme.id === "birthday_plus") {
      // Big balloons / Confetti Poppers
      return (
        <>
          <div className="float-drift-1" style={{ position: "absolute", left: "10%", top: "10%", opacity: 0.4, pointerEvents: "none" }}>
            <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
              <rect x="20" y="20" width="8" height="16" fill="#FFD700" transform="rotate(45 24 28)" />
              <circle cx="60" cy="30" r="6" fill="#fff" />
              <polygon points="40,70 46,82 34,82" fill="#4ECDC4" transform="rotate(20 40 76)" />
              <rect x="70" y="60" width="6" height="12" fill="#FFA07A" transform="rotate(-30 73 66)" />
              <circle cx="80" cy="80" r="4" fill="#fff" />
              <rect x="10" y="80" width="10" height="10" fill="#FF6B6B" transform="rotate(15 15 85)" />
            </svg>
          </div>
          <div className="float-drift-1" style={{ position: "absolute", right: "5%", top: "10%", opacity: 0.15, pointerEvents: "none" }}>
            <svg width="120" height="150" viewBox="0 0 50 80" fill="none">
              <ellipse cx="25" cy="30" rx="20" ry="25" fill="#fff" />
              <path d="M25 55 L22 65 L28 65 Z" fill="#fff" />
              <path d="M25 65 Q 30 75 25 80" stroke="#fff" fill="none" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="twinkle-1" style={{ position: "absolute", top: 12, right: 24, pointerEvents: "none" }}><StarSVG size={40} color={c} opacity={0.3} /></div>
          <div className="twinkle-2" style={{ position: "absolute", top: 20, right: 160, pointerEvents: "none" }}><StarSVG size={24} color={c} opacity={0.25} /></div>
          <div className="ribbon-sway" style={{ position: "absolute", bottom: 0, right: "20%", pointerEvents: "none" }}><RibbonSVG width={180} color="#fff" opacity={0.15} /></div>
        </>
      );
    }
    if (theme.id === "valentine_plus" || theme.id === "love_plus") {
      // Giant Hearts
      return (
        <>
          <div className="heart-beat" style={{ position: "absolute", right: "-5%", top: "-10%", opacity: 0.12, pointerEvents: "none" }}>
            <HeartSVG size={200} color="#fff" opacity={1} />
          </div>
          <div className="float-drift-1" style={{ position: "absolute", right: "40%", bottom: "-10%", opacity: 0.1, pointerEvents: "none" }}>
            <HeartSVG size={100} color="#fff" opacity={1} />
          </div>
          <div className="float-drift-2" style={{ position: "absolute", top: 15, right: 120, pointerEvents: "none" }}><HeartSVG size={32} color={c} opacity={0.3} /></div>
        </>
      );
    }
    if (theme.id === "anniversary_plus") {
      // Wired LED light hanging
      return (
        <>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 60, pointerEvents: "none" }}>
            <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none" fill="none">
              {/* Wires */}
              <path d="M-10 10 Q 40 40 100 10 T 210 10" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" fill="none" />
              <path d="M-10 20 Q 60 55 120 15 T 210 20" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" fill="none" />

              {/* Glowing LED Bulbs */}
              <circle cx="20" cy="18" r="2.5" fill="#fff" filter="drop-shadow(0 0 4px #fff)" className="twinkle-1" />
              <circle cx="60" cy="28" r="2.5" fill="#fff" filter="drop-shadow(0 0 4px #fff)" className="twinkle-2" />
              <circle cx="90" cy="18" r="2.5" fill="#fff" filter="drop-shadow(0 0 4px #fff)" className="twinkle-3" />
              <circle cx="130" cy="12" r="2.5" fill="#fff" filter="drop-shadow(0 0 4px #fff)" className="twinkle-1" />
              <circle cx="170" cy="22" r="2.5" fill="#fff" filter="drop-shadow(0 0 4px #fff)" className="twinkle-2" />
              <circle cx="40" cy="35" r="2" fill="#fff" filter="drop-shadow(0 0 3px #fff)" className="twinkle-3" />
              <circle cx="110" cy="30" r="2" fill="#fff" filter="drop-shadow(0 0 3px #fff)" className="twinkle-1" />
              <circle cx="150" cy="25" r="2" fill="#fff" filter="drop-shadow(0 0 3px #fff)" className="twinkle-2" />
            </svg>
          </div>
          <div className="twinkle-1" style={{ position: "absolute", bottom: 10, right: 100, pointerEvents: "none" }}><DiamondSVG size={30} color={c} opacity={0.3} /></div>
        </>
      );
    }
    if (theme.id === "wedding_plus") {
      // Elegant interlocking rings / florish
      return (
        <>
          <div className="float-drift-1" style={{ position: "absolute", right: "5%", top: "10%", opacity: 0.15, pointerEvents: "none" }}>
            <svg width="150" height="100" viewBox="0 0 100 60" fill="none">
              <circle cx="35" cy="30" r="25" stroke="#fff" strokeWidth="4" />
              <circle cx="65" cy="30" r="25" stroke="#fff" strokeWidth="4" />
            </svg>
          </div>
          <div className="twinkle-1" style={{ position: "absolute", bottom: 10, right: 100, pointerEvents: "none" }}><DiamondSVG size={30} color={c} opacity={0.3} /></div>
          <div className="ribbon-sway" style={{ position: "absolute", bottom: 0, left: "20%", pointerEvents: "none" }}><RibbonSVG width={200} color="#fff" opacity={0.15} /></div>
        </>
      );
    }
  }

  // Regular theme decorations
  if (theme.id.startsWith("valentine") || theme.id.startsWith("love")) {
    return (
      <>
        <div className="float-drift-1" style={{ position: "absolute", top: 14, right: 28, pointerEvents: "none" }}><HeartSVG size={44} color={c} opacity={0.22} /></div>
        <div className="float-drift-2" style={{ position: "absolute", top: 8, right: 90, pointerEvents: "none" }}><HeartSVG size={26} color={c} opacity={0.15} /></div>
        <div className="float-drift-3" style={{ position: "absolute", bottom: 10, right: 50, pointerEvents: "none" }}><HeartSVG size={32} color={c} opacity={0.12} /></div>
        <div className="float-drift-4" style={{ position: "absolute", top: 20, right: 160, pointerEvents: "none" }}><HeartSVG size={18} color={c} opacity={0.18} /></div>
        <div className="float-drift-1" style={{ position: "absolute", bottom: 8, right: 200, pointerEvents: "none" }}><SparkSVG size={16} color={c} opacity={0.15} /></div>
        <div className="ribbon-sway" style={{ position: "absolute", bottom: 0, left: "30%", pointerEvents: "none" }}><RibbonSVG width={120} color="#fff" opacity={0.12} /></div>
      </>
    );
  }
  if (theme.id.startsWith("birthday")) {
    return (
      <>
        <div className="twinkle-1" style={{ position: "absolute", top: 12, right: 24, pointerEvents: "none" }}><StarSVG size={36} color={c} opacity={0.22} /></div>
        <div className="twinkle-2" style={{ position: "absolute", top: 8, right: 80, pointerEvents: "none" }}><SparkSVG size={20} color={c} opacity={0.2} /></div>
        <div className="twinkle-3" style={{ position: "absolute", bottom: 12, right: 60, pointerEvents: "none" }}><StarSVG size={22} color={c} opacity={0.14} /></div>
        <div className="float-drift-2" style={{ position: "absolute", top: 16, right: 150, pointerEvents: "none" }}><StarSVG size={16} color={c} opacity={0.18} /></div>
        <div className="twinkle-1" style={{ position: "absolute", bottom: 6, right: 180, pointerEvents: "none" }}><SparkSVG size={14} color={c} opacity={0.15} /></div>
        <div className="ribbon-sway" style={{ position: "absolute", top: 0, right: "20%", pointerEvents: "none" }}><RibbonSVG width={100} color="#fff" opacity={0.1} /></div>
      </>
    );
  }
  if (theme.id.startsWith("anniversary") || theme.id.startsWith("wedding")) {
    return (
      <>
        <div className="float-drift-1" style={{ position: "absolute", top: 12, right: 24, pointerEvents: "none" }}><RingSVG size={44} color={c} opacity={0.22} /></div>
        <div className="float-drift-2" style={{ position: "absolute", top: 6, right: 90, pointerEvents: "none" }}><DiamondSVG size={24} color={c} opacity={0.2} /></div>
        <div className="twinkle-1" style={{ position: "absolute", bottom: 10, right: 55, pointerEvents: "none" }}><SparkSVG size={18} color={c} opacity={0.18} /></div>
        <div className="float-drift-3" style={{ position: "absolute", top: 20, right: 160, pointerEvents: "none" }}><HeartSVG size={18} color={c} opacity={0.15} /></div>
        <div className="ribbon-sway" style={{ position: "absolute", bottom: 0, left: "40%", pointerEvents: "none" }}><RibbonSVG width={140} color="#fff" opacity={0.1} /></div>
      </>
    );
  }
  if (theme.id.startsWith("friendship")) {
    return (
      <>
        <div className="float-drift-1" style={{ position: "absolute", top: 10, right: 24, pointerEvents: "none" }}><SunRaySVG size={48} color={c} opacity={0.2} /></div>
        <div className="twinkle-2" style={{ position: "absolute", top: 8, right: 90, pointerEvents: "none" }}><StarSVG size={22} color={c} opacity={0.15} /></div>
        <div className="twinkle-1" style={{ position: "absolute", bottom: 10, right: 60, pointerEvents: "none" }}><SparkSVG size={16} color={c} opacity={0.18} /></div>
        <div className="float-drift-4" style={{ position: "absolute", top: 18, right: 155, pointerEvents: "none" }}><SunRaySVG size={28} color={c} opacity={0.12} /></div>
      </>
    );
  }
  if (theme.id.startsWith("festival")) {
    return (
      <>
        <div className="twinkle-1" style={{ position: "absolute", top: 10, right: 24, pointerEvents: "none" }}><SparkSVG size={32} color={c} opacity={0.22} /></div>
        <div className="twinkle-2" style={{ position: "absolute", top: 6, right: 80, pointerEvents: "none" }}><StarSVG size={26} color={c} opacity={0.18} /></div>
        <div className="twinkle-3" style={{ position: "absolute", bottom: 10, right: 55, pointerEvents: "none" }}><DiamondSVG size={20} color={c} opacity={0.15} /></div>
        <div className="float-drift-3" style={{ position: "absolute", top: 16, right: 155, pointerEvents: "none" }}><SparkSVG size={14} color={c} opacity={0.14} /></div>
        <div className="ribbon-sway" style={{ position: "absolute", bottom: 0, right: "25%", pointerEvents: "none" }}><RibbonSVG width={110} color="#fff" opacity={0.1} /></div>
      </>
    );
  }
  // general / default
  return (
    <>
      <div className="float-drift-1" style={{ position: "absolute", top: 12, right: 24, pointerEvents: "none" }}><DiamondSVG size={36} color={c} opacity={0.2} /></div>
      <div className="twinkle-2" style={{ position: "absolute", top: 8, right: 85, pointerEvents: "none" }}><SparkSVG size={20} color={c} opacity={0.16} /></div>
      <div className="float-drift-2" style={{ position: "absolute", bottom: 10, right: 55, pointerEvents: "none" }}><StarSVG size={20} color={c} opacity={0.14} /></div>
      <div className="ribbon-sway" style={{ position: "absolute", bottom: 0, left: "35%", pointerEvents: "none" }}><RibbonSVG width={100} color="#fff" opacity={0.1} /></div>
    </>
  );
}

/* ── Scroll Arrow Button ── */
function ArrowBtn({ dir, accent, onClick }: { dir: "left" | "right"; accent: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        top: "50%", transform: "translateY(-50%)",
        [dir]: 6,
        zIndex: 20,
        width: 36, height: 36, borderRadius: "50%",
        background: "#fff",
        border: `1.5px solid ${accent}44`,
        boxShadow: `0 4px 16px ${accent}28`,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: accent, padding: 0,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        {dir === "right"
          ? <path d="M6.5 4l5 5-5 5" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M11.5 4l-5 5 5 5" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        }
      </svg>
    </button>
  );
}

/* ── Cutout Style Helper ── */
function getCutoutStyle(cutout?: string, color: string = "#ffffff"): React.CSSProperties {
  if (!cutout || cutout === "none") return { display: "none" };

  let svg = "";
  let height = 10;
  let width = 20;

  if (cutout === "zigzag") {
    // Sharp triangle edge
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 10"><polygon points="0,-5 10,10 20,-5" fill="${color}"/></svg>`;
  } else if (cutout === "wavy") {
    // Standard repeating bumps
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 10"><path d="M0 -5 L 0 0 Q 10 10 20 0 T 40 0 L 40 -5 Z" fill="${color}"/></svg>`;
    width = 40;
  } else if (cutout === "wavy_stretched") {
    // Longer stretched bumps
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 15"><path d="M0 -5 L 0 0 Q 20 15 40 0 T 80 0 L 80 -5 Z" fill="${color}"/></svg>`;
    width = 80;
    height = 15;
  } else if (cutout === "circular") {
    // Scalloped cutouts
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 10"><path d="M0 -5 L 0 0 A 10 10 0 0 0 20 0 L 20 -5 Z" fill="${color}"/></svg>`;
  } else if (cutout === "liquid_wave") {
    // Smooth oscillating liquid sine wave (positive and negative peaks)
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><path d="M0 -5 L 0 10 C 25 25, 75 -5, 100 10 L 100 -5 Z" fill="${color}"/></svg>`;
    width = 100;
    height = 20;
  }

  if (!svg) return {};

  const encoded = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  return {
    position: "absolute",
    top: -1,
    left: 0,
    width: "100%",
    height: height,
    backgroundImage: `url("${encoded}")`,
    backgroundRepeat: "repeat-x",
    backgroundSize: `${width}px ${height}px`,
    zIndex: 10
  };
}

/* ── Occasion Section — Full-width shelf ── */
function OccasionSection({ section, products, onCardClick }: { section: DisplaySection; products: Product[]; onCardClick: (p: Product, accent?: string) => void }) {
  const theme = getSectionTheme(section.theme);
  const sectionProducts = products.filter(p => section.productIds.includes(p.id));
  if (sectionProducts.length === 0) return null;

  const titleSizes = {
    small: "clamp(12px, 1.5vw, 16px)",
    normal: "clamp(14px, 2vw, 20px)",
    medium: "clamp(18px, 3vw, 26px)",
    big: "clamp(24px, 4vw, 36px)",
    bigger: "clamp(32px, 6vw, 48px)"
  };
  const titleSize = titleSizes[section.titleSize || "normal"];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    if (!section.countdownEnabled || !section.countdownEndTime) return;
    const end = new Date(section.countdownEndTime).getTime();

    const update = () => {
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft(null);
      } else {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60),
        });
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [section.countdownEnabled, section.countdownEndTime]);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  return (
    <section id={`section-${section.id}`} className="occasion-banner-reveal" style={{
      width: "100%",
      background: theme.isPremium ? theme.gradient : theme.bgLight,
      position: "relative",
      overflow: "hidden",
      marginBottom: section.bottomSpaceEnabled ? `${section.bottomSpacePx || 40}px` : undefined,
    }}>
      {/* ── GRADIENT HEADER — full width, no radius ── */}
      <div style={{
        background: theme.gradient,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grain */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          opacity: 0.04,
        }} />
        {/* Shine */}
        <div style={{
          position: "absolute", top: 0, left: "-15%", width: "45%", height: "100%",
          background: "linear-gradient(105deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none",
        }} />

        <OccasionDecorators theme={theme} />

        {/* Top Cutout */}
        {section.headerStyle === "new" && section.headerCutout && section.headerCutout !== "none" && (
          <div style={getCutoutStyle(section.headerCutout, "#ffffff")} />
        )}

        {/* Header Content conditionally rendered based on headerStyle */}
        {section.headerStyle === "new" ? (
          <div style={{
            padding: "20px clamp(14px,3vw,40px) 16px",
            display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
            position: "relative", zIndex: 2, overflow: "hidden"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ height: 1, width: 40, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6))" }} />
              <h2 style={{
                fontSize: `calc(${titleSize} + 4px)`, fontWeight: 700,
                color: "#fff", fontFamily: section.headerFontFamily || "'Dancing Script', cursive",
                lineHeight: 1.2, margin: 0,
                textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                letterSpacing: 0.5,
              }}>
                {section.title}
              </h2>
              <div style={{ height: 1, width: 40, background: "linear-gradient(270deg, transparent, rgba(255,255,255,0.6))" }} />
            </div>

            {section.subtitle && (
              <p style={{
                fontSize: "clamp(10px,1.5vw,12px)", color: "rgba(255,255,255,0.85)",
                marginTop: 6, lineHeight: 1.3,
                fontFamily: "'Nunito', sans-serif",
                letterSpacing: "0.1em",
                textTransform: "uppercase", fontWeight: 800
              }}>
                {section.subtitle}
              </p>
            )}

            {section.headerNoteEnabled && section.headerNote && (
              <div
                style={{
                  marginTop: 10,
                  padding: "4px 12px",
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(4px)",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.3)",
                  fontSize: "clamp(10px,1.5vw,12px)",
                  color: "#fff",
                  display: "inline-block",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
                dangerouslySetInnerHTML={{ __html: section.headerNote }}
              />
            )}

            {timeLeft && (
              <div style={{ display: "flex", gap: 6, marginTop: 12, alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: "rgba(255,255,255,0.9)" }}>Ends In:</span>
                <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 4, padding: "2px 6px", color: "#fff", fontWeight: 800, fontSize: 11, border: "1px solid rgba(255,255,255,0.15)" }}>{timeLeft.d}d</div>
                <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 4, padding: "2px 6px", color: "#fff", fontWeight: 800, fontSize: 11, border: "1px solid rgba(255,255,255,0.15)" }}>{timeLeft.h}h</div>
                <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 4, padding: "2px 6px", color: "#fff", fontWeight: 800, fontSize: 11, border: "1px solid rgba(255,255,255,0.15)" }}>{timeLeft.m}m</div>
                <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 4, padding: "2px 6px", color: "#fff", fontWeight: 800, fontSize: 11, border: "1px solid rgba(255,255,255,0.15)" }}>{timeLeft.s}s</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            padding: "14px clamp(14px,3vw,40px)",
            display: "flex", alignItems: "center", gap: 12, flexWrap: "nowrap",
            position: "relative", zIndex: 2, overflow: "hidden",
          }}>
            {/* Icon orb */}
            <div style={{
              width: 44, height: 44, borderRadius: 13, flexShrink: 0,
              background: "rgba(255,255,255,0.22)",
              backdropFilter: "blur(10px)",
              border: "1.5px solid rgba(255,255,255,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {(theme.id.startsWith("valentine") || theme.id.startsWith("love")) && <div className="heart-beat"><HeartSVG size={22} color="#fff" opacity={0.95} /></div>}
              {theme.id.startsWith("birthday") && <StarSVG size={21} color="#fff" opacity={0.95} />}
              {(theme.id.startsWith("anniversary") || theme.id.startsWith("wedding")) && <RingSVG size={22} color="#fff" opacity={0.95} />}
              {theme.id.startsWith("friendship") && <SunRaySVG size={24} color="#fff" opacity={0.9} />}
              {theme.id.startsWith("festival") && <SparkSVG size={20} color="#fff" opacity={0.95} />}
              {theme.id.startsWith("general") && <DiamondSVG size={20} color="#fff" opacity={0.95} />}
            </div>

            {/* Title + subtitle — clipped if needed */}
            <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <h2 style={{
                fontSize: titleSize, fontWeight: 900,
                color: "#fff", fontFamily: "'Nunito',sans-serif",
                lineHeight: 1.2, margin: 0,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                textShadow: "0 2px 8px rgba(0,0,0,0.18)",
              }}>
                {section.title}
              </h2>
              <p style={{
                fontSize: "clamp(11px,1.5vw,13px)", color: "rgba(255,255,255,0.82)",
                marginTop: 2, lineHeight: 1.4,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {section.subtitle}
              </p>
              {section.headerNoteEnabled && section.headerNote && (
                <div
                  style={{
                    marginTop: 6,
                    padding: "6px 12px",
                    background: "rgba(0,0,0,0.15)",
                    borderRadius: 8,
                    borderLeft: "3px solid rgba(255,255,255,0.5)",
                    fontSize: "clamp(11px,1.5vw,13px)",
                    color: "rgba(255,255,255,0.9)",
                    display: "inline-block"
                  }}
                  dangerouslySetInnerHTML={{ __html: section.headerNote }}
                />
              )}
              {timeLeft && (
                <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: "rgba(255,255,255,0.9)", marginRight: 4 }}>Ends In:</span>
                  <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 6, padding: "4px 8px", color: "#fff", fontWeight: 800, fontSize: 12, border: "1px solid rgba(255,255,255,0.15)" }}>{timeLeft.d}d</div>
                  <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 6, padding: "4px 8px", color: "#fff", fontWeight: 800, fontSize: 12, border: "1px solid rgba(255,255,255,0.15)" }}>{timeLeft.h}h</div>
                  <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 6, padding: "4px 8px", color: "#fff", fontWeight: 800, fontSize: 12, border: "1px solid rgba(255,255,255,0.15)" }}>{timeLeft.m}m</div>
                  <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 6, padding: "4px 8px", color: "#fff", fontWeight: 800, fontSize: 12, border: "1px solid rgba(255,255,255,0.15)" }}>{timeLeft.s}s</div>
                </div>
              )}
            </div>

            {/* Count pill — always visible */}
            <div style={{
              flexShrink: 0,
              background: "rgba(255,255,255,0.22)",
              backdropFilter: "blur(10px)",
              border: "1.5px solid rgba(255,255,255,0.3)",
              borderRadius: 10, padding: "6px 14px",
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1, fontFamily: "'Nunito',sans-serif" }}>
                {sectionProducts.length}
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.75)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                {sectionProducts.length === 1 ? "Gift" : "Gifts"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── CARD SHELF — horizontal scroll with arrows ── */}
      <div style={{ background: theme.isPremium ? "transparent" : theme.bgLight, position: "relative" }}>

        {/* Premium Background Effects */}
        {theme.isPremium && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            opacity: 0.08,
            mixBlendMode: "overlay"
          }} />
        )}
        {theme.isPremium && (
          <div style={{
            position: "absolute", bottom: "-20%", right: "-10%", width: "50%", height: "80%",
            background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
            pointerEvents: "none", zIndex: 0,
          }} />
        )}

        {/* Glitter effect for Wedding++ */}
        {theme.id === "wedding_plus" && (
          <div className="twinkle-1" style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='white' opacity='0.8' /%3E%3Ccircle cx='40' cy='30' r='1' fill='white' opacity='0.5' /%3E%3Ccircle cx='80' cy='20' r='2' fill='white' opacity='0.6' /%3E%3Ccircle cx='20' cy='80' r='1' fill='white' opacity='0.9' /%3E%3Ccircle cx='70' cy='70' r='1.5' fill='white' opacity='0.4' /%3E%3Ccircle cx='90' cy='90' r='1' fill='white' opacity='0.7' /%3E%3Ccircle cx='50' cy='90' r='2' fill='white' opacity='0.5' /%3E%3Ccircle cx='30' cy='50' r='1.5' fill='white' opacity='0.8' /%3E%3C/svg%3E\")",
            opacity: 0.6,
            mixBlendMode: "screen",
          }} />
        )}

        {/* Left arrow */}
        {canLeft && <ArrowBtn dir="left" accent={theme.accent} onClick={() => scroll("left")} />}
        {/* Right arrow */}
        {canRight && <ArrowBtn dir="right" accent={theme.accent} onClick={() => scroll("right")} />}

        {/* Scroll row */}
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          style={{
            position: "relative", zIndex: 1,
            display: "flex",
            gap: 12,
            overflowX: "auto",
            padding: "18px clamp(14px,3vw,32px) 22px",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {sectionProducts.map(p => (
            <div
              key={p.id}
              style={{
                flexShrink: 0,
                /* 2 cards on mobile → grow to 260px max on desktop */
                width: "clamp(160px, calc(50vw - 26px), 260px)",
                scrollSnapAlign: "start",
              }}
            >
              <ProductCard product={p} accent={theme.accent} onCardClick={p => onCardClick(p, theme.accent)} />
            </div>
          ))}
        </div>

        {/* Bottom Fade Effect for Plus Themes */}
        {section.theme.includes("_plus") && section.fadeEnabled && (
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, width: "100%",
            height: section.fadeLength || 100,
            background: "linear-gradient(to top, #FFFFFF, transparent)",
            pointerEvents: "none",
            zIndex: 10
          }} />
        )}
      </div>

      {/* Bottom Cutout */}
      {section.headerStyle === "new" && section.bottomCutout && section.bottomCutout !== "none" && (
        <div style={{
          ...getCutoutStyle(section.bottomCutout, "#FFFFFF"),
          top: "auto",
          bottom: -1,
          transform: "scaleY(-1)",
          zIndex: 10
        }} />
      )}
    </section>
  );
}

/* ── All Gifts fallback ── */
function AllGifts({ products, onCardClick }: { products: Product[]; onCardClick: (p: Product, accent?: string) => void }) {
  if (products.length === 0) return null;
  return (
    <section id="gifts" style={{ padding: "60px clamp(16px,4vw,48px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Nunito',sans-serif", color: "#1A1A2E" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><GiftSVG size={28} color="#1A1A2E" /> All Gift Pages</span>
        </h2>
        <p style={{ fontSize: 15, color: "#9CA3AF", marginTop: 6 }}>Browse our complete collection</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20, marginTop: 28 }}>
          {products.map(p => (
            <ProductCard key={p.id} product={p} onCardClick={onCardClick} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer({ settings }: { settings: Settings | null }) {
  return (
    <footer style={{
      background: "linear-gradient(to bottom, #0F172A, #020617)",
      color: "#94A3B8",
      padding: "60px clamp(16px,4vw,48px) 30px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      fontFamily: "'Nunito', sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative Radial glow effect */}
      <div style={{
        position: "absolute",
        top: -150,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(600px, 100vw)",
        height: 300,
        background: "radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 }}>

        {/* Top footer grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 40,
          textAlign: "left",
          marginBottom: 48
        }}>

          {/* Column 1: Brand & Info (Both logos paired) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <img src="/logo.png" alt="Aradhya E-Gifts" style={{ height: 36, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
              <span style={{ fontSize: 13, color: "#334155", fontWeight: 700 }}>|</span>
              <img src="/as-studios.png" alt="AS Studios" style={{ height: 26, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "#64748B" }}>
              Crafting premium, custom-designed digital surprise web microsites that bring immense joy to your loved ones. Make their day magical in one single click.
            </p>
            {/* Badges/Info */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", background: "rgba(16, 185, 129, 0.1)", color: "#10B981", padding: "4px 8px", borderRadius: 4, letterSpacing: 0.5, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <LockSVG size={10} color="#10B981" /> Secure Checkout
              </span>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", background: "rgba(124, 58, 237, 0.1)", color: "#A78BFA", padding: "4px 8px", borderRadius: 4, letterSpacing: 0.5, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <LightningSVG size={10} color="#A78BFA" /> Instant Live
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ color: "#F8FAFC", fontSize: 15, fontWeight: 800, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>Quick Navigation</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              <li>
                <a href="#" style={{ color: "#94A3B8", textDecoration: "none", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 8 }} onMouseEnter={e => e.currentTarget.style.color = "#A78BFA"} onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}>
                  <HomeSVG size={14} color="currentColor" /> Home Page
                </a>
              </li>
              <li>
                <a href="#gifts" style={{ color: "#94A3B8", textDecoration: "none", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 8 }} onMouseEnter={e => e.currentTarget.style.color = "#A78BFA"} onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}>
                  <GiftSVG size={14} color="currentColor" /> Explore Surprises
                </a>
              </li>
              <li>
                <a href="/my-orders" style={{ color: "#94A3B8", textDecoration: "none", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 8 }} onMouseEnter={e => e.currentTarget.style.color = "#A78BFA"} onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}>
                  <PencilSVG size={14} color="currentColor" /> Personalise Drafts
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h4 style={{ color: "#F8FAFC", fontSize: 15, fontWeight: 800, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>Get In Touch</h4>
            {settings && (settings.contactEmail || settings.contactPhone || settings.contactAddress) ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13 }}>
                {settings.contactEmail && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MailSVG size={14} color="#A78BFA" />
                    <a href={`mailto:${settings.contactEmail}`} style={{ color: "#94A3B8", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#A78BFA"} onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}>{settings.contactEmail}</a>
                  </div>
                )}
                {settings.contactPhone && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <PhoneSVG size={14} color="#A78BFA" />
                    <a href={`tel:${settings.contactPhone}`} style={{ color: "#94A3B8", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#A78BFA"} onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}>{settings.contactPhone}</a>
                  </div>
                )}
                {settings.contactAddress && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ display: "inline-flex", marginTop: 2 }}><MapPinSVG size={14} color="#A78BFA" /></span>
                    <span style={{ color: "#94A3B8", lineHeight: 1.4 }}>{settings.contactAddress}</span>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#64748B" }}>Support available 24/7. Reach out via email or phone for order queries.</p>
            )}
          </div>

        </div>

        {/* Bottom copyright / India love bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 24,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          fontSize: 12,
          color: "#64748B"
        }}>
          <div>
            <span>© {new Date().getFullYear()} A Product of <strong>AS-STUDIOS</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>Made with</span>
            <span style={{ display: "inline-flex", color: "#EF4444", animation: "heartbeat 1.5s infinite" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </span>
            <span>in India</span>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes heartbeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}} />
    </footer>
  );
}

/* ── Menu Drawer (Slide-out Sidebar Navigation) ── */
function MenuDrawer({ isOpen, onClose, sections }: { isOpen: boolean; onClose: () => void; sections: DisplaySection[] }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2, 6, 23, 0.4)",
          backdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
          zIndex: 1000,
        }} 
      />

      {/* Slide-out Drawer Panel */}
      <div 
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(340px, 85vw)",
          background: "linear-gradient(135deg, #0F172A, #020617)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.5)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          padding: "24px 28px",
          overflowY: "auto",
          fontFamily: "'Nunito', sans-serif"
        }}
      >
        {/* Top Header Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <span style={{ color: "#F8FAFC", fontSize: 16, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#A78BFA" }}>✦</span> Navigation Menu
          </span>
          <button 
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.03)",
              color: "#94A3B8",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 0,
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "#94A3B8"; }}
          >
            ×
          </button>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: "rgba(255, 255, 255, 0.08)", marginBottom: 24 }} />

        {/* Navigation Content Block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28, flex: 1 }}>
          
          {/* Group 1: Sections categories */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 12 }}>
              📂 Browse Occasions
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sections.map(s => {
                const theme = getSectionTheme(s.theme);
                return (
                  <a 
                    key={s.id} 
                    href={`#section-${s.id}`} 
                    onClick={onClose}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 12, 
                      padding: "10px 12px", 
                      borderRadius: 10, 
                      color: "#CBD5E1", 
                      textDecoration: "none", 
                      fontSize: 14, 
                      fontWeight: 700,
                      transition: "all 0.2s" 
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#F8FAFC"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#CBD5E1"; }}
                  >
                    <span style={{ display: "inline-flex", width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                      {theme.emoji ? theme.emoji.substring(0, 2) : "✨"}
                    </span>
                    <span>{s.title}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Group 2: Action Buttons */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 12 }}>
              ⚙️ Quick Navigation
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* My Orders Button */}
              <Link
                href="/my-orders"
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 800,
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
                  transition: "transform 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <span style={{ display: "inline-flex" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </span>
                My Orders
              </Link>

              {/* How it Works Button */}
              <a
                href="#how"
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(255, 255, 255, 0.15)",
                  background: "transparent",
                  color: "#F1F5F9",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                <span style={{ display: "inline-flex" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </span>
                How It Works
              </a>

              {/* Contact Info Button */}
              <a
                href="#footer"
                onClick={(e) => {
                  onClose();
                  const footer = document.querySelector("footer");
                  if (footer) {
                    e.preventDefault();
                    footer.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(255, 255, 255, 0.15)",
                  background: "transparent",
                  color: "#F1F5F9",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"; }}
              >
                <span style={{ display: "inline-flex" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                Contact Support
              </a>
            </div>
          </div>

        </div>

        {/* Footer Brand Logo Section */}
        <div style={{ marginTop: "auto", paddingTop: 28, borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <img src="/logo.png" alt="Aradhya E-Gifts" style={{ height: 32, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          <span style={{ fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Aradhya E-Gifting</span>
        </div>
      </div>
    </>
  );
}

/* ── Main Page ── */
export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<DisplaySection[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedAccent, setSelectedAccent] = useState("#E91E8C");
  const [showLogin, setShowLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    Promise.all([
      getProductsDB(),
      getVisibleSectionsDB(),
      getSettingsDB()
    ]).then(([allProds, visibleSecs, fetchedSettings]) => {
      setProducts(allProds.filter(p => p.visible));
      setSections(visibleSecs);
      setSettings(fetchedSettings);
      setLoading(false);
    });
  }, []);

  const openModal = (p: Product, accent?: string) => { setSelectedProduct(p); setSelectedAccent(accent || "#E91E8C"); };

  const sectionedIds = new Set(sections.flatMap(s => s.productIds));
  const unsectioned = products.filter(p => !sectionedIds.has(p.id));

  const sortedMarquees = [...(settings?.marquees || [])].sort((a, b) => a.order - b.order);

  return (
    <div>
      {sortedMarquees.length > 0 && <MarqueeBar marquees={sortedMarquees} />}
      <Navbar onMenuClick={() => setShowMenu(true)} />
      <MenuDrawer isOpen={showMenu} onClose={() => setShowMenu(false)} sections={sections} />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {selectedProduct && <ProductModal product={selectedProduct} accent={selectedAccent} onClose={() => setSelectedProduct(null)} />}
      <Hero />

      {loading ? (
        <section style={{ padding: "60px clamp(16px,4vw,48px)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="animate-pulse" style={{ width: 200, height: 32, background: "#e5e7eb", borderRadius: 8, marginBottom: 8 }} />
            <div className="animate-pulse" style={{ width: 300, height: 16, background: "#f3f4f6", borderRadius: 8, marginBottom: 32 }} />
            <div style={{ display: "flex", gap: 20, overflowX: "hidden" }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse" style={{ width: "clamp(160px, calc(50vw - 26px), 260px)", height: 340, background: "#f9fafb", borderRadius: 24, border: "1px solid rgba(0,0,0,0.04)" }} />
              ))}
            </div>

            <div style={{ marginTop: 80 }}>
              <div className="animate-pulse" style={{ width: 240, height: 32, background: "#e5e7eb", borderRadius: 8, marginBottom: 8 }} />
              <div className="animate-pulse" style={{ width: 340, height: 16, background: "#f3f4f6", borderRadius: 8, marginBottom: 32 }} />
              <div style={{ display: "flex", gap: 20, overflowX: "hidden" }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse" style={{ width: "clamp(160px, calc(50vw - 26px), 260px)", height: 340, background: "#f9fafb", borderRadius: 24, border: "1px solid rgba(0,0,0,0.04)" }} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {sections.map(sec => <OccasionSection key={sec.id} section={sec} products={products} onCardClick={openModal} />)}
          <AllGifts products={unsectioned} onCardClick={openModal} />
        </>
      )}
      <HowItWorks />
      <Footer settings={settings} />
    </div>
  );
}
