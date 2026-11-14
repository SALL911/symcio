# 品牌治理雙週刊 → HubSpot 自動草稿

新增一期：在 `issues/` 放一個 `YYYY-MM-DD.json`（格式照 `issues/2026-11-17.json`），合併到 `main`。
GitHub Actions 會自動：

1. 把這期內容套進 Symcio 版型，上傳成 HubSpot 編碼式範本（`symcio-newsletter/issue-日期.html`）
2. 用這個範本在 HubSpot 建立電子報**草稿**

寄送與排程**一律由人在 HubSpot 按下**。HubSpot 只有 Marketing Hub Enterprise 或交易郵件附加元件能用 API 寄信，而且寄前人工檢查本來就該保留。

## 一次性設定

1. HubSpot → 設定 → 整合 → 私人應用程式 → 建立，權限勾選 `content`、`marketing-email`（或 `marketing.email.write`）
2. GitHub repo → Settings → Secrets → Actions，新增：
   - `HUBSPOT_TOKEN`（必填）
   - `HUBSPOT_SUBSCRIPTION_ID`、`NEWSLETTER_FROM_NAME`、`NEWSLETTER_REPLY_TO`（選填）

## 本機預覽

```
DRY_RUN=true node publish.mjs issues/2026-11-17.json   # 輸出 .out/issue-2026-11-17.html
```

## 內容規則
- `**粗體**` 會轉成品牌綠粗體；其他 HTML 一律跳脫
- 數字、法規日期要能附出處；Bloomberg 一律寫「規劃整合」
