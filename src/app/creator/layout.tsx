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

// Icon: Handshake or Partnership
function HandshakeIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// Icon: Chevron Down
function ChevronDownIcon({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// Icon: Logout
function LogoutIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// Icon: Settings
function SettingsIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default function CreatorLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
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
        .creator-title-sub {
          font-size: 10px;
          font-weight: 700;
          color: #6366F1;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-top: 4px;
          padding-left: 2px;
        }
        @media (max-width: 480px) {
          .creator-title-sub {
            font-size: 8px;
            letter-spacing: 0.8px;
          }
        }
      `}</style>

      {/* Top Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        height: 72,
        padding: "0 clamp(12px, 4vw, 40px)",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        {/* Left: Branding & Logo */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img 
              src={settings?.logoUrl || "/logo.png"} 
              alt="Logo" 
              style={{ height: 32, objectFit: "contain", cursor: "pointer" }} 
              onClick={() => router.push("/creator/dashboard")}
            />
          </div>
          <span className="creator-title-sub">
            creator account
          </span>
        </div>

        {/* Right: Menu Bar & Profile Photo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="desktop-menu" style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span 
              onClick={() => router.push("/creator/dashboard?tab=overview")}
              style={{ fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer", transition: "color 0.2s" }}
              className="nav-link"
            >
              Dashboard
            </span>
            <span 
              onClick={() => window.open("/", "_blank")}
              style={{ fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer", transition: "color 0.2s" }}
              className="nav-link"
            >
              Main Site 🔗
            </span>
          </div>

          {/* User Profile Dropdown Menu */}
          <div className="profile-container" style={{ position: "relative", cursor: "pointer", padding: "8px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {creator?.photoURL ? (
                <img src={creator.photoURL} alt={creator.name} style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #E2E8F0", objectFit: "cover" }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EEF2F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
              )}
              <span className="desktop-menu" style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                {creator?.name ? creator.name.split(" ")[0] : "Account"} <ChevronDownIcon />
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
                onClick={() => router.push("/creator/dashboard?tab=settings")}
                style={{
                  width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none",
                  borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <SettingsIcon /> Settings
              </button>
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
                <LogoutIcon /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content body container */}
      <div style={{ display: "flex", flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
