// app/api/sync-profile/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const url = new URL(req.url);
  url.pathname = "/api/sync";
  return NextResponse.redirect(url, 308); // method/body維持
}
