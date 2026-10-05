"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TabItem = { id: string; label: ReactNode; content: ReactNode };

type TabsProps = {
  tabs: TabItem[];
  /** Nombre accesible de la lista de pestañas. */
  label: string;
  defaultId?: string;
  onChange?: (id: string) => void;
  className?: string;
};

/**
 * Pestañas WAI-ARIA con activación automática: ← → Inicio Fin mueven y activan.
 * Todos los paneles se renderizan (los inactivos con `hidden`): el contenido queda en el HTML.
 */
export function Tabs({ tabs, label, defaultId, onChange, className }: TabsProps) {
  const base = useId();
  const [active, setActive] = useState(defaultId ?? tabs[0]?.id);

  const select = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((tab) => tab.id === active);
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : -1;
    const tab = tabs[next];
    if (!tab) return;
    event.preventDefault();
    select(tab.id);
    document.getElementById(`${base}-tab-${tab.id}`)?.focus();
  };

  return (
    <div className={cn("tabs", className)}>
      <div role="tablist" aria-label={label} className="tabs-list" onKeyDown={onKeyDown}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${base}-tab-${tab.id}`}
            aria-selected={tab.id === active}
            aria-controls={`${base}-panel-${tab.id}`}
            tabIndex={tab.id === active ? 0 : -1}
            className="tab"
            onClick={() => select(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${base}-panel-${tab.id}`}
          aria-labelledby={`${base}-tab-${tab.id}`}
          hidden={tab.id !== active}
          tabIndex={0}
          className="tab-panel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
