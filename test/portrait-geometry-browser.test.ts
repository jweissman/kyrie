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
import { Rail } from './support/rail';

// Portraits are true circles (OR-504, the owner's playtest of 24 November): wherever a face is drawn small, its box is
// square and round, and its picture covers it. Measured on the first hour's pages that draw faces, at a laptop's
// 1280 by 800 and a phone's 390 by 844: who is here on Millholm's green, the character's page of the book, the people
// of a busy place, and the company and the rats in a fight. Opt in with KYRIE_BROWSER=1.
interface Face { where: string; w: number; h: number; round: boolean; cover: boolean }
class Faces {
  // A foe's likeness in a fight is a plate on its card, never an oval (the owner's playtest of 27 November, OR-1493):
  // only the company's faces there are measured round.
  static readonly selector = ['.plate .face', '.portraits .portrait .face', '.fight .ours .fighter .face',
    '.character .head-of .sat', '.lens-face', '.signature .face', '.roster > .act'].join(', ');
  static async measure(page: Page, where: string): Promise<Face[]> {
    return page.evaluate(([sel, at]) => [...document.querySelectorAll(sel)].flatMap(e => {
      const r = e.getBoundingClientRect(), s = getComputedStyle(e);
      if (r.width === 0 || r.height === 0 || s.visibility === 'hidden') { return []; }
      const img = e instanceof HTMLImageElement ? e : e.querySelector(':scope > img');
      const fit = img ? getComputedStyle(img).objectFit : 'cover';
      const radius = parseFloat(s.borderTopLeftRadius), pct = s.borderTopLeftRadius.endsWith('%');
      return [{ where: `${at}: ${e.className}`, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10,
        round: pct ? radius >= 50 : radius >= r.width / 2 - 0.5,
        cover: fit === 'cover' || e.classList.contains('whole') || (!!img && img.classList.contains('whole')) }];
    }), [Faces.selector, where] as const);
  }
  // Gone to by the places lens, as the fight's geometry walks it.
  static async to(page: Page, d: MonoDriver, place: string) {
    await Rail.click(page, '.opens-go');
    const row = `.glance .lens :is([data-act="travel:${place}"], [data-act^="exit:${place}"]) >> nth=0`;
    await LensPages.seek(page, row);
    await d.click(row);
  }
  static wrong(faces: Face[]): string[] {
    return faces.filter(f => Math.abs(f.w - f.h) > 0.6 || !f.round || !f.cover)
      .map(f => `${f.where} ${f.w}x${f.h}${f.round ? '' : ' not round'}${f.cover ? '' : ' not covered'}`);
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('portraits', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-portraits-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800], [390, 844]] as const)('at %ix%i are square and round wherever a face is drawn', async (width, height) => {
    const { page, driver: d, errors } = await MonoBrowser.page(browser, { width, height }, { site, query: '?world=a1' });
    const faces: Face[] = [], to = (place: string) => Faces.to(page, d, place);
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    faces.push(...await Faces.measure(page, 'creation'));
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    await to('region__s2_green');
    await d.talk();
    faces.push(...await Faces.measure(page, 'who is here'));
    await d.key('Escape');
    await d.mode('c');
    faces.push(...await Faces.measure(page, 'the character'));
    await page.keyboard.press('e'); await d.settle();
    await d.talk();
    await page.click('.surface .portraits [data-subject="region__s2_merchant"] .portrait');
    // The job is asked after once told what the matter is (OR-423, OR-370).
    await d.pick(c => /what the matter is/.test(c.label), 'what the matter is');
    await d.pick(c => /^Ask about the rats in the corn-store/.test(c.label), 'the rats');
    await d.away();
    await to('region__s2_u_store'); await to('region__s2_u_cellar');
    await d.pick(c => /light|Light/.test(c.label), 'a light');
    await to('region__s2_u_warren');
    await d.pick(c => c.id === 'region__s2_u_rats/0:Attack', 'the rats');
    for (let i = 0; i < 200 && !((await d.inspect()).combat?.ours); i++) { await page.waitForTimeout(30); }
    faces.push(...await Faces.measure(page, 'a fight'));
    const where = new Set(faces.map(f => f.where.split(':')[0]));
    expect([...where].sort()).toEqual(expect.arrayContaining(['a fight', 'the character', 'who is here']));
    expect(Faces.wrong(faces)).toEqual([]);
    expect(errors).toEqual([]);
  }, 300000);
});
