import * as THREE from 'three';
import { box, matte, canvasTexture } from './materials';
import { ZONES, LEAD_OFFICE, FLOOR_BOUNDS, deskOrigin } from './layout';
import { wallArt } from './wallArt';
import { TEAM } from '../bots/team';
import { STATIONS, DEFAULT_STATION, buildStation } from './stations';

export interface OfficeHandles { blinkers: THREE.Mesh[]; update(t: number): void; }

const WALL = '#344454', BASE = '#243341', WOOD = '#c4a882', DARK = '#3a3f46', CHAIR = '#3a3f46', BEZEL = '#1c1f24';
/** Department tint at 12% over the floor colour. */
function tint(hex: string, a = 0.12) { return '#' + new THREE.Color('#c8d0d5').lerp(new THREE.Color(hex), a).getHexString(); }

function carpetWithLetters(renderer: THREE.WebGLRenderer, w: number, d: number, base: string, text: string) {
  const px = 256; // texels per world unit â†’ crisp lettering
  const { tex } = canvasTexture(w * px / 2, d * px / 2, (c) => {
    c.fillStyle = base; c.fillRect(0, 0, c.canvas.width, c.canvas.height);
    c.strokeStyle = 'rgba(17,24,39,0.10)'; c.lineWidth = 3; c.strokeRect(10, 10, c.canvas.width - 20, c.canvas.height - 20);
    c.fillStyle = 'rgba(17,24,39,0.38)';
    const fs = Math.min(c.canvas.height * 0.13, px * 0.28, c.canvas.width * 0.8 / (text.length * 0.62));
    c.font = `600 ${Math.round(fs)}px Inter, system-ui, sans-serif`; (c as any).letterSpacing = `${Math.round(fs * 0.12)}px`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    // lettering at the front band, left of the side entry lane
    c.fillText(text.toUpperCase(), c.canvas.width * 0.42, c.canvas.height - fs * 0.9);
  }, renderer);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, metalness: 0 }));
  tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return m;
}

function plant(x: number, z: number, s = 1) {
  const g = new THREE.Group();
  g.add(box(0.5 * s, 0.5 * s, 0.5 * s, '#e9e5dc', 0, 0, 0));
  const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 * s, 0), matte('#6f8f6a'));
  leaf.position.y = 0.95 * s; leaf.castShadow = true; g.add(leaf);
  const leaf2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38 * s, 0), matte('#86a37f'));
  leaf2.position.set(0.15 * s, 1.45 * s, 0.05); leaf2.castShadow = true; g.add(leaf2);
  g.position.set(x, 0, z); return g;
}

export function buildOffice(scene: THREE.Scene, renderer: THREE.WebGLRenderer): OfficeHandles {
  const blinkers: THREE.Mesh[] = [];
  const updaters: ((t: number) => void)[] = [];
  // floor
  const F = FLOOR_BOUNDS, FW = F.x1 - F.x0, FD = F.z1 - F.z0, FX = (F.x0 + F.x1) / 2, FZ = (F.z0 + F.z1) / 2;
  const PX = 48; // texels per unit
  const grid = canvasTexture(FW * PX, FD * PX, (c) => {
    // Staggered oak planks with restrained grain, drawn once.
    c.fillStyle = '#9b704b'; c.fillRect(0,0,c.canvas.width,c.canvas.height);
    for (let row=0; row<FD; row++) for(let col=-1; col<FW/5+1; col++) {
      const x=(col*5+(row%2)*2.5)*PX, y=row*PX;
      const v=(Math.sin(row*17+col*31)+1)/2;
      c.fillStyle = `hsl(30, 35%, ${45+v*9}%)`; c.fillRect(x+1,y+1,5*PX-2,PX-2);
      c.strokeStyle='rgba(70,40,20,.12)';c.lineWidth=1;
      for(let k=1;k<5;k++){c.beginPath();c.moveTo(x+8,y+k*PX/5);c.bezierCurveTo(x+70,y+k*PX/5+3,x+150,y+k*PX/5-2,x+5*PX-8,y+k*PX/5);c.stroke();}
    }
  }, renderer);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(FW, FD), new THREE.MeshLambertMaterial({ map: grid.tex }));
  floor.position.set(FX, 0, FZ);
  scene.add(box(FW + 0.4, 0.4, FD + 0.4, '#795438', FX, -0.46, FZ, false)); // slab edge
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  // back walls (match the taller glass; they sit behind the camera's view line)
  const WH = 3.7;
  scene.add(box(FW, WH, 0.3, WALL, FX, 0, F.z0 - 0.15)); scene.add(box(0.3, WH, FD, WALL, F.x0 - 0.15, 0, FZ));
  scene.add(box(FW, 0.18, 0.34, BASE, FX, 0, F.z0 + 0.02, false)); scene.add(box(0.34, 0.18, FD, BASE, F.x0 + 0.02, 0, FZ, false)); // baseboard
  scene.add(box(FW, 0.06, 0.36, '#e6e2d9', FX, WH - 0.06, F.z0 - 0.1, false)); scene.add(box(0.36, 0.06, FD, '#e6e2d9', F.x0 - 0.1, WH - 0.06, FZ, false)); // cornice

  // department zones
  for (const m of TEAM) {
    if (m.lead) continue;
    const z = ZONES[m.dept]; const o = deskOrigin(m);
    const first = TEAM.find((t) => !t.lead && t.dept === m.dept) === m; // shared zone: one rug + decor
    if (first) { const rug = carpetWithLetters(renderer, 6, 5, tint(m.color), m.dept); rug.position.set(z.x, 0.01, z.z); scene.add(rug); }
    const st = buildStation(STATIONS[m.id] ?? DEFAULT_STATION, m.color === '#1a1a1a' ? '#f59e0b' : m.color, renderer, TEAM.indexOf(m));
    st.g.position.set(o.x, 0, o.z - 0.75); scene.add(st.g); updaters.push(st.update);
    if (first) scene.add(accessoryDecor(m.accessory, z.x - 2.4, z.z - 1.9, m.color));
  }

  // lead glass office
  const L = LEAD_OFFICE; const cx = (L.x0 + L.x1) / 2, cz = (L.z0 + L.z1) / 2;
  const rug = carpetWithLetters(renderer, L.x1 - L.x0, L.z1 - L.z0, tint('#2563eb', 0.08), 'Ops Â· Lead');
  rug.position.set(cx, 0.012, cz); scene.add(rug);
  const leadM = TEAM.find((t) => t.lead)!;
  const ls = buildStation(STATIONS[leadM.id] ?? DEFAULT_STATION, '#60a5fa', renderer, 0);
  ls.g.position.set(-16, 0, -11.35); scene.add(ls.g); updaters.push(ls.update);
  const glass = new THREE.MeshPhysicalMaterial({ color: '#b8c9d6', transparent: true, opacity: 0.16, roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, depthWrite: false, side: THREE.DoubleSide });
  const frame = matte('#e6e9ec');
  const GH = 3.6; // tall glass (was 2.2â€“2.4)
  // Curved enclosure, open at the east/south doorway used by the routing graph.
  for (let i = 0; i < 32; i++) {
    const a = Math.PI * 0.12 + i / 32 * Math.PI * 1.68;
    const b = Math.PI * 0.12 + (i + 1) / 32 * Math.PI * 1.68;
    const x1 = cx + Math.cos(a) * 4, z1 = cz + Math.sin(a) * 3.45;
    const x2 = cx + Math.cos(b) * 4, z2 = cz + Math.sin(b) * 3.45;
    const length = Math.hypot(x2-x1,z2-z1);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(length, GH, .035), glass);
    panel.position.set((x1+x2)/2,GH/2,(z1+z2)/2); panel.rotation.y = -Math.atan2(z2-z1,x2-x1); scene.add(panel);
    for (const y of [.03,GH]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(length,.045,.045), frame); rail.position.set(panel.position.x,y,panel.position.z); rail.rotation.y=panel.rotation.y; scene.add(rail); }
  }
  // fishbowl curtain wall: glass on south + east, with an entry gap; slim dark posts
  const post = (x: number, z: number) => scene.add(box(0.1, GH + 0.1, 0.1, '#2b2f36', x, 0, z));
  for (const [px, pz] of [] as number[][]) post(px, pz); // lead office corner posts
  const fish = (w: number, d: number, x: number, z: number) => { const p = new THREE.Mesh(new THREE.BoxGeometry(w, GH, d), glass); p.position.set(x, GH / 2, z); p.renderOrder = 2; scene.add(p); for (const yy of [0, GH]) { const f = box(w + 0.04, 0.07, d + 0.04, '#e6e9ec', x, yy, z, false); scene.add(f); } };
  const SZ = F.z1 + 0.15, EX = F.x1 + 0.15;
  for (let i = 0; i < 7; i++) { const x = F.x0 + i * FW / 7; if (i !== 3) fish(FW / 7, 0.05, x + FW / 14, SZ); post(x, SZ); } post(F.x1, SZ);   // south: entry gap at the break room
  for (let i = 0; i < 7; i++) { const z = F.z0 + i * FD / 7; if (i !== 3) fish(0.05, FD / 7, EX, z + FD / 14); post(EX, z); } post(EX, F.z1);   // east: gap mid-wall
  // glass ribs between lounge and work zones
  for (const z of [-5, 1]) { fish(0.05, 2.2, -11.8, z + 0.5); } // low-height ribs keep their 2.2 footprint, full glass height
  scene.add(box(1.4, 0.7, 0.5, WOOD, -18.8, 0, -13.4)); // credenza
  scene.add(plant(-19.2, -8, 0.9));
  // handoff tray
  scene.add(box(0.7, 0.75, 0.7, '#e5e1d8', -14.6, 0, -10.2));

  // lounge (x -20..-12, z 1..14)
  const lr = new THREE.Mesh(new THREE.PlaneGeometry(8, 11), matte(tint('#64748b', 0.14))); lr.rotation.x = -Math.PI / 2; lr.position.set(-16, 0.01, 7.3); lr.receiveShadow = true; scene.add(lr);
  const sofa = (z: number, back: number) => { const g = new THREE.Group(); g.add(box(6.6, 0.45, 1.0, '#4b5563', 0, 0, 0)); g.add(box(6.6, 0.7, 0.3, '#3f4752', 0, 0.45, back * 0.4)); g.add(box(0.3, 0.7, 1.0, '#3f4752', -3.3, 0, 0)); g.add(box(0.3, 0.7, 1.0, '#3f4752', 3.3, 0, 0)); g.position.set(-16.2, 0, z); return g; };
  scene.add(sofa(3.95, -1)); scene.add(sofa(9.65, 1));
  scene.add(box(3.4, 0.36, 1.4, WOOD, -16.2, 0, 6.8)); scene.add(box(0.5, 0.02, 0.35, '#e5e7eb', -15.6, 0.36, 6.7, false));
  scene.add(plant(-19.3, 1.8));
  const rugText = carpetWithLetters(renderer, 6, 1.4, tint('#64748b', 0.14), 'Lounge'); rugText.position.set(-15.8, 0.015, 12.6); scene.add(rugText);

  // break room (x -10..4, z 9..14)
  const br = carpetWithLetters(renderer, 13, 4.6, tint('#c4a882', 0.14), 'Break Room'); br.position.set(-3.5, 0.01, 11.6); scene.add(br);
  scene.add(box(4, 0.9, 0.7, '#e5e1d8', -7.5, 0, 13.4)); // counter
  scene.add(box(0.5, 0.55, 0.45, '#2f3338', -8.6, 0.9, 13.4)); // coffee machine
  scene.add(box(0.9, 1.9, 0.8, '#e9e9e6', -4.8, 0, 13.4)); // fridge
  scene.add(box(1.6, 0.06, 1.6, WOOD, 0, 0.74, 11.2)); scene.add(box(0.12, 0.74, 0.12, DARK, 0, 0, 11.2));
  for (const [sx, sz] of [[-1.1, 11.2], [1.1, 11.2]]) scene.add(box(0.5, 0.45, 0.5, CHAIR, sx, 0, sz));
  scene.add(plant(3.4, 13.2, 0.8));

  // server room (x 6..12, z 10..14)
  for (let i = 0; i < 4; i++) {
    const x = 6.8 + i * 1.3;
    scene.add(box(1.0, 2.2, 0.9, '#1c1f24', x, 0, 12.9));
    for (let r = 0; r < 6; r++) {
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: r % 3 ? '#22c55e' : '#3b82f6' }));
      led.position.set(x - 0.3 + (r % 2) * 0.15, 0.35 + r * 0.3, 13.36); scene.add(led);
      led.userData.phase = Math.random() * 10; led.userData.rate = 0.6 + Math.random() * 1.6; blinkers.push(led);
    }
  }
  const sr = carpetWithLetters(renderer, 6, 2, tint('#1c1f24', 0.08), 'Servers'); sr.position.set(8.8, 0.01, 10.6); scene.add(sr);

  // research area (x 13..20, z -14..1)
  const rr = carpetWithLetters(renderer, 7, 14, tint('#0ea5e9', 0.08), 'Research'); rr.position.set(16.5, 0.01, -6.8); scene.add(rr);
  const screens = researchScreens(renderer);
  screens.meshes.forEach((m) => scene.add(m));
  updaters.push(screens.update);
  scene.add(plant(20.4, 10.2, 0.9)); scene.add(plant(13.6, -13.2, 0.9));
  scene.add(box(2.4, 0.08, 1.0, WOOD, 16.5, 0.72, -9.4)); scene.add(box(0.1, 0.72, 0.8, DARK, 15.4, 0, -9.4)); scene.add(box(0.1, 0.72, 0.8, DARK, 17.6, 0, -9.4));

  // decor
  scene.add(plant(-11, -13.2)); scene.add(plant(12.6, 7.6, 0.9)); // 8 plants total
  wallArt(scene, renderer); // â‰¤6 calm gallery pieces (public portfolio titles + stack)

  return { blinkers, update(t) {
    for (const b of blinkers) {
      if (!b.userData.on) { b.userData.on = (b.material as THREE.MeshBasicMaterial).color.clone(); b.userData.off = b.userData.on.clone().multiplyScalar(0.3); }
      (b.material as THREE.MeshBasicMaterial).color.copy(Math.sin(t * b.userData.rate + b.userData.phase) > 0.1 ? b.userData.on : b.userData.off);
    }
    updaters.forEach((u) => u(t));
  } };
}

function accessoryDecor(kind: string, x: number, z: number, color: string) {
  // a small dept prop at the back corner of each zone (never on the lettering)
  const g = new THREE.Group(); g.position.set(x, 0, z);
  g.add(box(0.7, 0.6, 0.5, '#e5e1d8', 0, 0, 0));
  const top = box(0.24, 0.24, 0.24, color, 0, 0.6, 0); g.add(top);
  if (kind === 'clock') { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.06, 20), matte('#ffffff')); c.rotation.x = Math.PI / 2; c.position.set(0, 1.2, 0); g.add(c); }
  return g;
}

// ---- research screens -------------------------------------------------------
import { feedLog } from '../ui/feedlog';
function researchScreens(renderer: THREE.WebGLRenderer) {
  const W = 1024, H = 576;
  const mk = (x: number, z: number, ry: number) => {
    const t = canvasTexture(W, H, () => {}, renderer);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.46), new THREE.MeshBasicMaterial({ map: t.tex, toneMapped: false }));
    m.position.set(x, 1.6, z); m.rotation.y = ry;
    const bezel = box(2.75, 1.6, 0.06, BEZEL, x, 0.87, z - 0.04, false); bezel.rotation.y = ry;
    return { m, bezel, ...t };
  };
  const s1 = mk(14.6, -13.9, 0), s2 = mk(17.6, -13.9, 0), s3 = mk(16.5, -9.75, 0);
  s3.m.position.y = 1.45; s3.bezel.position.y = 0.72; s3.m.scale.setScalar(0.6); s3.bezel.scale.setScalar(0.6);
  const series: number[] = [];
  // simplified contiguous-US outline (lon,lat)
  const US: [number, number][] = [[-124.7,48.4],[-123,46],[-124,42],[-120.5,34.5],[-117.1,32.5],[-111,31.3],[-106.5,31.8],[-103,29],[-97.4,25.9],[-97.2,28],[-93.8,29.7],[-89.6,29.9],[-85,29.7],[-82.7,27.5],[-81.5,25.2],[-80,26.8],[-81.2,30.5],[-81,32],[-75.5,35.2],[-76,38],[-74,40.5],[-70,41.6],[-70.6,43],[-67,44.8],[-69,47.4],[-71.5,45],[-75,45],[-79,43.2],[-82.5,41.6],[-83.5,46],[-88,48],[-95.2,49],[-123,49]];
  let last = 0;
  return { meshes: [s1.bezel, s1.m, s2.bezel, s2.m, s3.bezel, s3.m], update(t: number) {
    if (t - last < 0.12) return; last = t;
    const lines = feedLog.lines; const active = feedLog.activeCount;
    // 1) chart of live active-bot count (real feed / simulation)
    if (series.length === 0 || t % 1 < 0.13) { series.push(active); if (series.length > 60) series.shift(); }
    let c = s1.ctx; c.fillStyle = '#0b0d10'; c.fillRect(0, 0, W, H);
    c.strokeStyle = '#1f2937'; c.lineWidth = 2; for (let y = 1; y < 6; y++) { c.beginPath(); c.moveTo(40, y * 90); c.lineTo(W - 30, y * 90); c.stroke(); }
    c.strokeStyle = '#60a5fa'; c.lineWidth = 6; c.beginPath();
    series.forEach((v, i) => { const x = 40 + i * (W - 70) / 59, y = H - 50 - (v / 10) * (H - 120); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke();
    c.fillStyle = '#cbd5e1'; c.font = '600 34px system-ui'; c.fillText(`Active bots: ${active}`, 44, 50);
    // 2) US map (decorative) with sweeping scan
    c = s2.ctx; c.fillStyle = '#0b0d10'; c.fillRect(0, 0, W, H);
    const proj = (lo: number, la: number) => [80 + (lo + 125) / 58 * (W - 160), 60 + (49.5 - la) / 25 * (H - 120)];
    c.beginPath(); US.forEach(([lo, la], i) => { const [x, y] = proj(lo, la); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath();
    c.fillStyle = '#1e293b'; c.fill(); c.strokeStyle = '#60a5fa'; c.lineWidth = 3; c.stroke();
    const sx = 80 + ((t * 120) % (W - 160)); c.fillStyle = 'rgba(111,168,201,0.25)'; c.fillRect(sx, 40, 8, H - 80);
    c.fillStyle = '#cbd5e1'; c.font = '600 30px system-ui'; c.fillText('Decorative map', 44, 46);
    // 3) terminal echoing real status lines only
    c = s3.ctx; c.fillStyle = '#11161c'; c.fillRect(0, 0, W, H);
    c.font = '500 34px ui-monospace, monospace'; c.fillStyle = '#86efac';
    const show = lines.length ? lines.slice(-10) : ['> waiting for status feedâ€¦'];
    show.forEach((l, i) => c.fillText(l.slice(0, 48), 30, 60 + i * 50));
    if (Math.floor(t * 2) % 2) c.fillRect(30, 60 + show.length * 50 - 30, 20, 36);
    s1.tex.needsUpdate = s2.tex.needsUpdate = s3.tex.needsUpdate = true;
  } };
}

