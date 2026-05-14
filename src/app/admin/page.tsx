"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, isAdminLoggedIn } from "@/lib/data";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isAdminLoggedIn()) router.replace("/admin/dashboard");
    else setChecking(false);
  }, [router]);

  const handleLogin = () => {
    if (adminLogin(password)) {
      router.push("/admin/dashboard");
    } else {
      setError("Incorrect password. Try again.");
    }
  };

  if (checking) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #FFF0F5 0%, #F5F3FF 50%, #FAFAFA 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div className="fade-in-up" style={{ maxWidth: 420, width: "100%", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 48 }}>🛡️</span>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginTop: 12, fontFamily: "'Nunito',sans-serif", color: "#1F2937" }}>
            Admin <span style={{ background: "linear-gradient(135deg,#7C3AED,#E91E8C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Panel</span>
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: 14, marginTop: 6 }}>
            Aradhya E-Gifts · Secure Access
          </p>
        </div>

        <div style={{
          background: "#fff", borderRadius: 20, padding: 32,
          boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.04)",
        }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 8 }}>
            Admin Password
          </label>
          <input
            type="password"
            placeholder="Enter password…"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            autoFocus
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 12,
              border: "1.5px solid #E5E7EB", fontSize: 15, color: "#1F2937",
              background: "#F9FAFB", outline: "none", boxSizing: "border-box",
            }}
          />
          {error && <p style={{ color: "#EF4444", fontSize: 13, marginTop: 8, fontWeight: 600 }}>{error}</p>}
          <button
            onClick={handleLogin}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg,#7C3AED,#E91E8C)", color: "#fff",
              fontWeight: 800, fontSize: 16, cursor: "pointer", marginTop: 20,
              fontFamily: "'Nunito',sans-serif",
              boxShadow: "0 8px 24px rgba(124,58,237,0.25)",
            }}
          >
            Enter Admin Panel →
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/" style={{ color: "#9CA3AF", fontSize: 13, textDecoration: "none" }}>
            ← Back to public site
          </Link>
        </div>
      </div>
    </div>
  );
}
