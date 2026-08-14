import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import UnifiedDriverPanel from './UnifiedDriverPanel';
import TelemetryChart from './TelemetryChart';
import TacticalDirectiveCard from './TacticalDirectiveCard';
import RadioIncidentLog from './RadioIncidentLog';

interface LiveDashboardProps {
  analysisResult: any;
  radioHistory: any[];
  onAnalysisResult: (result: any) => void;
}

const LiveDashboard: React.FC<LiveDashboardProps> = ({
  analysisResult,
  radioHistory,
  onAnalysisResult,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgCarRef = useRef<HTMLImageElement>(null);
  const cardsWrapRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const tl = gsap.timeline();

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
            opacity: 0.4,
            rotateX: 0,
            ease: 'power2.out',
            duration: 1.5,
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
            duration: 1,
          },
          0.3
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
            duration: 1.2,
          },
          0.5
        );
      }
    },
    { scope: sectionRef }
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardsWrapRef.current || !bgCarRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      gsap.to(cardsWrapRef.current, {
        rotateY: x * 1.5,
        rotateX: y * -1.5,
        duration: 1.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      gsap.to(bgCarRef.current, {
        x: x * -10,
        y: y * -5,
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
      className="relative w-full h-screen max-h-screen bg-black overflow-hidden flex flex-col pt-20 pb-8 px-6 md:px-12"
      style={{ perspective: '1200px' }}
    >
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <img
          ref={bgCarRef}
          src="/f1car.png"
          alt="F1 Car Background"
          className="w-full h-full object-cover select-none will-change-transform"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="absolute top-0 inset-x-0 h-px bg-white/10 z-10" />

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col h-full min-h-0">
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-white/10 will-change-transform flex-none"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-white/50 font-mono mb-2">
              Silent Co-Driver
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white/90">
              Live Dashboard
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0 border border-white/10 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-white/80 font-mono">
              Live Feed
            </span>
          </div>
        </div>

        <div
          ref={cardsWrapRef}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 will-change-transform"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Left Column */}
          <div className="lg:col-span-1 flex flex-col gap-6 h-full min-h-0">
            <UnifiedDriverPanel
              status={analysisResult.status}
              stressScore={analysisResult.stress_score}
              transcript={analysisResult.transcript}
              onAnalysisResult={onAnalysisResult}
            />

            <TacticalDirectiveCard
              category={analysisResult.driver_feedback_category}
              actionableInsight={analysisResult.actionable_insight}
              tacticalIntent={analysisResult.tactical_intent}
              stressScore={analysisResult.stress_score}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-0">
            <div className="flex-1 min-h-0">
              <TelemetryChart stressScore={analysisResult.stress_score} />
            </div>
            <RadioIncidentLog logs={radioHistory} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDashboard;
