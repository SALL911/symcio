---
name: geo-optimizer
description: 優化 symcio.tw 的 Google 排名與 AI 引擎引用率（GEO）。串接 GSC MCP（真實點擊/曝光/索引）、OpenSEO（關鍵字、競品、AI 可見度）與本 repo 的 audit 腳本，產出並實作具體修正。觸發詞：GEO、SEO、AI 可見度、llms.txt、schema、sitemap、Search Console、GSC、OpenSEO、優化官網、AI citation、排名。
---

# GEO Optimizer — symcio.tw

目標：讓 symcio.tw 的每一頁同時 (1) 被 Google 正確索引並排名，(2) 被 ChatGPT / Claude / Gemini / Perplexity 讀得到、引用得出。

## 工具分工

| 工具 | 用途 | 需要 |
|---|---|---|
| `scripts/audit.mjs`（本 skill） | 技術 SEO + GEO 訊號稽核，0–100 分，可當 CI gate | 無，Node 18+ |
| `gsc` MCP（`.mcp.json`） | `detect_quick_wins`、`enhanced_search_analytics`、`index_inspect`、`list_sitemaps`、`submit_sitemap` | `GSC_CREDENTIALS_PATH` 指向 service account 金鑰 |
| OpenSEO plugin（`.claude/settings.json`） | `seo-audit`、`keyword-research`、`ai-visibility-audit`、`ai-prompt-research`、`competitor-analysis` skills + MCP | openseo.so 帳號（OAuth via `/mcp`） |

工具不可用時（未授權、網路封鎖），照樣跑 audit 腳本並在回報中寫明「哪一步缺資料」，不要猜數字。

## 流程

### 1. 稽核（必做）

```bash
npm run build && npx next start -p 3100 &
node .claude/skills/geo-optimizer/scripts/audit.mjs http://localhost:3100 --md geo-audit.md
# 線上版：node .claude/skills/geo-optimizer/scripts/audit.mjs https://symcio.tw
```

先處理 `high`，再 `med`。分數 < 90 不得合併（CI 會擋）。

### 2. 真實搜尋資料（GSC）

- 屬性用 `sc-domain:symcio.tw`。
- `detect_quick_wins`：位置 4–20、曝光高、CTR 低的 query → 改該頁 title / description / H1 對準 query。
- `enhanced_search_analytics` 以 `page` 維度：曝光 > 0 但點擊 = 0 的頁面優先改 meta。
- `index_inspect`：新頁或改版頁確認「已索引」；未索引則檢查 canonical / robots / sitemap。
- 部署後 `submit_sitemap`：`https://symcio.tw/sitemap.xml`。

### 3. 關鍵字與 AI 可見度（OpenSEO）

- `ai-prompt-research`：找出買家會問 AI 的問題（如「台灣 AI 品牌曝光工具」「GEO 是什麼」），記錄 symcio.tw 是否被引用。
- 沒被引用的問題 → 寫成 FAQ 條目（`lib/faq-data.ts` 或 `lib/faq-extended.ts`），一題一答、答案首句直接給結論。
- `competitor-analysis`：比對被 AI 引用的競品頁面結構（定義句、數據、表格）。

### 4. 實作規範（本 repo 慣例）

- **Metadata**：每頁用 `pageMetadata({ title, description, path })`（`lib/seo.ts`）。不要直接寫 `openGraph`，否則會遺失 og:image；不要在 layout 設 canonical。
- **結構化資料**：用 `<JsonLd data={...} />`（`components/JsonLd.tsx`）；子頁加 `breadcrumbSchema()`。Organization / WebSite 已在 `app/layout.tsx`，以 `@id` 參照，不要重複宣告。
- **Sitemap**：`app/sitemap.ts` 自動展開 FAQ 與電子報；新增靜態頁要加入 `STATIC_ROUTES`。不要再建 `public/sitemap.xml`。
- **llms.txt**：`public/llms.txt` 的價格與產品描述必須與 `/pricing` 一致；新增重要頁面要加到 `## Key pages`。
- **SSR**：layout 內任何用 `useSearchParams()` 的 client component 必須放在「不包 children」的獨立 `<Suspense>`，否則整站 bailout 成 CSR，AI 爬蟲讀到空白頁。修改後用 `curl -s localhost:3100/ | grep -c '<h1'` 確認頁面主體在 server HTML 內（`BAILOUT` 出現在 `</main>` 之後的空 Suspense 屬正常）。

### 5. GEO 內容規則

- 每頁前 150 字內有定義句：「Symcio 是…」「AI 可見度是…」。
- 數字附來源或方法（「依 ISO 10668」「每週一更新」），AI 引擎偏好可驗證的事實。
- FAQ 一題一答，問題用使用者真實問法，答案 40–120 字。
- 品牌名一致：Symcio / 全識股份有限公司 / BrandOS，不翻譯。
- 禁用「創新」「顛覆」「賦能」「革命性」「最強」「最佳」。
- SimilarWeb / SEMrush / Bloomberg 只能作類比，不得暗示合作或授權。

### 6. 驗證與交付

1. `npx tsc --noEmit && npm run build`
2. 重跑 audit，貼出前後分數。
3. 部署後：GSC `submit_sitemap` + 對改動頁 `index_inspect`；OpenSEO 重跑 `ai-visibility-audit` 追蹤引用變化（建議每月一次）。
