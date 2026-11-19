import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { Effects, type EffectContext } from '../src/effects';
import { Expressions } from '../src/expressions';
import { Defenses } from '../src/rules/defenses';
import { DefenseTelling } from '../src/ui/defense-telling';
import { ModifierSet } from '../src/rules/modifiers';
import type { CombatEvent, Fighter } from '../src/model';

// Resist Energy against fire by the SRD's resolution (doc/architecture/mission-22/srd-proving-cases.md, case 38),
// Orsino's Resist Fire: second level, abjuration beside Life, on the caster or one ally, ten off each blow of fire for
// the fight (a flat resistance: the `resist` modifier), the better of two such and never both; Orsino's half of fire's
// harm for three rounds gone. Its play-identity test.
const c = new Content('resist-energy'), physical = Canon.rules.physicalDamage;
const resist = Content.abilities.find(a => a.id === 'resist_fire')!;
const hardy = (f: Fighter): Fighter => ({ ...f, level: 3, hp: 300, maxHp: 300 });
const cleric = (): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters')), abilities: ['resist_fire'],
  maxSlots: [0, 1], slots: [0, 1], prepared: [[], ['resist_fire']], ready: [[], ['resist_fire']] });
const fire = (amount: number, statuses: string[]) => Defenses.mitigate({ amount, bonus: 0, type: 'fire', physical },
  ModifierSet.sum(statuses.map(s => Canon.conditions[s]!.modifiers ?? {}))).amount;
describe('Resist Energy against fire, by the SRD\'s resolution', () => {
  it('is a second-level abjuration of Life, on the caster or one ally, for the fight', () => {
    expect(resist.spell).toEqual({ tradition: 'divine', level: 2, domain: 'life', school: 'abjuration' });
    expect(resist.effects).toEqual([{ kind: 'apply', status: 'fire_resistant', duration: 20, target: 'ally' }]);
  });
  it('takes ten off each blow of fire, after any fraction, the better of two and never both', () => {
    expect([fire(14, ['fire_resistant']), fire(7, ['fire_resistant']), fire(14, [])]).toEqual([4, 0, 14]);
    expect(fire(30, ['fire_resistant', 'fireproof'])).toBe(5);
    expect(ModifierSet.sum([{ resist: { fire: 10 } }, { resist: { fire: 5, cold: 5 } }]).resist)
      .toEqual({ fire: 10, cold: 5 });
    expect(Defenses.mitigate({ amount: 14, bonus: 0, type: 'cold', physical },
      Canon.conditions.fire_resistant!.modifiers ?? {}).amount).toBe(14);
  });
  it('is cast on a companion, and a burn that lands on them comes to ten less, told as held off', () => {
    const b = new Battle({ id: 'resist', combatants: [cleric(), hardy(c.character('warrior', 'warrior', 'fighters')),
      hardy(c.character('warrior', 'g1', 'goblins'))], abilities: Content.abilities }, 'resist', 200);
    for (let i = 0; i < 40 && b.state.actor !== 'cleric'; i++) {
      b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
    }
    expect(b.legalCommands().filter(x => x.ability === 'resist_fire').map(x => x.target).sort())
      .toEqual(['cleric', 'warrior']);
    b.step(b.legalCommands().find(x => x.ability === 'resist_fire' && x.target === 'warrior')!);
    const warrior = b.state.combatants.find(f => f.id === 'warrior')!;
    expect(warrior.statuses.find(s => s.id === 'fire_resistant')?.remaining).toBe(20);
    const events: CombatEvent[] = [], before = warrior.hp;
    Effects.damage(warrior, { amount: 13, type: 'fire' }, { fighters: b.state.combatants, turn: 1, events,
      content: c, abilities: [], retreat: false, location: null, expressions: new Expressions('resist'),
      source: { id: 'trap', kind: 'trap' } } as EffectContext);
    const burn = events.find(e => e.type === 'damage');
    expect(before - warrior.hp).toBe(3);
    expect(burn?.type === 'damage' && burn.modifiers?.guarded).toEqual([{ defense: 'resistance', amount: 10,
      to: 'fire' }]);
    expect(burn?.type === 'damage' && DefenseTelling.said(burn, 'Wat').join(' ')).toContain('10');
  });
});
