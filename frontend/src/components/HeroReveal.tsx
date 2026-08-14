import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

interface HeroRevealProps {
  videoSrc?: string;
}

const HeroReveal: React.FC<HeroRevealProps> = ({ videoSrc }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLHeadingElement>(null);
  const subRef       = useRef<HTMLParagraphElement>(null);
  const eyebrowRef   = useRef<HTMLParagraphElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const overlayRef   = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // ── Santioni-style: slow, deliberate entrance ──
    // The dark overlay fades away first, then type rises up one word at a time
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Initial states
    gsap.set(overlayRef.current,  { opacity: 1 });
    gsap.set(eyebrowRef.current,  { opacity: 0, y: 20 });
    gsap.set(headingRef.current,  { opacity: 0 });
    gsap.set(subRef.current,      { opacity: 0, y: 24 });
    gsap.set(scrollCueRef.current,{ opacity: 0 });

    // 1. Overlay fades out slowly (Santioni does a dark-to-reveal)
    tl.to(overlayRef.current, {
      opacity: 0,
      duration: 1.8,
      ease: 'power2.inOut',
    })
    // 2. Eyebrow
    .to(eyebrowRef.current, { opacity: 1, y: 0, duration: 1.0 }, '-=0.8')
    // 3. Heading fades + rises — Santioni uses slow stately reveals
    .to(headingRef.current, {
      opacity: 1,
      duration: 1.4,
      ease: 'power3.out',
    }, '-=0.6')
    // 4. Sub copy
    .to(subRef.current, { opacity: 1, y: 0, duration: 1.0 }, '-=0.7')
    // 5. Scroll cue
    .to(scrollCueRef.current, { opacity: 1, duration: 0.8 }, '-=0.3');

    // Scroll parallax — video drifts slower than scroll speed
    gsap.to('.hero-video-layer', {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Content lifts away as user scrolls
    gsap.to('.hero-content-layer', {
      opacity: 0,
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '35% top',
        scrub: true,
      },
    });
  }, { scope: containerRef });

  // Mouse parallax — subtle depth
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16;
      const y = (e.clientY / window.innerHeight - 0.5) * 16;
      gsap.to('.hero-video-layer', {
        x: x * -0.4,
        y: y * -0.4,
        duration: 2.0,
        ease: 'power2.out',
        overwrite: 'auto',
      });
      gsap.to('.hero-text-layer', {
        x: x * 0.15,
        y: y * 0.15,
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
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center"
    >
      {/* ── Video / gradient background ── */}
      <div className="hero-video-layer absolute inset-0 scale-110">
        {videoSrc ? (
          <video
            className="w-full h-full object-cover"
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div className="w-full h-full bg-black">
            {/* Neon grid */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                backgroundSize: '80px 80px',
              }}
            />
            {/* Glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[140px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-500/3 rounded-full blur-[120px]" />
          </div>
        )}
      </div>

      {/* ── Dark fade-in overlay (replaces the SVG circle effect) ── */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black z-10 pointer-events-none"
      />

      {/* ── Vignette (permanent subtle dark edges) ── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      {/* ── Hero content ── */}
      <div className="hero-content-layer relative z-20 flex flex-col items-center text-center px-6 select-none">
        <div className="hero-text-layer flex flex-col items-center">
          {/* Eyebrow */}
          <p
            ref={eyebrowRef}
            className="text-[10px] uppercase tracking-[0.5em] text-lime-400/70 font-semibold mb-8 font-mono"
          >
            AI-Powered Motorsport Intelligence
          </p>

          {/* Main heading — large, stately, Santioni-weight */}
          <h1
            ref={headingRef}
            className="text-[13vw] md:text-[10vw] lg:text-[8vw] font-black tracking-[-0.04em] leading-none mb-8"
          >
            <span
              className="block text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(160deg, #ffffff 0%, #a0a0a0 100%)' }}
            >
              SILENT
            </span>
            <span
              className="block text-transparent bg-clip-text mt-[-0.05em]"
              style={{ backgroundImage: 'linear-gradient(160deg, #888888 0%, #ffffff 100%)' }}
            >
              CO-DRIVER
            </span>
          </h1>

          {/* Sub copy */}
          <p
            ref={subRef}
            className="max-w-md text-slate-300/70 text-sm md:text-base leading-relaxed tracking-wide mb-12"
          >
            Real-time stress analysis &amp; race radio intelligence —
            built for when every millisecond counts.
          </p>

          {/* Scroll cue */}
          <div ref={scrollCueRef} className="flex flex-col items-center gap-3">
            <span className="text-[9px] uppercase tracking-[0.45em] text-slate-500">
              Scroll
            </span>
            <div className="w-px h-14 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-indigo-500 to-transparent animate-[scrollLine_2s_ease-in-out_infinite]" style={{ height: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
    </section>
  );
};

export default HeroReveal;
