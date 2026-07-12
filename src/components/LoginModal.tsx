"use client";
import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

interface LoginModalProps {
  onClose: () => void;
  googleEnabled?: boolean;
  phoneEnabled?: boolean;
}

export default function LoginModal({ onClose, googleEnabled = true, phoneEnabled = true }: LoginModalProps) {
  const [method, setMethod] = useState<"choose" | "phone">("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
    }
  }, []);

  const handleGoogleLogin = async () => {
    if (!googleEnabled) return;
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Failed to sign in with Google. Please try again.");
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneEnabled) return;
    setLoading(true);
    setError("");
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const formatted = phone.startsWith("+") ? phone : `+91${phone}`;
      const result = await signInWithPhoneNumber(auth, formatted, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    setError("");
    try {
      await confirmationResult.confirm(otp);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Invalid OTP. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ label, icon, onClick, disabled, unavailable }: {
    label: string; icon: React.ReactNode; onClick: () => void; disabled?: boolean; unavailable?: boolean;
  }) => (
    <div style={{ position: "relative" }}>
      <button
        onClick={onClick}
        disabled={disabled || unavailable}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 14,
          padding: "14px 18px", borderRadius: 14,
          border: unavailable ? "1.5px solid #E2E8F0" : "1.5px solid #E2E8F0",
          background: unavailable ? "#F8FAFC" : "#fff",
          cursor: unavailable ? "not-allowed" : "pointer",
          transition: "all 0.2s", opacity: (disabled && !unavailable) ? 0.6 : 1,
          boxShadow: unavailable ? "none" : "0 1px 4px rgba(0,0,0,0.06)",
          textAlign: "left"
        }}
        onMouseEnter={e => { if (!unavailable && !disabled) e.currentTarget.style.borderColor = "#7C3AED"; }}
        onMouseLeave={e => { if (!unavailable && !disabled) e.currentTarget.style.borderColor = "#E2E8F0"; }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 10, background: unavailable ? "#F1F5F9" : "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: unavailable ? "#94A3B8" : "#1E293B" }}>{label}</div>
          {unavailable && (
            <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Currently unavailable
            </div>
          )}
        </div>
        {!unavailable && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        )}
        {unavailable && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        )}
      </button>
    </div>
  );

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 28, width: "100%", maxWidth: 420,
        boxShadow: "0 32px 80px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden"
      }}>
        {/* Header gradient strip */}
        <div style={{
          background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
          padding: "28px 32px 24px",
          position: "relative"
        }}>
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%",
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff", fontSize: 18, lineHeight: 1
          }}>×</button>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: -0.3 }}>Welcome Back!</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>Sign in to track orders & checkout faster</p>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 32px 32px" }}>
          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          )}

          {method === "choose" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Toggle
                label="Continue with Google"
                icon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 20 }} />}
                onClick={handleGoogleLogin}
                disabled={loading}
                unavailable={!googleEnabled}
              />

              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>or</span>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              </div>

              <Toggle
                label="Continue with Phone (OTP)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.22 12 19.79 19.79 0 0 1 1.15 3.38 2 2 0 0 1 3.12 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16z"/>
                  </svg>
                }
                onClick={() => setMethod("phone")}
                disabled={loading}
                unavailable={!phoneEnabled}
              />

              <p style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", margin: "8px 0 0" }}>
                By continuing, you agree to our <span style={{ color: "#7C3AED", cursor: "pointer", fontWeight: 600 }}>Terms</span> & <span style={{ color: "#7C3AED", cursor: "pointer", fontWeight: 600 }}>Privacy Policy</span>
              </p>
            </div>
          )}

          {method === "phone" && (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {!otpSent ? (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Phone Number
                    </label>
                    <div style={{ display: "flex", border: "1.5px solid #E2E8F0", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
                      <div style={{ padding: "0 14px", background: "#F8FAFC", display: "flex", alignItems: "center", borderRight: "1.5px solid #E2E8F0", fontSize: 14, fontWeight: 600, color: "#475569", whiteSpace: "nowrap" }}>
                        🇮🇳 +91
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="10-digit number"
                        required
                        style={{ flex: 1, padding: "13px 14px", border: "none", outline: "none", fontSize: 15, background: "transparent" }}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading || phone.length < 10} style={{
                    background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                    color: "#fff", border: "none", borderRadius: 12, padding: "14px",
                    fontSize: 15, fontWeight: 700, cursor: phone.length < 10 ? "not-allowed" : "pointer",
                    opacity: (loading || phone.length < 10) ? 0.7 : 1,
                    boxShadow: "0 4px 15px rgba(124,58,237,0.3)"
                  }}>
                    {loading ? "Sending…" : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ textAlign: "center", padding: "8px 0" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📱</div>
                    <p style={{ fontSize: 14, color: "#475569", margin: 0 }}>OTP sent to <strong>+91 {phone}</strong></p>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Enter 6-digit OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="• • • • • •"
                      required
                      maxLength={6}
                      autoFocus
                      style={{
                        width: "100%", padding: "16px", borderRadius: 12,
                        border: "1.5px solid #E2E8F0", outline: "none", fontSize: 22,
                        textAlign: "center", letterSpacing: 10, fontWeight: 800,
                        boxSizing: "border-box", color: "#7C3AED"
                      }}
                    />
                  </div>
                  <button type="submit" disabled={loading || otp.length < 6} style={{
                    background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                    color: "#fff", border: "none", borderRadius: 12, padding: "14px",
                    fontSize: 15, fontWeight: 700, cursor: otp.length < 6 ? "not-allowed" : "pointer",
                    opacity: (loading || otp.length < 6) ? 0.7 : 1,
                    boxShadow: "0 4px 15px rgba(124,58,237,0.3)"
                  }}>
                    {loading ? "Verifying…" : "Verify & Login"}
                  </button>
                  <button type="button" onClick={() => setOtpSent(false)} style={{
                    background: "none", border: "none", color: "#64748B", fontSize: 13,
                    fontWeight: 600, cursor: "pointer", textAlign: "center"
                  }}>
                    ← Change number
                  </button>
                </>
              )}

              {!otpSent && (
                <button type="button" onClick={() => { setMethod("choose"); setConfirmationResult(null); setOtpSent(false); }} style={{
                  background: "none", border: "none", color: "#64748B", fontSize: 13,
                  fontWeight: 600, cursor: "pointer", textAlign: "center"
                }}>
                  ← Other sign-in options
                </button>
              )}
            </form>
          )}
        </div>

        <div id="recaptcha-container" />
      </div>
    </div>
  );
}
