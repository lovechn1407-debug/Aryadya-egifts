import { motion } from "framer-motion";

interface Props {
  onClick: () => void;
  label?: string;
}

export default function ContinueButton({ onClick, label = "Continue →" }: Props) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onClick={onClick}
      onTouchEnd={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="continue-btn"
      style={{
        position: "absolute",
        bottom: `calc(40px + env(safe-area-inset-bottom))`,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "14px 32px",
        borderRadius: "999px",
        background: "linear-gradient(135deg, #D4AF37 0%, #F5D16A 50%, #D4AF37 100%)",
        color: "#1A0A0A",
        border: "none",
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 600,
        fontSize: "15px",
        letterSpacing: "0.05em",
        boxShadow: "0 0 24px rgba(212,175,55,0.5), 0 4px 16px rgba(0,0,0,0.3)",
        cursor: "pointer",
        zIndex: 100,
        animation: "goldPulse 2.4s ease-in-out infinite",
      }}
    >
      {label}
    </motion.button>
  );
}
