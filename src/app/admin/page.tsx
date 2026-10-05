import type { Metadata } from "next";
import { Dashboard, parseDays } from "@/components/admin/dashboard";
import { LoginScreen } from "@/components/admin/login-screen";
import { AdminShell } from "@/components/admin/shell";
import { shellCounts } from "@/lib/admin/shell-data";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin · Burrow Labs", robots: { index: false, follow: false } };

/** /admin: sin sesión es el ingreso; con sesión, el dashboard dentro del panel. `?dias=7|30|90` cambia el período. */
export default async function AdminHome({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const [session, search] = await Promise.all([getSession(), searchParams]);
  if (!session) return <LoginScreen />;
  return (
    <AdminShell user={session.user} counts={await shellCounts()}>
      <Dashboard user={session.user} days={parseDays(search.dias)} />
    </AdminShell>
  );
}
