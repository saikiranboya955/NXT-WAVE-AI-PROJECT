import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CampusLeaderboard from '../components/CampusLeaderboard';
import { captureAndStoreReferralCode, getActiveReferralCode } from '../lib/referral';
import { trackEvent } from '../lib/analytics';

const LandingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlRef = searchParams.get('ref');

  useEffect(() => {
    captureAndStoreReferralCode();
    trackEvent('landing_view');
  }, []);

  const ref = urlRef || getActiveReferralCode() || '';

  return (
    <main className="pt-16 min-h-screen bg-black" id="main-content">
      {/* ─── Hero Section (Section 1 of Reference) ─────────────────────────── */}
      <section
        className="relative pt-10 sm:pt-16 pb-16 px-5 sm:px-8 border-b border-border/80"
        aria-labelledby="hero-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div>
              {/* Free Online Workshop Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose/10 border border-rose/30 text-rose text-xs font-semibold uppercase tracking-wider mb-6">
                <span>✦</span>
                <span>FREE ONLINE WORKSHOP</span>
              </div>

              {/* Main Headline */}
              <h1
                id="hero-heading"
                className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.12] tracking-tight mb-6"
              >
                Build Your First{' '}
                <span className="text-cerulean">
                  AI Project
                </span>{' '}
                in <br className="hidden sm:inline" />
                <span className="text-white">60 Minutes</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8 max-w-xl">
                A hands-on, beginner-friendly workshop for final-year engineering students
                to go from idea → working AI project in just 60 minutes.
              </p>

              {/* 3 Workshop Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {/* Badge 1: Schedule Status */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="w-8 h-8 rounded-lg bg-cerulean/15 border border-cerulean/30 flex items-center justify-center text-cerulean text-sm shrink-0">
                    🌐
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">Live Online</p>
                    <p className="text-2xs text-text-secondary truncate">Free online workshop</p>
                  </div>
                </div>

                {/* Badge 2: Duration */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="w-8 h-8 rounded-lg bg-cerulean/15 border border-cerulean/30 flex items-center justify-center text-cerulean text-sm shrink-0">
                    ⏱️
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">60 Minutes</p>
                    <p className="text-2xs text-text-secondary truncate">Hands-on Build</p>
                  </div>
                </div>

                {/* Badge 3: Audience */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="w-8 h-8 rounded-lg bg-rose/15 border border-rose/30 flex items-center justify-center text-rose text-sm shrink-0">
                    🎓
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">Final-Year</p>
                    <p className="text-2xs text-text-secondary truncate">Engineering Students</p>
                  </div>
                </div>
              </div>

              {/* Primary CTA */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link
                    to={`/finder${ref ? `?ref=${ref}` : ''}`}
                    className="btn-rose text-base !px-8 !py-3.5"
                    id="hero-finder-cta"
                  >
                    <span>Find Your AI Project</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    to={`/register${ref ? `?ref=${ref}` : ''}`}
                    className="btn-ghost text-sm !px-6 !py-3.5 text-center"
                    id="hero-direct-register-cta"
                  >
                    Register Directly
                  </Link>
                </div>
                <p className="text-xs text-text-tertiary">
                  It's free. No prior experience needed.
                </p>
                {ref && (
                  <p className="text-xs text-cerulean font-mono">
                    ✦ Referral applied: <span className="font-semibold">{ref}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Right Hero Image Column with Young Person & Laptop */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Floating Annotation: Real Project in 60 Mins! */}
              <div
                className="absolute -top-3 left-4 sm:-left-3 z-20 bg-surface-elevated/95 backdrop-blur-sm border border-cerulean/40 px-3.5 py-1.5 rounded-full -rotate-3 hidden sm:flex items-center gap-2"
                aria-hidden="true"
              >
                <span className="text-cerulean text-xs">✨</span>
                <span className="text-xs font-bold text-cerulean tracking-wide">
                  Real Project in 60 Mins!
                </span>
              </div>

              {/* Hero Image Container */}
              <div className="relative max-w-md w-full">
                <div className="relative rounded-2xl overflow-hidden border border-border bg-surface shadow-xl">
                  <img
                    src="/hero-person.jpg"
                    alt="Young engineering student wearing futuristic glowing smart glasses coding on a laptop"
                    className="w-full h-auto object-cover object-center"
                    width="600"
                    height="600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Strip (from Section 1 of Reference) */}
        <div className="mt-16 pt-8 border-t border-border/80">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-xs sm:text-sm font-medium text-text-secondary">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-cerulean/15 border border-cerulean/30 flex items-center justify-center text-cerulean shrink-0">
                🛡️
              </span>
              <span>Build a working AI Project</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-rose/15 border border-rose/30 flex items-center justify-center text-rose shrink-0">
                ⚡
              </span>
              <span>Get hands-on guidance</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-cerulean/15 border border-cerulean/30 flex items-center justify-center text-cerulean shrink-0">
                📁
              </span>
              <span>Add to your portfolio</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-rose/15 border border-rose/30 flex items-center justify-center text-rose shrink-0">
                👥
              </span>
              <span>Be part of an AI community</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Section ────────────────────────────────────────────────────── */}
      <section id="why" className="py-20 px-5 sm:px-8 max-w-7xl mx-auto border-b border-border/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-mono uppercase tracking-widest text-cerulean mb-3">
            Why Attend
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for Final-Year Placements & Portfolios
          </h2>
          <p className="text-text-secondary text-sm sm:text-base mt-4">
            Most college students get stuck in theoretical tutorials. In 60 minutes, you'll
            bridge the gap by constructing an AI tool you can explain in interviews.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="w-10 h-10 rounded-xl bg-cerulean/15 border border-cerulean/30 flex items-center justify-center text-cerulean mb-4 text-lg">
              🎯
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Zero Fluff, 100% Code</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              No endless theory slides. You start writing Python code within the first 10
              minutes and deploy an interactive interface.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-10 h-10 rounded-xl bg-rose/15 border border-rose/30 flex items-center justify-center text-rose mb-4 text-lg">
              💼
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Interview-Ready Project</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Gain a talking point for tech recruiters. Learn to explain prompt mechanics,
              API integration, and deployment tradeoffs.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-10 h-10 rounded-xl bg-cerulean/15 border border-cerulean/30 flex items-center justify-center text-cerulean mb-4 text-lg">
              🎟️
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Verified AI Passport</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Receive your personalized Project Passport credential confirming your project track,
              curated learning syllabus, and starter code.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Community Section (Campus Leaderboard - Section 6 of Reference) ──── */}
      <section id="community" className="py-20 px-5 sm:px-8 max-w-7xl mx-auto border-b border-border/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-rose mb-3">
            Campus Referral Competition
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            See Who's Leading Across Campuses
          </h2>
          <p className="text-text-secondary text-sm sm:text-base mt-3">
            Top student referrers unlock VIP mentor hours and priority project reviews.
          </p>
        </div>

        {/* Live Campus Leaderboard Component */}
        <CampusLeaderboard />
      </section>

      {/* ─── FAQ Section ────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-5 sm:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-cerulean mb-3">
            Common Questions
          </p>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm sm:text-base font-semibold text-white mb-2">
              Is the workshop really free?
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary">
              Yes, 100% free. No hidden fees, no credit card required, and no subscription traps.
            </p>
          </div>

          <div className="card p-5">
            <h3 className="text-sm sm:text-base font-semibold text-white mb-2">
              What prerequisites do I need?
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary">
              Basic familiarity with Python loops and variables. You do not need any prior machine
              learning or AI engineering experience.
            </p>
          </div>

          <div className="card p-5">
            <h3 className="text-sm sm:text-base font-semibold text-white mb-2">
              What will I actually walk away with?
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary">
              A deployed starter AI application running live, full source code on GitHub, and your
              verified NxtWave AI Project Passport.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <Link
            to={`/finder${ref ? `?ref=${ref}` : ''}`}
            className="btn-rose !px-8 !py-3.5 text-base"
          >
            Find Your AI Project Now →
          </Link>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
