import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vabwqlkmngabpwnzrdel.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_PL0QJ7vH-W_wcI892m4atg_RDm-KpS2";
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhYndxbGttbmdhYnB3bnpyZGVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzIyMTUyNywiZXhwIjoyMTA4Nzk3NTI3fQ.0bEs1O5dXznMyYw-vOgFd9JwjjFlfvexkRAGm0n9L4o";

// Cliente público com RLS (Row-Level Security) ativo para o navegador
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Cliente administrativo seguro de servidor (Server-only / Edge runtime)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
