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
    TEAM.forEach((m, i) => this.state.set(m.id, { state: i % 5 === 0 ? 'idle' : 'working', at: now }));
    const tick = () => {
      const t = Date.now();
      for (const m of TEAM) {
        const s = this.state.get(m.id)!; const age = t - s.at;
        let next: BotState | null = null;
        if (s.state === 'idle' && Math.random() < 0.22) next = 'working';
        else if (s.state === 'working' && age > 35000 && Math.random() < 0.18) {
          const r = Math.random(); next = r < 0.6 ? 'done' : r < 0.85 ? 'waiting' : 'error';
        } else if ((s.state === 'waiting' || s.state === 'error') && age > 5000) next = 'working';
        else if (s.state === 'done' && age > 25000) next = Math.random() < 0.6 ? 'working' : 'idle';
        if (next) this.state.set(m.id, { state: next, at: t });
      }
      onTick({ feedHealthy: true, bots: TEAM.map((m) => {
        const s = this.state.get(m.id)!; const l = LINES[s.state];
        return { id: m.id, name: m.name, state: s.state, statusLine: l[Math.floor(s.at / 1000) % l.length], updatedAt: new Date(s.at).toISOString() };
      }) });
    };
    tick(); this.timer = window.setInterval(tick, 1400);
  }
  stop() { this.running = false; clearInterval(this.timer); }
}
