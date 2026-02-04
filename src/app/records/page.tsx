'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { getEntries } from '@/lib/supabase';
import { AuthForm } from '@/components/AuthForm';
import { BottomNav } from '@/components/BottomNav';
import { EntryList } from '@/components/EntryList';
import { Entry } from '@/types';
import { Loader2, Dumbbell, Utensils, Heart, Zap } from 'lucide-react';

export default function RecordsPage() {
  const { user, loading: authLoading } = useAuth();
  const { language } = useI18n();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'week' | 'month' | 'all'>('week');

  const fetchEntries = async () => {
    if (!user) return;
    try {
      const data = await getEntries(user.id, 200);
      setEntries(data as Entry[]);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEntries();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  // 筛选数据
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filteredEntries = entries.filter(e => {
    const date = new Date(e.created_at);
    if (tab === 'week') return date >= weekAgo;
    if (tab === 'month') return date >= monthAgo;
    return true;
  });

  // 计算统计数据
  const fitnessEntries = filteredEntries.filter(e => e.type === 'fitness');
  const dietEntries = filteredEntries.filter(e => e.type === 'diet');
  const moodEntries = filteredEntries.filter(e => e.type === 'mood');
  const energyEntries = filteredEntries.filter(e => e.type === 'energy');

  const totalCaloriesBurned = fitnessEntries.reduce((sum, e) =>
    sum + (Number(e.parsed_data?.calories_burned) || 0), 0);

  const totalCaloriesIn = dietEntries.reduce((sum, e) =>
    sum + (Number(e.parsed_data?.calories) || 0), 0);

  const avgProtein = dietEntries.length > 0
    ? Math.round(dietEntries.reduce((sum, e) => sum + (Number(e.parsed_data?.protein) || 0), 0) / dietEntries.length)
    : 0;

  const avgMood = moodEntries.length > 0
    ? (moodEntries.reduce((sum, e) => sum + (Number(e.parsed_data?.mood_score) || 0), 0) / moodEntries.length).toFixed(1)
    : '-';

  const avgEnergy = energyEntries.length > 0
    ? (energyEntries.reduce((sum, e) => sum + (Number(e.parsed_data?.energy_level) || 0), 0) / energyEntries.length).toFixed(1)
    : '-';

  const tabLabels = {
    week: language === 'zh' ? '本周' : 'Week',
    month: language === 'zh' ? '本月' : 'Month',
    all: language === 'zh' ? '全部' : 'All',
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-zinc-100 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-semibold text-zinc-900">
            {language === 'zh' ? '记录' : 'Records'}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 时间筛选 */}
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : (
          <>
            {/* 修身 */}
            <section>
              <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wide">
                {language === 'zh' ? '修身' : 'Body'}
              </h2>

              <div className="space-y-3">
                {/* 健身统计 */}
                <div className="bg-white rounded-xl p-4 border border-zinc-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Dumbbell className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-700">
                      {language === 'zh' ? '健身' : 'Fitness'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-semibold text-zinc-900">{fitnessEntries.length}</p>
                      <p className="text-xs text-zinc-400">{language === 'zh' ? '次运动' : 'workouts'}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-zinc-900">{totalCaloriesBurned}</p>
                      <p className="text-xs text-zinc-400">{language === 'zh' ? '总消耗 kcal' : 'kcal burned'}</p>
                    </div>
                  </div>
                </div>

                {/* 饮食统计 */}
                <div className="bg-white rounded-xl p-4 border border-zinc-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-700">
                      {language === 'zh' ? '饮食' : 'Diet'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-semibold text-zinc-900">{dietEntries.length}</p>
                      <p className="text-xs text-zinc-400">{language === 'zh' ? '餐' : 'meals'}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-zinc-900">{totalCaloriesIn}</p>
                      <p className="text-xs text-zinc-400">{language === 'zh' ? '总摄入 kcal' : 'kcal intake'}</p>
                    </div>
                  </div>
                  {avgProtein > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-50">
                      <p className="text-xs text-zinc-400">
                        {language === 'zh' ? `平均蛋白质 ${avgProtein}g/餐` : `Avg protein ${avgProtein}g/meal`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 养性 */}
            <section>
              <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wide">
                {language === 'zh' ? '养性' : 'Mind'}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {/* 心情统计 */}
                <div className="bg-white rounded-xl p-4 border border-zinc-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-700">
                      {language === 'zh' ? '心情' : 'Mood'}
                    </span>
                  </div>
                  <p className="text-2xl font-semibold text-zinc-900">{avgMood}</p>
                  <p className="text-xs text-zinc-400">{language === 'zh' ? '平均分' : 'average'}</p>
                </div>

                {/* 能量统计 */}
                <div className="bg-white rounded-xl p-4 border border-zinc-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-700">
                      {language === 'zh' ? '能量' : 'Energy'}
                    </span>
                  </div>
                  <p className="text-2xl font-semibold text-zinc-900">{avgEnergy}</p>
                  <p className="text-xs text-zinc-400">{language === 'zh' ? '平均分' : 'average'}</p>
                </div>
              </div>
            </section>

            {/* 历史记录列表 */}
            <section>
              <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wide">
                {language === 'zh' ? '历史记录' : 'History'}
              </h2>
              <EntryList entries={filteredEntries} editable onUpdate={fetchEntries} />
            </section>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
