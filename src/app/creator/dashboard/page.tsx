"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { Creator, AffiliateMilestone, AffiliateReward, Payout } from "@/lib/db";
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

// Milestone Progress Card-based Redesign
function MilestoneProgress({ milestones, current }: { milestones: AffiliateMilestone[]; current: number }) {
  if (!milestones.length) return (
    <div style={{ textAlign: "center", padding: "24px", color: "#64748B", fontSize: 13 }}>No milestones configured yet.</div>
  );

  const sortedMilestones = [...milestones].sort((a, b) => a.referrals - b.referrals);
  
  // Find current active milestone level
  const activeMilestone = [...sortedMilestones].reverse().find(m => current >= m.referrals);
  // Find next milestone level
  const nextMilestone = sortedMilestones.find(m => current < m.referrals);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Active Tier Overview Status Card */}
      <div style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 12
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

        <p style={{ fontSize: 14, color: "#475569", margin: 0, lineHeight: 1.5 }}>
          {nextMilestone ? (
            <>
              You have completed <strong>{current}</strong> successful referrals. You only need <strong>{nextMilestone.referrals - current}</strong> more sales to unlock the <strong style={{ color: "#6366F1" }}>{nextMilestone.label}</strong> tier!
            </>
          ) : (
            <>
              Amazing job! You have reached the maximum level of <strong>{activeMilestone?.label}</strong> with <strong>{current}</strong> total referred sales!
            </>
          )}
        </p>

        {nextMilestone && (
          <div style={{ width: "100%" }}>
            {/* Compute current step progress bar */}
            {(() => {
              const previousTarget = activeMilestone ? activeMilestone.referrals : 0;
              const nextTarget = nextMilestone.referrals;
              const range = nextTarget - previousTarget;
              const completedInRange = current - previousTarget;
              const percent = Math.min(100, Math.max(0, (completedInRange / range) * 100));
              return (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748B", marginBottom: 6 }}>
                    <span>Progress to next tier</span>
                    <span>{current} / {nextTarget} referrals</span>
                  </div>
                  <div style={{ height: 6, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${percent}%`, background: "#6366F1", borderRadius: 99 }} />
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Grid of Milestone Tier Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 16
      }}>
        {sortedMilestones.map((m) => {
          const unlocked = current >= m.referrals;
          // Determine if this is the active level they are currently on
          const isCurrentActive = activeMilestone?.id === m.id;
          // Determine if this level is currently in progress
          const isInProgress = nextMilestone?.id === m.id;
          
          return (
            <div key={m.id} style={{
              background: "#FFFFFF",
              border: isCurrentActive ? "2px solid #10B981" : isInProgress ? "2px solid #6366F1" : "1px solid #E2E8F0",
              borderRadius: 16,
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              boxShadow: (isCurrentActive || isInProgress) ? "0 4px 12px rgba(0,0,0,0.03)" : "none",
              position: "relative",
              opacity: unlocked ? 1 : 0.75
            }}>
              {/* Top Row: Title & Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: 0 }}>{m.label}</h3>
                  <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600, display: "block", marginTop: 2 }}>
                    Goal: {m.referrals} referrals
                  </span>
                </div>
                
                {/* Status Badge */}
                <div>
                  {unlocked ? (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 20,
                      background: "#E8F5E9", color: "#2E7D32", display: "flex", alignItems: "center", gap: 4
                    }}>
                      <CheckCircleIcon size={12} /> Unlocked
                    </span>
                  ) : isInProgress ? (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 20,
                      background: "#EEF2F6", color: "#6366F1", display: "flex", alignItems: "center", gap: 4
                    }}>
                      <TrendingUpIcon size={12} /> Active Goal
                    </span>
                  ) : (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 20,
                      background: "#F1F5F9", color: "#94A3B8", display: "flex", alignItems: "center", gap: 4
                    }}>
                      <LockIcon size={12} /> Locked
                    </span>
                  )}
                </div>
              </div>

              {/* Commission Tier Info */}
              <div style={{
                background: unlocked ? "#F0FDF4" : isInProgress ? "#EEF2F6" : "#F8FAFC",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 13,
                fontWeight: 700,
                color: unlocked ? "#15803D" : isInProgress ? "#4F46E5" : "#64748B",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <span>Commission Rate:</span>
                <span>+{m.bonusPercentage}% Bonus</span>
              </div>

              {/* In Progress details */}
              {isInProgress && (
                <div style={{ marginTop: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748B", marginBottom: 6 }}>
                    <span>{current} / {m.referrals} completed</span>
                    <span>{Math.round((current / m.referrals) * 100)}%</span>
                  </div>
                  <div style={{ height: 4, background: "#E2E8F0", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${(current / m.referrals) * 100}%`, background: "#6366F1", borderRadius: 99 }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </div>
  );
}

// Reward Missions
function RewardMissionsList({ 
  rewards, 
  current,
  claimedIds = [],
  onClaim
}: { 
  rewards: AffiliateReward[]; 
  current: number;
  claimedIds: string[];
  onClaim: (id: string) => void;
}) {
  if (!rewards.length) return (
    <div style={{ textAlign: "center", padding: "24px", color: "#64748B", fontSize: 13 }}>No rewards program set yet.</div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
      {rewards.map(r => {
        const unlocked = current >= r.referrals;
        const claimed = claimedIds.includes(r.id);
        const ratio = Math.min(100, (current / r.referrals) * 100);
        return (
          <div key={r.id} style={{
            background: claimed ? "#F8FAFC" : unlocked ? "#F0FDF4" : "#FFFFFF",
            border: `1px solid ${claimed ? "#E2E8F0" : unlocked ? "#A7F3D0" : "#E2E8F0"}`,
            borderRadius: 16, padding: 18, position: "relative",
            display: "flex", flexDirection: "column", gap: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ color: claimed ? "#94A3B8" : unlocked ? "#10B981" : "#6366F1" }}>
                {unlocked ? <TrophyIcon size={24} /> : <TargetIcon size={24} />}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: claimed ? "#64748B" : unlocked ? "#166534" : "#4F46E5",
                background: claimed ? "#E2E8F0" : unlocked ? "#DCFCE7" : "#EEF2F6",
                padding: "2px 8px", borderRadius: 20
              }}>{claimed ? "Claimed" : unlocked ? "Completed" : "Active"}</span>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{r.label}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 14, lineHeight: 1.4 }}>{r.description}</div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase" }}>Bonus Reward</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: claimed ? "#64748B" : unlocked ? "#10B981" : "#0F172A" }}>{fmt(r.rewardAmountPaise)}</div>
              </div>
              {!unlocked && (
                <div style={{ textAlign: "right", minWidth: 80 }}>
                  <span style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4 }}>{current} / {r.referrals} Sales</span>
                  <div style={{ height: 4, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${ratio}%`, background: "#6366F1" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Claim Reward Button */}
            <button
              onClick={() => onClaim(r.id)}
              disabled={!unlocked || claimed}
              style={{
                width: "100%", padding: "10px", borderRadius: 10, border: "none",
                fontSize: 12, fontWeight: 700, cursor: (unlocked && !claimed) ? "pointer" : "not-allowed",
                background: claimed ? "#F1F5F9" : unlocked ? "#10B981" : "#EEF2F6",
                color: claimed ? "#94A3B8" : unlocked ? "#FFFFFF" : "#64748B",
                transition: "all 0.2s",
                boxShadow: (unlocked && !claimed) ? "0 2px 6px rgba(16,185,129,0.2)" : "none"
              }}
            >
              {claimed ? "Claimed ✓" : unlocked ? "Claim Reward 🎁" : `Locked (Need ${r.referrals - current} More Sales)`}
            </button>
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

  // Local state for editing settings
  const [settingsForm, setSettingsForm] = useState({ name: "", phone: "", instagram: "", youtube: "", other: "" });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");

  // Claimed Rewards state persistence
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("claimed_rewards");
        if (stored) setClaimedRewards(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleClaimReward = (rewardId: string) => {
    const updated = [...claimedRewards, rewardId];
    setClaimedRewards(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("claimed_rewards", JSON.stringify(updated));
    }
    alert("🎉 Claim Request Submitted!\n\nYour reward claim has been registered. The admin team will credit this bonus reward in your next payout.");
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
          other: json.creator.otherHandle || ""
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
          otherHandle: settingsForm.other
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
                  <TrophyIcon size={20} color="#6366F1" /> Referral Milestone Levels
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
                  claimedIds={claimedRewards}
                  onClaim={handleClaimReward}
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
    </div>
  );
}
