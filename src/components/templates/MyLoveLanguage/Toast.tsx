import { AnimatePresence, motion } from "framer-motion";

interface Props {
  show: boolean;
  message: string;
}

export default function Toast({ show, message }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: "fixed",
            bottom: `calc(80px + env(safe-area-inset-bottom))`,
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #D4AF37, #F5D16A)",
            color: "#1A0A0A",
            padding: "10px 22px",
            borderRadius: "999px",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
            zIndex: 10000,
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
