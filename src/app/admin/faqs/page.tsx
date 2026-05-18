"use client";
import { useEffect, useState } from "react";
import { getFAQsDB, saveFAQDB, deleteFAQDB } from "@/lib/db";
import type { FAQItem } from "@/lib/db";

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [order, setOrder] = useState(1);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const data = await getFAQsDB();
      setFaqs(data);
    } catch (err: any) {
      setError("Failed to load FAQs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!question.trim() || !answer.trim()) {
      setError("Question and Answer are required.");
      return;
    }

    const id = editingId || `faq_${Date.now()}`;
    const newFaq: FAQItem = {
      id,
      question: question.trim(),
      answer: answer.trim(),
      order: Number(order),
      visible,
      createdAt: new Date().toISOString()
    };

    try {
      await saveFAQDB(newFaq);
      setSuccess(editingId ? "FAQ updated successfully!" : "FAQ added successfully!");
      resetForm();
      await loadFAQs();
    } catch (err: any) {
      setError("Failed to save FAQ: " + err.message);
    }
  };

  const handleEdit = (faq: FAQItem) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setOrder(faq.order);
    setVisible(faq.visible);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteFAQDB(id);
      setSuccess("FAQ deleted successfully!");
      await loadFAQs();
    } catch (err: any) {
      setError("Failed to delete FAQ: " + err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setOrder(faqs.length + 1);
    setVisible(true);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: 0 }}>
          Manage FAQs
        </h1>
        {editingId && (
          <button 
            onClick={resetForm}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #E2E8F0",
              background: "#FFF",
              color: "#475569",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div style={{ padding: "12px 16px", background: "#FEF2F2", color: "#991B1B", borderRadius: 8, marginBottom: 20, fontSize: 14, fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{ padding: "12px 16px", background: "#F0FDF4", color: "#166534", borderRadius: 8, marginBottom: 20, fontSize: 14, fontWeight: 500 }}>
          ✅ {success}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSave} style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24, marginBottom: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 20, borderBottom: "1px solid #F1F5F9", paddingBottom: 10 }}>
          {editingId ? "✏️ Edit FAQ" : "➕ Add New FAQ"}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Question</label>
            <input 
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. How does personalization work?"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, color: "#1E293B" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Answer</label>
            <textarea 
              rows={4}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Write the collapsed answer details..."
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, color: "#1E293B", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Display Order</label>
              <input 
                type="number"
                value={order}
                onChange={e => setOrder(Number(e.target.value))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, color: "#1E293B" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", marginTop: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                <input 
                  type="checkbox"
                  checked={visible}
                  onChange={e => setVisible(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: "#7C3AED" }}
                />
                Visible on Public Landing Page
              </label>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button 
            type="submit"
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: "#7C3AED",
              color: "#FFF",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(124,58,237,0.15)"
            }}
          >
            {editingId ? "Update FAQ" : "Add FAQ"}
          </button>
        </div>
      </form>

      {/* List Card */}
      <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 20 }}>
          📋 Existing FAQs
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B" }}>Loading FAQs...</div>
        ) : faqs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B" }}>No FAQs found. Create your first one above!</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {faqs.map(faq => (
              <div 
                key={faq.id} 
                style={{ 
                  padding: 16, 
                  borderRadius: 12, 
                  border: "1px solid #F1F5F9", 
                  background: faq.visible ? "#FAF5FF" : "#F8FAFC",
                  opacity: faq.visible ? 1 : 0.7,
                  display: "flex", 
                  flexDirection: "column",
                  gap: 8
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#A78BFA", background: "rgba(124,58,237,0.08)", padding: "3px 8px", borderRadius: 4, marginRight: 8 }}>
                      Order {faq.order}
                    </span>
                    {!faq.visible && (
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", background: "#E2E8F0", padding: "3px 8px", borderRadius: 4 }}>
                        Hidden
                      </span>
                    )}
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", margin: "8px 0 4px" }}>
                      {faq.question}
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button 
                      onClick={() => handleEdit(faq)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #E2E8F0",
                        background: "#FFF",
                        color: "#475569",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(faq.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "none",
                        background: "#FEE2E2",
                        color: "#EF4444",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: 0, background: "#FFF", padding: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.02)" }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
