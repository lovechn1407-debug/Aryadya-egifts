"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { AffiliateMilestone, AffiliateReward } from "@/lib/db";

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

export default function AdminAffiliatePage() {
  const [tab, setTab] = useState<"milestones" | "rewards" | "creators">("milestones");
  const [milestones, setMilestones] = useState<AffiliateMilestone[]>([]);
  const [rewards, setRewards] = useState<AffiliateReward[]>([]);
  const [creators, setCreators] = useState<CreatorSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Milestone form
  const [msForm, setMsForm] = useState({ id: "", referrals: "", bonusPercentage: "", label: "" });
  const [msEdit, setMsEdit] = useState<string | null>(null);
  const [msSaving, setMsSaving] = useState(false);

  // Reward form
  const [rwForm, setRwForm] = useState({ id: "", referrals: "", rewardAmountRs: "", label: "", description: "" });
  const [rwEdit, setRwEdit] = useState<string | null>(null);
  const [rwSaving, setRwSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ms, rw, cr] = await Promise.all([
        fetch("/api/admin/affiliate/milestones").then(r => r.json()),
        fetch("/api/admin/affiliate/rewards").then(r => r.json()),
        fetch("/api/admin/affiliate/creators").then(r => r.json()),
      ]);
      setMilestones(ms.milestones || []);
      setRewards(rw.rewards || []);
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
        body: JSON.stringify({ id: rwEdit || undefined, referrals: Number(rwForm.referrals), rewardAmountPaise: Math.round(Number(rwForm.rewardAmountRs) * 100), label: rwForm.label, description: rwForm.description, order: Number(rwForm.referrals) }),
      });
      setRwForm({ id: "", referrals: "", rewardAmountRs: "", label: "", description: "" });
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
    setRwForm({ id: r.id, referrals: String(r.referrals), rewardAmountRs: String(r.rewardAmountPaise / 100), label: r.label, description: r.description });
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "9px 20px", borderRadius: 8, border: "1.5px solid",
    borderColor: active ? "#7C3AED" : "#E2E8F0",
    background: active ? "#EDE9FE" : "#fff",
    color: active ? "#7C3AED" : "#64748B",
    fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.15s",
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>🤝 Affiliate Program</h1>
        <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Manage milestones, reward missions, and affiliated creators.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        {(["milestones", "rewards", "creators"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>
            {t === "milestones" ? "🏆 Milestones" : t === "rewards" ? "🎯 Reward Missions" : `👥 Affiliated Creators (${creators.length})`}
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
              {/* Add / Edit Form */}
              <div style={section}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 16px" }}>
                  {msEdit ? "✏️ Edit Milestone" : "➕ Add Milestone"}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>REFERRAL THRESHOLD *</label>
                    <input type="number" style={inp} value={msForm.referrals} onChange={e => setMsForm(p => ({ ...p, referrals: e.target.value }))} placeholder="e.g. 10" min={1} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>BONUS % (Informational)</label>
                    <input type="number" style={inp} value={msForm.bonusPercentage} onChange={e => setMsForm(p => ({ ...p, bonusPercentage: e.target.value }))} placeholder="e.g. 5" min={0} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>LABEL *</label>
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
                        <div style={{ fontSize: 11, color: "#64748B" }}>+{m.bonusPercentage}% bonus tier</div>
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
                        {["Referrals", "Bonus %", "Label", "Actions"].map(h => (
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
                  {rwEdit ? "✏️ Edit Reward" : "➕ Add Reward Mission"}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>REFERRAL THRESHOLD *</label>
                    <input type="number" style={inp} value={rwForm.referrals} onChange={e => setRwForm(p => ({ ...p, referrals: e.target.value }))} placeholder="e.g. 25" min={1} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>REWARD AMOUNT (₹) *</label>
                    <input type="number" style={inp} value={rwForm.rewardAmountRs} onChange={e => setRwForm(p => ({ ...p, rewardAmountRs: e.target.value }))} placeholder="e.g. 200" min={0} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>LABEL *</label>
                    <input type="text" style={inp} value={rwForm.label} onChange={e => setRwForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Starter Reward" />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>DESCRIPTION</label>
                    <input type="text" style={inp} value={rwForm.description} onChange={e => setRwForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Complete 25 referrals and earn ₹200 bonus" />
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
                    <button onClick={() => { setRwEdit(null); setRwForm({ id: "", referrals: "", rewardAmountRs: "", label: "", description: "" }); }}
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
                        {["Referrals", "Reward", "Label", "Description", "Actions"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rewards.map(r => (
                        <tr key={r.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                          <td style={{ padding: "12px 14px", fontWeight: 800, color: "#7C3AED" }}>{r.referrals}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 800, color: "#10B981" }}>{fmt(r.rewardAmountPaise)}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 600, color: "#0F172A" }}>{r.label}</td>
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
    </div>
  );
}
