import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

type CreatePayload = {
  code: string;
  display_name?: string | null;
  bio?: string | null;
  icon_url?: string | null;
  sns?: string | null; // text想定
};

function genToken() {
  return crypto.randomBytes(32).toString("base64url");
}
function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function POST(req: Request) {
  const token = req.headers.get("x-sync-token");
  if (!token || token !== process.env.X_SYNC_TOKEN) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body: CreatePayload | null = await req.json().catch(() => null);
  const code = body?.code?.trim();
  if (!code) {
    return NextResponse.json({ ok: false, error: "code required" }, { status: 400 });
  }

  const origin = new URL(req.url).origin;

  const editToken = genToken();
  const editTokenHash = sha256(editToken);

  // ✅ NOT NULL対策：create時は空で初期化
  const display_name = (body?.display_name ?? "").trim();
  const bio = (body?.bio ?? "").trim();
  const icon_url = (body?.icon_url ?? "").trim();
  const sns = (body?.sns ?? "").trim(); // ← sns も NOT NULLならここ

  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        code,
        slug: code,
        display_name,
        bio,
        icon_url,
        sns,
        edit_token_hash: editTokenHash,
      },
      { onConflict: "code" }
    )
    .select("code, slug")
    .single();

  if (error || !data) {
    console.error("SUPABASE_UPSERT_ERROR", error);
    return NextResponse.json(
      { ok: false, error: `supabase upsert failed: ${error?.message ?? "no data"}` },
      { status: 500 }
    );
  }

  const edit_url = `${origin}/edit/${encodeURIComponent(data.slug)}?t=${encodeURIComponent(editToken)}`;
  const public_url = `${origin}/p/${encodeURIComponent(data.slug)}`;

  return NextResponse.json({ ok: true, code: data.slug, edit_url, public_url }, { status: 200 });
}
