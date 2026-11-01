import * as THREE from 'three';
import { box, canvasTexture } from './materials';
/**
 * Sparse gallery — the four selected public project titles only.
 * Sized for default isometric camera (~60u away): large frames, no mipmaps,
 * MeshBasicMaterial so lighting doesn't wash letterforms.
 * Source: mrshakils.vercel.app / public GitHub. Four selected projects; no tech-stack panels.
 */
interface Piece {
  title: string;
  lines?: string[];
  kicker: string;
  accent: string;
  wall: 'north' | 'west';
  at: number;
  w: number;
  h: number;
}
const PIECES: Piece[] = [
  { title: 'Baki', kicker: 'PROJECT', accent: '#5b7fa6', wall: 'north', at: -8.2, w: 4.2, h: 2.2 },
  { title: 'S-Quiz', kicker: 'PROJECT', accent: '#b08a5a', wall: 'north', at: 7.6, w: 3.6, h: 2.2 },
  { title: 'The Possession', kicker: 'PROJECT', accent: '#6f8f6a', wall: 'west', at: 1.2, w: 4.2, h: 2.2 },
  { title: 'Silk Atlas', kicker: 'PROJECT', accent: '#b08a5a', wall: 'west', at: 6.2, w: 4.2, h: 2.2 },
];

function paint(c: CanvasRenderingContext2D, W: number, H: number, p: Piece) {
  c.fillStyle = '#faf8f3'; c.fillRect(0, 0, W, H);
  c.fillStyle = p.accent; c.fillRect(0, 0, W, Math.max(18, H * 0.05));

  c.fillStyle = '#7a8088';
  const kickFs = Math.round(H * 0.09);
  c.font = `700 ${kickFs}px Inter, system-ui, sans-serif`;
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.fillText(p.kicker, W * 0.07, H * 0.2);

  c.fillStyle = '#12151a';
  if (p.lines?.length) {
    let fs = H * 0.2;
    c.font = `700 ${Math.round(fs)}px Inter, system-ui, sans-serif`;
    let y = H * 0.4;
    for (const line of p.lines) {
      while (c.measureText(line).width > W * 0.86 && fs > 28) {
        fs -= 3; c.font = `700 ${Math.round(fs)}px Inter, system-ui, sans-serif`;
      }
      c.fillText(line, W * 0.07, y); y += fs * 1.22;
    }
  } else {
    let fs = H * 0.32;
    c.font = `700 ${Math.round(fs)}px Inter, system-ui, sans-serif`;
    const maxW = W * 0.86;
    const words = p.title.split(' ');
    let line1 = p.title, line2 = '';
    if (c.measureText(p.title).width > maxW && words.length > 1) {
      // prefer split before last word
      line1 = words.slice(0, -1).join(' ');
      line2 = words[words.length - 1];
    }
    while (c.measureText(line1).width > maxW && fs > 36) {
      fs -= 3; c.font = `700 ${Math.round(fs)}px Inter, system-ui, sans-serif`;
    }
    if (line2) {
      while (c.measureText(line2).width > maxW && fs > 36) {
        fs -= 3; c.font = `700 ${Math.round(fs)}px Inter, system-ui, sans-serif`;
      }
    }
    const y0 = line2 ? H * 0.52 : H * 0.62;
    c.fillText(line1, W * 0.07, y0);
    if (line2) c.fillText(line2, W * 0.07, y0 + fs * 1.12);
  }
}

export function wallArt(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  const pxPerUnit = 320; // denser than carpets so glyphs survive distance
  for (const p of PIECES) {
    const pxW = Math.round(p.w * pxPerUnit);
    const pxH = Math.round(p.h * pxPerUnit);
    // no mipmaps — same crisp path as floor zone letters
    const { tex } = canvasTexture(pxW, pxH, (c) => paint(c, pxW, pxH, p), renderer, false);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;

    const g = new THREE.Group();
    g.add(box(p.w + 0.16, p.h + 0.16, 0.08, '#5c5750', 0, -(p.h + 0.16) / 2, 0));
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(p.w, p.h),
      new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }),
    );
    art.position.z = 0.042; g.add(art);
    // hang mid-wall height so frames clear desks but stay in default frustum
    if (p.wall === 'north') g.position.set(p.at, 2.4, -13.96);
    else { g.position.set(-19.96, 2.4, p.at); g.rotation.y = Math.PI / 2; }
    scene.add(g);
  }
}
