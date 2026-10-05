import { desc, eq, max } from "drizzle-orm";
import Link from "next/link";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { HelpBox } from "@/components/admin/help-box";
import { AdminHeading, Flash, Panel } from "@/components/admin/shell";
import { CreateUserForm, ResetPasswordForm } from "@/components/admin/user-forms";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { createUser, deleteUser, resetUserPassword } from "@/lib/admin/actions";
import { requireUser } from "@/lib/auth";

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const me = await requireUser();
  const [rows, search] = await Promise.all([
    db
      .select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt, lastSession: max(sessions.createdAt) })
      .from(users)
      .leftJoin(sessions, eq(sessions.userId, users.id))
      .groupBy(users.id)
      .orderBy(desc(users.createdAt)),
    searchParams,
  ]);
  const when = (date: Date | null) => (date ? date.toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "short", timeStyle: "short" }) : "—");

  return (
    <>
      <AdminHeading eyebrow="Sitio" title="Usuarios" note="Quién puede entrar al panel. Todos los usuarios tienen los mismos permisos; cada acción queda en la bitácora con su nombre." />
      <Flash params={search} saved="Usuario creado." deleted="Usuario eliminado." />
      <div className="mb-6">
        <HelpBox topic="usuarios" />
      </div>
      <div className="grid items-start gap-8 xl:grid-cols-[1fr_22rem]">
        <div className="grid gap-4">
          {rows.map((row) => (
            <Panel key={row.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-bold">
                    {row.name || row.email}
                    {row.id === me.id && <Badge variant="accent">Vos</Badge>}
                  </p>
                  <p className="truncate text-muted">{row.email}</p>
                  <p className="mt-1 type-small text-muted">
                    Alta: {when(row.createdAt)} · Último ingreso: {when(row.lastSession)}
                  </p>
                </div>
                {row.id !== me.id && rows.length > 1 && <ConfirmDelete what={`a ${row.name || row.email}`} action={deleteUser.bind(null, row.id)} />}
              </div>
              {row.id === me.id ? (
                <p className="mt-4 type-small text-muted">
                  Tu contraseña se cambia desde{" "}
                  <Link href="/admin/cuenta" className="font-semibold text-link underline underline-offset-4">
                    Mi cuenta
                  </Link>
                  , con la contraseña actual.
                </p>
              ) : (
                <details className="mt-4">
                  <summary className="cursor-pointer type-small font-semibold hover:text-link">Restablecer contraseña</summary>
                  <ResetPasswordForm action={resetUserPassword.bind(null, row.id)} />
                </details>
              )}
            </Panel>
          ))}
        </div>
        <Panel title="Nuevo usuario">
          <CreateUserForm action={createUser} />
        </Panel>
      </div>
    </>
  );
}
