import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getActiveReferralCode,
  buildReferralUrl,
  getWhatsAppShareUrl,
  copyToClipboard,
  getDemoRegistrations,
  generateReferralCode,
} from '../lib/referral';
import { isSupabaseConfigured } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';

interface StudentReferralCenterProps {
  onCodeChange?: (code: string) => void;
}

const StudentReferralCenter: React.FC<StudentReferralCenterProps> = ({ onCodeChange }) => {
  const registeredStudents = getDemoRegistrations();
  const latestStudent = registeredStudents[0];

  const defaultCode =
    latestStudent?.referralCode ||
    getActiveReferralCode() ||
    generateReferralCode('student');

  const [referralCode, setReferralCode] = useState<string>(defaultCode);
  const [copied, setCopied] = useState<boolean>(false);
  const isLive = isSupabaseConfigured();

  const referralUrl = buildReferralUrl(referralCode);

  async function handleCopy() {
    await trackEvent('referral_share', {
      channel: 'copy_link',
      referral_code: referralCode,
    });
    const ok = await copyToClipboard(referralUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  async function handleWhatsAppShare() {
    await trackEvent('referral_share', {
      channel: 'whatsapp',
      referral_code: referralCode,
    });
    const shareUrl = getWhatsAppShareUrl(referralUrl);
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  function handleGenerateNew() {
    const newCode = generateReferralCode('campus');
    setReferralCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  }

  return (
    <div className="card p-6 sm:p-8 bg-surface border border-cerulean/30 shadow-2xl relative overflow-hidden mb-8">
      {/* Background Decorative Accent */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 bg-cerulean/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cerulean/15 border border-cerulean/30 text-cerulean text-2xs font-semibold uppercase tracking-wider mb-2">
            <span>✦</span>
            <span>STUDENT REFERRAL CENTER</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Invite Classmates & Lead Your Campus
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Share your unique referral link. Climb the campus leaderboard as classmates register.
          </p>
        </div>

        {/* Live vs Session Storage Tag */}
        <div className="shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-2xs font-mono font-semibold border ${
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
            <span>{isLive ? 'LIVE DATABASE ATTRIBUTION' : 'SESSION DEMO STORAGE'}</span>
          </span>
        </div>
      </div>

      {/* Student Referral Info Banner */}
      {latestStudent ? (
        <div className="mb-6 p-3.5 rounded-xl bg-cerulean/10 border border-cerulean/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-base">🎓</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                Active Passport for {latestStudent.name}
              </p>
              <p className="text-2xs text-text-secondary truncate">
                {latestStudent.college} • Class of {latestStudent.graduationYear}
              </p>
            </div>
          </div>
          <span className="text-2xs font-mono font-bold text-cerulean px-2 py-0.5 rounded bg-cerulean/20 border border-cerulean/40 shrink-0">
            REGISTERED
          </span>
        </div>
      ) : (
        <div className="mb-6 p-3.5 rounded-xl bg-surface-elevated border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-text-secondary">
            Haven't registered yet? You can test sharing below or register now to link your college.
          </p>
          <Link
            to="/register"
            className="text-xs font-semibold text-rose hover:text-pink-400 whitespace-nowrap transition-colors"
          >
            Register for Workshop →
          </Link>
        </div>
      )}

      {/* Code Display & Action Row */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="student-referral-link"
            className="block text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-1.5"
          >
            Your Unique Referral Link
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <input
                id="student-referral-link"
                type="text"
                readOnly
                value={referralUrl}
                className="w-full bg-surface-elevated border border-border focus:border-cerulean text-white font-mono text-xs sm:text-sm px-3.5 py-3 rounded-xl selection:bg-cerulean/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs font-mono font-semibold text-cerulean bg-cerulean/15 px-2 py-0.5 rounded border border-cerulean/30 hidden sm:inline">
                {referralCode}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                copied
                  ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'btn-primary'
              }`}
              id="referral-center-copy-btn"
            >
              <span>{copied ? '✓' : '📋'}</span>
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          {/* WhatsApp Primary Viral Action */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex-1 py-3 px-5 rounded-xl bg-cerulean hover:bg-cerulean-light text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md"
            id="referral-center-whatsapp-btn"
          >
            <span className="text-sm">💬</span>
            <span>Share Invitation via WhatsApp</span>
          </button>

          {/* Generate Alternative Test Code */}
          <button
            type="button"
            onClick={handleGenerateNew}
            className="py-3 px-4 rounded-xl bg-surface-elevated hover:bg-border border border-border text-text-secondary hover:text-white font-mono text-xs flex items-center justify-center gap-2 transition-all"
            title="Generate a fresh referral code format"
          >
            <span>🔄</span>
            <span>New Code</span>
          </button>
        </div>
      </div>

      {/* Referral Attribution Transparency Badges */}
      <div className="mt-6 pt-5 border-t border-border/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-surface-elevated/60 border border-border/50">
          <p className="text-2xs font-bold text-white flex items-center gap-1.5 mb-1">
            <span>🛡️</span> Verified Registrations Only
          </p>
          <p className="text-[11px] text-text-tertiary leading-tight">
            Raw link clicks do not count. Only confirmed student registrations credit your score.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-surface-elevated/60 border border-border/50">
          <p className="text-2xs font-bold text-white flex items-center gap-1.5 mb-1">
            <span>🔗</span> Journey Preservation
          </p>
          <p className="text-[11px] text-text-tertiary leading-tight">
            Your code remains attached as friends explore projects and complete registration.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-surface-elevated/60 border border-border/50">
          <p className="text-2xs font-bold text-white flex items-center gap-1.5 mb-1">
            <span>🔒</span> Anti-Duplicate Enforcement
          </p>
          <p className="text-[11px] text-text-tertiary leading-tight">
            Duplicate email submissions are rejected to maintain fair campus rankings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentReferralCenter;
