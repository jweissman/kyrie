import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { RunnerFight } from '../../../src/cli/runner-fight';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { KyrTemplates } from '../../../src/world/kyr-template';
import { RegionUndertown } from '../../../src/world/region-undertown';
import { AsMeant } from '../../support/as-meant';

// The first town's frame varies (the corpus review, November 2026): every first town had had the churchyard's
// raised dead and the quarry's spiders. Each has a second cause now, and the loop under the town keeps its shape with
// other particulars. Under the churchyard, a sexton who has sold what the old dead were buried with, and the
// bone-pickers come up after the smell; laid by putting back what was taken (a custodian's situation). In the quarry,
// a she-bear denned with her cub, and the wolves that follow her; fought here, or smoked out, or let by. Iscoed's
// first town keeps its own causes (data/imbar/atlas.json's fix), so the reference journey holds. bench-1's first town
// draws the bone-pickers, bench-2's the bear.
type Row = { id: string; label: string; opens?: Row[] };
const flat = (rs: Row[]): Row[] => rs.flatMap(r => [r, ...flat(r.opens ?? [])]);
const rows = (s: Said): Row[] => flat([...s.offer?.primary ?? [], ...s.offer?.rest ?? [],
  ...Object.values(s.offer?.lenses ?? {}).flat()] as Row[]);
class Walk {
  s!: Said;
  private constructor(readonly r: Runner, readonly session: Runner['session']) {}
  static async begun(world: string): Promise<Walk> {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', world, '--as', 'human/warrior/Wenna',
      '--opening', 'none']));
    const walk = new Walk(new Runner(journey.session), journey.session);
    walk.s = walk.r.said('look');
    return walk;
  }
  holds(name: string, ...args: string[]): boolean {
    return this.session.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  async play(steps: string[]): Promise<void> {
    for (const step of steps) {
      const row = step === 'through' ? undefined : rows(this.s).find(x => new RegExp(step, 'i').test(x.label));
      if (step !== 'through') { expect([step, row?.label]).toEqual([step, expect.any(String)]); }
      const said = await AsMeant.ask(this.r, JSON.stringify({ act: row?.id ?? RunnerFight.through }));
      expect([step, 'error' in said ? said.error : '']).toEqual([step, '']);
      this.s = said as Said;
    }
  }
}
describe('the first town\'s frame', () => {
  it('under the churchyard, the sexton\'s selling and the bone-pickers, laid by putting back what was taken',
    async () => {
      const walk = await Walk.begun('bench-1');
      await walk.play(['^To the market-place', '^Read the notice', '^To the shrine', 'about the bones in the churchyard',
        '^To the market-place', '^To the churchyard', 'Job Dunstall', '^Down to the crypt', 'light a torch', 'ossuary']);
      // The stripped shelves are seen before the sexton will say what he did.
      expect(walk.holds('knows', 'party', 'region__s1_u_pickers_why')).toBe(true);
      await walk.play(['^To the crypt', 'churchyard', 'who opened the old shelves', 'crypt', 'ossuary',
        '^Put the grave-goods back']);
      expect(walk.holds('region__s1_u_done', 'region__s1_u_pickers_job')).toBe(true);
      expect(walk.s.scene.lines.join(' ')).toMatch(/150 experience/);
      // Their young are gone from the charnel passage with them, and the way down to the undercroft is open.
      await walk.play(['charnel', 'undercroft|steps']);
      expect(walk.session.campaign.world.one('at', 'party')).toBe('region__s1_u_undercroft');
      expect(walk.holds('at', 'region__s1_u_pickers_young', 'region__s1_u_charnel')).toBe(false);
    }, 300000);
  it('in the quarry, the she-bear\'s den and her wolves, a real fight, and the house pays', async () => {
    const walk = await Walk.begun('bench-2');
    await walk.play(['^To the landing', '^Read the notice', '^Into the Fierce Dragon', 'about the old quarry', 'landing|Out',
      'old quarry pit', '^Down to the quarry adit$', 'light a torch', 'cut gallery|old cutting', '^Attack the wol', 'through',
      '^To the den', '^Attack the she-bear', 'through']);
    expect(walk.holds('able', 'region__s1_u_bear')).toBe(false);
    expect(walk.holds('region__s1_u_done', 'region__s1_u_bear_job')).toBe(true);
    // Not the spiders' brood-chamber: the den, and nothing of web in the adit.
    expect(walk.s.scene.lines.join(' ')).not.toMatch(/web|brood/i);
  }, 300000);
  it('keeps Iscoed\'s first town as it was, and draws both causes of each among other towns', () => {
    const atlas = JSON.parse(readFileSync('data/imbar/atlas.json', 'utf8')) as
      { countries: { fix?: { undertown?: Record<string, string> } }[] };
    const fixed = atlas.countries[0]!.fix!.undertown!;
    expect(fixed).toEqual({ store: 'rats', yard: 'dead', pit: 'spiders' });
    const drawn = (key: string, fix: Record<string, string> = {}) => KyrTemplates.choose(RegionUndertown.template, key,
      {}, fix).filter(x => ['yard', 'pit'].includes(x.group)).map(x => `${x.group}:${x.option}`);
    expect(drawn('any:s1:undertown', fixed)).toEqual(['yard:dead', 'pit:spiders']);
    const all = new Set(Array.from({ length: 50 }, (_, i) => drawn(`frame-${i}:s1:undertown`)).flat());
    expect([...all].sort()).toEqual(['pit:bear', 'pit:spiders', 'yard:dead', 'yard:pickers']);
  });
});
