// lib/profile/types.ts
export type Profile = {
  code: string;
  display_name: string | null;
  bio: string | null;
  icon_url: string | null;
  website_url: string | null;
  // 必要なカラムを追加
  updated_at?: string | null;
};

export type ProfileUpdateInput = {
  display_name?: string | null;
  bio?: string | null;
  icon_url?: string | null;
  website_url?: string | null;
  // 更新可能なものだけ
};
