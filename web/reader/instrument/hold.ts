import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { ChoiceList, type Choice } from '../../../src/ui/choice-list';
import type { ReaderApp } from '../reader-app';
import { Reticle } from './reticle';
import { Tone } from './tone';

// Holding, for the acts that warrant it (the owner, 16 November: a night's rest and a camp, which spend hours and
// cannot be undone; the engine marks them, Choice.hold, never the page by a label): done by holding, not touching. What
// IG-07 found
// wrong with the first hold is what this answers:
// - the press is felt at once and where the hand is: the reticle under the pointer fills (CSS cursors cannot move, so
//   the page draws the reticle for as long as the hold lasts), and the row's own small ring fills with it for a touch
//   or the keys;
// - a touch or a hold let go early is answered, never ignored: the ring drains from where it got to, and the row says
//   "Hold" a moment; it does nothing else, and arms nothing: a held choice is made only by a hold completed (the owner,
//   16 November: once armed, a single click had done it, and a press could not be predicted). An assistive
//   technology's activation, which no hand holds, is the accessible way, done at once;
// - it is short (520 ms; &hold= sets it), done when full, not on release, and done once, whatever the keys repeat.
// The act is the engine's choice as a tap would make it: the hold changes how it is taken, never what it does.
// What a hold does when it is done, and whether the page is busy answering a last one: held by a button of the engine's
// (Hold.props) or any other the page asks a commitment of (the title's ways in, creation's cards: Hold.bind).
interface Go { commit: () => void; busy: () => boolean }
export class Hold {
  static readonly ms = 520;
  private static at?: { button: HTMLElement; go: Go; timer: number; started: number; key?: string;
    from?: [number, number] };
  // The one row that says "Hold" (the owner, 18 November, OR-87: "it should only be active on one thing at a time"):
  // the last let go early, until the hand, the keys or the focus go to another, or it fades.
  private static hinted?: { button: HTMLElement; timer: number };
  // A journey drawn by the page (the map's, the places lens's) is held by the engine's rule for its command.
  static holds(c: Choice): boolean { return (c.hold === 'sustained' || ChoiceList.journey(c.command)) && !c.disabled; }
  static time(): number {
    const set = parseInt(document.documentElement.style.getPropertyValue('--hold-ms'), 10);
    return Number.isFinite(set) ? set : Hold.ms;
  }
  // What a held act's button carries (Act.View): its mark, and the hand's and the keys' press and release.
  static props(app: ReaderApp, c: Choice) {
    // Asked of the app when the hold is done, not when the row is drawn: a page drawn apart from a running app (a
    // sheet rendered for its words) has none to bind.
    return Hold.bind(() => app.choose(c, true), () => Hold.pending(app));
  }
  // A row of the page's own drawing (ChoiceRow.Button: the map's Travel to, Go on to) that takes an engine's choice:
  // held where the choice is, else taken at a touch.
  static row(app: ReaderApp, c: Choice): { own?: ReturnType<typeof Hold.props>; onClick?: () => void } {
    return Hold.holds(c) ? { own: Hold.props(app, c) } : { onClick: app.choose.bind(app, c) };
  }
  private static never(): boolean { return false; }
  private static pending(app: ReaderApp): boolean { return !!app.state?.pending; }
  // Any button's commitment by holding (the owner, 16 November: the title's ways in and creation's cards): the same
  // hold and ring, for the hand, a touch and the keys, and an assistive technology's click done at once.
  static bind(commit: () => void, busy: () => boolean = Hold.never) {
    const go: Go = { commit, busy };
    return { 'data-hold': 'sustained', onPointerDown: Hold.down.bind(null, go), onPointerUp: Hold.unpressed,
      onPointerLeave: Hold.left, onPointerCancel: Hold.unpressed, onKeyDown: Hold.keyed.bind(null, go),
      onKeyUp: Hold.unkeyed, onClick: Hold.clicked.bind(null, go), onContextMenu: Hold.swallow };
  }
  // A key held from elsewhere (Enter on the keys' highlight, a digit: see ReaderKeys): held on the act's own button.
  static key(app: ReaderApp, c: Choice, key: string): boolean {
    if (!Hold.holds(c)) { return false; }
    const button = document.querySelector<HTMLElement>(`[data-act="${CSS.escape(c.id)}"][data-hold]`);
    const go = { commit: app.choose.bind(app, c, true), busy: Hold.pending.bind(null, app) };
    if (button) { Hold.start(button, go, key); }
    return !!button;
  }
  // Let go of a key: the hold it began is let go too.
  static attach() {
    window.addEventListener('keyup', (e: globalThis.KeyboardEvent) => { if (Hold.at?.key === e.key) { Hold.stop(); } });
    window.addEventListener('pointerover', Hold.away, true);
    window.addEventListener('focusin', Hold.away, true);
  }
  // The hand or the focus gone to something else: the row that said "Hold" says it no longer.
  private static away(e: Event) {
    const was = Hold.hinted?.button;
    if (was && !(e.target instanceof Node && was.contains(e.target))) { Hold.unhint(); }
  }
  private static hint(button: HTMLElement) {
    Hold.unhint();
    button.dataset.hint = '';
    Hold.hinted = { button, timer: window.setTimeout(Hold.unhint, 3000) };
  }
  private static unhint() {
    const was = Hold.hinted;
    if (!was) { return; }
    Hold.hinted = undefined;
    window.clearTimeout(was.timer);
    delete was.button.dataset.hint;
  }
  private static down(go: Go, e: PointerEvent<HTMLElement>) {
    if (e.button !== 0) { return; }
    // Whose hand it is: the pointer's own ring is the cursor's (Reticle), so the row draws none for it; a finger's is
    // drawn round the finger, larger than it, so that it is seen (the owner, 17 November: on a phone it was gone).
    e.currentTarget.dataset.by = e.pointerType;
    Hold.start(e.currentTarget, go);
    if (Hold.at) { Hold.at.from = [e.clientX, e.clientY]; Reticle.show(e.clientX, e.clientY, Hold.time(), e.pointerType === 'touch'); }
  }
  private static keyed(go: Go, e: KeyboardEvent<HTMLElement>) {
    if (e.key !== 'Enter' && e.key !== ' ') { return; }
    e.preventDefault(); e.stopPropagation();
    if (!e.repeat) { e.currentTarget.dataset.by = 'key'; Hold.start(e.currentTarget, go, e.key); }
  }
  // The hand let go or gone from the row: a hold the hand began is let go. One the keys began is the keys' to let go
  // (the map moving under a mouse at rest had passed the row out from under the pointer, ending a hold by Enter).
  private static unpressed() { if (Hold.at && !Hold.at.key) { Hold.stop(); } }
  // Gone from the row only where the hand has moved: the map shifting under a hand at rest as the hold began had
  // passed the row out from under it, and the journey held for was let go (OR-111).
  private static left(e: PointerEvent<HTMLElement>) {
    const from = Hold.at?.from;
    if (!from || Math.hypot(e.clientX - from[0], e.clientY - from[1]) > 12) { Hold.unpressed(); }
  }
  private static unkeyed(e: KeyboardEvent<HTMLElement>) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); Hold.stop(); }
  }
  private static swallow(e: MouseEvent<HTMLElement>) { e.preventDefault(); e.stopPropagation(); }
  // A click that no hand made (detail 0: an assistive technology's "activate") is a deliberate choice in itself and is
  // done at once; a click after a press is the hold's to answer, not the click's.
  private static clicked(go: Go, e: MouseEvent<HTMLElement>) {
    Hold.swallow(e);
    if (e.detail === 0 && !Hold.at && !go.busy()) { go.commit(); }
  }
  private static start(button: HTMLElement, go: Go, key?: string) {
    if (Hold.at || go.busy()) { return; }
    const ms = Hold.time();
    delete button.dataset.letGo; Hold.unhint();
    button.style.setProperty('--hold-ms', `${ms}ms`);
    button.dataset.holding = '';
    document.documentElement.dataset.holding = ''; performance.mark('hold:start');
    Hold.at = { button, go, started: performance.now(), timer: window.setTimeout(Hold.done, ms),
      ...key ? { key } : {} };
  }
  // Held to the end: done, at once, with the held act's own lower tone.
  private static done() {
    const at = Hold.at;
    if (!at) { return; }
    Hold.at = undefined; performance.mark('hold:done');
    Hold.clear(at.button);
    at.button.dataset.held = '';
    window.setTimeout(() => { delete at.button.dataset.held; }, 240);
    Reticle.done();
    Tone.play('held');
    at.go.commit();
  }
  // Let go before the end: nothing is done; the ring drains from where it got to, and the row says "Hold".
  static stop() {
    const at = Hold.at;
    if (!at) { return; }
    // Held the whole time, its timer only late (a page busy drawing the map): done, not let go.
    if (performance.now() - at.started >= Hold.time()) { Hold.done(); return; }
    window.clearTimeout(at.timer);
    Hold.at = undefined;
    const got = Math.min(1, (performance.now() - at.started) / Hold.time());
    Hold.clear(at.button);
    at.button.style.setProperty('--hold-from', `${Math.round(got * 100)}%`);
    at.button.dataset.letGo = ''; Hold.hint(at.button);
    window.setTimeout(() => { delete at.button.dataset.letGo; }, 260);
    Reticle.drain(got);
  }
  private static clear(button: HTMLElement) {
    delete button.dataset.holding;
    delete document.documentElement.dataset.holding;
  }
}
