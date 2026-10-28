import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { FinderAnswers } from '../types';
import { getRecommendation } from '../lib/recommendation';
import { getActiveReferralCode, captureAndStoreReferralCode } from '../lib/referral';
import { trackEvent } from '../lib/analytics';

const PassportPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    captureAndStoreReferralCode();
    trackEvent('finder_complete');
  }, []);

  const urlRef = searchParams.get('ref');
  const ref = urlRef || getActiveReferralCode() || '';

  const answers: FinderAnswers = {
    interest: (searchParams.get('interest') as FinderAnswers['interest']) ?? 'real-world',
    skill: (searchParams.get('skill') as FinderAnswers['skill']) ?? 'beginner',
    goal: (searchParams.get('goal') as FinderAnswers['goal']) ?? 'portfolio',
  };

  const recommendation = getRecommendation(answers);
  const projectId = recommendation?.id || 'resume-feedback';
  const project = recommendation!;

  return (
    <main className="pt-20 min-h-screen bg-black px-5 sm:px-8 pb-20" id="main-content">
      <div className="max-w-5xl mx-auto">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to={`/finder${ref ? `?ref=${ref}` : ''}`}
            className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-white transition-colors"
          >
            ← Back to Questions
          </Link>
          <Link
            to={`/finder${ref ? `?ref=${ref}` : ''}`}
            className="text-xs font-mono text-text-secondary hover:text-rose transition-colors px-3 py-1.5 rounded-full border border-border"
          >
            Retake Quiz
          </Link>
        </div>

        {/* Section 3 Main Container */}
        <div className="card p-6 sm:p-10 border-border bg-surface shadow-xl">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
            {/* Left Column: Project Details */}
            <div>
              {/* Category Tag */}
              <p className="text-2xs font-mono font-bold uppercase tracking-widest text-rose mb-3">
                RECOMMENDED STARTER AI TRACK
              </p>

              {/* Project Headline */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                {project.name}
              </h1>

              {/* Tagline */}
              <p className="text-sm sm:text-base font-semibold text-cerulean mb-4">
                {project.tagline}
              </p>

              {/* Recommended For You Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose text-white text-xs font-bold mb-6">
                <span>✦</span> Tailored to your background & goal
              </div>

              {/* Personalized Why */}
              <div className="p-4 rounded-xl bg-surface-elevated border border-border mb-6">
                <p className="text-2xs font-mono font-bold uppercase tracking-wider text-text-tertiary mb-2">
                  Why this fits you
                </p>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {project.why}
                </p>
              </div>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-elevated border border-border text-2xs text-text-secondary font-mono"
                  >
                    <span>⚙️</span>
                    <span>{tech}</span>
                  </span>
                ))}
              </div>

              {/* 3 Realistic Starter Tasks */}
              <div className="rounded-2xl bg-surface-elevated border border-border p-6 mb-6">
                <h2 className="text-sm font-bold text-white mb-4 tracking-tight flex items-center gap-2">
                  <span>📋</span>
                  <span>3 Realistic Starter Tasks for Workshop</span>
                </h2>
                <ul className="space-y-3">
                  {project.starterTasks.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-text-secondary">
                      <span className="w-5 h-5 rounded-full bg-cerulean/20 text-cerulean border border-cerulean/40 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 60 Minutes Scope Box */}
              <div className="p-4 rounded-xl bg-cerulean/10 border border-cerulean/30">
                <p className="text-2xs font-mono font-bold uppercase tracking-wider text-cerulean mb-1">
                  ⏱️ 60-Minute Realistic Scope
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {project.sixtyMinScope}
                </p>
              </div>
            </div>

            {/* Right Column: Visual Preview & Action CTAs */}
            <div className="space-y-6">
              {/* Architecture Blueprint Card */}
              <div className="relative rounded-2xl bg-surface-elevated border border-border p-6 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <span className="text-2xs font-mono uppercase tracking-wider text-text-tertiary">
                    Project Track Blueprint
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-cerulean flex items-center justify-center text-white text-xs font-extrabold">
                    AI
                  </span>
                </div>

                <div className="py-6 space-y-4">
                  <div className="p-3 rounded-xl bg-black border border-border">
                    <p className="text-2xs font-mono text-text-tertiary">1. INPUT DATA</p>
                    <p className="text-xs font-medium text-white mt-1">Raw student inputs & prompt templates</p>
                  </div>
                  <div className="flex justify-center text-cerulean font-bold text-sm">
                    ↓
                  </div>
                  <div className="p-3 rounded-xl bg-cerulean/10 border border-cerulean/30">
                    <p className="text-2xs font-mono text-cerulean">2. AI ENGINE & LOGIC</p>
                    <p className="text-xs font-medium text-white mt-1">Structured analysis & retrieval logic</p>
                  </div>
                  <div className="flex justify-center text-cerulean font-bold text-sm">
                    ↓
                  </div>
                  <div className="p-3 rounded-xl bg-rose/10 border border-rose/30">
                    <p className="text-2xs font-mono text-rose">3. WORKING DEMO</p>
                    <p className="text-xs font-medium text-white mt-1">Interactive UI running live in 60 mins</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between text-2xs text-text-tertiary">
                  <span>Prerequisites: Python Basics</span>
                  <span>Cost: Free (100%)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Link
                  to={`/register?project=${projectId}${ref ? `&ref=${ref}` : ''}`}
                  className="btn-rose w-full text-center text-sm font-bold !py-3.5 block"
                  id="passport-register-cta"
                >
                  <span>Register for This Workshop</span>
                  <span aria-hidden="true"> →</span>
                </Link>

                <p className="text-2xs text-center text-text-tertiary">
                  Save your seat in 30 seconds. No credit card or account needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PassportPage;
