/// <reference lib="dom" />
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Browser } from 'playwright-core';
import type { SheetMiss, SheetShot } from './contact-sheet-camera';

// The contact sheets themselves (see scripts/contact-sheets.ts): for each size, a page of every picture at that size
// in the order walked, each captioned, drawn by the browser and kept as sheet-<size>.png beside its HTML; and
// index.html, which leads to each sheet and to every picture at its full size, with what could not be reached.
export class SheetCompose {
  static readonly style = `body { margin: 0; padding: 24px; background: #121318; color: #ece6d9;
    font: 15px/1.35 system-ui, sans-serif; } h1 { font-size: 20px; margin: 0 0 4px; } p.meta { color: #a59f94; margin: 0 0 18px; }
    .grid { display: grid; gap: 18px 14px; } figure { margin: 0; } figure img { width: 100%; display: block;
    border: 1px solid #2c2e36; } figcaption { color: #a59f94; font-size: 13px; margin-top: 6px; }
    figcaption b { color: #ece6d9; font-weight: 600; } a { color: #d9b86a; } li { margin: 3px 0; }
    table { border-collapse: collapse; font-size: 13px; } td, th { border-bottom: 1px solid #2c2e36; padding: 4px 8px;
    text-align: left; vertical-align: top; } tr.fails td { color: #f0a08a; }`;
  static escape(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // How many across: a landscape screen's pictures four to a row, an upright one's six.
  static columns(size: string): number {
    const [w, h] = size.split('x').map(n => parseInt(n, 10)) as [number, number];
    return w > h ? 4 : 6;
  }
  // Every picture labelled with its page, its state and its viewport (OR-1091, the owner's review: a shot unlabelled
  // could not be told from its neighbour): the page by its name, the state in its caption, the viewport its size.
  static label(s: SheetShot): string {
    return `<b>${String(s.n).padStart(2, '0')} ${SheetCompose.escape(s.name)}</b> · ${SheetCompose.escape(s.caption)}`
      + ` · <span class="viewport">${SheetCompose.escape(s.size.replace('x', '×'))}</span>`;
  }
  static sheet(size: string, shots: SheetShot[], meta: string): string {
    const figures = shots.map(s => `<figure><img src="${s.file}" alt="">`
      + `<figcaption>${SheetCompose.label(s)}</figcaption></figure>`).join('\n');
    const across = SheetCompose.columns(size), wide = across * (size.startsWith('390') ? 230 : 300);
    return `<!doctype html><html><head><meta charset="utf-8"><title>Kyrie at ${size}</title>`
      + `<style>${SheetCompose.style} body { width: ${wide}px; } .grid { grid-template-columns: repeat(${across}, 1fr); }`
      + `</style></head><body><h1>Kyrie at ${size}</h1><p class="meta">${SheetCompose.escape(meta)}</p>`
      + `<div class="grid">${figures}</div></body></html>`;
  }
  static index(sizes: string[], shots: SheetShot[], misses: SheetMiss[], meta: string): string {
    const sheets = sizes.map(s => `<li><a href="sheet-${s}.png">sheet-${s}.png</a> `
      + `(<a href="sheet-${s}.html">as a page</a>), ${shots.filter(x => x.size === s).length} pictures</li>`).join('');
    const missed = misses.length ? misses.map(m => `<li>${m.size} ${SheetCompose.escape(`${m.walk}/${m.step}`)}: `
      + `${SheetCompose.escape(m.why)}</li>`).join('') : '<li>none</li>';
    const all = sizes.map(s => `<h2>${s}</h2><ol>${shots.filter(x => x.size === s).map(x =>
      `<li><a href="${x.file}">${SheetCompose.label(x)}</a></li>`).join('')}</ol>`);
    return `<!doctype html><html><head><meta charset="utf-8"><title>Kyrie contact sheets</title>`
      + `<style>${SheetCompose.style} body { max-width: 900px; }</style></head><body><h1>Kyrie contact sheets</h1>`
      + `<p class="meta">${SheetCompose.escape(meta)}</p><h2>Sheets</h2><ul>${sheets}</ul>`
      + `<h2>Not reached</h2><ul>${missed}</ul>${SheetCompose.contrast(shots)}${all.join('')}</body></html>`;
  }
  // Each page's text against what is behind it (UI-19, SheetContrast: a line's 10th percentile against WCAG AA, 4.5:1
  // and 3:1 large): how many lines, how many fail, and the worst of them.
  static contrast(shots: SheetShot[]): string {
    const rows = shots.filter(s => s.contrast).map(s => {
      const c = s.contrast!, w = c.worst[0];
      return `<tr${c.failing ? ' class="fails"' : ''}><td>${s.size}</td><td><a href="${s.file}">${SheetCompose.escape(s.name)}`
        + `</a></td><td>${c.lines}</td><td>${c.failing}</td><td>${w ? w.ratio.toFixed(2) : ''}</td>`
        + `<td>${w ? `${SheetCompose.escape(w.text)} <small>${SheetCompose.escape(w.where)}${w.large ? ', large' : ''}`
        + '</small>' : ''}</td></tr>`;
    }).join('');
    const failing = shots.reduce((n, s) => n + (s.contrast?.failing ?? 0), 0);
    return `<h2>Contrast against WCAG AA</h2><p class="meta">${failing} lines below AA (4.5:1, or 3:1 at 24 px or bold at `
      + `18.66 px), each line's 10th percentile against the page drawn with its text hidden; contrast.json has every `
      + 'page\'s worst five.</p><table><tr><th>size</th><th>page</th><th>lines</th><th>failing</th><th>worst</th>'
      + `<th>worst line</th></tr>${rows}</table>`;
  }
  static async write(browser: Browser, out: string, at: { sizes: string[]; shots: SheetShot[];
    misses: SheetMiss[]; meta: string }): Promise<void> {
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    for (const size of at.sizes) {
      const html = join(out, `sheet-${size}.html`);
      await writeFile(html, SheetCompose.sheet(size, at.shots.filter(s => s.size === size), at.meta));
      await page.goto(`file://${html}`);
      await page.waitForFunction(() => [...document.images].every(i => i.complete));
      await page.screenshot({ path: join(out, `sheet-${size}.png`), fullPage: true });
    }
    await page.close();
    await writeFile(join(out, 'index.html'), SheetCompose.index(at.sizes, at.shots, at.misses, at.meta));
    await writeFile(join(out, 'shots.json'), `${JSON.stringify({ meta: at.meta, shots: at.shots, misses: at.misses },
      null, 1)}\n`);
    const contrast = at.shots.filter(s => s.contrast)
      .map(s => ({ size: s.size, page: s.name, file: s.file, ...s.contrast }));
    await writeFile(join(out, 'contrast.json'), `${JSON.stringify({ about: 'Each page\'s text against what is drawn '
      + 'behind it (UI-19): lines measured, lines below WCAG AA, the worst five (scripts/contact-sheet-contrast.ts).',
    failing: contrast.reduce((n, c) => n + (c.failing ?? 0), 0), pages: contrast }, null, 1)}\n`);
  }
}
