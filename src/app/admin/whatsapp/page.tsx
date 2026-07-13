"use client";
import { useState, useEffect, useRef } from "react";
import { getSettingsDB, saveSettingsDB, Settings } from "@/lib/db";

export default function WhatsAppSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    maintenance: { enabled: false, title: "", description: "", note: "", countdownEnabled: false, countdownTarget: "" },
    whatsappBotUrl: "",
    whatsappBotSecret: "",
    whatsappOtpEnabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [botStatus, setBotStatus] = useState<"connected" | "qr_pending" | "disconnected" | "offline" | "unconfigured">("unconfigured");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load settings on mount
  useEffect(() => {
    getSettingsDB().then(s => {
      setSettings(s);
      setLoading(false);
      checkBotStatus(s);
    });

    return () => {
      stopPolling();
    };
  }, []);

  const checkBotStatus = async (currentSettings: Settings) => {
    const botUrl = currentSettings.whatsappBotUrl;
    const botSecret = currentSettings.whatsappBotSecret;

    if (!botUrl || !botSecret) {
      setBotStatus("unconfigured");
      setStatusMessage("WhatsApp Bot credentials are not configured yet.");
      stopPolling();
      return;
    }

    try {
      const res = await fetch("/api/wa/status");
      if (!res.ok) {
        setBotStatus("offline");
        setStatusMessage("Could not contact the WhatsApp API proxy route.");
        stopPolling();
        return;
      }

      const data = await res.json();
      setBotStatus(data.status || "offline");

      if (data.status === "qr_pending") {
        setStatusMessage("Scan the QR code below to connect your WhatsApp.");
        fetchQrCode();
        startPolling();
      } else if (data.status === "connected") {
        setStatusMessage("WhatsApp client is connected and ready to send OTPs!");
        setQrCode(null);
        stopPolling();
      } else {
        setStatusMessage("WhatsApp client is disconnected. Try restarting the service or checking logs.");
        setQrCode(null);
        startPolling(); // poll to check if status changes to ready or generates QR
      }
    } catch (e) {
      console.error(e);
      setBotStatus("offline");
      setStatusMessage("WhatsApp Bot appears to be offline. Make sure the Render URL is correct.");
      stopPolling();
    }
  };

  const fetchQrCode = async () => {
    setLoadingQr(true);
    try {
      const res = await fetch("/api/wa/qr");
      if (res.ok) {
        const data = await res.json();
        if (data.qrCode) {
          setQrCode(data.qrCode);
        } else {
          setQrCode(null);
        }
      }
    } catch (err) {
      console.error("Error fetching QR:", err);
    } finally {
      setLoadingQr(false);
    }
  };

  // Poll status while scanning or disconnected
  const startPolling = () => {
    if (pollIntervalRef.current) return;
    pollIntervalRef.current = setInterval(() => {
      getSettingsDB().then(s => checkBotStatus(s));
    }, 8000); // Check status every 8 seconds
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const handleToggle = async (checked: boolean) => {
    const updated = { ...settings, whatsappOtpEnabled: checked };
    setSettings(updated);
    setSaving(true);
    await saveSettingsDB(updated);
    setSaving(false);
  };

  const handleInputChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    await saveSettingsDB(settings);
    setSaving(false);
    // Re-check bot status with new config
    checkBotStatus(settings);
  };

  const getStatusBadge = () => {
    switch (botStatus) {
      case "connected":
        return <span style={{ background: "#D1FAE5", color: "#065F46", padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>Connected</span>;
      case "qr_pending":
        return <span style={{ background: "#FEF3C7", color: "#92400E", padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>Waiting for Scan</span>;
      case "disconnected":
        return <span style={{ background: "#FEE2E2", color: "#991B1B", padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>Disconnected</span>;
      case "offline":
        return <span style={{ background: "#F3F4F6", color: "#374151", padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>Offline / Sleep</span>;
      default:
        return <span style={{ background: "#F3F4F6", color: "#374151", padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>Unconfigured</span>;
    }
  };

  if (loading) {
    return <div style={{ color: "#64748B", fontSize: 14 }}>Loading configurations...</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", margin: 0 }}>WhatsApp OTP Config</h1>
          <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
            Link your WhatsApp account via QR Code and configure OTP delivery options.
          </p>
        </div>
        <div>
          {getStatusBadge()}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Status Card & QR Code display */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", margin: "0 0 16px 0" }}>Connection Status</h3>
          <p style={{ fontSize: 14, color: "#475569", margin: "0 0 20px 0", lineHeight: 1.5 }}>
            {statusMessage}
          </p>

          {botStatus === "qr_pending" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "24px 0", borderTop: "1px solid #F1F5F9" }}>
              {loadingQr ? (
                <div style={{ height: 256, width: 256, display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", borderRadius: 12, border: "1px dashed #E2E8F0", color: "#64748B", fontSize: 14 }}>
                  Fetching live QR code...
                </div>
              ) : qrCode ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <div style={{ padding: 16, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
                    <img src={qrCode} alt="WhatsApp QR Code" style={{ width: 256, height: 256, display: "block" }} />
                  </div>
                  <button onClick={fetchQrCode} style={{ background: "#fff", border: "1px solid #CBD5E1", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                    🔄 Refresh QR Code
                  </button>
                  <p style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", maxWidth: 360 }}>
                    Open WhatsApp on your phone → Settings / Menu → Linked Devices → Link a Device. Scan the image above.
                  </p>
                </div>
              ) : (
                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 14 }}>
                  QR code expired. Refreshing...
                </div>
              )}
            </div>
          )}

          {botStatus === "connected" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 0", gap: 12, borderTop: "1px solid #F1F5F9" }}>
              <div style={{ fontSize: 48 }}>✅</div>
              <h4 style={{ fontSize: 18, fontWeight: 700, color: "#065F46", margin: 0 }}>Device Linked</h4>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0, textAlign: "center" }}>
                Ready to deliver interactive verification messages to users.
              </p>
            </div>
          )}
        </div>

        {/* Configurations */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", margin: "0 0 20px 0" }}>WhatsApp API Settings</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "1px solid #F1F5F9" }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>Enable WhatsApp OTP</label>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                  Allow users to request login verification codes on WhatsApp instead of SMS.
                </p>
              </div>
              <div>
                <div style={{ position: "relative", display: "inline-block", width: 44, height: 24 }}>
                  <input 
                    type="checkbox" 
                    checked={settings.whatsappOtpEnabled ?? false} 
                    onChange={e => handleToggle(e.target.checked)} 
                    style={{ opacity: 0, width: 0, height: 0 }} 
                  />
                  <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, background: (settings.whatsappOtpEnabled ?? false) ? "#10B981" : "#CBD5E1", transition: "0.4s", borderRadius: 34 }}>
                    <span style={{ position: "absolute", content: "''", height: 16, width: 16, left: 4, bottom: 4, background: "white", transition: "0.4s", borderRadius: "50%", transform: (settings.whatsappOtpEnabled ?? false) ? "translateX(20px)" : "none" }}></span>
                  </span>
                </div>
              </div>
            </div>

            {/* Render Host URL */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
                WhatsApp Bot URL (Render endpoint)
              </label>
              <input 
                type="text" 
                value={settings.whatsappBotUrl || ""} 
                onChange={e => handleInputChange("whatsappBotUrl", e.target.value)} 
                placeholder="e.g. https://whatsapp-otp-bot.onrender.com"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #CBD5E1", borderRadius: 8, outline: "none", fontSize: 14 }}
              />
            </div>

            {/* Secret key */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
                API Bot Secret Key (Shared secret)
              </label>
              <input 
                type="password" 
                value={settings.whatsappBotSecret || ""} 
                onChange={e => handleInputChange("whatsappBotSecret", e.target.value)} 
                placeholder="Paste the shared BOT_SECRET"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #CBD5E1", borderRadius: 8, outline: "none", fontSize: 14 }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
              <button 
                onClick={() => checkBotStatus(settings)}
                style={{ background: "#fff", border: "1px solid #CBD5E1", color: "#334155", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                🔄 Refresh Connection
              </button>
              <button 
                onClick={handleSaveConfig}
                disabled={saving}
                style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1, boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }}
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
