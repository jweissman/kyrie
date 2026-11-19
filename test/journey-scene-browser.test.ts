/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { JourneyCapture } from '../src/cli/journey-capture';
import { JourneyRead } from '../src/cli/journey-read';
import { JourneyScene } from '../scripts/journey-scene';
import { MonoBrowser } from './support/mono-browser';

// The journey reader's scene view (doc/architecture/mission-22/journey-reader): a step of a recorded journey shown
// by the page itself, from the checkpoint just before it (made headless from the capture's transcript), opened as a
// save file is, and the step's act done by its id. What the page then tells is what the capture kept. Opt in with
// KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('a recorded step shown by the page', () => {
  let site = '', dir = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  const args = ['test/fixtures/probes/barred-way/probe.campaign.json'];
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-scene-'));
    dir = await mkdtemp(join(tmpdir(), 'kyrie-scene-run-'));
    await SiteBuild.site(site, { fixtures: true });
    const run = await JourneyCapture.record(await JourneyCapture.start(args), { args, limit: 2 });
    await writeFile(join(dir, 'captured.json'), JourneyRead.json(run));
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => {
    await browser?.close();
    await rm(site, { recursive: true, force: true }); await rm(dir, { recursive: true, force: true });
  });

  it('opens the game as it was before the step, and tells what the capture kept of it', async () => {
    const file = join(dir, 'step-2.checkpoint.json');
    expect(await JourneyRead.main(['scene', dir, '2', '--out', file])).toBe(0);
    const { page, errors } = await MonoBrowser.page(browser, { width: 1440, height: 900 }, { site, query: '' });
    const scene = await JourneyScene.show(page, await readFile(file, 'utf8'));
    const kept = JourneyRead.read(dir).steps[1]!;
    // What the capture kept of the step (the barred way's first try, whichever the page leads with: AT-01 moved it from
    // listening at the portcullis to trying it), told by the page after it and not before.
    const first = kept.said.scene.prose.join(' ').match(/^[^.]*/)![0];
    expect(first).toMatch(/portcullis/);
    expect(scene.after).toContain(first);
    expect(scene.before).not.toContain(first);
    expect(errors).toEqual([]);
  }, 180000);
});
