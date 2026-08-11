import { useState } from 'react';
import HeroReveal from './components/HeroReveal';
import LiveDashboard from './components/LiveDashboard';

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
    <div className="bg-black text-white font-sans overflow-x-hidden">
      {/* ── Hero ── */}
      <HeroReveal />

      {/* ── Live Dashboard with NK Studio Scroll Animation ── */}
      <LiveDashboard
        analysisResult={analysisResult}
        onAnalysisResult={handleAnalysisResult}
      />
    </div>
  );
}

export default App;
