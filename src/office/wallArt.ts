import * as THREE from 'three';
import { box, canvasTexture } from './materials';
/**
 * Sparse gallery wall art — public portfolio project titles + stack wordmarks only
 * (source: mrshakils.vercel.app / public GitHub). No contact info, numbers, or unpublished work.
 * Max 6 pieces; generous empty wall between them.
 */
type Motif = 'orbit' | 'grid' | 'leaf' | 'wave' | 'stack';
interface Piece { title: string; kicker: string; motif: Motif; accent: string; wall: 'north' | 'west'; at: number; w: number; h: number; }
const PIECES: Piece[] = [
  { title: 'MathScriber AI', kicker: 'PROJECT', motif: 'wave', accent: '#5b7fa6', wall: 'north', at: -7.4, w: 1.9, h: 1.3 },
  { title: 'Gargantua', kicker: 'PROJECT', motif: 'orbit', accent: '#b08a5a', wall: 'north', at: 6.6, w: 1.6, h: 1.6 },
  { title: 'React · Next.js · PyTorch', kicker: 'STACK', motif: 'stack', accent: '#6b7f8e', wall: 'north', at: 10.6, w: 1.2, h: 1.6 },
  { title: 'ChashiBhAI', kicker: 'PROJECT', motif: 'leaf', accent: '#6f8f6a', wall: 'west', at: 0.4, w: 1.9, h: 1.3 },
  { title: 'FastAPI · Cloudflare · Three.js', kicker: 'STACK', motif: 'grid', accent: '#8a7d9e', wall: 'west', at: 11.2, w: 1.2, h: 1.6 },
];

function paint(c: CanvasRenderingContext2D, W: number, H: number, p: Piece) {
  c.fillStyle = '#f6f3ec'; c.fillRect(0, 0, W, H); // mat
  const m = W * 0.12, iw = W - 2 * m, ih = H * 0.62; // art window w/ big margins
  c.fillStyle = '#ece7dc'; c.fillRect(m, m, iw, ih);
  c.save(); c.beginPath(); c.rect(m, m, iw, ih); c.clip();
  c.strokeStyle = p.accent; c.fillStyle = p.accent; c.lineWidth = W * 0.008;
  const cx = m + iw / 2, cy = m + ih / 2;
  if (p.motif === 'orbit') { c.globalAlpha = 0.85; c.beginPath(); c.arc(cx, cy, ih * 0.16, 0, 7); c.fillStyle = '#1f2328'; c.fill(); for (let i = 0; i < 5; i++) { c.globalAlpha = 0.55 - i * 0.09; c.beginPath(); c.ellipse(cx, cy, ih * (0.26 + i * 0.07), ih * (0.07 + i * 0.02), -0.25, 0, 7); c.stroke(); } }
  if (p.motif === 'wave') { for (let k = 0; k < 4; k++) { c.globalAlpha = 0.8 - k * 0.17; c.beginPath(); for (let x = 0; x <= iw; x += 4) { const y = cy + Math.sin(x / iw * Math.PI * (2 + k * 0.5) + k) * ih * (0.18 - k * 0.03); x ? c.lineTo(m + x, y) : c.moveTo(m + x, y); } c.stroke(); } c.globalAlpha = 0.6; c.font = `300 ${ih * 0.22}px Georgia, serif`; c.fillStyle = '#3a3f46'; c.fillText('∫ ∑ ∂', m + iw * 0.1, m + ih * 0.3); }
  if (p.motif === 'leaf') { c.globalAlpha = 0.85; for (let i = 0; i < 3; i++) { c.save(); c.translate(cx + (i - 1) * iw * 0.2, cy + ih * 0.15); c.rotate((i - 1) * 0.5); c.beginPath(); c.ellipse(0, -ih * 0.18, ih * 0.08, ih * 0.22, 0, 0, 7); c.fill(); c.restore(); } c.globalAlpha = 0.4; c.fillRect(m, cy + ih * 0.3, iw, ih * 0.04); }
  if (p.motif === 'grid' || p.motif === 'stack') { for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) { c.globalAlpha = ((i * 5 + j) * 37 % 10) / 22 + 0.12; const s = iw / 5.4; c.fillRect(m + iw * 0.08 + i * s * 1.2, m + ih * 0.08 + j * s * 1.05, s, s * 0.8); } }
  c.restore(); c.globalAlpha = 1;
  c.fillStyle = '#8a8f96'; c.font = `600 ${W * 0.035}px Inter, system-ui, sans-serif`; (c as any).letterSpacing = `${Math.round(W * 0.008)}px`;
  c.fillText(p.kicker, m, m + ih + H * 0.08);
  (c as any).letterSpacing = '0px'; c.fillStyle = '#23272e';
  let fs = W * 0.075; c.font = `600 ${fs}px Inter, system-ui, sans-serif`;
  while (c.measureText(p.title).width > iw && fs > 10) { fs -= 2; c.font = `600 ${fs}px Inter, system-ui, sans-serif`; }
  c.fillText(p.title, m, m + ih + H * 0.08 + fs * 1.3);
}

export function wallArt(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  for (const p of PIECES.slice(0, 6)) {
    const pxW = 768, pxH = Math.round(768 * p.h / p.w);
    const { tex } = canvasTexture(pxW, pxH, (c) => paint(c, pxW, pxH, p), renderer);
    const g = new THREE.Group();
    g.add(box(p.w + 0.12, p.h + 0.12, 0.06, '#5c5750', 0, -(p.h + 0.12) / 2, 0)); // muted walnut-grey frame
    const art = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }));
    art.position.z = 0.032; g.add(art);
    g.position.y = 2.05;
    if (p.wall === 'north') g.position.set(p.at, 2.05, -13.96);
    else { g.position.set(-19.96, 2.05, p.at); g.rotation.y = Math.PI / 2; }
    scene.add(g);
  }
}
