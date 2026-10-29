# Architecture

Bot Office is a password-gated **isometric ops floor** that mirrors live Grok Bot roster state. The browser never holds push credentials; bots publish status to a Worker that stores state in a Durable Object.

## System context

```mermaid
flowchart LR
  subgraph clients [Clients]
    SPA[Vite + Three.js SPA]
    Bots[Grok Bots / push-status.mjs]
  end
  subgraph cf [Cloudflare]
    W[Worker bot-office]
    DO[(OfficeState SQLite DO)]
    Assets[Static assets]
    Cron[Cron every 5 min]
  end
  SPA -->|GET /api/status cookie| W
  SPA -->|POST /api/login| W
  Bots -->|POST /api/status Bearer| W
  Bots -->|POST /api/usage Bearer| W
  W --> DO
  W --> Assets
  Cron --> W
  W --> DO
```

## Orchestration

```mermaid
flowchart LR
  subgraph Roster["Grok Bot roster (11 agents)"]
    A["Alfred · Ops lead / chief advisor"]
    N["niẓām · Life assistant"]
    S1["NSU · Study buddy"]
    L["Lamar · Other-uni study"]
    V["Victoria · Deadlines"]
    M["Mentor · Growth"]
    F["Fitness · Health"]
    MB["Mibot · Engineering / GitHub"]
    SW["SWE · Software engineer"]
    R["Ram-Hunt · Hardware / RAM"]
    E["dr eggbot · Bot Lab"]
  end
  Roster -- "push-status.mjs<br/>Bearer STATUS_PUSH_TOKEN" --> W["Cloudflare Worker<br/>/api/status · /api/usage"]
  C["Cron */5"] -- heartbeat --> DO
  W --> DO[("OfficeState<br/>SQLite Durable Object")]
  SPA["SPA (Three.js floor)"] -- "GET /api/status every 20s<br/>session cookie (password)" --> W
  W -- "roster states + usage" --> SPA
  G["Guest visitor"] -- "no password" --> SIM["Client-only Simulate Work<br/>(?simulate=1)"] --> SPA
  SPA --> FL["Office floor: desks, lounge,<br/>lead office, usage board"]
```

- **Live path** — bots push `idle | working | waiting | error | done` with a Bearer token; the Worker validates against its roster and stores it in the Durable Object; logged-in browsers poll it.
- **Guest path** — without a session the SPA gets 401 and auto-runs the simulation locally; nothing real is exposed. "Sign in for live status" opens the password gate.
- **Heartbeat** — cron keeps feed health fresh; the HUD warns when the feed is quiet 45+ min.

## Request paths

| Path | Auth | Role |
|------|------|------|
| `POST /api/login` | Shared site password | Sets `office_session` HttpOnly cookie (7d, HMAC) |
| `GET /api/status` | Session cookie | Returns bots, usage, `feedHealthy` |
| `POST /api/status` | `Authorization: Bearer STATUS_PUSH_TOKEN` | Upsert one roster bot |
| `POST /api/usage` | Bearer token | Weekly remaining + reset |
| `/*` | — | SPA from `ASSETS` (`run_worker_first` for `/api/*`) |

## Durable Object `OfficeState`

Single DO id `office` holds:

- `bots`: map of roster UUID → `{ id, name, state, statusLine, updatedAt }`
- `usage`: `{ remaining, resetAt, updatedAt }`
- `lastHeartbeat`: ISO time from cron (feed healthy if &lt; 45 minutes old)

Unknown bots are rejected. Status lines are sanitized (URLs/emails/long digit runs masked, max 120 chars).

## Frontend effective state

- Poll `/api/status` every 20s.
- `working` / `waiting` older than **10 minutes** render as idle.
- Long lounge→desk trips **snap**; short hops walk.
- `?simulate=1` or **Simulate Work** runs a client-only day (no API writes).

## Status publishers

Bots source `/home/box/agent-data/bot-office-status.env` (never committed) and run:

```bash
node scripts/push-status.mjs <name-or-uuid> <idle|working|waiting|error|done> "short line"
node scripts/push-status.mjs --usage <remaining> <resetAt-ISO>
```

## Security notes

- Site password and push token are **Worker secrets only**.
- Cookie: `Secure; HttpOnly; SameSite=Strict`.
- Push token compared via HMAC digest equality helper.
- Do not put secrets in git, chat, or screenshots.
