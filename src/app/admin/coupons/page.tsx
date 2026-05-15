"use client";
import { useState, useEffect } from "react";
import { Coupon } from "@/lib/data";
import { getCouponsDB, saveCouponDB, deleteCouponDB } from "@/lib/db";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [id, setId] = useState("");
  const [active, setActive] = useState(true);
  const [discountType, setDiscountType] = useState<"percentage" | "value">("percentage");
  const [discountAmount, setDiscountAmount] = useState("");
  const [totalStocks, setTotalStocks] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [perPersonLimit, setPerPersonLimit] = useState("1");
  const [minimumOrderValue, setMinimumOrderValue] = useState("0");
  const [description, setDescription] = useState("");

  const reload = async () => {
    const data = await getCouponsDB();
    setCoupons(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  };

  useEffect(() => { reload(); }, []);

  const handleCreateOrUpdate = async () => {
    if (!id.trim() || !discountAmount) {
      alert("Please provide at least a Coupon Code and Discount Amount.");
      return;
    }
    setSaving(true);
    try {
      const coupon: Coupon = {
        id: id.toUpperCase().trim(),
        active,
        discountType,
        discountAmount: Number(discountAmount),
        totalStocks: Number(totalStocks) || 999999,
        usedCount: 0,
        validFrom,
        validTo,
        perPersonLimit: Number(perPersonLimit) || 1,
        minimumOrderValue: Number(minimumOrderValue) * 100, // convert ₹ to paise
        description,
        createdAt: new Date().toISOString(),
      };
      
      // Keep existing usedCount if editing
      const existing = coupons.find(c => c.id === coupon.id);
      if (existing) {
        coupon.usedCount = existing.usedCount;
        coupon.createdAt = existing.createdAt;
      }

      await saveCouponDB(coupon);
      setShowCreate(false);
      resetForm();
      reload();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setId(""); setActive(true); setDiscountType("percentage"); setDiscountAmount("");
    setTotalStocks(""); setValidFrom(""); setValidTo(""); setPerPersonLimit("1");
    setMinimumOrderValue("0"); setDescription("");
  };

  const editCoupon = (c: Coupon) => {
    setId(c.id);
    setActive(c.active);
    setDiscountType(c.discountType);
    setDiscountAmount(String(c.discountAmount));
    setTotalStocks(String(c.totalStocks));
    setValidFrom(c.validFrom);
    setValidTo(c.validTo);
    setPerPersonLimit(String(c.perPersonLimit));
    setMinimumOrderValue(String(Math.floor(c.minimumOrderValue / 100)));
    setDescription(c.description);
    setShowCreate(true);
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm(`Delete coupon ${couponId}?`)) return;
    await deleteCouponDB(couponId);
    reload();
  };

  const toggleActive = async (c: Coupon) => {
    await saveCouponDB({ ...c, active: !c.active });
    reload();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #CBD5E1", background: "#FFFFFF",
    color: "#0F172A", fontSize: 14, outline: "none", transition: "all 0.2s"
  };

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF", borderRadius: 12, border: "1px solid #E2E8F0",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)", padding: "20px 24px"
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: -0.5 }}>
            Coupons Manager
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
            Create and manage promotional discount codes
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowCreate(!showCreate); }} 
          style={{ background: "#0F172A", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#1E293B"}
          onMouseLeave={e => e.currentTarget.style.background = "#0F172A"}
        >
          {showCreate ? "✕ Cancel" : "+ New Coupon"}
        </button>
      </div>

      {showCreate && (
        <div style={{ ...cardStyle, marginBottom: 24, border: "1px solid #CBD5E1" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#0F172A" }}>{coupons.find(c => c.id === id) ? "Edit Coupon" : "Create New Coupon"}</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Coupon Code *</label>
              <input value={id} onChange={e => setId(e.target.value.toUpperCase())} placeholder="e.g. WELCOME50" style={inputStyle} disabled={!!coupons.find(c => c.id === id.toUpperCase())} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155", padding: "10px 0" }}>
                <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#0F172A" }} />
                Coupon Active (ON/OFF)
              </label>
            </div>
            
            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Discount Type *</label>
              <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} style={inputStyle}>
                <option value="percentage">Percentage (%)</option>
                <option value="value">Flat Value (₹)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Discount Amount *</label>
              <input type="number" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} placeholder={discountType === "percentage" ? "e.g. 10 (for 10%)" : "e.g. 50 (for ₹50)"} style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Total Stocks (leave empty for unlimited)</label>
              <input type="number" value={totalStocks} onChange={e => setTotalStocks(e.target.value)} placeholder="e.g. 100" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Per Person Limit (via email)</label>
              <input type="number" value={perPersonLimit} onChange={e => setPerPersonLimit(e.target.value)} placeholder="e.g. 1" style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Valid From (optional)</label>
              <input type="datetime-local" value={validFrom} onChange={e => setValidFrom(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Valid To (optional)</label>
              <input type="datetime-local" value={validTo} onChange={e => setValidTo(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Minimum Order Value (₹)</label>
              <input type="number" value={minimumOrderValue} onChange={e => setMinimumOrderValue(e.target.value)} placeholder="e.g. 500" style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Description (Internal)</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Diwali special offer 2026" style={inputStyle} />
            </div>
          </div>
          
          <button onClick={handleCreateOrUpdate} disabled={saving} style={{ background: saving ? "#94A3B8" : "#10B981", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            {saving ? "Saving..." : "Save Coupon"}
          </button>
        </div>
      )}

      {/* Coupons List */}
      <div style={{ display: "grid", gap: 16 }}>
        {coupons.map(c => (
          <div key={c.id} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", background: "#F1F5F9", padding: "4px 12px", borderRadius: 6, border: "1px solid #E2E8F0" }}>{c.id}</h3>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: c.active ? "#ECFDF5" : "#F1F5F9", color: c.active ? "#059669" : "#64748B", border: `1px solid ${c.active ? "#A7F3D0" : "#E2E8F0"}` }}>
                  {c.active ? "🟢 ACTIVE" : "⚫ INACTIVE"}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#3B82F6" }}>
                  {c.discountType === "percentage" ? `${c.discountAmount}% OFF` : `₹${c.discountAmount} OFF`}
                </span>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#64748B" }}>
                <span><strong style={{ color: "#334155" }}>Uses:</strong> {c.usedCount} / {c.totalStocks >= 999999 ? "∞" : c.totalStocks}</span>
                <span><strong style={{ color: "#334155" }}>Limit/User:</strong> {c.perPersonLimit}</span>
                <span><strong style={{ color: "#334155" }}>Min Order:</strong> ₹{Math.floor(c.minimumOrderValue / 100)}</span>
                {c.validTo && <span><strong style={{ color: "#334155" }}>Expires:</strong> {new Date(c.validTo).toLocaleString()}</span>}
              </div>
              {c.description && <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 8 }}>📝 {c.description}</p>}
            </div>
            
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => toggleActive(c)} style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, background: "#F1F5F9", border: "none", borderRadius: 6, cursor: "pointer", color: "#334155" }}>
                {c.active ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => editCoupon(c)} style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, background: "#EFF6FF", color: "#1D4ED8", border: "none", borderRadius: 6, cursor: "pointer" }}>
                Edit
              </button>
              <button onClick={() => handleDelete(c.id)} style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 6, cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && !showCreate && (
          <div style={{ textAlign: "center", padding: "60px 0", background: "#FFFFFF", borderRadius: 12, border: "1px dashed #CBD5E1" }}>
            <p style={{ fontSize: 32 }}>🎟️</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginTop: 12 }}>No coupons created yet</p>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Create your first coupon code to offer discounts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
