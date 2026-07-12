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

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("egift_admin_logged_in", "1");
        router.push("/admin/dashboard");
      } else {
        setError(data.message || "Incorrect password. Try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  if (checking) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F8FAFC",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="fade-in-up" style={{ maxWidth: 420, width: "100%", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <img src="/logo.png" alt="Admin Logo" style={{ height: 48, objectFit: "contain" }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: -0.5 }}>
            Welcome back
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
            Sign in to your admin workspace
          </p>
        </div>

        <div style={{
          background: "#FFFFFF", borderRadius: 16, padding: "32px 28px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
          border: "1px solid #E2E8F0",
        }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 8 }}>
            Admin Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            autoFocus
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 10,
              border: "1px solid #CBD5E1", fontSize: 14, color: "#0F172A",
              background: "#FFFFFF", outline: "none", boxSizing: "border-box",
              transition: "all 0.2s",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "#CBD5E1"; e.currentTarget.style.boxShadow = "none"; }}
          />
          {error && <p style={{ color: "#EF4444", fontSize: 13, marginTop: 8, fontWeight: 500 }}>{error}</p>}
          <button
            onClick={handleLogin}
            style={{
              width: "100%", padding: "12px", borderRadius: 10, border: "none",
              background: "#0F172A", color: "#FFFFFF",
              fontWeight: 600, fontSize: 14, cursor: "pointer", marginTop: 24,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1E293B"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#0F172A"; }}
          >
            Sign in
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/" style={{ color: "#64748B", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
