"""
Symcio 每週 IG 自動化主流程
GitHub Actions 每週一 09:00 UTC+8 觸發
"""
import os, sys, asyncio
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))

from export_slides import export_slides
from ig_publish import upload_carousel

CAROUSEL_DIR = Path(__file__).parent.parent / "carousels"
OUTPUT_DIR = Path("/tmp/symcio-slides")

# 5 套輪播圖輪流發（每週一套，5 週一循環）
CAROUSELS = [
    {
        "file": "carousel-01-cmo.html",
        "caption": """你有沒有試過問 ChatGPT「推薦哪個品牌好？」

它的回答裡，有你的品牌嗎？

現在越來越多人不 Google 了，直接問 AI。但你的品牌在 AI 的世界裡，可能完全不存在。

Symcio 幫你查——自動問遍四個 AI，3 分鐘告訴你有沒有被提到、排第幾。

免費查一次 → 連結在自介

#品牌 #AI #行銷 #品牌健檢 #ChatGPT #台灣品牌""",
    },
    {
        "file": "carousel-02-ceo.html",
        "caption": """同樣的咖啡豆，為什麼星巴克能賣 150，路邊攤只能賣 50？

因為大家「認識」那個牌子。

但現在客人不自己挑了——直接問 AI「哪個好？」如果 AI 不認識你，你就只能跟別人拼價格。

免費查一次 → 連結在自介

#品牌 #定價 #品牌價值 #AI #台灣品牌 #創業""",
    },
    {
        "file": "carousel-03-investor.html",
        "caption": """Google 之後，下一個人人都用的東西是什麼？

你已經在用了——AI 搜尋。

注意力在哪裡，錢就在哪裡。誰先量化「品牌在 AI 裡的表現」，誰就掌握先機。

免費查你的品牌 → 連結在自介

#投資 #AI #趨勢 #品牌 #新經濟 #ChatGPT""",
    },
    {
        "file": "carousel-04-gov.html",
        "caption": """你問 ChatGPT「推薦亞洲最好的品牌」——答案裡有台灣嗎？

試試看，結果可能讓你意外。

當全世界都在用 AI 做決策，如果 AI 不知道台灣品牌——等於台灣在 AI 經濟中隱形了。

免費查你的品牌 → 連結在自介

#台灣 #台灣品牌 #AI #國際競爭力 #品牌台灣""",
    },
    {
        "file": "carousel-05-dev.html",
        "caption": """追蹤 Google 排名的工具一大堆。追蹤 AI 排名的呢？

ChatGPT 推薦誰、排第幾、怎麼描述——目前幾乎沒有工具在量化這件事。

這個領域才剛開始，早期參與 = 定義遊戲規則。

免費試用 → 連結在自介

#開發者 #API #AI #MarTech #品牌數據""",
    },
]


def get_carousel_index() -> int:
    """決定本次發哪一套：手動 override > 週數輪換"""
    forced = os.environ.get("FORCE_CAROUSEL_INDEX", "").strip()
    if forced:
        try:
            idx = int(forced) - 1
            if 0 <= idx < len(CAROUSELS):
                print(f"  ⚙ FORCE_CAROUSEL_INDEX = {forced}")
                return idx
        except ValueError:
            pass
        print(f"  ⚠ FORCE_CAROUSEL_INDEX={forced!r} 無效，改用週數輪換")
    return datetime.now().isocalendar()[1] % len(CAROUSELS)


async def main():
    idx = get_carousel_index()
    carousel = CAROUSELS[idx]
    dry_run = os.environ.get("DRY_RUN", "false").lower() == "true"

    print(f"\n{'='*50}")
    print(f"Symcio IG 自動發布 — 第 {idx+1} 套")
    print(f"檔案: {carousel['file']}")
    print(f"DRY_RUN: {dry_run}")
    print(f"{'='*50}")

    html_path = CAROUSEL_DIR / carousel["file"]
    if not html_path.exists():
        print(f"✗ 找不到 {html_path}")
        sys.exit(1)

    # Step 1: 導出 PNG
    print("\n▶ Step 1: 導出 PNG...")
    slide_dir = OUTPUT_DIR / f"week-{idx+1}"
    paths = await export_slides(str(html_path), str(slide_dir), 7)
    print(f"  ✓ {len(paths)} 張 PNG 導出完成 → {slide_dir}")

    if dry_run:
        print("\n⏹ DRY_RUN=true — 跳過上傳與發布。PNG 會以 GitHub Actions artifact 形式留存。")
        return

    # Step 2: 上傳圖片取得公開 URL（IG Graph API 需要公開可達的 https URL）
    print("\n▶ Step 2: 上傳圖片到 R2...")
    if not os.environ.get("R2_ENDPOINT"):
        print("✗ R2_ENDPOINT 未設定。IG Graph API 需要公開 https URL，請先設定 R2 或其他圖床。")
        sys.exit(1)
    from upload_r2 import upload_slides
    image_urls = upload_slides(str(slide_dir), f"week-{idx+1}")

    # Step 3: 發布到 IG
    print("\n▶ Step 3: 發布到 Instagram...")
    result = upload_carousel(image_urls, carousel["caption"])

    print(f"\n{'='*50}")
    print(f"✓ 完成！Post ID: {result.get('id', 'unknown')}")
    print(f"{'='*50}")


if __name__ == "__main__":
    asyncio.run(main())
