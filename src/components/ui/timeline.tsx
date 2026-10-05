import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TimelineItem = {
  /** Rótulo mono: fecha, fase o etapa. */
  meta?: string;
  title: string;
  body?: ReactNode;
};

/** Lista ordenada sobre la veta: cada hito es un nodo. */
export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("timeline", className)}>
      {items.map((item) => (
        <li key={item.title} className="timeline-item">
          <span className="veta-dot" aria-hidden="true" />
          {item.meta && <p className="timeline-meta type-mono">{item.meta}</p>}
          <h3 className="type-h3">{item.title}</h3>
          {item.body && <div className="text-muted">{item.body}</div>}
        </li>
      ))}
    </ol>
  );
}
