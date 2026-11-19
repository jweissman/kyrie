import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';
import { ModifierSet } from '../src/rules/modifiers';
import { CombatTelling } from '../src/ui/combat-telling';
import type { CombatEvent, Fighter } from '../src/model';

// Concealment as a fight rule (doc/architecture/mission-22/srd-proving-cases.md, case 57): a blow that lands at one
// concealed is thrown for again on d100, and misses at or under the concealment's chance (Blur's 20); the forecast
// says as much; of two sources the better holds, never summed; and the page tells the miss as the blur's.
const c = new Content('concealment');
const warrior = Effects.combatant(c.character('warrior', 'w', 'fighters'));
const wolf = (concealment?: number) => {
  const f = Effects.combatant(c.creature('wolf', 'g', 'goblins', 1));
  return { ...f, modifiers: { ...f.modifiers, ...concealment ? { concealment } : {} } };
};
describe('concealment', () => {
  it('turns a landed blow at or under its chance on d100, and none above it, and none of a miss', () => {
    const hit = () => 19;
    expect(Fighting.attack(warrior, wolf(20), hit, () => 20)).toMatchObject({ success: false,
      concealment: { die: 20, chance: 20, missed: true } });
    expect(Fighting.attack(warrior, wolf(20), hit, () => 21)).toMatchObject({ success: true,
      concealment: { missed: false } });
    expect(Fighting.attack(warrior, wolf(20), () => 1, () => 1).concealment).toBeUndefined();
    expect(Fighting.attack(warrior, wolf(), hit, () => 1).success).toBe(true);
  });
  it('is shown in the odds, and of two the better holds', () => {
    expect(Fighting.chance(warrior, wolf(20))).toBeCloseTo(Fighting.chance(warrior, wolf()) * 0.8, 5);
    expect(ModifierSet.sum([{ concealment: 20 }, { concealment: 50 }, { concealment: 20 }]).concealment).toBe(50);
  });
  it('is thrown in a fight at one Blur lies on, and told as a blow gone wide', () => {
    const blurred = (f: Fighter): Fighter => ({ ...f, hp: 300, maxHp: 300,
      statuses: [{ id: 'concealed', remaining: 30, source: 'blur' } as Fighter['statuses'][number]] });
    let told = '';
    for (const seed of 'abcdefghijklmnop'.split('')) {
      const b = new Battle({ id: 'c', combatants: [c.character('warrior', 'w', 'fighters'),
        blurred(c.creature('wolf', 'g', 'goblins', 1))], abilities: Content.abilities }, seed, 200);
      for (let i = 0; i < 30 && !b.state.outcome && !told; i++) {
        const events: CombatEvent[] = b.step(b.state.actor === 'w' ? { actor: 'w', ability: 'melee', target: 'g' }
          : b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
        if (events.some(e => e.type === 'attack' && e.concealed)) {
          told = CombatTelling.exchanges(events, b.state).map(t => t.text).join(' ');
        }
      }
    }
    expect(told).toMatch(/goes wide of .*hard to make out/);
  });
});
