import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { SITE_DATA } from "./siteData";

function RingBox({ open }: { open: boolean }) {
  const lidRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const orbitLightRef = useRef<THREE.PointLight>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += 0.003;
    if (lidRef.current) {
      const target = open ? -1.9 : 0;
      lidRef.current.rotation.x += (target - lidRef.current.rotation.x) * Math.min(1, delta * 4);
    }
    if (ringRef.current) {
      const target = open ? 1.2 : 0.15;
      ringRef.current.position.y += (target - ringRef.current.position.y) * Math.min(1, delta * 3);
      ringRef.current.rotation.y += 0.01;
    }
    if (lightRef.current) {
      const target = open ? 5 : 2;
      lightRef.current.intensity += (target - lightRef.current.intensity) * Math.min(1, delta * 2);
    }
    if (orbitLightRef.current) {
      const t = state.clock.elapsedTime;
      orbitLightRef.current.position.x = Math.sin(t) * 2.5;
      orbitLightRef.current.position.z = Math.cos(t) * 2.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Velvet platform */}
      <mesh position={[0, -0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial color="#3D0000" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Box body */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[2.2, 1.1, 1.6]} />
        <meshStandardMaterial color="#6B0000" roughness={0.75} metalness={0.05} />
      </mesh>
      {/* Inner lining */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[2.0, 0.9, 1.4]} />
        <meshStandardMaterial color="#FFF0F0" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Gold rim */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[2.25, 0.05, 1.65]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Lid group with pivot at back */}
      <group position={[0, 0.42, -0.8]}>
        <group ref={lidRef}>
          <mesh position={[0, 0, 0.8]}>
            <boxGeometry args={[2.2, 0.15, 1.6]} />
            <meshStandardMaterial color="#6B0000" roughness={0.75} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0.08, 0.8]}>
            <boxGeometry args={[2.25, 0.05, 1.65]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* Ring */}
      <group ref={ringRef} position={[0, 0.15, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.065, 32, 100]} />
          <meshPhysicalMaterial color="#D4AF37" roughness={0.0} metalness={1.0} reflectivity={1.0} envMapIntensity={2.5} />
        </mesh>
        <mesh position={[0, 0.37, 0]}>
          <octahedronGeometry args={[0.18, 0]} />
          <meshPhysicalMaterial color="#FFFFFF" roughness={0} metalness={0} transmission={0.98} ior={2.42} thickness={0.3} />
        </mesh>
        <pointLight ref={lightRef} color="#FFFFFF" intensity={2} position={[0, 0.4, 0]} distance={3} />
      </group>

      <pointLight ref={orbitLightRef} color="#D4AF37" intensity={0.8} position={[-2, 3, 2]} />
    </group>
  );
}

export default function Scene7RingBox({ onNext }: { onNext: () => void }) {
  const [open, setOpen] = useState(false);
  const [noOffset, setNoOffset] = useState(0);
  const [yesScale, setYesScale] = useState(1);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#1A0A0A", overflow: "hidden" }}>
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 50 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <fog attach="fog" args={["#1A0A0A", 8, 20]} />
        <color attach="background" args={["#1A0A0A"]} />
        <ambientLight intensity={0.35} />
        <directionalLight color="#FFB6C1" intensity={1.3} position={[3, 5, 3]} />
        <Suspense fallback={null}>
          <RingBox open={open} />
        </Suspense>
        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          minPolarAngle={0.3}
          maxPolarAngle={1.4}
        />
      </Canvas>

      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(true)}
            style={{
              position: "absolute",
              bottom: `calc(50px + env(safe-area-inset-bottom))`,
              left: "50%",
              transform: "translateX(-50%)",
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
              zIndex: 100,
            }}
          >
            Open the Box 💍
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            style={{
              position: "absolute",
              bottom: `calc(40px + env(safe-area-inset-bottom))`,
              left: 0,
              right: 0,
              textAlign: "center",
              padding: "0 20px",
              zIndex: 100,
            }}
          >
            <h2
              style={{
                fontFamily: "'Great Vibes', cursive",
                fontSize: "34px",
                color: "#D4AF37",
                textShadow: "0 0 24px rgba(212,175,55,0.6)",
                margin: "0 0 24px",
              }}
            >
              {SITE_DATA.proposal_question}
            </h2>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
              <motion.button
                onClick={onNext}
                animate={{ scale: yesScale }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{
                  padding: "16px 40px",
                  background: "linear-gradient(135deg, #D4AF37 0%, #F5D16A 50%, #D4AF37 100%)",
                  color: "#1A0A0A",
                  border: "none",
                  borderRadius: "999px",
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: "18px",
                  boxShadow: "0 0 30px rgba(212,175,55,0.6)",
                  cursor: "pointer",
                }}
              >
                YES 💍
              </motion.button>
              <motion.button
                animate={{ x: noOffset }}
                transition={{ type: "spring" }}
                onClick={() => {
                  setNoOffset((o) => o + 40);
                  setYesScale(1.1);
                  setTimeout(() => setYesScale(1), 350);
                }}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  color: "rgba(255,255,255,0.5)",
                  border: "none",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                {SITE_DATA.no_button_text}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
