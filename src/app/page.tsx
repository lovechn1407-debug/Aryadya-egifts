"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getSectionTheme } from "@/lib/data";
import type { Product, DisplaySection, SectionThemeConfig } from "@/lib/data";
import type { Order } from "@/lib/data";
import { getProductsDB, getVisibleSectionsDB, getOrdersByBuyerDB, getSettingsDB, Settings } from "@/lib/db";

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
function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      padding: "0 clamp(16px,4vw,48px)",
      display: "flex", alignItems: "center", height: 60, gap: 10,
    }}>
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
        <img src="/logo.png" alt="Aradhya E-Gifts" style={{ height: 44, objectFit: "contain" }} />
      </Link>
      <div style={{ flex: 1 }} />
      <Link href="/my-orders" style={{
        fontSize: 13, fontWeight: 700, color: "#7C3AED", cursor: "pointer",
        padding: "8px 16px", borderRadius: 999, border: "1.5px solid #7C3AED",
        background: "transparent", textDecoration: "none", whiteSpace: "nowrap",
      }}>
        My Orders
      </Link>
      <Link href="/admin" style={{
        fontSize: 12, fontWeight: 600, color: "#4A4A68", textDecoration: "none",
        padding: "7px 14px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.08)",
      }}>Admin</Link>
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
            Browse Gifts 🎁
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
            { icon: "🔒", text: "Secure Payments" },
            { icon: "⚡", text: "Instant Delivery" },
            { icon: "✨", text: "Fully Customisable" },
          ].map(t => (
            <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>
              <span>{t.icon}</span> {t.text}
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
            Create an unforgettable, personalized digital experience for your loved ones in just three simple steps.
          </p>
        </div>

        {/* Step 1 */}
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
            {/* CSS Mockup: Storefront Grid */}
            <div style={{ background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)", border: "1px solid #E2E8F0", position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#EF4444" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#F59E0B" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10B981" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Mock Card 1 */}
                <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #F1F5F9" }}>
                  <div style={{ height: 120, background: "linear-gradient(135deg, #FF9A9E, #FECFEF)", position: "relative" }}>
                    <div style={{ position: "absolute", top: 8, left: 8, background: "#EF4444", color: "#fff", fontSize: 8, fontWeight: 800, padding: "4px 8px", borderRadius: 4 }}>🔥 HOT</div>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🎂</div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ width: "80%", height: 12, background: "#E2E8F0", borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ width: "50%", height: 10, background: "#F1F5F9", borderRadius: 4 }} />
                  </div>
                </div>
                {/* Mock Card 2 */}
                <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #F1F5F9" }}>
                  <div style={{ height: 120, background: "linear-gradient(135deg, #A18CD1, #FBC2EB)", position: "relative" }}>
                    <div style={{ position: "absolute", top: 8, left: 8, background: "#8B5CF6", color: "#fff", fontSize: 8, fontWeight: 800, padding: "4px 8px", borderRadius: 4 }}>✨ NEW</div>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>💌</div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ width: "90%", height: 12, background: "#E2E8F0", borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ width: "60%", height: 10, background: "#F1F5F9", borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", top: -20, right: -20, width: 200, height: 200, background: "radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)", zIndex: 1, pointerEvents: "none" }} />
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5vw", marginBottom: 100 }}>
          <div style={{ flex: "1 1 400px", order: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: "#EEF2FF", color: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>2</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1A1A2E", margin: 0 }}>Pay & Personalize</h3>
            </div>
            <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.7, marginBottom: 24 }}>
              Make a secure one-time payment. After checkout, you get instant access to the Live Editor. Customize every single text, message, and name to make the gift truly yours.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Secure UPI & Card payments", "Real-time Live Editor", "Save progress anytime"].map((t, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "#334155", fontWeight: 600 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#10B981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✓</div> {t}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: "1 1 400px", order: 1, position: "relative" }}>
            {/* CSS Mockup: Live Editor */}
            <div style={{ display: "flex", gap: 16 }}>
              {/* Sidebar Edit Panel */}
              <div style={{ flex: 1, background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)", border: "1px solid #E2E8F0" }}>
                <div style={{ width: "40%", height: 14, background: "#94A3B8", borderRadius: 4, marginBottom: 20 }} />
                <div style={{ marginBottom: 16 }}>
                  <div style={{ width: "30%", height: 10, background: "#CBD5E1", borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: "100%", height: 36, background: "#F1F5F9", borderRadius: 8, border: "1px solid #E2E8F0", padding: "10px", boxSizing: "border-box" }}>
                    <div style={{ width: "50%", height: "100%", background: "#94A3B8", borderRadius: 4 }} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ width: "40%", height: 10, background: "#CBD5E1", borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: "100%", height: 60, background: "#F1F5F9", borderRadius: 8, border: "1px solid #E2E8F0", padding: "10px", boxSizing: "border-box" }}>
                    <div style={{ width: "80%", height: 8, background: "#94A3B8", borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ width: "60%", height: 8, background: "#94A3B8", borderRadius: 4 }} />
                  </div>
                </div>
                <div style={{ width: "100%", height: 36, background: "#6366F1", borderRadius: 8 }} />
              </div>
              {/* Preview Phone */}
              <div style={{ width: 140, flexShrink: 0, background: "#0F172A", borderRadius: 24, padding: 6, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)" }}>
                <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: 60, background: "#FF9A9E", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 24 }}>🎂</span></div>
                  <div style={{ padding: 12, flex: 1 }}>
                    <div style={{ width: "80%", height: 8, background: "#64748B", borderRadius: 4, margin: "0 auto 8px" }} />
                    <div style={{ width: "100%", height: 6, background: "#CBD5E1", borderRadius: 4, marginBottom: 4 }} />
                    <div style={{ width: "90%", height: 6, background: "#CBD5E1", borderRadius: 4, marginBottom: 12 }} />
                    <div style={{ width: "60%", height: 24, background: "#E91E8C", borderRadius: 99, margin: "0 auto" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5vw" }}>
          <div style={{ flex: "1 1 400px", order: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: "#F0FDF4", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>3</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1A1A2E", margin: 0 }}>Custom Audio & Delivery</h3>
            </div>
            <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.7, marginBottom: 24 }}>
              Set the perfect mood by assigning custom background music. Choose from our audio library or use multi-part songs. Finally, click "Finalize" to generate a permanent link and share it directly via WhatsApp!
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Custom MP3 uploads & YouTube links", "Multi-part playlist support", "Permanent sharable URL generation"].map((t, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "#334155", fontWeight: 600 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#10B981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✓</div> {t}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: "1 1 400px", order: 2, position: "relative" }}>
            {/* CSS Mockup: Audio Library */}
            <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)", border: "1px solid #E2E8F0", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, #F8FAFC, #F1F5F9)", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, color: "#0F172A" }}>Audio Library</span>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#fff", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: 12 }}>✕</div>
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Playing Item */}
                <div style={{ border: "2px solid #6366F1", borderRadius: 12, padding: "12px", background: "#F5F3FF", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6366F1", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 10, height: 10, background: "#fff", borderRadius: 2 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ width: "60%", height: 12, background: "#4338CA", borderRadius: 4, marginBottom: 6 }} />
                    {/* Fake Seek bar */}
                    <div style={{ width: "100%", height: 4, background: "#E0E7FF", borderRadius: 4, position: "relative" }}>
                      <div style={{ width: "40%", height: "100%", background: "#6366F1", borderRadius: 4 }} />
                    </div>
                  </div>
                  <div style={{ padding: "6px 12px", background: "#4338CA", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 6 }}>Select</div>
                </div>
                {/* Multi-part Item */}
                <div style={{ border: "2px solid #F1F5F9", borderRadius: 12, padding: "12px", background: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F1F5F9", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: "8px solid #64748B", marginLeft: 3 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                      <div style={{ width: "50%", height: 12, background: "#0F172A", borderRadius: 4 }} />
                      <div style={{ padding: "2px 6px", background: "#EEF2FF", color: "#4338CA", fontSize: 8, fontWeight: 800, borderRadius: 99 }}>🎶 3 Parts</div>
                    </div>
                    <div style={{ width: "70%", height: 8, background: "#94A3B8", borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 200, height: 200, background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)", zIndex: -1, pointerEvents: "none" }} />
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
        <div style={{ position: "absolute", top: 8, left: 8, zIndex: 10, padding: "4px 8px", background: product.badge === "hot" ? "#EF4444" : product.badge === "new" ? "#3B82F6" : product.badge === "specials" ? "#10B981" : "#F59E0B", color: "#fff", fontSize: 10, fontWeight: 900, borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          {product.badge === "hot" ? "🔥 HOT" : product.badge === "new" ? "✨ NEW" : product.badge === "specials" ? "🎁 SPECIAL" : "💎 PREMIUM"}
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
          {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(rating) ? "#F59E0B" : "#E5E7EB", fontSize: 11 }}>★</span>)}
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
                <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>For: {o.buyerName} · ₹{Math.floor(o.amount/100)}</p>
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
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1F2937", fontFamily: "'Nunito',sans-serif", lineHeight: 1.3, marginTop: 4, paddingRight: 36 }}>{product.name.replace(/[\u{1F000}-\u{1FFFF}]/gu,"").trim()}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10 }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(rating) ? "#F59E0B" : "#E5E7EB", fontSize: 18 }}>★</span>)}
            <span style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginLeft: 4 }}>{rating.toFixed(1)}{reviewCount ? ` (${reviewCount})` : ""}</span>
          </div>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 14, lineHeight: 1.7 }}>{product.tagline}</p>
          <div style={{ marginTop: 16 }}>{product.slides.slice(0,5).map(s => <div key={s.slideNumber} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: accent, flexShrink: 0 }} /><span style={{ fontSize: 13, color: "#374151" }}>{s.title}</span></div>)}</div>
          <div style={{ margin: "20px 0", padding: "14px 0", borderTop: "1px solid #F3F4F6", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: "#1F2937", fontFamily: "'Nunito',sans-serif" }}>₹{Math.floor(product.price/100)}</span>
            {product.cuttedPrice && <span style={{ fontSize: 16, color: "#9CA3AF", textDecoration: "line-through", fontWeight: 600 }}>₹{Math.floor(product.cuttedPrice / 100)}</span>}
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>one-time</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href={`/order/${product.id}`} style={{ display: "block", textAlign: "center", background: `linear-gradient(135deg,${accent},${accent}BB)`, color: "#fff", padding: "15px", borderRadius: 13, textDecoration: "none", fontWeight: 900, fontSize: 15, fontFamily: "'Nunito',sans-serif", boxShadow: `0 8px 24px ${accent}35` }}>Buy &amp; Personalise ₹{Math.floor(product.price/100)} →</Link>
            <Link href={`/preview/${product.id}`} style={{ display: "block", textAlign: "center", background: "#F9FAFB", color: "#374151", padding: "12px", borderRadius: 13, textDecoration: "none", fontWeight: 700, fontSize: 13, border: "1px solid #E5E7EB" }}>🔍 View Full Preview</Link>
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 16 }}>{["🔒 Secure","📩 Instant","💌 Shareable"].map(b => <span key={b} style={{ fontSize: 11, color: "#9CA3AF" }}>{b}</span>)}</div>
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
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
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
  
  const [timeLeft, setTimeLeft] = useState<{d: number, h: number, m: number, s: number} | null>(null);

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
    <section className="occasion-banner-reveal" style={{
      width: "100%",
      background: theme.isPremium ? theme.gradient : theme.bgLight,
      position: "relative",
      overflow: "hidden",
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
      </div>
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
          🎁 All Gift Pages
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
      padding: "40px clamp(16px,4vw,48px) 24px",
      background: "#FAFAFA", borderTop: "1px solid rgba(0,0,0,0.06)",
      textAlign: "center",
    }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <img src="/logo.png" alt="Aradhya E-Gifts" style={{ height: 36, objectFit: "contain" }} />
        <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>is a product of</span>
        <img src="/as-studios.png" alt="AS Studios" style={{ height: 30, objectFit: "contain" }} />
      </div>
      
      {settings && (settings.contactEmail || settings.contactPhone || settings.contactAddress) && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#6B7280" }}>
          <div style={{ fontWeight: 700, color: "#4B5563", marginBottom: 4 }}>Contact Us</div>
          {settings.contactEmail && <div>📧 {settings.contactEmail}</div>}
          {settings.contactPhone && <div>📞 {settings.contactPhone}</div>}
          {settings.contactAddress && <div>📍 {settings.contactAddress}</div>}
        </div>
      )}

      <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 24 }}>
        Personalised digital surprises for every occasion. Made with ❤️ in India.
      </p>
      <p style={{ fontSize: 12, color: "#D1D5DB", marginTop: 16 }}>
        © {new Date().getFullYear()} Aradhya E-Gifts. All rights reserved.
      </p>
    </footer>
  );
}

/* ── Main Page ── */
export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<DisplaySection[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedAccent, setSelectedAccent] = useState("#E91E8C");
  const [showLogin, setShowLogin] = useState(false);
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
      <Navbar onLoginClick={() => setShowLogin(true)} />
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
