"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
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

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #111827", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (pathname === "/creator") {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", color: "#111827", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
      `}</style>

      {/* Main content body container - Header has been removed to allow page.tsx full control */}
      <div style={{ display: "flex", flex: 1, flexDirection: "column", width: "100%", maxWidth: "100vw", overflowX: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
