import type { StatusPayload, BotState } from '../api/status';
import { TEAM } from './team';
/** Browser-only demo day. Produces an in-memory payload; never touches the API. */
const LINES: Record<BotState, string[]> = {
  working: ['Working on a task', 'Drafting a reply', 'Reviewing notes', 'Checking sources'],
  waiting: ['Waiting on Shaq'], error: ['Hit an error, retrying'], done: ['Task done, handing off'], idle: [''],
};
export class Simulation {
  running = false; private timer = 0; private state = new Map<string, { state: BotState; at: number }>();
  start(onTick: (p: StatusPayload) => void) {
    this.running = true; const now = Date.now();
    TEAM.forEach((m, i) => this.state.set(m.id, { state: i % 3 === 0 ? 'working' : 'idle', at: now }));
    const tick = () => {
      const t = Date.now();
      for (const m of TEAM) {
        const s = this.state.get(m.id)!; const age = t - s.at;
        let next: BotState | null = null;
        if (s.state === 'idle' && Math.random() < 0.18) next = 'working';
        else if (s.state === 'working' && age > 5000 && Math.random() < 0.3) { const r = Math.random(); next = r < 0.7 ? 'done' : r < 0.9 ? 'waiting' : 'error'; }
        else if ((s.state === 'waiting' || s.state === 'error') && age > 4000) next = 'working';
        else if (s.state === 'done' && age > 6000) next = 'idle';
        if (next) this.state.set(m.id, { state: next, at: t });
      }
      onTick({ feedHealthy: true, bots: TEAM.map((m) => { const s = this.state.get(m.id)!; const l = LINES[s.state]; return { id: m.id, name: m.name, state: s.state, statusLine: l[Math.floor(Math.random() * l.length) % l.length], updatedAt: new Date(s.at).toISOString() }; }) });
    };
    tick(); this.timer = window.setInterval(tick, 1500);
  }
  stop() { this.running = false; clearInterval(this.timer); }
}
