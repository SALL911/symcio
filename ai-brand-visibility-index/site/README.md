# 台灣品牌 AI 能見度指數 · Taiwan Brand AI Visibility Index (AIV) — Web

> Symcio 全識 · BrandOS™ — 即時追蹤台灣上市櫃企業在 ChatGPT、Claude、Gemini 等 AI 系統中的品牌能見度與引述排名。
>
> **定位：** 不是幫你做行銷，是幫你的品牌數據合規、AI 可見、資產可估。

這是 AIV 指數的 **Symcio 設計版前端**：純靜態、零相依、零建置步驟，可獨立部署於 **Vercel** 或 **GitHub Pages**。
方法論與資料規格（schema、prompt 協議、評分公式）見上層目錄 [`../`](../)。

---

## 目錄結構

```
ai-brand-visibility-index/site/
├── index.html              # 主頁：masthead / 即時 ticker / 產業篩選 / 排名 / 分數視覺化 modal
├── methodology.html        # AIV 方法論白皮書（中文，Symcio style）
├── methodology-en.html     # AIV 方法論白皮書（English）
├── assets/
│   ├── styles.css          # Symcio 品牌設計系統（深綠 #1B4332 / 米灰 #F0EDE8 / Noto Sans TC）
│   ├── data.js             # 榜單資料（window.AIV_DATA）— 替換此檔即更新數據
│   └── app.js              # 前端邏輯：ticker / 篩選 / 排名 / modal / 可選 API 模式
├── vercel.json             # Vercel 靜態設定（cleanUrls）
└── .nojekyll               # 讓 GitHub Pages 正常服務 /assets
```

設計規範遵循 Symcio 品牌系統：主色深綠 `#1B4332`、底色米灰 `#F0EDE8`、中文 Noto Sans TC、左上角綠色 Tag、右上角雙括號 Logo、底部綠色漸層霧化 + 資訊列、警示色 `#C1121F`。

---

## 資料模式

### 1. 內建示意資料（預設）
`assets/data.js` 內含 30 家台灣上市櫃品牌的 **示意資料 DEMO**。頁面會顯示紅框「示意資料」提示。

### 2. 接上即時 API
編輯 `assets/app.js` 頂部：

```js
const API_BASE = "https://your-api.vercel.app";  // 你的 Vercel 後端
```

前端會 `GET {API_BASE}/api/rankings`，預期回傳與 `data.js` **相同結構**的 JSON。

> **計分公式：** `AIV = 0.35·PR + 0.25·CR + 0.20·SoV + 0.10·CQ + 0.10·CMC`，子指標皆於類別內 0–100 標準化。

---

## 部署

### Vercel（推薦）
於 Vercel 專案設定中，將 **Root Directory** 指向 `ai-brand-visibility-index/site`，即可直接部署本靜態站。

### GitHub Pages
將本目錄內容作為 Pages 來源；`.nojekyll` 已就緒，`/assets` 可正常服務。

---

## ⚠️ 上線前檢查

- [ ] `assets/data.js` 是否已換成**真實實測數據**？（DEMO 資料不可對外宣稱為真實排名）
- [ ] `demo` 欄位設為 `false`，移除紅框提示
- [ ] 方法論白皮書 `methodology.html` 的 `K 值 / 題庫題數` 是否與實際執行一致
- [ ] 免責聲明保留（非投資建議、非信用評等）

© 2026 全識股份有限公司 Symcio Co., Ltd.
