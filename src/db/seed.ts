// `pnpm db:seed` — idempotente: crea el admin inicial si no existe y siembra el contenido.
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";

// Debe correr antes de importar nada que lea el entorno. No pisa variables ya definidas.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// `server-only` lanza fuera de un bundle de servidor de Next. Este script corre en Node (tsx),
// así que ese import se resuelve con la condición `react-server` (su variante vacía), igual que en Next.
registerHooks({
  resolve: (specifier, context, nextResolve) =>
    nextResolve(
      specifier,
      specifier === "server-only" ? { ...context, conditions: [...context.conditions, "react-server"] } : context,
    ),
});

async function main() {
  const { client, db } = await import("./index");
  const { users } = await import("./schema");
  const { hashPassword } = await import("../lib/auth");
  const { seedContent } = await import("./seed-content");

  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.log("Admin: sin ADMIN_EMAIL/ADMIN_PASSWORD, no se crea usuario.");
    } else if (password.length < 12) {
      throw new Error("ADMIN_PASSWORD debe tener al menos 12 caracteres.");
    } else {
      const created = await db
        .insert(users)
        .values({ email, passwordHash: await hashPassword(password), name: "Admin" })
        .onConflictDoNothing({ target: users.email })
        .returning({ id: users.id });
      // Nunca se imprime la contraseña.
      console.log(created.length ? `Admin: usuario creado (${email}).` : "Admin: el usuario ya existía, no se modifica.");
    }

    await seedContent(db);
    console.log("Seed completo.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
