# Meta Developer App 設定（一次性，15-20 分鐘）

這份指南只列你要點的步驟。所有需要本人 FB 帳號登入、身分驗證、UI 同意條款的部分，都必須由你親自做（Meta 沒有開放 API 代辦）。

---

## ✅ 前置檢查（5 分鐘）

| 項目 | 怎麼確認 |
|---|---|
| IG @symcio.tw 是「專業帳號」 | IG App → 設定 → 帳號類型 → 切換為「商業帳號」或「創作者帳號」 |
| 有一個 Facebook 粉專 | facebook.com/pages → 至少有一個你管理的粉專；沒有的話建一個叫「Symcio」 |
| 粉專已連結 IG | FB 粉專 → 設定 → 連結的帳號 → Instagram → 連結 @symcio.tw |

**任何一項沒打勾，後面都不會動。先把這三件做完。**

---

## Step 1：建立 Meta Developer App（5 分鐘）

1. 開 https://developers.facebook.com → 右上「我的應用程式」→「建立應用程式」
2. **使用案例**選「**其他**」→ 下一步
3. **應用程式類型**選「**商業**」→ 下一步
4. 應用程式名稱填「Symcio IG Automation」→ 聯絡 Email 用你的 → 建立
5. 進到 App Dashboard 後，左側選單 → **應用程式設定 → 基本資料**
   - 複製 **應用程式編號** → 這是 `META_APP_ID`
   - 點「顯示」複製 **應用程式密鑰** → 這是 `META_APP_SECRET`

---

## Step 2：加入 Instagram Graph API（3 分鐘）

1. App Dashboard 左側「新增產品」
2. 找「**Instagram Graph API**」→ 點「設定」
3. 它會自動加入 Instagram + Facebook Login 兩個產品

> 注意：2024 年後 Meta 把 IG API 統一到「Instagram」產品下，名稱可能是「Instagram → API 設定（含 Facebook 登入）」。功能一樣。

---

## Step 3：在 Graph API Explorer 拿短期 Token（5 分鐘）

1. 開 https://developers.facebook.com/tools/explorer
2. 右上選擇你剛建的 App「Symcio IG Automation」
3. 點「**生成存取權杖**」按鈕
4. 勾選下列 permissions（全部都要）：
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
   - `business_management`
5. 點「**生成存取權杖**」→ 跳出 FB 登入視窗 → 用你管理粉專的 FB 帳號登入並同意
6. 回到 Explorer，**複製欄位裡的 token**（一串很長的字）→ 這是 `META_SHORT_TOKEN`（只有 1-2 小時有效，要馬上做 Step 4）

---

## Step 4：執行 fetch_ig_credentials.py 拿到永久可用的 Token + IG_USER_ID（2 分鐘）

在 GitHub Codespaces、Claude Code 終端、或你本機跑：

```bash
cd ig-automation/scripts
pip install requests
export META_APP_ID="貼上 Step 1 拿到的 App ID"
export META_APP_SECRET="貼上 Step 1 拿到的 App Secret"
export META_SHORT_TOKEN="貼上 Step 3 拿到的短期 token"
python fetch_ig_credentials.py
```

腳本會：
1. 把短期 token 換成 **60 天長期 user token**
2. 列出你管理的粉專、讓你選
3. 換成 **page access token**（這個 token 只要不撤銷，搭配 IG 持續有效）
4. 找到粉專連結的 IG_USER_ID

輸出最後三行就是要貼到 GitHub Secrets 的值：

```
META_ACCESS_TOKEN = EAAxxxx...
IG_USER_ID        = 17841xxxx...
FB_PAGE_ID        = 1234567890
```

---

## Step 5：設定 GitHub Secrets（3 分鐘）

到 `sall911/symcio` repo → **Settings → Secrets and variables → Actions → New repository secret**：

| Secret 名稱 | 來源 |
|---|---|
| `META_ACCESS_TOKEN` | Step 4 輸出 |
| `IG_USER_ID` | Step 4 輸出 |
| `FB_PAGE_ID` | Step 4 輸出（之後要同步發 FB 才會用到）|
| `R2_ENDPOINT` | Cloudflare R2 設定（見下方）|
| `R2_ACCESS_KEY` | Cloudflare R2 設定 |
| `R2_SECRET_KEY` | Cloudflare R2 設定 |
| `R2_BUCKET` | `symcio-ig` |
| `R2_PUBLIC_URL` | R2 公開 bucket 的 base URL |

---

## Step 6：Cloudflare R2（5 分鐘）

> IG Graph API 要求圖片必須是**公開可達的 https URL**，不能直接傳 base64 或本地檔案。R2 是免費且最簡單的選擇。

1. https://dash.cloudflare.com → R2 → 建立 bucket → 名稱 `symcio-ig`
2. Bucket 設定 → **Public access** → 啟用「Allow Access」（或綁自訂網域 `ig-assets.symcio.tw`）
3. 複製 Public R2.dev URL（長得像 `https://pub-xxxxx.r2.dev`）→ 這是 `R2_PUBLIC_URL`
4. R2 主頁面 → **Manage R2 API Tokens** → Create API Token
   - Permissions: Object Read & Write
   - Bucket: 限定 `symcio-ig`
   - 複製：
     - **Access Key ID** → `R2_ACCESS_KEY`
     - **Secret Access Key** → `R2_SECRET_KEY`
     - **Endpoint** (S3 API) → `R2_ENDPOINT`（長得像 `https://<account_id>.r2.cloudflarestorage.com`）

---

## Step 7：第一次手動測試（5 分鐘）

到 GitHub repo → **Actions → Weekly IG Carousel Post → Run workflow**：

1. 第一次先用 `dry_run = true` → 只導出 PNG，不真發到 IG
   - 跑完後在 Action run 頁面下載 artifact，檢查 7 張 PNG 是不是符合預期
2. 確認 PNG OK 後，再 Run workflow，這次 `dry_run = false` → 真的發到 IG
   - 第一次建議指定 `carousel_index = 1`（也就是 carousel-01-cmo）

如果第一次發成功 → 排程已啟動，往後每週一 09:00 自動跑。

---

## 常見錯誤

| 錯誤訊息 | 原因 | 修法 |
|---|---|---|
| `(#100) The parameter image_url is required` | R2 URL 不公開 | 檢查 bucket 是否開 public，URL 用瀏覽器能不能直接打開 |
| `(#10) Application does not have permission for this action` | App 沒拿到 instagram_content_publish | 回 Step 3 重新勾權限 |
| `Invalid OAuth access token` | Token 過期或撤銷 | 重跑 fetch_ig_credentials.py |
| `(#190) Error validating access token: Session has expired` | Token 超過 60 天 | 同上 |

---

## 我（Claude）做了什麼 / 沒做什麼

✅ **做了**：寫完所有腳本、workflow、文件，等你拿到 token 就能跑

❌ **沒辦法做**（需要你本人在瀏覽器點）：
- 登入 developers.facebook.com 建 App
- 同意條款、身分驗證
- 在 Graph API Explorer 點「生成 token」並用 FB 帳號授權

❌ **沒辦法做**（需要你本人決定 + 信用卡，雖然免費）：
- Cloudflare R2 註冊
- GitHub Secrets 填值（你不會想讓我看到 token）

當你完成 Step 1-3 拿到三個值（APP_ID、APP_SECRET、SHORT_TOKEN），告訴我，我可以幫你跑 Step 4 把 token 換好（但你也可以自己 export 環境變數跑，腳本只連 Meta API，不會把 token 傳到別處）。
