import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import type { Fighter } from '../src/model';

// Remove Fear, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 21): the fear on the caster or one
// ally ends, and for ten minutes they have +4 against fear, where Orsino's only ended the fear. This spec is its
// play-identity test.
const c = new Content('steady');
const hardy = (f: Fighter): Fighter => ({ ...f, level: 3, hp: 300, maxHp: 300 });
const cleric = (): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters')), abilities: ['remove_fear'],
  maxSlots: [1], slots: [1], prepared: [['remove_fear']], ready: [['remove_fear']] });
const afraid = (f: Fighter): Fighter => ({ ...f, statuses: [{ id: 'fear', remaining: 3 }] });
const battle = () => {
  const b = new Battle({ id: 'steady', combatants: [afraid(hardy(c.character('warrior', 'warrior', 'fighters'))),
    cleric(), hardy(c.character('warrior', 'g1', 'goblins'))], abilities: Content.abilities }, 'steady', 200);
  for (let i = 0; i < 40 && b.state.actor !== 'cleric'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
describe('Remove Fear, by the SRD\'s numbers', () => {
  it('is a first-level abjuration of Life, on the caster or a companion, never a foe', () => {
    const b = battle(), spell = Content.abilities.find(a => a.id === 'remove_fear')!;
    expect(b.legalCommands().filter(x => x.ability === 'remove_fear').map(x => x.target).sort())
      .toEqual(['cleric', 'warrior']);
    expect(spell.spell).toEqual({ tradition: 'divine', level: 1, domain: 'life', school: 'abjuration' });
  });
  it('ends the fear on the companion and leaves them +4 against fear for a hundred rounds, the slot spent once', () => {
    const b = battle(), warrior = () => b.state.combatants.find(f => f.id === 'warrior')!;
    const before = Effects.saveModifier(warrior(), 'fear');
    expect(warrior().statuses.some(s => s.id === 'fear')).toBe(true);
    b.step({ actor: 'cleric', ability: 'remove_fear', target: 'warrior' });
    expect(warrior().statuses.map(s => [s.id, s.remaining])).toEqual([['heartened', 100]]);
    // The fear's −2 to every save is gone with it, and the +4 against fear comes.
    expect(Effects.saveModifier(warrior(), 'fear') - before).toBe(6);
    expect(Effects.saveModifier(warrior(), 'will')).toBe(0);
    expect(b.state.combatants.find(f => f.id === 'cleric')!.slots).toEqual([0]);
  });
});
