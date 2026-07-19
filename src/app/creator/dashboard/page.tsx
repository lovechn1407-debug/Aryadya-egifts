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

// Modernized stat cards with custom borders and clear layout
function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub?: string; color: string }) {
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
      flex: 1,
      minWidth: 200,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}10`, color: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0
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

// Interactive Milestones Progress bar
function MilestoneProgress({ milestones, current }: { milestones: AffiliateMilestone[]; current: number }) {
  if (!milestones.length) return (
    <div style={{ textAlign: "center", padding: "24px", color: "#64748B", fontSize: 13 }}>No milestones configured yet.</div>
  );

  const sortedMilestones = [...milestones].sort((a, b) => a.referrals - b.referrals);
  const maxRef = Math.max(...sortedMilestones.map(m => m.referrals), 1);
  const progress = Math.min(100, (current / maxRef) * 100);

  return (
    <div style={{ padding: "4px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569", fontWeight: 600, marginBottom: 12 }}>
        <span>Current Progress: <strong>{current} Referrals</strong></span>
        <span>Target Goal: <strong>{maxRef}</strong></span>
      </div>

      {/* Progress Track */}
      <div style={{ position: "relative", height: 8, background: "#E2E8F0", borderRadius: 99, marginBottom: 32 }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%", width: `${progress}%`,
          background: "linear-gradient(90deg, #6366F1, #4F46E5)", borderRadius: 99,
          transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
        }} />

        {/* Checkpoint bubbles */}
        {sortedMilestones.map(m => {
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
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: unlocked ? "#6366F1" : "#FFFFFF",
                border: `2px solid ${unlocked ? "#6366F1" : "#CBD5E1"}`,
                boxShadow: unlocked ? "0 2px 5px rgba(99,102,241,0.2)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: unlocked ? "#FFFFFF" : "#94A3B8", fontSize: 9, fontWeight: 700,
                transition: "all 0.3s"
              }}>
                {unlocked ? "✓" : m.referrals}
              </div>
              <div style={{
                position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)",
                fontSize: 10, fontWeight: 700, color: unlocked ? "#6366F1" : "#64748B",
                whiteSpace: "nowrap", textAlign: "center"
              }}>
                {m.label} ({m.bonusPercentage}%)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Reward Missions lists
function RewardMissionsList({ rewards, current }: { rewards: AffiliateReward[]; current: number }) {
  if (!rewards.length) return (
    <div style={{ textAlign: "center", padding: "24px", color: "#64748B", fontSize: 13 }}>No rewards program set yet.</div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
      {rewards.map(r => {
        const unlocked = current >= r.referrals;
        const ratio = Math.min(100, (current / r.referrals) * 100);
        return (
          <div key={r.id} style={{
            background: unlocked ? "#F0FDF4" : "#FFFFFF",
            border: `1px solid ${unlocked ? "#A7F3D0" : "#E2E8F0"}`,
            borderRadius: 16, padding: 18, position: "relative"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>{unlocked ? "🏆" : "🎯"}</span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: unlocked ? "#166534" : "#4F46E5",
                background: unlocked ? "#DCFCE7" : "#EEF2F6",
                padding: "2px 8px", borderRadius: 20
              }}>{unlocked ? "Claimed" : "Active"}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{r.label}</div>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 14 }}>{r.description}</div>
            
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase" }}>Bonus Reward</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: unlocked ? "#166534" : "#0F172A" }}>{fmt(r.rewardAmountPaise)}</div>
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
  const [activeTab, setActiveTab] = useState<"overview" | "coupons" | "orders" | "payouts">("overview");

  const fetchData = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/creator/me?uid=${userId}`);
      const json = await res.json();
      if (json.success) setData(json);
      else router.replace("/creator");
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

  if (loading || !data) {
    return (
      <div style={{ flex: 1, minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #6366F1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  const { creator, coupons, orders, payouts, milestones, rewards, monthlyEarnings, pendingPayoutPaise } = data;
  const paidOrders = orders.filter(o => o.status === "paid" || o.status === "editing" || o.status === "finalized");
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthEarnings = monthlyEarnings[thisMonth] || 0;

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "coupons", label: "My Coupons", icon: "🎟️" },
    { id: "orders", label: "Referred Sales", icon: "💼" },
    { id: "payouts", label: "Payouts History", icon: "💸" },
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
        .bottom-nav {
          display: none;
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
            height: 64px;
            z-index: 90;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.03);
          }
          .bottom-nav-btn {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            border: none;
            background: none;
            color: #64748B;
            font-size: 10px;
            font-weight: 700;
            cursor: pointer;
          }
          .bottom-nav-btn.active {
            color: #6366F1;
          }
          .desktop-menu {
            display: none !important;
          }
        }
      `}</style>

      {/* 1. Left Sidebar Navigation (Desktop) */}
      <aside className="sidebar">
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, padding: "0 16px 8px" }}>
          Menu options
        </div>
        {sidebarItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`sidebar-btn ${activeTab === item.id ? "active" : ""}`}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </aside>

      {/* 2. Responsive Bottom Nav (Mobile/Phone screens) */}
      <nav className="bottom-nav">
        {sidebarItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`bottom-nav-btn ${activeTab === item.id ? "active" : ""}`}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>

      {/* 3. Main Dashboard Contents Display Area */}
      <main className="main-container">
        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
          {/* Welcome Info */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", margin: "0 0 6px", letterSpacing: -0.5 }}>
              Dashboard Overview
            </h1>
            <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>Review earnings, rewards, statistics, and coupon references.</p>
          </div>

          {/* Core Statistics grid */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
            <StatCard icon="💰" label="Total Earnings" value={fmt(creator.totalEarningsPaise)} color="#6366F1" />
            <StatCard icon="📅" label="This Month" value={fmt(thisMonthEarnings)} color="#4F46E5" />
            <StatCard icon="⏳" label="Unpaid Balance" value={fmt(pendingPayoutPaise)} sub="Pending transfer" color="#D97706" />
            <StatCard icon="💼" label="Referred Sales" value={`${creator.totalReferrals} orders`} color="#10B981" />
          </div>

          {/* ───────────────── Tab View: Overview ───────────────── */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Progress Milestones */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: "24px 24px 44px" }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: "0 0 20px" }}>🏆 Referral Milestone Levels</h2>
                <MilestoneProgress milestones={milestones} current={creator.totalReferrals} />
              </div>

              {/* Rewards Program */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: "0 0 20px" }}>🎯 Extra Reward Missions</h2>
                <RewardMissionsList rewards={rewards} current={creator.totalReferrals} />
              </div>

              {/* Monthly stats chart bar */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: "0 0 24px" }}>📈 Earnings Performance Chart</h2>
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
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎟️</div>
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
                  <div style={{ fontSize: 40, marginBottom: 12 }}>💼</div>
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
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💸</div>
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
        </div>
      </main>
    </div>
  );
}
