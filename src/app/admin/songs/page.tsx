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
  const [url, setUrl] = useState("");
  
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

  const handleCreateOrUpdate = async () => {
    if (!name.trim() || !url.trim()) {
      alert("Please provide at least a Song Name and Audio URL.");
      return;
    }
    setSaving(true);
    try {
      const isNew = !id;
      const songId = isNew ? `song_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` : id;
      
      const song: Song = {
        id: songId,
        name: name.trim(),
        description: description.trim(),
        url: url.trim(),
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
    setId(""); setName(""); setDescription(""); setUrl("");
  };

  const editSong = (s: Song) => {
    setId(s.id);
    setName(s.name);
    setDescription(s.description);
    setUrl(s.url);
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
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Song Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Happy Birthday Instrumental" style={inputStyle} />
            </div>
            
            <div>
              <label style={{ fontSize: 13, color: "#334155", fontWeight: 600, display: "block", marginBottom: 6 }}>Audio URL (Direct Link) *</label>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/audio.mp3" style={inputStyle} />
              <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Provide a direct link to an mp3 or audio file. Make sure it has CORS enabled.</p>
            </div>

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
                {s.description && <p style={{ fontSize: 13, color: "#64748B", marginBottom: 4 }}>{s.description}</p>}
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
