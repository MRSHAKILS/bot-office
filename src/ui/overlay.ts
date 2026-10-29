import type { Bot } from '../bots/bot';
import * as THREE from 'three';
const STATE_DOT: Record<string, string> = { idle: '#9ca3af', working: '#22c55e', waiting: '#eab308', error: '#ef4444', done: '#3b82f6' };
export class Tags {
  private root = document.createElement('div');
  private els = new Map<Bot, HTMLDivElement>();
  private v = new THREE.Vector3();
  constructor(parent: HTMLElement, bots: Bot[]) {
    this.root.className = 'tags'; parent.appendChild(this.root);
    for (const b of bots) {
      const el = document.createElement('div'); el.className = 'tag';
      el.innerHTML = `<span class="dot"></span><span class="short"></span><div class="full"><b></b><i></i></div>`;
      (el.querySelector('.short') as HTMLElement).textContent = b.m.short;
      (el.querySelector('.full b') as HTMLElement).textContent = b.m.name + ' · ' + b.m.dept;
      el.addEventListener('click', (e) => { e.stopPropagation(); const open = el.classList.contains('open'); this.root.querySelectorAll('.open').forEach((x) => x.classList.remove('open')); if (!open) el.classList.add('open'); });
      this.root.appendChild(el); this.els.set(b, el);
    }
    document.addEventListener('click', () => this.root.querySelectorAll('.open').forEach((x) => x.classList.remove('open')));
  }
  update(cam: THREE.Camera, w: number, h: number) {
    // project, then resolve collisions: working tags win; idle tags stagger upward or fade.
    const items: { b: Bot; el: HTMLDivElement; x: number; y: number; pri: number; fade: boolean }[] = [];
    for (const [b, el] of this.els) {
      b.head.getWorldPosition(this.v); this.v.project(cam);
      items.push({ b, el, x: Math.round((this.v.x * 0.5 + 0.5) * w), y: Math.round((-this.v.y * 0.5 + 0.5) * h), pri: b.state === 'idle' ? 0 : 1, fade: false });
    }
    items.sort((p, q) => q.pri - p.pri || p.y - q.y);
    const placed: typeof items = [];
    const MIN = 28, ROW = 18;
    for (const it of items) {
      let tries = 0;
      while (tries < 3 && placed.some((p) => Math.abs(p.x - it.x) < MIN * 1.6 && Math.abs(p.y - it.y) < ROW)) { it.y -= ROW; tries++; }
      if (tries === 3 && it.pri === 0) it.fade = true;
      placed.push(it);
    }
    for (const it of items) {
      const { b, el } = it;
      el.style.transform = `translate(${it.x}px, ${it.y}px) translate(-50%, -100%)`; // integer px
      el.classList.toggle('faded', it.fade);
      (el.querySelector('.dot') as HTMLElement).style.background = STATE_DOT[b.state];
      (el.querySelector('.full i') as HTMLElement).textContent = b.statusLine || b.state;
    }
  }
}
