import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { RunnerFight } from '../../../src/cli/runner-fight';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { ScreenModel } from '../../../src/ui/screen-model';
import { AsMeant } from '../../support/as-meant';
import { GoldenWalk } from '../../support/golden-walk';

// The brief's reference journey (BRIEF §3.2; sprint 3), in the supported fixture: Porthalen, Iscoed's first town, and
// the dungeon under it, grown from its undertown (three ways down, by the corn-store, the churchyard and the quarry,
// to an undercroft, a sealed vault and the old workings beyond). A new life as creation begins one (the adit), then:
// establish oneself (the notice, the salter's job and his key), prepare (a torch, a ration), enter and meet danger (the
// rats under the corn-store, the old buck in their nest), withdraw and be paid, recover (a bed at the Stone Horn), see
// the town answer (the salter's prices fall to a friend), and go down again another way. Every act by the rows the
// runner offers, found by their words; at every turn, nothing refused and something to do. The descent is a ladder
// (the lead's call, OR-198): the three ways down, gone all the way, bring a careful first life to the vault's door at
// its second level; the vault's keeper is said to be grave before it is fought, and fought it is deadly; and the
// raiser's book of the dead, carried to its chair, opens a way past it for a price.
type Row = { id: string; label: string; aside?: string; opens?: Row[] };
const flat = (rs: Row[]): Row[] => rs.flatMap(r => [r, ...flat(r.opens ?? [])]);
const rows = (s: Said): Row[] => flat([...s.offer?.primary ?? [], ...s.offer?.rest ?? [],
  ...Object.values(s.offer?.lenses ?? {}).flat()] as Row[]);
const established = ['~Read the notice on the well-post', "~To Holgar's salt-house", '~Ask Holgar about the old kingdom',
  '~Ask Holgar about the rats in the corn-store', '~Buy a torch for', '~Buy one ration from Holgar',
  '~To the old corn-store', '~Light a torch', '~Down to the corn-store cellar', '~To the rat-runs', '~Attack the rats',
  'through', '~Down to the nest', '~Attack the old buck rat', 'through', '~light a candle', '~Search here',
  '~Out to the landing at Porthalen', "~To Holgar's salt-house", '~Tell Holgar the rats under the corn-store are dead',
  '~To the taproom of the Stone Horn', '~Talk to Kynes', '~Take a bed and supper', '~Out to the landing at Porthalen',
  "~To Holgar's salt-house", '~Fill a lantern', '~To the landing at Porthalen'];
// The second way down, by the churchyard, to the vault's door.
const churchyard = ['~To the churchyard', '~Set your shoulder to the stone door', '~crypt', '~ossuary',
  '~Attack the man with the black candle', 'through', '~Search here', '~Down to the charnel passage',
  '~Attack the dead in the charnel passage', 'through', '~To the undercroft', '~Rest six hours',
  '~Press the three deep-cut letters', '~sealed vault'];
// The careful way: the quarry's spiders and their mother too, the dead from below, the raiser's book taken.
const careful = ['~To the old quarry pit', '~Wrench the adit gate', '~quarry adit', '~cut gallery', '~Attack the spider',
  'through', '~To the brood-chamber', "~Attack the spiders' mother", 'through', '~Search here', '~To the cut gallery',
  '~Down to the old working face', '~undercroft', '~Rest six hours', '~To the charnel passage',
  '~Attack the dead in the charnel passage', 'through', '~ossuary', '~Attack the man with the black candle', 'through',
  '~Collect a book of the dead', '~Down to the charnel passage', '~To the undercroft', '~Rest six hours',
  '~Press the three deep-cut letters', '~sealed vault'];
class Walk {
  s!: Said;
  readonly log: string[] = [];
  fights = 0;
  private constructor(readonly r: Runner, readonly session: Runner['session']) {}
  static async begun(): Promise<Walk> {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const walk = new Walk(new Runner(journey.session), journey.session);
    for (const line of GoldenWalk.lines().slice(0, GoldenWalk.opened())) { await AsMeant.ask(walk.r, line); }
    walk.s = walk.r.said('look');
    return walk;
  }
  holds(name: string, ...args: string[]): boolean {
    return this.session.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  row(words: string): Row | undefined { return rows(this.s).find(x => new RegExp(words, 'i').test(x.label)); }
  async play(steps: string[]): Promise<void> {
    for (const step of steps) {
      const row = step === 'through' ? undefined : this.row(step.slice(1));
      if (step !== 'through') { expect([step, row?.label]).toEqual([step, expect.any(String)]); }
      const said = await AsMeant.ask(this.r, JSON.stringify({ act: row?.id ?? RunnerFight.through }));
      expect([step, 'error' in said ? said.error : '']).toEqual([step, '']);
      this.s = said as Said;
      // At every turn: something to do, unless the company is dead.
      expect([step, !!this.s.end || rows(this.s).length > 0]).toEqual([step, true]);
      const screen = ScreenModel.build(this.session.campaign);
      this.log.push(`${screen.expedition.time} ${screen.place.id} ${this.s.you ?? ''} :: ${step}`);
      if (step === 'through') { this.fights++; }
    }
  }
  level(): number { return ScreenModel.build(this.session.campaign).party[0]!.level; }
}
describe('the reference journey under Porthalen', () => {
  it('is walked by the offered rows alone, out and back twice, and the town answers', async () => {
    const walk = await Walk.begun();
    await walk.play([...established, ...churchyard]);
    console.log(walk.log.join('\n'));
    // Established, prepared, the job done and paid; the bed taken; the salter a friend; the vault opened by its
    // letters.
    expect(walk.holds('region__s1_u_paid', 'region__s1_u_rats_job')).toBe(true);
    expect(walk.holds('grateful', 'region__s1_merchant', 'party')).toBe(true);
    expect(walk.holds('knows', 'party', 'region__s1_u_vault_found')).toBe(true);
    expect(walk.fights).toBe(4);
    // At the vault's door by one way only: the keeper said grave before it is fought, the stair behind it shut to one
    // it has not let by, and no rite known.
    expect(walk.row('^Attack the keeper of the vault')?.aside).toMatch(/^Could be lost/);
    expect(walk.row('stair below the vault')).toBeUndefined();
    expect(walk.row('rite of the door')).toBeUndefined();
    await walk.play(['~Up to the undercroft']);
    expect(walk.session.campaign.world.one('at', 'party')).toBe('region__s1_u_undercroft');
  }, 300000);
  it('fought at the first level, the vault\'s keeper kills', async () => {
    const walk = await Walk.begun();
    await walk.play([...established, ...churchyard]);
    expect(walk.level()).toBe(1);
    await walk.play(['~Attack the keeper of the vault', 'through']);
    expect(walk.s.end).toBe(true);
  }, 300000);
  it('gone all three ways with care, grows to the second level, and the dead\'s book opens the way past the keeper',
    async () => {
      const walk = await Walk.begun();
      await walk.play([...established, ...careful]);
      expect(walk.level()).toBe(2);
      expect(walk.holds('knows', 'party', 'region__s1_u_keeper_rite')).toBe(true);
      const coin = walk.s.purse?.coin ?? 0;
      await walk.play(["~Lay ten coin at the keeper's feet", '~Down to the stair below the vault', '~way in']);
      expect(walk.s.purse?.coin).toBe(coin - 10);
      expect(walk.holds('able', 'region__s1_u_keeper')).toBe(true);
      expect(walk.session.campaign.world.one('at', 'party')).toBe('region__s1_ud_adit_mouth');
    }, 300000);
});
