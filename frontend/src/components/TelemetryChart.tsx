import React, { useEffect, useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import axios from 'axios';
import { getStressColor } from '../utils/colors';

interface Props {
  stressScore?: number;
}

const TelemetryChart: React.FC<Props> = ({ stressScore = 0 }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const res = await axios.get(`${baseUrl}/telemetry`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch telemetry', err);
      }
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  const dynamicColor = getStressColor(stressScore);

  return (
    <div className="relative bg-black/40 border border-white/10 rounded-2xl p-6 h-full flex flex-col overflow-hidden backdrop-blur-xl">
      {/* Top accent */}
      <div 
        className="absolute top-0 inset-x-0 h-[2px]" 
        style={{ backgroundImage: `linear-gradient(to right, transparent, ${dynamicColor}80, transparent)` }} 
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
          <BarChart2 className="w-4 h-4 text-white/90" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white/90 tracking-wide">Telemetry Correlation</h2>
          <p className="text-[10px] text-white/50 tracking-widest uppercase font-mono">Live Data</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-white/20" />
          <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Lap Time</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-px" style={{ backgroundColor: dynamicColor }} />
          <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Stress Level</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.25)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="1 4"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="lap"
              stroke="transparent"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'monospace' }}
              tickMargin={8}
              tickLine={false}
            />

            <YAxis
              yAxisId="left"
              domain={['dataMin', 'dataMax']}
              stroke="transparent"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'monospace' }}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
              width={36}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 10]}
              stroke="transparent"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'monospace' }}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
              width={28}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
              itemStyle={{ color: 'rgba(255,255,255,0.8)', padding: '2px 0' }}
              labelStyle={{ color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            />

            {/* Lap Time bars with strictly ~25% opacity as requested */}
            <Bar
              yAxisId="left"
              dataKey="lap_time"
              name="Lap Time"
              fill="url(#barGradient)"
              radius={[3, 3, 0, 0]}
              maxBarSize={40}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="stress_score"
              name="Stress"
              stroke={dynamicColor}
              strokeWidth={3}
              dot={{ r: 4, fill: '#000', strokeWidth: 2, stroke: dynamicColor }}
              activeDot={{ r: 6, fill: '#fff', strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TelemetryChart;
