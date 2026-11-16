import { listGeoArticles } from "@/lib/geo/data";

export const revalidate = 600;

// 文章網址來自資料庫，無法寫進靜態的 public/sitemap.xml，另以此路由提供。
export async function GET(): Promise<Response> {
  const rows = await listGeoArticles(1000);
  const urls = rows
    .map((r) => {
      const lastmod = (r.published_at ?? r.created_at).slice(0, 10);
      return `  <url><loc>https://symcio.tw/geo/${r.slug}</loc><lastmod>${lastmod}</lastmod></url>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
