import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

type CreatePayload = {
  code: string; // 例: wa5y5cxcd5
  display_name?: string | null;
  bio?: string | null;
  icon_url?: string | null;
  sns?: string | null;
};

// tokenは「生は返す」「DBにはhashだけ保存」
function genToken() {
  return crypto.randomBytes(32).toString("base64url");
}
function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function POST(req: Request) {
  // ✅ WP認証（createは必須）
  const token = req.headers.get("x-sync-token");
  if (!token || token !== process.env.X_SYNC_TOKEN) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body: CreatePayload | null = await req.json().catch(() => null);
  const code = body?.code?.trim();
  if (!code) {
    return NextResponse.json({ ok: false, error: "code required" }, { status: 400 });
  }

  // ✅ そのリクエストが来たドメイン（本番/プレビュー/ローカルに追従）
  const origin = new URL(req.url).origin;

  // ✅ 編集token生成（安全）
  const editToken = genToken();
  const editTokenHash = sha256(editToken);

  // ✅ Supabase upsert（あなたのテーブル列に合わせる）
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        code,              // 一旦 code=wa5y... をそのまま入れる
        slug: code,        // URLも /p/{code} なので slug=code に寄せる
        display_name: body?.display_name ?? null,
        bio: body?.bio ?? null,
        icon_url: body?.icon_url ?? null,
        sns: body?.sns ?? null,
        edit_token_hash: editTokenHash,
      },
      { onConflict: "code" } // code が unique 前提
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

  // ✅ URL生成（生tokenをeditに含める）
  const edit_url = `${origin}/edit/${encodeURIComponent(data.slug)}?t=${encodeURIComponent(editToken)}`;
  const public_url = `${origin}/p/${encodeURIComponent(data.slug)}`;

  return NextResponse.json(
    { ok: true, code: data.slug, edit_url, public_url },
    { status: 200 }
  );
}
