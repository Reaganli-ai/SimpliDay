'use client';

import { mockStores } from '@/lib/mock-data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function StoresPage() {
  const regions = Array.from(new Set(mockStores.map(s => s.region)));
  const regionData = regions.map(region => {
    const stores = mockStores.filter(s => s.region === region);
    return {
      region,
      revenue: stores.reduce((sum, s) => sum + s.revenue, 0),
      stores: stores.length,
      avgRevenue: Math.round(stores.reduce((sum, s) => sum + s.revenue, 0) / stores.length),
      avgOrderValue: Math.round(stores.reduce((sum, s) => sum + s.avgOrderValue, 0) / stores.length),
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const chartData = mockStores.map(s => ({
    name: s.name.replace('店', ''),
    revenue: s.revenue,
    orders: s.orders,
    avgOrder: s.avgOrderValue,
  }));

  return (
    <div className="space-y-6">
      <div className="lg:ml-0 ml-12">
        <h1 className="text-2xl font-bold text-zinc-900">门店分析</h1>
        <p className="text-sm text-zinc-500 mt-1">各门店经营表现对比</p>
      </div>

      {/* Region Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {regionData.map(r => (
          <div key={r.region} className="bg-white rounded-xl border border-zinc-200 p-5">
            <p className="text-sm font-semibold text-zinc-900">{r.region}</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">¥{(r.revenue / 10000).toFixed(1)}万</p>
            <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
              <span>{r.stores} 家门店</span>
              <span>均 ¥{(r.avgRevenue / 10000).toFixed(1)}万</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Comparison Chart */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">门店收入对比</h3>
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
              formatter={(value: number | undefined) => [`¥${(value ?? 0).toLocaleString()}`, '收入']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '12px' }}
            />
            <Bar dataKey="revenue" fill="#18181b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Store Detail Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-sm font-semibold text-zinc-900">门店详细数据</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">门店</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">区域</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">收入</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">订单数</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">客单价</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">收入占比</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">热销 SKU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {mockStores.map((store) => (
                <tr key={store.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-zinc-900">{store.name}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{store.region}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-zinc-900">¥{store.revenue.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-zinc-500">{store.orders.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-zinc-500">¥{store.avgOrderValue}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${store.revenueShare / mockStores[0].revenueShare * 100}%` }} />
                      </div>
                      <span className="text-xs text-zinc-500">{store.revenueShare}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-zinc-500">{store.topSku}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
