import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ProjectSummary } from "@/lib/content";
import { ProjectVisual } from "./project-visual";

/**
 * Fila grande de proyecto: número, título, resumen, stack y portada (o el esquema del caso). Alterna el lado de la imagen.
 * `heading`: nivel del título según dónde va la lista. Bajo un h2 de sección, h3; directo bajo el h1 de la página, h2.
 */
export function ProjectRow({ project, index, heading: Heading = "h3" }: { project: ProjectSummary; index: number; heading?: "h2" | "h3" }) {
  return (
    <li className="border-b border-line" data-reveal="">
      <Link
        href={`/proyectos/${project.slug}`}
        className="group grid gap-6 py-10 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-14"
      >
        <div className={index % 2 ? "lg:order-2 lg:col-span-7" : "lg:col-span-7"}>
          <p className="flex flex-wrap items-center gap-3 type-mono text-muted">
            <span>{String(index + 1).padStart(2, "0")}</span>
            {project.category && <span>{project.category.name}</span>}
            {project.sector && <span>{project.sector}</span>}
            {project.year && <span>{project.year}</span>}
            {project.isDemo && <Badge variant="accent">Demo · no público</Badge>}
            {project.badge && <Badge dot>{project.badge}</Badge>}
          </p>
          <Heading className="mt-4 type-h2 group-hover:text-accent">{project.title}</Heading>
          <p className="mt-4 type-lead">{project.summary}</p>
          {project.clientName && <p className="mt-3 type-small text-muted">Cliente: {project.clientName}</p>}
          {project.stack.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tecnologías">
              {project.stack.slice(0, 6).map((tech) => (
                <li key={tech}>
                  <Badge>{tech}</Badge>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 inline-flex items-center gap-2 font-semibold">
            Ver el caso
            <ArrowUpRight aria-hidden="true" className="size-5 transition-transform duration-fast group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </p>
        </div>
        <div className="lg:col-span-5">
          {project.cover ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line">
              <Image src={project.cover.url} alt={project.cover.alt} fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
            </div>
          ) : project.visual ? (
            <ProjectVisual kind={project.visual} labels={project.features} title={project.title} className="aspect-[4/3]" />
          ) : (
            <div className="grid aspect-[4/3] place-items-center rounded-lg border border-line bg-panel" aria-hidden="true">
              <span className="type-mono text-muted">{"{ caso de estudio }"}</span>
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}
