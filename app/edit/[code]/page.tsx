// app/edit/[code]/page.tsx
import EditForm from "./EditForm";
import { supabaseServer } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ code: string }>; // ✅ Promise として受ける
};

export default async function EditPage({ params }: PageProps) {
  const { code } = await params; // ✅ ここが重要（unwrap）

  const { data: profile, error } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("code", code)
    .single();

  if (error || !profile) {
    return <div className="p-6">見つかりませんでした</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <EditForm code={code} initial={profile} />
    </div>
  );
}
