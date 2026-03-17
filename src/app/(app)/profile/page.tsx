'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';

interface ProfileStats {
  totalEntries: number;
  avgRating: number;
  topCuisine: string;
  worthItPercent: number;
}

export default function ProfilePage() {
  const { user, profile, signOut, loading: authLoading, refetchProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({
    totalEntries: 0,
    avgRating: 0,
    topCuisine: '—',
    worthItPercent: 0,
  });
  const router = useRouter();
  const supabase = createClient();

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!user) return;

    const { data: entries } = await supabase
      .from('entries')
      .select('foodie_rating, food_type, worth_it')
      .eq('user_id', user.id);

    if (!entries || entries.length === 0) return;

    const totalEntries = entries.length;
    const avgRating = entries.reduce((sum, e) => sum + Number(e.foodie_rating), 0) / totalEntries;
    const worthItCount = entries.filter((e) => e.worth_it).length;

    // Find most common food type
    const typeCounts: Record<string, number> = {};
    entries.forEach((e) => {
      typeCounts[e.food_type] = (typeCounts[e.food_type] || 0) + 1;
    });
    const topCuisine = Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '—';

    setStats({
      totalEntries,
      avgRating: Math.round(avgRating * 10) / 10,
      topCuisine: topCuisine.replace(/_/g, ' '),
      worthItPercent: Math.round((worthItCount / totalEntries) * 100),
    });
  }, [user, supabase]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio);
    }
    fetchStats();
  }, [profile, fetchStats]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim(),
        bio: bio.trim(),
      })
      .eq('id', user.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile updated!');
      setEditing(false);
      refetchProfile();
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <h1 className="font-serif text-2xl font-bold text-forest mb-6">Profile</h1>

      {/* Profile card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar placeholder */}
          <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center text-2xl">
            {(profile?.display_name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field text-lg font-bold"
                placeholder="Display name"
              />
            ) : (
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {profile?.display_name || 'Anonymous Foodie'}
              </h2>
            )}
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-3">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your food tastes..."
              className="input-field min-h-[80px] resize-none"
              maxLength={200}
            />
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setDisplayName(profile?.display_name || '');
                  setBio(profile?.bio || '');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {profile?.bio && (
              <p className="text-sm text-gray-600 mb-3">{profile.bio}</p>
            )}
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-accent font-medium hover:underline"
            >
              Edit profile
            </button>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-forest">{stats.totalEntries}</p>
          <p className="text-xs text-gray-500">Entries</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gold">{stats.avgRating}★</p>
          <p className="text-xs text-gray-500">Avg Rating</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-forest capitalize">{stats.topCuisine}</p>
          <p className="text-xs text-gray-500">Top Cuisine</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-accent">{stats.worthItPercent}%</p>
          <p className="text-xs text-gray-500">Worth It</p>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full py-3 text-center text-sm text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
