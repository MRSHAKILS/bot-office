import * as THREE from 'three';
import { box, matte, canvasTexture } from './materials';

/** Per-bot workstation config. Add an entry keyed by TeamMember.id for every new bot. */
export type MonitorKind = 'flat' | 'ultrawide' | 'curved' | 'vertical' | 'laptop';
export type ScreenTheme = 'ops' | 'calendar' | 'code' | 'charts' | 'hardware' | 'fitness' | 'lab' | 'docs' | 'timeline';
export interface Monitor { kind: MonitorKind; w: number; h: number; offsetX: number; offsetZ?: number; yaw?: number; }
export interface Station {
  monitors: Monitor[];
  tower: { kind: 'slim' | 'gaming' | 'aluminum' | 'lab'; led: string };
  underglow: string; screenTheme: ScreenTheme;
  desk: { finish: 'oak' | 'white' | 'walnut' | 'black' | 'steel'; height?: number; width?: number; shape?: 'rect' | 'l' | 'standing' };
  chair: 'task' | 'gaming' | 'stool' | 'executive' | 'ball';
  props: ('mug' | 'plant' | 'headphones' | 'books' | 'lamp' | 'dumbbell' | 'flask' | 'ram' | 'clock' | 'notebook' | 'trophy' | 'figure')[];
}
const FIN = { oak: '#c4a882', white: '#eeece6', walnut: '#6b4a33', black: '#2a2d33', steel: '#9aa3ad' };

export const STATIONS: Record<string, Station> = {
  // Alfred – lead
  'cbae969e-3163-46eb-ab58-23e3f341f26d': { monitors: [{ kind: 'curved', w: 1.25, h: 0.5, offsetX: 0 }, { kind: 'flat', w: 0.62, h: 0.4, offsetX: -0.98, yaw: 0.45, offsetZ: 0.08 }, { kind: 'flat', w: 0.62, h: 0.4, offsetX: 0.98, yaw: -0.45, offsetZ: 0.08 }], tower: { kind: 'aluminum', led: '#93c5fd' }, underglow: '#bfdbfe', screenTheme: 'ops', desk: { finish: 'walnut', width: 2.8, shape: 'l' }, chair: 'executive', props: ['mug', 'lamp', 'trophy'] },
  // niẓām
  '008dd220-3d73-4eb1-aba7-168ef890168e': { monitors: [{ kind: 'flat', w: 0.72, h: 0.44, offsetX: -0.4, yaw: 0.12 }, { kind: 'flat', w: 0.72, h: 0.44, offsetX: 0.4, yaw: -0.12 }], tower: { kind: 'slim', led: '#f59e0b' }, underglow: '#f59e0b', screenTheme: 'calendar', desk: { finish: 'black' }, chair: 'task', props: ['clock', 'plant'] },
  // NSU
  '8d8c2db0-fb0d-4701-8965-bab6fed9e397': { monitors: [{ kind: 'vertical', w: 0.38, h: 0.66, offsetX: -0.45 }, { kind: 'flat', w: 0.72, h: 0.44, offsetX: 0.25 }], tower: { kind: 'slim', led: '#3b82f6' }, underglow: '#3b82f6', screenTheme: 'docs', desk: { finish: 'white' }, chair: 'task', props: ['books', 'lamp'] },
  // Lamar
  '0b3c7f02-8dd6-4e5d-9e95-a70ae7786823': { monitors: [{ kind: 'laptop', w: 0.5, h: 0.32, offsetX: -0.45, offsetZ: 0.22 }, { kind: 'flat', w: 0.72, h: 0.44, offsetX: 0.3 }], tower: { kind: 'slim', led: '#14b8a6' }, underglow: '#14b8a6', screenTheme: 'docs', desk: { finish: 'oak' }, chair: 'stool', props: ['notebook', 'mug'] },
  // Victoria
  '404a85ba-453a-403a-9c4d-7787f9ae3a77': { monitors: [{ kind: 'curved', w: 1.35, h: 0.5, offsetX: 0 }], tower: { kind: 'aluminum', led: '#a78bfa' }, underglow: '#8b5cf6', screenTheme: 'timeline', desk: { finish: 'white', shape: 'standing', height: 1.0 }, chair: 'stool', props: ['clock', 'mug'] },
  // Mentor
  '80381437-13be-4b95-9f83-c85632a12fac': { monitors: [{ kind: 'vertical', w: 0.36, h: 0.62, offsetX: -0.72, yaw: 0.2 }, { kind: 'flat', w: 0.66, h: 0.42, offsetX: 0 }, { kind: 'vertical', w: 0.36, h: 0.62, offsetX: 0.72, yaw: -0.2 }], tower: { kind: 'slim', led: '#22c55e' }, underglow: '#22c55e', screenTheme: 'docs', desk: { finish: 'oak', width: 2.4 }, chair: 'task', props: ['plant', 'books'] },
  // Fitness
  'ba5b82e3-ebd9-4abe-b6a0-e9c3ddb43a5d': { monitors: [{ kind: 'ultrawide', w: 1.3, h: 0.46, offsetX: 0 }], tower: { kind: 'slim', led: '#f97316' }, underglow: '#f97316', screenTheme: 'fitness', desk: { finish: 'steel', shape: 'standing', height: 1.05 }, chair: 'ball', props: ['dumbbell', 'mug'] },
  // Mibot
  '9af0c291-72b5-4478-b261-1f6717350ee8': { monitors: [{ kind: 'curved', w: 1.15, h: 0.46, offsetX: -0.2 }, { kind: 'vertical', w: 0.36, h: 0.64, offsetX: 0.72, yaw: -0.25 }], tower: { kind: 'gaming', led: '#22d3ee' }, underglow: '#06b6d4', screenTheme: 'code', desk: { finish: 'black', width: 2.4 }, chair: 'gaming', props: ['headphones', 'figure'] },
  // Ram-Hunt
  'a659b8f6-fe6f-4387-8e5b-62834e2f4df3': { monitors: [{ kind: 'flat', w: 0.5, h: 0.32, offsetX: -0.6, yaw: 0.25 }, { kind: 'flat', w: 0.5, h: 0.32, offsetX: 0 }, { kind: 'flat', w: 0.5, h: 0.32, offsetX: 0.6, yaw: -0.25 }], tower: { kind: 'gaming', led: '#d946ef' }, underglow: '#d946ef', screenTheme: 'hardware', desk: { finish: 'steel' }, chair: 'gaming', props: ['ram', 'headphones'] },
  // eggbot
  'f585d306-3c01-4457-97ed-e2f4a2c5fae1': { monitors: [{ kind: 'flat', w: 0.7, h: 0.44, offsetX: -0.4, yaw: 0.1 }, { kind: 'flat', w: 0.7, h: 0.44, offsetX: 0.4, yaw: -0.1 }], tower: { kind: 'lab', led: '#ef4444' }, underglow: '#ef4444', screenTheme: 'lab', desk: { finish: 'white' }, chair: 'stool', props: ['flask', 'lamp'] },
  // SWE – Software zone (own carpet, east of Bot Lab)
  '7af8ff89-8acc-4ce2-9c97-2d5928e14400': { monitors: [{ kind: 'flat', w: 0.66, h: 0.42, offsetX: -0.36, yaw: 0.12 }, { kind: 'flat', w: 0.66, h: 0.42, offsetX: 0.36, yaw: -0.12 }], tower: { kind: 'gaming', led: '#0ea5e9' }, underglow: '#0ea5e9', screenTheme: 'code', desk: { finish: 'black', width: 1.8 }, chair: 'gaming', props: ['mug', 'headphones'] },
};
export const DEFAULT_STATION: Station = { monitors: [{ kind: 'flat', w: 0.8, h: 0.48, offsetX: 0 }], tower: { kind: 'slim', led: '#94a3b8' }, underglow: '#94a3b8', screenTheme: 'ops', desk: { finish: 'oak' }, chair: 'task', props: ['mug'] };

const BEZEL = '#16181c', DARK = '#3a3f46';
const em = (c: string) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });

// ---- screen painters ---------------------------------------------------------
type Painter = (c: CanvasRenderingContext2D, W: number, H: number, t: number, accent: string, seed: number) => void;
const bg = (c: CanvasRenderingContext2D, W: number, H: number, col = '#0b1220') => { c.fillStyle = col; c.fillRect(0, 0, W, H); };
const PAINT: Record<ScreenTheme, Painter> = {
  ops(c, W, H, t, a, s) { bg(c, W, H); for (let i = 0; i < 4; i++) { const x = 12 + (i % 2) * W / 2, y = 12 + Math.floor(i / 2) * H / 2; c.fillStyle = '#111b2e'; c.fillRect(x, y, W / 2 - 24, H / 2 - 24); c.strokeStyle = i ? '#60a5fa' : a; c.lineWidth = 3; c.beginPath(); for (let k = 0; k < 20; k++) { const px = x + 6 + k * (W / 2 - 36) / 19, py = y + H / 4 - 10 + Math.sin(t * 1.5 + k * 0.6 + i + s) * (H / 10); k ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); } },
  calendar(c, W, H, t, a, s) { bg(c, W, H, '#14110c'); const cols = 5, rows = 6; c.strokeStyle = '#2b2419'; for (let i = 0; i <= cols; i++) { c.beginPath(); c.moveTo(i * W / cols, 0); c.lineTo(i * W / cols, H); c.stroke(); } for (let k = 0; k < 7; k++) { const col = (k * 3 + s) % cols, row = (k * 2 + s) % rows; c.fillStyle = k % 2 ? a : '#fbbf24'; c.globalAlpha = 0.8; c.fillRect(col * W / cols + 4, row * H / rows + 4, W / cols - 8, H / rows * 1.4); } c.globalAlpha = 1; c.fillStyle = '#ef4444'; const ny = ((t * 8) % H); c.fillRect(0, ny, W, 2); },
  code(c, W, H, t, a, s) { bg(c, W, H, '#0d1117'); const n = Math.floor(t * 3 + s) % 30; for (let i = 0; i < 14; i++) { const len = ((i * 37 + n * 11) % 9) + 3; c.fillStyle = ['#ff7b72', '#79c0ff', '#a5d6ff', a, '#d2a8ff'][(i + n) % 5]; c.fillRect(10 + ((i * 3) % 4) * 14, 10 + i * (H - 20) / 14, len * W / 18, (H - 20) / 22); } },
  charts(c, W, H, t, a) { bg(c, W, H); for (let i = 0; i < 8; i++) { const h = (0.3 + 0.6 * Math.abs(Math.sin(t + i))) * H * 0.8; c.fillStyle = a; c.fillRect(10 + i * W / 8, H - h - 6, W / 8 - 8, h); } },
  hardware(c, W, H, t, a, s) { bg(c, W, H, '#100714'); for (let i = 0; i < 6; i++) { const v = 0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i + s)); c.fillStyle = '#2a1430'; c.fillRect(10, 10 + i * H / 6, W - 20, H / 6 - 8); c.fillStyle = i % 2 ? a : '#22d3ee'; c.fillRect(10, 10 + i * H / 6, (W - 20) * v, H / 6 - 8); } },
  fitness(c, W, H, t, a) { bg(c, W, H, '#140b05'); c.strokeStyle = a; c.lineWidth = 4; c.beginPath(); for (let x = 0; x < W; x += 4) { const p = ((x + t * 160) % 160); const y = H / 2 - (p > 60 && p < 70 ? H * 0.35 : p > 70 && p < 78 ? -H * 0.2 : 0); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.fillStyle = '#fde68a'; c.font = `700 ${H / 5}px system-ui`; c.fillText(`${Math.round(72 + 8 * Math.sin(t))} bpm`, 14, H / 4.5); },
  lab(c, W, H, t, a) { bg(c, W, H, '#140808'); for (let i = 0; i < 18; i++) { const x = (Math.sin(i * 12.9) * 0.5 + 0.5) * W, y = ((Math.cos(i * 7.3) * 0.5 + 0.5) * H + t * 20 * (1 + i % 3)) % H; c.fillStyle = i % 3 ? a : '#fca5a5'; c.beginPath(); c.arc(x, y, 5 + (i % 4) * 3, 0, 7); c.fill(); } },
  docs(c, W, H, t, a, s) { bg(c, W, H, '#f8fafc'); c.fillStyle = a; c.fillRect(0, 0, W, H / 9); const off = Math.floor(t * 2 + s) % 4; for (let i = 0; i < 12; i++) { c.fillStyle = i === off ? a : '#94a3b8'; c.fillRect(14, H / 7 + i * H / 14, (W - 28) * (0.5 + ((i * 13 + s) % 5) / 10), H / 40 + 2); } },
  timeline(c, W, H, t, a, s) { bg(c, W, H, '#110b1d'); for (let i = 0; i < 6; i++) { const st = ((i * 97 + s) % 50) / 100 * W; c.fillStyle = i % 2 ? a : '#c4b5fd'; c.fillRect(st, 10 + i * (H - 20) / 6, W * 0.3, (H - 20) / 6 - 6); } c.fillStyle = '#f43f5e'; c.fillRect(((t * 30) % W), 0, 3, H); },
};

function chair(kind: Station['chair'], accent: string) {
  const g = new THREE.Group(); const C = '#3a3f46';
  if (kind === 'stool') { g.add(box(0.5, 0.06, 0.5, accent, 0, 0.62, 0)); g.add(box(0.06, 0.62, 0.06, DARK, 0, 0, 0)); g.add(box(0.44, 0.03, 0.44, DARK, 0, 0.22, 0)); return g; }
  if (kind === 'ball') { const b = new THREE.Mesh(new THREE.SphereGeometry(0.33, 14, 10), matte(accent)); b.position.y = 0.33; b.castShadow = true; g.add(b); return g; }
  const seat = kind === 'gaming' ? '#1f2227' : kind === 'executive' ? '#2b211b' : C;
  g.add(box(0.6, 0.08, 0.6, seat, 0, 0.42, 0)); g.add(box(0.08, 0.42, 0.08, DARK, 0, 0, 0)); g.add(box(0.6, 0.06, 0.06, DARK, 0, 0, 0)); g.add(box(0.06, 0.06, 0.6, DARK, 0, 0, 0));
  const bh = kind === 'gaming' ? 0.95 : kind === 'executive' ? 0.85 : 0.6;
  g.add(box(0.6, bh, 0.1, seat, 0, 0.5, 0.3));
  if (kind === 'gaming') { g.add(box(0.12, bh * 0.9, 0.11, accent, -0.22, 0.52, 0.31)); g.add(box(0.12, bh * 0.9, 0.11, accent, 0.22, 0.52, 0.31)); g.add(box(0.34, 0.14, 0.12, '#111', 0, 0.5 + bh - 0.22, 0.25)); }
  if (kind === 'executive') { for (const sx of [-0.33, 0.33]) g.add(box(0.06, 0.06, 0.5, DARK, sx, 0.68, 0.05)); }
  return g;
}

function prop(p: Station['props'][number], accent: string): THREE.Object3D {
  switch (p) {
    case 'mug': return box(0.09, 0.11, 0.09, '#f1f5f9');
    case 'plant': { const g = new THREE.Group(); g.add(box(0.14, 0.14, 0.14, '#e9e5dc')); const l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 0), matte('#6f8f6a')); l.position.y = 0.25; g.add(l); return g; }
    case 'headphones': { const g = new THREE.Group(); g.add(box(0.04, 0.3, 0.04, DARK)); const h = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 6, 12, Math.PI), matte(accent)); h.position.y = 0.3; g.add(h); return g; }
    case 'books': { const g = new THREE.Group(); ['#2f4f7a', '#7a2f3b', '#3f6b4b'].forEach((c, i) => g.add(box(0.26, 0.05, 0.18, c, 0, i * 0.05, 0))); return g; }
    case 'lamp': { const g = new THREE.Group(); g.add(box(0.12, 0.02, 0.12, DARK)); g.add(box(0.02, 0.32, 0.02, DARK, 0, 0.02, 0)); const s = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.1, 10, 1, true), em('#fff7d6')); s.position.set(0, 0.36, 0); g.add(s); return g; }
    case 'dumbbell': { const g = new THREE.Group(); g.add(box(0.24, 0.03, 0.03, DARK, 0, 0.03, 0)); for (const x of [-0.12, 0.12]) g.add(box(0.05, 0.09, 0.09, accent, x, 0, 0)); return g; }
    case 'flask': { const m = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 8), new THREE.MeshLambertMaterial({ color: '#fca5a5', transparent: true, opacity: 0.8 })); m.position.y = 0.09; return m; }
    case 'ram': { const g = new THREE.Group(); for (let i = 0; i < 3; i++) g.add(box(0.26, 0.06, 0.015, '#2f6b3b', 0, 0, i * 0.04)); g.add(box(0.26, 0.012, 0.1, accent, 0, 0.06, 0.04, false)); return g; }
    case 'clock': { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16), matte('#ffffff')); m.rotation.x = Math.PI / 2; m.position.y = 0.08; return m; }
    case 'notebook': return box(0.2, 0.025, 0.26, accent);
    case 'trophy': { const g = new THREE.Group(); g.add(box(0.1, 0.04, 0.1, DARK)); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.03, 0.12, 10), matte('#d4af37')); c.position.y = 0.1; g.add(c); return g; }
    case 'figure': { const g = new THREE.Group(); g.add(box(0.06, 0.1, 0.05, accent)); g.add(box(0.05, 0.05, 0.05, '#f1f5f9', 0, 0.1, 0)); return g; }
  }
}

/** Builds desk + chair + monitors + tower + underglow. Origin = desk centre (matches old desk()). */
export function buildStation(st: Station, accent: string, renderer: THREE.WebGLRenderer, seed = 0) {
  const g = new THREE.Group(); const updaters: ((t: number) => void)[] = [];
  const W = st.desk.width ?? 2.2, H = st.desk.height ?? 0.72, top = FIN[st.desk.finish];
  g.add(box(W, 0.06, 1.0, top, 0, H, 0));
  g.add(box(W, 0.015, 1.0, accent, 0, H - 0.015, 0, false)); // edge accent band
  if (st.desk.shape === 'l') g.add(box(0.9, 0.06, 1.3, top, W / 2 + 0.45, H, 0.15));
  if (st.desk.shape === 'standing') { for (const lx of [-W / 2 + 0.2, W / 2 - 0.2]) { g.add(box(0.1, H, 0.1, '#475569', lx, 0, 0)); g.add(box(0.12, 0.04, 0.8, '#475569', lx, 0, 0)); } }
  else for (const [lx, lz] of [[-W / 2 + 0.1, -0.42], [W / 2 - 0.1, -0.42], [-W / 2 + 0.1, 0.42], [W / 2 - 0.1, 0.42]]) g.add(box(0.06, H, 0.06, st.desk.finish === 'walnut' ? '#1f1a16' : DARK, lx, 0, lz));
  if (st.desk.finish === 'walnut' || st.desk.finish === 'white') g.add(box(W - 0.3, H - 0.1, 0.04, top, 0, 0.05, -0.46)); // modesty panel
  const ty = H + 0.06;
  g.add(box(0.5, 0.02, 0.17, '#d9d6cf', 0, ty, 0.42)); // keyboard, aligned with seated hands
  g.add(box(0.07, 0.02, 0.11, '#d9d6cf', 0.38, ty, 0.12));
  g.add(box(0.9, 0.005, 0.4, '#1f2328', 0.1, ty, 0.12, false)); // desk mat
  // monitors
  st.monitors.forEach((mo, i) => {
    const mg = new THREE.Group(); mg.position.set(mo.offsetX, ty, -0.28 + (mo.offsetZ ?? 0)); mg.rotation.y = mo.yaw ?? 0; g.add(mg);
    const res = 256; const cw = Math.round(res * mo.w / Math.max(mo.w, mo.h) * 2), ch = Math.round(res * mo.h / Math.max(mo.w, mo.h) * 2);
    const ct = canvasTexture(cw, ch, () => {}, renderer, false);
    const smat = new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false });
    let screen: THREE.Mesh;
    if (mo.kind === 'laptop') {
      mg.add(box(mo.w, 0.02, mo.h * 0.9, '#9ca3af', 0, 0, 0.1));
      const lid = new THREE.Group(); lid.position.set(0, 0.02, 0.1 - mo.h * 0.45); lid.rotation.x = -0.25; mg.add(lid);
      lid.add(box(mo.w, mo.h, 0.015, '#9ca3af', 0, 0, 0));
      screen = new THREE.Mesh(new THREE.PlaneGeometry(mo.w * 0.92, mo.h * 0.88), smat); screen.position.set(0, mo.h / 2, 0.009); lid.add(screen);
    } else {
      const sy = 0.12 + mo.h / 2 + 0.02;
      mg.add(box(0.2, 0.015, 0.14, BEZEL, 0, 0, 0)); mg.add(box(0.04, sy - 0.04, 0.03, '#2b2f36', 0, 0, -0.03));
      if (mo.kind === 'curved') {
        const R = mo.w * 1.1, ang = mo.w / R;
        const geo = new THREE.CylinderGeometry(R, R, mo.h, 24, 1, true, Math.PI - ang / 2, ang);
        const back = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.02, R + 0.02, mo.h + 0.03, 24, 1, true, Math.PI - ang / 2, ang), new THREE.MeshLambertMaterial({ color: BEZEL, side: THREE.DoubleSide }));
        screen = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false, side: THREE.BackSide }));
        ct.tex.wrapS = THREE.RepeatWrapping; ct.tex.repeat.x = -1;
        for (const m of [screen, back]) { m.position.set(0, sy, R - 0.02); mg.add(m); }
      } else {
        mg.add(box(mo.w + 0.03, mo.h + 0.03, 0.03, BEZEL, 0, sy - (mo.h + 0.03) / 2, -0.01));
        screen = new THREE.Mesh(new THREE.PlaneGeometry(mo.w, mo.h), smat); screen.position.set(0, sy, 0.007); mg.add(screen);
      }
      mg.add(box(mo.w * 0.6, 0.012, 0.01, accent, 0, sy - mo.h / 2 - 0.03, -0.03, false)); // backlight strip
    }
    const paint = PAINT[st.screenTheme]; let last = -1; const sd = seed * 7 + i;
    updaters.push((t) => { if (t - last < 0.2) return; last = t; paint(ct.ctx, cw, ch, t, accent, sd); ct.tex.needsUpdate = true; });
  });
  // tower
  const tw = st.tower, tx = W / 2 - 0.3;
  const tcol = tw.kind === 'aluminum' ? '#c7ccd3' : tw.kind === 'lab' ? '#f1f5f9' : '#15171b';
  const th = tw.kind === 'slim' ? 0.42 : 0.58;
  g.add(box(0.24, th, 0.5, tcol, tx, 0, -0.15));
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.4, th - 0.08), new THREE.MeshLambertMaterial({ color: '#0b0d10', transparent: true, opacity: 0.55 }));
  panel.rotation.y = -Math.PI / 2; panel.position.set(tx - 0.121, th / 2, -0.15); g.add(panel);
  g.add(box(0.01, th - 0.12, 0.012, tw.led, tx - 0.11, 0.06, 0.1, false));
  const led = box(0.006, 0.02, 0.4, tw.led, tx - 0.123, th - 0.06, -0.15, false); (led.material as any) = em(tw.led); g.add(led);
  if (tw.kind === 'gaming') for (const fy of [0.15, 0.36]) { const f = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 16), em(tw.led)); f.rotation.y = Math.PI / 2; f.position.set(tx - 0.125, fy, -0.15); g.add(f); }
  if (tw.kind === 'lab') { const v = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 10), new THREE.MeshLambertMaterial({ color: tw.led, transparent: true, opacity: 0.6 })); v.position.set(tx, th + 0.1, -0.15); g.add(v); }
  // underglow strip + light
  const strip = new THREE.Mesh(new THREE.BoxGeometry(W - 0.2, 0.012, 0.03), em(st.underglow)); strip.position.set(0, H - 0.03, 0.47); g.add(strip);
  const strip2 = strip.clone(); strip2.position.z = -0.47; g.add(strip2);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.6, 1.6), new THREE.MeshBasicMaterial({ color: st.underglow, transparent: true, opacity: 0.16, depthWrite: false }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = 0.02; g.add(glow);
  const pl = new THREE.PointLight(st.underglow, 0.5, 3, 2); pl.position.set(0, 0.35, 0); g.add(pl);
  updaters.push((t) => { (glow.material as THREE.MeshBasicMaterial).opacity = 0.12 + 0.05 * Math.sin(t * 1.3 + seed); });
  // pendant
  const cord = box(0.01, 1.2, 0.01, '#1f2328', 0, 2.5, 0.1, false); g.add(cord);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.18, 16), matte('#1f2328')); cap.position.set(0, 2.45, 0.1); g.add(cap);
  const bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.015, 16), em('#fff3d1')); bulb.position.set(0, 2.355, 0.1); g.add(bulb);
  // props
  st.props.forEach((p, i) => { const o = prop(p, accent); o.position.set(i ? -W / 2 + 0.25 : W / 2 - 0.25, ty, i ? 0.05 : 0.3); if (i === 0 && st.desk.shape !== 'l') o.position.set(-W / 2 + 0.55, ty, 0.3); g.add(o); });
  // chair (skip for standing desk w/ stool: still add, it's a high stool)
  const c = chair(st.chair, accent); c.position.set(0, 0, 0.75); if (st.desk.shape === 'standing' && st.chair === 'stool') c.scale.y = 1.25; g.add(c);
  return { g, update: (t: number) => updaters.forEach((u) => u(t)) };
}
