import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
const cache = new Map<string, THREE.MeshStandardMaterial>();
/** Matte PBR material (high roughness, no metal → soft product-viz sheen, no shimmer). Roughness varies slightly per colour. */
export function matte(color: string | number, rough?: number): THREE.MeshStandardMaterial {
  const k = String(color) + '|' + (rough ?? '');
  let m = cache.get(k);
  if (!m) {
    const c = new THREE.Color(color as any); const r = rough ?? 0.72 + (((c.r * 7 + c.g * 13 + c.b * 3) * 100) % 1) * 0.16;
    m = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 0 }); cache.set(k, m);
  }
  return m;
}
const geoCache = new Map<string, THREE.BufferGeometry>();
/** Box with softly bevelled edges (cached by size). Very thin panels stay sharp boxes. */
export function softBoxGeo(w: number, h: number, d: number) {
  const k = `${w}|${h}|${d}`; let g = geoCache.get(k);
  if (!g) {
    const min = Math.min(w, h, d);
    g = min < 0.03 ? new THREE.BoxGeometry(w, h, d) : new RoundedBoxGeometry(w, h, d, 2, Math.min(min * 0.22, 0.06));
    geoCache.set(k, g);
  }
  return g;
}
export function box(w: number, h: number, d: number, color: string | number, x = 0, y = 0, z = 0, shadow = true): THREE.Mesh {
  const m = new THREE.Mesh(softBoxGeo(w, h, d), matte(color));
  m.position.set(x, y + h / 2, z);
  m.castShadow = shadow; m.receiveShadow = true;
  return m;
}
/** Capsule limb hanging down from its pivot (top at y=0). */
export function limb(r: number, len: number, color: string | number, x = 0, y = 0, z = 0, rough?: number) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, len - 2 * r), 4, 12), matte(color, rough));
  m.position.set(x, y - len / 2, z); m.castShadow = true; return m;
}
export function canvasTexture(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, renderer?: THREE.WebGLRenderer, mips = true) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d')!; draw(ctx);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.generateMipmaps = mips; t.minFilter = mips ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter; t.magFilter = THREE.LinearFilter;
  if (renderer) t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return { tex: t, ctx, canvas: cv };
}
