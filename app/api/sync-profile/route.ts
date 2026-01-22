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


export async function POST(req: Request) {
  // ① WP→Next の認証（超重要）
  const token = req.headers.get("x-sync-token");
  if (!token || token !== process.env.WP_SYNC_TOKEN) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Payload;

  // ② 最低限チェック
  if (!body.slug || !body.code) {
    return NextResponse.json({ ok: false, error: "missing slug/code" }, { status: 400 });
  }

  // ③ upsert
  const { error } = await supabaseServer
    .from("profiles")
    .upsert(
      {
        slug: body.slug,
        code: body.code,
        display_name: body.display_name ?? "",
        bio: body.bio ?? "",
        icon_url: body.icon_url ?? "",
        sns: body.sns ?? null,
      },
      { onConflict: "code" } // codeをユニークにしてる想定
    );

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
