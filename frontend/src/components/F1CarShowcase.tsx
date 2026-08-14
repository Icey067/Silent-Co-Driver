import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const F1CarShowcase: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const carRef     = useRef<HTMLImageElement>(null);
  const glowRef    = useRef<HTMLDivElement>(null);

  // Cinematic float animation
  useEffect(() => {
    if (!carRef.current) return;
    gsap.to(carRef.current, {
      y: -18,
      duration: 3.2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    });
    gsap.to(carRef.current, {
      rotateZ: 0.8,
      duration: 4.5,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    });
  }, []);

  // Mouse-driven 3D parallax
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(carRef.current, {
        rotateY: x * 8,
        rotateX: y * -4,
        x: x * -20,
        duration: 1.8,
        ease: 'power2.out',
        overwrite: 'auto',
      });
      gsap.to(glowRef.current, {
        x: x * 40,
        y: y * 25,
        duration: 2.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Entrance reveal
  useGSAP(() => {
    gsap.fromTo(carRef.current,
      { opacity: 0, y: 80, scale: 0.9 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 1.8, ease: 'power4.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
    gsap.fromTo(glowRef.current,
      { opacity: 0, scale: 0.4 },
      {
        opacity: 1, scale: 1,
        duration: 2.2, ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Subtle noise grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse 100% 90% at 50% 50%, transparent 30%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      {/* Ground reflection line */}
      <div
        className="absolute bottom-[22%] inset-x-0 h-px z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.06) 70%, transparent)',
        }}
      />

      {/* Ground shadow / reflection ellipse */}
      <div
        className="absolute bottom-[20%] left-1/2 -translate-x-1/2 pointer-events-none z-10"
        style={{
          width: '65%',
          height: '20px',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.07) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }}
      />

      {/* Glow bloom behind car */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 55% 45% at 50% 55%, rgba(255,255,255,0.06) 0%, rgba(180,180,180,0.02) 50%, transparent 100%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Thin top rule */}
      <div className="absolute top-0 inset-x-0 h-px bg-lime-500/8 z-20 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-lime-500/8 z-20 pointer-events-none" />

      {/* HUD labels */}
      <div className="absolute top-8 left-10 z-30 pointer-events-none">
        <p className="text-[9px] uppercase tracking-[0.45em] text-lime-400 font-mono">Vehicle</p>
        <p className="text-[11px] uppercase tracking-[0.3em] text-lime-400/90 font-mono mt-0.5">F1 · Racing</p>
      </div>
      <div className="absolute top-8 right-10 z-30 pointer-events-none text-right">
        <p className="text-[9px] uppercase tracking-[0.45em] text-lime-400 font-mono">Status</p>
        <p className="text-[11px] uppercase tracking-[0.3em] text-lime-400/90 font-mono mt-0.5">● Active</p>
      </div>

      {/* Corner brackets */}
      {(['top-6 left-6 border-t border-l', 'top-6 right-6 border-t border-r', 'bottom-6 left-6 border-b border-l', 'bottom-6 right-6 border-b border-r'] as const).map((cls, i) => (
        <div key={i} className={`absolute w-5 h-5 ${cls} border-lime-400/15 z-20 pointer-events-none`} />
      ))}

      {/* THE CAR — full width, cinematic */}
      <div className="relative z-20 w-full flex items-center justify-center" style={{ perspective: '1200px' }}>
        <img
          ref={carRef}
          src="/f1car.png"
          alt="F1 Race Car"
          className="w-[92%] max-w-5xl object-contain select-none"
          style={{
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.9)) drop-shadow(0 0 80px rgba(255,255,255,0.05))',
          }}
          draggable={false}
        />
      </div>

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-30 opacity-[0.025]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)',
        }}
      />
    </section>
  );
};

export default F1CarShowcase;
