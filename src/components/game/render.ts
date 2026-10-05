// Burrow Runner — dibujo en canvas 2D. Solo colores de la marca; la mascota es el asset original.
import { OBSTACLES, score, WORLD, type GameState, type Item, type Obstacle } from "./engine";

const C = {
  bg: "#080d12",
  rock: "#0f1921",
  navy: "#174e74",
  blue: "#1671b1",
  sky: "#699bba",
  yellow: "#fcea10",
  ink: "#080a09",
  white: "#ffffff",
  paper: "#ededed",
  gray: "#c4c2c1",
  steel: "#5e615e",
};

const ITEM_GLYPH: Record<Item["kind"], string> = { braces: "{ }", tag: "</>", gear: "⚙", bolt: "⚡", ai: "IA", database: "DB" };

function sticker(ctx: CanvasRenderingContext2D, path: () => void, fill: string) {
  path();
  ctx.lineJoin = "round";
  ctx.strokeStyle = C.yellow;
  ctx.lineWidth = 7;
  ctx.stroke();
  path();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, mono: string, size = 10) {
  ctx.font = `700 ${size}px ${mono}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawObstacle(ctx: CanvasRenderingContext2D, o: Obstacle, time: number, mono: string) {
  const { x, y, w, h } = o;
  const rect = (r = 6) => () => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  };
  switch (o.kind) {
    case "bug": {
      ctx.strokeStyle = C.yellow;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const lx = x + 10 + i * 12;
        ctx.moveTo(lx, y + h - 8);
        ctx.lineTo(lx - 5 + Math.sin(time * 18 + i) * 2, y + h);
      }
      ctx.moveTo(x + 10, y + 6);
      ctx.lineTo(x + 4, y - 4);
      ctx.moveTo(x + 22, y + 6);
      ctx.lineTo(x + 24, y - 5);
      ctx.stroke();
      sticker(ctx, () => {
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2 - 2, w / 2, h / 2 - 4, 0, 0, Math.PI * 2);
      }, C.sky);
      label(ctx, "BUG", x + w / 2, y + h / 2 - 2, C.ink, mono);
      break;
    }
    case "excel": {
      sticker(ctx, rect(4), C.white);
      ctx.fillStyle = C.blue;
      ctx.fillRect(x + 2, y + 2, w - 4, 12);
      ctx.strokeStyle = C.gray;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gy = y + 26; gy < y + h - 4; gy += 12) {
        ctx.moveTo(x + 3, gy);
        ctx.lineTo(x + w - 3, gy);
      }
      ctx.moveTo(x + w / 2, y + 14);
      ctx.lineTo(x + w / 2, y + h - 3);
      ctx.stroke();
      label(ctx, "XLS", x + w / 2, y + 8, C.white, mono, 9);
      break;
    }
    case "manual": {
      for (let i = 2; i >= 0; i--) {
        sticker(ctx, () => {
          ctx.beginPath();
          ctx.roundRect(x + i * 3, y + i * 9, w - 6, h - 20, 3);
        }, C.paper);
      }
      label(ctx, "A MANO", x + w / 2, y + h - 10, C.ink, mono, 8);
      break;
    }
    case "api": {
      sticker(ctx, rect(10), C.navy);
      label(ctx, "API", x + w / 2 - 8, y + h / 2, C.white, mono, 11);
      ctx.strokeStyle = C.yellow;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + w - 18, y + h / 2 - 6);
      ctx.lineTo(x + w - 8, y + h / 2 + 6);
      ctx.moveTo(x + w - 8, y + h / 2 - 6);
      ctx.lineTo(x + w - 18, y + h / 2 + 6);
      ctx.stroke();
      break;
    }
    case "duplicate": {
      sticker(ctx, () => {
        ctx.beginPath();
        ctx.roundRect(x + 12, y, w - 12, h - 10, 4);
      }, C.gray);
      sticker(ctx, () => {
        ctx.beginPath();
        ctx.roundRect(x, y + 10, w - 12, h - 10, 4);
      }, C.white);
      label(ctx, "(2)", x + (w - 12) / 2, y + 10 + (h - 10) / 2, C.ink, mono, 11);
      break;
    }
    case "server": {
      // llamas caricaturescas
      ctx.fillStyle = C.yellow;
      for (let i = 0; i < 3; i++) {
        const fx = x + 8 + i * 14;
        const fh = 12 + Math.sin(time * 14 + i * 2) * 5;
        ctx.beginPath();
        ctx.moveTo(fx - 6, y + 4);
        ctx.quadraticCurveTo(fx, y - fh - 6, fx + 2, y - fh);
        ctx.quadraticCurveTo(fx + 8, y - 4, fx + 7, y + 4);
        ctx.fill();
      }
      sticker(ctx, rect(5), C.steel);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = C.ink;
        ctx.fillRect(x + 6, y + 10 + i * 15, w - 12, 9);
        ctx.fillStyle = i % 2 ? C.yellow : C.sky;
        ctx.fillRect(x + w - 14, y + 13 + i * 15, 4, 3);
      }
      break;
    }
    case "error500": {
      sticker(ctx, rect(5), C.yellow);
      label(ctx, OBSTACLES.error500.label, x + w / 2, y + h / 2 + 1, C.ink, mono, 12);
      break;
    }
  }
}

function drawItem(ctx: CanvasRenderingContext2D, item: Item, time: number, mono: string) {
  const bob = Math.sin(time * 5 + item.x * 0.02) * 3;
  const cx = item.x + item.w / 2;
  const cy = item.y + item.h / 2 + bob;
  ctx.beginPath();
  ctx.arc(cx, cy, item.w / 2, 0, Math.PI * 2);
  ctx.fillStyle = C.yellow;
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  label(ctx, ITEM_GLYPH[item.kind], cx, cy + 0.5, C.ink, mono, 11);
}

/** Brazo agarrado del borde de la vagoneta: manga, mano y pezuña (mismas medidas que <Grip />). */
function drawGrip(ctx: CanvasRenderingContext2D, x: number, edge: number, s: number) {
  const k = 0.82 * s;
  const pill = () => {
    ctx.beginPath();
    ctx.roundRect(x - 7.5 * k, edge - 13 * k, 15 * k, 25 * k, 7.5 * k);
  };
  const cap = (from: number) => {
    ctx.beginPath();
    ctx.moveTo(x - 7.5 * k, edge + from * k);
    ctx.lineTo(x + 7.5 * k, edge + from * k);
    ctx.lineTo(x + 7.5 * k, edge + 5 * k);
    ctx.arc(x, edge + 5 * k, 7.5 * k, 0, Math.PI);
    ctx.closePath();
  };
  ctx.lineJoin = "round";
  pill();
  ctx.strokeStyle = C.yellow;
  ctx.lineWidth = 6.5 * k;
  ctx.stroke();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = Math.max(1.5, 2.6 * k);
  pill();
  ctx.fillStyle = C.blue;
  ctx.fill();
  ctx.stroke();
  cap(-3);
  ctx.fillStyle = C.gray;
  ctx.fill();
  ctx.stroke();
  cap(5);
  ctx.fillStyle = C.steel;
  ctx.fill();
  ctx.stroke();
}

function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState, mascot: HTMLImageElement | null) {
  const { x, y, w } = state.player;
  const s = w / 100; // mismas proporciones que <Cart /> (viewBox 100×130)
  if (mascot?.complete && mascot.naturalWidth) {
    ctx.drawImage(mascot, 0, 0, mascot.naturalWidth, mascot.naturalHeight * 0.7, x + 14 * s, y, 72 * s, 78 * s);
  }
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(x + 5 * s, y + 80 * s);
    ctx.lineTo(x + 95 * s, y + 80 * s);
    ctx.lineTo(x + 87 * s, y + 114 * s);
    ctx.lineTo(x + 13 * s, y + 114 * s);
    ctx.closePath();
  };
  body();
  ctx.lineJoin = "round";
  ctx.strokeStyle = C.yellow;
  ctx.lineWidth = 6;
  ctx.stroke();
  body();
  ctx.fillStyle = C.steel;
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(x + 2 * s, y + 75 * s, 96 * s, 9 * s, 2);
  ctx.fillStyle = "#b7b6b2";
  ctx.fill();
  ctx.stroke();
  // las pezuñas, agarradas del borde
  for (const gx of [25, 75]) drawGrip(ctx, x + gx * s, y + 76 * s, s);
  for (const wx of [27, 73]) {
    const cx = x + wx * s;
    const cy = y + 118 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, 10.5 * s, 0, Math.PI * 2);
    ctx.fillStyle = C.ink;
    ctx.fill();
    ctx.strokeStyle = C.yellow;
    ctx.lineWidth = 2;
    ctx.stroke();
    const angle = state.distance / (10.5 * s);
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(angle) * 6 * s, cy - Math.sin(angle) * 6 * s);
    ctx.lineTo(cx + Math.cos(angle) * 6 * s, cy + Math.sin(angle) * 6 * s);
    ctx.strokeStyle = C.gray;
    ctx.stroke();
  }
}

export function draw(ctx: CanvasRenderingContext2D, state: GameState, best: number, mascot: HTMLImageElement | null, mono: string) {
  const width = state.viewWidth;
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, width, WORLD.height);

  // vetas lejanas (paralaje lento) y vigas del túnel
  ctx.strokeStyle = C.rock;
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const yy = 40 + i * 44;
    const shift = (state.distance * (0.08 + i * 0.03)) % 160;
    ctx.beginPath();
    for (let xx = -shift; xx < width + 160; xx += 160) {
      ctx.moveTo(xx, yy);
      ctx.lineTo(xx + 60, yy + (i % 2 ? 8 : -8));
      ctx.lineTo(xx + 110, yy);
    }
    ctx.stroke();
  }
  ctx.fillStyle = C.rock;
  const beam = (state.distance * 0.45) % 260;
  for (let xx = -beam; xx < width + 260; xx += 260) ctx.fillRect(xx, 0, 14, WORLD.ground);

  // riel
  ctx.fillStyle = C.rock;
  ctx.fillRect(0, WORLD.ground + 4, width, WORLD.height - WORLD.ground);
  ctx.fillStyle = C.navy;
  const tie = state.distance % 40;
  for (let xx = -tie; xx < width + 40; xx += 40) ctx.fillRect(xx, WORLD.ground + 6, 16, 5);
  ctx.fillStyle = C.yellow;
  ctx.fillRect(0, WORLD.ground + 1, width, 3);

  for (const item of state.items) drawItem(ctx, item, state.time, mono);
  for (const obstacle of state.obstacles) drawObstacle(ctx, obstacle, state.time, mono);
  drawPlayer(ctx, state, mascot);

  ctx.font = `700 14px ${mono}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillStyle = C.white;
  ctx.fillText(String(score(state)).padStart(5, "0"), width - 14, 12);
  if (best > 0) {
    ctx.font = `500 11px ${mono}`;
    ctx.fillStyle = C.sky;
    ctx.fillText(`RÉCORD ${String(best).padStart(5, "0")}`, width - 14, 32);
  }
}
