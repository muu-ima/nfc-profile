// app/api/diag/profiles/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  // --- guard ---
  const want = process.env.DIAG_TOKEN;
  const got = req.headers.get("x-diag-token");
  if (want && got !== want) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // 1件だけ取って “返ってくるキー＝列” を観測する
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("*")
    .limit(1);

  if (error) {
    const res = NextResponse.json(
      {
        ok: false,
        error: error.message,
        hint: "profiles が存在しない/別DB参照/権限不足の可能性",
      },
      { status: 500 },
    );
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  const sample = data?.[0] ?? null;
  const columns = sample ? Object.keys(sample).sort() : [];

  const res = NextResponse.json({
    ok: true,
    now: new Date().toISOString(),
    row_count_sampled: data?.length ?? 0,
    columns_detected: columns,
    sample_row: sample, // 情報漏れが怖ければ、この行を消してOK
  });

  res.headers.set("Cache-Control", "no-store");
  return res;
}
