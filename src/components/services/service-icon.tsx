import { Building2, Code2, Globe, Plug, Smartphone, Sparkles, Workflow, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  code: Code2,
  workflow: Workflow,
  sparkles: Sparkles,
  plug: Plug,
  globe: Globe,
  building: Building2,
  smartphone: Smartphone,
};
export const SERVICE_ICON_KEYS = Object.keys(ICONS);

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Code2;
  return <Icon aria-hidden="true" className={className} strokeWidth={1.75} />;
}
