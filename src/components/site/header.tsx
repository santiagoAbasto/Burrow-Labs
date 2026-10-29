"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { Container } from "@/components/ui/stratum";
import { NAV } from "./nav";

/** Header fijo: compacto tras el primer scroll, se oculta al bajar y vuelve al subir. Toma el estrato que tiene debajo. */
export function Header() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = window.scrollY;
    let frame = 0;
    el.dataset.hidden = "false"; // una página nueva arranca con el header a la vista
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      el.dataset.compact = String(y > 24);
      if (Math.abs(y - last) > 6) {
        el.dataset.hidden = String(y > last && y > 160);
        last = y;
      }
      // El estrato de primer nivel que queda justo debajo del header.
      let under = document.elementFromPoint(window.innerWidth / 2, el.offsetHeight + 2)?.closest<HTMLElement>("[data-stratum]");
      for (let up = under?.parentElement?.closest<HTMLElement>("main [data-stratum]"); up; up = up.parentElement?.closest<HTMLElement>("main [data-stratum]")) under = up;
      if (under && !el.contains(under) && under.dataset.stratum) el.dataset.stratum = under.dataset.stratum;
      el.dataset.synced = "true"; // desde acá manda data-stratum, no el estrato inicial por CSS
    };
    const onScroll = () => (frame ||= requestAnimationFrame(update));
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Un estrato también cambia sin scroll: el hero del inicio lo mueve con el descenso 3D, que llega con retraso.
    // Sin esto, al subir rápido el último scroll leía todavía «deep» y el menú quedaba blanco sobre papel.
    // El header está fuera de <main>, así que sus propios cambios de estrato no vuelven a disparar esto.
    const strata = new MutationObserver(onScroll);
    const main = document.querySelector("main");
    if (main) strata.observe(main, { subtree: true, attributes: true, attributeFilter: ["data-stratum"] });
    return () => {
      window.removeEventListener("scroll", onScroll);
      strata.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <header ref={ref} data-stratum="surface" className="site-header fixed inset-x-0 top-0 z-40">
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <Logo />
        <nav aria-label="Principal" className="hidden min-[1025px]:block">
          <ul className="flex items-center gap-6">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isCurrent(item.href) ? "page" : undefined} className="nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Button href="/contacto" className="max-sm:hidden">
            Hablemos
          </Button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="grid size-11 place-items-center rounded-md border border-line-strong min-[1025px]:hidden"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
        </div>
      </Container>
      <Drawer open={open} onOpenChange={setOpen} title="Menú" tone="lab">
        <nav aria-label="Principal (móvil)">
          <ul className="grid">
            {[...NAV, { label: "Contacto", href: "/contacto" }].map((item, i) => (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className="flex min-h-14 items-baseline gap-4 py-3 type-h3 aria-[current=page]:text-accent"
                >
                  <span className="type-mono text-muted">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Button href="/contacto" size="lg" className="mt-8 w-full" onClick={() => setOpen(false)}>
          Hablemos
        </Button>
        <p className="mt-6 type-mono text-muted">Codificando soluciones.</p>
      </Drawer>
    </header>
  );
}
