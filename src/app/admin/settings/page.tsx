"use client";
import { useState, useEffect, useRef } from "react";
import { getSettingsDB, saveSettingsDB, Settings } from "@/lib/db";

const PREDEFINED_TEMPLATES = {
  maintenance: {
    title: "Under Maintenance",
    description: "We are currently upgrading our platform. Please check back later. <br/><br/> Current Time: <b>{current_time}</b>",
    note: "We apologize for the inconvenience.",
    countdownEnabled: true,
  },
  serverDown: {
    title: "Server Down",
    description: "Our servers are experiencing unexpected issues. Our engineers are working hard to resolve it. <br/> Status Update: <i>{current_time}</i>",
    note: "Rest assured, no data has been lost.",
    countdownEnabled: false,
  },
  error404: {
    title: "Error 404 - Not Found",
    description: "The page you are looking for does not exist or has been moved.",
    note: "",
    countdownEnabled: false,
  },
  closed: {
    title: "Website Closed Permanently",
    description: "We have permanently closed down our services. Thank you for your support over the years.",
    note: "For refunds, please contact support@example.com",
    countdownEnabled: false,
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    maintenance: { enabled: false, title: "", description: "", note: "", countdownEnabled: false, countdownTarget: "" },
    marquees: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [draggedMarqueeIndex, setDraggedMarqueeIndex] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getSettingsDB().then(s => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleChange = (field: string, value: any) => {
    setSettings(s => ({
      ...s,
      maintenance: { ...s.maintenance, [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await saveSettingsDB(settings);
    setTimeout(() => setSaving(false), 500);
  };

  const applyTemplate = (key: keyof typeof PREDEFINED_TEMPLATES) => {
    const t = PREDEFINED_TEMPLATES[key];
    setSettings(s => ({
      ...s,
      maintenance: { ...s.maintenance, ...t }
    }));
  };

  const insertTextAtCursor = (text: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;
    const newVal = val.slice(0, start) + text + val.slice(end);
    handleChange("description", newVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const insertHTMLTag = (tag: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;
    const selectedText = val.slice(start, end);
    const newText = `<${tag}>${selectedText}</${tag}>`;
    const newVal = val.slice(0, start) + newText + val.slice(end);
    handleChange("description", newVal);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, text: string) => {
    e.dataTransfer.setData("text/plain", text);
  };

  const addMarquee = () => {
    setSettings(s => ({
      ...s,
      marquees: [...(s.marquees || []), { id: `mq_${Date.now()}`, text: "New Announcement", color: "#1F2937", order: s.marquees?.length || 0 }]
    }));
  };

  const updateMarquee = (index: number, field: string, value: any) => {
    setSettings(s => {
      const newMqs = [...(s.marquees || [])];
      newMqs[index] = { ...newMqs[index], [field]: value };
      return { ...s, marquees: newMqs };
    });
  };

  const deleteMarquee = (index: number) => {
    setSettings(s => {
      const newMqs = [...(s.marquees || [])];
      newMqs.splice(index, 1);
      return { ...s, marquees: newMqs };
    });
  };

  const handleMarqueeDragStart = (index: number) => {
    setDraggedMarqueeIndex(index);
  };

  const handleMarqueeDrop = (dropIndex: number) => {
    if (draggedMarqueeIndex === null || draggedMarqueeIndex === dropIndex) return;
    setSettings(s => {
      const newMqs = [...(s.marquees || [])];
      const [draggedItem] = newMqs.splice(draggedMarqueeIndex, 1);
      newMqs.splice(dropIndex, 0, draggedItem);
      // Update orders
      newMqs.forEach((mq, idx) => mq.order = idx);
      return { ...s, marquees: newMqs };
    });
    setDraggedMarqueeIndex(null);
  };

  if (loading) return <div style={{ padding: 32 }}>Loading settings...</div>;

  const m = settings.maintenance;
  const mqs = settings.marquees || [];

  return (
    <div style={{ padding: "32px 48px", maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", letterSpacing: -0.5 }}>Platform Settings</h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>Manage site-wide configuration and maintenance</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ background: "#0F172A", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div style={{ background: "#fff", padding: 32, borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        
        {/* Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #F1F5F9" }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>Maintenance Mode</h2>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>When active, all visitors will see the maintenance screen instead of the public storefront.</p>
          </div>
          <label style={{ position: "relative", display: "inline-block", width: 50, height: 28 }}>
            <input type="checkbox" checked={m.enabled} onChange={e => handleChange("enabled", e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, background: m.enabled ? "#10B981" : "#CBD5E1", transition: "0.4s", borderRadius: 34 }}>
              <span style={{ position: "absolute", content: "''", height: 20, width: 20, left: 4, bottom: 4, background: "white", transition: "0.4s", borderRadius: "50%", transform: m.enabled ? "translateX(22px)" : "none" }}></span>
            </span>
          </label>
        </div>

        {/* Templates */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8, display: "block" }}>Quick Templates</label>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => applyTemplate("maintenance")} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontSize: 13 }}>Maintenance</button>
            <button onClick={() => applyTemplate("serverDown")} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontSize: 13 }}>Server Down</button>
            <button onClick={() => applyTemplate("error404")} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontSize: 13 }}>Error 404</button>
            <button onClick={() => applyTemplate("closed")} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontSize: 13 }}>Closed</button>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8, display: "block" }}>Page Title</label>
          <input type="text" value={m.title} onChange={e => handleChange("title", e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", outline: "none", fontSize: 14 }} />
        </div>

        {/* Description Editor */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8, display: "block" }}>Description (Supports HTML & Variables)</label>
          
          <div style={{ display: "flex", gap: 8, marginBottom: 8, padding: 8, background: "#F1F5F9", borderRadius: 8 }}>
            <button onClick={() => insertHTMLTag("b")} style={{ fontWeight: "bold", padding: "4px 8px", cursor: "pointer", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4 }}>B</button>
            <button onClick={() => insertHTMLTag("i")} style={{ fontStyle: "italic", padding: "4px 8px", cursor: "pointer", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4 }}>I</button>
            <div style={{ width: 1, background: "#CBD5E1", margin: "0 4px" }} />
            <div style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", marginRight: 4 }}>Drag & Drop Variables:</div>
            
            <div draggable onDragStart={e => handleDragStart(e, "{current_time}")} onClick={() => insertTextAtCursor("{current_time}")} style={{ padding: "4px 8px", background: "#DBEAFE", color: "#1D4ED8", fontSize: 12, borderRadius: 4, cursor: "grab", fontFamily: "monospace" }}>{"{current_time}"}</div>
            <div draggable onDragStart={e => handleDragStart(e, "{countdown_time}")} onClick={() => insertTextAtCursor("{countdown_time}")} style={{ padding: "4px 8px", background: "#FCE7F3", color: "#BE185D", fontSize: 12, borderRadius: 4, cursor: "grab", fontFamily: "monospace" }}>{"{countdown_time}"}</div>
          </div>

          <textarea 
            ref={textareaRef}
            value={m.description} 
            onChange={e => handleChange("description", e.target.value)} 
            style={{ width: "100%", padding: "14px", borderRadius: 8, border: "1px solid #CBD5E1", outline: "none", fontSize: 14, minHeight: 120, fontFamily: "monospace" }} 
          />
        </div>

        {/* Note */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8, display: "block" }}>Highlight Note (Optional)</label>
          <input type="text" value={m.note} onChange={e => handleChange("note", e.target.value)} placeholder="e.g. We apologize for the inconvenience." style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", outline: "none", fontSize: 14 }} />
        </div>

        {/* Countdown */}
        <div style={{ background: "#F8FAFC", padding: 20, borderRadius: 12, border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>Enable Countdown Timer</label>
            <input type="checkbox" checked={m.countdownEnabled} onChange={e => handleChange("countdownEnabled", e.target.checked)} style={{ width: 16, height: 16 }} />
          </div>
          
          {m.countdownEnabled && (
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8, display: "block" }}>Target Date & Time</label>
              <input type="datetime-local" value={m.countdownTarget} onChange={e => handleChange("countdownTarget", e.target.value)} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #CBD5E1", outline: "none" }} />
              <p style={{ fontSize: 12, color: "#64748B", marginTop: 8 }}>Use <code style={{ background: "#E2E8F0", padding: "2px 4px", borderRadius: 4 }}>{"{countdown_time}"}</code> in the description to show the remaining time.</p>
            </div>
          )}
        </div>

      </div>

      <div style={{ background: "#fff", padding: 32, borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #F1F5F9" }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>Top Announcement Bar (Marquees)</h2>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Configure sliding text banners at the top of your site.</p>
          </div>
          <button onClick={addMarquee} style={{ background: "#10B981", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>+ Add Marquee</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mqs.map((mq, index) => (
            <div 
              key={mq.id}
              draggable
              onDragStart={() => handleMarqueeDragStart(index)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleMarqueeDrop(index)}
              style={{
                display: "flex", alignItems: "center", gap: 16, padding: "16px", background: "#F8FAFC", 
                borderRadius: 12, border: "1px solid #E2E8F0",
                opacity: draggedMarqueeIndex === index ? 0.5 : 1,
                cursor: "grab"
              }}
            >
              <div style={{ fontSize: 20, color: "#CBD5E1" }}>☰</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <input 
                  type="text" 
                  value={mq.text} 
                  onChange={e => updateMarquee(index, "text", e.target.value)}
                  placeholder="Enter announcement (HTML tags like <b> supported)"
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Text Color:</label>
                <input type="color" value={mq.color} onChange={e => updateMarquee(index, "color", e.target.value)} style={{ width: 32, height: 32, border: "none", padding: 0, cursor: "pointer", background: "transparent" }} />
              </div>
              <button onClick={() => deleteMarquee(index)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", padding: "8px 12px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Delete</button>
            </div>
          ))}
          {mqs.length === 0 && <p style={{ fontSize: 14, color: "#64748B", textAlign: "center", padding: "24px 0" }}>No announcements added.</p>}
        </div>
      </div>
      <div style={{ background: "#fff", padding: 32, borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginTop: 24 }}>
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #F1F5F9" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>Branding Settings</h2>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Configure your website's favicon and logo.</p>
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8, display: "block" }}>Favicon (Website Icon)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, border: "1px solid #CBD5E1", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
              {settings.faviconUrl ? (
                <img src={settings.faviconUrl} alt="Favicon" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: 20, color: "#94A3B8" }}>🌍</span>
              )}
            </div>
            <label style={{ background: "#10B981", color: "#fff", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
              Upload New Favicon
              <input type="file" accept="image/png, image/x-icon, image/svg+xml, image/gif" style={{ display: "none" }} onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                // For favicons, to perfectly preserve transparency and bypass ImgBB compression,
                // we convert it to a Base64 Data URL and store it directly.
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64String = reader.result as string;
                  setSettings(s => ({ ...s, faviconUrl: base64String }));
                };
                reader.readAsDataURL(file);
              }} />
            </label>
            {settings.faviconUrl && (
              <button onClick={() => setSettings(s => ({ ...s, faviconUrl: "" }))} style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5", padding: "7px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                Remove
              </button>
            )}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8, display: "block" }}>Header Logo (Main Colored Logo)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 120, height: 48, borderRadius: 8, border: "1px solid #CBD5E1", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", padding: 4 }}>
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Header Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: 11, color: "#94A3B8" }}>Default /logo.png</span>
              )}
            </div>
            <label style={{ background: "#10B981", color: "#fff", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
              Upload Header Logo
              <input type="file" accept="image/png, image/jpeg, image/svg+xml, image/gif, image/webp" style={{ display: "none" }} onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64String = reader.result as string;
                  setSettings(s => ({ ...s, logoUrl: base64String }));
                };
                reader.readAsDataURL(file);
              }} />
            </label>
            {settings.logoUrl && (
              <button onClick={() => setSettings(s => ({ ...s, logoUrl: "" }))} style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5", padding: "7px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                Remove
              </button>
            )}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8, display: "block" }}>Footer Logo (White Logo for Dark Backgrounds)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 120, height: 48, borderRadius: 8, border: "1px solid #CBD5E1", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A", padding: 4 }}>
              {settings.whiteLogoUrl ? (
                <img src={settings.whiteLogoUrl} alt="Footer Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: 11, color: "#475569" }}>Default (White overlay)</span>
              )}
            </div>
            <label style={{ background: "#10B981", color: "#fff", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
              Upload Footer Logo
              <input type="file" accept="image/png, image/jpeg, image/svg+xml, image/gif, image/webp" style={{ display: "none" }} onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64String = reader.result as string;
                  setSettings(s => ({ ...s, whiteLogoUrl: base64String }));
                };
                reader.readAsDataURL(file);
              }} />
            </label>
            {settings.whiteLogoUrl && (
              <button onClick={() => setSettings(s => ({ ...s, whiteLogoUrl: "" }))} style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5", padding: "7px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                Remove
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8, display: "block" }}>Business Name</label>
          <input type="text" value={settings.businessName || ""} onChange={e => setSettings(s => ({ ...s, businessName: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", outline: "none", fontSize: 14 }} placeholder="e.g. Aradhya E-Gifts" />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8, display: "block" }}>Business Entity Name</label>
          <input type="text" value={settings.businessEntity || ""} onChange={e => setSettings(s => ({ ...s, businessEntity: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", outline: "none", fontSize: 14 }} placeholder="e.g. AS-Studios" />
        </div>
      </div>

      <div style={{ background: "#fff", padding: 32, borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginTop: 24 }}>
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #F1F5F9" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>Contact & Email Settings</h2>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Configure your public contact details and email notifications.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Contact Email</label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B", cursor: "pointer" }}>
                <input type="checkbox" checked={settings.showContactEmail ?? true} onChange={e => setSettings(s => ({ ...s, showContactEmail: e.target.checked }))} /> Show in Footer
              </label>
            </div>
            <input type="email" value={settings.contactEmail || ""} onChange={e => setSettings(s => ({ ...s, contactEmail: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", outline: "none", fontSize: 14, opacity: (settings.showContactEmail ?? true) ? 1 : 0.6 }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Contact Number</label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B", cursor: "pointer" }}>
                <input type="checkbox" checked={settings.showContactPhone ?? true} onChange={e => setSettings(s => ({ ...s, showContactPhone: e.target.checked }))} /> Show in Footer
              </label>
            </div>
            <input type="text" value={settings.contactPhone || ""} onChange={e => setSettings(s => ({ ...s, contactPhone: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", outline: "none", fontSize: 14, opacity: (settings.showContactPhone ?? true) ? 1 : 0.6 }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Address / Main Site</label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B", cursor: "pointer" }}>
                <input type="checkbox" checked={settings.showContactAddress ?? true} onChange={e => setSettings(s => ({ ...s, showContactAddress: e.target.checked }))} /> Show in Footer
              </label>
            </div>
            <input type="text" value={settings.contactAddress || ""} onChange={e => setSettings(s => ({ ...s, contactAddress: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", outline: "none", fontSize: 14, opacity: (settings.showContactAddress ?? true) ? 1 : 0.6 }} />
          </div>
          
          <div style={{ background: "#F8FAFC", padding: 20, borderRadius: 12, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>Buy Notification Email</label>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Send an email when a user makes a purchase.</p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: 50, height: 28 }}>
                <input type="checkbox" checked={settings.emailServiceBuy ?? true} onChange={e => setSettings(s => ({ ...s, emailServiceBuy: e.target.checked }))} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, background: (settings.emailServiceBuy ?? true) ? "#10B981" : "#CBD5E1", transition: "0.4s", borderRadius: 34 }}>
                  <span style={{ position: "absolute", content: "''", height: 20, width: 20, left: 4, bottom: 4, background: "white", transition: "0.4s", borderRadius: "50%", transform: (settings.emailServiceBuy ?? true) ? "translateX(22px)" : "none" }}></span>
                </span>
              </label>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>Finalize Notification Email</label>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Send an email when a user finalizes their customization.</p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: 50, height: 28 }}>
                <input type="checkbox" checked={settings.emailServiceFinalize ?? true} onChange={e => setSettings(s => ({ ...s, emailServiceFinalize: e.target.checked }))} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, background: (settings.emailServiceFinalize ?? true) ? "#10B981" : "#CBD5E1", transition: "0.4s", borderRadius: 34 }}>
                  <span style={{ position: "absolute", content: "''", height: 20, width: 20, left: 4, bottom: 4, background: "white", transition: "0.4s", borderRadius: "50%", transform: (settings.emailServiceFinalize ?? true) ? "translateX(22px)" : "none" }}></span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", padding: 32, borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginTop: 24 }}>
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #F1F5F9" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>Social Media</h2>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Configure your social media handles. They appear as icon buttons in the site footer.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Instagram */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </span>
                Instagram
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B", cursor: "pointer" }}>
                <input type="checkbox" checked={settings.showInstagram ?? true} onChange={e => setSettings(s => ({ ...s, showInstagram: e.target.checked }))} /> Show in Footer
              </label>
            </div>
            <input type="url" placeholder="https://instagram.com/yourusername" value={settings.instagramUrl || ""} onChange={e => setSettings(s => ({ ...s, instagramUrl: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", outline: "none", fontSize: 14, opacity: (settings.showInstagram ?? true) ? 1 : 0.6 }} />
          </div>

          {/* YouTube */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#FF0000", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#FF0000"/></svg>
                </span>
                YouTube
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B", cursor: "pointer" }}>
                <input type="checkbox" checked={settings.showYoutube ?? true} onChange={e => setSettings(s => ({ ...s, showYoutube: e.target.checked }))} /> Show in Footer
              </label>
            </div>
            <input type="url" placeholder="https://youtube.com/@yourchannel" value={settings.youtubeUrl || ""} onChange={e => setSettings(s => ({ ...s, youtubeUrl: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", outline: "none", fontSize: 14, opacity: (settings.showYoutube ?? true) ? 1 : 0.6 }} />
          </div>

          {/* LinkedIn */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#0A66C2", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </span>
                LinkedIn
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B", cursor: "pointer" }}>
                <input type="checkbox" checked={settings.showLinkedin ?? true} onChange={e => setSettings(s => ({ ...s, showLinkedin: e.target.checked }))} /> Show in Footer
              </label>
            </div>
            <input type="url" placeholder="https://linkedin.com/company/yourcompany" value={settings.linkedinUrl || ""} onChange={e => setSettings(s => ({ ...s, linkedinUrl: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", outline: "none", fontSize: 14, opacity: (settings.showLinkedin ?? true) ? 1 : 0.6 }} />
          </div>

          {/* Facebook */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#1877F2", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </span>
                Facebook
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B", cursor: "pointer" }}>
                <input type="checkbox" checked={settings.showFacebook ?? true} onChange={e => setSettings(s => ({ ...s, showFacebook: e.target.checked }))} /> Show in Footer
              </label>
            </div>
            <input type="url" placeholder="https://facebook.com/yourpage" value={settings.facebookUrl || ""} onChange={e => setSettings(s => ({ ...s, facebookUrl: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", outline: "none", fontSize: 14, opacity: (settings.showFacebook ?? true) ? 1 : 0.6 }} />
          </div>

        </div>
      </div>
    </div>
  );
}
