import { type Camera, Vector3 } from 'three';
import type { BoardHooks, BoardMark } from './board-types';

interface Label {
  el: HTMLElement; at: Vector3; cell: number; id: string; town: boolean; w: number; h: number; name?: HTMLElement;
}
// Few words on the board: each town by its name, each place known by the sign of its kind (its name beside it only
// when it is pointed at or chosen), and where you are. Each is a button, reached by Tab and chosen with Enter or a
// touch, as on the flat map; kept over the land as the view moves, a town's name given up where it would cover another.
export class BoardLabels {
  private static readonly glyphs: Record<string, string> = {
    tower: 'M5.5 14V5.5h5V14M4.5 5.5V2.5h1.5v1.2h1.2V2.5h1.6v1.2h1.2V2.5h1.5v3',
    ruin: 'M2 14V7.5l2-1V14M6.5 14v-4h2v4M11 14V5.5l2 1V14M1 14h14',
    cave: 'M1.5 14C2.5 7.5 5 4.5 8 4.5s5.5 3 6.5 9.5M5.5 14c0-3 1.1-5 2.5-5s2.5 2 2.5 5',
    stone: 'M6.3 14l.9-11h1.6l.9 11M3.5 14h9',
    ford: 'M1 5.5c2.3-1 4.4 1 7 0s4.7-1 7 0M1 11c2.3-1 4.4 1 7 0s4.7-1 7 0M3.5 8.2h1.5M7.3 8.2h1.5M11 8.2h1.5',
    way: 'M3.5 14h9l-1.5-3h-6zM5.5 11l1-2.8h3l1 2.8M7 8.2l.4-2.4h1.2l.4 2.4',
    camp: 'M2 14L8 3.5 14 14M8 14v-4.5',
    shrine: 'M3 14V8l5-4 5 4v6M6.5 14v-3.5h3V14',
    barrow: 'M1.5 13c1.5-4 4-6 6.5-6s5 2 6.5 6M6.5 13v-2.5h3V13M1 13h14',
    tarn: 'M2 9.5c0-2.5 2.7-4 6-4s6 1.5 6 4-2.7 4-6 4-6-1.5-6-4zM5 9.5c1-.6 2-.6 3 0s2 .6 3 0',
    crag: 'M1.5 14l3.5-7 2 3 2.5-6 5 10z',
    grove: 'M5 14v-3M11 14v-3M8 14V9M5 11a2.5 2.5 0 1 1 0-5a2.5 2.5 0 0 1 0 5zM11 11a2.5 2.5 0 1 1 0-5a2.5 2.5 0 0 1 0 5z',
    place: 'M8 2.5l5 5.5-5 5.5-5-5.5z',
  };
  readonly layer = document.createElement('div');
  private readonly labels: Label[] = [];
  private readonly v = new Vector3();
  private you?: { el: HTMLElement; at: Vector3 };
  constructor(host: HTMLElement, private readonly hooks: BoardHooks, private readonly toward: (cell: number) => void) {
    this.layer.className = 'board-labels'; host.appendChild(this.layer);
  }
  town(m: BoardMark, at: Vector3): void {
    const el = this.button(m, 'board-town'); el.textContent = m.name.toUpperCase();
    this.add({ el, at, cell: m.cell, id: m.id, town: true, w: 0, h: 0 });
  }
  sign(m: BoardMark, at: Vector3): void {
    const el = this.button(m, `board-sign ${m.kind}`), name = document.createElement('span');
    el.innerHTML = `<i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="${BoardLabels.glyphs[m.kind] ?? BoardLabels.glyphs.place}"/></svg></i>`;
    name.className = 'name'; name.textContent = m.name.replace(/^the /, ''); name.hidden = true; el.appendChild(name);
    this.add({ el, at, cell: m.cell, id: m.id, town: false, w: 0, h: 0, name });
  }
  here(at: Vector3): void {
    const el = document.createElement('span');
    el.className = 'board-you'; el.setAttribute('aria-current', 'location');
    el.innerHTML = '<span class="you-dot"></span>';
    el.title = 'You are here'; this.layer.appendChild(el); this.you = { el, at };
  }
  // Each kept over its place on the land; a name only when its place is pointed at or chosen; towns' names given up
  // where they would cover one another, or what is over the map.
  place(camera: Camera, [width, height]: [number, number],
    [chosen, pointed]: [string | undefined, number | undefined]): void {
    const taken: DOMRect[] = [...document.querySelectorAll('.field-head, .field-tools, .field-map .plan, .field-shut')]
      .map(e => e.getBoundingClientRect());
    const box = this.layer.getBoundingClientRect();
    for (const l of [...this.labels].sort((a, b) => Number(b.town) - Number(a.town))) {
      const p = this.screen(l.at, camera, [width, height]), on = l.id === chosen || l.cell === pointed;
      l.el.classList.toggle('away', !p);
      if (!p) { continue; }
      if (l.name) { l.name.hidden = !on; }
      l.el.classList.toggle('chosen', l.id === chosen);
      l.el.style.transform = `translate(${l.town ? '-50%' : '-11px'}, -100%) translate(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px)`;
      if (!l.town) { continue; }
      const r = new DOMRect(box.left + p[0] - l.w / 2 - 3, box.top + p[1] - l.h - 2, l.w + 6, l.h + 4);
      const clash = taken.some(t => r.x < t.right && r.right > t.x && r.y < t.bottom && r.bottom > t.y);
      l.el.classList.toggle('away', clash && !on); if (!clash) { taken.push(r); }
    }
    const y = this.you && this.screen(this.you.at, camera, [width, height]);
    if (this.you) { this.you.el.style.visibility = y ? '' : 'hidden'; if (y) { this.you.el.style.transform = `translate(-50%, -50%) translate(${y[0]}px, ${y[1]}px)`; } }
  }
  private screen(at: Vector3, camera: Camera, [width, height]: [number, number]): [number, number] | undefined {
    this.v.copy(at).project(camera);
    if (this.v.z > 1 || Math.abs(this.v.x) > 1.05 || Math.abs(this.v.y) > 1.05) { return undefined; }
    return [(this.v.x * 0.5 + 0.5) * width, (-this.v.y * 0.5 + 0.5) * height];
  }
  private button(m: BoardMark, cls: string): HTMLButtonElement {
    const el = document.createElement('button');
    el.type = 'button'; el.className = `${cls}${m.visited ? ' visited' : ''}`; el.dataset.action = 'map-place'; el.dataset.id = m.id;
    el.setAttribute('aria-label', m.name);
    el.addEventListener('click', () => this.hooks.choose(m.id));
    el.addEventListener('focus', () => this.toward(m.cell));
    el.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') { return; }
      e.preventDefault(); e.stopPropagation(); this.hooks.choose(m.id);
    });
    return el;
  }
  private add(l: Label): void {
    this.layer.appendChild(l.el); l.w = l.el.offsetWidth; l.h = l.el.offsetHeight; this.labels.push(l);
  }
}
