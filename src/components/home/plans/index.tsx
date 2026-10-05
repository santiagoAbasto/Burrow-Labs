import { ArrowRight } from "lucide-react";
import { PlanGrid } from "@/components/plans/plan-card";
import { TrackView } from "@/components/site/track";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container, Stratum } from "@/components/ui/stratum";
import { Tabs } from "@/components/ui/tabs";
import { getPlans, getSettings } from "@/lib/content";
import type { HomeContent } from "../sections";

export default async function Plans({ content }: { content: HomeContent<"plans"> }) {
  const [plans, settings] = await Promise.all([getPlans(), getSettings()]);
  if (plans.length === 0) return null;
  const tabs = [
    { id: "web", label: content.webTab, plans: plans.filter((plan) => plan.category === "web") },
    { id: "systems", label: content.systemsTab, plans: plans.filter((plan) => plan.category === "systems") },
  ].filter((tab) => tab.plans.length > 0);

  return (
    <Stratum tone="chalk" id="planes" label="Planes" depth={76} aria-labelledby="planes-title" className="border-t border-line">
      <TrackView event="plan_view" />
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="planes-title" eyebrow={content.eyebrow} title={content.title}>
            {content.body}
          </SectionHeading>
          <Button href="/planes" variant="secondary" icon={<ArrowRight />}>
            {content.cta}
          </Button>
        </div>
        <Tabs
          className="mt-12"
          label={content.title}
          tabs={tabs.map((tab) => ({ id: tab.id, label: tab.label, content: <PlanGrid plans={tab.plans} /> }))}
        />
        <p className="mt-8 type-small text-muted">{settings.plansDisclaimer}</p>
      </Container>
    </Stratum>
  );
}
