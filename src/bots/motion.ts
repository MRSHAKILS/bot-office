/** Procedural motion helpers — see MOTION.md */
export const SIT_MS = 320;
export const WALK_BASE = 3.25;

export function easeOutCubic(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 3;
}

export function hash01(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

export function lerpAngle(a: number, b: number, t: number) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

export type PoseTarget = { bodyY: number; leg: number; armL: number; armR: number; leanZ: number; headY: number };

export function poseFor(
  state: string,
  seated: boolean,
  t: number,
  phase: number,
  carrying: boolean,
): PoseTarget {
  if (!seated) {
    // standing idle (between steps) — slight ready pose
    return { bodyY: 0, leg: 0, armL: carrying ? -1.15 : -0.15, armR: -0.1, leanZ: 0, headY: 0 };
  }
  const breathe = Math.sin(t * 1.95 + phase) * 0.015;
  if (state === 'working') {
    const type = Math.sin(t * 12 + phase) * 0.012;
    return {
      bodyY: -0.12 + breathe * 0.4,
      leg: -Math.PI / 2,
      armL: -0.35 - type,
      armR: -0.35 + type,
      leanZ: 0,
      headY: Math.sin(t * 0.9 + phase) * 0.12,
    };
  }
  if (state === 'waiting') {
    return {
      bodyY: -0.12 + breathe,
      leg: -Math.PI / 2 + (Math.sin(t * 2.1 + phase) > 0.92 ? 0.08 : 0),
      armL: -0.55,
      armR: -0.55,
      leanZ: 0,
      headY: Math.sin(t * 2.5 + phase) * 0.22,
    };
  }
  if (state === 'error') {
    return {
      bodyY: -0.12 + breathe,
      leg: -Math.PI / 2,
      armL: -0.4,
      armR: -0.4,
      leanZ: 0,
      headY: Math.sin(t * 4.5 + phase) * 0.18,
    };
  }
  // Idle poses remain completely still.
  return { bodyY: -0.12, leg: -Math.PI / 2, armL: -0.45, armR: -0.45, leanZ: 0, headY: 0 };
}
