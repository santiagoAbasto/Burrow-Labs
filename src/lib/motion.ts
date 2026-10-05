// Tokens de motion. Mismos valores que las variables CSS de globals.css
// (--motion-fast/normal/slow, --ease-out, --ease-in-out). DESIGN.md §6.
// Sin imports: se puede usar desde server components, Motion y GSAP.

/** Duraciones en segundos (Motion y GSAP). */
export const motion = { fast: 0.14, normal: 0.28, slow: 0.6 } as const;

/** Las mismas duraciones en milisegundos (timers, WAAPI). */
export const motionMs = { fast: 140, normal: 280, slow: 600 } as const;

type Bezier = readonly [number, number, number, number];
const out: Bezier = [0.22, 1, 0.36, 1];
const inOut: Bezier = [0.65, 0, 0.35, 1];

/** Curvas para Motion; `ease.css.*` para WAAPI, estilos en línea o CustomEase de GSAP. */
export const ease = {
  out,
  inOut,
  css: {
    out: "cubic-bezier(0.22, 1, 0.36, 1)",
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  },
} as const;

/** Feedback físico (presión, arrastre). */
export const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

/** Transiciones listas: `<motion.div transition={transition.normal} />`. */
export const transition = {
  fast: { duration: motion.fast, ease: out },
  normal: { duration: motion.normal, ease: out },
  slow: { duration: motion.slow, ease: inOut },
} as const;

/** Media query para matchMedia / gsap.matchMedia. */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Para `<MotionConfig {...motionConfig}>`: con reduced motion Motion deja solo
 * opacidad y color (sin transform ni layout). En componentes cliente, el hook es
 * `useReducedMotion` de "motion/react".
 */
export const motionConfig = { reducedMotion: "user", transition: transition.normal } as const;
