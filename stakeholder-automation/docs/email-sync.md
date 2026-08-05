# 把 info@symcio.tw / sall@symcio.tw 同步到手機 Outlook、桌機 Outlook、Google Workspace

> 這是裝置端帳號設定，不是程式能代做的。以下是逐步操作。前提：`symcio.tw` 網域的信箱
> 由 **Google Workspace** 託管（info@ 與 sall@ 皆為 Workspace 帳號 / 別名）。

## A. 桌機 Outlook（Windows / macOS）
1. Outlook → 檔案 → 新增帳戶 → 輸入 `info@symcio.tw`。
2. 選擇 **IMAP**（Google Workspace 建議 IMAP）。
3. 收件 `imap.gmail.com:993 SSL`；寄件 `smtp.gmail.com:465 SSL`。
4. 密碼用 **應用程式密碼**（Google 帳戶 → 安全性 → 兩步驟驗證 → 應用程式密碼）。
5. `sall@symcio.tw` 重複一次；若 sall@ 是 info@ 的別名，改在 Gmail「設定 → 帳戶 →
   以此地址寄信」新增 sall@ 即可。

## B. 手機 Outlook（iOS / Android）
1. Outlook App → 設定 → 新增郵件帳戶 → 輸入 `info@symcio.tw`。
2. 帳戶類型選 **Google / IMAP**，用應用程式密碼登入。
3. 開啟「Focused Inbox」可關閉，確保利害關係人回信不漏接。

## C. Google Workspace 本身
- info@ 與 sall@ 已在 Workspace，網頁版直接登入即可。
- 建議在 Gmail 設定多重簽名（info@ / sall@ 各一）。
- 建議建立篩選器標籤：`利害關係人/國際`、`利害關係人/國內`，把本系統建立的草稿與回信自動歸類。

## 與本系統的關係
本系統在 `info@symcio.tw` 建立草稿；上述設定讓你在任一裝置都能看到並寄出。
