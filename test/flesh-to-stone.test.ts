import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import type { CombatEvent, Fighter } from '../src/model';

// Flesh to Stone by the SRD's numbers (doc/architecture/mission-22/srd-proving-cases.md, case 55): sixth level,
// transmutation, one foe, a Fortitude save to negate at case 7's difficulty, spell resistance answering it; the stone
// lasts the fight (Kyr's petrified), where Orsino's held ten rounds against 18 and the caster's whole level.
const c = new Content('flesh-to-stone');
const spell = Content.abilities.find(a => a.id === 'flesh_to_stone')!;
const hardy = (f: Fighter, level = 11): Fighter => ({ ...f, level, hp: 400, maxHp: 400 });
const mage = (): Fighter => ({ ...hardy(c.character('mage', 'mage', 'fighters')), intelligence: 18,
  abilities: ['flesh_to_stone'], maxSlots: [0, 0, 0, 0, 0, 0, 1], slots: [0, 0, 0, 0, 0, 0, 1],
  prepared: [[], [], [], [], [], [], ['flesh_to_stone']], ready: [[], [], [], [], [], [], ['flesh_to_stone']] });
const battle = (seed: string, foe: Fighter) => {
  const b = new Battle({ id: 'stone', combatants: [mage(), foe], abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 20 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const stone = (events: CombatEvent[]) => events.find(e => e.type === 'status' && e.detail === 'petrified');
describe('Flesh to Stone, by the SRD\'s numbers', () => {
  it('is a sixth-level transmutation on one foe, saved with Fortitude, that spell resistance answers', () => {
    const e = spell.effects[0]!;
    expect([spell.spell!.level, spell.spell!.school, spell.spell!.resistance, e.target, e.save?.kind])
      .toEqual([6, 'transmutation', true, 'enemy', 'fortitude']);
    expect(e.save?.difficulty).toEqual({ kind: 'deem',
      expression: '16 + floor((#castingScore - 10) / 2) + floor(#castingLevel / 2) + #bonusSpellDC' });
  });
  it('turns a foe who fails the save to stone for the fight, and leaves one who makes it', () => {
    let stoned = 0;
    for (const seed of 'abcdefghijkl'.split('')) {
      const b = battle(seed, hardy(c.creature('wolf', 'g1', 'goblins', 1), 1));
      const events = b.step({ actor: 'mage', ability: 'flesh_to_stone', target: 'g1' });
      const save = events.find(e => e.type === 'save' && e.target === 'g1');
      expect(save?.type === 'save' && save.kind).toBe('fortitude');
      const status = stone(events);
      expect(!!status).toBe(save?.type === 'save' && !save.success);
      if (status?.type === 'status') { expect(status.amount).toBe(1000); stoned++; }
    }
    expect(stoned).toBeGreaterThan(0);
  });
});
