# 品牌治理雙週刊 · 自動寄送

## 運作方式

| 時間（台北） | 動作 |
|---|---|
| 每週五 09:00 | 把下週二那期寄**預覽**給 `PREVIEW_TO`。沒有期數檔、或 `status` 不是 `ready`，會寄警示信 |
| 每週二 09:00 | `issues/<當天日期>.json` 存在且 `"status": "ready"` → 同步訂閱者並寄給全體 |

兩週一期由期數檔日期控制：沒有當天的檔案就不寄。重複觸發不會重寄（同名 broadcast 已寄就略過）。

- 訂閱入口：symcio.tw/subscribe（HubSpot 表單 `dedb5e0d-…`）
- 寄送：Resend Broadcasts。HubSpot 本帳號不是 Marketing Hub Enterprise，API 不能寄行銷信
- CRM：訂閱者每期寄送時回寫 Attio「雙週刊訂閱者」名單（= 有行銷同意的人）。名片、通訊錄匯入的聯絡人不在此名單，不會收到電子報
- 取消訂閱：Resend 每封信自帶連結；同步時只新增聯絡人，不會把已取消的人加回來

## 新增一期

1. 複製 `issues/2026-12-01.json`，檔名改成發刊日（週二），`status` 先設 `draft`
2. 週五收到預覽信，確認內容
3. 把 `status` 改成 `ready`，合併到 `main`

## 一次性設定（GitHub → Settings → Secrets and variables → Actions）

| Secret | 內容 |
|---|---|
| `RESEND_API_KEY` | Resend API key（Sending + Audience 權限） |
| `RESEND_SEGMENT_ID` | Resend → Audience → Segments 建「Symcio 雙週刊」後的 ID |
| `NEWSLETTER_FROM` | 例：`Symcio 全識 <news@symcio.tw>`，symcio.tw 需先在 Resend 驗證 DNS |
| `NEWSLETTER_REPLY_TO` | 選填，例：`info@symcio.tw` |
| `PREVIEW_TO` | 預覽收件人，逗號分隔 |
| `HUBSPOT_TOKEN` | HubSpot 私人應用程式 token，勾 `forms` 權限（讀表單提交） |
| `ATTIO_API_KEY` | 選填。Attio → Workspace settings → Developers 建 access token，給 Records、Lists 讀寫權限；寄送時把訂閱者回寫 Attio 名單「雙週刊訂閱者」 |

設定完先手動跑一次：Actions → Newsletter → Run workflow → mode=send、force_date=當期日期、dry_run=true，看名單數是否正確。

## 本機

```
DRY_RUN=true FORCE_DATE=2026-12-01 node send.mjs preview
DRY_RUN=true node publish.mjs issues/2026-11-17.json   # 舊路徑：只建 HubSpot 草稿（手動寄）
```

## 內容規則
- `**粗體**` 會轉成品牌綠粗體；其他 HTML 一律跳脫
- 數字、法規日期要能附出處；Bloomberg 一律寫「規劃整合」
- Symcio 只量測，不寫「幫你修正／優化」
