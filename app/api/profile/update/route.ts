// app/api/profile/update/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import type { ProfileUpdateInput } from "@/lib/profile/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      code?: string;
      token?: string;
      patch?: ProfileUpdateInput;
    };

    const code = body.code?.trim();
    const token = body.token?.trim();
    const patch = body.patch ?? null;

    if (!code) {
      return NextResponse.json({ error: "missing code" }, { status: 400 });
    }
    if (!token) {
      return NextResponse.json({ error: "missing token" }, { status: 401 });
    }
    if (!patch || typeof patch !== "object") {
      return NextResponse.json({ error: "missing patch" }, { status: 400 });
    }

    // ① token照合（0件でも落ちない）
    const { data: cur, error: readErr } = await supabaseServer
      .from("profiles")
      .select("edit_token")
      .eq("code", code)
      .maybeSingle();

    if (readErr) {
      return NextResponse.json({ error: readErr.message }, { status: 500 });
    }
    if (!cur) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    if (cur.edit_token !== token) {
      return NextResponse.json({ error: "invalid token" }, { status: 403 });
    }

    // ② update
    const { data: updated, error: updErr } = await supabaseServer
      .from("profiles")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("code", code)
      .select("*")
      .single();

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({ profile: updated });
  } catch (e) {
    // JSON parse失敗や予期せぬ例外も必ずJSONで返す
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
