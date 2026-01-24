import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  const { data, error } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return notFound();

  return (
    <main style={{ padding: 24 }}>
      <h1>{data.display_name ?? data.slug}</h1>

      <p>{data.bio ?? "(no bio)"}</p>

      <pre>{JSON.stringify(data.sns, null, 2)}</pre>
    </main>
  );
}
