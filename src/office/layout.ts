import * as THREE from 'three';
export interface Zone { dept: string; x: number; z: number; }
// 3x3 department grid + an east Software zone (own carpet, no shared desks). Each zone is 6 wide x 5 deep, centred on (x,z).
export const ZONES: Record<string, Zone> = {
  'Life': { dept: 'Life', x: -6, z: -10 }, 'School NSU': { dept: 'School NSU', x: 1, z: -10 }, 'School Uni': { dept: 'School Uni', x: 8, z: -10 },
  'Deadlines': { dept: 'Deadlines', x: -6, z: -3 }, 'Growth': { dept: 'Growth', x: 1, z: -3 }, 'Health': { dept: 'Health', x: 8, z: -3 },
  'Engineering': { dept: 'Engineering', x: -6, z: 4 }, 'Hardware': { dept: 'Hardware', x: 1, z: 4 }, 'Bot Lab': { dept: 'Bot Lab', x: 8, z: 4 },
  'Software': { dept: 'Software', x: 16.8, z: 4 },
};
/** Floor slab extents (expanded east + south for the Software zone and breathing room). */
export const FLOOR_BOUNDS = { x0: -20, x1: 22, z0: -14, z1: 15 };
export const LEAD_OFFICE = { x0: -20, x1: -12, z0: -14, z1: -7 };
export const LEAD_SEAT = new THREE.Vector3(-16, 0, -10.6);
export const HANDOFF_POINT = new THREE.Vector3(-14.6, 0, -9.2);
export const LEAD_DOOR = new THREE.Vector3(-11.2, 0, -8.2);
export const AISLES_Z = [-6.5, 0.5, 7.5];
export const CORRIDORS_X = [-9.8, -2.5, 4.5, 11.5, 20.6];
export const LOUNGE_SEATS: THREE.Vector3[] = [];
// two sofas facing a coffee table (lounge occupies x -20..-12, z 1..14)
for (let i = 0; i < 6; i++) LOUNGE_SEATS.push(new THREE.Vector3(-18.7 + i * 1.0, 0, 4.2));
for (let i = 0; i < 5; i++) LOUNGE_SEATS.push(new THREE.Vector3(-18.6 + i * 1.2, 0, 9.4));
type Seated = { dept: string; seatOffset?: { x: number; z: number } };
/** Zone origin for this member's station (shared zones use seatOffset for a second desk row). */
export function deskOrigin(m: Seated) { const z = ZONES[m.dept], o = m.seatOffset ?? { x: 0, z: 0 }; return { x: z.x + o.x, z: z.z + o.z }; }
export function deskSeat(m: Seated) { const o = deskOrigin(m); return new THREE.Vector3(o.x, 0, o.z + 0.15); }
export function deskEntry(m: Seated) { const o = deskOrigin(m); return new THREE.Vector3(o.x + 2.6, 0, o.z + 0.15); }
