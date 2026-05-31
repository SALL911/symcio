# 用 API 從 @symcio.tw 寄信（並讓寄件備份在所有裝置同步）

## 0. 先看診斷：你「寄件夾永遠不一樣」的真正原因

實測比對了實際在用的兩個帳號的寄件備份，發現**你是在兩個互不相通的信箱之間寄信**：

| 你以為 | 實際上（信件 header 證實） |
| --- | --- |
| `info@symcio.tw` 在 Google Workspace | ❌ `info@symcio.tw` 的信都帶 `*.PROD.OUTLOOK.COM` message-id → 其實跑在 **Microsoft 365 / Outlook（Exchange Online）** |
| 我都用 @symcio.tw 寄信 | ❌ 有一批信是從 **`cchuan911@gmail.com`（個人 Gmail）** 寄的，只是**簽名檔**寫成 @symcio.tw |

```
info@symcio.tw      →  Microsoft 365 (Outlook)  →  存進 Outlook「寄件備份」
cchuan911@gmail.com  →  個人 Gmail               →  存進 Gmail「寄件備份」
```

這是**兩個不同公司、不同伺服器的帳號**，沒有任何 IMAP 設定能合併。要根治，方向是：**把對外寄信統一走「真正擁有該信箱的供應商 API」**，讓副本一定進到該信箱伺服器端的 Sent，所有裝置才會一致。

> ⚠️ 另一個風險：用個人 Gmail 假冒 @symcio.tw 簽名寄商業信，對方看到的寄件人其實是 `cchuan911@gmail.com`，不專業也易被當垃圾信。建議停用這個習慣，統一從 @symcio.tw 寄。

---

## 1. 這套東西做了什麼

部署後會有一個 HTTPS 端點 `POST /api/send-email`，任何工具（ChatGPT 自訂 GPT Actions、Manus、Make / Zapier / n8n、`curl`）都能呼叫它，用 @symcio.tw 寄信，並把副本存進該信箱的 Sent。

```
AI 工具 / 自動化 ──HTTPS──▶  /api/send-email  ──▶  lib/email/send.ts ──┬─▶ graph.ts ─▶ Microsoft 365 (Outlook Sent)
   (帶 x-api-key)              (驗證 + 防冒名)      (選供應商)          └─▶ gmail.ts ─▶ Google Workspace (Gmail Sent)
```

- `lib/email/graph.ts`：Microsoft Graph `sendMail`（@symcio.tw 推薦，因為它在 M365）。
- `lib/email/gmail.ts`：Gmail API（若你也有 Google Workspace 信箱要寄）。
- `lib/email/send.ts`：依設定/`provider` 欄位自動選供應商。
- `app/api/send-email/route.ts`：對外端點，需 `x-api-key` 且 `from` 在白名單內。
- `public/openapi/send-email.json`：OpenAPI 3.1，給 AI 工具匯入。

> 各家 AI（ChatGPT / Claude / Perplexity / Gemini / Grok / Meta AI / Manus）是獨立產品，**沒有「一鍵同步全部」**。能做的是建**這一個共用寄信入口**，再分別接到各家支援外部 Action 的 AI。

---

## 2.（@symcio.tw 推薦）Microsoft 365 / Outlook — Microsoft Graph

因為 `info@symcio.tw` 在 Microsoft 365，用 Graph 寄信會自動存進 **Outlook 寄件備份**，你手機/桌機 Outlook 立即同步。

1. **註冊 Azure AD 應用程式**
   - 進 [Azure Portal](https://portal.azure.com/) → Microsoft Entra ID → App registrations → New registration。
   - 記下 **Application (client) ID** 與 **Directory (tenant) ID**。
2. **加應用程式權限**
   - API permissions → Add a permission → Microsoft Graph → **Application permissions** → `Mail.Send`。
   - 按 **Grant admin consent**（需管理員）。
3. **建立用戶端密碼**
   - Certificates & secrets → New client secret → 複製 Value。
4. **（建議）限縮可寄信箱**
   - 預設 app-only `Mail.Send` 可寄整個租戶任何信箱。可用 Exchange 的 `New-ApplicationAccessPolicy` 限制只能寄 `info@symcio.tw`、`sall@symcio.tw`。
5. **設定環境變數**（Vercel → Settings → Environment Variables）
   - `GRAPH_TENANT_ID`、`GRAPH_CLIENT_ID`、`GRAPH_CLIENT_SECRET`
   - `SEND_EMAIL_API_KEY`（自訂隨機字串）、`SEND_EMAIL_ALLOWED_SENDERS=info@symcio.tw,sall@symcio.tw`

> 注意：`sall@symcio.tw` 要能寄，它必須是 M365 裡真實存在的信箱或別名。若 `sall@` 其實在 Google，那一個要走下面第 3 節。

---

## 3.（選用）Google Workspace / Gmail — Gmail API

若你有 @symcio.tw 信箱確實在 Google Workspace（或想從某個 Gmail 寄），用這個。

- **方式一【推薦】Service Account + 網域委派**
  1. [Google Cloud Console](https://console.cloud.google.com/) 建專案 → 啟用 **Gmail API** → 建 Service Account → 下載 **JSON 金鑰**。
  2. 記下 Service Account 的 **Client ID**，到 [admin.google.com](https://admin.google.com/) → 安全性 → API 控管 → **網域委派**新增，scope：`https://www.googleapis.com/auth/gmail.send`。
  3. 設 `GMAIL_SERVICE_ACCOUNT_JSON`（整段 JSON 壓一行）。
- **方式二【備用】單一信箱 OAuth refresh token**：設 `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` / `GMAIL_REFRESH_TOKEN`。

兩個供應商可並存；呼叫時用 body 的 `provider:"graph"|"gmail"` 指定，或省略讓系統自動選（優先 Graph）。

---

## 4. 測試

```bash
# 健康檢查（不會寄信）
curl https://symcio.tw/api/send-email
# → {"ok":true,"service":"send-email","configured":true,"providers":["graph"],"allowedSenders":[...]}

# 實際寄一封（會存進 info@symcio.tw 的 Outlook 寄件備份）
curl -X POST https://symcio.tw/api/send-email \
  -H "Content-Type: application/json" \
  -H "x-api-key: $SEND_EMAIL_API_KEY" \
  -d '{
    "from": "info@symcio.tw",
    "to": "you@example.com",
    "subject": "寄信測試",
    "html": "<p>這封會出現在 info@symcio.tw 的寄件備份，並在各 Outlook 裝置同步。</p>"
  }'
```

寄成功後，打開手機 Outlook 與桌機 Outlook 的「寄件備份」，確認同一封都在 → 同步問題解決。

---

## 5. 接到各家 AI 工具

| 工具 | 怎麼接 |
| --- | --- |
| **ChatGPT（自訂 GPT）** | Actions 匯入 `https://symcio.tw/openapi/send-email.json`，驗證選 API Key（header `x-api-key`）。 |
| **Manus / 支援 OpenAPI 的 Agent** | 匯入同一個 OpenAPI URL。 |
| **Make / Zapier / n8n** | HTTP module 對 `/api/send-email` 發 POST，帶 `x-api-key` 與 JSON body。 |
| **Claude / Gemini / Grok / Meta AI** | 一般對話介面未開放自訂外部 Action；改由你的後端/自動化呼叫本端點，或在支援 MCP/工具的情境包一層。 |

---

## 6. 安全注意事項

- 端點預設**未開放**：缺/錯 `x-api-key` → 401；`from` 不在 `SEND_EMAIL_ALLOWED_SENDERS` → 403（防冒名）。
- `SEND_EMAIL_API_KEY`、`GRAPH_CLIENT_SECRET`、Service Account JSON 只放伺服器端環境變數，不要 commit。`.gitignore` 已排除 `.env*`。
- 寄信網域別忘了 **SPF / DKIM / DMARC**：M365 與 Google 各自的寄信記錄都要在 symcio.tw 的 DNS 設好，才不會被退信或進垃圾桶。
