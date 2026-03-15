'use client';

import { ParetoChart } from '@/components/dashboard/ParetoChart';
import { mockStores, mockSkus, mockStats } from '@/lib/mock-data';

export default function ParetoPage() {
  const storeData = mockStores.map(s => ({
    name: s.name.replace('店', ''),
    value: s.revenue,
    cumulative: s.cumulativeShare,
  }));

  const skuData = mockSkus.map(s => ({
    name: s.name,
    value: s.totalRevenue,
    cumulative: s.cumulativeShare,
  }));

  return (
    <div className="space-y-6">
      <div className="lg:ml-0 ml-12">
        <h1 className="text-2xl font-bold text-zinc-900">帕累托分析</h1>
        <p className="text-sm text-zinc-500 mt-1">分析收入集中度，发现 80/20 法则</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">门店帕累托指标</p>
              <p className="text-3xl font-bold text-zinc-900 mt-1">{mockStats.top20StoresRevenueShare}%</p>
              <p className="text-xs text-zinc-400 mt-1">Top 20% 门店的收入贡献</p>
            </div>
            <div className={`text-xs font-medium px-3 py-1.5 rounded-full ${
              mockStats.top20StoresRevenueShare > 60 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {mockStats.top20StoresRevenueShare > 60 ? '集中度偏高' : '分布均匀'}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100">
            <p className="text-xs text-zinc-500">
              {mockStats.top20StoresRevenueShare > 60
                ? `前 ${Math.ceil(mockStats.totalStores * 0.2)} 家门店贡献了 ${mockStats.top20StoresRevenueShare}% 的收入。尾部门店可能需要关注经营策略。`
                : '门店收入分布较为均匀，各门店经营状况健康。'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">SKU 帕累托指标</p>
              <p className="text-3xl font-bold text-zinc-900 mt-1">{mockStats.top20SkusRevenueShare}%</p>
              <p className="text-xs text-zinc-400 mt-1">Top 20% SKU 的收入贡献</p>
            </div>
            <div className={`text-xs font-medium px-3 py-1.5 rounded-full ${
              mockStats.top20SkusRevenueShare > 60 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {mockStats.top20SkusRevenueShare > 60 ? '集中度偏高' : '分布均匀'}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100">
            <p className="text-xs text-zinc-500">
              {mockStats.top20SkusRevenueShare > 60
                ? `前 ${Math.ceil(mockStats.totalSkus * 0.2)} 个 SKU 贡献了 ${mockStats.top20SkusRevenueShare}% 的收入。可以考虑精简低效 SKU。`
                : 'SKU 收入分布较为均匀，产品组合健康。'}
            </p>
          </div>
        </div>
      </div>

      {/* Pareto Charts */}
      <ParetoChart
        data={storeData}
        title="门店收入帕累托分析"
        valueLabel="门店收入"
        barColor="#3b82f6"
      />

      <ParetoChart
        data={skuData}
        title="SKU 收入帕累托分析"
        valueLabel="SKU 收入"
        barColor="#18181b"
      />

      {/* Detailed Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-sm font-semibold text-zinc-900">门店收入明细</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">排名</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">门店</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">区域</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">收入</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">占比</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">累计占比</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase">订单数</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">热销 SKU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {mockStores.map((store, i) => (
                <tr key={store.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold ${i < Math.ceil(mockStores.length * 0.2) ? 'text-amber-600' : 'text-zinc-400'}`}>
                      #{i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-zinc-900">{store.name}</td>
                  <td className="px-5 py-3 text-zinc-500">{store.region}</td>
                  <td className="px-5 py-3 text-right font-medium text-zinc-900">¥{store.revenue.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-zinc-500">{store.revenueShare}%</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      store.cumulativeShare <= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {store.cumulativeShare}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-zinc-500">{store.orders.toLocaleString()}</td>
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
