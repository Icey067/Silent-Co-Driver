import React from 'react';
import { Activity } from 'lucide-react';

interface Props {
  mood: string;
  stressScore: number;
  transcript: string;
  confidence: number;
}

const DriverStatusCard: React.FC<Props> = ({ mood, stressScore, transcript, confidence }) => {
  // Monochrome: use opacity and brightness only — no colors
  const isAlert = mood === 'Stressed';
  const isTired = mood === 'Tired';

  const scorePercent = Math.min(10, stressScore) * 10;

  return (
    <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 overflow-hidden backdrop-blur-sm transition-colors hover:bg-white/[0.05]">
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
          <Activity className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">Driver Status</h2>
          <p className="text-[10px] text-white/30 tracking-widest uppercase font-mono">Neural Analysis</p>
        </div>
      </div>

      {/* Stress gauge + label */}
      <div className="flex items-center gap-6 mb-6">
        {/* Ring gauge */}
        <div className="relative flex-none">
          <svg width="72" height="72" viewBox="0 0 72 72" className="rotate-[-90deg]">
            {/* Track */}
            <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            {/* Progress */}
            <circle
              cx="36" cy="36" r="28"
              fill="none"
              stroke={isAlert ? 'rgba(255,255,255,0.7)' : isTired ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - scorePercent / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
            />
          </svg>
          {/* Centre score */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-black text-white">{stressScore || '—'}</span>
          </div>
        </div>

        {/* Mood label */}
        <div>
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/25 font-mono mb-1">Mood</p>
          <p
            className="text-2xl font-black uppercase tracking-wider"
            style={{
              color: isAlert ? 'rgba(255,255,255,0.95)' : isTired ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.40)',
            }}
          >
            {mood || 'Standby'}
          </p>
          <p className="text-[9px] text-white/20 font-mono mt-1 tracking-widest uppercase">Index 0–10</p>
        </div>
      </div>

      {/* Transcript box */}
      <div className="border border-white/8 rounded-xl p-4 bg-white/[0.02]">
        <p className="text-[9px] uppercase tracking-[0.4em] text-white/25 font-mono mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
          Transcript
        </p>
        <p className="text-sm text-white/50 leading-relaxed italic">
          "{transcript || 'Awaiting radio transmission…'}"
        </p>
        {transcript && confidence > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[9px] text-white/20 font-mono uppercase tracking-widest">AI Confidence</p>
            <div className="flex items-center gap-2">
              {/* Mini bar */}
              <div className="w-20 h-px bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/40 rounded-full transition-all duration-700"
                  style={{ width: `${(confidence * 100).toFixed(0)}%` }}
                />
              </div>
              <p className="text-[9px] text-white/40 font-mono">{(confidence * 100).toFixed(1)}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverStatusCard;
