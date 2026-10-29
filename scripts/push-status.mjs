#!/usr/bin/env node
// Usage: OFFICE_STATUS_URL=https://bot-office.<sub>.workers.dev OFFICE_STATUS_TOKEN=... \
//   node scripts/push-status.mjs <bot id or name> <idle|working|waiting|error|done> ["short generic line"]
//   node scripts/push-status.mjs --usage <remaining> <resetAt ISO>
// Never fails the caller's task: errors are printed, exit code stays 0 unless args are wrong.
const base = (process.env.OFFICE_STATUS_URL || '').replace(/\/+$/, '');
const token = process.env.OFFICE_STATUS_TOKEN;
const args = process.argv.slice(2);
if (!base || !token) { console.error('Set OFFICE_STATUS_URL and OFFICE_STATUS_TOKEN'); process.exit(2); }
let path, body;
if (args[0] === '--usage') {
  if (args.length < 3) { console.error('usage: --usage <remaining> <resetAt>'); process.exit(2); }
  const n = Number(args[1]);
  path = '/api/usage'; body = { remaining: Number.isFinite(n) ? n : args[1], resetAt: args[2] };
} else {
  const [who, state, ...rest] = args;
  if (!who || !state) { console.error('usage: <bot> <state> [line]'); process.exit(2); }
  const line = rest.join(' ').replace(/\s+/g, ' ').trim().slice(0, 120);
  const key = /^[0-9a-f-]{36}$/i.test(who) ? 'id' : 'name';
  path = '/api/status'; body = { [key]: who, state, statusLine: line };
}
try {
  const r = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, 'user-agent': 'BotOfficeStatus/1.0 (compatible; Mozilla/5.0)' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000) });
  const t = await r.text();
  console.log(r.status, t);
} catch (e) { console.error('push failed:', e.message); }
