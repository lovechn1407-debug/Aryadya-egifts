"use client";
import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import type { Creator, Payout } from "@/lib/db";
import type { Order, Coupon } from "@/lib/data";

function fmt(paise: number) { return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; }

const inp: React.CSSProperties = {
  padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0",
  fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none",
};
const section: React.CSSProperties = {
  background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: "24px 28px", marginBottom: 20,
};

interface PageData {
  creator: Creator;
  coupons: Coupon[];
  orders: Order[];
  payouts: Payout[];
  pendingPayoutPaise: number;
  monthlyEarnings: Record<string, number>;
}

export default function AdminCreatorDetailPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  // Coupon modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "", validFrom: "", validTo: "", perPersonLimit: "1", totalStocks: "100",
    minimumOrderRs: "0", discountType: "percentage", discountValue: "", commissionPercentage: "",
    description: "",
  });
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponMsg, setCouponMsg] = useState("");

  // Payout modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ amountRs: "", method: "UPI", reference: "", note: "" });
  const [payoutSaving, setPayoutSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/affiliate/creators/${uid}`);
      const json = await res.json();
      if (json.success) setData(json);
    } finally { setLoading(false); }
  }, [uid]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveCoupon = async () => {
    if (!couponForm.code || !couponForm.discountValue || !couponForm.commissionPercentage) {
      setCouponMsg("Please fill in Code, Discount Value, and Commission %.");
      return;
    }
    setCouponSaving(true);
    setCouponMsg("");
    try {
      const discountAmt = couponForm.discountType === "percentage"
        ? Number(couponForm.discountValue)
        : Number(couponForm.discountValue); // stored as raw value for value type

      const body = {
        id: couponForm.code.toUpperCase(),
        active: true,
        discountType: couponForm.discountType,
        discountAmount: discountAmt,
        totalStocks: Number(couponForm.totalStocks),
        usedCount: 0,
        validFrom: couponForm.validFrom || new Date().toISOString(),
        validTo: couponForm.validTo || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        perPersonLimit: Number(couponForm.perPersonLimit),
        minimumOrderValue: Math.round(Number(couponForm.minimumOrderRs) * 100),
        description: couponForm.description || `Affiliate coupon for ${data?.creator.name}`,
        createdAt: new Date().toISOString(),
        // Affiliate fields
        creatorId: uid,
        commissionPercentage: Number(couponForm.commissionPercentage),
      };

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success || res.ok) {
        setCouponMsg("✅ Coupon created successfully!");
        setCouponForm({ code: "", validFrom: "", validTo: "", perPersonLimit: "1", totalStocks: "100", minimumOrderRs: "0", discountType: "percentage", discountValue: "", commissionPercentage: "", description: "" });
        await fetchData();
        setTimeout(() => { setShowCouponModal(false); setCouponMsg(""); }, 1500);
      } else {
        setCouponMsg(json.message || "Failed to create coupon.");
      }
    } catch {
      setCouponMsg("Network error. Please try again.");
    } finally { setCouponSaving(false); }
  };

  const recordPayout = async () => {
    if (!payoutForm.amountRs || Number(payoutForm.amountRs) <= 0) return;
    setPayoutSaving(true);
    try {
      await fetch("/api/admin/affiliate/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: uid,
          amountPaise: Math.round(Number(payoutForm.amountRs) * 100),
          method: payoutForm.method,
          reference: payoutForm.reference,
          note: payoutForm.note,
        }),
      });
      setPayoutForm({ amountRs: "", method: "UPI", reference: "", note: "" });
      setShowPayoutModal(false);
      await fetchData();
    } finally { setPayoutSaving(false); }
  };

  const markPayoutPaid = async (payoutId: string) => {
    const ref = prompt("Enter payment reference (UPI ID or transaction ID):");
    await fetch(`/api/admin/affiliate/payouts/${payoutId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: ref }),
    });
    await fetchData();
  };

  const payViaCashfree = async (payoutId: string) => {
    if (!confirm("Are you sure you want to process this payout instantly via Cashfree? This will send real money to the creator's UPI ID.")) {
      return;
    }
    try {
      const res = await fetch("/api/admin/affiliate/payouts/cashfree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId, creatorId: uid }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        alert(`✅ Payout Successful!\nReference ID: ${resJson.referenceId}`);
        await fetchData();
      } else {
        alert(`❌ Payout Failed: ${resJson.message}`);
      }
    } catch (e: any) {
      alert(`❌ Error processing Cashfree payout: ${e?.message || e}`);
    }
  };

  if (loading || !data) {
    return <div style={{ padding: "40px 0", textAlign: "center", color: "#64748B" }}>Loading creator profile...</div>;
  }

  const { creator, coupons, orders, payouts, pendingPayoutPaise, monthlyEarnings } = data;
  const paidOrders = orders.filter((o: Order) => o.status === "paid" || o.status === "editing" || o.status === "finalized");

  return (
    <div>
      {/* Back button */}
      <Link href="/admin/affiliate" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#7C3AED", fontWeight: 700, fontSize: 13, textDecoration: "none", marginBottom: 20 }}>
        ← Back to Affiliate Program
      </Link>

      {/* Creator Profile Header */}
      <div style={{ ...section, display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
        {creator.photoURL ? (
          <img src={creator.photoURL} alt={creator.name} style={{ width: 72, height: 72, borderRadius: "50%", border: "3px solid #EDE9FE", objectFit: "cover" }} />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👤</div>
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>{creator.name}</h1>
          <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 10px" }}>{creator.email} · Joined {new Date(creator.registeredAt).toLocaleDateString("en-IN")}</p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
            {creator.phone && <span style={{ color: "#64748B" }}>📱 {creator.phone}</span>}
            {creator.upiId && <span style={{ color: "#0F172A", background: "#F1F5F9", padding: "3px 8px", borderRadius: 6 }}>💳 UPI: <strong>{creator.upiId}</strong> ({creator.upiName})</span>}
            {creator.instagramHandle && <span style={{ color: "#64748B" }}>📸 {creator.instagramHandle}</span>}
            {creator.youtubeHandle && <span style={{ color: "#64748B" }}>▶️ {creator.youtubeHandle}</span>}
            {creator.otherHandle && <span style={{ color: "#64748B" }}>🔗 {creator.otherHandle}</span>}
          </div>
          <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 6, fontFamily: "monospace" }}>UID: {creator.uid}</div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setShowCouponModal(true)}
            style={{ padding: "10px 20px", borderRadius: 10, background: "linear-gradient(135deg, #7C3AED, #EC4899)", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            🎟️ Generate Coupon
          </button>
          <button
            onClick={() => setShowPayoutModal(true)}
            style={{ padding: "10px 20px", borderRadius: 10, background: "#F0FDF4", color: "#10B981", border: "1.5px solid #A7F3D0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            💸 Record Payout
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Referrals", value: String(creator.totalReferrals), color: "#7C3AED" },
          { label: "Total Earned", value: fmt(creator.totalEarningsPaise), color: "#10B981" },
          { label: "Pending Payout", value: fmt(pendingPayoutPaise), color: "#F59E0B" },
          { label: "Total Paid Out", value: fmt(creator.totalPaidPaise), color: "#64748B" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: "16px 18px" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Creator's Coupons */}
      <div style={section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>🎟️ Creator&apos;s Coupons ({coupons.length})</h2>
          <button onClick={() => setShowCouponModal(true)} style={{ padding: "7px 14px", borderRadius: 8, background: "#EDE9FE", color: "#7C3AED", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+ New Coupon</button>
        </div>
        {coupons.length === 0 ? (
          <p style={{ color: "#94A3B8", fontSize: 13 }}>No coupons yet. Click &quot;Generate Coupon&quot; to create one.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #F1F5F9" }}>
                  {["Code", "Discount", "Commission %", "Used / Stock", "Min Order", "Valid Until", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.4, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 900, color: "#7C3AED", fontFamily: "monospace", fontSize: 14 }}>{c.id}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0F172A" }}>
                      {c.discountType === "percentage" ? `${c.discountAmount}%` : fmt(c.discountAmount * 100)}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: "#EC4899" }}>{c.commissionPercentage || 0}%</td>
                    <td style={{ padding: "12px 14px" }}>{c.usedCount} / {c.totalStocks}</td>
                    <td style={{ padding: "12px 14px" }}>{fmt(c.minimumOrderValue)}</td>
                    <td style={{ padding: "12px 14px", color: "#64748B" }}>{c.validTo ? new Date(c.validTo).toLocaleDateString("en-IN") : "—"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                        background: c.active ? "#ECFDF5" : "#FEF2F2", color: c.active ? "#059669" : "#DC2626"
                      }}>{c.active ? "Active" : "Inactive"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Referred Orders */}
      <div style={section}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 16px" }}>📦 Referred Orders ({paidOrders.length})</h2>
        {paidOrders.length === 0 ? (
          <p style={{ color: "#94A3B8", fontSize: 13 }}>No completed orders via this creator&apos;s coupons yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #F1F5F9" }}>
                  {["Order ID", "Product", "Buyer", "Sale Amt", "Commission", "Coupon", "Date"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.4, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paidOrders.map((order: Order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                    <td style={{ padding: "12px 14px", fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>{order.id.slice(-8)}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#0F172A" }}>{(order.productName || "").replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim()}</td>
                    <td style={{ padding: "12px 14px", color: "#64748B" }}>{order.buyerName}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0F172A" }}>{fmt(order.amount)}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: "#10B981" }}>{fmt(order.commissionAmount || 0)}</td>
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: "#7C3AED" }}>{order.couponCode || "—"}</td>
                    <td style={{ padding: "12px 14px", color: "#64748B" }}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monthly Earnings */}
      {Object.keys(monthlyEarnings).length > 0 && (
        <div style={section}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 16px" }}>📈 Monthly Earnings</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #F1F5F9" }}>
                <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Month</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Commission Earned</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(monthlyEarnings).sort(([a], [b]) => b.localeCompare(a)).map(([month, amt]) => (
                <tr key={month} style={{ borderBottom: "1px solid #F8FAFC" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "#0F172A" }}>
                    {new Date(month + "-01").toLocaleString("en-IN", { month: "long", year: "numeric" })}
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 800, color: "#10B981" }}>{fmt(amt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payout History */}
      <div style={section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>
            💸 Payout History ({payouts.length}) · Pending: <span style={{ color: "#F59E0B" }}>{fmt(pendingPayoutPaise)}</span>
          </h2>
          <button onClick={() => setShowPayoutModal(true)} style={{ padding: "7px 14px", borderRadius: 8, background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+ Record Payout</button>
        </div>
        {payouts.length === 0 ? (
          <p style={{ color: "#94A3B8", fontSize: 13 }}>No payouts recorded yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #F1F5F9" }}>
                  {["Amount", "Method", "Reference", "Note", "Date", "Status", ""].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: "#10B981" }}>{fmt(p.amountPaise)}</td>
                    <td style={{ padding: "12px 14px", color: "#64748B" }}>{p.method || "—"}</td>
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 11, color: "#64748B" }}>{p.reference || "—"}</td>
                    <td style={{ padding: "12px 14px", color: "#64748B" }}>{p.note || "—"}</td>
                    <td style={{ padding: "12px 14px", color: "#64748B" }}>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                        background: p.status === "paid" ? "#ECFDF5" : "#FFFBEB", color: p.status === "paid" ? "#059669" : "#D97706"
                      }}>{p.status}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {p.status === "pending" && (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <button onClick={() => markPayoutPaid(p.id)} style={{ padding: "5px 12px", borderRadius: 6, background: "#F1F5F9", color: "#475569", border: "1px solid #CBD5E1", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                            Mark Paid
                          </button>
                          <button
                            onClick={() => payViaCashfree(p.id)}
                            disabled={!creator.upiId}
                            style={{
                              padding: "5px 12px", borderRadius: 6,
                              background: creator.upiId ? "#ECFDF5" : "#F8FAFC",
                              color: creator.upiId ? "#059669" : "#94A3B8",
                              border: creator.upiId ? "1px solid #A7F3D0" : "1px solid #E2E8F0",
                              fontWeight: 700, fontSize: 11,
                              cursor: creator.upiId ? "pointer" : "not-allowed",
                              display: "inline-flex", alignItems: "center", gap: 4
                            }}
                            title={!creator.upiId ? "Creator has not set a UPI ID" : "Instant Pay via Cashfree Payouts API"}
                          >
                            ⚡ Instant Pay (Cashfree)
                          </button>
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

      {/* ─── COUPON GENERATION MODAL ─────────────────────────────────────── */}
      {showCouponModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowCouponModal(false)}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 64px rgba(0,0,0,0.3)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>🎟️ Generate Affiliate Coupon</h2>
            <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 24px" }}>for <strong>{creator.name}</strong></p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>COUPON CODE * (uppercase)</label>
                <input type="text" style={inp} value={couponForm.code} onChange={e => setCouponForm(p => ({ ...p, code: e.target.value.toUpperCase().replace(/\s/g, "") }))} placeholder="e.g. SARAH10" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>VALID FROM</label>
                <input type="datetime-local" style={inp} value={couponForm.validFrom} onChange={e => setCouponForm(p => ({ ...p, validFrom: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>VALID UNTIL</label>
                <input type="datetime-local" style={inp} value={couponForm.validTo} onChange={e => setCouponForm(p => ({ ...p, validTo: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>USES PER ACCOUNT</label>
                <input type="number" style={inp} value={couponForm.perPersonLimit} min={1} onChange={e => setCouponForm(p => ({ ...p, perPersonLimit: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>TOTAL STOCK</label>
                <input type="number" style={inp} value={couponForm.totalStocks} min={1} onChange={e => setCouponForm(p => ({ ...p, totalStocks: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>MIN PURCHASE (₹)</label>
                <input type="number" style={inp} value={couponForm.minimumOrderRs} min={0} onChange={e => setCouponForm(p => ({ ...p, minimumOrderRs: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>DISCOUNT TYPE</label>
                <select style={{ ...inp }} value={couponForm.discountType} onChange={e => setCouponForm(p => ({ ...p, discountType: e.target.value }))}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="value">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>
                  DISCOUNT VALUE * ({couponForm.discountType === "percentage" ? "%" : "₹"})
                </label>
                <input type="number" style={inp} value={couponForm.discountValue} min={0} onChange={e => setCouponForm(p => ({ ...p, discountValue: e.target.value }))} placeholder={couponForm.discountType === "percentage" ? "e.g. 10" : "e.g. 50"} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#EC4899", display: "block", marginBottom: 6 }}>CREATOR COMMISSION % *</label>
                <input type="number" style={{ ...inp, borderColor: "#EC4899" }} value={couponForm.commissionPercentage} min={0} max={100} onChange={e => setCouponForm(p => ({ ...p, commissionPercentage: e.target.value }))} placeholder="e.g. 10 (means 10% of sale goes to creator)" />
                <p style={{ fontSize: 11, color: "#94A3B8", margin: "6px 0 0" }}>
                  For every sale using this coupon, {couponForm.commissionPercentage || "X"}% of the final order amount will be credited to {creator.name}.
                </p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>DESCRIPTION (optional)</label>
                <input type="text" style={inp} value={couponForm.description} onChange={e => setCouponForm(p => ({ ...p, description: e.target.value }))} placeholder="Internal description for this coupon" />
              </div>
            </div>

            {couponMsg && (
              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: couponMsg.startsWith("✅") ? "#ECFDF5" : "#FEF2F2", fontSize: 13, fontWeight: 600, color: couponMsg.startsWith("✅") ? "#059669" : "#DC2626" }}>
                {couponMsg}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={() => { setShowCouponModal(false); setCouponMsg(""); }} style={{ flex: 1, padding: "11px", borderRadius: 10, background: "#F1F5F9", color: "#64748B", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={saveCoupon} disabled={couponSaving} style={{ flex: 2, padding: "11px", borderRadius: 10, background: "linear-gradient(135deg, #7C3AED, #EC4899)", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: couponSaving ? "not-allowed" : "pointer" }}>
                {couponSaving ? "Creating..." : "Create Coupon 🎟️"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PAYOUT MODAL ─────────────────────────────────────────────────── */}
      {showPayoutModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowPayoutModal(false)}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", maxWidth: 440, width: "100%", boxShadow: "0 32px 64px rgba(0,0,0,0.3)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>💸 Record Payout</h2>
            <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 20px" }}>Pending balance: <strong style={{ color: "#F59E0B" }}>{fmt(pendingPayoutPaise)}</strong></p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>AMOUNT (₹) *</label>
                <input type="number" style={inp} value={payoutForm.amountRs} onChange={e => setPayoutForm(p => ({ ...p, amountRs: e.target.value }))} placeholder={String(pendingPayoutPaise / 100)} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>PAYMENT METHOD</label>
                <select style={{ ...inp }} value={payoutForm.method} onChange={e => setPayoutForm(p => ({ ...p, method: e.target.value }))}>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>REFERENCE (UTR / UPI ID)</label>
                <input type="text" style={inp} value={payoutForm.reference} onChange={e => setPayoutForm(p => ({ ...p, reference: e.target.value }))} placeholder="Optional transaction reference" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 }}>NOTE</label>
                <input type="text" style={inp} value={payoutForm.note} onChange={e => setPayoutForm(p => ({ ...p, note: e.target.value }))} placeholder="Optional note" />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={() => setShowPayoutModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, background: "#F1F5F9", color: "#64748B", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={recordPayout} disabled={payoutSaving} style={{ flex: 2, padding: "11px", borderRadius: 10, background: "#10B981", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: payoutSaving ? "not-allowed" : "pointer" }}>
                {payoutSaving ? "Saving..." : "Record Payout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
