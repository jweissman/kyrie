// The reticle drawn by the page while an act is held (?ix=b, see Hold): the pointer's own ring (menu.css's
// --cursor-press), which a CSS cursor cannot fill, drawn where the pointer is for as long as the hold lasts, the
// system's cursor hidden meanwhile. It fills round over the hold's time; full, its centre fills and it is gone; let
// go early, it drains from where it got to. Under reduced motion it fills by quarters (instrument.css).
export class Reticle {
  private static el?: HTMLElement;
  private static drawn(): HTMLElement {
    if (!Reticle.el) {
      Reticle.el = document.createElement('i');
      Reticle.el.className = 'ix-reticle';
      Reticle.el.setAttribute('aria-hidden', 'true');
      document.body.append(Reticle.el);
      window.addEventListener('pointermove', (e: PointerEvent) => { Reticle.at(e.clientX, e.clientY); }, true);
    }
    return Reticle.el;
  }
  // Any act's row pressed by a mouse or pen: the cursor's own ring fills round while the press lasts (the commit
  // is still
  // the tap's); let go early, it drains from where it got to.
  static attach() {
    window.addEventListener('pointerdown', Reticle.pressed, true);
    window.addEventListener('pointerup', Reticle.released, true);
    window.addEventListener('pointercancel', Reticle.released, true);
  }
  private static pressed(e: PointerEvent) {
    const row = e.pointerType !== 'touch' && e.button === 0
      && (e.target as Element | null)?.closest?.('.choice-row:not(.shut, [disabled], [aria-disabled="true"])');
    if (row) { Reticle.show(e.clientX, e.clientY, 520); }
  }
  private static released() {
    const at = Reticle.el;
    if (at?.classList.contains('holding')) { Reticle.drain(Reticle.got(at)); }
  }
  private static got(el: HTMLElement): number {
    const ms = parseFloat(el.style.getPropertyValue('--hold-ms')) || 520;
    return Math.min(1, (performance.now() - Reticle.since) / ms);
  }
  private static since = 0;
  static show(x: number, y: number, ms: number) {
    const el = Reticle.drawn();
    el.style.setProperty('--hold-ms', `${ms}ms`);
    el.className = 'ix-reticle';
    Reticle.at(x, y, true);
    Reticle.since = performance.now();
    // Restarted from empty, though the last hold's class was the same.
    void el.offsetWidth;
    el.className = 'ix-reticle holding';
  }
  private static at(x: number, y: number, force = false) {
    const el = Reticle.el;
    if (el && (force || el.classList.contains('holding'))) { el.style.transform = `translate3d(${x}px, ${y}px, 0)`; }
  }
  static done() { Reticle.end('held', 200); }
  static drain(got: number) {
    Reticle.el?.style.setProperty('--hold-from', `${Math.round(got * 100)}%`);
    Reticle.end('drain', 260);
  }
  private static end(as: string, ms: number) {
    const el = Reticle.el;
    if (!el?.classList.contains('holding')) { return; }
    el.className = `ix-reticle ${as}`;
    window.setTimeout(() => { if (el.classList.contains(as)) { el.className = 'ix-reticle'; } }, ms);
  }
}
