import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { HelpBox } from "@/components/admin/help-box";
import { JsonFields } from "@/components/admin/json-fields";
import { AdminHeading } from "@/components/admin/shell";
import { StateForm } from "@/components/admin/state-form";
import { HOME_SECTIONS, isHomeSectionKey } from "@/components/home/sections";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { saveHomeSection } from "@/lib/admin/actions";
import { describeJson, type JsonShape } from "@/lib/admin/json-form";
import { requireUser } from "@/lib/auth";
import { getHomeSections } from "@/lib/content";

export default async function HomeSectionEdit({ params }: { params: Promise<{ key: string }> }) {
  await requireUser();
  const { key } = await params;
  if (!isHomeSectionKey(key)) notFound();
  const section = (await getHomeSections()).find((s) => s.key === key);
  const { label, defaults } = HOME_SECTIONS[key];

  return (
    <>
      <AdminHeading
        title={label}
        crumbs={[{ href: "/admin/home", label: "Home" }]}
        actions={
          <>
            <Button href="/admin/home" variant="secondary">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Volver
            </Button>
            <Button href="/" target="_blank" variant="secondary" icon={<ExternalLink />}>
              Ver el Home
            </Button>
          </>
        }
      />
      <div className="max-w-3xl">
        <div className="mb-6">
          <HelpBox topic="home" compact />
        </div>
        <StateForm action={saveHomeSection.bind(null, key)}>
          <div className="grid gap-5 sm:grid-cols-[1fr_8rem] sm:items-end">
            <Checkbox name="enabled" defaultChecked={section?.enabled ?? true}>
              Mostrar esta sección en el Home
            </Checkbox>
            <Field label="Orden">
              <Input name="sort" type="number" defaultValue={section?.sort ?? 0} />
            </Field>
          </div>
          <JsonFields field={describeJson(defaults as JsonShape, section?.content, "content")} />
        </StateForm>
      </div>
    </>
  );
}
