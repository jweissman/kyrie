import { useEffect, useLayoutEffect, type RefObject } from 'react';

// A column that holds more than the stage has room for, on a stage that never scrolls (the owner's fixed viewport):
// what the player's own act just did is brought into view in it, and the column says when more of it lies below. The
// fresh playtest of 7 November read a notice on a well-post and saw only the notice, its three new aims under the foot
// of the column with nothing to say they were there; said a rite and missed the aim it gave; slept at an inn and never
// saw that both had gained a level; and fought a centipede with Defend, Flee and the firebomb under the foot of the
// panel of acts.
export class Scrolled {
  // Brought into view as it comes: the whole of it where the column has room, else its beginning (what was done),
  // never past it. Only the column that holds it is moved, never the page or the stage around it.
  static useNewest(at: RefObject<HTMLElement | null>, key: unknown, on: boolean) {
    useLayoutEffect(() => { if (on && at.current) { Scrolled.reveal(at.current); } }, [at, key, on]);
  }
  // Its foot is brought clear of the fade that says more lies below (see rest.css), as far as its head allows.
  static reveal(el: HTMLElement) {
    const box = Scrolled.column(el);
    if (!box) { return; }
    const b = box.getBoundingClientRect(), r = el.getBoundingClientRect();
    if (r.height > b.height || r.top < b.top) { box.scrollTop += r.top - b.top; }
    else if (r.bottom > b.bottom) { box.scrollTop += Math.min(r.bottom - b.bottom + Scrolled.fade, r.top - b.top); }
  }
  static readonly fade = 48;
  // The nearest column about it that scrolls and has more than it shows.
  static column(el: HTMLElement): HTMLElement | undefined {
    for (let p = el.parentElement; p; p = p.parentElement) {
      if (/(auto|scroll)/.test(getComputedStyle(p).overflowY) && p.scrollHeight > p.clientHeight + 1) { return p; }
    }
    return undefined;
  }
  // Marks a column that has more below what it shows (data-more), for the stage to say so; kept as it is scrolled,
  // as it is resized, and as what is in it changes.
  static useCue(at: RefObject<HTMLElement | null>, key?: unknown) {
    useEffect(() => {
      const el = at.current;
      if (!el) { return undefined; }
      const mark = Scrolled.mark.bind(Scrolled, el);
      mark();
      const seen = new ResizeObserver(mark);
      seen.observe(el);
      for (const child of el.children) { seen.observe(child); }
      el.addEventListener('scroll', mark, { passive: true });
      return Scrolled.unwatch.bind(Scrolled, el, seen, mark);
    }, [at, key]);
  }
  private static unwatch(el: HTMLElement, seen: ResizeObserver, mark: () => void) {
    seen.disconnect(); el.removeEventListener('scroll', mark);
  }
  private static mark(el: HTMLElement) {
    el.toggleAttribute('data-more', el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }
  // A column whose part must be seen whole (a fight's company, each face with its card): the foot of that part is
  // written on it (--held), for the stage to keep it at least so tall, so that what is under it gives way first and
  // says it goes on. Every act in view had let the hand of acts take what it needed, and the company above it was cut
  // at the mouth at 1180 by 820 and on a phone.
  static useHeld(at: RefObject<HTMLElement | null>, part: string, key?: unknown) {
    useLayoutEffect(() => {
      const el = at.current, held = el?.querySelector<HTMLElement>(part);
      if (!el || !held) { return undefined; }
      const hold = Scrolled.hold.bind(Scrolled, el, held);
      hold();
      const seen = new ResizeObserver(hold);
      for (const child of el.children) { seen.observe(child); }
      return seen.disconnect.bind(seen);
    }, [at, part, key]);
  }
  private static hold(el: HTMLElement, held: HTMLElement) {
    const foot = held.getBoundingClientRect().bottom - el.getBoundingClientRect().top + el.scrollTop
      + parseFloat(getComputedStyle(el).paddingBottom);
    el.style.setProperty('--held', `${Math.ceil(foot)}px`);
  }
}
