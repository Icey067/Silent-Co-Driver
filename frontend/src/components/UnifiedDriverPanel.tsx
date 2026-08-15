import React, { useState } from 'react';
import { Upload, Play, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Props {
  status: string;
  stressScore: number;
  transcript: string;
  actionableInsight?: string;
  onAnalysisResult: (result: any) => void;
}

import { getStressColor } from '../utils/colors';

const UnifiedDriverPanel: React.FC<Props> = ({ 
  status, 
  stressScore, 
  transcript, 
  onAnalysisResult 
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const res = await axios.post(`${baseUrl}/analyze-radio`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'ngrok-skip-browser-warning': 'true'
        },
      });
      onAnalysisResult(res.data);
    } catch (err: any) {
      console.error('Error analyzing audio:', err);
      const errorDetail = err.response?.data?.detail || err.message || 'Unknown error';
      alert(`Failed to analyze audio: ${errorDetail}`);
    } finally {
      setLoading(false);
    }
  };

  const stressColor = getStressColor(stressScore);
  const scorePercent = Math.min(10, stressScore) * 10;

  return (
    <div className="relative bg-black/40 border border-white/10 rounded-2xl p-6 overflow-hidden backdrop-blur-xl">
      {/* cool glowing line at the top */}
      <div 
        className="absolute top-0 inset-x-0 h-[2px]" 
        style={{ backgroundImage: `linear-gradient(to right, transparent, ${stressColor}80, transparent)` }} 
      />

      {/* audio file picker and analyze button */}
      <div className="flex items-center gap-3 mb-8">
        <label className="flex-1 flex items-center gap-3 border border-white/10 rounded-lg p-2 cursor-pointer hover:border-white/20 transition-colors bg-white/5">
          <Upload className="w-4 h-4 text-white/70 ml-1" />
          <span className="text-xs text-white/80 truncate flex-1 font-mono">
            {selectedFile ? selectedFile.name : 'NO_AUDIO_SRC'}
          </span>
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono border border-white/10 px-2 py-1 rounded bg-black/50">
            BROWSE
          </span>
          <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
        </label>
        
        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || loading}
          style={{ borderColor: selectedFile && !loading ? stressColor : 'rgba(255,255,255,0.1)' }}
          className={`flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-xs tracking-widest uppercase transition-all ${
            !selectedFile || loading
              ? 'text-white/40 bg-white/5 cursor-not-allowed border'
              : 'text-white bg-white/5 hover:bg-white/10 active:scale-95 border'
          }`}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          {loading ? 'SYNC...' : 'ANALYZE'}
        </button>
      </div>

      {/* circular stress meter and driver status */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-6">
          <div className="relative flex-none">
            <svg width="64" height="64" viewBox="0 0 72 72" className="rotate-[-90deg]">
              <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
              <circle
                cx="36" cy="36" r="28"
                fill="none"
                stroke={stressColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - scorePercent / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-white">{stressScore || '—'}</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/50 font-mono mb-1">Status</p>
            <p className="text-xl font-black uppercase tracking-wider" style={{ color: stressColor }}>
              {status || 'Standby'}
            </p>
          </div>
        </div>
      </div>

      {/* radio transcript display */}
      <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
        <p className="text-[9px] uppercase tracking-[0.4em] text-white/50 font-mono mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: stressColor }} />
          Radio Comm
        </p>
        <p className="text-sm text-white/90 leading-relaxed font-mono">
          {transcript ? `> ${transcript}` : '> AWAITING SIGNAL...'}
        </p>
      </div>
    </div>
  );
};

export default UnifiedDriverPanel;
