import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { DangerSense } from '../src/presentation/danger-sense';
import trade from '../data/generation/tables/trade.json';
import occupations from '../data/generation/scenes/occupations.json';

// A fight against a foe that shrugs off most of what the company lands is a grind, whoever wins it, and the company
// is told so before it begins, with what would serve better (PT-23): a revenant half-proof against weapons, the worse
// for radiance and fire; a man with a sword is no such fight. And the answer is to be had in any town: a fire flask
// at the chandler's or the smith's, holy water from the sexton.
class Grind {
  static battle(raceId: string, seed: string, carried: string[] = []): Battle {
    const content = new Content(seed);
    const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior', level: 3 });
    hero.state.inventory = carried.map((definition, i) => ({ id: `${definition}${i}`, definition }));
    const foe = content.createCreature('foe', raceId === 'human' ? { raceId, classId: 'warrior' } : { raceId });
    return Battle.encounter(new CreatureStore([hero, foe]), [{ creatureId: 'hero', team: 'fighters' },
      { creatureId: 'foe', team: 'goblins' }], { seed, moment: 'seen' });
  }
  static against(raceId: string, seed: string): string { return DangerSense.of(this.battle(raceId, seed)).text; }
}

describe('a fight that will be a grind', () => {
  it('is said before it begins, with what would bite', () => {
    expect(Grind.against('revenant', 'grind')).toMatch(/It will be long: your weapons barely bite (it|them); fire or radiant would serve better\./);
  });
  it('is not said of a foe that steel harms', () => {
    expect(Grind.against('human', 'grind')).not.toContain('barely bite');
  });
  it('has its answer sold in any town, which bites where steel does not', () => {
    expect(trade.merchantType.groups.chandler.stock.map(([k]) => k)).toContain('fire_flask');
    expect(occupations.occupations.sexton.sells).toEqual([['holy_water', 6, 3]]);
    for (const answer of ['fire_flask', 'holy_water']) {
      const battle = Grind.battle('revenant', `flung:${answer}`, [answer]);
      while (!battle.state.outcome && battle.state.actor !== 'hero') { battle.step(battle.chosen()); }
      const before = battle.events.length;
      battle.step({ actor: 'hero', ability: `item-${answer}`, target: 'foe' });
      // The dead are the worse for it, where they shrug off half of a blade (in a fight where the flask is not dodged).
      const struck = battle.events.slice(before)
        .flatMap(e => e.type === 'damage' && e.actor === 'hero' ? [e.modifiers?.resistance ?? 0] : []);
      expect(struck).toEqual([answer === 'fire_flask' ? -0.5 : -1]);
    }
  });
});

// A fight the company wins two times in three is not reckoned beyond it: the first three of its fights lost had been
// taken to leave no doubt, and two great rats under a corn-store were "more than you can take" to a warrior who beat
// them in play (a1, 3 November); every fight reckoned is played out before it is said.
describe('a reckoning of a fight usually won', () => {
  it('is never that it is beyond the company', () => {
    const said = ['a', 'b', 'c', 'd', 'e', 'f'].map(seed => {
      const content = new Content(seed);
      const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior' });
      const rats = [0, 1].map(i => content.createCreature(`rat${i}`, { raceId: 'great_rat' }));
      return DangerSense.of(Battle.encounter(new CreatureStore([hero, ...rats]), [{ creatureId: 'hero', team: 'fighters' },
        ...rats.map(r => ({ creatureId: r.id, team: 'goblins' as const }))], { seed, moment: 'seen' })).danger;
    });
    expect(said).not.toContain('deadly');
  });
});

