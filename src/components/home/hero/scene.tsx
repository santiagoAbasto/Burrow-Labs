"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

// La madriguera: corte transversal del terreno. Arriba, el desorden de la superficie; al bajar,
// cada pieza cae por el túnel, se da vuelta y llega al laboratorio convertida en parte de un sistema.
// Todo es geometría simple con materiales sin luz (colores exactos del logo) y texturas dibujadas
// en canvas: no se descarga ningún modelo, HDRI ni fuente remota.

type Props = {
  progress: RefObject<{ target: number }>;
  surfaceItems: string[];
  depthItems: string[];
  /** Fuera de pantalla la escena deja de renderizar. */
  active: boolean;
  onReady: () => void;
  onProgress: (p: number) => void;
  /** Centro y radio de la insignia del burro, en píxeles del lienzo: las tarjetas flotan a su alrededor. */
  anchor: () => { x: number; y: number; r: number } | null;
};

const C = {
  paper: "#ededed",
  white: "#ffffff",
  ink: "#080a09",
  blue: "#1671b1",
  navy: "#174e74",
  navyDark: "#123c5a",
  night: "#0f1921",
  bedrock: "#080d12",
  yellow: "#fcea10",
  steel: "#5e615e",
  sky: "#aec6d4",
};

const SHAFT_X = 3;
const SHAFT_HALF = 2.4;
const CHAMBER_TOP = -17;
const CHAMBER_Y = -20.6;
const CHAMBER_HALF = 9;
const FRONT_Z = 1;
const BACK_Z = -2.6; // pared del fondo del túnel

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smooth = (v: number) => v * v * (3 - 2 * v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const backOut = (v: number) => 1 + 2.4 * Math.pow(v - 1, 3) + 1.4 * Math.pow(v - 1, 2); // pasa un poco de 1 y vuelve
// Entrada de las tarjetas al cargar la escena: caen a su lugar una tras otra, después de que se van las etiquetas planas.
const ENTER = { delay: 0.25, stagger: 0.14, duration: 1 };

/* ───────────────────────────── texturas de las tarjetas ───────────────────────────── */

type Draw = (ctx: CanvasRenderingContext2D, color: string) => void;

// Iconos «antes» (superficie) y «después» (laboratorio), dibujados en una caja de 120×120 centrada.
const BEFORE: Draw[] = [
  (ctx, color) => {
    // hoja de cálculo
    ctx.strokeRect(-52, -42, 104, 84);
    ctx.fillStyle = color;
    ctx.fillRect(-52, -42, 104, 20);
    for (const x of [-17, 18]) ctx.strokeRect(x, -42, 0.01, 84);
    for (const y of [-1, 20]) ctx.strokeRect(-52, y, 104, 0.01);
  },
  (ctx, color) => {
    // mensaje
    ctx.beginPath();
    ctx.roundRect(-52, -40, 104, 66, 16);
    ctx.moveTo(-24, 26);
    ctx.lineTo(-34, 46);
    ctx.lineTo(-4, 26);
    ctx.stroke();
    ctx.fillStyle = color;
    for (const x of [-24, 0, 24]) {
      ctx.beginPath();
      ctx.arc(x, -7, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  (ctx) => {
    // papel
    ctx.beginPath();
    ctx.moveTo(-38, -50);
    ctx.lineTo(18, -50);
    ctx.lineTo(40, -28);
    ctx.lineTo(40, 50);
    ctx.lineTo(-38, 50);
    ctx.closePath();
    ctx.moveTo(18, -50);
    ctx.lineTo(18, -28);
    ctx.lineTo(40, -28);
    for (const y of [-6, 12, 30]) {
      ctx.moveTo(-22, y);
      ctx.lineTo(24, y);
    }
    ctx.stroke();
  },
  (ctx, color) => {
    // tarea que se repite
    ctx.beginPath();
    ctx.arc(0, 0, 40, -0.4, Math.PI * 1.55);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(22, -52);
    ctx.lineTo(50, -24);
    ctx.lineTo(16, -18);
    ctx.fill();
  },
  (ctx) => {
    // dato aislado
    ctx.beginPath();
    ctx.ellipse(0, -20, 30, 11, 0, 0, Math.PI * 2);
    ctx.moveTo(-30, -20);
    ctx.lineTo(-30, 22);
    ctx.ellipse(0, 22, 30, 11, 0, Math.PI, 0, true);
    ctx.lineTo(30, -20);
    ctx.stroke();
    ctx.setLineDash([7, 9]);
    ctx.beginPath();
    ctx.arc(0, 0, 56, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  },
  (ctx) => {
    // sistemas desconectados
    ctx.strokeRect(-54, -26, 40, 52);
    ctx.strokeRect(14, -26, 40, 52);
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(-6, 0);
    ctx.moveTo(6, 0);
    ctx.lineTo(14, 0);
    ctx.moveTo(-5, -14);
    ctx.lineTo(5, 14);
    ctx.stroke();
  },
];

const AFTER: (Draw | string)[] = [
  (ctx) => {
    // datos centralizados
    for (const y of [-30, -4, 22]) {
      ctx.beginPath();
      ctx.ellipse(0, y, 40, 13, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-40, -30);
    ctx.lineTo(-40, 22);
    ctx.moveTo(40, -30);
    ctx.lineTo(40, 22);
    ctx.stroke();
  },
  "{ }",
  (ctx) => {
    // automatización: engranaje
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.moveTo(Math.cos(a) * 36, Math.sin(a) * 36);
      ctx.lineTo(Math.cos(a) * 52, Math.sin(a) * 52);
    }
    ctx.moveTo(36, 0);
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.moveTo(13, 0);
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.stroke();
  },
  (ctx, color) => {
    // dashboard
    ctx.fillStyle = color;
    [34, 62, 46, 84].forEach((h, i) => ctx.fillRect(-48 + i * 26, 44 - h, 17, h));
    ctx.beginPath();
    ctx.moveTo(-56, 48);
    ctx.lineTo(56, 48);
    ctx.stroke();
  },
  "</>",
  (ctx, color) => {
    // IA
    ctx.fillStyle = color;
    const star = (x: number, y: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const rr = i % 2 ? r * 0.32 : r;
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      ctx.fill();
    };
    star(-8, 6, 44);
    star(36, -34, 18);
  },
];

function cardTexture(face: "before" | "after", index: number, label: string, mono: string): THREE.CanvasTexture {
  const size = 384;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const after = face === "after";
  const main = after ? C.yellow : C.ink;

  ctx.fillStyle = after ? C.navyDark : C.white;
  ctx.beginPath();
  ctx.roundRect(8, 8, size - 16, size - 16, 34);
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = main;
  if (!after) ctx.setLineDash([22, 16]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.save();
  ctx.translate(size / 2, size / 2 - 34);
  ctx.scale(1.35, 1.35);
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = main;
  const icon = (after ? AFTER : BEFORE)[index % 6];
  if (typeof icon === "string") {
    ctx.font = `800 76px ${mono}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = main;
    ctx.fillText(icon, 0, 4);
  } else icon(ctx, main);
  ctx.restore();

  // etiqueta: hasta dos líneas
  ctx.fillStyle = after ? C.white : C.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const words = label.toUpperCase().split(" ");
  const lines = words.length > 1 && label.length > 12 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : [label.toUpperCase()];
  const longest = Math.max(...lines.map((line) => line.length));
  const fontSize = Math.min(34, Math.floor((size - 60) / (longest * 0.62)));
  ctx.font = `700 ${fontSize}px ${mono}`;
  lines.forEach((line, i) => ctx.fillText(line, size / 2, size - 62 + (i - (lines.length - 1) / 2) * (fontSize + 4)));

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/* ───────────────────────────── escena ───────────────────────────── */

// Desorden de la superficie: las tarjetas rodean la insignia del burro por los costados y por abajo
// (arriba está el titular). Ángulo en grados y profundidad de cada una.
const RING = [[157, 0.2], [198, -0.3], [235, 0.3], [305, -0.2], [342, 0.25], [23, -0.35]];
// Si debajo de la insignia no queda lugar antes del suelo, van tres de cada lado.
const RING_SIDES = [[142, 0.2], [180, -0.3], [218, 0.3], [322, -0.2], [0, 0.25], [38, -0.35]];
const FOV = 40;
const DEPTH = {
  wide: [[-6.2, 2.7], [-4.2, 0.9], [-6.2, -0.9], [6.2, 2.7], [4.2, 0.9], [6.2, -0.9]],
  tall: [[-2.1, 5.5], [0, 6.0], [2.1, 5.5], [-2.1, 3.8], [0, 4.3], [2.1, 3.8]],
};
const TILT = [-0.14, 0.1, -0.06, 0.16, -0.1, 0.07];

function Wall({ x0, x1, y0, y1, color, z = FRONT_Z }: { x0: number; x1: number; y0: number; y1: number; color: string; z?: number }) {
  return (
    <mesh position={[(x0 + x1) / 2, (y0 + y1) / 2, z]}>
      <planeGeometry args={[x1 - x0, y0 - y1]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Strata() {
  const L = SHAFT_X - SHAFT_HALF;
  const R = SHAFT_X + SHAFT_HALF;
  const layers: [number, number, string][] = [
    [0, -5, C.blue],
    [-5, -14, C.navy],
    [-14, CHAMBER_TOP, C.navyDark],
  ];
  return (
    <group>
      {layers.map(([y0, y1, color]) => (
        <group key={y0}>
          <Wall x0={-60} x1={L} y0={y0} y1={y1} color={color} />
          <Wall x0={R} x1={60} y0={y0} y1={y1} color={color} />
        </group>
      ))}
      {/* roca alrededor del laboratorio */}
      <Wall x0={-60} x1={SHAFT_X - CHAMBER_HALF} y0={CHAMBER_TOP} y1={-60} color={C.night} />
      <Wall x0={SHAFT_X + CHAMBER_HALF} x1={60} y0={CHAMBER_TOP} y1={-60} color={C.night} />
      <Wall x0={-60} x1={60} y0={CHAMBER_Y - 4.6} y1={-60} color={C.night} />
      {/* fondo del túnel y del laboratorio */}
      {/* más anchos que la abertura: la perspectiva nunca deja ver el cielo por los costados */}
      <Wall x0={L - 4} x1={R + 4} y0={0} y1={CHAMBER_TOP} color={C.night} z={BACK_Z} />
      <Wall x0={-60} x1={60} y0={CHAMBER_TOP + 5} y1={-60} color={C.bedrock} z={-3} />
      <gridHelper args={[36, 36, C.night, C.night]} rotation={[Math.PI / 2, 0, 0]} position={[SHAFT_X, CHAMBER_Y, -2.95]} />
      {/* suelo de la superficie a cada lado de la boca: desde arriba solo se ve oscuro el hueco, no toda la pared del fondo */}
      {[
        [-60, L],
        [R, 60],
      ].map(([x0, x1]) => (
        <mesh key={x0} position={[(x0 + x1) / 2, 0, FRONT_Z - 20]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[x1 - x0, 40]} />
          <meshBasicMaterial color={C.paper} />
        </mesh>
      ))}
      {/* borde de la boca sobre el suelo, con el mismo trazo que el resto del corte */}
      {(
        [
          [L, (FRONT_Z + BACK_Z) / 2, 0.08, FRONT_Z - BACK_Z],
          [R, (FRONT_Z + BACK_Z) / 2, 0.08, FRONT_Z - BACK_Z],
          [SHAFT_X, BACK_Z, R - L + 0.08, 0.08],
        ] as const
      ).map(([x, z, width, depth]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, depth]} />
          <meshBasicMaterial color={C.ink} />
        </mesh>
      ))}
      {/* línea del terreno y bordes de cada estrato */}
      <Wall x0={-60} x1={L} y0={0.05} y1={-0.05} color={C.ink} z={FRONT_Z + 0.01} />
      <Wall x0={R} x1={60} y0={0.05} y1={-0.05} color={C.ink} z={FRONT_Z + 0.01} />
      {[L, R].map((x) => (
        <Wall key={x} x0={x - 0.04} x1={x + 0.04} y0={0} y1={CHAMBER_TOP} color={C.ink} z={FRONT_Z + 0.01} />
      ))}
      {/* mesa del laboratorio */}
      <mesh position={[SHAFT_X, CHAMBER_Y - 1.72, 0]}>
        <boxGeometry args={[5.6, 0.24, 1.6]} />
        <meshBasicMaterial color={C.steel} />
      </mesh>
    </group>
  );
}

function World({ progress, textures, mascotTexture, lite, onProgress, onReady, anchor }: { textures: { before: THREE.Texture; after: THREE.Texture }[]; mascotTexture: THREE.Texture; lite: boolean } & Pick<Props, "progress" | "onProgress" | "onReady" | "anchor">) {
  const { camera, size } = useThree();
  const tall = size.width / size.height < 0.85;
  // cámara en la superficie (inicio del descenso)
  const view = useMemo(() => (tall ? { x: SHAFT_X, y: 6.7, z: 25 } : { x: -1.5, y: 4.9, z: 15 }), [tall]);
  const cardScale = tall ? 0.74 : 1;
  const cards = useRef<(THREE.Mesh | null)[]>([]);
  const wires = useRef<(THREE.Group | null)[]>([]);
  const mascot = useRef<THREE.Mesh>(null);
  const vein = useRef<THREE.Mesh>(null);
  const bits = useRef<THREE.InstancedMesh>(null);
  const smoothed = useRef(0);
  const born = useRef<number | null>(null);
  const bitCount = lite ? 24 : 64;

  const { layout, surfaceScale } = useMemo(() => {
    const depth = tall ? DEPTH.tall : DEPTH.wide;
    // La insignia es HTML: se pasa de píxeles a unidades del mundo en el plano z = 0 con la cámara inicial.
    const unit = size.height / (2 * view.z * Math.tan((FOV * Math.PI) / 360));
    const badge = anchor();
    const center = badge ? { x: view.x + (badge.x - size.width / 2) / unit, y: view.y - (badge.y - size.height / 2) / unit } : { x: SHAFT_X, y: view.y - 1.6 };
    const radius = (badge ? badge.r / unit : 1.2) + 0.35;
    // Si a la derecha de la insignia no entra una tarjeta entera, todas se achican en vez de taparla o salirse.
    // `spread` es cuánto del radio ocupa hacia el costado la tarjeta más saliente de cada disposición.
    const room = (size.width / 2 - 24) / unit - Math.abs(center.x - view.x);
    const fit = (spread: number) => Math.min(cardScale, Math.max(0.55, (room - spread * radius) / (0.75 * (1 + spread))));
    // ¿la tarjeta de abajo queda por encima del suelo (y = 0)?
    const below = center.y - 0.82 * (radius + 0.75 * fit(0.92)) - 0.75 * fit(0.92) > 0.25;
    const positions = below ? RING : RING_SIDES;
    const surfaceScale = fit(below ? 0.92 : 1);
    const half = 0.75 * surfaceScale;
    const ring = radius + half;
    const reach = (size.width / 2 - 24) / unit - half;
    const items = textures.map((_, i) => {
      const [angle, sz] = positions[i % 6];
      const [dx, dy] = depth[i % 6];
      const rad = (angle * Math.PI) / 180;
      const from = new THREE.Vector3(Math.min(Math.max(center.x + Math.cos(rad) * ring, view.x - reach), view.x + reach), center.y + Math.sin(rad) * ring, sz);
      const to = new THREE.Vector3(SHAFT_X + dx, CHAMBER_Y + dy, 0);
      const side = i % 2 ? 1 : -1;
      const curve = new THREE.CatmullRomCurve3([from, new THREE.Vector3(SHAFT_X + side * 0.7, 0.4, 0), new THREE.Vector3(SHAFT_X - side * 0.8, -9, -0.9), new THREE.Vector3(SHAFT_X + side * 0.5, CHAMBER_TOP + 0.5, -0.4), to]);
      // cable de la tarjeta a la laptop del burro
      const hub = new THREE.Vector3(SHAFT_X + 0.9, CHAMBER_Y - 0.9, -0.2);
      return { curve, to, hub, length: hub.distanceTo(to), angle: Math.atan2(to.y - hub.y, to.x - hub.x), side };
    });
    return { layout: items, surfaceScale };
  }, [tall, textures, view, cardScale, size.width, size.height, anchor]);

  const bitSeeds = useMemo(() => Array.from({ length: bitCount }, (_, i) => ({ x: Math.sin(i * 12.9898) * 2, z: -2 + ((i * 7) % 10) * 0.24, offset: (i * 0.6180339) % 1, speed: 0.05 + ((i * 13) % 7) * 0.012 })), [bitCount]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const point = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => onReady(), [onReady]);

  useFrame((state, dt) => {
    smoothed.current += (progress.current.target - smoothed.current) * (1 - Math.exp(-dt * 7)); // scrub suave
    const p = smoothed.current;
    onProgress(p);
    const time = state.clock.elapsedTime;
    born.current ??= time;
    const since = time - born.current;

    // cámara: de la superficie al laboratorio
    const descent = smooth(clamp01((p - 0.08) / 0.78));
    const cam = camera as THREE.PerspectiveCamera;
    const endY = CHAMBER_Y + (tall ? 1.6 : -1.2);
    cam.position.set(lerp(view.x, SHAFT_X, smooth(clamp01((p - 0.6) / 0.22))), lerp(view.y, endY, descent), view.z);
    cam.lookAt(cam.position.x, cam.position.y, 0);

    layout.forEach((item, i) => {
      const card = cards.current[i];
      if (!card) return;
      const t = smooth(clamp01((p - (0.1 + i * 0.03)) / 0.64));
      // entrada: 1 = todavía no llegó, 0 = en su lugar (o ya bajando por el túnel, donde no pesa)
      const arrive = clamp01((since - ENTER.delay - i * ENTER.stagger) / ENTER.duration);
      const settle = (1 - smooth(arrive)) * (1 - t);
      item.curve.getPoint(t, point);
      card.position.copy(point);
      card.position.y += Math.sin(time * 0.8 + i * 1.7) * 0.09 * (1 - t) + settle * 1.1;
      card.rotation.set(Math.sin(t * Math.PI * 2) * 0.35, t * Math.PI, TILT[i % 6] * (1 - t) + Math.sin(t * Math.PI) * 0.55 * item.side + Math.sin(time * 0.6 + i) * 0.03 * (1 - t) + settle * 0.4 * item.side);
      card.scale.setScalar(lerp(surfaceScale, cardScale, t) * Math.max(lerp(backOut(arrive), 1, t), 0.0001));

      const wire = wires.current[i];
      if (wire) wire.scale.x = smooth(clamp01((p - 0.82 - i * 0.012) / 0.1)) || 0.0001;
    });

    if (vein.current) {
      vein.current.scale.y = descent || 0.0001;
      vein.current.position.y = (CHAMBER_TOP * descent) / 2;
    }
    if (mascot.current) {
      const m = clamp01((p - 0.72) / 0.14);
      const pop = m === 0 ? 0.0001 : backOut(m);
      mascot.current.scale.setScalar(pop * (tall ? 0.86 : 1));
    }
    if (bits.current) {
      bitSeeds.forEach((seed, i) => {
        const y = -(((time * seed.speed + seed.offset) % 1) * -CHAMBER_TOP);
        dummy.position.set(SHAFT_X + seed.x, y, seed.z);
        dummy.rotation.set(time + i, time * 0.7 + i, 0);
        dummy.updateMatrix();
        bits.current!.setMatrixAt(i, dummy.matrix);
      });
      bits.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <Strata />
      <mesh ref={vein} position={[SHAFT_X, 0, -2.5]}>
        <planeGeometry args={[0.08, -CHAMBER_TOP]} />
        <meshBasicMaterial color={C.yellow} />
      </mesh>
      <instancedMesh ref={bits} args={[undefined, undefined, bitCount]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color={C.yellow} />
      </instancedMesh>

      {layout.map((item, i) => (
        <group key={i}>
          <group ref={(el) => void (wires.current[i] = el)} position={item.hub} rotation={[0, 0, item.angle]}>
            <mesh position={[item.length / 2, 0, 0]}>
              <planeGeometry args={[item.length, 0.06]} />
              <meshBasicMaterial color={C.yellow} />
            </mesh>
          </group>
          <mesh ref={(el) => void (cards.current[i] = el)}>
            <boxGeometry args={[1.5, 1.5, 0.07]} />
            {[0, 1, 2, 3].map((side) => (
              <meshBasicMaterial key={side} attach={`material-${side}`} color={C.ink} />
            ))}
            <meshBasicMaterial attach="material-4" map={textures[i].before} />
            <meshBasicMaterial attach="material-5" map={textures[i].after} />
          </mesh>
        </group>
      ))}

      {/* La mascota es el asset original como textura: no se modela ni se redibuja. */}
      <mesh ref={mascot} position={[SHAFT_X, CHAMBER_Y + 0.6, 0.2]}>
        <planeGeometry args={[2.84, 4.4]} />
        <meshBasicMaterial map={mascotTexture} transparent alphaTest={0.02} />
      </mesh>
    </>
  );
}

export default function Scene({ progress, surfaceItems, depthItems, active, onReady, onProgress, anchor }: Props) {
  const [assets, setAssets] = useState<{ cards: { before: THREE.Texture; after: THREE.Texture }[]; mascot: THREE.Texture } | null>(null);
  const [lite] = useState(() => window.innerWidth < 768 || matchMedia("(pointer: coarse)").matches);

  useEffect(() => {
    let cancelled = false;
    let created: THREE.Texture[] = [];
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains") || "monospace";
    void Promise.all([document.fonts.load(`700 32px ${mono}`).catch(() => null), new THREE.TextureLoader().loadAsync("/brand/mascot-texture.webp")]).then(([, mascot]) => {
      if (cancelled) return mascot.dispose();
      mascot.colorSpace = THREE.SRGBColorSpace;
      const cards = Array.from({ length: 6 }, (_, i) => ({
        before: cardTexture("before", i, surfaceItems[i] ?? "", mono),
        after: cardTexture("after", i, depthItems[i] ?? "", mono),
      }));
      created = [mascot, ...cards.flatMap((card) => [card.before, card.after])];
      setAssets({ cards, mascot });
    });
    return () => {
      cancelled = true;
      created.forEach((texture) => texture.dispose());
    };
  }, [surfaceItems, depthItems]);

  if (!assets) return null;
  return (
    <Canvas
      flat
      frameloop={active ? "always" : "never"}
      dpr={lite ? [1, 1.25] : [1, 1.75]}
      camera={{ fov: FOV, near: 0.1, far: 90, position: [-1.5, 4.2, 15] }}
      gl={{ antialias: !lite, powerPreference: "high-performance" }}
      onCreated={({ scene }) => (scene.background = new THREE.Color(C.paper))}
    >
      <World progress={progress} textures={assets.cards} mascotTexture={assets.mascot} lite={lite} onProgress={onProgress} onReady={onReady} anchor={anchor} />
    </Canvas>
  );
}
