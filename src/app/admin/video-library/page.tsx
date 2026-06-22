"use client";
import { useState, useEffect } from "react";
import { LibraryVideo, getLibraryVideosDB, saveLibraryVideoDB, deleteLibraryVideoDB } from "@/lib/db";

const BOT_TOKEN = "8832668653:AAER53dyUKzFn6lXK3ex2dtEEgErTTNSjlw";
const CHAT_ID = "-1003915557006";

interface MassEntry {
  name: string;
  uploadType: "direct" | "upload";
  url: string;
  file: File | null;
}

export default function AdminVideoLibraryPage() {
  const [videos, setVideos] = useState<LibraryVideo[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mass upload
  const [showMass, setShowMass] = useState(false);
  const [massEntries, setMassEntries] = useState<MassEntry[]>([
    { name: "", uploadType: "direct", url: "", file: null }
  ]);
  const [massSaving, setMassSaving] = useState(false);
  const [massProgress, setMassProgress] = useState<string[]>([]);

  // Meta
  const [id, setId] = useState("");
  const [name, setName] = useState("");

  // Video fields
  const [type, setType] = useState<"direct" | "upload">("direct");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");

  const reload = async () => {
    const data = await getLibraryVideosDB();
    setVideos(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  };

  useEffect(() => {
    reload();
  }, []);

  const uploadToTelegramVideo = async (f: File, title: string): Promise<string> => {
    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("video", f);
    formData.append("caption", title);
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.description || "Failed to upload video to Telegram");
    return `/api/tg-video/${data.result.video.file_id}`;
  };

  const handleCreateOrUpdate = async () => {
    if (!name.trim()) {
      alert("Please provide a Video Name.");
      return;
    }

    if (type === "direct" && !url.trim()) {
      alert("Please provide a Video URL.");
      return;
    }
    if (type === "upload" && !file && !id) {
      alert("Please select a video file.");
      return;
    }

    setSaving(true);
    try {
      const isNew = !id;
      const videoId = isNew
        ? `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        : id;

      let finalUrl = url.trim();

      if (type === "upload" && file) {
        finalUrl = await uploadToTelegramVideo(file, name.trim());
      }

      const video: LibraryVideo = {
        id: videoId,
        name: name.trim(),
        url: finalUrl,
        createdAt: isNew
          ? new Date().toISOString()
          : (videos.find((v) => v.id === id)?.createdAt || new Date().toISOString()),
      };

      await saveLibraryVideoDB(video);
      setShowCreate(false);
      resetForm();
      reload();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setId("");
    setName("");
    setUrl("");
    setType("direct");
    setFile(null);
  };

  const editVideo = (v: LibraryVideo) => {
    setId(v.id);
    setName(v.name);
    setUrl(v.url);
    setType(v.url.startsWith("/api/tg-video") ? "upload" : "direct");
    setShowCreate(true);
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm("Delete this video from the library?")) return;
    await deleteLibraryVideoDB(videoId);
    reload();
  };

  // ── Mass Upload ───────────────────────────────────────────
  const updateMassEntry = (idx: number, field: keyof MassEntry, value: any) => {
    setMassEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
    );
  };

  const addMassEntry = () => {
    setMassEntries((prev) => [...prev, { name: "", uploadType: "direct", url: "", file: null }]);
  };

  const removeMassEntry = (idx: number) => {
    setMassEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMassSave = async () => {
    for (let i = 0; i < massEntries.length; i++) {
      const e = massEntries[i];
      if (!e.name.trim()) {
        alert(`Video ${i + 1}: Please provide a name.`);
        return;
      }
      if (e.uploadType === "direct" && !e.url.trim()) {
        alert(`Video ${i + 1}: Please provide a URL.`);
        return;
      }
      if (e.uploadType === "upload" && !e.file) {
        alert(`Video ${i + 1}: Please select a file.`);
        return;
      }
    }
    setMassSaving(true);
    const progress: string[] = [];
    for (let i = 0; i < massEntries.length; i++) {
      const e = massEntries[i];
      try {
        let finalUrl = e.url.trim();
        if (e.uploadType === "upload" && e.file) {
          finalUrl = await uploadToTelegramVideo(e.file, e.name.trim());
        }
        const video: LibraryVideo = {
          id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: e.name.trim(),
          url: finalUrl,
          createdAt: new Date().toISOString(),
        };
        await saveLibraryVideoDB(video);
        progress.push(`✅ ${e.name}`);
      } catch (err: any) {
        progress.push(`❌ ${e.name}: ${err.message}`);
      }
      setMassProgress([...progress]);
    }
    setMassSaving(false);
    reload();
    setTimeout(() => {
      setShowMass(false);
      setMassEntries([{ name: "", uploadType: "direct", url: "", file: null }]);
      setMassProgress([]);
    }, 2000);
  };

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    background: "#fff",
    color: "#0F172A",
    fontSize: 14,
    outline: "none",
  };
  const card: React.CSSProperties = {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    padding: "20px 24px",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A" }}>Video Library</h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
            Manage background videos for retro TV and layout scenes
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => {
              setShowMass(!showMass);
              setShowCreate(false);
            }}
            style={{
              background: showMass ? "#6366F1" : "#EEF2FF",
              color: showMass ? "#fff" : "#4338CA",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {showMass ? "✕ Cancel Mass" : "📦 Mass Upload"}
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowCreate(!showCreate);
              setShowMass(false);
            }}
            style={{
              background: "#0F172A",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {showCreate ? "✕ Cancel" : "+ Add Video"}
          </button>
        </div>
      </div>

      {showMass && (
        <div style={{ ...card, marginBottom: 24, border: "1px solid #6366F1" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#4338CA", margin: 0 }}>
                Mass Upload Video
              </h3>
              <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
                Add multiple videos quickly.
              </p>
            </div>
            <button
              onClick={addMassEntry}
              style={{
                background: "#4338CA",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              + Add Row
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {massEntries.map((entry, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  background: "#F8FAFC",
                  padding: 16,
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                }}
              >
                <div style={{ flex: 1, display: "grid", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                    <input
                      value={entry.name}
                      onChange={(e) => updateMassEntry(idx, "name", e.target.value)}
                      placeholder="Video Title *"
                      style={inp}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                      <label
                        style={{
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          checked={entry.uploadType === "direct"}
                          onChange={() => updateMassEntry(idx, "uploadType", "direct")}
                        />{" "}
                        URL
                      </label>
                      <label
                        style={{
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          checked={entry.uploadType === "upload"}
                          onChange={() => updateMassEntry(idx, "uploadType", "upload")}
                        />{" "}
                        File
                      </label>
                    </div>
                    <div style={{ flex: 1 }}>
                      {entry.uploadType === "direct" ? (
                        <input
                          type="url"
                          value={entry.url}
                          onChange={(e) => updateMassEntry(idx, "url", e.target.value)}
                          placeholder="https://..."
                          style={inp}
                        />
                      ) : (
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) =>
                            updateMassEntry(idx, "file", e.target.files?.[0] || null)
                          }
                          style={{ ...inp, padding: "7px 14px" }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {massEntries.length > 1 && (
                  <button
                    onClick={() => removeMassEntry(idx)}
                    style={{
                      background: "#FEE2E2",
                      color: "#EF4444",
                      border: "none",
                      borderRadius: 8,
                      padding: "10px",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1, marginRight: 20 }}>
              {massProgress.length > 0 && (
                <div
                  style={{
                    fontSize: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    maxHeight: 100,
                    overflowY: "auto",
                    background: "#F1F5F9",
                    padding: 10,
                    borderRadius: 8,
                  }}
                >
                  {massProgress.map((p, i) => (
                    <div key={i}>{p}</div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleMassSave}
              disabled={massSaving}
              style={{
                background: massSaving ? "#94A3B8" : "#10B981",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 24px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              {massSaving ? "Saving All..." : `Save All ${massEntries.length} Videos`}
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <div style={{ ...card, marginBottom: 24, border: "1px solid #CBD5E1" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: "#0F172A" }}>
            {id ? "Edit Video" : "Add New Video"}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Video Title */}
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#334155",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Video Title *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Favorite Movie"
                style={inp}
              />
            </div>

            {/* Upload Method */}
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#334155",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Upload Method
              </label>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  ["direct", "🔗 Direct URL"],
                  ["upload", "📤 Upload Video"],
                ].map(([v, l]) => (
                  <label
                    key={v}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="type"
                      checked={type === v}
                      onChange={() => setType(v as any)}
                    />{" "}
                    {l}
                  </label>
                ))}
              </div>
            </div>

            {type === "direct" && (
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#334155",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Video URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  style={inp}
                />
              </div>
            )}

            {type === "upload" && (
              <div style={{ background: "#F0F9FF", padding: 16, borderRadius: 10, border: "1px solid #BAE6FD" }}>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0369A1",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Select Video File *
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ ...inp, borderColor: "#BAE6FD" }}
                />
                <p style={{ fontSize: 12, color: "#0284C7", marginTop: 8 }}>
                  File will be uploaded and hosted on Telegram permanently.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleCreateOrUpdate}
            disabled={saving}
            style={{
              marginTop: 20,
              background: saving ? "#94A3B8" : "#10B981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {saving ? "Saving..." : "Save Video"}
          </button>
        </div>
      )}

      {/* Videos List */}
      <div style={{ display: "grid", gap: 16 }}>
        {videos.map((v) => (
          <div
            key={v.id}
            style={{
              ...card,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
              {/* HTML5 Live Video Preview */}
              <div
                style={{
                  width: 80,
                  height: 50,
                  borderRadius: 6,
                  overflow: "hidden",
                  background: "#000",
                  flexShrink: 0,
                }}
              >
                <video
                  src={v.url}
                  muted
                  playsInline
                  autoPlay
                  loop
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0F172A",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v.name}
                  </h3>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: v.url.startsWith("/api/tg-video") ? "#E0E7FF" : "#F1F5F9",
                      color: v.url.startsWith("/api/tg-video") ? "#3730A3" : "#475569",
                    }}
                  >
                    {v.url.startsWith("/api/tg-video") ? "📤 TG Hosted" : "🔗 External Link"}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#64748B",
                    margin: 0,
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  URL: {v.url}
                </p>
                <p style={{ fontSize: 11, color: "#94A3B8", margin: "4px 0 0" }}>ID: {v.id}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <button
                onClick={() => editVideo(v)}
                style={{
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(v.id)}
                style={{
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  background: "#FEF2F2",
                  color: "#DC2626",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {videos.length === 0 && !showCreate && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              background: "#fff",
              borderRadius: 12,
              border: "1px dashed #CBD5E1",
            }}
          >
            <p style={{ fontSize: 32, margin: 0 }}>📹</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginTop: 12 }}>
              No videos in library
            </p>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
              Add a video to make it available for the retro TV scene.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
