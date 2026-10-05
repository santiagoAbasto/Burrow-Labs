import { CTA } from "@/components/ui/cta";
import type { HomeContent } from "../sections";

export default function FinalCta({ content }: { content: HomeContent<"final_cta"> }) {
  return (
    <CTA
      id="contacto"
      title={content.title}
      lead={content.body}
      action={{ label: content.cta, href: "/contacto" }}
      secondary={{ label: content.secondary, href: "/diagnostico" }}
    />
  );
}
