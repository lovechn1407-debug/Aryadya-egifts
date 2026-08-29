"use client";
import { useState, useEffect, useCallback, useRef } from "react";
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

/* ── SVG Icons ── */
function ChevronDownIcon({ className = "", size = 16 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}

function ArrowUpIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>
    </svg>
  );
}

function ArrowDownIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 12-7 7-7-7"/><path d="M12 5v14"/>
    </svg>
  );
}

function BarChartIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function CouponIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <line x1="13" y1="5" x2="13" y2="19" />
    </svg>
  );
}

function BriefcaseIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function DollarIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function SettingsIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function TrophyIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function TargetIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

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

/* ── Toast Notification Component ── */
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
      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)",
      backdropFilter: "blur(12px)", border: `1px solid ${isSuccess ? "#10B981" : isError ? "#EF4444" : "#818CF8"}`,
      animation: "fadeDown 0.3s ease-out", maxWidth: "90vw"
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

/* ── Light Mode Stat Cards Component ── */
function StatCardPattern({
  title,
  value,
  delta,
  positive = true,
  lastMonthText,
  icon,
}: {
  title: string;
  value: string;
  delta?: string;
  positive?: boolean;
  lastMonthText?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: 16,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      flex: "1 1 220px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "#64748B", margin: 0 }}>{title}</h3>
        {icon && <div style={{ color: "#64748B" }}>{icon}</div>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>
            {value}
          </span>
          {delta && (
            <span style={{
              fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 20,
              background: positive ? "#DCFCE7" : "#FEE2E2",
              color: positive ? "#15803D" : "#B91C1C",
              display: "inline-flex", alignItems: "center", gap: 3
            }}>
              {positive ? <ArrowUpIcon size={12} /> : <ArrowDownIcon size={12} />}
              {delta}
            </span>
          )}
        </div>
        <div style={{ height: 1, background: "#F1F5F9", width: "100%" }} />
        <div style={{ fontSize: 12, color: "#64748B" }}>
          {lastMonthText || "Calculated in real-time"}
        </div>
      </div>
    </div>
  );
}

/* ── Expandable Mission Reward Card Component ── */
function ExpandableMissionCard({
  reward: r,
  current,
  claim,
  onClaim,
  onShowCode,
  claimingId,
  onCopyText,
}: {
  reward: AffiliateReward;
  current: number;
  claim?: RewardClaim;
  onClaim: (rewardId: string) => void;
  onShowCode: (claim: RewardClaim) => void;
  claimingId: string | null;
  onCopyText: (text: string, label: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const unlocked = current >= r.referrals;
  const ratio = Math.min(100, Math.round((current / r.referrals) * 100));
  const isPending = claim && claim.status === "pending";
  const isFulfilled = claim && claim.status === "fulfilled";

  return (
    <div style={{
      background: "#FFFFFF",
      border: `1.5px solid ${isFulfilled ? "#10B981" : isPending ? "#F59E0B" : unlocked ? "#6366F1" : "#E2E8F0"}`,
      borderRadius: 18,
      padding: "20px 22px 14px",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
      overflow: "hidden",
      transition: "all 0.3s ease"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: "#F8FAFC",
            border: "1px solid #E2E8F0", display: "flex", alignItems: "center",
            justifyContent: "center"
          }}>
            <RewardTypeIcon type={r.rewardType} size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#6366F1", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {r.rewardType ? `${r.rewardType.toUpperCase()} REWARD` : "MISSION REWARD"}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>
              {fmt(r.rewardAmountPaise)}
            </div>
          </div>
        </div>

        <span style={{
          fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20,
          background: isFulfilled ? "#DCFCE7" : isPending ? "#FEF3C7" : unlocked ? "#EEF2F6" : "#F1F5F9",
          color: isFulfilled ? "#15803D" : isPending ? "#B45309" : unlocked ? "#4F46E5" : "#64748B",
        }}>
          {isFulfilled ? "Delivered ✓" : isPending ? "Reviewing ⏳" : unlocked ? "Goal Met 🎉" : `${ratio}%`}
        </span>
      </div>

      {/* Progress & Usage Details Container */}
      <div style={{
        background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14,
        display: "flex", flexDirection: "column", gap: 10
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "#64748B" }}>
          <span>Milestone Progress</span>
          <span>Sales Completed</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
          <span>{current} / {r.referrals} Sales</span>
          <span>{ratio}%</span>
        </div>
        <div style={{ height: 7, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${ratio}%`,
            background: isFulfilled ? "#10B981" : isPending ? "#F59E0B" : "linear-gradient(90deg, #6366F1, #4F46E5)",
            borderRadius: 99, transition: "width 0.5s ease"
          }} />
        </div>
      </div>

      {/* Expandable Content Area */}
      <div style={{
        maxHeight: isOpen ? 400 : 130,
        overflow: "hidden",
        transition: "max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{r.label}</div>
          <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.45 }}>
            {r.description || `Complete ${r.referrals} successful referrals to claim your ${r.rewardType || "voucher"} reward.`}
          </div>

          {/* Additional details when expanded */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 6, borderTop: "1px dashed #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#64748B" }}>Reward Amount</span>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>{fmt(r.rewardAmountPaise)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#64748B" }}>Target Referrals</span>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>{r.referrals} Sales</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#64748B" }}>Verification SLA</span>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>24 Hours Guaranteed</span>
            </div>
          </div>

          {/* 24h SLA Processing Banner */}
          {isPending && (
            <div style={{
              background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 10, padding: 12,
              display: "flex", flexDirection: "column", gap: 4
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#92400E", display: "flex", alignItems: "center", gap: 6 }}>
                ⚡ Processing · Credited in 24 Hours
              </div>
              <div style={{ fontSize: 11, color: "#B45309" }}>
                Claim registered! Admin is verifying your code/payout.
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          {isFulfilled ? (
            r.rewardType === "cash" ? (
              <div style={{
                width: "100%", padding: "10px 12px", borderRadius: 10, background: "#DCFCE7",
                border: "1px solid #86EFAC", color: "#15803D", fontSize: 12, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <span>Credited to Account ✓</span>
                {claim?.utr && (
                  <button
                    onClick={() => onCopyText(claim.utr!, "UTR Number")}
                    style={{
                      background: "#FFFFFF", border: "1px solid #86EFAC", color: "#166534",
                      padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer"
                    }}
                  >
                    UTR: {claim.utr} 📋
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => onShowCode(claim!)}
                style={{
                  width: "100%", padding: "10px", borderRadius: 10, border: "none",
                  fontSize: 12, fontWeight: 800, cursor: "pointer",
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  color: "#FFFFFF", boxShadow: "0 2px 8px rgba(16,185,129,0.2)"
                }}
              >
                Show Code 🎟️
              </button>
            )
          ) : isPending ? (
            <button
              disabled
              style={{
                width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #FCD34D",
                fontSize: 12, fontWeight: 700, cursor: "not-allowed",
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
                width: "100%", padding: "10px", borderRadius: 10, border: "none",
                fontSize: 12, fontWeight: 800, cursor: unlocked ? "pointer" : "not-allowed",
                background: unlocked ? "linear-gradient(135deg, #6366F1, #4F46E5)" : "#EEF2F6",
                color: unlocked ? "#FFFFFF" : "#64748B",
                boxShadow: unlocked ? "0 2px 8px rgba(99,102,241,0.2)" : "none"
              }}
            >
              {claimingId === r.id ? "Submitting..." : unlocked ? "Claim Reward 🎁" : `Locked (${r.referrals - current} More Sales Needed)`}
            </button>
          )}
        </div>

        {/* Faded gradient overlay when collapsed */}
        {!isOpen && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
            background: "linear-gradient(to top, #FFFFFF, transparent)",
            pointerEvents: "none"
          }} />
        )}
      </div>

      {/* Expand Chevron Button */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: -4 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20,
            padding: "4px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
            fontSize: 11, fontWeight: 700, color: "#64748B", boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}
        >
          <span>{isOpen ? "Less Details" : "More Details"}</span>
          <ChevronDownIcon size={14} className={isOpen ? "rotate-180 transition-transform duration-300" : "transition-transform duration-300"} />
        </button>
      </div>
    </div>
  );
}

/* ── Main Creator Dashboard Component ── */
export default function CreatorDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "coupons" | "orders" | "payouts" | "settings">("overview");

  // Custom Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Profile Settings Form state
  const [settingsForm, setSettingsForm] = useState({ name: "", phone: "", instagram: "", youtube: "", other: "", upiId: "", upiName: "" });
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Claim & Voucher Modal states
  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);
  const [viewingClaim, setViewingClaim] = useState<RewardClaim | null>(null);

  // Sliding Pill Tab Nav References
  const tabsList = [
    { id: "overview", label: "Overview" },
    { id: "coupons", label: "My Coupons" },
    { id: "orders", label: "Referred Sales" },
    { id: "payouts", label: "Payout History" },
    { id: "settings", label: "Account Settings" },
  ] as const;

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pillRef = useRef<HTMLSpanElement | null>(null);

  const updatePillPosition = useCallback(() => {
    const activeIndex = tabsList.findIndex(t => t.id === activeTab);
    const activeEl = tabRefs.current[activeIndex];
    if (activeEl && pillRef.current) {
      pillRef.current.style.transform = `translateX(${activeEl.offsetLeft}px)`;
      pillRef.current.style.width = `${activeEl.offsetWidth}px`;
    }
  }, [activeTab]);

  useEffect(() => {
    updatePillPosition();
    window.addEventListener("resize", updatePillPosition);
    return () => window.removeEventListener("resize", updatePillPosition);
  }, [updatePillPosition]);

  const fetchData = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/creator/me?uid=${userId}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSettingsSaving(true);
    try {
      const res = await fetch("/api/creator/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: data.creator.uid,
          email: data.creator.email,
          name: settingsForm.name,
          phone: settingsForm.phone,
          instagramHandle: settingsForm.instagram,
          youtubeHandle: settingsForm.youtube,
          otherHandle: settingsForm.other,
          upiId: settingsForm.upiId,
          upiName: settingsForm.upiName,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Account details updated successfully!", "success");
        await fetchData(data.creator.uid);
      } else {
        showToast(json.message || "Failed to update settings.", "error");
      }
    } catch {
      showToast("Network error. Failed to update settings.", "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center", color: "#64748B" }}>
          <div style={{ fontSize: 24, marginBottom: 8, animation: "spin 1s linear infinite" }}>🌀</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Loading Creator Dashboard...</div>
        </div>
      </div>
    );
  }

  const { creator, coupons, orders, payouts, rewards, rewardClaims, monthlyEarnings, pendingPayoutPaise } = data;
  const paidOrders = orders.filter(o => o.status === "PAID");
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthEarnings = monthlyEarnings[thisMonth] || 0;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "Inter, system-ui, sans-serif", color: "#0F172A", paddingBottom: 60 }}>
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* ── Header Bar ── */}
      <header style={{
        background: "#FFFFFF", borderBottom: "1px solid #E2E8F0", padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #6366F1, #4F46E5)",
            color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18
          }}>
            {creator.name?.charAt(0)?.toUpperCase() || "C"}
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "#0F172A" }}>{creator.name}</h1>
            <div style={{ fontSize: 12, color: "#64748B" }}>Creator Partner Dashboard</div>
          </div>
        </div>

        <button
          onClick={async () => { await auth.signOut(); router.push("/creator"); }}
          style={{
            background: "#F1F5F9", border: "1px solid #CBD5E1", color: "#475569",
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer"
          }}
        >
          Logout
        </button>
      </header>

      {/* ── Main Container Canvas (Single Background) ── */}
      <main style={{ maxWidth: 1160, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── Sliding Pill Navbar (t-tabs pattern adjusted for Light Mode) ── */}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "flex-start" }}>
          <div className="t-tabs" role="tablist" style={{
            position: "relative", display: "inline-flex", alignItems: "center", gap: 4,
            padding: 4, borderRadius: 48, background: "#F1F5F9", border: "1px solid #E2E8F0",
            maxWidth: "100%", overflowX: "auto"
          }}>
            <span ref={pillRef} className="t-tabs-pill" style={{
              position: "absolute", top: 4, left: 0, height: 36, width: 0,
              background: "#FFFFFF", borderRadius: 48, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              transition: "transform 250ms cubic-bezier(0.22, 1, 0.36, 1), width 250ms cubic-bezier(0.22, 1, 0.36, 1)",
              zIndex: 0, pointerEvents: "none"
            }} />
            {tabsList.map((tab, idx) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={el => { tabRefs.current[idx] = el; }}
                  onClick={() => setActiveTab(tab.id as any)}
                  role="tab"
                  aria-selected={isSelected}
                  style={{
                    position: "relative", border: 0, background: "transparent", height: 36,
                    padding: "6px 18px", color: isSelected ? "#0F172A" : "#64748B",
                    cursor: "pointer", borderRadius: 48, zIndex: 1, fontSize: 13, fontWeight: 700,
                    whiteSpace: "nowrap", transition: "color 250ms cubic-bezier(0.22, 1, 0.36, 1)"
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TAB: OVERVIEW ── */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Stat Cards Grid */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <StatCardPattern
                title="Total Earnings"
                value={fmt(creator.totalEarningsPaise)}
                delta="12.5%"
                positive={true}
                lastMonthText="Vs last month: ₹11,000"
                icon={<DollarIcon size={18} />}
              />
              <StatCardPattern
                title="This Month"
                value={fmt(thisMonthEarnings)}
                delta="Active"
                positive={true}
                lastMonthText="Calculated real-time"
                icon={<BarChartIcon size={18} />}
              />
              <StatCardPattern
                title="Unpaid Balance"
                value={fmt(pendingPayoutPaise)}
                delta="Pending"
                positive={false}
                lastMonthText="Direct UPI transfer"
                icon={<BriefcaseIcon size={18} />}
              />
              <StatCardPattern
                title="Total Sales"
                value={`${creator.totalReferrals}`}
                delta="Tracked"
                positive={true}
                lastMonthText="Successful referred orders"
                icon={<TrophyIcon size={18} />}
              />
            </div>

            {/* Reward Missions Section */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18, padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <TargetIcon size={20} color="#6366F1" /> Extra Reward Missions
              </h2>

              {!rewards.length ? (
                <div style={{ textAlign: "center", padding: "32px", color: "#64748B", fontSize: 13 }}>No reward missions active yet.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                  {rewards.map(r => {
                    const claim = rewardClaims.find(c => c.rewardId === r.id);
                    return (
                      <ExpandableMissionCard
                        key={r.id}
                        reward={r}
                        current={creator.totalReferrals}
                        claim={claim}
                        onClaim={handleClaimReward}
                        onShowCode={(c) => setViewingClaim(c)}
                        claimingId={claimingRewardId}
                        onCopyText={handleCopyText}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Monthly Earnings Chart */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18, padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <BarChartIcon size={20} color="#6366F1" /> Monthly Earnings Performance
              </h2>
              {Object.keys(monthlyEarnings).length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#64748B", fontSize: 13 }}>No monthly data recorded yet.</div>
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

        {/* ── TAB: COUPONS ── */}
        {activeTab === "coupons" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 16px" }}>Assigned Creator Coupons</h2>
            {!coupons.length ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748B", fontSize: 13 }}>No unique coupons assigned yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {coupons.map(c => (
                  <div key={c.id} style={{
                    background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: "16px 20px",
                    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 800, color: "#6366F1" }}>{c.id}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 10, background: c.active ? "#DCFCE7" : "#FEE2E2", color: c.active ? "#15803D" : "#B91C1C" }}>
                          {c.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>
                        Discount: <strong>{c.discountType === "percentage" ? `${c.discountAmount}%` : fmt(c.discountAmount * 100)}</strong> · Commission: <strong>{c.commissionPercentage}%</strong> · Used: <strong>{c.usedCount} times</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyText(c.id, "Coupon Code")}
                      style={{
                        padding: "8px 16px", borderRadius: 8, border: "1px solid #6366F1",
                        background: "#FFFFFF", color: "#6366F1", fontSize: 12, fontWeight: 700, cursor: "pointer"
                      }}
                    >
                      📋 Copy Coupon
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: REFERRED SALES ── */}
        {activeTab === "orders" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18, padding: 24, overflowX: "auto" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 16px" }}>Referred Sales History</h2>
            {!paidOrders.length ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748B", fontSize: 13 }}>No referred orders recorded yet.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E2E8F0", textAlign: "left", color: "#64748B" }}>
                    <th style={{ padding: "10px" }}>Order ID</th>
                    <th style={{ padding: "10px" }}>Product</th>
                    <th style={{ padding: "10px" }}>Amount</th>
                    <th style={{ padding: "10px" }}>Commission</th>
                    <th style={{ padding: "10px" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paidOrders.map(o => (
                    <tr key={o.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px 10px", fontFamily: "monospace", fontWeight: 700 }}>{o.id}</td>
                      <td style={{ padding: "12px 10px" }}>{o.productName}</td>
                      <td style={{ padding: "12px 10px", fontWeight: 700 }}>{fmt(o.amount)}</td>
                      <td style={{ padding: "12px 10px", fontWeight: 800, color: "#10B981" }}>{fmt(o.commissionAmount)}</td>
                      <td style={{ padding: "12px 10px", color: "#64748B" }}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── TAB: PAYOUTS ── */}
        {activeTab === "payouts" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18, padding: 24, overflowX: "auto" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 16px" }}>Payout Settlements History</h2>
            {!payouts.length ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748B", fontSize: 13 }}>No payouts recorded yet.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E2E8F0", textAlign: "left", color: "#64748B" }}>
                    <th style={{ padding: "10px" }}>Payout ID</th>
                    <th style={{ padding: "10px" }}>Amount</th>
                    <th style={{ padding: "10px" }}>Status</th>
                    <th style={{ padding: "10px" }}>UTR / Ref</th>
                    <th style={{ padding: "10px" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px 10px", fontFamily: "monospace", fontWeight: 700 }}>{p.id}</td>
                      <td style={{ padding: "12px 10px", fontWeight: 800, color: "#0F172A" }}>{fmt(p.amountPaise)}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 10,
                          background: p.status === "paid" ? "#DCFCE7" : "#FEF3C7",
                          color: p.status === "paid" ? "#15803D" : "#B45309"
                        }}>
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "12px 10px", fontFamily: "monospace" }}>{p.reference || "N/A"}</td>
                      <td style={{ padding: "12px 10px", color: "#64748B" }}>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── TAB: ACCOUNT SETTINGS ── */}
        {activeTab === "settings" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18, padding: 24, maxWidth: 640 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 20px" }}>Account & Payout Settings</h2>
            <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Full Name</label>
                <input
                  type="text"
                  value={settingsForm.name}
                  onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Phone Number</label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>UPI ID for Payouts</label>
                  <input
                    type="text"
                    value={settingsForm.upiId}
                    onChange={e => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                    placeholder="name@upi"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Account Holder Name</label>
                  <input
                    type="text"
                    value={settingsForm.upiName}
                    onChange={e => setSettingsForm({ ...settingsForm, upiName: e.target.value })}
                    placeholder="Name as per UPI"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={settingsSaving}
                style={{
                  marginTop: 8, padding: "12px", borderRadius: 10, border: "none",
                  background: "#6366F1", color: "#FFFFFF", fontSize: 13, fontWeight: 800, cursor: "pointer"
                }}
              >
                {settingsSaving ? "Saving Settings..." : "Save Account Settings"}
              </button>
            </form>
          </div>
        )}

      </main>

      {/* ── Voucher "Show Code" Modal ── */}
      {viewingClaim && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 28, maxWidth: 440, width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <RewardTypeIcon type={viewingClaim.rewardType} size={48} />
            </div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{viewingClaim.rewardLabel}</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748B" }}>
              Your voucher code has been verified and issued by administration.
            </p>

            <div style={{ background: "#F8FAFC", border: "2px dashed #CBD5E1", borderRadius: 14, padding: 16, marginBottom: viewingClaim.hasPin && viewingClaim.voucherPin ? 14 : 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>VOUCHER CODE</div>
              <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 900, color: "#6366F1", letterSpacing: 1, marginBottom: 10, wordBreak: "break-all" }}>
                {viewingClaim.voucherCode || "N/A"}
              </div>
              <button
                onClick={() => { if (viewingClaim.voucherCode) handleCopyText(viewingClaim.voucherCode, "Voucher Code"); }}
                style={{ padding: "6px 16px", borderRadius: 8, background: "#EEF2F6", color: "#6366F1", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
              >
                📋 Copy Code
              </button>
            </div>

            {viewingClaim.hasPin && viewingClaim.voucherPin && (
              <div style={{ background: "#F8FAFC", border: "2px dashed #CBD5E1", borderRadius: 14, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>VOUCHER PIN</div>
                <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 900, color: "#0F172A", letterSpacing: 1, marginBottom: 10 }}>
                  {viewingClaim.voucherPin}
                </div>
                <button
                  onClick={() => { if (viewingClaim.voucherPin) handleCopyText(viewingClaim.voucherPin, "Voucher PIN"); }}
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
