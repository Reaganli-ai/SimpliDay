'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface ParetoChartProps {
  data: { name: string; value: number; cumulative: number }[];
  title: string;
  valueLabel: string;
  barColor?: string;
}

export function ParetoChart({ data, title, valueLabel, barColor = '#18181b' }: ParetoChartProps) {
  const top20Index = Math.ceil(data.length * 0.2);
  const top20Name = data[top20Index - 1]?.name || '';

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <h3 className="text-sm font-semibold text-zinc-900 mb-1">{title}</h3>
      <p className="text-xs text-zinc-400 mb-4">帕累托分析 (80/20法则)</p>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 40, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#71717a', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#71717a', fontSize: 11 }}
            tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#71717a', fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={((value: any, name: any) => {
              if (name === 'cumulative') return [`${value ?? 0}%`, '累计占比'];
              return [`¥${(value ?? 0).toLocaleString()}`, valueLabel];
            }) as any}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '12px' }}
          />
          <ReferenceLine
            yAxisId="right"
            y={80}
            stroke="#ef4444"
            strokeDasharray="5 5"
            label={{ value: '80%', position: 'right', fill: '#ef4444', fontSize: 11 }}
          />
          {top20Name && (
            <ReferenceLine
              x={top20Name}
              stroke="#3b82f6"
              strokeDasharray="5 5"
              label={{ value: '20%', position: 'top', fill: '#3b82f6', fontSize: 11 }}
            />
          )}
          <Bar yAxisId="left" dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: barColor }} />
          {valueLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-red-500 rounded" />
          累计占比
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-red-500 rounded border-dashed" style={{ borderTop: '1px dashed #ef4444', height: 0 }} />
          80% 线
        </span>
      </div>
    </div>
  );
}
