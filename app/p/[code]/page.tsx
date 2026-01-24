// app/p/[code]/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function PublicProfilePage({
  params,
}: {
  params: { code: string };
}) {
  const code = params.code;

  const { data: profile, error } = await supabaseServer
    .from("profiles")
    .select("code, slug, display_name, bio") // 必要分だけ
    .eq("code", code)
    .single();

  if (error || !profile) {
    return <div className="p-6">見つかりませんでした</div>;
  }

  // ✅ slug があれば公開URLへ誘導（入口の役割）
  if (profile.slug && profile.slug.trim() !== "") {
    redirect(`/u/${profile.slug}`);
  }

  // slug未設定の暫定表示（スモールステップ）
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">{profile.display_name ?? "No name"}</h1>
      <p className="mt-2 whitespace-pre-wrap">{profile.bio ?? ""}</p>
      <p className="mt-6 text-xs text-zinc-500">
        ※ まだURLスラッグが設定されていません
      </p>
    </main>
  );
}
