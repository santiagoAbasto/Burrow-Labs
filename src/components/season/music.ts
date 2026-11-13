// Música de la campaña de Navidad: la pista propia del estudio (public/audio/navidad.mp3), en bucle y de fondo.
//
// Reglas:
// · Los navegadores no dejan sonar nada antes de que la persona toque la página: arranca con su primer gesto.
// · Cada visitante puede apagarla; se recuerda en su navegador.
// · El archivo no se descarga hasta que va a sonar: quien la tiene apagada no gasta datos en él.
// · Vive fuera de React: sigue sonando (sin volver a empezar) al cambiar de página y se calla al ocultar la pestaña.
// · Nunca canciones con derechos de autor: solo una pista propia o libre de regalías.
const KEY = "burrowlabs:season-music";
const EVENT = "burrowlabs:season-music";
const TRACK = "/audio/navidad.mp3";
const VOLUME = 0.3; // de fondo: se oye, no tapa

let audio: HTMLAudioElement | null = null;
let playing = false;
let available = false; // el panel la encendió para esta página
let gestured = false; // la persona ya tocó la página
let listening = false;

export function musicOff(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "off";
  } catch {
    return false;
  }
}

export const isPlaying = () => playing;

const notify = () => window.dispatchEvent(new Event(EVENT));

export function onMusicChange(fn: () => void): () => void {
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}

function createAudio() {
  audio = new Audio();
  audio.preload = "none";
  audio.loop = true;
  audio.volume = VOLUME;
  audio.src = TRACK;
  // El estado del botón sale de lo que de verdad pasa con el audio, no de lo que se intentó
  const set = (value: boolean) => () => {
    playing = value;
    notify();
  };
  audio.addEventListener("playing", set(true));
  audio.addEventListener("pause", set(false));
  audio.addEventListener("error", set(false));
}

function start() {
  if (playing || !available || !gestured || musicOff() || document.hidden) return;
  if (!audio) createAudio();
  // Si el navegador todavía no deja (falta un gesto), no pasa nada: se reintenta con el próximo
  audio!.play().catch(() => {
    playing = false;
    notify();
  });
}

function stop() {
  if (audio && !audio.paused) audio.pause();
}

const GESTURES = ["pointerdown", "keydown"] as const;
const onFirstGesture = (event: Event) => {
  gestured = true;
  for (const name of GESTURES) window.removeEventListener(name, onFirstGesture);
  // Si el primer gesto es sobre el propio botón de la música, decide ese clic (si no, arrancaría y se apagaría)
  if (event.target instanceof Element && event.target.closest(".nv-music")) return;
  start();
};
const onVisibility = () => (document.hidden ? stop() : start());

/** La llama el proveedor: `on` = la campaña tiene música y esta página es del sitio. */
export function prepareMusic(on: boolean) {
  available = on;
  if (on && !listening) {
    listening = true;
    if (!gestured) for (const name of GESTURES) window.addEventListener(name, onFirstGesture, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
  }
  if (!on && listening) {
    listening = false;
    for (const name of GESTURES) window.removeEventListener(name, onFirstGesture);
    document.removeEventListener("visibilitychange", onVisibility);
  }
  if (on) start();
  else stop();
}

/** El botón del visitante: enciende o apaga, y lo recuerda. */
export function toggleMusic() {
  const off = playing;
  try {
    if (off) window.localStorage.setItem(KEY, "off");
    else window.localStorage.removeItem(KEY);
  } catch {
    /* sin almacenamiento, vale para esta visita */
  }
  gestured = true; // el clic en el botón ya es un gesto
  if (off) stop();
  else start();
}
