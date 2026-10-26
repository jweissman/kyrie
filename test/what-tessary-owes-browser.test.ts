/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// What Tessary Owes as a player meets it in the page, at a desk and on a phone: chosen from the title page, the notice
// read at the Landgate, the Withies, a word with the mudlark, the chandler's shelf. Screenshots go to
// TESSARY_SHOTS when it is set (doc/adventures/what-tessary-owes/playtest/screens). Opt in with KYRIE_BROWSER=1.
const act = async (d: MonoDriver, ...labels: string[]) => {
  for (const label of labels) {
    for (const part of label.split(' › ')) {
      const re = new RegExp(part, 'i');
      await d.pick(c => re.test(c.label), part);
    }
  }
};

describe.skipIf(!process.env.KYRIE_BROWSER)('What Tessary Owes in the browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-tessary-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1440, 900, false], [390, 844, true]] as const)('at %ix%i', async (width, height, pointer) => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width, height },
      { site, pointer, query: '?campaign=what-tessary-owes' });
    const shots = process.env.TESSARY_SHOTS;
    if (shots) { await mkdir(shots, { recursive: true }); }
    const shot = async (name: string) => { if (shots) { await page.screenshot({ path: join(shots, `${width}-${name}.png`) }); } };
    await page.waitForSelector('[data-action="start"]');
    await shot('title');
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await shot('causeway');
    await act(d, '^To the Landgate');
    expect(await page.evaluate(() => document.body.innerText)).toContain('Saint Evenhand');
    await act(d, 'notice', '^Read');
    expect(await page.evaluate(() => document.body.innerText)).toContain('Nan Teazle');
    await shot('landgate');
    await act(d, '^Back');
    await act(d, '^To the Withies');
    const withies = await page.evaluate(() => document.body.innerText);
    expect(withies).toContain('Withies');
    expect(withies).toContain('Wick');
    await act(d, '^Talk to Wick', 'night Davy went');
    expect(await page.evaluate(() => document.body.innerText)).toContain('I followed him');
    await shot('wick');
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
});
