import { type Camera, Vector3 } from 'three';
import type { BoardHooks, BoardMark } from './board-types';

interface Label {
  el: HTMLElement; at: Vector3; cell: number; id: string; town: boolean; w: number; h: number; name?: HTMLElement;
  // Only heard of, or not made out: over its hex whether or not the hex is known, the mist under it; only heard of,
  // its name always told.
  afar?: boolean; told?: boolean;
}
// Few words on the board: each town by its name, each place known by the sign of its kind centred over it (its name
// beside it only when it is pointed at, chosen or reached by Tab), and where you are. Each is a button, reached by Tab
// and chosen with Enter or a touch, as on the flat map; kept over the land as the view moves, a town's name given up
// where it would cover another, a sign where it would cover a town's name. A place only heard of is an empty ring and
// the name it was told by over the mist, where it is said to be (a town, its name); something not made out, a
// question.
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
    unknown: 'M5.5 6a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.7v.6M8 12.6v.4',
  };
  readonly layer = document.createElement('div');
  private readonly labels: Label[] = [];
  private readonly v = new Vector3();
  private you?: { el: HTMLElement; at: Vector3; cell: number };
  // What is told of a label's hex: that it has the keys' focus (to be drawn toward), or has lost it; and how far the
  // hex stands below where it belongs, and whether what is on it is shown yet.
  constructor(host: HTMLElement, private readonly hooks: BoardHooks, private readonly heed: (cell?: number) => void,
    private readonly up: (cell: number) => [number, boolean]) {
    this.layer.className = 'board-labels'; host.appendChild(this.layer);
  }
  town(m: BoardMark, at: Vector3): void {
    // A town only heard of, by the name it was told by, as the told names of places are.
    const el = this.button(m, 'board-town'); el.textContent = m.state === 'heard' ? m.name : m.name.toUpperCase();
    this.add({ el, at, cell: m.cell, id: m.id, town: true, w: 0, h: 0, afar: BoardLabels.afar(m) });
  }
  // A place's sign: centred in its ring, the sign of its kind; only heard of, an empty ring of dashes with the name it
  // was told by always beside it; not made out, a question.
  sign(m: BoardMark, at: Vector3): void {
    const el = this.button(m, `board-sign ${m.kind}`), name = document.createElement('span'),
      told = m.state === 'heard', glyphs = BoardLabels.glyphs,
      glyph = m.state === 'unknown' ? glyphs.unknown : glyphs[m.kind] ?? glyphs.place;
    el.innerHTML = told ? '<i></i>' : `<i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="${glyph}"/></svg></i>`;
    name.className = 'name'; name.textContent = m.name.replace(/^the /, ''); name.hidden = !told; el.appendChild(name);
    this.add({ el, at, cell: m.cell, id: m.id, town: false, w: 0, h: 0, name, afar: BoardLabels.afar(m), told });
  }
  static afar(m: BoardMark): boolean { return m.state === 'heard' || m.state === 'unknown'; }
  // You, as a mark that says so; and the name or sign of where you are, saying so too.
  here(at: Vector3, cell: number): void {
    const el = document.createElement('span');
    el.className = 'board-you'; el.setAttribute('aria-current', 'location');
    el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'You are here');
    el.innerHTML = '<span class="you-dot"></span>'; this.layer.appendChild(el); this.you = { el, at, cell };
    for (const l of this.labels.filter(x => x.cell === cell)) {
      l.el.setAttribute('aria-label', `${l.el.getAttribute('aria-label') ?? ''}, where you are`);
    }
  }
  // The place whose name or sign something on the page is (or is within), if it is one.
  of(target: EventTarget | null): { id: string; cell: number } | undefined {
    return target instanceof Node ? this.labels.find(l => l.el.contains(target)) : undefined;
  }
  // Each kept over its place on the land (moved as a picture already drawn, its shadows not drawn again at every step
  // of the view), rising with its hex as it comes to be known; a name only when its place is pointed at, chosen or
  // has the keys' focus; towns' names given up where they would cover one another, or what is over the map; a sign
  // given up where it would cover a town's name, or what is over the map.
  place(camera: Camera, [width, height]: [number, number],
    [chosen, pointed]: [string | undefined, number | undefined]): void {
    const taken: DOMRect[] = [...document.querySelectorAll('.field-head, .field-tools, .field-map .plan, .field-shut')]
      .map(e => e.getBoundingClientRect());
    const box = this.layer.getBoundingClientRect(), focused = document.activeElement;
    for (const l of [...this.labels].sort((a, b) => Number(b.town) - Number(a.town))) {
      const p = this.screen(l, camera, [width, height]);
      const on = l.id === chosen || l.cell === pointed || l.el === focused, pressed = String(l.id === chosen);
      l.el.classList.toggle('chosen', l.id === chosen); l.el.classList.toggle('off', !p);
      if (l.el.getAttribute('aria-pressed') !== pressed) { l.el.setAttribute('aria-pressed', pressed); }
      if (!p) { continue; }
      if (l.name) { l.name.hidden = !on && !l.told; }
      l.el.style.transform = `translate(${l.town ? '-50%, -100%' : '-11px, -50%'}) translate3d(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px, 0)`;
      const r = l.town ? new DOMRect(box.left + p[0] - l.w / 2 - 3, box.top + p[1] - l.h - 2, l.w + 6, l.h + 4)
        : new DOMRect(box.left + p[0] - 11, box.top + p[1] - l.h / 2, l.w, l.h);
      const clash = taken.some(t => r.x < t.right && r.right > t.x && r.y < t.bottom && r.bottom > t.y);
      l.el.classList.toggle('away', clash && !on); if (!clash && l.town) { taken.push(r); }
    }
    const y = this.you && this.screen(this.you, camera, [width, height]);
    if (this.you) { this.you.el.style.visibility = y ? '' : 'hidden'; if (y) { this.you.el.style.transform = `translate(-50%, -50%) translate3d(${y[0]}px, ${y[1]}px, 0)`; } }
  }
  // Where a point over a hex is on the screen, the hex standing as far as it has come; nowhere while the hex has not
  // yet come most of the way up out of the mist (but for a place known only from afar, over the mist where the land
  // would be), or when the point is out of view.
  private screen({ at, cell, afar }: { at: Vector3; cell: number; afar?: boolean }, camera: Camera,
    [width, height]: [number, number]): [number, number] | undefined {
    const [lift, shown] = this.up(cell);
    if (!shown && !afar) { return undefined; }
    this.v.copy(at).setY(at.y + (shown ? lift : 0)).project(camera);
    if (this.v.z > 1 || Math.abs(this.v.x) > 1.05 || Math.abs(this.v.y) > 1.05) { return undefined; }
    return [(this.v.x * 0.5 + 0.5) * width, (-this.v.y * 0.5 + 0.5) * height];
  }
  private button(m: BoardMark, cls: string): HTMLButtonElement {
    const el = document.createElement('button');
    el.type = 'button'; el.className = `${cls}${m.visited ? ' visited' : ''}`; el.dataset.action = 'map-place'; el.dataset.id = m.id;
    el.dataset.known = m.state;
    el.setAttribute('aria-label', m.name); el.setAttribute('aria-pressed', 'false');
    el.addEventListener('click', () => this.hooks.choose(m.id));
    el.addEventListener('focus', () => this.heed(m.cell));
    el.addEventListener('blur', () => this.heed());
    el.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') { return; }
      e.preventDefault(); e.stopPropagation(); this.hooks.choose(m.id, true);
    });
    return el;
  }
  private add(l: Label): void {
    this.layer.appendChild(l.el); l.w = l.el.offsetWidth; l.h = l.el.offsetHeight; this.labels.push(l);
  }
}
