import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import type { CombatEvent, Fighter } from '../src/model';

// Cause Fear, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 20), and the partial save it runs by
// (a save's lesser hold): one foe of five Hit Dice or fewer afraid three rounds, or one round if it saves. This spec is
// its play-identity test.
const c = new Content('dread');
const fear = Content.abilities.find(a => a.id === 'terror')!;
const at = (f: Fighter, level: number): Fighter => ({ ...f, level, hp: 400, maxHp: 400 });
const cleric = (): Fighter => ({ ...at(c.character('cleric', 'cleric', 'fighters'), 1), wisdom: 16,
  abilities: ['terror'], maxSlots: [1], slots: [1], prepared: [['terror']], ready: [['terror']] });
const battle = (seed: string) => {
  const b = new Battle({ id: 'dread', combatants: [cleric(), at(c.character('warrior', 'g5', 'goblins'), 5),
    at(c.character('warrior', 'g6', 'goblins'), 6)], abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 20 && b.state.actor !== 'cleric'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const save = (events: CombatEvent[]) => events.find(e => e.type === 'save' && e.target === 'g5');
const afraid = (b: Battle) => b.state.combatants.find(f => f.id === 'g5')!.statuses.find(s => s.id === 'fear')?.remaining;
describe('Cause Fear, by the SRD\'s numbers', () => {
  it('is a first-level necromancy of Death, aimed only at a foe of five Hit Dice or fewer', () => {
    const e = fear.effects[0]!;
    expect([fear.spell!.level, fear.spell!.school, fear.spell!.domain, e.target, e.hitDice, e.save?.kind,
      e.save?.lesser]).toEqual([1, 'necromancy', 'death', 'enemy', 5, 'fear', 1]);
    expect(battle('a').legalCommands().filter(x => x.ability === 'terror').map(x => x.target)).toEqual(['g5']);
  });
  it('leaves whoever fails afraid three rounds and whoever saves afraid one, at the SRD\'s difficulty', () => {
    const seen = { failed: 0, saved: 0 };
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']) {
      const b = battle(seed), roll = save(b.step({ actor: 'cleric', ability: 'terror', target: 'g5' }));
      expect(roll?.type === 'save' && [roll.kind, roll.difficulty]).toEqual(['fear', 14]);
      const saved = roll?.type === 'save' && roll.success;
      expect(afraid(b)).toBe(saved ? 1 : 3);
      seen[saved ? 'saved' : 'failed']++;
    }
    expect(seen.failed * seen.saved).toBeGreaterThan(0);
  });
});
