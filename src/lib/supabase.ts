import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://gxypassgopsemcyjnppq.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

/**
 * Validates whether Supabase is configured with real credentials
 * rather than unconfigured default placeholders.
 */
export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (
    supabaseUrl.includes('your-project') ||
    supabaseUrl.includes('example.supabase.co') ||
    supabaseAnonKey.includes('your-public-anon-key')
  ) {
    return false;
  }
  return supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 20;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
}

// ─── Authentication Helpers ───────────────────────────────────────────────────

export async function signInAdmin(
  email: string,
  password?: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase is not configured yet.' };
  }

  try {
    if (password) {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user ?? undefined };
    } else {
      // Magic link sign-in for passwordless admin
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) return { success: false, error: error.message };
      return {
        success: true,
        error: 'Magic login link sent to your email. Check your inbox!',
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication failed';
    return { success: false, error: msg };
  }
}

export async function signOutAdmin(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut();
  }
}

export async function getCurrentAdmin(): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => {
    subscription.unsubscribe();
  };
}
