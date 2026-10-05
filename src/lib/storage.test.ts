import { randomUUID } from "node:crypto";
import { rmdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { afterAll, describe, expect, it } from "vitest";
import { GET } from "@/app/media/[...key]/route";
import { LOCAL_UPLOAD_DIR, newMediaKey, processImageUpload, resolveLocalPath, storage, UploadError } from "./storage";

const png = () =>
  sharp({ create: { width: 40, height: 20, channels: 3, background: "#1070B2" } })
    .png()
    .toBuffer();
const file = (data: Buffer | string, name: string, type: string) => new File([new Uint8Array(Buffer.from(data))], name, { type });

describe("processImageUpload", () => {
  it("re-codifica una imagen real a WebP", async () => {
    const out = await processImageUpload(file(await png(), "foto.png", "image/png"));
    expect(out).toMatchObject({ width: 40, height: 20, mime: "image/webp" });
    expect((await sharp(out.buffer).metadata()).format).toBe("webp");
  });

  it("descarta los metadatos EXIF", async () => {
    const withExif = await sharp(await png())
      .withExif({ IFD0: { Copyright: "dato privado" } })
      .jpeg()
      .toBuffer();
    expect((await sharp(withExif).metadata()).exif).toBeDefined();
    const out = await processImageUpload(file(withExif, "foto.jpg", "image/jpeg"));
    expect((await sharp(out.buffer).metadata()).exif).toBeUndefined();
  });

  it("rechaza un archivo que no es imagen aunque diga serlo", async () => {
    await expect(processImageUpload(file("<?php echo 1; ?>", "foto.png", "image/png"))).rejects.toThrow(UploadError);
    await expect(processImageUpload(file("", "vacio.png", "image/png"))).rejects.toThrow(UploadError);
  });

  it("rechaza SVG", async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>';
    await expect(processImageUpload(file(svg, "logo.svg", "image/svg+xml"))).rejects.toThrow(UploadError);
    await expect(processImageUpload(file(svg, "logo.png", "image/png"))).rejects.toThrow(UploadError);
  });

  it("rechaza más de 8 MB", async () => {
    await expect(processImageUpload(file(Buffer.alloc(8 * 1024 * 1024 + 1), "grande.png", "image/png"))).rejects.toThrow(/8 MB/);
  });
});

describe("resolveLocalPath", () => {
  it("resuelve claves válidas dentro del directorio de subidas", () => {
    expect(resolveLocalPath("2026/10/abc.webp")).toBe(path.join(LOCAL_UPLOAD_DIR, "2026/10/abc.webp"));
    expect(resolveLocalPath(newMediaKey())).not.toBeNull();
  });

  it("rechaza path traversal y claves raras", () => {
    for (const bad of [
      "../.env.local",
      "../../etc/passwd",
      "2026/../../.env.local",
      "..",
      "a/./b.webp",
      "/etc/passwd",
      "a//b.webp",
      ".oculto.webp",
      "a\\..\\b.webp",
      "a%2F..%2Fb.webp",
      "a\0.webp",
      "",
      "x".repeat(201),
    ])
      expect(resolveLocalPath(bad), bad).toBeNull();
  });
});

describe("GET /media/[...key]", () => {
  const key = `test/${randomUUID()}.webp`;
  const get = (segments: string[]) => GET(new Request("http://localhost/media/x"), { params: Promise.resolve({ key: segments }) });

  afterAll(async () => {
    await storage.remove(key);
    await rmdir(path.join(LOCAL_UPLOAD_DIR, "test")).catch(() => {}); // solo si quedó vacío
  });

  it("sirve un archivo subido con las cabeceras correctas", async () => {
    const { buffer } = await processImageUpload(file(await png(), "foto.png", "image/png"));
    await storage.put(buffer, { key, contentType: "image/webp" });
    expect(storage.publicUrl(key)).toBe(`/media/${key}`);

    const res = await get(key.split("/"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/webp");
    expect(res.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(Buffer.from(await res.arrayBuffer()).equals(buffer)).toBe(true);
  });

  it("responde 404 ante path traversal, extensiones no permitidas e inexistentes", async () => {
    for (const segments of [
      ["..", "..", ".env.local"],
      ["../../.env.local"], // un segmento ya decodificado (%2F)
      ["test", "..", "..", "..", "package.json"],
      ["test", "nota.txt"],
      ["test", "no-existe.webp"],
    ])
      expect((await get(segments)).status, segments.join("/")).toBe(404);
  });

  it("el storage se niega a escribir fuera del directorio", async () => {
    await expect(storage.put(Buffer.from("x"), { key: "../fuera.webp", contentType: "image/webp" })).rejects.toThrow();
    await expect(storage.remove("../../package.json")).rejects.toThrow();
  });
});
