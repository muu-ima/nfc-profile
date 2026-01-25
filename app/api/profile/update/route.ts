// app/api/profile/update/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServer } from "@/lib/supabase/server";
import type { ProfileUpdateInput } from "@/lib/profile/types";

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function POST(req: Request) {
  // 🔎 リクエスト可視化（必要なら残す）
  const rawBody = await req.clone().text();
  console.log("🔥 [UPDATE] BODY =", rawBody);

  try {
    const body = (await req.json()) as {
      code?: string;
      token?: string;
      patch?: ProfileUpdateInput;
    };

    const code = body.code?.trim();
    const token = body.token?.trim();
    const patch = body.patch ?? null;

    console.log("========== [UPDATE API START] ==========");
    console.log("[req] code =", code);
    console.log("[req] token(head) =", token?.slice(0, 6), "len =", token?.length);

    if (!code) return NextResponse.json({ error: "missing code" }, { status: 400 });
    if (!token) return NextResponse.json({ error: "missing token" }, { status: 401 });
    if (!patch || typeof patch !== "object") {
      return NextResponse.json({ error: "missing patch" }, { status: 400 });
    }

    // ✅ ここが重要：hash を読む
    const { data: cur, error: readErr } = await supabaseServer
      .from("profiles")
      .select("edit_token_hash")
      .eq("code", code)
      .maybeSingle();

    if (readErr) {
      console.log("[error] readErr =", readErr.message);
      return NextResponse.json({ error: readErr.message }, { status: 500 });
    }
    if (!cur) return NextResponse.json({ error: "not found" }, { status: 404 });

    const reqHash = sha256(token);
    const dbHash = cur.edit_token_hash ?? "";

    console.log("[db] edit_token_hash(head) =", dbHash.slice(0, 8), "len =", dbHash.length);
    console.log("[compare] sha256(token) === edit_token_hash ?", reqHash === dbHash);

    if (!dbHash || reqHash !== dbHash) {
      return NextResponse.json(
        {
          error: "invalid token",
          debug: {
            code,
            token_head: token.slice(0, 6),
            token_len: token.length,
            req_hash_head: reqHash.slice(0, 8),
            db_hash_head: dbHash.slice(0, 8),
            match: reqHash === dbHash,
          },
        },
        { status: 403 },
      );
    }

    // ② update
    const { data: updated, error: updErr } = await supabaseServer
      .from("profiles")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("code", code)
      .select("*")
      .single();

    if (updErr) {
      console.log("[error] update failed =", updErr.message);
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    console.log("✅ UPDATE SUCCESS");
    console.log("========== [UPDATE API END] ==========");

    return NextResponse.json({ profile: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    console.log("[FATAL]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
