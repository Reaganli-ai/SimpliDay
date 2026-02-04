'use client';

import { useState } from 'react';
import { Dumbbell, Utensils, Heart, Zap, Flame, Clock, TrendingUp, FileText, Trash2, Edit3, X, Check } from 'lucide-react';
import { Entry, EntryType } from '@/types';
import { useI18n } from '@/lib/i18n';
import { deleteEntry, updateEntry } from '@/lib/supabase';

interface EntryListProps {
  entries: Entry[];
  editable?: boolean;
  onUpdate?: () => void;
}

const typeIcons: Record<EntryType, typeof Dumbbell> = {
  fitness: Dumbbell,
  diet: Utensils,
  mood: Heart,
  energy: Zap,
  other: FileText,
};

const typeColors: Record<EntryType, string> = {
  fitness: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  diet: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  mood: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  energy: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  other: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

// 健身数据展示
function FitnessData({ data, language }: { data: Record<string, unknown>; language: string }) {
  return (
    <div className="flex flex-wrap gap-3 mt-3">
      {data.exercise ? (
        <div className="flex items-center gap-1.5 text-sm">
          <Dumbbell className="w-4 h-4 text-blue-500" />
          <span className="text-zinc-700 dark:text-zinc-300">{String(data.exercise)}</span>
        </div>
      ) : null}
      {data.duration ? (
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-600 dark:text-zinc-400">{String(data.duration)} {language === 'zh' ? '分钟' : 'min'}</span>
        </div>
      ) : null}
      {data.calories_burned ? (
        <div className="flex items-center gap-1.5 text-sm">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-orange-600 dark:text-orange-400">-{String(data.calories_burned)} kcal</span>
        </div>
      ) : null}
      {data.intensity ? (
        <div className="flex items-center gap-1.5 text-sm">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span className="text-zinc-600 dark:text-zinc-400">
            {language === 'zh' ? `${String(data.intensity)}强度` : `${String(data.intensity)} intensity`}
          </span>
        </div>
      ) : null}
    </div>
  );
}

// 饮食数据展示
function DietData({ data, language }: { data: Record<string, unknown>; language: string }) {
  return (
    <div className="mt-3 space-y-2">
      {data.food ? (
        <div className="flex items-center gap-1.5 text-sm">
          <Utensils className="w-4 h-4 text-orange-500" />
          <span className="text-zinc-700 dark:text-zinc-300">{String(data.food)}</span>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {data.calories ? (
          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
            🔥 {String(data.calories)} kcal
          </span>
        ) : null}
        {data.protein ? (
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
            {language === 'zh' ? '蛋白质' : 'P'} {String(data.protein)}g
          </span>
        ) : null}
        {data.carbs ? (
          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
            {language === 'zh' ? '碳水' : 'C'} {String(data.carbs)}g
          </span>
        ) : null}
        {data.fat ? (
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
            {language === 'zh' ? '脂肪' : 'F'} {String(data.fat)}g
          </span>
        ) : null}
      </div>
    </div>
  );
}

// 心情数据展示
function MoodData({ data, language }: { data: Record<string, unknown>; language: string }) {
  const score = Number(data.mood_score) || 0;
  const keywords = Array.isArray(data.mood_keywords) ? data.mood_keywords : [];

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">{language === 'zh' ? '心情指数' : 'Mood'}</span>
        <div className="flex items-center gap-1">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-4 rounded-sm ${
                i < score ? 'bg-pink-500' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-pink-600 dark:text-pink-400">{score}/10</span>
      </div>
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((kw, i) => (
            <span key={i} className="px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-xs">
              {String(kw)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// 能量数据展示
function EnergyData({ data, language }: { data: Record<string, unknown>; language: string }) {
  const level = Number(data.energy_level) || 0;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">{language === 'zh' ? '能量值' : 'Energy'}</span>
        <div className="flex items-center gap-1">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-4 rounded-sm ${
                i < level
                  ? level >= 7 ? 'bg-emerald-500' : level >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                  : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            />
          ))}
        </div>
        <span className={`text-sm font-medium ${
          level >= 7 ? 'text-emerald-600 dark:text-emerald-400' :
          level >= 4 ? 'text-yellow-600 dark:text-yellow-400' :
          'text-red-600 dark:text-red-400'
        }`}>{level}/10</span>
      </div>
      {data.reason ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {language === 'zh' ? '原因：' : 'Reason: '}{String(data.reason)}
        </p>
      ) : null}
    </div>
  );
}

export function EntryList({ entries, editable = false, onUpdate }: EntryListProps) {
  const { t, language } = useI18n();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'zh' ? '确定要删除这条记录吗？' : 'Delete this entry?')) return;

    setDeleting(id);
    try {
      await deleteEntry(id);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
  };

  const handleSaveEdit = async (entry: Entry) => {
    try {
      await updateEntry(entry.id, editContent, entry.parsed_data);
      setEditingId(null);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <p>{language === 'zh' ? '还没有记录，开始记录吧！' : 'No entries yet. Start tracking!'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const Icon = typeIcons[entry.type];
        const colorClass = typeColors[entry.type];
        const date = new Date(entry.created_at);
        const isToday = new Date().toDateString() === date.toDateString();
        const data = entry.parsed_data || {};
        const isEditing = editingId === entry.id;

        return (
          <div
            key={entry.id}
            className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {t.entry[entry.type]}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {isToday
                        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : date.toLocaleDateString()}
                    </span>
                  </div>

                  {/* 编辑/删除按钮 */}
                  {editable && !isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleting === entry.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 text-sm bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(entry)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {language === 'zh' ? '保存' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm rounded-lg"
                      >
                        <X className="w-3.5 h-3.5" />
                        {language === 'zh' ? '取消' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-zinc-900 dark:text-zinc-100">{entry.content}</p>
                    {entry.type === 'fitness' && <FitnessData data={data} language={language} />}
                    {entry.type === 'diet' && <DietData data={data} language={language} />}
                    {entry.type === 'mood' && <MoodData data={data} language={language} />}
                    {entry.type === 'energy' && <EnergyData data={data} language={language} />}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
