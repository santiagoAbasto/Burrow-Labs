import Image from "next/image";
import { Stratum } from "@/components/ui/stratum";
import { getSettings } from "@/lib/content";
import type { HomeContent } from "../sections";

/**
 * Cinta de frases de marca (Configuración › Frases de marca): corre en bucle sobre una banda amarilla fina,
 * con la insignia del burro entre frase y frase. Se frena al pasar el cursor; sin movimiento, queda quieta.
 */
export default async function Phrases({ content }: { content: HomeContent<"phrases"> }) {
  const { brandPhrases } = await getSettings();
  const phrases = brandPhrases.length ? brandPhrases : ["Codificando soluciones."];
  // Dos copias seguidas: la animación recorre la mitad del ancho y el bucle no se nota.
  const loop = [...phrases, ...phrases];
  return (
    <Stratum as="section" tone="lab" flush aria-label="Frases de marca" className="ticker" style={{ "--ticker-seconds": `${Math.max(18, phrases.length * 6)}s` } as React.CSSProperties}>
      {content.kicker && <p className="sr-only">{content.kicker}</p>}
      <div className="ticker-track" aria-hidden="true">
        {loop.map((phrase, i) => (
          <span key={`${phrase}-${i}`} className="ticker-item">
            <Image src="/brand/badge.svg" alt="" width={28} height={28} className="ticker-badge" />
            {phrase}
          </span>
        ))}
      </div>
      {/* para lectores de pantalla: las frases una sola vez, sin la cinta */}
      <ul className="sr-only">
        {phrases.map((phrase) => (
          <li key={phrase}>{phrase}</li>
        ))}
      </ul>
    </Stratum>
  );
}
