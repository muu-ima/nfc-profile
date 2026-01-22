import { notFound } from "next/navigation";
import { getProfileByCode } from "@/lib/profileRepo";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function Page({ params }: Props) {
  const { code } = await params;        // ← これが必須
  const p = await getProfileByCode(code);
  if (!p) return notFound();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex items-center gap-4">
          {p.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.icon_url}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-zinc-200" />
          )}
          <div>
            <h1 className="text-lg font-bold">{p.display_name || "No Name"}</h1>
            <div className="text-xs text-zinc-500">pastel-link</div>
          </div>
        </div>

        {p.bio ? (
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-zinc-800">
            {p.bio}
          </p>
        ) : null}
      </div>
    </main>
  );
}
