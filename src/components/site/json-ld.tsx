import { serializeJsonLd } from "@/lib/seo";

export function JsonLd({ data }: { data: Parameters<typeof serializeJsonLd>[0] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
