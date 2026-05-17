"use client";
import { useState, useEffect } from "react";
import { Song } from "@/lib/data";
import { getSongsDB, saveSongDB, deleteSongDB } from "@/lib/db";

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"direct" | "youtube" | "upload">("direct");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  // Audio playback state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  const reload = async () => {
    const data = await getSongsDB();
    setSongs(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  };

  useEffect(() => { reload(); }, []);

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (audioObj) {
        audioObj.pause();
        audioObj.currentTime = 0;
      }
    };
  }, [audioObj]);

  const togglePlay = (song: Song) => {
    if (song.type === "youtube") {
      alert("YouTube audio playback is only supported on the template preview and actual gift page. Please check the actual site to preview it.");
      return;
    }
    if (playingId === song.id) {
      audioObj?.pause();
      setPlayingId(null);
    } else {
      if (audioObj) {
        audioObj.pause();
      }
      const newAudio = new Audio(song.url);
      newAudio.play().catch(e => alert("Could not play audio. Link might be invalid or restricted by CORS."));
      
      newAudio.onended = () => setPlayingId(null);
      
      setAudioObj(newAudio);
      setPlayingId(song.id);
    }
  };

  const extractYouTubeID = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : "";
  };

  const handleCreateOrUpdate = async () => {
    if (!name.trim()) {
      alert("Please provide a Song Name.");
      return;
    }
    if (type === "direct" && !url.trim()) {
      alert("Please provide an Audio URL for direct link.");
      return;
    }
    if (type === "upload" && !file) {
      alert("Please select an MP3 file to upload.");
      return;
    }
    
    setSaving(true);
    try {
      const isNew = !id;
      const songId = isNew ? `song_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` : id;
      
      let finalUrl = url.trim();
      let finalType: "direct" | "youtube" = type === "upload" ? "direct" : type;
      let finalYoutubeId = "";
      
      if (type === "youtube") {
        finalYoutubeId = extractYouTubeID(url);
        const wantsConversion = confirm("Convert this YouTube video to MP3 and host it on Telegram database? \n\n(This process happens entirely online on Vercel's servers!)");
        
        if (wantsConversion) {
          try {
            const res = await fetch(`/api/yt?url=${encodeURIComponent(url.trim())}`);
            if (!res.ok) throw new Error("Vercel Python API failed to process video");
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            if (!data.file_id) throw new Error("No file_id returned from Telegram");
            
            finalUrl = `/api/tg-audio/${data.file_id}`;
            finalType = "direct";
            finalYoutubeId = ""; // Clear it since it's now direct
            alert("YouTube audio successfully converted and uploaded to Telegram database!");
          } catch (apiErr: any) {
            console.error("API Conversion Error:", apiErr);
            const proceed = confirm(`Conversion failed: ${apiErr.message}\n\nDo you want to save it as a standard YouTube link anyway?`);
            if (!proceed) {
              setSaving(false);
              return;
            }
          }
        }
      } else if (type === "upload" && file) {
        // Upload directly to Telegram from the browser
        const BOT_TOKEN = "8832668653:AAER53dyUKzFn6lXK3ex2dtEEgErTTNSjlw";
        const CHAT_ID = "-1003915557006";
        
        const formData = new FormData();
        formData.append("chat_id", CHAT_ID);
        formData.append("audio", file);
        formData.append("title", name.trim());
        
        try {
          const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendAudio`, {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (!data.ok) throw new Error(data.description || "Failed to upload to Telegram");
          
          const fileId = data.result.audio.file_id;
          finalUrl = `/api/tg-audio/${fileId}`;
          finalType = "direct";
          finalYoutubeId = "";
        } catch (uploadErr: any) {
          alert(`Upload failed: ${uploadErr.message}`);
          setSaving(false);
          return;
        }
      }
      
      const song: Song = {
        id: songId,
        name: name.trim(),
        description: description.trim(),
        url: finalUrl,
        type: finalType,
        youtubeId: finalYoutubeId,
        startTime: startTime ? parseInt(startTime, 10) : undefined,
        endTime: endTime ? parseInt(endTime, 10) : undefined,
        createdAt: isNew ? new Date().toISOString() : (songs.find(s => s.id === id)?.createdAt || new Date().toISOString()),
      };

      await saveSongDB(song);
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
    setId(""); setName(""); setDescription(""); setUrl(""); setType("direct"); setYoutubeId(""); setStartTime(""); setEndTime(""); setFile(null);
  };

  const editSong = (s: Song) => {
    setId(s.id);
    setName(s.name);
    setDescription(s.description || "");
    setType(s.type || "direct");
    setUrl(s.url || (s.type === "youtube" ? `https://www.youtube.com/watch?v=${s.youtubeId}` : ""));
    setYoutubeId(s.youtubeId || "");
    setStartTime(s.startTime ? String(s.startTime) : "");
    setEndTime(s.endTime ? String(s.endTime) : "");
    setShowCreate(true);
  };

  const handleDelete = async (songId: string) => {
    if (!confirm(`Delete this song from the library?`)) return;
    if (playingId === songId && audioObj) {
      audioObj.pause();
      setPlayingId(null);
    }
    await deleteSongDB(songId);
    reload();
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
            Audio Library
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
            Manage background music and audio tracks for templates
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowCreate(!showCreate); }} 
          style={{ background: "#0F172A", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#1E293B"}
          onMouseLeave={e => e.currentTarget.style.background = "#0F172A"}
        >
          {showCreate ? "✕ Cancel" : "+ Add Song"}
        </button>
      </div>

      {showCreate && (
        <div style={{ ...cardStyle, marginBottom: 24, border: "1px solid #CBD5E1" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#0F172A" }}>{id ? "Edit Song" : "Add New Song"}</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Upload Method *</label>
              <div style={{ display: "flex", gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer" }}>
                  <input type="radio" name="uploadType" checked={type === "direct"} onChange={() => setType("direct")} /> Direct MP3 Link
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer" }}>
                  <input type="radio" name="uploadType" checked={type === "youtube"} onChange={() => setType("youtube")} /> YouTube Link
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer" }}>
                  <input type="radio" name="uploadType" checked={type === "upload"} onChange={() => setType("upload")} /> Upload MP3 (Telegram)
                </label>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Song Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Happy Birthday Instrumental" style={inputStyle} />
            </div>
            
            {type === "direct" && (
              <div>
                <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Audio URL (Direct Link) *</label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/audio.mp3" style={inputStyle} />
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Provide a direct link to an mp3 or audio file. Make sure it has CORS enabled.</p>
              </div>
            )}

            {type === "youtube" && (
              <div style={{ padding: 16, background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA" }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, color: "#991B1B", fontWeight: 600, display: "block", marginBottom: 6 }}>YouTube Video URL *</label>
                  <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." style={{ ...inputStyle, borderColor: "#FECACA" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, color: "#991B1B", fontWeight: 600, display: "block", marginBottom: 6 }}>Start Time (Seconds)</label>
                    <input type="number" value={startTime} onChange={e => setStartTime(e.target.value)} placeholder="e.g. 15" style={{ ...inputStyle, borderColor: "#FECACA" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "#991B1B", fontWeight: 600, display: "block", marginBottom: 6 }}>End Time (Seconds)</label>
                    <input type="number" value={endTime} onChange={e => setEndTime(e.target.value)} placeholder="e.g. 45" style={{ ...inputStyle, borderColor: "#FECACA" }} />
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#B91C1C", marginTop: 8 }}>This will be converted to an MP3 and stored in your Telegram database permanently.</p>
              </div>
            )}

            {type === "upload" && (
              <div style={{ padding: 16, background: "#F0F9FF", borderRadius: 8, border: "1px solid #BAE6FD" }}>
                <label style={{ fontSize: 13, color: "#0369A1", fontWeight: 600, display: "block", marginBottom: 6 }}>Select Audio File (MP3, M4A) *</label>
                <input type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ ...inputStyle, borderColor: "#BAE6FD" }} />
                <p style={{ fontSize: 12, color: "#0284C7", marginTop: 8 }}>File will be uploaded and hosted on Telegram permanently.</p>
              </div>
            )}

            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Description (Optional)</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Upbeat piano background music" style={inputStyle} />
            </div>
          </div>
          
          <button onClick={handleCreateOrUpdate} disabled={saving} style={{ background: saving ? "#94A3B8" : "#10B981", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            {saving ? "Saving..." : "Save Song"}
          </button>
        </div>
      )}

      {/* Songs List */}
      <div style={{ display: "grid", gap: 16 }}>
        {songs.map(s => (
          <div key={s.id} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
              <button 
                onClick={() => togglePlay(s)}
                style={{ 
                  width: 48, height: 48, borderRadius: "50%", background: playingId === s.id ? "#DBEAFE" : "#F1F5F9", 
                  color: playingId === s.id ? "#1D4ED8" : "#64748B", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  transition: "all 0.2s"
                }}
              >
                {playingId === s.id ? "⏸" : "▶️"}
              </button>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{s.name}</h3>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: s.type === "youtube" ? "#FEE2E2" : "#E0E7FF", color: s.type === "youtube" ? "#991B1B" : "#3730A3" }}>
                    {s.type === "youtube" ? "▶️ YouTube" : "🔗 Direct URL"}
                  </span>
                  {s.description && <span style={{ fontSize: 13, color: "#64748B" }}>{s.description}</span>}
                </div>
                <p style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>ID: {s.id}</p>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
          <div style={{ textAlign: "center", padding: "60px 0", background: "#FFFFFF", borderRadius: 12, border: "1px dashed #CBD5E1" }}>
            <p style={{ fontSize: 32 }}>🎵</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginTop: 12 }}>No audio tracks added</p>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Add a song URL to use in your templates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
