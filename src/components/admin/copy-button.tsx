"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function CopyButton({ value, label, icon }: { value: string; label: string; icon?: ReactNode }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      icon={icon}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(new URL(value, location.origin).href);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          prompt("Copiá la URL:", value);
        }
      }}
    >
      {done ? "Copiado" : label}
    </Button>
  );
}
