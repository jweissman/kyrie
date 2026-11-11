/// <reference lib="dom" />
import type { Page } from 'playwright-core';

// The safe zone as the page draws it (?safe: see Shell, and --safe-* in foundations.css), and whatever can be touched
// that the screen shows outside it: the whole of each, as far as it can be seen (what a scroller has scrolled out of
// view is not on the screen). The owner, 11 November late: the zone checked by the geometry the layout uses, not a
// number of the check's own.
export class SafeZone {
  static readonly touched = 'button, a[href], [role="button"], input, select, textarea, [data-action], [data-choice], '
    + '[data-pick], .portrait';
  static async breaches(page: Page): Promise<string[]> {
    return page.evaluate((touched: string) => {
      const zone = document.querySelector('.safe-zone')?.getBoundingClientRect();
      if (!zone) { return ['no safe zone drawn: open the page with ?safe']; }
      const out: string[] = [];
      for (const e of document.querySelectorAll<HTMLElement>(touched)) {
        const st = getComputedStyle(e);
        if (st.visibility === 'hidden' || st.display === 'none' || +st.opacity === 0 || e.closest('[aria-hidden="true"], [inert]')) {
          continue;
        }
        const box = e.getBoundingClientRect();
        if (!box.width || !box.height) { continue; }
        let r = { left: box.left, top: box.top, right: box.right, bottom: box.bottom };
        // As far as what holds it lets it be seen.
        for (let p = e.parentElement; p; p = p.parentElement) {
          const ps = getComputedStyle(p);
          if (!/(auto|scroll|hidden|clip)/.test(ps.overflowX + ps.overflowY)) { continue; }
          const b = p.getBoundingClientRect();
          r = { ...r, left: Math.max(r.left, b.left), top: Math.max(r.top, b.top), right: Math.min(r.right, b.right),
            bottom: Math.min(r.bottom, b.bottom) };
        }
        r = { ...r, left: Math.max(r.left, 0), top: Math.max(r.top, 0), right: Math.min(r.right, innerWidth),
          bottom: Math.min(r.bottom, innerHeight) };
        if (r.right - r.left < 1 || r.bottom - r.top < 1) { continue; }
        const past = [r.left < zone.left - .5 && `left ${Math.round(zone.left - r.left)}`,
          r.top < zone.top - .5 && `top ${Math.round(zone.top - r.top)}`,
          r.right > zone.right + .5 && `right ${Math.round(r.right - zone.right)}`,
          r.bottom > zone.bottom + .5 && `bottom ${Math.round(r.bottom - zone.bottom)}`].filter(Boolean);
        if (past.length) {
          const what = (e.innerText || e.getAttribute('aria-label') || e.dataset.action || '').trim().slice(0, 30);
          out.push(`${e.tagName.toLowerCase()}.${[...e.classList].join('.')} "${what.replace(/\n/g, ' ')}" past ${past.join(', ')}`);
        }
      }
      return out;
    }, SafeZone.touched);
  }
}
