"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getCreatorDB } from "@/lib/db";

/* ── Inline SVG Icon Components ── */
function HandshakeIcon({ size = 28, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function DollarIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function BarChartIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function TrophyIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
    </svg>
  );
}

function WarningIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function RocketIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
      <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5" />
      <path d="M12 2C6.5 2 2 6.5 2 12c0 2.5 1 4.5 2.5 6l6-6" />
      <path d="M12 2c5.5 0 10 4.5 10 10 0 2.5-1 4.5-2.5 6l-6-6" />
      <path d="M9 15l3-3 3 3-3 3-3-3z" />
    </svg>
  );
}

export default function CreatorLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ phone: "", instagram: "", youtube: "", other: "" });
  const [pendingUser, setPendingUser] = useState<{ uid: string; name: string; email: string; photoURL: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const existing = await getCreatorDB(user.uid);
        if (existing) {
          router.replace("/creator/dashboard");
          return;
        }
      }
      setCheckingAuth(false);
    });
    return () => unsub();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const existing = await getCreatorDB(user.uid);
      if (existing) {
        await fetch("/api/creator/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid, name: user.displayName, email: user.email, photoURL: user.photoURL, googleId: user.uid }),
        });
        router.replace("/creator/dashboard");
        return;
      }

      setPendingUser({ uid: user.uid, name: user.displayName || "Creator", email: user.email || "", photoURL: user.photoURL || "" });
      setStep("register");
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled.");
      } else {
        setError(err?.message || "Sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!pendingUser) return;
    if (!form.phone || form.phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/creator/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: pendingUser.uid,
          name: pendingUser.name,
          email: pendingUser.email,
          photoURL: pendingUser.photoURL,
          googleId: pendingUser.uid,
          phone: form.phone,
          instagramHandle: form.instagram,
          youtubeHandle: form.youtube,
          otherHandle: form.other,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.replace("/creator/dashboard");
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    await signOut(auth);
    setPendingUser(null);
    setStep("login");
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #6366F1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", padding: "20px" }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .google-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15) !important; background: #4F46E5 !important; }
        .google-btn:active { transform: translateY(0); }
        .cancel-btn:hover { background: #E2E8F0 !important; }
        .input-field:focus { border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important; outline: none; }
      `}</style>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, animation: "fadeUp 0.4s ease forwards" }}>
        {/* Logo & Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px",
            background: "#6366F1",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#FFFFFF",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)"
          }}>
            <HandshakeIcon size={28} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: -0.5 }}>
            Creator Portal
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
            {step === "login"
              ? "Join our affiliate program and earn commissions on every sale you refer."
              : "Complete your profile to start earning commissions."
            }
          </p>
        </div>

        {/* Main Card */}
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 20,
          padding: "36px 32px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
        }}>
          {step === "login" && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>Welcome</h2>
              <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 24px" }}>Sign in with Google to access your affiliate dashboard.</p>

              {/* Feature highlights */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {[
                  { icon: <DollarIcon size={18} />, text: "Earn commission on every referred sale" },
                  { icon: <BarChartIcon size={18} />, text: "Track your earnings & milestones in real-time" },
                  { icon: <TrophyIcon size={18} />, text: "Unlock reward bonuses as you refer more" },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                    <span style={{ color: "#6366F1", display: "flex" }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{item.text}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                  <p style={{ color: "#EF4444", fontSize: 13, margin: 0, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <WarningIcon color="#EF4444" /> {error}
                  </p>
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="google-btn"
                style={{
                  width: "100%", padding: "14px 20px",
                  background: loading ? "#A5B4FC" : "#6366F1",
                  border: "none", borderRadius: 12,
                  color: "#FFFFFF", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)"
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 20, height: 20, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              <p style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", marginTop: 20, lineHeight: 1.6 }}>
                By signing in, you agree to our affiliate program terms. Your Google profile data is used only for account registration.
              </p>
            </>
          )}

          {step === "register" && pendingUser && (
            <>
              {/* User Identity Preview */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0", marginBottom: 24 }}>
                {pendingUser.photoURL ? (
                  <img src={pendingUser.photoURL} alt={pendingUser.name} style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid #E2E8F0", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#EEF2F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#94A3B8" }}>👤</div>
                )}
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: "#0F172A", fontSize: 14 }}>{pendingUser.name}</p>
                  <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>{pendingUser.email}</p>
                </div>
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: "0 0 4px" }}>Complete Your Profile</h2>
              <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 20px" }}>We need a few details to set up your affiliate account.</p>

              {[
                { key: "phone", label: "Phone Number *", placeholder: "10-digit mobile number", type: "tel" },
                { key: "instagram", label: "Instagram Handle", placeholder: "@yourhandle", type: "text" },
                { key: "youtube", label: "YouTube Channel", placeholder: "Channel URL or @name", type: "text" },
                { key: "other", label: "Other Platform", placeholder: "Website or other link", type: "text" },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    className="input-field"
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{
                      width: "100%", padding: "12px 14px", boxSizing: "border-box",
                      background: "#FFFFFF", border: "1px solid #CBD5E1",
                      borderRadius: 10, color: "#0F172A", fontSize: 14, transition: "all 0.2s",
                    }}
                  />
                </div>
              ))}

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                  <p style={{ color: "#EF4444", fontSize: 12, margin: 0, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <WarningIcon color="#EF4444" /> {error}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  onClick={handleCancel}
                  className="cancel-btn"
                  style={{
                    flex: 1, padding: "12px", borderRadius: 10,
                    background: "#F1F5F9", border: "none",
                    color: "#475569", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegister}
                  disabled={saving}
                  style={{
                    flex: 2, padding: "12px", borderRadius: 10,
                    background: saving ? "#A5B4FC" : "#6366F1",
                    border: "none", color: "#FFFFFF", fontWeight: 700, fontSize: 14,
                    cursor: saving ? "not-allowed" : "pointer", transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)"
                  }}
                >
                  {saving ? (
                    <><div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Saving...</>
                  ) : (
                    <>
                      <RocketIcon size={16} /> Join Program
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 12, color: "#64748B", marginTop: 28 }}>
          Aradhya E-Giftings · Creator Affiliate Portal
        </p>
      </div>
    </div>
  );
}
