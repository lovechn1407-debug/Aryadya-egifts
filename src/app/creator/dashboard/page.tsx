"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { Creator, AffiliateMilestone, AffiliateReward, Payout, RewardClaim, RewardType } from "@/lib/db";
import type { Coupon } from "@/lib/data";

interface OrderSummary {
  id: string; productName: string; buyerName: string;
  amount: number; commissionAmount: number; couponCode?: string;
  status: string; createdAt: string;
}

interface DashboardData {
  creator: Creator;
  coupons: Coupon[];
  orders: OrderSummary[];
  payouts: Payout[];
  milestones: AffiliateMilestone[];
  rewards: AffiliateReward[];
  rewardClaims: RewardClaim[];
  monthlyEarnings: Record<string, number>;
  pendingPayoutPaise: number;
}

function fmt(paise: number) { return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; }

/* ── Inline SVG Icon Components ── */
function BarChartIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function CouponIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <line x1="13" y1="5" x2="13" y2="19" />
    </svg>
  );
}

function BriefcaseIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function DollarIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function SettingsIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function CalendarIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ShieldIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function TrophyIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
    </svg>
  );
}

function TargetIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function UserIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CheckCircleIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function LockIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function TrendingUpIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

// Custom Stat Card
function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: 16,
      padding: "20px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      flex: "1 1 200px",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}10`, color: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// Milestone Progress Scrollable Horizontal Timeline
function MilestoneProgress({ milestones, current }: { milestones: AffiliateMilestone[]; current: number }) {
  if (!milestones.length) return (
    <div style={{ textAlign: "center", padding: "24px", color: "#64748B", fontSize: 13 }}>No milestones configured yet.</div>
  );

  const sortedMilestones = [...milestones].sort((a, b) => a.referrals - b.referrals);
  const maxRef = Math.max(...sortedMilestones.map(m => m.referrals), 1);
  const progressPercent = Math.min(100, (current / maxRef) * 100);

  // Find current active milestone level
  const activeMilestone = [...sortedMilestones].reverse().find(m => current >= m.referrals);
  const nextMilestone = sortedMilestones.find(m => current < m.referrals);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 1. Status Overview Header */}
      <div style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", background: "#10B981",
            display: "inline-block", animation: "pulse 1.5s infinite"
          }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Active Level: <span style={{ color: "#6366F1" }}>{activeMilestone ? activeMilestone.label : "Base Partner"}</span>
          </span>
        </div>

        <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.4 }}>
          {nextMilestone ? (
            <>
              You have completed <strong>{current}</strong> referrals. Get <strong>{nextMilestone.referrals - current}</strong> more sales to unlock <strong style={{ color: "#6366F1" }}>{nextMilestone.label}</strong> (+{nextMilestone.bonusPercentage}% bonus)!
            </>
          ) : (
            <>
              Maximum level reached! You are on <strong style={{ color: "#6366F1" }}>{activeMilestone?.label}</strong> with <strong>{current}</strong> referred sales!
            </>
          )}
        </p>
      </div>

      {/* 2. Scrollable Horizontal Timeline Wrapper */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        padding: "24px 20px",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}>
        {/* Container with a fixed minimum width to ensure no squishing on mobile */}
        <div style={{ 
          minWidth: "750px", 
          padding: "20px 24px 60px",
          position: "relative" 
        }}>
          
          {/* Track Line Background */}
          <div style={{ 
            height: 8, 
            background: "#E2E8F0", 
            borderRadius: 99, 
            position: "relative",
            width: "100%"
          }}>
            {/* Fill Track Line */}
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%", 
              width: `${progressPercent}%`, 
              background: "linear-gradient(90deg, #6366F1, #4F46E5)", 
              borderRadius: 99,
              transition: "width 1s ease-out"
            }} />

            {/* Checkpoint Nodes along the track */}
            {sortedMilestones.map((m) => {
              const percentage = (m.referrals / maxRef) * 100;
              const unlocked = current >= m.referrals;
              return (
                <div 
                  key={m.id} 
                  style={{
                    position: "absolute", left: `${percentage}%`, top: "50%",
                    transform: "translate(-50%, -50%)", zIndex: 10
                  }}
                >
                  {/* Bubble circle */}
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: unlocked ? "#6366F1" : "#FFFFFF",
                    border: `2px solid ${unlocked ? "#6366F1" : "#CBD5E1"}`,
                    boxShadow: unlocked ? "0 2px 6px rgba(99,102,241,0.25)" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: unlocked ? "#FFFFFF" : "#64748B", fontSize: 10, fontWeight: 700,
                    transition: "all 0.3s"
                  }}>
                    {unlocked ? "✓" : m.referrals}
                  </div>

                  {/* Level Details below node */}
                  <div style={{
                    position: "absolute", top: 32, left: "50%", transform: "translateX(-50%)",
                    whiteSpace: "nowrap", textAlign: "center"
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{m.label}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: unlocked ? "#10B981" : "#6366F1", marginTop: 2 }}>
                      +{m.bonusPercentage}% commission
                    </div>
                    <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
                      {m.referrals} referrals goal
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Scroll instruction for mobile viewports */}
      <div className="mobile-scroll-hint" style={{ display: "none", fontSize: 11, color: "#94A3B8", textAlign: "center", marginTop: -10 }}>
        ↔️ Swipe left/right to see full milestones progression
      </div>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @media (max-width: 768px) {
          .mobile-scroll-hint {
            display: block !important;
          }
        }
      `}</style>
   function RewardTypeIcon({ type, size = 26 }: { type?: RewardType; size?: number }) {
  if (type === "amazon") {
    return <img src="/icons/amazon.png" alt="Amazon" style={{ width: size, height: size, objectFit: "contain", borderRadius: 6, display: "inline-block", verticalAlign: "middle" }} />;
  }
  if (type === "flipkart") {
    return <img src="/icons/flipkart.png" alt="Flipkart" style={{ width: size, height: size, objectFit: "contain", borderRadius: 6, display: "inline-block", verticalAlign: "middle" }} />;
  }
  if (type === "myntra") {
    return <img src="/icons/myntra.png" alt="Myntra" style={{ width: size, height: size, objectFit: "contain", borderRadius: 6, display: "inline-block", verticalAlign: "middle" }} />;
  }
  if (type === "cash") {
    return <span style={{ fontSize: size * 0.9, lineHeight: 1 }}>💵</span>;
  }
  return <span style={{ fontSize: size * 0.9, lineHeight: 1 }}>🎁</span>;
}

function ToastNotification({ toast, onClose }: { toast: { message: string; type: "success" | "error" | "info" } | null; onClose: () => void }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div style={{
      position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 99999, display: "flex", alignItems: "center", gap: 12,
      background: isSuccess ? "#064E3B" : isError ? "#7F1D1D" : "#1E1B4B",
      color: "#FFFFFF", padding: "14px 22px", borderRadius: 16,
      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.2)",
      backdropFilter: "blur(12px)", border: `1px solid ${isSuccess ? "#10B981" : isError ? "#EF4444" : "#818CF8"}`,
      animation: "fadeDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)", maxWidth: "90vw"
    }}>
      <span style={{ fontSize: 20 }}>{isSuccess ? "🎉" : isError ? "❌" : "ℹ️"}</span>
      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}>{toast.message}</div>
      <button
        onClick={onClose}
        style={{
          background: "rgba(255,255,255,0.2)", border: "none", color: "#FFF",
          borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700,
          cursor: "pointer", marginLeft: 8
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

const BRAND_THEMES: Record<string, { border: string; bg: string; accent: string; badgeBg: string; badgeText: string; title: string }> = {
  amazon: {
    border: "#FDE68A",
    bg: "linear-gradient(145deg, #FFFFFF 0%, #FFFDF5 100%)",
    accent: "#D97706",
    badgeBg: "#FEF3C7",
    badgeText: "#92400E",
    title: "Amazon Gift Card",
  },
  flipkart: {
    border: "#BFDBFE",
    bg: "linear-gradient(145deg, #FFFFFF 0%, #F0F9FF 100%)",
    accent: "#2563EB",
    badgeBg: "#DBEAFE",
    badgeText: "#1E40AF",
    title: "Flipkart Voucher",
  },
  myntra: {
    border: "#FBCFE8",
    bg: "linear-gradient(145deg, #FFFFFF 0%, #FDF2F8 100%)",
    accent: "#DB2777",
    badgeBg: "#FCE7F3",
    badgeText: "#9D174D",
    title: "Myntra Voucher",
  },
  cash: {
    border: "#A7F3D0",
    bg: "linear-gradient(145deg, #FFFFFF 0%, #F0FDF4 100%)",
    accent: "#059669",
    badgeBg: "#DCFCE7",
    badgeText: "#166534",
    title: "Cash Settlement",
  },
  other: {
    border: "#DDD6FE",
    bg: "linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)",
    accent: "#7C3AED",
    badgeBg: "#EDE9FE",
    badgeText: "#5B21B6",
    title: "Exclusive Bonus",
  },
};

// Reward Missions
function RewardMissionsList({ 
  rewards, 
  current,
  rewardClaims = [],
  onClaim,
  onShowCode,
  claimingId,
  onCopyText,
}: { 
  rewards: AffiliateReward[]; 
  current: number;
  rewardClaims: RewardClaim[];
  onClaim: (rewardId: string) => void;
  onShowCode: (claim: RewardClaim) => void;
  claimingId: string | null;
  onCopyText: (text: string, label: string) => void;
}) {
  if (!rewards.length) return (
    <div style={{ textAlign: "center", padding: "32px", color: "#64748B", fontSize: 13 }}>No reward missions set yet.</div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
      {rewards.map(r => {
        const unlocked = current >= r.referrals;
        const claim = rewardClaims.find(c => c.rewardId === r.id);
        const ratio = Math.min(100, Math.round((current / r.referrals) * 100));
        const isPending = claim && claim.status === "pending";
        const isFulfilled = claim && claim.status === "fulfilled";
        const type = r.rewardType || "other";
        const theme = BRAND_THEMES[type] || BRAND_THEMES.other;

        return (
          <div
            key={r.id}
            style={{
              background: theme.bg,
              border: `1.5px solid ${isFulfilled ? "#10B981" : isPending ? "#F59E0B" : unlocked ? theme.accent : "#E2E8F0"}`,
              borderRadius: 20,
              padding: 22,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxShadow: isFulfilled
                ? "0 10px 25px -5px rgba(16,185,129,0.12)"
                : isPending
                ? "0 10px 25px -5px rgba(245,158,11,0.12)"
                : unlocked
                ? "0 12px 28px -5px rgba(99,102,241,0.15)"
                : "0 2px 8px rgba(0,0,0,0.03)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top brand bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: "#FFFFFF",
                  border: "1px solid #E2E8F0", display: "flex", alignItems: "center",
                  justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.04)"
                }}>
                  <RewardTypeIcon type={r.rewardType} size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: theme.accent, textTransform: "uppercase", letterSpacing: 0.6 }}>
                    {theme.title}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A" }}>
                    {fmt(r.rewardAmountPaise)}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <span style={{
                fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20,
                background: isFulfilled ? "#DCFCE7" : isPending ? "#FEF3C7" : unlocked ? "#EEF2F6" : "#F1F5F9",
                color: isFulfilled ? "#15803D" : isPending ? "#B45309" : unlocked ? "#4F46E5" : "#64748B",
                display: "inline-flex", alignItems: "center", gap: 4
              }}>
                {isFulfilled ? "Delivered ✓" : isPending ? "Reviewing ⏳" : unlocked ? "Goal Met 🎉" : `${ratio}%`}
              </span>
            </div>

            {/* Title & Description */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 4, lineHeight: 1.3 }}>
                {r.label}
              </div>
              <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.45 }}>
                {r.description || `Complete ${r.referrals} sales to unlock this ${theme.title}.`}
              </div>
            </div>

            {/* Progress bar for unlocked/locked state */}
            {!isPending && !isFulfilled && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  <span>Referral Milestone</span>
                  <span><strong>{current}</strong> / {r.referrals} Sales</span>
                </div>
                <div style={{ height: 7, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${ratio}%`,
                    background: unlocked ? "linear-gradient(90deg, #10B981, #059669)" : `linear-gradient(90deg, ${theme.accent}, #4F46E5)`,
                    borderRadius: 99, transition: "width 0.6s ease"
                  }} />
                </div>
              </div>
            )}

            {/* 24h Processing Live Notice Banner */}
            {isPending && (
              <div style={{
                background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
                border: "1px solid #FCD34D", borderRadius: 14, padding: "12px 14px",
                display: "flex", flexDirection: "column", gap: 4,
                boxShadow: "0 2px 8px rgba(245,158,11,0.08)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800, color: "#92400E" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B", display: "inline-block", animation: "pulse 1.2s infinite" }} />
                  ⚡ Claim Processing · Credited in 24 Hours
                </div>
                <div style={{ fontSize: 11, color: "#B45309", lineHeight: 1.4 }}>
                  Your claim request is undergoing standard admin verification. You will receive your code/credit shortly.
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isFulfilled ? (
              r.rewardType === "cash" ? (
                <div style={{
                  width: "100%", padding: "11px 14px", borderRadius: 12, background: "#DCFCE7",
                  border: "1px solid #86EFAC", color: "#15803D", fontSize: 12, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  <span>Credited to Account ✓</span>
                  {claim.utr && (
                    <button
                      onClick={() => onCopyText(claim.utr!, "UTR Number")}
                      style={{
                        background: "#FFFFFF", border: "1px solid #86EFAC", color: "#166534",
                        padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
                        fontFamily: "monospace"
                      }}
                      title="Copy UTR Reference"
                    >
                      UTR: {claim.utr} 📋
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onShowCode(claim)}
                  style={{
                    width: "100%", padding: "11px", borderRadius: 12, border: "none",
                    fontSize: 13, fontWeight: 800, cursor: "pointer",
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    color: "#FFFFFF", boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                    transition: "all 0.2s"
                  }}
                >
                  Show Code 🎟️
                </button>
              )
            ) : isPending ? (
              <button
                disabled
                style={{
                  width: "100%", padding: "11px", borderRadius: 12, border: "1px solid #FCD34D",
                  fontSize: 12, fontWeight: 800, cursor: "not-allowed",
                  background: "#FEF3C7", color: "#B45309"
                }}
              >
                Processing (Credited within 24h) ⏳
              </button>
            ) : (
              <button
                onClick={() => onClaim(r.id)}
                disabled={!unlocked || claimingId === r.id}
                style={{
                  width: "100%", padding: "11px", borderRadius: 12, border: "none",
                  fontSize: 13, fontWeight: 800, cursor: unlocked ? "pointer" : "not-allowed",
                  background: unlocked ? "linear-gradient(135deg, #6366F1, #4F46E5)" : "#EEF2F6",
                  color: unlocked ? "#FFFFFF" : "#64748B",
                  transition: "all 0.2s",
                  boxShadow: unlocked ? "0 4px 14px rgba(99,102,241,0.3)" : "none"
                }}
              >
                {claimingId === r.id ? "Submitting Request..." : unlocked ? "Claim Reward 🎁" : `Locked (Need ${r.referrals - current} More Sales)`}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CreatorDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "coupons" | "orders" | "payouts" | "settings">("overview");

  // Custom Toast UI state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Local state for editing settings
  const [settingsForm, setSettingsForm] = useState({ name: "", phone: "", instagram: "", youtube: "", other: "", upiId: "", upiName: "" });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");

  // Notice dismissal state
  const [hideNotice, setHideNotice] = useState(false);
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [dontShowAgainCheck, setDontShowAgainCheck] = useState(false);

  // Claim & Voucher Modal states
  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);
  const [viewingClaim, setViewingClaim] = useState<RewardClaim | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("hide_creator_notice");
      if (dismissed === "true") {
        setHideNotice(true);
      }
    }
  }, []);

  const confirmDismissNotice = () => {
    if (dontShowAgainCheck && typeof window !== "undefined") {
      localStorage.setItem("hide_creator_notice", "true");
    }
    setHideNotice(true);
    setShowDismissModal(false);
  };

  const handleClaimReward = async (rewardId: string) => {
    if (!data?.creator.uid) return;
    setClaimingRewardId(rewardId);
    try {
      const res = await fetch("/api/creator/claim-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId, creatorId: data.creator.uid }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Claim Request Submitted! Your reward is being processed and will be credited within 24 hours.", "success");
        await fetchData(data.creator.uid);
      } else {
        showToast(json.message || "Failed to submit claim.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setClaimingRewardId(null);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`📋 ${label} copied to clipboard!`, "success");
    }
  };

  const fetchData = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/creator/me?uid=${userId}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        // Pre-fill settings form
        setSettingsForm({
          name: json.creator.name || "",
          phone: json.creator.phone || "",
          instagram: json.creator.instagramHandle || "",
          youtube: json.creator.youtubeHandle || "",
          other: json.creator.otherHandle || "",
          upiId: json.creator.upiId || "",
          upiName: json.creator.upiName || "",
        });
      } else {
        router.replace("/creator");
      }
    } catch {
      router.replace("/creator");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.replace("/creator"); return; }
      await fetchData(user.uid);
    });
    return () => unsub();
  }, [router, fetchData]);

  // Sync active tab with URL query parameter safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "overview" || tab === "coupons" || tab === "orders" || tab === "payouts" || tab === "settings") {
        setActiveTab(tab);
      }
    }
  }, [typeof window !== "undefined" ? window.location.search : null]);

  const handleUpdateTab = (tab: "overview" | "coupons" | "orders" | "payouts" | "settings") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      router.push(`/creator/dashboard?tab=${tab}`);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    if (!settingsForm.name.trim() || !settingsForm.phone.trim()) {
      setSettingsMessage("❌ Name and Phone Number are required.");
      return;
    }
    setSettingsSaving(true);
    setSettingsMessage("");
    try {
      const res = await fetch("/api/creator/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: data.creator.uid,
          name: settingsForm.name,
          email: data.creator.email,
          photoURL: data.creator.photoURL || "",
          googleId: data.creator.uid,
          phone: settingsForm.phone,
          instagramHandle: settingsForm.instagram,
          youtubeHandle: settingsForm.youtube,
          otherHandle: settingsForm.other,
          upiId: settingsForm.upiId,
          upiName: settingsForm.upiName,
        })
      });
      const resData = await res.json();
      if (resData.success) {
        setSettingsMessage("✅ Profile updated successfully!");
        await fetchData(data.creator.uid);
      } else {
        setSettingsMessage(`❌ ${resData.message || "Failed to update profile."}`);
      }
    } catch {
      setSettingsMessage("❌ Network error. Please try again.");
    } finally {
      setSettingsSaving(false);
    }
  };

  if (checkingAuth() || loading || !data) {
    return (
      <div style={{ flex: 1, minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #6366F1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  // Temporary function helper to check if auth window loading
  function checkingAuth() {
    return false;
  }

  const { creator, coupons, orders, payouts, milestones, rewards, monthlyEarnings, pendingPayoutPaise } = data;
  const paidOrders = orders.filter(o => o.status === "paid" || o.status === "editing" || o.status === "finalized");
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthEarnings = monthlyEarnings[thisMonth] || 0;

  const missingUpi = !creator.upiId || !creator.upiName;
  const missingPhone = !creator.phone;
  const missingSocial = !creator.instagramHandle && !creator.youtubeHandle && !creator.otherHandle;

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: <BarChartIcon /> },
    { id: "coupons", label: "My Coupons", icon: <CouponIcon /> },
    { id: "orders", label: "Referred Sales", icon: <BriefcaseIcon /> },
    { id: "payouts", label: "Payouts History", icon: <DollarIcon /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon /> },
  ] as const;

  return (
    <div style={{ display: "flex", flex: 1, width: "100%", minHeight: "calc(100vh - 72px)", position: "relative" }}>
      <style>{`
        /* Sidebar layout styling */
        .sidebar {
          width: 260px;
          background: #FFFFFF;
          border-right: 1px solid #E2E8F0;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
        }
        .sidebar-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          border: none;
          background: none;
          color: #64748B;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
        }
        .sidebar-btn.active {
          background: #EEF2F6;
          color: #6366F1;
        }
        .sidebar-btn:hover:not(.active) {
          background: #F8FAFC;
          color: #0F172A;
        }
        .main-container {
          flex: 1;
          padding: 32px clamp(16px, 4vw, 40px) 100px;
          background: #F8FAFC;
          overflow-y: auto;
        }
        
        /* Bottom navigation design */
        .bottom-nav {
          display: none;
        }

        /* Milestones grid layout to resolve flowing issues */
        .milestones-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        /* Settings card layout */
        .settings-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          max-width: 600px;
        }

        /* Responsive Mobile Layout rules */
        @media (max-width: 768px) {
          .sidebar {
            display: none !important;
          }
          .main-container {
            padding: 20px 16px 120px;
          }
          .bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #FFFFFF;
            border-top: 1px solid #E2E8F0;
            height: 68px;
            z-index: 100;
            box-shadow: 0 -2px 12px rgba(0,0,0,0.04);
            justify-content: space-around;
            align-items: center;
          }
          .bottom-nav-btn {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            border: none;
            background: none;
            color: #94A3B8;
            font-size: 10px;
            font-weight: 700;
            cursor: pointer;
            height: 100%;
            position: relative;
            transition: color 0.2s;
          }
          .bottom-nav-btn.active {
            color: #6366F1;
          }
          .bottom-nav-btn.active::after {
            content: '';
            position: absolute;
            top: 0;
            left: 20%;
            right: 20%;
            height: 3px;
            background: #6366F1;
            border-radius: 0 0 3px 3px;
          }
          .desktop-menu {
            display: none !important;
          }
          .milestones-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .milestone-bubble-label {
            display: none !important;
          }
        }
        .milestone-bubble-label {
          display: block;
        }
      `}</style>

      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* 1. Left Sidebar Navigation (Desktop) */}
      <aside className="sidebar">
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, padding: "0 16px 12px" }}>
          Portal Sections
        </div>
        {sidebarItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleUpdateTab(item.id)}
            className={`sidebar-btn ${activeTab === item.id ? "active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </aside>

      {/* 2. Responsive Bottom Nav with active indicators (Mobile/Phone screens) */}
      <nav className="bottom-nav">
        {sidebarItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleUpdateTab(item.id)}
            className={`bottom-nav-btn ${activeTab === item.id ? "active" : ""}`}
          >
            {item.icon}
            <span>{item.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>

      {/* 3. Main Dashboard Contents Display Area */}
      <main className="main-container">
        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
          {/* Welcome Title */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: "0 0 6px", letterSpacing: -0.5 }}>
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "coupons" && "My Coupons"}
              {activeTab === "orders" && "Referred Sales"}
              {activeTab === "payouts" && "Payouts History"}
              {activeTab === "settings" && "Account Settings"}
            </h1>
            <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>
              {activeTab === "overview" && "Track your performance, achievements and rewards."}
              {activeTab === "coupons" && "Share your custom coupon codes to credit referred order commissions."}
              {activeTab === "orders" && "Track completed digital gift orders referred through your links."}
              {activeTab === "payouts" && "Review history of payouts requested and processed by administrators."}
              {activeTab === "settings" && "Update your creator public details, handles, and account information."}
            </p>
          </div>

          {/* ── Top Notice Bar for Critical Issues ── */}
          {!hideNotice && (missingUpi || missingPhone || missingSocial) && (
            <div style={{
              background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 16,
              padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#92400E", marginBottom: 4 }}>
                    Action Required: Complete your creator profile
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#B45309", display: "flex", flexDirection: "column", gap: 3 }}>
                    {missingUpi && <li>Add your <strong>UPI ID & Registered Name</strong> under Settings to receive instant payouts.</li>}
                    {missingPhone && <li>Add your <strong>Phone Number</strong> under Settings to receive payout notifications.</li>}
                    {missingSocial && <li>Add at least one <strong>Social Handle (Instagram/YouTube)</strong> under Settings.</li>}
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowDismissModal(true)}
                style={{
                  background: "#FEF3C7", border: "1px solid #FDE68A", color: "#92400E", cursor: "pointer",
                  borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, flexShrink: 0
                }}
                title="Close notice"
              >
                ✕
              </button>
            </div>
          )}

          {/* Dismissal Confirmation Modal */}
          {showDismissModal && (
            <div style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(15,23,42,0.6)", zIndex: 9999, display: "flex",
              alignItems: "center", justifyContent: "center", padding: 20,
              backdropFilter: "blur(4px)"
            }}>
              <div style={{
                background: "#FFFFFF", borderRadius: 20, padding: 24, maxWidth: 420,
                width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                animation: "fadeUp 0.2s ease-out"
              }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: "#0F172A" }}>Dismiss Important Notice?</h3>
                <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>
                  Missing payment details like your UPI ID will prevent the admin from transferring your earned commissions automatically.
                </p>
                
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 24, cursor: "pointer", userSelect: "none" }}>
                  <input
                    type="checkbox"
                    checked={dontShowAgainCheck}
                    onChange={e => setDontShowAgainCheck(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: "#6366F1", cursor: "pointer" }}
                  />
                  Don't show this notice again
                </label>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button
                    onClick={() => setShowDismissModal(false)}
                    style={{
                      padding: "9px 16px", borderRadius: 10, border: "1px solid #CBD5E1",
                      background: "#FFFFFF", color: "#475569", fontSize: 13, fontWeight: 700, cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDismissNotice}
                    style={{
                      padding: "9px 18px", borderRadius: 10, border: "none",
                      background: "#6366F1", color: "#FFFFFF", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(99,102,241,0.25)"
                    }}
                  >
                    Dismiss Notice
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Summary row */}
          {activeTab !== "settings" && (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
              <StatCard icon={<DollarIcon size={24} />} label="Total Earnings" value={fmt(creator.totalEarningsPaise)} color="#6366F1" />
              <StatCard icon={<CalendarIcon size={24} />} label="This Month" value={fmt(thisMonthEarnings)} color="#4F46E5" />
              <StatCard icon={<DollarIcon size={24} />} label="Unpaid Balance" value={fmt(pendingPayoutPaise)} sub="Pending transfer" color="#D97706" />
              <StatCard icon={<BriefcaseIcon size={24} />} label="Referred Sales" value={`${creator.totalReferrals} orders`} color="#10B981" />
            </div>
          )}

          {/* ───────────────── Tab View: Overview ───────────────── */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Progress Milestones Container */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: "24px" }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: "0 0 24px", display: "flex", alignItems: "center", gap: 8 }}>
                  <TrophyIcon size={20} color="#6366F1" /> Referral Milestone Levels (Static Badges)
                </h2>
                <MilestoneProgress milestones={milestones} current={creator.totalReferrals} />
              </div>

              {/* Rewards Program */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                  <TargetIcon size={20} color="#6366F1" /> Extra Reward Missions
                </h2>
                <RewardMissionsList 
                  rewards={rewards} 
                  current={creator.totalReferrals} 
                  rewardClaims={data.rewardClaims || []}
                  onClaim={handleClaimReward}
                  onShowCode={(claim) => setViewingClaim(claim)}
                  claimingId={claimingRewardId}
                  onCopyText={handleCopyText}
                />
              </div>

              {/* Monthly stats chart bar */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: "0 0 24px", display: "flex", alignItems: "center", gap: 8 }}>
                  <BarChartIcon size={20} color="#6366F1" /> Earnings Performance Chart
                </h2>
                {Object.keys(monthlyEarnings).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#64748B", fontSize: 13 }}>No earnings data yet. Keep pushing coupon usage!</div>
                ) : (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140, padding: "0 8px" }}>
                    {Object.entries(monthlyEarnings).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([month, amount]) => {
                      const maxVal = Math.max(...Object.values(monthlyEarnings));
                      const percentHeight = Math.max(8, (amount / maxVal) * 100);
                      const active = month === thisMonth;
                      return (
                        <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>{fmt(amount)}</span>
                          <div style={{
                            width: "100%", height: `${percentHeight}%`, borderRadius: "4px 4px 0 0",
                            background: active ? "#6366F1" : "#E2E8F0"
                          }} />
                          <span style={{ fontSize: 10, color: active ? "#6366F1" : "#64748B", fontWeight: 700 }}>
                            {new Date(month + "-01").toLocaleString("en-IN", { month: "short" })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───────────────── Tab View: Coupons ───────────────── */}
          {activeTab === "coupons" && (
            <div>
              {coupons.length === 0 ? (
                <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", color: "#94A3B8", marginBottom: 12 }}><CouponIcon size={40} /></div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 4px" }}>No Coupons Assigned</h3>
                  <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>The administrator will assign unique trackable coupons to your account shortly.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {coupons.map(c => (
                    <div key={c.id} style={{
                      background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: "20px 24px",
                      display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "center"
                    }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 800, color: "#6366F1", background: "#EEF2F6", padding: "4px 10px", borderRadius: 8 }}>{c.id}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: 12,
                            background: c.active ? "#E8F5E9" : "#FFEBEE", color: c.active ? "#2E7D32" : "#C62828"
                          }}>{c.active ? "Active" : "Inactive"}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 10px" }}>{c.description}</p>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#64748B" }}>
                          <span>Discount: <strong>{c.discountType === "percentage" ? `${c.discountAmount}%` : fmt(c.discountAmount * 100)}</strong></span>
                          <span>Your Share: <strong>{c.commissionPercentage}% Commission</strong></span>
                          <span>Uses: <strong>{c.usedCount} times</strong></span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <button
                          onClick={() => { navigator.clipboard.writeText(c.id); }}
                          style={{
                            padding: "8px 16px", borderRadius: 10, border: "1px solid #6366F1",
                            background: "#FFFFFF", color: "#6366F1", fontSize: 12, fontWeight: 700, cursor: "pointer"
                          }}
                        >
                          📋 Copy Code
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ───────────────── Tab View: Referred Sales ───────────────── */}
          {activeTab === "orders" && (
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden" }}>
              {paidOrders.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", color: "#94A3B8", marginBottom: 12 }}><BriefcaseIcon size={40} /></div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 4px" }}>No Referrals Recorded</h3>
                  <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>Once buyers use your coupon, verified sales transactions will populate here.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                        {["Gift Item", "Applied Code", "Order Price", "Earnings Earned", "Verified Date", "Status"].map(h => (
                          <th key={h} style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", textAlign: "left" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paidOrders.map((order, i) => (
                        <tr key={order.id} style={{ borderBottom: "1px solid #F1F5F9", background: i % 2 === 0 ? "#FFFFFF" : "#F8FAFC" }}>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{order.productName.replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim()}</div>
                            <div style={{ fontSize: 11, color: "#94A3B8" }}>by {order.buyerName}</div>
                          </td>
                          <td style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "#6366F1", fontFamily: "monospace" }}>{order.couponCode}</td>
                          <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#334155" }}>{fmt(order.amount)}</td>
                          <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 800, color: "#10B981" }}>{fmt(order.commissionAmount)}</td>
                          <td style={{ padding: "14px 20px", fontSize: 12, color: "#64748B" }}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: 20,
                              background: order.status === "finalized" ? "#E8F5E9" : "#EEF2F6", color: order.status === "finalized" ? "#2E7D32" : "#6366F1"
                            }}>{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ───────────────── Tab View: Payouts ───────────────── */}
          {activeTab === "payouts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Informational banner */}
              <div style={{ background: "#EEF2F6", border: "1px solid #CBD5E1", borderRadius: 12, padding: "16px 20px" }}>
                <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.5 }}>
                  ℹ️ Payouts are manually settled to your Google Pay, PhonePe, UPI ID, or bank account by the admin team whenever you cross the minimum threshold or request settlement.
                </p>
              </div>

              {/* Payout History Table */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden" }}>
                {payouts.length === 0 ? (
                  <div style={{ padding: "48px 24px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", color: "#94A3B8", marginBottom: 12 }}><DollarIcon size={40} /></div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 4px" }}>No Payouts Yet</h3>
                    <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>You haven't requested or received any payouts yet.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                          {["Settled Amount", "Transfer Channel", "Transaction Ref", "Date processed", "Status"].map(h => (
                            <th key={h} style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", textAlign: "left" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {payouts.map((p, i) => (
                          <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9", background: i % 2 === 0 ? "#FFFFFF" : "#F8FAFC" }}>
                            <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 800, color: "#10B981" }}>{fmt(p.amountPaise)}</td>
                            <td style={{ padding: "14px 20px", fontSize: 13, color: "#334155" }}>{p.method}</td>
                            <td style={{ padding: "14px 20px", fontSize: 12, color: "#64748B", fontFamily: "monospace" }}>{p.reference || "Processing..."}</td>
                            <td style={{ padding: "14px 20px", fontSize: 12, color: "#64748B" }}>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                            <td style={{ padding: "14px 20px" }}>
                              <span style={{
                                fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: 20,
                                background: p.status === "paid" ? "#E8F5E9" : "#FFF3E0", color: p.status === "paid" ? "#2E7D32" : "#EF6C00"
                              }}>{p.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───────────────── Tab View: Settings ───────────────── */}
          {activeTab === "settings" && (
            <div className="settings-card">
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
                <UserIcon /> Edit Creator Profile
              </h2>
              
              <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.name}
                    onChange={e => setSettingsForm(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: "100%", padding: "11px 14px", boxSizing: "border-box",
                      background: "#FFFFFF", border: "1px solid #CBD5E1",
                      borderRadius: 10, color: "#0F172A", fontSize: 13, outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={settingsForm.phone}
                    onChange={e => setSettingsForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    placeholder="10-digit phone number"
                    style={{
                      width: "100%", padding: "11px 14px", boxSizing: "border-box",
                      background: "#FFFFFF", border: "1px solid #CBD5E1",
                      borderRadius: 10, color: "#0F172A", fontSize: 13, outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={settingsForm.instagram}
                    onChange={e => setSettingsForm(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="@username"
                    style={{
                      width: "100%", padding: "11px 14px", boxSizing: "border-box",
                      background: "#FFFFFF", border: "1px solid #CBD5E1",
                      borderRadius: 10, color: "#0F172A", fontSize: 13, outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    YouTube Channel
                  </label>
                  <input
                    type="text"
                    value={settingsForm.youtube}
                    onChange={e => setSettingsForm(prev => ({ ...prev, youtube: e.target.value }))}
                    placeholder="Channel link or username"
                    style={{
                      width: "100%", padding: "11px 14px", boxSizing: "border-box",
                      background: "#FFFFFF", border: "1px solid #CBD5E1",
                      borderRadius: 10, color: "#0F172A", fontSize: 13, outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Other Platform Link
                  </label>
                  <input
                    type="text"
                    value={settingsForm.other}
                    onChange={e => setSettingsForm(prev => ({ ...prev, other: e.target.value }))}
                    placeholder="Website or portfolio URL"
                    style={{
                      width: "100%", padding: "11px 14px", boxSizing: "border-box",
                      background: "#FFFFFF", border: "1px solid #CBD5E1",
                      borderRadius: 10, color: "#0F172A", fontSize: 13, outline: "none"
                    }}
                  />
                </div>

                <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 20, marginTop: 10 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    💳 Payout Payment Details
                  </h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        UPI ID (VPA)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.upiId}
                        onChange={e => setSettingsForm(prev => ({ ...prev, upiId: e.target.value.trim() }))}
                        placeholder="e.g. username@upi or mobile@paytm"
                        style={{
                          width: "100%", padding: "11px 14px", boxSizing: "border-box",
                          background: "#FFFFFF", border: "1px solid #CBD5E1",
                          borderRadius: 10, color: "#0F172A", fontSize: 13, outline: "none"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Account Registered Name
                      </label>
                      <input
                        type="text"
                        value={settingsForm.upiName}
                        onChange={e => setSettingsForm(prev => ({ ...prev, upiName: e.target.value }))}
                        placeholder="Full name as registered in bank"
                        style={{
                          width: "100%", padding: "11px 14px", boxSizing: "border-box",
                          background: "#FFFFFF", border: "1px solid #CBD5E1",
                          borderRadius: 10, color: "#0F172A", fontSize: 13, outline: "none"
                        }}
                      />
                    </div>
                  </div>
                </div>

                {settingsMessage && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 10,
                    background: settingsMessage.startsWith("✅") ? "#E8F5E9" : "#FFEBEE",
                    color: settingsMessage.startsWith("✅") ? "#2E7D32" : "#C62828",
                    fontSize: 13, fontWeight: 600
                  }}>
                    {settingsMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={settingsSaving}
                  style={{
                    background: settingsSaving ? "#A5B4FC" : "#6366F1",
                    color: "#FFFFFF", border: "none", borderRadius: 10,
                    padding: "12px 24px", fontSize: 14, fontWeight: 700,
                    cursor: settingsSaving ? "not-allowed" : "pointer", alignSelf: "flex-start",
                    transition: "all 0.2s"
                  }}
                >
                  {settingsSaving ? "Saving..." : "Save Profile Details"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* ─── VOUCHER SHOW CODE MODAL ─────────────────────────────────────── */}
      {viewingClaim && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 28, maxWidth: 440, width: "100%", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <RewardTypeIcon type={viewingClaim.rewardType} size={48} />
            </div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{viewingClaim.rewardLabel}</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748B" }}>
              Your gift voucher code has been processed and verified by administration.
            </p>

            {/* Voucher Code Box */}
            <div style={{ background: "#F8FAFC", border: "2px dashed #CBD5E1", borderRadius: 14, padding: 16, marginBottom: viewingClaim.hasPin && viewingClaim.voucherPin ? 14 : 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>VOUCHER CODE</div>
              <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 900, color: "#6366F1", letterSpacing: 1, marginBottom: 10, wordBreak: "break-all" }}>
                {viewingClaim.voucherCode || "N/A"}
              </div>
              <button
                onClick={() => {
                  if (viewingClaim.voucherCode) handleCopyText(viewingClaim.voucherCode, "Voucher Code");
                }}
                style={{ padding: "6px 16px", borderRadius: 8, background: "#EEF2F6", color: "#6366F1", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
              >
                📋 Copy Code
              </button>
            </div>

            {/* Voucher PIN Box */}
            {viewingClaim.hasPin && viewingClaim.voucherPin && (
              <div style={{ background: "#F8FAFC", border: "2px dashed #CBD5E1", borderRadius: 14, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>VOUCHER PIN</div>
                <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 900, color: "#0F172A", letterSpacing: 1, marginBottom: 10 }}>
                  {viewingClaim.voucherPin}
                </div>
                <button
                  onClick={() => {
                    if (viewingClaim.voucherPin) handleCopyText(viewingClaim.voucherPin, "Voucher PIN");
                  }}
                  style={{ padding: "6px 16px", borderRadius: 8, background: "#EEF2F6", color: "#0F172A", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                >
                  📋 Copy PIN
                </button>
              </div>
            )}

            <button
              onClick={() => setViewingClaim(null)}
              style={{ width: "100%", padding: "11px", borderRadius: 10, background: "#6366F1", color: "#FFFFFF", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
