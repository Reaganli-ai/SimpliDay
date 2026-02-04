'use client';

import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { Header } from '@/components/Header';
import { AuthForm } from '@/components/AuthForm';
import { Globe, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { t, language, setLanguage } = useI18n();

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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          {t.settings.title}
        </h1>

        <div className="space-y-4">
          {/* 语言设置 */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-zinc-400" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {t.settings.language}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {language === 'zh' ? '选择界面语言' : 'Choose interface language'}
                  </p>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
                className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* 账号信息 */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-4">
              {language === 'zh' ? '账号' : 'Account'}
            </h3>
            <p className="text-sm text-zinc-500 mb-4">{user.email}</p>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              {t.auth.signOut}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
