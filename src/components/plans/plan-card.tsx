import { ArrowRight } from "lucide-react";
import { TrackClick } from "@/components/site/track";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sticker } from "@/components/ui/sticker";
import { PlanScene } from "./plan-mascot";
import type { Plan } from "@/lib/content";

const amount = new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 });

export function planPrice(plan: Pick<Plan, "priceMode" | "priceAmount" | "currency">): { prefix: string; currency: string; value: string } | null {
  if (plan.priceMode === "hidden") return null;
  if (plan.priceMode === "quote" || plan.priceAmount === null) return { prefix: "", currency: "", value: "A cotizar" };
  return { prefix: plan.priceMode === "from" ? "desde" : "", currency: plan.currency, value: amount.format(plan.priceAmount) };
}

function Body({ plan }: { plan: Plan }) {
  const price = planPrice(plan);
  return (
    <div className="relative flex h-full flex-col p-6">
      {/* a caballo del borde superior: no compite con la ilustración */}
      {plan.featured && (
        <Badge variant="accent" className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          Recomendado
        </Badge>
      )}
      {/* el nombre del plan es el cartel que sostiene el burro */}
      <PlanScene slug={plan.slug} name={plan.name} />
      <p className="min-h-[4.5rem] text-muted">{plan.tagline}</p>
      {price && (
        <p className="mt-4">
          {/* la línea «desde» siempre ocupa su lugar: todos los precios quedan a la misma altura */}
          <span className="block min-h-5 type-mono text-muted">{price.prefix}</span>
          {/* siempre en una sola línea, para que las cuatro tarjetas queden parejas */}
          <span className="flex items-baseline gap-2 text-[2.375rem] leading-none font-black whitespace-nowrap tabular-nums [font-stretch:112%]">
            {price.currency && <span className="text-[0.42em] font-bold tracking-wide">{price.currency}</span>} {price.value}
          </span>
        </p>
      )}
      <p className="mt-3 min-h-10 type-small text-muted">{plan.deliveryTime && `Plazo estimado: ${plan.deliveryTime}`}</p>
      <ul className="mt-6 grid gap-2.5 border-t border-line pt-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-3 type-small">
            {/* El tilde va por CSS (plans.css): como SVG eran 44 copias en el Home, en el HTML y en el payload RSC. */}
            <span aria-hidden="true" className="plan-check mt-0.5 size-4 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        <TrackClick event="plan_cta" meta={{ plan: plan.slug }}>
          <Button href={`/contacto?plan=${plan.slug}`} variant={plan.featured ? "primary" : "secondary"} icon={<ArrowRight />} className="w-full">
            {plan.ctaLabel || "Consultar"}
          </Button>
        </TrackClick>
      </div>
    </div>
  );
}

/** Columna de plan. El destacado es la única pieza con sticker. */
export function PlanCard({ plan }: { plan: Plan }) {
  return plan.featured ? (
    <Sticker as="li" className="plan-card h-full">
      <Body plan={plan} />
    </Sticker>
  ) : (
    <li className="plan-card h-full rounded-lg border border-line bg-panel" data-reveal="">
      <Body plan={plan} />
    </li>
  );
}

export function PlanGrid({ plans }: { plans: Plan[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </ul>
  );
}
