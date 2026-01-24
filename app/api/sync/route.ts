// app/api/sync/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

type Payload = {
  code: string;
  slug: string;
  status?: "active" | "disabled";
};

function genToken(len = 32) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function clean(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: Request) {
  // ① WP→Next 認証
  const token = req.headers.get("x-sync-token");
  if (!token || token !== process.env.X_SYNC_TOKEN) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // ② payload
  const body = (await req.json()) as Partial<Payload>;
  const code = clean(body.code);
  const slug = clean(body.slug);
  const status: "active" | "disabled" =
    body.status === "disabled" ? "disabled" : "active";

  if (!code || !slug) {
    return NextResponse.json({ ok: false, error: "missing code/slug" }, { status: 400 });
  }

  // ③ edit_token を維持（無ければ初回だけ発行）
  const { data: existing, error: selErr } = await supabaseServer
    .from("profiles")
    .select("edit_token")
    .eq("code", code)
    .maybeSingle();

  if (selErr) {
    return NextResponse.json({ ok: false, error: selErr.message }, { status: 500 });
  }

  const edit_token = existing?.edit_token || genToken(32);

  // ④ 台帳列だけ upsert
  const { data, error } = await supabaseServer
    .from("profiles")
    .upsert(
      { code, slug, status, edit_token },
      { onConflict: "code" },
    )
    .select("code, slug, status, edit_token, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    synced_at: new Date().toISOString(),
    profile: data,
    edit_url: `/e/${data.edit_token}`,
  });
}
