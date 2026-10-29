import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/site/json-ld";
import { Newsletter } from "@/components/site/newsletter";
import { PageHeader } from "@/components/site/page-header";
import { CTA } from "@/components/ui/cta";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { cn } from "@/lib/cn";
import { getPostCategories, getPosts } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({
    path: "/lab",
    title: "Lab: notas de automatización, software e IA",
    description: "Notas y experimentos de Burrow Labs sobre automatización de procesos, software empresarial e IA aplicada: qué conviene hacer, qué no y por dónde empezar.",
  });

export const formatDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("es-BO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/La_Paz" }).format(new Date(iso)) : "";

export default async function LabPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const [all, categories] = await Promise.all([getPosts(), getPostCategories()]);
  const used = categories.filter((category) => all.some((post) => post.category?.slug === category.slug));
  const active = used.find((category) => category.slug === categoria)?.slug;
  const posts = active ? all.filter((post) => post.category?.slug === active) : all;

  return (
    <>
      <PageHeader eyebrow="Burrow Labs / Lab" title="Donde probamos antes de prometer." tone="lab">
        Experimentos, prototipos y notas: lo que probamos con software, automatización e IA antes de proponérselo a un cliente.
      </PageHeader>
      <Stratum tone="lab" flush className="pb-section">
        <Container>
          {used.length > 1 && (
            <nav aria-label="Filtrar por tema">
              <ul className="flex flex-wrap gap-2">
                {[{ slug: undefined, name: "Todo" }, ...used].map((category) => (
                  <li key={category.slug ?? "todo"}>
                    <Link
                      href={category.slug ? `/lab?categoria=${category.slug}` : "/lab"}
                      aria-current={active === category.slug ? "page" : undefined}
                      className={cn("badge type-mono min-h-11 px-4", active === category.slug && "bg-accent text-accent-fg")}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {posts.length === 0 ? (
            <p className="mt-10 type-lead">Todavía no hay artículos publicados.</p>
          ) : (
            <ol className="mt-10 border-t border-line">
              {posts.map((post) => (
                <li key={post.id} className="border-b border-line" data-reveal="">
                  <Link href={`/lab/${post.slug}`} className="group grid gap-4 py-10 lg:grid-cols-12 lg:gap-10">
                    <p className="type-mono text-muted lg:col-span-3">
                      {post.category?.name}
                      <span className="mt-1 block">
                        {formatDate(post.publishedAt)} · {post.readingMinutes} min
                      </span>
                    </p>
                    <div className="lg:col-span-9">
                      <h2 className="type-h2 group-hover:text-accent">{post.title}</h2>
                      <p className="mt-4 type-lead">{post.excerpt}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
          <Newsletter className="mt-12" />
        </Container>
      </Stratum>
      <TerrainCut from="lab" to="topsoil" variant="ridge" />
      <CTA title="¿Querés aplicar algo de esto en tu operación?" action={{ label: "Contanos qué querés resolver", href: "/contacto" }} secondary={{ label: "Ver servicios", href: "/servicios" }} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Lab", path: "/lab" }])} />
    </>
  );
}
