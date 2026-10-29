"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { Service } from "@/lib/content";
import { ServiceIcon } from "./service-icon";

function Detail({ service }: { service: Service }) {
  return (
    <>
      <p className="type-h3">{service.tagline}</p>
      <p className="mt-4 text-muted">{service.problem.split("\n\n")[0]}</p>
      {service.examples.length > 0 && (
        <>
          <p className="mt-8 type-mono text-muted">Qué construimos</p>
          <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {service.examples.map((example) => (
              <li key={example} className="flex gap-3">
                <span className="veta-dot mt-2 shrink-0" aria-hidden="true" />
                {example}
              </li>
            ))}
          </ul>
        </>
      )}
      {service.technologies.length > 0 && (
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tecnologías">
          {service.technologies.map((tech) => (
            <li key={tech}>
              <Badge>{tech}</Badge>
            </li>
          ))}
        </ul>
      )}
      <Button href={`/servicios/${service.slug}`} variant="link" icon={<ArrowRight />} className="mt-8">
        {/* «Ver sistemas empresariales», pero «Ver IA aplicada»: solo la inicial baja, y no en una sigla. */}
        Ver {service.name.replace(/^\p{Lu}(?!\p{Lu})/u, (initial) => initial.toLowerCase())}
      </Button>
    </>
  );
}

/** Índice editorial: lista grande a la izquierda, detalle a la derecha. En mobile, acordeón. */
export function ServiceIndex({ services }: { services: Service[] }) {
  const [active, setActive] = useState(0);
  return (
    <>
      <div className="mt-14 grid grid-cols-12 gap-10 max-lg:hidden">
        <ul className="col-span-5 border-t border-line">
          {services.map((service, i) => (
            <li key={service.slug} className="border-b border-line">
              <button
                type="button"
                aria-expanded={i === active}
                aria-controls={`servicio-${service.slug}`}
                onClick={() => setActive(i)}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={cn(
                  "group flex w-full items-center gap-5 py-5 text-left transition-colors duration-fast",
                  i === active ? "text-accent" : "text-fg hover:text-accent",
                )}
              >
                <span className="type-mono text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[1.375rem] leading-tight font-extrabold uppercase [font-stretch:112%]">{service.name}</span>
                <ArrowRight
                  aria-hidden="true"
                  className={cn("ml-auto size-5 transition-all duration-normal", i === active ? "opacity-100" : "-translate-x-2 opacity-0")}
                />
              </button>
            </li>
          ))}
        </ul>
        <div className="col-span-7">
          {services.map((service, i) => (
            <article
              key={service.slug}
              id={`servicio-${service.slug}`}
              hidden={i !== active}
              className="rounded-lg border border-line bg-panel p-10"
            >
              <ServiceIcon name={service.icon} className="mb-6 size-9 text-accent" />
              <h3 className="sr-only">{service.name}</h3>
              <Detail service={service} />
            </article>
          ))}
        </div>
      </div>

      <Accordion className="mt-10 lg:hidden">
        {services.map((service, i) => (
          <AccordionItem
            key={service.slug}
            name="servicios"
            defaultOpen={i === 0}
            title={
              <span className="flex items-center gap-3">
                <ServiceIcon name={service.icon} className="size-5 shrink-0 text-accent" />
                {service.name}
              </span>
            }
          >
            <Detail service={service} />
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
