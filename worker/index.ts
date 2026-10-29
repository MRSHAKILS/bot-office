import { DurableObject } from 'cloudflare:workers';

export interface Env {
  OFFICE: DurableObjectNamespace<OfficeState>;
  ASSETS: Fetcher;
  OFFICE_SITE_PASSWORD: string;
  STATUS_PUSH_TOKEN: string;
}

// Allowed roster (ids from src/bots/team.ts). Unknown bots are rejected.
const ROSTER: Record<string, string> = {
  'cbae969e-3163-46eb-ab58-23e3f341f26d': 'Alfred',
  '008dd220-3d73-4eb1-aba7-168ef890168e': 'niẓām',
  '8d8c2db0-fb0d-4701-8965-bab6fed9e397': 'NSU · Study buddy',
  '0b3c7f02-8dd6-4e5d-9e95-a70ae7786823': 'Lamar',
  '404a85ba-453a-403a-9c4d-7787f9ae3a77': 'Victoria',
  '80381437-13be-4b95-9f83-c85632a12fac': 'Mentor',
  'ba5b82e3-ebd9-4abe-b6a0-e9c3ddb43a5d': 'Fitness',
  '9af0c291-72b5-4478-b261-1f6717350ee8': 'Mibot',
  'a659b8f6-fe6f-4387-8e5b-62834e2f4df3': 'Ram-Hunt',
  'f585d306-3c01-4457-97ed-e2f4a2c5fae1': 'dr eggbot',
};
const STATES = new Set(['idle', 'working', 'waiting', 'error', 'done']);
const MAX_LINE = 120;
const QUIET_MS = 45 * 60 * 1000;
const SESSION_S = 7 * 24 * 3600;
const COOKIE = 'office_session';

type Bot = { id: string; name: string; state: string; statusLine: string; updatedAt: string };

const json = (b: unknown, status = 200, h: Record<string, string> = {}) =>
  new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...h } });

function resolveId(v: { id?: unknown; name?: unknown }): string | null {
  if (typeof v.id === 'string' && ROSTER[v.id]) return v.id;
  if (typeof v.name === 'string') {
    const n = v.name.trim().toLowerCase();
    for (const [id, name] of Object.entries(ROSTER)) if (name.toLowerCase() === n || name.toLowerCase().startsWith(n + ' ')) return id;
  }
  return null;
}

/** Keep status lines short and generic: one line, no URLs/emails/long digit runs, max 120 chars. */
export function cleanLine(s: unknown): string {
  if (typeof s !== 'string') return '';
  let t = s.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
  t = t.replace(/https?:\/\/\S+/gi, '[link]').replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email]').replace(/\d[\d\s-]{6,}\d/g, '[number]');
  if (t.length > MAX_LINE) t = t.slice(0, MAX_LINE - 1).trimEnd() + '…';
  return t;
}

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, (c) => (c === '+' ? '-' : c === '/' ? '_' : ''));
}
async function safeEqual(a: string, b: string): Promise<boolean> {
  // compare digests to avoid length/timing leaks
  const [x, y] = await Promise.all([hmac('cmp', a), hmac('cmp', b)]);
  let r = x.length ^ y.length;
  for (let i = 0; i < x.length; i++) r |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return r === 0;
}
async function makeSession(env: Env): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_S;
  return `${exp}.${await hmac('session:' + env.OFFICE_SITE_PASSWORD, String(exp))}`;
}
async function validSession(req: Request, env: Env): Promise<boolean> {
  const m = (req.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m || !env.OFFICE_SITE_PASSWORD) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || Number(exp) * 1000 < Date.now()) return false;
  return safeEqual(sig, await hmac('session:' + env.OFFICE_SITE_PASSWORD, exp));
}
async function validPushToken(req: Request, env: Env): Promise<boolean> {
  const h = req.headers.get('authorization') || '';
  const tok = h.startsWith('Bearer ') ? h.slice(7) : '';
  return !!env.STATUS_PUSH_TOKEN && !!tok && safeEqual(tok, env.STATUS_PUSH_TOKEN);
}
const stub = (env: Env) => env.OFFICE.get(env.OFFICE.idFromName('office'));

export class OfficeState extends DurableObject<Env> {
  async getAll() {
    const bots = ((await this.ctx.storage.get<Record<string, Bot>>('bots')) || {}) as Record<string, Bot>;
    const usage = await this.ctx.storage.get<{ remaining: number | string; resetAt: string; updatedAt: string }>('usage');
    const lastHeartbeat = await this.ctx.storage.get<string>('lastHeartbeat');
    return { bots, usage, lastHeartbeat };
  }
  async setBot(b: Bot) {
    const bots = ((await this.ctx.storage.get<Record<string, Bot>>('bots')) || {}) as Record<string, Bot>;
    bots[b.id] = b;
    await this.ctx.storage.put('bots', bots);
  }
  async setUsage(u: { remaining: number | string; resetAt: string; updatedAt: string }) { await this.ctx.storage.put('usage', u); }
  async heartbeat(at: string) { await this.ctx.storage.put('lastHeartbeat', at); }
}

async function readJson(req: Request): Promise<any> {
  if ((Number(req.headers.get('content-length')) || 0) > 4096) return null;
  try { const t = await req.text(); return t.length > 4096 ? null : JSON.parse(t); } catch { return null; }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const p = url.pathname;

    if (p === '/api/login' && req.method === 'POST') {
      const body = await readJson(req);
      if (!env.OFFICE_SITE_PASSWORD) return json({ error: 'not configured' }, 503);
      if (!body || typeof body.password !== 'string' || !(await safeEqual(body.password, env.OFFICE_SITE_PASSWORD)))
        return json({ ok: false }, 401);
      const cookie = `${COOKIE}=${await makeSession(env)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_S}`;
      return json({ ok: true }, 200, { 'set-cookie': cookie });
    }
    if (p === '/api/logout' && req.method === 'POST')
      return json({ ok: true }, 200, { 'set-cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` });

    if (p === '/api/status' && req.method === 'GET') {
      if (!(await validSession(req, env))) return json({ error: 'unauthorized' }, 401);
      const { bots, usage, lastHeartbeat } = await stub(env).getAll();
      const hb = lastHeartbeat ? Date.parse(lastHeartbeat) : 0;
      return json({
        bots: Object.values(bots),
        ...(usage ? { usage: { remaining: usage.remaining, resetAt: usage.resetAt } } : {}),
        feedHealthy: !!hb && Date.now() - hb < QUIET_MS,
        ...(lastHeartbeat ? { lastHeartbeat } : {}),
      });
    }
    if (p === '/api/status' && req.method === 'POST') {
      if (!(await validPushToken(req, env))) return json({ error: 'unauthorized' }, 401);
      const body = await readJson(req);
      if (!body) return json({ error: 'bad json or too large' }, 400);
      const id = resolveId(body);
      if (!id) return json({ error: 'unknown bot' }, 400);
      if (!STATES.has(body.state)) return json({ error: 'state must be idle|working|waiting|error|done' }, 400);
      const bot: Bot = { id, name: ROSTER[id], state: body.state, statusLine: cleanLine(body.statusLine), updatedAt: new Date().toISOString() };
      await stub(env).setBot(bot);
      return json({ ok: true, bot });
    }
    if (p === '/api/usage' && req.method === 'POST') {
      if (!(await validPushToken(req, env))) return json({ error: 'unauthorized' }, 401);
      const body = await readJson(req);
      const rem = body?.remaining;
      const okRem = (typeof rem === 'number' && isFinite(rem)) || (typeof rem === 'string' && rem.length <= 24);
      if (!body || !okRem || typeof body.resetAt !== 'string' || isNaN(Date.parse(body.resetAt)))
        return json({ error: 'need {remaining:number|short string, resetAt:ISO date}' }, 400);
      await stub(env).setUsage({ remaining: rem, resetAt: new Date(body.resetAt).toISOString(), updatedAt: new Date().toISOString() });
      return json({ ok: true });
    }
    if (p.startsWith('/api/')) return json({ error: 'not found' }, 404);
    return env.ASSETS.fetch(req);
  },

  async scheduled(_c: ScheduledController, env: Env) {
    try { await stub(env).heartbeat(new Date().toISOString()); } catch (e) { console.error("heartbeat failed", (e as Error).stack); throw e; }
  },
} satisfies ExportedHandler<Env>;
