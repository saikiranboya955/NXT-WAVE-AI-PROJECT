import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import type { Registration, ProjectId } from '../types';
import {
  getWhatsAppShareUrl,
  copyToClipboard,
  nativeShare,
  getDemoRegistrations,
} from '../lib/referral';
import { getProjectById } from '../lib/recommendation';
import { trackEvent } from '../lib/analytics';

import type { EmailDeliveryStatus } from '../lib/email';

interface SuccessState {
  name: string;
  referralCode: string;
  shareUrl: string;
  registration: Registration;
  alreadyRegistered?: boolean;
  isDemo?: boolean;
  emailStatus?: EmailDeliveryStatus;
  emailMessage?: string;
}

const SuccessPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as SuccessState | null;

  // Fallback to recent session registration or reference default
  const recent = getDemoRegistrations().slice(-1)[0];
  const name = state?.name || recent?.name || 'Student';
  const referralCode = state?.referralCode || recent?.referralCode || 'nxt-A1B2';
  const shareUrl =
    state?.shareUrl || `${window.location.origin}/?ref=${referralCode}`;
  const projectId = (state?.registration?.projectId || recent?.projectId || 'resume-feedback') as ProjectId;
  const project = getProjectById(projectId);

  const [copied, setCopied] = useState(false);

  // Extract initials (e.g., Sai Kiran -> SK)
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .slice(0, 2)
      .join('') || 'AI';

  async function handleCopy() {
    await trackEvent('referral_share', { channel: 'copy_link' });
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  async function handleWhatsAppShare() {
    await trackEvent('referral_share', { channel: 'whatsapp' });
    window.open(getWhatsAppShareUrl(shareUrl), '_blank', 'noopener,noreferrer');
  }

  async function handleNativeShare() {
    await trackEvent('referral_share', { channel: 'native_share' });
    const ok = await nativeShare(shareUrl);
    if (!ok) {
      await handleWhatsAppShare();
    }
  }

  return (
    <main className="pt-20 min-h-screen bg-black px-5 sm:px-8 pb-20" id="main-content">
      <div className="max-w-lg mx-auto">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center text-3xl mb-3 animate-bounce">
            🎉
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            {state?.alreadyRegistered ? 'Seat Already Confirmed! 🎉' : "You're Registered! 🎉"}
          </h1>
          <p className="text-base font-semibold text-cerulean mb-1">
            Your Official AI Project Passport is Active
          </p>
          <p className="text-xs text-text-secondary">
            Invite classmates from your college to build together.
          </p>
        </div>

        {/* ─── Email Confirmation Status Pill ──────────────────────────────── */}
        {state?.emailStatus === 'sent' && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
            <span className="text-sm">✉️</span>
            <span>A confirmation email with workshop preparation details has been sent to your registered address.</span>
          </div>
        )}
        {state?.emailStatus === 'skipped_duplicate' && (
          <div className="mb-6 p-3.5 rounded-xl bg-cerulean/10 border border-cerulean/30 text-cerulean text-xs flex items-center gap-2.5">
            <span className="text-sm">ℹ️</span>
            <span>Your seat is already confirmed. Check your inbox for previous instructions.</span>
          </div>
        )}
        {(state?.emailStatus === 'unconfigured' || state?.emailStatus === 'pending') && !state?.isDemo && (
          <div className="mb-6 p-3.5 rounded-xl bg-surface-elevated border border-border text-text-secondary text-xs flex items-center gap-2.5">
            <span className="text-sm">ℹ️</span>
            <span>Seat recorded in central database. Joining links and starter instructions will be delivered before the session.</span>
          </div>
        )}

        {/* ─── The AI Project Passport Card (Section 5) ───────────────────── */}
        <div className="relative rounded-2xl p-6 sm:p-7 bg-surface border border-cerulean/30 shadow-xl mb-8 overflow-hidden">
          {/* Card Top Row */}
          <div className="flex items-center justify-between pb-5 border-b border-border">
            <span className="text-xs font-mono font-bold tracking-widest text-cerulean uppercase">
              AI PROJECT PASSPORT
            </span>
            <img
              src="/nxtwave-logo-white.png"
              alt="NxtWave"
              className="h-8 sm:h-9 w-auto object-contain filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              width="72"
              height="37"
            />
          </div>

          {/* User Profile Section */}
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              {/* Avatar with Initials */}
              <div className="w-14 h-14 rounded-full bg-cerulean flex items-center justify-center text-white font-extrabold text-lg ring-2 ring-cerulean/50">
                {initials}
              </div>

              {/* Name & Role */}
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {name}
                </h2>
                <p className="text-xs text-text-secondary mb-1">
                  Track: <span className="text-white font-medium">{project?.name ?? 'AI Resume Reviewer'}</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cerulean/15 text-cerulean border border-cerulean/30">
                    <span>✦</span> Final-Year Engineer
                  </span>
                  {state?.isDemo ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono text-rose bg-rose/10 border border-rose/30">
                      SESSION DEMO
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE DATABASE VERIFIED
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Verified Shield Badge */}
            <div className="w-10 h-10 rounded-xl bg-cerulean/20 border border-cerulean/50 flex items-center justify-center text-cerulean text-lg">
              🛡️
            </div>
          </div>

          {/* Bottom Card Row: QR Code & Referral Info */}
          <div className="pt-6 border-t border-border flex items-center justify-between gap-4">
            {/* SVG Access Code Icon */}
            <div className="w-16 h-16 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 shadow">
              <svg viewBox="0 0 24 24" className="w-full h-full fill-black" aria-hidden="true">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm8-2h3v3h-3v-3zm5 0h3v3h-3v-3zm-5 5h3v3h-3v-3zm5 0h3v3h-3v-3zm-3-2h2v2h-2v-2z" />
              </svg>
            </div>

            {/* Referral Code & Copy */}
            <div className="flex-1 min-w-0">
              <p className="text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                Your Shareable Referral Code
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-cerulean truncate">
                  ✦ {referralCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-border text-white text-xs font-semibold border border-border transition-all"
                  id="copy-referral-btn"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Share Actions ──────────────────────────────────────────────── */}
        <div className="space-y-3 mb-10">
          {/* Large WhatsApp Button */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full py-3.5 px-6 rounded-xl bg-cerulean hover:bg-cerulean-light text-white font-bold text-sm flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all"
            id="success-whatsapp-btn"
          >
            <span className="text-base">💬</span>
            <span>Share with Friends on WhatsApp</span>
          </button>

          {/* Copy Link Secondary Button */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 py-3 px-4 rounded-xl bg-surface border border-border hover:border-border-hover text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>🔗</span>
              <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Referral Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="py-3 px-4 rounded-xl bg-surface border border-border hover:border-border-hover text-text-secondary hover:text-white text-xs transition-all"
              aria-label="Share via device options"
            >
              📤
            </button>
          </div>
        </div>

        {/* ─── Workshop Preparation Next Steps ────────────────────────────── */}
        <div className="card p-6 border-border bg-surface mb-8">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span>📅</span>
            <span>What happens next?</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-cerulean font-bold">1.</span>
              <span>Join link and starter repository instructions will be sent to your registered email before the session.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cerulean font-bold">2.</span>
              <span>Prepare a browser and basic Python environment (Google Colab link will also be provided).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cerulean font-bold">3.</span>
              <span>Build and deploy your starter AI project in 60 minutes.</span>
            </li>
          </ul>
        </div>

        {/* Return to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-text-secondary hover:text-white transition-colors"
          >
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
};

export default SuccessPage;
