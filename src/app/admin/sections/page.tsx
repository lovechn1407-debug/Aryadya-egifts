"use client";
import { useState, useEffect } from "react";
import {
  SECTION_THEMES, SectionTheme, DisplaySection, Product,
} from "@/lib/data";
import {
  getSectionsDB, saveSectionDB, deleteSectionDB, getProductsDB,
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
        createdAt: new Date().toISOString(),
      };
      await saveSectionDB(newSection);
      setTitle(""); setSubtitle(""); setTheme("birthday"); setSelectedProducts([]);
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

    // Update order values sequentially
    const updatedSections = newSections.map((sec, i) => ({ ...sec, order: i }));
    setSections(updatedSections);
    setDraggedIndex(null);

    // Save all new orders to DB
    await Promise.all(updatedSections.map(sec => saveSectionDB(sec)));
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--dark-card2)", border: "1px solid var(--dark-border)",
    borderRadius: 16, padding: 24, marginBottom: 16,
  };
  const btnStyle = (color: string): React.CSSProperties => ({
    background: color, color: "#fff", border: "none", borderRadius: 10,
    padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer",
  });
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1px solid var(--dark-border)", background: "var(--dark-card)",
    color: "#fff", fontSize: 14, outline: "none",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>📂 Display Sections</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            Create occasion-based sections like Blinkit for the homepage
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={btnStyle("#E91E8C")}>
          {showCreate ? "✕ Cancel" : "+ New Section"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ ...cardStyle, border: "2px solid #E91E8C" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Create New Section</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Section Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Birthday Specials 🎂" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Subtitle (optional)</label>
              <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Auto-filled from theme" style={inputStyle} />
            </div>
          </div>

          {/* Theme picker */}
          <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 8 }}>Choose Theme</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 8, marginBottom: 16 }}>
            {SECTION_THEMES.map(t => (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  background: t.gradient, borderRadius: 12, padding: "12px 14px",
                  cursor: "pointer", border: theme === t.id ? "3px solid #fff" : "3px solid transparent",
                  opacity: theme === t.id ? 1 : 0.65, transition: "all 0.2s",
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t.label}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{t.tagline}</p>
              </div>
            ))}
          </div>

          {/* Product picker */}
          <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 8 }}>Select Products for this Section</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {products.map(p => (
              <div
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                style={{
                  padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
                  background: selectedProducts.includes(p.id) ? "#E91E8C" : "var(--dark-card)",
                  color: selectedProducts.includes(p.id) ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${selectedProducts.includes(p.id) ? "#E91E8C" : "var(--dark-border)"}`,
                }}
              >
                {p.thumbnail} {p.name}
              </div>
            ))}
          </div>

          <button onClick={handleCreate} disabled={saving} style={btnStyle(saving ? "#6B7280" : "#10B981")}>
            {saving ? "Saving…" : "✅ Create Section"}
          </button>
        </div>
      )}

      {/* Empty state */}
      {sections.length === 0 && !showCreate && (
        <div style={{ ...cardStyle, textAlign: "center", padding: 48 }}>
          <p style={{ fontSize: 40 }}>📂</p>
          <p style={{ fontSize: 16, fontWeight: 700, marginTop: 12 }}>No sections yet</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
            Create your first occasion section to display on the homepage
          </p>
        </div>
      )}

      {/* Existing sections */}
      {sections.map((sec, index) => {
        const t = SECTION_THEMES.find(th => th.id === sec.theme) || SECTION_THEMES[0];
        return (
          <div 
            key={sec.id} 
            draggable 
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            style={{
              ...cardStyle, 
              cursor: "grab",
              opacity: draggedIndex === index ? 0.5 : 1,
              transform: "translateZ(0)", // hardware acceleration
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ cursor: "grab", fontSize: 18, color: "var(--text-muted)" }}>
                ☰
              </div>
              <div style={{
                background: t.gradient, borderRadius: 12, padding: "8px 14px",
                fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap",
              }}>{t.label}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{sec.title}</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{sec.subtitle}</p>
              </div>

              <button
                onClick={() => toggleVisibility(sec)}
                style={{ ...btnStyle(sec.visible ? "#10B981" : "#6B7280"), padding: "6px 14px", fontSize: 12 }}
              >
                {sec.visible ? "👁️ Visible" : "🙈 Hidden"}
              </button>
              <button
                onClick={() => handleDelete(sec)}
                style={{ ...btnStyle("#EF4444"), padding: "6px 14px", fontSize: 12 }}
              >
                🗑️
              </button>
            </div>

            <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>
              Products in this section (click to toggle):
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {products.map(p => {
                const isIn = sec.productIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleSectionProduct(sec, p.id)}
                    style={{
                      padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
                      background: isIn ? t.accent : "var(--dark-card)",
                      color: isIn ? "#fff" : "var(--text-muted)",
                      border: `1px solid ${isIn ? t.accent : "var(--dark-border)"}`,
                      transition: "all 0.15s",
                    }}
                  >
                    {p.thumbnail} {p.name}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
