# Bot Office build notes

Run: `npm run dev` (http://localhost:5173). Demo: `/?simulate=1` or click **Simulate Work**.
Skip the password gate locally: `VITE_DEV_SKIP_AUTH=1 npm run dev`. The gate only appears when `/api/status` returns 401.

```
src/main.ts              renderer, camera, polling, sim toggle, render loop
src/api/status.ts        GET /api/status, POST /api/login, stale (10 min) + quiet (45 min) rules
src/bots/team.ts         roster: ids, colors, departments, accessories
src/bots/bot.ts          blocky bot mesh, state → place (desk/lounge/handoff), aisle pathing
src/bots/simulate.ts     browser-only demo day (never calls the API)
src/office/build.ts      floor, zones with carpet lettering, glass lead office, lounge, break room,
                         server racks (blinking LEDs), research screens (chart/US map/terminal), plants
src/office/usageBoard.ts wall counter for weekly usage left + reset
src/office/layout.ts     zone coordinates, seats, aisles, corridors
src/office/materials.ts  matte Lambert materials, crisp canvas textures (mipmaps + max anisotropy)
src/ui/overlay.ts        HTML name tags (integer-pixel pinned; full name + status on hover/tap)
src/ui/hud.ts            Simulate button, Simulation label, feed warning, password gate
src/ui/feedlog.ts        status lines actually received (feeds the terminal screen)
```

Worker contract: `GET /api/status` → `{ bots:[{id,name,state,statusLine,updatedAt}], usage?:{remaining,resetAt}, feedHealthy, lastHeartbeat? }`,
`POST /api/login {password}` → sets an HttpOnly session cookie. Polls every 20 s.

Quality choices: pixelRatio = devicePixelRatio (never lower), MSAA on, no post-processing/bloom (dropped for sharpness),
Lambert only (no specular shimmer), no bobbing when idle or seated, no path lines.

## Backend (Cloudflare Worker + Durable Object)

```
worker/index.ts        Worker: /api/* routes, cron heartbeat, serves dist/ via ASSETS; OfficeState Durable Object
worker/tsconfig.json   types for the Worker (@cloudflare/workers-types)
wrangler.toml          DO binding OFFICE (sqlite class, migration v1), assets ./dist (SPA), cron */5 * * * *
scripts/push-status.mjs  CLI bots call to push status / usage
.dev.vars.example      local-only placeholder secrets (copy to .dev.vars, which is gitignored)
```

Endpoints
- `POST /api/login {password}` → compares to `OFFICE_SITE_PASSWORD`; sets `office_session` cookie (HttpOnly, Secure, SameSite=Strict, 7 days, HMAC-signed).
- `GET /api/status` (cookie) → `{bots, usage?, feedHealthy, lastHeartbeat?}`. `feedHealthy` = cron heartbeat seen in the last 45 min.
- `POST /api/status` (`Authorization: Bearer $STATUS_PUSH_TOKEN`) → `{id|name, state: idle|working|waiting|error|done, statusLine?}`. Only the 10 roster bots are accepted. Lines are flattened, URLs/emails/long numbers masked, cut to 120 chars. Body max 4 KB.
- `POST /api/usage` (same token) → `{remaining, resetAt}`.
- Cron every 5 min writes `lastHeartbeat`. The frontend treats working/waiting older than 10 min as idle.

Secrets (never in files or git)
```
npx wrangler login                          # or export CLOUDFLARE_API_TOKEN (secret field, not chat)
npx wrangler secret put OFFICE_SITE_PASSWORD   # the password you made up for the site
npx wrangler secret put STATUS_PUSH_TOKEN      # e.g. paste output of: openssl rand -hex 32
```

Deploy
```
npm run build && npx wrangler deploy
```
First deploy creates the Durable Object (migration v1) and the cron. URL: `https://bot-office.<your-subdomain>.workers.dev`.

Local
```
cp .dev.vars.example .dev.vars && npm run build && npx wrangler dev --test-scheduled
```
(Cron test: `/__scheduled` is shadowed by the SPA asset fallback; temporarily add it to `run_worker_first` to trigger locally.)

Bots push status
```
export OFFICE_STATUS_URL=https://bot-office.<sub>.workers.dev OFFICE_STATUS_TOKEN=<STATUS_PUSH_TOKEN>
node scripts/push-status.mjs Mibot working "Reviewing a PR"
node scripts/push-status.mjs <bot-uuid> done
node scripts/push-status.mjs --usage 62 2026-11-02T00:00:00Z
```
Note: compatibility_date is 2026-05-01 because local wrangler 4.86 can't run newer dates.
