import "server-only";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/cn";
import { SmartLink } from "./smart-link";

/**
 * Markdown del CMS (casos, Lab, FAQ, legales). Sin HTML crudo: react-markdown no
 * lo interpreta y `skipHtml` lo descarta; las URL pasan por su saneado por defecto
 * (bloquea javascript:). Enlaces externos: pestaña nueva + rel noopener noreferrer.
 * `# h1` baja a <h2>: el h1 es de la página.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          h1: ({ children }) => <h2>{children}</h2>,
          a: ({ href, title, children }) =>
            href ? (
              <SmartLink href={href} title={title}>
                {children}
              </SmartLink>
            ) : (
              <span>{children}</span>
            ),
          img: ({ src, alt, title }) => (
            // eslint-disable-next-line @next/next/no-img-element -- imagen de contenido con dimensiones desconocidas
            <img src={src} alt={alt ?? ""} title={title} loading="lazy" decoding="async" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
