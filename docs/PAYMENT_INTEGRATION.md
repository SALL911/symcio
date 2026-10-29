# 金流串接建議 — symcio.tw

## 一、先處理的限制（決定路線）

| 限制 | 影響 |
|------|------|
| Stripe 不開放台灣登記的公司 / 個人開戶 | 現有 `/api/checkout`（Stripe, USD）必須由海外法人（如 US LLC）收款；以台灣公司收款不可行 |
| 台灣公司銷售須開立統一發票（電子發票） | 國內 B2B 客戶要求三聯式（統編）發票；Stripe 不開台灣發票，需另接加值中心 |
| 法人籌備期（Footer 已揭露） | 公司登記與營業登記完成前，國內金流商只能以「個人賣家」開通，額度與功能受限，且不能開公司發票 |
| 訂閱制自動扣款 | 國內需用金流商「定期定額」功能，審核較單次付款嚴格（需服務條款、退款政策頁） |
| 個資 / PCI | 一律使用金流商託管付款頁（hosted checkout），網站不經手卡號 |

## 二、建議架構：雙軌

```
                       /pricing
                 ┌────────┴────────┐
          台灣客戶（TWD）      海外客戶（USD）
                 │                 │
          綠界 ECPay          Stripe Checkout（現有）
     信用卡 / ATM / LINE Pay      │
     定期定額 + 電子發票 API       │
                 │                 │
     /api/webhooks/ecpay   /api/webhooks/stripe（現有）
                 └────────┬────────┘
              Supabase orders / subscriptions
                          │
         members.plan 升級（service role）→ lib/sync/member.ts
                          │
              HubSpot deal + contact.symcio_member_plan
```

**國內首選：綠界 ECPay**
- 個人賣家可先開通（籌備期可用），公司登記後升級為特約商店
- 同一家整合：信用卡（含定期定額）、ATM 虛擬帳號、超商代碼、LINE Pay、Apple Pay
- 內建電子發票 API（B2C 載具 / 捐贈、B2B 統編），付款成功即自動開立
- 替代方案：藍新 NewebPay（功能相近）；TapPay（前端體驗佳、需公司、發票需另接）

**海外：保留 Stripe**，前提是收款主體為海外法人並據實申報；否則先關閉 USD 方案。

## 三、執行步驟

| 週 | 項目 | 產出 |
|----|------|------|
| W1 | 綠界申請（個人或公司）、取得測試 MerchantID / HashKey / HashIV | Vercel env：`ECPAY_MERCHANT_ID`、`ECPAY_HASH_KEY`、`ECPAY_HASH_IV`、`ECPAY_ENV=stage` |
| W1 | 補齊審核必要頁：服務條款、隱私權政策、退款政策（Footer 目前為 mailto 連結，需改為實際頁面） | `/terms`、`/privacy`、`/refund` |
| W2 | `lib/ecpay/checkmac.ts`（CheckMacValue：參數排序 → URL encode → SHA256 → 大寫）＋ `/api/checkout/ecpay` 產生 AioCheckOut 表單自動送出 | 單次付款（Audit） |
| W2 | `/api/webhooks/ecpay`：驗 CheckMacValue → `RtnCode=1` 寫 `orders` → 回 `1|OK` | 冪等：以 `MerchantTradeNo` 為唯一鍵 |
| W3 | 定期定額（`PeriodAmount` / `PeriodType=M`）＋ 每期 `PeriodReturnURL` 回呼更新 `subscriptions.current_period_end` | 月訂閱方案 |
| W3 | 電子發票：付款成功 webhook 內呼叫綠界發票 API；會員中心加「統編 / 載具」欄位 | 自動開票 |
| W4 | 付款成功 → `members.plan` 升級 + `monthly_audit_quota` 調整 → `syncMember()` 更新 HubSpot；建立 HubSpot deal（stage = closed won） | CRM 營收可追蹤 |
| W4 | 正式環境切換（`ECPAY_ENV=prod`）、小額實刷、退款演練 | 上線 |

會員綁定：結帳一律要求登入，`orders.member_id = auth.uid()`，webhook 以此升級方案；未登入的 Gumroad / Stripe 舊訂單以 email 對應 `members.email` 回填。

## 四、決策需你確認

1. 收款主體：台灣公司（預計何時完成登記）或海外法人 —— 決定 Stripe 是否保留
2. 國內方案定價：月訂閱價（TWD，含稅）與是否提供年繳折扣
3. 發票：是否需要 B2B 三聯式（多數企業客戶會要求）

確認後即可開工 W1–W2 的程式碼（ECPay checkout + webhook + 會員升級）。
