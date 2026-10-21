import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { LabReading } from "@/components/site/lab-reading";
import { Button } from "@/components/ui/button";
import { CTA } from "@/components/ui/cta";
import { Markdown } from "@/components/ui/markdown";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { getPost, getPosts, getSettings } from "@/lib/content";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, findBySlug } from "@/lib/seo";
import { formatDate } from "../page";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).map((post) => ({ slug: post.slug }));
}

/** El slug se valida contra la lista cacheada antes del getter por slug: uno inventado es 404 sin tocar la caché. */
async function findPost(raw: string) {
  const all = await getPosts();
  const known = findBySlug(all, raw);
  return { all, post: known ? await getPost(known.slug) : null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { post } = await findPost((await params).slug);
  if (!post) return {};
  return buildMetadata({
    path: `/lab/${post.slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.ogImage || post.cover?.url,
    type: "article",
  });
}

export default async function PostPage({ params }: Props) {
  const [{ post, all }, settings] = await Promise.all([findPost((await params).slug), getSettings()]);
  if (!post) notFound();
  const more = all.filter((other) => other.slug !== post.slug).slice(0, 4);

  return (
    <>
      <Stratum as="header" tone="lab" flush className="pt-32 pb-14 lg:pt-44 lg:pb-20">
        <Container className="max-w-4xl">
          <Button href="/lab" variant="link">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Lab
          </Button>
          <p className="mt-8 type-mono text-muted">
            {post.category?.name && `${post.category.name} · `}
            <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time> · {post.readingMinutes} min de lectura
          </p>
          <h1 className="mt-4 type-h1">{post.title}</h1>
          <p className="mt-6 type-lead">{post.excerpt}</p>
        </Container>
      </Stratum>
      <Stratum as="article" tone="chalk">
        <Container className="max-w-3xl">
          {post.cover && (
            <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-lg border border-line">
              <Image src={post.cover.url} alt={post.cover.alt} fill preload fetchPriority="high" sizes="(min-width: 768px) 720px, 100vw" className="object-cover" />
            </div>
          )}
          <Markdown>{post.content}</Markdown>
          <p className="mt-12 border-t border-line pt-6 type-small text-muted">Escrito por {post.authorName}.</p>
        </Container>
      </Stratum>
      {more.length > 0 && (
        <Stratum tone="lab">
          <Container>
            <LabReading posts={more} title="Seguir leyendo" />
          </Container>
        </Stratum>
      )}
      <TerrainCut from={more.length ? "lab" : "chalk"} to="topsoil" variant="shelf" />
      <CTA title="Si se repite, lo automatizamos." action={{ label: "Contanos qué querés resolver", href: "/contacto" }} secondary={{ label: "Hacer el diagnóstico express", href: "/diagnostico" }} />
      <JsonLd
        data={[
          articleJsonLd(post, settings),
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Lab", path: "/lab" },
            { name: post.title, path: `/lab/${post.slug}` },
          ]),
        ]}
      />
    </>
  );
}
