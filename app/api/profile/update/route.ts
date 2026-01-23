// app/api/profile/update/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import type { ProfileUpdateInput } from "@/lib/profile/types";

export async function POST(req: Request) {
  const body = (await req.json()) as { code: string; patch: ProfileUpdateInput };

  const { code, patch } = body;
  if (!code) return NextResponse.json({ error: "missing code" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("code", code)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profile: data });
}
