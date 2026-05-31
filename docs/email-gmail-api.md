# 用 Gmail API 從 @symcio.tw 寄信（並讓寄件備份在所有裝置同步）

這份文件解決兩件事：

1. **寄件備份各裝置不一致** — 用 Gmail API 寄信，會把副本存進 Google Workspace 伺服器端的「寄件備份 / Sent」資料夾，所有用 IMAP 連這個信箱的裝置（手機/桌機 Outlook、Gmail 網頁/App）都看到同一份。
2. **讓 AI / 自動化用 @symcio.tw 寄信** — 部署後會有一個 HTTPS 端點 `POST /api/send-email`，任何工具（ChatGPT 自訂 GPT 的 Actions、Manus、Make / Zapier / n8n、甚至 `curl`）都能呼叫它寄信。

> ⚠️ 重點觀念：ChatGPT、Claude、Perplexity、Gemini、Grok、Meta AI、Manus 是各自獨立的產品，**沒有「一鍵同步全部 AI」**。能做到的是：建立**一個**標準端點，再把它分別接到各家支援外部工具/Action 的 AI 上。本端點就是那個「一個共用入口」。

---

## 架構

```
AI 工具 / 自動化 ──HTTPS──▶  /api/send-email  ──▶  lib/email/gmail.ts  ──▶  Gmail API
   (帶 x-api-key)              (驗證 + 防冒名)        (JWT / refresh token)     (寄信並存 Sent)
```

- `lib/email/gmail.ts`：極簡 Gmail API client，零額外套件（只用 `fetch` + `node:crypto`）。
- `app/api/send-email/route.ts`：對外端點，需 `x-api-key`，且 `from` 必須在允許清單內。
- `public/openapi/send-email.json`：OpenAPI 3.1 規格，給 AI 工具直接匯入。

---

## 設定步驟

### A.（推薦）Service Account + 網域委派 — 可同時代表 info@ 與 sall@

這個方式最適合你「兩個信箱、寄件備份都要同步」的需求。

1. **建立 Service Account**
   - 進 [Google Cloud Console](https://console.cloud.google.com/) → 建立/選一個專案。
   - 啟用 **Gmail API**（API & Services → Library → Gmail API → Enable）。
   - IAM & Admin → Service Accounts → 建立服務帳戶 → 建立一組 **JSON 金鑰**並下載。

2. **開啟網域委派（Domain-wide delegation）**
   - 在該 Service Account 詳情頁，記下它的 **Client ID（數字）**。
   - 進 [Google Workspace 管理控制台](https://admin.google.com/) → 安全性 → 存取權與資料控制 → **API 控管 → 網域委派**。
   - 新增：Client ID 填上一步的數字；OAuth 範圍填：
     ```
     https://www.googleapis.com/auth/gmail.send
     ```

3. **設定環境變數**（Vercel → Project → Settings → Environment Variables）
   - `GMAIL_SERVICE_ACCOUNT_JSON`：把整段下載的 JSON **壓成一行**貼上。
   - `SEND_EMAIL_API_KEY`：自己產生一串夠長的隨機字串（呼叫端點時要帶）。
   - `SEND_EMAIL_ALLOWED_SENDERS`：`info@symcio.tw,sall@symcio.tw`

> 為什麼這方式能讓「寄件備份同步」：API 以「模擬該使用者」身分寄信，Gmail 會自動把副本放進**那個人**的 Sent 資料夾，所以 info@ 和 sall@ 各自的寄件備份都正確、且每台裝置一致。

### B.（備用）單一信箱 OAuth refresh token

只需要一個信箱寄信、又不想動 Workspace 管理設定時用這個。

1. Google Cloud Console 建立 **OAuth 用戶端 ID**（type: Web 或 Desktop），啟用 Gmail API。
2. 用 OAuth Playground 或自己的流程，授權 `gmail.send` 範圍，取得 **refresh token**。
3. 設定環境變數：`GMAIL_CLIENT_ID`、`GMAIL_CLIENT_SECRET`、`GMAIL_REFRESH_TOKEN`、`SEND_EMAIL_API_KEY`、`SEND_EMAIL_ALLOWED_SENDERS`。

> 注意：這個方式只能用該授權帳號（或其「以其他地址寄信」別名）寄信。

---

## 測試

部署後（或本機 `npm run dev`）先看健康檢查：

```bash
curl https://symcio.tw/api/send-email
# → {"ok":true,"service":"send-email","configured":true,"allowedSenders":["info@symcio.tw","sall@symcio.tw"]}
```

實際寄一封：

```bash
curl -X POST https://symcio.tw/api/send-email \
  -H "Content-Type: application/json" \
  -H "x-api-key: $SEND_EMAIL_API_KEY" \
  -d '{
    "from": "Symcio <info@symcio.tw>",
    "to": "you@example.com",
    "subject": "Gmail API 測試",
    "html": "<p>這封信會出現在 info@symcio.tw 的寄件備份。</p>"
  }'
```

寄成功後，請打開 **info@symcio.tw 的寄件備份**確認那封信在；接著在手機/桌機任一裝置也會同步看到 → 代表同步問題解決。

---

## 接到各家 AI 工具

| 工具 | 怎麼接 |
| --- | --- |
| **ChatGPT（自訂 GPT）** | 在 GPT 的 *Actions* 匯入 `https://symcio.tw/openapi/send-email.json`，驗證選 API Key（header `x-api-key`）。 |
| **Manus / 其他支援 OpenAPI 的 Agent** | 同樣匯入上面的 OpenAPI URL。 |
| **Make / Zapier / n8n** | 用 HTTP module 對 `/api/send-email` 發 POST，帶 `x-api-key` 與 JSON body。 |
| **Claude / Gemini / Grok / Meta AI** | 這幾家在一般對話介面沒有開放自訂外部 Action；可改由你自己的後端/自動化呼叫本端點，或在支援 MCP/工具的情境下包一層。 |

---

## 安全注意事項

- 端點預設**未開放**：沒帶正確 `x-api-key` 一律 401；`from` 不在允許清單一律 403（防止他人冒名用你的網域寄信）。
- `SEND_EMAIL_API_KEY` 視同密碼，請只放在伺服器端環境變數，**不要**寫進前端或 commit 進 repo。
- Service Account JSON 同樣只放環境變數。`.gitignore` 已排除 `.env*`。
