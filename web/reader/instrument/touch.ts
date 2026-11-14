import { Gesture, type Commit, type Said, type Source } from './gesture';
import { Reticle } from './reticle';
import { Tone } from './tone';

// The first touch (Mission 21: doc/architecture/mission-21/first-touch.md), an address away and never the default:
// ?touch=down or ?touch=up. One press pipeline for every row the game is played by (the title's ways in, creation's
// rows and cards, the scene's acts, a conversation's replies, a fight's moves), between the hand or the key and the
// row's own click, which is all that does anything:
// - the row is struck the frame the hand or the key goes down (data-struck: drawn by touch.css, nothing moves);
// - it commits when the Gesture says (down: as the press goes down; up: as it is let go over the row), by the row's own
//   click, once; the browser's own click, which would come after, is dropped;
// - a held row (data-touch-hold: a grave act, setting out) commits when its ring is full, with data-held on its click
//   so that what it does is not asked again; a tap on it is its click unheld, which asks (the accessible way);
// - focus and hovering never reach it: they change only what is lit.
// What a click does, what it costs and whether it may be done stay the engine's and the row's.
export class Touch {
  static readonly holdMs = 650;
  // What it takes on: a row that can be pressed (a disabled one is the browser's own, which does nothing).
  static readonly rows = ':is(.choice-row, .way-in, [data-touch-row], .creation .card):not(:disabled, [aria-disabled="true"])';
  private static at?: { row: HTMLElement; gesture: Gesture; timer?: number; x: number; y: number; key?: string;
    source: Source };
  static mode(): Commit | undefined {
    const at = typeof document === 'undefined' ? undefined : document.documentElement.dataset.touch;
    return at === 'down' || at === 'up' ? at : undefined;
  }
  static on(): boolean { return !!Touch.mode(); }
  // Whether the last press was a finger's (a touch has no hover to consider by: see ComposedCreation).
  static touched(): boolean { return document.documentElement.dataset.input === 'touch'; }
  static set(query: URLSearchParams) {
    const mode = query.get('touch'), root = document.documentElement;
    if (mode !== 'down' && mode !== 'up') { return; }
    root.dataset.touch = mode;
    if (query.get('sound') === '0') { root.dataset.sound = 'off'; }
  }
  static attach() {
    if (!Touch.on()) { return; }
    const listen: [string, (e: never) => void][] = [['pointerdown', Touch.down], ['pointerup', Touch.up],
      ['pointercancel', Touch.cancel], ['pointermove', Touch.moved], ['click', Touch.swallow], ['keydown', Touch.key],
      ['keyup', Touch.unkey], ['contextmenu', Touch.menu]];
    for (const [type, on] of listen) { window.addEventListener(type, on as EventListener, true); }
  }
  private static row(target: EventTarget | null): HTMLElement | undefined {
    const el = (target as Element | null)?.closest?.<HTMLElement>(Touch.rows) ?? undefined;
    return el && !el.closest('[inert], [aria-hidden="true"]') ? el : undefined;
  }
  private static down(e: PointerEvent) {
    const row = Touch.row(e.target);
    if (!row || e.button !== 0 || Touch.at) { return; }
    const source: Source = e.pointerType === 'touch' ? 'touch' : e.pointerType === 'pen' ? 'pen' : 'mouse';
    Touch.begin(row, source, { x: e.clientX, y: e.clientY });
  }
  // A key on the row in focus, or on the keys' highlight in play: Enter or Space. Its repeats do nothing.
  private static key(e: KeyboardEvent) {
    if (e.key !== 'Enter' && e.key !== ' ') { if (e.key === 'Escape' && Touch.at) { Touch.feed({ kind: 'cancel', at: e.timeStamp }); } return; }
    const row = Touch.row(document.activeElement) ?? Touch.row(document.querySelector('[data-action="choice"].sel'));
    if (!row || (e.target as Element | null)?.closest?.('input, textarea, select')) { return; }
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.repeat || Touch.at) { return; }
    const rect = row.getBoundingClientRect();
    Touch.begin(row, 'key', { x: rect.right - 24, y: rect.top + rect.height / 2 }, e.key);
  }
  private static unkey(e: KeyboardEvent) {
    if (Touch.at?.key !== e.key) { return; }
    e.preventDefault();
    Touch.feed({ kind: 'up', at: performance.now(), inside: true });
  }
  private static begin(row: HTMLElement, source: Source, { x, y }: { x: number; y: number }, key?: string) {
    const hold = row.hasAttribute('data-touch-hold') ? Touch.holdMs : 0;
    Touch.at = { row, gesture: new Gesture(Touch.mode()!, hold), x, y, source, ...key ? { key } : {} };
    document.documentElement.dataset.input = source;
    Touch.feed({ kind: 'down', at: performance.now(), source });
  }
  private static up(e: PointerEvent) {
    const at = Touch.at;
    if (!at || at.key) { return; }
    const under = document.elementFromPoint(e.clientX, e.clientY);
    Touch.feed({ kind: 'up', at: performance.now(), inside: !!under && at.row.contains(under) });
  }
  private static cancel() { if (Touch.at && !Touch.at.key) { Touch.feed({ kind: 'cancel', at: performance.now() }); } }
  // A finger that moves is scrolling, not pressing.
  private static moved(e: PointerEvent) {
    const at = Touch.at;
    if (at?.source === 'touch' && Math.hypot(e.clientX - at.x, e.clientY - at.y) > 10) { Touch.cancel(); }
  }
  // The browser's own click on a row is never what commits it: the gesture's is (untrusted, by the row's click()).
  private static swallow(e: MouseEvent) {
    if (e.isTrusted && Touch.row(e.target)) { e.preventDefault(); e.stopImmediatePropagation(); }
  }
  // A long touch on a held row is its hold, not the browser's menu.
  private static menu(e: MouseEvent) { if (Touch.at) { e.preventDefault(); } }
  private static feed(step: Parameters<Gesture['feed']>[0]) {
    const at = Touch.at;
    if (!at) { return; }
    for (const said of at.gesture.feed(step)) { Touch.show(at, said); }
    if (!at.gesture.busy && Touch.at === at) { window.clearTimeout(at.timer); Touch.at = undefined; }
  }
  private static show(at: NonNullable<typeof Touch.at>, said: Said) {
    const row = at.row;
    if (said === 'struck') { row.dataset.struck = ''; Touch.later(row, 'struck', 900); return; }
    if (said === 'holding') { Touch.holding(at); return; }
    if (said === 'released') { delete row.dataset.struck; return; }
    if (said === 'let-go' || said === 'ask') { Touch.letGo(at, said === 'ask'); return; }
    Touch.commit(at);
  }
  private static holding(at: NonNullable<typeof Touch.at>) {
    const row = at.row, ms = at.gesture.hold;
    row.style.setProperty('--hold-ms', `${ms}ms`);
    delete row.dataset.letGo; delete row.dataset.hint;
    row.dataset.holding = '';
    if (at.source !== 'touch' && at.source !== 'key') { Reticle.show(at.x, at.y, ms); }
    at.timer = window.setTimeout(() => { Touch.feed({ kind: 'time', at: performance.now() }); }, ms);
  }
  private static letGo(at: NonNullable<typeof Touch.at>, asked: boolean) {
    const row = at.row, got = Math.round(at.gesture.progress(performance.now()) * 100);
    window.clearTimeout(at.timer);
    delete row.dataset.holding;
    row.style.setProperty('--hold-from', `${got}%`);
    row.dataset.letGo = '';
    Touch.later(row, 'letGo', 260);
    Reticle.drain(got / 100);
    // A tap asks, as the row would at a click: what it would do said, done if chosen again.
    if (asked) { row.click(); return; }
    row.dataset.hint = '';
    Touch.later(row, 'hint', 1600);
  }
  private static commit(at: NonNullable<typeof Touch.at>) {
    const row = at.row, held = row.hasAttribute('data-holding');
    delete row.dataset.holding;
    row.dataset.struck = '';
    Touch.later(row, 'struck', 900);
    if (held) { row.dataset.held = ''; Reticle.done(); }
    Tone.play(held ? 'held' : 'commit');
    row.click();
    delete row.dataset.held;
  }
  // A press its row turned into consideration (a finger's first touch at creation): not shown taken.
  static unstrike() { for (const el of document.querySelectorAll<HTMLElement>('[data-struck]')) { delete el.dataset.struck; } }
  private static later(row: HTMLElement, key: string, ms: number) {
    window.setTimeout(() => { delete row.dataset[key]; }, ms);
  }
}
