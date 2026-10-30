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
