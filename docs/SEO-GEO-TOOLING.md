# SEO / GEO 工具鏈：GSC MCP × OpenSEO × GEO Optimizer

## WHY

symcio.tw 的流量來源分兩條：Google 搜尋與 AI 答案引擎（ChatGPT / Claude / Gemini / Perplexity）。兩條都需要量測與持續修正。本工具鏈讓 Claude Code 直接讀取真實搜尋資料、稽核網站、並在 repo 內實作修正。

## WHAT

| 元件 | 位置 | 狀態 |
|---|---|---|
| GEO Optimizer skill + audit 腳本 | `.claude/skills/geo-optimizer/` | 可用，無需憑證 |
| CI gate（分數 < 90 擋 PR） | `.github/workflows/geo-audit.yml` | 可用 |
| GSC MCP（`mcp-server-gsc@0.3.0`） | `.mcp.json` → `gsc` | 需 service account（下方步驟 1） |
| OpenSEO plugin（skills + MCP） | `.claude/settings.json` → `openseo@openseo` | 需 openseo.so 帳號（步驟 2） |
| GSC 網站驗證 meta tag | `app/layout.tsx` 讀 `NEXT_PUBLIC_GSC_VERIFICATION` | 需設定 Vercel env（步驟 3） |

## HOW

### 1. GSC MCP（約 10 分鐘）

1. [Google Cloud Console](https://console.cloud.google.com/) 建立專案 → 啟用 **Google Search Console API**。
2. IAM → Service Accounts → 建立 → Keys → 新增 JSON 金鑰。金鑰存放於 repo 外（例如 `~/.config/symcio/gsc-sa.json`），不得 commit。
3. Search Console → `sc-domain:symcio.tw` → 設定 → 使用者和權限 → 新增 service account email（`...@....iam.gserviceaccount.com`），權限「完整」（`index_inspect` 需要）。
4. 本機 shell：`export GSC_CREDENTIALS_PATH=~/.config/symcio/gsc-sa.json`
5. 在 repo 根目錄開 Claude Code，首次會詢問是否啟用 project MCP server `gsc` → 允許。`/mcp` 應顯示 `gsc` connected。

可用工具：`list_sites`、`search_analytics`、`enhanced_search_analytics`、`detect_quick_wins`、`index_inspect`、`list_sitemaps`、`get_sitemap`、`submit_sitemap`。

### 2. OpenSEO（約 3 分鐘）

1. 於 [openseo.so](https://openseo.so) 註冊（hosted 版 USD 10/月；或依 `every-app/open-seo` 文件自架，需 DataForSEO API key）。
2. 在 repo 開 Claude Code → 信任 project settings → 安裝 `openseo` plugin（marketplace 已在 `.claude/settings.json` 宣告）。
3. `/mcp` → `openseo` → Authenticate（OAuth）。
4. 建立專案 `symcio.tw`，市場選 Taiwan / zh-TW。可在 OpenSEO 內連 GSC，取得點擊與曝光資料。

成本控制：OpenSEO 底層呼叫 DataForSEO，按量計費。`ai-prompt-research` 與 `ai-visibility-audit` 每次執行前會顯示預估成本，確認後再跑。

### 3. Search Console 驗證與 sitemap

1. Search Console → 新增資源 → 網域 `symcio.tw`（DNS TXT 驗證，建議），或網址前置字元 → HTML tag。
2. 若用 HTML tag：Vercel → Project → Settings → Environment Variables → `NEXT_PUBLIC_GSC_VERIFICATION=<content 值>` → Redeploy。
3. Sitemaps → 提交 `https://symcio.tw/sitemap.xml`（或在 Claude Code 叫 `gsc` 的 `submit_sitemap`）。

### 4. 日常使用

在 Claude Code 輸入「用 geo-optimizer 優化 symcio.tw」或 `/geo-optimizer`。skill 會：稽核 → 拉 GSC quick wins → OpenSEO AI 可見度 → 實作修正 → 重跑稽核。

建議節奏：每次發布跑 CI（自動）；每月一次 GSC quick wins + OpenSEO `ai-visibility-audit`，結論存入 BrandOS `knowledge_nodes`（節點類型：GEO策略）。
