'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { getEntries } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { AuthForm } from '@/components/AuthForm';
import { InsightsCard } from '@/components/InsightsCard';
import { Entry, EntryType } from '@/types';
import { Loader2, Dumbbell, Utensils, Heart, Zap } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useI18n();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return;
      try {
        const data = await getEntries(user.id, 100);
        setEntries(data as Entry[]);
      } catch (error) {
        console.error('Failed to fetch entries:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEntries();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  // 统计各类型数量
  const typeCounts = entries.reduce((acc, entry) => {
    acc[entry.type] = (acc[entry.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(typeCounts).map(([type, count]) => ({
    name: t.entry[type as EntryType],
    value: count,
  }));

  const COLORS = ['#3B82F6', '#F97316', '#EC4899', '#EAB308'];

  // 按日期统计
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyData = last7Days.map(date => {
    const dayEntries = entries.filter(e =>
      e.created_at.split('T')[0] === date
    );
    return {
      date: new Date(date).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short' }),
      count: dayEntries.length,
    };
  });

  // 统计卡片数据
  const stats = [
    { icon: Dumbbell, label: t.entry.fitness, count: typeCounts['fitness'] || 0, color: 'text-blue-500' },
    { icon: Utensils, label: t.entry.diet, count: typeCounts['diet'] || 0, color: 'text-orange-500' },
    { icon: Heart, label: t.entry.mood, count: typeCounts['mood'] || 0, color: 'text-pink-500' },
    { icon: Zap, label: t.entry.energy, count: typeCounts['energy'] || 0, color: 'text-yellow-500' },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          {t.insights.title}
        </h1>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map(({ icon: Icon, label, count, color }) => (
                <div
                  key={label}
                  className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800"
                >
                  <Icon className={`w-6 h-6 ${color} mb-2`} />
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{count}</p>
                  <p className="text-sm text-zinc-500">{label}</p>
                </div>
              ))}
            </div>

            {/* AI 建议 */}
            <InsightsCard entries={entries} />

            {/* 图表 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 柱状图 - 过去7天 */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  {language === 'zh' ? '过去7天记录' : 'Last 7 Days'}
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 饼图 - 类型分布 */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  {language === 'zh' ? '记录类型分布' : 'Entry Distribution'}
                </h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-zinc-400">
                    {t.insights.noData}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
