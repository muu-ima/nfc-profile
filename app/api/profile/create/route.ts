import { NextResponse } from "next/server";

type CreatePayload = { code: string };

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

  // TODO: ここで supabase upsert / edit token 発行
  // 例: const editToken = await issueEditToken(code);
  const editToken = "YOUR_TOKEN"; // ←ここは必ず実装に置き換える

  const edit_url = `${origin}/edit/${encodeURIComponent(code)}?t=${encodeURIComponent(editToken)}`;
  const public_url = `${origin}/p/${encodeURIComponent(code)}`;

  return NextResponse.json(
    { ok: true, edit_url, public_url },
    { status: 200 }
  );
}
