"use client";
import { useState, useEffect } from "react";
import {
  SECTION_THEMES, SectionTheme, DisplaySection, Product,
} from "@/lib/data";
import {
  getSectionsDB, saveSectionDB, deleteSectionDB, updateSectionDB, getProductsDB,
} from "@/lib/db";

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<DisplaySection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create form state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [theme, setTheme] = useState<SectionTheme>("birthday");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [countdownEnabled, setCountdownEnabled] = useState(false);
  const [countdownEndTime, setCountdownEndTime] = useState("");

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const reload = async () => {
    const [secs, prods] = await Promise.all([getSectionsDB(), getProductsDB()]);
    setSections(secs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    setProducts(prods);
  };

  useEffect(() => { reload(); }, []);

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Please enter a section title");
      return;
    }
    setSaving(true);
    try {
      const themeConfig = SECTION_THEMES.find(t => t.id === theme);
      const newSection: DisplaySection = {
        id: `sec_${Date.now()}`,
        title: title.trim(),
        subtitle: subtitle.trim() || themeConfig?.tagline || "",
        theme,
        productIds: selectedProducts,
        visible: true,
        order: sections.length,
        countdownEnabled,
        countdownEndTime,
        createdAt: new Date().toISOString(),
      };
      await saveSectionDB(newSection);
      setTitle(""); setSubtitle(""); setTheme("birthday"); setSelectedProducts([]); setCountdownEnabled(false); setCountdownEndTime("");
      setShowCreate(false);
      await reload();
    } catch (err: any) {
      console.error(err);
      alert("Error creating section: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSectionProduct = async (sec: DisplaySection, prodId: string) => {
    const ids = sec.productIds.includes(prodId)
      ? sec.productIds.filter(p => p !== prodId)
      : [...sec.productIds, prodId];
    await saveSectionDB({ ...sec, productIds: ids });
    await reload();
  };

  const toggleVisibility = async (sec: DisplaySection) => {
    await saveSectionDB({ ...sec, visible: !sec.visible });
    await reload();
  };

  const handleDelete = async (sec: DisplaySection) => {
    if (!confirm(`Delete section "${sec.title}"?`)) return;
    await deleteSectionDB(sec.id);
    await reload();
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newSections = [...sections];
    const [draggedItem] = newSections.splice(draggedIndex, 1);
    newSections.splice(dropIndex, 0, draggedItem);

    setSections(newSections);
    
    await Promise.all(
      newSections.map((sec, idx) => updateSectionDB(sec.id, { order: idx }))
    );
    setDraggedIndex(null);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #CBD5E1", background: "#FFFFFF",
    color: "#0F172A", fontSize: 14, outline: "none", transition: "all 0.2s"
  };

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF", borderRadius: 12, border: "1px solid #E2E8F0",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)", padding: "20px 24px"
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: -0.5 }}>
            Sections Manager
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
            Organize homepage shelves and campaigns
          </p>
        </div>
        <button 
          onClick={() => { setShowCreate(!showCreate); if(showCreate) setTitle(""); }} 
          style={{ background: "#0F172A", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#1E293B"}
          onMouseLeave={e => e.currentTarget.style.background = "#0F172A"}
        >
          {showCreate ? "✕ Cancel" : "+ New Section"}
        </button>
      </div>

      {showCreate && (
        <div style={{ ...cardStyle, marginBottom: 24, border: "1px solid #CBD5E1" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#0F172A" }}>Create New Homepage Section</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Display Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Birthday Specials" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Subtitle (Optional)</label>
              <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="e.g. Make their day magical" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Visual Theme</label>
              <select value={theme} onChange={e => setTheme(e.target.value as SectionTheme)} style={inputStyle}>
                {SECTION_THEMES.map(t => (
                  <option key={t.id} value={t.id}>{t.label} ({t.id})</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155", padding: "10px 0" }}>
                <input type="checkbox" checked={countdownEnabled} onChange={e => setCountdownEnabled(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#0F172A" }} />
                Enable Countdown Timer
              </label>
            </div>
            
            {countdownEnabled && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Countdown End Time *</label>
                <input type="datetime-local" value={countdownEndTime} onChange={e => setCountdownEndTime(e.target.value)} style={inputStyle} />
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 8 }}>Select Products for this Section</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, background: "#F8FAFC", padding: 16, borderRadius: 8, border: "1px solid #E2E8F0" }}>
              {products.map(p => (
                <label key={p.id} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                  background: selectedProducts.includes(p.id) ? "#E0E7FF" : "#FFFFFF",
                  border: `1px solid ${selectedProducts.includes(p.id) ? "#A5B4FC" : "#CBD5E1"}`,
                  borderRadius: 8, cursor: "pointer", fontSize: 13, transition: "all 0.2s"
                }}>
                  <input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => toggleProduct(p.id)} style={{ display: "none" }} />
                  <span>{p.thumbnail}</span>
                  <span style={{ fontWeight: selectedProducts.includes(p.id) ? 600 : 500, color: "#0F172A" }}>{p.name}</span>
                </label>
              ))}
              {products.length === 0 && <span style={{ fontSize: 13, color: "#64748B" }}>No products available. Create some first!</span>}
            </div>
          </div>

          <button onClick={handleCreate} disabled={saving} style={{ background: saving ? "#94A3B8" : "#10B981", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            {saving ? "Creating..." : "Save Section"}
          </button>
        </div>
      )}

      {/* Sections List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sections.map((sec, index) => (
          <div
            key={sec.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            style={{
              ...cardStyle,
              cursor: "grab",
              display: "flex", alignItems: "flex-start", gap: 16,
              opacity: draggedIndex === index ? 0.5 : 1,
              background: sec.visible ? "#FFFFFF" : "#F8FAFC",
              transition: "transform 0.2s, opacity 0.2s"
            }}
          >
            <div style={{ fontSize: 20, color: "#CBD5E1", cursor: "grab", paddingTop: 4 }}>
              ☰
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>{sec.title}</h3>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: "#F1F5F9", color: "#475569" }}>
                  Theme: {sec.theme}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: sec.visible ? "#ECFDF5" : "#F1F5F9", color: sec.visible ? "#059669" : "#64748B" }}>
                  {sec.visible ? "🟢 Visible" : "⚫ Hidden"}
                </span>
                {sec.countdownEnabled && (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                    ⏱️ Timer ON
                  </span>
                )}
              </div>
              
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>{sec.subtitle}</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, background: "#F8FAFC", padding: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                {products.map(p => {
                  const active = sec.productIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleSectionProduct(sec, p.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "6px 10px",
                        background: active ? "#DBEAFE" : "#FFFFFF",
                        border: `1px solid ${active ? "#93C5FD" : "#CBD5E1"}`,
                        borderRadius: 6, cursor: "pointer", fontSize: 12,
                        color: active ? "#1D4ED8" : "#475569", fontWeight: active ? 600 : 500,
                        transition: "all 0.2s"
                      }}
                    >
                      {active && <span>✓</span>} {p.thumbnail} {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => toggleVisibility(sec)} style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, background: "#F1F5F9", border: "none", borderRadius: 6, cursor: "pointer", color: "#334155" }}>
                {sec.visible ? "Hide" : "Show"}
              </button>
              <button onClick={() => handleDelete(sec)} style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 6, cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </div>
        ))}

        {sections.length === 0 && !showCreate && (
          <div style={{ textAlign: "center", padding: "60px 0", background: "#FFFFFF", borderRadius: 12, border: "1px dashed #CBD5E1" }}>
            <p style={{ fontSize: 32 }}>📂</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginTop: 12 }}>No sections created yet</p>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Create a section to display products on the homepage.</p>
          </div>
        )}
      </div>
    </div>
  );
}
