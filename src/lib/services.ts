/**
 * ==============================================================================
 * NXTWAVE AI PROJECT PASSPORT: SERVICE LAYER
 * Path: src/lib/services.ts
 *
 * Provides a unified data service layer with seamless switching between:
 * 1. Live Supabase PostgreSQL backend (when VITE_SUPABASE_URL and KEY are configured)
 * 2. Transparent, client-side demo mode (when unconfigured or offline)
 *
 * Never exposes secrets or service-role keys.
 * ==============================================================================
 */

import type { Registration, DashboardMetrics, ProjectId, AcquisitionSource } from '../types';
import { saveDemoRegistration, getDemoRegistrations } from './referral';
import { computeDashboardMetrics, DEMO_REGISTRATIONS } from '../data/demoData';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { trackEvent } from './analytics';

export interface RegistrationResult {
  success: boolean;
  registrationId?: string;
  referralCode?: string;
  alreadyRegistered?: boolean;
  error?: string;
  isDemo?: boolean;
}

export interface CampaignExpense {
  id: string;
  itemName: string;
  amountInr: number;
  category: 'campus_outreach' | 'whatsapp_marketing' | 'posters' | 'infrastructure' | 'miscellaneous';
  expenseDate: string;
}

/**
 * Registers a student for the free online workshop.
 * Uses atomic Supabase RPC if configured, otherwise falls back to local session.
 */
export async function registerForWorkshop(
  reg: Omit<Registration, 'id' | 'registeredAt'> & { id?: string }
): Promise<RegistrationResult> {
  const supabase = getSupabaseClient();

  // 1. Live Supabase Backend Flow
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc('register_student', {
        p_name: reg.name,
        p_email: reg.email,
        p_college: reg.college,
        p_grad_year: reg.graduationYear,
        p_project_id: reg.projectId ?? 'resume-feedback',
        p_ref_code: reg.referralCode || null,
        p_source: reg.source ?? 'direct',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data && !data.success && data.error) {
        return { success: false, error: data.error };
      }

      const isExisting = Boolean(data?.already_registered);
      const assignedRefCode = data?.referral_code ?? reg.referralCode ?? 'AIPP-2026';

      // Also store in session cache for offline tab continuity
      saveDemoRegistration({
        id: data?.registration_id ?? `reg-${Date.now()}`,
        name: reg.name,
        email: reg.email,
        college: reg.college,
        graduationYear: reg.graduationYear,
        projectId: reg.projectId,
        referralCode: assignedRefCode,
        registeredAt: new Date().toISOString(),
        source: reg.source,
      });

      return {
        success: true,
        registrationId: data?.registration_id,
        referralCode: assignedRefCode,
        alreadyRegistered: isExisting,
        isDemo: false,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection to database failed.';
      return { success: false, error: msg };
    }
  }

  // 2. Demo Fallback Mode (Honest, local session storage)
  await delay(600);

  const existingRegs = getDemoRegistrations();
  const duplicate = existingRegs.find(
    (r) => r.email.toLowerCase() === reg.email.toLowerCase()
  );

  const code = duplicate?.referralCode || reg.referralCode || generateLocalRefCode(reg.name);
  const registrationId = duplicate?.id || `demo-${Date.now()}`;

  if (!duplicate) {
    saveDemoRegistration({
      id: registrationId,
      name: reg.name,
      email: reg.email,
      college: reg.college,
      graduationYear: reg.graduationYear,
      projectId: reg.projectId,
      referralCode: code,
      registeredAt: new Date().toISOString(),
      source: reg.source,
    });

    await trackEvent('registration_success', {
      source: reg.source,
      has_referral: Boolean(reg.referralCode),
    });
  }

  return {
    success: true,
    registrationId,
    referralCode: code,
    alreadyRegistered: Boolean(duplicate),
    isDemo: true,
  };
}

/**
 * Fetches dashboard analytics metrics.
 */
export async function fetchDashboardMetrics(): Promise<DashboardMetrics & { isLive: boolean }> {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_metrics');
      if (!error && data) {
        return {
          totalRegistrations: Number(data.totalRegistrations ?? 0),
          target: Number(data.target ?? 500),
          campaignDays: Number(data.campaignDays ?? 7),
          budgetTotal: Number(data.budgetTotal ?? 2000),
          budgetSpent: Number(data.budgetSpent ?? 0),
          bySource: data.bySource ?? { direct: 0, whatsapp: 0, referral: 0, organic: 0 },
          dailyTrend: data.dailyTrend ?? [],
          funnel: data.funnel ?? { landingPageViews: 0, finderCompletions: 0, registrations: 0 },
          referralActivity: data.referralActivity ?? [],
          isLive: true,
        };
      }
    } catch {
      // Fall through to local fallback if unauthenticated
    }
  }

  // Demo fallback
  await delay(250);
  const sessionRegs = getDemoRegistrations();
  const metrics = computeDashboardMetrics(sessionRegs);
  return { ...metrics, isLive: false };
}

/**
 * Fetches registered students list for authorized organizers.
 */
export async function fetchRegistrations(): Promise<{
  registrations: Registration[];
  isLive: boolean;
}> {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const liveList: Registration[] = data.map((row) => ({
          id: row.id,
          name: row.full_name,
          email: row.email_normalized,
          college: row.college,
          graduationYear: row.graduation_year,
          projectId: row.project_id as ProjectId,
          referralCode: row.referral_code_used ?? undefined,
          source: (row.campaign_source as AcquisitionSource) ?? 'direct',
          registeredAt: row.created_at,
        }));
        return { registrations: liveList, isLive: true };
      }
    } catch {
      // Fall through to demo list
    }
  }

  // Demo fallback
  await delay(150);
  const sessionRegs = getDemoRegistrations();
  return {
    registrations: [...sessionRegs, ...DEMO_REGISTRATIONS],
    isLive: false,
  };
}

/**
 * Logs an authorized campaign expense towards the ₹2,000 maximum budget.
 */
export async function logCampaignExpense(
  itemName: string,
  amountInr: number,
  category: CampaignExpense['category']
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('campaign_expenses').insert({
        item_name: itemName,
        amount_inr: amountInr,
        category,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  }

  return { success: true }; // Local demo mode succeeds in session
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateLocalRefCode(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8) || 'student';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${slug}-${suffix}`;
}
