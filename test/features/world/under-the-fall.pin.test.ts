import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { RunnerFight } from '../../../src/cli/runner-fight';
import { ModuleWriter } from '../../../src/lang/module-writer';

// The stock opening (BRIEF §3.1; the owner, 23 November): a new life begun in the dark of an old adit above Porthalen,
// the roof come down behind it, ahead of the drove road's own beginning (data/openings/adit, chosen at creation:
// --opening adit). Two rooms, one person, one ration, one fight, one hazard, then the open world, each met by the rows
// the frame offers alone (no act is named here that the frame did not offer), and each changing the world: a light
// made, the bait-bag taken and eaten, the badger fought, Dai Probert asked along, the fallen prop lifted. Light a torch
// is among the first frame's few rows. A careless life (no light, Dai left where he sits) still gets out, hurt for it;
// and either way the drove story begins on the green, Owain telling what was done while the life was under the hill.
type Row = { id: string; label: string };
const start = async () => {
  const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna',
    '--opening', 'adit']));
  return { journey, r: new Runner(journey.session) };
};
const rows = (s: Said): Row[] => [...s.offer?.primary ?? [], ...s.offer?.rest ?? []] as Row[];
// The offered row whose words say this, asked; failing if the frame offers none.
const take = async (r: Runner, s: Said, words: RegExp): Promise<Said> => {
  // The act itself before the aim's way to it, where both are offered in the same words.
  const all = rows(s).filter(x => words.test(x.label)), row = all.find(x => !x.id.startsWith('follow:')) ?? all[0];
  expect([String(words), row?.label]).toEqual([String(words), expect.any(String)]);
  const said = await r.ask(JSON.stringify({ act: row!.id }));
  expect('error' in said ? said.error : '').toBe('');
  return said as Said;
};
const fight = async (r: Runner, s: Said): Promise<Said> => {
  const begun = await take(r, s, /^Attack an old boar badger/);
  return 'error' in begun ? begun : await r.ask(JSON.stringify({ act: RunnerFight.through })) as Said;
};
describe('a new life begun under the fall in the old adit', () => {
  it('learns light, food, help and risk by doing, by the offered rows alone, and comes out to the drove story', async () => {
    const t0 = performance.now(), { journey, r } = await start(), w = () => journey.session.campaign.world;
    const begun = performance.now() - t0;
    const holds = (name: string, ...args: string[]) => w().test(ModuleWriter.call(name, ...args));
    let s = r.said('look');
    expect(w().one('at', 'party')).toBe('region__s1_adit_fall');
    expect(holds('benighted', 'party')).toBe(true);
    // The first frame: a few rows, lighting a torch among the first of them.
    expect(s.offer!.primary.length).toBeLessThanOrEqual(4);
    expect(s.offer!.primary.slice(0, 3).map(x => x.label).join(' | ')).toMatch(/light a torch/);
    let acts = 0;
    const step = async (words: RegExp) => { acts++; s = await take(r, s, words); return s; };
    await step(/light a torch/i);
    expect(holds('benighted', 'party')).toBe(false);
    await step(/^Collect your bait-bag/);
    expect(holds('ownedItem', 'adit__bait', 'region__member_party_1')).toBe(true);
    await step(/^To the old gallery/);
    acts++;
    s = await fight(r, s);
    expect(holds('able', 'adit__badger')).toBe(false);
    await step(/^Eat the bread and cheese/);
    expect(holds('ownedItem', 'adit__bait', 'region__member_party_1')).toBe(false);
    await step(/^Talk to Dai Probert/);
    expect(holds('willing', 'adit__dai', 'party')).toBe(true);
    await step(/^Ask Dai Probert to join/);
    expect(holds('travelsWith', 'adit__dai', 'party')).toBe(true);
    await step(/^Lift the fallen prop with Dai/);
    await step(/^Up to the old drift's mouth/);
    // Out in the open: Dai goes home grateful; the way down is the drove road into the town.
    expect(holds('grateful', 'adit__dai', 'party')).toBe(true);
    expect(holds('travelsWith', 'adit__dai', 'party')).toBe(false);
    const open = performance.now() - t0;
    await step(/^To the landing at Porthalen/);
    expect(s.scene.lines.join(' ')).toContain('They counted, and they took Bran');
    expect(holds('knows', 'party', 'drove__held')).toBe(true);
    await step(/^Ask Owain how many head came down/);
    expect(holds('knows', 'party', 'drove__boy_count')).toBe(true);
    console.log(`under the fall: ${acts} acts to the open world, ${Math.round(open)} ms headless from the life's start`
      + ` (the world drawn ${Math.round(begun)} ms, the acts ${Math.round(open - begun)} ms)`);
  }, 120000);
  it('lets a careless life out, without a light and without Dai, at a cost', async () => {
    const { journey, r } = await start(), w = () => journey.session.campaign.world;
    const hurt = (said: Said) => { const [, now, most] = /(\d+) of (\d+)/.exec(said.you ?? '') ?? []; return Number(now) < Number(most); };
    let s = r.said('look');
    s = await take(r, s, /^Feel along the wall in the dark/);
    expect(w().one('at', 'party')).toBe('region__s1_adit_gallery');
    s = await fight(r, s);
    s = await take(r, s, /^Feel along the fallen prop in the dark/);
    s = await take(r, s, /^Up to the old drift's mouth/);
    expect(w().one('at', 'party')).toBe('region__s1_adit_mouth');
    expect(w().test(ModuleWriter.call('travelsWith', 'adit__dai', 'party'))).toBe(false);
    expect(hurt(s)).toBe(true);
    s = await take(r, s, /^To the landing at Porthalen/);
    expect(s.scene.lines.join(' ')).toContain('They counted, and they took Bran');
  }, 120000);
});
