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
// the town answer (the salter's prices fall to a friend), and go down again another way (the churchyard's stone door,
// the necromancer in the ossuary and the dead in the charnel passage, the letters that open the lettered flag) to the
// sealed vault's keeper, and withdraw from it. Every act by the rows the runner offers, found by their words; and at
// every turn, nothing refused and something to do. A warrior's fights cost: the charnel's dead leave her at one hit
// point (the golden walk had met one fight).
type Row = { id: string; label: string; opens?: Row[] };
const flat = (rs: Row[]): Row[] => rs.flatMap(r => [r, ...flat(r.opens ?? [])]);
const rows = (s: Said): Row[] => flat([...s.offer?.primary ?? [], ...s.offer?.rest ?? [],
  ...Object.values(s.offer?.lenses ?? {}).flat()] as Row[]);
const journey = ['~Read the notice on the well-post', "~To Holgar's salt-house", '~Ask Holgar about the old kingdom',
  '~Ask Holgar about the rats in the corn-store', '~Buy a torch for', '~Buy one ration from Holgar',
  '~To the old corn-store', '~Light a torch', '~Down to the corn-store cellar', '~To the rat-runs', '~Attack the rats',
  'through', '~Down to the nest', '~Attack the old buck rat', 'through', '~light a candle', '~Search here',
  '~Out to the landing at Porthalen', "~To Holgar's salt-house", '~Tell Holgar the rats under the corn-store are dead',
  '~To the taproom of the Stone Horn', '~Talk to Kynes', '~Take a bed and supper', '~Out to the landing at Porthalen',
  "~To Holgar's salt-house", '~Fill a lantern', '~To the landing at Porthalen', '~To the churchyard',
  '~Set your shoulder to the stone door', '~crypt', '~ossuary', '~Attack the man with the black candle', 'through',
  '~Search here', '~Down to the charnel passage', '~Attack the dead in the charnel passage', 'through',
  '~To the undercroft', '~Rest six hours', '~Press the three deep-cut letters', '~sealed vault',
  '~Up to the undercroft'];
describe('the reference journey under Porthalen', () => {
  it('is walked by the offered rows alone, out and back twice, and the town answers', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(j.session), w = () => j.session.campaign.world;
    const holds = (name: string, ...args: string[]) => w().test(ModuleWriter.call(name, ...args));
    for (const line of GoldenWalk.lines().slice(0, GoldenWalk.opened())) { await AsMeant.ask(r, line); }
    let s = r.said('look');
    const log: string[] = [], fights: string[] = [];
    for (const step of journey) {
      const before = s.you ?? '';
      let line = JSON.stringify({ act: RunnerFight.through });
      if (step !== 'through') {
        const words = new RegExp(step.slice(1), 'i'), row = rows(s).find(x => words.test(x.label));
        expect([step, row?.label]).toEqual([step, expect.any(String)]);
        line = JSON.stringify({ act: row!.id });
      }
      const said = await AsMeant.ask(r, line);
      expect([step, 'error' in said ? said.error : '']).toEqual([step, '']);
      s = said as Said;
      // At every turn: something to do, unless the company is dead.
      expect([step, s.end ? 'ended' : rows(s).length > 0]).toEqual([step, true]);
      const screen = ScreenModel.build(j.session.campaign);
      log.push(`${screen.expedition.time} ${screen.place.id} ${s.you ?? ''} :: ${step}`);
      if (step === 'through') { fights.push(`${before} -> ${s.you}`); }
    }
    console.log(`${log.join('\n')}\nfights: ${fights.join('; ')}`);
    // Established, prepared, the job done and paid; the bed taken; the salter a friend; the vault opened by its
    // letters.
    expect(holds('region__s1_u_paid', 'region__s1_u_rats_job')).toBe(true);
    expect(holds('grateful', 'region__s1_merchant', 'party')).toBe(true);
    expect(holds('knows', 'party', 'region__s1_u_vault_found')).toBe(true);
    expect(w().one('at', 'party')).toBe('region__s1_u_undercroft');
    expect(fights.length).toBe(4);
  }, 300000);
});
