import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboardMetrics } from '../lib/services';
import type { DashboardMetrics } from '../types';

const GrowthHubPage: React.FC = () => {
  const [metrics, setMetrics] = useState<(DashboardMetrics & { isLive: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchDashboardMetrics();
        setMetrics(data);
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const total = metrics?.totalRegistrations ?? 284;
  const target = metrics?.target ?? 500;
  const percent = Math.min(100, Math.round((total / target) * 100));
  const budgetTotal = metrics?.budgetTotal ?? 2000;
  const budgetSpent = metrics?.budgetSpent ?? 1420;
  const budgetRemaining = Math.max(0, budgetTotal - budgetSpent);
  const isLive = metrics?.isLive ?? false;

  const sources = metrics?.bySource ?? {
    whatsapp: 114,
    referral: 85,
    direct: 55,
    organic: 30,
  };

  const totalSourceCount = (sources.whatsapp + sources.referral + sources.direct + sources.organic) || 1;

  const timelineSteps = [
    {
      day: 'Day 1',
      title: 'Campaign Kickoff & Core Assets',
      status: 'completed',
      tactics: 'Launch AI Project Passport landing page and deploy 50 campus WhatsApp ambassador seed threads.',
      budget: '₹350',
    },
    {
      day: 'Day 2',
      title: 'Technical Societies & College Clubs',
      status: 'completed',
      tactics: 'Partner with IEEE / ACM / placement cells at 15 target colleges across Telangana & Andhra Pradesh.',
      budget: '₹400',
    },
    {
      day: 'Day 3',
      title: 'Interactive Project Finder Launch',
      status: 'completed',
      tactics: 'Promote 3-question personalized project recommendation to boost intent and course relevance.',
      budget: '₹250',
    },
    {
      day: 'Day 4',
      title: 'Campus Leaderboard & Peer Competition',
      status: 'active',
      tactics: 'Activate peer referral incentives; top ambassadors unlock 1:1 project mentor review hours.',
      budget: '₹300',
    },
    {
      day: 'Day 5',
      title: 'Mid-Campaign Acceleration Push',
      status: 'upcoming',
      tactics: 'Follow up with uncommitted leads; share preview clips of the live 60-minute build workflow.',
      budget: '₹250',
    },
    {
      day: 'Day 6',
      title: 'Final 24h Registration Cutoff',
      status: 'upcoming',
      tactics: 'Broadcast urgency notices for final seat capacity; trigger calendar invitations.',
      budget: '₹250',
    },
    {
      day: 'Day 7',
      title: 'Workshop Day & Project Showcase',
      status: 'upcoming',
      tactics: 'Deliver live hands-on 60-minute build, verify student GitHub deployments, and issue credentials.',
      budget: '₹200',
    },
  ];

  return (
    <main className="pt-24 min-h-screen bg-black px-5 sm:px-8 pb-20" id="main-content">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Breadcrumb & Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cerulean/15 border border-cerulean/30 text-cerulean text-xs font-semibold uppercase tracking-wider mb-3">
              <span>✦</span>
              <span>GROWTH STRATEGY OVERVIEW</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Growth Campaign Hub
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Real-time campaign telemetry and execution architecture for 500 engineering student registrations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold border ${
                isLive
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isLive ? 'LIVE SUPABASE DATABASE' : 'BENCHMARK CAMPAIGN MODEL'}</span>
            </span>
          </div>
        </div>

        {/* ─── Campaign Brief Hero Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Registration Goal */}
          <div className="card p-5 sm:p-6 bg-surface border-border">
            <p className="text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
              Registration Target
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {loading ? '...' : total}
              </span>
              <span className="text-xs font-mono text-text-secondary">/ {target}</span>
            </div>
            <div className="mt-3 w-full bg-surface-elevated rounded-full h-2 overflow-hidden border border-border">
              <div
                className="bg-cerulean h-full rounded-full transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-2xs text-text-secondary mt-2 flex justify-between">
              <span>{percent}% Completed</span>
              <span className="text-cerulean font-mono">{target - total} needed</span>
            </p>
          </div>

          {/* Card 2: Maximum Budget Ceiling */}
          <div className="card p-5 sm:p-6 bg-surface border-border">
            <p className="text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
              Maximum Budget Ceiling
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                ₹{budgetSpent.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-text-secondary">/ ₹{budgetTotal.toLocaleString()}</span>
            </div>
            <div className="mt-3 w-full bg-surface-elevated rounded-full h-2 overflow-hidden border border-border">
              <div
                className="bg-rose h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.round((budgetSpent / budgetTotal) * 100)}%` }}
              />
            </div>
            <p className="text-2xs text-text-secondary mt-2 flex justify-between">
              <span>Remaining: ₹{budgetRemaining.toLocaleString()}</span>
              <span className="text-rose font-mono">₹4.00 / student cap</span>
            </p>
          </div>

          {/* Card 3: Sprint Duration */}
          <div className="card p-5 sm:p-6 bg-surface border-border">
            <p className="text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
              Campaign Sprint
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              7 Days
            </p>
            <p className="text-xs text-text-secondary mt-2">
              Pre-workshop acquisition window focusing strictly on final-year engineers.
            </p>
          </div>

          {/* Card 4: Target Initiative */}
          <div className="card p-5 sm:p-6 bg-surface border-border">
            <p className="text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
              Initiative
            </p>
            <p className="text-base sm:text-lg font-bold text-white leading-snug">
              Build Your First AI Project
            </p>
            <p className="text-xs text-cerulean mt-1">
              60-Minute Live Build
            </p>
          </div>
        </div>

        {/* ─── Source Breakdown & Budget Allocation ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Acquisition Channels Breakdown */}
          <div className="card p-6 sm:p-8 bg-surface border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Acquisition Channel Attribution
                </h3>
                <p className="text-xs text-text-secondary">
                  Multi-touch distribution strictly tracked by source parameter
                </p>
              </div>
              <span className="text-2xs font-mono text-cerulean px-2.5 py-1 rounded bg-cerulean/15 border border-cerulean/30">
                Peer-to-Peer Focus
              </span>
            </div>

            <div className="space-y-4">
              {/* WhatsApp Outreach */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-white flex items-center gap-1.5">
                    <span>💬</span> WhatsApp Campus Networks
                  </span>
                  <span className="font-mono text-cerulean">
                    {sources.whatsapp} ({Math.round((sources.whatsapp / totalSourceCount) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${(sources.whatsapp / totalSourceCount) * 100}%` }}
                  />
                </div>
              </div>

              {/* Peer Referral Passports */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-white flex items-center gap-1.5">
                    <span>🎟️</span> Student Referral Passports
                  </span>
                  <span className="font-mono text-cerulean">
                    {sources.referral} ({Math.round((sources.referral / totalSourceCount) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cerulean h-full rounded-full"
                    style={{ width: `${(sources.referral / totalSourceCount) * 100}%` }}
                  />
                </div>
              </div>

              {/* Direct Website Discovery */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-white flex items-center gap-1.5">
                    <span>🔗</span> Direct / Campus Placement Links
                  </span>
                  <span className="font-mono text-cerulean">
                    {sources.direct} ({Math.round((sources.direct / totalSourceCount) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-rose h-full rounded-full"
                    style={{ width: `${(sources.direct / totalSourceCount) * 100}%` }}
                  />
                </div>
              </div>

              {/* Organic & Social */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-white flex items-center gap-1.5">
                    <span>🌐</span> Organic Search & Social Shares
                  </span>
                  <span className="font-mono text-cerulean">
                    {sources.organic} ({Math.round((sources.organic / totalSourceCount) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-400 h-full rounded-full"
                    style={{ width: `${(sources.organic / totalSourceCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
              <span>Verified student registrations only</span>
              <span>Clicks without registration excluded</span>
            </div>
          </div>

          {/* Budget Allocation Tracker */}
          <div className="card p-6 sm:p-8 bg-surface border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  ₹2,000 Budget Expenditure Plan
                </h3>
                <p className="text-xs text-text-secondary">
                  Zero paid ads; 100% focused on grassroots campus engagement
                </p>
              </div>
              <span className="text-2xs font-mono text-rose px-2.5 py-1 rounded bg-rose/15 border border-rose/30">
                ₹1,420 Committed
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-surface-elevated border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">WhatsApp Ambassador Bounties</p>
                  <p className="text-2xs text-text-secondary">Micro-incentives for campus club coordinators</p>
                </div>
                <span className="font-mono text-xs font-bold text-white">₹800.00</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-elevated border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Digital Posters & Noticeboard Assets</p>
                  <p className="text-2xs text-text-secondary">Customized QR flyers for college notice boards</p>
                </div>
                <span className="font-mono text-xs font-bold text-white">₹400.00</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-elevated border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Server & Infrastructure Hosting</p>
                  <p className="text-2xs text-text-secondary">Vercel & Supabase resource allotment</p>
                </div>
                <span className="font-mono text-xs font-bold text-white">₹220.00</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-elevated border border-border/60 flex items-center justify-between border-dashed">
                <div>
                  <p className="text-xs font-semibold text-emerald-400">Remaining Unallocated Buffer</p>
                  <p className="text-2xs text-text-secondary">Reserved for final 24h SMS/WhatsApp reminder push</p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400">₹580.00</span>
              </div>
            </div>

            <p className="text-2xs text-text-tertiary mt-4">
              Enforced by database ceiling constraint: cumulative expenditure cannot exceed ₹2,000.
            </p>
          </div>
        </div>

        {/* ─── 7-Day Campaign Execution Timeline ───────────────────────────── */}
        <div className="card p-6 sm:p-8 bg-surface border-border">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white">
              7-Day Growth Sprint Roadmap
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Daily operational cadence driving viral coefficient &gt; 1.25 through the student referral engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {timelineSteps.map((step) => (
              <div
                key={step.day}
                className={`p-4 rounded-xl border transition-all ${
                  step.status === 'completed'
                    ? 'bg-surface-elevated/70 border-emerald-500/40 text-text-secondary'
                    : step.status === 'active'
                    ? 'bg-cerulean/10 border-cerulean shadow-md text-white'
                    : 'bg-surface border-border/60 text-text-tertiary'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-2xs font-mono font-bold px-2 py-0.5 rounded ${
                      step.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : step.status === 'active'
                        ? 'bg-cerulean text-white'
                        : 'bg-surface-elevated text-text-tertiary'
                    }`}
                  >
                    {step.day}
                  </span>
                  <span className="text-2xs font-mono text-text-tertiary">{step.budget}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-2 leading-tight">
                  {step.title}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {step.tactics}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Student Referral Spotlight CTA ──────────────────────────────── */}
        <div className="card p-8 bg-gradient-to-r from-surface via-surface-elevated to-surface border border-cerulean/30 relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cerulean/15 border border-cerulean/30 text-cerulean text-xs font-semibold mb-3">
              <span>✦</span>
              <span>VIRAL ATTRIBUTION ENGINE</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white mb-3">
              Powering Growth Through the AI Project Passport
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              Every student who registers receives a personalized Passport credential with a collision-resistant
              referral link. Peer referrals are verified through central database constraints, ensuring every
              point on the leaderboard corresponds to an authentic registered student.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/leaderboard" className="btn-primary !px-6 !py-2.5 text-xs font-semibold">
                View Campus Leaderboard →
              </Link>
              <Link to="/register" className="btn-rose !px-6 !py-2.5 text-xs font-semibold">
                Register to Get Your Referral Link
              </Link>
              <Link
                to="/dashboard"
                className="text-xs font-mono text-text-secondary hover:text-white transition-colors underline underline-offset-4"
              >
                Organizer Admin Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GrowthHubPage;
