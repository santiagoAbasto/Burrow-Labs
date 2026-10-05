import { emailConfigured, emailDriver, newsletterFrom } from "@/lib/email";
import { Panel } from "./shell";

const PROVIDER: Record<typeof emailDriver, string> = { log: "Sin proveedor", smtp: "SMTP", resend: "Resend", brevo: "Brevo" };

/** Columna lateral del formulario de campaña: cómo se envía y con qué proveedor. Server component. */
export function CampaignAside() {
  return (
    <div className="grid content-start gap-5 max-xl:order-first xl:order-2 xl:sticky xl:top-6">
      <Panel title="Cómo se envía">
        <ol className="admin-steps">
          <li>Asunto y cuerpo en Markdown. La vista previa del editor muestra cómo queda.</li>
          <li>Guardá y usá «Enviarme una prueba»: te llega a tu propio email con «[Prueba]» en el asunto.</li>
          <li>«Enviar a N suscriptores» lo manda a todos los activos, uno por uno, cada cual con su enlace de baja. No se puede deshacer.</li>
          <li>Al terminar ves cuántos salieron y cuántos fallaron; la campaña queda en solo lectura.</li>
        </ol>
      </Panel>
      <Panel title="Proveedor de correo">
        <div className="admin-tile grid gap-1 px-4 py-3">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold">{PROVIDER[emailDriver]}</span>
            <span className={emailConfigured ? "admin-tag" : "admin-tag is-pending"}>{emailConfigured ? "Listo" : "Falta"}</span>
          </p>
          {emailConfigured ? (
            <p className="type-small text-muted">Remitente: {newsletterFrom}. Si el proveedor rechaza correos, revisá que el dominio esté verificado.</p>
          ) : (
            <p className="type-small text-muted">Con EMAIL_DRIVER=log no se envía nada de verdad: cada correo solo queda en la consola del servidor. Se configura en el .env (ver docs/DEPLOY.md).</p>
          )}
          <p className="type-mono text-muted">EMAIL_DRIVER</p>
        </div>
      </Panel>
    </div>
  );
}
