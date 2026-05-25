"use client";
import { useState, useEffect, useRef } from "react";
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
  
  const [titleSize, setTitleSize] = useState<"small" | "normal" | "medium" | "big" | "bigger">("normal");
  const [headerStyle, setHeaderStyle] = useState<"normal" | "new">("normal");
  const [headerFontFamily, setHeaderFontFamily] = useState<string>("'Dancing Script', cursive");
  const [headerCutout, setHeaderCutout] = useState<string>("none");
  const [headerNote, setHeaderNote] = useState("");
  const [headerNoteEnabled, setHeaderNoteEnabled] = useState(false);
  const [bottomCutout, setBottomCutout] = useState<string>("none");
  const [fadeEnabled, setFadeEnabled] = useState(false);
  const [fadeLength, setFadeLength] = useState(100);
  const [bottomSpaceEnabled, setBottomSpaceEnabled] = useState(false);
  const [bottomSpacePx, setBottomSpacePx] = useState(40);
  const [gridChange, setGridChange] = useState<"horizontal" | "vertical">("horizontal");

  // Heading form state
  const [isHeading, setIsHeading] = useState(false);
  const [headingColor, setHeadingColor] = useState("#D4AF37");
  const [headingBgType, setHeadingBgType] = useState<"blank" | "solid" | "theme">("blank");
  const [headingBgColor, setHeadingBgColor] = useState("#FFFFFF");

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Product Library Modal states
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState<"form" | DisplaySection | null>(null);
  const [librarySelectedIds, setLibrarySelectedIds] = useState<string[]>([]);
  const [libraryCategory, setLibraryCategory] = useState<string>("all");

  const noteRef = useRef<HTMLTextAreaElement>(null);

  const reload = async () => {
    const [secs, prods] = await Promise.all([getSectionsDB(), getProductsDB()]);
    setSections(secs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    setProducts(prods);
  };

  useEffect(() => { reload(); }, []);

  const handleCreateOrUpdate = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    setSaving(true);
    try {
      const themeConfig = SECTION_THEMES.find(t => t.id === theme);
      
      if (editingSectionId) {
        // Update
        const section = sections.find(s => s.id === editingSectionId);
        if (!section) return;
        await updateSectionDB(editingSectionId, {
          title: title.trim(),
          subtitle: subtitle.trim(),
          theme,
          productIds: isHeading ? [] : selectedProducts,
          countdownEnabled: isHeading ? false : countdownEnabled,
          countdownEndTime: isHeading ? "" : countdownEndTime,
          titleSize,
          headerStyle,
          headerFontFamily,
          headerCutout: headerCutout as any,
          headerNote: isHeading ? "" : headerNote,
          headerNoteEnabled: isHeading ? false : headerNoteEnabled,
          bottomCutout: bottomCutout as any,
          fadeEnabled: isHeading ? false : fadeEnabled,
          fadeLength: isHeading ? 100 : fadeLength,
          bottomSpaceEnabled,
          bottomSpacePx,
          isHeading,
          headingColor,
          headingBgType,
          headingBgColor,
          gridChange: isHeading ? "horizontal" : gridChange
        });
      } else {
        // Create new section (at the top)
        const minOrder = sections.length > 0 ? Math.min(...sections.map(s => s.order ?? 0)) : 0;
        const newSection: DisplaySection = {
          id: `sec_${Date.now()}`,
          title: title.trim(),
          subtitle: subtitle.trim() || (isHeading ? "" : (themeConfig?.tagline || "")),
          theme,
          productIds: isHeading ? [] : selectedProducts,
          visible: true,
          order: minOrder - 1, // Appears at the top
          countdownEnabled: isHeading ? false : countdownEnabled,
          countdownEndTime: isHeading ? "" : countdownEndTime,
          titleSize,
          headerStyle,
          headerFontFamily,
          headerCutout: headerCutout as any,
          headerNote: isHeading ? "" : headerNote,
          headerNoteEnabled: isHeading ? false : headerNoteEnabled,
          bottomCutout: bottomCutout as any,
          fadeEnabled: isHeading ? false : fadeEnabled,
          fadeLength: isHeading ? 100 : fadeLength,
          bottomSpaceEnabled,
          bottomSpacePx,
          isHeading,
          headingColor,
          headingBgType,
          headingBgColor,
          gridChange: isHeading ? "horizontal" : gridChange,
          createdAt: new Date().toISOString(),
        };
        await saveSectionDB(newSection);
      }
      
      cancelEditOrCreate();
      await reload();
    } catch (err: any) {
      console.error(err);
      alert("Error saving section: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (sec: DisplaySection) => {
    setTitle(sec.title);
    setSubtitle(sec.subtitle || "");
    setTheme(sec.theme);
    setSelectedProducts(sec.productIds || []);
    setCountdownEnabled(sec.countdownEnabled || false);
    setCountdownEndTime(sec.countdownEndTime || "");
    setTitleSize(sec.titleSize || "normal");
    setHeaderStyle(sec.headerStyle || "normal");
    setHeaderFontFamily(sec.headerFontFamily || "'Dancing Script', cursive");
    setHeaderCutout(sec.headerCutout || "none");
    setHeaderNote(sec.headerNote || "");
    setHeaderNoteEnabled(sec.headerNoteEnabled || false);
    setBottomCutout(sec.bottomCutout || "none");
    setFadeEnabled(sec.fadeEnabled || false);
    setFadeLength(sec.fadeLength ?? 100);
    setBottomSpaceEnabled(sec.bottomSpaceEnabled || false);
    setBottomSpacePx(sec.bottomSpacePx ?? 40);
    setGridChange(sec.gridChange || "horizontal");
    
    // Heading specific fields
    setIsHeading(sec.isHeading || false);
    setHeadingColor(sec.headingColor || "#D4AF37");
    setHeadingBgType(sec.headingBgType || "blank");
    setHeadingBgColor(sec.headingBgColor || "#FFFFFF");

    setEditingSectionId(sec.id);
    setShowCreate(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditOrCreate = () => {
    setShowCreate(false);
    setEditingSectionId(null);
    setTitle(""); setSubtitle(""); setTheme("birthday"); setSelectedProducts([]); setCountdownEnabled(false); setCountdownEndTime("");
    setTitleSize("normal"); setHeaderStyle("normal"); setHeaderFontFamily("'Dancing Script', cursive"); setHeaderCutout("none"); setHeaderNote(""); setHeaderNoteEnabled(false);
    setBottomCutout("none"); setFadeEnabled(false); setFadeLength(100); setBottomSpaceEnabled(false); setBottomSpacePx(40); setGridChange("horizontal");
    
    // Heading specific fields
    setIsHeading(false);
    setHeadingColor("#D4AF37");
    setHeadingBgType("blank");
    setHeadingBgColor("#FFFFFF");
  };

  const openProductLibraryForForm = () => {
    setLibraryTarget("form");
    setLibrarySelectedIds([...selectedProducts]);
    setLibraryCategory("all");
    setLibraryOpen(true);
  };

  const openProductLibraryForSection = (sec: DisplaySection) => {
    setLibraryTarget(sec);
    setLibrarySelectedIds([...(sec.productIds || [])]);
    setLibraryCategory("all");
    setLibraryOpen(true);
  };

  const handleLibrarySave = async () => {
    if (libraryTarget === "form") {
      setSelectedProducts(librarySelectedIds);
    } else if (libraryTarget) {
      const updatedSection = { ...libraryTarget, productIds: librarySelectedIds };
      await saveSectionDB(updatedSection);
      await reload();
    }
    setLibraryOpen(false);
    setLibraryTarget(null);
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

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
    
    // Auto-scroll logic
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const threshold = 150;
    if (rect.top < threshold) window.scrollBy(0, -10);
    if (window.innerHeight - rect.bottom < threshold) window.scrollBy(0, 10);
  };

  const handleDrop = async (dropIndex: number) => {
    setDragOverIndex(null);
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

  const insertTextAtCursor = (text: string) => {
    if (!noteRef.current) return;
    const start = noteRef.current.selectionStart;
    const end = noteRef.current.selectionEnd;
    const val = headerNote;
    setHeaderNote(val.substring(0, start) + text + val.substring(end));
    setTimeout(() => {
      noteRef.current?.focus();
      noteRef.current?.setSelectionRange(start + text.length, start + text.length);
    }, 10);
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
            Sections & Headings Manager
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
            Organize homepage shelves, campaigns and elegant text banners
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {showCreate ? (
            <button 
              onClick={cancelEditOrCreate} 
              style={{ background: "#EF4444", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
            >
              ✕ Cancel
            </button>
          ) : (
            <>
              <button 
                onClick={() => { setIsHeading(true); setShowCreate(true); }} 
                style={{ background: "#EC4899", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}
                onMouseEnter={e => e.currentTarget.style.background = "#DB2777"}
                onMouseLeave={e => e.currentTarget.style.background = "#EC4899"}
              >
                ✍️ + New Heading
              </button>
              <button 
                onClick={() => { setIsHeading(false); setShowCreate(true); }} 
                style={{ background: "#0F172A", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1E293B"}
                onMouseLeave={e => e.currentTarget.style.background = "#0F172A"}
              >
                📁 + New Section
              </button>
            </>
          )}
        </div>
      </div>

      {showCreate && (
        <div style={{ ...cardStyle, marginBottom: 24, border: "1px solid #CBD5E1" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#0F172A" }}>
            {editingSectionId 
              ? (isHeading ? "Edit Typography Heading" : "Edit Homepage Section") 
              : (isHeading ? "Create New Typography Heading" : "Create New Homepage Section")}
          </h3>
          
          {isHeading ? (
            // Heading-specific Form fields
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Heading Text *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Happy Valentine's Week 💖" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Subtitle / Tagline (Optional)</label>
                <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="e.g. Crafted with pure love" style={inputStyle} />
              </div>
              
              <div>
                <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Font Typography Style</label>
                <select value={headerFontFamily} onChange={e => setHeaderFontFamily(e.target.value)} style={{ ...inputStyle, fontFamily: headerFontFamily } as any}>
                  <option value="'Dancing Script', cursive">Dancing Script (Magical Cursive)</option>
                  <option value="'Playfair Display', serif">Playfair Display (Elegant Serif)</option>
                  <option value="'Cormorant Garamond', serif">Cormorant Garamond (Premium Serif)</option>
                  <option value="'Outfit', sans-serif">Outfit (Modern Sans)</option>
                  <option value="'Special Elite', cursive">Special Elite (Typewriter)</option>
                  <option value="'Nunito', sans-serif">Nunito (Friendly Sans)</option>
                  <option value="'Inter', sans-serif">Inter (Clean UI)</option>
                  <option value="'Cinzel', serif">Cinzel (Classic Roman)</option>
                  <option value="'Great Vibes', cursive">Great Vibes (Sophisticated Script)</option>
                  <option value="'Sacramento', cursive">Sacramento (Thin/Delicate Cursive)</option>
                  <option value="'Pacifico', cursive">Pacifico (Playful Retro)</option>
                  <option value="'Parisienne', cursive">Parisienne (French Vintage Cursive)</option>
                  <option value="'Montserrat', sans-serif">Montserrat (Premium Modern Sans)</option>
                  <option value="'Alex Brush', cursive">Alex Brush (Flowing Graceful Script)</option>
                  <option value="'Lobster', cursive">Lobster (Bold Retro Script)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Font Color</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="color" value={headingColor} onChange={e => setHeadingColor(e.target.value)} style={{ width: 44, height: 38, border: "1px solid #CBD5E1", borderRadius: 8, padding: 2, cursor: "pointer", background: "#fff" }} />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[
                      { name: "Gold", value: "#D4AF37" },
                      { name: "Crimson", value: "#DC143C" },
                      { name: "Rose Pink", value: "#FF007F" },
                      { name: "Royal Indigo", value: "#4B0082" },
                      { name: "Charcoal", value: "#1C1C1C" },
                      { name: "White", value: "#FFFFFF" }
                    ].map(col => (
                      <button
                        key={col.value}
                        onClick={(e) => { e.preventDefault(); setHeadingColor(col.value); }}
                        style={{
                          width: 24, height: 24, borderRadius: "50%", background: col.value,
                          border: `2px solid ${headingColor === col.value ? "#3B82F6" : "#E2E8F0"}`,
                          cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                          position: "relative"
                        }}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Background Style</label>
                <select value={headingBgType} onChange={e => setHeadingBgType(e.target.value as any)} style={inputStyle}>
                  <option value="blank">Blank (Transparent)</option>
                  <option value="solid">Solid Background Color</option>
                  <option value="theme">Theme-Inspired Gradient</option>
                </select>
              </div>

              {headingBgType === "solid" && (
                <div>
                  <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Solid Background Color</label>
                  <input type="color" value={headingBgColor} onChange={e => setHeadingBgColor(e.target.value)} style={{ ...inputStyle, height: 38, padding: "2px 8px", cursor: "pointer" }} />
                </div>
              )}

              {headingBgType === "theme" && (
                <div>
                  <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Visual Theme Gradient</label>
                  <select value={theme} onChange={e => setTheme(e.target.value as SectionTheme)} style={inputStyle}>
                    {SECTION_THEMES.map(t => (
                      <option key={t.id} value={t.id}>{t.label} ({t.id})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Title Font Size</label>
                <select value={titleSize} onChange={e => setTitleSize(e.target.value as any)} style={inputStyle}>
                  <option value="small">Small</option>
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="big">Big</option>
                  <option value="bigger">Bigger</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Top Outline Cutout</label>
                <select value={headerCutout} onChange={e => setHeaderCutout(e.target.value as any)} style={inputStyle}>
                  <option value="none">None (Standard)</option>
                  <option value="wavy">Wavy</option>
                  <option value="wavy_stretched">Wavy (Stretched)</option>
                  <option value="zigzag">Zigzag</option>
                  <option value="circular">Circular Spiral (Scallop)</option>
                  <option value="liquid_wave">Liquid Wave (+/-)</option>
                  <option value="hearts">Hearts (Bezier Curves)</option>
                  <option value="clouds">Clouds (Asymmetrical)</option>
                  <option value="spikes">Spikes (Sharp Crystal)</option>
                  <option value="bubbles">Bubbles (Alternating Circles)</option>
                  <option value="castles">Castles (Battlements)</option>
                  <option value="stamps">Stamps (Post Perforation)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Bottom Outline Cutout</label>
                <select value={bottomCutout} onChange={e => setBottomCutout(e.target.value as any)} style={inputStyle}>
                  <option value="none">None (Standard)</option>
                  <option value="wavy">Wavy</option>
                  <option value="wavy_stretched">Wavy (Stretched)</option>
                  <option value="zigzag">Zigzag</option>
                  <option value="circular">Circular Spiral (Scallop)</option>
                  <option value="liquid_wave">Liquid Wave (+/-)</option>
                  <option value="hearts">Hearts (Bezier Curves)</option>
                  <option value="clouds">Clouds (Asymmetrical)</option>
                  <option value="spikes">Spikes (Sharp Crystal)</option>
                  <option value="bubbles">Bubbles (Alternating Circles)</option>
                  <option value="castles">Castles (Battlements)</option>
                  <option value="stamps">Stamps (Post Perforation)</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155" }}>
                  <input type="checkbox" checked={bottomSpaceEnabled} onChange={e => setBottomSpaceEnabled(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#EC4899" }} />
                  Enable Bottom Space (Spacing Adder)
                </label>
                {bottomSpaceEnabled && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "#F8FAFC", padding: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="range" min="0" max="500" value={bottomSpacePx} onChange={e => setBottomSpacePx(parseInt(e.target.value))} style={{ flex: 1 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", width: 50 }}>{bottomSpacePx} px</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[20, 40, 60, 100, 150].map(px => (
                        <button key={px} onClick={(e) => { e.preventDefault(); setBottomSpacePx(px); }} style={{ padding: "4px 10px", fontSize: 11, background: bottomSpacePx === px ? "#EC4899" : "#FFFFFF", color: bottomSpacePx === px ? "#FFFFFF" : "#334155", border: "1px solid #CBD5E1", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>
                          {px}px
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Standard Section Form fields
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
                  <input type="checkbox" checked={gridChange === "vertical"} onChange={e => setGridChange(e.target.checked ? "vertical" : "horizontal")} style={{ width: 16, height: 16, accentColor: "#0F172A" }} />
                  Vertical Grid Layout (2 products/row)
                </label>
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
              
              <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: theme.includes("_plus") ? "1fr 1fr" : "1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Title Font Size</label>
                  <select value={titleSize} onChange={e => setTitleSize(e.target.value as any)} style={inputStyle}>
                    <option value="small">Small</option>
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="big">Big</option>
                    <option value="bigger">Bigger</option>
                  </select>
                </div>
                
                {theme.includes("_plus") && (
                  <div>
                    <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Plus+ Header Style</label>
                    <div style={{ display: "flex", gap: 16, alignItems: "center", ...inputStyle }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14 }}>
                        <input type="radio" checked={headerStyle === "normal"} onChange={() => setHeaderStyle("normal")} /> Normal
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14 }}>
                        <input type="radio" checked={headerStyle === "new"} onChange={() => setHeaderStyle("new")} /> New (Centered)
                      </label>
                    </div>
                  </div>
                )}
              </div>
              
              {theme.includes("_plus") && headerStyle === "new" && (
                <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Header Font Style</label>
                    <select value={headerFontFamily} onChange={e => setHeaderFontFamily(e.target.value)} style={{ ...inputStyle, fontFamily: headerFontFamily } as any}>
                      <option value="'Dancing Script', cursive">Dancing Script (Magical Cursive)</option>
                      <option value="'Playfair Display', serif">Playfair Display (Elegant Serif)</option>
                      <option value="'Cormorant Garamond', serif">Cormorant Garamond (Premium Serif)</option>
                      <option value="'Outfit', sans-serif">Outfit (Modern Sans)</option>
                      <option value="'Special Elite', cursive">Special Elite (Typewriter)</option>
                      <option value="'Nunito', sans-serif">Nunito (Friendly Sans)</option>
                      <option value="'Inter', sans-serif">Inter (Clean UI)</option>
                      <option value="'Cinzel', serif">Cinzel (Classic Roman)</option>
                      <option value="'Great Vibes', cursive">Great Vibes (Sophisticated Script)</option>
                      <option value="'Sacramento', cursive">Sacramento (Thin/Delicate Cursive)</option>
                      <option value="'Pacifico', cursive">Pacifico (Playful Retro)</option>
                      <option value="'Parisienne', cursive">Parisienne (French Vintage Cursive)</option>
                      <option value="'Montserrat', sans-serif">Montserrat (Premium Modern Sans)</option>
                      <option value="'Alex Brush', cursive">Alex Brush (Flowing Graceful Script)</option>
                      <option value="'Lobster', cursive">Lobster (Bold Retro Script)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Top Outline Cutout</label>
                    <select value={headerCutout} onChange={e => setHeaderCutout(e.target.value as any)} style={inputStyle}>
                      <option value="none">None (Standard)</option>
                      <option value="wavy">Wavy</option>
                      <option value="wavy_stretched">Wavy (Stretched)</option>
                      <option value="zigzag">Zigzag</option>
                      <option value="circular">Circular Spiral (Scallop)</option>
                      <option value="liquid_wave">Liquid Wave (+/-)</option>
                      <option value="hearts">Hearts (Bezier Curves)</option>
                      <option value="clouds">Clouds (Asymmetrical)</option>
                      <option value="spikes">Spikes (Sharp Crystal)</option>
                      <option value="bubbles">Bubbles (Alternating Circles)</option>
                      <option value="castles">Castles (Battlements)</option>
                      <option value="stamps">Stamps (Post Perforation)</option>
                    </select>
                  </div>
                </div>
              )}
              
              {theme.includes("_plus") && (
                <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Bottom Outline Cutout</label>
                    <select value={bottomCutout} onChange={e => setBottomCutout(e.target.value as any)} style={inputStyle}>
                      <option value="none">None (Standard)</option>
                      <option value="wavy">Wavy</option>
                      <option value="wavy_stretched">Wavy (Stretched)</option>
                      <option value="zigzag">Zigzag</option>
                      <option value="circular">Circular Spiral (Scallop)</option>
                      <option value="liquid_wave">Liquid Wave (+/-)</option>
                      <option value="hearts">Hearts (Bezier Curves)</option>
                      <option value="clouds">Clouds (Asymmetrical)</option>
                      <option value="spikes">Spikes (Sharp Crystal)</option>
                      <option value="bubbles">Bubbles (Alternating Circles)</option>
                      <option value="castles">Castles (Battlements)</option>
                      <option value="stamps">Stamps (Post Perforation)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                      <input type="checkbox" checked={fadeEnabled} onChange={e => setFadeEnabled(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#0F172A" }} />
                      Enable Bottom Fade
                    </label>
                    {fadeEnabled && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input type="range" min="10" max="500" value={fadeLength} onChange={e => setFadeLength(parseInt(e.target.value))} style={{ flex: 1 }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", width: 40 }}>{fadeLength}px</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155" }}>
                  <input type="checkbox" checked={bottomSpaceEnabled} onChange={e => setBottomSpaceEnabled(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#0F172A" }} />
                  Enable Bottom Space (Spacing Adder)
                </label>
                {bottomSpaceEnabled && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "#F8FAFC", padding: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="range" min="0" max="500" value={bottomSpacePx} onChange={e => setBottomSpacePx(parseInt(e.target.value))} style={{ flex: 1 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", width: 50 }}>{bottomSpacePx} px</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[20, 40, 60, 100, 150].map(px => (
                        <button key={px} onClick={(e) => { e.preventDefault(); setBottomSpacePx(px); }} style={{ padding: "4px 10px", fontSize: 11, background: bottomSpacePx === px ? "#0F172A" : "#FFFFFF", color: bottomSpacePx === px ? "#FFFFFF" : "#334155", border: "1px solid #CBD5E1", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>
                          {px}px
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 10 }}>
                  <input type="checkbox" checked={headerNoteEnabled} onChange={e => setHeaderNoteEnabled(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#0F172A" }} />
                  Enable Header Note
                </label>
                {headerNoteEnabled && (
                  <div style={{ border: "1px solid #CBD5E1", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ background: "#F1F5F9", padding: "8px 12px", borderBottom: "1px solid #CBD5E1", display: "flex", gap: 8 }}>
                      <button onClick={() => insertTextAtCursor("<b></b>")} style={{ background: "#fff", border: "1px solid #CBD5E1", padding: "4px 8px", borderRadius: 4, fontWeight: "bold", cursor: "pointer", fontSize: 12 }}>B</button>
                      <button onClick={() => insertTextAtCursor("<i></i>")} style={{ background: "#fff", border: "1px solid #CBD5E1", padding: "4px 8px", borderRadius: 4, fontStyle: "italic", cursor: "pointer", fontSize: 12 }}>I</button>
                    </div>
                    <textarea 
                      ref={noteRef}
                      value={headerNote} 
                      onChange={e => setHeaderNote(e.target.value)} 
                      placeholder="E.g. Valid till stocks last!"
                      style={{ ...inputStyle, border: "none", borderRadius: 0, minHeight: 80, resize: "vertical" }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!isHeading && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block" }}>Products in this Section</label>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    openProductLibraryForForm();
                  }}
                  style={{
                    background: "#0F172A", color: "#FFFFFF", border: "none",
                    borderRadius: 8, padding: "8px 16px", fontSize: 13,
                    fontWeight: 600, cursor: "pointer", display: "flex",
                    alignItems: "center", gap: 6, transition: "background 0.2s"
                  }}
                >
                  🛍️ Add Products
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, background: "#F8FAFC", padding: 16, borderRadius: 8, border: "1px solid #E2E8F0", minHeight: 60 }}>
                {products.filter(p => selectedProducts.includes(p.id)).map(p => (
                  <span key={p.id} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", background: "#EFF6FF", color: "#1E40AF",
                    border: "1px solid #BFDBFE", borderRadius: 8, fontSize: 13, fontWeight: 600
                  }}>
                    {p.thumbnail} {p.name}
                  </span>
                ))}
                {selectedProducts.length === 0 && (
                  <span style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic", alignSelf: "center" }}>
                    No products selected yet. Click "Add Products" to browse and select.
                  </span>
                )}
              </div>
            </div>
          )}

          <button onClick={handleCreateOrUpdate} disabled={saving} style={{ background: saving ? "#94A3B8" : (isHeading ? "#EC4899" : "#10B981"), color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            {saving ? "Saving..." : (isHeading ? "Save Heading" : "Save Section")}
          </button>
        </div>
      )}

      {/* Sections & Headings List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sections.map((sec, index) => (
          <div key={sec.id}>
            {dragOverIndex === index && (
              <div style={{ height: 4, background: "#3B82F6", borderRadius: 2, marginBottom: 16, boxShadow: "0 0 8px rgba(59,130,246,0.5)" }} />
            )}
            <div
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={e => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              style={{
                ...cardStyle,
                cursor: "grab",
                display: "flex", alignItems: "flex-start", gap: 16,
                opacity: draggedIndex === index ? 0.5 : 1,
                background: sec.visible ? "#FFFFFF" : "#F8FAFC",
                transition: "transform 0.2s, opacity 0.2s",
                border: sec.isHeading ? "1px solid #FBCFE8" : "1px solid #E2E8F0"
              }}
            >
              <div style={{ fontSize: 20, color: "#CBD5E1", cursor: "grab", paddingTop: 4 }}>
                ☰
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>{sec.title}</h3>
                  {sec.isHeading ? (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: "#FCE7F3", color: "#DB2777", border: "1px solid #FBCFE8" }}>
                      ✍️ HEADING
                    </span>
                  ) : (
                    <>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: "#F1F5F9", color: "#475569" }}>
                        Theme: {sec.theme}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE" }}>
                        Layout: {sec.gridChange === "vertical" ? "Vertical (Grid)" : "Horizontal (Scroll)"}
                      </span>
                    </>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: sec.visible ? "#ECFDF5" : "#F1F5F9", color: sec.visible ? "#059669" : "#64748B" }}>
                    {sec.visible ? "🟢 Visible" : "⚫ Hidden"}
                  </span>
                  {!sec.isHeading && sec.countdownEnabled && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                      ⏱️ Timer ON
                    </span>
                  )}
                </div>
                
                {sec.isHeading ? (
                  <div style={{ marginTop: 6, fontSize: 12, color: "#64748B", display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                    {sec.subtitle && <span>Tagline: <strong style={{ color: "#475569" }}>{sec.subtitle}</strong></span>}
                    <span>Font: <strong style={{ color: sec.headingColor, fontFamily: sec.headerFontFamily }}>{sec.headerFontFamily?.replace(/'/g, "")}</strong></span>
                    <span>Bg Style: <strong style={{ color: "#475569" }}>{sec.headingBgType || "blank"}</strong></span>
                    {sec.headerCutout && sec.headerCutout !== "none" && <span>Top Edge: <strong style={{ color: "#475569" }}>{sec.headerCutout}</strong></span>}
                    {sec.bottomCutout && sec.bottomCutout !== "none" && <span>Bottom Edge: <strong style={{ color: "#475569" }}>{sec.bottomCutout}</strong></span>}
                    {sec.bottomSpaceEnabled && <span>Spacing: <strong style={{ color: "#475569" }}>{sec.bottomSpacePx}px</strong></span>}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>{sec.subtitle}</p>
                )}

                {!sec.isHeading && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        Selected Products:
                      </span>
                      <button
                        onClick={() => openProductLibraryForSection(sec)}
                        style={{
                          background: "#0F172A", color: "#FFFFFF", border: "none",
                          borderRadius: 6, padding: "6px 12px", fontSize: 12,
                          fontWeight: 600, cursor: "pointer", display: "flex",
                          alignItems: "center", gap: 6, transition: "background 0.2s"
                        }}
                      >
                        🛍️ Add Products
                      </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {products.filter(p => sec.productIds?.includes(p.id)).map(p => (
                        <span key={p.id} style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "4px 8px", background: "#EFF6FF", color: "#1E40AF",
                          border: "1px solid #BFDBFE", borderRadius: 6, fontSize: 12, fontWeight: 500
                        }}>
                          {p.thumbnail} {p.name}
                        </span>
                      ))}
                      {(!sec.productIds || sec.productIds.length === 0) && (
                        <span style={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic" }}>
                          No products selected. Click "Add Products" to browse and select.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignSelf: "center" }}>
                <button onClick={() => openEdit(sec)} style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, background: "#DBEAFE", border: "none", borderRadius: 6, cursor: "pointer", color: "#1D4ED8", transition: "all 0.2s" }}>
                  Edit
                </button>
                <button onClick={() => toggleVisibility(sec)} style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, background: "#F1F5F9", border: "none", borderRadius: 6, cursor: "pointer", color: "#334155", transition: "all 0.2s" }}>
                  {sec.visible ? "Hide" : "Show"}
                </button>
                <button onClick={() => handleDelete(sec)} style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 6, cursor: "pointer", transition: "all 0.2s" }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {sections.length > 0 && dragOverIndex === sections.length && (
          <div style={{ height: 4, background: "#3B82F6", borderRadius: 2, marginTop: -4, boxShadow: "0 0 8px rgba(59,130,246,0.5)" }} />
        )}

        <div 
          onDragOver={e => handleDragOver(e, sections.length)} 
          onDrop={() => handleDrop(sections.length)}
          style={{ height: 20, marginTop: -16, width: "100%" }} 
        />

        {sections.length === 0 && !showCreate && (
          <div style={{ textAlign: "center", padding: "60px 0", background: "#FFFFFF", borderRadius: 12, border: "1px dashed #CBD5E1" }}>
            <p style={{ fontSize: 32 }}>📂</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginTop: 12 }}>No sections created yet</p>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Create a section or heading banner to organize the homepage.</p>
          </div>
        )}
      </div>

      {/* Product Library Modal Overlay */}
      {libraryOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16
        }}>
          <div style={{
            background: "#FFFFFF", borderRadius: 16, width: "100%", maxWidth: 840,
            height: "85vh", maxHeight: 680, display: "flex", flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden"
          }}>
            {/* Header */}
            <div style={{
              padding: "18px 24px", borderBottom: "1px solid #F1F5F9",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  Product Library
                </h3>
                <p style={{ fontSize: 13, color: "#64748B", marginTop: 2, marginBottom: 0 }}>
                  Browse and select products to display in the section
                </p>
              </div>
              <button
                onClick={() => setLibraryOpen(false)}
                style={{
                  background: "none", border: "none", fontSize: 20, color: "#94A3B8",
                  cursor: "pointer", padding: 4
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
              {/* Left Sidebar Categories */}
              <div style={{
                width: 200, borderRight: "1px solid #F1F5F9", background: "#F8FAFC",
                padding: "16px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 4
              }}>
                {[
                  { id: "all", label: "✨ All Products" },
                  { id: "birthday", label: "🎂 Birthday" },
                  { id: "proposal", label: "💍 Proposal" },
                  { id: "anniversary", label: "💑 Anniversary" },
                  { id: "friendship", label: "🤝 Friendship" },
                  { id: "love", label: "💖 Love" },
                  { id: "wedding", label: "💒 Wedding" }
                ].map(cat => {
                  const active = libraryCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setLibraryCategory(cat.id)}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 8,
                        border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                        textAlign: "left", display: "flex", alignItems: "center",
                        background: active ? "#EFF6FF" : "transparent",
                        color: active ? "#1E40AF" : "#475569",
                        transition: "all 0.2s"
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Right Content Grid */}
              <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                  gap: 16
                }}>
                  {products
                    .filter(p => libraryCategory === "all" || p.category === libraryCategory)
                    .map(p => {
                      const selected = librarySelectedIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setLibrarySelectedIds(prev =>
                              prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                            );
                          }}
                          style={{
                            background: "#FFFFFF", border: `2px solid ${selected ? "#3B82F6" : "#E2E8F0"}`,
                            borderRadius: 12, padding: 14, cursor: "pointer", position: "relative",
                            display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                            boxShadow: selected ? "0 4px 12px rgba(59,130,246,0.12)" : "none",
                            transition: "all 0.2s"
                          }}
                        >
                          {selected && (
                            <div style={{
                              position: "absolute", top: 8, right: 8, width: 20, height: 20,
                              background: "#3B82F6", borderRadius: "50%", display: "flex",
                              alignItems: "center", justifyContent: "center", color: "#FFFFFF",
                              fontSize: 11, fontWeight: "bold"
                            }}>
                              ✓
                            </div>
                          )}
                          <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>
                            {p.thumbnail || "🎁"}
                          </span>
                          <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", margin: "4px 0", lineHeight: 1.3 }}>
                            {p.name}
                          </h4>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "2px 6px",
                            background: "#F1F5F9", color: "#475569", borderRadius: 4,
                            marginTop: 4, textTransform: "capitalize"
                          }}>
                            {p.category}
                          </span>
                        </div>
                      );
                    })}
                </div>
                
                {products.filter(p => libraryCategory === "all" || p.category === libraryCategory).length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B" }}>
                    <p style={{ fontSize: 24 }}>🛍️</p>
                    <p style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>No products in this category</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: "16px 24px", borderTop: "1px solid #F1F5F9", background: "#F8FAFC",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>
                {librarySelectedIds.length} product(s) selected
              </span>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setLibraryOpen(false)}
                  style={{
                    background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 8,
                    padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#334155",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLibrarySave}
                  style={{
                    background: "#3B82F6", border: "none", borderRadius: 8,
                    padding: "8px 20px", fontSize: 13, fontWeight: 600, color: "#FFFFFF",
                    cursor: "pointer", boxShadow: "0 2px 4px rgba(59,130,246,0.15)"
                  }}
                >
                  Save Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
