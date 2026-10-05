import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowRight, Info } from "lucide-react";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { AnimatedCode } from "@/components/ui/animated-code";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CTA } from "@/components/ui/cta";
import { Drawer, Modal } from "@/components/ui/dialog";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { LogoCloud } from "@/components/ui/logo-cloud";
import { Markdown } from "@/components/ui/markdown";
import { Metric } from "@/components/ui/metric";
import { ProcessNode } from "@/components/ui/process-node";
import { BrandPhrase, SectionHeading } from "@/components/ui/section-heading";
import { Sticker } from "@/components/ui/sticker";
import { Container, Stratum, TONES, type Tone } from "@/components/ui/stratum";
import { Tabs } from "@/components/ui/tabs";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { Timeline } from "@/components/ui/timeline";
import { Tooltip } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "UI kit",
  robots: { index: false, follow: false },
};

const PRIMITIVES = [
  ["blue-500", "bg-blue-500"],
  ["blue-400", "bg-blue-400"],
  ["blue-300", "bg-blue-300"],
  ["blue-200", "bg-blue-200"],
  ["navy-700", "bg-navy-700"],
  ["navy-800", "bg-navy-800"],
  ["night-900", "bg-night-900"],
  ["night-950", "bg-night-950"],
  ["ink", "bg-ink"],
  ["paper", "bg-paper"],
  ["white", "bg-white"],
  ["yellow-400", "bg-yellow-400"],
  ["yellow-500", "bg-yellow-500"],
  ["donkey-300", "bg-donkey-300"],
  ["donkey-400", "bg-donkey-400"],
  ["steel-600", "bg-steel-600"],
] as const;

const TYPE = [
  ["type-display", "Codificando"],
  ["type-h1", "Si se repite, lo automatizamos"],
  ["type-h2", "Cavamos profundo. Construimos mejor."],
  ["type-h3", "Subtítulo en caja normal, peso 600"],
  ["type-lead", "Bajada: convertimos procesos manuales en software que trabaja por tu negocio."],
  ["type-body", "Cuerpo: menos tareas repetitivas, más sistemas haciendo el trabajo pesado."],
  ["type-small", "Texto chico para notas y ayudas de formulario."],
  ["type-mono", "Rótulo mono · estrato 03 · −18 m"],
] as const;

const MARKDOWN = `## Prosa del CMS

Texto con **negrita**, \`código\`, un [enlace interno](/contacto) y uno [externo](https://nextjs.org).

- Lista con viñetas cuadradas
- [x] Tarea hecha (GFM)

> Tu problema entra. La solución sale.

| Estado | Significado |
|---|---|
| draft | Borrador |
| published | Público |

<script>alert("el HTML crudo se descarta")</script>
`;

function Block({ title, stacked, children }: { title: string; stacked?: boolean; children: ReactNode }) {
  return (
    <section
      className={`grid gap-6 border-t border-line pt-6 ${stacked ? "" : "lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10"}`}
    >
      <h3 className="type-mono text-muted">{title}</h3>
      <div className="grid min-w-0 gap-6">{children}</div>
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-3">{children}</div>;
}

function Buttons() {
  return (
    <>
      <Row>
        <Button icon={<ArrowRight />}>Contanos qué querés resolver</Button>
        <Button variant="secondary">Ver lo que construimos</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link" href="#tokens">
          Enlace
        </Button>
      </Row>
      <Row>
        <Button size="lg" href="#tokens" icon={<ArrowRight />}>
          Primario lg (enlace)
        </Button>
        <Button size="lg" variant="secondary">
          Secundario lg
        </Button>
      </Row>
      <Row>
        <Button loading>Enviando</Button>
        <Button variant="secondary" loading>
          Enviando
        </Button>
        <Button disabled>Deshabilitado</Button>
        <Button variant="secondary" disabled>
          Deshabilitado
        </Button>
        <Button variant="ghost" disabled>
          Deshabilitado
        </Button>
      </Row>
    </>
  );
}

function Kit({ tone }: { tone: Tone }) {
  return (
    <div className="grid gap-14">
      <Block title="Button">
        <Buttons />
      </Block>

      <Block title="Badge">
        <Row>
          <Badge>Outline</Badge>
          <Badge variant="solid">Solid</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge dot>Built in Bolivia · Working everywhere</Badge>
        </Row>
      </Block>

      <Block title="SectionHeading">
        <SectionHeading eyebrow="Software · Automatización · IA" title="Codificando soluciones.">
          Convertimos procesos manuales, herramientas desconectadas e ideas complejas en software
          que trabaja por tu negocio.
        </SectionHeading>
      </Block>

      <Block title="Field · Input · Textarea · Select · Checkbox">
        <form className="grid max-w-3xl gap-6 sm:grid-cols-2">
          <Field label="Nombre" required>
            <Input name="name" autoComplete="name" placeholder="Tu nombre" />
          </Field>
          <Field label="Empresa" hint="Si es un proyecto personal, dejalo vacío.">
            <Input name="company" autoComplete="organization" />
          </Field>
          <Field label="Email" required error="Escribí un email válido, por ejemplo nombre@empresa.com.">
            <Input name="email" type="email" defaultValue="nombre@empresa" />
          </Field>
          <Field label="¿Qué necesitás?" required>
            <Select name="need" defaultValue="">
              <option value="" disabled>
                Elegí una opción
              </option>
              <option>Una web</option>
              <option>Un sistema a medida</option>
              <option>Automatizar un proceso</option>
            </Select>
          </Field>
          <Field label="Contanos el problema" className="sm:col-span-2">
            <Textarea name="message" placeholder="Qué se hace hoy a mano, con qué herramientas y cada cuánto." />
          </Field>
          <Field label="Campo deshabilitado">
            <Input name="disabled" disabled defaultValue="No editable" />
          </Field>
          <div className="grid content-start sm:col-span-2">
            <Checkbox name="consent" defaultChecked>
              Acepto que Burrow Labs me contacte por este pedido.
            </Checkbox>
            <Checkbox name="terms" error="Tenés que aceptar para poder enviar.">
              Leí la política de privacidad.
            </Checkbox>
            <Checkbox name="off" disabled>
              Opción deshabilitada
            </Checkbox>
          </div>
        </form>
      </Block>

      <Block title="Modal · Drawer · Tooltip">
        <Row>
          <Modal
            trigger={<Button variant="secondary">Abrir modal</Button>}
            title="Diagnóstico express"
            description="Cierra con Esc, con la X o tocando fuera. El foco vuelve al botón que lo abrió."
          >
            <Field label="Email" required>
              <Input name="modal-email" type="email" />
            </Field>
            <Row>
              <Button>Enviar</Button>
            </Row>
          </Modal>
          <Drawer
            trigger={<Button variant="secondary">Abrir drawer</Button>}
            title="Menú"
            description="Panel lateral sobre <dialog>."
          >
            <nav aria-label={`Demo ${tone}`} className="grid">
              {["Servicios", "Proyectos", "Planes", "Contacto"].map((item) => (
                <Button key={item} variant="ghost" href="#tokens" className="justify-start">
                  {item}
                </Button>
              ))}
            </nav>
          </Drawer>
          <Tooltip label="Precio base. El final depende del alcance.">
            <Button variant="ghost" icon={<Info />}>
              Con tooltip
            </Button>
          </Tooltip>
          <Tooltip label="Abajo y alineado al inicio." side="bottom" align="start">
            <Button variant="ghost">Tooltip abajo</Button>
          </Tooltip>
        </Row>
      </Block>

      <Block title="Accordion">
        <Accordion className="max-w-3xl">
          <AccordionItem name={`faq-${tone}`} title="¿Trabajan con empresas fuera de Bolivia?" defaultOpen>
            Respuesta de ejemplo de la vitrina. Las respuestas reales vienen del CMS.
          </AccordionItem>
          <AccordionItem name={`faq-${tone}`} title="¿Cuánto tarda un proyecto?">
            Con el mismo <code>name</code>, abrir un item cierra el anterior sin JavaScript.
          </AccordionItem>
          <AccordionItem name={`faq-${tone}`} title="¿Puedo empezar con algo chico?">
            Contenido de ejemplo.
          </AccordionItem>
        </Accordion>
      </Block>

      <Block title="Tabs">
        <Tabs
          label="Tipo de plan"
          tabs={[
            { id: "web", label: "Web", content: <p className="type-body">Panel «Web». Flechas ← → para cambiar.</p> },
            { id: "systems", label: "Sistemas", content: <p className="type-body">Panel «Sistemas».</p> },
            { id: "auto", label: "Automatización", content: <p className="type-body">Panel «Automatización».</p> },
          ]}
        />
      </Block>

      <Block title="Metric">
        <div className="grid gap-8 sm:grid-cols-3">
          <Metric value="6" label="Estratos" note="De la superficie a la roca madre." />
          <Metric value="44" unit="px" label="Objetivo táctil mínimo" />
          <Metric value="4.5:1" label="Contraste mínimo de texto" note="Datos del propio kit, no del negocio." />
        </div>
      </Block>

      <Block title="LogoCloud">
        <LogoCloud
          label="Sectores"
          items={["Industria", "Comercio", "Inmobiliarias", "Servicios", "Retail", "Manufactura", "Tecnología"].map(
            (name) => ({ name }),
          )}
        />
      </Block>

      <Block title="Timeline · ProcessNode">
        <div className="grid gap-12 md:grid-cols-2">
          <Timeline
            items={[
              { meta: "Semana 1", title: "Descubrir", body: "Entendemos el problema antes de programar." },
              { meta: "Semana 2", title: "Diseñar", body: "Definimos flujos, arquitectura y experiencia." },
              { meta: "Semana 3+", title: "Construir", body: "Desarrollamos por entregas verificables." },
            ]}
          />
          <ol>
            <ProcessNode step={1} title="Descubrir" state="done">
              Entendemos el problema antes de programar.
            </ProcessNode>
            <ProcessNode step={2} title="Diseñar" state="active">
              Definimos flujos, arquitectura y experiencia.
            </ProcessNode>
            <ProcessNode step={3} title="Construir">
              Desarrollamos por entregas verificables.
            </ProcessNode>
          </ol>
        </div>
      </Block>

      <Block title="AnimatedCode · Sticker">
        <div className="grid items-start gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <AnimatedCode
            lines={[
              { text: "burrow dig --proceso facturacion" },
              { text: "3 planillas, 2 chats, 0 integraciones", kind: "out" },
              { text: "burrow build --entregas verificables" },
              { text: "ok · sistema en producción. Menos trabajo manual.", kind: "ok" },
            ]}
          />
          <Sticker tone="chalk" tilt="left" className="grid max-w-xs gap-2 p-6">
            <p className="type-mono">Plan destacado</p>
            <p className="type-h3">El sticker es escaso: mascota, sello, insignias y un plan.</p>
          </Sticker>
        </div>
      </Block>

      <Block title="Markdown">
        <Markdown>{MARKDOWN}</Markdown>
      </Block>
    </div>
  );
}

export default function UiKitPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main>
      <Stratum tone="surface" as="header" label="Superficie" depth={0}>
        <Container className="grid gap-8">
          <Badge dot>Vitrina interna · solo desarrollo</Badge>
          <h1 className="type-display">UI kit</h1>
          <p className="type-lead">
            Cada componente en un estrato claro y uno oscuro. Solo variables semánticas: el mismo
            componente cambia de piel al cambiar de capa.
          </p>
        </Container>
      </Stratum>

      <Stratum tone="surface" id="tokens" flush className="pb-section">
        <Container className="grid gap-14">
          <Block title="Primitivos">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {PRIMITIVES.map(([name, className]) => (
                <li key={name} className="grid gap-2">
                  <span className={`block h-14 rounded-md border border-line ${className}`} />
                  <span className="type-mono">{name}</span>
                </li>
              ))}
            </ul>
          </Block>
          <Block title="Estratos">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TONES.map((tone) => (
                <li key={tone} data-stratum={tone} className="grid gap-3 rounded-lg border border-line p-5">
                  <p className="type-mono">{tone}</p>
                  <p className="type-h3">Texto principal</p>
                  <p className="text-muted">
                    Texto secundario y{" "}
                    <a href="#tokens" className="text-link underline underline-offset-4">
                      un enlace
                    </a>
                    .
                  </p>
                  <p className="rounded-md border border-line-strong bg-panel px-3 py-2 text-muted type-small">
                    Panel con borde de control
                  </p>
                  <Row>
                    <Button>Primario</Button>
                    <Button variant="secondary">Secundario</Button>
                  </Row>
                </li>
              ))}
            </ul>
          </Block>
          <Block title="Tipografía" stacked>
            <div className="grid min-w-0 gap-6">
              {TYPE.map(([className, sample]) => (
                <div key={className} className="grid min-w-0 gap-1">
                  <p className="type-mono text-muted">{className}</p>
                  <p className={className}>{sample}</p>
                </div>
              ))}
            </div>
          </Block>
        </Container>
      </Stratum>

      <Stratum tone="surface" label="Superficie" depth={0} flush className="pb-section">
        <Container className="grid gap-14">
          <h2 className="type-h1">Estrato surface</h2>
          <Kit tone="surface" />
        </Container>
      </Stratum>

      <TerrainCut from="surface" to="topsoil" variant="ridge" />
      <Stratum tone="topsoil" label="Capa fértil" depth={6}>
        <Container className="grid gap-10">
          <BrandPhrase mark="−6 m">Si se repite, lo automatizamos.</BrandPhrase>
          <Block title="topsoil">
            <Buttons />
          </Block>
        </Container>
      </Stratum>

      <TerrainCut from="topsoil" to="deep" variant="shelf" detail="braces" />
      <Stratum tone="deep" label="Profundo" depth={18}>
        <Container className="grid gap-10">
          <BrandPhrase mark="−18 m">El burro hace el trabajo pesado.</BrandPhrase>
          <Block title="deep">
            <Buttons />
          </Block>
        </Container>
      </Stratum>

      <TerrainCut from="deep" to="lab" variant="fault" detail="cable" detailAt={30} />
      <Stratum tone="lab" label="Laboratorio" depth={42}>
        <Container className="grid gap-14">
          <h2 className="type-h1">Estrato lab</h2>
          <Kit tone="lab" />
        </Container>
      </Stratum>

      <TerrainCut from="lab" to="chalk" variant="ridge" flip />
      <Stratum tone="chalk" label="Hoja">
        <Container className="grid gap-10">
          <BrandPhrase>No vendemos código. Resolvemos procesos.</BrandPhrase>
          <Block title="chalk">
            <Buttons />
          </Block>
        </Container>
      </Stratum>

      <TerrainCut from="chalk" to="bedrock" variant="shelf" flip detail="error" />
      <Stratum tone="bedrock" label="Roca madre" depth={64}>
        <Container className="grid gap-10">
          <Block title="bedrock">
            <Buttons />
          </Block>
        </Container>
      </Stratum>

      <TerrainCut from="bedrock" to="topsoil" variant="fault" flip />
      <CTA
        id="cta-demo"
        title={
          <>
            Tu problema entra. <br className="max-sm:hidden" />
            La solución sale.
          </>
        }
        lead="Banda CTA: frase grande y un solo botón."
        action={{ label: "Contanos qué querés resolver", href: "#tokens" }}
        secondary={{ label: "Volver arriba", href: "#tokens" }}
      />
    </main>
  );
}
