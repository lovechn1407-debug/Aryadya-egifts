"use client";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

// Draw a cute styled QR on canvas
function drawCuteQR(canvas: HTMLCanvasElement, url: string) {
  const size = 280;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Get QR matrix
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const modules = qr.modules;
  const moduleCount = modules.size;
  const padding = 16;
  const cellSize = (size - padding * 2) / moduleCount;

  // Background
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, 20);
  ctx.fill();

  // Gradient for dots
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#7C3AED");
  grad.addColorStop(0.5, "#E91E8C");
  grad.addColorStop(1, "#F59E0B");

  // Draw each module as a rounded dot
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!modules.get(row, col)) continue;

      const x = padding + col * cellSize;
      const y = padding + row * cellSize;

      // Check if this is a finder pattern (top-left, top-right, bottom-left 7x7 blocks)
      const isFinder =
        (row < 7 && col < 7) ||
        (row < 7 && col >= moduleCount - 7) ||
        (row >= moduleCount - 7 && col < 7);

      if (isFinder) {
        // Finder patterns: solid rounded squares with gradient
        ctx.fillStyle = grad;
        const r = cellSize * 0.15;
        ctx.beginPath();
        ctx.roundRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, r);
        ctx.fill();
      } else {
        // Data dots: cute circles
        ctx.fillStyle = grad;
        const radius = cellSize * 0.38;
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Center white circle (for logo)
  const centerSize = cellSize * 7;
  const cx = size / 2;
  const cy = size / 2;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx, cy, centerSize / 2 + 4, 0, Math.PI * 2);
  ctx.fill();

  // Center gradient ring
  ctx.strokeStyle = grad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, centerSize / 2 + 2, 0, Math.PI * 2);
  ctx.stroke();

  // Center emoji
  ctx.font = `${centerSize * 0.55}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🎁", cx, cy + 2);
}

export default function QRSharePopup({ url, onClose }: { url: string; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current) drawCuteQR(canvasRef.current, url);
  }, [url]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = 380, h = 480;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    // Gradient bg
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#FFF0F5");
    grad.addColorStop(0.5, "#F5F3FF");
    grad.addColorStop(1, "#FFFBEB");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 24);
    ctx.fill();
    // Decorative top strip
    const strip = ctx.createLinearGradient(0, 0, w, 0);
    strip.addColorStop(0, "#7C3AED");
    strip.addColorStop(1, "#E91E8C");
    ctx.fillStyle = strip;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, 6, [24, 24, 0, 0]);
    ctx.fill();
    // QR
    const qrSize = 260;
    const qrX = (w - qrSize) / 2, qrY = 28;
    ctx.shadowColor = "rgba(124,58,237,0.15)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(qrX - 12, qrY - 8, qrSize + 24, qrSize + 16, 18);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.drawImage(canvas, qrX, qrY, qrSize, qrSize);
    // Text
    ctx.fillStyle = "#E91E8C";
    ctx.font = "bold 20px 'Nunito', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🎁 Aradhya E-Gifts", w / 2, qrY + qrSize + 44);
    ctx.fillStyle = "#7C3AED";
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.fillText("Scan to view your gift page ✨", w / 2, qrY + qrSize + 66);
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "11px 'Inter', sans-serif";
    ctx.fillText("Made with ❤️ | aradhya-gifts.vercel.app", w / 2, qrY + qrSize + 90);
    // Download
    const link = document.createElement("a");
    link.download = "aradhya-gift-qr.jpg";
    link.href = c.toDataURL("image/jpeg", 0.95);
    link.click();
  };

  const shareQR = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "gift-qr.png", { type: "image/png" });
      if (navigator.share) {
        try {
          await navigator.share({ title: "My Gift Page 🎁", text: "Check out this surprise I made for you! ✨", url, files: [file] });
        } catch { /* cancelled */ }
      } else {
        downloadQR();
      }
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)", zIndex: 2000,
      }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 2001, width: "min(440px, 92vw)", maxHeight: "90vh", background: "#fff", borderRadius: 28,
        padding: "0", boxShadow: "0 32px 80px rgba(124,58,237,0.22)",
        overflowY: "auto", overflowX: "hidden", animation: "fadeSlide 0.4s ease both",
      }}>
        {/* Top gradient strip */}
        <div style={{
          height: 6,
          background: "linear-gradient(90deg, #7C3AED, #E91E8C, #F59E0B)",
        }} />

        <div style={{ padding: "28px 28px 24px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #F5F3FF, #FFF0F5)",
              border: "2px solid #EDE9FE", marginBottom: 12,
              fontSize: 28,
            }}>🎉</div>
            <h2 style={{
              fontSize: 22, fontWeight: 900, color: "#1F2937",
              fontFamily: "'Nunito',sans-serif",
            }}>Your Gift is Ready!</h2>
            <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
              Share this with your loved one ❤️
            </p>
          </div>

          {/* QR Code */}
          <div style={{
            display: "flex", justifyContent: "center", padding: 20,
            background: "linear-gradient(135deg, #FFF0F5 0%, #F5F3FF 50%, #FFFBEB 100%)",
            borderRadius: 20, marginBottom: 20,
            border: "1.5px solid #EDE9FE",
          }}>
            <div style={{
              borderRadius: 20, padding: 8,
              background: "#fff",
              boxShadow: "0 8px 32px rgba(124,58,237,0.12)",
            }}>
              <canvas ref={canvasRef} style={{ display: "block", borderRadius: 14 }} />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button onClick={downloadQR} style={{
              flex: 1, padding: "13px 0", borderRadius: 14, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #7C3AED, #E91E8C)", color: "#fff",
              fontWeight: 800, fontSize: 14, fontFamily: "'Nunito',sans-serif",
              boxShadow: "0 6px 20px rgba(124,58,237,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>📥 Download QR</button>
            <button onClick={shareQR} style={{
              flex: 1, padding: "13px 0", borderRadius: 14,
              border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151",
              cursor: "pointer", fontWeight: 800, fontSize: 14,
              fontFamily: "'Nunito',sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>📤 Share</button>
          </div>

          {/* Link */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#F9FAFB", border: "1.5px solid #E5E7EB",
            borderRadius: 14, padding: "10px 12px",
          }}>
            <div style={{ fontSize: 16, flexShrink: 0 }}>🔗</div>
            <p style={{
              flex: 1, fontSize: 12, color: "#6B7280", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
              fontFamily: "monospace",
            }}>{url}</p>
            <button onClick={copyLink} style={{
              background: copied ? "#10B981" : "linear-gradient(135deg, #7C3AED, #E91E8C)",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "8px 16px", fontWeight: 700, fontSize: 12,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.3s",
              fontFamily: "'Nunito',sans-serif",
            }}>{copied ? "✓ Copied!" : "Copy"}</button>
          </div>

          {/* Close */}
          <button onClick={onClose} style={{
            display: "block", width: "100%", marginTop: 14, padding: "10px",
            background: "none", border: "none", color: "#9CA3AF",
            fontSize: 13, cursor: "pointer", fontWeight: 600,
          }}>Close ✕</button>
        </div>
      </div>
    </>
  );
}
