"use client";
import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [method, setMethod] = useState<"choose" | "phone">("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize reCAPTCHA
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to login with Google");
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`; // default India if no country code
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send OTP");
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
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 400,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)", position: "relative"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, background: "none", border: "none",
          fontSize: 24, cursor: "pointer", color: "#64748B"
        }}>&times;</button>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1E293B", textAlign: "center", marginBottom: 24 }}>
          Welcome Back
        </h2>

        {error && <div style={{ background: "#FEF2F2", color: "#EF4444", padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        {method === "choose" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <button onClick={handleGoogleLogin} disabled={loading} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              background: "#fff", border: "1px solid #CBD5E1", borderRadius: 12, padding: "12px",
              fontSize: 15, fontWeight: 600, color: "#1E293B", cursor: "pointer", transition: "0.2s"
            }}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 20 }} />
              Continue with Google
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>

            <button onClick={() => setMethod("phone")} disabled={loading} style={{
              background: "#7C3AED", color: "#fff", border: "none", borderRadius: 12, padding: "14px",
              fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "0.2s"
            }}>
              Continue with Phone Number
            </button>
          </div>
        )}

        {method === "phone" && (
          <form onSubmit={confirmationResult ? handleVerifyOtp : handleSendOtp}>
            {!confirmationResult ? (
              <>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 8 }}>Phone Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="e.g. 9876543210" 
                  required 
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #CBD5E1", outline: "none", fontSize: 15, marginBottom: 16, boxSizing: "border-box" }} 
                />
                <button type="submit" disabled={loading} style={{
                  background: "#7C3AED", color: "#fff", border: "none", borderRadius: 12, padding: "14px",
                  fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", opacity: loading ? 0.7 : 1
                }}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 8 }}>Enter OTP</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  placeholder="6-digit code" 
                  required 
                  maxLength={6}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #CBD5E1", outline: "none", fontSize: 15, marginBottom: 16, boxSizing: "border-box", textAlign: "center", letterSpacing: 4 }} 
                />
                <button type="submit" disabled={loading} style={{
                  background: "#7C3AED", color: "#fff", border: "none", borderRadius: 12, padding: "14px",
                  fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", opacity: loading ? 0.7 : 1
                }}>
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
              </>
            )}
            
            <button type="button" onClick={() => { setMethod("choose"); setConfirmationResult(null); }} style={{
              background: "none", border: "none", color: "#64748B", fontSize: 13, fontWeight: 600, marginTop: 16, cursor: "pointer", width: "100%"
            }}>
              Back to options
            </button>
          </form>
        )}
        
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
