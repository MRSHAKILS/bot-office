import * as THREE from 'three';
import { canvasTexture, box } from './materials';
export function usageBoard(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  const t = canvasTexture(1024, 512, () => {}, renderer, false);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.8), new THREE.MeshBasicMaterial({ map: t.tex, toneMapped: false }));
  m.position.set(1, 1.5, -13.97); scene.add(box(3.8, 2.0, 0.05, '#1c1f24', 1, 0.5, -14.0, false)); scene.add(m);
  function set(usage?: { remaining: number | string; resetAt: string }) {
    const c = t.ctx; c.fillStyle = '#ffffff'; c.fillRect(0, 0, 1024, 512); c.fillStyle = '#2563eb'; c.fillRect(0, 0, 1024, 10);
    c.fillStyle = '#6b7280'; c.font = '600 40px Inter, system-ui'; c.fillText('WEEKLY USAGE LEFT', 56, 92);
    c.fillStyle = '#111827';
    if (!usage) { c.font = '600 64px system-ui'; c.fillText('No reading yet', 50, 260); }
    else {
      const rem = typeof usage.remaining === 'number' ? `${Math.round(usage.remaining)}%` : usage.remaining;
      c.font = '700 170px Inter, system-ui'; c.fillText(rem, 50, 290);
      const d = new Date(usage.resetAt);
      const txt = isNaN(+d) ? usage.resetAt : d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      c.font = '500 42px Inter, system-ui'; c.fillStyle = '#6b7280'; c.fillText('Resets ' + txt, 50, 420);
    }
    t.tex.needsUpdate = true;
  }
  set(); return { set };
}
