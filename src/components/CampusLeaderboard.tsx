import React, { useState } from 'react';

interface LeaderboardEntry {
  rank: number | string;
  badge?: string;
  name: string;
  college: string;
  registrations: number;
  avatarColor: string;
  isUser?: boolean;
}

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  {
    rank: 1,
    badge: '👑',
    name: 'Aditi Sharma',
    college: 'BITS Pilani',
    registrations: 48,
    avatarColor: 'from-amber-400 to-orange-500',
  },
  {
    rank: 2,
    badge: '🥈',
    name: 'Rohan Mehta',
    college: 'VIT',
    registrations: 42,
    avatarColor: 'from-slate-300 to-slate-400',
  },
  {
    rank: 3,
    badge: '🥉',
    name: 'Priya N',
    college: 'SRM',
    registrations: 38,
    avatarColor: 'from-amber-600 to-amber-700',
  },
  {
    rank: 4,
    name: 'Arjun K',
    college: 'NIT Trichy',
    registrations: 32,
    avatarColor: 'from-blue-500 to-cerulean',
  },
  {
    rank: 5,
    name: 'Sana Khan',
    college: 'RVCE',
    registrations: 28,
    avatarColor: 'from-rose to-pink-600',
  },
];

const CampusLeaderboard: React.FC<{ currentUserName?: string }> = ({
  currentUserName = 'Sai Kiran',
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  return (
    <div className="card p-6 sm:p-8 max-w-xl mx-auto border-border/80 bg-surface/90 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Campus Leaderboard 🎓
          </h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-rose/15 text-rose border border-rose/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose"></span>
            Live
          </span>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-text-secondary mb-6">
        Top students who are getting their friends to join 🚀
      </p>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-surface-elevated rounded-full w-fit mb-6 border border-border">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-rose text-white'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          All Campuses
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('my')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'my'
              ? 'bg-rose text-white'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          My Campus
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[36px_1fr_90px] text-xs font-mono text-text-tertiary px-3 pb-3 border-b border-border">
        <span>#</span>
        <span>Student</span>
        <span className="text-right">Registrations</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/60">
        {LEADERBOARD_DATA.map((entry) => (
          <div
            key={entry.name}
            className="grid grid-cols-[36px_1fr_90px] items-center px-3 py-3.5 hover:bg-surface-elevated/50 transition-colors"
          >
            {/* Rank / Badge */}
            <div className="text-sm font-semibold text-text-secondary flex items-center">
              {entry.badge ? (
                <span className="text-base">{entry.badge}</span>
              ) : (
                <span className="font-mono text-text-tertiary">{entry.rank}</span>
              )}
            </div>

            {/* Student info */}
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${entry.avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0`}
              >
                {entry.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {entry.name}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {entry.college}
                </p>
              </div>
            </div>

            {/* Count */}
            <div className="text-right">
              <span className="text-sm font-bold font-mono text-white tabular-nums">
                {entry.registrations}
              </span>
            </div>
          </div>
        ))}

        {/* Pinned User Row */}
        <div className="grid grid-cols-[36px_1fr_90px] items-center px-3 py-3.5 mt-2 bg-cerulean/10 border border-cerulean/30 rounded-xl">
          <div className="text-xs font-mono text-cerulean">--</div>
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-cerulean flex items-center justify-center text-xs font-bold text-white shrink-0">
              {currentUserName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                You ({currentUserName})
              </p>
              <p className="text-xs text-cerulean truncate">Your Campus</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold font-mono text-white tabular-nums">
              0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusLeaderboard;
