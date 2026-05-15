"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { getProduct } from "@/lib/data";
import { createOrderDB, getCouponDB, getOrdersByBuyerDB, saveCouponDB } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type { Coupon } from "@/lib/data";
import Link from "next/link";

export default function OrderPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const product = getProduct(productId);
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [step, setStep] = useState<"details" | "payment" | "processing">("details");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponMsg, setCouponMsg] = useState({ type: "", text: "" });
  const [couponLoading, setCouponLoading] = useState(false);

  if (!product) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8F5FF" }}>
      <p style={{ color: "#6B7280" }}>Product not found. <Link href="/" style={{ color: "#7C3AED" }}>Go back</Link></p>
    </div>
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim() || form.phone.replace(/\D/g,"").length < 10) e.phone = "Valid 10-digit phone required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleDetailsSubmit = () => { if (validate()) setStep("payment"); };

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMsg({ type: "", text: "" });
    try {
      const c = await getCouponDB(couponInput);
      if (!c) {
        setCouponMsg({ type: "error", text: "Invalid coupon code." });
        return;
      }
      if (!c.active) {
        setCouponMsg({ type: "error", text: "Coupon is no longer active." });
        return;
      }
      if (c.totalStocks <= c.usedCount) {
        setCouponMsg({ type: "error", text: "Coupon usage limit reached." });
        return;
      }
      if (c.minimumOrderValue > product.price) {
        setCouponMsg({ type: "error", text: `Minimum order value for this coupon is ₹${Math.floor(c.minimumOrderValue/100)}` });
        return;
      }
      const now = new Date();
      if (c.validFrom && now < new Date(c.validFrom)) {
        setCouponMsg({ type: "error", text: "Coupon is not valid yet." });
        return;
      }
      if (c.validTo && now > new Date(c.validTo)) {
        setCouponMsg({ type: "error", text: "Coupon has expired." });
        return;
      }
      
      // Check per-person limit if email is provided
      if (form.email && form.phone) {
        const pastOrders = await getOrdersByBuyerDB(form.phone, form.email);
        const usedPast = pastOrders.filter(o => o.couponCode === c.id).length;
        if (usedPast >= c.perPersonLimit) {
          setCouponMsg({ type: "error", text: "You have reached the usage limit for this coupon." });
          return;
        }
      } else {
        setCouponMsg({ type: "error", text: "Please fill Name, Email and Phone first to apply coupon." });
        return;
      }

      setAppliedCoupon(c);
      setCouponMsg({ type: "success", text: "Coupon applied successfully!" });
    } catch (err: any) {
      setCouponMsg({ type: "error", text: "Error verifying coupon." });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponMsg({ type: "", text: "" });
  };

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = Math.floor(product.price * (appliedCoupon.discountAmount / 100));
    } else {
      discountAmount = appliedCoupon.discountAmount * 100;
    }
  }
  const finalPrice = Math.max(0, product.price - discountAmount);

  const handlePayment = async () => {
    if (finalPrice > 0) {
      alert("Payment method not set by admin.");
      return;
    }

    setStep("processing");
    const order = await createOrderDB({
      productId: product.id,
      productName: product.name,
      buyerName: form.name,
      buyerEmail: form.email,
      buyerPhone: form.phone,
      amount: finalPrice, // use finalPrice here!
    });

    if (appliedCoupon) {
      // update usage count in DB
      await saveCouponDB({ ...appliedCoupon, usedCount: appliedCoupon.usedCount + 1 });
    }

    // Send confirmation email (fire-and-forget)
    const editLink = `${window.location.origin}/edit/${order.id}`;
    sendOrderConfirmationEmail({
      buyer_name: form.name,
      email: form.email,
      order_id: order.id,
      product_name: product.name,
      product_emoji: product.thumbnail || "🎁",
      amount: String(Math.floor(finalPrice / 100)),
      edit_link: editLink,
    });

    router.push(`/edit/${order.id}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#F8F5FF 0%,#FFF0F8 100%)", fontFamily: "'Inter',sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F3F4F6", padding: "0 20px", height: 54, display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <Link href={`/preview/${productId}`} style={{ color: "#7C3AED", textDecoration: "none", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          ← Back to Preview
        </Link>
      </div>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "32px 20px 60px" }}>
        {/* Product card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 4px 24px rgba(124,58,237,0.08)", border: "1px solid #F3E8FF" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#F3E8FF,#FCE7F3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
            🎁
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 800, fontSize: 16, color: "#1F2937", fontFamily: "'Nunito',sans-serif" }}>{product.name.replace(/[\u{1F000}-\u{1FFFF}]/gu,"").trim()}</h2>
            <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 2 }}>{product.tagline}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#7C3AED", fontFamily: "'Nunito',sans-serif" }}>₹{Math.floor(product.price/100)}</div>
            <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700 }}>One-time</div>
          </div>
        </div>

        {/* Step: Details */}
        {step === "details" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", boxShadow: "0 4px 24px rgba(124,58,237,0.08)", border: "1px solid #F3E8FF" }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1F2937", marginBottom: 6, fontFamily: "'Nunito',sans-serif" }}>
              Your <span style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Details</span>
            </h1>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>We'll send your personalised link to your email.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { key: "name", label: "Your Name", placeholder: "e.g. Rahul Sharma", type: "text" },
                { key: "email", label: "Email Address", placeholder: "e.g. rahul@example.com", type: "email" },
                { key: "phone", label: "Phone Number", placeholder: "e.g. 9876543210", type: "tel" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label} *</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{
                      width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 14,
                      border: errors[key] ? "1.5px solid #EF4444" : "1.5px solid #E5E7EB",
                      background: "#F9FAFB", color: "#1F2937", outline: "none",
                      boxSizing: "border-box", fontFamily: "'Inter',sans-serif",
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.background = "#FAFFFE"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors[key] ? "#EF4444" : "#E5E7EB"; e.currentTarget.style.background = "#F9FAFB"; }}
                  />
                  {errors[key] && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors[key]}</p>}
                </div>
              ))}
            </div>

            <button onClick={handleDetailsSubmit} style={{
              width: "100%", marginTop: 24, padding: "15px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg,#7C3AED,#EC4899)", color: "#fff",
              fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "'Nunito',sans-serif",
              boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
            }}>
              Continue to Payment →
            </button>
          </div>
        )}

        {/* Step: Payment */}
        {step === "payment" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", boxShadow: "0 4px 24px rgba(124,58,237,0.08)", border: "1px solid #F3E8FF" }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1F2937", marginBottom: 6, fontFamily: "'Nunito',sans-serif" }}>
              Complete <span style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Payment</span>
            </h1>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Secure payment — your personalised editor opens instantly.</p>

            {/* Coupon Section */}
            <div style={{ background: "#F9FAFB", borderRadius: 14, padding: "18px 20px", marginBottom: 20, border: "1px solid #F3F4F6" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#4B5563", marginBottom: 10 }}>HAVE A COUPON CODE?</p>
              {!appliedCoupon ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <input 
                    type="text" 
                    value={couponInput} 
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #D1D5DB", outline: "none", fontSize: 14, textTransform: "uppercase" }}
                  />
                  <button 
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    style={{ padding: "0 16px", background: couponInput.trim() ? "#1F2937" : "#E5E7EB", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: couponInput.trim() ? "pointer" : "default" }}
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "10px 14px", borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🎟️</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#065F46" }}>{appliedCoupon.id}</p>
                      <p style={{ fontSize: 11, color: "#059669" }}>Applied successfully</p>
                    </div>
                  </div>
                  <button onClick={removeCoupon} style={{ background: "none", border: "none", color: "#EF4444", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Remove</button>
                </div>
              )}
              {couponMsg.text && (
                <p style={{ fontSize: 12, marginTop: 8, color: couponMsg.type === "error" ? "#EF4444" : "#10B981", fontWeight: 600 }}>{couponMsg.text}</p>
              )}
            </div>

            {/* Summary */}
            <div style={{ background: "#F9FAFB", borderRadius: 14, padding: "18px 20px", marginBottom: 20, border: "1px solid #F3F4F6" }}>
              {[["Name", form.name], ["Email", form.email], ["Phone", form.phone]].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
                  <span style={{ color: "#9CA3AF" }}>{label}</span>
                  <span style={{ fontWeight: 600, color: "#1F2937" }}>{val}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 14, marginTop: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: "#6B7280" }}>Subtotal</span>
                  <span style={{ fontSize: 14, color: "#1F2937", fontWeight: 600 }}>₹{Math.floor(product.price / 100)}</span>
                </div>
                {appliedCoupon && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 14, color: "#10B981", fontWeight: 600 }}>Discount ({appliedCoupon.id})</span>
                    <span style={{ fontSize: 14, color: "#10B981", fontWeight: 600 }}>-₹{Math.floor(discountAmount / 100)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #E5E7EB" }}>
                  <span style={{ fontWeight: 800, fontSize: 16, color: "#1F2937" }}>Total</span>
                  <span style={{ fontWeight: 900, fontSize: 24, background: "linear-gradient(135deg,#7C3AED,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Nunito',sans-serif" }}>
                    ₹{Math.floor(finalPrice / 100)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ background: "#F0FDF4", borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", gap: 10, border: "1px solid #BBF7D0" }}>
              <span>🔒</span>
              <p style={{ fontSize: 13, color: "#166534", lineHeight: 1.6 }}>
                Demo mode — Razorpay integration ready. Your personalised editor opens immediately.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep("details")} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
              <button onClick={handlePayment} style={{ flex: 2, padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#7C3AED,#EC4899)", color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "'Nunito',sans-serif", boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}>
                Pay ₹{Math.floor(finalPrice / 100)} & Personalise 🎉
              </button>
            </div>
          </div>
        )}

        {/* Step: Processing */}
        {step === "processing" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "60px 24px", textAlign: "center", boxShadow: "0 4px 24px rgba(124,58,237,0.08)", border: "1px solid #F3E8FF" }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>✨</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1F2937", fontFamily: "'Nunito',sans-serif" }}>Setting up your editor…</h2>
            <p style={{ color: "#9CA3AF", marginTop: 8, fontSize: 14 }}>Opening your personalised editor in a moment!</p>
          </div>
        )}

        {/* Trust badges */}
        <div style={{ display: "flex", gap: 20, marginTop: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {["🔒 Secure Payment", "📩 Instant Access", "💌 Shareable Link"].map(b => (
            <span key={b} style={{ fontSize: 12, color: "#9CA3AF" }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
