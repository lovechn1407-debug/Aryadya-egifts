"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getCreatorDB, getSettingsDB } from "@/lib/db";
import type { Creator } from "@/lib/db";

interface SystemSettings {
  logoUrl?: string;
  businessName?: string;
}

export default function CreatorLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch settings for branding logo
    getSettingsDB().then(s => {
      setSettings(s || {});
    }).catch(() => {});

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setChecking(false);
        if (pathname !== "/creator") router.replace("/creator");
        return;
      }
      const c = await getCreatorDB(user.uid);
      setCreator(c);
      setChecking(false);
      if (!c && pathname !== "/creator") {
        router.replace("/creator");
      }
    });
    return () => unsub();
  }, [pathname, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/creator");
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #6366F1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  // On the login page itself, just render children (no portal layout needed)
  if (pathname === "/creator") {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter', sans-serif", color: "#1E293B", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .nav-link:hover { color: #6366F1 !important; }
        .dropdown-menu { display: none; }
        .profile-container:hover .dropdown-menu { display: block; }
      `}</style>

      {/* Top Header (Styled like main site header) */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        height: 72,
        padding: "0 clamp(16px, 4vw, 40px)",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        {/* Left: Branding & Logo */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img 
              src={settings?.logoUrl || "/logo.png"} 
              alt="Logo" 
              style={{ height: 36, objectFit: "contain", cursor: "pointer" }} 
              onClick={() => router.push("/creator/dashboard")}
            />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: 1, marginTop: 2, paddingLeft: 2 }}>
            creator account
          </span>
        </div>

        {/* Right: Menu Bar & Profile Photo */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Quick Stats or shortcuts on Desktop */}
          <div className="desktop-menu" style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span 
              onClick={() => router.push("/creator/dashboard")}
              style={{ fontSize: 14, fontWeight: 600, color: "#475569", cursor: "pointer", transition: "color 0.2s" }}
              className="nav-link"
            >
              Dashboard
            </span>
            <span 
              onClick={() => window.open("/", "_blank")}
              style={{ fontSize: 14, fontWeight: 600, color: "#475569", cursor: "pointer", transition: "color 0.2s" }}
              className="nav-link"
            >
              View Main Site 🔗
            </span>
          </div>

          {/* User Profile Dropdown Menu */}
          <div className="profile-container" style={{ position: "relative", cursor: "pointer", padding: "4px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {creator?.photoURL ? (
                <img src={creator.photoURL} alt={creator.name} style={{ width: 38, height: 38, borderRadius: "50%", border: "2px solid #E2E8F0", objectFit: "cover" }} />
              ) : (
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#EEF2F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
              )}
              <span className="desktop-menu" style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                {creator?.name ? creator.name.split(" ")[0] : "Account"} ▾
              </span>
            </div>

            {/* Hover Dropdown */}
            <div className="dropdown-menu" style={{
              position: "absolute", right: 0, top: "100%", width: 180,
              background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12,
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.05)",
              padding: 6, zIndex: 110, animation: "slideDown 0.15s ease-out"
            }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid #F1F5F9", marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{creator?.name}</div>
                <div style={{ fontSize: 10, color: "#64748B", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{creator?.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none",
                  borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#EF4444", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <span>🚪</span> Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Responsive layout containers */}
      <div style={{ display: "flex", flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
