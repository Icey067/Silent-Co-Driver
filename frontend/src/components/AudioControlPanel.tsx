import React, { useState } from 'react';
import { Upload, Play, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Props {
  onAnalysisResult: (result: any) => void;
}

const AudioControlPanel: React.FC<Props> = ({ onAnalysisResult }) => {
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
      const res = await axios.post('http://localhost:8000/analyze-radio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onAnalysisResult(res.data);
    } catch (err) {
      console.error('Error analyzing audio:', err);
      alert('Failed to analyze audio. Make sure the backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 overflow-hidden backdrop-blur-sm group transition-colors hover:bg-white/[0.05]">
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
          <Upload className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">Audio Input</h2>
          <p className="text-[10px] text-white/30 tracking-widest uppercase font-mono">Radio Clip</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* File input */}
        <label className="flex items-center gap-3 border border-white/10 rounded-xl p-3 cursor-pointer hover:border-white/20 transition-colors bg-white/[0.02]">
          <div className="text-white/40">
            <Upload className="w-4 h-4" />
          </div>
          <span className="text-sm text-white/40 truncate flex-1">
            {selectedFile ? selectedFile.name : 'Choose audio file…'}
          </span>
          <span className="text-[10px] text-white/25 uppercase tracking-widest font-mono border border-white/10 px-2 py-1 rounded-md">
            Browse
          </span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || loading}
          className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase transition-all ${
            !selectedFile || loading
              ? 'border border-white/8 text-white/20 cursor-not-allowed'
              : 'border border-white/25 text-white bg-white/8 hover:bg-white/12 hover:border-white/40 active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {loading ? 'Analyzing…' : 'Analyze Clip'}
        </button>
      </div>
    </div>
  );
};

export default AudioControlPanel;
