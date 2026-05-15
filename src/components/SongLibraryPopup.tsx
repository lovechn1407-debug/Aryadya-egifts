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
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="pop-in" style={{
        background: "#FFFFFF", borderRadius: 20, width: "100%", maxWidth: 480,
        maxHeight: "85vh", display: "flex", flexDirection: "column",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid #E2E8F0",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#0F172A" }}>
            Audio Library 🎵
          </h2>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "#64748B"
          }}>✕</button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            <p style={{ textAlign: "center", color: "#64748B", padding: "40px 0" }}>Loading library...</p>
          ) : songs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
              <p style={{ color: "#64748B", fontSize: 14 }}>No songs found in the library.</p>
              <p style={{ color: "#94A3B8", fontSize: 12, marginTop: 4 }}>Add songs from the Admin Panel.</p>
            </div>
          ) : (
            songs.map(song => (
              <div key={song.id} style={{
                display: "flex", alignItems: "center", gap: 16, padding: 16,
                border: "1px solid #E2E8F0", borderRadius: 12, background: "#F8FAFC",
                transition: "all 0.2s"
              }}>
                <button
                  onClick={() => togglePlay(song)}
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: playingId === song.id ? "#DBEAFE" : "#FFFFFF",
                    color: playingId === song.id ? "#1D4ED8" : "#64748B",
                    border: "1px solid #CBD5E1", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
                  }}
                >
                  {playingId === song.id ? "⏸" : "▶️"}
                </button>

                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", margin: 0 }}>{song.name}</h4>
                  {song.description && <p style={{ fontSize: 12, color: "#64748B", margin: "2px 0 0 0" }}>{song.description}</p>}
                </div>

                <button
                  onClick={() => handleSelect(song)}
                  style={{
                    padding: "8px 16px", borderRadius: 8, background: "#0F172A",
                    color: "#FFFFFF", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer"
                  }}
                >
                  Select
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
