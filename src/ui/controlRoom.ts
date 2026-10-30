import { TEAM } from '../bots/team';
import type { StatusPayload } from '../api/status';

export function controlRoom() {
  const header = document.createElement('header');
  header.className = 'office-header';
  header.innerHTML = '<div class="brand-mark">B</div><div><h1>Bot Office</h1><p>Your Grok team, together.</p></div><span class="mode">Connecting</span><button class="directory-toggle">Team</button>';
  const sidebar = document.createElement('aside'); sidebar.className = 'directory';
  sidebar.innerHTML = '<div class="section-heading"><h2>The team</h2><span>11 agents</span></div><div class="summary"></div><div class="roster"></div><section class="agent-detail" hidden></section><section class="usage-card"><h2>Weekly usage</h2><p>Usage unavailable</p></section><section><div class="section-heading"><h2>Activity</h2><span class="activity-kind">Observed this session</span></div><ol class="activity"></ol></section>';
  const toolbar = document.createElement('nav'); toolbar.className = 'camera-tools'; toolbar.setAttribute('aria-label', 'Office view');
  toolbar.innerHTML = '<button data-action="fit">Fit office</button><button data-action="in" aria-label="Zoom in">+</button><button data-action="out" aria-label="Zoom out">−</button><button data-action="labels" aria-pressed="true">Labels</button><button data-action="pause" aria-pressed="false">Pause motion</button>';
  document.body.append(header, sidebar, toolbar);
  header.querySelector('button')!.addEventListener('click', () => document.body.classList.toggle('show-team'));
  const rows = new Map<string, HTMLButtonElement>(); let selected = ''; let payload: StatusPayload = { bots: [], feedHealthy: false }; let demo = false;
  const seen = new Map<string, string>();
  const statusText = (s: StatusPayload['bots'][number] | undefined) => !s ? 'No status received' : `${s.state}${Date.now() - Date.parse(s.updatedAt) > 600000 ? ' · stale' : ''}`;
  function details() {
    const m = TEAM.find(m => m.id === selected); if (!m) return;
    const s = payload.bots.find(b => b.id === selected); const box = sidebar.querySelector<HTMLElement>('.agent-detail')!; box.hidden = false; box.replaceChildren();
    const title = document.createElement('h2'); title.textContent = m.name;
    const role = document.createElement('p'); role.textContent = m.role || m.dept;
    const line = document.createElement('p'); line.textContent = s?.statusLine || statusText(s);
    const time = document.createElement('small'); time.textContent = s ? `${statusText(s)} · Updated ${new Date(s.updatedAt).toLocaleTimeString()}` : 'No status received';
    const focus = document.createElement('button'); focus.textContent = 'Focus in office'; focus.onclick = () => document.dispatchEvent(new CustomEvent('office-focus', { detail: selected }));
    box.append(title, role, line, time, focus);
  }
  function select(id: string) { selected = id; for (const [key, row] of rows) row.setAttribute('aria-pressed', String(key === id)); details(); document.dispatchEvent(new CustomEvent('office-selection', { detail: id })); }
  document.addEventListener('office-select', (e) => select((e as CustomEvent).detail));
  for (const m of TEAM) {
    const row = document.createElement('button'); row.className = 'agent-row'; row.setAttribute('aria-pressed', 'false');
    const avatar = document.createElement('span'); avatar.className = 'avatar'; avatar.style.background = m.color; avatar.textContent = m.short.slice(0, 1).toUpperCase();
    const content = document.createElement('span'); content.className = 'agent-copy';
    const name = document.createElement('strong'); name.textContent = m.short;
    const dept = document.createElement('small'); dept.textContent = m.dept;
    const status = document.createElement('span'); status.className = 'agent-status'; status.textContent = 'No status received';
    content.append(name, dept, status); row.append(avatar, content); row.onclick = () => select(m.id); sidebar.querySelector('.roster')!.append(row); rows.set(m.id, row);
  }
  return {
    toolbar,
    update(p: StatusPayload, simulated: boolean) {
      if (demo !== simulated) { seen.clear(); sidebar.querySelector('.activity')!.replaceChildren(); }
      payload = p; demo = simulated;
      header.querySelector('.mode')!.textContent = simulated ? 'Simulation · demo data' : 'Live · refreshed ' + new Date().toLocaleTimeString();
      sidebar.querySelector('.activity-kind')!.textContent = simulated ? 'Simulated' : 'Observed this session';
      const counts = ['working', 'waiting', 'error', 'idle', 'done'].map(state => `${p.bots.filter(b => b.state === state).length} ${state}`);
      sidebar.querySelector('.summary')!.textContent = counts.join('  ·  ');
      for (const m of TEAM) {
        const s = p.bots.find(b => b.id === m.id); const row = rows.get(m.id)!;
        row.querySelector('.agent-status')!.textContent = statusText(s); row.dataset.state = s?.state || 'unknown';
        const key = s ? `${s.state}|${s.statusLine}` : '';
        if (s && seen.get(m.id) !== key) {
          const item = document.createElement('li'); item.textContent = `${new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} · ${m.short} — ${s.statusLine || s.state}`;
          const list = sidebar.querySelector('.activity')!; list.prepend(item); while (list.children.length > 30) list.lastElementChild!.remove(); seen.set(m.id, key);
        }
      }
      sidebar.querySelector('.usage-card p')!.textContent = !simulated && p.usage ? `${p.usage.remaining}${typeof p.usage.remaining === 'number' ? '%' : ''} remaining · Resets ${new Date(p.usage.resetAt).toLocaleString()}` : 'Usage unavailable' + (simulated ? ' in demo' : '');
      details();
    }
  };
}
