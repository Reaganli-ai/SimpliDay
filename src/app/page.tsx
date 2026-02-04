'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { getEntries } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { AuthForm } from '@/components/AuthForm';
import { InputCard } from '@/components/InputCard';
import { EntryList } from '@/components/EntryList';
import { InsightsCard } from '@/components/InsightsCard';
import { Entry } from '@/types';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
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

  // 显示加载状态
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // 未登录显示登录页面
  if (!user) {
    return <AuthForm />;
  }

  // 获取今日记录
  const todayEntries = entries.filter(
    (e) => new Date(e.created_at).toDateString() === new Date().toDateString()
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* 对话输入 */}
          <InputCard onEntryCreated={fetchEntries} entries={entries} />

          {/* AI 建议卡片 */}
          <InsightsCard entries={entries} />

          {/* 今日记录 */}
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              {t.entry.today}
            </h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : (
              <EntryList entries={todayEntries} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
