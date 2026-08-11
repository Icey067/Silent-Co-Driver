import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useGLTF,
  Environment,
  ContactShadows,
  Float,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Sphere,
  Torus,
  Box,
  OrbitControls,
  Text3D,
  Center,
} from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────
// Mouse-tracking hook (normalised -1 to 1)
// ─────────────────────────────────────────────
function useMouse() {
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return { mouse, smoothMouse };
}

// ─────────────────────────────────────────────
// Camera rig that follows the mouse smoothly
// ─────────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(() => {
    const targetX = mouse.current.x * 0.4;
    const targetY = mouse.current.y * 0.2;
    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─────────────────────────────────────────────
// GLB model loader component
// ─────────────────────────────────────────────
interface GLBModelProps {
  path: string;
}

function GLBModel({ path }: GLBModelProps) {
  const { scene } = useGLTF(path);
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Gentle auto-spin + mouse-driven tilt
    groupRef.current.rotation.y += 0.003;
    groupRef.current.rotation.x +=
      (mouse.current.y * 0.2 - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.z +=
      (mouse.current.x * -0.1 - groupRef.current.rotation.z) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.5} />
    </group>
  );
}

// ─────────────────────────────────────────────
// Floating ring accent
// ─────────────────────────────────────────────
function RingAccent({ color, radius, tube, position, speed }: {
  color: string;
  radius: number;
  tube: number;
  position: [number, number, number];
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = clock.getElapsedTime() * speed;
    meshRef.current.rotation.y = clock.getElapsedTime() * speed * 0.7;
  });
  return (
    <Torus ref={meshRef} args={[radius, tube, 32, 100]} position={position}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        roughness={0.1}
        metalness={0.9}
        wireframe
      />
    </Torus>
  );
}

// ─────────────────────────────────────────────
// Procedural fallback scene (no GLB needed)
// ─────────────────────────────────────────────
function ProceduralScene() {
  const coreRef = useRef<THREE.Mesh>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(({ clock }) => {
    if (!coreRef.current) return;
    coreRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    coreRef.current.rotation.x +=
      (mouse.current.y * 0.3 - coreRef.current.rotation.x) * 0.04;
    coreRef.current.rotation.z +=
      (mouse.current.x * -0.15 - coreRef.current.rotation.z) * 0.04;
  });

  return (
    <group>
      {/* Core distorted sphere */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
        <Sphere ref={coreRef} args={[1.3, 128, 128]}>
          <MeshDistortMaterial
            color="#6366f1"
            emissive="#3730a3"
            emissiveIntensity={0.5}
            distort={0.45}
            speed={2.5}
            roughness={0.05}
            metalness={0.85}
          />
        </Sphere>
      </Float>

      {/* Inner wireframe */}
      <Float speed={2} rotationIntensity={0.8} floatIntensity={0.3}>
        <Sphere args={[1.0, 32, 32]}>
          <meshStandardMaterial
            color="#818cf8"
            emissive="#4f46e5"
            emissiveIntensity={0.3}
            wireframe
            transparent
            opacity={0.25}
          />
        </Sphere>
      </Float>

      {/* Floating accent rings */}
      <RingAccent color="#38bdf8" radius={2.2} tube={0.015} position={[0, 0, 0]} speed={0.3} />
      <RingAccent color="#818cf8" radius={2.8} tube={0.012} position={[0, 0, 0]} speed={-0.2} />
      <RingAccent color="#34d399" radius={3.4} tube={0.008} position={[0, 0, 0]} speed={0.15} />

      {/* Floating satellite cubes */}
      {[
        { pos: [2.5, 0.5, 0.5] as [number,number,number], color: '#38bdf8', size: 0.18 },
        { pos: [-2.5, -0.3, 0.8] as [number,number,number], color: '#34d399', size: 0.14 },
        { pos: [0.5, 2.4, -0.5] as [number,number,number], color: '#f59e0b', size: 0.16 },
        { pos: [-1.0, -2.3, 0.3] as [number,number,number], color: '#818cf8', size: 0.12 },
        { pos: [1.8, -1.8, 1.0] as [number,number,number], color: '#f472b6', size: 0.10 },
      ].map(({ pos, color, size }, i) => (
        <Float key={i} speed={1 + i * 0.3} rotationIntensity={2} floatIntensity={0.6}>
          <Box args={[size, size, size]} position={pos}>
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
              roughness={0.1}
              metalness={0.9}
            />
          </Box>
        </Float>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────
// Orbiting particle field
// ─────────────────────────────────────────────
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 800;

  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.04;
      pointsRef.current.rotation.x = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#818cf8"
        size={0.025}
        sizeAttenuation
        transparent
        opacity={0.6}
      />
    </points>
  );
}

// ─────────────────────────────────────────────
// Main exported component
// ─────────────────────────────────────────────
interface InteractiveCanvasProps {
  modelPath?: string; // optional path to a .glb in public/
}

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ modelPath }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Section reveal on scroll
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 80 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Label animations
    gsap.fromTo(
      '.ic-label',
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-slate-950 flex flex-col lg:flex-row items-center justify-center gap-12 px-8 py-24 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[160px]" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-900/15 rounded-full blur-[100px]" />
      </div>

      {/* ── Left: Text Panel ── */}
      <div className="relative z-10 flex-1 max-w-md text-left">
        <p className="ic-label text-xs uppercase tracking-[0.35em] text-indigo-400 font-semibold mb-4">
          Real-time AI Analysis
        </p>
        <h2 className="ic-label text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
          <span className="block text-white">Intelligence</span>
          <span
            className="block text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(135deg, #818cf8, #38bdf8, #34d399)',
            }}
          >
            Under Pressure
          </span>
        </h2>
        <p className="ic-label text-slate-400 text-base leading-relaxed mb-8">
          Every radio call analysed in milliseconds. Whisper-accurate transcription,
          spectral noise reduction, and deep emotion recognition — all running locally
          on your GPU, never leaving the pits.
        </p>

        {/* Stats grid */}
        <div className="ic-label grid grid-cols-3 gap-4">
          {[
            { label: 'Latency', value: '<2s', accent: '#38bdf8' },
            { label: 'Accuracy', value: '94%', accent: '#34d399' },
            { label: 'Emotions', value: '8+', accent: '#818cf8' },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-700/60 bg-slate-900/50 backdrop-blur-sm p-4 text-center"
              style={{ boxShadow: `0 0 20px ${accent}20` }}
            >
              <p className="text-2xl font-black" style={{ color: accent }}>
                {value}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: 3D Canvas ── */}
      <div
        ref={canvasWrapRef}
        className="relative flex-1 w-full max-w-xl h-[500px] lg:h-[600px] rounded-3xl overflow-hidden border border-slate-700/40"
        style={{ boxShadow: '0 0 80px rgba(99,102,241,0.15), inset 0 0 40px rgba(0,0,0,0.4)' }}
      >
        {/* Corner decorations */}
        {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-6 h-6 border-indigo-500/50 z-10 pointer-events-none`}
            style={{
              borderTopWidth: i < 2 ? 2 : 0,
              borderBottomWidth: i >= 2 ? 2 : 0,
              borderLeftWidth: i % 2 === 0 ? 2 : 0,
              borderRightWidth: i % 2 === 1 ? 2 : 0,
            }}
          />
        ))}

        {/* HUD label */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-mono">
            3D Engine Active
          </span>
        </div>

        {/* Axis readout */}
        <div className="absolute bottom-4 right-4 z-10 text-right pointer-events-none">
          <p className="text-[9px] font-mono text-slate-600 tracking-wider">
            MOUSE-DRIVEN PARALLAX
          </p>
          <p className="text-[9px] font-mono text-indigo-500/70 tracking-wider">
            WebGL · R3F · GSAP
          </p>
        </div>

        <Canvas
          camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          shadows
        >
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-5, -5, -5]} color="#6366f1" intensity={3} />
          <pointLight position={[5, 5, 5]} color="#38bdf8" intensity={1.5} />
          <pointLight position={[0, -8, 0]} color="#34d399" intensity={1} />

          {/* Camera rig follows mouse */}
          <CameraRig />

          {/* Either GLB model or procedural scene */}
          <Suspense fallback={null}>
            {modelPath ? (
              <GLBModel path={modelPath} />
            ) : (
              <ProceduralScene />
            )}
            <ParticleField />
            <ContactShadows
              position={[0, -3.5, 0]}
              opacity={0.4}
              scale={12}
              blur={2}
              far={4}
              color="#6366f1"
            />
            <Environment preset="night" />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
};

export default InteractiveCanvas;
