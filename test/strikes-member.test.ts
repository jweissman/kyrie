import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';

// The Book of Faces' counting 2 (BOF-37): a hazard struck a company on whichever member the stream chose, so a lesson
// taught by one could go to the warrior. One that strikes a member strikes that one: here the one who picks locks.
describe('a hazard that strikes a member', () => {
  it('lands on that member, and on no other', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'sm/site.kyr': `Module sm "Strikes" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 2 at yard.
        Hazard dart "A dart from the lock" means "Deal (3) physical damage to ally.". Relation tried(group).
        Action pick(actor: group, site: place) "Pick the lock" { Requires at(actor, site) and not tried(actor).
          On success { Assert tried(actor). } Result "Click.". }
        Rule darts when tried(party) and memberOf(?m, party) and brings(?m, lockwork) once { Assert strikes(dart, ?m). } }`,
      'sm/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'sm.campaign.json': JSON.stringify({ version: 1, name: 'sm', modules: [{ id: 'p', bundle: 'sm/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }, { name: 'Bel', raceId: 'human', classId: 'thief' }] }) });
    for (const seed of ['a', 'b', 'c']) {
      const s = await PlaySession.start(source.resolve('sm.campaign.json'), seed, source);
      await s.perform(PlayerView.choices(s.campaign).find(c => c.choice.name === 'Pick the lock')!.choice.id);
      expect(s.campaign.readout.creatures.map(c => c.base.maxHp - c.state.hp), seed).toEqual([0, 3]);
    }
  }, 60000);
});
