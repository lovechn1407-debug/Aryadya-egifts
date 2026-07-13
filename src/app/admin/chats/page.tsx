"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/lib/firebase";
import type { ChatMeta, ChatMessage } from "@/lib/db";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatFull(ts: number) {
  return new Date(ts).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminChatsPage() {
  const [chats, setChats] = useState<ChatMeta[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen to all chats list
  useEffect(() => {
    const chatsRef = ref(database, "chats");
    const handle = onValue(chatsRef, (snap) => {
      if (!snap.exists()) { setChats([]); return; }
      const raw = snap.val() as Record<string, { meta: Omit<ChatMeta, "id"> }>;
      const list: ChatMeta[] = Object.entries(raw)
        .map(([id, val]) => ({ id, ...val.meta }))
        .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      setChats(list);
    });
    return () => off(chatsRef, "value", handle);
  }, []);

  // Listen to messages for selected chat
  useEffect(() => {
    if (!selectedId) { setMessages([]); return; }
    const msgRef = ref(database, `chats/${selectedId}/messages`);
    const handle = onValue(msgRef, (snap) => {
      if (!snap.exists()) { setMessages([]); return; }
      const raw = snap.val() as Record<string, Omit<ChatMessage, "id">>;
      const sorted = Object.entries(raw)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => a.timestamp - b.timestamp);
      setMessages(sorted);
    });
    return () => off(msgRef, "value", handle);
  }, [selectedId]);

  // Mark as read when a chat is selected
  useEffect(() => {
    if (!selectedId) return;
    fetch("/api/chat/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: selectedId, by: "admin" }),
    });
  }, [selectedId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat selected
  useEffect(() => {
    if (selectedId) setTimeout(() => inputRef.current?.focus(), 100);
  }, [selectedId]);

  const handleSelectChat = (id: string) => {
    setSelectedId(id);
    setReplyTo(null);
    setInput("");
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedId,
          sender: "admin",
          text,
          replyTo: replyTo ? { id: replyTo.id, text: replyTo.text, sender: replyTo.sender } : undefined,
        }),
      });
      setReplyTo(null);
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleEndSession = async () => {
    if (!selectedId || ending) return;
    setEnding(true);
    try {
      await fetch("/api/chat/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: selectedId }),
      });
    } finally {
      setEnding(false);
    }
  };

  const filteredChats = chats.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedChat = chats.find(c => c.id === selectedId);
  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", background: "#F8FAFC", overflow: "hidden" }}>
      <style dangerouslySetInnerHTML={{__html: `
        .chat-list-item:hover { background: #F1F5F9 !important; }
        .chat-list-item.active { background: #EDE9FE !important; border-left: 3px solid #7C3AED !important; }
        .admin-chat-input:focus { outline: none; border-color: #7C3AED !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
        .admin-msg-hover:hover { background: rgba(0,0,0,0.03) !important; }
        .admin-send-btn:hover:not(:disabled) { background: #6D28D9 !important; }
      `}} />

      {/* ── LEFT: Chat List ── */}
      <div style={{
        width: 320, flexShrink: 0, background: "#fff",
        borderRight: "1px solid #E2E8F0",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid #F1F5F9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0, flex: 1 }}>Support Chats</h2>
            {totalUnread > 0 && (
              <span style={{
                background: "#EF4444", color: "#fff", borderRadius: 20,
                fontSize: 11, fontWeight: 700, padding: "2px 8px",
              }}>{totalUnread} new</span>
            )}
          </div>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="admin-chat-search"
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px 8px 32px",
                border: "1px solid #E2E8F0", borderRadius: 8,
                fontSize: 13, color: "#334155", background: "#F8FAFC",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredChats.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
              {search ? "No chats match your search" : "No chats yet"}
            </div>
          )}
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              id={`chat-list-${chat.id}`}
              className={`chat-list-item${selectedId === chat.id ? " active" : ""}`}
              onClick={() => handleSelectChat(chat.id)}
              style={{
                padding: "14px 16px 12px", borderLeft: "3px solid transparent",
                cursor: "pointer", transition: "background 0.15s",
                borderBottom: "1px solid #F1F5F9",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 15,
                }}>
                  {(chat.name || "?")[0].toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: "#0F172A", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {chat.name}
                    </span>
                    <span style={{ fontSize: 11, color: "#94A3B8", flexShrink: 0 }}>{formatTime(chat.lastMessageAt)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
                    {chat.email}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, color: "#94A3B8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {chat.lastMessage || "No messages yet"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {chat.unreadByAdmin > 0 && (
                        <span style={{
                          background: "#EF4444", color: "#fff", borderRadius: "50%",
                          fontSize: 10, fontWeight: 700, width: 18, height: 18,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>{chat.unreadByAdmin > 9 ? "9+" : chat.unreadByAdmin}</span>
                      )}
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20,
                        background: chat.status === "open" ? "#DCFCE7" : "#F1F5F9",
                        color: chat.status === "open" ? "#16A34A" : "#94A3B8",
                      }}>{chat.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Chat Detail ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {!selectedChat ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, color: "#94A3B8" }}>
            <div style={{ fontSize: 56 }}>💬</div>
            <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Select a chat to view the conversation</p>
            <p style={{ fontSize: 13, margin: 0 }}>You have {chats.length} conversation{chats.length !== 1 ? "s" : ""} total</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{
              padding: "14px 24px", background: "#fff", borderBottom: "1px solid #E2E8F0",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0,
              }}>
                {(selectedChat.name || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{selectedChat.name}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>{selectedChat.email} · Started {formatFull(selectedChat.createdAt)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
                  background: selectedChat.status === "open" ? "#DCFCE7" : "#FEE2E2",
                  color: selectedChat.status === "open" ? "#16A34A" : "#DC2626",
                }}>
                  {selectedChat.status === "open" ? "🟢 Open" : "🔴 Closed"}
                </span>
                {selectedChat.status === "open" && (
                  <button
                    id="admin-end-session-btn"
                    onClick={handleEndSession}
                    disabled={ending}
                    style={{
                      background: ending ? "#F1F5F9" : "#FEE2E2",
                      color: ending ? "#94A3B8" : "#DC2626",
                      border: "1px solid",
                      borderColor: ending ? "#E2E8F0" : "#FECACA",
                      borderRadius: 8, padding: "7px 14px",
                      fontSize: 12, fontWeight: 700, cursor: ending ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {ending ? "Ending…" : "End Session"}
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: "auto", padding: "20px 24px",
              display: "flex", flexDirection: "column", gap: 12,
              background: "#F8FAFC",
            }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 13, padding: "40px 0" }}>
                  No messages yet. Wait for the user to start the conversation.
                </div>
              )}
              {messages.map((msg) => {
                const isAdmin = msg.sender === "admin";
                return (
                  <div
                    key={msg.id}
                    className="admin-msg-hover"
                    style={{
                      display: "flex", flexDirection: "column",
                      alignItems: isAdmin ? "flex-end" : "flex-start",
                      padding: "4px 6px", borderRadius: 8, cursor: selectedChat.status === "open" ? "pointer" : "default",
                      transition: "background 0.15s",
                    }}
                    onClick={() => selectedChat.status === "open" && setReplyTo(msg)}
                    title={selectedChat.status === "open" ? "Click to reply" : ""}
                  >
                    {/* Reply preview */}
                    {msg.replyToText && (
                      <div style={{
                        background: "rgba(0,0,0,0.05)", borderLeft: "3px solid #7C3AED",
                        borderRadius: "6px 6px 0 0", padding: "6px 10px",
                        maxWidth: "70%", fontSize: 12, color: "#64748B", marginBottom: 2,
                      }}>
                        <span style={{ color: "#7C3AED", fontWeight: 600 }}>
                          {msg.replyToSender === "admin" ? "You" : selectedChat.name}:
                        </span>{" "}{msg.replyToText}
                      </div>
                    )}
                    {/* Bubble */}
                    <div style={{
                      background: isAdmin
                        ? "linear-gradient(135deg,#7C3AED,#6D28D9)"
                        : "#fff",
                      color: isAdmin ? "#fff" : "#1E293B",
                      borderRadius: isAdmin ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      padding: "10px 15px", maxWidth: "70%",
                      fontSize: 13.5, lineHeight: 1.55, wordBreak: "break-word",
                      boxShadow: isAdmin
                        ? "0 2px 8px rgba(124,58,237,0.25)"
                        : "0 1px 4px rgba(0,0,0,0.08)",
                    }}>
                      {msg.text}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      {!isAdmin && <span style={{ fontSize: 11.5, fontWeight: 600, color: "#7C3AED" }}>{selectedChat.name}</span>}
                      <span style={{ fontSize: 11, color: "#94A3B8" }}>{formatFull(msg.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Reply Preview */}
            {replyTo && (
              <div style={{
                margin: "0", padding: "8px 24px",
                background: "#EDE9FE", borderTop: "1px solid #DDD6FE",
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
              }}>
                <div style={{ fontSize: 12, color: "#6D28D9", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span style={{ fontWeight: 700 }}>↩ Replying to {replyTo.sender === "admin" ? "yourself" : selectedChat.name}:</span>{" "}
                  {replyTo.text}
                </div>
                <button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", color: "#7C3AED", cursor: "pointer", fontSize: 18, padding: "0 2px", fontWeight: 700 }}>×</button>
              </div>
            )}

            {/* Input */}
            {selectedChat.status === "open" ? (
              <div style={{
                padding: "12px 24px 16px", background: "#fff",
                borderTop: "1px solid #E2E8F0",
                display: "flex", gap: 10, alignItems: "center",
              }}>
                <input
                  ref={inputRef}
                  id="admin-chat-input"
                  type="text"
                  placeholder={`Reply to ${selectedChat.name}…`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="admin-chat-input"
                  style={{
                    flex: 1, padding: "10px 14px",
                    border: "1.5px solid #E2E8F0", borderRadius: 10,
                    fontSize: 13.5, color: "#0F172A",
                    background: "#F8FAFC", outline: "none", transition: "all 0.2s",
                  }}
                />
                <button
                  id="admin-chat-send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="admin-send-btn"
                  style={{
                    background: "#7C3AED", color: "#fff", border: "none",
                    borderRadius: 10, width: 42, height: 42, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: !input.trim() || sending ? "not-allowed" : "pointer",
                    opacity: !input.trim() || sending ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            ) : (
              <div style={{
                padding: "14px 24px", background: "#FEF2F2", borderTop: "1px solid #FECACA",
                textAlign: "center", color: "#DC2626", fontSize: 13, fontWeight: 600,
              }}>
                🔒 This session has been closed. No further messages can be sent.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
