'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { updateProfile } from '@/lib/supabase';
import { Gender, Goal, ActivityLevel } from '@/types';
import { Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface OnboardingFormProps {
  onComplete: () => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const { user } = useAuth();
  const { language } = useI18n();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [gender, setGender] = useState<Gender | ''>('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [goal, setGoal] = useState<Goal | ''>('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | ''>('');
  const [lifestyle, setLifestyle] = useState('');

  const zh = language === 'zh';

  const canProceed = () => {
    switch (step) {
      case 0: return true; // welcome page
      case 1: return gender !== '' && age !== '';
      case 2: return heightCm !== '' && weightKg !== '';
      case 3: return activityLevel !== '';
      case 4: return goal !== '';
      case 5: return true; // overview, always can finish
      default: return false;
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        gender: gender || undefined,
        age: age ? Number(age) : undefined,
        height_cm: heightCm ? Number(heightCm) : undefined,
        weight_kg: weightKg ? Number(weightKg) : undefined,
        goal: goal || 'maintain',
        activity_level: activityLevel || 'light',
        lifestyle: lifestyle || undefined,
      });
      onComplete();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 6;

  const goalOptions: { value: Goal; labelZh: string; labelEn: string; emoji: string }[] = [
    { value: 'lose', labelZh: '减脂', labelEn: 'Lose weight', emoji: '🔥' },
    { value: 'maintain', labelZh: '维持体重', labelEn: 'Maintain weight', emoji: '⚖️' },
    { value: 'gain', labelZh: '增肌', labelEn: 'Gain muscle', emoji: '💪' },
  ];

  const activityOptions: { value: ActivityLevel; labelZh: string; labelEn: string; desc_zh: string; desc_en: string }[] = [
    { value: 'sedentary', labelZh: '久坐', labelEn: 'Sedentary', desc_zh: '几乎不运动', desc_en: 'Little or no exercise' },
    { value: 'light', labelZh: '轻度活动', labelEn: 'Lightly Active', desc_zh: '每周运动 1-3 次', desc_en: '1-3 times/week' },
    { value: 'moderate', labelZh: '中度活动', labelEn: 'Moderately Active', desc_zh: '每周运动 3-5 次', desc_en: '3-5 times/week' },
    { value: 'active', labelZh: '非常活跃', labelEn: 'Very Active', desc_zh: '每周运动 6-7 次', desc_en: '6-7 times/week' },
  ];

  // Calculate TDEE for overview
  const calcTDEE = () => {
    if (!gender || !age || !heightCm || !weightKg || !activityLevel) return null;
    const h = Number(heightCm);
    const w = Number(weightKg);
    const a = Number(age);
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }
    const multipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    };
    return Math.round(bmr * multipliers[activityLevel]);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Progress bar */}
      <div className="bg-white border-b border-zinc-100 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400">{step + 1} / {totalSteps}</span>
            <span className="text-xs text-zinc-400">SimpliDay</span>
          </div>
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-8">
        <div className="flex-1">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-6">
              <div className="text-5xl mb-4">👋</div>
              <h1 className="text-2xl font-bold text-zinc-900">
                {zh ? '欢迎使用 SimpliDay' : 'Welcome to SimpliDay'}
              </h1>
              <p className="text-zinc-500 leading-relaxed">
                {zh
                  ? '让我们花一分钟了解你，这样可以为你提供更个性化的健康建议。'
                  : "Let's take a minute to learn about you, so we can provide personalized health insights."}
              </p>
              <p className="text-xs text-zinc-400">
                {zh
                  ? '你的数据仅用于个性化推荐，不会分享给第三方。'
                  : 'Your data is only used for personalization and never shared with third parties.'}
              </p>
            </div>
          )}

          {/* Step 1: Gender & Age */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 mb-1">
                  {zh ? '基本信息' : 'Basic Info'}
                </h2>
                <p className="text-sm text-zinc-500">
                  {zh ? '用于计算你的基础代谢率' : 'Used to calculate your basal metabolic rate'}
                </p>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-3">
                  {zh ? '性别' : 'Gender'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['male', 'female'] as Gender[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`py-4 rounded-xl text-sm font-medium transition-all ${
                        gender === g
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-white border border-zinc-200 text-zinc-600 hover:border-emerald-300'
                      }`}
                    >
                      {g === 'male'
                        ? (zh ? '♂ 男' : '♂ Male')
                        : (zh ? '♀ 女' : '♀ Female')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-3">
                  {zh ? '年龄' : 'Age'}
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder={zh ? '例如：25' : 'e.g. 25'}
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 2: Height & Weight */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 mb-1">
                  {zh ? '身体数据' : 'Body Measurements'}
                </h2>
                <p className="text-sm text-zinc-500">
                  {zh ? '用于计算你的每日能量需求' : 'Used to calculate your daily energy needs'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-3">
                  {zh ? '身高 (cm)' : 'Height (cm)'}
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="170"
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-3">
                  {zh ? '体重 (kg)' : 'Weight (kg)'}
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="65"
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 3: Activity Level */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 mb-1">
                  {zh ? '活动量' : 'Activity Level'}
                </h2>
                <p className="text-sm text-zinc-500">
                  {zh ? '你平时的运动频率是？' : 'How often do you exercise?'}
                </p>
              </div>

              <div className="space-y-3">
                {activityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setActivityLevel(opt.value)}
                    className={`w-full text-left px-4 py-4 rounded-xl transition-all ${
                      activityLevel === opt.value
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-white border border-zinc-200 text-zinc-900 hover:border-emerald-300'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {zh ? opt.labelZh : opt.labelEn}
                    </div>
                    <div className={`text-xs mt-0.5 ${
                      activityLevel === opt.value ? 'text-emerald-100' : 'text-zinc-400'
                    }`}>
                      {zh ? opt.desc_zh : opt.desc_en}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Goal */}
          {step === 4 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 mb-1">
                  {zh ? '你的目标' : 'Your Goal'}
                </h2>
                <p className="text-sm text-zinc-500">
                  {zh ? '你目前的健康目标是什么？' : 'What is your current health goal?'}
                </p>
              </div>

              <div className="space-y-3">
                {goalOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGoal(opt.value)}
                    className={`w-full text-left px-4 py-4 rounded-xl transition-all ${
                      goal === opt.value
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-white border border-zinc-200 text-zinc-900 hover:border-emerald-300'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {opt.emoji} {zh ? opt.labelZh : opt.labelEn}
                    </span>
                  </button>
                ))}
              </div>

              {/* Optional: Lifestyle */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-3">
                  {zh ? '生活状态（选填）' : 'Lifestyle (optional)'}
                </label>
                <textarea
                  value={lifestyle}
                  onChange={(e) => setLifestyle(e.target.value)}
                  rows={3}
                  placeholder={zh
                    ? '描述你的日常作息，帮助 AI 给出更个性化的建议'
                    : 'Describe your daily routine for personalized AI advice'}
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 5: Overview */}
          {step === 5 && (() => {
            const tdee = calcTDEE();
            return (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 mb-1">
                    {zh ? '你的个性化方案' : 'Your Personalized Plan'}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    {zh ? '根据你的信息，我们计算出了以下目标' : 'Based on your info, here are your targets'}
                  </p>
                </div>

                {/* TDEE Card */}
                {tdee && (
                  <div className="bg-white rounded-xl border border-zinc-200 p-6 text-center">
                    <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">
                      {zh ? '每日能量需求 (TDEE)' : 'Daily Energy Needs (TDEE)'}
                    </p>
                    <p className="text-4xl font-bold text-emerald-600">{tdee}</p>
                    <p className="text-sm text-zinc-400 mt-1">kcal / {zh ? '天' : 'day'}</p>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100">
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-zinc-500">{zh ? '性别' : 'Gender'}</span>
                    <span className="text-sm text-zinc-900">
                      {gender === 'male' ? (zh ? '男' : 'Male') : (zh ? '女' : 'Female')}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-zinc-500">{zh ? '年龄' : 'Age'}</span>
                    <span className="text-sm text-zinc-900">{age}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-zinc-500">{zh ? '身高' : 'Height'}</span>
                    <span className="text-sm text-zinc-900">{heightCm} cm</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-zinc-500">{zh ? '体重' : 'Weight'}</span>
                    <span className="text-sm text-zinc-900">{weightKg} kg</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-zinc-500">{zh ? '目标' : 'Goal'}</span>
                    <span className="text-sm text-zinc-900">
                      {goalOptions.find(o => o.value === goal)?.[zh ? 'labelZh' : 'labelEn'] || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-zinc-500">{zh ? '活动量' : 'Activity'}</span>
                    <span className="text-sm text-zinc-900">
                      {activityOptions.find(o => o.value === activityLevel)?.[zh ? 'labelZh' : 'labelEn'] || '-'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-6">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center justify-center gap-1 px-6 py-3 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {zh ? '上一步' : 'Back'}
            </button>
          )}

          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 flex items-center justify-center gap-1 py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {step === 0 ? (zh ? '开始' : "Let's Go") : (zh ? '下一步' : 'Next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-60 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {zh ? '完成设置' : 'Finish Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
