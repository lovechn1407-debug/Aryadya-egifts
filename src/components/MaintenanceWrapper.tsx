"use client";
import { useEffect, useState } from "react";
import { getSettingsDB, Settings } from "@/lib/db";
import { usePathname } from "next/navigation";

export default function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const s = await getSettingsDB();
        setSettings(s);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSettings();
    // Poll every 30 seconds for settings
    const id = setInterval(fetchSettings, 30000);
    return () => clearInterval(id);
  }, []);

  if (!settings) return <>{children}</>; // Render normally while checking

  // Don't block the admin page or view pages if they shouldn't be blocked, but usually maintenance blocks everything except admin.
  if (settings.maintenance.enabled && !pathname.startsWith("/admin")) {
    return <MaintenanceScreen settings={settings.maintenance} />;
  }

  return <>{children}</>;
}

function MaintenanceScreen({ settings }: { settings: Settings["maintenance"] }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  let desc = settings.description;
  const currentTimeStr = now.toLocaleTimeString();
  
  let countdownStr = "";
  if (settings.countdownEnabled && settings.countdownTarget) {
    const target = new Date(settings.countdownTarget);
    const diff = target.getTime() - now.getTime();
    if (diff > 0) {
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      countdownStr = `${d}d ${h}h ${m}m ${s}s`;
    } else {
      countdownStr = "0d 0h 0m 0s";
    }
  }

  // Replace variables
  desc = desc.replace(/{current_time}/g, currentTimeStr);
  desc = desc.replace(/{countdown_time}/g, countdownStr);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fafafa", padding: 24 }}>
      <div style={{ background: "#fff", padding: "40px 32px", borderRadius: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.08)", maxWidth: 500, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1A1A2E", marginBottom: 16 }}>{settings.title}</h1>
        
        <div 
          style={{ fontSize: 16, color: "#4A4A68", lineHeight: 1.6, marginBottom: 24 }}
          dangerouslySetInnerHTML={{ __html: desc }}
        />

        {settings.note && (
          <div style={{ background: "#FFF0F5", borderLeft: "4px solid #E91E8C", padding: 16, borderRadius: "0 8px 8px 0", textAlign: "left", color: "#E91E8C", fontSize: 14, fontWeight: 500 }}>
            <span style={{ fontWeight: 800, display: "block", marginBottom: 4 }}>Note:</span>
            {settings.note}
          </div>
        )}

        {settings.countdownEnabled && settings.countdownTarget && (
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Estimated Time Remaining</div>
            <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "monospace", color: "#E91E8C", background: "#fff", padding: "12px 24px", borderRadius: 12, border: "2px dashed #E91E8C", display: "inline-block" }}>
              {countdownStr}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
