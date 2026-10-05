import { CampaignAside } from "@/components/admin/campaign-aside";
import { CampaignForm } from "@/components/admin/campaign-form";
import { AdminHeading, Panel } from "@/components/admin/shell";
import { createCampaign } from "@/lib/admin/newsletter-actions";
import { requireUser } from "@/lib/auth";

export default async function NewCampaign() {
  await requireUser();
  return (
    <>
      <AdminHeading title="Nueva campaña" note="Se guarda como borrador: después la probás en tu email y la enviás desde su detalle." crumbs={[{ href: "/admin/newsletter/campanas", label: "Campañas" }]} />
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel title="Campaña" className="xl:order-1">
          <CampaignForm action={createCampaign} />
        </Panel>
        <CampaignAside />
      </div>
    </>
  );
}
