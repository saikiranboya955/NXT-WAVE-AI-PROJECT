import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DashboardMetrics, Registration, AcquisitionSource } from '../types';
import {
  fetchDashboardMetrics,
  fetchRegistrations,
  logCampaignExpense,
  type CampaignExpense,
} from '../lib/services';
import { exportToCSV } from '../lib/referral';
import {
  isSupabaseConfigured,
  getCurrentAdmin,
  signInAdmin,
  signOutAdmin,
} from '../lib/supabase';
import CampusLeaderboard from '../components/CampusLeaderboard';

type NavSection =
  | 'overview'
  | 'registrations'
  | 'referrals'
  | 'campus'
  | 'budget'
  | 'settings';

const DashboardPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [metrics, setMetrics] = useState<(DashboardMetrics & { isLive: boolean }) | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // Authentication State
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Registration Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | AcquisitionSource>('all');

  // Budget & Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseItem, setExpenseItem] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<CampaignExpense['category']>('whatsapp_marketing');
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [expenseSuccessMsg, setExpenseSuccessMsg] = useState<string | null>(null);

  const isLive = isSupabaseConfigured();

  // Load metrics, registrations, and check auth session
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        // Check if admin is signed in
        if (isLive) {
          const user = await getCurrentAdmin();
          if (user?.email) {
            setAdminEmail(user.email);
            setShowAuthGate(false);
          } else {
            // Require sign in for live database
            setShowAuthGate(true);
          }
        }

        const [m, r] = await Promise.all([
          fetchDashboardMetrics(),
          fetchRegistrations(),
        ]);
        setMetrics(m);
        setRegistrations(r.registrations);
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [isLive]);

  // Handle Admin Sign In
  async function handleAdminSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setAuthError('Please enter organizer email.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setAuthNotice(null);

    const res = await signInAdmin(loginEmail.trim(), loginPassword || undefined);
    setAuthLoading(false);

    if (res.success) {
      if (res.user?.email) {
        setAdminEmail(res.user.email);
        setShowAuthGate(false);
        // Reload real data
        const [m, r] = await Promise.all([
          fetchDashboardMetrics(),
          fetchRegistrations(),
        ]);
        setMetrics(m);
        setRegistrations(r.registrations);
      } else if (res.error) {
        setAuthNotice(res.error);
      }
    } else {
      setAuthError(res.error || 'Authentication failed. Check credentials.');
    }
  }

  // Handle Admin Sign Out
  async function handleAdminSignOut() {
    await signOutAdmin();
    setAdminEmail(null);
    if (isLive) {
      setShowAuthGate(true);
    }
  }

  // Handle Add Expense
  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(expenseAmount);
    if (!expenseItem.trim() || isNaN(amount) || amount <= 0) {
      return;
    }
    setExpenseSubmitting(true);
    const res = await logCampaignExpense(expenseItem.trim(), amount, expenseCategory);
    setExpenseSubmitting(false);

    if (res.success) {
      setExpenseSuccessMsg(`Recorded expense: ₹${amount.toLocaleString('en-IN')}`);
      setExpenseItem('');
      setExpenseAmount('');
      // Update local metrics state
      if (metrics) {
        setMetrics({
          ...metrics,
          budgetSpent: metrics.budgetSpent + amount,
        });
      }
      setTimeout(() => {
        setShowExpenseModal(false);
        setExpenseSuccessMsg(null);
      }, 1200);
    }
  }

  // Export filtered registrations to CSV
  function handleExport() {
    exportToCSV(filteredRegistrations);
  }

  // Filter registrations
  const filteredRegistrations = registrations.filter((r) => {
    const matchesSource = sourceFilter === 'all' || r.source === sourceFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.college.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.referralCode && r.referralCode.toLowerCase().includes(q));
    return matchesSource && matchesSearch;
  });

  const totalCount = metrics?.totalRegistrations ?? registrations.length;
  const targetCount = metrics?.target ?? 500;
  const progressPct = Math.min(100, Math.round((totalCount / targetCount) * 100));
  const remainingCount = Math.max(0, targetCount - totalCount);

  const budgetTotal = metrics?.budgetTotal ?? 2000;
  const budgetSpent = metrics?.budgetSpent ?? 840;
  const budgetRemaining = Math.max(0, budgetTotal - budgetSpent);
  const budgetPct = Math.min(100, Math.round((budgetSpent / budgetTotal) * 100));

  const referralRegistrationsCount = registrations.filter((r) => Boolean(r.referralCode)).length;
  const referralSharePct = totalCount > 0 ? Math.round((referralRegistrationsCount / totalCount) * 100) : 0;

  return (
    <main className="pt-16 min-h-screen bg-black text-white" id="main-content">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[240px_1fr] gap-6 items-start">
          {/* ─── Left Sidebar Navigation ──────────────────────────────── */}
          <aside className="card p-4 bg-surface border-border/80 lg:sticky lg:top-20 space-y-6">
            <div className="px-3">
              <Link to="/" className="inline-block" aria-label="NxtWave Home">
                <img
                  src="/nxtwave-logo-white.png"
                  alt="NxtWave"
                  className="h-9 sm:h-10 w-auto object-contain filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                  width="80"
                  height="41"
                />
              </Link>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cerulean"></span>
                <p className="text-2xs font-mono text-text-tertiary">
                  ORGANIZER CONSOLE
                </p>
              </div>
            </div>

            <nav className="space-y-1" aria-label="Dashboard views">
              <button
                type="button"
                onClick={() => setActiveSection('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'overview'
                    ? 'bg-cerulean text-white shadow-[0_0_12px_rgba(0,123,167,0.35)]'
                    : 'text-text-secondary hover:text-white hover:bg-surface-elevated'
                }`}
              >
                <span>📊</span>
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('registrations')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'registrations'
                    ? 'bg-cerulean text-white shadow-[0_0_12px_rgba(0,123,167,0.35)]'
                    : 'text-text-secondary hover:text-white hover:bg-surface-elevated'
                }`}
              >
                <span>📝</span>
                <span>Registrations</span>
                <span className="ml-auto text-[10px] font-mono opacity-70">
                  {registrations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('referrals')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'referrals'
                    ? 'bg-cerulean text-white shadow-[0_0_12px_rgba(0,123,167,0.35)]'
                    : 'text-text-secondary hover:text-white hover:bg-surface-elevated'
                }`}
              >
                <span>🔗</span>
                <span>Referral Growth</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('campus')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'campus'
                    ? 'bg-cerulean text-white shadow-[0_0_12px_rgba(0,123,167,0.35)]'
                    : 'text-text-secondary hover:text-white hover:bg-surface-elevated'
                }`}
              >
                <span>🎓</span>
                <span>Campus Analytics</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('budget')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'budget'
                    ? 'bg-cerulean text-white shadow-[0_0_12px_rgba(0,123,167,0.35)]'
                    : 'text-text-secondary hover:text-white hover:bg-surface-elevated'
                }`}
              >
                <span>💰</span>
                <span>Budget & Expenses</span>
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-white hover:bg-surface-elevated transition-all"
              >
                <span>📥</span>
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'settings'
                    ? 'bg-cerulean text-white shadow-[0_0_12px_rgba(0,123,167,0.35)]'
                    : 'text-text-secondary hover:text-white hover:bg-surface-elevated'
                }`}
              >
                <span>⚙️</span>
                <span>Backend & Config</span>
              </button>
            </nav>

            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                ></span>
                <span className="text-[11px] font-mono font-medium text-white">
                  {isLive ? 'Supabase Live' : 'Demo Mode'}
                </span>
              </div>
              <p className="text-2xs text-text-tertiary leading-relaxed">
                {isLive
                  ? 'Connected to PostgreSQL database with Row-Level Security.'
                  : 'Operating in local test session. Connect Supabase keys in .env for production.'}
              </p>
            </div>
          </aside>

          {/* ─── Main Content ────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Top Bar: Title & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Campaign Growth Dashboard
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-2xs font-mono font-semibold border ${
                      isLive
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {isLive ? 'LIVE SUPABASE' : 'DEMO MODE'}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  7-Day Campaign Sprint • Goal: 500 Final-Year Engineering Students • Max Budget: ₹2,000
                </p>
              </div>

              {/* Controls & Admin Profile */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-mono text-text-secondary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cerulean"></span>
                  <span>7-Day Window</span>
                </div>

                {adminEmail ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs text-white">
                    <div className="w-5 h-5 rounded-full bg-cerulean/30 border border-cerulean flex items-center justify-center text-[10px] font-bold text-cerulean">
                      {adminEmail.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate max-w-[130px] font-mono text-2xs">
                      {adminEmail}
                    </span>
                    <button
                      type="button"
                      onClick={handleAdminSignOut}
                      className="text-2xs text-rose hover:underline ml-1"
                      title="Sign Out"
                    >
                      Exit
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAuthGate(true)}
                    className="btn-ghost text-xs px-3 py-1.5 border border-border text-text-secondary hover:text-white"
                  >
                    Admin Sign In
                  </button>
                )}
              </div>
            </div>

            {/* ─── Admin Sign In Modal / Gate (if gated) ───────────────── */}
            {showAuthGate && (
              <div className="p-5 rounded-2xl bg-surface border border-cerulean/40 relative">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>🔒</span>
                      <span>Organizer Authentication</span>
                    </h2>
                    <p className="text-xs text-text-secondary mt-1">
                      Student registration data is secured by Supabase Row-Level Security. Sign in with an authorized organizer account to manage live database records.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAuthGate(false)}
                    className="text-xs text-text-tertiary hover:text-white px-2 py-1"
                  >
                    Dismiss
                  </button>
                </div>

                <form
                  onSubmit={handleAdminSignIn}
                  className="grid sm:grid-cols-3 gap-3 items-end"
                >
                  <div>
                    <label className="block text-2xs font-mono text-text-secondary mb-1">
                      Organizer Email
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@nxtwave.tech"
                      className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-white placeholder-text-tertiary focus:border-cerulean focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-mono text-text-secondary mb-1">
                      Password (or blank for Magic Link)
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-white placeholder-text-tertiary focus:border-cerulean focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="btn-primary text-xs px-4 py-2 flex-1 flex items-center justify-center gap-1.5"
                    >
                      {authLoading ? 'Verifying...' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAuthGate(false)}
                      className="btn-ghost text-xs px-3 py-2"
                    >
                      Demo View
                    </button>
                  </div>
                </form>

                {authError && (
                  <p className="text-xs text-rose mt-2 font-mono">{authError}</p>
                )}
                {authNotice && (
                  <p className="text-xs text-emerald-400 mt-2 font-mono">{authNotice}</p>
                )}
              </div>
            )}

            {/* ─── Overview Tab View ──────────────────────────────────── */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* 500 Target Progress Banner */}
                <div className="card p-6 bg-surface border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <span className="text-2xs font-mono text-cerulean uppercase tracking-wider">
                        Primary Campaign Objective
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
                        {totalCount} of {targetCount} Registrations ({progressPct}%)
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-text-secondary">Pace to Target</p>
                        <p className="text-sm font-bold font-mono text-emerald-400">
                          {remainingCount === 0 ? 'Target Reached! 🎉' : `${remainingCount} needed`}
                        </p>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs font-mono text-text-secondary">
                        Day 6 of 7
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-surface-elevated overflow-hidden border border-border/80">
                    <div
                      className="h-full bg-gradient-to-r from-cerulean to-rose transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-2xs font-mono text-text-tertiary mt-2">
                    <span>0 students</span>
                    <span>250 milestone</span>
                    <span>500 final-year target</span>
                  </div>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {/* Card 1: Total Registrations */}
                  <div className="card p-5 bg-surface border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-text-secondary mb-1">
                        Total Registrations
                      </p>
                      <p className="text-2xl font-extrabold text-white font-mono tabular-nums">
                        {loading ? '...' : totalCount}
                      </p>
                      <p className="text-2xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                        <span>↑</span> {progressPct}% of goal
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-cerulean/15 border border-cerulean/30 flex items-center justify-center text-cerulean text-lg">
                      👥
                    </div>
                  </div>

                  {/* Card 2: Peer Referrals */}
                  <div className="card p-5 bg-surface border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-text-secondary mb-1">
                        Peer Referrals
                      </p>
                      <p className="text-2xl font-extrabold text-white font-mono tabular-nums">
                        {loading ? '...' : referralRegistrationsCount}
                      </p>
                      <p className="text-2xs font-semibold text-rose mt-1 flex items-center gap-1">
                        <span>★</span> {referralSharePct}% viral share
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose/15 border border-rose/30 flex items-center justify-center text-rose text-lg">
                      🔗
                    </div>
                  </div>

                  {/* Card 3: Campaign Funnel Conversion */}
                  <div className="card p-5 bg-surface border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-text-secondary mb-1">
                        Funnel Conversion
                      </p>
                      <p className="text-2xl font-extrabold text-white font-mono tabular-nums">
                        {metrics?.funnel ? `${Math.round((totalCount / Math.max(1, metrics.funnel.landingPageViews)) * 100)}%` : '12.7%'}
                      </p>
                      <p className="text-2xs font-semibold text-text-tertiary mt-1">
                        Finder to sign-up
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-cerulean/15 border border-cerulean/30 flex items-center justify-center text-cerulean text-lg">
                      🎯
                    </div>
                  </div>

                  {/* Card 4: Budget Spent */}
                  <div className="card p-5 bg-surface border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-text-secondary mb-1">
                        Budget Spent (₹2,000)
                      </p>
                      <p className="text-2xl font-extrabold text-white font-mono tabular-nums">
                        ₹{budgetSpent.toLocaleString('en-IN')}
                      </p>
                      <p className="text-2xs font-semibold text-emerald-400 mt-1">
                        ₹{budgetRemaining.toLocaleString('en-IN')} left ({100 - budgetPct}%)
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                      ₹
                    </div>
                  </div>
                </div>

                {/* ─── Registrations Trend Line Chart ──────────────────── */}
                <div className="card p-6 bg-surface border-border">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-base font-bold text-white tracking-tight">
                        Daily Registration Growth Trend
                      </h2>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Cumulative and daily velocity across the 7-day campaign
                      </p>
                    </div>
                    <span className="badge-demo text-[10px]">
                      {isLive ? 'DATABASE DERIVED' : 'DEMO CURVE'}
                    </span>
                  </div>

                  <div className="h-64 sm:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={
                          metrics?.dailyTrend?.length
                            ? metrics.dailyTrend
                            : [
                                { day: 'Oct 22', count: 24 },
                                { day: 'Oct 23', count: 58 },
                                { day: 'Oct 24', count: 96 },
                                { day: 'Oct 25', count: 142 },
                                { day: 'Oct 26', count: 215 },
                                { day: 'Oct 27', count: 320 },
                                { day: 'Oct 28', count: totalCount },
                              ]
                        }
                      >
                        <defs>
                          <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF2D95" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#FF2D95" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="day"
                          stroke="#555555"
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: '#1E1E1E' }}
                        />
                        <YAxis
                          stroke="#555555"
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: '#1E1E1E' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0A0A0A',
                            borderColor: '#FF2D95',
                            borderRadius: '12px',
                            color: '#FFFFFF',
                            fontSize: '12px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#FF2D95"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#roseGradient)"
                          dot={{ fill: '#FF2D95', stroke: '#FFFFFF', strokeWidth: 1.5, r: 3.5 }}
                          activeDot={{ r: 5, fill: '#FF2D95', stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* ─── Campaign Funnel & Acquisition Breakdown ─────────── */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Funnel Stages */}
                  <div className="card p-6 bg-surface border-border space-y-4">
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Campaign Funnel Stages
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-secondary">1. Landing Page Visits</span>
                          <span className="font-mono font-semibold text-white">
                            {metrics?.funnel?.landingPageViews ?? 480}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-black overflow-hidden">
                          <div className="h-full bg-cerulean w-full"></div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-secondary">2. Project Finder Completed</span>
                          <span className="font-mono font-semibold text-white">
                            {metrics?.funnel?.finderCompletions ?? 62}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-black overflow-hidden">
                          <div
                            className="h-full bg-cerulean"
                            style={{
                              width: `${Math.round(
                                ((metrics?.funnel?.finderCompletions ?? 62) /
                                  Math.max(1, metrics?.funnel?.landingPageViews ?? 480)) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-secondary">3. Confirmed Registrations</span>
                          <span className="font-mono font-semibold text-rose">
                            {totalCount}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-black overflow-hidden">
                          <div
                            className="h-full bg-rose"
                            style={{ width: `${Math.min(100, progressPct)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Channel Attribution Breakdown */}
                  <div className="card p-6 bg-surface border-border space-y-4">
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Acquisition Channels
                    </h3>
                    <div className="space-y-2.5">
                      {[
                        { key: 'referral', label: 'Peer Referrals (?ref=)', icon: '🔗', color: 'bg-rose text-rose' },
                        { key: 'whatsapp', label: 'WhatsApp Groups', icon: '💬', color: 'bg-emerald-400 text-emerald-400' },
                        { key: 'direct', label: 'Direct / Campus Outreach', icon: '🏛️', color: 'bg-cerulean text-cerulean' },
                        { key: 'organic', label: 'Organic Search', icon: '🔍', color: 'bg-white text-white' },
                      ].map((ch) => {
                        const count =
                          metrics?.bySource?.[ch.key as AcquisitionSource] ??
                          registrations.filter((r) => r.source === ch.key).length;
                        const share = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                        return (
                          <div
                            key={ch.key}
                            className="p-3 rounded-xl bg-surface-elevated border border-border flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-sm">{ch.icon}</span>
                              <span className="text-xs text-text-secondary">{ch.label}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-white">
                                {count}
                              </span>
                              <span className="text-2xs font-mono text-text-tertiary ml-2">
                                ({share}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Registrations Table View ────────────────────────────── */}
            {activeSection === 'registrations' && (
              <div className="card p-6 bg-surface border-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">All Registrations</h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Showing {filteredRegistrations.length} of {registrations.length} registered students
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExport}
                      className="btn-ghost text-xs px-3.5 py-2 border border-border flex items-center gap-1.5"
                    >
                      <span>📥</span>
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by student name, college, email, or code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-white placeholder-text-tertiary focus:border-cerulean focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-2xs font-mono text-text-tertiary">Source:</label>
                    <select
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value as 'all' | AcquisitionSource)}
                      className="px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-white focus:border-cerulean focus:outline-none"
                    >
                      <option value="all">All Sources</option>
                      <option value="referral">Referral</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="direct">Direct</option>
                      <option value="organic">Organic</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-text-tertiary font-mono">
                        <th className="pb-3 px-3">Name</th>
                        <th className="pb-3 px-3">Email</th>
                        <th className="pb-3 px-3">College</th>
                        <th className="pb-3 px-3">Grad Year</th>
                        <th className="pb-3 px-3">Track</th>
                        <th className="pb-3 px-3">Source</th>
                        <th className="pb-3 px-3">Referral Code</th>
                        <th className="pb-3 px-3">Registered At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-xs text-text-tertiary">
                            No matching student registrations found.
                          </td>
                        </tr>
                      ) : (
                        filteredRegistrations.map((r) => (
                          <tr key={r.id} className="hover:bg-surface-elevated/50 transition-colors">
                            <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                              {r.name}
                            </td>
                            <td className="py-3 px-3 font-mono text-2xs text-text-secondary whitespace-nowrap">
                              {adminEmail ? r.email : r.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                            </td>
                            <td className="py-3 px-3 text-text-secondary whitespace-nowrap">
                              {r.college}
                            </td>
                            <td className="py-3 px-3 font-mono text-text-secondary">
                              {r.graduationYear}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cerulean/15 text-cerulean border border-cerulean/30 whitespace-nowrap">
                                {r.projectId ?? 'resume-feedback'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-elevated text-text-secondary border border-border">
                                {r.source}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-rose whitespace-nowrap">
                              {r.referralCode || '—'}
                            </td>
                            <td className="py-3 px-3 font-mono text-text-tertiary whitespace-nowrap">
                              {new Date(r.registeredAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── Referral Analytics View ────────────────────────────── */}
            {activeSection === 'referrals' && (
              <div className="space-y-6">
                <div className="card p-6 bg-surface border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Peer Referral Leaderboard</h2>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Students inviting classmates using their unique Passport code
                      </p>
                    </div>
                    <span className="badge-demo text-[10px]">
                      {isLive ? 'LIVE COHORT' : 'DEMO ACTIVITY'}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-surface-elevated border border-border">
                      <p className="text-xs text-text-secondary">Total Peer Referrals</p>
                      <p className="text-2xl font-extrabold text-rose font-mono mt-1">
                        {referralRegistrationsCount}
                      </p>
                      <p className="text-2xs text-text-tertiary mt-1">
                        Confirmed registrations from peer links
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-elevated border border-border">
                      <p className="text-xs text-text-secondary">Viral Factor (K-Factor)</p>
                      <p className="text-2xl font-extrabold text-cerulean font-mono mt-1">
                        {(referralRegistrationsCount / Math.max(1, totalCount - referralRegistrationsCount)).toFixed(2)}
                      </p>
                      <p className="text-2xs text-text-tertiary mt-1">
                        Ratio of peer invites to primary registrations
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-mono text-text-tertiary uppercase">Top Referrers</h3>
                    {metrics?.referralActivity?.length ? (
                      metrics.referralActivity.map((refItem, idx) => (
                        <div
                          key={refItem.code}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-surface-elevated border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-text-tertiary">#{idx + 1}</span>
                            <span className="text-sm font-bold font-mono text-cerulean">
                              {refItem.code}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-white">
                            {refItem.count} peer registrations
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-text-tertiary rounded-xl bg-surface-elevated border border-border">
                        No peer referral activity recorded yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Attribution Architecture Explanation */}
                <div className="card p-6 bg-surface border-border space-y-3">
                  <h3 className="text-sm font-bold text-white">Referral Attribution Flow</h3>
                  <div className="grid md:grid-cols-3 gap-3 text-xs text-text-secondary">
                    <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
                      <p className="font-semibold text-white mb-1">1. URL Capture</p>
                      <p>
                        Incoming student arrives via <code className="text-rose text-2xs">?ref=CODE</code>. Code is parsed and saved to session storage.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
                      <p className="font-semibold text-white mb-1">2. Journey Preservation</p>
                      <p>
                        Code persists through Project Finder, recommendation screen, and auto-populates on the registration form.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
                      <p className="font-semibold text-white mb-1">3. Server Verification</p>
                      <p>
                        Stored atomically in Supabase with foreign-key constraint and self-referral prevention.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Campus Analytics View ──────────────────────────────── */}
            {activeSection === 'campus' && (
              <div className="space-y-6">
                <CampusLeaderboard />
              </div>
            )}

            {/* ─── Budget & Expenses View ─────────────────────────────── */}
            {activeSection === 'budget' && (
              <div className="space-y-6">
                <div className="card p-6 bg-surface border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-white">Campaign Budget Tracker</h2>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Strict campaign cap: ₹2,000 across the 7-day acquisition window
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowExpenseModal(true)}
                      className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <span>+</span>
                      <span>Log Campaign Expense</span>
                    </button>
                  </div>

                  {/* Budget Cards */}
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-surface-elevated border border-border">
                      <p className="text-xs text-text-secondary">Maximum Budget</p>
                      <p className="text-2xl font-extrabold text-white font-mono mt-1">
                        ₹{budgetTotal.toLocaleString('en-IN')}
                      </p>
                      <p className="text-2xs text-text-tertiary mt-1">Fixed campaign allowance</p>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-elevated border border-border">
                      <p className="text-xs text-text-secondary">Total Spent</p>
                      <p className="text-2xl font-extrabold text-rose font-mono mt-1">
                        ₹{budgetSpent.toLocaleString('en-IN')}
                      </p>
                      <p className="text-2xs text-text-tertiary mt-1">{budgetPct}% allocated</p>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-elevated border border-border">
                      <p className="text-xs text-text-secondary">Budget Remaining</p>
                      <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                        ₹{budgetRemaining.toLocaleString('en-IN')}
                      </p>
                      <p className="text-2xs text-text-tertiary mt-1">Available balance</p>
                    </div>
                  </div>

                  {/* Budget Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Budget Utilization</span>
                      <span className="font-mono text-white">{budgetPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border">
                      <div
                        className="h-full bg-cerulean transition-all duration-500"
                        style={{ width: `${budgetPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Pre-recorded Expense Breakdown */}
                <div className="card p-6 bg-surface border-border space-y-4">
                  <h3 className="text-sm font-bold text-white">Expense Breakdown</h3>
                  <div className="divide-y divide-border/60 text-xs">
                    <div className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-white">WhatsApp Outreach & Automation</p>
                        <p className="text-2xs text-text-tertiary">Official group broadcast broadcasts</p>
                      </div>
                      <span className="font-mono font-bold text-white">₹450</span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-white">Campus Digital Banners</p>
                        <p className="text-2xs text-text-tertiary">Student ambassador digital kit</p>
                      </div>
                      <span className="font-mono font-bold text-white">₹390</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Settings / Backend & Config View ──────────────────── */}
            {activeSection === 'settings' && (
              <div className="card p-6 bg-surface border-border space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Database & Backend Architecture</h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Supabase PostgreSQL configuration, schema migrations, and Row-Level Security
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <p className="font-semibold text-white">Database Schema</p>
                    </div>
                    <p className="text-text-secondary">
                      Migration file: <code className="text-cerulean font-mono text-2xs">supabase/migrations/20261028000001_create_aipp_schema.sql</code>
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-2xs text-text-tertiary">
                      <li><code>registrations</code>: Student profiles with normalized emails</li>
                      <li><code>referral_codes</code>: Unique 1-to-1 codes per student</li>
                      <li><code>campaign_events</code>: Anonymized funnel telemetry</li>
                      <li><code>campaign_expenses</code>: ₹2,000 budget audit log</li>
                      <li><code>admin_profiles</code>: Secure organizer authorization</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cerulean"></span>
                      <p className="font-semibold text-white">Secure Edge Function</p>
                    </div>
                    <p className="text-text-secondary">
                      Function source: <code className="text-rose font-mono text-2xs">supabase/functions/register/index.ts</code>
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-2xs text-text-tertiary">
                      <li>Server-side regex validation (email, college, grad year)</li>
                      <li>Duplicate registration prevention via database constraints</li>
                      <li>CORS headers and atomic transaction isolation</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated border border-border text-xs space-y-2">
                  <p className="font-semibold text-white">Environment Variables (.env)</p>
                  <p className="text-text-secondary">
                    Configure these in your deployment dashboard or local <code className="text-white">.env</code>:
                  </p>
                  <pre className="p-3 rounded-lg bg-black text-emerald-400 font-mono text-2xs overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
VITE_APP_BASE_URL=https://aipp.nxtwave.tech`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Add Expense Modal ──────────────────────────────────────── */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 bg-surface border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Record Campaign Expense</h3>
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="text-text-tertiary hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-text-secondary">
              Track marketing expenditures against the ₹2,000 assignment budget.
            </p>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-2xs font-mono text-text-secondary mb-1">
                  Expense Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WhatsApp Broadcast API"
                  value={expenseItem}
                  onChange={(e) => setExpenseItem(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-white focus:border-cerulean focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-2xs font-mono text-text-secondary mb-1">
                  Amount in INR (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="2000"
                  placeholder="250"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-white focus:border-cerulean focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-2xs font-mono text-text-secondary mb-1">
                  Category
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as CampaignExpense['category'])}
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-white focus:border-cerulean focus:outline-none"
                >
                  <option value="whatsapp_marketing">WhatsApp Marketing</option>
                  <option value="campus_outreach">Campus Outreach</option>
                  <option value="posters">Digital Posters & Assets</option>
                  <option value="infrastructure">Hosting / Infrastructure</option>
                  <option value="miscellaneous">Miscellaneous</option>
                </select>
              </div>

              {expenseSuccessMsg && (
                <p className="text-xs text-emerald-400 font-mono">{expenseSuccessMsg}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={expenseSubmitting}
                  className="btn-primary text-xs px-4 py-2 flex-1"
                >
                  {expenseSubmitting ? 'Saving...' : 'Save Expense'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="btn-ghost text-xs px-3 py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default DashboardPage;
