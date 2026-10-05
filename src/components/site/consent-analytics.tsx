"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
/** Hay analítica de terceros que pedir: Google Analytics 4, Microsoft Clarity o las dos. */
const THIRD_PARTY = Boolean(GA_ID || CLARITY_ID);
/** «Google Analytics y Microsoft Clarity», o solo el que esté configurado: para el aviso y el botón de /cookies. */
const PROVIDERS = [GA_ID && "Google Analytics", CLARITY_ID && "Microsoft Clarity"].filter(Boolean).join(" y ");
const KEY = "burrow:consent";

type Choice = "granted" | "denied" | null;

/**
 * Analítica de terceros con consentimiento: Google Analytics 4 y Microsoft Clarity. Sin ninguno de los dos IDs
 * (NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_CLARITY_ID) este componente no renderiza nada: ni aviso ni script. Con alguno,
 * los scripts se cargan recién después de «Aceptar». La elección se cambia desde /cookies con <ConsentReset />.
 * Los IDs se validan con formato estricto en src/lib/env.ts: acá se interpolan en scripts.
 */
export function ConsentAnalytics() {
  const [choice, setChoice] = useState<Choice | "unknown">("unknown");
  // El enlace de baja lleva el código del suscriptor en la URL: esa página nunca carga GA ni muestra el aviso.
  const unsubscribing = usePathname().startsWith("/newsletter/baja");

  useEffect(() => {
    if (!THIRD_PARTY) return;
    let stored: Choice = null;
    try {
      const value = localStorage.getItem(KEY);
      stored = value === "granted" || value === "denied" ? value : null;
    } catch {
      // sin almacenamiento: se pregunta en cada visita
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de localStorage al montar
    setChoice(stored);
  }, []);

  if (!THIRD_PARTY || unsubscribing || choice === "unknown" || choice === "denied") return null;

  const decide = (value: Exclude<Choice, null>) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // la elección vale solo para esta visita
    }
    setChoice(value);
  };

  if (choice === "granted") {
    return (
      <>
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});gtag('js',new Date());gtag('config','${GA_ID}',{allow_google_signals:false,allow_ad_personalization_signals:false});`}
            </Script>
          </>
        )}
        {CLARITY_ID && (
          // Fragmento oficial de Clarity. Se carga solo tras «Aceptar», y además se le confirma el consentimiento de
          // analítica (no el de publicidad) para que guarde sus cookies. El id del <script> NO puede ser «clarity»:
          // un elemento con id pasa a ser window.clarity y el fragmento ya no crea la función.
          <Script id="ms-clarity-tag" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");window.clarity("consentv2",{ad_Storage:"denied",analytics_Storage:"granted"});`}
          </Script>
        )}
      </>
    );
  }

  return (
    <div role="region" aria-label="Cookies de analítica" data-stratum="chalk" className="fixed bottom-4 left-4 z-40 max-w-sm rounded-lg border border-line-strong p-5 shadow-none sm:bottom-6 sm:left-6">
      <p className="type-small">
        Usamos cookies de analítica ({PROVIDERS}) solo si aceptás. Nos ayudan a saber qué páginas sirven y cómo se usa el sitio.{" "}
        <Link href="/cookies" className="text-link underline underline-offset-4">
          Más información
        </Link>
      </p>
      <div className="mt-4 flex gap-2">
        {/* Misma variante en los dos: aceptar y rechazar pesan lo mismo. */}
        <button type="button" className="btn" data-variant="secondary" data-size="md" onClick={() => decide("granted")}>
          Aceptar
        </button>
        <button type="button" className="btn" data-variant="secondary" data-size="md" onClick={() => decide("denied")}>
          Rechazar
        </button>
      </div>
    </div>
  );
}

/** Cookies propias que crean GA (`_ga`, `_ga_<ID>`) y Clarity (`_clck`, `_clsk`). */
const ANALYTICS_COOKIE = /^(_ga|_clck$|_clsk$)/;

/** Vence las cookies de analítica en el host y en cada dominio padre, que es donde las fijan gtag y Clarity. */
function expireAnalyticsCookies() {
  const labels = window.location.hostname.split(".");
  const domains = ["", ...labels.map((_, i) => labels.slice(i).join(".")).filter((d) => d.includes("."))];
  for (const pair of document.cookie.split("; ")) {
    const name = pair.split("=")[0];
    if (!ANALYTICS_COOKIE.test(name)) continue;
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=.${domain}` : ""}`;
  }
}


/**
 * Control de /cookies para retirar o cambiar el consentimiento. Avisa a Clarity que se retiró el consentimiento (borra
 * sus cookies), borra la elección guardada y las cookies de analítica, y recarga: es la única forma de descargar
 * scripts ya cargados (si no, seguirían midiendo y recrearían las cookies). Tras la recarga no hay elección y el
 * aviso vuelve a preguntar. Sin analítica de terceros configurada no renderiza nada.
 */
export function ConsentReset() {
  if (!THIRD_PARTY) return null;

  const reset = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // sin almacenamiento no había nada guardado
    }
    const w = window as { clarity?: (...args: unknown[]) => void; gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === "function") w.gtag("consent", "update", { analytics_storage: "denied" });
    if (typeof w.clarity === "function") w.clarity("consent", false);
    expireAnalyticsCookies();
    window.location.reload();
  };

  return (
    <div className="mt-10 border-t border-line pt-6">
      <p className="type-small text-muted">Borra tu decisión sobre las cookies de analítica y las cookies de {PROVIDERS}. El aviso vuelve a preguntarte.</p>
      <button type="button" className="btn mt-4" data-variant="secondary" data-size="md" onClick={reset}>
        Cambiar mi elección
      </button>
    </div>
  );
}
