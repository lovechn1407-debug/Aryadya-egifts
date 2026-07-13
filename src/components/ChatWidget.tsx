"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/lib/firebase";
import type { ChatMessage } from "@/lib/db";

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChatWidgetProps {
  onUnreadChange?: (count: number) => void;
}

// ── Main Widget ───────────────────────────────────────────────────────────────
export default function ChatWidget({ onUnreadChange }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"form" | "chat" | "closed">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("aradhya_chat_id");
    if (stored) {
      setChatId(stored);
      setStage("chat");
    }
  }, []);

  // Listen for messages + session status in real-time
  useEffect(() => {
    if (!chatId) return;
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const metaRef = ref(database, `chats/${chatId}/meta`);

    const handleMessages = onValue(messagesRef, (snap) => {
      if (!snap.exists()) { setMessages([]); return; }
      const raw = snap.val() as Record<string, Omit<ChatMessage, "id">>;
      const sorted = Object.entries(raw)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => a.timestamp - b.timestamp);
      setMessages(sorted);
    });

    const handleMeta = onValue(metaRef, (snap) => {
      if (!snap.exists()) return;
      const meta = snap.val();
      if (meta.status === "closed") {
        setStage("closed");
      }
      const unreadCount = meta.unreadByUser || 0;
      if (open) {
        // If widget is open, mark as read
        fetch("/api/chat/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatId, by: "user" }) });
        setUnread(0);
        onUnreadChange?.(0);
      } else {
        setUnread(unreadCount);
        onUnreadChange?.(unreadCount);
      }
    });

    return () => {
      off(messagesRef, "value", handleMessages);
      off(metaRef, "value", handleMeta);
    };
  }, [chatId, open, onUnreadChange]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Mark as read when opened
  useEffect(() => {
    if (open && chatId) {
      fetch("/api/chat/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatId, by: "user" }) });
      setUnread(0);
      onUnreadChange?.(0);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, chatId, onUnreadChange]);

  const handleStartChat = async () => {
    if (!name.trim() || !email.trim()) return;
    setStarting(true);
    try {
      const res = await fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("aradhya_chat_id", data.chatId);
        setChatId(data.chatId);
        setStage("chat");
      }
    } catch {
      // silently ignore
    } finally {
      setStarting(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !chatId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          sender: "user",
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

  const handleNewSession = () => {
    localStorage.removeItem("aradhya_chat_id");
    setChatId(null);
    setMessages([]);
    setStage("form");
    setName("");
    setEmail("");
    setInput("");
    setReplyTo(null);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        id="chat-widget-button"
        onClick={() => setOpen(o => !o)}
        aria-label="Open chat support"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9000,
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, #7C3AED, #EC4899)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(124,58,237,0.45)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(124,58,237,0.6)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,58,237,0.45)"; }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {!open && unread > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#EF4444", color: "#fff", borderRadius: "50%",
            fontSize: 11, fontWeight: 700, width: 18, height: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #fff",
          }}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          id="chat-widget-panel"
          style={{
            position: "fixed", bottom: 88, right: 24, zIndex: 9000,
            width: 360, maxWidth: "calc(100vw - 32px)",
            background: "linear-gradient(160deg, #18181F 0%, #0E0E14 100%)",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(124,58,237,0.12)",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            animation: "chatSlideUp 0.25s ease",
          }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes chatSlideUp {
              from { opacity: 0; transform: translateY(16px) scale(0.97); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .chat-msg-hover:hover { background: rgba(255,255,255,0.05) !important; }
            .chat-input:focus { outline: none; border-color: rgba(124,58,237,0.6) !important; }
            .chat-send-btn:hover { background: linear-gradient(135deg,#6D28D9,#DB2777) !important; }
          `}} />

          {/* Header */}
          <div style={{
            padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(124,58,237,0.08)",
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "linear-gradient(135deg,#7C3AED,#EC4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>🎁</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: 0.2 }}>Aradhya Support</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: stage === "closed" ? "#EF4444" : "#22C55E" }} />
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                  {stage === "closed" ? "Session ended" : "Online · Typically replies in minutes"}
                </span>
              </div>
            </div>
          </div>

          {/* STAGE: Form */}
          {stage === "form" && (
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: "0 0 4px" }}>Hi there!</p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>Tell us who you are and we'll get you connected.</p>
              </div>
              <input
                id="chat-name-input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && document.getElementById("chat-email-input")?.focus()}
                style={{
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14,
                  outline: "none", transition: "border-color 0.2s",
                }}
                className="chat-input"
              />
              <input
                id="chat-email-input"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleStartChat()}
                style={{
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14,
                  outline: "none", transition: "border-color 0.2s",
                }}
                className="chat-input"
              />
              <button
                id="chat-start-btn"
                onClick={handleStartChat}
                disabled={!name.trim() || !email.trim() || starting}
                style={{
                  background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                  color: "#fff", border: "none", borderRadius: 10,
                  padding: "13px 20px", fontSize: 14, fontWeight: 700,
                  cursor: !name.trim() || !email.trim() || starting ? "not-allowed" : "pointer",
                  opacity: !name.trim() || !email.trim() || starting ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {starting ? "Starting…" : "Start Chat 💬"}
              </button>
            </div>
          )}

          {/* STAGE: Chat */}
          {stage === "chat" && (
            <>
              {/* Messages */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "16px 16px 8px",
                display: "flex", flexDirection: "column", gap: 10,
                maxHeight: 340, minHeight: 180,
              }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13, padding: "32px 0" }}>
                    Send us a message to get started! 👇
                  </div>
                )}
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      className="chat-msg-hover"
                      style={{
                        display: "flex", flexDirection: "column",
                        alignItems: isUser ? "flex-end" : "flex-start",
                        borderRadius: 8, padding: "4px 6px", cursor: "pointer", transition: "background 0.15s",
                      }}
                      onClick={() => setReplyTo(msg)}
                      title="Click to reply"
                    >
                      {msg.replyToText && (
                        <div style={{
                          background: "rgba(255,255,255,0.06)", borderLeft: "3px solid #7C3AED",
                          borderRadius: "6px 6px 0 0", padding: "6px 10px", maxWidth: "80%",
                          fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 2,
                        }}>
                          <span style={{ color: "#A78BFA", fontWeight: 600 }}>
                            {msg.replyToSender === "admin" ? "Support" : "You"}:
                          </span>{" "}
                          {msg.replyToText}
                        </div>
                      )}
                      <div style={{
                        background: isUser
                          ? "linear-gradient(135deg,#7C3AED,#6D28D9)"
                          : "rgba(255,255,255,0.09)",
                        color: "#fff", borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        padding: "9px 13px", maxWidth: "80%", fontSize: 13.5, lineHeight: 1.5,
                        wordBreak: "break-word",
                        boxShadow: isUser ? "0 2px 8px rgba(124,58,237,0.3)" : "none",
                      }}>
                        {msg.text}
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: 3 }}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Reply Preview */}
              {replyTo && (
                <div style={{
                  margin: "0 12px", padding: "8px 12px",
                  background: "rgba(124,58,237,0.15)", borderRadius: 8,
                  borderLeft: "3px solid #7C3AED",
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span style={{ color: "#A78BFA", fontWeight: 600 }}>↩ Replying to:</span> {replyTo.text}
                  </div>
                  <button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16, padding: "0 2px" }}>×</button>
                </div>
              )}

              {/* Input area */}
              <div style={{ padding: "10px 12px 14px", display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  ref={inputRef}
                  id="chat-message-input"
                  type="text"
                  placeholder="Type a message…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="chat-input"
                  style={{
                    flex: 1, background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10, padding: "10px 13px",
                    color: "#fff", fontSize: 13.5, outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
                <button
                  id="chat-send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="chat-send-btn"
                  style={{
                    background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                    border: "none", borderRadius: 10, width: 40, height: 40,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: !input.trim() || sending ? "not-allowed" : "pointer",
                    opacity: !input.trim() || sending ? 0.5 : 1,
                    transition: "all 0.2s", flexShrink: 0,
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* STAGE: Closed */}
          {stage === "closed" && (
            <div style={{ padding: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
              <div style={{ fontSize: 40 }}>🔒</div>
              <div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: "0 0 6px" }}>Session Closed</p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  This support session has been closed by our team. Hope your issue is resolved! 🎉
                </p>
              </div>
              <button
                id="chat-new-session-btn"
                onClick={handleNewSession}
                style={{
                  background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                  color: "#fff", border: "none", borderRadius: 10,
                  padding: "12px 20px", fontSize: 13.5, fontWeight: 700,
                  cursor: "pointer", transition: "opacity 0.2s",
                }}
              >
                Start New Chat 💬
              </button>
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: "8px 16px 10px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Powered by Aradhya E-Giftings</span>
          </div>
        </div>
      )}
    </>
  );
}
