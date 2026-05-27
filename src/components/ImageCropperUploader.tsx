import React, { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";

const IMGBB_KEY = "83e3f88941efd1059a89f016ff302d9e";

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    return null;
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob((file) => {
      resolve(file);
    }, "image/jpeg", 0.9);
  });
}

export default function ImageCropperUploader({
  fid,
  data,
  onChange,
  defaultSrc,
  aspect
}: {
  fid: string;
  data: Record<string, string>;
  onChange?: (id: string, v: string) => void;
  defaultSrc?: string;
  aspect?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null); // final selected preview
  const fileRef = useRef<HTMLInputElement>(null);

  // Cropper states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const currentSrc = data[fid] || "";

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImageSrc(reader.result?.toString() || null)
      );
      reader.readAsDataURL(file);
    }
  };

  const showCroppedImage = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      setUploading(true);
      
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) throw new Error("Crop failed");

      // Set local preview so it feels instant
      const localUrl = URL.createObjectURL(croppedImageBlob);
      setPreview(localUrl);
      
      // Upload to ImgBB
      const fd = new FormData();
      fd.append("image", croppedImageBlob, "cropped.jpg");
      
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) {
        onChange?.(fid, json.data.url);
      }
      
      // Close Cropper
      setImageSrc(null);
    } catch (e) {
      console.error(e);
      alert("Error cropping image");
    } finally {
      setUploading(false);
    }
  };

  const useDefault = () => {
    onChange?.(fid, "");
    setPreview(null);
  };

  return (
    <div style={{ padding: "6px 8px", background: "rgba(255, 105, 180, 0.04)", borderTop: "1px dashed rgba(255, 105, 180, 0.3)", width: "100%", borderRadius: 8, marginTop: 8 }}>
      
      {/* CROPPER MODAL */}
      {imageSrc && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.9)", zIndex: 99999, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ position: "relative", width: "100%", height: "70%", background: "#333" }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect} // if undefined, it behaves free-form or default 4/3 depending on library version. We'll pass aspect ratio from templates if needed.
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div style={{ padding: 20, display: "flex", gap: 16, marginTop: 20 }}>
            <button onClick={() => setImageSrc(null)} style={{
              background: "#4b5563", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: "bold"
            }}>Cancel</button>
            <button onClick={showCroppedImage} disabled={uploading} style={{
              background: "#ec4899", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: "bold"
            }}>
              {uploading ? "Applying..." : "Confirm & Apply"}
            </button>
          </div>
        </div>
      )}

      {/* COMPONENT UI */}
      {preview && !imageSrc && (
        <div style={{ marginBottom: 6, textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" style={{ maxHeight: 60, borderRadius: 8, border: "2px solid #FF69B4", objectFit: "contain" }} />
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
          background: "#FF69B4", color: "#fff", border: "none", borderRadius: 8,
          padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer",
          opacity: uploading ? 0.6 : 1, width: "100%", whiteSpace: "normal", wordBreak: "break-word"
        }}>{uploading ? "Applying…" : "📷 Change"}</button>
        {currentSrc && (
          <button onClick={useDefault} disabled={uploading} style={{
            background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb",
            borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer",
            width: "100%", whiteSpace: "normal", wordBreak: "break-word", opacity: uploading ? 0.5 : 1
          }}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
