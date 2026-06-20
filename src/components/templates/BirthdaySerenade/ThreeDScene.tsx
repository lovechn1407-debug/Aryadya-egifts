import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

function Flame({ position, idx }: { position: [number, number, number]; idx: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 8 + idx) * 0.2;
      ref.current.scale.set(s, 1 + Math.sin(clock.elapsedTime * 6 + idx) * 0.15, s);
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <coneGeometry args={[0.05, 0.18, 8]} />
      <meshStandardMaterial color="#FDE68A" emissive="#F59E0B" emissiveIntensity={2} />
    </mesh>
  );
}

function Candle({ position, color, idx }: { position: [number, number, number]; color: string; idx: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Flame position={[0, 0.7, 0]} idx={idx} />
      <pointLight position={[0, 0.75, 0]} intensity={0.3} color="#FDE68A" distance={2} />
    </group>
  );
}

function StrawberryRing({ tierRadius, y, count }: { tierRadius: number; y: number; count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * tierRadius, y, Math.sin(a) * tierRadius]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#EF4444" roughness={0.5} />
          </mesh>
        );
      })}
    </>
  );
}

function Cake({ onClick }: { onClick: () => void }) {
  return (
    <group onClick={onClick}>
      {/* Plate */}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 0.08, 64]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Bottom tier */}
      <mesh position={[0, 0.425, 0]} castShadow>
        <cylinderGeometry args={[2, 2, 0.85, 64]} />
        <meshStandardMaterial color="#FFFBF5" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <torusGeometry args={[2, 0.12, 16, 64]} />
        <meshStandardMaterial color="#E91E8C" />
      </mesh>
      <StrawberryRing tierRadius={2} y={0.95} count={8} />

      {/* Middle tier */}
      <mesh position={[0, 1.275, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.75, 64]} />
        <meshStandardMaterial color="#FFFBF5" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.66, 0]}>
        <torusGeometry args={[1.4, 0.1, 16, 64]} />
        <meshStandardMaterial color="#E91E8C" />
      </mesh>

      {/* Top tier */}
      <mesh position={[0, 2.3, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.65, 64]} />
        <meshStandardMaterial color="#FFFBF5" roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.63, 0]}>
        <torusGeometry args={[0.9, 0.08, 16, 64]} />
        <meshStandardMaterial color="#E91E8C" />
      </mesh>

      {/* Candles */}
      {[
        { p: [0.4, 2.95, 0.4] as [number, number, number], c: "#E91E8C" },
        { p: [-0.4, 2.95, 0.4] as [number, number, number], c: "#F59E0B" },
        { p: [0.4, 2.95, -0.4] as [number, number, number], c: "#8B5CF6" },
        { p: [-0.4, 2.95, -0.4] as [number, number, number], c: "#06B6D4" },
      ].map((c, i) => (
        <Candle key={i} position={c.p} color={c.c} idx={i} />
      ))}

      {/* Writing on cake */}
      <Text
        position={[0, 1.3, 1.5]}
        fontSize={0.22}
        color="#E91E8C"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
      >
        Happy Birthday! 🎂
      </Text>
    </group>
  );
}

function Knife({ cutting }: { cutting: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current && !cutting) {
      ref.current.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.15 + 5.5;
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.05;
    }
  });
  useEffect(() => {
    if (cutting && ref.current) {
      gsap.to(ref.current.position, { x: 0, y: 2.5, z: 0, duration: 0.8, ease: "power3.in" });
      gsap.to(ref.current.position, { x: 1.8, y: 5.5, z: 0, duration: 0.5, delay: 0.85, ease: "power2.out" });
    }
  }, [cutting]);
  return (
    <group ref={ref} position={[1.8, 5.5, 0]}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
        <meshStandardMaterial color="#5D4037" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.45, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.12, 1.0, 0.02]} />
        <meshStandardMaterial color="#E2E8F0" metalness={1} roughness={0.05} />
      </mesh>
    </group>
  );
}

function Slice({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (visible && ref.current) {
      ref.current.position.set(0, 0.425, 0);
      ref.current.rotation.set(0, 0, 0);
      gsap.to(ref.current.position, { x: 3, z: 1.5, duration: 0.8, ease: "power3.out" });
      gsap.to(ref.current.rotation, { y: 0.4, duration: 0.8 });
    }
  }, [visible]);
  if (!visible) return null;
  return (
    <mesh ref={ref} position={[0, 0.425, 0]}>
      <cylinderGeometry args={[2, 2, 0.85, 32, 1, false, 0, Math.PI / 4]} />
      <meshStandardMaterial color="#FFFBF5" />
    </mesh>
  );
}

function Confetti({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array | null>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  useEffect(() => {
    if (visible && ref.current) {
      const count = 200;
      const pos = new Float32Array(count * 3);
      const vel = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const palette = [
        [0.91, 0.12, 0.55],
        [0.96, 0.62, 0.04],
        [0.99, 0.9, 0.44],
        [0.55, 0.36, 0.96],
      ];
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 1;
        pos[i * 3 + 1] = 2.5;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 1;
        vel[i * 3] = (Math.random() - 0.5) * 3;
        vel[i * 3 + 1] = Math.random() * 4 + 2;
        vel[i * 3 + 2] = (Math.random() - 0.5) * 3;
        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = c[0];
        colors[i * 3 + 1] = c[1];
        colors[i * 3 + 2] = c[2];
      }
      const geom = ref.current.geometry as THREE.BufferGeometry;
      geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      velocities.current = vel;
      if (material.current) material.current.opacity = 1;
    }
  }, [visible]);
  useFrame((_, delta) => {
    if (!visible || !ref.current || !velocities.current) return;
    const geom = ref.current.geometry as THREE.BufferGeometry;
    const pos = geom.attributes.position as THREE.BufferAttribute;
    const v = velocities.current;
    for (let i = 0; i < pos.count; i++) {
      pos.array[i * 3] += v[i * 3] * delta;
      pos.array[i * 3 + 1] += v[i * 3 + 1] * delta;
      pos.array[i * 3 + 2] += v[i * 3 + 2] * delta;
      v[i * 3 + 1] -= 6 * delta;
    }
    pos.needsUpdate = true;
    if (material.current && material.current.opacity > 0) {
      material.current.opacity -= delta * 0.5;
    }
  });
  if (!visible) return null;
  return (
    <points ref={ref}>
      <bufferGeometry />
      <pointsMaterial
        ref={material}
        size={0.1}
        vertexColors
        transparent
        opacity={1}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingHBD({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (visible && ref.current) {
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, 6, 0.02);
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.04;
      ref.current.scale.set(s, s, s);
    }
  });
  useEffect(() => {
    if (visible && ref.current) ref.current.position.set(0, 3, 2);
  }, [visible]);
  if (!visible) return null;
  return (
    <group ref={ref} position={[0, 3, 2]}>
      <Text fontSize={0.4} color="#F59E0B" anchorX="center" anchorY="middle">
        Happy Birthday! 🎉
      </Text>
    </group>
  );
}

export default function ThreeDScene({ onCut }: { onCut: () => void }) {
  const [cutting, setCutting] = useState(false);
  const [sliced, setSliced] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [hbd, setHbd] = useState(false);
  const [hintsHidden, setHintsHidden] = useState(false);
  const [hasCut, setHasCut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHintsHidden(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const handleCut = () => {
    if (hasCut) return;
    setHasCut(true);
    setCutting(true);
    setTimeout(() => setSliced(true), 400);
    setTimeout(() => setConfetti(true), 400);
    setTimeout(() => setHbd(true), 1000);
    setTimeout(() => onCut(), 3500);
  };

  if (typeof window !== "undefined" && !window.WebGLRenderingContext) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <p>Your browser doesn't support 3D graphics 🎂</p>
      </div>
    );
  }

  return (
    <>
      <Canvas
        camera={{ position: [0, 3, 8], fov: 50 }}
        style={{ width: "100%", height: "100vh" }}
        shadows
      >
        <OrbitControls enablePan={false} minDistance={4} maxDistance={14} />
        <ambientLight intensity={0.4} color="#FDE68A" />
        <pointLight position={[0, 8, 0]} intensity={1.5} color="#FCE4EC" />
        <pointLight position={[-5, 2, 5]} intensity={0.8} color="#E91E8C" />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <fog attach="fog" args={["#0F172A", 15, 30]} />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Cake onClick={handleCut} />
        <Knife cutting={cutting} />
        <Slice visible={sliced} />
        <Confetti visible={confetti} />
        <FloatingHBD visible={hbd} />
      </Canvas>

      <AnimatePresence>
        {!hintsHidden && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 text-white font-body text-sm bg-white/10 backdrop-blur px-4 py-2 rounded-full"
          >
            🖐️ Drag to rotate the cake
          </motion.div>
        )}
      </AnimatePresence>
      {!hasCut && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white font-body bg-rose-600/80 backdrop-blur px-5 py-2.5 rounded-full"
          style={{ background: "rgba(233,30,140,0.85)" }}
        >
          🔪 Tap the cake to cut it!
        </motion.div>
      )}
    </>
  );
}
