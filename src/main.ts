import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildOffice } from './office/build';
import { usageBoard } from './office/usageBoard';
import { LOUNGE_SEATS } from './office/layout';
import { TEAM } from './bots/team';
import { Bot } from './bots/bot';
import { Simulation } from './bots/simulate';
import { Tags } from './ui/overlay';
import { hud, passwordGate } from './ui/hud';
import { feedLog } from './ui/feedlog';
import { fetchStatus, effectiveState, lastActivity, QUIET_WARN_MS, UnauthorizedError, type StatusPayload } from './api/status';

const app = document.getElementById('app')!;
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
// Never render below native resolution.
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping; // palette-accurate, matte
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene(); scene.background = new THREE.Color('#e8e6e1');
scene.add(new THREE.HemisphereLight('#ffffff', '#cfc9bd', 2.1));
const sun = new THREE.DirectionalLight('#fffaf2', 1.15); sun.position.set(14, 30, 18); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 4; sun.shadow.normalBias = 0.02; Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 22, bottom: -22, near: 1, far: 80 }); sun.shadow.bias = -0.0003;
scene.add(sun);

const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
cam.position.set(34, 36, 34); cam.lookAt(0, 0, 0);
const controls = new OrbitControls(cam, renderer.domElement);
controls.enableRotate = true; controls.minPolarAngle = 0.6; controls.maxPolarAngle = 1.05; controls.enableDamping = true;
controls.minZoom = 0.6; controls.maxZoom = 4; controls.screenSpacePanning = true;

const office = buildOffice(scene, renderer);
const board = usageBoard(scene, renderer);
const bots = TEAM.map((m, i) => { const b = new Bot(m, LOUNGE_SEATS[i]); scene.add(b.group); return b; });
const tags = new Tags(app, bots);
const ui = hud(app);

// Fit the whole slab (x ±20, z ±14, walls to y 2.6) in view with ~8% margin, any aspect.
const SLAB = [-20.2, 20.2].flatMap((x) => [-14.2, 14.2].flatMap((z) => [0, 2.8].map((y) => new THREE.Vector3(x, y, z))));
function resize() {
  const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, true);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  const a = w / h;
  cam.updateMatrixWorld(); const inv = cam.matrixWorldInverse;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of SLAB) { const v = p.clone().applyMatrix4(inv); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
  const portrait = a < 1;
  const m = portrait ? 1.03 : 1.08; // phone: fit width tight so the slab fills the screen
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let hw = (x1 - x0) / 2 * m, hh = (y1 - y0) / 2 * m;
  if (hw / hh > a) hh = hw / a; else hw = hh * a;
  cam.left = cx - hw; cam.right = cx + hw; cam.top = cy + hh; cam.bottom = cy - hh;
  cam.updateProjectionMatrix();
}
window.addEventListener('resize', resize); resize();

// ---- status wiring ----------------------------------------------------------
const sim = new Simulation();
const forceSim = new URLSearchParams(location.search).get('simulate') === '1';
let live: StatusPayload | null = null; let feedError = false;
function apply(p: StatusPayload, simulated: boolean) {
  const now = Date.now(); let active = 0;
  for (const b of bots) {
    const s = p.bots.find((x) => x.id === b.m.id || x.name === b.m.name);
    const st = effectiveState(s, now); if (st === 'working') active++;
    const before = b.state; b.setState(st, s?.statusLine ?? '', performance.now());
    if ((before !== st || st !== 'idle') && s?.statusLine) feedLog.push(`> ${b.m.short}: ${s.statusLine}`);
  }
  feedLog.activeCount = active; ui.setLive(active);
  if (!simulated) board.set(p.usage);
}
function refreshWarning() {
  if (sim.running) return ui.setWarn(null);
  if (feedError) return ui.setWarn('Status feed unavailable');
  if (live && (!live.feedHealthy || Date.now() - lastActivity(live) >= QUIET_WARN_MS)) return ui.setWarn('Status feed quiet for 45+ min');
  ui.setWarn(null);
}
let authed = false; let guest = false; let gateOpen = false;
async function poll() {
  try {
    live = await fetchStatus(); feedError = false; authed = true;
    if (guest) { guest = false; ui.setGuest(false); if (sim.running && !forceSim) setSim(false); }
    if (!sim.running) apply(live, false);
  }
  catch (e) {
    if (e instanceof UnauthorizedError && import.meta.env.VITE_DEV_SKIP_AUTH !== '1') { authed = false; live = null; enterGuest(); }
    else feedError = true;
  }
  refreshWarning();
}
/** Unauthenticated visitors: public simulation + non-blocking sign-in (live feed stays password-gated). */
function enterGuest() {
  if (!guest) { guest = true; ui.setGuest(true); }
  if (!sim.running && !gateOpen) setSim(true);
}
async function signIn() {
  if (gateOpen) return; gateOpen = true;
  const ok = await passwordGate(app); gateOpen = false;
  if (ok) { authed = true; guest = false; ui.setGuest(false); setSim(false); await poll(); }
  else if (!sim.running) setSim(true);
}
function setSim(on: boolean) {
  if (on && !sim.running) { feedLog.lines.length = 0; sim.start((p) => apply(p, true)); }
  if (!on && sim.running) { sim.stop(); feedLog.lines.length = 0; apply(live ?? { bots: [], feedHealthy: true }, false); }
  ui.setSim(on); refreshWarning();
}
ui.simBtn.addEventListener('click', () => {
  if (sim.running && guest && !authed) { setSim(false); void signIn(); return; } // never leave guests on an empty floor
  setSim(!sim.running);
});
ui.signInBtn.addEventListener('click', () => void signIn());
if (forceSim) setSim(true);
else ui.setGuest(true); // chip immediately; 401 → enterGuest starts sim
poll(); setInterval(poll, 20000); setInterval(refreshWarning, 30000);

// ---- loop -------------------------------------------------------------------
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  // Real-time motion even at low FPS: substep instead of clamping (clamp made slow renders walk in slow motion).
  const dt = Math.min(clock.getDelta(), 1), t = clock.elapsedTime, now = performance.now();
  controls.update(); office.update(t);
  const n = Math.ceil(dt / 0.05);
  for (let i = 0; i < n; i++) for (const b of bots) b.update(dt / n, now);
  renderer.render(scene, cam);
  tags.update(cam, window.innerWidth, window.innerHeight);
});
(window as any).__office = { bots, sim }; // debug hook for screenshots
