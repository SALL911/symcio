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
- **Bcc 寄件備份**：每封草稿都帶 `Bcc: sall@symcio.tw`（可用 `BACKUP_BCC` 覆寫）。
  草稿手動寄出時，備份副本會同時送達。收件人本身就是備份信箱時會自動略過 Bcc。
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


---

## 媒體代理商外聯（18 家 + MAA 公會）

名單 SSoT 在 `BrandOS-Infrastructure` 的 `data/crm/agency_partners.csv`；
本 repo 的 `agencies.json` 是它的鏡像，欄位值與
`schemas/hubspot_crm_schema.json` 的列舉值一致。

### 兩種模板

| 對象 | `orgType` | 信件立場 |
|------|-----------|---------|
| 台北市媒體服務代理商協會（MAA）| `trade_association` | 以**聯合會**身份談委員會與方法論標準，不談商業服務 |
| 18 家媒體代理商 | `media_agency` | 以 **Symcio** 身份談資料層合作（授權／白牌／轉介）|

這個分流不是文案風格差異，是 `docs/NGO_ENTITY_STRUCTURE.md` §2.2 的
NGO 收錢邊界在信件層的落實：**聯合會不賣服務，商業一律走 Symcio。**

### 使用方式

```bash
npm install
npm run agency-drafts:dry    # 預覽 → .out/agencies/*.eml
npm run agency-drafts        # DRY_RUN=false 才會在 Gmail 建草稿
```

### 寄出前的強制檢查

程式會在每封未個人化的草稿頂端印一行紅字 TODO，並在結尾統計還有幾封未補：

```
🔴 19 封尚未填 personalNote — 補齊 agencies.json 後才可寄出。
```

依 `BrandOS-Infrastructure/content/cold-outreach/README.md` 的規範：

- 每封信的**主旨與前兩句**必須提到對方具體近況（案子、得獎、發表、人事）
- **每日人工寄出上限 20 封**；19 封剛好在上限內，但仍建議分兩天
- 3 家（陽獅銳奇、傳立媒體、競立媒體）無公開 email，
  草稿會改建到備份信箱，補上窗口後再寄

### 自動化

`.github/workflows/agency-outreach-drafts.yml` — 手動觸發，預設 dry-run。
需在 repo Secrets 設 `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` /
`GMAIL_REFRESH_TOKEN` / `GMAIL_USER`。

**這個 workflow 不排程、不自動寄信。** 它只產生草稿。
