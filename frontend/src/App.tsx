import React, { useState } from 'react';
import AudioControlPanel from './components/AudioControlPanel';
import DriverStatusCard from './components/DriverStatusCard';
import TelemetryChart from './components/TelemetryChart';
import { Flag } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
          <div className="flex items-center">
            <Flag className="w-8 h-8 text-blue-500 mr-3" />
            <h1 className="text-3xl font-black tracking-tight text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              The Silent Co-Driver
            </h1>
          </div>
          <div className="text-sm font-semibold text-gray-400 bg-gray-900 px-4 py-2 rounded-full border border-gray-800 shadow-inner">
            PIT-WALL DASHBOARD v1.0
          </div>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col">
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
        </main>
      </div>
    </div>
  );
}

export default App;
