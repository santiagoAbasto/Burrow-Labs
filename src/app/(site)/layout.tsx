import type { ReactNode } from "react";
import { ConsentAnalytics } from "@/components/site/consent-analytics";
import { DepthGauge } from "@/components/site/depth-gauge";
import { EasterEggs } from "@/components/site/easter-eggs";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { JsonLd } from "@/components/site/json-ld";
import { PageView } from "@/components/site/track";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { getSettings } from "@/lib/content";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <a href="#contenido" className="btn sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50" data-variant="primary" data-size="md">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">{children}</main>
      <Footer settings={settings} />
      <DepthGauge />
      {settings.contact.whatsappEnabled && (
        <WhatsAppButton
          phone={settings.contact.whatsappPhone}
          tooltip={settings.contact.whatsappTooltip}
          greeting={settings.contact.whatsappGreeting}
          defaultMessage={settings.contact.whatsappDefaultMessage}
        />
      )}
      <PageView />
      <ConsentAnalytics />
      <EasterEggs />
      <JsonLd data={[organizationJsonLd(settings), webSiteJsonLd(settings)]} />
    </>
  );
}
