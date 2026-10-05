import { describe, expect, it } from "vitest";
import { recommend, type DiagnosticAnswers } from "./diagnostic";

const base: DiagnosticAnswers = { manualWork: "Cargar pedidos", people: "2 a 5", tools: "Excel", needs: ["automatizacion"], hasSystem: false };

describe("diagnóstico express", () => {
  it("recomienda automatización cuando hay tareas repetitivas", () => {
    expect(recommend(base).result).toBe("Automatización");
  });
  it("recomienda un sistema cuando el equipo es grande y el problema es operativo", () => {
    expect(recommend({ ...base, people: "6 a 20", needs: ["operaciones", "ventas"] }).result).toBe("Sistema");
  });
  it("recomienda integración cuando ya hay un sistema que no conversa con el resto", () => {
    expect(recommend({ ...base, needs: ["integracion"], hasSystem: true }).result).toBe("Integración");
  });
  it("recomienda IA solo si se pide", () => {
    expect(recommend({ ...base, manualWork: "", people: "Solo yo", needs: ["ia"] }).result).toBe("IA");
    expect(recommend(base).result).not.toBe("IA");
  });
  it("recomienda una web a quien trabaja solo y busca clientes", () => {
    expect(recommend({ manualWork: "", people: "Solo yo", tools: "", needs: ["clientes"], hasSystem: false }).result).toBe("Web");
  });
  it("ofrece una segunda opción solo si está cerca de la primera", () => {
    expect(recommend({ ...base, needs: ["automatizacion", "integracion"], hasSystem: true }).also).not.toBeNull();
    expect(recommend({ manualWork: "", people: "Solo yo", tools: "", needs: ["ia"], hasSystem: false }).also).toBeNull();
  });
});
