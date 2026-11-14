# symcio.tw 會員 × LINE × CRM 同步 — 上線手冊

## 一、WHY

註冊會員與 LINE 好友是 Symcio 的第一方受眾資產。會員資料自動同步到 HubSpot、Notion（人類協作）與 Obsidian（個人知識庫）；Attio 由 BrandOS-Infrastructure `crm-sync.yml` 每日從 Supabase 同步。

電子報不在本範圍：訂閱入口是 `/subscribe`（HubSpot 表單），寄送由 `newsletter-automation/`（PR #24，GitHub Actions + Resend）負責。網站內不另設寄信 cron，避免重複寄送。

## 二、WHAT — 系統架構

```
            symcio.tw (Next.js / Vercel)
 ┌──────────────┬───────────────┬───────────────────┐
 │ /signup /login /member       │ LINE 官方帳號      │
 └──────────────┬───────────────┴─────────┬─────────┘
                │ /auth/callback          │ /api/line/webhook（follow / message）
                ▼                         ▼
   Supabase: members · line_followers · member_sync_log
        │
        ├─ lib/sync/hubspot.ts   → HubSpot contacts（CRM SSoT，email 為唯一鍵）
        ├─ lib/sync/notion.ts    → Notion「Symcio 會員名單」資料庫
        └─ lib/sync/obsidian.ts  → private vault repo → Obsidian Git 外掛 pull

 Vercel Cron
   每日 18:17 UTC  /api/cron/member-sync        crm_synced_at 為空的會員補同步
```

| 元件 | 檔案 |
|------|------|
| 社群連結 SSoT | `lib/social.ts`（Footer、Organization schema `sameAs`、LINE 浮動按鈕） |
| 登入 / 註冊 / 忘記密碼 | `app/(auth)/*`、`components/auth/*`、`app/auth/callback`、`middleware.ts` |
| 會員中心 | `app/member/page.tsx`（帳號、額度、雙週刊訂閱連結、社群） |
| LINE bot | `lib/line/*`、`app/api/line/webhook` |
| Schema | `BrandOS-Infrastructure/supabase/migrations/20261029000000_member_sync_newsletter_line.sql` |

## 三、HOW — 上線步驟（依序）

### 1. 資料庫
BrandOS-Infrastructure 的 migration PR 合併後由 `supabase-deploy.yml` 套用。確認 `members.crm_synced_at`、`line_followers`、`member_sync_log` 存在。

### 2. Supabase Auth
- Authentication → URL Configuration：Site URL `https://symcio.tw`；Redirect URLs 加 `https://symcio.tw/auth/callback`、`https://*.vercel.app/auth/callback`
- Providers → Google：填 Google Cloud OAuth Client ID / Secret（授權重新導向 URI 用 Supabase 提供的 callback）
- Email：保持「Confirm email」開啟（確認信連結會走 `/auth/callback`，觸發同步）
- SMTP：改用 Resend SMTP（`smtp.resend.com`），否則 Supabase 內建寄信每小時有限額

### 3. LINE 官方帳號
1. [LINE Official Account Manager](https://manager.line.biz/) 建立帳號「Symcio」（需 LINE 個人帳號登入，此步驟無法自動化）
2. 設定 → Messaging API → 啟用，選擇（或建立）Provider「Symcio」
3. [LINE Developers Console](https://developers.line.biz/) → 該 channel：
   - 取得 Channel secret → `LINE_CHANNEL_SECRET`
   - Messaging API → Issue long-lived channel access token → `LINE_CHANNEL_ACCESS_TOKEN`
   - Webhook URL：`https://symcio.tw/api/line/webhook` → Verify → 開啟 Use webhook
4. OA Manager → 回應設定：關閉「自動回應訊息」、開啟「Webhook」（否則與 bot 重複回覆）；聊天可保留開啟，供真人接手
5. 基本 ID（例 `@123abcde`）→ `NEXT_PUBLIC_LINE_OA_ID`；設定後重新部署，網站右下角出現「LINE 諮詢」
6. 輸入「真人」等關鍵字的用戶會被標 `line_followers.needs_human = true`；在 Supabase 以此欄位追蹤待回覆名單

自動回覆文案集中在 `lib/line/replies.ts`。

### 4. HubSpot
1. Settings → Integrations → Private Apps → Create：scopes `crm.objects.contacts.read`、`crm.objects.contacts.write`、`crm.schemas.contacts.write`
2. Token → `HUBSPOT_PRIVATE_APP_TOKEN`
3. 本機執行一次 `HUBSPOT_PRIVATE_APP_TOKEN=... node scripts/hubspot-setup-properties.mjs` 建立 `symcio_signup_source`、`symcio_member_plan`（未建立時同步會自動退回只寫標準欄位）

### 5. Notion
- 資料庫已建立：**Symcio OS → Symcio 會員名單（symcio.tw 自動同步）**
  `NOTION_MEMBERS_DB_ID=d65cb56c6ea341ae8f424b2d6b95a9c2`
- [notion.so/my-integrations](https://www.notion.so/my-integrations) 建立 internal integration → `NOTION_API_KEY`（可沿用既有 `secrets.NOTION_API_KEY`）
- 開啟資料庫 → `⋯` → Connections → 加入該 integration（未加入會回 404）
- 欄位名稱（Name / Email / Company / Source / Plan / Signed Up / Supabase ID）不可改名

### 6. Obsidian
1. GitHub 建立 **private** repo，例 `sall911/obsidian-vault`（筆記含個資，不可公開）
2. Fine-grained PAT：只授權該 repo，Contents: Read and write → `OBSIDIAN_VAULT_TOKEN`；`OBSIDIAN_VAULT_REPO=sall911/obsidian-vault`
3. 本機 Obsidian：把 vault 資料夾 clone 自該 repo → 安裝社群外掛 **Obsidian Git** → 設定 Auto pull interval 10 分鐘
4. 每位會員一則 `Symcio/Members/<email>.md`（YAML frontmatter + 互動紀錄區）；建立後不再覆寫，可自由手寫

### 7. 電子報
不在網站內處理。見 `newsletter-automation/README.md`（PR #24）。
個人聯絡人（手機 / Gmail 通訊錄）不匯入電子報名單；需要時只放 Attio 並標「個人聯絡人」。

### 8. LINE 主選單與 Flex 卡片
選單圖與部署腳本在 BrandOS-Infrastructure：`integrations/line/richmenu.json`、`.github/workflows/line-richmenu.yml`（先 dry-run validate）。選單「找真人顧問」送出「真人」，由本 webhook 標記 `needs_human`。

### 9. Vercel 環境變數
完整清單見 `.env.example`。`NEXT_PUBLIC_*` 於 build 時寫入，修改後必須重新部署。

## 四、風險與限制

| 風險 | 處置 |
|------|------|
| Obsidian vault repo 存個資 | 必須 private；PAT 只授權單一 repo；離職 / 外洩時撤銷 PAT |
| 外部 API 故障 | 三個同步目標各自降級，不阻斷登入；`member_sync_log` 記錄、每日 cron 補同步 |
| 會員可透過 anon key 自改 `plan` | migration 已改為欄位層級授權，只能改個人資料欄位 |
| Vercel Hobby 方案 cron 限制 | 目前 1 支（每日），符合 Hobby 限制 |

尚未涵蓋：LINE Login 綁定會員（`line_followers.member_id` 已預留；綁定後才能推 Flex 健檢卡）。
