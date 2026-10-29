import * as THREE from 'three';
import { box } from '../office/materials';
/** Per-bot body identity (low-poly add-ons). Keyed by TeamMember.short. Add one for every new bot. */
type Adder = (body: THREE.Group, head: THREE.Object3D, col: string, arms: [THREE.Object3D, THREE.Object3D], legs: [THREE.Object3D, THREE.Object3D]) => void;
const shoes = (legs: [THREE.Object3D, THREE.Object3D], c: string) => legs.forEach((l) => l.add(box(0.18, 0.07, 0.24, c, 0, -0.42, 0.03, false)));
export const BOT_STYLES: Record<string, Adder> = {
  Alfred(b, _h, _c, _a, l) { b.add(box(0.46, 0.4, 0.04, '#1f2937', 0, 0.48, 0.12)); b.add(box(0.08, 0.3, 0.02, '#f8fafc', 0, 0.56, 0.145)); b.add(box(0.04, 0.2, 0.01, '#b91c1c', 0, 0.62, 0.152)); shoes(l, '#111'); },
  'niẓām'(b, _h, _c, a, l) { b.add(box(0.5, 0.62, 0.3, '#262a30', 0, 0.3, 0)); a.forEach((x) => x.add(box(0.14, 0.3, 0.16, '#262a30', 0, -0.3, 0))); b.add(box(0.36, 0.06, 0.32, '#3a3f46', 0, 1.24, 0)); shoes(l, '#3a3f46'); },
  NSU(b, _h, c, _a, l) { b.add(box(0.36, 0.12, 0.32, '#1e3a8a', 0, 1.22, 0)); b.add(box(0.1, 0.08, 0.1, '#f8fafc', 0, 1.34, 0)); b.add(box(0.04, 0.5, 0.02, '#78350f', 0.12, 0.42, 0.135)); shoes(l, '#f8fafc'); void c; },
  Lamar(b, _h, _c, a, l) { b.add(box(0.04, 0.42, 0.04, '#3f5b57', -0.15, 0.44, 0.13), box(0.04, 0.42, 0.04, '#3f5b57', 0.15, 0.44, 0.13)); b.add(box(0.36, 0.08, 0.32, '#0f766e', 0, 1.24, 0.02)); b.add(box(0.36, 0.02, 0.14, '#0f766e', 0, 1.24, 0.2)); shoes(l, '#e5e7eb'); void a; },
  Victoria(b, _h, _c, a, l) { b.add(box(0.5, 0.5, 0.3, '#4c1d95', 0, 0.42, 0)); b.add(box(0.56, 0.06, 0.32, '#4c1d95', 0, 0.86, 0)); b.add(box(0.1, 0.3, 0.02, '#f5f3ff', 0, 0.56, 0.155)); b.add(box(0.36, 0.14, 0.12, '#2e1065', 0, 1.12, -0.17)); a.forEach((x) => x.add(box(0.14, 0.36, 0.16, '#4c1d95', 0, -0.38, 0))); shoes(l, '#111'); },
  Mentor(b, _h, _c, _a, l) { b.add(box(0.4, 0.1, 0.32, '#15803d', 0, 0.84, 0)); b.add(box(0.1, 0.3, 0.04, '#15803d', 0.1, 0.56, 0.15)); b.add(box(0.14, 0.04, 0.02, '#e5e7eb', -0.08, 1.02, 0.16), box(0.14, 0.04, 0.02, '#e5e7eb', 0.08, 1.02, 0.16)); shoes(l, '#78350f'); },
  Fitness(b, _h, _c, a, l) { b.add(box(0.36, 0.05, 0.32, '#fde047', 0, 1.14, 0)); a.forEach((x) => x.add(box(0.14, 0.05, 0.16, '#fde047', 0, -0.38, 0))); b.add(box(0.46, 0.06, 0.28, '#111', 0, 0.42, 0)); shoes(l, '#ef4444'); },
  Mibot(b, _h, _c, a, l) { b.add(box(0.48, 0.5, 0.3, '#1f2937', 0, 0.42, 0)); b.add(box(0.4, 0.34, 0.34, '#1f2937', 0, 0.94, -0.03)); b.add(box(0.26, 0.14, 0.04, '#22d3ee', 0, 0.5, 0.155)); a.forEach((x) => x.add(box(0.14, 0.4, 0.16, '#1f2937', 0, -0.4, 0))); shoes(l, '#22d3ee'); },
  'Ram-Hunt'(b, _h, _c, _a, l) { const v = box(0.36, 0.08, 0.05, '#22d3ee', 0, 1.04, 0.16, false); (v.material as any) = new THREE.MeshBasicMaterial({ color: '#f0abfc', toneMapped: false }); b.add(v); b.add(box(0.04, 0.14, 0.04, '#475569', 0.14, 1.24, 0)); b.add(box(0.46, 0.08, 0.28, '#4a044e', 0, 0.34, 0)); shoes(l, '#111'); },
  eggbot(b, _h, _c, a, l) { b.add(box(0.48, 0.66, 0.3, '#f8fafc', 0, 0.26, 0)); b.add(box(0.04, 0.6, 0.01, '#ef4444', 0, 0.3, 0.153)); a.forEach((x) => x.add(box(0.14, 0.38, 0.16, '#f8fafc', 0, -0.38, 0))); b.add(box(0.36, 0.04, 0.32, '#f8fafc', 0, 1.24, 0)); shoes(l, '#64748b'); },
  SWE(b, _h, _c, a, l) { b.add(box(0.5, 0.56, 0.3, '#0c4a6e', 0, 0.4, 0)); b.add(box(0.4, 0.3, 0.34, '#0c4a6e', 0, 0.98, -0.05)); b.add(box(0.04, 0.22, 0.02, '#e0f2fe', -0.08, 0.66, 0.155), box(0.04, 0.22, 0.02, '#e0f2fe', 0.08, 0.66, 0.155)); a.forEach((x) => x.add(box(0.14, 0.4, 0.16, '#0c4a6e', 0, -0.4, 0))); shoes(l, '#f8fafc'); },
};
