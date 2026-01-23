// app/p/[code]/page.tsx
import { supabaseServer } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function PublicProfilePage({ params }: PageProps) {
  const { code } = await params;

  const { data: profile, error } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("code", code)
    .single();

  if (error || !profile) {
    return <div className="p-6">見つかりませんでした</div>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">{profile.display_name ?? "No name"}</h1>
      <p className="mt-2 whitespace-pre-wrap">{profile.bio ?? ""}</p>
    </main>
  );
}
