import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import * as THREE from "three";
import Toast from "./Toast";
import WaxSeal from "./WaxSeal";
import { SITE_DATA } from "./siteData";
import { stampSlam, playSound } from "./audio";

function FloatingRing() {
  const ringRef = useRef<THREE.Group>(null);
  const orbitLightRef = useRef<THREE.PointLight>(null);
  useFrame((s) => {
    if (ringRef.current) ringRef.current.rotation.y += 0.008;
    if (orbitLightRef.current) {
      const t = s.clock.elapsedTime;
      orbitLightRef.current.position.x = Math.sin(t) * 2.5;
      orbitLightRef.current.position.z = Math.cos(t) * 2.5;
    }
  });
  return (
    <group ref={ringRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.1, 32, 100]} />
        <meshPhysicalMaterial color="#D4AF37" roughness={0} metalness={1} reflectivity={1} envMapIntensity={2.5} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshPhysicalMaterial color="#FFFFFF" roughness={0} metalness={0} transmission={0.98} ior={2.42} thickness={0.3} />
      </mesh>
      <pointLight color="#FFFFFF" intensity={3} position={[0, 0.6, 0]} distance={3} />
      <pointLight ref={orbitLightRef} color="#FFB6C1" intensity={1} position={[2, 1, 0]} />
    </group>
  );
}

export default function Scene8FinalLetter() {
  const [sealed, setSealed] = useState(false);
  const [flash, setFlash] = useState(false);
  const [toast, setToast] = useState(false);

  const handleSeal = () => {
    setSealed(true);
    playSound(stampSlam);
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
    confetti({
      particleCount: 300,
      spread: 360,
      startVelocity: 40,
      colors: ["#D4AF37", "#FFB6C1", "#FFFFFF", "#FF4444"],
      origin: { y: 0.5 },
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // ignore
    }
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at center, #2D0A1A, #1A0A0A)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: "45vh", position: "relative" }}>
        <Canvas camera={{ position: [0, 1, 4], fov: 50 }} dpr={[1, 2]}>
          <ambientLight intensity={0.4} />
          <directionalLight color="#FFB6C1" intensity={1.5} position={[3, 5, 3]} />
          <Suspense fallback={null}>
            <FloatingRing />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "20px",
          position: "relative",
        }}
      >
        {/* Envelope */}
        <div style={{ position: "relative", width: "min(320px, 88vw)" }}>
          {/* Flap */}
          <motion.div
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -150 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "70px",
              transformOrigin: "top center",
              zIndex: 3,
            }}
          >
            <svg viewBox="0 0 320 70" width="100%" height="70">
              <polygon points="0,0 320,0 160,70" fill="#FFF8F0" stroke="#D4AF37" />
            </svg>
          </motion.div>
          {/* Body */}
          <div
            style={{
              position: "relative",
              minHeight: "220px",
              background: "#FFF8F0",
              border: "2px solid #D4AF37",
              borderRadius: "4px",
              padding: "30px 24px 24px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              style={{
                background: "#FFF8DC",
                border: "1px solid #8B0000",
                borderRadius: "4px",
                padding: "18px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontSize: "20px",
                  color: "#8B0000",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {SITE_DATA.final_letter}
              </p>
            </motion.div>
          </div>

          {/* Wax seal slam */}
          <AnimatePresence>
            {sealed && (
              <motion.div
                initial={{ scale: 3, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: -15 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                  position: "absolute",
                  top: "55%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 5,
                }}
              >
                <WaxSeal size={120} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!sealed && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            onClick={handleSeal}
            style={{
              marginTop: "24px",
              padding: "14px 32px",
              background: "linear-gradient(135deg, #D4AF37, #F5D16A)",
              color: "#1A0A0A",
              border: "none",
              borderRadius: "999px",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: "15px",
              boxShadow: "0 0 24px rgba(212,175,55,0.5)",
              cursor: "pointer",
            }}
          >
            Seal with Love 💌
          </motion.button>
        )}

        {sealed && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            onClick={handleShare}
            style={{
              marginTop: "24px",
              padding: "12px 26px",
              background: "transparent",
              color: "#D4AF37",
              border: "1.5px solid #D4AF37",
              borderRadius: "999px",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 500,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Share this Moment 🔗
          </motion.button>
        )}
      </div>

      {flash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#FFF",
            zIndex: 99999,
            animation: "flashFade 0.6s ease-out forwards",
            pointerEvents: "none",
          }}
        />
      )}

      <Toast show={toast} message="Link copied! 💕" />
    </div>
  );
}
