import './style.css';
import { controlRoom } from './ui/controlRoom';
const room = controlRoom();
let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildOffice } from './office/build';
import { usageBoard } from './office/usageBoard';
import { LOUNGE_SEATS, FLOOR_BOUNDS } from './office/layout';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { TEAM } from './bots/team';
import { Bot } from './bots/bot';
import { Simulation } from './bots/simulate';
import { Tags } from './ui/overlay';
import { hud, passwordGate } from './ui/hud';
import { feedLog } from './ui/feedlog';
import { fetchStatus, effectiveState, lastActivity, QUIET_WARN_MS, UnauthorizedError, type StatusPayload } from './api/status';

const help = document.createElement('div'); help.className = 'camera-help'; help.textContent = 'Drag: move office · Orbit button: rotate · Scroll: zoom'; document.body.append(help);
const app = document.getElementById('app')!;
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
// Never render below native resolution.
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping; // palette-accurate, matte
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);
renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());

const scene = new THREE.Scene(); scene.background = new THREE.Color('#081522');
// Soft studio IBL for matte PBR (low intensity keeps the palette), plus hemi fill + one key sun.
{ const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.35; pm.dispose(); }
const fill = new THREE.HemisphereLight('#ffffff', '#556575', 0.85); scene.add(fill);
const sun = new THREE.DirectionalLight('#fff0d8', 1.3); sun.position.set(14, 30, 18); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 4; sun.shadow.normalBias = 0.02; Object.assign(sun.shadow.camera, { left: -28, right: 28, top: 24, bottom: -24, near: 1, far: 80 }); sun.shadow.bias = -0.0003;
scene.add(sun);
// World lighting only: camera movement never changes the selected atmosphere.
const atmosphere = document.createElement('nav'); atmosphere.className = 'atmosphere'; atmosphere.setAttribute('aria-label', 'Time of day');
const presets = {
 day: { sky: '#dcecff', ground: '#867052', power: 1.15, sun: '#fff1d8', key: 1.5, environment: .3 },
 evening: { sky: '#e8b9a3', ground: '#69506e', power: .75, sun: '#ffb76c', key: 1.25, environment: .2 },
 night: { sky: '#8ba8e3', ground: '#263348', power: .48, sun: '#b2c9ff', key: .45, environment: .12 }
};
type Atmosphere = 'now' | keyof typeof presets;
let atmosphereMode: Atmosphere = 'now';
try { const saved = localStorage.getItem('office-atmosphere'); if (saved === 'now' || (saved && saved in presets)) atmosphereMode = saved as Atmosphere; } catch { /* Storage can be disabled. */ }
function applyAtmosphere() {
 const hour = new Date().getHours();
 const resolved = atmosphereMode === 'now' ? (hour >= 7 && hour < 17 ? 'day' : hour >= 17 && hour < 20 ? 'evening' : 'night') : atmosphereMode;
 const p = presets[resolved]; fill.color.set(p.sky); fill.groundColor.set(p.ground); fill.intensity = p.power; sun.color.set(p.sun); sun.intensity = p.key; scene.environmentIntensity = p.environment;
 atmosphere.title = atmosphereMode === 'now' ? `Local time · ${resolved}` : resolved;
 for (const button of atmosphere.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.mode === atmosphereMode));
}
for (const [mode, label] of [['now','◷ Now'],['day','☀ Day'],['evening','◒ Evening'],['night','☾ Night']]) {
 const button = document.createElement('button'); button.textContent = label; button.dataset.mode = mode; button.onclick = () => { atmosphereMode = mode as Atmosphere; try {localStorage.setItem('office-atmosphere',mode);} catch {} applyAtmosphere(); }; atmosphere.append(button);
}
document.body.append(atmosphere); applyAtmosphere(); setInterval(() => {if(atmosphereMode === 'now') applyAtmosphere();}, 60000);


const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
cam.position.set(34, 36, 34); cam.lookAt(0, 0, 0);
const controls = new OrbitControls(cam, renderer.domElement);
// Controls: left-drag = slide the floor plan (pan on the ground plane), right-drag = gentle orbit (Â±35Â° yaw, narrow tilt), wheel/pinch = zoom.
controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };
controls.screenSpacePanning = true; // Pixel-aligned horizontal and vertical movement, independent of camera yaw.
controls.enableDamping = true; controls.dampingFactor = 0.12; controls.panSpeed = 0.9; controls.rotateSpeed = 0.45;
controls.minPolarAngle = 0.45; controls.maxPolarAngle = 1.25;
const AZ0 = Math.atan2(34, 34); controls.minAzimuthAngle = AZ0 - Math.PI; controls.maxAzimuthAngle = AZ0 + Math.PI;
controls.minZoom = 0.6; controls.maxZoom = 4;
// Do not clamp individual target axes: that cancels parts of a screen-space drag.
// Fit office provides an explicit way to recover the original framing.
const orbitButton = document.createElement('button'); orbitButton.textContent = 'Orbit'; orbitButton.dataset.action = 'orbit'; orbitButton.setAttribute('aria-pressed', 'false'); room.toolbar.append(orbitButton);
const office = buildOffice(scene, renderer);
const board = usageBoard(scene, renderer);
const bots = TEAM.map((m, i) => { const b = new Bot(m, LOUNGE_SEATS[i]); scene.add(b.group); return b; });
const tags = new Tags(app, bots);
const ui = hud(app);

// Fit the whole slab (FLOOR_BOUNDS, walls/glass to y 3.8) in view with ~8% margin, any aspect.
const SLAB = [FLOOR_BOUNDS.x0 - 0.2, FLOOR_BOUNDS.x1 + 0.2].flatMap((x) => [FLOOR_BOUNDS.z0 - 0.2, FLOOR_BOUNDS.z1 + 0.2].flatMap((z) => [0, 3.8].map((y) => new THREE.Vector3(x, y, z))));
function resize() {
  const w = app.clientWidth, h = app.clientHeight; renderer.setSize(w, h, true);
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
room.toolbar.addEventListener('click', (e) => {
 const button = (e.target as HTMLElement).closest('button'); if (!button) return;
 const action = button.dataset.action;
 if (action === 'orbit') { const enabled = button.getAttribute('aria-pressed') !== 'true'; button.setAttribute('aria-pressed', String(enabled)); controls.mouseButtons.LEFT = enabled ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN; }
 if (action === 'fit') { controls.target.set(0,0,0); cam.position.set(34,36,34); cam.zoom = 1; cam.lookAt(0,0,0); controls.update(); resize(); }
 if (action === 'in' || action === 'out') { cam.zoom = THREE.MathUtils.clamp(cam.zoom * (action === 'in' ? 1.2 : 1/1.2), .6, 4); cam.updateProjectionMatrix(); }
 if (action === 'labels') { const hidden = app.classList.toggle('hide-labels'); button.setAttribute('aria-pressed', String(!hidden)); }
 if (action === 'pause') { paused = !paused; button.textContent = paused ? 'Resume motion' : 'Pause motion'; button.setAttribute('aria-pressed', String(paused)); }
});
document.addEventListener('office-focus', e => {
 const b = bots.find(b => b.m.id === (e as CustomEvent).detail); if (!b) return;
 const delta = b.group.position.clone().sub(controls.target); controls.target.add(delta); cam.position.add(delta); cam.zoom = 2; cam.updateProjectionMatrix();
});


// ---- status wiring ----------------------------------------------------------
const sim = new Simulation();
const forceSim = new URLSearchParams(location.search).get('simulate') === '1';
let live: StatusPayload | null = null; let feedError = false;
function apply(p: StatusPayload, simulated: boolean) {
  const now = Date.now(); let active = 0;
  for (const b of bots) {
    const s = p.bots.find((x) => x.id === b.m.id || x.name === b.m.name);
    const st = effectiveState(s, now); if (st === 'working') active++;
    const before = b.state, oldLine = b.statusLine; b.setState(st, s?.statusLine ?? '', performance.now(), simulated);
    if ((before !== st || oldLine !== s?.statusLine) && s?.statusLine) feedLog.push(`> ${b.m.short}: ${s.statusLine}`);
  }
  feedLog.activeCount = active; ui.setLive(active);
  board.set(simulated ? undefined : p.usage);
  room.update(p, simulated);
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
else ui.setGuest(true); // chip immediately; 401 â†’ enterGuest starts sim
poll(); setInterval(poll, 20000); setInterval(refreshWarning, 30000);

// ---- loop -------------------------------------------------------------------
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  // Real-time motion even at low FPS: substep instead of clamping (clamp made slow renders walk in slow motion).
  const dt = Math.min(clock.getDelta(), 1), t = clock.elapsedTime, now = performance.now();
  controls.update(); if (!paused && !document.hidden) office.update(t);
  const n = Math.ceil(dt / 0.05);
  for (let i = 0; i < (paused || document.hidden ? 0 : n); i++) for (const b of bots) b.update(dt / n, now);
  renderer.render(scene, cam);
  tags.update(cam, app.clientWidth, app.clientHeight);
});
(window as any).__office = { bots, sim }; // debug hook for screenshots
