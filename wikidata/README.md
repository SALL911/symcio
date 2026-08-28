# Wikidata Automation for User:Symcio

自動化建立 / 更新 [User:Symcio](https://www.wikidata.org/wiki/User:Symcio) 名下 Wikidata items 的腳本套件。基於 [pywikibot](https://www.mediawiki.org/wiki/Manual:Pywikibot)（Wikidata 官方推薦的 Python 框架），支援 dry-run、批次匯入、SPARQL 查詢與 GitHub Actions 排程。

## 目錄結構

```
wikidata/
├── sync_items.py            # 主腳本：從 data/items.json 建立/更新 items
├── query.py                 # SPARQL 查詢工具
├── lib/
│   ├── client.py            # pywikibot 薄封裝
│   └── schema.py            # items.json 驗證
├── data/
│   └── items.example.json   # 範例資料
├── requirements.txt
├── user-config.py.example   # pywikibot 設定範本
└── .env.example
```

## 快速開始

### 1. 安裝依賴

```bash
cd wikidata
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

### 2. 設定 pywikibot

複製設定範本並填入 Wikidata 帳號：

```bash
cp user-config.py.example user-config.py
cp .env.example .env
```

編輯 `.env`：

```
WIKIDATA_USERNAME=Symcio
WIKIDATA_PASSWORD=your-bot-password   # 建議使用 BotPassword: https://www.wikidata.org/wiki/Special:BotPasswords
```

> ⚠️ **不要使用主帳號密碼**。請到 [Special:BotPasswords](https://www.wikidata.org/wiki/Special:BotPasswords) 為 Symcio 建立 Bot Password，授予 `edit`, `createeditmovepage`, `highvolume` 權限。

### 3. 登入並驗證

```bash
python -m pwb login
```

### 4. 準備資料

複製範例並編輯成你要建立 / 更新的 items：

```bash
cp data/items.example.json data/items.json
```

資料格式（節錄）：

```json
{
  "items": [
    {
      "id": null,                       // null = 建立新 item；填 Q123456 = 更新
      "labels":      { "en": "Symcio", "zh-tw": "Symcio" },
      "descriptions":{ "en": "AI brand visibility platform" },
      "aliases":     { "en": ["Symcio Inc"] },
      "statements": [
        { "property": "P31", "value": { "type": "item", "id": "Q4830453" } },
        { "property": "P856", "value": { "type": "url", "value": "https://symcio.com" } }
      ]
    }
  ]
}
```

### 5. Dry-run（不會真的寫入）

```bash
python sync_items.py --input data/items.json --dry-run
```

### 6. 實際執行

```bash
python sync_items.py --input data/items.json
```

執行後，腳本會把每個 item 對應的 QID 寫回 `data/items.json`（in-place），下次再跑就會走「更新」路徑。

## SPARQL 查詢

查詢 Symcio 過去編輯過的 items：

```bash
python query.py --user Symcio --limit 50
```

或自訂查詢：

```bash
python query.py --sparql "SELECT ?item ?itemLabel WHERE { ?item wdt:P31 wd:Q4830453. SERVICE wikibase:label { bd:serviceParam wikibase:language 'en'. } } LIMIT 10"
```

## GitHub Actions 排程

`.github/workflows/wikidata-sync.yml` 已預設每天 03:00 UTC 跑一次 dry-run，並可手動 dispatch 跑實寫。需在 repo Settings → Secrets 加入：

- `WIKIDATA_USERNAME`
- `WIKIDATA_PASSWORD`

## 常見問題

**Q: 怎麼避免重複建立？**  
A: `sync_items.py` 以 `id` 欄位為準。若 `id` 為 `null` 但相同 label+description 已存在於 Wikidata，腳本會先查詢、找到就回填 QID，避免重複。

**Q: 觸發 maxlag / rate limit？**  
A: pywikibot 已內建 throttling。如遇大量寫入，請在 `user-config.py` 調整 `put_throttle = 10`。

**Q: 要怎麼回滾？**  
A: 所有編輯會記錄在 [User:Symcio 的貢獻頁](https://www.wikidata.org/wiki/Special:Contributions/Symcio)，可逐筆 undo。
