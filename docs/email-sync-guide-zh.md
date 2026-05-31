# @symcio.tw 信箱整頓指南（非工程版・手機桌機自己動手）

> 目標：讓你 info@symcio.tw、sall@symcio.tw 的「寄件備份」在所有裝置一致，不用再對不起來。
> 全程不需要寫程式、不需要 Azure、不需要工程師。照著點就好。

---

## ✅ 已確認（2026/05/31，使用者親自確認）：兩個信箱分屬兩個平台

| 信箱 | 平台 | 它的家（原生 App） |
| --- | --- | --- |
| **info@symcio.tw** | **Microsoft 365** | **Outlook** |
| **sall@symcio.tw** | **Google Workspace** | **Gmail / Google** |

### 🟡 黃金原則（記住這一句就解決九成問題）
> **info@ 的信永遠用 Outlook 寄；sall@ 的信永遠用 Gmail 寄。**
> 每個信箱待在自己平台的原生 App 裡，寄件備份天生就同步。
> 會分岔，幾乎都是因為「拿錯 App 寄」或「用了 POP」。

### info@symcio.tw（微軟）→ 全部走 Outlook
- 📱 手機 Outlook：加 `info@symcio.tw` → 自動辨識 **Microsoft 365** → 登入 ✅
- 💻 桌機 Outlook：加 `info@symcio.tw` → 選 **Exchange / Microsoft 365**（**不要 POP**）✅
- ❌ 不要把 info@ 放進 Gmail App / 網頁 Gmail

### sall@symcio.tw（Google）→ 全部走 Gmail
- 📱 手機 **Gmail App**：加 `sall@symcio.tw`（用 Google 登入）✅ 自動同步
- 💻 桌機 **網頁 Gmail**（mail.google.com）：登入 sall@ ✅ 自動同步
- 先進 Gmail 設定 →「轉寄和 POP/IMAP」→ **停用 POP、啟用 IMAP**
- ❌ 不要把 sall@ 放進 Outlook（若真的要，得用 IMAP 並設「不儲存寄件副本」，否則會重複）

### ⚠️ 兩個最容易讓你分岔的雷（務必避開）
1. **POP**：任何一台用 POP 都會各存各的 → info@ 改 Exchange、sall@ 改 IMAP。
2. **別名代寄**：不要在 Gmail 裡設「用 info@ 寄」、也不要在 Outlook 裡設「用 sall@ 寄」。這會把副本存到錯的伺服器 → 兩邊對不起來。**誰的信，就用誰的原生 App 寄。**

### 驗收
- info@：手機 Outlook 寄 → 桌機 Outlook 寄件備份出現 ✅
- sall@：手機 Gmail App 寄 → 桌機網頁 Gmail 寄件備份出現 ✅

---

## 第 0 步：先認清你現在的狀況（這是病因）

你「寄件夾永遠對不起來」的根因：**同一個網域，兩個信箱卻分屬微軟和 Google 兩套系統**，而你在裝置上常常拿錯 App 寄、或某台用了 POP，導致副本散落各處。

| 信箱 | 它其實是 | 寄出的信該存到哪 |
| --- | --- | --- |
| `info@symcio.tw` | **Microsoft 365（Outlook）** | Outlook 伺服器端「寄件備份」 |
| `sall@symcio.tw` | **Google Workspace** | Gmail 伺服器端「寄件備份」 |
| `cchuan911@gmail.com`（個人 Gmail） | **Google 個人信箱**（私人用） | 跟公司信無關，別拿來寄公司信 |

👉 沒有任何設定能把「兩個不同平台的信箱」寄件夾合併——正解是**每個信箱固定用自己平台的 App 寄**（見最上方黃金原則）。

---

## 🔑 背景：GoDaddy / SITE123 的真相

網域在 **GoDaddy** 買、網站用 **SITE123**。關鍵觀念：

> **GoDaddy 賣的企業電子郵件，本身就是「GoDaddy 版的 Microsoft 365」。**
> 這正好解釋為什麼實測 `info@symcio.tw` 的信件 header 是 `*.PROD.OUTLOOK.COM`——
> info@ 跑在微軟系統上（已由你親自確認）。而 sall@ 則在你另外付費的 Google Workspace。

### 怎麼自行確認平台
1. 用 `info@symcio.tw` 登入 **https://admin.microsoft.com** → 進得去 = 在微軟。✅ 已確認
2. 用 `sall@symcio.tw` 登入 **https://mail.google.com** → 進得去 = 在 Google。✅ 已確認

---

## 第 1 步：四個 App，誰配哪個信箱

| App | 放哪個信箱 | 連線方式 |
| --- | --- | --- |
| 📱 手機 Outlook | info@ | Microsoft 365 / Exchange |
| 💻 桌機 Outlook | info@ | Exchange（不要 POP） |
| 📱 手機 Gmail App | sall@ | Google 登入（IMAP，不要 POP） |
| 💻 桌機 網頁 Gmail | sall@ | 直接登入 |

> 不要交叉混用（例如把 info@ 塞進 Gmail App、或用 Outlook 代寄 sall@），那是分岔主因。

---

## 第 2 步：逐台設定

### 📱 手機 Outlook（放 info@）
1. Outlook App → 左上頭像 → ⚙️ 設定 → 郵件帳戶。
2. 若有重複或 POP 版 info@ → **刪除**，只留乾淨一個。
3. 新增帳戶 → `info@symcio.tw` → 自動辨識 **Microsoft 365 / Exchange** → 登入。
4. 確認「寄件備份」看得到最近寄的信。

### 💻 桌機 Outlook（放 info@）
1. 帳戶設定 → 刪掉重複或 POP 的 info@。
2. 重新新增 → `info@symcio.tw` → 選 **Exchange / Microsoft 365**（**不要 POP**）。
3. 若問「寄件備份存哪」→ 選「存到伺服器的 Sent Items」。

### 📱 手機 Gmail App（放 sall@）
1. Gmail App → 右上頭像 → 新增其他帳戶 → Google → `sall@symcio.tw` 登入。
2. 先到 Gmail 設定確認 **IMAP 已啟用、POP 停用**。
3. 不要在這裡設「用 info@ 別名寄信」。

### 💻 桌機 網頁 Gmail（放 sall@）
- 直接 mail.google.com 登入 sall@，原生自動同步，不需特別設定。

---

## 第 3 步：驗收

- **info@**：手機 Outlook 寄一封給自己 → 桌機 Outlook「寄件備份」幾秒內出現 ✅
- **sall@**：手機 Gmail App 寄一封給自己 → 桌機網頁 Gmail「寄件備份」出現 ✅

兩個信箱各自在自己的兩台 App 上都看得到 = 同步完成。

---

## 第 4 步：AI 一次發信到 @symcio —— 誠實說明

你問能不能「一次同步」ChatGPT、Claude、Perplexity、Gemini、Grok、Meta AI、Manus 都用 @symcio.tw 發信。

**真相：沒有「一鍵同步全部 AI」這個東西。** 它們是不同公司、各自獨立的產品，彼此不共用帳號。

能做到的是：建**一個共用的「寄信入口」**（已做好，PR #12），再把支援外部工具的 AI 接上去：

| AI 工具 | 能不能接 | 怎麼接 |
| --- | --- | --- |
| ChatGPT（自訂 GPT） | ✅ | 匯入 `symcio.tw/openapi/send-email.json` |
| Claude Code / Manus | ✅ | 跑 `npm run email:send` 指令 |
| Make / Zapier / n8n | ✅ | HTTP 呼叫 |
| Gemini / Grok / Meta AI | ⚠️ | 一般介面不開放外部工具，只能透過上面的自動化代發 |

> 因為 **info@ 在微軟、sall@ 在 Google**，寄信入口正式上線時：寄 info@ 走 **Microsoft Graph（`GRAPH_*`）**，寄 sall@ 走 **Gmail API（`GMAIL_*`）**，兩套 env 都要設。那一步需要你或工程師登入 Azure 與 Google 後台授權，我無法代登。詳見 `docs/email-gmail-api.md`。
>
> **建議順序**：第一優先先把上面的「裝置同步」做好——那才是你每天「很難做事」的真正痛點，今天自己就能完成。AI 發信入口可以等有工程資源時再開。
