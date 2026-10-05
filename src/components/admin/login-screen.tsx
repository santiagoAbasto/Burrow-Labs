import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { login } from "@/lib/admin/actions";
import { LoginForm } from "./login-form";

/** Pantalla de ingreso: vive en /admin. Sin sesión, el panel muestra esto. */
export function LoginScreen() {
  return (
    <main data-stratum="lab" className="grid min-h-svh content-center gap-8 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Logo priority />
          <Link href="/" className="type-small text-muted hover:text-fg">
            ← Volver al sitio
          </Link>
        </div>
        <LoginForm action={login} />
      </div>
    </main>
  );
}
