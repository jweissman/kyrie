import { describe, expect, it } from 'bun:test';
import { Tiny } from './support/tiny';

// A kind given is a new one of it, in the company's hands (Wapshott's Circus friction 13: a thing to be given had to be
// parked in some room, hidden until a fact; Half the Hive's 5, the Third Night's 16, a gift with no identity).
describe('giving a kind of thing', () => {
  it('puts a new one of it in the company\'s hands, each time', async () => {
    const { session: s } = await Tiny.start(`Module gk "Gift" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Kind keepsake_kind "a carved keepsake" is gear worth 1 weighing 0 described "A little carved bird.".
        Action thank(actor: group, site: place) "Be thanked" { Requires at(actor, site). On success { Give keepsake_kind to actor. } }
        Action stock(actor: group, site: place) "Be stocked" { Requires at(actor, site). On success { Give 3 torch to actor. } } }`,
    { horizon: ['belongings'], seed: 'gk', party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
    await s.leg('gk__thank(party,gk__yard)');
    await s.leg('gk__thank(party,gk__yard)');
    const kept = s.campaign.readout.creatures[0]!.state.inventory!.filter(i => /keepsake/.test(i.definition));
    expect(kept.length).toBe(2);
    // As many as are given at once, of a kind of the catalog too (a priest's two draughts had been one).
    await s.leg('gk__stock(party,gk__yard)');
    expect(s.campaign.readout.creatures[0]!.state.inventory!.filter(i => i.definition === 'torch').length).toBe(4);
  }, 60000);
});
