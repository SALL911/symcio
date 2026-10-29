# symcio.tw 會員 × 社群 × 電子報自動化 — 上線手冊

## 一、WHY

註冊會員、電子報訂閱者、LINE 好友是 Symcio 的第一方受眾資產。三條入口的資料必須自動匯流到同一個 CRM（HubSpot），並同步到人類協作（Notion）與個人知識庫（Obsidian），每週以一封電子報維繫關係。

## 二、WHAT — 系統架構

```
            symcio.tw (Next.js / Vercel)
 ┌──────────────┬───────────────┬───────────────────┐
 │ /signup      │ /news 訂閱表單 │ LINE 官方帳號      │
 │ /login       │ 會員中心切換   │ /api/line/webhook  │
 └──────┬───────┴───────┬───────┴─────────┬─────────┘
        │ /auth/callback│ /api/newsletter │ follow / message
        ▼               ▼                 ▼
   Supabase: members · newsletter_subscribers · line_followers · member_sync_log
        │
        ├─ lib/sync/hubspot.ts   → HubSpot contacts（CRM SSoT，email 為唯一鍵）
        ├─ lib/sync/notion.ts    → Notion「Symcio 會員名單」資料庫
        └─ lib/sync/obsidian.ts  → private vault repo → Obsidian Git 外掛 pull

 Vercel Cron
   週二 01:00 UTC  /api/cron/weekly-newsletter  寄確認邀請（pending）+ 本週電子報（active）
   每日 18:17 UTC  /api/cron/member-sync        crm_synced_at 為空的會員補同步
```

| 元件 | 檔案 |
|------|------|
| 社群連結 SSoT | `lib/social.ts`（Footer、Organization schema `sameAs`、LINE 浮動按鈕、電子報頁尾） |
| 登入 / 註冊 / 忘記密碼 | `app/(auth)/*`、`components/auth/*`、`app/auth/callback`、`middleware.ts` |
| 會員中心 | `app/member/page.tsx`（帳號、額度、週報訂閱開關、社群） |
| 電子報 | `lib/newsletter/*`、`app/api/cron/weekly-newsletter`、`app/newsletter/{confirm,unsubscribe}` |
| 聯絡人匯入 | `scripts/import-contacts.mjs` |
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
3. 本機執行一次 `HUBSPOT_PRIVATE_APP_TOKEN=... node scripts/hubspot-setup-properties.mjs` 建立 `symcio_signup_source`、`symcio_member_plan`、`symcio_newsletter_opt_in`（未建立時同步會自動退回只寫標準欄位）

### 5. Notion
- 資料庫已建立：**Symcio OS → Symcio 會員名單（symcio.tw 自動同步）**
  `NOTION_MEMBERS_DB_ID=d65cb56c6ea341ae8f424b2d6b95a9c2`
- [notion.so/my-integrations](https://www.notion.so/my-integrations) 建立 internal integration → `NOTION_API_KEY`（可沿用既有 `secrets.NOTION_API_KEY`）
- 開啟資料庫 → `⋯` → Connections → 加入該 integration（未加入會回 404）
- 欄位名稱（Name / Email / Company / Source / Plan / Newsletter / Signed Up / Supabase ID）不可改名

### 6. Obsidian
1. GitHub 建立 **private** repo，例 `sall911/obsidian-vault`（筆記含個資，不可公開）
2. Fine-grained PAT：只授權該 repo，Contents: Read and write → `OBSIDIAN_VAULT_TOKEN`；`OBSIDIAN_VAULT_REPO=sall911/obsidian-vault`
3. 本機 Obsidian：把 vault 資料夾 clone 自該 repo → 安裝社群外掛 **Obsidian Git** → 設定 Auto pull interval 10 分鐘
4. 每位會員一則 `Symcio/Members/<email>.md`（YAML frontmatter + 互動紀錄區）；建立後不再覆寫，可自由手寫

### 7. 電子報（Resend）
1. Resend → Domains → 加 `symcio.tw`，在 Cloudflare 加 SPF / DKIM / DMARC 記錄，狀態 Verified 後才寄
2. 環境變數：`RESEND_API_KEY`、`NEWSLETTER_FROM`、`NEWSLETTER_SECRET`（`openssl rand -base64 32`）、`CRON_SECRET`
3. 內容來源（`lib/newsletter/compose.ts`）：
   - 優先：`lib/news-data.ts` 14 天內新增、未寄過的一期（人工審稿版）
   - 其次：Supabase `news_items` 近 7 天自動抓取條目拼接
   - 兩者皆無 → 當週跳過（回 `skipped: no-new-issue`）
4. 寄送前預覽：
   `curl -H "Authorization: Bearer $CRON_SECRET" "https://symcio.tw/api/cron/weekly-newsletter?preview=1" > preview.html`
   只看人數：`?dry_run=1`

### 8. 匯入既有聯絡人
```bash
# Google 聯絡人：contacts.google.com → 匯出 → Google CSV
node scripts/import-contacts.mjs --csv ~/Downloads/contacts.csv --dry-run
node scripts/import-contacts.mjs --csv ~/Downloads/contacts.csv
# HubSpot 既有 contacts（自動排除已退訂 hs_email_optout）
node scripts/import-contacts.mjs --hubspot
```
Gmail 往來對象：HubSpot → Settings → Inbox → 連接 Gmail 並開啟「Log and track」，聯絡人自動進 HubSpot，再用 `--hubspot` 匯入。

匯入者為 `pending`，下一次週報 cron 會寄**一次**確認邀請（每次上限 `NEWSLETTER_INVITE_CAP`）。點確認才轉 `active`；未點者不再寄任何信。

### 9. Vercel 環境變數
完整清單見 `.env.example`。`NEXT_PUBLIC_*` 於 build 時寫入，修改後必須重新部署。

## 四、風險與限制

| 風險 | 處置 |
|------|------|
| 個資法 §19/§20：未經同意寄行銷信 | 匯入一律 pending + double opt-in；每封信有一鍵退訂（頁面 + RFC 8058 header）；`consent_at / consent_source` 保存同意證據 |
| 一次寄大量信給冷名單 → 寄件網域被判垃圾信 | 邀請每週上限 200 封；先完成 SPF/DKIM/DMARC；Resend 後台觀察 bounce / complaint 率，> 0.3% 先停 |
| 郵件安全掃描器預先開啟退訂連結（GET）造成誤退訂 | 已知取捨，與 SMS 退訂相同；誤退訂者可在網站重新訂閱 |
| Obsidian vault repo 存個資 | 必須 private；PAT 只授權單一 repo；離職 / 外洩時撤銷 PAT |
| 外部 API 故障 | 三個同步目標各自降級，不阻斷登入；`member_sync_log` 記錄、每日 cron 補同步 |
| 會員可透過 anon key 自改 `plan` | migration 已改為欄位層級授權，只能改個人資料欄位 |
| Vercel Hobby 方案 cron 限制 | 目前 2 支、皆為每日以下頻率，符合 Hobby 限制 |

尚未涵蓋：Resend bounce / complaint webhook → `status=bounced`（下一步）、LINE Login 綁定會員（`line_followers.member_id` 已預留）、LINE 圖文選單（需在 OA Manager 上傳圖片設定）。
