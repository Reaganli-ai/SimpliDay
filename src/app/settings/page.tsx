'use client';

import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { BottomNav } from '@/components/BottomNav';
import { AuthForm } from '@/components/AuthForm';
import { Globe, LogOut, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { language, setLanguage } = useI18n();

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

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-zinc-100 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-semibold text-zinc-900">
            {language === 'zh' ? '设置' : 'Settings'}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* 语言设置 */}
        <div className="bg-white rounded-xl border border-zinc-100">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-zinc-400" />
              <span className="text-sm text-zinc-900">
                {language === 'zh' ? '语言' : 'Language'}
              </span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
              className="px-3 py-1.5 bg-zinc-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-zinc-200 outline-none"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* 账号信息 */}
        <div className="bg-white rounded-xl border border-zinc-100">
          <div className="p-4 border-b border-zinc-50">
            <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
              {language === 'zh' ? '账号' : 'Account'}
            </p>
            <p className="text-sm text-zinc-900">{user.email}</p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">{language === 'zh' ? '退出登录' : 'Sign Out'}</span>
          </button>
        </div>

        {/* 版本信息 */}
        <p className="text-center text-xs text-zinc-300 pt-4">
          SimpliDay v1.0
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
