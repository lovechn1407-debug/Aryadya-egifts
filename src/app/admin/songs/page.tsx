"use client";
import { useState, useEffect } from "react";
import { Song, SongPart } from "@/lib/data";
import { getSongsDB, saveSongDB, deleteSongDB } from "@/lib/db";

const BOT_TOKEN = "8832668653:AAER53dyUKzFn6lXK3ex2dtEEgErTTNSjlw";
const CHAT_ID = "-1003915557006";

interface MassEntry {
  name: string;
  description: string;
  uploadType: "direct" | "upload";
  url: string;
  file: File | null;
}

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mass upload
  const [showMass, setShowMass] = useState(false);
  const [massEntries, setMassEntries] = useState<MassEntry[]>([
    { name: "", description: "", uploadType: "direct", url: "", file: null }
  ]);
  const [massSaving, setMassSaving] = useState(false);
  const [massProgress, setMassProgress] = useState<string[]>([]);

  // Meta
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Song structure type
  const [songStructure, setSongStructure] = useState<"one-part" | "multi-part">("one-part");

  // One-part fields
  const [type, setType] = useState<"direct" | "youtube" | "upload">("direct");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Multi-part fields
  const [parts, setParts] = useState<{ label: string; url: string; file: File | null; uploadType: "direct" | "upload" }[]>([
    { label: "Part 1", url: "", file: null, uploadType: "direct" },
  ]);

  // Audio playback
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  const reload = async () => {
    const data = await getSongsDB();
    setSongs(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  };

  useEffect(() => { reload(); }, []);
  useEffect(() => {
    return () => { if (audioObj) { audioObj.pause(); audioObj.currentTime = 0; } };
  }, [audioObj]);

  const togglePlay = (song: Song) => {
    if (song.isMultiPart) {
      alert("Multi-part songs can be previewed in the template. Click a part to preview it.");
      return;
    }
    if (song.type === "youtube") {
      alert("YouTube audio preview is not available here. Check the template preview.");
      return;
    }
    if (playingId === song.id) {
      audioObj?.pause();
      setPlayingId(null);
    } else {
      if (audioObj) audioObj.pause();
      const newAudio = new Audio(song.url);
      newAudio.play().catch(() => alert("Could not play audio. Link might be invalid or restricted by CORS."));
      newAudio.onended = () => setPlayingId(null);
      setAudioObj(newAudio);
      setPlayingId(song.id);
    }
  };

  const extractYouTubeID = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|e\/|u\/\w+\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?]{11}).*/;
    const match = url.match(regExp);
    return match ? match[2] : "";
  };

  const uploadToTelegram = async (f: File, title: string): Promise<string> => {
    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("audio", f);
    formData.append("title", title);
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendAudio`, { method: "POST", body: formData });
    const data = await res.json();
    if (!data.ok) throw new Error(data.description || "Failed to upload to Telegram");
    return `/api/tg-audio/${data.result.audio.file_id}`;
  };

  const addPart = () => {
    setParts(p => [...p, { label: `Part ${p.length + 1}`, url: "", file: null, uploadType: "direct" }]);
  };

  const removePart = (idx: number) => {
    setParts(p => p.filter((_, i) => i !== idx));
  };

  const updatePart = (idx: number, field: string, value: any) => {
    setParts(p => p.map((part, i) => i === idx ? { ...part, [field]: value } : part));
  };

  const handleCreateOrUpdate = async () => {
    if (!name.trim()) { alert("Please provide a Song Name."); return; }

    if (songStructure === "one-part") {
      if (type === "direct" && !url.trim()) { alert("Please provide an Audio URL."); return; }
      if (type === "upload" && !file) { alert("Please select an MP3 file."); return; }
    } else {
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].uploadType === "direct" && !parts[i].url.trim()) {
          alert(`Please provide a URL for ${parts[i].label}.`); return;
        }
        if (parts[i].uploadType === "upload" && !parts[i].file) {
          alert(`Please select a file for ${parts[i].label}.`); return;
        }
      }
    }

    setSaving(true);
    try {
      const isNew = !id;
      const songId = isNew ? `song_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` : id;

      if (songStructure === "multi-part") {
        // Resolve all part URLs
        const resolvedParts: SongPart[] = await Promise.all(
          parts.map(async (p) => {
            let finalUrl = p.url.trim();
            if (p.uploadType === "upload" && p.file) {
              finalUrl = await uploadToTelegram(p.file, `${name} - ${p.label}`);
            }
            return { label: p.label, url: finalUrl };
          })
        );

        const song: Song = {
          id: songId, name: name.trim(), description: description.trim(),
          url: resolvedParts[0]?.url || "",
          type: "direct",
          isMultiPart: true,
          parts: resolvedParts,
          createdAt: isNew ? new Date().toISOString() : (songs.find(s => s.id === id)?.createdAt || new Date().toISOString()),
        };
        await saveSongDB(song);
      } else {
        // One-part song
        let finalUrl = url.trim();
        let finalType: "direct" | "youtube" = type === "upload" ? "direct" : type;
        let finalYoutubeId = "";

        if (type === "youtube") {
          finalYoutubeId = extractYouTubeID(url);
          const wantsConversion = confirm("Convert this YouTube video to MP3 and host it on Telegram?\n\n(Processing happens on Vercel servers!)");
          if (wantsConversion) {
            try {
              const res = await fetch(`/api/yt?url=${encodeURIComponent(url.trim())}`);
              if (!res.ok) throw new Error("Vercel Python API failed");
              const data = await res.json();
              if (data.error) throw new Error(data.error);
              if (!data.file_id) throw new Error("No file_id returned");
              finalUrl = `/api/tg-audio/${data.file_id}`;
              finalType = "direct";
              finalYoutubeId = "";
              alert("YouTube audio successfully converted and uploaded!");
            } catch (apiErr: any) {
              const proceed = confirm(`Conversion failed: ${apiErr.message}\n\nSave as standard YouTube link instead?`);
              if (!proceed) { setSaving(false); return; }
            }
          }
        } else if (type === "upload" && file) {
          finalUrl = await uploadToTelegram(file, name.trim());
        }

        const song: Song = {
          id: songId, name: name.trim(), description: description.trim(),
          url: finalUrl, type: finalType, youtubeId: finalYoutubeId,
          startTime: startTime ? parseInt(startTime, 10) : undefined,
          endTime: endTime ? parseInt(endTime, 10) : undefined,
          isMultiPart: false,
          createdAt: isNew ? new Date().toISOString() : (songs.find(s => s.id === id)?.createdAt || new Date().toISOString()),
        };
        await saveSongDB(song);
      }

      setShowCreate(false);
      resetForm();
      reload();
    } catch (err: any) {
      console.error(err);
      alert("An unexpected error occurred while saving the song.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setId(""); setName(""); setDescription(""); setUrl(""); setType("direct");
    setStartTime(""); setEndTime(""); setFile(null);
    setSongStructure("one-part");
    setParts([{ label: "Part 1", url: "", file: null, uploadType: "direct" }]);
  };

  const editSong = (s: Song) => {
    setId(s.id);
    setName(s.name);
    setDescription(s.description || "");
    if (s.isMultiPart && s.parts) {
      setSongStructure("multi-part");
      setParts(s.parts.map(p => ({ label: p.label, url: p.url, file: null, uploadType: "direct" as const })));
    } else {
      setSongStructure("one-part");
      setType(s.type || "direct");
      setUrl(s.url || (s.type === "youtube" ? `https://www.youtube.com/watch?v=${s.youtubeId}` : ""));
      setStartTime(s.startTime ? String(s.startTime) : "");
      setEndTime(s.endTime ? String(s.endTime) : "");
    }
    setShowCreate(true);
  };

  const handleDelete = async (songId: string) => {
    if (!confirm("Delete this song from the library?")) return;
    if (playingId === songId && audioObj) { audioObj.pause(); setPlayingId(null); }
    await deleteSongDB(songId);
    reload();
  };

  // ── Mass Upload ───────────────────────────────────────────
  const updateMassEntry = (idx: number, field: keyof MassEntry, value: any) => {
    setMassEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const addMassEntry = () => {
    setMassEntries(prev => [...prev, { name: "", description: "", uploadType: "direct", url: "", file: null }]);
  };

  const removeMassEntry = (idx: number) => {
    setMassEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMassSave = async () => {
    for (let i = 0; i < massEntries.length; i++) {
      const e = massEntries[i];
      if (!e.name.trim()) { alert(`Song ${i + 1}: Please provide a name.`); return; }
      if (e.uploadType === "direct" && !e.url.trim()) { alert(`Song ${i + 1}: Please provide a URL.`); return; }
      if (e.uploadType === "upload" && !e.file) { alert(`Song ${i + 1}: Please select a file.`); return; }
    }
    setMassSaving(true);
    const progress: string[] = [];
    for (let i = 0; i < massEntries.length; i++) {
      const e = massEntries[i];
      try {
        let finalUrl = e.url.trim();
        if (e.uploadType === "upload" && e.file) {
          finalUrl = await uploadToTelegram(e.file, e.name.trim());
        }
        const song: Song = {
          id: `song_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: e.name.trim(),
          description: e.description.trim(),
          url: finalUrl,
          type: "direct",
          isMultiPart: false,
          createdAt: new Date().toISOString(),
        };
        await saveSongDB(song);
        progress.push(`✅ ${e.name}`);
      } catch (err: any) {
        console.error(err);
        progress.push(`❌ ${e.name}: Failed to save`);
      }
      setMassProgress([...progress]);
    }
    setMassSaving(false);
    reload();
    setTimeout(() => {
      setShowMass(false);
      setMassEntries([{ name: "", description: "", uploadType: "direct", url: "", file: null }]);
      setMassProgress([]);
    }, 2000);
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #CBD5E1", background: "#fff",
    color: "#0F172A", fontSize: 14, outline: "none",
  };
  const card: React.CSSProperties = {
    background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)", padding: "20px 24px",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A" }}>Audio Library</h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>Manage background music and audio tracks for templates</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setShowMass(!showMass); setShowCreate(false); }}
            style={{ background: showMass ? "#6366F1" : "#EEF2FF", color: showMass ? "#fff" : "#4338CA", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer" }}>
            {showMass ? "✕ Cancel Mass" : "📦 Mass Upload"}
          </button>
          <button onClick={() => { resetForm(); setShowCreate(!showCreate); setShowMass(false); }}
            style={{ background: "#0F172A", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer" }}>
            {showCreate ? "✕ Cancel" : "+ Add Song"}
          </button>
        </div>
      </div>

      {showMass && (
        <div style={{ ...card, marginBottom: 24, border: "1px solid #6366F1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#4338CA", margin: 0 }}>Mass Upload Audio</h3>
              <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>Add multiple songs quickly without clicking save every time.</p>
            </div>
            <button onClick={addMassEntry} style={{ background: "#4338CA", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
              + Add Row
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {massEntries.map((entry, idx) => (
              <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#F8FAFC", padding: 16, borderRadius: 10, border: "1px solid #E2E8F0" }}>
                <div style={{ flex: 1, display: "grid", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input value={entry.name} onChange={e => updateMassEntry(idx, "name", e.target.value)} placeholder="Song Title *" style={inp} />
                    <input value={entry.description} onChange={e => updateMassEntry(idx, "description", e.target.value)} placeholder="Artist / Description" style={inp} />
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                      <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <input type="radio" checked={entry.uploadType === "direct"} onChange={() => updateMassEntry(idx, "uploadType", "direct")} /> URL
                      </label>
                      <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <input type="radio" checked={entry.uploadType === "upload"} onChange={() => updateMassEntry(idx, "uploadType", "upload")} /> File
                      </label>
                    </div>
                    <div style={{ flex: 1 }}>
                      {entry.uploadType === "direct" ? (
                        <input type="url" value={entry.url} onChange={e => updateMassEntry(idx, "url", e.target.value)} placeholder="https://..." style={inp} />
                      ) : (
                        <input type="file" accept="audio/*" onChange={e => updateMassEntry(idx, "file", e.target.files?.[0] || null)} style={{ ...inp, padding: "7px 14px" }} />
                      )}
                    </div>
                  </div>
                </div>
                {massEntries.length > 1 && (
                  <button onClick={() => removeMassEntry(idx)} style={{ background: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: 8, padding: "10px", cursor: "pointer", flexShrink: 0 }}>
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ flex: 1, marginRight: 20 }}>
              {massProgress.length > 0 && (
                <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4, maxHeight: 100, overflowY: "auto", background: "#F1F5F9", padding: 10, borderRadius: 8 }}>
                  {massProgress.map((p, i) => <div key={i}>{p}</div>)}
                </div>
              )}
            </div>
            <button onClick={handleMassSave} disabled={massSaving} style={{ background: massSaving ? "#94A3B8" : "#10B981", color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontWeight: 700, cursor: "pointer", fontSize: 15, flexShrink: 0 }}>
              {massSaving ? "Saving All..." : `Save All ${massEntries.length} Songs`}
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <div style={{ ...card, marginBottom: 24, border: "1px solid #CBD5E1" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: "#0F172A" }}>{id ? "Edit Song" : "Add New Song"}</h3>

          {/* ── STEP 1: Song Structure ── */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 10 }}>Song Upload Type *</label>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { val: "one-part", label: "🎵 One Part", desc: "Normal single audio file" },
                { val: "multi-part", label: "🎶 Multi Part", desc: "Multiple parts / segments" },
              ].map(opt => (
                <div key={opt.val}
                  onClick={() => setSongStructure(opt.val as any)}
                  style={{
                    flex: 1, padding: "14px 16px", borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
                    border: `2px solid ${songStructure === opt.val ? "#6366F1" : "#E2E8F0"}`,
                    background: songStructure === opt.val ? "#EEF2FF" : "#F8FAFC",
                  }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: songStructure === opt.val ? "#4338CA" : "#0F172A" }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Song Title ── */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Song Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tum Hi Ho" style={inp} />
          </div>

          {/* ── ONE PART ── */}
          {songStructure === "one-part" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 8 }}>Upload Method</label>
                <div style={{ display: "flex", gap: 16 }}>
                  {[["direct", "🔗 Direct URL"], ["youtube", "▶️ YouTube"], ["upload", "📤 Upload MP3"]].map(([v, l]) => (
                    <label key={v} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer" }}>
                      <input type="radio" name="type" checked={type === v} onChange={() => setType(v as any)} /> {l}
                    </label>
                  ))}
                </div>
              </div>

              {type === "direct" && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>Audio URL *</label>
                  <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/audio.mp3" style={inp} />
                </div>
              )}

              {type === "youtube" && (
                <div style={{ background: "#FEF2F2", padding: 16, borderRadius: 10, border: "1px solid #FECACA" }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#991B1B", display: "block", marginBottom: 6 }}>YouTube URL *</label>
                  <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." style={{ ...inp, borderColor: "#FECACA" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#991B1B", display: "block", marginBottom: 4 }}>Start (sec)</label>
                      <input type="number" value={startTime} onChange={e => setStartTime(e.target.value)} placeholder="e.g. 15" style={{ ...inp, borderColor: "#FECACA" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#991B1B", display: "block", marginBottom: 4 }}>End (sec)</label>
                      <input type="number" value={endTime} onChange={e => setEndTime(e.target.value)} placeholder="e.g. 60" style={{ ...inp, borderColor: "#FECACA" }} />
                    </div>
                  </div>
                </div>
              )}

              {type === "upload" && (
                <div style={{ background: "#F0F9FF", padding: 16, borderRadius: 10, border: "1px solid #BAE6FD" }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#0369A1", display: "block", marginBottom: 6 }}>Select Audio File *</label>
                  <input type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ ...inp, borderColor: "#BAE6FD" }} />
                  <p style={{ fontSize: 12, color: "#0284C7", marginTop: 8 }}>File will be uploaded and hosted on Telegram permanently.</p>
                </div>
              )}
            </div>
          )}

          {/* ── MULTI PART ── */}
          {songStructure === "multi-part" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>Song Parts ({parts.length})</label>
                <button onClick={addPart}
                  style={{ background: "#6366F1", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                  + Add Part
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {parts.map((part, idx) => (
                  <div key={idx} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#6366F1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <input
                        value={part.label}
                        onChange={e => updatePart(idx, "label", e.target.value)}
                        placeholder={`Part ${idx + 1}`}
                        style={{ ...inp, fontWeight: 600 }}
                      />
                      {parts.length > 1 && (
                        <button onClick={() => removePart(idx)}
                          style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontWeight: 700, flexShrink: 0 }}>
                          ✕
                        </button>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                      {[["direct", "🔗 Direct URL"], ["upload", "📤 Upload MP3"]].map(([v, l]) => (
                        <label key={v} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                          <input type="radio" name={`partType_${idx}`} checked={part.uploadType === v} onChange={() => updatePart(idx, "uploadType", v)} /> {l}
                        </label>
                      ))}
                    </div>

                    {part.uploadType === "direct" ? (
                      <input type="url" value={part.url} onChange={e => updatePart(idx, "url", e.target.value)}
                        placeholder="https://example.com/audio.mp3" style={inp} />
                    ) : (
                      <div style={{ background: "#F0F9FF", padding: 12, borderRadius: 8, border: "1px solid #BAE6FD" }}>
                        <input type="file" accept="audio/*" onChange={e => updatePart(idx, "file", e.target.files?.[0] || null)}
                          style={{ ...inp, borderColor: "#BAE6FD" }} />
                        <p style={{ fontSize: 11, color: "#0284C7", marginTop: 6 }}>Will be uploaded to Telegram on save.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>Description (Optional)</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Upbeat piano background music" style={inp} />
          </div>

          <button onClick={handleCreateOrUpdate} disabled={saving}
            style={{ marginTop: 20, background: saving ? "#94A3B8" : "#10B981", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            {saving ? "Saving..." : "Save Song"}
          </button>
        </div>
      )}

      {/* Songs List */}
      <div style={{ display: "grid", gap: 16 }}>
        {songs.map(s => (
          <div key={s.id} style={{ ...card, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: 16 }}>
              <button onClick={() => togglePlay(s)}
                style={{
                  width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                  background: playingId === s.id ? "#DBEAFE" : "#F1F5F9",
                  color: playingId === s.id ? "#1D4ED8" : "#64748B",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>
                {s.isMultiPart ? "🎶" : (playingId === s.id ? "⏸" : "▶️")}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>{s.name}</h3>
                  {s.isMultiPart ? (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#EEF2FF", color: "#4338CA" }}>
                      🎶 {s.parts?.length || 0} Parts
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: s.type === "youtube" ? "#FEE2E2" : "#E0E7FF", color: s.type === "youtube" ? "#991B1B" : "#3730A3" }}>
                      {s.type === "youtube" ? "▶️ YouTube" : "🔗 Direct"}
                    </span>
                  )}
                </div>

                {/* Show parts preview */}
                {s.isMultiPart && s.parts && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                    {s.parts.map((p, i) => (
                      <span key={i} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: "#F1F5F9", color: "#334155", border: "1px solid #E2E8F0" }}>
                        {p.label}
                      </span>
                    ))}
                  </div>
                )}

                {s.description && <p style={{ fontSize: 13, color: "#64748B", marginBottom: 4 }}>{s.description}</p>}
                <p style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>ID: {s.id}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <button onClick={() => editSong(s)} style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, background: "#EFF6FF", color: "#1D4ED8", border: "none", borderRadius: 6, cursor: "pointer" }}>
                Edit
              </button>
              <button onClick={() => handleDelete(s.id)} style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 6, cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </div>
        ))}

        {songs.length === 0 && !showCreate && (
          <div style={{ textAlign: "center", padding: "60px 0", background: "#fff", borderRadius: 12, border: "1px dashed #CBD5E1" }}>
            <p style={{ fontSize: 32 }}>🎵</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginTop: 12 }}>No audio tracks added</p>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Add a song to use in your templates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
