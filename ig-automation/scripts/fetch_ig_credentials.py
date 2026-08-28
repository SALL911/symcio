"""
一次性工具：拿到短期 token 後，自動換成 90 天長期 token + 找出 IG_USER_ID

用法：
    export META_APP_ID=你的App_ID
    export META_APP_SECRET=你的App_Secret
    export META_SHORT_TOKEN=你剛在Graph_API_Explorer複製的短期token
    python fetch_ig_credentials.py

輸出會列出：
    META_ACCESS_TOKEN（長期，~60 天）
    IG_USER_ID
    FB_PAGE_ID
    （直接複製到 GitHub Secrets）
"""
import os
import sys
import json
import requests

API = "https://graph.facebook.com/v20.0"


def fail(msg: str, resp=None) -> "None":
    print(f"\n✗ {msg}")
    if resp is not None:
        try:
            print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
        except Exception:
            print(resp.text)
    sys.exit(1)


def main() -> None:
    app_id = os.environ.get("META_APP_ID")
    app_secret = os.environ.get("META_APP_SECRET")
    short_token = os.environ.get("META_SHORT_TOKEN")
    if not (app_id and app_secret and short_token):
        fail(
            "請先設定環境變數 META_APP_ID / META_APP_SECRET / META_SHORT_TOKEN。\n"
            "  META_APP_ID/SECRET：在 developers.facebook.com 你的 App → Settings → Basic\n"
            "  META_SHORT_TOKEN：在 Graph API Explorer 產生（勾選 instagram_basic, "
            "instagram_content_publish, pages_show_list, pages_read_engagement）"
        )

    # Step 1: 短期 token → 長期 token (~60 天)
    print("▶ Step 1: 換取長期 user access token...")
    r = requests.get(f"{API}/oauth/access_token", params={
        "grant_type": "fb_exchange_token",
        "client_id": app_id,
        "client_secret": app_secret,
        "fb_exchange_token": short_token,
    })
    if r.status_code != 200 or "access_token" not in r.json():
        fail("換取長期 token 失敗", r)
    long_user_token = r.json()["access_token"]
    print(f"  ✓ long-lived user token 取得（前 20 字: {long_user_token[:20]}...）")

    # Step 2: 找你管理的粉專
    print("\n▶ Step 2: 查詢你管理的 Facebook 粉專...")
    r = requests.get(f"{API}/me/accounts", params={"access_token": long_user_token})
    pages = r.json().get("data") or []
    if not pages:
        fail("找不到任何粉專。確認你建立了粉專並用同一個 FB 帳號登入。", r)

    print(f"  找到 {len(pages)} 個粉專：")
    for i, p in enumerate(pages):
        print(f"    [{i+1}] {p['name']} (id={p['id']})")

    if len(pages) == 1:
        page = pages[0]
    else:
        sel = input(f"\n  選擇粉專（1-{len(pages)}）：").strip()
        page = pages[int(sel) - 1]

    fb_page_id = page["id"]
    # Page access token 本身就是長期的（從 user long-lived token 換來）
    page_token = page["access_token"]
    print(f"  ✓ 選定粉專: {page['name']} (page_id={fb_page_id})")

    # Step 3: 找連結的 IG Business User ID
    print("\n▶ Step 3: 查詢粉專連結的 IG 商業帳號...")
    r = requests.get(f"{API}/{fb_page_id}", params={
        "fields": "instagram_business_account{id,username,name}",
        "access_token": page_token,
    })
    iba = r.json().get("instagram_business_account")
    if not iba:
        fail(
            "粉專沒有連結 IG 商業帳號。請到 FB 粉專設定 → Instagram → 連結帳號。\n"
            "且 IG 帳號必須是「專業帳號」（創作者或商業）。",
            r,
        )
    ig_user_id = iba["id"]
    ig_username = iba.get("username", "?")
    print(f"  ✓ 連結的 IG: @{ig_username} (ig_user_id={ig_user_id})")

    # Step 4: 印出可貼到 GitHub Secrets 的設定
    print("\n" + "=" * 60)
    print("✓ 全部取得！把下列值貼到 GitHub repo Settings → Secrets：")
    print("=" * 60)
    print(f"META_ACCESS_TOKEN = {page_token}")
    print(f"IG_USER_ID        = {ig_user_id}")
    print(f"FB_PAGE_ID        = {fb_page_id}")
    print("=" * 60)
    print(
        "\n提醒：\n"
        " • 上面的 META_ACCESS_TOKEN 是 **Page access token**（從長期 user token 換來）。\n"
        "   IG 的 /media 與 /media_publish 端點接受這個 token。\n"
        " • Page token 在 user token 沒過期前都有效；user long-lived token 約 60 天。\n"
        " • 想完全免續期：把 App 切到 Business 模式 + 走 System User，可以拿到不過期 token。\n"
    )


if __name__ == "__main__":
    main()
