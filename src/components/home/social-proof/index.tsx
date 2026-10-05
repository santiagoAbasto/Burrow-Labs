import { LogoCloud } from "@/components/ui/logo-cloud";
import { Container, Stratum } from "@/components/ui/stratum";
import { getClients, getSettings } from "@/lib/content";
import type { HomeContent } from "../sections";

/** Solo clientes autorizados. Si no hay, se muestran sectores: nunca clientes inventados. */
export default async function SocialProof({ content }: { content: HomeContent<"social_proof"> }) {
  const [clients, settings] = await Promise.all([getClients(), getSettings()]);
  const withLogo = clients.flatMap((client) => (client.logo?.width && client.logo.height ? [{ ...client, logo: { src: client.logo.url, width: client.logo.width, height: client.logo.height } }] : []));
  return (
    <Stratum tone="lab" id="sectores" label="Sectores" depth={42} flush className="py-16 lg:py-20">
      <Container className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-center">
        <h2 className="type-h3 max-w-xs">{content.title}</h2>
        {withLogo.length >= 3 ? (
          <LogoCloud
            label={content.clientsLabel}
            items={withLogo.map((client) => ({
              name: client.name,
              href: client.website ?? undefined,
              logo: client.logo,
            }))}
          />
        ) : (
          <div>
            <p className="mb-4 type-mono text-muted">{content.sectorsLabel}</p>
            <LogoCloud label={content.sectorsLabel} items={settings.sectors.map((name) => ({ name }))} />
          </div>
        )}
      </Container>
    </Stratum>
  );
}
