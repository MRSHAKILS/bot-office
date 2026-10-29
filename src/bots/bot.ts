import * as THREE from 'three';
import { box, matte } from '../office/materials';
import type { TeamMember, Accessory } from './team';
import type { BotState } from '../api/status';
import { AISLES_Z, CORRIDORS_X, deskEntry, deskSeat, HANDOFF_POINT, LEAD_DOOR, LEAD_SEAT } from '../office/layout';

const SPEED = 5.5; // units / s

function accessoryMesh(a: Accessory, color: string): THREE.Object3D {
  const c = '#e5e0d6';
  switch (a) {
    case 'clipboard': return box(0.22, 0.3, 0.03, '#8a6a4f');
    case 'calendar': return box(0.24, 0.24, 0.04, c);
    case 'book': return box(0.24, 0.3, 0.08, '#2f4f7a');
    case 'backpack': return box(0.36, 0.42, 0.18, '#3f5b57');
    case 'clock': { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 16), matte(c)); m.rotation.x = Math.PI / 2; return m; }
    case 'marker': return box(0.05, 0.24, 0.05, '#1f6f3f');
    case 'bottle': return box(0.1, 0.28, 0.1, '#4a90b0');
    case 'laptop': return box(0.34, 0.03, 0.24, '#555b63');
    case 'ram': return box(0.32, 0.08, 0.02, '#2f6b3b');
    case 'flask': { const m = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 8), matte('#9dc7c2')); return m; }
  }
  void color; return new THREE.Group();
}

type Place = 'lounge' | 'desk' | 'handoff';
export class Bot {
  group = new THREE.Group();
  private legL: THREE.Object3D; private legR: THREE.Object3D; private armL: THREE.Object3D; private armR: THREE.Object3D;
  private body: THREE.Group; private parcel: THREE.Mesh;
  path: THREE.Vector3[] = []; place: Place = 'lounge'; seated = true; facing = 0;
  state: BotState = 'idle'; statusLine = ''; private walkT = 0; private handoffUntil = 0; private wantDesk = false;
  readonly head = new THREE.Object3D();
  m: TeamMember; loungeSeat: THREE.Vector3;
  constructor(m: TeamMember, loungeSeat: THREE.Vector3) {
    this.m = m; this.loungeSeat = loungeSeat;
    const col = m.color;
    this.body = new THREE.Group(); this.group.add(this.body);
    const mk = (w: number, h: number, d: number, x: number, y: number, z: number, c = col) => { const g = new THREE.Group(); const b = box(w, h, d, c, 0, -h, 0); g.add(b); g.position.set(x, y, z); return g; };
    this.legL = mk(0.16, 0.42, 0.18, -0.1, 0.42, 0); this.legR = mk(0.16, 0.42, 0.18, 0.1, 0.42, 0);
    this.body.add(this.legL, this.legR);
    this.body.add(box(0.44, 0.48, 0.26, col, 0, 0.42, 0));
    this.body.add(box(0.34, 0.32, 0.3, col, 0, 0.92, 0));
    this.body.add(box(0.06, 0.06, 0.02, '#20242a', -0.08, 1.08, 0.155, false), box(0.06, 0.06, 0.02, '#20242a', 0.08, 1.08, 0.155, false));
    if (m.color === '#1a1a1a') this.body.add(box(0.06, 0.06, 0.02, '#d9d4ca', -0.08, 1.08, 0.156, false), box(0.06, 0.06, 0.02, '#d9d4ca', 0.08, 1.08, 0.156, false));
    this.armL = mk(0.12, 0.42, 0.14, -0.29, 0.88, 0); this.armR = mk(0.12, 0.42, 0.14, 0.29, 0.88, 0);
    this.body.add(this.armL, this.armR);
    const acc = accessoryMesh(m.accessory, col);
    if (m.accessory === 'backpack') { acc.position.set(0, 0.48, -0.22); this.body.add(acc); }
    else { acc.position.set(0.02, -0.42, 0.1); this.armR.add(acc); }
    this.parcel = box(0.3, 0.22, 0.24, '#b89a6a', 0, -0.3, 0.26); this.parcel.visible = false; this.armL.add(this.parcel);
    this.head.position.set(0, 1.35, 0); this.group.add(this.head);
    this.group.position.copy(loungeSeat); this.applyPose(true);
    this.face(loungeSeat.z < 7 ? 0 : Math.PI);
  }
  private face(a: number) { this.facing = a; this.group.rotation.y = a; }
  private applyPose(sit: boolean) {
    this.seated = sit;
    this.body.position.y = sit ? -0.12 : 0;
    const r = sit ? -Math.PI / 2 : 0; this.legL.rotation.x = r; this.legR.rotation.x = r;
    this.armL.rotation.x = sit ? -0.5 : 0; this.armR.rotation.x = sit ? -0.5 : 0;
  }
  private route(to: THREE.Vector3, toLead = false) {
    const from = this.group.position.clone();
    const nearest = (arr: number[], v: number) => arr.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a);
    const pts: THREE.Vector3[] = [];
    const exitLead = from.x < -12 && from.z < -7, enterLead = toLead || (to.x < -12 && to.z < -7);
    let cur = from.clone();
    if (exitLead) { pts.push(new THREE.Vector3(HANDOFF_POINT.x, 0, -8.2), LEAD_DOOR.clone()); cur = LEAD_DOOR.clone(); }
    else if (cur.x < -12) { const p = new THREE.Vector3(cur.x, 0, 5.3); pts.push(p, new THREE.Vector3(-11, 0, 5.3)); cur = new THREE.Vector3(-11, 0, 5.3); }
    else if (cur.z > -7.5) { const az = nearest(AISLES_Z, cur.z); const p = new THREE.Vector3(cur.x + (Math.abs(cur.z - az) > 1 ? 2.6 : 0), 0, cur.z); if (p.x !== cur.x) pts.push(p); pts.push(new THREE.Vector3(p.x, 0, az)); cur = new THREE.Vector3(p.x, 0, az); }
    else { const p = new THREE.Vector3(cur.x + 2.6, 0, cur.z); pts.push(p, new THREE.Vector3(p.x, 0, -6.5)); cur = new THREE.Vector3(p.x, 0, -6.5); }
    // travel along corridor to target's aisle
    const targetAisle = enterLead ? -6.5 : to.x < -12 ? 5.3 : nearest(AISLES_Z, to.z);
    const corr = nearest(CORRIDORS_X, cur.x);
    pts.push(new THREE.Vector3(corr, 0, cur.z), new THREE.Vector3(corr, 0, targetAisle));
    if (enterLead) { pts.push(new THREE.Vector3(-11, 0, -6.5), LEAD_DOOR.clone(), new THREE.Vector3(HANDOFF_POINT.x, 0, -8.2)); }
    else if (to.x < -12) { pts.push(new THREE.Vector3(-11, 0, 5.3), new THREE.Vector3(to.x, 0, 5.3)); }
    else { const e = new THREE.Vector3(to.x + 2.6, 0, targetAisle); pts.push(e, new THREE.Vector3(e.x, 0, to.z)); }
    pts.push(to.clone());
    this.path = pts.filter((p, i) => i === 0 || p.distanceTo(pts[i - 1]) > 0.01);
    this.applyPose(false);
  }
  /** Apply an effective state. Decides where the bot should be. */
  setState(s: BotState, line: string, now: number) {
    const prev = this.state; this.state = s; this.statusLine = line;
    const atWork = s === 'working' || s === 'waiting' || s === 'error';
    // Always re-assert desk while at work (fixes lounge desync if a route was dropped).
    if (atWork) { this.wantDesk = true; this.goDesk(); return; }
    if (prev === s) return;
    this.wantDesk = false;
    if (s === 'done' && (prev === 'working' || prev === 'waiting') && !this.m.lead) { this.parcel.visible = true; this.place = 'handoff'; this.route(HANDOFF_POINT, true); this.handoffUntil = 0; return; }
    if (s === 'done' && this.m.lead && prev !== 'idle') { this.goLounge(); return; }
    this.goLounge(); void now;
  }
  private seat() { return this.m.lead ? LEAD_SEAT : deskSeat(this.m.dept); }
  private goDesk() {
    const seat = this.seat();
    if (this.place === 'desk' && !this.path.length && this.group.position.distanceTo(seat) < 0.6) return;
    this.place = 'desk'; this.parcel.visible = false;
    // Lounge → desk always snaps so simulate / status pushes show work instantly.
    if (this.group.position.distanceTo(seat) > 2.5) {
      this.path = []; this.group.position.copy(seat); this.face(Math.PI); this.applyPose(true); return;
    }
    this.m.lead ? this.route(LEAD_SEAT, true) : this.route(seat); void deskEntry;
  }
  private goLounge() {
    if (this.place === 'lounge' && !this.path.length && this.group.position.distanceTo(this.loungeSeat) < 0.6) return;
    this.place = 'lounge';
    if (this.group.position.distanceTo(this.loungeSeat) > 10) {
      this.path = []; this.group.position.copy(this.loungeSeat); this.face(this.loungeSeat.z < 7 ? 0 : Math.PI); this.applyPose(true); return;
    }
    this.route(this.loungeSeat);
  }
  update(dt: number, now: number) {
    if (this.path.length) {
      const tgt = this.path[0]; const p = this.group.position; const d = tgt.clone().sub(p); d.y = 0;
      const step = SPEED * dt;
      if (d.length() <= step) { p.copy(tgt); this.path.shift(); }
      else { d.normalize(); p.addScaledVector(d, step); this.face(Math.atan2(d.x, d.z)); }
      this.walkT += dt * 9; const sw = Math.sin(this.walkT) * 0.6;
      this.legL.rotation.x = sw; this.legR.rotation.x = -sw; this.armL.rotation.x = this.parcel.visible ? -1.2 : -sw * 0.7; this.armR.rotation.x = sw * 0.7;
      if (!this.path.length) this.arrive(now);
    } else if (this.place === 'handoff' && this.handoffUntil && now > this.handoffUntil) {
      this.parcel.visible = false; this.handoffUntil = 0; this.wantDesk ? this.goDesk() : this.goLounge();
    }
  }
  private arrive(now: number) {
    if (this.place === 'handoff') { this.face(-Math.PI / 2); this.applyPose(false); this.armL.rotation.x = -1.2; this.handoffUntil = now + 1800; return; }
    if (this.place === 'desk') { this.face(Math.PI); this.applyPose(true); return; }
    this.face(this.loungeSeat.z < 7 ? 0 : Math.PI); this.applyPose(true);
  }
  get moving() { return this.path.length > 0; }
}
