import React, { useState } from 'react';
import AudioControlPanel from './components/AudioControlPanel';
import DriverStatusCard from './components/DriverStatusCard';
import TelemetryChart from './components/TelemetryChart';
import HeroReveal from './components/HeroReveal';
import F1CarShowcase from './components/F1CarShowcase';
import ScrollTimeline from './components/ScrollTimeline';

function App() {
  const [analysisResult, setAnalysisResult] = useState<any>({
    transcript: '',
    mood: 'Standby',
    stress_score: 0,
    confidence: 0,
  });

  const handleAnalysisResult = (result: any) => {
    setAnalysisResult({
      transcript: result.transcript,
      mood: result.mood,
      stress_score: result.stress_score,
      confidence: result.confidence,
    });
  };

  return (
    <div className="bg-black text-white font-sans">
      {/* ── Hero ── */}
      <HeroReveal />

      {/* ── F1 Car (full screen cinematic) ── */}
      <F1CarShowcase />

      {/* ── Pipeline Timeline ── */}
      <ScrollTimeline />

      {/* ── Live Dashboard ── */}
      <section className="relative w-full bg-black px-6 md:px-12 py-20 overflow-hidden">

        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        {/* Top divider */}
        <div className="absolute top-0 inset-x-0 h-px bg-white/10" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 pb-8 border-b border-white/8">
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
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/50 font-mono">Live</span>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-6">
              <AudioControlPanel onAnalysisResult={handleAnalysisResult} />
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
    </div>
  );
}

export default App;
