import type { Registration, ProjectId } from '../types/index.ts';
import { validateReferralCodeFormat } from './referral.ts';

// ─── Registration validation ───────────────────────────────────────────────────

export interface RegistrationFormData {
  name: string;
  email: string;
  college: string;
  graduationYear: string;
  referralCode?: string;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  college?: string;
  graduationYear?: string;
  referralCode?: string;
}

const VALID_GRAD_YEARS = ['2025', '2026', '2027', '2028'];

export function validateRegistration(data: RegistrationFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Full name is required.';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Name is too long (maximum 100 characters).';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (
    data.email.includes('..') ||
    !/^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/.test(data.email.trim())
  ) {
    errors.email = 'Please enter a valid academic or personal email address.';
  }

  if (!data.college || !data.college.trim()) {
    errors.college = 'College or university name is required.';
  } else if (data.college.trim().length < 3) {
    errors.college = 'Please enter your complete college or university name.';
  } else if (data.college.trim().length > 150) {
    errors.college = 'College name is too long.';
  }

  if (!data.graduationYear) {
    errors.graduationYear = 'Graduation year is required.';
  } else if (!VALID_GRAD_YEARS.includes(data.graduationYear)) {
    errors.graduationYear = 'This workshop is for engineering students graduating between 2025 and 2028.';
  }

  if (data.referralCode && data.referralCode.trim()) {
    if (!validateReferralCodeFormat(data.referralCode.trim())) {
      errors.referralCode = 'Referral code format is invalid (expected format: name-XXXX). Leave blank if unsure.';
    }
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function makeRegistration(
  data: RegistrationFormData,
  projectId?: string
): Omit<Registration, 'id' | 'registeredAt'> {
  const refCode = data.referralCode?.trim() || undefined;

  let source: Registration['source'] = 'direct';
  if (refCode) {
    source = 'referral';
  } else if (
    typeof document !== 'undefined' &&
    (document.referrer.includes('wa.me') || document.referrer.includes('whatsapp'))
  ) {
    source = 'whatsapp';
  } else if (typeof document !== 'undefined' && document.referrer && !document.referrer.includes(window.location.host)) {
    source = 'organic';
  }

  return {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    college: data.college.trim(),
    graduationYear: data.graduationYear,
    referralCode: refCode,
    projectId: (projectId as ProjectId) || 'resume-feedback',
    source,
  };
}

export const GRADUATION_YEARS = VALID_GRAD_YEARS;
