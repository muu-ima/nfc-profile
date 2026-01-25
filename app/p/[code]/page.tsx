// app/p/[code]/page.tsx
export const revalidate = 0;

export default async function PublicProfilePage({
  params,
}: {
  params: { code: string };
}) {
  const code = params.code;

  return <pre className="p-6">{JSON.stringify({ params, code }, null, 2)}</pre>;
}

// const { data: profile, error } = await supabaseServer
//   .from("profiles")
//   .select("code, slug, display_name, bio, status")
//   .eq("code", code)
//   .maybeSingle();

// if (error) {
//   return (
//     <div className="p-6">
//       <div className="font-bold">エラー</div>
//       <pre className="mt-2 text-xs whitespace-pre-wrap">{error.message}</pre>
//     </div>
//   );
// }

// if (!profile) {
//   return <div className="p-6">見つかりませんでした（code={code}）</div>;
// }

// if (profile.status === "disabled") {
//   return <div className="p-6">無効化されています</div>;
// }

// if (profile.slug && profile.slug.trim() !== "") {
//   redirect(`/u/${profile.slug}`);
// }

// return (
//   <main className="p-6">
//     <h1 className="text-2xl font-bold">
//       {profile.display_name ?? "No name"}
//     </h1>
//     <p className="mt-2 whitespace-pre-wrap">{profile.bio ?? ""}</p>
//   </main>
// );
