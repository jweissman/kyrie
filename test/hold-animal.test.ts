import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Targeting } from '../src/targeting';
import type { CombatEvent, Fighter } from '../src/model';

// Hold Animal by the SRD's numbers (doc/architecture/mission-22/srd-proving-cases.md, case 48), and an effect's kind
// read from a body (Targeting.bears): one animal held, a Will save to negate and again each turn it loses, a round a
// casting level. Orsino's had wanted an animal trait no Kyr animal bore, so it fell on none.
const c = new Content('hold-animal');
const hold = Content.abilities.find(a => a.id === 'hold_animal')!;
const hardy = (f: Fighter, level = 5): Fighter => ({ ...f, level, hp: 400, maxHp: 400 });
const cleric = (): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters')), wisdom: 18,
  abilities: ['hold_animal'], maxSlots: [0, 1], slots: [0, 1], prepared: [[], ['hold_animal']],
  ready: [[], ['hold_animal']] });
const battle = (seed: string, foe: Fighter) => {
  const b = new Battle({ id: 'hold', combatants: [cleric(), foe], abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 20 && b.state.actor !== 'cleric'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const wolf = () => hardy(c.creature('wolf', 'g1', 'goblins', 1));
const held = (events: CombatEvent[]) => events.find(e => e.type === 'status' && e.detail === 'paralyzed');
describe('an effect\'s kind, read from a body', () => {
  it('finds a wolf an animal and a beast, a zombie undead, and a man none of them', () => {
    const zombie = c.creature('zombie', 'z', 'goblins', 1), man = c.character('warrior', 'w', 'goblins');
    expect([Targeting.bears(wolf(), 'animal'), Targeting.bears(wolf(), 'beast'), Targeting.bears(zombie, 'undead')])
      .toEqual([true, true, true]);
    expect([Targeting.bears(man, 'animal'), Targeting.bears(zombie, 'animal'), Targeting.bears(man, 'humanoid')])
      .toEqual([false, false, true]);
  });
});
describe('Hold Animal, by the SRD\'s numbers', () => {
  it('is a second-level enchantment of Law on one animal, saved with Will and again, a round a casting level', () => {
    const e = hold.effects[0]!;
    expect([hold.spell!.level, hold.spell!.school, e.target, e.targetTrait, e.save?.kind, e.save?.again])
      .toEqual([2, 'enchantment', 'enemy', 'animal', 'will', true]);
    expect(e.kind === 'apply' && e.duration).toEqual({ kind: 'deem', expression: '#castingLevel' });
  });
  it('is offered against a wolf and not against a man, and holds the wolf five rounds at the fifth level', () => {
    const man = battle('m', hardy(c.character('warrior', 'g1', 'goblins')));
    expect(man.legalCommands().some(x => x.ability === 'hold_animal')).toBe(false);
    let holds = 0;
    for (const seed of 'abcdefghijkl'.split('')) {
      const b = battle(seed, wolf()), events = b.step({ actor: 'cleric', ability: 'hold_animal', target: 'g1' });
      const save = events.find(e => e.type === 'save' && e.target === 'g1');
      expect(save?.type === 'save' && save.kind).toBe('will');
      const status = held(events);
      expect(!!status).toBe(save?.type === 'save' && !save.success);
      if (status?.type === 'status') { expect(status.amount).toBe(5); holds++; }
    }
    expect(holds).toBeGreaterThan(0);
  });
});
