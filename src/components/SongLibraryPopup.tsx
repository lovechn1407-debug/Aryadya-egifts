"use client";
import { useState, useEffect } from "react";
import { Song } from "@/lib/data";
import { getSongsDB } from "@/lib/db";

export default function SongLibraryPopup({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (song: Song) => void;
}) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    getSongsDB().then(data => {
      setSongs(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });
  }, []);

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
      if (audioObj) audioObj.pause();
      const newAudio = new Audio(song.url);
      newAudio.play().catch(e => console.error("Could not play audio", e));
      newAudio.onended = () => setPlayingId(null);
      setAudioObj(newAudio);
      setPlayingId(song.id);
    }
  };

  const handleSelect = (song: Song) => {
    if (audioObj) audioObj.pause();
    onSelect(song);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="pop-in" style={{
        background: "#FFFFFF", borderRadius: 24, width: "100%", maxWidth: 520,
        maxHeight: "85vh", display: "flex", flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 32px", 
          background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
          borderBottom: "1px solid #E2E8F0",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#0F172A", letterSpacing: "-0.02em" }}>
              Audio Library
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B", fontWeight: 500 }}>
              Select a track for your template
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "50%",
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, cursor: "pointer", color: "#64748B", transition: "all 0.2s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#0F172A"; e.currentTarget.style.borderColor = "#CBD5E1"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#64748B"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 16, background: "#FFFFFF" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: 40, height: 40, border: "3px solid #E2E8F0", borderTopColor: "#3B82F6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "#64748B", fontWeight: 500 }}>Loading tracks...</p>
            </div>
          ) : songs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", background: "#F8FAFC", borderRadius: 16, border: "2px dashed #E2E8F0" }}>
              <div style={{ width: 64, height: 64, background: "#FFFFFF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                📭
              </div>
              <p style={{ color: "#0F172A", fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>No audio tracks found</p>
              <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Upload some songs from the Admin Panel first.</p>
            </div>
          ) : (
            songs.map(song => {
              const isActive = playingId === song.id;
              return (
                <div key={song.id} style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
                  border: `2px solid ${isActive ? "#3B82F6" : "#F1F5F9"}`, 
                  borderRadius: 16, 
                  background: isActive ? "#EFF6FF" : "#FFFFFF",
                  transition: "all 0.2s",
                  boxShadow: isActive ? "0 4px 12px rgba(59, 130, 246, 0.1)" : "0 2px 4px rgba(0,0,0,0.02)",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = "#E2E8F0"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = "#F1F5F9"; }}
                >
                  <button
                    onClick={() => togglePlay(song)}
                    style={{
                      width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                      background: isActive ? "#3B82F6" : "#F8FAFC",
                      color: isActive ? "#FFFFFF" : "#64748B",
                      border: `1px solid ${isActive ? "#3B82F6" : "#E2E8F0"}`, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                      transition: "all 0.2s"
                    }}
                  >
                    {isActive ? "⏸" : "▶️"}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: isActive ? "#1E3A8A" : "#0F172A", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {song.name}
                    </h4>
                    <p style={{ fontSize: 13, color: isActive ? "#3B82F6" : "#64748B", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {song.description || "Unknown Artist"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelect(song)}
                    style={{
                      padding: "10px 20px", borderRadius: 10, flexShrink: 0,
                      background: isActive ? "#1E3A8A" : "#0F172A",
                      color: "#FFFFFF", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  >
                    Select
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
