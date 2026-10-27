import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { NewTool } from '../src/cli/new-tool';
import { Parts } from '../src/cli/new-parts';
import { Adventures } from '../src/cli/new-home';
import { Characters } from '../src/cli/new-character';
import { VerifyTool } from '../src/cli/verify-tool';
import { KyrLint } from '../src/cli/kyr-lint';
import { Journey } from '../src/session/journey';

// `kyrie new` begins an adventure with everything it needs: a module that lints clean and plays, its company in a file
// of its own (so that it can be placed in a generated world), a placed bundle, a campaign, and a first journey and the
// test that plays it; and then parts of it (a scene, an item, a chapter, a character of each weight), and sites of the
// generator's library, each a working example (the studio of brief X). What is there already is not written over.
describe('an adventure begun with kyrie new', () => {
  let root = '';
  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'kyrie-new-'));
    await mkdir(join(root, 'data'));
    await symlink(resolve('data', 'rules'), join(root, 'data', 'rules'));
    // The tests it writes play the adventure with the engine, as they would in the repository.
    await symlink(resolve('src'), join(root, 'src'));
  });
  afterAll(async () => { await rm(root, { recursive: true, force: true }); });

  it('lints clean, and plays its first journey', async () => {
    const wrote: string[] = [];
    expect(await NewTool.main(['ashhollow', 'Ash Hollow'], root, l => wrote.push(l))).toBe(0);
    expect(wrote).toContain('  wrote data/adventures/ashhollow/company.kyr');
    const campaign = join(root, 'data/campaigns/ashhollow.campaign.json');
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
    const steps = JSON.parse(await readFile(join(root, 'test/fixtures/ashhollow/journey.json'), 'utf8')) as { arrive: string[] };
    const j = await Journey.start(campaign, 'ash');
    await j.play(...steps.arrive);
    expect(j.at('party')).toBe('ashhollow__square');
    const placed = JSON.parse(await readFile(join(root, 'data/adventures/ashhollow/placed.json'), 'utf8')) as
      { source: string[]; imports: string[] };
    expect([placed.source, placed.imports]).toEqual([['site.kyr', 'placed.kyr'], ['party']]);
  }, 60000);
  // And holds: its lint, the test kyrie new wrote, and its kept traces (none), checked at once.
  it('is verified whole', async () => {
    const said: string[] = [];
    expect(await VerifyTool.main(['ashhollow'], root, l => said.push(l))).toBe(0);
    expect(said).toEqual(['lint: clean', 'tests: 2 passed, 0 failed, in 1 file', 'traces: 0 of 0 come to what they came to',
      'ashhollow: lint, tests and traces all hold']);
  }, 60000);
  // A part written into it is a working example: the module lints clean with it, and the steps its test plays tell
  // what the test says they will.
  it('takes a scene, an item, a chapter and a character of each weight, each played as its test plays it', async () => {
    const campaign = join(root, 'data/campaigns/ashhollow.campaign.json'), said: string[] = [];
    const parts = [['scene', 'well'], ['item', 'oarlock'], ['chapter', 'bells'], ...Characters.tiers
      .map(t => ['character', `mara${Characters.tiers.indexOf(t)}`, `--${t}`])];
    for (const [kind, id, ...flags] of parts) {
      expect(await NewTool.main([kind!, id!, '--in', 'ashhollow', ...flags], root, l => said.push(l))).toBe(0);
    }
    expect(said).toContain('  named well.kyr in data/adventures/ashhollow/placed.json');
    expect((await KyrLint.campaign(campaign)).filter(f => f.level !== 'advice')).toEqual([]);
    const home = Adventures.read(root, 'ashhollow');
    for (const part of [Parts.scene(home, 'well'), Parts.item(home, 'oarlock'), Parts.chapter(home, 'bells'),
      ...Characters.tiers.map((t, i) => Characters.make(home, `mara${i}`, t))]) {
      const j = await Journey.start(campaign, 'parts');
      await j.play(...part.steps);
      expect([part.source, j.page]).toEqual([part.source, expect.stringContaining(part.told)]);
    }
  }, 120000);
  it('begins a site of the generator\'s library, walked in a country of its own', async () => {
    expect(await NewTool.main(['site', 'barrow', 'The Barrow'], root, () => undefined)).toBe(0);
    const probe = join(root, 'test/fixtures/barrow/probe.campaign.json');
    expect((await KyrLint.campaign(probe)).filter(f => f.level === 'error')).toEqual([]);
    const j = await Journey.start(probe, 'site');
    await j.play('>barrow__hall', 'the stone table: Examine');
    expect(j.page).toContain('and the last of them is fresh');
  }, 60000);
  it('writes nothing over what is there, and asks for an id it can use', async () => {
    const said: string[] = [];
    expect(await NewTool.main(['ashhollow'], root, l => said.push(l))).toBe(1);
    expect(said[0]).toStartWith('Already there, so nothing is written');
    expect(await NewTool.main(['Ash_Hollow'], root, l => said.push(l))).toBe(1);
    expect(said.at(-1)).toStartWith('usage: kyrie new');
  }, 60000);
});
