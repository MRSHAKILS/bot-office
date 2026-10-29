# Bot Office — Motion Design

Professional motion system for the isometric ops floor. Written for implementers; treat this as the source of truth for animation feel.

## Goals

1. **Readable at a glance** — from the default isometric camera, every bot’s activity is obvious without reading tags.
2. **Natural, not floaty** — no teleportation for ordinary desk↔lounge trips; weight, easing, and follow-through.
3. **State-expressive** — `idle` / `working` / `waiting` / `error` / `done` each have distinct motion language.
4. **Quiet luxury** — soft easing, small amplitudes; never cartoon squash/stretch or frantic jitter.
5. **Perf-safe** — all procedural (no keyframe clips); O(bots) trig only; no GC in the hot loop.

## Anti-patterns (current bugs)

| Problem | Fix |
|---|---|
| Snap teleport when distance > 2.5 | Walk unless path would exceed ~28 units *and* the move is a hard resync; prefer walking in Simulate |
| Pose flips sit↔stand in one frame | 280–400 ms ease on body Y + leg/arm rotations |
| Seated bots are frozen statues | Continuous micro-motion: breathe, type, glance |
| Walk is only sin(leg) | Add vertical bob, opposite arm swing, soft turn lerp |
| Simulate flips states too fast | Longer dwell so walks finish before the next state |

## Motion vocabulary

### Locomotion (path.length > 0)

- **Speed:** 3.0–3.6 u/s (was 5.5). Slight per-bot variance ±8% from `id` hash so they don’t march in lockstep.
- **Gait:** `phase += dt * (7.2 + speed*0.4)`; legs ±0.55 rad opposite; arms ±0.45 opposite to legs.
- **Bob:** `body.y = abs(sin(phase)) * 0.04` while walking.
- **Facing:** lerp `group.rotation.y` toward travel yaw at ~12 rad/s (not instant).
- **Arrive:** last 0.4 u slow to 55% speed; then start sit ease facing destination.

### Sit / stand transition

- Duration **0.32 s**, ease-out cubic.
- Interpolate: body Y (−0.12 seated ↔ 0 stand), legs X (−π/2 ↔ 0), arms toward target pose.
- Never start a new path mid-sit-ease; queue the route until ease completes *or* blend carefully (prefer queue).

### Desk — `working`

- **Type:** forearm (armR) oscillates −0.85…−0.55 at ~5.5 Hz irregular (use two sines).
- **Other arm:** rests near −0.65 with tiny sway.
- **Head:** slow look ±0.12 rad yaw, period 4–7 s (per-bot phase).
- **Lean:** torso Z rotation ±0.04 toward screen.
- Optional: very small keyboard “tap” is implied by arm only (no new meshes).

### Desk — `waiting`

- Arms mostly still (−0.55).
- Head scans left–right more (±0.22, ~2.5 s period).
- Occasional foot bounce: one leg ±0.08 every ~3 s.

### Desk — `error`

- Faster head shake (±0.18, 1.4 s) for 1.2 s after entering error, then settle to waiting-like pose with arms slightly raised (−0.4).

### Lounge — `idle` / after `done`

- Seated breathe: body Y ±0.015, period ~3.2 s.
- Occasional weight shift: lean ±0.05 every 5–9 s.
- Arms relaxed (−0.45) with tiny sway.
- Lead bot idle in glass office uses same breathe (no lounge sofa bounce).

### Handoff (`done` walk to tray)

- Carry pose: armL locked −1.15 with parcel visible.
- Slight forward lean while walking.
- On arrive: 1.5–2.0 s hold, then release parcel and route to lounge/desk.

## Routing policy

1. **Default:** always `route()` and walk.
2. **Snap only** when: (a) first paint / hard resync after auth, or (b) distance > 28 **and** bot was already supposed to be at destination (desync repair). Simulate Work must **not** snap for normal state changes.
3. Re-asserting the same desk while already seated and within 0.6 u: no-op (keep micro-motion).

## Simulate timing

- Start ~70% working (keep).
- Working dwell ≥ 10–14 s before done/waiting.
- Idle → working chance lower; interval tick 1.2–1.5 s OK if dwells are long.
- Goal: most bots finish walk-to-desk before flipping away.

## Camera / tags

- Motion must not make tags jitter; tags already project from head — keep head motion small (±0.12–0.22).
- No camera shake.

## Implementation map

| Module | Responsibility |
|---|---|
| `MOTION.md` | This brief |
| `src/bots/motion.ts` | Easing helpers, gait, pose blend targets |
| `src/bots/bot.ts` | Integrate motion into `update` / `setState` / arrive |
| `src/bots/simulate.ts` | Longer dwells |

## Acceptance

- [ ] Simulate: bots walk to desks with visible gait (no teleport).
- [ ] At desks: continuous typing / glance / breathe — never frozen.
- [ ] Sit/stand takes ~⅓ s, not a pop.
- [ ] `npm run build` clean.
- [ ] Feels calm and expensive, not busy or gimmicky.

## References (feel, not code)

- AI Office / Agent Office: gait + desk screen life
- Game UI: “juice” via easing, not speed
- Apple HIG motion: purposeful, brief, consistent
