import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// ─────────────────────────────────────────────
// Timeline data
// ─────────────────────────────────────────────
const TIMELINE_EVENTS = [
  {
    step: '01',
    title: 'Radio Signal Received',
    body: 'Compressed, noise-saturated audio from the driver radio is captured and buffered in real time — tyre squeal, engine roar, and all.',
    accent: '#38bdf8',
    icon: '📡',
    tag: 'INPUT',
  },
  {
    step: '02',
    title: 'Spectral Noise Reduction',
    body: 'A spectral gating pass strips motorsport-specific background noise, handing the models a clean, isolated voice signal.',
    accent: '#a78bfa',
    icon: '🎛️',
    tag: 'FILTER',
  },
  {
    step: '03',
    title: 'Whisper Transcription',
    body: 'OpenAI Whisper-base transcribes the cleaned clip with high accuracy. Segment no-speech probabilities are averaged into a confidence score.',
    accent: '#34d399',
    icon: '🧠',
    tag: 'MODEL 1',
  },
  {
    step: '04',
    title: 'Wav2Vec2 Emotion SER',
    body: 'A large cross-lingual Wav2Vec2 model classifies acoustic emotion. Angry/fearful → Stressed. Happy/sad/neutral → Calm. VRAM cleared between models.',
    accent: '#f59e0b',
    icon: '⚡',
    tag: 'MODEL 2',
  },
  {
    step: '05',
    title: 'Dashboard Update',
    body: 'JSON payload streams back to the frontend — transcript, mood, stress score and confidence — updating the live telemetry view instantly.',
    accent: '#f472b6',
    icon: '🏁',
    tag: 'OUTPUT',
  },
];

// ─────────────────────────────────────────────
// Single card — Santioni-style: slow fade + rise
// ─────────────────────────────────────────────
interface CardProps {
  event: (typeof TIMELINE_EVENTS)[0];
  index: number;
}

const TimelineCard: React.FC<CardProps> = ({ event, index }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, y: 50 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            delay: index * 0.08,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div ref={ref} className="flex items-start gap-5 md:gap-8">
      {/* Left: node + line */}
      <div className="flex-none flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-base border-2 z-10 relative"
          style={{
            borderColor: event.accent,
            backgroundColor: `${event.accent}12`,
            boxShadow: `0 0 20px ${event.accent}30`,
          }}
        >
          {event.icon}
        </div>
        {/* Connector line (not shown on last item) */}
        {index < TIMELINE_EVENTS.length - 1 && (
          <div
            className="w-px mt-2"
            style={{
              height: '60px',
              background: `linear-gradient(180deg, ${event.accent}60, transparent)`,
            }}
          />
        )}
      </div>

      {/* Right: card */}
      <div
        className="flex-1 rounded-2xl border bg-slate-900/50 backdrop-blur-sm p-5 md:p-6 mb-6"
        style={{ borderColor: `rgba(255,255,255,0.12)`, backgroundColor: `rgba(255,255,255,0.04)` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span
            className="text-[9px] font-bold tracking-[0.35em] px-2.5 py-1 rounded-full border"
            style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)' }}
          >
            {event.tag}
          </span>
          <span className="text-[9px] font-mono text-slate-600">{event.step} / 05</span>
        </div>

        <h3 className="text-lg md:text-xl font-black text-white mb-2 tracking-tight">
          {event.title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">{event.body}</p>

        <div
          className="mt-4 h-px rounded-full w-1/4"
          style={{ background: `linear-gradient(90deg, ${event.accent}, transparent)` }}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Progress bar driven by section scroll
// ─────────────────────────────────────────────
const ProgressBar: React.FC<{ sectionRef: React.RefObject<HTMLDivElement | null> }> = ({ sectionRef }) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      const bar = barRef.current;
      if (!section || !bar) return;

      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
      bar.style.transform = `scaleX(${progress})`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sectionRef]);

  return (
    <div className="w-full h-px bg-slate-800 rounded-full overflow-hidden mb-10">
      <div
        ref={barRef}
        className="h-full origin-left"
        style={{
          background: 'linear-gradient(90deg, #6366f1, #38bdf8, #34d399)',
          transform: 'scaleX(0)',
          transition: 'transform 0.1s linear',
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// Main ScrollTimeline — NO GSAP pin, pure CSS scroll + IntersectionObserver
// ─────────────────────────────────────────────
const ScrollTimeline: React.FC = () => {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const headerRef   = useRef<HTMLDivElement>(null);

  // Santioni-style: header animates in on scroll entry
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, y: 40 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-slate-950 px-6 md:px-16 py-24 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-950/50 blur-[180px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-14">
          <ProgressBar sectionRef={sectionRef} />

          <p className="text-[10px] uppercase tracking-[0.45em] text-indigo-400 font-semibold mb-4">
            How it works
          </p>

          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            The{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #818cf8, #38bdf8)' }}
            >
              Pipeline
            </span>
          </h2>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg">
            From raw, noisy radio audio to a driver stress score in under two seconds — here's every step.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col">
          {TIMELINE_EVENTS.map((event, i) => (
            <TimelineCard key={event.step} event={event} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollTimeline;
