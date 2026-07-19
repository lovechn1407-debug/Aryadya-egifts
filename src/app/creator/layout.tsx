"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getCreatorDB } from "@/lib/db";
import type { Creator } from "@/lib/db";

export default function CreatorLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
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

  // On the login page itself, just render children (no nav needed)
  if (pathname === "/creator") {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter', sans-serif", color: "#1E293B" }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }
      `}</style>
      {/* Top Navigation */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        padding: "0 clamp(16px, 4vw, 48px)", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "#6366F1",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, color: "#FFFFFF"
          }}>🤝</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Creator Portal</span>
          <span style={{
            fontSize: 10, fontWeight: 700, background: "#EEF2F6",
            color: "#6366F1", padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5
          }}>AFFILIATE</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {creator?.name && (
            <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>
              Hey, {creator.name.split(" ")[0]} 👋
            </span>
          )}
          {creator?.photoURL && (
            <img src={creator.photoURL} alt={creator.name} style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid #E2E8F0", objectFit: "cover" }} />
          )}
          <button
            onClick={handleSignOut}
            style={{
              background: "#FEF2F2", border: "1px solid #FCA5A5",
              color: "#EF4444", padding: "7px 14px", borderRadius: 8, cursor: "pointer",
              fontSize: 12, fontWeight: 700, transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Content */}
      <main style={{ flex: 1, padding: "0" }}>
        {children}
      </main>
    </div>
  );
}
