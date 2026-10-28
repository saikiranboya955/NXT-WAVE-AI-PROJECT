import type { Registration } from '../types';

// ─── Referral utilities ────────────────────────────────────────────────────────

const WORKSHOP_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
const REF_STORAGE_KEY = 'aipp_incoming_ref';

/**
 * Generates an accessible, memorable referral code in the format:
 * [firstname]-[4 alphanumeric chars] e.g., aditya-A1B2
 */
export function generateReferralCode(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8) || 'student';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${slug}-${suffix}`;
}

/**
 * Builds a complete referral sharing URL.
 */
export function buildReferralUrl(code: string): string {
  const url = new URL(WORKSHOP_URL);
  url.searchParams.set('ref', code);
  return url.toString();
}

/**
 * Extracts referral code from URL search parameters.
 */
export function getReferralCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('ref');
}

/**
 * Captures referral code from incoming URL and persists to sessionStorage.
 */
export function captureAndStoreReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  const fromUrl = getReferralCodeFromUrl();
  if (fromUrl && validateReferralCodeFormat(fromUrl)) {
    try {
      sessionStorage.setItem(REF_STORAGE_KEY, fromUrl.trim());
      return fromUrl.trim();
    } catch {
      return fromUrl.trim();
    }
  }
  return getStoredReferralCode();
}

/**
 * Retrieves the persisted incoming referral code.
 */
export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(REF_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Gets the active referral code (URL has precedence over sessionStorage).
 */
export function getActiveReferralCode(): string | null {
  const fromUrl = getReferralCodeFromUrl();
  if (fromUrl && validateReferralCodeFormat(fromUrl)) {
    return fromUrl.trim();
  }
  return getStoredReferralCode();
}

/**
 * Validates referral code syntax: [2-12 letters/numbers]-[3-6 alphanumeric chars]
 */
export function validateReferralCodeFormat(code: string): boolean {
  if (!code) return false;
  return /^[a-z0-9]{2,12}-[a-z0-9]{3,6}$/i.test(code.trim());
}

/**
 * Constructs a friendly, prefilled WhatsApp invitation message.
 */
export function buildWhatsAppMessage(referralUrl: string): string {
  return encodeURIComponent(
    `Hey! I just registered for a free AI workshop — "Build Your First AI Project in 60 Minutes." It's beginner-friendly and completely free for final-year engineering students. Thought you might be interested!\n\nRegister here: ${referralUrl}`
  );
}

export function getWhatsAppShareUrl(referralUrl: string): string {
  return `https://wa.me/?text=${buildWhatsAppMessage(referralUrl)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

export async function nativeShare(referralUrl: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: 'Free AI Workshop — Build Your First AI Project in 60 Minutes',
        text: 'A free, beginner-friendly online workshop for final-year engineering students.',
        url: referralUrl,
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

// ─── Registration storage (session cache for demo & offline) ───────────────────

const STORAGE_KEY = 'aipp_demo_registrations';

export function saveDemoRegistration(reg: Registration): void {
  if (typeof sessionStorage === 'undefined') return;
  const existing = getDemoRegistrations();
  // Prevent duplicate insertion in local session
  const exists = existing.some((r) => r.email.toLowerCase() === reg.email.toLowerCase());
  if (!exists) {
    existing.unshift(reg);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }
}

export function getDemoRegistrations(): Registration[] {
  if (typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function exportToCSV(registrations: Registration[]): void {
  const headers = [
    'ID',
    'Full Name',
    'Email Address',
    'College Name',
    'Graduation Year',
    'Project Track',
    'Referral Code Used',
    'Acquisition Source',
    'Registered At',
  ];

  const rows = registrations.map((r) => [
    r.id,
    r.name,
    r.email,
    r.college,
    r.graduationYear,
    r.projectId ?? 'resume-feedback',
    r.referralCode ?? '',
    r.source,
    r.registeredAt,
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nxtwave-workshop-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
