import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { NewPasswordForm } from "@/components/admin/password-reset-forms";
import { Alert } from "@/components/admin/shell";
import { completePasswordReset } from "@/lib/admin/actions";
import { findPasswordReset, getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Nueva contraseña · Burrow Labs", robots: { index: false, follow: false } };

/** El enlace del correo. Se comprueba sin consumirlo: gastarlo al abrir dejaría el enlace muerto si el correo lo pre-visita. */
export default async function NewPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  if (await getSession()) redirect("/admin");
  const { token } = await params;
  const valid = Boolean(await findPasswordReset(token));

  return (
    <main data-stratum="lab" className="grid min-h-svh content-center gap-8 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Logo priority />
          <Link href="/admin" className="type-small text-muted hover:text-fg">
            ← Volver al ingreso
          </Link>
        </div>
        <div className="admin rounded-lg border-[3px] border-ink bg-bg p-8 shadow-[0_0_0_5px_var(--color-yellow-400)]">
          <h1 className="type-h3">Elegí una contraseña nueva</h1>
          {valid ? (
            <>
              <p className="mt-3 mb-6 text-muted">Al guardarla entrás directo, y se cierran las sesiones abiertas en otros dispositivos.</p>
              <NewPasswordForm action={completePasswordReset.bind(null, token)} />
            </>
          ) : (
            <div className="mt-6 grid gap-5">
              <Alert kind="error">Este enlace venció o ya se usó.</Alert>
              <p className="type-small text-muted">Los enlaces valen una hora y sirven una sola vez. Pedí uno nuevo y usá el último que te llegue.</p>
              <Link href="/admin/recuperar" className="text-link underline underline-offset-4">
                Pedir un enlace nuevo
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
