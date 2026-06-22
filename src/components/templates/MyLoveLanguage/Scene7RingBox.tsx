import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useMllData, useMllContext, ET } from "./MllDataContext";

function Sparkle({
  delay = 0,
  scale = 1,
  position = [0, 0, 0],
  color = "#ffffff",
}: {
  delay?: number;
  scale?: number;
  position?: [number, number, number];
  color?: string;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + delay;
      // Pulse scale
      const s = Math.max(0, Math.sin(t * 5.0) * 0.75 + 0.25) * scale;
      ref.current.scale.setScalar(s);
      // Spin
      ref.current.rotation.z = t * 1.5;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Glow core */}
      <mesh>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      {/* Vertical shine */}
      <mesh>
        <boxGeometry args={[0.015, 0.28, 0.015]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} depthWrite={false} />
      </mesh>
      {/* Horizontal shine */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.015, 0.28, 0.015]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </group>
  );
}

function FairyDust({ active }: { active: boolean }) {
  const count = 20;
  const groupRef = useRef<THREE.Group>(null);

  // Initialize random particle properties once
  const [particles] = useState(() => {
    return Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 0.6,
      z: (Math.random() - 0.5) * 0.6,
      speed: 0.3 + Math.random() * 0.35,
      phase: Math.random() * 10,
      maxScale: 0.4 + Math.random() * 0.6,
    }));
  });

  useFrame((state) => {
    if (!active || !groupRef.current) return;
    const t = state.clock.elapsedTime;
    const children = groupRef.current.children;

    for (let i = 0; i < count; i++) {
      const mesh = children[i] as THREE.Mesh;
      if (!mesh) continue;

      const p = particles[i];
      // Normal loop from 0 to 1
      const age = (t * p.speed + p.phase) % 1.0;

      // Position rising from the cushion
      mesh.position.y = 0.08 + age * 1.5;
      // Drift in a helical motion
      mesh.position.x = p.x + Math.sin(t * 2.0 + p.phase) * 0.1;
      mesh.position.z = p.z + Math.cos(t * 2.0 + p.phase) * 0.1;

      // Scale pulses (fade in at start, fade out at end)
      const scale = Math.sin(age * Math.PI) * p.maxScale * 0.04;
      mesh.scale.setScalar(scale);
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial color="#FFF5EA" transparent opacity={0.7} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function RingBox({ open }: { open: boolean }) {
  const lidRef = useRef<THREE.Group>(null);
  const latchRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const orbitLightRef = useRef<THREE.PointLight>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Slow rotation of the whole setup
    if (groupRef.current) groupRef.current.rotation.y += 0.003;

    const lidAngleTarget = open ? -2.0 : 0;
    let currentLidAngle = 0;

    // Smooth lid opening rotation
    if (lidRef.current) {
      lidRef.current.rotation.x += (lidAngleTarget - lidRef.current.rotation.x) * Math.min(1, delta * 3.5);
      currentLidAngle = lidRef.current.rotation.x;
    }

    // Smooth latch swing (hang down as the lid tilts backwards)
    if (latchRef.current) {
      // Counter-rotate to point down under gravity, with a slight damping
      const latchTarget = -currentLidAngle * 0.75;
      latchRef.current.rotation.x += (latchTarget - latchRef.current.rotation.x) * Math.min(1, delta * 8);
    }

    // Smooth ring rising
    if (ringRef.current) {
      const target = open ? 0.9 : 0.15;
      ringRef.current.position.y += (target - ringRef.current.position.y) * Math.min(1, delta * 3);
      ringRef.current.rotation.y += 0.008; // slow spin on ring
    }

    // Smooth diamond spotlight intensity
    if (lightRef.current) {
      const target = open ? 6.5 : 1.5;
      lightRef.current.intensity += (target - lightRef.current.intensity) * Math.min(1, delta * 2.5);
    }

    // Orbital shine point light
    if (orbitLightRef.current) {
      const t = state.clock.elapsedTime;
      orbitLightRef.current.position.x = Math.sin(t * 0.8) * 3;
      orbitLightRef.current.position.z = Math.cos(t * 0.8) * 3;
    }
  });

  return (
    <group ref={groupRef} scale={0.7}>
      {/* Luxury velvet floor platform */}
      <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.5, 64]} />
        <meshStandardMaterial color="#1e0104" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* OCTAGONAL RING BOX BODY */}
      <mesh position={[0, -0.25, 0]} rotation={[0, Math.PI / 8, 0]}>
        <cylinderGeometry args={[1.3, 1.32, 0.7, 8]} />
        <meshPhysicalMaterial
          color="#6b0918"
          roughness={0.95}
          metalness={0.1}
          sheen={1.0}
          sheenColor="#7e1a2b"
          sheenRoughness={0.8}
        />
      </mesh>

      {/* Gold metallic corners/braces on box body */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4 + Math.PI / 8;
        const x = Math.sin(angle) * 1.31;
        const z = Math.cos(angle) * 1.31;
        return (
          <mesh key={i} position={[x, -0.25, z]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[0.06, 0.72, 0.04]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.1} />
          </mesh>
        );
      })}

      {/* Gold metallic rim on box lip */}
      <mesh position={[0, 0.11, 0]} rotation={[0, Math.PI / 8, 0]}>
        <cylinderGeometry args={[1.31, 1.31, 0.03, 8]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Front latch gold receptacle block */}
      <mesh position={[0, -0.05, 1.315]}>
        <boxGeometry args={[0.18, 0.22, 0.03]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.05, 1.33]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Inner black velvet insert/padding floor */}
      <mesh position={[0, 0.04, 0]} rotation={[0, Math.PI / 8, 0]}>
        <cylinderGeometry args={[1.21, 1.21, 0.08, 8]} />
        <meshStandardMaterial color="#180103" roughness={0.9} />
      </mesh>

      {/* Split Cushion Rolls for Ring Slot */}
      <group position={[0, 0.04, 0]}>
        {/* Left roll */}
        <mesh position={[-0.22, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 1.6, 16]} />
          <meshPhysicalMaterial
            color="#40020a"
            roughness={0.95}
            sheen={1.0}
            sheenColor="#6b0918"
            sheenRoughness={0.8}
          />
        </mesh>
        {/* Right roll */}
        <mesh position={[0.22, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 1.6, 16]} />
          <meshPhysicalMaterial
            color="#40020a"
            roughness={0.95}
            sheen={1.0}
            sheenColor="#6b0918"
            sheenRoughness={0.8}
          />
        </mesh>
      </group>

      {/* Magical floating particles inside/above slot */}
      <FairyDust active={open} />

      {/* LID hinge/pivot point at the back */}
      <group position={[0, 0.11, -1.2]}>
        <group ref={lidRef}>
          {/* Lid cover relative to pivot */}
          <group position={[0, 0.25, 1.2]} rotation={[0, Math.PI / 8, 0]}>
            {/* Lid body */}
            <mesh>
              <cylinderGeometry args={[1.3, 1.28, 0.5, 8]} />
              <meshPhysicalMaterial
                color="#6b0918"
                roughness={0.95}
                metalness={0.1}
                sheen={1.0}
                sheenColor="#7e1a2b"
                sheenRoughness={0.8}
              />
            </mesh>

            {/* Gold metallic corners/braces on lid cover */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * Math.PI) / 4 + Math.PI / 8;
              const x = Math.sin(angle) * 1.31;
              const z = Math.cos(angle) * 1.31;
              return (
                <mesh key={i} position={[x, 0, z]} rotation={[0, -angle, 0]}>
                  <boxGeometry args={[0.06, 0.52, 0.04]} />
                  <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.1} />
                </mesh>
              );
            })}

            {/* Gold metallic rim on lid lip */}
            <mesh position={[0, -0.26, 0]}>
              <cylinderGeometry args={[1.31, 1.31, 0.03, 8]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.1} />
            </mesh>

            {/* Inside satin pad */}
            <mesh position={[0, -0.23, 0]}>
              <cylinderGeometry args={[1.2, 1.2, 0.04, 8]} />
              <meshPhysicalMaterial
                color="#5c020b"
                roughness={0.3}
                metalness={0.1}
                clearcoat={0.5}
              />
            </mesh>

            {/* Inside gold heart emblem/crest */}
            <group position={[0, -0.24, 0]}>
              {/* Left lobe */}
              <mesh position={[-0.06, 0, 0.06]}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.1} />
              </mesh>
              {/* Right lobe */}
              <mesh position={[0.06, 0, 0.06]}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.1} />
              </mesh>
              {/* Point */}
              <mesh position={[0, 0, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.09, 0.18, 16]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.1} />
              </mesh>
            </group>
          </group>

          {/* Swinging Latch arm on lid front */}
          <group ref={latchRef} position={[0, -0.01, 2.5]}>
            {/* Swinging plate */}
            <mesh position={[0, -0.12, 0.02]}>
              <boxGeometry args={[0.12, 0.24, 0.03]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Loop pull handle details */}
            <mesh position={[0, -0.22, 0.02]}>
              <torusGeometry args={[0.06, 0.015, 8, 16]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Golden cylinder hinge at the back pivot */}
      <mesh position={[0, 0.11, -1.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 12]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* HIGH-FIDELITY ENGAGEMENT RING */}
      <group ref={ringRef} position={[0, 0.15, 0]}>
        {/* Polished Platinum Ring Band (Standing upright in X-Y plane) */}
        <mesh>
          <torusGeometry args={[0.38, 0.045, 32, 100]} />
          <meshPhysicalMaterial
            color="#e6eaf0"
            roughness={0.1}
            metalness={1.0}
            reflectivity={1.0}
            envMapIntensity={3.0}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
          />
        </mesh>

        {/* 6 Pavé shoulder diamonds (3 on left, 3 on right) */}
        {[-Math.PI / 3, -Math.PI / 4, -Math.PI / 6, Math.PI / 6, Math.PI / 4, Math.PI / 3].map((angle, idx) => (
          <group key={idx} rotation={[0, 0, angle]}>
            {/* Small gold bezel cup */}
            <mesh position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.04, 8]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Tiny pavé diamond */}
            <mesh position={[0, 0.395, 0]}>
              <sphereGeometry args={[0.024, 8, 8]} />
              <meshPhysicalMaterial
                color="#FFFFFF"
                transmission={1.0}
                ior={2.42}
                roughness={0.0}
                thickness={0.05}
              />
            </mesh>
          </group>
        ))}

        {/* Tiffany-style 6-Prong Solitaire Setting Crown Claws & Support Rings */}
        <group>
          {/* Bottom Ring Bridge */}
          <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.12, 0.015, 8, 24]} />
            <meshStandardMaterial color="#e6eaf0" metalness={0.95} roughness={0.15} />
          </mesh>

          {/* Middle Ring Collar */}
          <mesh position={[0, 0.41, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.17, 0.015, 8, 24]} />
            <meshStandardMaterial color="#e6eaf0" metalness={0.95} roughness={0.15} />
          </mesh>

          {/* 6 Curved radial prongs */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * Math.PI) / 3;
            return (
              <group key={i} rotation={[0, angle, 0]}>
                <mesh position={[0.16, 0.41, 0]} rotation={[0, 0, -0.22]}>
                  <cylinderGeometry args={[0.015, 0.012, 0.16, 8]} />
                  <meshStandardMaterial color="#e6eaf0" metalness={0.95} roughness={0.15} />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* 16-SEGMENT BRILLIANT-CUT REFRACTIVE DIAMOND */}
        <group position={[0, 0.44, 0]}>
          {/* Girdle (Thin band in middle) */}
          <mesh>
            <cylinderGeometry args={[0.23, 0.23, 0.02, 16]} />
            <meshPhysicalMaterial
              color="#FFFFFF"
              roughness={0.0}
              metalness={0.0}
              transmission={1.0}
              ior={2.417}
              thickness={0.5}
              clearcoat={1.0}
              clearcoatRoughness={0.0}
              envMapIntensity={3.5}
            />
          </mesh>

          {/* Crown (Top facet stack) */}
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.15, 0.23, 0.08, 16]} />
            <meshPhysicalMaterial
              color="#FFFFFF"
              roughness={0.0}
              metalness={0.0}
              transmission={1.0}
              ior={2.417}
              thickness={0.5}
              clearcoat={1.0}
              clearcoatRoughness={0.0}
              envMapIntensity={3.5}
            />
          </mesh>

          {/* Pavilion (Bottom point) */}
          <mesh position={[0, -0.11, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.23, 0.22, 16]} />
            <meshPhysicalMaterial
              color="#FFFFFF"
              roughness={0.0}
              metalness={0.0}
              transmission={1.0}
              ior={2.417}
              thickness={0.5}
              clearcoat={1.0}
              clearcoatRoughness={0.0}
              envMapIntensity={3.5}
            />
          </mesh>
        </group>

        {/* Sparkle Flares (multi-colored star dispersion) */}
        {open && (
          <>
            <Sparkle delay={0} scale={0.7} position={[0.15, 0.52, 0.08]} color="#FFF0F5" />
            <Sparkle delay={0.6} scale={0.8} position={[-0.12, 0.46, -0.12]} color="#E0FFFF" />
            <Sparkle delay={1.2} scale={0.65} position={[0, 0.58, -0.05]} color="#FEFAE0" />
          </>
        )}

        {/* Spotlight flare directly on diamond */}
        <pointLight ref={lightRef} color="#FFFFFF" intensity={1.5} position={[0, 0.5, 0]} distance={4.5} />
      </group>

      {/* Orbiting key lights for reflections */}
      <pointLight ref={orbitLightRef} color="#FFD700" intensity={0.9} position={[-2, 3, 2]} />
    </group>
  );
}

export default function Scene7RingBox({ onNext }: { onNext: () => void }) {
  const { data, editMode } = useMllContext();
  const [open, setOpen] = useState(editMode);
  const [noOffset, setNoOffset] = useState(0);
  const [yesScale, setYesScale] = useState(1);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#1A0A0A", overflow: "hidden" }}>
      <Canvas
        camera={{ position: [0, 1.6, 4.2], fov: 50 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <fog attach="fog" args={["#1A0A0A", 8, 20]} />
        <color attach="background" args={["#1A0A0A"]} />
        <ambientLight intensity={0.4} />
        {/* Multi-directional lighting rig for diamond dispersion */}
        <directionalLight color="#FFB6C1" intensity={1.5} position={[3, 5, 3]} />
        <directionalLight color="#FFFFFF" intensity={1.2} position={[-3, 4, -3]} />
        <directionalLight color="#FFC0CB" intensity={1.0} position={[0, 2, 4]} />
        <Suspense fallback={null}>
          <RingBox open={open} />
        </Suspense>
        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={2.5}
          maxDistance={8}
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
              <ET fid="mll_proposal_question" />
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
                <ET fid="mll_no_button_text" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
