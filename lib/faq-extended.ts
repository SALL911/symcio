/**
 * 擴充 FAQ 題庫 — 由原 public/faq/{category}/index.html 靜態頁的 FAQPage JSON-LD 移入。
 *
 * 原靜態頁只能透過 /faq/<key>/index.html 存取（乾淨 URL 會 404 或被 app route 覆蓋），
 * 內容實際上沒被索引。移入後由 app/faq/[category] 統一渲染與輸出 FAQPage schema。
 */

import type { FaqCategoryKey, FaqEntry } from "./faq-data";

export const FAQ_EXTENDED: Record<FaqCategoryKey, FaqEntry[]> = {
  enterprise: [
    {
      q: "AI 可見度（AI Visibility）是什麼？為什麼企業主必須現在關心？",
      a: "AI 可見度是指企業品牌在 ChatGPT、Claude、Gemini、Perplexity 等生成式 AI 引擎回答內出現的頻率、排名與脈絡。超過 50% 的 B2B 採購者在打開 Google 之前已先問 AI，如果你的品牌在 AI 回答中缺席，你就失去了這層新注意力入口。Symcio 將 AI 可見度量化為可稽核指標，讓企業主能像看 Google Analytics 一樣追蹤品牌在 AI 裡的表現。",
    },
    {
      q: "GEO（Generative Engine Optimization）和 SEO 的差別是什麼？為什麼兩者都要做？",
      a: "SEO 優化的是 Google 搜尋結果（十條藍色連結）；GEO 優化的是 AI 引擎生成答案（自然語言段落）。SEO 依賴關鍵字密度、反向連結、網域權重；GEO 依賴結構化內容、事實一致性、以及品牌在 AI 訓練語料中的分佈。SEO 的買家會看十個連結後做選擇，GEO 的買家接收 AI 推薦的三到五個名字就決定，轉換路徑更短、競爭更集中。兩者並存，但 AI 答案的權重正快速超過傳統 SERP。",
    },
    {
      q: "品牌在 ChatGPT、Gemini 的曝光率怎麼量化？",
      a: "Symcio 使用標準化測試 prompt（依產業 20 題，分為 top_companies、alternatives、problem、comparison 四類），對 ChatGPT、Claude、Gemini、Perplexity 同時送出相同查詢，再解析每次回答中品牌是否被提及、排名位置、競品同框與情感走向。指標包含 Mention Rate、Top-3 Share、Average Rank、Sentiment Index，組合成 0–100 的 ABVI（AI Brand Visibility Index）綜合分數。完整方法論公開於 github.com/SALL911/BrandOS-Infrastructure。",
    },
    {
      q: "我的品牌在 AI 搜尋裡完全消失了，該怎麼辦？",
      a: "先做 Symcio Free Scan 取得基準分數，確認是「完全未被提及」還是「被提及但排名落後」。完全未提及通常代表品牌資料在 AI 訓練語料中密度不足，解法是建立 GitHub、Medium、Reddit 等高權重語料來源；排名落後則需針對具體查詢做結構化內容優化。我們的 $299 AI Visibility Audit 會列出三項具體改善建議，預估 30 天內可提升分數的量級。",
    },
    {
      q: "BrandOS 怎麼幫我提升 AI 搜尋排名？",
      a: "BrandOS 是 Symcio 的 SaaS 平台，提供三個層次的服務：診斷（Audit，找出可改善項目）、優化（Optimization，實作並追蹤 90 天）、治理（Intelligence Subscription，每日追蹤與季策略）。平台串接 Supabase 儲存結構化資料，透過 GitHub Actions 每日自動跑 AI 引擎查詢，產出趨勢圖與改善建議。目標是把品牌從 Invisible（0–24 分）推進到 Competitive（50–74 分）以上。",
    },
    {
      q: "一份 Symcio AI Visibility Audit 報告包含什麼？",
      a: "標準 10 頁結構：Executive Summary（整體分數與百分位）、四引擎明細分析（每個引擎獨立指標）、競品對比雷達圖、三項可執行改善建議（Why/What/How/預期提升）、本週與 30 天行動清單、測試方法論與資料可重現性證明。報告以 PDF 形式在付款後 24 小時內寄到客戶 email，並附 30 天內免費重測一次。",
    },
    {
      q: "$299 Audit 與 $1,999 Optimization 的差別在哪？",
      a: "$299 Audit 是「診斷」：告訴你品牌在 AI 裡的現況、問題、可改善項目。$1,999 Optimization 是「執行」：Symcio 團隊直接協助實作三項改善建議，並做 90 天排名追蹤、每週進度報告。Audit 適合第一次了解 AI 可見度的企業；Optimization 適合已經下定決心投入資源優化、想要可驗證成果的團隊。$12,000/年 Intelligence 訂閱則是持續治理階段。",
    },
    {
      q: "ABVI 分數和實際業務指標有什麼關係?",
      a: "Symcio 觀察 ABVI 分數與客戶自行回報的 MQL/SQL、Demo 預約、CAC、Win Rate 等業務指標的相關性。早期匿名觀察樣本顯示在 B2B SaaS 與企業服務業有正向相關趨勢,但樣本數有限,不構成因果關係宣告。AI 曝光不是唯一變項,實際成果取決於產品力、銷售流程、市場時機等多重因素。Symcio 不承諾特定業務指標改善幅度。",
    },
    {
      q: "我的競爭對手在 AI 引擎裡比我強，我要怎麼追上？",
      a: "第一步做 Competitor Gap 分析：Symcio Audit 會列出競品在你缺席的哪些 prompt 類別裡主導答案，以及 AI 最常用哪些關鍵詞描述他們、哪些描述你。第二步針對「你沒有但競品有的敘事屬性」撰寫結構化內容（案例研究、白皮書、Wikidata 條目、GitHub repo），並確保在 Reddit、Medium、Hashnode 等 AI 抓取密集的平台有分佈。第三步定期重測，驗證改善是否進入 AI 訓練語料或即時檢索。",
    },
    {
      q: "我的公司贊助運動賽事,BrandOS 能提供什麼資料?",
      a: "《運動產業發展條例》第 26-2 條等抵稅項目的申報與適用條件,請洽你的會計師、稅務顧問或主管機關認定（Symcio 不提供稅務意見）。BrandOS 在贊助流程中扮演的是資料端角色:(1) 贊助前後跑 Symcio AI Visibility 基準測試,量化贊助帶動的品牌 AI 曝光變化;(2) 產出結構化敘事資料（贊助事件 → ABVI 變化 → 競品對比）,供你的會計師、稅務顧問、稽核單位作為申報參考;(3) 將贊助成果整理成永續報告書「社會議合」與「品牌敘事」章節可用的素材格式。最終的稅務認定與申報責任由企業與其稅務專業人員承擔。",
    },
  ],
  investor: [
    {
      q: "AI 品牌可見度如何量化?",
      a: "Symcio 以 ABVI（AI Brand Visibility Index）作為觀察指標,範圍 0–100,由 Mention Rate、Average Rank、Sentiment Index 等公開可重現因子加權。ABVI 為基於公開 AI 引擎查詢結果的觀察性指標,可作為品牌在 AI 答案層的曝光參考,不構成投資建議或估值意見書。",
    },
    {
      q: "Symcio 相較於 SimilarWeb、SEMrush 等工具的差異?",
      a: "SimilarWeb 量化網站流量,SEMrush 量化 Google 排名,兩者皆為傳統網路時代的觀察工具。Symcio 觀察的是 ChatGPT、Claude、Gemini、Perplexity 四引擎回答中的品牌出現頻率與排名脈絡,屬於不同資料層,並不取代既有工具。Symcio 完整 ABVI 計算方法論於 GitHub 公開,可重現、可查核。",
    },
    {
      q: "Symcio 的 API 接入方式?",
      a: "企業合作方案提供 REST API 接入,可取得 ABVI 分數、歷史趨勢、競品 benchmark 等資料。費率與接入規格依使用情境客製,合格機構可申請技術 PoC。詳細條件請來信 sall@symcio.tw 索取資料。",
    },
    {
      q: "BrandOS 的目標市場?",
      a: "主要 TA 為:(1) 採購流程涉及 AI 搜尋的 B2B SaaS 與企業服務公司;(2) 有國際永續揭露要求的上市櫃公司;(3) 進行品牌投資與贊助成效量化需求的企業行銷部門。詳細市場規模分析、滲透假設與五年商業模型,於合格投資人 data room 提供。",
    },
    {
      q: "主要競品有哪些?",
      a: "類比參考:(1) 國際 AI 監測工具如 Profound、AthenaHQ、BrandRank.AI(以英文市場、單引擎為主);(2) 傳統 SEO/品牌監測工具如 SEMrush、Brandwatch(加入 AI 功能);(3) ESG 資料平台如 MSCI、Sustainalytics(覆蓋 ESG 評級但不含 AI 曝光)。Symcio 切入點為跨四引擎 + 繁中亞太語料 + ESG 資料對齊三軸,各家定位與功能組合不同,實際採購建議請依組織需求評估。",
    },
    {
      q: "AI 引擎資料取得的合規性?",
      a: "Symcio 透過 OpenAI、Anthropic、Google、Perplexity 等業者的官方 API 付費取用,遵守各家 Terms of Service 中「研究與分析」用途相關條款,不進行未授權爬取或逆向工程。測試 prompt 為公開方法論。客戶識別資料以 hash 匿名處理。歐盟客戶資料儲存於 EU 區域,流程依 GDPR 設計。",
    },
    {
      q: "如何用 AI 品牌可見度觀察投資標的的品牌健康度?",
      a: "觀察路徑:(1) 建立標的 ABVI 基準線(免費掃描即可);(2) 對標同產業可比公司 ABVI 分佈;(3) 觀察 12 個月 ABVI 趨勢與標的營收、行銷投放的時間關聯。此為觀察性分析,不取代正式品牌估值或盡職調查,亦不構成證券投資建議。",
    },
    {
      q: "Symcio 的營收模式?",
      a: "產品分三層:單次報告(Audit,公開定價於 /pricing)、企業合作(自訂方案,Contact pricing)、未來訂閱方案(法人實體成立後上架)。詳細收入模型、毛利結構、客戶分布與成長預測,於合格投資人 data room 以 NDA 形式提供。公開頁面不揭露具體財務預測。",
    },
    {
      q: "盡職調查可驗證哪些技術細節?",
      a: "可公開驗證:(1) ABVI methodology 開源於 github.com/SALL911/BrandOS-Infrastructure,clone 後可獨立重現分數計算;(2) Schema.org / Wikidata 工具開源;(3) 公開 prompt 集與評分權重。NDA 後可提供:資料表 schema、實際客戶 ABVI 時序、引擎 API 帳單實況、產業覆蓋深度等。",
    },
    {
      q: "Symcio 與金融資料終端整合的長期路徑?",
      a: "長期路徑圖包含將 ABVI 資料以 REST API、Webhook、CSV 等格式提供給企業內部研究平台、CRM 或第三方資料終端,以及合作對接的可能。當前階段優先提供 REST API 與 Webhook,具體整合方式依客戶既有資料架構協議。任何提及 Bloomberg、SimilarWeb、SEMrush 等名稱僅作為市場類比,Symcio 不主張任何授權、合作、代表或背書關係。",
    },
  ],
  security: [
    {
      q: "BrandOS 如何保護客戶的機敏資料？",
      a: "BrandOS 的資料保護採分層設計：(1) 資料傳輸全程 TLS 1.3；(2) Supabase PostgreSQL 於靜態資料啟用 AES-256 加密，所有表格預設啟用 Row Level Security；(3) API 金鑰、DB 密碼、Notion token 等機密，一律走 GitHub Secrets / Vercel env vars，不進入 repo；(4) 客戶 PII 在跨客戶 benchmark 時以 SHA-256 hash 匿名處理；(5) service_role key 僅 server-side 使用，前端只取 anon + RLS。完整架構文件見 docs/ARCHITECTURE.md §六（安全邊界）。",
    },
    {
      q: "我的 AI 引擎 API key（OpenAI / Anthropic / Gemini）被盜了怎麼辦？",
      a: "立即三步驟：(1) 到該 AI 平台 dashboard 把該 key 標記為 Revoked / Disabled，新舊 key 勿共用；(2) 檢查過去 48 小時的 API 用量帳單（異常激增是關鍵指標），若有可疑消費立即聯繫平台支援申請退款；(3) 檢查 repo 歷史是否有誤 commit 的記錄（git log -p | grep -i 'sk-\\|ntn_'），若有需用 BFG Repo-Cleaner 清除歷史並強制 rotate 所有相關金鑰。長期預防：用 GitHub Secret Scanning + 本機 git-secrets pre-commit hook 雙重阻擋。",
    },
    {
      q: "BrandOS 支援哪些企業認證方式？SSO / SAML / MFA？",
      a: "目前 BrandOS landing 端透過 Supabase Auth 支援 Email + Magic Link、Google OAuth、GitHub OAuth。企業訂閱（$12k/年以上）可啟用 Supabase Pro 的 SAML 2.0 SSO（相容 Okta、Azure AD、Google Workspace）與 MFA（TOTP + WebAuthn）。審計日誌（auth.audit_log_entries）可匯出供 SOC 2 / ISO 27001 稽核。自架部署（On-Premise）的 SSO 支援依客戶既有 IdP 設定客製。",
    },
    {
      q: "客戶資料儲存於哪裡？有符合 GDPR 與個資法嗎？",
      a: "預設儲存於 Supabase Northeast Asia (Tokyo) 區域；歐盟客戶可選 Frankfurt 區域以符合 GDPR 資料境內原則。Symcio 與客戶簽訂 Data Processing Agreement（DPA）作為 Data Processor，遵循 GDPR Article 28 責任。台灣個資法面向：(1) 蒐集告知義務於表單明示；(2) 刪除權於客戶 dashboard 一鍵申請；(3) 資料外流通報 72 小時內寄至主管機關與當事人；(4) 敏感個資（身份證字號、病歷）不予收集。",
    },
    {
      q: "如果我的社群帳號（Facebook、Instagram、LinkedIn）被盜了該怎麼做？",
      a: "SOP（60 分鐘內完成）：(1) 立即到平台「帳號被盜」專頁（Meta 的 facebook.com/hacked、LinkedIn 的 linkedin.com/help）啟動找回流程；(2) 聯絡你的簡訊與 email 服務商鎖定 2FA 備用通道；(3) 發公告告知受眾帳號被盜，避免釣魚擴散（可從官網、其他未被盜帳號、Discord 社群發）；(4) 完成找回後立刻更換密碼、啟用 WebAuthn（硬體金鑰）、檢查授權應用清單；(5) 品牌層面：用 Symcio 追蹤 24–72 小時內 AI 引擎是否出現帳號被盜的錯誤敘事，及早修正。",
    },
    {
      q: "我的商標在 AI 引擎被他牌冒用了怎麼辦？",
      a: "AI 把你的商標誤連到競品或假冒品，處理路徑：(1) 留存截圖與可重現的 prompt，作為後續證據；(2) 對 ChatGPT / Claude / Gemini / Perplexity 各自的「Report inaccurate response」管道送出更正；(3) 若商標有註冊，可透過 DMCA notice 要求下架（適用於 Perplexity 引用的外部網頁）；(4) 長期解決：在 Wikidata 建立企業條目並聲明商標，高品質來源（官網 Schema.org、Wikipedia）有更高機率覆蓋錯誤敘事；(5) Symcio Intelligence Subscription 提供每日監控與早期預警。",
    },
    {
      q: "多人協作時如何做細粒度權限管理？",
      a: "BrandOS 採 RBAC（Role-Based Access Control）三級：Viewer（只能看報告）/ Editor（可觸發 audit 但不能改 billing）/ Admin（完整權限含刪除）。企業訂閱提供「品牌隔離」：同一 workspace 下多個品牌，每位成員可被授予特定品牌的特定角色。所有權限變更進入 audit log，含操作者、時間、IP、舊/新值，可供 SOC 2 CC6 控制項稽核。需要更細的 ABAC（屬性式權限）請聯繫 sales。",
    },
    {
      q: "Symcio 有審計日誌（Audit Log）功能嗎？",
      a: "有。事件三層：(1) 資料庫層——Supabase 自動記錄所有 INSERT/UPDATE/DELETE 於 pg_audit；(2) 應用層——/api/* 路徑的每次請求記 timestamp + user_id + action + resource + result；(3) 整合層——Stripe webhook、GitHub dispatch、Composio action 皆寫入 orders.notes / workflow_runs.logs。所有日誌保留 90 天（企業訂閱可延長至 7 年以符合法規），支援匯出 JSON / CSV。",
    },
    {
      q: "BrandOS 可以自架（On-Premise）嗎？有哪些限制？",
      a: "可以。所有核心程式碼（schema、scripts/geo_audit.py、workflows）皆 MIT 授權開源於 github.com/SALL911/BrandOS-Infrastructure。自架需求：PostgreSQL 15+、Node.js 18+、GitHub Actions Enterprise 或 self-hosted runner、Supabase self-hosted 或任意 Postgres。你需自行管理 AI 引擎 API 金鑰與用量。自架版不享 Symcio 的跨客戶 benchmark（因無匿名池）與 Composio 整合，但核心 ABVI 功能一致。企業自架諮詢 sales@symcio.tw。",
    },
    {
      q: "若 Symcio 發生資料外洩，你們的通報流程？",
      a: "事件響應（IR）三階段：(1) 偵測後 2 小時內——封鎖受影響系統，啟動事件指揮官（由 CTO 擔任）；(2) 24 小時內——通知受影響客戶並寄送初步報告，同步通報主管機關（台灣數位發展部 iThome-ISAC、歐盟客戶則 72 小時內通知 DPA）；(3) 72 小時內——公開完整 post-mortem（不含敏感細節），說明原因、影響範圍、補救措施、預防改善。歷年事件清單與 RCA 於 status.symcio.tw 公開（路徑圖 Y1 完成建置）。",
    },
  ],
  creator: [
    {
      q: "個人創作者也需要 AI 可見度治理嗎？",
      a: "需要，而且比企業更急迫。個人品牌在 AI 引擎的答案中缺席，等於新一代讀者、合作方、客戶問 ChatGPT「台灣有哪些 XX 領域的創作者」時完全找不到你。Symcio 觀察到：有 Wikidata 條目 + GitHub / Notion 公開作品集 + 穩定發文節奏的創作者，ABVI 分數顯著高於只在 Instagram 或 Facebook 活躍者。Free Scan 能在 30 秒內告訴你是否已在 AI 雷達上。",
    },
    {
      q: "我的作品會在 ChatGPT 被提到嗎？怎麼測試？",
      a: "可以自測也可用 Symcio。自測方法：直接到 ChatGPT / Claude / Gemini / Perplexity 問「推薦台灣 [你的領域] 的 [類型] 創作者」「介紹 [你的本名/藝名]」「類似 [知名創作者] 的台灣創作者有誰」，比較回答中你是否被提及、如何被描述、排名在第幾位。更系統的方式是用 Symcio Free Scan 用 4 個引擎同時測試，把結果寫進 Supabase 建立基準線，日後每月追蹤變化。",
    },
    {
      q: "AI 會不會拿我的作品去訓練、變相抄襲？",
      a: "已公開發表的內容（網站、部落格、YouTube、Medium）有可能被 AI 公司納入訓練資料——這是法律灰色地帶，目前多國正在立法。三個面向應對：(1) 防禦——在 robots.txt 加 GPTBot、ClaudeBot、Google-Extended 的 Disallow，可以表態不同意被訓練；(2) 利用——反過來主動優化內容結構，讓 AI 引用時正確署名你（這是 GEO 的精神）；(3) 法律——已發表作品仍受著作權保護，發現 AI 生成物近似你的作品時可提訴訟主張（參考 NYT v. OpenAI 2023）。",
    },
    {
      q: "如何讓 AI 引用我的名字和作品時不出錯？",
      a: "四個結構化資料來源要做對：(1) Wikidata 條目——建立個人條目並加入 sitelinks、occupation、notable works 三個欄位；(2) 個人官網——加入 schema.org Person + CreativeWork JSON-LD 標記；(3) Wikipedia 條目（若符合獨立關注性標準）——是 AI 最信任的來源之一；(4) GitHub / Behance / Dribbble / IMDb 等行業權威平台。這四者齊備後，AI 敘事的準確度會顯著提升。",
    },
    {
      q: "個人 IP（Intellectual Property）如何用 BrandOS 管理？",
      a: "BrandOS 的 Layer 4（knowledge_nodes）與 Layer 7（IP assets）原本就為 IP 管理設計，可儲存：作品清單、授權紀錄、註冊商標、合作合約里程碑。個人創作者典型用法：用 Notion 做每天創作記錄 + 合作草稿，每天由 notion-sync.yml 自動同步進 knowledge_nodes 表，作為 IP 歷史的結構化紀錄。這份紀錄同時是你對 AI 證明原創性的資料庫（時序戳 + SHA-256 內容 hash）。",
    },
    {
      q: "創作者方案和企業方案有什麼差別？",
      a: "目前 Symcio 的定價以企業為主（Free Scan $0 / Audit $299 / Optimization $1,999 / Subscription $12k），創作者方案在 2026 Q3 推出，預期結構：(1) Creator Free——1 個個人品牌、每月重測 1 次 ABVI；(2) Creator Pro $29/月——3 個品牌、每週重測、包含 Wikidata 條目建立協助；(3) Creator Studio $99/月——10 個品牌、日追蹤、含作品集結構化服務。若你想搶先試用，可在 Discord 社群提出申請。",
    },
    {
      q: "YouTube、Podcast 節目會被 AI 搜尋到嗎？",
      a: "會，但程度不一。YouTube 由 Google 擁有，Gemini 的 grounding 優先整合 YouTube 內容（標題、描述、字幕）。Podcast 則依平台有差：Apple Podcasts 的 RSS 可被爬，Spotify 閉源度較高需官方合作。提升 AI 可見度三招：(1) 逐字稿上傳 Whisper 轉譯後貼在節目頁，AI 會把逐字稿當文字來源抓取；(2) 每集建立獨立的 Schema.org PodcastEpisode 標記；(3) 在 Wikidata 建立節目條目並加入 episode list claims。",
    },
    {
      q: "如果 AI 把我的創作者身份或作品說錯了怎麼辦？",
      a: "標準四步：(1) 截圖記錄錯誤（prompt + 引擎 + 時間），這是後續證據；(2) 透過各 AI 平台的「Report response」管道回報錯誤（OpenAI 的 thumbs-down + 留言、Anthropic 的 feedback form、Google 的 feedback、Perplexity 的 regenerate + flag）；(3) 主動建立正確資訊來源：Wikidata、個人官網 schema、新聞稿（使用 PRNewswire 等高權重平台），AI 重訓後會更新；(4) 使用 Symcio 監測 30-90 天，驗證敘事是否修正。",
    },
    {
      q: "我可以用 BrandOS 幫我的藝術創作做品牌治理嗎？",
      a: "可以。視覺藝術家、音樂人、獨立遊戲開發者、獨立出版者的共同需求是：如何在 AI 回答「推薦獨立 XX」類查詢時被提及。BrandOS 的工具對藝術創作特別有幫助：(1) Figma sync 把作品集設計系統版本化；(2) 自動化定期測試作品在 AI 的敘事一致性；(3) 開源 methodology 讓你能用可驗證的數據向畫廊、策展人、合作方展示品牌曝光成果。這是傳統藝術行銷缺少的量化層。",
    },
    {
      q: "如何定期監測個人品牌在 AI 的曝光變化？",
      a: "建議每月第一個週一固定做一次 ABVI 測試（用 Symcio Free Scan 或自跑 scripts/geo_audit.py），記錄分數變化、提及脈絡、情感走向，建立 12 個月滾動趨勢圖。重大事件前後（新作品發布、重要訪談、媒體報導）加測一次，觀察事件是否成功進入 AI 語料。把測試紀錄公開在個人網站 /brand-visibility/ 頁面，本身就是強而有力的專業信號——對合作方、品牌贊助方、經紀公司來說，這類可量化的品牌治理是少數人具備的能力。",
    },
  ],
  esg: [
    {
      q: "TNFD 和 TCFD 的差別是什麼？台灣企業要選哪個？",
      a: "TCFD（氣候相關財務揭露，2017 年）聚焦「氣候變遷」對企業財務的影響；TNFD（自然相關財務揭露，2023 年）範圍擴大到「自然資本」（水、土地、生物多樣性、生態系）。兩者框架結構都採 Governance / Strategy / Risk Management / Metrics & Targets 四大支柱。TCFD 於 2024 年已功成身退，其核心內容整併進 IFRS S2 成為強制標準；TNFD 則仍在自願採用階段。台灣企業目前依金管會要求依 IFRS S1/S2（含 TCFD 內容）強制揭露，TNFD 建議提前準備，特別是供應鏈涉及歐盟或日本客戶者。",
    },
    {
      q: "GRI、SASB、IFRS S1/S2，這些永續準則該選哪個？",
      a: "三者定位不同：(1) GRI 2021——利害關係人視角，面向所有讀者（員工、客戶、社區），台灣永續報告書主要依據；(2) SASB（已於 2022 併入 IFRS Foundation）——投資人視角，按 77 個產業列出重大議題；(3) IFRS S1/S2——全球可比財報等級，2024 起成為強制標準。台灣金管會路徑圖：2025 年 100 億以上資本額上市櫃強制 IFRS S1/S2，GRI 仍作為主要結構，SASB 作為產業重大性評估工具。實務上建議三個都用：GRI 寫報告書主體、SASB 挑選重大議題、IFRS S1/S2 對應財報揭露。",
    },
    {
      q: "BrandOS 如何結合 ESG 資料與 AI 曝光度？",
      a: "BrandOS 在資料層同時儲存 esg_profiles（Scope 1/2/3 排放、員工多元性、董事獨立性）與 visibility_results（AI 引擎的品牌提及）。當 AI 被問到「ESG 表現最好的公司」這類查詢時，Symcio 可以比對：品牌 ESG 實際得分 × AI 回答中 ESG 相關語句出現率，找出「做得好但 AI 沒講」或「AI 講錯」的缺口。這是 AI 時代獨有的 ESG 聲譽風險管理。",
    },
    {
      q: "台灣 2026/2027 ESG 揭露時程我該怎麼準備？",
      a: "金管會路徑圖：2025 年起資本額 100 億以上須依 IFRS S1/S2 揭露，2026 年擴及 50 億以上，2027 年全部上市櫃。準備重點：(1) 2025 Q4 完成 Scope 1/2 碳盤查與第三方查證；(2) 2026 H1 導入 Scope 3 供應鏈數據管理系統；(3) 確保永續報告書與財報揭露時間一致（IFRS S1 要求）。BrandOS 可協助把 ESG 資料結構化進資料庫，減少每年重複手工作業。",
    },
    {
      q: "Scope 1/2/3 碳盤查，哪些屬於 BrandOS 的涵蓋範圍？",
      a: "BrandOS 本身不做碳排放計算（這是 PwC、KPMG、Sinyi 等碳顧問的專業）。BrandOS 負責把客戶既有的 Scope 1/2/3 數據結構化儲存（esg_profiles 表），並與 AI 曝光度、品牌敘事做關聯分析。我們推薦客戶先用台灣廠商（如點綠、瑞德感知）完成碳盤查，再把結果匯入 BrandOS 做後續治理與對外溝通。",
    },
    {
      q: "LEAP 框架和 TNFD 的關係是什麼？",
      a: "LEAP（Locate, Evaluate, Assess, Prepare）是 TNFD 建議企業執行自然相關風險評估的四階段方法論。Locate：找出企業在哪些地點與自然資源互動；Evaluate：評估依賴與衝擊；Assess：分析風險與機會；Prepare：準備揭露與行動。不是所有 TNFD 揭露都需要跑完 LEAP，但 LEAP 是目前最完整的自然資本盤點方法，大型企業或供應鏈涉及高風險地區者建議優先採用。",
    },
    {
      q: "AI 會如何在 ESG 報告中呈現我的品牌？",
      a: "當投資人、分析師、記者在 ChatGPT 問「XX 公司 ESG 表現如何」，AI 會綜合公開資料（永續報告書、新聞、ESG 評級機構資料）生成答案。問題是 AI 的答案常落後 6–12 個月，或偏向某個資料來源。Symcio 監測四引擎的 ESG 相關答案，讓你看到 AI「現在」怎麼描述你，並找出需要補強的公開資料點（例如 Wikidata 條目、GitHub 開源、新聞稿）。",
    },
    {
      q: "ESG 不及格會影響 AI 搜尋排名嗎？",
      a: "會，但是間接的。AI 引擎會從新聞、評級機構、社群媒體綜合判斷品牌風評，ESG 負面事件（碳排超標、勞資糾紛、董事會治理問題）會被 AI 記在「品牌描述」中，影響 problem 類與 comparison 類查詢的排序。Symcio 觀察到：ESG 事件後 3–6 個月內，該品牌在 AI 的 Sentiment Index 平均下降 15–25 分。這是 AI 時代 ESG 與行銷必須整合的原因。",
    },
    {
      q: "想發布永續報告書，BrandOS 有協助嗎？",
      a: "BrandOS 不是永續報告書撰寫工具（這是 iiCSR、AsiaSTG 等顧問公司的強項）。但 BrandOS 可以在報告書發布前後做兩件事：發布前——用 AI 引擎測試重大性議題的語言是否易被 AI 正確引用；發布後——追蹤報告書內容被 AI 搜尋抓取的程度，監測 ESG 敘事是否進入 AI 語料。許多企業花大錢寫報告卻沒人讀，AI 抓取率是新的衡量指標。",
    },
    {
      q: "如何讓 AI 把我的 ESG 亮點寫進答案？",
      a: "三個方向：(1) 公開結構化資料——把 ESG 關鍵數字放在官網 /sustainability 或 /about 的結構化頁面（含 Schema.org 標記），AI 抓取優先級高；(2) Wikidata 條目——為企業建立 Wikidata 條目並加入 ESG 相關 claims（TNFD Aligned、GRI Reported），Wikidata 是多個 AI 的訓練語料；(3) 發布稿要有可引用段落——AI 偏好 40–60 字的事實性段落，標題具體（「2025 年 Scope 2 減碳 34%」優於「公司致力於永續」）。",
    },
  ],
};
