"""上傳 PNG 到 Cloudflare R2（S3 相容）"""
import os, sys, boto3
from pathlib import Path

R2_ENDPOINT = os.environ.get("R2_ENDPOINT")  # https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY = os.environ.get("R2_ACCESS_KEY")
R2_SECRET_KEY = os.environ.get("R2_SECRET_KEY")
R2_BUCKET = os.environ.get("R2_BUCKET", "symcio-ig")
R2_PUBLIC_URL = os.environ.get("R2_PUBLIC_URL")  # https://ig.symcio.tw 或 R2 public URL

def upload_slides(slide_dir: str, prefix: str = "") -> list:
    s3 = boto3.client("s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
    )
    
    urls = []
    for png in sorted(Path(slide_dir).glob("*.png")):
        key = f"{prefix}/{png.name}" if prefix else png.name
        s3.upload_file(str(png), R2_BUCKET, key, 
            ExtraArgs={"ContentType": "image/png"})
        url = f"{R2_PUBLIC_URL}/{key}"
        urls.append(url)
        print(f"  ✓ {png.name} → {url}")
    
    return urls

# 替代方案：用 GitHub Pages 託管（不需要 R2）
def upload_github(slide_dir: str, repo_dir: str, prefix: str = "") -> list:
    """把 PNG 複製到 GitHub Pages repo，commit + push"""
    import shutil, subprocess
    dest = Path(repo_dir) / "slides" / prefix
    dest.mkdir(parents=True, exist_ok=True)
    urls = []
    for png in sorted(Path(slide_dir).glob("*.png")):
        shutil.copy(png, dest / png.name)
        # 假設 GitHub Pages URL 是 https://<user>.github.io/<repo>/slides/
        url = f"https://raw.githubusercontent.com/sall911/symcio-ig/main/slides/{prefix}/{png.name}"
        urls.append(url)
    subprocess.run(["git", "-C", repo_dir, "add", "."], check=True)
    subprocess.run(["git", "-C", repo_dir, "commit", "-m", f"slides: {prefix}"], check=True)
    subprocess.run(["git", "-C", repo_dir, "push"], check=True)
    return urls

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python upload_r2.py <slide_dir> [prefix]")
    else:
        upload_slides(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "")
