/// <reference lib="dom" />
import type { Page } from 'playwright-core';

// One line of text as drawn, and its contrast against what is drawn behind it (UI-19; the design review of 20 November
// asked whether light text over the paintings holds WCAG AA, and the owner rules a scrim only where it is measured to
// fail). ratio: the line's contrast, its 10th percentile over the pixels behind it (see SheetContrast.ratio); large:
// 24 px and over, or bold at 18.66 px and over, held to 3:1, the rest to 4.5:1.
export interface ContrastLine { text: string; where: string; ratio: number; large: boolean; pass: boolean }
export interface PageContrast { lines: number; failing: number; worst: ContrastLine[] }
interface Drawn { text: string; where: string; rect: [number, number, number, number]; rgba: number[]; large: boolean }

// Each visible line of text on the page measured against the page drawn with every text made transparent: the
// background under the line's own box, pixel by pixel, the text's colour (its alpha and its ancestors' opacity
// laid over each pixel) against it. A line's ratio is the 10th percentile of its pixels' ratios, not their median:
// the median of a line over a painting hides the bright patch a light line crosses, and the 10th percentile is the
// worst tenth of what the eye meets along the line, without letting one stray pixel decide it.
export class SheetContrast {
  // Every text drawn transparent, so that what is behind it is seen; the page's own layout untouched. A drop cap too
  // (::first-letter, which * does not reach): left drawn, it stood behind its own line as a background, and the
  // encyclopedia's chapter lede measured 1:1 against its own initial (OR-1830).
  static readonly hide = '*, *::first-letter, *::first-line { color: transparent !important; text-shadow: none !important; '
    + '-webkit-text-stroke: 0 !important; caret-color: transparent !important } '
    + '::placeholder { color: transparent !important }';
  static async measure(page: Page): Promise<PageContrast> {
    const lines = await page.evaluate(SheetContrast.lines);
    if (!lines.length) { return { lines: 0, failing: 0, worst: [] }; }
    await page.evaluate((css: string) => {
      const style = document.createElement('style');
      style.id = 'kyrie-contrast-hidden'; style.textContent = css; document.head.append(style);
    }, SheetContrast.hide);
    const shot = (await page.screenshot({ animations: 'disabled' })).toString('base64');
    await page.evaluate(() => document.getElementById('kyrie-contrast-hidden')?.remove());
    const backs = await page.evaluate(SheetContrast.backgrounds, { png: shot, rects: lines.map(l => l.rect) });
    const measured = lines.map((l, i) => SheetContrast.line(l, backs[i] ?? []));
    const failing = measured.filter(l => !l.pass);
    return { lines: measured.length, failing: failing.length,
      worst: [...measured].sort((a, b) => a.ratio - b.ratio).slice(0, 5) };
  }
  private static line(l: Drawn, pixels: number[][]): ContrastLine {
    const ratio = SheetContrast.ratio(l.rgba, pixels), need = l.large ? 3 : 4.5;
    return { text: l.text, where: l.where, ratio: Math.round(ratio * 100) / 100, large: l.large, pass: ratio >= need };
  }
  // The 10th percentile of the line's contrast over the pixels behind it, the text laid over each by its alpha.
  static ratio(rgba: number[], pixels: number[][]): number {
    if (!pixels.length) { return 21; }
    const [r, g, b, a] = rgba as [number, number, number, number];
    const ratios = pixels.map(([pr, pg, pb]) => {
      const text = SheetContrast.luminance(r * a + pr! * (1 - a), g * a + pg! * (1 - a), b * a + pb! * (1 - a));
      const back = SheetContrast.luminance(pr!, pg!, pb!);
      return (Math.max(text, back) + 0.05) / (Math.min(text, back) + 0.05);
    }).sort((x, y) => x - y);
    return ratios[Math.floor(ratios.length * 0.1)]!;
  }
  // WCAG 2's relative luminance of an sRGB colour, 0 to 255 a channel.
  static luminance(r: number, g: number, b: number): number {
    return 0.2126 * this.linear(r) + 0.7152 * this.linear(g) + 0.0722 * this.linear(b);
  }
  private static linear(c: number): number {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }
  // In the page: every visible line of text, by its text node's own line boxes (Range.getClientRects), within the
  // window and what clips it; its colour with its alpha and its ancestors' opacity; whether it is large.
  // (A property, not a method: Playwright sends a function's own source to the page, and a method's is no expression.)
  private static readonly lines = (): Drawn[] => {
    const out: Drawn[] = [], walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n && out.length < 400; n = walker.nextNode()) {
      const el = n.parentElement, text = n.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      if (!el || !text || el.closest('script, style, [aria-hidden="true"]')) { continue; }
      const st = getComputedStyle(el);
      if (st.visibility !== 'visible' || st.display === 'none') { continue; }
      let opacity = 1;
      for (let e: Element | null = el; e; e = e.parentElement) { opacity *= Number(getComputedStyle(e).opacity); }
      const m = /rgba?\(([^)]+)\)/.exec(st.color)?.[1]?.split(',').map(Number) ?? [0, 0, 0, 1];
      const alpha = (m[3] ?? 1) * opacity, size = parseFloat(st.fontSize), bold = Number(st.fontWeight) >= 700;
      if (alpha < 0.05) { continue; }
      const range = document.createRange(); range.selectNodeContents(n);
      const where = `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string'
        ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : ''}`;
      // Only what is seen of it: within the window and within every box that clips it (a book's page scrolled past
      // the foot of the stage had been measured against the dark below the stage, OR-506).
      let [cl, ct, cr, cb] = [0, 0, innerWidth, innerHeight];
      for (let e = el.parentElement; e; e = e.parentElement) {
        const s = getComputedStyle(e);
        if (s.overflowX !== 'visible' || s.overflowY !== 'visible') {
          const b = e.getBoundingClientRect();
          [cl, ct, cr, cb] = [Math.max(cl, b.left), Math.max(ct, b.top), Math.min(cr, b.right), Math.min(cb, b.bottom)];
        }
      }
      for (const r of range.getClientRects()) {
        const x = Math.max(cl, r.left), y = Math.max(ct, r.top), w = Math.min(cr, r.right) - x;
        const h = Math.min(cb, r.bottom) - y;
        if (w < 2 || h < 2) { continue; }
        // Nor what lies under another box drawn over it (a map's label under the journey's card): where the line
        // takes a pointer, whatever is topmost at its middle is it or its own; a line that takes none cannot be told.
        const top = st.pointerEvents === 'none' ? null : document.elementFromPoint(x + w / 2, y + h / 2);
        if (top && !el.contains(top) && !top.contains(el)) { continue; }
        out.push({ text: text.slice(0, 60), where, rect: [x, y, w, h], rgba: [m[0]!, m[1]!, m[2]!, alpha],
          large: size >= 24 || (bold && size >= 18.66) });
      }
    }
    return out;
  };
  // In the page: the screenshot with the text hidden, drawn to a canvas, and the pixels under each line's box (every
  // other pixel each way, enough to find its worst tenth).
  private static readonly backgrounds = async (a: { png: string; rects: [number, number, number, number][] })
    : Promise<number[][][]> => {
    const img = new Image();
    await new Promise(done => { img.onload = done; img.src = `data:image/png;base64,${a.png}`; });
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d')!, k = img.width / innerWidth;
    ctx.drawImage(img, 0, 0);
    return a.rects.map(([x, y, w, h]) => {
      const d = ctx.getImageData(Math.floor(x * k), Math.floor(y * k), Math.max(1, Math.floor(w * k)),
        Math.max(1, Math.floor(h * k)));
      const px: number[][] = [];
      for (let j = 0; j < d.height; j += 2) {
        for (let i = 0; i < d.width; i += 2) {
          const o = (j * d.width + i) * 4;
          px.push([d.data[o]!, d.data[o + 1]!, d.data[o + 2]!]);
        }
      }
      return px;
    });
  };
}
