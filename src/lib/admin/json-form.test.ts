import { describe, expect, it } from "vitest";
import { describeJson, parseJsonForm } from "./json-form";

const shape = { title: "Hola", enabled: true, items: ["a", "b"], steps: [{ number: "01", name: "Uno", text: "Texto" }], nested: { cta: "Ir" } } as const;

function formFrom(entries: Record<string, string>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(entries)) form.set(key, value);
  return form;
}

describe("formularios JSON del admin", () => {
  it("describe cada campo según la forma", () => {
    const field = describeJson(shape, shape, "c");
    expect(field.kind).toBe("group");
    if (field.kind !== "group") return;
    expect(field.fields.map((f) => f.kind)).toEqual(["text", "boolean", "list", "rows", "group"]);
    expect(field.fields[3]).toMatchObject({ value: "01 | Uno | Texto", columns: ["number", "name", "text"] });
  });

  it("reconstruye el objeto desde el formulario", () => {
    const form = formFrom({ "c.title": " Nuevo ", "c.enabled": "on", "c.items": "x\n\n y \n", "c.steps": "02 | Dos | Con | barra\n03 | Tres", "c.nested.cta": "Vamos" });
    expect(parseJsonForm(shape, form, "c")).toEqual({
      title: "Nuevo",
      enabled: true,
      items: ["x", "y"],
      steps: [
        { number: "02", name: "Dos", text: "Con | barra" },
        { number: "03", name: "Tres", text: "" },
      ],
      nested: { cta: "Vamos" },
    });
  });

  it("ignora campos que no están en la forma y apaga los booleanos ausentes", () => {
    const parsed = parseJsonForm(shape, formFrom({ "c.title": "T", "c.hack": "x" }), "c") as Record<string, unknown>;
    expect(parsed.hack).toBeUndefined();
    expect(parsed.enabled).toBe(false);
  });
});
