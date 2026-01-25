import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = (raw ?? "").trim();
  if (!slug) return notFound();

  const { data, error } = await supabaseServer
    .from("profiles")
    .select("slug, display_name, bio, icon_url, website_url, status")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return notFound();
  if (data.status === "disabled") {
    return <div className="p-6">無効化されています</div>;
  }

  const name = (data.display_name ?? "").trim() || data.slug;
  const bio = (data.bio ?? "").trim();
  const icon = (data.icon_url ?? "").trim();
  const website = (data.website_url ?? "").trim();

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-md">
          {/* header */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-zinc-100 flex items-center justify-center">
              {icon ? (
                <Image
                  src={icon}
                  alt=""
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-zinc-400">No Icon</span>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-zinc-900">
                {name}
              </h1>
              <p className="mt-1 text-xs text-zinc-500">@{data.slug}</p>
            </div>
          </div>

          {/* bio */}
          <div className="mt-5">
            {bio ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {bio}
              </p>
            ) : (
              <p className="text-sm text-zinc-400">（自己紹介は未設定）</p>
            )}
          </div>

          {/* website */}
          <div className="mt-6">
            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border px-4 py-3 text-sm hover:bg-zinc-50"
              >
                🌐 Webサイト
                <div className="mt-1 break-all text-xs text-zinc-500">
                  {website}
                </div>
              </a>
            ) : (
              <div className="rounded-xl border bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                Webサイトは未設定
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">NFC Profile</p>
      </div>
    </main>
  );
}
