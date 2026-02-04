'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Dumbbell, Utensils } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { generateSuggestions } from '@/lib/ai';
import { Entry } from '@/types';
import { AISuggestion } from '@/types';

interface InsightsCardProps {
  entries: Entry[];
}

export function InsightsCard({ entries }: InsightsCardProps) {
  const { t, language } = useI18n();
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (entries.length < 3) {
      alert(language === 'zh' ? '至少需要3条记录才能生成建议' : 'Need at least 3 entries to generate suggestions');
      return;
    }

    setLoading(true);
    try {
      const result = await generateSuggestions(entries.slice(0, 20), language);
      setSuggestion(result);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5" />
        <h3 className="font-semibold">{language === 'zh' ? '健身 & 饮食建议' : 'Fitness & Diet Advice'}</h3>
      </div>

      {suggestion ? (
        <div className="space-y-4">
          {/* 总结 */}
          <p className="text-emerald-50">{suggestion.summary}</p>

          {/* 健身建议 */}
          {suggestion.fitness_suggestions && suggestion.fitness_suggestions.length > 0 && (
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="w-4 h-4" />
                <span className="font-medium">{language === 'zh' ? '健身建议' : 'Fitness'}</span>
              </div>
              <ul className="space-y-1.5">
                {suggestion.fitness_suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-200">•</span>
                    <span className="text-emerald-50">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 饮食建议 */}
          {suggestion.diet_suggestions && suggestion.diet_suggestions.length > 0 && (
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4" />
                <span className="font-medium">{language === 'zh' ? '饮食建议' : 'Diet'}</span>
              </div>
              <ul className="space-y-1.5">
                {suggestion.diet_suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-200">•</span>
                    <span className="text-emerald-50">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 鼓励语 */}
          <div className="pt-3 border-t border-emerald-400/30">
            <p className="text-emerald-100 italic text-sm">&ldquo;{suggestion.encouragement}&rdquo;</p>
          </div>

          {/* 重新生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            {language === 'zh' ? '重新生成' : 'Regenerate'}
          </button>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-emerald-100 mb-4">
            {entries.length < 3
              ? (language === 'zh' ? '记录更多数据后，我会给你专属的健身和饮食建议' : 'Record more data and I\'ll give you personalized fitness and diet advice')
              : (language === 'zh' ? '点击生成你的专属健身和饮食计划' : 'Click to generate your personalized fitness and diet plan')}
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading || entries.length < 3}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 rounded-full font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t.insights.generateReport}
          </button>
        </div>
      )}
    </div>
  );
}
