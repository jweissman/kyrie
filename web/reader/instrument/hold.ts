import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
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
//   "Hold" a moment;
// - it is short (520 ms; &hold= sets it), done when full, not on release, and done once, whatever the keys repeat.
// The act is the engine's choice as a tap would make it: the hold changes how it is taken, never what it does.
// What a hold does when it is done, and whether the page is busy answering a last one: held by a button of the engine's
// (Hold.props) or any other the page asks a commitment of (the title's ways in, creation's cards: Hold.bind).
interface Go { commit: () => void; busy: () => boolean }
export class Hold {
  static readonly ms = 520;
  private static at?: { button: HTMLElement; go: Go; timer: number; started: number; key?: string };
  static holds(c: Choice): boolean { return c.hold === 'sustained' && !c.disabled; }
  static time(): number {
    const set = parseInt(document.documentElement.style.getPropertyValue('--hold-ms'), 10);
    return Number.isFinite(set) ? set : Hold.ms;
  }
  // What a held act's button carries (Act.View): its mark, and the hand's and the keys' press and release.
  static props(app: ReaderApp, c: Choice) {
    return Hold.bind(app.choose.bind(app, c), Hold.pending.bind(null, app));
  }
  private static never(): boolean { return false; }
  private static pending(app: ReaderApp): boolean { return !!app.state.pending; }
  // Any button's commitment by holding (the owner, 16 November: the title's ways in and creation's cards): the same
  // hold, ring and armed second press, for the hand, a touch, the keys, and an assistive technology's click.
  static bind(commit: () => void, busy: () => boolean = Hold.never) {
    const go: Go = { commit, busy };
    return { 'data-hold': 'sustained', onPointerDown: Hold.down.bind(null, go), onPointerUp: Hold.stop,
      onPointerLeave: Hold.stop, onPointerCancel: Hold.stop, onKeyDown: Hold.keyed.bind(null, go),
      onKeyUp: Hold.unkeyed, onClick: Hold.clicked.bind(null, go), onContextMenu: Hold.swallow };
  }
  // A key held from elsewhere (Enter on the keys' highlight, a digit: see ReaderKeys): held on the act's own button.
  static key(app: ReaderApp, c: Choice, key: string): boolean {
    if (!Hold.holds(c)) { return false; }
    const button = document.querySelector<HTMLElement>(`[data-act="${CSS.escape(c.id)}"][data-hold]`);
    if (button) { Hold.start(button, { commit: app.choose.bind(app, c), busy: Hold.pending.bind(null, app) }, key); }
    return !!button;
  }
  // Let go of a key: the hold it began is let go too.
  static attach() {
    window.addEventListener('keyup', (e: globalThis.KeyboardEvent) => { if (Hold.at?.key === e.key) { Hold.stop(); } });
  }
  private static down(go: Go, e: PointerEvent<HTMLElement>) {
    if (e.button !== 0) { return; }
    Hold.start(e.currentTarget, go);
    if (e.pointerType !== 'touch' && Hold.at) { Reticle.show(e.clientX, e.clientY, Hold.time()); }
  }
  private static keyed(go: Go, e: KeyboardEvent<HTMLElement>) {
    if (e.key !== 'Enter' && e.key !== ' ') { return; }
    e.preventDefault(); e.stopPropagation();
    if (!e.repeat) { Hold.start(e.currentTarget, go, e.key); }
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
    // Let go early, it waits armed a moment: pressed again, it is done (the same for a hand that cannot hold, a touch,
    // the keys), and says so.
    if (button.dataset.armed !== undefined) {
      delete button.dataset.armed;
      go.commit();
      return;
    }
    const ms = Hold.time();
    delete button.dataset.letGo; delete button.dataset.hint;
    button.style.setProperty('--hold-ms', `${ms}ms`);
    button.dataset.holding = '';
    document.documentElement.dataset.holding = '';
    Hold.at = { button, go, started: performance.now(), timer: window.setTimeout(Hold.done, ms),
      ...key ? { key } : {} };
  }
  // Held to the end: done, at once, with the held act's own lower tone.
  private static done() {
    const at = Hold.at;
    if (!at) { return; }
    Hold.at = undefined;
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
    window.clearTimeout(at.timer);
    Hold.at = undefined;
    const got = Math.min(1, (performance.now() - at.started) / Hold.time());
    Hold.clear(at.button);
    at.button.style.setProperty('--hold-from', `${Math.round(got * 100)}%`);
    at.button.dataset.letGo = ''; at.button.dataset.hint = ''; at.button.dataset.armed = '';
    window.setTimeout(() => { delete at.button.dataset.letGo; }, 260);
    window.setTimeout(() => { delete at.button.dataset.hint; delete at.button.dataset.armed; }, 3000);
    Reticle.drain(got);
  }
  private static clear(button: HTMLElement) {
    delete button.dataset.holding;
    delete document.documentElement.dataset.holding;
  }
}
