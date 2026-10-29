# Bot Office — professional visual brief (v2)

Act like a senior product designer + Three.js technical artist shipping a client-facing floor plan, not a student demo.

## North star
A calm, premium **isometric ops floor** — closer to a Linear/Notion/Vercel status wall crossed with a tidy low-poly architectural model. Matte materials, crisp edges, intentional empty space, readable hierarchy. Never toyish, never muddy beige soup.

## Palette (locked)
- Atmosphere / clearcoat void: `#e8e6e1`
- Floor slab: `#f4f2ec` with soft `#ddd8ce` grid (very subtle, 1px equiv)
- Walls: `#f7f5f0` with `#cfc9bd` baseboard; glass `#9eb7c8` at 18% opacity, thin white frames
- Zone carpets: muted department tint at 12% over floor (not loud plastic mats)
- Desk wood: `#c4a882` · chairs: `#3a3f46` · monitors: `#1c1f24` bezel, `#0b0d10` screen
- UI chrome (HTML): white / `#111827` text / hairline `#e5e7eb` borders; one accent `#2563eb`
- Status dots only: idle `#9ca3af` · working `#22c55e` · waiting `#eab308` · error `#ef4444` · done `#3b82f6`

## Composition
- True isometric orthographic; default framing shows **full floor with ~8% margin** (desktop-first).
- Lead glass office clearly separate; lounge as a designed seating nook (not a bot pile); server racks tidy; research wall with one sharp screen.
- Plants sparse and sculpted (max 8). No clutter props.

## Bots
- Readable silhouettes, soft rounded blocks, **unique color per roster** (keep TEAM colors).
- Idle → lounge seats with spacing (never overlapping meshes). Working/waiting/error → **own desk**, seated.
- Walk or snap: long lounge→desk trips may snap; short hops walk at ~5.5 u/s. No path lines. No idle bobbing.
- Accessories stay; scale so they don’t dominate.

## Labels (HTML overlay)
- Default: short name + status dot only.
- Hover/tap: full name · dept · status line.
- Collision: if two tags closer than 28px, stagger vertically or fade the lower-priority idle tag.
- Integer pixel transforms (no subpixel shimmer).

## HUD
- Password gate: centered card, large type, no gimmicks.
- Simulate control: small secondary button, bottom-center; Simulation pill when on.
- Feed warning: quiet amber chip, top-right — only when real.
- Optional tiny live chip: `N working` from last poll (professional, not gamer HUD).

## Technical quality bar
- `devicePixelRatio` uncapped; MSAA on; **no bloom/DOF**.
- Lambert/matte only — no specular disco.
- Canvas textures: no mipmap blur on text; max anisotropy for carpets/signage.
- Shadow: soft PCF, single sun; bias tuned; don’t crush performance (2048 map ok).
- 60fps target on desktop; degrade shadows before clarity.

## Explicit anti-goals
- Muddy beige everything the same value
- Overlapping name tags in a bot pile
- Tiny dollhouse floating mid-screen
- Neon cyberpunk, comic outlines, emoji props
- Fake “busy” particle junk

## Done when
Desktop screenshots look like a product marketing still; all 11 bots readable; working bots at desks; idle bots spaced in lounge; usage board legible; password gate polished.

## Fishbowl + stations
Glass curtain on south/east, per-bot stations (stations.ts) and bot outfits (styles.ts). See docs/UPGRADE-NOTES.md.
