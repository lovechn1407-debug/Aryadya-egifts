"use client";
import { useEffect, useState } from "react";
import { getReviewsDB, saveReviewDB, deleteReviewDB } from "@/lib/db";
import type { CustomerReview } from "@/lib/db";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [rating, setRating] = useState(5);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [order, setOrder] = useState(1);
  const [visible, setVisible] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getReviewsDB();
      setReviews(data);
    } catch (err: any) {
      setError("Failed to load reviews: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Convert uploaded image to Base64 for zero-setup database storage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 2MB to keep database payload small
    if (file.size > 2 * 1024 * 1024) {
      setError("File is too large. Please select a screenshot smaller than 2MB.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
        setUploading(false);
      };
      reader.onerror = () => {
        setError("Failed to read image file.");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError("Error parsing image: " + err.message);
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!buyerName.trim() || !screenshotUrl.trim()) {
      setError("Buyer Name and Screenshot Image are required.");
      return;
    }

    const id = editingId || `rev_${Date.now()}`;
    const newReview: CustomerReview = {
      id,
      buyerName: buyerName.trim(),
      rating: Number(rating),
      screenshotUrl,
      order: Number(order),
      visible,
      createdAt: new Date().toISOString()
    };

    try {
      await saveReviewDB(newReview);
      setSuccess(editingId ? "Review updated successfully!" : "Review added successfully!");
      resetForm();
      await loadReviews();
    } catch (err: any) {
      setError("Failed to save review: " + err.message);
    }
  };

  const handleEdit = (rev: CustomerReview) => {
    setEditingId(rev.id);
    setBuyerName(rev.buyerName);
    setRating(rev.rating);
    setScreenshotUrl(rev.screenshotUrl);
    setOrder(rev.order);
    setVisible(rev.visible);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteReviewDB(id);
      setSuccess("Review deleted successfully!");
      await loadReviews();
    } catch (err: any) {
      setError("Failed to delete review: " + err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setBuyerName("");
    setRating(5);
    setScreenshotUrl("");
    setOrder(reviews.length + 1);
    setVisible(true);
    // Reset file input in DOM if any
    const fileInput = document.getElementById("screenshot-file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: 0 }}>
          Manage Customer Reviews & Screenshots
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
          {editingId ? "✏️ Edit Review" : "➕ Add Customer Feedback Screenshot"}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Buyer Name</label>
            <input 
              type="text"
              value={buyerName}
              onChange={e => setBuyerName(e.target.value)}
              placeholder="e.g. Priyanshu Chauhan"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, color: "#1E293B" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Rating (1 - 5 Stars)</label>
              <select 
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, color: "#1E293B", background: "#FFF" }}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                <option value={3}>⭐⭐⭐ (3 Stars)</option>
                <option value={2}>⭐⭐ (2 Stars)</option>
                <option value={1}>⭐ (1 Star)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Display Order</label>
              <input 
                type="number"
                value={order}
                onChange={e => setOrder(Number(e.target.value))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, color: "#1E293B" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Screenshot Image File (WhatsApp/Instagram Chat screenshot)</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input 
                id="screenshot-file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ fontSize: 13 }}
              />
              <span style={{ fontSize: 11, color: "#64748B" }}>Or paste direct image URL below:</span>
              <input 
                type="text"
                value={screenshotUrl}
                onChange={e => setScreenshotUrl(e.target.value)}
                placeholder="https://example.com/screenshot.jpg"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, color: "#1E293B" }}
              />
            </div>
          </div>

          {/* Screenshot Preview */}
          {screenshotUrl && (
            <div style={{ marginTop: 8 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Screenshot Preview:</label>
              <div style={{ maxWidth: 260, border: "2px dashed #CBD5E1", borderRadius: 12, padding: 8, background: "#F8FAFC" }}>
                <img src={screenshotUrl} alt="Feedback preview" style={{ width: "100%", height: "auto", borderRadius: 8, objectFit: "contain", maxHeight: 320 }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569", marginTop: 8 }}>
              <input 
                type="checkbox"
                checked={visible}
                onChange={e => setVisible(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "#7C3AED" }}
              />
              Show on Public Reviews Showcase
            </label>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button 
            type="submit"
            disabled={uploading}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: uploading ? "#94A3B8" : "#7C3AED",
              color: "#FFF",
              fontSize: 14,
              fontWeight: 700,
              cursor: uploading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 4px rgba(124,58,237,0.15)"
            }}
          >
            {uploading ? "Uploading Screenshot..." : editingId ? "Update Review" : "Add Review"}
          </button>
        </div>
      </form>

      {/* Grid of Reviews */}
      <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 20 }}>
          📋 Dynamic Reviews Grid
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B" }}>Loading Reviews...</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B" }}>No feedback screenshots found. Add your first screenshot above!</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {reviews.map(rev => (
              <div 
                key={rev.id} 
                style={{ 
                  borderRadius: 16, 
                  border: "1px solid #F1F5F9", 
                  background: rev.visible ? "#FFF" : "#F8FAFC",
                  opacity: rev.visible ? 1 : 0.7,
                  overflow: "hidden",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)"
                }}
              >
                <div style={{ position: "relative" }}>
                  <img 
                    src={rev.screenshotUrl} 
                    alt={`Feedback from ${rev.buyerName}`} 
                    style={{ width: "100%", height: 260, objectFit: "contain", background: "#0F172A", padding: 8 }}
                  />
                  <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#FFF", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: "4px 8px", borderRadius: 6 }}>
                      Order {rev.order}
                    </span>
                  </div>
                </div>

                <div style={{ padding: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1E293B", margin: "0 0 4px 0" }}>{rev.buyerName}</h3>
                  <div style={{ color: "#F59E0B", fontSize: 12, marginBottom: 12 }}>
                    {"⭐".repeat(rev.rating)}
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid #F1F5F9", paddingTop: 12 }}>
                    <button 
                      onClick={() => handleEdit(rev)}
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
                      onClick={() => handleDelete(rev.id)}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
