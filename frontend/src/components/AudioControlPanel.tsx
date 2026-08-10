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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg mb-6">
      <h2 className="text-xl font-bold text-white flex items-center mb-4">
        <Upload className="w-5 h-5 mr-2 text-blue-400" />
        Audio Control Panel
      </h2>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input 
          type="file" 
          accept="audio/*" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-300
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-600 file:text-white
            hover:file:bg-blue-700
            cursor-pointer bg-gray-900 rounded-full pl-2 border border-gray-600"
        />
        <button 
          onClick={handleAnalyze} 
          disabled={!selectedFile || loading}
          className={`flex items-center px-6 py-2 rounded-full font-bold transition-all ${
            (!selectedFile || loading) ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Play className="w-5 h-5 mr-2" />
          )}
          {loading ? 'Analyzing...' : 'Analyze Clip'}
        </button>
      </div>
    </div>
  );
};

export default AudioControlPanel;
