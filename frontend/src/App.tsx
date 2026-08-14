import { useState } from 'react';
import HeroReveal from './components/HeroReveal';
import LiveDashboard from './components/LiveDashboard';

function App() {
  const [analysisResult, setAnalysisResult] = useState<any>({
    transcript: '',
    mood: 'Standby',
    stress_score: 0,
    confidence: 0,
    driver_feedback_category: '',
    actionable_insight: '',
    tactical_intent: ''
  });
  
  const [radioHistory, setRadioHistory] = useState<any[]>([]);

  const handleAnalysisResult = (result: any) => {
    // Add a mocked lap if it doesn't exist, just for visual realism
    const enrichedResult = { ...result, lap: Math.floor(Math.random() * 50) + 1 };
    
    setAnalysisResult(enrichedResult);
    setRadioHistory((prev) => [enrichedResult, ...prev].slice(0, 15)); // keep last 15
  };

  return (
    <div className="bg-black text-lime-400 font-sans overflow-hidden">
      {/* ── Hero ── */}
      <HeroReveal />

      {/* ── Live Dashboard with NK Studio Scroll Animation ── */}
      <LiveDashboard
        analysisResult={analysisResult}
        radioHistory={radioHistory}
        onAnalysisResult={handleAnalysisResult}
      />
    </div>
  );
}

export default App;
