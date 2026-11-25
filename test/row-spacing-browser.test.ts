/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';
import { LensPages } from './support/lens-pages';

// One row model, one spacing (OR-505, the owner's playtest of 24 November): in every menu a page draws (each element
// PageFrame marked its menu), the rows one over another stand the same distance apart, whatever group or list each is
// of. Measured at a laptop's 1280 by 800 and a phone's 390 by 844 on the pages of the first hour that have menus: the
// title, how a life begins, Options, a step of creation, the place at rest, the places lens, a conversation, the Notes
// and a fight's hand. Rows side by side (a two-column step) are each column measured apart.
// Opt in with KYRIE_BROWSER=1.
class Rows {
  // Every menu's gaps between rows one over another, by its column, where nothing is said between them (a group's
  // heading stands apart, as a page's words do): each gap the one spacing, the page's --row-gap.
  static async uneven(page: Page, where: string): Promise<string[]> {
    return page.evaluate(at => {
      const out: string[] = [], px = (v: string) => {
        const probe = document.createElement('div'); probe.style.height = v; document.body.append(probe);
        const h = probe.getBoundingClientRect().height; probe.remove(); return h;
      };
      const gap = px(getComputedStyle(document.documentElement).getPropertyValue('--row-gap') || '0px');
      document.querySelectorAll('[data-menu]').forEach((menu, m) => {
        const rows = [...menu.querySelectorAll('.choice-row')].filter(r => !r.parentElement?.closest('.choice-row'))
          .map(r => r.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0);
        const said = [...menu.querySelectorAll('p, h1, h2, h3, h4, .label, summary')]
          .filter(e => !e.closest('.choice-row')).map(e => e.getBoundingClientRect()).filter(r => r.height > 0);
        const columns = new Map<number, DOMRect[]>();
        for (const r of rows) { const x = Math.round(r.left); columns.set(x, [...columns.get(x) ?? [], r]); }
        for (const [x, col] of columns) {
          const sorted = col.sort((a, b) => a.top - b.top);
          const off = sorted.slice(1).flatMap((r, i) => {
            const above = sorted[i]!, between = said.some(s => s.top >= above.bottom - 1 && s.bottom <= r.top + 1);
            const g = Math.round((r.top - above.bottom) * 10) / 10;
            return between || Math.abs(g - gap) <= 1 ? [] : [g];
          });
          if (off.length) { out.push(`${at}: menu ${m} at x ${x}: gaps ${off.join(', ')} where ${gap} is the one`); }
        }
      });
      return out;
    }, where);
  }
  static async to(page: Page, d: MonoDriver, place: string) {
    await page.click('.opens-go');
    const row = `.glance .lens :is([data-act="travel:${place}"], [data-act^="exit:${place}"]) >> nth=0`;
    await LensPages.seek(page, row);
    await d.click(row);
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the rows of a menu', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-rows-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800], [390, 844]] as const)('at %ix%i stand one distance apart in every menu', async (width, height) => {
    const uneven: string[] = [];
    const title = await MonoBrowser.page(browser, { width, height }, { site, query: '' });
    const t = title.page;
    await t.waitForSelector('.title-menu .way-in', { timeout: 120000 });
    uneven.push(...await Rows.uneven(t, 'the title'));
    await t.focus('[data-action="begin"]'); await t.keyboard.press('Enter');
    await t.waitForSelector('[data-mode="begin"]');
    uneven.push(...await Rows.uneven(t, 'how a life begins'));
    await t.keyboard.press('Escape');
    await t.click('[data-action="options"]'); await t.waitForSelector('[data-mode="options"]');
    uneven.push(...await Rows.uneven(t, 'options'));
    await t.close();
    const { page, driver: d, errors } = await MonoBrowser.page(browser, { width, height }, { site, query: '?world=a1' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    uneven.push(...await Rows.uneven(page, 'creation'));
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    await Rows.to(page, d, 'region__s2_green');
    uneven.push(...await Rows.uneven(page, 'the green'));
    await page.click('.opens-go');
    uneven.push(...await Rows.uneven(page, 'the places lens'));
    await d.key('Escape');
    await d.talk();
    await page.click('.surface .portraits [data-subject="region__s2_merchant"] .portrait');
    uneven.push(...await Rows.uneven(page, 'a conversation'));
    // The job is asked after once told what the matter is (OR-423, OR-370).
    await d.pick(c => /what the matter is/.test(c.label), 'what the matter is');
    await d.pick(c => /^Ask about the rats in the corn-store/.test(c.label), 'the rats');
    uneven.push(...await Rows.uneven(page, 'a reply'));
    await d.away();
    await d.mode('j');
    uneven.push(...await Rows.uneven(page, 'the notes'));
    await page.keyboard.press('e'); await d.settle();
    await Rows.to(page, d, 'region__s2_u_store'); await Rows.to(page, d, 'region__s2_u_cellar');
    await d.pick(c => /light|Light/.test(c.label), 'a light');
    await Rows.to(page, d, 'region__s2_u_warren');
    await d.pick(c => c.id === 'region__s2_u_rats/0:Attack', 'the rats');
    for (let i = 0; i < 200 && !((await d.inspect()).combat?.ours); i++) { await page.waitForTimeout(30); }
    uneven.push(...await Rows.uneven(page, 'a fight'));
    expect(uneven).toEqual([]);
    expect(errors).toEqual([]);
  }, 400000);
});
