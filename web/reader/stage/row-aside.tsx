import { useLayoutEffect, useRef, type ReactNode } from 'react';

// What a row says of itself beside its words (an aside: "take it up as your aim", "about 4 hours"), said whole or not
// at all. Where the row leaves it less room than its words need, it is dropped (data-dropped: menu.css), the row's own
// words keeping theirs; it had been cut to a stub ("take it up as your aim" as "t." beside the drove's aim at 390 wide:
// the owner, 26 November, no words cut to "…"). Tried again whenever the row's size changes and the fonts come.
export class RowAside {
  // note: an act's own note (Act.View), which keeps its older class beside the aside's.
  static View({ children, note }: { children: ReactNode; note?: boolean }) {
    const at = useRef<HTMLSpanElement>(null);
    useLayoutEffect(() => {
      const el = at.current, row = el?.parentElement;
      if (!el || !row) { return undefined; }
      const fit = RowAside.fit.bind(RowAside, el);
      fit();
      void document.fonts?.ready.then(fit);
      // The row alone is watched, never the aside: its going would be a change of size that brought it back.
      const seen = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(fit);
      seen?.observe(row);
      return () => seen?.disconnect();
    });
    return <span className={`${note ? 'note' : 'why-said'} row-aside`} ref={at}>{children}</span>;
  }
  // Shown, and measured: dropped where its words run past its box.
  static fit(el: HTMLElement): void {
    if (!el.isConnected) { return; }
    el.removeAttribute('data-dropped');
    if (el.scrollWidth > el.clientWidth + 1) { el.setAttribute('data-dropped', ''); }
  }
}
