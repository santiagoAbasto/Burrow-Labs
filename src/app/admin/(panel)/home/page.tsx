import { ArrowDown, ArrowUp, ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";
import { HelpBox } from "@/components/admin/help-box";
import { AdminHeading, Flash } from "@/components/admin/shell";
import { HOME_SECTIONS, isHomeSectionKey } from "@/components/home/sections";
import { Button } from "@/components/ui/button";
import { moveHomeSection, toggleHomeSection } from "@/lib/admin/actions";
import { requireUser } from "@/lib/auth";
import { getHomeSections } from "@/lib/content";

export default async function HomeAdmin({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireUser();
  const [all, search] = await Promise.all([getHomeSections(), searchParams]);
  const sections = all.filter((section) => isHomeSectionKey(section.key));
  return (
    <>
      <AdminHeading eyebrow="Contenido"
        title="Home"
        note="Las secciones de la portada, en el orden en que se ven. Cada una se puede editar, mostrar u ocultar y mover con las flechas."
        actions={
          <Button href="/" target="_blank" variant="secondary" icon={<ExternalLink />}>
            Ver el Home
          </Button>
        }
      />
      <Flash params={search} />
      <div className="mb-6">
        <HelpBox topic="home" />
      </div>
      <ol className="grid max-w-3xl gap-2">
        {sections.map((section, i) => {
          const key = section.key as keyof typeof HOME_SECTIONS;
          return (
            <li key={section.key} className="admin-panel flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="w-8 type-mono text-muted">{String(i + 1).padStart(2, "0")}</span>
              <Link href={`/admin/home/${section.key}`} className="min-w-0 flex-1 font-semibold hover:text-link">
                {HOME_SECTIONS[key].label}
              </Link>
              <form action={toggleHomeSection.bind(null, section.key, !section.enabled)} className="flex items-center gap-2">
                <span className="type-small text-muted">{section.enabled ? "Visible" : "Oculta"}</span>
                <button type="submit" role="switch" aria-checked={section.enabled} aria-label={`${section.enabled ? "Ocultar" : "Mostrar"} ${HOME_SECTIONS[key].label}`} className="switch" />
              </form>
              <div className="flex gap-1">
                <form action={moveHomeSection.bind(null, section.key, "up")}>
                  <button type="submit" disabled={i === 0} aria-label={`Subir ${HOME_SECTIONS[key].label}`} className="admin-tile grid size-9 place-items-center disabled:opacity-30">
                    <ArrowUp aria-hidden="true" className="size-4" />
                  </button>
                </form>
                <form action={moveHomeSection.bind(null, section.key, "down")}>
                  <button type="submit" disabled={i === sections.length - 1} aria-label={`Bajar ${HOME_SECTIONS[key].label}`} className="admin-tile grid size-9 place-items-center disabled:opacity-30">
                    <ArrowDown aria-hidden="true" className="size-4" />
                  </button>
                </form>
                <Button href={`/admin/home/${section.key}`} variant="secondary" size="sm" icon={<Pencil />}>
                  Editar
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
