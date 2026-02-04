'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { getEntries, getUserProfile } from '@/lib/supabase';
import { AuthForm } from '@/components/AuthForm';
import { BottomNav } from '@/components/BottomNav';
import { ChatBox } from '@/components/ChatBox';
import { Entry, UserProfile } from '@/types';
import { Loader2, Dumbbell, Utensils, Heart, Zap, Flame, TrendingDown, TrendingUp, Minus } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { language } = useI18n();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [entriesData, profileData] = await Promise.all([
        getEntries(user.id),
        getUserProfile(user.id),
      ]);
      setEntries(entriesData as Entry[]);
      if (profileData) setProfile(profileData as UserProfile);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
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

  // Today's data
  const today = new Date().toDateString();
  const todayEntries = entries.filter(e => new Date(e.created_at).toDateString() === today);

  const todayFitness = todayEntries.filter(e => e.type === 'fitness');
  const todayDiet = todayEntries.filter(e => e.type === 'diet');
  const todayMood = todayEntries.filter(e => e.type === 'mood');
  const todayEnergy = todayEntries.filter(e => e.type === 'energy');

  const totalCaloriesBurned = todayFitness.reduce((sum, e) => {
    return sum + (Number(e.parsed_data?.calories_burned) || 0);
  }, 0);

  const totalCaloriesIn = todayDiet.reduce((sum, e) => {
    return sum + (Number(e.parsed_data?.calories) || 0);
  }, 0);

  const tdee = profile?.tdee || 0;
  // Net = intake - (TDEE + exercise burn). Negative means deficit (good for losing)
  const netCalories = tdee > 0 ? totalCaloriesIn - tdee - totalCaloriesBurned : 0;

  const avgMood = todayMood.length > 0
    ? Math.round(todayMood.reduce((sum, e) => sum + (Number(e.parsed_data?.mood_score) || 0), 0) / todayMood.length)
    : null;

  const avgEnergy = todayEnergy.length > 0
    ? Math.round(todayEnergy.reduce((sum, e) => sum + (Number(e.parsed_data?.energy_level) || 0), 0) / todayEnergy.length)
    : null;

  // Calorie balance visual
  const getBalanceInfo = () => {
    if (tdee === 0) return null;
    const goalType = profile?.goal || 'maintain';
    if (netCalories < -200) {
      return {
        icon: TrendingDown,
        color: goalType === 'lose' ? 'text-emerald-600' : 'text-orange-500',
        bgColor: goalType === 'lose' ? 'bg-emerald-50' : 'bg-orange-50',
        label: language === 'zh' ? '热量缺口' : 'Deficit',
      };
    } else if (netCalories > 200) {
      return {
        icon: TrendingUp,
        color: goalType === 'gain' ? 'text-emerald-600' : 'text-orange-500',
        bgColor: goalType === 'gain' ? 'bg-emerald-50' : 'bg-orange-50',
        label: language === 'zh' ? '热量盈余' : 'Surplus',
      };
    } else {
      return {
        icon: Minus,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        label: language === 'zh' ? '热量均衡' : 'Balanced',
      };
    }
  };

  const balanceInfo = getBalanceInfo();

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
        {/* 修身 / 养性 Dashboard */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            {/* 修身 (Body) */}
            <div className="bg-white rounded-xl border border-zinc-100 p-4">
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">
                {language === 'zh' ? '修身' : 'Body'}
              </h3>

              {/* Fitness */}
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-zinc-500">
                  {todayFitness.length > 0
                    ? todayFitness.map(e => String(e.parsed_data?.exercise || e.content)).join(', ')
                    : (language === 'zh' ? '暂无运动' : 'No workout')}
                </span>
              </div>
              {totalCaloriesBurned > 0 && (
                <p className="text-sm font-medium text-orange-600 mb-3 ml-5.5">
                  -{totalCaloriesBurned} kcal
                </p>
              )}

              {/* Diet */}
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs text-zinc-500">
                  {todayDiet.length > 0
                    ? `${todayDiet.length} ${language === 'zh' ? '餐' : 'meals'}`
                    : (language === 'zh' ? '暂无饮食' : 'No meals')}
                </span>
              </div>
              {totalCaloriesIn > 0 && (
                <p className="text-sm font-medium text-emerald-600 ml-5.5">
                  +{totalCaloriesIn} kcal
                </p>
              )}
            </div>

            {/* 养性 (Mind) */}
            <div className="bg-white rounded-xl border border-zinc-100 p-4">
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">
                {language === 'zh' ? '养性' : 'Mind'}
              </h3>

              {/* Mood */}
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-3.5 h-3.5 text-pink-500" />
                <span className="text-xs text-zinc-500">
                  {language === 'zh' ? '心情' : 'Mood'}
                </span>
              </div>
              {avgMood !== null ? (
                <div className="flex items-center gap-1.5 mb-3 ml-5.5">
                  <div className="flex gap-0.5">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-3 rounded-sm ${
                          i < avgMood ? 'bg-pink-500' : 'bg-zinc-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-pink-600">{avgMood}</span>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 mb-3 ml-5.5">-</p>
              )}

              {/* Energy */}
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs text-zinc-500">
                  {language === 'zh' ? '能量' : 'Energy'}
                </span>
              </div>
              {avgEnergy !== null ? (
                <div className="flex items-center gap-1.5 ml-5.5">
                  <div className="flex gap-0.5">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-3 rounded-sm ${
                          i < avgEnergy
                            ? avgEnergy >= 7 ? 'bg-emerald-500' : avgEnergy >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                            : 'bg-zinc-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${
                    avgEnergy >= 7 ? 'text-emerald-600' : avgEnergy >= 4 ? 'text-yellow-600' : 'text-red-600'
                  }`}>{avgEnergy}</span>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 ml-5.5">-</p>
              )}
            </div>
          </div>
        </section>

        {/* Calorie Balance (only show when TDEE is set) */}
        {tdee > 0 && (
          <section className="bg-white rounded-xl border border-zinc-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  {language === 'zh' ? '热量平衡' : 'Calorie Balance'}
                </span>
              </div>
              {balanceInfo && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${balanceInfo.bgColor} ${balanceInfo.color}`}>
                  {balanceInfo.label}
                </span>
              )}
            </div>

            {/* Visual bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{language === 'zh' ? '摄入' : 'In'}</span>
                <span className="font-medium text-zinc-900">{totalCaloriesIn} kcal</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, tdee > 0 ? (totalCaloriesIn / (tdee + totalCaloriesBurned)) * 100 : 0)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>{language === 'zh' ? `TDEE ${tdee}` : `TDEE ${tdee}`}{totalCaloriesBurned > 0 ? ` + ${language === 'zh' ? '运动' : 'exercise'} ${totalCaloriesBurned}` : ''}</span>
                <span>{tdee + totalCaloriesBurned} kcal</span>
              </div>
            </div>

            {/* Net number */}
            <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center justify-between">
              <span className="text-xs text-zinc-500">{language === 'zh' ? '净值' : 'Net'}</span>
              <span className={`text-sm font-semibold ${
                netCalories < 0 ? 'text-orange-600' : 'text-emerald-600'
              }`}>
                {netCalories > 0 ? '+' : ''}{netCalories} kcal
              </span>
            </div>
          </section>
        )}

        {/* Chat Box */}
        <section>
          <ChatBox entries={entries} onEntryCreated={fetchData} compact profile={profile} />
        </section>

        {/* Today's Records */}
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
