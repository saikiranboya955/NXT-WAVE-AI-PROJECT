import { getSupabaseClient } from './supabase';

export type CampaignEventType =
  | 'landing_view'
  | 'finder_start'
  | 'finder_step'
  | 'finder_complete'
  | 'registration_attempt'
  | 'registration_success'
  | 'referral_visit'
  | 'referral_share';

const SESSION_KEY = 'aipp_analytics_session_id';
const LOCAL_EVENTS_KEY = 'aipp_local_analytics_events';

export function getOrCreateSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return 'sess_fallback';
  }
}

/**
 * Tracks a campaign funnel event.
 * Strictly avoids PII (no names, emails, phone numbers).
 */
export async function trackEvent(
  eventName: CampaignEventType,
  metadata: Record<string, string | number | boolean> = {}
): Promise<void> {
  const sessionId = getOrCreateSessionId();

  // Save event in sessionStorage for local dashboard funnel tracking
  try {
    const raw = sessionStorage.getItem(LOCAL_EVENTS_KEY);
    const existing: Array<{ event: string; time: string; meta: Record<string, unknown> }> =
      raw ? JSON.parse(raw) : [];
    existing.push({
      event: eventName,
      time: new Date().toISOString(),
      meta: metadata,
    });
    sessionStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(existing.slice(-100)));
  } catch {
    // SessionStorage unavailable
  }

  // Send to Supabase if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.rpc('record_campaign_event', {
        p_event_name: eventName,
        p_session_id: sessionId,
        p_metadata: metadata,
      });
    } catch {
      // Telemetry failure is non-blocking
    }
  }
}

export function getLocalFunnelCounts(): {
  landingPageViews: number;
  finderCompletions: number;
  registrationAttempts: number;
} {
  try {
    const raw = sessionStorage.getItem(LOCAL_EVENTS_KEY);
    if (!raw) return { landingPageViews: 0, finderCompletions: 0, registrationAttempts: 0 };
    const list: Array<{ event: string }> = JSON.parse(raw);
    return {
      landingPageViews: list.filter((e) => e.event === 'landing_view').length,
      finderCompletions: list.filter((e) => e.event === 'finder_complete').length,
      registrationAttempts: list.filter((e) => e.event === 'registration_attempt').length,
    };
  } catch {
    return { landingPageViews: 0, finderCompletions: 0, registrationAttempts: 0 };
  }
}
