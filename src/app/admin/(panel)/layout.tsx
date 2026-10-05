import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell";
import { shellCounts } from "@/lib/admin/shell-data";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin · Burrow Labs", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireUser(); // cada página y cada acción vuelve a verificar la sesión
  return (
    <AdminShell user={user} counts={await shellCounts()}>
      {children}
    </AdminShell>
  );
}
