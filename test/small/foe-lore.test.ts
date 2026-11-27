import { describe, expect, it } from 'bun:test';
import { Battle } from '../../src/arena';
import { Content } from '../../src/content';
import { CombatModel } from '../../src/ui/combat-model';
import type { Fighter } from '../../src/model';

// What a skill tells of the foe in the fight's first frame (OR-1432; the economy review of 27 November): the one of the
// company who knows most of such things recalls what the kind faced is proof against and the worse for (the dead by
// the rites of the dead, beasts by woodcraft, anything else by lore), with no die, their check and ten against how hard
// the kind is to know. Said in the first round only; nothing of a people, of a kind with nothing to say, or by one who
// does not know it.
const fight = (calling: string, kind: string, more: string[] = []) => {
  // Each of the company's wits as a calling's are at their best (14), so that what is known is what the calling knows.
  const company = [calling, ...more].map((c, i) => Object.assign(new Content(`h${i}`).character(c as never, `h${i}`,
    'fighters', 'human'), { wisdom: 14, intelligence: 14 }));
  const foes: Fighter[] = ['a', 'b'].map(id => kind === 'human' ? new Content(id).character('commoner', id, 'goblins', 'human')
    : new Content(id).creature(kind, id, 'goblins'));
  return new Battle({ id: 'lore', combatants: [...company, ...foes], abilities: Content.abilities }, 'lore');
};
const known = (b: Battle) => CombatModel.build(b).known ?? [];
describe('what a skill tells of the foe', () => {
  it('is told at the start by one who knows the kind: the dead by their rites', () => {
    expect(known(fight('cleric', 'revenant'))).toEqual(
      ['Your rites of the dead: revenants shrug off half of every blow and are the worse for radiant or fire.']);
    expect(known(fight('cleric', 'hound/skeletal'))).toEqual(['Your rites of the dead: skeletal hounds take no harm '
      + 'from cold, shrug off five of every blow but bludgeoning and are the worse for radiant.']);
    expect(known(fight('mage', 'automaton'))).toEqual(['Your lore: automatons shrug off half of every blow.']);
  });
  it('is said by the one who knows it, in a company', () => {
    expect(known(fight('warrior', 'revenant', ['cleric']))[0]).toMatch(/^[A-Z][\w ]*'s rites of the dead: revenants /);
  });
  it('is not said by one who does not know the kind, of a people, nor of a kind with nothing to tell', () => {
    expect(known(fight('warrior', 'revenant'))).toEqual([]);
    expect(known(fight('mage', 'revenant'))).toEqual([]);
    expect(known(fight('cleric', 'human'))).toEqual([]);
    expect(known(fight('cleric', 'wolf'))).toEqual([]);
  });
  it('is said in the first round only', () => {
    const b = fight('cleric', 'revenant');
    while (b.events.filter(e => e.type === 'initiative').length < 2 && !b.state.outcome) { b.step(b.chosen()); }
    expect(known(b)).toEqual([]);
  });
});
