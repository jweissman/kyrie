import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { GeneratedWorld } from './support/generated';

// One who comes alone knows, wherever in the town they begin, who at its inn would come with them, by name: said only
// on the town's green, it was never heard by one who began at its shrine (play 7), and alone a mage, a thief or a bard
// does not get far (PT-11). It is in their notes from the first, and the inn's keeper says it in the telling of the
// inn; it is not told on the first page, where it had stood between the way in and why they came (OWN-17). It is the
// inn of the town they begin in: a drover's child coming home to a town ten hours from the country's first had been
// told of the first one's inn, and the keeper's word was on no card a desktop shows (the opening's critique).
describe('one who comes alone', () => {
  it.each([['order'], ['kin']])('begun as %s, knows who at the inn would come along, and hears it there walking in',
    async origin => {
      const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
        { origin, party: [{ name: 'Aud', raceId: 'human', classId: 'mage' }] });
      const s = await PlaySession.start(w.path, 'kite', w.source), at = s.campaign.world.one('at', 'party')!;
      const town = w.report.region.settlements.find(t => at.startsWith(`region__${t.id}_`))!;
      const hire = `At the inn at ${town.name}, ${town.traveller}, `;
      expect(ScreenModel.build(s.campaign).knowledge.find(k => k.text.startsWith(hire))?.kind).toBe('known');
      expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).not.toContain('looking for work');
      // Walked in from where the company begins, its keeper says so, until the one looking for work has been asked.
      const keeper = `region__${town.id}_innkeeper`, traveller = `${town.id}_traveller`;
      await GeneratedWorld.travel(s, s.campaign.world.one('at', keeper)!.replace(/^region__/, ''));
      const told = () => Narrator.leaf(s.campaign, ScreenModel.build(s.campaign)).situation.join(' ');
      expect(told()).toContain(`${town.traveller} there is looking for work`);
      const ask = PlayerView.choices(s.campaign).find(c => c.choice.id.includes(`${traveller}_brings`))!;
      await s.perform(ask.choice.id);
      expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).not.toContain('looking for work');
    }, 120000);
});
