import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { NewTool } from '../src/cli/new-tool';
import { KyrLint } from '../src/cli/kyr-lint';
import { Journey } from '../src/session/journey';

// `kyrie new` begins an adventure with everything it needs: a module that lints clean and plays, its company in a file
// of its own (so that it can be placed in a generated world), a placed bundle, a campaign, and a first journey and the
// test that plays it. What is there already is not written over.
describe('an adventure begun with kyrie new', () => {
  let root = '';
  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'kyrie-new-'));
    await mkdir(join(root, 'data'));
    await symlink(resolve('data', 'rules'), join(root, 'data', 'rules'));
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
  it('writes nothing over what is there, and asks for an id it can use', async () => {
    const said: string[] = [];
    expect(await NewTool.main(['ashhollow'], root, l => said.push(l))).toBe(1);
    expect(said[0]).toStartWith('Already there, so nothing is written');
    expect(await NewTool.main(['Ash_Hollow'], root, l => said.push(l))).toBe(1);
    expect(said.at(-1)).toStartWith('usage: kyrie new');
  }, 60000);
});
