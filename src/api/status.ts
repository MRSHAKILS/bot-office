export type BotState = 'idle'|'working'|'waiting'|'error'|'done';
export interface BotStatus { id: string; name: string; state: BotState; statusLine: string; updatedAt: string; }
export interface StatusPayload { bots: BotStatus[]; usage?: { remaining: number | string; resetAt: string }; feedHealthy: boolean; lastHeartbeat?: string; }
export const STALE_WORKING_MS = 10 * 60 * 1000;
export const QUIET_WARN_MS = 45 * 60 * 1000;

export class UnauthorizedError extends Error {}

export async function fetchStatus(): Promise<StatusPayload> {
  const r = await fetch('/api/status', { credentials: 'same-origin', headers: { accept: 'application/json' } });
  if (r.status === 401) throw new UnauthorizedError('auth');
  if (!r.ok) throw new Error('status ' + r.status);
  const ct = r.headers.get('content-type') || '';
  if (!ct.includes('json')) throw new Error('no api');
  return r.json();
}

export async function login(password: string): Promise<boolean> {
  try {
    const r = await fetch('/api/login', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }) });
    return r.ok;
  } catch { throw new Error('Connection failed'); }
}

/** Preserve reported state; freshness is displayed separately. */
export function effectiveState(s: BotStatus | undefined, _now = Date.now()): BotState { return s?.state ?? 'idle'; }

/** Newest timestamp seen in the feed (bot updates or heartbeat). */
export function lastActivity(p: StatusPayload): number {
  let t = p.lastHeartbeat ? Date.parse(p.lastHeartbeat) : 0;
  for (const b of p.bots) t = Math.max(t, Date.parse(b.updatedAt) || 0);
  return t;
}
