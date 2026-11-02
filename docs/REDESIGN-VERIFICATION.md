# Control-room redesign verification

Branch: redesign/office-control-room

Implemented: dark application shell, team directory and selected-agent details, observed activity deduplication, readable usage fallback, camera toolbar, responsive directory, keyboard-operable tags and password dialog, preserved stale reported states, browser-only handoffs, native-resolution rendering, motion pause, still idle poses, removal of distance-based teleportation, curved lead-office enclosure, procedural oak floor.

Validation: TypeScript and Vite production build passed. Browser rendered public simulation and selecting SWE displayed its Software role and status. Production bundle is approximately 624 kB (162 kB gzip); Vite warns about chunk size.

Not yet verified: authenticated live session and cookie forwarding through Vercel, complete movement/collision audit, reduced-motion transitions, exact one-second idle image comparison, sustained performance, WebGL-unavailable fallback. Label collision placement still uses the original approximate algorithm. No usage-tool integration or external bot-instruction changes were possible in this checkout. No status-push credential was supplied. No Cloudflare deployment or token rotation was performed.

Vercel routes /api/* to the existing Cloudflare Worker. This preserves the backend rather than migrating its Durable Object. Successful login and authenticated refresh require acceptance testing with the user's password through the site's password field; never place credentials in this document.

## Typing and camera follow-up
Replaced whole-arm rapid typing with articulated elbows and small alternating taps; aligned keyboards and desk-height offsets; handheld props hidden at keyboard. Restored right-drag pan, left-drag orbit, wider orbit range and context-menu suppression. Added visible mouse hints, measured label collision bounds and continuous seated-pose blending. Build and local zoomed scene inspection performed. Native right-button drag itself still requires manual verification; browser drag automation exposes no mouse-button option. No claim of exhaustive all-agent collision or live-auth verification.

## Pan correction
Both mouse buttons pan in screen space by default. Orbit toggles left-drag rotation. Removed per-axis target clamps. Visually verified a horizontal rightward drag followed by a leftward/upward drag in the local browser. This supersedes previous left-drag orbit defaults.

## Final camera correction (2026-11-02)
Left-drag rotates directly; right-drag pans; wheel zooms. Removed the Orbit toggle and all azimuth bounds. Locally verified horizontal rotation with a sideways drag and vertical tilt with a vertical drag. Previous pan-only defaults above are superseded.

## 2026-11-03 simulation roster and workspace verification

- Public roster: 12 demo-only IDs, including Perplexity / Research, Claude / QA, Jasper / Marketing, ChatGPT / Product, Gemini / Data Lab. Original 11 live identities and backend roster unchanged.
- Specialized demo station configurations do not modify live workstation configs. Added Data Lab in the former open research area, removed the overlapping large rug in demo, and expanded lounge seating to 12.
- `node scripts/check-motion.mjs`: 93,840 fixed-step samples across both rosters; no large position jumps, floor-boundary violations, or crossings of another agent's desk footprint; all agents reached their desk and lounge after simulated completion; idle pose stable.
- These checks cover route animation and desk clearance, not rigid-body physics, inter-agent collision avoidance, or all furniture/glass collision volumes.
- Production build passes. Video capture tooling is gated by import.meta.env.DEV and absent from the production output.

- Mixed 100/800ms frame-gap checks pass for Fitness, SWE and Gemini under repeated working-status updates; journeys still reach their desk.
- Browser inspection confirmed the new 12-person demo directory, matching carpets, QA role details, day lighting, horizontal rotation, and cancelled sign-in retaining simulation. Direct live mode shows the original 11 names; returning to simulation loads the 12 demo identities.
- Authenticated live data was not verified locally: the Vite-only server has no live Worker API. This is not an end-to-end production auth test.
