import React, { useState, useMemo } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { getDemoRegistrations } from '../lib/referral';

export interface LeaderboardEntry {
  rank: number;
  badge?: string;
  name: string;
  college: string;
  registrations: number;
  avatarGradient: string;
  badgeTitle?: string;
}

const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    badge: '👑',
    name: 'Aditi S.',
    college: 'BITS Pilani',
    registrations: 48,
    avatarGradient: 'from-amber-400 to-orange-500',
    badgeTitle: 'Gold Ambassador',
  },
  {
    rank: 2,
    badge: '🥈',
    name: 'Rohan M.',
    college: 'VIT Vellore',
    registrations: 42,
    avatarGradient: 'from-slate-200 to-slate-400',
    badgeTitle: 'Silver Ambassador',
  },
  {
    rank: 3,
    badge: '🥉',
    name: 'Priya N.',
    college: 'SRM University',
    registrations: 38,
    avatarGradient: 'from-amber-600 to-amber-800',
    badgeTitle: 'Bronze Ambassador',
  },
  {
    rank: 4,
    name: 'Arjun K.',
    college: 'NIT Trichy',
    registrations: 32,
    avatarGradient: 'from-blue-500 to-cerulean',
  },
  {
    rank: 5,
    name: 'Sana K.',
    college: 'RVCE Bangalore',
    registrations: 28,
    avatarGradient: 'from-rose to-pink-600',
  },
  {
    rank: 6,
    name: 'Karthik R.',
    college: 'CBIT Hyderabad',
    registrations: 24,
    avatarGradient: 'from-emerald-400 to-teal-600',
  },
  {
    rank: 7,
    name: 'Neha P.',
    college: 'IIIT Hyderabad',
    registrations: 21,
    avatarGradient: 'from-purple-500 to-indigo-600',
  },
  {
    rank: 8,
    name: 'Vikram S.',
    college: 'Osmania University',
    registrations: 19,
    avatarGradient: 'from-cyan-400 to-blue-600',
  },
];

interface CampusLeaderboardProps {
  currentUserName?: string;
  compact?: boolean;
}

const CampusLeaderboard: React.FC<CampusLeaderboardProps> = ({
  currentUserName,
  compact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'top5'>('all');
  const isLive = isSupabaseConfigured();

  const registeredStudents = getDemoRegistrations();
  const currentStudent = registeredStudents[0];
  const displayName = currentUserName || currentStudent?.name || 'You';
  const displayCollege = currentStudent?.college || 'Your College';

  // Privacy-safe masked name for current student
  const safeCurrentName = useMemo(() => {
    const parts = displayName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'Student';
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
  }, [displayName]);

  // Top 3 Podium
  const topThree = SAMPLE_LEADERBOARD.slice(0, 3);

  // Filtered entries for table
  const filteredList = useMemo(() => {
    let list = SAMPLE_LEADERBOARD;
    if (filterTab === 'top5') {
      list = list.slice(0, 5);
    }
    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase();
    return list.filter(
      (entry) =>
        entry.name.toLowerCase().includes(query) ||
        entry.college.toLowerCase().includes(query)
    );
  }, [filterTab, searchQuery]);

  return (
    <div className="card p-6 sm:p-8 border-border/80 bg-surface/95 shadow-2xl space-y-8">
      {/* ─── Leaderboard Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Campus Leaderboard</span>
              <span className="text-lg">🎓</span>
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold border ${
                isLive
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{isLive ? 'LIVE SUPABASE SYNC' : 'DEMO BENCHMARK DATA'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Verified student peer referrals across top engineering colleges.
          </p>
        </div>

        <div className="text-2xs font-mono text-text-tertiary">
          Privacy Mode: Protected Names (e.g. Aditi S.)
        </div>
      </div>

      {/* ─── Top 3 Podium Cards ─────────────────────────────────────────── */}
      {!compact && (
        <div>
          <p className="text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-3.5">
            Top Student Ambassadors
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1st Place (Gold) */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-b from-amber-500/15 via-surface to-surface border border-amber-400/40 shadow-[0_4px_20px_rgba(245,158,11,0.12)] flex flex-col justify-between order-1 md:order-2 md:-translate-y-2">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">👑</span>
                <span className="text-2xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  RANK 1 • GOLD
                </span>
              </div>
              <div className="flex items-center gap-3 my-2">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${topThree[0].avatarGradient} flex items-center justify-center text-sm font-bold text-white shadow-md`}
                >
                  {topThree[0].name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white truncate">
                    {topThree[0].name}
                  </h3>
                  <p className="text-xs text-text-secondary truncate">
                    {topThree[0].college}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-400/20 flex items-center justify-between">
                <span className="text-2xs text-text-tertiary">Verified Referrals</span>
                <span className="text-lg font-mono font-extrabold text-amber-300">
                  {topThree[0].registrations}
                </span>
              </div>
            </div>

            {/* 2nd Place (Silver) */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-b from-slate-300/10 via-surface to-surface border border-slate-300/30 shadow-md flex flex-col justify-between order-2 md:order-1">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">🥈</span>
                <span className="text-2xs font-mono font-bold text-slate-300 bg-slate-300/10 px-2 py-0.5 rounded border border-slate-300/30">
                  RANK 2 • SILVER
                </span>
              </div>
              <div className="flex items-center gap-3 my-2">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${topThree[1].avatarGradient} flex items-center justify-center text-sm font-bold text-white shadow-md`}
                >
                  {topThree[1].name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {topThree[1].name}
                  </h3>
                  <p className="text-xs text-text-secondary truncate">
                    {topThree[1].college}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-300/20 flex items-center justify-between">
                <span className="text-2xs text-text-tertiary">Verified Referrals</span>
                <span className="text-base font-mono font-extrabold text-slate-200">
                  {topThree[1].registrations}
                </span>
              </div>
            </div>

            {/* 3rd Place (Bronze) */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-b from-amber-700/15 via-surface to-surface border border-amber-700/30 shadow-md flex flex-col justify-between order-3">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">🥉</span>
                <span className="text-2xs font-mono font-bold text-amber-600 bg-amber-700/10 px-2 py-0.5 rounded border border-amber-700/30">
                  RANK 3 • BRONZE
                </span>
              </div>
              <div className="flex items-center gap-3 my-2">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${topThree[2].avatarGradient} flex items-center justify-center text-sm font-bold text-white shadow-md`}
                >
                  {topThree[2].name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {topThree[2].name}
                  </h3>
                  <p className="text-xs text-text-secondary truncate">
                    {topThree[2].college}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-700/20 flex items-center justify-between">
                <span className="text-2xs text-text-tertiary">Verified Referrals</span>
                <span className="text-base font-mono font-extrabold text-amber-500">
                  {topThree[2].registrations}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Search and Tabs Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-elevated rounded-full w-fit border border-border">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterTab === 'all'
                ? 'bg-rose text-white shadow'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            All Campuses
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('top5')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterTab === 'top5'
                ? 'bg-rose text-white shadow'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Top 5
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by student or college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-surface-elevated border border-border focus:border-cerulean text-white text-xs px-3.5 py-1.5 rounded-full placeholder-text-tertiary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ─── Participant Table ─────────────────────────────────────────── */}
      <div className="border border-border/70 rounded-xl overflow-hidden bg-surface-elevated/30">
        <div className="grid grid-cols-[48px_1fr_110px] text-xs font-mono text-text-tertiary px-4 py-2.5 border-b border-border bg-surface-elevated/80">
          <span>Rank</span>
          <span>Student / College</span>
          <span className="text-right">Registrations</span>
        </div>

        <div className="divide-y divide-border/50">
          {filteredList.length === 0 ? (
            /* Empty State */
            <div className="p-8 text-center">
              <span className="text-3xl mb-2 block">🔍</span>
              <p className="text-sm font-semibold text-white">No ambassadors found</p>
              <p className="text-xs text-text-secondary mt-1">
                No students match &ldquo;{searchQuery}&rdquo;. Be the first from your college to register!
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="btn-ghost !py-1.5 !px-3 text-xs mt-3"
              >
                Clear search
              </button>
            </div>
          ) : (
            filteredList.map((entry) => (
              <div
                key={`${entry.name}-${entry.college}`}
                className="grid grid-cols-[48px_1fr_110px] items-center px-4 py-3 hover:bg-surface-elevated/60 transition-colors"
              >
                {/* Rank */}
                <div className="flex items-center text-xs font-mono font-bold text-text-secondary">
                  {entry.badge ? (
                    <span className="text-base">{entry.badge}</span>
                  ) : (
                    <span>#{entry.rank}</span>
                  )}
                </div>

                {/* Student info */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${entry.avatarGradient} flex items-center justify-center text-xs font-bold text-white shrink-0`}
                  >
                    {entry.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">
                      {entry.name}
                    </p>
                    <p className="text-2xs text-text-secondary truncate">
                      {entry.college}
                    </p>
                  </div>
                </div>

                {/* Verified count */}
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-xs font-bold text-white bg-surface-elevated border border-border tabular-nums">
                    {entry.registrations} verified
                  </span>
                </div>
              </div>
            ))
          )}

          {/* ─── Pinned User Row ─────────────────────────────────────────── */}
          <div className="grid grid-cols-[48px_1fr_110px] items-center px-4 py-3 bg-cerulean/10 border-t-2 border-cerulean/40">
            <div className="text-xs font-mono font-bold text-cerulean">✦</div>
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-7 h-7 rounded-full bg-cerulean flex items-center justify-center text-xs font-bold text-white shrink-0">
                {safeCurrentName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  You ({safeCurrentName})
                </p>
                <p className="text-2xs text-cerulean truncate">{displayCollege}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono font-bold text-cerulean bg-cerulean/20 border border-cerulean/40">
                0 verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Campaign Transparency Notice ──────────────────────────────── */}
      <div className="p-4 rounded-xl bg-surface-elevated/40 border border-border text-2xs text-text-tertiary leading-relaxed flex items-start gap-2.5">
        <span className="text-sm shrink-0">ℹ️</span>
        <div>
          <strong className="text-text-secondary">Campaign Transparency Notice:</strong>{' '}
          Leaderboard entries currently reflect calibrated benchmark demonstration data for campaign simulation.
          Verified student counts synchronize automatically with central Supabase database records as classmates register.
          Link clicks alone are never counted as registrations.
        </div>
      </div>
    </div>
  );
};

export default CampusLeaderboard;
