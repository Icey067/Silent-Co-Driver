import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AudioControlPanel from './AudioControlPanel';
import DriverStatusCard from './DriverStatusCard';
import TelemetryChart from './TelemetryChart';

gsap.registerPlugin(ScrollTrigger);

interface LiveDashboardProps {
  analysisResult: any;
  onAnalysisResult: (result: any) => void;
}

const LiveDashboard: React.FC<LiveDashboardProps> = ({
  analysisResult,
  onAnalysisResult,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgCarRef = useRef<HTMLImageElement>(null);
  const cardsWrapRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // NK Studio style ScrollTrigger animation
  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          end: 'top 20%',
          scrub: 1.2,
        },
      });

      // 1. Car background zooms in and levels off
      if (bgCarRef.current) {
        tl.fromTo(
          bgCarRef.current,
          {
            scale: 1.35,
            y: 80,
            opacity: 0.05,
            rotateX: 15,
          },
          {
            scale: 1.0,
            y: 0,
            opacity: 0.22,
            rotateX: 0,
            ease: 'power2.out',
          },
          0
        );
      }

      // 2. Header slide up and fade in
      if (headerRef.current) {
        tl.fromTo(
          headerRef.current,
          {
            y: 50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            ease: 'power2.out',
          },
          0.1
        );
      }

      // 3. Dashboard cards tilt up, scale into view
      if (cardsWrapRef.current) {
        tl.fromTo(
          cardsWrapRef.current,
          {
            y: 100,
            scale: 0.92,
            opacity: 0.1,
            rotateX: 12,
            transformPerspective: 1200,
          },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            rotateX: 0,
            ease: 'power3.out',
          },
          0.15
        );
      }
    },
    { scope: sectionRef }
  );

  // Interactive mouse parallax tilt on the dashboard grid
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardsWrapRef.current || !bgCarRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      // Subtle tilt for cards
      gsap.to(cardsWrapRef.current, {
        rotateY: x * 2.5,
        rotateX: y * -2.5,
        duration: 1.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      // Opposite subtle drift for background car
      gsap.to(bgCarRef.current, {
        x: x * -15,
        y: y * -10,
        duration: 2.0,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black px-6 md:px-12 py-20 overflow-hidden min-h-screen flex flex-col justify-center"
      style={{ perspective: '1200px' }}
    >
      {/* F1 Car static background image with GSAP scroll scale/fade */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <img
          ref={bgCarRef}
          src="/f1car.png"
          alt="F1 Car Background"
          className="w-full h-full object-cover select-none will-change-transform"
          draggable={false}
        />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-white/10 z-10" />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 pb-8 border-b border-white/8 will-change-transform"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-white/30 font-mono mb-2">
              Silent Co-Driver
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Live Dashboard
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0 border border-white/10 px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-white/50 font-mono">
              Live
            </span>
          </div>
        </div>

        {/* Grid Container with 3D tilt scroll animation */}
        <div
          ref={cardsWrapRef}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 will-change-transform"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="lg:col-span-1 flex flex-col gap-6">
            <AudioControlPanel onAnalysisResult={onAnalysisResult} />
            <DriverStatusCard
              mood={analysisResult.mood}
              stressScore={analysisResult.stress_score}
              transcript={analysisResult.transcript}
              confidence={analysisResult.confidence}
            />
          </div>
          <div className="lg:col-span-2">
            <TelemetryChart />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDashboard;
