import { ActivityList } from "@/components/admin/activity-list";
import { HelpBox } from "@/components/admin/help-box";
import { AdminHeading, Panel } from "@/components/admin/shell";
import { recentActivity } from "@/lib/admin/activity";
import { requireUser } from "@/lib/auth";

export default async function ActivityPage() {
  await requireUser();
  const items = await recentActivity(200);
  return (
    <>
      <AdminHeading eyebrow="Panel" title="Actividad" note="Quién cambió qué en el panel. Últimos 200 movimientos. No registra nada de los visitantes." />
      <div className="mb-6">
        <HelpBox topic="actividad" />
      </div>
      <Panel title="Bitácora">
        <ActivityList items={items} />
      </Panel>
    </>
  );
}
