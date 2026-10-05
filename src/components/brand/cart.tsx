import { cn } from "@/lib/cn";
import { Grip } from "./limbs";
import { Mascot } from "./mascot";

/**
 * El burro en una vagoneta de mina, agarrado del borde con las dos pezuñas. La vagoneta y los brazos
 * son piezas dibujadas aparte; la mascota es el vector original sin modificar (la vagoneta solo tapa
 * su parte inferior). Con `data-rolling` giran las ruedas (ver globals.css).
 */
export function Cart({ className, lively = false }: { className?: string; lively?: boolean }) {
  return (
    <span className={cn("cart relative block aspect-[100/130]", className)} aria-hidden="true">
      <Mascot variant="mascot" sizes="96px" track={false} lively={lively} className="absolute top-0 left-[14%] w-[72%]" />
      <svg viewBox="0 0 100 130" className="absolute inset-0 size-full overflow-visible">
        <g strokeLinejoin="round">
          <path d="M5 80 H95 L87 114 H13 Z" fill="none" stroke="#fcea10" strokeWidth="9" />
          <path d="M5 80 H95 L87 114 H13 Z" fill="#5e615e" stroke="#080a09" strokeWidth="3.5" />
          <rect x="2" y="75" width="96" height="9" rx="3" fill="#b7b6b2" stroke="#080a09" strokeWidth="3" />
          <path d="M26 90 V108 M50 90 V108 M74 90 V108" stroke="#080a09" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
        </g>
        <Grip x={25} edge={76} scale={0.82} className="cart-grip" />
        <Grip x={75} edge={76} scale={0.82} className="cart-grip" delay={-0.6} />
        {[27, 73].map((x) => (
          <g key={x} className="cart-wheel">
            <circle cx={x} cy="118" r="10.5" fill="#080a09" stroke="#fcea10" strokeWidth="2.5" />
            <path d={`M${x - 7} 118 h14 M${x} 111 v14`} stroke="#c4c2c1" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={x} cy="118" r="3" fill="#c4c2c1" />
          </g>
        ))}
      </svg>
    </span>
  );
}
