# Symcio IG 自動化推播系統

每週一 09:00 (UTC+8) 自動把輪播圖發布到 [@symcio.tw](https://instagram.com/symcio.tw)。

## 架構

```
GitHub Actions (cron: 0 1 * * 1)
  │
  ├─ 1. 依當週週數選一套輪播圖 (5 套輪流)
  ├─ 2. Playwright 把 HTML 導出為 7 張 1080×1350 PNG
  ├─ 3. 上傳到 Cloudflare R2 (取得公開 https URL)
  ├─ 4. 呼叫 Instagram Graph API 發布 carousel
  └─ 5. (選配) 同步到 Threads / Facebook / X / Telegram
```

## 目錄

```
ig-automation/
├── README.md                  ← 本檔
├── META_APP_SETUP.md          ← Meta App + R2 + Secrets 一次性設定（必讀）
├── carousels/                 ← 5 套輪播圖 HTML
├── scripts/
│   ├── export_slides.py       ← HTML → PNG（Playwright）
│   ├── ig_publish.py          ← IG Graph API 發布
│   ├── upload_r2.py           ← 上傳到 R2 / GitHub Pages
│   ├── cross_post.py          ← 同步到 Threads/FB/X/Telegram
│   ├── fetch_ig_credentials.py← 一次性：拿 token + IG_USER_ID
│   └── run_weekly.py          ← 主流程入口（workflow 呼叫這個）
├── templates/                 ← Symcio logo SVG
├── requirements.txt
├── .env.example
└── .gitignore
```

Workflow 檔案在 repo 根：`.github/workflows/ig-weekly-post.yml`

## 快速開始（給你看的，不是給 Claude）

讀 [`META_APP_SETUP.md`](./META_APP_SETUP.md)，跟著做 Step 1-7。整套需要約 25 分鐘。

最後一步是到 GitHub Actions 手動跑一次 workflow（先 `dry_run=true` 看 PNG，再 `dry_run=false` 真發）。

## 本地測試

```bash
cd ig-automation
pip install -r requirements.txt
python -m playwright install chromium

# 只導 PNG，不發 IG（不需要任何 token）
cd scripts
python export_slides.py ../carousels/carousel-01-cmo.html /tmp/test-slides 7
open /tmp/test-slides/slide_1.png

# 拿到 token 後測試發布（注意：會真的發到 @symcio.tw）
export META_ACCESS_TOKEN=...
export IG_USER_ID=...
export R2_ENDPOINT=... R2_ACCESS_KEY=... R2_SECRET_KEY=... R2_BUCKET=symcio-ig R2_PUBLIC_URL=...
python run_weekly.py
```

## 5 套輪播圖

| 檔案 | 受眾 | 文案角度 |
|---|---|---|
| `carousel-01-cmo.html` | 行銷長 | 「你問 AI，AI 回答裡有你嗎？」 |
| `carousel-02-ceo.html` | CEO | 「為什麼星巴克咖啡賣得貴？」 |
| `carousel-03-investor.html` | 投資人 | 「下一個 Google 是 AI 搜尋」 |
| `carousel-04-gov.html` | 政府/媒體 | 「台灣品牌在 AI 世界看得見嗎？」 |
| `carousel-05-dev.html` | 開發者 | 「沒有人在量化 AI 排名」 |

## License

Private — Symcio internal use only.
