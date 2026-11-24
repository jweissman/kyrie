/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The newest telling shown whole (OR-243, the lead's call): the first blind cold play of the page, at 1280 by 800,
// came into the gate-yard of Gatesend and Nest's words of the weir and the six-day tide, the hook of the weir's life,
// faded out mid-sentence under the rows ("…says the woman at the next door, and"): the told column was held and masked
// whole, and what it cut was the newest. Now a column that holds more than it shows is brought to its end as it comes
// (Scrolled.useEnd), never less tall than its last paragraph: what was told last stands whole, above the rows and
// inside the page, the rows still in view, and what came before it is what is cut, at its head, faded and said
// (data-above). At a desk and on a phone, at the weir's first page and coming back into the gate-yard by the cold
// plays' own lines. Opt in with KYRIE_BROWSER=1.
class Newest {
  static async begin(page: Page) {
    await page.waitForFunction(() => 'kyrieMono' in window, null, { timeout: 120000 });
    await page.evaluate(`window.kyrieMono.begin(${JSON.stringify({ campaign: 'world', seed: 'iscoed', origin: 'weir',
      party: [{ name: 'Ilse', raceId: 'elf', classId: 'mage', backgroundId: 'scholar' }], opening: 'none' })})`);
    await page.waitForFunction('window.kyrieMono.inspect().mode === "explore"', null, { timeout: 180000 });
  }
  static async play(page: Page, commands: string[]) {
    for (const command of commands) {
      await page.evaluate(`window.kyrieMono.act(${JSON.stringify(command)}, ${JSON.stringify(command)})`);
      await page.waitForFunction('!window.kyrieMono.inspect().pending', null, { timeout: 60000 });
    }
  }
  // The last paragraph told: whether it is whole in view (inside the page, every clipping box about it, above the
  // first row of what can be done), and its words; and whether a column that holds more than it shows says so.
  static read(page: Page) {
    return page.evaluate(() => {
      const col = document.querySelector<HTMLElement>('.focus .told-col');
      const rows = document.querySelector('.focus .do-col [data-act]')?.getBoundingClientRect();
      const clipped = (e: Element, told = true) => {
        const r = e.getBoundingClientRect();
        if (r.top < 0 || r.bottom > innerHeight + 0.5 || (told && rows && r.bottom > rows.top + 0.5)) { return true; }
        for (let p = e.parentElement; p; p = p.parentElement) {
          if (getComputedStyle(p).overflowY !== 'visible') {
            const b = p.getBoundingClientRect();
            if (r.top < b.top - 0.5 || r.bottom > b.bottom + 0.5) { return true; }
          }
        }
        return false;
      };
      const last = [...col?.querySelectorAll('p') ?? []].filter(p => p.offsetParent !== null && p.innerText.trim()).at(-1);
      const cut = !!col && col.scrollHeight > col.clientHeight + 1;
      const row = document.querySelector('.focus .do-col [data-act]');
      return { last: last ? { whole: !clipped(last), words: last.innerText.slice(0, 60) } : undefined,
        row: !!row && !clipped(row, false),
        said: !cut || col.hasAttribute('data-above') || col.hasAttribute('data-more') };
    });
  }
}
const weir = readFileSync('doc/architecture/mission-22/cold/cold-5-lines.txt', 'utf8').split('\n').filter(Boolean)
  .flatMap(line => {
    const m = JSON.parse(line) as { act?: string; follow?: string };
    return m.follow ? [`follow:${m.follow}`] : m.act ? [m.act] : [];
  });
describe.skipIf(!process.env.KYRIE_BROWSER)('the newest telling, whole', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-newest-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 600000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  for (const [width, height] of [[1280, 800], [390, 844]] as const) {
    it(`at ${width}x${height}: the weir's first page, and the gate-yard come back to`, async () => {
      const { page, errors } = await MonoBrowser.page(browser, { width, height }, { site, query: '?world=iscoed' });
      await Newest.begin(page);
      const first = await Newest.read(page);
      // The gate-yard come back to from the gatehouse, the pawl in hand (the cold plays' twelfth line).
      await Newest.play(page, weir.slice(0, 12));
      const back = await Newest.read(page);
      expect(first.last?.words).toMatch(/Tegwen|Nest|weir|tide/);
      for (const read of [first, back]) {
        expect(read.last?.whole).toBe(true);
        expect(read.said).toBe(true);
        expect(read.row).toBe(true);
      }
      expect(errors).toEqual([]);
    }, 400000);
  }
});
