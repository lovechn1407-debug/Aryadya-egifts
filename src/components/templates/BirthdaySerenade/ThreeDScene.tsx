import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Text, Float, Sparkles } from "@react-three/drei";
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
      {/* Wick */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.05, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <Flame position={[0, 0.72, 0]} idx={idx} />
      <pointLight position={[0, 0.8, 0]} intensity={0.4} color="#FDE68A" distance={3} />
    </group>
  );
}

function PearlRing({ tierRadius, y, count, color, scale = 1 }: { tierRadius: number; y: number; count: number; color: string; scale?: number }) {
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * tierRadius, y, Math.sin(a) * tierRadius]}>
            <sphereGeometry args={[0.08 * scale, 16, 16]} />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

function Cake({ onClick, recipientName }: { onClick: () => void, recipientName?: string }) {
  return (
    <group onClick={onClick}>
      {/* Elegant Gold Plate - Made wider */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[3.2, 3.4, 0.1, 64]} />
        <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[3.4, 3.5, 0.05, 64]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Bottom tier - Soft Pink - Made wider */}
      <mesh position={[0, 0.425, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.85, 64]} />
        <meshStandardMaterial color="#FBCFE8" roughness={0.3} metalness={0.05} />
      </mesh>
      {/* White Icing Ring */}
      <mesh position={[0, 0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.12, 16, 64]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
      <PearlRing tierRadius={2.5} y={0.92} count={20} color="#FBBF24" scale={1.2} />
      <PearlRing tierRadius={2.5} y={0.05} count={32} color="#FFFFFF" scale={0.8} />

      {/* Middle tier - Vibrant Pink */}
      <mesh position={[0, 1.275, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.75, 64]} />
        <meshStandardMaterial color="#F9A8D4" roughness={0.3} />
      </mesh>
      {/* White Icing Ring */}
      <mesh position={[0, 1.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.1, 16, 64]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
      <PearlRing tierRadius={1.5} y={1.72} count={12} color="#FBBF24" scale={1.2} />

      {/* Top tier - Deep Pink */}
      <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.8, 64]} />
        <meshStandardMaterial color="#F472B6" roughness={0.3} />
      </mesh>
      {/* White Icing Ring */}
      <mesh position={[0, 2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.08, 16, 64]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>

      {/* Star decorations on middle tier */}
      <group position={[0, 1.275, 0]}>
        {Array.from({length: 8}).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.52, 0, Math.sin(a) * 1.52]} rotation={[Math.PI/2, 0, a]}>
              <octahedronGeometry args={[0.15, 0]} />
              <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.1} />
            </mesh>
          )
        })}
      </group>

      {/* Candles */}
      {[
        { p: [0.35, 2.55, 0.35] as [number, number, number], c: "#FFFFFF" },
        { p: [-0.35, 2.55, 0.35] as [number, number, number], c: "#FFFFFF" },
        { p: [0.35, 2.55, -0.35] as [number, number, number], c: "#FFFFFF" },
        { p: [-0.35, 2.55, -0.35] as [number, number, number], c: "#FFFFFF" },
        { p: [0, 2.55, 0] as [number, number, number], c: "#FBBF24" }, // Center gold candle
      ].map((c, i) => (
        <Candle key={i} position={c.p} color={c.c} idx={i} />
      ))}

      {/* Elegant 3D Happy Birthday Plaque */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh position={[0, 1.3, 1.53]} rotation={[-0.05, 0, 0]}>
          <boxGeometry args={[2.0, recipientName ? 0.8 : 0.5, 0.05]} />
          <meshStandardMaterial color="#FFFFFF" metalness={0.1} roughness={0.2} />
        </mesh>
        <Text
          position={[0, recipientName ? 1.45 : 1.3, 1.58]}
          rotation={[-0.05, 0, 0]}
          fontSize={0.24}
          color="#D81B60"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.5}
        >
          Happy Birthday
        </Text>
        {recipientName && (
          <Text
            position={[0, 1.15, 1.58]}
            rotation={[-0.05, 0, 0]}
            fontSize={0.3}
            color="#E91E8C"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
          >
            {recipientName}
          </Text>
        )}
      </Float>
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
      gsap.to(ref.current.position, { x: 2.5, y: 5.5, z: 0, duration: 0.5, delay: 0.85, ease: "power2.out" });
    }
  }, [cutting]);
  return (
    <group ref={ref} position={[2.5, 5.5, 0]}>
      {/* Handle */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
        <meshStandardMaterial color="#F472B6" roughness={0.4} />
      </mesh>
      {/* Handle Guard */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.08, 16]} />
        <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Blade */}
      <mesh position={[0, -0.5, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.1, 1.2, 0.02]} />
        <meshStandardMaterial color="#E2E8F0" metalness={1} roughness={0.05} />
      </mesh>
    </group>
  );
}

function Slice({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    if (visible && ref.current) {
      ref.current.position.set(0, 0, 0);
      ref.current.rotation.set(0, 0, 0);
      gsap.to(ref.current.position, { x: 3.5, z: 1.5, duration: 0.8, ease: "power3.out" });
      gsap.to(ref.current.rotation, { y: 0.4, duration: 0.8 });
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <group ref={ref} position={[0, 0, 0]}>
      {/* Bottom tier slice */}
      <mesh position={[0, 0.425, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.85, 32, 1, false, 0, Math.PI / 4]} />
        <meshStandardMaterial color="#FBCFE8" />
      </mesh>
      {/* Middle tier slice */}
      <mesh position={[0, 1.275, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.75, 32, 1, false, 0, Math.PI / 4]} />
        <meshStandardMaterial color="#F9A8D4" />
      </mesh>
      {/* Top tier slice */}
      <mesh position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.8, 32, 1, false, 0, Math.PI / 4]} />
        <meshStandardMaterial color="#F472B6" />
      </mesh>
      
      {/* Inside sponge color for the slices */}
      <mesh position={[0, 0.425, 0]}>
        <cylinderGeometry args={[2.48, 2.48, 0.86, 32, 1, false, 0, Math.PI / 4]} />
        <meshStandardMaterial color="#FFF1F2" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.275, 0]}>
        <cylinderGeometry args={[1.48, 1.48, 0.76, 32, 1, false, 0, Math.PI / 4]} />
        <meshStandardMaterial color="#FFF1F2" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.88, 0.88, 0.81, 32, 1, false, 0, Math.PI / 4]} />
        <meshStandardMaterial color="#FFF1F2" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Confetti({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array | null>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  useEffect(() => {
    if (visible && ref.current) {
      const count = 300;
      const pos = new Float32Array(count * 3);
      const vel = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const palette = [
        [0.96, 0.45, 0.71], // Pink
        [0.98, 0.75, 0.14], // Gold
        [1.00, 1.00, 1.00], // White
        [0.85, 0.11, 0.38], // Deep Pink
      ];
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 2;
        pos[i * 3 + 1] = 4.5;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
        vel[i * 3] = (Math.random() - 0.5) * 4;
        vel[i * 3 + 1] = Math.random() * 5 + 3;
        vel[i * 3 + 2] = (Math.random() - 0.5) * 4;
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
      v[i * 3 + 1] -= 8 * delta; // Gravity
    }
    pos.needsUpdate = true;
    if (material.current && material.current.opacity > 0) {
      material.current.opacity -= delta * 0.4;
    }
  });
  if (!visible) return null;
  return (
    <points ref={ref}>
      <bufferGeometry />
      <pointsMaterial
        ref={material}
        size={0.15}
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
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, 6.5, 0.02);
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
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <Text 
          fontSize={0.6} 
          color="#FBBF24" 
          anchorX="center" 
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#D81B60"
        >
          Happy Birthday! 🎉
        </Text>
      </Float>
    </group>
  );
}

export default function ThreeDScene({ onCut, recipientName }: { onCut: () => void, recipientName?: string }) {
  const [cutting, setCutting] = useState(false);
  const [sliced, setSliced] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [hbd, setHbd] = useState(false);
  const [hintsHidden, setHintsHidden] = useState(false);
  const [hasCut, setHasCut] = useState(false);

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
    <div 
      style={{ width: "100%", height: "100vh", position: "relative" }}
      onPointerDown={() => setHintsHidden(true)}
      onTouchStart={() => setHintsHidden(true)}
    >
      <Canvas
        camera={{ position: [0, 5, 15], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
        shadows
      >
        <OrbitControls enablePan={false} minDistance={5} maxDistance={20} />
        
        <ambientLight intensity={1.5} color="#FFFFFF" />
        <directionalLight position={[5, 10, 5]} intensity={2} color="#FFFFFF" castShadow />
        <pointLight position={[0, 10, 0]} intensity={2.5} color="#FFFFFF" />
        <pointLight position={[-5, 4, 5]} intensity={1.8} color="#F472B6" />
        <pointLight position={[5, 2, -5]} intensity={1.2} color="#FBBF24" />
        
        <fog attach="fog" args={["#1A1A2E", 14, 30]} />
        
        <Stars radius={80} depth={40} count={4000} factor={5} saturation={0.5} fade speed={1.5} />
        <Sparkles count={100} scale={14} size={4} speed={0.4} opacity={0.6} color="#F9A8D4" />

        <Cake onClick={handleCut} recipientName={recipientName} />
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
            className="absolute top-12 left-1/2 -translate-x-1/2 text-white font-body text-sm bg-black/40 backdrop-blur px-5 py-3 rounded-full border border-white/10 shadow-xl pointer-events-none flex flex-col items-center gap-1"
          >
            <span className="font-semibold text-rose-200">🖐️ Drag to rotate the cake</span>
            <span className="text-xs opacity-75">Pinch to zoom in or zoom out</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!hasCut && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white font-body bg-rose-500/90 backdrop-blur px-6 py-3 rounded-full shadow-2xl font-bold border border-rose-400 cursor-pointer hover:bg-rose-600 transition-colors"
          style={{ background: "linear-gradient(135deg, #E91E8C, #D81B60)", zIndex: 10 }}
          onClick={handleCut}
        >
          🔪 Tap the cake to cut it!
        </motion.div>
      )}
    </div>
  );
}
