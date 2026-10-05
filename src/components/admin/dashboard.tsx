import { and, count, eq, gte, lt, sql } from "drizzle-orm";
import { ArrowRight, BookOpen, Briefcase, CircleCheck, CircleDashed, Home, Image as ImageIcon, Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ActivityList } from "./activity-list";
import { BurroStatus } from "./burro-status";
import { AreaChart, BarList, Delta, Donut, HourBars, Sparkline } from "./charts";
import { AdminHeading, Panel } from "./shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { clients, leads, posts, projects, services, testimonials } from "@/db/schema";
import { recentActivity } from "@/lib/admin/activity";
import { botShare, browsers, devices, eventCounts, hourlyProfile, languages, topCountries, topMeta, topPaths, topReferrers, trafficSeries, trafficSummary } from "@/lib/admin/analytics";
import { subscriberStats } from "@/lib/admin/newsletter";
import { isInternalPath } from "@/lib/analytics-events";
import type { SessionUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { getSettings } from "@/lib/content";
import { env } from "@/lib/env";

export const RANGES = [7, 30, 90] as const;
export type Days = (typeof RANGES)[number];
export const parseDays = (value?: string): Days => (RANGES.includes(Number(value) as Days) ? (Number(value) as Days) : 30);

const n = (value: number) => value.toLocaleString("es-BO");
const pct = (part: number, total: number) => (total ? `${Math.round((part / total) * 100)} %` : "—");
/** Bandera del país a partir del código ISO (indicadores regionales Unicode); vacío si no hay código. */
const flag = (code: string | null) => (code && /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : "");

function Stat({ label, value, note, href, delta, spark }: { label: string; value: string; note?: string; href?: string; delta?: ReactNode; spark?: number[] }) {
  return (
    <div className="admin-stat">
      <dt className="type-mono text-muted">{label}</dt>
      <dd className="admin-stat-value flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {href ? <Link href={href}>{value}</Link> : value}
        {delta}
      </dd>
      {spark && (
        <dd className="mt-1" aria-hidden="true">
          <Sparkline values={spark} tone="yellow" />
        </dd>
      )}
      {note && <dd className="type-small text-muted">{note}</dd>}
    </div>
  );
}

function SectionTitle({ id, children, note }: { id: string; children: ReactNode; note?: string }) {
  return (
    <div className="mt-10 mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <h2 id={id} className="admin-eyebrow mb-0 scroll-mt-24 text-fg">
        <span className="veta-dot" aria-hidden="true" />
        {children}
      </h2>
      {note && <p className="type-small text-muted">{note}</p>}
    </div>
  );
}

/** Métricas reales: salen de la base (leads y eventos first-party anónimos, sin bots). Nada simulado. */
export async function Dashboard({ user, days = 30 }: { user: SessionUser; days?: Days }) {
  const since = sql`now() - make_interval(days => ${days})`;
  const before = sql`now() - make_interval(days => ${days * 2})`;
  const one = async (query: Promise<{ n: number }[]>) => (await query)[0]?.n ?? 0;

  const [
    settings,
    activity,
    leadsTotal,
    leadsNew,
    leadsRecent,
    leadsPrev,
    projectsLive,
    projectsDraft,
    servicesLive,
    postsLive,
    postsDraft,
    clientsOk,
    testimonialsOk,
    latest,
    traffic,
    series,
    paths,
    referrers,
    countries,
    deviceShare,
    browserShare,
    bots,
    langs,
    plans,
    projectViews,
    events,
    hours,
    newsletter,
  ] = await Promise.all([
    getSettings(),
    recentActivity(8),
    one(db.select({ n: count() }).from(leads)),
    one(db.select({ n: count() }).from(leads).where(eq(leads.status, "new"))),
    one(db.select({ n: count() }).from(leads).where(gte(leads.createdAt, since))),
    one(db.select({ n: count() }).from(leads).where(and(gte(leads.createdAt, before), lt(leads.createdAt, since)))),
    one(db.select({ n: count() }).from(projects).where(eq(projects.status, "published"))),
    one(db.select({ n: count() }).from(projects).where(eq(projects.status, "draft"))),
    one(db.select({ n: count() }).from(services).where(eq(services.status, "published"))),
    one(db.select({ n: count() }).from(posts).where(eq(posts.status, "published"))),
    one(db.select({ n: count() }).from(posts).where(eq(posts.status, "draft"))),
    one(db.select({ n: count() }).from(clients).where(and(eq(clients.authorized, true), eq(clients.status, "published")))),
    one(db.select({ n: count() }).from(testimonials).where(and(eq(testimonials.authorized, true), eq(testimonials.status, "published")))),
    db.select({ id: leads.id, name: leads.name, type: leads.type, projectType: leads.projectType, status: leads.status, createdAt: leads.createdAt }).from(leads).where(eq(leads.status, "new")).orderBy(sql`${leads.createdAt} desc`).limit(6),
    trafficSummary(days),
    trafficSeries(days),
    topPaths(days, 8),
    topReferrers(days, 6),
    topCountries(days, 8),
    devices(days),
    browsers(days),
    botShare(days),
    languages(days, 5),
    topMeta(days, "plan_cta", "plan", 6),
    topMeta(days, "project_view", "project", 6),
    eventCounts(days),
    hourlyProfile(days),
    subscriberStats(),
  ]);
  const contactViews = paths.find((p) => p.label === "/contacto")?.value ?? 0;
  const submits = events.contact_submit;

  // Lo que el sitio todavía necesita para salir con datos reales. Se calcula, no se marca a mano.
  const checklist: { done: boolean; label: string; href: string; hint: string }[] = [
    { done: Boolean(settings.contact.whatsappPhone), label: "Número de WhatsApp", href: "/admin/whatsapp", hint: "Mientras falte, el botón flotante lleva al formulario." },
    { done: Boolean(settings.contact.email), label: "Email de contacto", href: "/admin/configuracion/contacto", hint: "Aparece en el pie y en /contacto." },
    { done: Object.values(settings.social).some(Boolean), label: "Al menos una red social", href: "/admin/configuracion/redes", hint: "Solo Instagram se conoce hoy." },
    { done: !env.NEXT_PUBLIC_SITE_URL.includes("localhost"), label: "Dominio del sitio", href: "/admin/configuracion/servidor", hint: "NEXT_PUBLIC_SITE_URL en el servidor; define las URL del sitemap y de Open Graph." },
    { done: projectsLive > 0, label: "Un proyecto publicado", href: "/admin/proyectos", hint: "Sin proyectos, el Home oculta esa sección y /proyectos muestra un estado vacío." },
    { done: clientsOk > 0, label: "Clientes autorizados con logo", href: "/admin/clientes", hint: "Hasta entonces el Home muestra sectores." },
    { done: testimonialsOk > 0, label: "Un testimonio autorizado", href: "/admin/testimonios", hint: "Nunca se inventan: solo con autorización del autor." },
    { done: Boolean(env.NEXT_PUBLIC_GA_ID), label: "Google Analytics 4", href: "/admin/configuracion/servidor", hint: "NEXT_PUBLIC_GA_ID en el servidor. Sin él no se carga ningún tracker ni banner de cookies." },
  ];
  const pendingCount = checklist.filter((item) => !item.done).length;

  const hour = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/La_Paz" }));
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const period = `${days} días`;
  const funnel = [
    { label: "Visitas a /contacto", value: contactViews, hint: "Personas que llegaron al formulario." },
    { label: "Formularios enviados", value: submits, hint: contactViews ? `${pct(submits, contactViews)} de quienes llegaron` : undefined },
    { label: "Clics en WhatsApp", value: events.whatsapp_click },
    { label: "Clics en el botón del hero", value: events.cta_hero },
    { label: "Diagnósticos iniciados", value: events.diagnostic_start },
    { label: "Diagnósticos completados", value: events.diagnostic_complete, hint: events.diagnostic_start ? `${pct(events.diagnostic_complete, events.diagnostic_start)} de los iniciados` : undefined },
    { label: "Calculadoras completadas", value: events.calculator_complete },
    { label: "Partidas de Burrow Runner", value: events.game_start, hint: events.game_start ? `${n(events.game_complete)} terminadas` : undefined },
  ];
  const peakHour = hours.length ? hours.indexOf(Math.max(...hours)) : -1;

  return (
    <>
      <AdminHeading
        eyebrow="Dashboard"
        title={`${greeting}, ${user.name?.split(" ")[0] || "admin"}.`}
        note={`Así está el sitio hoy. Los números salen de la base y de las visitas anónimas del propio sitio (sin bots); nada se simula.`}
        aside={<BurroStatus leads={leadsNew} pending={pendingCount} />}
        actions={
          <>
            <Button href="/admin/proyectos/nuevo" variant="secondary" icon={<Briefcase />}>
              Nuevo proyecto
            </Button>
            <Button href="/admin/blog/nuevo" variant="secondary" icon={<BookOpen />}>
              Nuevo artículo
            </Button>
            <Button href="/admin/media" variant="secondary" icon={<ImageIcon />}>
              Subir imagen
            </Button>
            <Button href="/admin/home" icon={<Home />}>
              Editar el Home
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <nav aria-label="Período" className="flex items-center gap-1.5">
          <span className="mr-1 type-mono text-muted">Período</span>
          {RANGES.map((range) => (
            <Link key={range} href={range === 30 ? "/admin" : `/admin?dias=${range}`} aria-current={range === days ? "page" : undefined} className={cn("badge type-mono min-h-9 px-3", range === days && "bg-accent text-accent-fg")}>
              {range} días
            </Link>
          ))}
        </nav>
        <nav aria-label="Secciones del dashboard" className="flex flex-wrap gap-x-4 gap-y-1 type-small font-semibold">
          {[
            ["#trafico", "Tráfico"],
            ["#audiencia", "Audiencia"],
            ["#contenido", "Qué miran"],
            ["#puesta-en-marcha", "Puesta en marcha"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="hover:text-link">
              {label}
            </a>
          ))}
        </nav>
      </div>

      <dl className="admin-panel grid gap-px overflow-hidden bg-line p-0 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={`Visitas (${period})`} value={n(traffic.views)} delta={<Delta now={traffic.views} before={traffic.prevViews} />} spark={series.map((d) => d.views)} note="Páginas vistas por personas." />
        <Stat label={`Visitantes (${period})`} value={n(traffic.visitors)} delta={<Delta now={traffic.visitors} before={traffic.prevVisitors} />} spark={series.map((d) => d.visitors)} note="Únicos por día, sin cookies ni IP." />
        <Stat label="Leads nuevos sin atender" value={n(leadsNew)} note={`${n(leadsTotal)} en total`} href="/admin/leads?estado=new" />
        <Stat label={`Leads (${period})`} value={n(leadsRecent)} delta={<Delta now={leadsRecent} before={leadsPrev} />} href="/admin/leads" />
        <Stat label="Conversión del formulario" value={contactViews ? pct(submits, contactViews) : "—"} note={`${n(submits)} envíos / ${n(contactViews)} visitas a /contacto`} />
        <Stat label="Clics en WhatsApp" value={n(events.whatsapp_click)} />
        <Stat label="Suscriptores a la newsletter" value={n(newsletter.active)} note={newsletter.last30 ? `${n(newsletter.last30)} nuevos en 30 días` : "Nadie se anotó todavía"} href="/admin/newsletter" />
        <Stat label="Bots detectados" value={n(bots.bots)} note={`${pct(bots.bots, bots.bots + bots.humans)} del tráfico. No cuentan en las demás métricas.`} />
      </dl>

      <SectionTitle id="trafico" note="Visitas y visitantes únicos por día, hora de Bolivia.">
        Tráfico
      </SectionTitle>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title={`Últimos ${period}`}>
          <AreaChart
            labels={series.map((d) => d.day)}
            series={[
              { name: "Visitas", values: series.map((d) => d.views), tone: "ink" },
              { name: "Visitantes", values: series.map((d) => d.visitors), tone: "blue" },
            ]}
            ariaLabel={`Visitas y visitantes por día en los últimos ${period}`}
          />
        </Panel>
        <Panel title="A qué hora entran" actions={peakHour >= 0 && hours[peakHour] > 0 ? <span className="type-mono">Pico: {peakHour}:00</span> : undefined}>
          <HourBars values={hours} ariaLabel="Visitas por hora del día" />
        </Panel>
      </div>

      <SectionTitle id="audiencia" note="De dónde llegan y con qué entran. Solo datos gruesos: país, dispositivo, navegador e idioma.">
        Audiencia
      </SectionTitle>
      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-4">
        <Panel title="De dónde llegan">
          <BarList items={referrers} total={traffic.views} empty="Todavía no hay visitas." />
        </Panel>
        <Panel title="Países">
          <BarList items={countries.map((c) => ({ label: `${flag(c.code)} ${c.label}`.trim(), value: c.value }))} total={traffic.views} empty="Sin visitas todavía. El país se conoce al desplegar detrás de Vercel o Cloudflare." />
        </Panel>
        <Panel title="Dispositivos">
          <Donut slices={deviceShare} ariaLabel="Visitas por tipo de dispositivo" center={deviceShare[0] ? pct(deviceShare[0].value, traffic.views) : undefined} />
        </Panel>
        <Panel title="Navegadores">
          <Donut slices={browserShare} ariaLabel="Visitas por navegador" />
        </Panel>
        <Panel title="Humanos y bots">
          <Donut slices={[{ label: "Personas", value: bots.humans }, { label: "Bots", value: bots.bots }]} ariaLabel="Visitas de personas frente a bots" center={pct(bots.humans, bots.humans + bots.bots)} />
        </Panel>
        <Panel title="Idiomas">
          <BarList items={langs} total={traffic.views} empty="Sin visitas todavía." />
        </Panel>
        <Panel title="Embudo" className="lg:col-span-2">
          <BarList items={funnel} />
        </Panel>
      </div>

      <SectionTitle id="contenido" note="Lo que más abren, consultan y hacen en el sitio.">
        Qué miran
      </SectionTitle>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Páginas más vistas">
          <BarList items={paths.map((p) => ({ label: p.label === "/" ? "/ (Inicio)" : p.label, value: p.value, href: isInternalPath(p.label) ? p.label : undefined }))} total={traffic.views} empty="Todavía no hay visitas." />
        </Panel>
        <Panel title="Planes que consultan">
          <BarList items={plans} empty="Todavía nadie tocó el botón de un plan." />
        </Panel>
        <Panel title="Proyectos que abren">
          <BarList items={projectViews} empty="Todavía no hay vistas de proyectos (o no hay proyectos publicados)." />
        </Panel>
      </div>

      <SectionTitle id="puesta-en-marcha" note="Lo que falta cargar y lo que ya está vivo en el sitio.">
        Puesta en marcha
      </SectionTitle>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Panel
          title="Checklist"
          actions={<Badge variant={pendingCount ? "accent" : "solid"}>{pendingCount ? `${pendingCount} pendientes` : "Todo listo"}</Badge>}
        >
          <p className="mb-2 type-small text-muted">
            {checklist.length - pendingCount} de {checklist.length} listos. Lo que falta son datos reales que solo vos podés cargar; el sitio ya está preparado para recibirlos.
          </p>
          <div className="admin-progress mb-4" role="progressbar" aria-valuemin={0} aria-valuemax={checklist.length} aria-valuenow={checklist.length - pendingCount} aria-label="Puesta en marcha">
            <span style={{ width: `${((checklist.length - pendingCount) / checklist.length) * 100}%` }} />
          </div>
          <ul className="grid gap-1">
            {checklist.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="admin-tile flex items-start gap-3 border-transparent px-2 py-2">
                  {item.done ? <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-link" /> : <CircleDashed aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted" />}
                  <span className="min-w-0">
                    <span className={item.done ? "font-semibold text-muted line-through" : "font-semibold"}>{item.label}</span>
                    {!item.done && <span className="block type-small text-muted">{item.hint}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="grid content-start gap-6">
          <Panel
            title="Leads sin atender"
            actions={
              <Link href="/admin/leads" className="flex items-center gap-1 font-semibold hover:text-link">
                Ver todos <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            }
          >
            {latest.length === 0 ? (
              <p className="text-muted">Nada pendiente. Cuando llegue una consulta, aparece acá.</p>
            ) : (
              <ul className="-my-1">
                {latest.map((lead) => (
                  <li key={lead.id} className="border-b border-line last:border-0">
                    <Link href={`/admin/leads/${lead.id}`} className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1 py-2 hover:text-link">
                      <span className="font-semibold">{lead.name}</span>
                      <span className="type-mono text-muted">{lead.type === "contact" ? "Contacto" : "Diagnóstico"}</span>
                      {lead.projectType && <span className="type-small text-muted">{lead.projectType}</span>}
                      <span className="ml-auto type-small text-muted">{lead.createdAt.toLocaleDateString("es-BO", { timeZone: "America/La_Paz" })}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Contenido">
            <ul className="grid gap-2 sm:grid-cols-2">
              {[
                { label: "Servicios publicados", n: servicesLive, href: "/admin/servicios" },
                { label: "Proyectos publicados", n: projectsLive, href: "/admin/proyectos?estado=published" },
                { label: "Proyectos en borrador", n: projectsDraft, href: "/admin/proyectos?estado=draft" },
                { label: "Artículos publicados", n: postsLive, href: "/admin/blog?estado=published" },
                { label: "Artículos en borrador", n: postsDraft, href: "/admin/blog?estado=draft" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="admin-tile flex items-center justify-between gap-3 px-3 py-2">
                    <span className="type-small">{item.label}</span>
                    <span className="font-extrabold tabular-nums">{item.n}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/admin/proyectos/nuevo" className="admin-tile flex min-h-full items-center gap-2 border-dashed border-line-strong px-3 py-2 type-small font-semibold">
                  <Plus aria-hidden="true" className="size-4" />
                  Cargar un proyecto
                </Link>
              </li>
            </ul>
          </Panel>
        </div>
      </div>

      <Panel
        title="Actividad reciente"
        className="mt-6"
        actions={
          <Link href="/admin/actividad" className="flex items-center gap-1 font-semibold hover:text-link">
            Ver todo <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        }
      >
        <ActivityList items={activity} />
      </Panel>
    </>
  );
}
