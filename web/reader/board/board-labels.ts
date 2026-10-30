import { type Camera, Vector3 } from 'three';
import { BoardGlyphs } from './board-glyphs';
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
  // Half a sign's plate, by which a sign stands centred over its place, its name to the right of it.
  private static readonly HALF = 13.5;
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
      told = m.state === 'heard';
    el.innerHTML = told ? '<i></i>' : `<i>${BoardGlyphs.svg(m.state === 'unknown' ? 'unknown' : m.kind)}</i>`;
    name.className = 'name'; name.textContent = m.name.replace(/^the /, ''); name.hidden = !told; el.appendChild(name);
    this.add({ el, at, cell: m.cell, id: m.id, town: false, w: 0, h: 0, name, afar: BoardLabels.afar(m), told });
  }
  static afar(m: BoardMark): boolean { return m.state === 'heard' || m.state === 'unknown'; }
  // You, as a mark that says so: a plate over everything else on the map, the same size however near the view, a
  // short staff down to its shadow on the ground where you are; on the plate your face where there is one (a pin where
  // there is not, or it cannot be had); and the name or sign of where you are, saying so too.
  here(at: Vector3, cell: number, face?: string): void {
    const el = document.createElement('span');
    el.className = 'board-you'; el.setAttribute('aria-current', 'location');
    el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'You are here');
    el.innerHTML = `<span class="you-plate you-dot">${BoardGlyphs.pin}</span><span class="you-staff"></span>`
      + '<span class="you-shadow"></span>'; this.layer.appendChild(el); this.you = { el, at, cell };
    if (face) { BoardLabels.face(el.querySelector('.you-plate')!, face); }
    for (const l of this.labels.filter(x => x.cell === cell)) {
      l.el.setAttribute('aria-label', `${l.el.getAttribute('aria-label') ?? ''}, where you are`);
    }
  }
  // A face on your plate in place of the pin, the pin again if the painting will not come.
  private static face(plate: Element, src: string): void {
    const img = document.createElement('img'), pin = plate.innerHTML;
    img.src = src; img.alt = ''; img.decoding = 'async'; img.draggable = false;
    img.addEventListener('error', () => { plate.classList.remove('faced'); plate.innerHTML = pin; });
    plate.classList.add('faced'); plate.replaceChildren(img);
  }
  // The place whose name or sign something on the page is (or is within), if it is one.
  of(target: EventTarget | null): { id: string; cell: number } | undefined {
    return target instanceof Node ? this.labels.find(l => l.el.contains(target)) : undefined;
  }
  // Each kept over its place on the land (moved as a picture already drawn, its shadows not drawn again at every step
  // of the view), rising with its hex as it comes to be known; a name only when its place is pointed at, chosen, bound
  // for or has the keys' focus. You first, and nothing else over you; then towns' names, given up where they would
  // cover one another, or what is over the map; a sign given up where it would cover a town's name, or what is over
  // the map. What is chosen, bound for or has the keys' focus is never given up.
  place(camera: Camera, size: [number, number], [chosen, pointed, bound]: (string | number | undefined)[]): void {
    const taken: DOMRect[] = [...document.querySelectorAll('.field-head, .field-tools, .field-map .plan, .field-shut')]
      .map(e => e.getBoundingClientRect());
    const box = this.layer.getBoundingClientRect(), focused = document.activeElement, half = BoardLabels.HALF;
    this.placeYou(camera, size, box, taken);
    for (const l of [...this.labels].sort((a, b) => Number(b.town) - Number(a.town))) {
      const p = this.screen(l, camera, size), on = l.id === chosen || l.id === bound || l.el === focused;
      l.el.classList.toggle('chosen', l.id === chosen); l.el.classList.toggle('bound', l.id === bound);
      l.el.classList.toggle('pointed', l.cell === pointed); l.el.classList.toggle('off', !p);
      const pressed = String(l.id === chosen);
      if (l.el.getAttribute('aria-pressed') !== pressed) { l.el.setAttribute('aria-pressed', pressed); }
      if (!p) { continue; }
      if (l.name) { l.name.hidden = !on && l.cell !== pointed && !l.told; }
      l.el.style.transform = `translate(${l.town ? '-50%, -100%' : `-${half}px, -50%`}) `
        + `translate3d(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px, 0)`;
      const r = l.town ? new DOMRect(box.left + p[0] - l.w / 2 - 3, box.top + p[1] - l.h - 2, l.w + 6, l.h + 4)
        : new DOMRect(box.left + p[0] - half, box.top + p[1] - l.h / 2, l.w, l.h);
      const clash = taken.some(t => r.x < t.right && r.right > t.x && r.y < t.bottom && r.bottom > t.y);
      l.el.classList.toggle('away', clash && !on); if (!clash && l.town || on) { taken.push(r); }
    }
  }
  // Your mark over the ground where you are, and the room it takes kept from everything else.
  private placeYou(camera: Camera, size: [number, number], box: DOMRect, taken: DOMRect[]): void {
    const you = this.you, y = you && this.screen(you, camera, size);
    if (!you) { return; }
    you.el.style.visibility = y ? '' : 'hidden';
    if (!y) { return; }
    you.el.style.transform = 'translate(-50%, calc(-100% + 3px)) '
      + `translate3d(${y[0].toFixed(1)}px, ${y[1].toFixed(1)}px, 0)`;
    taken.push(new DOMRect(box.left + y[0] - 17, box.top + y[1] - 52, 34, 54));
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
