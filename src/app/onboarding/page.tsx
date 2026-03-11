'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { updateProfile } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Gender, Goal, ActivityLevel } from '@/types';
import { AuthForm } from '@/components/AuthForm';
import { Loader2, ChevronRight, ChevronLeft, Check, Sparkles, User, Ruler, Target, BookOpen } from 'lucide-react';

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const { language } = useI18n();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [gender, setGender] = useState<Gender | ''>('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [goal, setGoal] = useState<Goal | ''>('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | ''>('');
  const [lifestyle, setLifestyle] = useState('');

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

  const goalOptions: { value: Goal; labelZh: string; labelEn: string; emoji: string }[] = [
    { value: 'lose', labelZh: '减脂', labelEn: 'Lose weight', emoji: '🔥' },
    { value: 'maintain', labelZh: '维持', labelEn: 'Maintain', emoji: '⚖️' },
    { value: 'gain', labelZh: '增肌', labelEn: 'Gain muscle', emoji: '💪' },
  ];

  const activityOptions: { value: ActivityLevel; labelZh: string; labelEn: string; descZh: string; descEn: string }[] = [
    { value: 'sedentary', labelZh: '久坐', labelEn: 'Sedentary', descZh: '几乎不运动', descEn: 'Little to no exercise' },
    { value: 'light', labelZh: '轻度', labelEn: 'Light', descZh: '每周1-3次运动', descEn: '1-3x per week' },
    { value: 'moderate', labelZh: '中度', labelEn: 'Moderate', descZh: '每周3-5次运动', descEn: '3-5x per week' },
    { value: 'active', labelZh: '活跃', labelEn: 'Active', descZh: '每周6-7次运动', descEn: '6-7x per week' },
  ];

  const canProceed = () => {
    switch (step) {
      case 1: return gender !== '' && age !== '';
      case 2: return heightCm !== '' && weightKg !== '';
      case 3: return goal !== '' && activityLevel !== '';
      case 4: return true; // lifestyle is optional
      default: return false;
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        gender: gender as Gender,
        age: Number(age),
        height_cm: Number(heightCm),
        weight_kg: Number(weightKg),
        goal: goal as Goal,
        activity_level: activityLevel as ActivityLevel,
        lifestyle: lifestyle || undefined,
        onboarding_completed: true,
      });
      router.push('/');
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const stepIcons = [User, Ruler, Target, BookOpen];
  const StepIcon = stepIcons[step - 1];

  const stepTitles = {
    1: { zh: '基本信息', en: 'About You' },
    2: { zh: '身体数据', en: 'Your Body' },
    3: { zh: '你的目标', en: 'Your Goal' },
    4: { zh: '生活状态', en: 'Your Lifestyle' },
  };

  const stepSubtitles = {
    1: { zh: '让我们先了解一下你', en: "Let's get to know you" },
    2: { zh: '帮助我们计算你的每日消耗', en: 'Helps us calculate your daily energy needs' },
    3: { zh: '选择你的健身目标和运动频率', en: 'Choose your fitness goal and activity level' },
    4: { zh: '描述你的日常，获得更个性化的建议', en: 'Describe your routine for personalized advice' },
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zinc-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-900">SimpliDay</h1>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-zinc-500">
              {language === 'zh' ? '设置向导' : 'Setup'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 flex flex-col">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-emerald-500'
                  : s < step
                  ? 'w-2 bg-emerald-300'
                  : 'w-2 bg-zinc-200'
              }`}
            />
          ))}
        </div>

        {/* Step header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mb-4">
            <StepIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-1">
            {language === 'zh'
              ? stepTitles[step as keyof typeof stepTitles].zh
              : stepTitles[step as keyof typeof stepTitles].en}
          </h2>
          <p className="text-sm text-zinc-500">
            {language === 'zh'
              ? stepSubtitles[step as keyof typeof stepSubtitles].zh
              : stepSubtitles[step as keyof typeof stepSubtitles].en}
          </p>
        </div>

        {/* Step content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-zinc-100 p-6 space-y-5">
            {step === 1 && (
              <>
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    {language === 'zh' ? '性别' : 'Gender'}
                  </label>
                  <div className="flex gap-3">
                    {(['male', 'female'] as Gender[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                          gender === g
                            ? 'bg-zinc-900 text-white shadow-sm'
                            : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                        }`}
                      >
                        {g === 'male'
                          ? (language === 'zh' ? '男' : 'Male')
                          : (language === 'zh' ? '女' : 'Female')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    {language === 'zh' ? '年龄' : 'Age'}
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder={language === 'zh' ? '例如：25' : 'e.g. 25'}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    {language === 'zh' ? '身高 (cm)' : 'Height (cm)'}
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="170"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    {language === 'zh' ? '体重 (kg)' : 'Weight (kg)'}
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="65"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                {/* Goal */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    {language === 'zh' ? '目标' : 'Goal'}
                  </label>
                  <div className="space-y-2">
                    {goalOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setGoal(opt.value)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                          goal === opt.value
                            ? 'bg-zinc-900 text-white shadow-sm'
                            : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                        }`}
                      >
                        <span className="text-lg">{opt.emoji}</span>
                        {language === 'zh' ? opt.labelZh : opt.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    {language === 'zh' ? '运动频率' : 'Activity Level'}
                  </label>
                  <div className="space-y-2">
                    {activityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setActivityLevel(opt.value)}
                        className={`w-full flex flex-col px-4 py-3 rounded-xl text-sm transition-all text-left ${
                          activityLevel === opt.value
                            ? 'bg-zinc-900 text-white shadow-sm'
                            : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                        }`}
                      >
                        <span className="font-medium">
                          {language === 'zh' ? opt.labelZh : opt.labelEn}
                        </span>
                        <span className={`text-xs mt-0.5 ${
                          activityLevel === opt.value ? 'text-zinc-300' : 'text-zinc-400'
                        }`}>
                          {language === 'zh' ? opt.descZh : opt.descEn}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                {/* Lifestyle */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    {language === 'zh' ? '生活状态' : 'Lifestyle'}
                    <span className="text-zinc-400 font-normal ml-1">
                      ({language === 'zh' ? '选填' : 'optional'})
                    </span>
                  </label>
                  <textarea
                    value={lifestyle}
                    onChange={(e) => setLifestyle(e.target.value)}
                    rows={4}
                    placeholder={language === 'zh'
                      ? '描述你的日常作息，帮助 AI 给出更个性化的建议。\n例如：在美国读研，平时上课+图书馆，周末偶尔hiking'
                      : 'Describe your daily routine so AI can give personalized advice.\ne.g. Grad student, classes + library on weekdays, hiking on weekends'}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 resize-none"
                  />
                </div>

                {/* Summary */}
                <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
                  <h3 className="text-sm font-medium text-zinc-700 mb-3">
                    {language === 'zh' ? '确认信息' : 'Summary'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-zinc-400">{language === 'zh' ? '性别' : 'Gender'}</span>
                      <p className="text-zinc-900 font-medium">
                        {gender === 'male'
                          ? (language === 'zh' ? '男' : 'Male')
                          : (language === 'zh' ? '女' : 'Female')}
                      </p>
                    </div>
                    <div>
                      <span className="text-zinc-400">{language === 'zh' ? '年龄' : 'Age'}</span>
                      <p className="text-zinc-900 font-medium">{age}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">{language === 'zh' ? '身高' : 'Height'}</span>
                      <p className="text-zinc-900 font-medium">{heightCm} cm</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">{language === 'zh' ? '体重' : 'Weight'}</span>
                      <p className="text-zinc-900 font-medium">{weightKg} kg</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">{language === 'zh' ? '目标' : 'Goal'}</span>
                      <p className="text-zinc-900 font-medium">
                        {goalOptions.find(o => o.value === goal)?.[language === 'zh' ? 'labelZh' : 'labelEn']}
                      </p>
                    </div>
                    <div>
                      <span className="text-zinc-400">{language === 'zh' ? '运动频率' : 'Activity'}</span>
                      <p className="text-zinc-900 font-medium">
                        {activityOptions.find(o => o.value === activityLevel)?.[language === 'zh' ? 'labelZh' : 'labelEn']}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-4 py-3 rounded-xl text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {language === 'zh' ? '上一步' : 'Back'}
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {language === 'zh' ? '下一步' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {language === 'zh' ? '完成设置' : 'Complete Setup'}
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
