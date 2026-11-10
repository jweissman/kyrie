import { describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MonoBrowser } from './support/mono-browser';
import { SiteBuild } from '../src/cli/site-build';

// The reference first hour, played through the page by its leads alone, with a picture of every step (KYRIE_TOUR; the
// pictures to KYRIE_SHOTS): a fixed world (kahitude), an ordinary warrior, the debt. At a place, what the glance leads
// with; in talk, the reply drawn in the aim's gold, or else the first; on the map, setting out; in a fight, what "let
// them fight" does; the fight's end gone on from. Nothing is chosen by an id the page does not lead with. It is the
// evidence for the closure's account of the opening, not a gate: it reports where the page stopped leading.
describe.skipIf(!process.env.KYRIE_TOUR)('the reference hour, through the page', () => {
  it('is played by its leads from the shop to wherever they stop', async () => {
    const out = process.env.KYRIE_SHOTS ?? await mkdtemp(join(tmpdir(), 'kyrie-tour-'));
    await mkdir(out, { recursive: true });
    const site = await mkdtemp(join(tmpdir(), 'kyrie-tour-site-'));
    await SiteBuild.site(site, {});
    const browser = await MonoBrowser.launch();
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, query: '?world=kahitude' });
    const log: string[] = [];
    let n = 0;
    const shot = async (what: string) => {
      await d.settle(); await page.waitForTimeout(600); n++;
      await page.screenshot({ path: join(out, `${String(n).padStart(2, '0')}-${what.replace(/\W+/g, '-').slice(0, 40)}.png`) });
    };
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="origin"][data-id="debt"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    await shot('start');
    for (let step = 0; step < 40; step++) {
      const st = await d.inspect();
      if (st.mode === 'combat') {
        log.push(`${step} fight: ${st.combat?.foes.map(f => f.name).join(', ')}`);
        await shot('fight');
        for (let i = 0; i < 30 && !(await d.inspect()).combat?.outcome; i++) { await d.key('t'); }
        await shot('fight-end');
        if ((await d.inspect()).party?.every(m => m.hp <= 0)) { log.push('  the company fell'); break; }
        await page.click('[data-action="onward"], [data-choice="onward"]').catch(() => undefined);
        continue;
      }
      if (st.mode === 'talk') {
        const gold = page.locator('.replies .aimed').first(), any = page.locator('.replies button').first();
        const reply = await gold.count() ? gold : any;
        const said = (await reply.textContent())?.trim() ?? '';
        log.push(`${step} talk: ${said}${await gold.count() ? ' (gold)' : ''}`);
        if (!said) { break; }
        await reply.click(); await shot(`said-${said}`);
        await page.keyboard.press('Escape'); await d.settle();
        continue;
      }
      // The map over the place (the board) or as its own page: setting out from it, when it offers that.
      if (st.mode === 'map' || await page.locator('[data-action="set-out"]').count()) {
        const go = page.locator('[data-action="set-out"]').first();
        log.push(`${step} map: ${await go.count() ? (await go.textContent())?.trim() : 'nothing to set out on'}`);
        if (!await go.count()) { break; }
        await go.click(); await shot('set-out');
        continue;
      }
      // A thing looked at (a find led with): taken, as its pane offers; then the place again.
      if (st.mode === 'examine') {
        const take = page.getByRole('button', { name: /^Take\b/ }).first();
        log.push(`${step} look: ${await take.count() ? 'Take' : 'nothing to take'}`);
        if (await take.count()) { await take.click(); await shot('take'); }
        await page.keyboard.press('Escape'); await d.settle();
        continue;
      }
      const lead = st.glance?.acts[0];
      log.push(`${step} @${st.place?.name}: lead [${lead?.why ?? '-'}] ${st.choices.find(c => c.id === lead?.choice)?.label ?? lead?.choice ?? '(none)'}`);
      if (!lead) { break; }
      // A journey is the map's: the Map key is lit, and the map opens with the way chosen (see Stage.mapLed).
      if (lead.choice.startsWith('travel:') && !st.choices.some(c => c.id === lead.choice)) {
        log.push(`  the Map key${await page.locator('.corner.icon.led, .sheet-key.led').count() ? ' is lit' : ' is not lit'}`);
        await d.key('m'); await shot('map');
        continue;
      }
      try { await d.pick(c => c.id === lead.choice, lead.choice); } catch (e) { log.push(`  could not take it: ${String(e).slice(0, 120)}`); break; }
      await shot(lead.choice);
    }
    await writeFile(join(out, 'tour.txt'), [...log, '', 'Errors:', ...errors].join('\n'));
    console.log(log.join('\n'));
    await browser.close();
    await rm(site, { recursive: true, force: true });
    expect(errors).toEqual([]);
  }, 900000);
});
