import { Content } from '../../src/content';
import { CreatureStore } from '../../src/creature-store';
import { Battle } from '../../src/battle';
import { Tactics } from '../../src/tactics';

// A company of one against some of one kind: a level-one calling of the human people, `count` of `foe`. The company is
// the same character at every seed unless `who` varies (its rolls are drawn from `who`): the fight's seed varies, so
// that a forecast of that company is held to fights of that company, and a population is asked for by varying `who`.
export interface Bout { calling: string; foe: string; count: number; who?: string }

// The encounter gauntlet (the owner, 15 November: the test ladder's third rung): a tiny encounter, built on the real
// rules kernel as often as is wanted and fought by the game's own tactics, with no world, narrator or page. A fight is
// ten milliseconds warm, so a rule, a forecast or a balance can be asked of a hundred of them.
export class Gauntlet {
  static encounter(bout: Bout, seed: string): Battle {
    const content = new Content(bout.who ?? 'gauntlet'), ids = Array.from({ length: bout.count }, (_, i) => `f${i}`);
    const pc = content.createCreature('pc', { raceId: 'human', classId: bout.calling, level: 1 } as never);
    const store = new CreatureStore([pc, ...ids.map(id => content.createCreature(id, { raceId: bout.foe }))]);
    return Battle.encounter(store, [{ creatureId: 'pc', team: 'fighters' },
      ...ids.map(creatureId => ({ creatureId, team: 'goblins' as const }))], { seed });
  }
  // Fought to its end by the company's own tactics: whether the company won, and the rounds it took.
  static fight(bout: Bout, seed: string): { won: boolean; rounds: number } {
    const battle = this.encounter(bout, seed);
    let rounds = 0;
    for (; rounds < 80 && !battle.state.outcome; rounds++) {
      battle.step(Tactics.choose(battle.state, battle.plain(battle.legalCommands())));
    }
    return { won: battle.state.outcome === 'fighters', rounds };
  }
  // The share of `trials` seeded fights the company wins.
  static wins(bout: Bout, trials: number): number {
    return Array.from({ length: trials }, (_, i) => this.fight(bout, `g${i}`)).filter(r => r.won).length / trials;
  }
}
