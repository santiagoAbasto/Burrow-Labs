import { JsonFields } from "@/components/admin/json-fields";
import { HelpBox } from "@/components/admin/help-box";
import { AdminHeading, Alert } from "@/components/admin/shell";
import { StateForm } from "@/components/admin/state-form";
import { saveSettingsGroup } from "@/lib/admin/actions";
import { describeJson } from "@/lib/admin/json-form";
import { SETTINGS_SHAPE } from "@/lib/admin/settings-shape";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/content";
import { normalizePhone } from "@/lib/whatsapp";

const ONLY = ["whatsappPhone", "whatsappEnabled", "whatsappTooltip", "whatsappGreeting", "whatsappDefaultMessage"];

export default async function WhatsAppAdmin() {
  await requireUser();
  const { contact } = await getSettings();
  const valid = normalizePhone(contact.whatsappPhone);
  return (
    <>
      <AdminHeading eyebrow="Captación" title="WhatsApp" note="El número nunca está en el código: se configura acá. El mensaje precargado cambia solo según la página (proyecto, servicio, planes…)." />
      <div className="mb-6">
        <HelpBox topic="whatsapp" />
      </div>
      <div className="mb-6 max-w-3xl">
        <Alert kind={valid ? "success" : "info"}>{valid ? `Número activo: +${valid}. El botón flotante abre WhatsApp.` : "Todavía sin número. Mientras tanto, el botón flotante lleva al formulario de contacto. Formato internacional, 10 a 15 dígitos: +591 7xxxxxxx."}</Alert>
      </div>
      <div className="max-w-3xl">
        <StateForm action={saveSettingsGroup.bind(null, "contact")}>
          {ONLY.map((key) => (
            <input key={key} type="hidden" name="only" value={key} />
          ))}
          <JsonFields field={describeJson(SETTINGS_SHAPE.contact, contact, "contact")} only={ONLY} />
        </StateForm>
      </div>
    </>
  );
}
