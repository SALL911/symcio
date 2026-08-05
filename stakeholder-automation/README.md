# Symcio 利害關係人自動發信系統 (stakeholder-automation)

把 `symcio.tw/news`（每週電子報，資料源 `lib/news-data.ts`）+ 你的每週業務更新，
自動整理成**分眾信件**，並在 Gmail（Google Workspace `info@symcio.tw`）**建立草稿**——
**永遠只建草稿、絕不自動寄出**。你審完再手動寄。

對應 Notion 資料庫：**「Symcio 關鍵利益人地圖 — Key Stakeholders」**
(data source id `22754f79-a074-48b0-8e81-a9b8fb43cf5c`)。

---

## ⚠️ 法規紅線（寫進系統、不可繞過）

所有對外信件模板一律**不得**出現下列字眼，送黃意森律師審核前不外流：

| 禁用 | 原因 |
|---|---|
| 博弈 / 投注 / 賠率 / 電競博弈平台 | 台灣刑法，線上賭博全面違法 |
| Brand Token / 成長份額 / 分潤型代幣 | 證交法有價證券，須走持牌 STO |
| 以基金會「背書」金融商品合法性 | 財團法人為公益性質，不得當金融外殼 |

合法可講：DPP 合規數據層、ISO 10668 品牌估值、TNFD/GHG 盤查、AI 可見度、
資料雜湊存證（hash anchoring，與發幣嚴格分開）。

---

## 安全設計

- **Draft-only**：程式只呼叫 `gmail.users.drafts.create`，沒有任何 send 呼叫。
- **DRY_RUN 預設 true**：本機跑預設只把 `.eml` 預覽寫到 `.out/`，不碰 API。
- 設 `DRY_RUN=false` 才會真的在 `info@symcio.tw` 建立草稿（仍不寄出）。
- 找不到確認 email 的收件人，草稿一律建到 `GMAIL_USER`（你自己）作備份。

---

## 安裝

```bash
cd stakeholder-automation
npm install
cp .env.example .env   # 填入 Gmail OAuth 憑證
```

## 每週流程

1. `symcio.tw` 的 `lib/news-data.ts` 新增當週電子報 entry（已是既有流程）。
2. 編輯 `weekly-update.md`（複製 `weekly-update.example.md`）寫你這週的業務更新。
3. 預覽：`npm run drafts:dry` → 看 `.out/` 裡每封信。
4. 建草稿：`npm run drafts`（`DRY_RUN=false`）→ 到 Gmail 草稿匣審閱、手動寄出。

## 自動化（GitHub Action）

`.github/workflows/weekly-stakeholder-digest.yml` 每週一 09:00 (台北) 自動
**建立草稿**（需在 repo Secrets 設 `GMAIL_*`）。手動觸發時預設 dry-run。

## 收件人清單

`stakeholders.json` 是 Notion 地圖的鏡像。`weeklyOptIn: true` 的人才會收到每週摘要
（暖關係：顧問/夥伴/已洽談單位）。冷接觸的國際機構走一次性 intro（見 `templates.ts`），
不進每週名單。

## 手機/桌機 Outlook、Google Workspace 帳號同步

那是**裝置端帳號設定**，不在本系統範圍。設定方式見 `docs/email-sync.md`。
