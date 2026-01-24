// app/api/profile/create/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import crypto from "crypto";

type CreatePayload = {
  code: string;
};

function makeToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export async function POST(req: Request) {
  // ✅ WP認証（createは必須）
  const token = req.headers.get("x-sync-token");
  if (!token || token !== process.env.X_SYNC_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const body: CreatePayload | null = await req.json().catch(() => null);

  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!code) {
    return NextResponse.json(
      { ok: false, error: "missing code" },
      { status: 400 },
    );
  }

  // ① 既存確認
  const { data: existing, error: selErr } = await supabaseServer
    .from("profiles")
    .select("code, edit_token, status")
    .eq("code", code)
    .maybeSingle();

  if (selErr) {
    return NextResponse.json(
      { ok: false, error: selErr.message },
      { status: 500 },
    );
  }

  // ② 初回だけ token 作る（既存なら維持）
  const edit_token = existing?.edit_token || makeToken();

  // ③ なければ insert / あれば token空救済だけ
  if (!existing) {
    const { error: insErr } = await supabaseServer
      .from("profiles")
      .insert({ code, edit_token, status: "active" });

    if (insErr) {
      return NextResponse.json(
        { ok: false, error: insErr.message },
        { status: 500 },
      );
    }
  } else if (!existing.edit_token) {
    const { error: upErr } = await supabaseServer
      .from("profiles")
      .update({ edit_token })
      .eq("code", code);

    if (upErr) {
      return NextResponse.json(
        { ok: false, error: upErr.message },
        { status: 500 },
      );
    }
  }

  const baseUrl = process.env.NFC_PROFILE_BASE_URL ?? "https://xxx.com";
  const edit_url = `${baseUrl}/edit/${encodeURIComponent(code)}?t=${encodeURIComponent(edit_token)}`;
  const public_url = `${baseUrl}/p/${encodeURIComponent(code)}`;

  return NextResponse.json({ ok: true, edit_url, public_url });
}
