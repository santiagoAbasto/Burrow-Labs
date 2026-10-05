// Opciones de formularios que comparten cliente y servidor. Sin imports a propósito: los componentes
// cliente las usan sin arrastrar Zod al navegador (validation.ts las reexporta para el servidor).

export const PROJECT_TYPES = ["Web", "Sistema", "Automatización", "IA", "Integración", "E-commerce", "Otro"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const DIAGNOSTIC_NEEDS = ["clientes", "operaciones", "ventas", "ia", "automatizacion", "integracion"] as const;
export const DIAGNOSTIC_RESULTS = ["Web", "Automatización", "Sistema", "Integración", "IA"] as const;
export type DiagnosticResult = (typeof DIAGNOSTIC_RESULTS)[number];
