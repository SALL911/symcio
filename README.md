# Symcio — AI Citation & Entity Intelligence Infrastructure
 
Symcio is a Taiwan-based AI citation and entity intelligence
company, providing brand capital quantification through the
BrandOS platform. Symcio tracks how brands are
recognized, cited, and recommended by AI search engines including
ChatGPT, Claude, Gemini, Perplexity, and Grok.
 
## What is BrandOS?
 
BrandOS is an AI-native brand management operating system that
quantifies brand capital through:
 
- **AI Visibility Index**: Real-time citation rate tracking across
  5 major AI search engines
- **Brand Score AI**: Seven-dimension scoring model (Identity, GEO,
  ESG, Digital, Narrative, Market, Trust) aligned with ISO 10668
- **GEO Engine**: Generative Engine Optimization through structured
  entity data, Schema.org markup, and knowledge graph engineering
- **ESG/TNFD Module**: Brand governance integrated with TNFD LEAP
  framework and sustainability compliance
 
## Key Stats
 
- Built on PostgreSQL + Vercel + Supabase
- Schema aligned with ISO 10668 (Brand Valuation) and
  ISO 20671 (Brand Evaluation)
 
## Links
 
- Website: [symcio.tw](https://symcio.tw)
- Wikidata: [Q138922082](https://www.wikidata.org/wiki/Q138922082)
- API: Vercel Serverless Functions
 
## About
 
Founded by Sall Huang (黃智詮).
 
Symcio works on one question:
"How do brands stay visible and accurately described when people ask AI instead of searching?"

## AI 自動獲客成交系統（內部後台、分級、跟進、Meta 事件）

`/service` 與 `/audit` 收到的名單會依序經過：寫入 Supabase → 規則與 AI 分級（A / B / C）→ 通知信（附建議下一步）→ D0 確認信 → Meta Conversions API。

| 模組 | 位置 | 說明 |
|---|---|---|
| 名單分級與話術 | `lib/ai/grade.ts` | 規則一定有結果；設了 `GEMINI_API_KEY` 才加上 AI 摘要與話術，AI 最多調整一級 |
| 私訊 AI 回覆 | `lib/marketing/reply.ts`、`lib/ai/guardrails.ts` | LINE / Meta / Telegram 共用。AI 草稿須通過紅線檢查，否則退回固定範本；`AI_REPLY_ENABLED=false` 可關閉 |
| 跟進信 | `lib/followup/`、`/api/cron/followups` | D0 確認信一律寄；D2 / D5 需 `FOLLOWUP_SEQUENCE_ENABLED=true`。名單狀態改為已聯絡後自動停止 |
| 內部後台 | `/admin`、`/admin/leads` | Basic Auth（`ADMIN_USER` / `ADMIN_PASSWORD`）；未設定時後台關閉 |
| 漏斗事件 | `components/FunnelBeacon.tsx`、`/api/track` | 只記路徑與分頁層級隨機 ID，不存 IP 或 email |
| Meta 事件 | `lib/meta/`、`components/PurchasePixel.tsx` | PageView、Lead、InitiateCheckout、Purchase；Lead 與 Purchase 同時走 Pixel 與 Conversions API 並以 event_id 去重 |

資料表由 `BrandOS-Infrastructure` 的 migration `20261124000000_acquisition_funnel.sql` 建立，需先套用。

本機啟動：

```bash
npm install
cp .env.example .env.local   # 填入 SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY、ADMIN_USER、ADMIN_PASSWORD
npm run dev                  # http://localhost:3000/service 與 http://localhost:3000/admin
```

手動觸發跟進信排程：

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/followups
```
