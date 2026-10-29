import { login } from '../api/status';
export function hud(app: HTMLElement) {
  const bar = document.createElement('div'); bar.className = 'bar';
  bar.innerHTML = `<button id="sim">Simulate Work</button><button id="signin" hidden>Sign in for live status</button>`;
  const simLabel = document.createElement('div'); simLabel.className = 'simlabel'; simLabel.textContent = 'Simulation'; simLabel.hidden = true;
  const warn = document.createElement('div'); warn.className = 'warn'; warn.hidden = true;
  const live = document.createElement('div'); live.className = 'live'; live.innerHTML = '<span class="dot"></span><span class="n">0 working</span>';
  app.append(bar, simLabel, warn, live);
  return {
    simBtn: bar.querySelector('#sim') as HTMLButtonElement,
    signInBtn: bar.querySelector('#signin') as HTMLButtonElement,
    setGuest(on: boolean) { (bar.querySelector('#signin') as HTMLElement).hidden = !on; simLabel.textContent = on ? 'Simulation · public demo' : 'Simulation'; },
    setSim(on: boolean) { simLabel.hidden = !on; (bar.querySelector('#sim') as HTMLButtonElement).textContent = on ? 'Stop Simulation' : 'Simulate Work'; },
    setLive(n: number) { (live.querySelector('.n') as HTMLElement).textContent = `${n} working`; live.classList.toggle('on', n > 0); },
    setWarn(msg: string | null) { warn.hidden = !msg; warn.textContent = msg ?? ''; },
  };
}
/** Resolves true on login, false if the guest dismissed it. */
export function passwordGate(app: HTMLElement): Promise<boolean> {
  return new Promise((resolve) => {
    const g = document.createElement('form'); g.className = 'gate';
    g.innerHTML = `<div class="card"><div class="mark"></div><h2>Bot Office</h2><p class="sub">Simulation is public. Enter the office password to see the live floor and real workflow.</p><input type="password" autocomplete="current-password" placeholder="Password" required /><button class="primary">Enter</button><button type="button" class="cancel">Keep watching the demo</button><p class="err" hidden>Wrong password</p></div>`;
    app.appendChild(g);
    g.querySelector('.cancel')!.addEventListener('click', () => { g.remove(); resolve(false); });
    g.addEventListener('submit', async (e) => {
      e.preventDefault(); const inp = g.querySelector('input')!;
      if (await login(inp.value)) { g.remove(); resolve(true); } else { (g.querySelector('.err') as HTMLElement).hidden = false; inp.value = ''; }
    });
  });
}
