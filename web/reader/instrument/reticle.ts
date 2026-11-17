// The reticle drawn by the page while an act is held (see Hold): the pointer's own ring (menu.css's
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
      // A drawing, not a picture of one: the ring is two circles (its track and what has filled), sharp at every
      // size and every pixel density (the owner, 17 November: the cursor was pixellated as it filled).
      Reticle.el.innerHTML = '<svg viewBox="0 0 32 32" width="32" height="32" shape-rendering="geometricPrecision">'
        + '<circle class="rt-track" cx="16" cy="16" r="14" />'
        + '<circle class="rt-fill" cx="16" cy="16" r="14" pathLength="100" /></svg>';
      document.body.append(Reticle.el);
      window.addEventListener('pointermove', (e: PointerEvent) => { Reticle.at(e.clientX, e.clientY); }, true);
    }
    return Reticle.el;
  }
  static show(x: number, y: number, ms: number, finger = false) {
    const el = Reticle.drawn();
    el.style.setProperty('--hold-ms', `${ms}ms`);
    el.className = 'ix-reticle';
    el.classList.toggle('finger', finger);
    Reticle.at(x, y, true);
    // Restarted from empty, though the last hold's class was the same.
    void el.offsetWidth;
    el.classList.add('holding');
  }
  private static at(x: number, y: number, force = false) {
    const el = Reticle.el;
    // On a whole device pixel, so that the ring's strokes are not smeared across two.
    const k = window.devicePixelRatio || 1;
    if (el && (force || el.classList.contains('holding'))) {
      el.style.transform = `translate3d(${Math.round(x * k) / k}px, ${Math.round(y * k) / k}px, 0)`;
    }
  }
  static done() { Reticle.end('held', 200); }
  static drain(got: number) {
    Reticle.el?.style.setProperty('--hold-off', `${Math.round(100 - got * 100)}`);
    Reticle.end('drain', 260);
  }
  private static end(as: string, ms: number) {
    const el = Reticle.el;
    if (!el?.classList.contains('holding')) { return; }
    el.classList.remove('holding'); el.classList.add(as);
    window.setTimeout(() => { if (el.classList.contains(as)) { el.classList.remove(as); } }, ms);
  }
}
