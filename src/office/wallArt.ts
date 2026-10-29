import * as THREE from 'three';
import { box, canvasTexture } from './materials';
/**
 * Sparse gallery wall art — public portfolio titles + stack wordmarks only.
 * Titles must read at default isometric distance: big type, little ornament.
 * No contact info, numbers, or unpublished work. Max 6 pieces.
 */
type Motif = 'orbit' | 'wave' | 'leaf' | 'bars' | 'none';
interface Piece { title: string; lines?: string[]; kicker: string; motif: Motif; accent: string; wall: 'north' | 'west'; at: number; w: number; h: number; }
const PIECES: Piece[] = [
  { title: 'MathScriber AI', kicker: 'PROJECT', motif: 'wave', accent: '#5b7fa6', wall: 'north', at: -7.4, w: 2.4, h: 1.5 },
  { title: 'Gargantua', kicker: 'PROJECT', motif: 'orbit', accent: '#b08a5a', wall: 'north', at: 6.2, w: 2.0, h: 1.5 },
  { title: 'Stack', lines: ['React', 'Next.js', 'PyTorch'], kicker: 'STACK', motif: 'bars', accent: '#6b7f8e', wall: 'north', at: 11.0, w: 1.6, h: 1.8 },
  { title: 'ChashiBhAI', kicker: 'PROJECT', motif: 'leaf', accent: '#6f8f6a', wall: 'west', at: 0.4, w: 2.4, h: 1.5 },
  { title: 'Stack', lines: ['FastAPI', 'Cloudflare', 'Three.js'], kicker: 'STACK', motif: 'bars', accent: '#8a7d9e', wall: 'west', at: 11.2, w: 1.6, h: 1.8 },
];

function paint(c: CanvasRenderingContext2D, W: number, H: number, p: Piece) {
  c.fillStyle = '#f7f5f0'; c.fillRect(0, 0, W, H);
  // Accent bar top
  c.fillStyle = p.accent; c.fillRect(0, 0, W, H * 0.045);
  // Tiny motif top-right (never compete with title)
  c.save(); c.globalAlpha = 0.35; c.strokeStyle = p.accent; c.fillStyle = p.accent; c.lineWidth = W * 0.006;
  const mx = W * 0.82, my = H * 0.22;
  if (p.motif === 'orbit') { c.beginPath(); c.arc(mx, my, H * 0.06, 0, 7); c.stroke(); c.beginPath(); c.ellipse(mx, my, H * 0.11, H * 0.035, -0.4, 0, 7); c.stroke(); }
  if (p.motif === 'wave') { c.beginPath(); for (let x = 0; x < W * 0.28; x += 3) { const y = my + Math.sin(x / 18) * H * 0.04; x ? c.lineTo(mx - W * 0.14 + x, y) : c.moveTo(mx - W * 0.14 + x, y); } c.stroke(); }
  if (p.motif === 'leaf') { c.beginPath(); c.ellipse(mx, my, H * 0.035, H * 0.08, 0.4, 0, 7); c.fill(); }
  if (p.motif === 'bars') { for (let i = 0; i < 3; i++) c.fillRect(mx - H * 0.08 + i * H * 0.06, my + H * 0.04 - i * H * 0.03, H * 0.04, H * 0.02 + i * H * 0.03); }
  c.restore();

  // Kicker
  c.fillStyle = '#8a8f96';
  c.font = `700 ${Math.round(H * 0.07)}px Inter, system-ui, sans-serif`;
  c.fillText(p.kicker, W * 0.08, H * 0.22);

  // Title — dominate the frame
  c.fillStyle = '#1a1d23';
  if (p.lines?.length) {
    let fs = H * 0.16;
    c.font = `650 ${Math.round(fs)}px Inter, system-ui, sans-serif`;
    let y = H * 0.42;
    for (const line of p.lines) {
      while (c.measureText(line).width > W * 0.84 && fs > 18) { fs -= 2; c.font = `650 ${Math.round(fs)}px Inter, system-ui, sans-serif`; }
      c.fillText(line, W * 0.08, y); y += fs * 1.25;
    }
  } else {
    let fs = H * 0.22;
    c.font = `650 ${Math.round(fs)}px Inter, system-ui, sans-serif`;
    // wrap to 2 lines if needed
    const maxW = W * 0.84;
    const words = p.title.split(' ');
    let line1 = p.title, line2 = '';
    if (c.measureText(p.title).width > maxW && words.length > 1) {
      line1 = words.slice(0, -1).join(' '); line2 = words[words.length - 1];
      while (c.measureText(line1).width > maxW && fs > 22) { fs -= 2; c.font = `650 ${Math.round(fs)}px Inter, system-ui, sans-serif`; }
    } else {
      while (c.measureText(p.title).width > maxW && fs > 22) { fs -= 2; c.font = `650 ${Math.round(fs)}px Inter, system-ui, sans-serif`; }
    }
    const y0 = line2 ? H * 0.48 : H * 0.55;
    c.fillText(line1, W * 0.08, y0);
    if (line2) c.fillText(line2, W * 0.08, y0 + fs * 1.15);
  }
}

export function wallArt(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  for (const p of PIECES.slice(0, 6)) {
    const pxW = 1024, pxH = Math.round(1024 * p.h / p.w);
    const { tex } = canvasTexture(pxW, pxH, (c) => paint(c, pxW, pxH, p), renderer);
    const g = new THREE.Group();
    g.add(box(p.w + 0.14, p.h + 0.14, 0.07, '#5c5750', 0, -(p.h + 0.14) / 2, 0));
    const art = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88 }));
    art.position.z = 0.036; g.add(art);
    g.position.y = 2.15;
    if (p.wall === 'north') g.position.set(p.at, 2.15, -13.96);
    else { g.position.set(-19.96, 2.15, p.at); g.rotation.y = Math.PI / 2; }
    scene.add(g);
  }
}
