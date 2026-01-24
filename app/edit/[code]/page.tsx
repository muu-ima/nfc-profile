import { supabaseServer } from "@/lib/supabase/server";
import EditForm from "./EditForm";

export default async function EditPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const { data: profile, error } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("code", code)
    .single();

  if (error || !profile) {
    return <div className="p-6">not_found</div>;
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">編集: {code}</h1>
      <EditForm code={code} initial={profile} />
    </main>
  );
}
