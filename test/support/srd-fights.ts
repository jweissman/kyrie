import { Battle } from '../../src/arena';
import { Canon } from '../../src/canon/canon';
import { CombatProjection } from '../../src/combat-projection';
import { Content } from '../../src/content';
import type { Fighter } from '../../src/model';

// A reference party against one creature of a kind, fought by the battle's own choices to the end (the SRD
// adaptation briefing, §1's combat envelope): who won, and in how many rounds.
export class SrdFights {
  // Four of a level, one of each of the four old callings, or the callings given.
  static party(content: Content, level: number, ids = ['warrior', 'cleric', 'thief', 'mage']): Fighter[] {
    return ids.map((classId, n) => CombatProjection.fighter(content.createCreature(`${classId}${n}`,
      { raceId: 'human', classId, level }), 'fighters'));
  }
  static fight(kind: string, level: number, seed: string, ids?: string[]): { b: Battle; rounds: number; won: boolean } {
    const content = new Content(`srd-${seed}`);
    const foe = { ...content.creature(kind, 'foe', 'goblins'), name: `the ${Canon.creature(kind).name.toLowerCase()}` };
    const b = new Battle({ id: seed, combatants: [...SrdFights.party(content, level, ids), foe],
      abilities: Content.abilities }, seed, 60);
    for (let i = 0; i < 400 && !b.state.outcome; i++) { b.step(b.chosen()); }
    return { b, rounds: b.events.filter(e => e.type === 'initiative').length, won: b.state.outcome === 'fighters' };
  }
}
