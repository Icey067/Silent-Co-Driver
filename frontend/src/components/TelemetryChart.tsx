import React, { useEffect, useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import axios from 'axios';

const TelemetryChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await axios.get('http://localhost:8000/telemetry');
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch telemetry", err);
      }
    };
    fetchTelemetry();
    
    // Auto-refresh telemetry every 5 seconds (simulating live telemetry)
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
      <h2 className="text-xl font-bold text-white flex items-center mb-6">
        <BarChart2 className="w-5 h-5 mr-2 text-blue-400" />
        Race Telemetry & Stress Correlation
      </h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis 
              dataKey="lap" 
              stroke="#9CA3AF" 
              tick={{ fill: '#9CA3AF' }} 
              label={{ value: 'Lap Number', position: 'bottom', fill: '#9CA3AF', offset: 0 }}
            />
            
            <YAxis 
              yAxisId="left" 
              domain={['dataMin - 1', 'dataMax + 1']}
              stroke="#60A5FA"
              tick={{ fill: '#60A5FA' }}
              label={{ value: 'Lap Time (s)', angle: -90, position: 'insideLeft', fill: '#60A5FA', offset: -10 }}
            />
            
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[0, 10]}
              stroke="#F87171"
              tick={{ fill: '#F87171' }}
              label={{ value: 'Stress Level', angle: 90, position: 'insideRight', fill: '#F87171', offset: -10 }}
            />
            
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="top" height={36} />
            
            <Bar yAxisId="left" dataKey="lap_time" name="Lap Time" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Line yAxisId="right" type="monotone" dataKey="stress_score" name="Stress Level" stroke="#EF4444" strokeWidth={4} dot={{ r: 6, fill: '#EF4444', strokeWidth: 2, stroke: '#1F2937' }} activeDot={{ r: 8 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TelemetryChart;
