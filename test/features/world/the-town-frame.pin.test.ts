import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { RunnerFight } from '../../../src/cli/runner-fight';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { KyrTemplates } from '../../../src/world/kyr-template';
import { RegionUndertown } from '../../../src/world/region-undertown';
import { AsMeant } from '../../support/as-meant';
import { TalkWay } from '../../support/talk-way';

// The first town's frame varies (the corpus review, November 2026): every first town had had the churchyard's
// raised dead and the quarry's spiders. Each has a second cause now, and the loop under the town keeps its shape with
// other particulars. Under the churchyard, a sexton who has sold what the old dead were buried with, and the
// bone-pickers come up after the smell; laid by putting back what was taken (a custodian's situation). In the quarry,
// a she-bear denned with her cub, and the wolves that follow her; fought here, or smoked out, or let by. Iscoed's
// first town keeps its own causes (data/imbar/atlas.json's fix), so the reference journey holds. bench-1's first town
// draws the bone-pickers, bench-2's the bear.
type Row = { id: string; label: string; aside?: string; opens?: Row[] };
const flat = (rs: Row[]): Row[] => rs.flatMap(r => [r, ...flat(r.opens ?? [])]);
const rows = (s: Said): Row[] => flat([...s.offer?.primary ?? [], ...s.offer?.rest ?? [],
  ...Object.values(s.offer?.lenses ?? {}).flat()] as Row[]);
class Walk {
  s!: Said;
  private constructor(readonly r: Runner, readonly session: Runner['session']) {}
  static async begun(world: string, as = 'human/warrior/Wenna'): Promise<Walk> {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', world, '--as', as, '--opening', 'none']));
    const walk = new Walk(new Runner(journey.session), journey.session);
    walk.s = walk.r.said('look');
    return walk;
  }
  holds(name: string, ...args: string[]): boolean {
    return this.session.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  async play(steps: string[]): Promise<void> {
    for (const step of steps) {
      // Found as the page's player finds it, a talk open (TalkWay, OR-1451).
      const found = step === 'through' ? undefined : await TalkWay.find(this.r, this.s, x => new RegExp(step, 'i').test(x.label));
      if (found) { this.s = found.said; }
      const row = found?.o;
      if (step !== 'through') { expect([step, row?.label]).toEqual([step, expect.any(String)]); }
      let said = await AsMeant.ask(this.r, JSON.stringify({ act: row?.id ?? RunnerFight.through }));
      // Pressed on, the fight is handed back at each new danger (PressOn, OR-830), and pressed on again past it.
      for (let i = 0; i < 40 && step === 'through' && !('error' in said) && said.moment === 'fight'; i++) {
        said = await AsMeant.ask(this.r, JSON.stringify({ act: RunnerFight.through }));
      }
      expect([step, 'error' in said ? said.error : '']).toEqual([step, '']);
      this.s = said as Said;
    }
  }
}
describe('the first town\'s frame', () => {
  it('under the churchyard, the sexton\'s selling and the bone-pickers, laid by putting back what was taken',
    async () => {
      const walk = await Walk.begun('bench-1');
      await walk.play(['^To the market-place', '^Read the notice', '^To the shrine', ': the bones in the churchyard$',
        '^To the market-place', '^To the churchyard', 'Job Dunstall', '^Down to the crypt', 'light a torch', 'ossuary']);
      // The stripped shelves are seen before the sexton will say what he did.
      expect(walk.holds('knows', 'party', 'region__s1_u_pickers_why')).toBe(true);
      // His talk is led for who opened the old shelves in the ossuary, asked whole (OR-802: too long for its row).
      await walk.play(['^To the crypt', 'churchyard', '^Talk to Job Dunstall$']);
      expect(walk.holds('knows', 'party', 'region__s1_u_sexton_sold')).toBe(true);
      await walk.play(['crypt', 'ossuary', '^Put the grave-goods back']);
      expect(walk.holds('region__s1_u_done', 'region__s1_u_pickers_job')).toBe(true);
      expect(walk.s.scene.lines.join(' ')).toMatch(/150 experience/);
      // Their young are gone from the charnel passage with them, and the way down to the undercroft is open.
      await walk.play(['charnel', 'undercroft|steps']);
      expect(walk.session.campaign.world.one('at', 'party')).toBe('region__s1_u_undercroft');
      expect(walk.holds('at', 'region__s1_u_pickers_young', 'region__s1_u_charnel')).toBe(false);
    }, 300000);
  it('talks at the inn of the sexton found out, once the bone-pickers are laid by what he gave back', async () => {
    const walk = await Walk.begun('bench-1');
    await walk.play(['^To the market-place', '^Read the notice', '^To the shrine', ': the bones in the churchyard$',
      '^To the market-place', '^To the churchyard', '^Down to the crypt', 'light a torch', 'ossuary', '^To the crypt',
      'churchyard', '^Talk to Job Dunstall$', 'crypt', 'ossuary', '^Put the grave-goods back', '^To the crypt',
      'churchyard', '^To the market-place', '^Into the Gentle Eagle']);
    expect(walk.s.scene.lines.join(' ')).toMatch(/Job Dunstall was in last night,. says/);
  }, 300000);
  it('in the quarry, the she-bear\'s den and her wolves, a real fight, and the house pays', async () => {
    const walk = await Walk.begun('bench-2');
    await walk.play(['^To the landing', '^Read the notice', '^Into the Fierce Dragon', ': the old quarry$', 'landing|Out',
      'old quarry pit', '^Down to the quarry adit$', 'light a torch', 'cut gallery|old cutting', '^Attack the wol', 'through',
      '^To the den', '^Attack the she-bear', 'through']);
    expect(walk.holds('able', 'region__s1_u_bear')).toBe(false);
    expect(walk.holds('region__s1_u_done', 'region__s1_u_bear_job')).toBe(true);
    // Not the spiders' brood-chamber: the den, and nothing of web in the adit.
    expect(walk.s.scene.lines.join(' ')).not.toMatch(/web|brood/i);
  }, 300000);
  // The other ways, each by the offered rows and each changing the world: the rite said over the shelves (a cleric,
  // its first try failing); the she-bear smoked out with a flask of oil bought at the chandlery (a thief, who would
  // lose to her in a fight, and is told so); and let by, her cub read at the den's mouth (a ranger).
  it('lays the bone-pickers by the rite of rest, said again where it fails', async () => {
    const walk = await Walk.begun('bench-1', 'dwarf/cleric/Dori');
    await walk.play(['^To the market-place', '^Read the notice', '^To the shrine', ': the bones in the churchyard$',
      '^To the market-place', '^To the churchyard', '^Down to the crypt', 'light a (torch|candle)', 'ossuary',
      'rite of rest over the opened shelves', 'rite of rest over the opened shelves']);
    expect(walk.holds('region__s1_u_done', 'region__s1_u_pickers')).toBe(true);
    expect(walk.holds('at', 'region__s1_u_pickers', 'region__s1_u_ossuary')).toBe(false);
  }, 300000);
  const quarry = ['^To the landing', '^Read the notice', '^Into the Fierce Dragon', ': the old quarry$'];
  const down = ['old quarry pit', '^Down to the quarry adit$', 'light a (torch|candle)', 'cut gallery|old cutting',
    '^Attack the wol', 'through'];
  it('smokes the she-bear out with oil, a thief warned that she is beyond them', async () => {
    const walk = await Walk.begun('bench-2', 'human/thief/Ned');
    await walk.play([...quarry, 'landing|Out', "To Mildred's chandlery", 'Mildred', 'Buy a flask of lamp oil', 'leave',
      '^To the landing|Out to the landing', ...down, '^To the den']);
    expect(rows(walk.s).find(x => /^Attack the she-bear/.test(x.label))?.aside).toMatch(/^Beyond you/);
    await walk.play(['^To the cut gallery', 'Pour lamp oil on wet bracken']);
    expect(walk.holds('region__s1_u_bear_gone')).toBe(true);
    expect(walk.holds('at', 'region__s1_u_bear', 'region__s1_u_brood')).toBe(false);
    // The pit remembers which way she went.
    await walk.play(['^To the quarry adit', 'old quarry pit']);
    expect(walk.s.scene.lines.join(' ')).toMatch(/Big prints go up the north face out of the pit/);
  }, 300000);
  it('lets the she-bear by, her cub read by a ranger at the den\'s mouth', async () => {
    const walk = await Walk.begun('bench-2', 'elf/ranger/Aud');
    await walk.play([...quarry, 'landing|Out', ...down]);
    expect(walk.holds('knows', 'party', 'region__s1_u_bear_cub')).toBe(true);
    await walk.play(['^To the den', 'Stand aside from the crack']);
    expect(walk.holds('region__s1_u_bear_gone')).toBe(true);
    expect(walk.s.scene.lines.join(' ')).toMatch(/75 experience: let the she-bear take her cub away/);
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
