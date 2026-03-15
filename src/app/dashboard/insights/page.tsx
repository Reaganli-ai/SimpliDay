'use client';

import { InsightCard } from '@/components/dashboard/InsightCard';
import { mockInsights, mockStores, mockSkus, mockStats } from '@/lib/mock-data';

export default function InsightsPage() {
  // Group stores by performance tiers
  const top20Count = Math.ceil(mockStores.length * 0.2);
  const topStores = mockStores.slice(0, top20Count);
  const midStores = mockStores.slice(top20Count, mockStores.length - top20Count);
  const bottomStores = mockStores.slice(mockStores.length - top20Count);

  const topAvgRevenue = Math.round(topStores.reduce((sum, s) => sum + s.revenue, 0) / topStores.length);
  const bottomAvgRevenue = Math.round(bottomStores.reduce((sum, s) => sum + s.revenue, 0) / bottomStores.length);
  const revenueGap = Math.round(topAvgRevenue / bottomAvgRevenue);

  // SKUs with low store coverage
  const lowCoverageSKUs = mockSkus.filter(s => s.storeCount < 15);

  return (
    <div className="space-y-6">
      <div className="lg:ml-0 ml-12">
        <h1 className="text-2xl font-bold text-zinc-900">经营洞察</h1>
        <p className="text-sm text-zinc-500 mt-1">基于数据分析的经营建议</p>
      </div>

      {/* Key Insights */}
      <div className="space-y-4">
        {mockInsights.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {/* Performance Tiers */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">门店分层分析</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
            <p className="text-xs font-medium text-emerald-600 uppercase">头部门店 (Top 20%)</p>
            <p className="text-xl font-bold text-zinc-900 mt-2">{topStores.length} 家</p>
            <p className="text-sm text-zinc-600 mt-1">平均收入 ¥{(topAvgRevenue / 10000).toFixed(1)}万</p>
            <div className="mt-3 pt-3 border-t border-emerald-200 space-y-1">
              {topStores.map(s => (
                <p key={s.id} className="text-xs text-zinc-600">{s.name} - ¥{(s.revenue / 10000).toFixed(1)}万</p>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-xs font-medium text-blue-600 uppercase">中部门店 (60%)</p>
            <p className="text-xl font-bold text-zinc-900 mt-2">{midStores.length} 家</p>
            <p className="text-sm text-zinc-600 mt-1">
              平均收入 ¥{(midStores.reduce((sum, s) => sum + s.revenue, 0) / midStores.length / 10000).toFixed(1)}万
            </p>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-zinc-600">这部分门店是提升整体业绩的关键群体</p>
              <p className="text-xs text-zinc-500 mt-1">建议：推广头部门店经验到中部门店</p>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-xs font-medium text-amber-600 uppercase">尾部门店 (Bottom 20%)</p>
            <p className="text-xl font-bold text-zinc-900 mt-2">{bottomStores.length} 家</p>
            <p className="text-sm text-zinc-600 mt-1">平均收入 ¥{(bottomAvgRevenue / 10000).toFixed(1)}万</p>
            <div className="mt-3 pt-3 border-t border-amber-200 space-y-1">
              {bottomStores.map(s => (
                <p key={s.id} className="text-xs text-zinc-600">{s.name} - ¥{(s.revenue / 10000).toFixed(1)}万</p>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-zinc-50 rounded-lg">
          <p className="text-sm text-zinc-700">
            头部门店平均收入是尾部门店的 <span className="font-bold text-zinc-900">{revenueGap} 倍</span>。
            差距较大，建议深入分析尾部门店的经营瓶颈。
          </p>
        </div>
      </div>

      {/* SKU Coverage Opportunities */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h3 className="text-sm font-semibold text-zinc-900 mb-1">SKU 覆盖率分析</h3>
        <p className="text-xs text-zinc-400 mb-4">以下 SKU 未覆盖所有门店，存在推广机会</p>
        <div className="space-y-3">
          {lowCoverageSKUs.map(sku => {
            const coverage = (sku.storeCount / mockStats.totalStores) * 100;
            return (
              <div key={sku.id} className="flex items-center gap-4">
                <span className="text-sm font-medium text-zinc-900 w-32 truncate">{sku.name}</span>
                <div className="flex-1">
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${coverage < 60 ? 'bg-amber-500' : 'bg-blue-500'}`}
                      style={{ width: `${coverage}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-zinc-500 w-20 text-right">{sku.storeCount}/{mockStats.totalStores} 门店</span>
                <span className="text-xs font-medium text-zinc-600 w-16 text-right">¥{(sku.totalRevenue / 10000).toFixed(1)}万</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            建议：将高收入但低覆盖率的 SKU 推广到更多门店。例如「{lowCoverageSKUs.sort((a, b) => b.totalRevenue - a.totalRevenue)[0]?.name}」
            目前仅覆盖 {lowCoverageSKUs.sort((a, b) => b.totalRevenue - a.totalRevenue)[0]?.storeCount} 家门店，但收入排名靠前。
          </p>
        </div>
      </div>

      {/* Action Recommendations */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">行动建议</h3>
        <div className="space-y-3">
          {[
            { priority: '高', action: '排查尾部门店经营问题', detail: '重点关注大学城店和高新区店，收入远低于平均水平' },
            { priority: '高', action: '推广明星 SKU 到更多门店', detail: '水煮鱼、东坡肉等高收入 SKU 未覆盖所有门店' },
            { priority: '中', action: '评估甜品品类 ROI', detail: '3 个 SKU 仅贡献 4.4% 收入，考虑是否优化' },
            { priority: '中', action: '复制华东区域成功经验', detail: '华东区域门店表现最佳，运营模式值得推广' },
            { priority: '低', action: '优化定价策略', detail: '通过价格-销量散点图找到最优定价区间' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                item.priority === '高' ? 'bg-red-50 text-red-600' :
                item.priority === '中' ? 'bg-amber-50 text-amber-600' :
                'bg-zinc-100 text-zinc-500'
              }`}>
                {item.priority}
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-900">{item.action}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
