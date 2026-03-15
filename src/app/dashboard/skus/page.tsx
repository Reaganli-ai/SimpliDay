'use client';

import { mockSkus, mockCategoryBreakdown } from '@/lib/mock-data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

export default function SkusPage() {
  const chartData = mockSkus.map(s => ({
    name: s.name,
    revenue: s.totalRevenue,
    sales: s.totalSales,
  }));

  // Scatter data: price vs sales volume, bubble size = revenue
  const scatterData = mockSkus.map(s => ({
    name: s.name,
    x: s.price,
    y: s.totalSales,
    z: s.totalRevenue,
  }));

  return (
    <div className="space-y-6">
      <div className="lg:ml-0 ml-12">
        <h1 className="text-2xl font-bold text-zinc-900">SKU 分析</h1>
        <p className="text-sm text-zinc-500 mt-1">菜品销售表现与品类分析</p>
      </div>

      {/* Category Summary */}
      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {mockCategoryBreakdown.map(cat => (
          <div key={cat.category} className="bg-white rounded-xl border border-zinc-200 p-4">
            <p className="text-sm font-semibold text-zinc-900">{cat.category}</p>
            <p className="text-lg font-bold text-zinc-900 mt-1">{cat.percentage}%</p>
            <p className="text-xs text-zinc-400">{cat.skuCount} 个 SKU</p>
          </div>
        ))}
      </div>

      {/* Revenue by SKU */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">SKU 收入对比</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis
              type="number"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
            />
            <YAxis type="category" dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} width={80} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((value: any, name: any) => {
                if (name === 'revenue') return [`¥${(value ?? 0).toLocaleString()}`, '收入'];
                return [(value ?? 0).toLocaleString(), '销量'];
              }) as any}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '12px' }}
            />
            <Bar dataKey="revenue" fill="#18181b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Price vs Sales Scatter */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h3 className="text-sm font-semibold text-zinc-900 mb-1">价格 vs 销量分析</h3>
        <p className="text-xs text-zinc-400 mb-4">气泡大小代表收入，找出高性价比 SKU</p>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ bottom: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis
              type="number"
              dataKey="x"
              name="价格"
              tick={{ fill: '#71717a', fontSize: 11 }}
              label={{ value: '价格 (¥)', position: 'bottom', fill: '#71717a', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="销量"
              tick={{ fill: '#71717a', fontSize: 11 }}
              label={{ value: '销量', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }}
            />
            <ZAxis type="number" dataKey="z" range={[100, 1000]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-zinc-200 rounded-lg p-3 shadow-lg text-xs">
                    <p className="font-semibold text-zinc-900">{d.name}</p>
                    <p className="text-zinc-500 mt-1">价格: ¥{d.x}</p>
                    <p className="text-zinc-500">销量: {d.y.toLocaleString()}</p>
                    <p className="text-zinc-500">收入: ¥{d.z.toLocaleString()}</p>
                  </div>
                );
              }}
            />
            <Scatter data={scatterData} fill="#18181b" fillOpacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* SKU Detail Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-sm font-semibold text-zinc-900">SKU 详细数据</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">排名</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">SKU</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">品类</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">单价</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">销量</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">收入</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">收入占比</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">覆盖门店</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {mockSkus.map((sku, i) => (
                <tr key={sku.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold ${i < 3 ? 'text-amber-600' : 'text-zinc-400'}`}>#{i + 1}</span>
                  </td>
                  <td className="px-5 py-3 font-medium text-zinc-900">{sku.name}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{sku.category}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-zinc-500">¥{sku.price}</td>
                  <td className="px-5 py-3 text-right text-zinc-500">{sku.totalSales.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-medium text-zinc-900">¥{sku.totalRevenue.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${sku.revenueShare / mockSkus[0].revenueShare * 100}%` }} />
                      </div>
                      <span className="text-xs text-zinc-500">{sku.revenueShare}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-zinc-500">{sku.storeCount}/{mockSkus.length > 0 ? 20 : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
