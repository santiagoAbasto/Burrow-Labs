import { desc } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { logActivity } from "@/lib/admin/activity";
import { getSession } from "@/lib/auth";

// Una celda que empieza con = + - @ se neutraliza: evita fórmulas inyectadas al abrir el CSV en Excel.
const cell = (value: unknown) => {
  const text = value === null || value === undefined ? "" : value instanceof Date ? value.toISOString() : String(value);
  return `"${(/^[=+\-@\t\r]/.test(text) ? `'${text}` : text).replace(/"/g, '""')}"`;
};

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("No autorizado", { status: 401 });
  const rows = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(5000);
  const columns = ["createdAt", "type", "status", "name", "company", "email", "whatsapp", "projectType", "budget", "timeline", "message", "sourcePath", "notes"] as const;
  // Sacar datos personales del sistema queda anotado: quién, cuándo y cuántas filas (nunca el contenido).
  await logActivity(session.user, "export", "leads", null, `CSV · ${rows.length} ${rows.length === 1 ? "fila" : "filas"}`);
  const csv = [columns.join(","), ...rows.map((row) => columns.map((column) => cell(row[column])).join(","))].join("\r\n");
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-burrow-labs.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
