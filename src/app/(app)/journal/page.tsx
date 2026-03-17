'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import EntryCard from '@/components/entry/EntryCard';
import type { EntryWithDetails } from '@/types/database';

const supabase = createClient();

export default function JournalPage() {
  const [entries, setEntries] = useState<EntryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'worth_it' | 'top_rated'>('all');
  const { user } = useAuth();

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from('entries')
      .select(`
        *,
        restaurant:restaurants(*),
        photos:entry_photos(*)
      `)
      .eq('user_id', user.id)
      .order('visit_date', { ascending: false });

    if (filter === 'worth_it') {
      query = query.eq('worth_it', true);
    } else if (filter === 'top_rated') {
      query = query.gte('foodie_rating', 4);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching entries:', error);
      setEntries([]);
    } else {
      const entriesWithProfile = (data || []).map((entry) => ({
        ...entry,
        photos: entry.photos || [],
        restaurant: entry.restaurant || null,
        profile: {
          id: user.id,
          display_name: '',
          bio: '',
          avatar_url: null,
          created_at: '',
          updated_at: '',
        },
      })) as EntryWithDetails[];
      setEntries(entriesWithProfile);
    }
    setLoading(false);
  }, [user, filter]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const FILTERS = [
    { key: 'all' as const, label: 'All' },
    { key: 'worth_it' as const, label: 'Worth it' },
    { key: 'top_rated' as const, label: 'Top rated' },
  ];

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Journal</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your food diary</p>
        </div>
        <span className="text-sm text-gray-400 tabular-nums">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${filter === f.key
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading entries...</p>
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            No entries yet
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Start logging your meals to build your food journal
          </p>
          <a href="/write" className="btn-primary inline-flex">
            Write your first entry
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
