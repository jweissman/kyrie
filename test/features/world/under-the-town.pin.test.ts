import { describe, expect, it } from 'bun:test';
import { AutoplayRun } from '../../../src/autoplay/run';
import { AutoPlayer } from '../../../src/autoplay/player';
import { Draw } from '../../../src/autoplay/draw';
import { Undertakings } from '../../../src/presentation/undertakings';
import { PlayerView } from '../../../src/presentation/player-view';
import { ScreenModel } from '../../../src/ui/screen-model';
import { FirstQuarter } from '../../../scripts/first-quarter';

// Under the town (doc/design/first-hour-beats.md, 15–35 minutes): fewer, stranger things below, and one sight of awe
// at the bottom. The warrior walks by the gold from the corn-store's rats job down through the cellar, the runs, the
// drain and the undercroft to the sealed vault; its keeper fought (the page does not lead into a fight that could end
// the one who plays: OR-412; a player answers it), and on down the stair behind its chair, where the vast old hall
// under the town is told once.
// At the fourth level, as a company is that comes down so far: alone at the first, the barrow ghoul kills her, and at
// the third it is an even fight (BestiaryTool.won: 5 of 12), lost on this walk's dice once the buck rat was the SRD's
// (srd-proving-cases.md case 64).
const awe = 'Those who dug the cellars of';
describe('under the town, by the gold', () => {
  it('meets fewer and stranger things below, and is told the hall under the town once, at the bottom', async () => {
    const spec = { seed: 'iscoed', origin: 'debt', policy: 'gold' as const, steps: 90,
      protagonist: { name: 'Wenna', raceId: 'human', classId: 'warrior', level: 4 } };
    const metrics = AutoplayRun.empty(), s = await AutoplayRun.start(spec, metrics), c = s.campaign;
    for (const act of ['region__s1_u_notice_read(party,region__s1_green)', 'go(region__s1_shop_door,region__s1_shop)',
      'region__s1_u_rats_job_ask']) { await s.leg(act); }
    const player = new AutoPlayer('gold', new Draw('iscoed:under:gold'));
    for (let step = 0; step < spec.steps && c.running && !c.world.test({ kind: 'call', name: 'region__s1_ud_beheld',
      args: ['party'] } as never); step++) {
      const aims = Undertakings.held(c);
      if (aims.length && !Undertakings.followed(c, aims)) { Undertakings.follow(c, FirstQuarter.nearest(s, aims).id); }
      const sit = AutoplayRun.situation(s, step, true, 'undertaking');
      // A fight met is answered, as a player at the fourth level answers it, by choosing it: the page leads into none
      // that could end the one who plays (OR-412: the vault's keeper), and, the aim's own beyond one alone, says to
      // take someone along rather than the way down (the ossuary's raiser).
      const asked = ScreenModel.build(c).people.find(p => !!p.reckoning && !p.companion && !p.state);
      const keeper = asked ? PlayerView.choices(c).find(x => x.choice.id.startsWith(`attack(${asked.id}`)) : undefined;
      // And before going down to it, a careful player rests in the undercroft, where nothing lives, to the full.
      const me = c.readout.creatures.find(x => c.tickState.current.partyIds.includes(x.id));
      const rest = c.world.one('at', 'party') === 'region__s1_u_undercroft' && me && me.state.hp < me.base.maxHp
        ? sit.offered.find(o => /^(rest|camp)/.test(o.id)) : undefined;
      const move = keeper ? { kind: 'command' as const, id: keeper.choice.id }
        : rest ? { kind: 'command' as const, id: rest.id } : FirstQuarter.rest(s, sit.offered) ?? player.next(sit);
      if (!move) { break; }
      // OR-1396: the sight is tested after choosing to stand, not the autoplay controller's random mid-fight flight.
      if (keeper) {
        await s.leg(keeper.choice.id, async battle => battle.chosen());
      } else { await AutoplayRun.apply(s, move, player, metrics); }
    }
    const told = c.history.flatMap(h => [...(h.perceptions ?? []).map(p => p.text), h.response ?? '']).join('\n');
    // The rats on the cellar floor and the beetles in the adit are gone; what is below has a strangeness of its own.
    expect(c.module.entities.some(e => /_u_cellar_rats$|_u_adit_beetles$/.test(e.id))).toBe(false);
    expect(told).toContain('It does not run from your light: it watches what you carry');
    // The sight of awe at the bottom, told once.
    expect(c.world.one('at', 'party')).toBe('region__s1_ud');
    expect(told.split(awe).length - 1).toBe(1);
    expect(told).toContain('a hall that could hold the whole of Porthalen');
  }, 300000);
});
