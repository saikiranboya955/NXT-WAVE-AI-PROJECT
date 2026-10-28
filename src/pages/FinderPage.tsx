import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StepIndicator from '../components/StepIndicator';
import type { FinderAnswers, Interest, SkillLevel, Goal } from '../types';
import { getActiveReferralCode, captureAndStoreReferralCode } from '../lib/referral';
import { trackEvent } from '../lib/analytics';

interface OptionCard {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

const INTEREST_OPTIONS: OptionCard[] = [
  {
    id: 'real-world',
    icon: '🌐',
    title: 'Solve real world problems',
    desc: 'Building things that directly help people and solve daily challenges.',
  },
  {
    id: 'tools',
    icon: '🔧',
    title: 'Build cool tools',
    desc: 'Automating tasks, developer utilities, and high-productivity software.',
  },
  {
    id: 'data',
    icon: '📊',
    title: 'Work with data',
    desc: 'Analyzing information, detecting patterns, and building smart insights.',
  },
  {
    id: 'content',
    icon: '✨',
    title: 'Create creative content',
    desc: 'Summarizing, generating text, writing assistance, and creative media.',
  },
];

const SKILL_OPTIONS: OptionCard[] = [
  {
    id: 'beginner',
    icon: '🌱',
    title: 'Beginner',
    desc: 'I know basic logic and can follow step-by-step tutorials.',
  },
  {
    id: 'some-python',
    icon: '🐍',
    title: 'Know some Python',
    desc: 'I can write loops, functions, and import standard packages.',
  },
  {
    id: 'small-project',
    icon: '🚀',
    title: 'Built small projects',
    desc: "I've built apps before and want to add generative AI capabilities.",
  },
];

const GOAL_OPTIONS: OptionCard[] = [
  {
    id: 'learn-basics',
    icon: '📚',
    title: 'Learn the basics',
    desc: 'Understand how modern LLMs and AI APIs function end-to-end.',
  },
  {
    id: 'practical-problem',
    icon: '⚡',
    title: 'Solve practical problems',
    desc: 'Build something immediately usable for campus or personal use.',
  },
  {
    id: 'portfolio',
    icon: '💼',
    title: 'Create a portfolio project',
    desc: 'Stand out in upcoming campus placement interviews and resumes.',
  },
];

const FinderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    captureAndStoreReferralCode();
  }, []);

  const urlRef = searchParams.get('ref');
  const ref = urlRef || getActiveReferralCode() || '';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [answers, setAnswers] = useState<FinderAnswers>({
    interest: 'real-world', // Pre-select first matching reference image
    skill: null,
    goal: null,
  });
  const [error, setError] = useState<string | null>(null);

  function handleSelect(val: string) {
    if (step === 1) setAnswers((prev) => ({ ...prev, interest: val as Interest }));
    if (step === 2) setAnswers((prev) => ({ ...prev, skill: val as SkillLevel }));
    if (step === 3) setAnswers((prev) => ({ ...prev, goal: val as Goal }));
    setError(null);
  }

  async function handleNext() {
    if (step === 1 && !answers.interest) {
      setError('Please select an option to continue.');
      return;
    }
    if (step === 2 && !answers.skill) {
      setError('Please select your skill level.');
      return;
    }
    if (step === 3 && !answers.goal) {
      setError('Please select your primary goal.');
      return;
    }

    if (step < 3) {
      const nextStep = (step + 1) as 1 | 2 | 3;
      await trackEvent('finder_step', { step: nextStep });
      setStep(nextStep);
      setError(null);
    } else {
      await trackEvent('finder_complete', {
        interest: answers.interest ?? '',
        skill: answers.skill ?? '',
        goal: answers.goal ?? '',
      });
      const params = new URLSearchParams({
        interest: answers.interest || 'real-world',
        skill: answers.skill || 'beginner',
        goal: answers.goal || 'portfolio',
      });
      if (ref) params.set('ref', ref);
      navigate(`/passport?${params.toString()}`);
    }
  }

  const currentOptions =
    step === 1 ? INTEREST_OPTIONS : step === 2 ? SKILL_OPTIONS : GOAL_OPTIONS;
  const currentSelected =
    step === 1 ? answers.interest : step === 2 ? answers.skill : answers.goal;

  const questionTitles = {
    1: '1. What excites you the most?',
    2: '2. What is your current skill level?',
    3: '3. What do you want to achieve?',
  };

  return (
    <main className="pt-20 min-h-screen bg-black px-5 sm:px-8 pb-20" id="main-content">
      <div className="max-w-4xl mx-auto">
        {/* Top Tagline */}
        <div className="text-center mb-3">
          <p className="text-2xs sm:text-xs font-mono font-bold uppercase tracking-widest text-cerulean">
            LET'S PERSONALIZE YOUR EXPERIENCE
          </p>
        </div>

        {/* Headline */}
        <div className="text-center max-w-2xl mx-auto mb-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Find the{' '}
            <span className="text-cerulean">
              Perfect AI Project
            </span>{' '}
            for You
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-3">
            Answer 3 quick questions and get a personalized project recommendation you can
            actually build in 60 minutes.
          </p>
        </div>

        {/* 3-Step Progress Indicator */}
        <StepIndicator current={step} />

        {/* Question Container Card */}
        <div className="card p-6 sm:p-10 border-border/80 bg-surface shadow-xl mt-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {questionTitles[step]}
            </h2>
            <p className="text-xs text-text-tertiary mt-1">(Select one)</p>
          </div>

          {/* Options Grid */}
          <div
            className={`grid gap-4 mb-8 ${
              step === 1 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'
            }`}
            role="radiogroup"
            aria-label={questionTitles[step]}
          >
            {currentOptions.map((opt) => {
              const isSelected = currentSelected === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  role="radio"
                  aria-checked={isSelected}
                  className={`flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-rose bg-rose/10 ring-1 ring-rose'
                      : 'border-border bg-surface-elevated/70 hover:border-border-hover hover:bg-surface-elevated'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-colors ${
                      isSelected
                        ? 'bg-rose/20 text-white'
                        : 'bg-black/50 text-text-secondary border border-border/80'
                    }`}
                  >
                    {opt.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                    {opt.title}
                  </h3>

                  {/* Description */}
                  <p className="text-2xs text-text-secondary leading-relaxed line-clamp-3">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Validation Error Message */}
          {error && (
            <p className="text-xs text-rose text-center mb-6 font-medium animate-pulse" role="alert">
              {error}
            </p>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                className="btn-ghost text-xs order-2 sm:order-1"
              >
                ← Back
              </button>
            ) : (
              <div className="order-2 sm:order-1" />
            )}

            {/* Next Button — Wide Gradient Button as in Reference Image */}
            <button
              type="button"
              onClick={handleNext}
              className="btn-gradient w-full sm:w-auto min-w-[200px] text-sm font-bold order-1 sm:order-2"
              id="finder-next-btn"
            >
              <span>{step === 3 ? 'Generate My AI Passport →' : 'Next →'}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FinderPage;
