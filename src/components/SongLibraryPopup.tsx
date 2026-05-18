"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Song } from "@/lib/data";
import { getSongsDB } from "@/lib/db";
import { Play, Pause, X, Music, ChevronDown, ChevronUp } from "lucide-react";

function formatTime(sec: number) {
  if (!isFinite(sec) || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SongLibraryPopup({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (song: Song) => void;
}) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  // Playback state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [progress, setProgress] = useState(0);      // 0-1
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Multi-part expansion
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getSongsDB().then(data => {
      setSongs(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPlayingId(null);
    setBuffering(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  useEffect(() => () => stopAudio(), [stopAudio]);

  const startAudio = (id: string, url: string) => {
    stopAudio();
    const audio = new Audio(url);
    audioRef.current = audio;

    setPlayingId(id);
    setBuffering(true);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    audio.addEventListener("canplay", () => setBuffering(false));
    audio.addEventListener("waiting", () => setBuffering(true));
    audio.addEventListener("playing", () => setBuffering(false));
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => {
      setPlayingId(null);
      setProgress(0);
      setCurrentTime(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    });

    const tick = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        setProgress(audioRef.current.duration ? audioRef.current.currentTime / audioRef.current.duration : 0);
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    audio.play().then(() => {
      rafRef.current = requestAnimationFrame(tick);
    }).catch(e => {
      console.error("Could not play audio", e);
      setPlayingId(null);
      setBuffering(false);
    });
  };

  const togglePlay = (id: string, url: string) => {
    if (playingId === id) {
      stopAudio();
    } else {
      startAudio(id, url);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    if (playingId !== id || !audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * audioRef.current.duration;
  };

  const handleSelect = (song: Song) => {
    stopAudio();
    onSelect(song);
  };

  const handleSelectPart = (song: Song, partIdx: number) => {
    stopAudio();
    const part = song.parts![partIdx];
    onSelect({
      ...song,
      name: `${song.name} — ${part.label}`,
      url: part.url,
      isMultiPart: false,
      parts: undefined,
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(15,23,42,0.65)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 12,
      fontFamily: "'Inter',sans-serif"
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 680,
        height: "85vh", maxHeight: 800, display: "flex", flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)", overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px", flexShrink: 0,
          background: "linear-gradient(135deg,#F8FAFC,#F1F5F9)",
          borderBottom: "1px solid #E2E8F0",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0F172A" }}>Audio Library</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748B" }}>Select a track for your template</p>
          </div>
          <button onClick={onClose} style={{
            background: "#fff", border: "1px solid #E2E8F0", borderRadius: "50%",
            width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#64748B", flexShrink: 0
          }}><X size={16} /></button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ width: 36, height: 36, border: "3px solid #E2E8F0", borderTopColor: "#6366F1", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
              <p style={{ color: "#64748B", fontSize: 13 }}>Loading tracks...</p>
            </div>
          ) : songs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", background: "#F8FAFC", borderRadius: 12, border: "2px dashed #E2E8F0" }}>
              <Music size={36} color="#CBD5E1" style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "#0F172A", fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>No audio tracks found</p>
              <p style={{ color: "#64748B", fontSize: 12, margin: 0 }}>Upload songs from the Admin Panel first.</p>
            </div>
          ) : (
            songs.map(song => {
              const isThisPlaying = playingId === song.id;
              const isExpanded = expandedId === song.id;
              const isMulti = !!song.isMultiPart;

              return (
                <div key={song.id} style={{
                  border: `2px solid ${isThisPlaying || isExpanded ? "#6366F1" : "#F1F5F9"}`,
                  borderRadius: 14,
                  background: isThisPlaying ? "#F5F3FF" : isExpanded ? "#FAFAFE" : "#fff",
                  transition: "border-color 0.2s, background 0.2s",
                  overflow: "hidden",
                }}>
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
                    {/* Play button */}
                    <button
                      onClick={() => isMulti
                        ? setExpandedId(isExpanded ? null : song.id)
                        : togglePlay(song.id, song.url)
                      }
                      style={{
                        width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                        background: isThisPlaying ? "#6366F1" : "#F1F5F9",
                        color: isThisPlaying ? "#fff" : "#475569",
                        border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        position: "relative", transition: "all 0.2s"
                      }}>
                      {/* Buffer spinner overlay */}
                      {isThisPlaying && buffering && (
                        <div style={{
                          position: "absolute", inset: 0, borderRadius: "50%",
                          border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                          animation: "spin 0.8s linear infinite"
                        }} />
                      )}
                      {isMulti
                        ? (isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />)
                        : (isThisPlaying && !buffering ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />)
                      }
                    </button>

                    {/* Song info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{song.name}</span>
                        {isMulti && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "#EEF2FF", color: "#4338CA", flexShrink: 0 }}>
                            🎶 {song.parts?.length} Parts
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
                        {isMulti
                          ? song.parts?.map(p => p.label).join(" · ")
                          : (song.description || "Audio Track")}
                      </p>

                      {/* Seek bar — only for playing single-part songs */}
                      {isThisPlaying && !isMulti && (
                        <div style={{ marginTop: 8 }}>
                          {/* Time */}
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6366F1", fontWeight: 600, marginBottom: 4 }}>
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                          {/* Bar */}
                          <div
                            onClick={e => seek(e, song.id)}
                            style={{ height: 5, background: "#E0E7FF", borderRadius: 99, cursor: "pointer", position: "relative", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${progress * 100}%`, background: "#6366F1", borderRadius: 99, transition: "width 0.1s linear" }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    {!isMulti ? (
                      <button
                        onClick={() => handleSelect(song)}
                        style={{
                          padding: "8px 16px", borderRadius: 8, flexShrink: 0,
                          background: "#0F172A", color: "#fff",
                          fontWeight: 600, fontSize: 12, border: "none", cursor: "pointer",
                          transition: "transform 0.15s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      >Select</button>
                    ) : (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : song.id)}
                        style={{
                          padding: "8px 14px", borderRadius: 8, flexShrink: 0,
                          background: isExpanded ? "#4338CA" : "#EEF2FF",
                          color: isExpanded ? "#fff" : "#4338CA",
                          fontWeight: 600, fontSize: 12, border: "none", cursor: "pointer"
                        }}>
                        {isExpanded ? "Collapse ▲" : "Parts ▼"}
                      </button>
                    )}
                  </div>

                  {/* Multi-part panel */}
                  {isMulti && isExpanded && song.parts && (
                    <div style={{ padding: "0 14px 14px" }}>
                      <div style={{ height: 1, background: "#E0E7FF", marginBottom: 12 }} />
                      <p style={{ fontSize: 10, fontWeight: 800, color: "#6366F1", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>Select a Part</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {song.parts.map((part, idx) => {
                          const partId = `${song.id}_${idx}`;
                          const isPartPlaying = playingId === partId;
                          return (
                            <div key={idx} style={{
                              display: "flex", alignItems: "center", gap: 10,
                              background: isPartPlaying ? "#EEF2FF" : "#F8FAFC",
                              border: `1.5px solid ${isPartPlaying ? "#6366F1" : "#E2E8F0"}`,
                              borderRadius: 10, padding: "10px 12px",
                            }}>
                              <button
                                onClick={() => togglePlay(partId, part.url)}
                                style={{
                                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                                  background: isPartPlaying ? "#6366F1" : "#E2E8F0",
                                  color: isPartPlaying ? "#fff" : "#475569",
                                  border: "none", cursor: "pointer",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  position: "relative"
                                }}>
                                {isPartPlaying && buffering && (
                                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
                                )}
                                {isPartPlaying && !buffering ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" style={{ marginLeft: 1 }} />}
                              </button>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: isPartPlaying ? "#4338CA" : "#0F172A" }}>{part.label}</span>
                                {isPartPlaying && !isMulti && (
                                  <div style={{ marginTop: 4 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6366F1", fontWeight: 600, marginBottom: 3 }}>
                                      <span>{formatTime(currentTime)}</span>
                                      <span>{formatTime(duration)}</span>
                                    </div>
                                    <div onClick={e => seek(e, partId)} style={{ height: 4, background: "#E0E7FF", borderRadius: 99, cursor: "pointer", overflow: "hidden" }}>
                                      <div style={{ height: "100%", width: `${progress * 100}%`, background: "#6366F1", borderRadius: 99 }} />
                                    </div>
                                  </div>
                                )}
                                {isPartPlaying && (
                                  <div style={{ marginTop: 4 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6366F1", fontWeight: 600, marginBottom: 3 }}>
                                      <span>{formatTime(currentTime)}</span>
                                      <span>{formatTime(duration)}</span>
                                    </div>
                                    <div onClick={e => seek(e, partId)} style={{ height: 4, background: "#E0E7FF", borderRadius: 99, cursor: "pointer", overflow: "hidden" }}>
                                      <div style={{ height: "100%", width: `${progress * 100}%`, background: "#6366F1", borderRadius: 99 }} />
                                    </div>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => handleSelectPart(song, idx)}
                                style={{
                                  padding: "7px 14px", borderRadius: 7, flexShrink: 0,
                                  background: "#6366F1", color: "#fff",
                                  fontWeight: 600, fontSize: 12, border: "none", cursor: "pointer"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#4338CA"}
                                onMouseLeave={e => e.currentTarget.style.background = "#6366F1"}
                              >Use</button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
