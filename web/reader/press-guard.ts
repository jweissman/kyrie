// A press is taken once, on the screen it was made on (IG-17, IG-18; the interaction research, doc/architecture/
// mission-21/interaction/). Three guards every screen shares, the title, creation, the scene, talk and the fight:
// - a key held down does its act once: the browser's repeats of Enter, Space or a digit are dropped (held, Enter had
//   talked to the wagoner and then said the first reply and another, unread);
// - a press begun on one screen and let go on the next does nothing there: the click is dropped before the page hears
//   it (a reply that came while the hand was down had put another row under it);
// - the hand that has not moved since the screen changed lights nothing: what it rests on was never pointed at
//   (menu.css, :root[data-still]); it lights again as soon as it moves or presses.
// None of them decides anything of the game's: what a press does is still the engine's.
export class PressGuard {
  // The screen the hand went down on (a frame in play, the phase before it), and where the hand was when it changed.
  private static began?: unknown;
  private static rested?: { x: number; y: number };
  private static hand = { x: -1, y: -1 };
  static attach(screen: () => unknown) {
    window.addEventListener('pointerdown', () => {
      PressGuard.began = screen(); delete document.documentElement.dataset.still;
    }, true);
    // Let go without a click (off what it went down on): the press is over all the same, once a click would have come.
    window.addEventListener('pointerup', () => { window.setTimeout(() => { PressGuard.began = undefined; }); }, true);
    window.addEventListener('pointermove', (e: PointerEvent) => { PressGuard.moved(e.clientX, e.clientY); }, true);
    window.addEventListener('click', (e: MouseEvent) => { PressGuard.clicked(e, screen()); }, true);
  }
  private static clicked(e: MouseEvent, screen: unknown) {
    const stale = PressGuard.began !== undefined && PressGuard.began !== screen;
    PressGuard.began = undefined;
    if (stale) { e.preventDefault(); e.stopPropagation(); }
  }
  // The screen changed (a new frame, someone or something turned to): the hand where it rests lights nothing.
  static changed() {
    PressGuard.rested = { ...PressGuard.hand };
    document.documentElement.dataset.still = '';
  }
  private static moved(x: number, y: number) {
    PressGuard.hand = { x, y };
    const r = PressGuard.rested, root = document.documentElement;
    if (root.dataset.still === undefined || (r && Math.abs(r.x - x) + Math.abs(r.y - y) < 4)) { return; }
    delete root.dataset.still;
  }
  // A key's repeat that would do something again: Enter, Space or a digit, held down.
  static repeated(e: KeyboardEvent): boolean { return e.repeat && /^(Enter| |[1-9])$/.test(e.key); }
}
