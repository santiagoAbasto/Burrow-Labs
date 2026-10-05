import { describe, expect, it } from "vitest";
import { createState, jump, score, step, WORLD, type GameState } from "./engine";

const running = (): GameState => ({ ...createState(), status: "running" });
const never = () => 0.5;

describe("Burrow Runner — motor", () => {
  it("no avanza hasta que empieza", () => {
    const state = createState();
    step(state, 0.1, never);
    expect(state.distance).toBe(0);
    expect(jump(state)).toBe(false);
  });

  it("salta solo desde el suelo y vuelve a aterrizar", () => {
    const state = running();
    state.nextObstacleAt = Infinity;
    expect(jump(state)).toBe(true);
    expect(jump(state)).toBe(false); // sin doble salto
    step(state, 0.016, never);
    expect(state.player.y).toBeLessThan(WORLD.ground - state.player.h);
    for (let i = 0; i < 120; i++) step(state, 0.016, never);
    expect(state.player.onGround).toBe(true);
    expect(state.player.y).toBe(WORLD.ground - state.player.h);
  });

  it("chocar contra un obstáculo termina la partida", () => {
    const state = running();
    state.nextObstacleAt = Infinity;
    state.obstacles.push({ kind: "bug", x: state.player.x + 10, y: WORLD.ground - 34, w: 44, h: 34 });
    expect(step(state, 0.016, never)).toContain("hit");
    expect(state.status).toBe("over");
    const distance = state.distance;
    step(state, 0.016, never);
    expect(state.distance).toBe(distance);
  });

  it("un salto a tiempo pasa por encima del obstáculo", () => {
    const state = running();
    state.nextObstacleAt = Infinity;
    state.nextItemAt = Infinity;
    state.obstacles.push({ kind: "bug", x: state.player.x + 110, y: WORLD.ground - 34, w: 44, h: 34 });
    jump(state);
    for (let i = 0; i < 60; i++) step(state, 0.016, never);
    expect(state.status).toBe("running");
  });

  it("recoger un ítem suma 50 puntos", () => {
    const state = running();
    state.nextObstacleAt = Infinity;
    state.nextItemAt = Infinity;
    const before = score(state);
    state.items.push({ kind: "braces", taken: false, x: state.player.x + 5, y: state.player.y + 10, w: 30, h: 30 });
    expect(step(state, 0.001, never)).toContain("collect");
    expect(score(state) - before).toBe(50);
  });

  it("la dificultad sube con el tiempo, con tope", () => {
    const state = running();
    state.nextObstacleAt = Infinity;
    const initial = state.speed;
    for (let i = 0; i < 600; i++) step(state, 0.05, never);
    expect(state.speed).toBeGreaterThan(initial);
    for (let i = 0; i < 6000; i++) step(state, 0.05, never);
    expect(state.speed).toBeLessThanOrEqual(760);
  });

  it("deja siempre un hueco saltable entre obstáculos", () => {
    const state = running();
    state.nextItemAt = Infinity;
    const xs: number[] = [];
    let seed = 7;
    const random = () => ((seed = (seed * 16807) % 2147483647), seed / 2147483647);
    for (let i = 0; i < 4000; i++) {
      const count = state.obstacles.length;
      step(state, 0.016, random);
      state.status = "running"; // ignora choques: solo medimos la generación
      if (state.obstacles.length > count) xs.push(state.distance);
    }
    const gaps = xs.slice(1).map((x, i) => x - xs[i]);
    expect(gaps.length).toBeGreaterThan(10);
    expect(Math.min(...gaps)).toBeGreaterThan(260);
  });

  it("limita el salto de tiempo de una pestaña que vuelve del fondo", () => {
    const state = running();
    step(state, 5, never);
    expect(state.distance).toBeLessThan(20);
  });
});
