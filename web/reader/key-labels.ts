// One input as it is read: a pointer's or a key's.
export interface KeyInput { type: string; pointerType?: string; key?: string; target?: unknown }
// The keys' labels (a row's number at its right, a fight's T and Esc) shown to a hand that can press them, and not to
// a finger (OR-1560): a number means nothing to a touch. Which hand is in use is the last input's: a touch or a pen on
// the screen hides them; a key pressed, or a mouse, shows them again. It is set once for every page, on the root
// (:root[data-touch], menu.css), never page by page; where nothing has been pressed yet, a screen with no hover (a
// phone, a tablet) begins without them, as `@media (hover: none)` had kept them from the start.
// Limits: a game controller is not told apart (the page reads no Gamepad API; one whose buttons the system sends as
// keys counts as keys), and a key typed into a field (a name in creation, on a phone's own keyboard) changes nothing.
// The labels are drawn aria-hidden; what a row says to a reader, its focus and the keys themselves are untouched.
export class KeyLabels {
  static readonly attribute = 'touch';
  private static readonly modifiers = new Set(['Shift', 'Control', 'Alt', 'Meta', 'AltGraph', 'CapsLock', 'Fn']);
  static attach() {
    const root = document.documentElement;
    const hoverless = typeof matchMedia === 'function' && matchMedia('(hover: none)').matches;
    if (hoverless) { root.dataset[KeyLabels.attribute] = ''; }
    window.addEventListener('pointerdown', KeyLabels.heard, true);
    window.addEventListener('keydown', KeyLabels.heard, true);
  }
  private static heard(this: void, e: Event) {
    KeyLabels.set(document.documentElement, KeyLabels.touching(e as KeyInput));
  }
  // Whether the hand that made this input is a finger (true), keys or a mouse (false), or nothing said (undefined).
  static touching(e: KeyInput): boolean | undefined {
    if (e.type === 'pointerdown') { return e.pointerType === 'touch' || e.pointerType === 'pen'; }
    if (e.type !== 'keydown' || !e.key || KeyLabels.modifiers.has(e.key) || KeyLabels.typed(e.target)) { return undefined; }
    return false;
  }
  private static typed(target: unknown): boolean {
    const el = target as { tagName?: string; isContentEditable?: boolean } | null;
    return !!el && (el.isContentEditable === true || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName ?? ''));
  }
  private static set(root: HTMLElement, touching: boolean | undefined) {
    if (touching === undefined || touching === (root.dataset[KeyLabels.attribute] !== undefined)) { return; }
    if (touching) { root.dataset[KeyLabels.attribute] = ''; } else { delete root.dataset[KeyLabels.attribute]; }
  }
}
