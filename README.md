# NFC Profile Sync Architecture

このプロジェクトは  
**WordPress = 管理台帳 / Next.js = API・UI / Supabase = データの真実（Source of Truth）**
という責務分離で構成されている。

---

## 🎯 設計方針（最重要ルール）

### 1. code は唯一の真実（不変ID）
- NFC/QRに焼かれる永久ID
- 変更不可
- Supabaseの Primary Key
- すべての同期は code 基準

### 2. slug は表示用（可変ID）
- 人間向けURL
- いつでも変更OK
- SEO/見た目用
- データの識別には使わない

### 3. WordPress は「台帳」だけ
- カード発行管理
- redirect/status 管理
- プロフィールデータは持たない（将来削除予定）

### 4. Supabase がプロフィールの唯一の保存先
- display_name / bio / icon / sns など
- 公開ページは必ず Supabase を参照

### 5. Next.js が境界レイヤー
- WP → Supabase 同期
- 編集UI提供
- edit_token発行
- メール送信

---

# 🧩 全体構成

WordPress（台帳）
↓
Next.js API（同期/編集/メール）
↓
Supabase（真実DB）


---

# 🚀 フロー

## ① カード発行（管理者）

WordPress
→ nfc_redirect を publish
→ save_post 発火
→ Next `/api/sync`
→ Supabase upsert(code)
→ edit_token 発行
→ WP に返却

WP publish
↓
Next API
↓
Supabase(code作成 + token発行)


---

## ② お客さんへ通知

サーバーから自動送信（no-reply）

送る内容：

- 公開URL
  https://domain/p/{code}

- 編集URL
  https://domain/e/{token}

---

## ③ お客さん編集

/e/{token}
↓
Next（token検証）
↓
Supabase 更新
↓
プロフィール反映


※ WordPress は関与しない

---

# 🗄 Supabase テーブル（最小構成）

## profiles

| column | type | note |
|-------|------|-------|
| code | text PK | 不変ID |
| slug | text | 可変URL |
| display_name | text | |
| bio | text | |
| icon_url | text | |
| website_url | text nullable | 任意 |
| sns | text or jsonb | 任意 |
| edit_token | text | 編集認証 |
| edit_token_updated_at | timestamptz | |
| updated_at | timestamptz | |

---

# ✉ メール方針

- no-reply アドレス使用
- 自動送信のみ
- 編集URLは秘密情報（共有禁止）
- SMTP はロリポップ（将来 Resend/SendGrid へ移行可能）

---

# ✅ 原則まとめ

- code が絶対
- slug は飾り
- WPは発行のみ
- Supabaseが真実
- Nextが橋渡し
- メールは自動通知

この責務分離を崩さないこと
