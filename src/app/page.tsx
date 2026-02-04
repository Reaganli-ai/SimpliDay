'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { getEntries } from '@/lib/supabase';
import { AuthForm } from '@/components/AuthForm';
import { BottomNav } from '@/components/BottomNav';
import { ChatBox } from '@/components/ChatBox';
import { Entry } from '@/types';
import { Loader2, Dumbbell, Utensils, Heart, Zap } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { language } = useI18n();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    if (!user) return;
    try {
      const data = await getEntries(user.id);
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

  // 计算今日数据
  const today = new Date().toDateString();
  const todayEntries = entries.filter(e => new Date(e.created_at).toDateString() === today);

  const todayFitness = todayEntries.filter(e => e.type === 'fitness');
  const todayDiet = todayEntries.filter(e => e.type === 'diet');
  const todayMood = todayEntries.filter(e => e.type === 'mood');
  const todayEnergy = todayEntries.filter(e => e.type === 'energy');

  const totalCaloriesBurned = todayFitness.reduce((sum, e) => {
    const cal = Number(e.parsed_data?.calories_burned) || 0;
    return sum + cal;
  }, 0);

  const totalCaloriesIn = todayDiet.reduce((sum, e) => {
    const cal = Number(e.parsed_data?.calories) || 0;
    return sum + cal;
  }, 0);

  const avgMood = todayMood.length > 0
    ? Math.round(todayMood.reduce((sum, e) => sum + (Number(e.parsed_data?.mood_score) || 0), 0) / todayMood.length)
    : null;

  const avgEnergy = todayEnergy.length > 0
    ? Math.round(todayEnergy.reduce((sum, e) => sum + (Number(e.parsed_data?.energy_level) || 0), 0) / todayEnergy.length)
    : null;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-zinc-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-900">SimpliDay</h1>
          <span className="text-sm text-zinc-400">
            {new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
              month: 'short',
              day: 'numeric',
              weekday: 'short'
            })}
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 今日概览 */}
        <section>
          <h2 className="text-sm font-medium text-zinc-500 mb-3">
            {language === 'zh' ? '今日概览' : 'Today'}
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {/* 健身 */}
            <div className="bg-white rounded-xl p-3 border border-zinc-100">
              <Dumbbell className="w-4 h-4 text-zinc-400 mb-2" />
              <p className="text-lg font-semibold text-zinc-900">{todayFitness.length}</p>
              <p className="text-xs text-zinc-400">{language === 'zh' ? '次运动' : 'workouts'}</p>
            </div>
            {/* 饮食 */}
            <div className="bg-white rounded-xl p-3 border border-zinc-100">
              <Utensils className="w-4 h-4 text-zinc-400 mb-2" />
              <p className="text-lg font-semibold text-zinc-900">{todayDiet.length}</p>
              <p className="text-xs text-zinc-400">{language === 'zh' ? '餐' : 'meals'}</p>
            </div>
            {/* 心情 */}
            <div className="bg-white rounded-xl p-3 border border-zinc-100">
              <Heart className="w-4 h-4 text-zinc-400 mb-2" />
              <p className="text-lg font-semibold text-zinc-900">{avgMood ?? '-'}</p>
              <p className="text-xs text-zinc-400">{language === 'zh' ? '心情' : 'mood'}</p>
            </div>
            {/* 能量 */}
            <div className="bg-white rounded-xl p-3 border border-zinc-100">
              <Zap className="w-4 h-4 text-zinc-400 mb-2" />
              <p className="text-lg font-semibold text-zinc-900">{avgEnergy ?? '-'}</p>
              <p className="text-xs text-zinc-400">{language === 'zh' ? '能量' : 'energy'}</p>
            </div>
          </div>
        </section>

        {/* 聊天窗口 */}
        <section>
          <ChatBox entries={entries} onEntryCreated={fetchEntries} compact />
        </section>

        {/* 今日热量 */}
        {(totalCaloriesBurned > 0 || totalCaloriesIn > 0) && (
          <section className="bg-white rounded-xl p-4 border border-zinc-100">
            <h2 className="text-sm font-medium text-zinc-500 mb-3">
              {language === 'zh' ? '今日热量' : 'Calories Today'}
            </h2>
            <div className="flex justify-between">
              <div>
                <p className="text-2xl font-semibold text-zinc-900">+{totalCaloriesIn}</p>
                <p className="text-xs text-zinc-400">{language === 'zh' ? '摄入' : 'in'}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-zinc-900">-{totalCaloriesBurned}</p>
                <p className="text-xs text-zinc-400">{language === 'zh' ? '消耗' : 'out'}</p>
              </div>
            </div>
          </section>
        )}

        {/* 今日记录 - 分类显示 */}
        {todayEntries.length > 0 && (() => {
          const categories = [
            { key: 'fitness' as const, icon: Dumbbell, label: language === 'zh' ? '健身' : 'Fitness', entries: todayFitness },
            { key: 'diet' as const, icon: Utensils, label: language === 'zh' ? '饮食' : 'Diet', entries: todayDiet },
            { key: 'mood' as const, icon: Heart, label: language === 'zh' ? '心情' : 'Mood', entries: todayMood },
            { key: 'energy' as const, icon: Zap, label: language === 'zh' ? '能量' : 'Energy', entries: todayEnergy },
          ].filter(c => c.entries.length > 0);

          return (
            <section>
              <h2 className="text-sm font-medium text-zinc-500 mb-3">
                {language === 'zh' ? '今日记录' : "Today's Records"}
              </h2>
              <div className="space-y-3">
                {categories.map(({ key, icon: Icon, label, entries: catEntries }) => (
                  <div key={key} className="bg-white rounded-xl border border-zinc-100">
                    <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                      <Icon className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</span>
                    </div>
                    <div className="divide-y divide-zinc-50">
                      {catEntries.slice(0, 3).map((entry) => {
                        const time = new Date(entry.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        return (
                          <div key={entry.id} className="flex items-center gap-3 px-4 py-2.5">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-zinc-900 truncate">{entry.content}</p>
                            </div>
                            <span className="text-xs text-zinc-400">{time}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}
      </main>

      <BottomNav />
    </div>
  );
}
