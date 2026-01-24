// app/api/profile/update/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import type { ProfileUpdateInput } from "@/lib/profile/types";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    code: string;
    token?: string; // ✅ 追加
    patch: ProfileUpdateInput;
  };

  const { code, patch, token } = body;

  if (!code) {
    return NextResponse.json({ error: "missing code" }, { status: 400 });
  }
  if (!token) {
    return NextResponse.json({ error: "missing token" }, { status: 401 });
  }

  // ✅ まず token 確認（真実DB＝Supabase）
  const { data: cur, error: readErr } = await supabaseServer
    .from("profiles")
    .select("edit_token")
    .eq("code", code)
    .single();

  if (readErr || !cur) {
    return NextResponse.json({ error: "profile not found" }, { status: 404 });
  }
  if (cur.edit_token !== token) {
    return NextResponse.json({ error: "invalid token" }, { status: 403 });
  }

  const { data, error } = await supabaseServer
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("code", code)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
