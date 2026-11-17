import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import type { Fighter } from '../src/model';

// Bless, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 17): the caster and every ally, for a
// minute (ten rounds), where Orsino's blessed one ally for three. This spec is its play-identity test.
const c = new Content('bless');
const hardy = (f: Fighter): Fighter => ({ ...f, level: 3, hp: 300, maxHp: 300 });
const cleric = (): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters')), abilities: ['bless'],
  maxSlots: [1], slots: [1], prepared: [['bless']], ready: [['bless']] });
const cast = () => {
  const b = new Battle({ id: 'bless', combatants: [hardy(c.character('warrior', 'warrior', 'fighters')), cleric(),
    hardy(c.character('ranger', 'ranger', 'fighters')), hardy(c.character('warrior', 'g1', 'goblins')),
    hardy(c.character('warrior', 'g2', 'goblins'))], abilities: Content.abilities }, 'bless', 200);
  for (let i = 0; i < 40 && b.state.actor !== 'cleric'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  const command = b.legalCommands().find(x => x.ability === 'bless')!;
  return { b, events: b.step(command) };
};
const blessed = (b: Battle) => b.state.combatants.filter(f => f.statuses.some(s => s.id === 'blessed'))
  .map(f => [f.id, f.statuses.find(s => s.id === 'blessed')!.remaining]);
describe('Bless, by the SRD\'s numbers', () => {
  it('blesses the caster and every ally, no foe, for ten rounds, the slot spent once', () => {
    const { b } = cast();
    expect(blessed(b).map(([id]) => id).sort()).toEqual(['cleric', 'ranger', 'warrior']);
    expect(blessed(b).every(([, left]) => Number(left) >= 9)).toBe(true);
    expect(b.state.combatants.find(f => f.id === 'cleric')!.slots).toEqual([0]);
  });
  it('is a first-level enchantment of Life on the company', () => {
    const bless = Content.abilities.find(a => a.id === 'bless')!;
    expect([bless.spell, bless.effects.map(e => [e.kind, e.target])]).toEqual([
      { tradition: 'divine', level: 1, domain: 'life', school: 'enchantment' }, [['apply', 'party']]]);
  });
});
