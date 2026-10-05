import { describe, expect, it } from "vitest";
import { indexNowBody } from "./indexnow";

describe("indexNowBody", () => {
  const body = indexNowBody("https://burrowlabs.com.bo", "abc12345", ["/proyectos/apple-boss", "/proyectos", "/proyectos", null, undefined, "//evil.example", "https://evil.example/x", "/lab/undefined", "/faq?x=1"]);

  it("arma host, clave y ubicación de la clave en la raíz del sitio", () => {
    expect(body.host).toBe("burrowlabs.com.bo");
    expect(body.key).toBe("abc12345");
    expect(body.keyLocation).toBe("https://burrowlabs.com.bo/indexnow-key.txt");
  });

  it("solo incluye rutas internas, sin repetir ni parámetros", () => {
    expect(body.urlList).toEqual(["https://burrowlabs.com.bo/proyectos/apple-boss", "https://burrowlabs.com.bo/proyectos"]);
  });
});
