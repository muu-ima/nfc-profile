import { supabaseServer } from "@/lib/supabase/server";

export async function getProfileByCode(code: string) {
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProfileBySlug(slug: string) {
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}
