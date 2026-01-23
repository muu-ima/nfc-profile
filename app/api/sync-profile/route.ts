// app/api/sync-profile/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

type SNS = Record<string, string>;

type Payload = {
  slug: string;
  code: string;
  display_name?: string | null;
  bio?: string | null;
  icon_url?: string | null;
  sns?: SNS | null;
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

export async function POST(req: Request) {
  // ① WP→Next 認証
  const token = req.headers.get("x-sync-token");
  if (!token || token !== process.env.X_SYNC_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  // ② payload
  const body = (await req.json()) as Payload;

  if (!body.slug || !body.code) {
    return NextResponse.json(
      { ok: false, error: "missing slug/code" },
      { status: 400 },
    );
  }

  // ③ edit_token を毎回発行（= 再発行したら古いの無効）
  const edit_token = genToken(32);

  const { data, error } = await supabaseServer
    .from("profiles")
    .upsert(
      {
        slug: body.slug,
        code: body.code,
        display_name: body.display_name ?? "",
        bio: body.bio ?? "",
        icon_url: body.icon_url ?? "",
        website_url: null, // 列があるなら適宜（なければ削除）
        sns: body.sns ?? null,
        edit_token,
        edit_token_updated_at: new Date().toISOString(),
      },
      { onConflict: "code" },
    )
    .select("code, edit_token")
    .single();

  console.log("sync-profile called");
  console.log("[sync] body", body);
  console.log("[sync] upsert result", { data, error });

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? "db error" },
      { status: 500 },
    );
  }

  // ✅ WPが編集URLを作れるように返す
  return NextResponse.json({
    ok: true,
    code: data.code,
    edit_token: data.edit_token,
  });
}
