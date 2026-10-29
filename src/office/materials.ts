import * as THREE from 'three';
const cache = new Map<string, THREE.MeshLambertMaterial>();
/** Flat, matte material (Lambert: no specular → no shimmer). */
export function matte(color: string | number): THREE.MeshLambertMaterial {
  const k = String(color);
  let m = cache.get(k);
  if (!m) { m = new THREE.MeshLambertMaterial({ color }); cache.set(k, m); }
  return m;
}
export function box(w: number, h: number, d: number, color: string | number, x = 0, y = 0, z = 0, shadow = true): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matte(color));
  m.position.set(x, y + h / 2, z);
  m.castShadow = shadow; m.receiveShadow = true;
  return m;
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
