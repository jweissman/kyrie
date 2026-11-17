import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { ActionCensus } from './support/action-census';

// One structure for every page (the owner, 16 November night: "stray 'not true action items' objects, sometimes
// styled as action items but clearly rendered by some other structure than the promoted four"; "enforce this
// mechanically"): everything pressable from the title to the Book is in the page's one menu or its rail, or is named in
// ActionCensus.allowed with why. A new button anywhere else fails here, by its words and the page it was on.
describe.skipIf(!process.env.KYRIE_BROWSER)('every page, one menu and one rail', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-census-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('has nothing pressable outside the menu and the rail, from the title to the Book', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } }), errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    expect(await ActionCensus.walk(page, site)).toEqual([]);
    expect(errors).toEqual([]);
    await page.close();
  }, 400000);
});
