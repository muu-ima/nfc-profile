// app/api/profile/[code]/route.ts
import { NextResponse } from "next/server";
import { getProfileByCode, updateProfileByCode } from "@/lib/profile/profileRepo";
import type { ProfilePatch } from "@/shared/profile/types";

function isEditAuthorized(req: Request) {
  // ✅ 器：とりあえず token が一致したらOK（後でDBのedit_token照合に進化させる）
  const token = req.headers.get("x-edit-token") ?? "";
  const expected = process.env.X_EDIT_TOKEN ?? ""; // ← まずは固定トークンでもOK（器）
  if (!expected) return false;
  return token === expected;
}

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const profile = await getProfileByCode(code);

  if (!profile) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, profile });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;

  if (!isEditAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const patch = (await req.json()) as ProfilePatch;
  const updated = await updateProfileByCode(code, patch);

  if (!updated) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, profile: updated });
}
