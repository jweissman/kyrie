import { describe, expect, it } from 'bun:test';
import { Content } from '../../src/content';
import { CreatureStore } from '../../src/creature-store';
import { Battle } from '../../src/battle';
import { Tactics } from '../../src/tactics';
import { CombatTelling } from '../../src/ui/combat-telling';

// A fight told turn by turn (the terminal, the runner) reads as the same fight told whole (the page): the terminal had
// told each turn's events as a fight of its own, its barks begun afresh, and Edda said "Damn it" at each of her misses
// (the owner's headless review, 14 November: never the same line twice in one fight). No world: a few fights alone.
const fight = (seed: string) => {
  const content = new Content(seed);
  const store = new CreatureStore([content.createCreature('ama', { raceId: 'human', classId: 'warrior', level: 2 }),
    content.createCreature('osk', { raceId: 'human', classId: 'ranger', level: 2 }),
    ...['r1', 'r2', 'r3'].map(id => content.createCreature(id, { raceId: 'rat' }))]);
  return Battle.encounter(store, [{ creatureId: 'ama', team: 'fighters' }, { creatureId: 'osk', team: 'fighters' },
    ...['r1', 'r2', 'r3'].map(creatureId => ({ creatureId, team: 'goblins' as const }))], { seed });
};

describe('a fight told turn by turn', () => {
  it('is the fight told whole, and says no line twice', () => {
    for (const seed of ['bark-a', 'bark-b', 'bark-c', 'bark-d', 'bark-e', 'bark-f']) {
      const battle = fight(seed), turns: string[] = [];
      for (let n = 0; n < 60 && !battle.state.outcome; n++) {
        const from = battle.events.length;
        battle.step(Tactics.choose(battle.state, battle.plain(battle.legalCommands())));
        turns.push(...CombatTelling.since(battle.events, from, battle.state).map(t => t.text));
      }
      const whole = CombatTelling.exchanges(battle.events, battle.state).map(t => t.text);
      const quoted = turns.flatMap(t => t.match(/[‘"“][^’"”]+[’"”]/g) ?? []);
      expect([seed, turns]).toEqual([seed, whole]);
      expect([seed, quoted.length]).toEqual([seed, new Set(quoted).size]);
    }
  });
});
