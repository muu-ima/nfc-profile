// lib/profile/profileRepo.ts
import { supabaseServer } from "@/lib/supabase/server";
import type { Profile, ProfilePatch } from "@/shared/profile/types";

export async function getProfileByCode(code: string) {
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("code,slug,display_name,bio,icon_url,sns,updated_at")
    .eq("code", code)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as Profile | null;
}

export async function updateProfileByCode(code: string, patch: ProfilePatch) {
  const { data, error } = await supabaseServer
    .from("profiles")
    .update(patch)
    .eq("code", code)
    .select("code,slug,display_name,bio,icon_url,sns,updated_at")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as Profile | null;
}
