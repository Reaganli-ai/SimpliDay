'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { getUserProfile, updateProfile } from '@/lib/supabase';
import { BottomNav } from '@/components/BottomNav';
import { AuthForm } from '@/components/AuthForm';
import { Globe, LogOut, Loader2, Save, User } from 'lucide-react';
import { UserProfile, Gender, Goal, ActivityLevel } from '@/types';

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { language, setLanguage } = useI18n();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Profile form state
  const [gender, setGender] = useState<Gender | ''>('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('light');
  const [lifestyle, setLifestyle] = useState('');

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      try {
        const profile = await getUserProfile(user.id);
        if (profile) {
          setGender(profile.gender || '');
          setAge(profile.age ? String(profile.age) : '');
          setHeightCm(profile.height_cm ? String(profile.height_cm) : '');
          setWeightKg(profile.weight_kg ? String(profile.weight_kg) : '');
          setGoal(profile.goal || 'maintain');
          setActivityLevel(profile.activity_level || 'light');
          setLifestyle(profile.lifestyle || '');
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      const profileData: Partial<Omit<UserProfile, 'id'>> = {
        gender: gender || undefined,
        age: age ? Number(age) : undefined,
        height_cm: heightCm ? Number(heightCm) : undefined,
        weight_kg: weightKg ? Number(weightKg) : undefined,
        goal,
        activity_level: activityLevel,
        lifestyle: lifestyle || undefined,
      };
      await updateProfile(user.id, profileData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

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

  const goalOptions: { value: Goal; labelZh: string; labelEn: string }[] = [
    { value: 'lose', labelZh: '减脂', labelEn: 'Lose weight' },
    { value: 'maintain', labelZh: '维持', labelEn: 'Maintain' },
    { value: 'gain', labelZh: '增肌', labelEn: 'Gain muscle' },
  ];

  const activityOptions: { value: ActivityLevel; labelZh: string; labelEn: string }[] = [
    { value: 'sedentary', labelZh: '久坐（几乎不运动）', labelEn: 'Sedentary (little/no exercise)' },
    { value: 'light', labelZh: '轻度（每周1-3次）', labelEn: 'Light (1-3x/week)' },
    { value: 'moderate', labelZh: '中度（每周3-5次）', labelEn: 'Moderate (3-5x/week)' },
    { value: 'active', labelZh: '活跃（每周6-7次）', labelEn: 'Active (6-7x/week)' },
  ];

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
        {/* 个人资料 */}
        <div className="bg-white rounded-xl border border-zinc-100">
          <div className="flex items-center gap-3 p-4 border-b border-zinc-50">
            <User className="w-5 h-5 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-900">
              {language === 'zh' ? '个人资料' : 'Profile'}
            </span>
          </div>

          {profileLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* 性别 */}
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">
                  {language === 'zh' ? '性别' : 'Gender'}
                </label>
                <div className="flex gap-2">
                  {(['male', 'female'] as Gender[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                        gender === g
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {g === 'male'
                        ? (language === 'zh' ? '男' : 'Male')
                        : (language === 'zh' ? '女' : 'Female')}
                    </button>
                  ))}
                </div>
              </div>

              {/* 年龄 */}
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">
                  {language === 'zh' ? '年龄' : 'Age'}
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder={language === 'zh' ? '例如：25' : 'e.g. 25'}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                />
              </div>

              {/* 身高体重 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">
                    {language === 'zh' ? '身高 (cm)' : 'Height (cm)'}
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="170"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">
                    {language === 'zh' ? '体重 (kg)' : 'Weight (kg)'}
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="65"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                  />
                </div>
              </div>

              {/* 目标 */}
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">
                  {language === 'zh' ? '目标' : 'Goal'}
                </label>
                <div className="flex gap-2">
                  {goalOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setGoal(opt.value)}
                      className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                        goal === opt.value
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {language === 'zh' ? opt.labelZh : opt.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* 运动频率 */}
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">
                  {language === 'zh' ? '运动频率' : 'Activity Level'}
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                >
                  {activityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {language === 'zh' ? opt.labelZh : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* 生活状态 */}
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">
                  {language === 'zh' ? '生活状态' : 'Lifestyle'}
                </label>
                <textarea
                  value={lifestyle}
                  onChange={(e) => setLifestyle(e.target.value)}
                  rows={3}
                  placeholder={language === 'zh'
                    ? '描述你的日常作息，帮助 AI 给出更个性化的建议。\n例如：在美国读研，平时上课+图书馆，周末偶尔hiking；或者：互联网打工人，996常态，周末尽量健身一次'
                    : 'Describe your daily routine so AI can give personalized advice.\ne.g. Grad student, classes + library on weekdays, hiking on weekends'}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 resize-none"
                />
              </div>

              {/* 保存按钮 */}
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  saved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-60'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <>
                    <Save className="w-4 h-4" />
                    {language === 'zh' ? '已保存' : 'Saved'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {language === 'zh' ? '保存资料' : 'Save Profile'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

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
          SimpliDay v2.0
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
