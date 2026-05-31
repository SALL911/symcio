# @symcio.tw 信箱整頓指南（非工程版・手機桌機自己動手）

> 目標：讓你 info@symcio.tw、sall@symcio.tw 的「寄件備份」在所有裝置一致，不用再對不起來。
> 全程不需要寫程式、不需要 Azure、不需要工程師。照著點就好。

---

## 第 0 步：先認清你現在的狀況（這是病因）

我實際比對了你正在用的信箱，發現你**同時在用兩套不同公司的信箱系統**：

| 你在用的 | 它其實是 | 寄出的信存到哪 |
| --- | --- | --- |
| `info@symcio.tw` | **Microsoft 365（Outlook）** | Outlook 的「寄件備份」 |
| `cchuan911@gmail.com`（個人 Gmail） | **Google 個人信箱** | Gmail 的「寄件備份」 |

👉 **這就是為什麼寄件夾永遠對不起來**：它們是兩個獨立帳號、各存各的，天生不會同步。
沒有任何設定能把「兩個不同帳號」的寄件夾合併——只能讓你**固定用同一個帳號寄信**。

---

## 🔑 2026/05/31 重要補充：GoDaddy / SITE123 / Google Workspace 的真相

你後來補充：網域是在 **GoDaddy** 買的、網站用 **SITE123**、信箱想用 **Google Workspace**。這裡有個關鍵觀念一定要先搞懂，否則會一直設錯方向：

> **GoDaddy 賣的企業電子郵件，本身就是「GoDaddy 版的 Microsoft 365」。**
> 這正好解釋了為什麼上面實測 `info@symcio.tw` 的信件 header 顯示 `*.PROD.OUTLOOK.COM`——
> **你的 info@ 其實跑在微軟系統上，不是 Google。**

所以你很可能是「**兩套並存**」：

| 來源 | 系統 | 誰在上面 |
| --- | --- | --- |
| GoDaddy 附的企業信箱 | **Microsoft 365 / Outlook** | `info@symcio.tw`（header 已證實） |
| 你另外付費的 Google Workspace | **Google** | 可能 `sall@`、或重複的 `info@` |

**這就是寄件夾分岔的真正主因**：同一個網域，信箱卻分散在微軟和 Google 兩邊。

### 怎麼一次確認到底在哪（5 分鐘）
1. 用 `info@symcio.tw` 登入 **https://admin.microsoft.com** → 進得去 = info@ 在微軟（GoDaddy M365）。
2. 用 `info@symcio.tw` 登入 **https://admin.google.com** → 看使用者清單有沒有 info@ / sall@ = 你在 Google 也有帳號。
3. **以「能真正收到新信的那一個」為準**，全部裝置統一用它，另一個停用或只當備援。

> 判斷不出來時，預設用 **Microsoft 365**（因為 header 證實 info@ 的信實際從微軟發出）。下面第 2 步的 Outlook 設定就是給這個情況用的。

---

## 第 1 步：做一個決定（最重要）

**公司信以後統一用哪一個系統寄？** 建議選 **Microsoft 365（Outlook）**，因為你的 `info@symcio.tw` 已經在上面了（GoDaddy 附的就是它）。

> 若你確定要改用 Google Workspace（你有付費），也可以；但要先用上面的方法確認 `info@symcio.tw` 真的有在 Google 那邊收得到信，否則會收不到信。不確定的話，先用 Microsoft 365。

決定後，**一律從 info@symcio.tw 寄信，不要再用個人 Gmail 寄公司信。**（用個人 Gmail 寄，對方看到的寄件人是 cchuan911@gmail.com，不專業也容易進垃圾桶。）

---

## 第 2 步：四個裝置逐一整理

每個裝置的原則都一樣：**移除重複/舊的帳號 → 用正確方式重新加入 info@symcio.tw → 不要用 POP。**

### 📱 手機 Outlook（iPhone / Android）
1. 開 Outlook App → 左上頭像 → 齒輪 ⚙️ 設定。
2. 看「郵件帳戶」：如果同一個 info@symcio.tw 出現兩次、或有奇怪的 POP 帳戶 → 點進去 → **刪除帳戶**，只留乾淨的一個。
3. 重新「新增帳戶」→ 輸入 `info@symcio.tw` → 它會自動辨識成 **Microsoft 365 / Exchange** → 登入密碼。
4. 完成後，點底部「寄件備份」資料夾，確認看得到你最近寄的信。

### 📱 手機 Google Workspace / Gmail App
- 如果你決定公司信用 Microsoft 365：**手機 Gmail App 就不要再拿來寄 info@symcio.tw 的信**。可以保留它收個人 cchuan911@gmail.com，但公司信都改用 Outlook App。
- 重點：不要在 Gmail App 裡用「以 info@symcio.tw 寄信」的別名功能，那會讓寄件備份又分岔。

### 💻 桌機 Outlook（Windows / Mac）
1. Outlook → 檔案 / 設定 → 帳戶設定。
2. 一樣：刪掉重複或 POP 的 info@symcio.tw，只留一個。
3. 重新新增 → `info@symcio.tw` → 選 **Exchange / Microsoft 365**（**不要選 POP**）。
4. 如果它問你「寄件備份要存哪」→ 選「存到伺服器的 Sent Items」。

### 💻 桌機 Google Workspace（網頁版）
- 同手機原則：公司信改用 Outlook，網頁 Gmail 不再拿來寄 info@symcio.tw。

---

## 第 3 步：驗收（確認真的同步了）

1. 從**手機 Outlook** 用 info@symcio.tw 寄一封測試信給你自己。
2. 打開**桌機 Outlook** 的「寄件備份」→ 應該幾秒內就看到同一封。
3. 再從桌機寄一封，回手機看「寄件備份」→ 也應該出現。

兩邊都看得到同一封 = ✅ 同步問題解決。

---

## 關於 sall@symcio.tw

我查了你的 info@ 信箱，裡面**沒有任何 sall@symcio.tw 的往來信件**。代表 sall@ 可能：
- 還沒建立、或
- 在另一個系統（很可能在你的 **Google Workspace** 那邊，而 info@ 在微軟）、或
- 你其實很少用它。

請先用上面「第 0 步補充」的兩個 admin 後台確認 sall@symcio.tw 到底在 Microsoft 還是 Google。若要用，**強烈建議跟 info@ 放在同一個系統**，整頓方式完全一樣，才不會又分岔。

---

## 第 4 步：AI 一次發信到 @symcio —— 誠實說明

你問能不能「一次同步」ChatGPT、Claude、Perplexity、Gemini、Grok、Meta AI、Manus 都用 @symcio.tw 發信。

**真相：沒有「一鍵同步全部 AI」這個東西。** 它們是不同公司、各自獨立的產品，彼此不共用帳號。

能做到的是：建**一個共用的「寄信入口」**，再把支援外部工具的 AI 接上去。這個入口我**已經幫你做好並測試通過了**（在你的 symcio 專案、PR #12）：

| AI 工具 | 能不能接 | 怎麼接 |
| --- | --- | --- |
| ChatGPT（自訂 GPT） | ✅ | 匯入 `symcio.tw/openapi/send-email.json` |
| Claude Code / Manus | ✅ | 跑 `npm run email:send` 指令 |
| Make / Zapier / n8n | ✅ | HTTP 呼叫 |
| Gemini / Grok / Meta AI | ⚠️ | 一般介面不開放外部工具，只能透過上面的自動化代發 |

> 但這個「寄信入口」要正式上線，需要工程設定（Azure 應用程式 + 部署），那一步需要你或工程師登入你的後台授權，我無法代登。詳見 `docs/email-gmail-api.md`。
>
> **給非工程的你的建議**：第一優先是先把上面第 1~3 步的「裝置同步」做好——那才是你每天「很難做事」的真正痛點，而且你今天自己就能完成。AI 發信入口可以等有工程資源時再開。
