"use client";
import { use, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProduct } from "@/lib/data";
import { getCouponDB, getOrdersByBuyerDB } from "@/lib/db";
import type { Coupon } from "@/lib/data";
import Link from "next/link";

/* ── Vector SVG Components ── */
function ArrowLeftSVG({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function GiftCardSVG({ size = 24, color = "#7C3AED" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function TicketSVG({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="M15 5v2" />
      <path d="M15 11v2" />
      <path d="M15 17v2" />
      <path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function PadlockSVG({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SpinnerSVG({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function OrderPageInner({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const initialProduct = getProduct(productId);
  const [product, setProduct] = useState(initialProduct);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [step, setStep] = useState<"details" | "payment" | "processing">("details");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponMsg, setCouponMsg] = useState({ type: "", text: "" });
  const [couponLoading, setCouponLoading] = useState(false);

  // Fetch updated product price/details from Firebase
  useEffect(() => {
    import("@/lib/db").then(({ getProductDB }) => {
      getProductDB(productId).then(p => {
        if (p) {
          setProduct(p);
        }
      });
    });
  }, [productId]);

  // Show payment failed toast if redirected back from Cashfree
  useEffect(() => {
    if (searchParams.get("payment") === "failed") {
      setPaymentError("Payment was not completed. Please try again.");
      setStep("payment");
    }
  }, [searchParams]);

  useEffect(() => {
    import("@/lib/analytics").then(({ trackEvent }) => {
      trackEvent("checkout_step", { productId, step });
    });
  }, [step, productId]);

  if (!product) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F5FB", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#64748B", fontSize: 15 }}>The product you requested could not be found.</p>
        <Link href="/" style={{ color: "#7C3AED", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12 }}>
          <ArrowLeftSVG /> Return to Storefront
        </Link>
      </div>
    </div>
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Please provide a valid email address";
    if (!form.phone.trim() || form.phone.replace(/\D/g,"").length < 10) e.phone = "Valid 10-digit phone number required";
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
      if (!c) { setCouponMsg({ type: "error", text: "Invalid coupon code." }); return; }
      if (!c.active) { setCouponMsg({ type: "error", text: "Coupon is no longer active." }); return; }
      if (c.totalStocks <= c.usedCount) { setCouponMsg({ type: "error", text: "Coupon usage limit reached." }); return; }
      if (c.minimumOrderValue > product.price) {
        setCouponMsg({ type: "error", text: `Minimum order value for this coupon is ₹${Math.floor(c.minimumOrderValue/100)}` });
        return;
      }
      const now = new Date();
      if (c.validFrom && now < new Date(c.validFrom)) { setCouponMsg({ type: "error", text: "Coupon is not valid yet." }); return; }
      if (c.validTo && now > new Date(c.validTo)) { setCouponMsg({ type: "error", text: "Coupon has expired." }); return; }
      
      if (form.email && form.phone) {
        const pastOrders = await getOrdersByBuyerDB(form.phone, form.email);
        const usedPast = pastOrders.filter(o => o.couponCode === c.id).length;
        if (usedPast >= c.perPersonLimit) {
          setCouponMsg({ type: "error", text: "You have reached the usage limit for this coupon." });
          return;
        }
      } else {
        setCouponMsg({ type: "error", text: "Please complete personal info first to apply coupon." });
        return;
      }

      setAppliedCoupon(c);
      setCouponMsg({ type: "success", text: "Coupon applied successfully!" });
    } catch {
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

  // ── Core payment handler — calls our API then opens Cashfree SDK ────────────
  const handlePayment = async () => {
    setPayLoading(true);
    setPaymentError("");

    try {
      // 1. Create order on the server (secure — price calculated server-side)
      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          buyerName: form.name,
          buyerEmail: form.email,
          buyerPhone: form.phone,
          couponCode: appliedCoupon?.id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        // Gateway temporarily unavailable — stay on payment step so user can retry
        setPaymentError(
          data.retryable
            ? "Payment gateway is temporarily slow. Please click 'Pay' again — it usually works on the second try."
            : (data.message || "Something went wrong. Please try again.")
        );
        setStep("payment");
        setPayLoading(false);
        return;
      }

      // 2. Free order (100% coupon) — skip payment gateway
      if (data.free) {
        setStep("processing");
        router.push(`/edit/${data.order_id}`);
        return;
      }

      // 3. Open Cashfree checkout
      setStep("processing");

      const { load } = await import("@cashfreepayments/cashfree-js");
      const cashfree = await load({
        mode: (data.cashfree_mode as "sandbox" | "production") || "sandbox",
      });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self", // full-page redirect (most compatible on mobile)
      });

      // Note: execution stops here — Cashfree redirects the browser.
      // The return URL (/api/cashfree/return) handles post-payment logic.

    } catch (err) {
      console.error("[handlePayment]", err);
      setPaymentError("An unexpected error occurred. Please try again.");
      setStep("payment");
      setPayLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F8F5FF 0%, #FFF0F8 100%)", fontFamily: "'Inter', sans-serif" }}>
        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #F3F4F6", padding: "0 clamp(16px, 4vw, 48px)", height: 56, display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
          <Link href={`/preview/${productId}`} style={{ color: "#7C3AED", textDecoration: "none", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            <ArrowLeftSVG /> Back to Preview
          </Link>
        </div>

        <div style={{ maxWidth: 540, margin: "0 auto", padding: "32px 20px 60px" }}>
          {/* Product card */}
          <div style={{ 
            background: "#fff", borderRadius: 24, padding: "24px", marginBottom: 24, 
            display: "flex", alignItems: "center", gap: 16, 
            boxShadow: "0 10px 30px rgba(124, 58, 237, 0.04)", border: "1px solid #F3E8FF" 
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #F3E8FF, #FCE7F3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GiftCardSVG size={24} color="#7C3AED" />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontWeight: 850, fontSize: 16, color: "#1F2937", margin: 0, fontFamily: "'Nunito', sans-serif" }}>
                {product.name.replace(/[\u{1F000}-\u{1FFFF}]/gu,"").trim()}
              </h2>
              <p style={{ color: "#8A94A6", fontSize: 12, marginTop: 4, margin: 0 }}>{product.tagline}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#7C3AED", fontFamily: "'Nunito', sans-serif" }}>₹{Math.floor(product.price/100)}</div>
              <div style={{ fontSize: 10, color: "#22C55E", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>One-time</div>
            </div>
          </div>

          {/* Payment failed banner */}
          {paymentError && (
            <div style={{ 
              background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14, 
              padding: "14px 16px", marginBottom: 20, animation: "fadeIn 0.3s ease",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <p style={{ fontSize: 13, color: "#DC2626", margin: 0, fontWeight: 600 }}>{paymentError}</p>
            </div>
          )}

          {/* Step: Details */}
          {step === "details" && (
            <div style={{ background: "#fff", borderRadius: 24, padding: "28px 24px", boxShadow: "0 10px 30px rgba(124, 58, 237, 0.04)", border: "1px solid #F3E8FF" }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1F2937", marginBottom: 6, fontFamily: "'Nunito', sans-serif", letterSpacing: -0.5 }}>
                Your <span style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Details</span>
              </h1>
              <p style={{ color: "#64748B", fontSize: 13, marginBottom: 24, marginTop: 0 }}>We'll email the unique customization link directly to your inbox.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  { key: "name", label: "Full Name", placeholder: "e.g. Priyanshu Chauhan", type: "text" },
                  { key: "email", label: "Email Address", placeholder: "e.g. priyanshu@example.com", type: "email" },
                  { key: "phone", label: "Phone Number", placeholder: "e.g. 9876543210", type: "tel" },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>{label} *</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{
                        width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 14,
                        border: errors[key] ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
                        background: "#F8FAFC", color: "#1F2937", outline: "none",
                        boxSizing: "border-box", fontFamily: "'Inter', sans-serif",
                        transition: "all 0.2s"
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.background = "#FFF"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors[key] ? "#EF4444" : "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; }}
                    />
                    {errors[key] && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4, margin: 0 }}>{errors[key]}</p>}
                  </div>
                ))}
              </div>

              <button 
                onClick={handleDetailsSubmit} 
                style={{
                  width: "100%", marginTop: 28, padding: "15px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)", color: "#fff",
                  fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "'Nunito', sans-serif",
                  boxShadow: "0 8px 24px rgba(124, 58, 237, 0.25)",
                }}
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step: Payment */}
          {step === "payment" && (
            <div style={{ background: "#fff", borderRadius: 24, padding: "28px 24px", boxShadow: "0 10px 30px rgba(124, 58, 237, 0.04)", border: "1px solid #F3E8FF" }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1F2937", marginBottom: 6, fontFamily: "'Nunito', sans-serif", letterSpacing: -0.5 }}>
                Complete <span style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Payment</span>
              </h1>
              <p style={{ color: "#64748B", fontSize: 13, marginBottom: 24, marginTop: 0 }}>Your customization editor will open automatically post payment.</p>

              {/* Coupon Section */}
              <div style={{ background: "#F8FAFC", borderRadius: 16, padding: "18px 20px", marginBottom: 20, border: "1px solid #F1F5F9" }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#475569", marginBottom: 10, letterSpacing: 0.5 }}>HAVE A COUPON CODE?</p>
                {!appliedCoupon ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input 
                      type="text" 
                      value={couponInput} 
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", outline: "none", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}
                    />
                    <button 
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      style={{ 
                        padding: "0 16px", 
                        background: couponInput.trim() ? "#7C3AED" : "#E2E8F0", 
                        color: "#fff", border: "none", borderRadius: 10, 
                        fontWeight: 800, fontSize: 13,
                        cursor: couponInput.trim() ? "pointer" : "default" 
                      }}
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "10px 14px", borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#059669", display: "flex", alignItems: "center" }}>
                        <TicketSVG size={18} color="#059669" />
                      </span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 900, color: "#065F46", margin: 0 }}>{appliedCoupon.id}</p>
                        <p style={{ fontSize: 11, color: "#059669", margin: 0, marginTop: 1 }}>Promo code applied successfully</p>
                      </div>
                    </div>
                    <button onClick={removeCoupon} style={{ background: "none", border: "none", color: "#EF4444", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Remove</button>
                  </div>
                )}
                {couponMsg.text && (
                  <p style={{ fontSize: 12, marginTop: 8, color: couponMsg.type === "error" ? "#EF4444" : "#10B981", fontWeight: 700, margin: "8px 0 0" }}>{couponMsg.text}</p>
                )}
              </div>

              {/* Summary */}
              <div style={{ background: "#F8FAFC", borderRadius: 16, padding: "18px 20px", marginBottom: 20, border: "1px solid #F1F5F9" }}>
                {[["Billing Name", form.name], ["Receipt Email", form.email], ["SMS Alert Phone", form.phone]].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
                    <span style={{ color: "#64748B" }}>{label}</span>
                    <span style={{ fontWeight: 700, color: "#1E293B" }}>{val}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 14, marginTop: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "#64748B" }}>Subtotal</span>
                    <span style={{ fontSize: 13, color: "#1E293B", fontWeight: 700 }}>₹{Math.floor(product.price / 100)}</span>
                  </div>
                  {appliedCoupon && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 13, color: "#22C55E", fontWeight: 700 }}>Discount ({appliedCoupon.id})</span>
                      <span style={{ fontSize: 13, color: "#22C55E", fontWeight: 700 }}>-₹{Math.floor(discountAmount / 100)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #E2E8F0" }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: "#1E293B" }}>Total Payable</span>
                    <span style={{ fontWeight: 900, fontSize: 24, background: "linear-gradient(135deg, #7C3AED, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Nunito', sans-serif" }}>
                      ₹{Math.floor(finalPrice / 100)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cashfree security badge */}
              <div style={{ background: "#ECFDF5", borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", gap: 10, border: "1px solid #A7F3D0", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", color: "#15803d" }}>
                  <PadlockSVG size={16} color="#15803d" />
                </span>
                <p style={{ fontSize: 12, color: "#15803d", lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
                  Secured by Cashfree Payments. 100+ payment methods supported — UPI, Cards, Netbanking, Wallets.
                </p>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setStep("details")} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "1.5px solid #E2E8F0", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
                <button 
                  onClick={handlePayment}
                  disabled={payLoading}
                  style={{ 
                    flex: 2, padding: "14px", borderRadius: 14, border: "none", 
                    background: payLoading ? "#C4B5FD" : "linear-gradient(135deg, #7C3AED, #EC4899)", color: "#fff", 
                    fontWeight: 900, fontSize: 14, cursor: payLoading ? "not-allowed" : "pointer", 
                    fontFamily: "'Nunito', sans-serif", 
                    boxShadow: payLoading ? "none" : "0 8px 24px rgba(124,58,237,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    transition: "all 0.2s"
                  }}
                >
                  {payLoading ? (
                    <>
                      <SpinnerSVG size={18} />
                      Opening Cashfree...
                    </>
                  ) : (
                    `Pay ₹${Math.floor(finalPrice / 100)} & Personalise`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step: Processing */}
          {step === "processing" && (
            <div style={{ background: "#fff", borderRadius: 24, padding: "60px 24px", textAlign: "center", boxShadow: "0 10px 30px rgba(124, 58, 237, 0.04)", border: "1px solid #F3E8FF", animation: "fadeIn 0.4s ease" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #F3E8FF, #FCE7F3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <SpinnerSVG size={36} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1F2937", fontFamily: "'Nunito', sans-serif", margin: 0 }}>Opening Payment...</h2>
              <p style={{ color: "#64748B", marginTop: 12, fontSize: 14, margin: "12px 0 0 0", lineHeight: 1.6 }}>
                Please do not close this page.<br />You will be redirected to Cashfree&apos;s secure checkout.
              </p>
              <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <PadlockSVG size={14} color="#7C3AED" />
                <span style={{ fontSize: 12, color: "#7C3AED", fontWeight: 700 }}>Powered by Cashfree Payments</span>
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 20, marginTop: 28, justifyContent: "center", flexWrap: "wrap" }}>
            {["Secure SSL Encryption", "Cashfree PG Powered", "Lifetime Access Guarantee"].map(b => (
              <span key={b} style={{ fontSize: 11, color: "#8A94A6", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#22C55E" }}>✓</span> {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function OrderPage({ params }: { params: Promise<{ productId: string }> }) {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #F8F5FF 0%, #FFF0F8 100%)" }}>
        <SpinnerSVG size={36} />
      </div>
    }>
      <OrderPageInner params={params} />
    </Suspense>
  );
}
