# Teams 模組 · `/teams`（團隊成員與關鍵利益關係單位）

`symcio.tw/teams` 子分頁。設計成「自成一塊、好搬移、好維護」的模組，
方便日後團隊人員自行增修，或整塊獨立出去成為單獨 repo。

## 檔案結構（這個模組只碰這幾個檔）

```
app/teams/page.tsx                 # 頁面排版（沿用全站 Navigation / Footer 與設計語彙）
app/teams/README.md                # 本說明
lib/teams/teams.data.ts            # ★ 唯一資料來源：成員 / 顧問 / 利益單位都在這
components/teams/Avatar.tsx        # Notion 風線條插畫頭像庫（純 SVG，單色可換色）
components/teams/StakeholderLogo.tsx  # 單位單色 LOGO 元件（CSS mask → 可換色）
public/teams/logos/*.svg           # 各單位「單色」LOGO（佔位，覆蓋同名檔即可換正式版）
```

外部只動了兩個既有檔，加上一條導覽連結：
`components/Navigation.tsx`、`components/Footer.tsx`、`public/sitemap.xml`。

## 日常維護：怎麼增修人員 / 單位

全部在 **`lib/teams/teams.data.ts`** 一支檔完成，不必碰排版：

- **改 CEO/COO/CFO/CTO**：編輯 `LEADERSHIP` 對應那筆的 `name` / `nameEn` / `focus`。
  人員到任後把 `simulated` 改成 `false`，金色「模擬」標記就會消失。
- **新增顧問**：在 `ADVISORS` 陣列加一筆即可。
- **新增 / 修改利益關係單位**：在 `STAKEHOLDERS` 加一筆；
  正式化時把 `homophone` 改 `false`、`alias` 改正式名稱。

### 換頭像
`avatar` 欄位填 `line-01` ~ `line-08`（見 `components/teams/Avatar.tsx`）。
要新風格就在 `Avatar.tsx` 的 `FOREGROUND` 加 `line-09` …。
之後要放真人照片：把照片放 `public/teams/`，在該筆填 `photo: "/teams/xxx.jpg"`，
卡片會自動優先用照片。

### 換單位單色 LOGO（重點：好統一替換）
- LOGO 透過 **CSS mask** 渲染成單色，顏色吃 `currentColor`，
  所以整站要統一調色，只要改卡片外層文字色（資料檔的 `accent` token）。
- 換正式 LOGO 時：把 `public/teams/logos/<id>.svg`
  **覆蓋成同名檔**（內容為單色實心形狀的 SVG）即可，頁面與程式都不用動。
- 沒給 `logo` 時，會自動用代稱首字產生單色字標（monogram）後備。

### 可用單色 token（沿用 `tailwind.config.ts`）
`accent`(深綠) · `excellent`(綠) · `good`(藍) · `warning`(金) · `gold`(編輯金)。
只用這些 token，確保整站色調一致、好統一替換。

## 籌備期合規重點
- 公司尚未正式設立，依規定**不使用任何單位官方 LOGO**；
  目前單位名稱皆為**諧音 / 非正式代稱**，LOGO 為示意佔位。
- C-Level 與顧問皆為**模擬佔位**，卡片以金色「模擬」標記清楚標示。
- 頁面底部有「籌備期聲明」，說明不構成聘任 / 合作 / 授權 / 背書關係。

## 之後要獨立成單獨 repo？

本模組刻意零外部相依（只用到全站既有的 `Navigation` / `Footer` 與 Tailwind token），
搬移很單純：

1. 把上面「檔案結構」列出的 `app/teams`、`lib/teams`、`components/teams`、
   `public/teams` 四個資料夾整包搬到新 repo（同為 Next.js App Router 專案）。
2. 帶上 `tailwind.config.ts` 的色票（或保留同名 token）。
3. 若新 repo 沒有 `Navigation` / `Footer`，把 `page.tsx` 上下兩個元件換成
   新專案的對應版本即可。
4. 在原站以子網域 / 反向代理（例如 `team.symcio.tw` 或 rewrite `/teams`）掛回，
   即可維持 `symcio.tw/teams` 的對外網址。

> 註：目前 GitHub 操作權限僅限既有的 `sall911/symcio` 與
> `sall911/brandos-infrastructure` 兩個 repo，因此實際「新建獨立 repo」需由
> 具權限的帳號操作；本模組已先做到「可一鍵搬移」的程度。
