import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SiteBuild } from '../bin/site-build';
import { PlaySession, type Transcript } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { FrontierHistories } from './frontier-histories';
import type { CreatureGenerationContext } from '../src/content';
import { OrraHistories } from './orra-histories';

interface Harness { replay(transcript: Transcript): Promise<string> }
interface History {
  party?: CreatureGenerationContext[]; name: string; manifest: string; seed: string; commands: string[];
}

// The same seed and commands must produce the same canonical state, event log, player view and chronicle in
// Bun (in-process and through the CLI) and in the browser-targeted bundle. With KYRIE_CHROMIUM set to a
// Chromium/headless-shell binary, the static parity page is also executed by a real browser.
class Parity {
  static dir = '';
  static harness: Harness;
  static readonly histories: History[] = [
    { name: 'cooperate', manifest: 'data/bundles/crossing.campaign.json', seed: 'slice', commands: ['travel(crossing__bank)',
      'pay(crossing__guard)', 'pay(crossing__guard)', 'pay(crossing__guard)', 'wait', 'cross(crossing__guard,crossing__road)'] },
    { name: 'violence', manifest: 'data/bundles/crossing.campaign.json', seed: 'ember',
      commands: ['travel(crossing__bank)', 'attack(crossing__guard)', 'cross(crossing__guard,crossing__road)', 'wait'] },
    { name: 'abandon', manifest: 'data/bundles/crossing.campaign.json', seed: 'slice',
      commands: ['walk(crossing__refuge)', ...Array<string>(9).fill('wait')] },
    { name: 'discovery', manifest: 'data/discovery/orchard.campaign.json', seed: 'glass', commands: ['examine(orchard__mirror)',
      'travel(orchard__yard)', 'travel(orchard__glasshouse)', 'tell(orchard__orris,orchard__mirror_prisons)', 'wait', 'wait'] },
    { name: 'two sites', manifest: 'data/bundles/two-sites.campaign.json', seed: 'sites',
      commands: ['travel(crossing__bank)', 'give_food(crossing__guard)', 'wait', 'wait', 'wait'] },
    { name: 'Blackvein investigation', manifest: 'data/blackvein/campaign.json', seed: 'bells',
      commands: ['travel(vale__square)', 'travel(vale__guild)', 'examine(vale__ledger)',
        'travel(vale__square)', 'travel(vale__toll)', 'tell(vale__vey,vale__charter)',
        'travel(vale__square)', 'travel(vale__ridge)', 'travel(vale__hollow)',
        'ask(vale__len,vale__escape_route)', 'examine(vale__bark)', 'tell(vale__len,vale__charter)',
        'travel(vale__ridge)',
        'passage(vale__vault)', 'disable(vale__bell)'] },
    { name: 'sanctuary information unit', manifest: 'data/sanctuary/campaign.json', seed: 'oath',
      commands: ['examine(refuge__charter)', 'tell(refuge__cira,refuge__founding_oath)', 'travel(refuge__hall)'] },
    { name: 'Orra investigation', manifest: 'data/orra/fellowship.campaign.json', seed: 'orra',
      commands: OrraHistories.investigator },
    { name: 'Orra armed company', manifest: 'data/orra/company.campaign.json', seed: 'orra',
      commands: OrraHistories.violence },
    { name: 'frontier Fellowship loop', manifest: 'data/orra/play.campaign.json', seed: 'orra',
      party: FrontierHistories.fellowship, commands: [...FrontierHistories.first, ...FrontierHistories.second] },
    { name: 'frontier hired-company loop', manifest: 'data/orra/play.campaign.json', seed: 'orra',
      party: FrontierHistories.company, commands: [...FrontierHistories.first, ...FrontierHistories.second] },
  ];
  // Plays a history with automatic tactics for the party; stops early if the party can no longer act.
  static async record(history: History): Promise<PlaySession> {
    const session = await PlaySession.start(history.manifest, history.seed, NodeBundleSource.shared, history.party);
    for (const command of history.commands) {
      if (!PlayerView.observe(session.campaign).choices.some(c => c.id === command)) { break; }
      await session.perform(command);
    }
    return session;
  }
  static async cli(transcript: Transcript): Promise<string> {
    const path = join(this.dir, `${crypto.randomUUID()}.json`);
    await writeFile(path, JSON.stringify(transcript));
    const child = Bun.spawn(['bun', 'bin/kyrie.ts', 'replay', path],
      { cwd: SiteBuild.root, stdout: 'pipe', stderr: 'pipe' });
    const [out, err, code] = await Promise.all([new Response(child.stdout).text(),
      new Response(child.stderr).text(), child.exited]);
    if (code !== 0) { throw new Error(err); }
    return out.trim();
  }
  static async chromium(binary: string, site: string, transcript: Transcript): Promise<string> {
    const url = `${pathToFileURL(join(site, 'parity.html')).href}#${encodeURIComponent(JSON.stringify(transcript))}`;
    const child = Bun.spawn([binary, '--headless', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files',
      '--virtual-time-budget=120000', '--dump-dom', url], { stdout: 'pipe', stderr: 'ignore' });
    const dom = await new Response(child.stdout).text();
    await child.exited;
    const match = /<pre id="parity"[^>]*>([\s\S]*?)<\/pre>/.exec(dom);
    if (!match) { throw new Error('Parity page produced no result'); }
    return match[1]!.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  }
}

describe('CLI and browser parity', () => {
  beforeAll(async () => {
    Parity.dir = await mkdtemp(join(tmpdir(), 'kyrie-parity-'));
    await SiteBuild.bundle('web/harness.ts', Parity.dir, 'harness.js', false);
    await import(pathToFileURL(join(Parity.dir, 'harness.js')).href);
    Parity.harness = (globalThis as unknown as { KyrieHarness: Harness }).KyrieHarness;
  });
  afterAll(async () => { await rm(Parity.dir, { recursive: true, force: true }); });
  it.each(Parity.histories.map(h => [h.name, h] as const))(
    'replays the %s history to identical canonical state in every host', async (_name, history) => {
      const recorded = await Parity.record(history);
      const expected = recorded.canonical();
      expect(recorded.transcript.steps.length).toBeGreaterThan(1);
      if (history.party) { expect(recorded.transcript.steps.length).toBe(history.commands.length); }
      expect(await Parity.harness.replay(recorded.transcript)).toBe(expected);
      expect(await Parity.cli(recorded.transcript)).toBe(expected);
    }, 60000);
  it('records combat and divergent consequences in the parity histories', async () => {
    const violence = await Parity.record(Parity.histories[1]!);
    expect(violence.transcript.steps[1]!.combat!.length).toBeGreaterThan(0);
    const outcomes = await Promise.all(Parity.histories.slice(0, 3)
      .map(async h => (await Parity.record(h)).campaign.state.outcomes));
    expect(outcomes.map(o => [o!['crossing.settled'], o!['crossing.violence'], o!['crossing.deadline_missed']]))
      .toEqual([[true, false, false], [false, true, false], [false, false, true]]);
  }, 60000);
  it.skipIf(!process.env.KYRIE_CHROMIUM)('replays transcripts identically in a real headless browser', async () => {
    const site = join(Parity.dir, 'site');
    await SiteBuild.site(site);
    for (const history of Parity.histories) {
      const recorded = await Parity.record(history);
      const browser = await Parity.chromium(resolve(process.env.KYRIE_CHROMIUM!), site, recorded.transcript);
      expect(browser).toBe(recorded.canonical());
    }
  }, 300000);
});
