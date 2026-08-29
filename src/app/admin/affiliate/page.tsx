"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { AffiliateMilestone, AffiliateReward, RewardClaim, RewardType } from "@/lib/db";

interface CreatorSummary {
  uid: string; name: string; email: string; photoURL?: string;
  totalReferrals: number; totalEarningsPaise: number; totalPaidPaise: number;
  pendingPaise: number; couponCount: number; paidOrderCount: number;
  currentCommissionPercentage: number; registeredAt: string;
}

function fmt(paise: number) { return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; }

const section: React.CSSProperties = {
  background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: "24px 28px", marginBottom: 24,
};
const inp: React.CSSProperties = {
  padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0",
  fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none",
};

export function RewardTypeIcon({ type, size = 20 }: { type?: RewardType; size?: number }) {
  if (type === "amazon") {
    return <img src="/icons/amazon.png" alt="Amazon" style={{ width: size, height: size, objectFit: "contain", borderRadius: 4, display: "inline-block", verticalAlign: "middle" }} />;
  }
  if (type === "flipkart") {
    return <img src="/icons/flipkart.png" alt="Flipkart" style={{ width: size, height: size, objectFit: "contain", borderRadius: 4, display: "inline-block", verticalAlign: "middle" }} />;
  }
  if (type === "myntra") {
    return <img src="/icons/myntra.png" alt="Myntra" style={{ width: size, height: size, objectFit: "contain", borderRadius: 4, display: "inline-block", verticalAlign: "middle" }} />;
  }
  if (type === "cash") {
    return <span style={{ fontSize: size * 0.9, lineHeight: 1 }}>💵</span>;
  }
  return <span style={{ fontSize: size * 0.9, lineHeight: 1 }}>🎁</span>;
}

export default function AdminAffiliatePage() {
  const [tab, setTab] = useState<"milestones" | "rewards" | "claims" | "creators">("milestones");
  const [milestones, setMilestones] = useState<AffiliateMilestone[]>([]);
  const [rewards, setRewards] = useState<AffiliateReward[]>([]);
  const [rewardClaims, setRewardClaims] = useState<RewardClaim[]>([]);
  const [creators, setCreators] = useState<CreatorSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Milestone form
  const [msForm, setMsForm] = useState({ id: "", referrals: "", bonusPercentage: "", label: "" });
  const [msEdit, setMsEdit] = useState<string | null>(null);
  const [msSaving, setMsSaving] = useState(false);

  // Reward form
  const [rwForm, setRwForm] = useState({ id: "", referrals: "", rewardAmountRs: "", label: "", description: "", rewardType: "amazon" as RewardType });
  const [rwEdit, setRwEdit] = useState<string | null>(null);
  const [rwSaving, setRwSaving] = useState(false);

  // Fulfill Modal State
  const [selectedClaim, setSelectedClaim] = useState<RewardClaim | null>(null);
  const [fulfillForm, setFulfillForm] = useState({ voucherCode: "", voucherPin: "", hasPin: false, utr: "" });
  const [fulfillSaving, setFulfillSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ms, rw, cl, cr] = await Promise.all([
        fetch("/api/admin/affiliate/milestones").then(r => r.json()),
        fetch("/api/admin/affiliate/rewards").then(r => r.json()),
        fetch("/api/admin/affiliate/reward-claims").then(r => r.json()),
        fetch("/api/admin/affiliate/creators").then(r => r.json()),
      ]);
      setMilestones(ms.milestones || []);
      setRewards(rw.rewards || []);
      setRewardClaims(cl.claims || []);
      setCreators(cr.creators || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Milestone save
  const saveMilestone = async () => {
    if (!msForm.referrals || !msForm.label) return;
    setMsSaving(true);
    try {
      await fetch("/api/admin/affiliate/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msEdit || undefined, referrals: Number(msForm.referrals), bonusPercentage: Number(msForm.bonusPercentage || 0), label: msForm.label, order: Number(msForm.referrals) }),
      });
      setMsForm({ id: "", referrals: "", bonusPercentage: "", label: "" });
      setMsEdit(null);
      await fetchAll();
    } finally { setMsSaving(false); }
  };

  const deleteMilestone = async (id: string) => {
    if (!confirm("Delete this milestone?")) return;
    await fetch(`/api/admin/affiliate/milestones/${id}`, { method: "DELETE" });
    await fetchAll();
  };

  const editMilestone = (m: AffiliateMilestone) => {
    setMsEdit(m.id);
    setMsForm({ id: m.id, referrals: String(m.referrals), bonusPercentage: String(m.bonusPercentage), label: m.label });
  };

  // Reward save
  const saveReward = async () => {
    if (!rwForm.referrals || !rwForm.label) return;
    setRwSaving(true);
    try {
      await fetch("/api/admin/affiliate/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rwEdit || undefined,
          referrals: Number(rwForm.referrals),
          rewardAmountPaise: Math.round(Number(rwForm.rewardAmountRs) * 100),
          label: rwForm.label,
          description: rwForm.description,
          order: Number(rwForm.referrals),
          rewardType: rwForm.rewardType,
        }),
      });
      setRwForm({ id: "", referrals: "", rewardAmountRs: "", label: "", description: "", rewardType: "amazon" });
      setRwEdit(null);
      await fetchAll();
    } finally { setRwSaving(false); }
  };

  const deleteReward = async (id: string) => {
    if (!confirm("Delete this reward?")) return;
    await fetch(`/api/admin/affiliate/rewards/${id}`, { method: "DELETE" });
    await fetchAll();
  };

  const editReward = (r: AffiliateReward) => {
    setRwEdit(r.id);
    setRwForm({
      id: r.id,
      referrals: String(r.referrals),
      rewardAmountRs: String(r.rewardAmountPaise / 100),
      label: r.label,
      description: r.description,
      rewardType: r.rewardType || "amazon",
    });
  };

  // Fulfill Reward Claim
  const handleFulfillClaim = async () => {
    if (!selectedClaim) return;
    setFulfillSaving(true);
    try {
      const res = await fetch("/api/admin/affiliate/reward-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId: selectedClaim.id,
          voucherCode: fulfillForm.voucherCode,
          voucherPin: fulfillForm.voucherPin,
          hasPin: fulfillForm.hasPin,
          utr: fulfillForm.utr,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedClaim(null);
        setFulfillForm({ voucherCode: "", voucherPin: "", hasPin: false, utr: "" });
        await fetchAll();
      } else {
        alert(data.message || "Failed to fulfill claim.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setFulfillSaving(false);
    }
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "9px 20px", borderRadius: 8, border: "1.5px solid",
    borderColor: active ? "#7C3AED" : "#E2E8F0",
    background: active ? "#EDE9FE" : "#fff",
    color: active ? "#7C3AED" : "#64748B",
    fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.15s",
  });

  const pendingClaimsCount = rewardClaims.filter(c => c.status === "pending").length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>🤝 Affiliate Program</h1>
        <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Manage milestones, reward missions, claim requests, and affiliated creators.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        {(["milestones", "rewards", "claims", "creators"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>
            {t === "milestones" && "🏆 Static Milestones"}
            {t === "rewards" && "🎯 Reward Missions"}
            {t === "claims" && `🎁 Claim Requests ${pendingClaimsCount > 0 ? `(${pendingClaimsCount} Pending)` : ""}`}
            {t === "creators" && `👥 Affiliated Creators (${creators.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#64748B" }}>Loading...</div>
      ) : (
        <>
          {/* ─── MILESTONES TAB ─────────────────────────────────────────────── */}
          {tab === "milestones" && (
            <>
              {/* Static Note Banner */}
              <div style={{ background: "#EEF2F6", border: "1px solid #CBD5E1", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: "#334155", margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
                  ℹ️ <strong>Static Milestone Badges:</strong> The milestone levels below (Bonus %) are static display badges shown to creators to showcase their achievement tiers (e.g. Bronze, Silver, Gold). They are purely for show-off and do not automatically alter base commission percentages.
                </p>
              </div>

              {/* Add / Edit Form */}
              <div style={section}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 16px" }}>
                  {msEdit ? "✏️ Edit Milestone Level" : "➕ Add Milestone Level"}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>REFERRAL THRESHOLD *</label>
                    <input type="number" style={inp} value={msForm.referrals} onChange={e => setMsForm(p => ({ ...p, referrals: e.target.value }))} placeholder="e.g. 10" min={1} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>BONUS % (Static Display Badge)</label>
                    <input type="number" style={inp} value={msForm.bonusPercentage} onChange={e => setMsForm(p => ({ ...p, bonusPercentage: e.target.value }))} placeholder="e.g. 5" min={0} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>LEVEL TITLE / LABEL *</label>
                    <input type="text" style={inp} value={msForm.label} onChange={e => setMsForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Bronze Creator" />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button
                    onClick={saveMilestone}
                    disabled={msSaving || !msForm.referrals || !msForm.label}
                    style={{ padding: "9px 20px", borderRadius: 8, background: "#7C3AED", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                  >
                    {msSaving ? "Saving..." : msEdit ? "Update Milestone" : "Add Milestone"}
                  </button>
                  {msEdit && (
                    <button onClick={() => { setMsEdit(null); setMsForm({ id: "", referrals: "", bonusPercentage: "", label: "" }); }}
                      style={{ padding: "9px 16px", borderRadius: 8, background: "#F1F5F9", color: "#64748B", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Milestone Progress Preview */}
              {milestones.length > 0 && (
                <div style={section}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 20px" }}>📊 Creator View Preview</h2>
                  <div style={{ position: "relative", height: 10, background: "#F1F5F9", borderRadius: 99, marginBottom: 28 }}>
                    <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "30%", borderRadius: 99, background: "linear-gradient(90deg, #7C3AED, #EC4899)" }} />
                    {milestones.map((m, i) => {
                      const maxRef = Math.max(...milestones.map(x => x.referrals));
                      const pos = (m.referrals / maxRef) * 100;
                      return (
                        <div key={m.id} style={{ position: "absolute", left: `${pos}%`, top: "50%", transform: "translate(-50%,-50%)" }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#EDE9FE", border: "2px solid #7C3AED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#7C3AED", fontWeight: 700 }}>{i + 1}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {milestones.map(m => (
                      <div key={m.id} style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px 14px", border: "1px solid #E2E8F0", flex: "1 1 140px" }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#7C3AED" }}>{m.referrals} Referrals</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>+{m.bonusPercentage}% bonus tier (static)</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones Table */}
              <div style={section}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 16px" }}>All Milestones ({milestones.length})</h2>
                {milestones.length === 0 ? (
                  <p style={{ color: "#94A3B8", fontSize: 13 }}>No milestones set. Add your first milestone above.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #F1F5F9" }}>
                        {["Referrals", "Bonus % (Display)", "Level Title", "Actions"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {milestones.map(m => (
                        <tr key={m.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                          <td style={{ padding: "12px 14px", fontWeight: 800, color: "#7C3AED" }}>{m.referrals}</td>
                          <td style={{ padding: "12px 14px", color: "#0F172A" }}>{m.bonusPercentage}%</td>
                          <td style={{ padding: "12px 14px", fontWeight: 600, color: "#0F172A" }}>{m.label}</td>
                          <td style={{ padding: "12px 14px", display: "flex", gap: 8 }}>
                            <button onClick={() => editMilestone(m)} style={{ padding: "5px 12px", borderRadius: 6, background: "#EDE9FE", color: "#7C3AED", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Edit</button>
                            <button onClick={() => deleteMilestone(m.id)} style={{ padding: "5px 12px", borderRadius: 6, background: "#FEF2F2", color: "#EF4444", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ─── REWARDS TAB ─────────────────────────────────────────────────── */}
          {tab === "rewards" && (
            <>
              <div style={section}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 16px" }}>
                  {rwEdit ? "✏️ Edit Reward Mission" : "➕ Add Reward Mission"}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>REWARD TYPE / BRAND *</label>
                    <select
                      style={inp}
                      value={rwForm.rewardType}
                      onChange={e => setRwForm(p => ({ ...p, rewardType: e.target.value as RewardType }))}
                    >
                      <option value="amazon">Amazon Voucher 🛒</option>
                      <option value="flipkart">Flipkart Voucher 🛍️</option>
                      <option value="myntra">Myntra Voucher 👗</option>
                      <option value="cash">Cash / UPI Transfer 💵</option>
                      <option value="other">Custom Voucher / Other 🎁</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>REFERRAL THRESHOLD *</label>
                    <input type="number" style={inp} value={rwForm.referrals} onChange={e => setRwForm(p => ({ ...p, referrals: e.target.value }))} placeholder="e.g. 25" min={1} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>REWARD VALUE (₹) *</label>
                    <input type="number" style={inp} value={rwForm.rewardAmountRs} onChange={e => setRwForm(p => ({ ...p, rewardAmountRs: e.target.value }))} placeholder="e.g. 500" min={0} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>REWARD TITLE / LABEL *</label>
                    <input type="text" style={inp} value={rwForm.label} onChange={e => setRwForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Amazon ₹500 Gift Voucher" />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>DESCRIPTION</label>
                    <input type="text" style={inp} value={rwForm.description} onChange={e => setRwForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Complete 25 sales to claim a ₹500 Amazon Gift Voucher" />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button
                    onClick={saveReward}
                    disabled={rwSaving || !rwForm.referrals || !rwForm.label}
                    style={{ padding: "9px 20px", borderRadius: 8, background: "#7C3AED", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                  >
                    {rwSaving ? "Saving..." : rwEdit ? "Update Reward" : "Add Reward Mission"}
                  </button>
                  {rwEdit && (
                    <button onClick={() => { setRwEdit(null); setRwForm({ id: "", referrals: "", rewardAmountRs: "", label: "", description: "", rewardType: "amazon" }); }}
                      style={{ padding: "9px 16px", borderRadius: 8, background: "#F1F5F9", color: "#64748B", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div style={section}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 16px" }}>All Rewards ({rewards.length})</h2>
                {rewards.length === 0 ? (
                  <p style={{ color: "#94A3B8", fontSize: 13 }}>No reward missions set yet.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #F1F5F9" }}>
                        {["Type", "Referrals", "Value", "Title", "Description", "Actions"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rewards.map(r => (
                        <tr key={r.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <RewardTypeIcon type={r.rewardType} size={22} />
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "capitalize" }}>{r.rewardType || "other"}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", fontWeight: 800, color: "#7C3AED" }}>{r.referrals} sales</td>
                          <td style={{ padding: "12px 14px", fontWeight: 800, color: "#10B981" }}>{fmt(r.rewardAmountPaise)}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0F172A" }}>{r.label}</td>
                          <td style={{ padding: "12px 14px", color: "#64748B", fontSize: 12 }}>{r.description}</td>
                          <td style={{ padding: "12px 14px", display: "flex", gap: 8 }}>
                            <button onClick={() => editReward(r)} style={{ padding: "5px 12px", borderRadius: 6, background: "#EDE9FE", color: "#7C3AED", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Edit</button>
                            <button onClick={() => deleteReward(r.id)} style={{ padding: "5px 12px", borderRadius: 6, background: "#FEF2F2", color: "#EF4444", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ─── CLAIM REQUESTS TAB ─────────────────────────────────────────── */}
          {tab === "claims" && (
            <div style={section}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 20px" }}>
                🎁 Creator Reward Claim Requests ({rewardClaims.length})
              </h2>
              {rewardClaims.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#94A3B8", fontSize: 14 }}>
                  No reward claims submitted by creators yet.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #F1F5F9" }}>
                        {["Creator", "Reward Item", "Value", "Claimed Date", "Status", "Details / Action"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rewardClaims.map(c => (
                        <tr key={c.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontWeight: 700, color: "#0F172A" }}>{c.creatorName}</div>
                            <div style={{ fontSize: 11, color: "#94A3B8" }}>{c.creatorEmail}</div>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <RewardTypeIcon type={c.rewardType} size={22} />
                              <div>
                                <div style={{ fontWeight: 700, color: "#0F172A" }}>{c.rewardLabel}</div>
                                <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase" }}>{c.rewardType}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", fontWeight: 800, color: "#10B981" }}>{fmt(c.rewardAmountPaise)}</td>
                          <td style={{ padding: "12px 14px", color: "#64748B", fontSize: 12 }}>
                            {new Date(c.claimedAt).toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{
                              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                              background: c.status === "fulfilled" ? "#DCFCE7" : "#FEF3C7",
                              color: c.status === "fulfilled" ? "#15803D" : "#B45309"
                            }}>
                              {c.status === "fulfilled" ? "Fulfilled ✓" : "Processing (24h) ⏳"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            {c.status === "pending" ? (
                              <button
                                onClick={() => {
                                  setSelectedClaim(c);
                                  setFulfillForm({ voucherCode: "", voucherPin: "", hasPin: false, utr: "" });
                                }}
                                style={{ padding: "6px 14px", borderRadius: 8, background: "#7C3AED", color: "#fff", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                              >
                                Fulfill Reward →
                              </button>
                            ) : (
                              <div style={{ fontSize: 11, color: "#475569" }}>
                                {c.rewardType === "cash" ? (
                                  <span>UTR: <strong>{c.utr || "N/A"}</strong></span>
                                ) : (
                                  <div>
                                    <span>Code: <strong style={{ fontFamily: "monospace" }}>{c.voucherCode}</strong></span>
                                    {c.hasPin && c.voucherPin && <div>PIN: <strong style={{ fontFamily: "monospace" }}>{c.voucherPin}</strong></div>}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─── CREATORS TAB ────────────────────────────────────────────────── */}
          {tab === "creators" && (
            <div style={section}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 20px" }}>Affiliated Creators ({creators.length})</h2>
              {creators.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <p style={{ color: "#94A3B8", fontSize: 14 }}>No creators have joined yet. Share your creator portal link: <strong>/creator</strong></p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #F1F5F9" }}>
                        {["Creator", "Commission %", "Total Sales", "Total Earned", "Pending", "Coupons", ""].map(h => (
                          <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {creators.map(c => (
                        <tr key={c.uid} style={{ borderBottom: "1px solid #F8FAFC" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {c.photoURL ? (
                                <img src={c.photoURL} alt={c.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #EDE9FE" }} />
                              ) : (
                                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
                              )}
                              <div>
                                <div style={{ fontWeight: 700, color: "#0F172A" }}>{c.name}</div>
                                <div style={{ fontSize: 11, color: "#94A3B8" }}>{c.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: 800, color: "#7C3AED" }}>{c.currentCommissionPercentage}%</td>
                          <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0F172A" }}>{c.totalReferrals} sales</td>
                          <td style={{ padding: "14px 16px", fontWeight: 800, color: "#10B981" }}>{fmt(c.totalEarningsPaise)}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ fontWeight: 800, color: c.pendingPaise > 0 ? "#F59E0B" : "#94A3B8" }}>{fmt(c.pendingPaise)}</span>
                          </td>
                          <td style={{ padding: "14px 16px", color: "#64748B" }}>{c.couponCount} coupon{c.couponCount !== 1 ? "s" : ""}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <Link
                              href={`/admin/affiliate/creator/${c.uid}`}
                              style={{ padding: "7px 16px", borderRadius: 8, background: "#EDE9FE", color: "#7C3AED", fontWeight: 700, fontSize: 12, textDecoration: "none", whiteSpace: "nowrap" }}
                            >
                              Manage →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ─── FULFILL REWARD CLAIM MODAL ────────────────────────────────────── */}
      {selectedClaim && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 28, maxWidth: 480, width: "100%", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <RewardTypeIcon type={selectedClaim.rewardType} size={28} />
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0F172A" }}>Fulfill {selectedClaim.rewardLabel}</h3>
                <div style={{ fontSize: 12, color: "#64748B" }}>for <strong>{selectedClaim.creatorName}</strong> ({selectedClaim.creatorEmail})</div>
              </div>
            </div>

            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: 12, margin: "16px 0", fontSize: 12, color: "#334155" }}>
              Reward Value: <strong>{fmt(selectedClaim.rewardAmountPaise)}</strong> · Claimed: {new Date(selectedClaim.claimedAt).toLocaleDateString("en-IN")}
            </div>

            {selectedClaim.rewardType === "cash" ? (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
                  UTR / TRANSACTION REFERENCE NUMBER *
                </label>
                <input
                  type="text"
                  style={inp}
                  value={fulfillForm.utr}
                  onChange={e => setFulfillForm(p => ({ ...p, utr: e.target.value }))}
                  placeholder="e.g. 324158904321"
                />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
                    VOUCHER CODE *
                  </label>
                  <input
                    type="text"
                    style={inp}
                    value={fulfillForm.voucherCode}
                    onChange={e => setFulfillForm(p => ({ ...p, voucherCode: e.target.value }))}
                    placeholder="e.g. AMZ-9842-1049-5830"
                  />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#334155", cursor: "pointer", userSelect: "none" }}>
                  <input
                    type="checkbox"
                    checked={fulfillForm.hasPin}
                    onChange={e => setFulfillForm(p => ({ ...p, hasPin: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: "#7C3AED", cursor: "pointer" }}
                  />
                  Voucher requires a PIN
                </label>

                {fulfillForm.hasPin && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
                      VOUCHER PIN *
                    </label>
                    <input
                      type="text"
                      style={inp}
                      value={fulfillForm.voucherPin}
                      onChange={e => setFulfillForm(p => ({ ...p, voucherPin: e.target.value }))}
                      placeholder="e.g. 483921"
                    />
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setSelectedClaim(null)}
                style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#fff", color: "#64748B", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleFulfillClaim}
                disabled={fulfillSaving || (selectedClaim.rewardType === "cash" ? !fulfillForm.utr : !fulfillForm.voucherCode)}
                style={{
                  padding: "9px 20px", borderRadius: 10, border: "none",
                  background: "#7C3AED", color: "#fff", fontSize: 13, fontWeight: 700,
                  cursor: (fulfillSaving || (selectedClaim.rewardType === "cash" ? !fulfillForm.utr : !fulfillForm.voucherCode)) ? "not-allowed" : "pointer"
                }}
              >
                {fulfillSaving ? "Confirming..." : "Confirm & Send to Creator ✓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
