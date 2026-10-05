import { PlanScene } from "@/components/plans/plan-mascot";

/**
 * El burro del dashboard sostiene un cartel con el estado del día: si hay leads nuevos los anuncia;
 * si falta algo de la puesta en marcha lo cuenta; si está todo, lo celebra.
 */
export function BurroStatus({ leads, pending }: { leads: number; pending: number }) {
  const [slug, name] = leads > 0 ? ["turbo", `${leads} ${leads === 1 ? "lead nuevo" : "leads nuevos"}`] : pending > 0 ? ["escala", `${pending} por cargar`] : ["infinito", "Todo en orden"];
  return (
    <div className="w-52 sm:w-56" aria-label={`Estado: ${name}`}>
      <PlanScene slug={slug} name={name} />
    </div>
  );
}
