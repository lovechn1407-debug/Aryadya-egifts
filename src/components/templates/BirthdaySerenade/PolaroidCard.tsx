import { useState } from "react";
import { motion } from "framer-motion";
import ImageUploader from "@/components/ImageCropperUploader";
import { ET } from "./BirthdaySerenade";

type PolaroidCardProps = {
  src: string;
  caption: string;
  captionId: string;
  imageId: string;
  index: number;
  editMode?: boolean;
  onFieldChange?: (id: string, value: string) => void;
};

const ROTATIONS = [-6, -4, -3, 3, 4, 6];

export default function PolaroidCard({ 
  src, 
  caption, 
  captionId, 
  imageId, 
  index, 
  editMode, 
  onFieldChange 
}: PolaroidCardProps) {
  const [liked, setLiked] = useState(false);
  const [bump, setBump] = useState(0);
  const rot = ROTATIONS[index % ROTATIONS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: rot }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.07 }}
      whileHover={{
        scale: 1.06,
        rotate: 0,
        zIndex: 10,
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
      }}
      whileTap={!editMode ? { scale: 0.98 } : {}}
      className="relative bg-white"
      style={{
        borderRadius: 4,
        padding: "16px 16px 48px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
        width: 260,
        marginBottom: 24,
        flexShrink: 0,
        breakInside: "avoid",
        display: "inline-block",
      }}
    >
      <div style={{ height: 280, position: "relative", borderRadius: 2, overflow: "hidden", background: "#f1f5f9" }}>
        <img
          src={src || "https://picsum.photos/400/500"}
          alt={caption}
          loading="lazy"
          className="block w-full h-full"
          style={{ objectFit: "cover" }}
        />
        {editMode && onFieldChange && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
            <ImageUploader 
              fid={imageId}
              data={{ [imageId]: src }}
              onChange={onFieldChange}
              defaultSrc={src}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-3">
        {editMode && onFieldChange ? (
          <div className="font-script text-center" style={{ fontSize: 16, color: "#4A4A68", width: "100%" }}>
            <ET
              fid={captionId}
              data={{ [captionId]: caption }}
              onChange={onFieldChange}
              editMode={true}
              def={caption}
              darkText={true}
            />
          </div>
        ) : (
          <p
            className="font-script text-center"
            style={{ fontSize: 16, color: "#4A4A68" }}
          >
            {caption}
          </p>
        )}
        <span aria-hidden="true" style={{ color: "#E91E8C" }}>♥</span>
      </div>

      <button
        onClick={() => {
          if (editMode) return;
          setLiked(true);
          setBump((b) => b + 1);
        }}
        aria-label="Like this memory"
        className="absolute bottom-3 right-3"
      >
        <motion.span
          key={bump}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.6, 1] }}
          transition={{ type: "spring", stiffness: 300 }}
          style={{
            display: "inline-block",
            fontSize: 22,
            color: liked ? "#E91E8C" : "#CBD5E1",
          }}
        >
          ♥
        </motion.span>
        {bump > 0 && !editMode && (
          <motion.span
            key={`pop-${bump}`}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -22 }}
            transition={{ duration: 1.2 }}
            className="absolute right-0 -top-2 text-xs font-body font-bold"
            style={{ color: "#E91E8C" }}
          >
            +1 💕
          </motion.span>
        )}
      </button>
    </motion.div>
  );
}
