// Idioma único de animação da fábrica: spring suave (damping 200) + interpolate.
// Nenhum componente inventa easing próprio — todos usam estes helpers.
import { interpolate, spring } from "remotion";

/** Progresso 0→1 com física de mola suave. */
export const springIn = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 200 } });

/** Entra subindo + fade. Uso: style={{ ...fadeUp(frame, fps, 10) }} */
export const fadeUp = (frame: number, fps: number, delay = 0, dist = 48) => {
  const p = springIn(frame, fps, delay);
  return {
    opacity: p,
    transform: `translateY(${interpolate(p, [0, 1], [dist, 0])}px)`,
  };
};

/** Entra crescendo (pop). */
export const popIn = (frame: number, fps: number, delay = 0) => {
  const p = springIn(frame, fps, delay);
  return {
    opacity: Math.min(1, p * 2),
    transform: `scale(${interpolate(p, [0, 1], [0.82, 1])})`,
  };
};

/** Mola COM repique — dá o "soco" na palavra que está sendo falada.
 *  O `springIn` (damping 200) é liso de propósito e NÃO repica; este é o oposto. */
export const springPunch = (frame: number, fps: number, delay = 0) =>
  spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.6 },
  });

/** Saída em fade nos últimos `len` frames de uma sequência. */
export const fadeOutAtEnd = (frame: number, durationInFrames: number, len = 12) =>
  interpolate(frame, [durationInFrames - len, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
