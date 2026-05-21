import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@env';

export function getSupabaseConfig(): { url: string; anonKey: string } {
  const url = SUPABASE_URL?.trim();
  const anonKey = SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_ANON_KEY. Copy .env.example to .env and add your credentials.',
    );
  }

  return { url, anonKey };
}
