import React, { createContext, useContext, useState, useEffect } from "react";
import { SITE_DATA } from "./siteData";

export type MllData = typeof SITE_DATA & {
  // raw customData dictionary so ET can read exact keys
  rawCustomData?: Record<string, string>;
};

export const MllDataContext = createContext<{
  data: MllData;
  editMode: boolean;
  onFieldChange?: (id: string, value: string) => void;
}>({
  data: SITE_DATA,
  editMode: false,
});

export function useMllData() {
  return useContext(MllDataContext).data;
}

export function useMllContext() {
  return useContext(MllDataContext);
}

// Inline editing component for Web Editor
export function ET({ fid, style, multiline = false }: { fid: string; style?: React.CSSProperties; multiline?: boolean }) {
  const { data, editMode, onFieldChange } = useMllContext();
  
  // Resolve value: prefer rawCustomData[fid], otherwise fallback to SITE_DATA if mapped
  let fallback = "";
  if (fid === "mll_scene1_hint") fallback = SITE_DATA.scene1_hint;
  if (fid === "mll_book_author") fallback = SITE_DATA.book_author;
  if (fid === "mll_page1") fallback = SITE_DATA.page_text[0];
  if (fid === "mll_page2") fallback = SITE_DATA.page_text[1];
  if (fid === "mll_page3") fallback = SITE_DATA.page_text[2];
  if (fid === "mll_page4") fallback = SITE_DATA.page_text[3];
  if (fid === "mll_tv_caption") fallback = SITE_DATA.tv_caption;
  if (fid === "mll_shake_hint") fallback = SITE_DATA.shake_hint;
  if (fid === "mll_bottle_message") fallback = SITE_DATA.bottle_message;
  if (fid === "mll_scratch_message") fallback = SITE_DATA.scratch_message;
  if (fid === "mll_fireworks_text") fallback = SITE_DATA.fireworks_text;
  if (fid === "mll_proposal_question") fallback = SITE_DATA.proposal_question;
  if (fid === "mll_no_button_text") fallback = SITE_DATA.no_button_text;
  if (fid === "mll_final_letter") fallback = SITE_DATA.final_letter;

  const value = data.rawCustomData?.[fid] ?? fallback;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    onFieldChange?.(fid, draft);
    setEditing(false);
  };

  if (!editMode) return <span style={style}>{value}</span>;

  if (editing) {
    const base: React.CSSProperties = {
      display: "block", width: "100%", border: "2px solid #FF69B4", borderRadius: 8,
      padding: "6px 8px", background: "#fff", outline: "none",
      fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit",
      color: "#1a1a1a", lineHeight: "inherit", textAlign: "inherit"
    };
    return multiline ? (
      <textarea
        value={draft} rows={3} autoFocus onChange={e => setDraft(e.target.value)}
        onBlur={commit} style={{ ...style, ...base, resize: "vertical" }}
      />
    ) : (
      <input
        value={draft} autoFocus onChange={e => setDraft(e.target.value)}
        onBlur={commit} onKeyDown={e => e.key === "Enter" && commit()}
        style={{ ...style, ...base }}
      />
    );
  }

  return (
    <div
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      title="Click to edit"
      style={{
        position: "relative", cursor: "text", border: "1.5px dashed rgba(255, 105, 180, 0.7)",
        borderRadius: 6, padding: "4px 8px 18px 8px",
        background: "rgba(255, 105, 180, 0.04)", display: "inline-block", width: "100%",
        pointerEvents: "auto",
        zIndex: 999999
      }}
    >
      <span style={style}>{value || "(click to edit)"}</span>
      <span
        style={{
          position: "absolute", bottom: 2, right: 6, fontSize: 8,
          color: "#FF69B4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5
        }}
      >
        Edit Text
      </span>
    </div>
  );
}
