import React from 'react';
import { Activity } from 'lucide-react';

interface Props {
  mood: string;
  stressScore: number;
  transcript: string;
  confidence: number;
}

const DriverStatusCard: React.FC<Props> = ({ mood, stressScore, transcript, confidence }) => {
  let statusColor = "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]";
  let textColor = "text-green-400";
  
  if (mood === "Tired") {
    statusColor = "bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.6)]";
    textColor = "text-yellow-400";
  } else if (mood === "Stressed") {
    statusColor = "bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.6)]";
    textColor = "text-red-400";
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg mb-6">
      <h2 className="text-xl font-bold text-white flex items-center mb-6">
        <Activity className="w-5 h-5 mr-2 text-blue-400" />
        Live Driver Status
      </h2>
      
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${statusColor} mb-3 transition-all duration-500`}>
            <span className="text-4xl font-black text-white">{stressScore || "-"}</span>
          </div>
          <span className={`font-bold text-xl ${textColor} uppercase tracking-wider`}>{mood || "Standby"}</span>
          <span className="text-xs text-gray-400 mt-1">Stress Index (1-10)</span>
        </div>
        
        <div className="flex-1 bg-gray-900 p-5 rounded-lg border border-gray-700 w-full relative overflow-hidden min-h-[140px] flex flex-col justify-center">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <p className="text-xs text-gray-500 mb-2 font-bold tracking-widest uppercase">Latest Radio Transcript</p>
          <p className="text-xl text-white font-medium italic">
            "{transcript || "Awaiting radio transmission..."}"
          </p>
          {transcript && (
            <div className="mt-4 text-xs text-blue-400 font-semibold bg-blue-900/30 inline-block px-2 py-1 rounded">
              AI Confidence: {(confidence * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverStatusCard;
