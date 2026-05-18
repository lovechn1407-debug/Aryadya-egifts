"use client";
import { useState, useEffect } from "react";
import { Song } from "@/lib/data";
import { getSongsDB } from "@/lib/db";
import { Play, Pause, X, Music, ChevronDown, ChevronUp } from "lucide-react";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playingPartIdx, setPlayingPartIdx] = useState<number | null>(null);

  useEffect(() => {
    getSongsDB().then(data => {
      setSongs(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (audioObj) { audioObj.pause(); audioObj.currentTime = 0; }
    };
  }, [audioObj]);

  const stopAudio = () => {
    audioObj?.pause();
    setPlayingId(null);
    setPlayingPartIdx(null);
  };

  const togglePlay = (song: Song) => {
    if (song.isMultiPart) return; // multi-part previewed per-part
    if (playingId === song.id) {
      stopAudio();
    } else {
      stopAudio();
      const newAudio = new Audio(song.url);
      newAudio.play().catch(e => console.error("Could not play audio", e));
      newAudio.onended = () => { setPlayingId(null); setPlayingPartIdx(null); };
      setAudioObj(newAudio);
      setPlayingId(song.id);
    }
  };

  const togglePlayPart = (song: Song, partIdx: number, partUrl: string) => {
    const uid = `${song.id}_${partIdx}`;
    if (playingId === uid) {
      stopAudio();
    } else {
      stopAudio();
      const newAudio = new Audio(partUrl);
      newAudio.play().catch(e => console.error("Could not play audio", e));
      newAudio.onended = () => { setPlayingId(null); setPlayingPartIdx(null); };
      setAudioObj(newAudio);
      setPlayingId(uid);
      setPlayingPartIdx(partIdx);
    }
  };

  const handleSelect = (song: Song) => {
    stopAudio();
    onSelect(song);
  };

  const handleSelectPart = (song: Song, partIdx: number) => {
    stopAudio();
    // Deliver a "flat" song representing this specific part
    const part = song.parts![partIdx];
    const partSong: Song = {
      ...song,
      name: `${song.name} — ${part.label}`,
      url: part.url,
      isMultiPart: false,
      parts: undefined,
    };
    onSelect(partSong);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="pop-in" style={{
        background: "#FFFFFF", borderRadius: 20, width: "100%", maxWidth: 660,
        maxHeight: "88vh", display: "flex", flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 24px",
          background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
          borderBottom: "1px solid #E2E8F0",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0F172A", letterSpacing: "-0.01em" }}>
              Audio Library
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748B", fontWeight: 500 }}>
              Select a track for your template
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "50%",
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#64748B", transition: "all 0.2s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
          }}>
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12, background: "#FFFFFF" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ width: 32, height: 32, border: "3px solid #E2E8F0", borderTopColor: "#3B82F6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
              <p style={{ color: "#64748B", fontWeight: 500, fontSize: 13 }}>Loading tracks...</p>
            </div>
          ) : songs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", background: "#F8FAFC", borderRadius: 12, border: "2px dashed #E2E8F0" }}>
              <div style={{ width: 48, height: 48, background: "#FFFFFF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", color: "#CBD5E1" }}>
                <Music size={24} />
              </div>
              <p style={{ color: "#0F172A", fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>No audio tracks found</p>
              <p style={{ color: "#64748B", fontSize: 12, margin: 0 }}>Upload some songs from the Admin Panel first.</p>
            </div>
          ) : (
            songs.map(song => {
              const isActive = playingId === song.id;
              const isExpanded = expandedId === song.id;
              const isMulti = !!song.isMultiPart;

              return (
                <div key={song.id} style={{
                  border: `2px solid ${isActive || isExpanded ? "#6366F1" : "#F1F5F9"}`,
                  borderRadius: 12,
                  background: isExpanded ? "#F5F3FF" : (isActive ? "#EFF6FF" : "#FFFFFF"),
                  transition: "all 0.2s",
                  boxShadow: isActive || isExpanded ? "0 4px 12px rgba(99,102,241,0.1)" : "0 2px 4px rgba(0,0,0,0.02)",
                  overflow: "hidden",
                }}>
                  {/* Song Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
                    {/* Play/Icon button */}
                    <button
                      onClick={() => isMulti ? setExpandedId(isExpanded ? null : song.id) : togglePlay(song)}
                      style={{
                        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                        background: isActive || isExpanded ? "#6366F1" : "#F8FAFC",
                        color: isActive || isExpanded ? "#FFFFFF" : "#64748B",
                        border: `1px solid ${isActive || isExpanded ? "#6366F1" : "#E2E8F0"}`,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s", fontSize: 18
                      }}>
                      {isMulti
                        ? (isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)
                        : (isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: 2 }} />)
                      }
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: isExpanded ? "#4338CA" : "#0F172A", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {song.name}
                        </h4>
                        {isMulti && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "#EEF2FF", color: "#4338CA", flexShrink: 0 }}>
                            🎶 {song.parts?.length} Parts
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: "#64748B", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {isMulti
                          ? `${song.parts?.map(p => p.label).join(" · ")}`
                          : (song.description || "Audio Track")}
                      </p>
                    </div>

                    {/* Select button (only for single-part songs) */}
                    {!isMulti && (
                      <button
                        onClick={() => handleSelect(song)}
                        style={{
                          padding: "8px 16px", borderRadius: 8, flexShrink: 0,
                          background: isActive ? "#4338CA" : "#0F172A",
                          color: "#FFFFFF", fontWeight: 600, fontSize: 12, border: "none", cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      >
                        Select
                      </button>
                    )}

                    {/* Expand toggle for multi-part */}
                    {isMulti && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : song.id)}
                        style={{
                          padding: "8px 14px", borderRadius: 8, flexShrink: 0,
                          background: isExpanded ? "#4338CA" : "#EEF2FF",
                          color: isExpanded ? "#fff" : "#4338CA",
                          fontWeight: 600, fontSize: 12, border: "none", cursor: "pointer",
                          transition: "all 0.2s"
                        }}>
                        {isExpanded ? "Collapse ▲" : "Show Parts ▼"}
                      </button>
                    )}
                  </div>

                  {/* Parts panel (only for multi-part when expanded) */}
                  {isMulti && isExpanded && song.parts && (
                    <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ height: 1, background: "#E0E7FF", marginBottom: 8 }} />
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#6366F1", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>
                        Select a Part
                      </p>
                      {song.parts.map((part, idx) => {
                        const partPlayId = `${song.id}_${idx}`;
                        const isPartPlaying = playingId === partPlayId;
                        return (
                          <div key={idx} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            background: isPartPlaying ? "#EEF2FF" : "#fff",
                            border: `1.5px solid ${isPartPlaying ? "#6366F1" : "#E2E8F0"}`,
                            borderRadius: 10, padding: "10px 14px", transition: "all 0.2s"
                          }}>
                            {/* Part play */}
                            <button
                              onClick={() => togglePlayPart(song, idx, part.url)}
                              style={{
                                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                                background: isPartPlaying ? "#6366F1" : "#F1F5F9",
                                color: isPartPlaying ? "#fff" : "#64748B",
                                border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s"
                              }}>
                              {isPartPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" style={{ marginLeft: 1 }} />}
                            </button>

                            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: isPartPlaying ? "#4338CA" : "#0F172A" }}>
                              {part.label}
                            </span>

                            <button
                              onClick={() => handleSelectPart(song, idx)}
                              style={{
                                padding: "6px 14px", borderRadius: 7,
                                background: "#6366F1", color: "#fff",
                                fontWeight: 600, fontSize: 12, border: "none", cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "#4338CA"}
                              onMouseLeave={e => e.currentTarget.style.background = "#6366F1"}
                            >
                              Use This Part
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
