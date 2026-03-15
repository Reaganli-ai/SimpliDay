'use client';

import { Store, Package, DollarSign, ShoppingCart, TrendingUp, Target } from 'lucide-react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { mockStats, mockTrends, mockCategoryBreakdown, mockStores, mockSkus } from '@/lib/mock-data';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#18181b', '#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ec4899'];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="lg:ml-0 ml-12">
        <h1 className="text-2xl font-bold text-zinc-900">数据概览</h1>
        <p className="text-sm text-zinc-500 mt-1">餐饮门店 & SKU 经营分析</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="总门店"
          value={`${mockStats.totalStores}`}
          icon={Store}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <KpiCard
          title="总 SKU"
          value={`${mockStats.totalSkus}`}
          icon={Package}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <KpiCard
          title="总收入"
          value={`¥${(mockStats.totalRevenue / 10000).toFixed(1)}万`}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <KpiCard
          title="总订单"
          value={mockStats.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
        <KpiCard
          title="Top 20% 门店收入占比"
          value={`${mockStats.top20StoresRevenueShare}%`}
          icon={TrendingUp}
          iconColor="text-red-600"
          iconBg="bg-red-50"
          subtitle="帕累托指标"
        />
        <KpiCard
          title="Top 20% SKU 收入占比"
          value={`${mockStats.top20SkusRevenueShare}%`}
          icon={Target}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          subtitle="帕累托指标"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">收入趋势 (本月)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={mockTrends}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181b" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number | undefined) => [`¥${(value ?? 0).toLocaleString()}`, '收入']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">品类收入占比</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={mockCategoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="revenue"
                nameKey="category"
              >
                {mockCategoryBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number | undefined) => [`¥${(value ?? 0).toLocaleString()}`, '收入']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {mockCategoryBreakdown.map((cat, i) => (
              <div key={cat.category} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-zinc-600">{cat.category}</span>
                <span className="text-zinc-400 ml-auto">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Stores & SKUs */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Stores */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">门店收入排行 Top 10</h3>
          <div className="space-y-3">
            {mockStores.slice(0, 10).map((store, i) => (
              <div key={store.id} className="flex items-center gap-3">
                <span className={`text-xs font-bold w-5 text-center ${i < 3 ? 'text-amber-600' : 'text-zinc-400'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-zinc-900 truncate">{store.name}</span>
                    <span className="text-xs font-medium text-zinc-600 ml-2">¥{(store.revenue / 10000).toFixed(1)}万</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 rounded-full"
                      style={{ width: `${store.revenueShare / mockStores[0].revenueShare * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-zinc-400 w-10 text-right">{store.revenueShare}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top SKUs */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">SKU 收入排行 Top 10</h3>
          <div className="space-y-3">
            {mockSkus.slice(0, 10).map((sku, i) => (
              <div key={sku.id} className="flex items-center gap-3">
                <span className={`text-xs font-bold w-5 text-center ${i < 3 ? 'text-amber-600' : 'text-zinc-400'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-zinc-900 truncate">{sku.name}</span>
                    <span className="text-xs font-medium text-zinc-600 ml-2">¥{(sku.totalRevenue / 10000).toFixed(1)}万</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 rounded-full"
                      style={{ width: `${sku.revenueShare / mockSkus[0].revenueShare * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-zinc-400 w-10 text-right">{sku.revenueShare}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
