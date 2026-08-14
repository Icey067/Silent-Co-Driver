import React from 'react';
import { getStressColor } from '../utils/colors';

interface LogEntry {
  transcript: string;
  stress_score: number;
  actionable_insight: string;
  lap: number;
}

interface Props {
  logs: LogEntry[];
}

const RadioIncidentLog: React.FC<Props> = ({ logs }) => {
  return (
    <div className="relative bg-black/40 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl h-64 flex-none">
      <div className="px-6 py-4 border-b border-white/10 flex-none">
         <h2 className="text-sm font-bold text-white/90 tracking-wide">Radio & Incident Log</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="flex flex-col gap-2">
          {logs.length === 0 ? (
            <p className="text-xs text-white/30 font-mono text-center mt-10">No radio events logged.</p>
          ) : (
            logs.map((log, idx) => {
              const color = getStressColor(log.stress_score);
              return (
                <div key={idx} className="flex items-center gap-4 bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="w-12 flex-none">
                    <span className="text-[10px] text-white/50 font-mono">LAP {log.lap || '--'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/80 font-mono truncate">{log.transcript}</p>
                  </div>
                  <div className="flex-none">
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ backgroundColor: `${color}20`, color: color }}
                    >
                      {log.stress_score}/10
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-[10px] text-white/60 uppercase tracking-wide truncate">{log.actionable_insight}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default RadioIncidentLog;
