"""把輪播圖 HTML 導出為 1080x1350 PNG"""
import asyncio, sys
from pathlib import Path
from playwright.async_api import async_playwright

async def export_slides(html_path, output_dir, total_slides=7):
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(
            viewport={"width": 420, "height": 525},
            device_scale_factor=1080/420,
        )
        html = Path(html_path).read_text(encoding="utf-8")
        await page.set_content(html, wait_until="networkidle")
        await page.wait_for_timeout(3000)
        await page.evaluate("""() => {
            document.querySelectorAll('.ig-header,.ig-dots,.ig-actions,.ig-caption')
                .forEach(el => el.style.display='none');
            const f = document.querySelector('.ig-frame');
            f.style.cssText='width:420px;height:525px;max-width:none;border-radius:0;box-shadow:none;overflow:hidden;margin:0;';
            const v = document.querySelector('.carousel-viewport');
            v.style.cssText='width:420px;height:525px;aspect-ratio:unset;overflow:hidden;';
            document.body.style.cssText='padding:0;margin:0;overflow:hidden;';
        }""")
        await page.wait_for_timeout(500)
        paths = []
        for i in range(total_slides):
            await page.evaluate("""(idx) => {
                const t = document.querySelector('.carousel-track');
                t.style.transition='none';
                t.style.transform='translateX('+(-idx*420)+'px)';
            }""", i)
            await page.wait_for_timeout(400)
            out = str(output / f"slide_{i+1}.png")
            await page.screenshot(path=out, clip={"x":0,"y":0,"width":420,"height":525})
            paths.append(out)
            print(f"  slide_{i+1}.png")
        await browser.close()
    return paths

if __name__ == "__main__":
    html, out = sys.argv[1], sys.argv[2]
    n = int(sys.argv[3]) if len(sys.argv) > 3 else 7
    asyncio.run(export_slides(html, out, n))
