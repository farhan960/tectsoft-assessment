import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../config/env';
import { mmkvSupabaseAdapter } from '../storage/mmkv';

const { url, anonKey } = getSupabaseConfig();

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: mmkvSupabaseAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
