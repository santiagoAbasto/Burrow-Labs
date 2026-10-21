import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { RequestResetForm } from "@/components/admin/password-reset-forms";
import { requestPasswordReset } from "@/lib/admin/actions";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Recuperar la contraseña · Burrow Labs", robots: { index: false, follow: false } };

/** Pide el enlace de recuperación. Con sesión abierta no tiene sentido: va al panel. */
export default async function RecoverPage() {
  if (await getSession()) redirect("/admin");
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
          <h1 className="type-h3">¿Olvidaste la contraseña?</h1>
          <p className="mt-3 mb-6 text-muted">Escribí tu email y te mandamos un enlace para elegir una nueva.</p>
          <RequestResetForm action={requestPasswordReset} />
        </div>
      </div>
    </main>
  );
}
