import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

const base = { DATABASE_URL: "postgres://u:p@localhost:5432/db" };
const secret = "s".repeat(32);

describe("parseEnv", () => {
  it("en desarrollo arranca con lo mínimo y defaults seguros", () => {
    const env = parseEnv({ ...base, AUTH_SECRET: "", NEXT_PUBLIC_SITE_URL: "http://localhost:3000/" });
    expect(env).toMatchObject({ STORAGE_DRIVER: "local", SHOW_DEMO_CONTENT: false, NEXT_PUBLIC_SITE_URL: "http://localhost:3000" });
    expect(env.NEXT_PUBLIC_GA_ID).toBeUndefined();
  });

  it("falla claro si falta DATABASE_URL", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
  });

  it("en producción exige AUTH_SECRET de al menos 32 caracteres", () => {
    expect(() => parseEnv({ ...base, NODE_ENV: "production" })).toThrow(/AUTH_SECRET/);
    expect(() => parseEnv({ ...base, NODE_ENV: "production", AUTH_SECRET: "corto" })).toThrow(/AUTH_SECRET/);
    expect(parseEnv({ ...base, NODE_ENV: "production", AUTH_SECRET: secret }).AUTH_SECRET).toBe(secret);
  });

  it("el mensaje de error no incluye valores", () => {
    expect(() => parseEnv({ ...base, NODE_ENV: "production", AUTH_SECRET: "valor-secreto" })).not.toThrow(/valor-secreto/);
  });

  it("el contenido demo nunca se activa en producción", () => {
    expect(parseEnv({ ...base, SHOW_DEMO_CONTENT: "true" }).SHOW_DEMO_CONTENT).toBe(true);
    expect(parseEnv({ ...base, NODE_ENV: "production", AUTH_SECRET: secret, SHOW_DEMO_CONTENT: "true" }).SHOW_DEMO_CONTENT).toBe(false);
  });

  it("con STORAGE_DRIVER=s3 exige las variables de S3", () => {
    expect(() => parseEnv({ ...base, STORAGE_DRIVER: "s3" })).toThrow(/S3_BUCKET/);
  });
  it("con EMAIL_DRIVER=resend o brevo exige EMAIL_API_KEY y EMAIL_FROM (no hay remitente por defecto)", () => {
    expect(() => parseEnv({ ...base, EMAIL_DRIVER: "resend" })).toThrow(/EMAIL_API_KEY/);
    expect(() => parseEnv({ ...base, EMAIL_DRIVER: "brevo" })).toThrow(/EMAIL_API_KEY/);
    expect(() => parseEnv({ ...base, EMAIL_DRIVER: "brevo", EMAIL_API_KEY: "x" })).toThrow(/EMAIL_FROM/);
    expect(parseEnv({ ...base, EMAIL_DRIVER: "brevo", EMAIL_API_KEY: "x", EMAIL_FROM: "Marca <envios@example.com>" }).EMAIL_DRIVER).toBe("brevo");
    expect(parseEnv(base).EMAIL_FROM).toBeUndefined();
  });
  it("los IDs de Google Analytics y de Clarity solo se aceptan con su formato (se interpolan en scripts)", () => {
    expect(parseEnv({ ...base, NEXT_PUBLIC_GA_ID: "G-AB12CD34EF", NEXT_PUBLIC_CLARITY_ID: "ab12cd34ef" })).toMatchObject({ NEXT_PUBLIC_GA_ID: "G-AB12CD34EF", NEXT_PUBLIC_CLARITY_ID: "ab12cd34ef" });
    for (const bad of ["UA-1234-1", "G-ab12", "G-AB12');alert(1);//"]) expect(() => parseEnv({ ...base, NEXT_PUBLIC_GA_ID: bad })).toThrow(/NEXT_PUBLIC_GA_ID/);
    for (const bad of ["AB12CD34EF", "ab12\";alert(1);//", "ab-12"]) expect(() => parseEnv({ ...base, NEXT_PUBLIC_CLARITY_ID: bad })).toThrow(/NEXT_PUBLIC_CLARITY_ID/);
  });
  it("con EMAIL_DRIVER=smtp exige servidor y remitente, no la clave de API; usuario y contraseña van juntos", () => {
    const smtp = { ...base, EMAIL_DRIVER: "smtp", SMTP_HOST: "smtp.example.com", EMAIL_FROM: "Marca <envios@example.com>" };
    expect(() => parseEnv({ ...base, EMAIL_DRIVER: "smtp", EMAIL_FROM: smtp.EMAIL_FROM })).toThrow(/SMTP_HOST/);
    expect(() => parseEnv({ ...smtp, EMAIL_FROM: undefined })).toThrow(/EMAIL_FROM/);
    expect(() => parseEnv({ ...smtp, SMTP_USER: "envios@example.com" })).toThrow(/SMTP_PASSWORD/);
    expect(() => parseEnv({ ...smtp, SMTP_PASSWORD: "x" })).toThrow(/SMTP_USER/);
    expect(parseEnv(smtp)).toMatchObject({ EMAIL_DRIVER: "smtp", SMTP_PORT: 465 }); // relay por IP: sin credenciales
    expect(parseEnv({ ...smtp, SMTP_PORT: "587", SMTP_USER: "u", SMTP_PASSWORD: "p" }).SMTP_PORT).toBe(587);
    expect(() => parseEnv({ ...smtp, SMTP_PORT: "abc" })).toThrow(/SMTP_PORT/);
  });
});
