/** 輸出一段 Schema.org JSON-LD。server component，HTML 首屏即可被爬蟲讀取。 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
