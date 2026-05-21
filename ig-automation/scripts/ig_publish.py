"""Instagram Graph API — 發布輪播圖"""
import os, time, json, requests

TOKEN = os.environ["META_ACCESS_TOKEN"]
IG_USER_ID = os.environ["IG_USER_ID"]
API = "https://graph.facebook.com/v20.0"

def upload_carousel(image_urls: list, caption: str) -> dict:
    """
    image_urls: 每張圖的公開 URL（已上傳到 R2 / GitHub Pages）
    caption: 貼文文案（含 hashtags）
    """
    print(f"\n▶ 上傳 {len(image_urls)} 張圖到 IG...")
    
    # Step 1: 每張圖建立 container
    containers = []
    for i, url in enumerate(image_urls):
        resp = requests.post(f"{API}/{IG_USER_ID}/media", data={
            "image_url": url,
            "is_carousel_item": "true",
            "access_token": TOKEN,
        })
        data = resp.json()
        if "id" not in data:
            print(f"  ✗ slide_{i+1} 失敗: {data}")
            return data
        containers.append(data["id"])
        print(f"  ✓ slide_{i+1} container: {data['id']}")
        time.sleep(1)
    
    # Step 2: 建立 carousel container
    resp = requests.post(f"{API}/{IG_USER_ID}/media", data={
        "media_type": "CAROUSEL",
        "children": ",".join(containers),
        "caption": caption,
        "access_token": TOKEN,
    })
    carousel = resp.json()
    print(f"  ✓ carousel container: {carousel.get('id')}")
    
    # Step 3: 等待處理
    print("  ⏳ 等待 Meta 處理...")
    time.sleep(8)
    
    # Step 4: 發布
    resp = requests.post(f"{API}/{IG_USER_ID}/media_publish", data={
        "creation_id": carousel["id"],
        "access_token": TOKEN,
    })
    result = resp.json()
    print(f"  ✓ 發布完成! Post ID: {result.get('id')}")
    return result

def check_token():
    """檢查 token 是否有效"""
    resp = requests.get(f"{API}/me", params={"access_token": TOKEN})
    data = resp.json()
    if "error" in data:
        print(f"✗ Token 無效: {data['error']['message']}")
        return False
    print(f"✓ Token 有效 — User: {data.get('name', 'OK')}")
    return True

if __name__ == "__main__":
    check_token()
