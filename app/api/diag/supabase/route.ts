// app/api/diag/supabase/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    has_SUPABASE_URL: !!process.env.SUPABASE_URL,
    supabase_url: process.env.SUPABASE_URL?.slice(0, 40) + "...",
    has_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_X_SYNC: !!process.env.X_SYNC_TOKEN,
  });
}
