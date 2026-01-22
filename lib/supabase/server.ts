import "server-only";
import { createClient } from "@supabase/supabase-js";

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const supabaseServer = createClient(
  must("NEXT_PUBLIC_SUPABASE_URL"),
  must("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } }
);
