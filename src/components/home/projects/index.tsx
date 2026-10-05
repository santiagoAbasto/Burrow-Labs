import { ArrowRight } from "lucide-react";
import { ProjectRow } from "@/components/projects/project-row";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container, Stratum } from "@/components/ui/stratum";
import { getFeaturedProjects } from "@/lib/content";
import type { HomeContent } from "../sections";

/** Sin proyectos publicados la sección no se muestra: nunca casos inventados. */
export default async function Projects({ content }: { content: HomeContent<"projects"> }) {
  const projects = await getFeaturedProjects();
  if (projects.length === 0) return null;
  return (
    <Stratum tone="lab" id="proyectos" label="Proyectos" depth={58} aria-labelledby="proyectos-title">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="proyectos-title" eyebrow={content.eyebrow} title={content.title}>
            {content.body}
          </SectionHeading>
          <Button href="/proyectos" variant="secondary" icon={<ArrowRight />}>
            {content.cta}
          </Button>
        </div>
        <ol className="mt-14 border-t border-line">
          {projects.slice(0, 3).map((project, i) => (
            <ProjectRow key={project.id} project={project} index={i} />
          ))}
        </ol>
      </Container>
    </Stratum>
  );
}
