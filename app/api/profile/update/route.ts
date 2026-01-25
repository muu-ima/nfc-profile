// app/api/profile/update/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import type { ProfileUpdateInput } from "@/lib/profile/types";

export async function POST(req: Request) {
  console.log("🔥 [UPDATE] BODY =", await req.clone().text());
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
    console.log(
      "[req] token(head) =",
      token?.slice(0, 6),
      "len =",
      token?.length,
    );

    if (!code) {
      console.log("[error] missing code");
      return NextResponse.json({ error: "missing code" }, { status: 400 });
    }
    if (!token) {
      console.log("[error] missing token");
      return NextResponse.json({ error: "missing token" }, { status: 401 });
    }
    if (!patch || typeof patch !== "object") {
      console.log("[error] missing patch");
      return NextResponse.json({ error: "missing patch" }, { status: 400 });
    }

    // ① DB読取
    const { data: cur, error: readErr } = await supabaseServer
      .from("profiles")
      .select("edit_token")
      .eq("code", code)
      .maybeSingle();

    if (readErr) {
      console.log("[error] readErr =", readErr.message);
      return NextResponse.json({ error: readErr.message }, { status: 500 });
    }

    console.log("[db] row exists =", !!cur);

    if (!cur) {
      console.log("[error] profile not found");
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    console.log(
      "[db] edit_token(head) =",
      cur.edit_token?.slice(0, 6),
      "len =",
      cur.edit_token?.length,
    );

    console.log("[compare] token === edit_token ?", token === cur.edit_token);

    // if (cur.edit_token !== token) {
    //   console.log("❌ TOKEN MISMATCH → invalid token");
    //   return NextResponse.json({ error: "invalid token" }, { status: 403 });
    // }
    if (cur.edit_token !== token) {
      return NextResponse.json(
        {
          error: "invalid token",
          debug: {
            code,
            token_head: token.slice(0, 6),
            token_len: token.length,
            db_head: (cur.edit_token ?? "").slice(0, 6),
            db_len: (cur.edit_token ?? "").length,
            match: cur.edit_token === token,
          },
        },
        { status: 403 },
      );
    }

    console.log("✅ TOKEN MATCH → updating...");

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
