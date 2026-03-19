/**
 * Supabase Admin Client (Service Role)
 *
 * Singleton Supabase client using the service role key for server-side
 * operations that bypass RLS (e.g. scan caching from API routes).
 *
 * DO NOT import this from client components or middleware -- it exposes
 * the service role key which must never reach the browser.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin environment variables. ' +
        `URL: ${url ? 'set' : 'MISSING'}, ` +
        `Service Role Key: ${serviceRoleKey ? 'set' : 'MISSING'}`,
    );
  }

  adminClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
