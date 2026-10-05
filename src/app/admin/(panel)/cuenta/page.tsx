import { desc, eq } from "drizzle-orm";
import { HelpBox } from "@/components/admin/help-box";
import { AdminHeading, Panel } from "@/components/admin/shell";
import { AccountForm } from "@/components/admin/user-forms";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { updateAccount } from "@/lib/admin/actions";
import { requireUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await requireUser();
  const recent = await db.select({ createdAt: sessions.createdAt, expiresAt: sessions.expiresAt }).from(sessions).where(eq(sessions.userId, user.id)).orderBy(desc(sessions.createdAt)).limit(5);
  const when = (date: Date) => date.toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "short", timeStyle: "short" });

  return (
    <>
      <AdminHeading eyebrow="Sitio" title="Mi cuenta" note={user.email} />
      <div className="mb-6">
        <HelpBox topic="cuenta" />
      </div>
      <div className="grid items-start gap-8 xl:grid-cols-[1fr_22rem]">
        <Panel title="Datos y contraseña">
          <AccountForm action={updateAccount} name={user.name} />
        </Panel>
        <Panel title="Sesiones recientes">
          <ul className="grid gap-2">
            {recent.map((session, i) => (
              <li key={session.createdAt.toISOString()} className="admin-tile px-3 py-2 type-small">
                <span className="font-semibold">{i === 0 ? "Esta sesión" : "Sesión"}</span> · abierta {when(session.createdAt)} · vence {when(session.expiresAt)}
              </li>
            ))}
          </ul>
          <p className="mt-4 type-small text-muted">Al cambiar la contraseña se cierran todas las demás sesiones. Las sesiones duran 7 días.</p>
        </Panel>
      </div>
    </>
  );
}
