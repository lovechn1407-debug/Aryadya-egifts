"use client";
import { useState, useEffect, useRef } from "react";
import { getSettingsDB, saveSettingsDB, Settings, PopupData, getProductsDB } from "@/lib/db";
import type { Product } from "@/lib/data";

const IMGBB_KEY = "83e3f88941efd1059a89f016ff302d9e";

export default function PopupsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingPopup, setEditingPopup] = useState<PopupData | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    Promise.all([getSettingsDB(), getProductsDB()]).then(([s, p]) => {
      setSettings(s);
      setProducts(p);
      setLoading(false);
    });
  }, []);

  const handleSaveAll = async () => {
    if (!settings) return;
    setSaving(true);
    await saveSettingsDB(settings);
    setTimeout(() => setSaving(false), 500);
  };

  const addPopup = () => {
    if (!settings) return;
    const newPopup: PopupData = {
      id: `popup_${Date.now()}`,
      enabled: false,
      order: settings.popups ? settings.popups.length : 0,
      contentHtml: "<h2>Welcome!</h2><p>This is a new popup.</p>",
      frequency: "always"
    };
    setSettings(s => s ? { ...s, popups: [...(s.popups || []), newPopup] } : s);
  };

  const deletePopup = (index: number) => {
    if (!settings || !settings.popups) return;
    if (!confirm("Delete this popup?")) return;
    setSettings(s => {
      if (!s || !s.popups) return s;
      const newP = [...s.popups];
      newP.splice(index, 1);
      return { ...s, popups: newP };
    });
  };

  const toggleEnable = (index: number) => {
    if (!settings || !settings.popups) return;
    setSettings(s => {
      if (!s || !s.popups) return s;
      const newP = [...s.popups];
      newP[index].enabled = !newP[index].enabled;
      return { ...s, popups: newP };
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex || !settings || !settings.popups) return;
    setSettings(s => {
      if (!s || !s.popups) return s;
      const newP = [...s.popups];
      const [draggedItem] = newP.splice(draggedIndex, 1);
      newP.splice(dropIndex, 0, draggedItem);
      newP.forEach((p, idx) => p.order = idx);
      return { ...s, popups: newP };
    });
    setDraggedIndex(null);
  };

  // ── Editor Functions ──
  const openEditor = (popup: PopupData, index: number) => {
    setEditingPopup({ ...popup, linkedProductIds: popup.linkedProductIds || [] });
    setEditIndex(index);
  };

  const closeEditor = () => {
    setEditingPopup(null);
    setEditIndex(null);
  };

  const saveEditor = () => {
    if (!editingPopup || editIndex === null || !settings) return;
    setSettings(s => {
      if (!s) return s;
      const newP = [...(s.popups || [])];
      newP[editIndex] = editingPopup;
      return { ...s, popups: newP };
    });
    closeEditor();
  };

  const updateEditField = (field: keyof PopupData, value: any) => {
    setEditingPopup(p => p ? { ...p, [field]: value } : p);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) {
        updateEditField("imageUrl", json.data.url);
      } else {
        alert("Upload failed: " + (json.error?.message || "Unknown error"));
      }
    } catch (err) {
      alert("Error uploading image");
    }
    setUploadingImg(false);
  };

  const toggleProductLink = (pid: string) => {
    setEditingPopup(p => {
      if (!p) return p;
      const arr = p.linkedProductIds || [];
      if (arr.includes(pid)) return { ...p, linkedProductIds: arr.filter(x => x !== pid) };
      return { ...p, linkedProductIds: [...arr, pid] };
    });
  };

  const insertTag = (tag: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;
    const selectedText = val.slice(start, end);
    const newText = `<${tag}>${selectedText}</${tag}>`;
    const newVal = val.slice(0, start) + newText + val.slice(end);
    updateEditField("contentHtml", newVal);
  };

  const insertVar = (text: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;
    const newVal = val.slice(0, start) + text + val.slice(end);
    updateEditField("contentHtml", newVal);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + text.length, start + text.length); }, 0);
  };

  if (loading) return <div style={{ padding: 32 }}>Loading popups...</div>;

  const popups = settings?.popups || [];

  return (
    <div style={{ padding: "32px 48px", maxWidth: 1000 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", letterSpacing: -0.5 }}>Homepage Popups</h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>Manage and schedule promotional or informational popups.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={addPopup} style={{ background: "#F1F5F9", color: "#0F172A", border: "1px solid #CBD5E1", padding: "10px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>+ Add Popup</button>
          <button onClick={handleSaveAll} disabled={saving} style={{ background: "#0F172A", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        {popups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#94A3B8" }}>
            No popups found. Click "Add Popup" to create one.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {popups.map((popup, index) => (
              <div 
                key={popup.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "16px", background: popup.enabled ? "#F8FAFC" : "#F1F5F9", 
                  borderRadius: 12, border: "1px solid #E2E8F0",
                  opacity: draggedIndex === index ? 0.5 : (popup.enabled ? 1 : 0.6),
                  cursor: "grab"
                }}
              >
                <div style={{ fontSize: 20, color: "#CBD5E1" }}>☰</div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1E293B" }}>Popup #{index + 1} ({popup.frequency.replace(/_/g, " ")})</div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 400 }}>
                    {popup.contentHtml.replace(/<[^>]+>/g, '') || "No text content"}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: popup.enabled ? "#10B981" : "#64748B", cursor: "pointer" }}>
                    <input type="checkbox" checked={popup.enabled} onChange={() => toggleEnable(index)} />
                    {popup.enabled ? "Active" : "Disabled"}
                  </label>
                  <div style={{ width: 1, height: 24, background: "#E2E8F0" }} />
                  <button onClick={() => openEditor(popup, index)} style={{ background: "#DBEAFE", color: "#1D4ED8", border: "none", padding: "6px 12px", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Edit</button>
                  <button onClick={() => deletePopup(index)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", padding: "6px 12px", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {editingPopup && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 800, maxHeight: "90vh", overflow: "auto", borderRadius: 16, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" }}>
            
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: 0 }}>Edit Popup Settings</h2>
              <button onClick={closeEditor} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#94A3B8" }}>&times;</button>
            </div>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Display Rules */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8, display: "block" }}>Display Frequency</label>
                  <select 
                    value={editingPopup.frequency} 
                    onChange={e => updateEditField("frequency", e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14 }}
                  >
                    <option value="always">Every Reload (Always show)</option>
                    <option value="once_a_day">Once a Day</option>
                    <option value="dont_show_again">Show until "Don't show again" is checked</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8, display: "block" }}>Auto Close Timer (Seconds)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 10 (Leave empty to disable)"
                    value={editingPopup.autoCloseSeconds || ""} 
                    onChange={e => updateEditField("autoCloseSeconds", e.target.value ? parseInt(e.target.value) : undefined)}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14 }}
                  />
                </div>
              </div>

              {/* Countdown settings */}
              <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <input type="checkbox" checked={editingPopup.showCountdown || false} onChange={e => updateEditField("showCountdown", e.target.checked)} id="cd_toggle" />
                  <label htmlFor="cd_toggle" style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>Enable Countdown Timer</label>
                </div>
                {editingPopup.showCountdown && (
                  <div>
                    <label style={{ fontSize: 12, color: "#64748B", marginBottom: 4, display: "block" }}>Countdown Target Date & Time</label>
                    <input type="datetime-local" value={editingPopup.countdownTarget || ""} onChange={e => updateEditField("countdownTarget", e.target.value)} style={{ padding: "8px", borderRadius: 6, border: "1px solid #CBD5E1" }} />
                    <p style={{ fontSize: 12, color: "#64748B", marginTop: 4, margin: 0 }}>Use <code style={{background:"#E2E8F0", padding:"2px 4px", borderRadius: 4}}>{"{countdown_time}"}</code> in the text below to display it.</p>
                  </div>
                )}
              </div>

              {/* Content Editor */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8, display: "block" }}>Popup Content (HTML & Variables)</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, padding: 8, background: "#F1F5F9", borderRadius: 8, flexWrap: "wrap" }}>
                  <button onClick={() => insertTag("b")} style={{ fontWeight: "bold", padding: "4px 8px", cursor: "pointer", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4 }}>B</button>
                  <button onClick={() => insertTag("i")} style={{ fontStyle: "italic", padding: "4px 8px", cursor: "pointer", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4 }}>I</button>
                  <button onClick={() => insertTag("h2")} style={{ fontWeight: "bold", padding: "4px 8px", cursor: "pointer", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4 }}>H2</button>
                  <button onClick={() => insertTag("p")} style={{ padding: "4px 8px", cursor: "pointer", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4 }}>P</button>
                  <div style={{ width: 1, background: "#CBD5E1", margin: "0 4px" }} />
                  <div style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center" }}>Insert:</div>
                  <button onClick={() => insertVar("{countdown_time}")} style={{ padding: "4px 8px", background: "#FCE7F3", color: "#BE185D", fontSize: 12, borderRadius: 4, cursor: "pointer", border: "none" }}>{"{countdown_time}"}</button>
                  <button onClick={() => insertVar("{current_date}")} style={{ padding: "4px 8px", background: "#DBEAFE", color: "#1D4ED8", fontSize: 12, borderRadius: 4, cursor: "pointer", border: "none" }}>{"{current_date}"}</button>
                  <button onClick={() => insertVar("{current_day}")} style={{ padding: "4px 8px", background: "#FEF3C7", color: "#B45309", fontSize: 12, borderRadius: 4, cursor: "pointer", border: "none" }}>{"{current_day}"}</button>
                </div>
                <textarea 
                  ref={textareaRef}
                  value={editingPopup.contentHtml} 
                  onChange={e => updateEditField("contentHtml", e.target.value)} 
                  style={{ width: "100%", padding: "14px", borderRadius: 8, border: "1px solid #CBD5E1", outline: "none", fontSize: 14, minHeight: 160, fontFamily: "monospace" }} 
                />
              </div>

              {/* Image & Products Layout */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {/* Image Upload */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8, display: "block" }}>Popup Hero Image</label>
                  <div style={{ border: "2px dashed #CBD5E1", borderRadius: 12, padding: 16, textAlign: "center", background: "#F8FAFC" }}>
                    {editingPopup.imageUrl ? (
                      <div style={{ position: "relative" }}>
                        <img src={editingPopup.imageUrl} alt="Popup Hero" style={{ width: "100%", maxHeight: 150, objectFit: "cover", borderRadius: 8 }} />
                        <button onClick={() => updateEditField("imageUrl", undefined)} style={{ position: "absolute", top: 8, right: 8, background: "#FEF2F2", color: "#DC2626", border: "none", padding: "4px 8px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>Remove</button>
                      </div>
                    ) : (
                      <div style={{ padding: "20px 0" }}>
                        <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 12px" }}>No image added.</p>
                        <label style={{ background: "#0F172A", color: "#fff", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                          {uploadingImg ? "Uploading..." : "Upload Image"}
                          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} disabled={uploadingImg} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Showcase */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8, display: "block" }}>Showcase Products</label>
                  <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, maxHeight: 200, overflow: "auto", padding: 8, background: "#F8FAFC" }}>
                    {products.map(p => {
                      const selected = (editingPopup.linkedProductIds || []).includes(p.id);
                      return (
                        <div key={p.id} onClick={() => toggleProductLink(p.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 6, cursor: "pointer", background: selected ? "#DBEAFE" : "transparent" }}>
                          <input type="checkbox" checked={selected} readOnly style={{ pointerEvents: "none" }} />
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 4, background: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                              {p.thumbnail?.length < 5 ? p.thumbnail : "🎁"}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{p.name}</div>
                              <div style={{ fontSize: 11, color: "#64748B" }}>₹{p.price / 100}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
            
            <div style={{ padding: "16px 24px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end", gap: 12, background: "#F8FAFC", borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
              <button onClick={closeEditor} style={{ background: "#fff", color: "#475569", border: "1px solid #CBD5E1", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={saveEditor} style={{ background: "#10B981", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Save & Close</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
