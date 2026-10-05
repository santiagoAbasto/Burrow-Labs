// Next llama a `register` una vez por cada instancia del servidor. Acá solo se programa la depuración por
// plazos de conservación, y solo en el servidor real de producción: en desarrollo y durante `next build`
// no se borra nada.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NODE_ENV !== "production" || process.env.NEXT_PHASE === "phase-production-build") return;
  const { scheduleRetention } = await import("./lib/retention");
  scheduleRetention();
}
