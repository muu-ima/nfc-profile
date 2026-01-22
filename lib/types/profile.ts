export type SNS = Record<string, string>;

export type ProfilePayload = {
  slug: string;
  code: string;
  display_name?: string | null;
  bio?: string | null;
  icon_url?: string | null;
  sns?: SNS | null;
};
