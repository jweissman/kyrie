import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { ItemCatalog } from '../src/item-catalog';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

describe('the keeper of the angles', () => {
  it('accepts actual food and opens a return from the field to the gallery', async () => {
    const j = await Journey.start(campaign, 'minotaur-bargain');
    Placed.at(j, 'tallow__lc_gnoll_shelter');
    await j.play('To the hall of angles');
    const food = j.measure('quantity', 'party', 'rations');
    await j.play('Give the keeper two rations for passage', 'To the room of reverse measures',
      'Turn the brass pointer away from the seam');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food - 2);
    expect(j.measure('quantity', 'lc_minotaur', 'rations')).toBe(2);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('To the Quiet Gallery');
    expect(resumed.at('party')).toBe('tallow__quiet_gallery');
  }, 10000);

  it('charges as the minotaur warrior it is', () => {
    const content = new Content('minotaur-charge');
    const keeper = content.createCreature(ItemCatalog.canon, 'keeper', { raceId: 'minotaur', classId: 'warrior', level: 6 },
      'keeper');
    expect(keeper.raceId).toBe('minotaur');
    const hero = content.createCreature(ItemCatalog.canon, 'hero', { raceId: 'human', classId: 'warrior' }, 'hero');
    hero.base.maxHp = hero.state.hp = 300;
    const store = new CreatureStore(ItemCatalog.canon, [keeper, hero]);
    const battle = Battle.encounter(store, [
      { creatureId: keeper.id, team: 'goblins' },
      { creatureId: hero.id, team: 'fighters' },
    ], { seed: 'minotaur-charge' });
    let prepared = false, charged = false;
    for (let n = 0; n < 20 && !battle.state.outcome && !charged; n++) {
      const legal = battle.legalCommands();
      const actor = battle.state.actor;
      const chosen = actor === keeper.id
        ? legal.find(c => c.ability === (prepared ? 'charge' : 'prepare_charge')) ?? legal[0]!
        : legal.find(c => c.ability === 'wait') ?? legal[0]!;
      if (chosen.ability === 'prepare_charge') { prepared = true; }
      if (chosen.ability === 'charge') { charged = true; }
      battle.step(chosen);
    }
    expect(prepared).toBe(true);
    expect(charged).toBe(true);
    expect(battle.events.some(e => e.type === 'damage' && e.target === hero.id && e.amount > 0)).toBe(true);
    battle.close();
  });

  it('can be fought instead of paid', async () => {
    const j = await Journey.start(campaign, 'minotaur-fight');
    Placed.at(j, 'tallow__lc_gnoll_shelter');
    await j.play('To the hall of angles');
    await j.fight('Attack');
    expect(j.taken.at(-1)!.event.combat.some(e => e.type === 'initiative')).toBe(true);
    expect(j.holds('tolerates', 'lc_minotaur', 'party')).toBe(false);
  }, 10000);
});
