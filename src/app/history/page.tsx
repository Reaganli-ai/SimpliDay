'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { getEntries } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { AuthForm } from '@/components/AuthForm';
import { EntryList } from '@/components/EntryList';
import { Entry, EntryType } from '@/types';
import { Loader2, Filter } from 'lucide-react';

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EntryType | 'all'>('all');

  const fetchEntries = async () => {
    if (!user) return;
    try {
      const data = await getEntries(user.id, 100);
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter(e => e.type === filter);

  const filters: Array<{ value: EntryType | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'fitness', label: t.entry.fitness },
    { value: 'diet', label: t.entry.diet },
    { value: 'mood', label: t.entry.mood },
    { value: 'energy', label: t.entry.energy },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {t.nav.history}
          </h1>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <div className="flex gap-1">
              {filters.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filter === value
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          </div>
        ) : (
          <EntryList entries={filteredEntries} editable onUpdate={fetchEntries} />
        )}
      </main>
    </div>
  );
}
