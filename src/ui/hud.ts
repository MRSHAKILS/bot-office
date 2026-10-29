import { login } from '../api/status';
export function hud(app: HTMLElement) {
  const bar = document.createElement('div'); bar.className = 'bar';
  bar.innerHTML = `<button id="sim">Simulate Work</button>`;
  const simLabel = document.createElement('div'); simLabel.className = 'simlabel'; simLabel.textContent = 'Simulation'; simLabel.hidden = true;
  const warn = document.createElement('div'); warn.className = 'warn'; warn.hidden = true;
  const live = document.createElement('div'); live.className = 'live'; live.innerHTML = '<span class="dot"></span><span class="n">0 working</span>';
  app.append(bar, simLabel, warn, live);
  return {
    simBtn: bar.querySelector('#sim') as HTMLButtonElement,
    setSim(on: boolean) { simLabel.hidden = !on; (bar.querySelector('#sim') as HTMLButtonElement).textContent = on ? 'Stop Simulation' : 'Simulate Work'; },
    setLive(n: number) { (live.querySelector('.n') as HTMLElement).textContent = `${n} working`; live.classList.toggle('on', n > 0); },
    setWarn(msg: string | null) { warn.hidden = !msg; warn.textContent = msg ?? ''; },
  };
}
export function passwordGate(app: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const g = document.createElement('form'); g.className = 'gate';
    g.innerHTML = `<div class="card"><div class="mark"></div><h2>Bot Office</h2><p class="sub">Enter the office password to continue.</p><input type="password" autocomplete="current-password" placeholder="Password" required /><button class="primary">Enter</button><p class="err" hidden>Wrong password</p></div>`;
    app.appendChild(g);
    g.addEventListener('submit', async (e) => {
      e.preventDefault(); const inp = g.querySelector('input')!;
      if (await login(inp.value)) { g.remove(); resolve(); } else { (g.querySelector('.err') as HTMLElement).hidden = false; inp.value = ''; }
    });
  });
}
