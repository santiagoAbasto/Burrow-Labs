import { randomUUID } from "node:crypto";
import { like, sql } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { client, db } from "@/db";
import { rateLimits } from "@/db/schema";
import { accountKey, clientIp, clientKey, limitClient, rateLimit } from "./rate-limit";

const prefix = `test-${randomUUID()}`;

afterAll(async () => {
  await db.delete(rateLimits).where(like(rateLimits.key, `${prefix}%`));
  await client.end();
});

describe("rateLimit", () => {
  it("permite N, bloquea N+1 y se libera al cambiar la ventana", async () => {
    const key = `${prefix}:a`;
    const opts = { limit: 3, windowSec: 60 };

    expect(await rateLimit(key, opts)).toEqual({ ok: true, remaining: 2, retryAfterSec: 0 });
    expect((await rateLimit(key, opts)).ok).toBe(true);
    expect(await rateLimit(key, opts)).toEqual({ ok: true, remaining: 0, retryAfterSec: 0 });

    const blocked = await rateLimit(key, opts);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(60);

    // Simula el paso del tiempo: la ventana empezó hace 61 s.
    await db.execute(sql`UPDATE rate_limits SET window_start = now() - interval '61 seconds' WHERE key = ${key}`);
    expect(await rateLimit(key, opts)).toEqual({ ok: true, remaining: 2, retryAfterSec: 0 });
  });

  it("es atómico bajo concurrencia", async () => {
    const key = `${prefix}:b`;
    const results = await Promise.all(Array.from({ length: 12 }, () => rateLimit(key, { limit: 5, windowSec: 60 })));
    expect(results.filter((r) => r.ok)).toHaveLength(5);
  });

  it("claves distintas no se afectan", async () => {
    expect((await rateLimit(`${prefix}:c`, { limit: 1, windowSec: 60 })).ok).toBe(true);
    expect((await rateLimit(`${prefix}:d`, { limit: 1, windowSec: 60 })).ok).toBe(true);
  });
});

describe("clientKey", () => {
  const key = (xff: string) => clientKey(new Headers({ "x-forwarded-for": xff }), "login");

  it("no contiene la IP y es estable", () => {
    expect(key("203.0.113.7")).toMatch(/^login:[0-9a-f]{32}$/);
    expect(key("203.0.113.7")).not.toContain("203.0.113.7");
    expect(key("203.0.113.7")).toBe(key("203.0.113.7"));
    expect(key("203.0.113.7")).not.toBe(key("203.0.113.8"));
  });

  it("usa la última entrada de x-forwarded-for: las anteriores las controla el cliente", () => {
    expect(key("1.2.3.4, 203.0.113.7")).toBe(key("203.0.113.7"));
  });

  it("separa por ámbito", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7" });
    expect(clientKey(headers, "login")).not.toBe(clientKey(headers, "contact"));
  });

  it("sin IP fiable todos comparten una clave, distinta de la de cualquier visitante", () => {
    const shared = clientKey(new Headers(), "login");
    expect(shared).toMatch(/^login:[0-9a-f]{32}$/);
    expect(key("127.0.0.1")).toBe(shared);
    expect(key("no-es-una-ip")).toBe(shared);
    expect(key("203.0.113.7")).not.toBe(shared);
  });
});

describe("clientIp", () => {
  const ip = (headers: Record<string, string>) => clientIp(new Headers(headers));

  it("toma la última entrada de x-forwarded-for y, si falta, x-real-ip", () => {
    expect(ip({ "x-forwarded-for": "203.0.113.7" })).toBe("203.0.113.7");
    expect(ip({ "x-forwarded-for": "1.2.3.4, 203.0.113.7" })).toBe("203.0.113.7");
    expect(ip({ "x-real-ip": "198.51.100.4" })).toBe("198.51.100.4");
    expect(ip({ "x-forwarded-for": "2001:db8::1" })).toBe("2001:db8::1");
    expect(ip({ "x-forwarded-for": "::ffff:203.0.113.7" })).toBe("203.0.113.7");
  });

  it("es null sin cabecera, con un valor que no es una IP o con la dirección del propio proxy", () => {
    expect(ip({})).toBeNull();
    for (const value of ["desconocida", "203.0.113.7:443", "<script>", "127.0.0.1", "::1", "::ffff:127.0.0.1", "10.1.2.3", "172.17.0.1", "192.168.1.20", "169.254.1.1", "fd00::1", "fe80::1"])
      expect(ip({ "x-forwarded-for": value }), value).toBeNull();
    // el cliente manda una IP pública inventada pero el proxy no agrega la real: manda la última, la del proxy
    expect(ip({ "x-forwarded-for": "8.8.8.8, 127.0.0.1" })).toBeNull();
  });
});

describe("accountKey", () => {
  it("no contiene el email, ignora mayúsculas y espacios, y separa cuentas y ámbitos", () => {
    const key = accountKey("login-user", "Admin@Example.com ");
    expect(key).toMatch(/^login-user:[0-9a-f]{32}$/);
    expect(key).not.toContain("admin");
    expect(key).toBe(accountKey("login-user", "admin@example.com"));
    expect(key).not.toBe(accountKey("login-user", "otra@example.com"));
    expect(key).not.toBe(accountKey("otro", "admin@example.com"));
    // una cuenta no puede chocar con la clave de una IP aunque el «email» sea una IP
    expect(accountKey("login", "203.0.113.7")).not.toBe(clientKey(new Headers({ "x-forwarded-for": "203.0.113.7" }), "login"));
  });
});

describe("limitClient", () => {
  it("con IP fiable aplica el límite tal cual; con la clave compartida, un cupo 20 veces mayor", async () => {
    const scope = `${prefix}:lc`;
    const known = new Headers({ "x-forwarded-for": "203.0.113.50" });
    expect((await limitClient(known, scope, { limit: 1, windowSec: 60 })).ok).toBe(true);
    expect((await limitClient(known, scope, { limit: 1, windowSec: 60 })).ok).toBe(false);

    const unknown = new Headers();
    const results = [];
    for (let i = 0; i < 21; i++) results.push(await limitClient(unknown, scope, { limit: 1, windowSec: 60 }));
    expect(results.slice(0, 20).every((r) => r.ok)).toBe(true);
    expect(results[20].ok).toBe(false);
  });
});
