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

function StatCard({ icon, label, value, sub, accent }: { icon: string; label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: "rgba(15,15,25,0.7)", backdropFilter: "blur(16px)",
      border: `1px solid ${accent ? `${accent}30` : "rgba(255,255,255,0.06)"}`,
      borderRadius: 16, padding: "20px 22px",
      position: "relative", overflow: "hidden",
    }}>
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)` }} />}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        {sub && <span style={{ fontSize: 10, fontWeight: 700, color: accent || "#64748B", background: `${accent || "#64748B"}18`, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>{sub}</span>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#F1F5F9", fontFamily: "'Nunito', sans-serif", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function MilestoneBar({ milestones, current }: { milestones: AffiliateMilestone[]; current: number }) {
  if (!milestones.length) return (
    <div style={{ textAlign: "center", padding: "32px", color: "#475569", fontSize: 13 }}>
      No milestones set yet. Check back later!
    </div>
  );

  const maxRef = Math.max(...milestones.map(m => m.referrals));
  const progress = Math.min(100, (current / maxRef) * 100);

  return (
    <div style={{ padding: "4px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600 }}>
          <span style={{ color: "#A78BFA", fontWeight: 800 }}>{current}</span> total referrals
        </span>
        <span style={{ fontSize: 12, color: "#64748B" }}>Next: {milestones.find(m => m.referrals > current)?.referrals ?? "Max reached"} referrals</span>
      </div>

      {/* Track */}
      <div style={{ position: "relative", height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 99, marginBottom: 28 }}>
        {/* Fill */}
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${progress}%`, borderRadius: 99,
          background: "linear-gradient(90deg, #7C3AED, #EC4899)",
          transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 0 12px rgba(124,58,237,0.6)",
        }} />

        {/* Checkpoints */}
        {milestones.map(m => {
          const pos = (m.referrals / maxRef) * 100;
          const unlocked = current >= m.referrals;
          return (
            <div key={m.id} style={{ position: "absolute", left: `${pos}%`, top: "50%", transform: "translate(-50%, -50%)", zIndex: 2 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: unlocked ? "linear-gradient(135deg, #7C3AED, #EC4899)" : "rgba(15,15,25,0.9)",
                border: `2px solid ${unlocked ? "#A78BFA" : "rgba(255,255,255,0.15)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, transition: "all 0.3s",
                boxShadow: unlocked ? "0 0 12px rgba(124,58,237,0.6)" : "none",
              }}>
                {unlocked ? "✓" : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestone labels */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {milestones.map(m => {
          const unlocked = current >= m.referrals;
          return (
            <div key={m.id} style={{
              flex: "1 1 140px", padding: "12px 14px", borderRadius: 12,
              background: unlocked ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${unlocked ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.06)"}`,
              transition: "all 0.3s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>{unlocked ? "✅" : "🔒"}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: unlocked ? "#A78BFA" : "#475569", textTransform: "uppercase", letterSpacing: 0.4 }}>{m.referrals} Referrals</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: unlocked ? "#E2E8F0" : "#64748B" }}>{m.label}</div>
              <div style={{ fontSize: 12, color: unlocked ? "#818CF8" : "#475569", marginTop: 2 }}>+{m.bonusPercentage}% bonus tier</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RewardCards({ rewards, current }: { rewards: AffiliateReward[]; current: number }) {
  if (!rewards.length) return (
    <div style={{ textAlign: "center", padding: "32px", color: "#475569", fontSize: 13 }}>No reward missions set yet.</div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
      {rewards.map(r => {
        const unlocked = current >= r.referrals;
        const progress = Math.min(100, (current / r.referrals) * 100);
        return (
          <div key={r.id} style={{
            background: unlocked ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${unlocked ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}`,
            borderRadius: 16, padding: "18px 16px", transition: "all 0.3s",
            position: "relative", overflow: "hidden",
          }}>
            {unlocked && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #10B981, #34D399)" }} />}
            <div style={{ fontSize: 24, marginBottom: 8 }}>{unlocked ? "🎁" : "🎯"}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: unlocked ? "#34D399" : "#E2E8F0", marginBottom: 4 }}>{r.label}</div>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12, lineHeight: 1.5 }}>{r.description}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: unlocked ? "#10B981" : "#94A3B8", marginBottom: 8 }}>{fmt(r.rewardAmountPaise)}</div>
            {!unlocked && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginBottom: 6 }}>
                  <span>{current}/{r.referrals} referrals</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #7C3AED, #EC4899)", borderRadius: 99 }} />
                </div>
              </>
            )}
            {unlocked && <div style={{ fontSize: 12, fontWeight: 700, color: "#10B981" }}>✓ Reward Unlocked!</div>}
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
  const [uid, setUid] = useState<string | null>(null);

  const fetchData = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/creator/me?uid=${userId}`);
      const json = await res.json();
      if (json.success) setData(json);
      else { router.replace("/creator"); }
    } catch { router.replace("/creator"); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.replace("/creator"); return; }
      setUid(user.uid);
      await fetchData(user.uid);
    });
    return () => unsub();
  }, [router, fetchData]);

  if (loading || !data) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid rgba(124,58,237,0.3)", borderTopColor: "#7C3AED", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#475569", fontSize: 14 }}>Loading your dashboard...</p>
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  const { creator, coupons, orders, payouts, milestones, rewards, monthlyEarnings, pendingPayoutPaise } = data;
  const paidOrders = orders.filter(o => o.status === "paid" || o.status === "editing" || o.status === "finalized");
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthEarnings = monthlyEarnings[thisMonth] || 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "coupons", label: "My Coupons", icon: "🎟️" },
    { id: "orders", label: "Referred Sales", icon: "💼" },
    { id: "payouts", label: "Payouts", icon: "💸" },
  ] as const;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px clamp(16px, 4vw, 32px) 80px" }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .tab-btn:hover { background: rgba(124,58,237,0.12) !important; color: #A78BFA !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 36, animation: "fadeUp 0.4s ease" }}>
        {creator.photoURL && <img src={creator.photoURL} alt={creator.name} style={{ width: 60, height: 60, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.4)", objectFit: "cover" }} />}
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#F1F5F9", margin: "0 0 4px", letterSpacing: -0.5 }}>
            Welcome back, {creator.name.split(" ")[0]}! 👋
          </h1>
          <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>{creator.email} · Affiliate Creator</p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32, animation: "fadeUp 0.5s ease" }}>
        <StatCard icon="💰" label="Total Earned" value={fmt(creator.totalEarningsPaise)} sub="All time" accent="#7C3AED" />
        <StatCard icon="📅" label="This Month" value={fmt(thisMonthEarnings)} accent="#818CF8" />
        <StatCard icon="⏳" label="Pending Payout" value={fmt(pendingPayoutPaise)} sub="Unpaid" accent="#F59E0B" />
        <StatCard icon="📦" label="Total Referrals" value={String(creator.totalReferrals)} sub="Sales" accent="#10B981" />
        <StatCard icon="✅" label="Total Paid Out" value={fmt(creator.totalPaidPaise)} accent="#64748B" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="tab-btn"
            style={{
              padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
              background: activeTab === tab.id ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.03)",
              color: activeTab === tab.id ? "#A78BFA" : "#64748B",
              fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: activeTab === tab.id ? "0 0 0 1px rgba(124,58,237,0.3)" : "none",
            }}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          {/* Milestones */}
          <div style={{ background: "rgba(15,15,25,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 28px", marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#E2E8F0", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
              🏆 Milestone Progress
            </h2>
            <MilestoneBar milestones={milestones} current={creator.totalReferrals} />
          </div>

          {/* Reward Missions */}
          <div style={{ background: "rgba(15,15,25,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 28px", marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#E2E8F0", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
              🎯 Reward Missions
            </h2>
            <RewardCards rewards={rewards} current={creator.totalReferrals} />
          </div>

          {/* Monthly Earnings Chart */}
          <div style={{ background: "rgba(15,15,25,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 28px" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#E2E8F0", margin: "0 0 20px" }}>
              📈 Monthly Earnings
            </h2>
            {Object.keys(monthlyEarnings).length === 0 ? (
              <p style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No earnings yet. Share your coupon code to start earning!</p>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120, padding: "0 8px" }}>
                {Object.entries(monthlyEarnings).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([month, amount]) => {
                  const maxAmt = Math.max(...Object.values(monthlyEarnings));
                  const h = Math.max(12, (amount / maxAmt) * 100);
                  const isCurrentMonth = month === thisMonth;
                  return (
                    <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>{fmt(amount)}</span>
                      <div style={{
                        width: "100%", height: `${h}%`, borderRadius: "6px 6px 0 0",
                        background: isCurrentMonth ? "linear-gradient(180deg, #7C3AED, #EC4899)" : "rgba(124,58,237,0.3)",
                        transition: "height 0.8s ease",
                        boxShadow: isCurrentMonth ? "0 0 12px rgba(124,58,237,0.4)" : "none",
                      }} />
                      <span style={{ fontSize: 10, color: isCurrentMonth ? "#A78BFA" : "#475569", fontWeight: 700 }}>
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

      {/* Tab: My Coupons */}
      {activeTab === "coupons" && (
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          {coupons.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 32px", background: "rgba(15,15,25,0.7)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎟️</div>
              <h3 style={{ color: "#E2E8F0", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>No Coupons Yet</h3>
              <p style={{ color: "#64748B", fontSize: 13 }}>Your admin will generate a coupon code for you. Share it with your audience to start earning!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {coupons.map(coupon => (
                <div key={coupon.id} style={{
                  background: "rgba(15,15,25,0.7)", backdropFilter: "blur(16px)",
                  border: `1px solid ${coupon.active ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 16, padding: "20px 24px",
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{
                        fontSize: 16, fontWeight: 900, color: "#A78BFA",
                        background: "rgba(124,58,237,0.12)", padding: "4px 12px", borderRadius: 8,
                        fontFamily: "monospace", letterSpacing: 1
                      }}>{coupon.id}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        background: coupon.active ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                        color: coupon.active ? "#34D399" : "#F87171",
                        textTransform: "uppercase", letterSpacing: 0.5
                      }}>{coupon.active ? "Active" : "Inactive"}</span>
                    </div>
                    <p style={{ color: "#64748B", fontSize: 12, margin: "0 0 8px" }}>{coupon.description}</p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "#94A3B8" }}>
                        Discount: <strong style={{ color: "#E2E8F0" }}>
                          {coupon.discountType === "percentage" ? `${coupon.discountAmount}%` : fmt(coupon.discountAmount * 100)}
                        </strong>
                      </span>
                      <span style={{ fontSize: 12, color: "#94A3B8" }}>Your Commission: <strong style={{ color: "#A78BFA" }}>{coupon.commissionPercentage || 0}%</strong></span>
                      <span style={{ fontSize: 12, color: "#94A3B8" }}>Used: <strong style={{ color: "#E2E8F0" }}>{coupon.usedCount}/{coupon.totalStocks}</strong></span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>Valid until</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8" }}>
                      {coupon.validTo ? new Date(coupon.validTo).toLocaleDateString("en-IN") : "No limit"}
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(coupon.id); }}
                      style={{
                        marginTop: 10, padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(124,58,237,0.3)",
                        background: "rgba(124,58,237,0.1)", color: "#A78BFA", fontSize: 11, fontWeight: 700, cursor: "pointer"
                      }}
                    >📋 Copy Code</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Referred Sales */}
      {activeTab === "orders" && (
        <div style={{ animation: "fadeUp 0.4s ease", background: "rgba(15,15,25,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden" }}>
          {paidOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 32px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <h3 style={{ color: "#E2E8F0", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>No Sales Yet</h3>
              <p style={{ color: "#64748B", fontSize: 13 }}>Share your coupon code and your sales will appear here when customers complete their purchase.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Product", "Coupon", "Sale Amount", "Your Commission", "Date", "Status"].map(h => (
                      <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paidOrders.map((order, i) => (
                    <tr key={order.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>{order.productName.replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim()}</div>
                        <div style={{ fontSize: 11, color: "#475569" }}>by {order.buyerName}</div>
                      </td>
                      <td style={{ padding: "14px 20px" }}><span style={{ fontSize: 12, fontWeight: 700, color: "#A78BFA", fontFamily: "monospace" }}>{order.couponCode || "—"}</span></td>
                      <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>{fmt(order.amount)}</td>
                      <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 800, color: "#34D399" }}>{fmt(order.commissionAmount)}</td>
                      <td style={{ padding: "14px 20px", fontSize: 12, color: "#64748B" }}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                          textTransform: "uppercase", letterSpacing: 0.4,
                          background: order.status === "finalized" ? "rgba(16,185,129,0.12)" : "rgba(124,58,237,0.12)",
                          color: order.status === "finalized" ? "#34D399" : "#A78BFA",
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

      {/* Tab: Payouts */}
      {activeTab === "payouts" && (
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          {/* Payout summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
            <StatCard icon="⏳" label="Pending Payout" value={fmt(pendingPayoutPaise)} sub="Unpaid" accent="#F59E0B" />
            <StatCard icon="✅" label="Total Paid Out" value={fmt(creator.totalPaidPaise)} accent="#10B981" />
          </div>

          <div style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 24 }}>
            <p style={{ color: "#94A3B8", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              💡 <strong style={{ color: "#A78BFA" }}>How payouts work:</strong> Once you accumulate earnings, our admin team will process your payout manually via UPI or bank transfer. You'll see the payout status reflected here in real-time.
            </p>
          </div>

          {payouts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 32px", background: "rgba(15,15,25,0.7)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💸</div>
              <h3 style={{ color: "#E2E8F0", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>No Payouts Yet</h3>
              <p style={{ color: "#64748B", fontSize: 13 }}>Your payout history will appear here once the admin processes your first payment.</p>
            </div>
          ) : (
            <div style={{ background: "rgba(15,15,25,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["Amount", "Method", "Reference", "Date", "Status"].map(h => (
                        <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout, i) => (
                      <tr key={payout.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                        <td style={{ padding: "14px 20px", fontSize: 16, fontWeight: 800, color: "#34D399" }}>{fmt(payout.amountPaise)}</td>
                        <td style={{ padding: "14px 20px", fontSize: 13, color: "#94A3B8" }}>{payout.method || "—"}</td>
                        <td style={{ padding: "14px 20px", fontSize: 12, color: "#64748B", fontFamily: "monospace" }}>{payout.reference || "—"}</td>
                        <td style={{ padding: "14px 20px", fontSize: 12, color: "#64748B" }}>{new Date(payout.createdAt).toLocaleDateString("en-IN")}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                            textTransform: "uppercase", letterSpacing: 0.4,
                            background: payout.status === "paid" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                            color: payout.status === "paid" ? "#34D399" : "#FBBF24",
                          }}>{payout.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
