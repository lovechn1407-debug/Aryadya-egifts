"use client";
import { useEffect, useState, useRef } from "react";
import { getProductsDB, updateProductOverrideDB, getOrdersByProductDB } from "@/lib/db";
import type { Product } from "@/lib/data";
import { PRODUCT_REGISTRY } from "@/lib/data";
import Link from "next/link";

// Declare global properties for manual stop capture hooks
declare global {
  interface Window {
    stopCurrentRecording?: () => void;
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  birthday: "🎂 Birthday",
  proposal: "💍 Proposal",
  anniversary: "💑 Anniversary",
  friendship: "🤝 Friendship",
  love: "❤️ Love",
  wedding: "💒 Wedding",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [cuttedPriceInput, setCuttedPriceInput] = useState("");
  const [editingRating, setEditingRating] = useState<string | null>(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewInput, setReviewInput] = useState("");
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockInput, setStockInput] = useState("");
  const [showStockInput, setShowStockInput] = useState(false);
  const [editingPreview, setEditingPreview] = useState<string | null>(null);
  const [previewInput, setPreviewInput] = useState("");
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  const [revenueCounts, setRevenueCounts] = useState<Record<string, number>>({});
  const [editingFrameStrip, setEditingFrameStrip] = useState<string | null>(null);
  const [frameStripTextsInput, setFrameStripTextsInput] = useState("");

  // Recording State variables
  const [recordingProduct, setRecordingProduct] = useState<Product | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recorderQuality, setRecorderQuality] = useState<number>(100000); // default low 100k
  const [recorderDuration, setRecorderDuration] = useState<number>(15); // default 15s
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [recordingStatusText, setRecordingStatusText] = useState("");

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const startRecording = async () => {
    if (!recordingProduct) return;
    setRecordingStatusText("Initializing media capture...");
    setIsRecording(true);
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
        // @ts-ignore
        selfBrowserSurface: "include",
        // @ts-ignore
        preferCurrentTab: true
      });

      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      
      if (settings.displaySurface !== "browser") {
        alert("WARNING: For accurate cropping, you MUST choose the 'Current Tab' or a browser tab to record.");
      }

      setRecordingStatusText("Recording in progress... Please keep this tab active and visible.");
      
      const videoEl = document.createElement("video");
      videoEl.srcObject = stream;
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.muted = true;
      
      await new Promise((resolve) => {
        videoEl.onloadedmetadata = () => resolve(true);
      });
      await videoEl.play();

      const rect = previewContainerRef.current?.getBoundingClientRect();
      if (!rect) throw new Error("Sandbox preview element not found");

      const videoWidth = videoEl.videoWidth;
      const videoHeight = videoEl.videoHeight;
      const viewWidth = window.innerWidth;
      const viewHeight = window.innerHeight;
      const scale = videoWidth / viewWidth;

      const cropX = rect.left * scale;
      const cropY = rect.top * scale;
      const cropW = rect.width * scale;
      const cropH = rect.height * scale;

      const canvas = document.createElement("canvas");
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not construct 2D canvas context");

      let isDrawing = true;
      const draw = () => {
        if (!isDrawing) return;
        ctx.drawImage(videoEl, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        requestAnimationFrame(draw);
      };
      draw();

      const canvasStream = canvas.captureStream(30);
      let options = { mimeType: "video/webm;codecs=vp9" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) options = { mimeType: "video/webm;codecs=vp8" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) options = { mimeType: "video/webm" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) options = { mimeType: "video/mp4" };

      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(canvasStream, {
        ...options,
        videoBitsPerSecond: recorderQuality
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const stopPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
          resolve(blob);
        };
      });

      recorder.start();

      let timeLeft = recorderDuration;
      setRecordingProgress(timeLeft);
      const interval = setInterval(() => {
        timeLeft -= 1;
        setRecordingProgress(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(interval);
          if (recorder.state !== "inactive") recorder.stop();
        }
      }, 1000);

      const stopEarly = () => {
        clearInterval(interval);
        if (recorder.state !== "inactive") recorder.stop();
      };
      track.addEventListener("ended", stopEarly);

      window.stopCurrentRecording = () => {
        clearInterval(interval);
        if (recorder.state !== "inactive") recorder.stop();
      };

      const recordedBlob = await stopPromise;
      isDrawing = false;
      stream.getTracks().forEach(t => t.stop());

      setRecordingStatusText("Uploading compressed video to Telegram Bot API...");

      const fileExt = options.mimeType.includes("mp4") ? "mp4" : "webm";
      const recordFile = new File([recordedBlob], `preview_${recordingProduct.id}.${fileExt}`, {
        type: recordedBlob.type
      });

      const BOT_TOKEN = "8832668653:AAER53dyUKzFn6lXK3ex2dtEEgErTTNSjlw";
      const CHAT_ID = "-1003915557006";

      const formData = new FormData();
      formData.append("chat_id", CHAT_ID);
      formData.append("video", recordFile);
      formData.append("caption", `Looping preview for ${recordingProduct.name}`);

      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
        method: "POST",
        body: formData
      });

      const resData = await res.json();
      if (!resData.ok) throw new Error(resData.description || "Telegram upload failed");

      const mediaObj = resData.result.video || resData.result.document || resData.result.animation || resData.result.audio;
      if (!mediaObj || !mediaObj.file_id) {
        throw new Error("Could not retrieve file_id from Telegram response. Result: " + JSON.stringify(resData.result));
      }
      const fileId = mediaObj.file_id;
      const sizeBytes = mediaObj.file_size || recordedBlob.size;
      const newVideoUrl = `/api/tg-video/${fileId}`;

      const qualityLabel = recorderQuality === 100000 ? "Low (100k)" : recorderQuality === 250000 ? "Medium (250k)" : "High (500k)";
      const newVersion = {
        id: fileId,
        name: `Version ${((recordingProduct as any).previewVideoVersions?.length || 0) + 1} (${qualityLabel})`,
        url: newVideoUrl,
        size: sizeBytes,
        createdAt: new Date().toISOString()
      };

      const updatedVersions = [
        ...((recordingProduct as any).previewVideoVersions || []),
        newVersion
      ];

      await updateProductOverrideDB(recordingProduct.id, {
        previewMode: "mp4",
        previewVideoUrl: newVideoUrl,
        previewVideoVersions: updatedVersions
      });

      setRecordingStatusText("Recording successful! Saving video version...");
      setIsRecording(false);
      reload();

      setTimeout(() => {
        setRecordingProduct(null);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setRecordingStatusText("An unexpected error occurred while recording. Please try again.");
      setIsRecording(false);
    }
  };

  const handlePreviewModeToggle = async (id: string, mode: "original" | "mp4") => {
    await updateProductOverrideDB(id, { previewMode: mode });
    reload();
  };

  const handleSelectVersion = async (productId: string, url: string) => {
    await updateProductOverrideDB(productId, { previewVideoUrl: url });
    reload();
  };

  const handleDeleteVersion = async (productId: string, versionId: string) => {
    if (!confirm("Are you sure you want to delete this recorded video version?")) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const versions = (product as any).previewVideoVersions || [];
    const filtered = versions.filter((v: any) => v.id !== versionId);
    
    const updates: any = {
      previewVideoVersions: filtered
    };
    if (product.previewVideoUrl === versions.find((v: any) => v.id === versionId)?.url) {
      updates.previewVideoUrl = filtered.length > 0 ? filtered[filtered.length - 1].url : "";
    }
    
    await updateProductOverrideDB(productId, updates);
    reload();
  };

  const reload = async () => {
    const ps = await getProductsDB();
    setProducts(ps);
    const counts: Record<string, number> = {};
    const revs: Record<string, number> = {};
    await Promise.all(ps.map(async p => {
      const orders = await getOrdersByProductDB(p.id);
      counts[p.id] = orders.length;
      revs[p.id] = orders.filter(o => o.status !== "pending").reduce((s, o) => s + o.amount, 0);
    }));
    setOrderCounts(counts);
    setRevenueCounts(revs);
  };

  useEffect(() => { reload(); }, []);

  const toggleVisibility = async (id: string, current: boolean) => {
    await updateProductOverrideDB(id, { visible: !current });
    reload();
  };

  const saveName = async (id: string) => {
    if (nameInput.trim()) {
      await updateProductOverrideDB(id, { name: nameInput.trim() });
    }
    setEditingName(null);
    reload();
  };

  const savePrice = async (id: string) => {
    const n = parseInt(priceInput, 10);
    const cn = parseInt(cuttedPriceInput, 10);
    
    const updates: Partial<Product> = {};
    if (!isNaN(n) && n >= 0) updates.price = n * 100;
    if (!isNaN(cn) && cn > 0) updates.cuttedPrice = cn * 100;
    else if (cuttedPriceInput === "") updates.cuttedPrice = undefined; // allow clearing
    
    if (Object.keys(updates).length > 0 || cuttedPriceInput === "") {
      await updateProductOverrideDB(id, updates);
    }
    setEditingPrice(null);
    reload();
  };

  const updateBadge = async (id: string, badge: any) => {
    await updateProductOverrideDB(id, { badge });
    reload();
  };

  const saveRating = async (id: string) => {
    const rc = parseInt(reviewInput, 10);
    const updates: Record<string, any> = {
      rating: ratingInput
    };
    if (!isNaN(rc)) updates.reviewCount = rc;
    await updateProductOverrideDB(id, updates);
    setEditingRating(null);
    reload();
  };

  const saveStock = async (id: string) => {
    const s = parseInt(stockInput, 10);
    const updates: Record<string, any> = {
      showStock: showStockInput
    };
    if (!isNaN(s)) updates.stockLeft = s;
    await updateProductOverrideDB(id, updates);
    setEditingStock(null);
    reload();
  };

  const savePreview = async (id: string) => {
    await updateProductOverrideDB(id, { previewUrl: previewInput.trim() === "" ? undefined : previewInput.trim() });
    setEditingPreview(null);
    reload();
  };

  const saveFrameStrip = async (id: string) => {
    const texts = frameStripTextsInput.split(",").map(t => t.trim()).filter(Boolean);
    await updateProductOverrideDB(id, { frameStripTexts: texts });
    setEditingFrameStrip(null);
    reload();
  };

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF", borderRadius: 12, border: "1px solid #E2E8F0",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
  };

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px", borderRadius: 6, border: "1px solid #CBD5E1", 
    fontSize: 13, color: "#0F172A", background: "#FFFFFF", outline: "none",
    transition: "border-color 0.2s"
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: -0.5 }}>
            Products Manager
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
            {PRODUCT_REGISTRY.length} products in registry · Control visibility and pricing
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 24, padding: 16, background: "#EFF6FF", borderRadius: 12, border: "1px solid #BFDBFE", display: "flex", gap: 12 }}>
        <span style={{ fontSize: 18 }}>ℹ️</span>
        <p style={{ fontSize: 13, color: "#1D4ED8", lineHeight: 1.6, margin: 0 }}>
          <strong>How products work:</strong> Products are code-defined in <code style={{ background: "#DBEAFE", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>src/lib/data.ts</code>.
          To add a new template, modify the code and it will automatically appear here. Use this panel to control visibility, pricing, and view orders.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {products.map(product => (
          <div key={product.id} style={{ ...cardStyle, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderBottom: "1px solid #F1F5F9", background: "#F8FAFC" }}>
              <div style={{
                width: 64, height: 64, borderRadius: 12, fontSize: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}>
                {product.thumbnail}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
                  {editingName === product.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input style={{...inputStyle, minWidth: 200}} type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} autoFocus />
                      <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#0F172A", color: "#FFFFFF", border: "none", cursor: "pointer" }} onClick={() => saveName(product.id)}>Save</button>
                      <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#F1F5F9", color: "#334155", border: "none", cursor: "pointer" }} onClick={() => setEditingName(null)}>✕</button>
                    </div>
                  ) : (
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      {product.name}
                      <button onClick={() => { setEditingName(product.id); setNameInput(product.name); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#94A3B8" }}>✏️</button>
                    </h2>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: "#E0E7FF", color: "#4338CA", border: "1px solid #C7D2FE" }}>
                    {CATEGORY_LABELS[product.category]}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: product.visible ? "#ECFDF5" : "#F1F5F9", color: product.visible ? "#059669" : "#64748B", border: `1px solid ${product.visible ? "#A7F3D0" : "#E2E8F0"}` }}>
                    {product.visible ? "🟢 Visible" : "⚫ Hidden"}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>{product.tagline}</p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", padding: "20px 24px", gap: 24, borderBottom: "1px solid #E2E8F0" }}>
              <div>
                <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500, marginBottom: 4 }}>Total Orders</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: "#0F172A" }}>{orderCounts[product.id] || 0}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500, marginBottom: 4 }}>Revenue</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: "#10B981" }}>₹{Math.floor((revenueCounts[product.id] || 0) / 100)}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500, marginBottom: 4 }}>Rating</p>
                {editingRating === product.id ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input style={{...inputStyle, width: 60, padding: "6px"}} type="number" placeholder="Reviews" value={reviewInput} onChange={e => setReviewInput(e.target.value)} />
                    <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#0F172A", color: "#FFFFFF", border: "none", cursor: "pointer" }} onClick={() => saveRating(product.id)}>Save</button>
                    <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#F1F5F9", color: "#334155", border: "none", cursor: "pointer" }} onClick={() => setEditingRating(null)}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#F59E0B", fontSize: 18 }}>{'★'.repeat(Math.round((product as any).rating || 5))}</span>
                    <span style={{ fontSize: 14, color: "#334155", fontWeight: 600 }}>{((product as any).rating || 5).toFixed(1)}</span>
                    <button onClick={() => { setEditingRating(product.id); setRatingInput((product as any).rating || 5); setReviewInput(String((product as any).reviewCount || "")); }}
                      style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 14 }}>✏️</button>
                  </div>
                )}
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500, marginBottom: 4 }}>Inventory & Stock Tag</p>
                {editingStock === product.id ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                      style={{...inputStyle, width: 80, padding: "6px"}}
                      type="number" placeholder="Left" value={stockInput} onChange={e => setStockInput(e.target.value)} autoFocus
                    />
                    <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                      <input type="checkbox" checked={showStockInput} onChange={e => setShowStockInput(e.target.checked)} />
                      Show "Left" Tag
                    </label>
                    <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#0F172A", color: "#FFFFFF", border: "none", cursor: "pointer", marginLeft: 8 }} onClick={() => saveStock(product.id)}>Save</button>
                    <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#F1F5F9", color: "#334155", border: "none", cursor: "pointer" }} onClick={() => setEditingStock(null)}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                      {(product as any).stockLeft || 0} left
                    </p>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: (product as any).showStock ? "#ECFDF5" : "#F1F5F9", color: (product as any).showStock ? "#059669" : "#64748B" }}>
                      {(product as any).showStock ? "Tag Visible" : "Tag Hidden"}
                    </span>
                    <button onClick={() => { setEditingStock(product.id); setStockInput(String((product as any).stockLeft || "")); setShowStockInput(!!(product as any).showStock); }} style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 14 }}>✏️</button>
                  </div>
                )}
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500, marginBottom: 4 }}>Pricing</p>
                {editingPrice === product.id ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                      style={{...inputStyle, width: 100, padding: "6px"}}
                      type="number" placeholder="Real (₹)" value={priceInput} onChange={e => setPriceInput(e.target.value)} autoFocus
                    />
                    <input
                      style={{...inputStyle, width: 110, padding: "6px", color: "#94A3B8", textDecoration: "line-through"}}
                      type="number" placeholder="Cutted (₹)" value={cuttedPriceInput} onChange={e => setCuttedPriceInput(e.target.value)}
                    />
                    <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#0F172A", color: "#FFFFFF", border: "none", cursor: "pointer" }} onClick={() => savePrice(product.id)}>Save</button>
                    <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#F1F5F9", color: "#334155", border: "none", cursor: "pointer" }} onClick={() => setEditingPrice(null)}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", margin: 0 }}>₹{Math.floor(product.price / 100)}</p>
                    {product.cuttedPrice && (
                      <p style={{ fontSize: 15, fontWeight: 500, color: "#94A3B8", textDecoration: "line-through", margin: 0 }}>
                        ₹{Math.floor(product.cuttedPrice / 100)}
                      </p>
                    )}
                    <button
                      onClick={() => { 
                        setEditingPrice(product.id); 
                        setPriceInput(String(Math.floor(product.price / 100))); 
                        setCuttedPriceInput(product.cuttedPrice ? String(Math.floor(product.cuttedPrice / 100)) : "");
                      }}
                      style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 14 }}
                    >
                      ✏️
                    </button>
                    {product.price === 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 16 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input 
                            type="checkbox" 
                            checked={product.checkoutMethod === "ads"}
                            onChange={(e) => {
                              updateProductOverrideDB(product.id, { checkoutMethod: e.target.checked ? "ads" : "free" }).then(reload);
                            }}
                            style={{ accentColor: "#10B981", width: 16, height: 16 }}
                          />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#10B981" }}>Enable View Ads</span>
                        </label>
                        {product.checkoutMethod === "ads" && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FEF3C7", padding: "4px 8px", borderRadius: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#D97706" }}>Required Ads:</span>
                            <input 
                              type="number" 
                              style={{...inputStyle, width: 50, padding: "4px", fontSize: 12, height: 24, minHeight: 24}}
                              value={product.requiredAdsCount || 1}
                              onChange={(e) => {
                                updateProductOverrideDB(product.id, { requiredAdsCount: Math.max(1, Number(e.target.value)) }).then(reload);
                              }}
                              min={1}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 16, padding: "16px 24px", flexWrap: "wrap", alignItems: "center", background: "#FFFFFF" }}>
              {/* Badge Selection */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>Badge:</span>
                <select 
                  style={{...inputStyle, padding: "6px 10px", cursor: "pointer"}}
                  value={product.badge || ""} 
                  onChange={(e) => updateBadge(product.id, e.target.value)}
                >
                  <option value="">None</option>
                  <option value="hot">🔥 HOT</option>
                  <option value="new">✨ NEW</option>
                  <option value="specials">🎁 SPECIAL</option>
                  <option value="premium">💎 PREMIUM</option>
                </select>
              </div>

              {/* Preview URL Override */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 16, borderLeft: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>Preview:</span>
                {editingPreview === product.id ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input 
                      style={{...inputStyle, width: 220, padding: "6px"}} 
                      type="text" 
                      placeholder="e.g. /preview/xyz?embed=1" 
                      value={previewInput} 
                      onChange={e => setPreviewInput(e.target.value)} 
                      autoFocus
                    />
                    <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#0F172A", color: "#FFFFFF", border: "none", cursor: "pointer" }} onClick={() => savePreview(product.id)}>Save</button>
                    <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#F1F5F9", color: "#334155", border: "none", cursor: "pointer" }} onClick={() => setEditingPreview(null)}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, color: (product as any).previewUrl ? "#0F172A" : "#94A3B8", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {(product as any).previewUrl || "Default (/preview/id)"}
                    </span>
                    <button 
                      onClick={() => { setEditingPreview(product.id); setPreviewInput((product as any).previewUrl || ""); }} 
                      style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 14 }}
                    >✏️</button>
                  </div>
                )}
              </div>

              {/* Edit Default Template Button */}
              <div style={{ paddingLeft: 16, borderLeft: "1px solid #E2E8F0" }}>
                <button 
                  onClick={() => window.location.href = `/edit/preview_${product.id}`}
                  style={{ background: "#7C3AED", color: "#FFF", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(124,58,237,0.2)" }}
                >
                  <span style={{ fontSize: 14 }}>🎨</span> Edit Default Template
                </button>
              </div>

              {/* Preview Mode Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 16, borderLeft: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>Mode:</span>
                <select 
                  style={{...inputStyle, padding: "6px 10px", cursor: "pointer"}}
                  value={product.previewMode || "original"} 
                  onChange={(e) => handlePreviewModeToggle(product.id, e.target.value as "original" | "mp4")}
                >
                  <option value="original">Original (iframe)</option>
                  <option value="mp4">MP4 Video</option>
                </select>
                {product.previewMode === "mp4" && (
                  <button 
                    onClick={() => {
                      setRecordingProduct(product);
                      setRecordingStatusText("Configure settings and click start.");
                    }}
                    style={{ background: "#10B981", color: "#FFF", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(16,185,129,0.2)" }}
                  >
                    📹 Record MP4
                  </button>
                )}
              </div>

              {/* Frame Strip Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 16, borderLeft: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>Strip:</span>
                <label className="toggle" style={{ margin: 0, display: "flex", alignItems: "center" }}>
                  <input 
                    type="checkbox" 
                    checked={product.frameStripEnabled || false} 
                    onChange={async (e) => {
                      await updateProductOverrideDB(product.id, { frameStripEnabled: e.target.checked });
                      reload();
                    }} 
                  />
                  <span className="toggle-slider" style={{ background: product.frameStripEnabled ? "#10B981" : "#CBD5E1" }} />
                </label>
                {product.frameStripEnabled && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 6 }}>
                    <input 
                      type="color" 
                      value={product.frameStripBgColor || "#FACC15"} 
                      onChange={e => { updateProductOverrideDB(product.id, { frameStripBgColor: e.target.value }).then(reload); }}
                      style={{ width: 24, height: 24, padding: 0, border: "1px solid #E2E8F0", borderRadius: 4, cursor: "pointer" }}
                      title="Background Color"
                    />
                    <input 
                      type="color" 
                      value={product.frameStripTextColor || "#422006"} 
                      onChange={e => { updateProductOverrideDB(product.id, { frameStripTextColor: e.target.value }).then(reload); }}
                      style={{ width: 24, height: 24, padding: 0, border: "1px solid #E2E8F0", borderRadius: 4, cursor: "pointer" }}
                      title="Text Color"
                    />
                  </div>
                )}
                {product.frameStripEnabled && (
                  editingFrameStrip === product.id ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input 
                        style={{ ...inputStyle, width: 160, padding: "6px" }} 
                        placeholder="Comma separated texts" 
                        value={frameStripTextsInput} 
                        onChange={e => setFrameStripTextsInput(e.target.value)} 
                        autoFocus 
                      />
                      <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#0F172A", color: "#FFFFFF", border: "none", cursor: "pointer" }} onClick={() => saveFrameStrip(product.id)}>Save</button>
                      <button style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, background: "#F1F5F9", color: "#334155", border: "none", cursor: "pointer" }} onClick={() => setEditingFrameStrip(null)}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, color: "#475569", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {product.frameStripTexts?.length ? product.frameStripTexts.join(", ") : "No texts"}
                      </span>
                      <button 
                        onClick={() => { setEditingFrameStrip(product.id); setFrameStripTextsInput((product.frameStripTexts || []).join(", ")); }} 
                        style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 14 }}
                      >✏️</button>
                    </div>
                  )
                )}
              </div>

              {/* Visibility toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 16, borderLeft: "1px solid #E2E8F0" }}>
                <label className="toggle" style={{ margin: 0, display: "flex", alignItems: "center" }}>
                  <input type="checkbox" checked={product.visible} onChange={() => toggleVisibility(product.id, product.visible)} />
                  <span className="toggle-slider" style={{ background: product.visible ? "#10B981" : "#CBD5E1" }} />
                </label>
                <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>
                  {product.visible ? "Visible to public" : "Hidden"}
                </span>
              </div>

              <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
                <a
                  href={`/preview/${product.id}`}
                  target="_blank"
                  style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, color: "#334155", textDecoration: "none" }}
                >
                  Preview 👀
                </a>
                <a
                  href={`/admin/orders?product=${product.id}`}
                  style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, color: "#1D4ED8", textDecoration: "none" }}
                >
                  View Orders 📦
                </a>
              </div>
            </div>

            {/* Recorded Video Versions */}
            {product.previewMode === "mp4" && (
              <div style={{ padding: "16px 24px", background: "#F8FAFC", borderTop: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "#334155", margin: 0 }}>Recorded MP4 Versions</h4>
                  <span style={{ fontSize: 11, color: "#64748B" }}>
                    Active URL: <code style={{ background: "#E2E8F0", padding: "2px 6px", borderRadius: 4, fontSize: 10 }}>{product.previewVideoUrl || "None"}</code>
                  </span>
                </div>
                {!(product as any).previewVideoVersions || (product as any).previewVideoVersions.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#64748B", margin: 0, fontStyle: "italic" }}>
                    No recorded video versions yet. Click the &quot;Record MP4&quot; button above to capture a preview video for this product.
                  </p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                    {(product as any).previewVideoVersions.map((v: any) => {
                      const isActive = product.previewVideoUrl === v.url;
                      return (
                        <div key={v.id} style={{
                          background: "#FFFFFF", padding: "12px", borderRadius: 8, border: `1px solid ${isActive ? "#10B981" : "#E2E8F0"}`,
                          boxShadow: isActive ? "0 2px 8px rgba(16,185,129,0.08)" : "none",
                          display: "flex", flexDirection: "column", gap: 8
                        }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? "#059669" : "#1E293B" }}>
                              {v.name} {isActive && "⭐️ Active"}
                            </span>
                            <span style={{ fontSize: 10, color: "#94A3B8" }}>
                              {new Date(v.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "#64748B" }}>
                            <span>Size: {Math.round((v.size || 0) / 1024)} KB</span>
                            <div style={{ display: "flex", gap: 8 }}>
                              {!isActive && (
                                <button 
                                  onClick={() => handleSelectVersion(product.id, v.url)}
                                  style={{ background: "none", border: "none", color: "#2563EB", fontWeight: 700, cursor: "pointer", padding: 0 }}
                                >
                                  Activate
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteVersion(product.id, v.id)}
                                style={{ background: "none", border: "none", color: "#DC2626", fontWeight: 700, cursor: "pointer", padding: 0 }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Video Recorder Modal */}
      {recordingProduct && (
        <>
          <div 
            onClick={() => {
              if (isRecording) {
                if (confirm("Recording is active. Stop and discard?")) {
                  if (window.stopCurrentRecording) window.stopCurrentRecording();
                  setRecordingProduct(null);
                }
              } else {
                setRecordingProduct(null);
              }
            }} 
            style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(8px)", zIndex: 1000 }} 
          />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1001,
            width: "min(960px, 95vw)", background: "#FFFFFF", borderRadius: 24, padding: 32,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", display: "flex", gap: 32,
            maxHeight: "90vh", overflowY: "auto", fontFamily: "'Inter', sans-serif"
          }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0 }}>📹 Record Preview Video</h2>
                <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
                  Product: <strong>{recordingProduct.name}</strong>
                </p>
              </div>

              <div style={{ background: "#F0FDF4", border: "1px solid #DCFCE7", borderRadius: 12, padding: 16 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "#166534", margin: "0 0 6px 0" }}>⚠️ CRITICAL RECORDING STEPS:</h4>
                <ol style={{ fontSize: 12, color: "#166534", margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                  <li>Click <strong>&quot;Start Sharing &amp; Record&quot;</strong>.</li>
                  <li>When the browser asks which screen to share, select the <strong>&quot;Chrome Tab&quot;</strong> (or <strong>&quot;This Tab&quot;</strong>) option and select this current page: <strong>&quot;Products Manager&quot;</strong>.</li>
                  <li>Do NOT change tabs or scroll during the recording. Keep this tab fully visible.</li>
                  <li>The sandbox preview on the right will cycle pages and record automatically!</li>
                </ol>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "#475569", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Video Compression / Bitrate</label>
                  <select 
                    style={{ ...inputStyle, width: "100%", cursor: "pointer" }}
                    value={recorderQuality}
                    onChange={(e) => setRecorderQuality(Number(e.target.value))}
                    disabled={isRecording}
                  >
                    <option value={100000}>Low Quality (~100 kbps - Very Compressed / Recommended)</option>
                    <option value={250000}>Medium Quality (~250 kbps - Balanced)</option>
                    <option value={500000}>High Quality (~500 kbps - High details)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "#475569", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Duration (seconds)</label>
                  <input 
                    type="number"
                    style={{ ...inputStyle, width: "100%" }}
                    value={recorderDuration}
                    onChange={(e) => setRecorderDuration(Math.max(5, Math.min(30, Number(e.target.value))))}
                    disabled={isRecording}
                    min={5}
                    max={30}
                  />
                  <span style={{ fontSize: 11, color: "#64748B", marginTop: 4, display: "block" }}>Duration to cycle all slides (typically 12 - 18s).</span>
                </div>
              </div>

              {recordingStatusText && (
                <div style={{
                  background: isRecording ? "#EFF6FF" : "#F8FAFC",
                  border: `1px solid ${isRecording ? "#BFDBFE" : "#E2E8F0"}`,
                  borderRadius: 12, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Status Log:</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {isRecording && (
                      <div style={{
                        width: 12, height: 12, borderRadius: "50%", background: "#EF4444",
                        animation: "pulse 1s infinite"
                      }} />
                    )}
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{recordingStatusText}</span>
                  </div>
                  {isRecording && (
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", marginTop: 4 }}>
                      Time remaining: {recordingProgress}s
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
                {!isRecording ? (
                  <button 
                    onClick={startRecording}
                    style={{
                      background: "linear-gradient(135deg, #10B981, #059669)", color: "#FFFFFF", border: "none",
                      borderRadius: 12, padding: "14px 28px", fontSize: 14, fontWeight: 800, cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(16,185,129,0.3)", flex: 1
                    }}
                  >
                    Start Sharing &amp; Record 📹
                  </button>
                ) : (
                  <button 
                    onClick={() => { if (window.stopCurrentRecording) window.stopCurrentRecording(); }}
                    style={{
                      background: "linear-gradient(135deg, #EF4444, #DC2626)", color: "#FFFFFF", border: "none",
                      borderRadius: 12, padding: "14px 28px", fontSize: 14, fontWeight: 800, cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(239,68,68,0.3)", flex: 1
                    }}
                  >
                    Stop Recording early 🛑
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (isRecording) {
                      if (confirm("Discard recording?")) {
                        if (window.stopCurrentRecording) window.stopCurrentRecording();
                        setRecordingProduct(null);
                      }
                    } else {
                      setRecordingProduct(null);
                    }
                  }}
                  style={{
                    background: "#F1F5F9", color: "#334155", border: "1px solid #E2E8F0",
                    borderRadius: 12, padding: "14px 24px", fontSize: 14, fontWeight: 800, cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", marginBottom: 8 }}>
                🔴 TARGET CROP AREA (3:4 Ratio)
              </span>
              <div 
                ref={previewContainerRef}
                id="record-container"
                style={{
                  width: 390, height: 520, borderRadius: 16, overflow: "hidden",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  border: "2px solid #E2E8F0", background: "#F8FAFC", position: "relative"
                }}
              >
                <iframe 
                  src={`/preview/${recordingProduct.id}?embed=1`}
                  style={{ width: "100%", height: "100%", border: "none", pointerEvents: "none" }}
                  scrolling="no"
                />
              </div>
            </div>
          </div>
          
          <style>{`
            @keyframes pulse {
              0% { transform: scale(0.95); opacity: 0.5; }
              50% { transform: scale(1.05); opacity: 1; }
              100% { transform: scale(0.95); opacity: 0.5; }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
