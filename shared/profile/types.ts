// shared/profile/types.ts
export type SNS = Record<string, string>;

export type Profile = {
  code: string;
  slug: string;
  display_name: string;
  bio: string;
  icon_url: string;
  sns: SNS | null;
  updated_at?: string;
};

export type ProfilePatch = Partial<Pick<
  Profile,
  "display_name" | "bio" | "icon_url" | "sns" | "slug"
>>;
