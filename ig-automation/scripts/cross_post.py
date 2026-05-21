"""同步發布到 Threads / Facebook / X / Telegram"""
import os, requests, json

def post_to_threads(image_urls, caption):
    """Threads API（Meta 官方，跟 IG 同一個 App）"""
    TOKEN = os.environ["META_ACCESS_TOKEN"]
    USER_ID = os.environ["THREADS_USER_ID"]
    API = "https://graph.threads.net/v1.0"
    
    # Threads carousel
    containers = []
    for url in image_urls:
        r = requests.post(f"{API}/{USER_ID}/threads", data={
            "media_type": "IMAGE",
            "image_url": url,
            "is_carousel_item": "true",
            "access_token": TOKEN,
        })
        containers.append(r.json()["id"])
    
    r = requests.post(f"{API}/{USER_ID}/threads", data={
        "media_type": "CAROUSEL",
        "children": ",".join(containers),
        "text": caption[:500],  # Threads 限 500 字元
        "access_token": TOKEN,
    })
    
    import time; time.sleep(5)
    
    r = requests.post(f"{API}/{USER_ID}/threads_publish", data={
        "creation_id": r.json()["id"],
        "access_token": TOKEN,
    })
    print(f"  ✓ Threads: {r.json().get('id')}")

def post_to_facebook(image_urls, caption):
    """Facebook Pages API"""
    TOKEN = os.environ["META_ACCESS_TOKEN"]
    PAGE_ID = os.environ["FB_PAGE_ID"]
    API = "https://graph.facebook.com/v20.0"
    
    # FB 用 multi-photo post
    photo_ids = []
    for url in image_urls:
        r = requests.post(f"{API}/{PAGE_ID}/photos", data={
            "url": url,
            "published": "false",
            "access_token": TOKEN,
        })
        photo_ids.append({"media_fbid": r.json()["id"]})
    
    r = requests.post(f"{API}/{PAGE_ID}/feed", json={
        "message": caption,
        "attached_media": photo_ids,
        "access_token": TOKEN,
    })
    print(f"  ✓ Facebook: {r.json().get('id')}")

def post_to_x(text):
    """X/Twitter API v2（只發文字+連結，圖片需要另外處理）"""
    import tweepy
    client = tweepy.Client(
        bearer_token=os.environ.get("X_BEARER_TOKEN"),
        consumer_key=os.environ.get("X_API_KEY"),
        consumer_secret=os.environ.get("X_API_SECRET"),
        access_token=os.environ.get("X_ACCESS_TOKEN"),
        access_token_secret=os.environ.get("X_ACCESS_SECRET"),
    )
    # X 用英文
    r = client.create_tweet(text=text[:280])
    print(f"  ✓ X/Twitter: {r.data['id']}")

def post_to_telegram(text, chat_id=None):
    """Telegram Bot API"""
    BOT_TOKEN = os.environ.get("TG_BOT_TOKEN")
    CHAT_ID = chat_id or os.environ.get("TG_CHAT_ID")
    
    r = requests.post(f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage", json={
        "chat_id": CHAT_ID,
        "text": text,
        "parse_mode": "Markdown",
    })
    print(f"  ✓ Telegram: {r.json().get('ok')}")
