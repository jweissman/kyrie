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
    el.toggleAttribute('data-above', el.scrollTop > 4);
  }
  // The newest of what a column tells, shown whole (OR-243, the lead's call): the column is never less tall than the
  // last paragraph told (--newest, for the stage to hold it so); and where it holds more than it shows, it is kept at
  // its end as it comes and as it settles, until the reader scrolls it, so that what was told last stands whole at its
  // foot and what came before it is what is cut, at its head, faded (data-above), and scrolled back to. Nest's words
  // of the weir and the six-day tide, last in the gate-yard's telling, had faded out mid-sentence under the rows at
  // 1280 by 800. Not where what was just done is told in it: that is brought into view by its own beginning
  // (useNewest).
  static useEnd(at: RefObject<HTMLElement | null>, key: unknown) {
    useEffect(() => {
      const el = at.current;
      if (!el) { return undefined; }
      const state = { read: false };
      const end = Scrolled.end.bind(Scrolled, el, state), reading = Scrolled.reading.bind(Scrolled, state);
      end();
      const seen = new ResizeObserver(end);
      seen.observe(el);
      for (const child of el.children) { seen.observe(child); }
      for (const kind of Scrolled.reads) { el.addEventListener(kind, reading, { passive: true }); }
      return Scrolled.unend.bind(Scrolled, el, seen, reading);
    }, [at, key]);
  }
  // What the reader does to a column that says they are reading it where they please.
  private static readonly reads = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
  private static reading(state: { read: boolean }) { state.read = true; }
  private static unend(el: HTMLElement, seen: ResizeObserver, reading: () => void) {
    seen.disconnect();
    for (const kind of Scrolled.reads) { el.removeEventListener(kind, reading); }
  }
  private static end(el: HTMLElement, state: { read: boolean }) {
    const last = [...el.querySelectorAll('p')].filter(p => p.offsetParent !== null).at(-1);
    const style = getComputedStyle(el);
    const need = last ? last.offsetHeight + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) : 0;
    el.style.setProperty('--newest', `${Math.ceil(need)}px`);
    if (!state.read && el.scrollHeight > el.clientHeight + 1 && !el.querySelector('.happened')) {
      el.scrollTop = el.scrollHeight;
    }
    Scrolled.mark(el);
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
  // How tall a part stands, written on what holds it (--name), for the stage to keep what is placed over the painting
  // clear of it: who is here had been drawn at a fixed depth under the place's name, over the purse once the name and
  // the hour ran to three lines at 390 (the game builder's walk, 26 November).
  static useTall(at: RefObject<HTMLElement | null>, name: string) {
    useLayoutEffect(() => {
      const el = at.current, host = el?.parentElement;
      if (!el || !host) { return undefined; }
      const write = Scrolled.tall.bind(Scrolled, el, host, name);
      write();
      const seen = new ResizeObserver(write);
      seen.observe(el);
      return seen.disconnect.bind(seen);
    }, [at, name]);
  }
  private static tall(el: HTMLElement, host: HTMLElement, name: string) {
    host.style.setProperty(name, `${Math.ceil(el.getBoundingClientRect().height)}px`);
  }
}
