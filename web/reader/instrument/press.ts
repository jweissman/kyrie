import { Tone } from './tone';

// Mission 21's interaction research (doc/architecture/mission-21/interaction/experiment.md): two competing versions of
// the one action control, an address away and never the default. Both stand on the guards every screen has (see
// PressGuard: a press taken once, on the screen it was made on, and nothing lit under a hand that has not moved).
// - ?ix=a, the tap: every act at a tap, as the game is, with the instrument's own answers added: the act taken shown
//   taken at once and the rest quiet while the engine answers (instrument.css), and one low tone on a commitment.
// - ?ix=b, the hold: as a, and an act the engine marks sustained (a wait, a search, a rest) done by a hold, the ring
//   filling at the hand (see Hold); what came of an act given a beat before the next choices are let in.
// The engine still says what can be done and what it costs; this is only how a press is taken and answered.
export type IxName = 'a' | 'b';
export class Press {
  static readonly names: readonly IxName[] = ['a', 'b'];
  // How long the act taken is shown taken, at least, before what came of it (the hold's version only), in ms.
  static readonly dwell = 160;
  static current(): IxName | undefined {
    const at = typeof document === 'undefined' ? undefined : document.documentElement.dataset.ix;
    return Press.names.find(n => n === at);
  }
  static is(...names: IxName[]): boolean { const at = Press.current(); return !!at && names.includes(at); }
  // From the address, at start: the version, whether it may sound (&sound=0 keeps it silent), and the hold's time.
  static set(query: URLSearchParams) {
    const root = document.documentElement, at = Press.names.find(n => n === query.get('ix'));
    if (!at) { return; }
    root.dataset.ix = at;
    if (query.get('sound') === '0') { root.dataset.sound = 'off'; }
    const ms = Number(query.get('hold'));
    if (ms >= 200 && ms <= 2000) { root.style.setProperty('--hold-ms', `${ms}ms`); }
  }
  // A commitment outside play (the title's ways in, creation's cards and Continue) is sounded as it is clicked; one in
  // play, where the engine's choice is made (see ReaderApp.choose).
  static attach(playing: () => boolean) {
    if (!Press.current()) { return; }
    window.addEventListener('click', (e: MouseEvent) => {
      const button = (e.target as Element | null)?.closest?.('button:not(:disabled), a[href]');
      if (button && !playing() && !button.closest('[aria-modal="true"]')) { Tone.play('commit'); }
    });
  }
  // A new frame drawn: the hold's version lets the next choices in after what came of the last (instrument.css).
  static arrived() {
    if (!Press.current()) { return; }
    const root = document.documentElement;
    root.dataset.fresh = '';
    window.setTimeout(() => { delete root.dataset.fresh; }, 700);
  }
  // The hold's version shows the act taken for a moment at least, whatever the engine's speed: started, when it was.
  static settle(started: number): Promise<void> {
    const left = Press.is('b') ? Press.dwell - (performance.now() - started) : 0;
    return left > 0 ? new Promise(done => window.setTimeout(done, left)) : Promise.resolve();
  }
}
