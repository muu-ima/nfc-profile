// app/api/diag/route.ts
import { NextResponse } from "next/server";

function mask(v?: string | null) {
  if (!v) return null;
  if (v.length <= 8) return "********";
  return v.slice(0, 4) + "…" + v.slice(-4);
}

export async function GET(req: Request) {
  // --- guard ---
  const want = process.env.DIAG_TOKEN;
  const got = req.headers.get("x-diag-token");
  if (want && got !== want) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;

  // 例: https://xxxx.supabase.co -> xxxx を抜き出して “どのプロジェクトか” を見える化
  const projectRef = (() => {
    try {
      if (!supabaseUrl) return null;
      const host = new URL(supabaseUrl).host; // xxxx.supabase.co
      return host.split(".")[0] ?? null;
    } catch {
      return null;
    }
  })();

  const res = NextResponse.json({
    ok: true,
    now: new Date().toISOString(),
    vercel_env: process.env.VERCEL_ENV ?? null,
    vercel_region: process.env.VERCEL_REGION ?? null,
    git_commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    supabase_url: supabaseUrl,
    supabase_project_ref: projectRef,
    // “鍵が入ってるか” だけ見えるように（中身はマスク）
    keys: {
      service_role: mask(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
  });

  // キャッシュ疑い潰し（毎回最新）
  res.headers.set("Cache-Control", "no-store");
  return res;
}
