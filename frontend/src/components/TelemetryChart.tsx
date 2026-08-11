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

const TelemetryChart: React.FC = () => {
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

  return (
    <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 h-full flex flex-col overflow-hidden backdrop-blur-sm transition-colors hover:bg-white/[0.05]">
      {/* Top accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
          <BarChart2 className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">Telemetry · Stress Correlation</h2>
          <p className="text-[10px] text-white/30 tracking-widest uppercase font-mono">Live Feed</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-white/30" />
          <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Lap Time</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-px bg-white/70" />
          <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Stress Level</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
              </linearGradient>
              <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="1 4"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="lap"
              stroke="transparent"
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'monospace' }}
              tickMargin={8}
              label={{
                value: 'LAP',
                position: 'bottom',
                fill: 'rgba(255,255,255,0.15)',
                offset: 0,
                fontSize: 9,
                letterSpacing: '3px',
                fontFamily: 'monospace',
              }}
              tickLine={false}
            />

            <YAxis
              yAxisId="left"
              domain={['dataMin - 1', 'dataMax + 1']}
              stroke="transparent"
              tick={{ fill: 'rgba(255,255,255,0.20)', fontSize: 10, fontFamily: 'monospace' }}
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
              tick={{ fill: 'rgba(255,255,255,0.20)', fontSize: 10, fontFamily: 'monospace' }}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
              width={28}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                borderColor: 'rgba(255,255,255,0.12)',
                color: '#fff',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                backdropFilter: 'blur(16px)',
                padding: '10px 14px',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
              itemStyle={{ color: 'rgba(255,255,255,0.7)', padding: '2px 0' }}
              labelStyle={{ color: 'rgba(255,255,255,0.4)', marginBottom: '6px', letterSpacing: '2px' }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />

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
              stroke="rgba(255,255,255,0.80)"
              strokeWidth={2}
              dot={{ r: 3, fill: '#000', strokeWidth: 1.5, stroke: 'rgba(255,255,255,0.7)' }}
              activeDot={{ r: 5, fill: '#fff', strokeWidth: 0 }}
              filter="url(#lineGlow)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TelemetryChart;
