import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { client, db } from "@/db";
import { GET } from "./route";

afterEach(() => vi.restoreAllMocks());
afterAll(() => client.end());

const SHAPE = ["status", "timestamp", "version"];

describe("GET /api/health", () => {
  it("con la base arriba responde 200 ok, sin caché y solo con estado, hora y versión", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual(SHAPE);
    expect(body.status).toBe("ok");
    expect(body.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(Math.abs(Date.now() - Date.parse(body.timestamp))).toBeLessThan(5000);
  });

  it("si la base falla responde 503 degraded con la misma forma, sin el motivo del error", async () => {
    vi.spyOn(db, "execute").mockRejectedValue(new Error("connect ECONNREFUSED 10.0.0.5:5432 user=burrow"));
    const res = await GET();
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const text = await res.text();
    expect(Object.keys(JSON.parse(text)).sort()).toEqual(SHAPE);
    expect(JSON.parse(text).status).toBe("degraded");
    for (const leak of ["ECONNREFUSED", "10.0.0.5", "burrow", "postgres", "Error"]) expect(text).not.toContain(leak);
  });

  it("si la base no contesta a tiempo responde degraded en vez de quedarse esperando", async () => {
    vi.useFakeTimers();
    try {
      vi.spyOn(db, "execute").mockReturnValue(new Promise(() => {}) as never);
      const pending = GET();
      await vi.advanceTimersByTimeAsync(2000);
      const res = await pending;
      expect(res.status).toBe(503);
      expect((await res.json()).status).toBe("degraded");
    } finally {
      vi.useRealTimers();
    }
  });
});
