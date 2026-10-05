import { ArrowUp } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BrandPhrases } from "./brand-phrases";
import { SmartLink } from "@/components/ui/smart-link";
import { Container, Stratum } from "@/components/ui/stratum";
import type { Settings } from "@/lib/content";
import { LEGAL_LINKS, NAV, TOOLS } from "./nav";
import { Newsletter } from "./newsletter";

const SOCIAL_LABELS: Record<keyof Settings["social"], string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  github: "GitHub",
  facebook: "Facebook",
  tiktok: "TikTok",
  x: "X",
};

function Column({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="type-mono text-muted">{title}</h2>
      <ul className="mt-4 grid">
        {links.map((link) => (
          <li key={link.href}>
            <SmartLink href={link.href} className="inline-flex min-h-11 min-w-11 items-center hover:text-accent">
              {link.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ settings }: { settings: Settings }) {
  const social = (Object.keys(SOCIAL_LABELS) as (keyof Settings["social"])[])
    .filter((key) => settings.social[key])
    .map((key) => ({ label: SOCIAL_LABELS[key], href: settings.social[key] }));
  const contact = [
    ...(settings.contact.email ? [{ label: settings.contact.email, href: `mailto:${settings.contact.email}` }] : []),
    { label: "Formulario de contacto", href: "/contacto" },
    ...social,
  ];

  return (
    <Stratum as="footer" tone="bedrock" flush className="pt-10 pb-8">
      <Container>
        {/* banda de newsletter: el burro asoma por arriba de la tarjeta, por eso el pt-10 del footer */}
        <Newsletter className="mb-16" place="pie de página" />
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Image src="/brand/logo-full.svg" alt="Burrow Labs" width={868} height={875} className="w-44" />
            <BrandPhrases phrases={settings.brandPhrases} fallback="Codificando soluciones." className="mt-6 type-h3" />
            <p className="mt-2 max-w-sm text-muted">
              Software a medida · Automatización · Integraciones · IA aplicada
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <Column title="Sitio" links={[...NAV, { label: "Contacto", href: "/contacto" }]} />
            <Column title="Herramientas" links={TOOLS} />
            <Column title="Hablemos" links={contact} />
          </div>
        </div>
        {/* El relleno derecho deja libre la esquina del botón flotante de WhatsApp (solo mientras la fila llega hasta ahí).
            Desde sm el botón lleva el rótulo «WhatsApp» y ocupa ~12 rem desde el borde: sin ese hueco tapaba «Volver a la superficie». */}
        <div className="mt-16 flex flex-col gap-6 border-t border-line pt-8 pr-[max(0px,calc(5.75rem-(100vw-100%)/2))] sm:flex-row sm:items-center sm:justify-between sm:pr-[max(0px,calc(12.5rem-(100vw-100%)/2))]">
          <div>
            <p className="type-small text-muted">Hecho desde Bolivia para trabajar con empresas de cualquier lugar.</p>
            <ul className="mt-2 flex flex-wrap gap-x-5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <SmartLink href={link.href} className="inline-flex min-h-11 items-center type-small text-muted hover:text-fg">
                    {link.label}
                  </SmartLink>
                </li>
              ))}
              <li className="inline-flex min-h-11 items-center type-small text-muted">© {new Date().getFullYear()} Burrow Labs</li>
            </ul>
          </div>
          <Button href="#contenido" variant="secondary" icon={<ArrowUp />}>
            Volver a la superficie
          </Button>
        </div>
      </Container>
    </Stratum>
  );
}
