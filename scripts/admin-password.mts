// Establece la contraseña de un administrador sin pasar por el panel:
//   pnpm admin:password admin@example.com
// Pide la contraseña dos veces sin mostrarla, la guarda con scrypt y cierra las sesiones abiertas de ese usuario.
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { createInterface } from "node:readline";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
registerHooks({
  resolve: (specifier, context, nextResolve) =>
    nextResolve(specifier, specifier === "server-only" ? { ...context, conditions: [...context.conditions, "react-server"] } : context),
});

function ask(question: string): Promise<string> {
  // Se escribe la pregunta y se silencia el eco mientras se tipea la contraseña.
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  const raw = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WritableStream };
  let muted = false;
  raw._writeToOutput = (s) => {
    if (!muted) raw.output.write(s);
  };
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      muted = false;
      raw.output.write("\n");
      rl.close();
      resolve(answer);
    });
    muted = true;
  });
}

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Uso: pnpm admin:password <email>");
  process.exit(1);
}
const { eq } = await import("drizzle-orm");
const { client, db } = await import("../src/db/index");
const { sessions, users } = await import("../src/db/schema");
const { hashPassword } = await import("../src/lib/auth");
try {
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!user) throw new Error(`No existe un administrador con el email ${email}.`);
  const password = await ask("Nueva contraseña (mínimo 12 caracteres): ");
  if (password.length < 12) throw new Error("La contraseña tiene que tener al menos 12 caracteres.");
  if ((await ask("Repetila: ")) !== password) throw new Error("No coinciden.");
  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, user.id));
  await db.delete(sessions).where(eq(sessions.userId, user.id));
  console.log(`Contraseña actualizada para ${email}. Las sesiones abiertas se cerraron.`);
} finally {
  await client.end();
}
