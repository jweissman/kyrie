import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { ReaderApp } from '../reader-app';
import { Press } from './press';
import { Reticle } from './reticle';
import { Tone } from './tone';

// The hold's version of the action control (?ix=b, see Press): an act the engine marks sustained (Choice.hold: a wait,
// a search, a rest, a camp; the candidates for a day's Energy) is done by holding it, not touching it. What IG-07 found
// wrong with the first hold is what this answers:
// - the press is felt at once and where the hand is: the reticle under the pointer fills (CSS cursors cannot move, so
//   the page draws the reticle for as long as the hold lasts), and the row's own small ring fills with it for a touch
//   or the keys;
// - a touch or a hold let go early is answered, never ignored: the ring drains from where it got to, and the row says
//   "Hold" a moment;
// - it is short (520 ms; &hold= sets it), done when full, not on release, and done once, whatever the keys repeat.
// The act is the engine's choice as a tap would make it: the hold changes how it is taken, never what it does.
export class Hold {
  static readonly ms = 520;
  private static at?: { button: HTMLElement; app: ReaderApp; choice: Choice; timer: number; started: number;
    key?: string };
  static holds(c: Choice): boolean { return Press.is('b') && c.hold === 'sustained' && !c.disabled; }
  static time(): number {
    const set = parseInt(document.documentElement.style.getPropertyValue('--hold-ms'), 10);
    return Number.isFinite(set) ? set : Hold.ms;
  }
  // What a held act's button carries (Act.View): its mark, and the hand's and the keys' press and release.
  static props(app: ReaderApp, c: Choice) {
    return { 'data-hold': 'sustained', onPointerDown: Hold.down.bind(null, app, c), onPointerUp: Hold.stop,
      onPointerLeave: Hold.stop, onPointerCancel: Hold.stop, onKeyDown: Hold.keyed.bind(null, app, c),
      onKeyUp: Hold.unkeyed, onClick: Hold.swallow, onContextMenu: Hold.swallow };
  }
  // A key held from elsewhere (Enter on the keys' highlight, a digit: see ReaderKeys): held on the act's own button.
  static key(app: ReaderApp, c: Choice, key: string): boolean {
    if (!Hold.holds(c)) { return false; }
    const button = document.querySelector<HTMLElement>(`[data-act="${CSS.escape(c.id)}"][data-hold]`);
    if (button) { Hold.start(button, app, c, key); }
    return !!button;
  }
  // Let go of a key: the hold it began is let go too.
  static attach() {
    if (!Press.is('b')) { return; }
    window.addEventListener('keyup', (e: globalThis.KeyboardEvent) => { if (Hold.at?.key === e.key) { Hold.stop(); } });
  }
  private static down(app: ReaderApp, c: Choice, e: PointerEvent<HTMLElement>) {
    if (e.button !== 0) { return; }
    Hold.start(e.currentTarget, app, c);
    if (e.pointerType !== 'touch' && Hold.at) { Reticle.show(e.clientX, e.clientY, Hold.time()); }
  }
  private static keyed(app: ReaderApp, c: Choice, e: KeyboardEvent<HTMLElement>) {
    if (e.key !== 'Enter' && e.key !== ' ') { return; }
    e.preventDefault(); e.stopPropagation();
    if (!e.repeat) { Hold.start(e.currentTarget, app, c, e.key); }
  }
  private static unkeyed(e: KeyboardEvent<HTMLElement>) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); Hold.stop(); }
  }
  private static swallow(e: MouseEvent<HTMLElement>) { e.preventDefault(); e.stopPropagation(); }
  private static start(button: HTMLElement, app: ReaderApp, choice: Choice, key?: string) {
    if (Hold.at || app.state.pending) { return; }
    const ms = Hold.time();
    delete button.dataset.letGo; delete button.dataset.hint;
    button.style.setProperty('--hold-ms', `${ms}ms`);
    button.dataset.holding = '';
    document.documentElement.dataset.holding = '';
    Hold.at = { button, app, choice, started: performance.now(), timer: window.setTimeout(Hold.done, ms),
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
    at.app.choose(at.choice);
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
    at.button.dataset.letGo = ''; at.button.dataset.hint = '';
    window.setTimeout(() => { delete at.button.dataset.letGo; }, 260);
    window.setTimeout(() => { delete at.button.dataset.hint; }, 1600);
    Reticle.drain(got);
  }
  private static clear(button: HTMLElement) {
    delete button.dataset.holding;
    delete document.documentElement.dataset.holding;
  }
}
