import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AdminHeading, Panel } from "@/components/admin/shell";
import { GUIDE } from "@/lib/admin/help";
import { requireUser } from "@/lib/auth";

const LINKS: Record<string, string> = {
  "Primeros pasos": "/admin",
  "Publicar un caso (proyecto)": "/admin/proyectos/nuevo",
  "Cambiar un precio o un plan": "/admin/planes",
  "Atender una consulta (lead)": "/admin/leads",
  Imágenes: "/admin/media",
  SEO: "/admin/seo",
  "Usuarios y seguridad": "/admin/usuarios",
};

export default async function GuidePage() {
  await requireUser();
  return (
    <>
      <AdminHeading eyebrow="Panel" title="Guía del panel" note="Lo que hace falta saber para administrar el sitio sin tocar código. Cada pantalla tiene además su propia guía plegada bajo el título." />
      <div className="grid gap-5 lg:grid-cols-2">
        {GUIDE.map((section, i) => (
          <Panel key={section.title} title={`${String(i + 1).padStart(2, "0")} · ${section.title}`}>
            <ol className="grid list-decimal gap-2 pl-5">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            {LINKS[section.title] && (
              <Link href={LINKS[section.title]} className="mt-4 inline-flex items-center gap-1 type-small font-semibold hover:text-link">
                Ir <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            )}
          </Panel>
        ))}
      </div>
    </>
  );
}
