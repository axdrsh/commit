"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare global {
  // eslint-disable-next-line no-var
  var __supabase_browser_client__: SupabaseClient | undefined;
}

export const createBrowserSupabaseClient = (): SupabaseClient => {
  if (globalThis.__supabase_browser_client__) {
    return globalThis.__supabase_browser_client__;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "commit-auth",
    },
  });

  globalThis.__supabase_browser_client__ = client;
  return client;
};
