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
    setGuest(on: boolean) { (bar.querySelector('#signin') as HTMLElement).hidden = !on; simLabel.textContent = on ? 'Simulation Â· public demo' : 'Simulation'; },
    setSim(on: boolean) { simLabel.hidden = !on; (bar.querySelector('#sim') as HTMLButtonElement).textContent = on ? 'Stop Simulation' : 'Simulate Work'; },
    setLive(n: number) { (live.querySelector('.n') as HTMLElement).textContent = `${n} working`; live.classList.toggle('on', n > 0); },
    setWarn(msg: string | null) { warn.hidden = !msg; warn.textContent = msg ?? ''; },
  };
}
/** Resolves true on login, false if the guest dismissed it. */
export function passwordGate(app: HTMLElement): Promise<boolean> {
  return new Promise((resolve) => {
    const previous = document.activeElement as HTMLElement;
    const g = document.createElement('form'); g.className = 'gate'; g.setAttribute('role','dialog'); g.setAttribute('aria-modal','true'); g.setAttribute('aria-label','Sign in for live status');
    g.innerHTML = `<div class="card"><div class="mark"></div><h2>Bot Office</h2><p class="sub">Simulation is public. Enter the office password to see the live floor and real workflow.</p><label for="office-password">Office password</label><input id="office-password" type="password" autocomplete="current-password" placeholder="Password" required /><button class="primary">Enter</button><button type="button" class="cancel">Keep watching the demo</button><p class="err" hidden>Wrong password</p></div>`;
    app.appendChild(g); g.querySelector('input')!.focus();
    g.addEventListener('keydown', e => { if(e.key === 'Escape') { g.remove(); previous?.focus(); resolve(false); } if(e.key === 'Tab') { const items = [...g.querySelectorAll<HTMLElement>('input,button')]; const first = items[0], last = items.at(-1)!; if(e.shiftKey && document.activeElement === first) {e.preventDefault();last.focus();} else if(!e.shiftKey && document.activeElement === last){e.preventDefault();first.focus();} } });
    g.querySelector('.cancel')!.addEventListener('click', () => { g.remove(); resolve(false); });
    g.addEventListener('submit', async (e) => {
      e.preventDefault(); const inp = g.querySelector('input')!;
      const button = g.querySelector<HTMLButtonElement>('.primary')!; button.disabled = true; button.textContent = 'Signing in…';
      try { if (await login(inp.value)) { g.remove(); previous?.focus(); resolve(true); } else { (g.querySelector('.err') as HTMLElement).hidden = false; inp.value = ''; } } catch { const error = g.querySelector<HTMLElement>('.err')!; error.hidden = false; error.textContent = 'Connection failed. Please try again.'; } finally { button.disabled = false; button.textContent = 'Enter'; }
    });
  });
}
