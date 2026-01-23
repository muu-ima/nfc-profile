// app/edit/[code]/EditForm.tsx
"use client";

import { useMemo, useState } from "react";
import type { Profile, ProfileUpdateInput } from "@/lib/profile/types";

type Props = {
  code: string;
  initial: Profile;
};

export default function EditForm({ code, initial }: Props) {
  const [form, setForm] = useState<ProfileUpdateInput>(() => ({
    display_name: initial.display_name ?? "",
    bio: initial.bio ?? "",
    icon_url: initial.icon_url ?? "",
    website_url: initial.website_url ?? "",
  }));

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => {
    // 最低限：表示名が空ならNGなど（要件で調整）
    return true;
  }, []);

  const onChange =
    (key: keyof ProfileUpdateInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          patch: {
            // 空文字をnullに寄せる（DBをnull管理したい場合）
            display_name: form.display_name === "" ? null : form.display_name,
            bio: form.bio === "" ? null : form.bio,
            icon_url: form.icon_url === "" ? "" : form.icon_url,
          },
        }),
      });

      const json: { error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(json?.error ?? "Save failed");
      }

      setMessage("保存しました");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "保存に失敗しました";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">表示名</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={form.display_name ?? ""}
          onChange={onChange("display_name")}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">自己紹介</label>
        <textarea
          className="w-full rounded-lg border px-3 py-2 min-h-30"
          value={form.bio ?? ""}
          onChange={onChange("bio")}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">アバターURL</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={form.icon_url ?? ""}
          onChange={onChange("icon_url")}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Webサイト</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={form.website_url ?? ""}
          onChange={onChange("website_url")}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!canSave || saving}
          onClick={onSave}
          className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
