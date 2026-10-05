// Burrow Runner — motor puro (sin DOM ni canvas): física, generación, colisiones y puntaje.
// Mecánica original de Burrow Labs; no usa código ni assets de terceros.

export const WORLD = { width: 800, height: 300, ground: 252 } as const;

const GRAVITY = 2600; // px/s²
const JUMP_VELOCITY = -820; // px/s
const START_SPEED = 300; // px/s
const MAX_SPEED = 760;
const ACCELERATION = 7; // px/s por segundo: dificultad progresiva
const ITEM_POINTS = 50;

export const OBSTACLES = {
  bug: { w: 44, h: 34, label: "BUG" },
  excel: { w: 50, h: 66, label: "XLS" },
  manual: { w: 46, h: 40, label: "MANUAL" },
  api: { w: 58, h: 44, label: "API ✕" },
  duplicate: { w: 52, h: 46, label: "COPIA(2)" },
  server: { w: 46, h: 72, label: "SERVER" },
  error500: { w: 92, h: 38, label: "ERROR 500" },
} as const;
export type ObstacleKind = keyof typeof OBSTACLES;
const OBSTACLE_KINDS = Object.keys(OBSTACLES) as ObstacleKind[];

export const ITEMS = ["braces", "tag", "gear", "bolt", "ai", "database"] as const;
export type ItemKind = (typeof ITEMS)[number];

export type Box = { x: number; y: number; w: number; h: number };
export type Obstacle = Box & { kind: ObstacleKind };
export type Item = Box & { kind: ItemKind; taken: boolean };
export type Status = "ready" | "running" | "paused" | "over";
export type GameEvent = "jump" | "collect" | "hit";

export type GameState = {
  status: Status;
  time: number;
  speed: number;
  distance: number;
  collected: number;
  player: Box & { vy: number; onGround: boolean };
  obstacles: Obstacle[];
  items: Item[];
  nextObstacleAt: number; // distancia a la que aparece el próximo obstáculo
  nextItemAt: number;
  /** Ancho visible del mundo (lo fija el canvas): lo nuevo aparece justo fuera de pantalla. */
  viewWidth: number;
};

export const PLAYER = { x: 84, w: 62, h: 84 } as const;
const HITBOX_INSET = 9; // colisión más amable que el dibujo

export function createState(): GameState {
  return {
    status: "ready",
    time: 0,
    speed: START_SPEED,
    distance: 0,
    collected: 0,
    player: { x: PLAYER.x, y: WORLD.ground - PLAYER.h, w: PLAYER.w, h: PLAYER.h, vy: 0, onGround: true },
    obstacles: [],
    items: [],
    nextObstacleAt: 520,
    nextItemAt: 320,
    viewWidth: WORLD.width,
  };
}

export function score(state: GameState): number {
  return Math.floor(state.distance / 10) + state.collected * ITEM_POINTS;
}

/** Salta solo si está en el suelo y el juego corre. Devuelve si saltó. */
export function jump(state: GameState): boolean {
  if (state.status !== "running" || !state.player.onGround) return false;
  state.player.vy = JUMP_VELOCITY;
  state.player.onGround = false;
  return true;
}

function overlaps(a: Box, b: Box, inset = 0): boolean {
  return a.x + inset < b.x + b.w && a.x + a.w - inset > b.x && a.y + inset < b.y + b.h && a.y + a.h - inset > b.y;
}

/** Avanza la simulación `dt` segundos. `random` se inyecta para poder probarla. */
export function step(state: GameState, dt: number, random: () => number = Math.random): GameEvent[] {
  if (state.status !== "running") return [];
  const events: GameEvent[] = [];
  const delta = Math.min(dt, 0.05); // una pestaña que vuelve del fondo no teletransporta al jugador
  state.time += delta;
  state.speed = Math.min(MAX_SPEED, START_SPEED + state.time * ACCELERATION);
  const travel = state.speed * delta;
  state.distance += travel;

  const player = state.player;
  if (!player.onGround) {
    player.vy += GRAVITY * delta;
    player.y += player.vy * delta;
    if (player.y >= WORLD.ground - player.h) {
      player.y = WORLD.ground - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  for (const obstacle of state.obstacles) obstacle.x -= travel;
  for (const item of state.items) item.x -= travel;
  state.obstacles = state.obstacles.filter((o) => o.x + o.w > -20);
  state.items = state.items.filter((i) => i.x + i.w > -20 && !i.taken);

  if (state.distance >= state.nextObstacleAt) {
    const kind = OBSTACLE_KINDS[Math.floor(random() * OBSTACLE_KINDS.length)];
    const { w, h } = OBSTACLES[kind];
    state.obstacles.push({ kind, x: state.viewWidth + 20, y: WORLD.ground - h, w, h });
    // Hueco mínimo proporcional a la velocidad: siempre hay tiempo de aterrizar y volver a saltar.
    state.nextObstacleAt = state.distance + state.speed * (0.95 + random() * 0.9);
  }
  if (state.distance >= state.nextItemAt) {
    const kind = ITEMS[Math.floor(random() * ITEMS.length)];
    state.items.push({ kind, taken: false, x: state.viewWidth + 20, y: WORLD.ground - 70 - random() * 80, w: 30, h: 30 });
    state.nextItemAt = state.distance + 260 + random() * 420;
  }

  for (const item of state.items) {
    if (!item.taken && overlaps(player, item)) {
      item.taken = true;
      state.collected += 1;
      events.push("collect");
    }
  }
  if (state.obstacles.some((obstacle) => overlaps(player, obstacle, HITBOX_INSET))) {
    state.status = "over";
    events.push("hit");
  }
  return events;
}
