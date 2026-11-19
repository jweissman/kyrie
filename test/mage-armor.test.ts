import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';
import type { Fighter } from '../src/model';

// Mage Armor by the SRD's resolution (doc/architecture/mission-22/srd-proving-cases.md, case 22, the owner's word of 18
// November: option 2): on the caster or one ally, an armour of force as good as a mail coat (+4), which never adds to
// armour worn; no temporary hit points; Orsino's school, abjuration, kept. Before, Orsino's on the caster alone, four
// harder to hit over worn armour, and twenty hit points more. Its play-identity test.
const c = new Content('armour');
const hardy = (f: Fighter): Fighter => ({ ...f, level: 3, hp: 300, maxHp: 300 });
const mage = (): Fighter => ({ ...hardy(c.character('mage', 'mage', 'fighters')), abilities: ['armor'],
  maxSlots: [2], slots: [2], prepared: [['armor', 'armor']], ready: [['armor', 'armor']] });
const battle = () => {
  const b = new Battle({ id: 'armour', combatants: [hardy(c.character('warrior', 'warrior', 'fighters')), mage(),
    hardy(c.character('warrior', 'g1', 'goblins'))], abilities: Content.abilities }, 'armour', 200);
  for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const ac = (b: Battle, id: string) =>
  Fighting.armorClass(Effects.combatant(b.state.combatants.find(f => f.id === id)!));
describe('Mage Armor, by the SRD\'s resolution', () => {
  it('is cast on the caster or a companion, never a foe, a first-level abjuration', () => {
    const b = battle(), armor = Content.abilities.find(a => a.id === 'armor')!;
    expect(b.legalCommands().filter(x => x.ability === 'armor').map(x => x.target).sort()).toEqual(['mage', 'warrior']);
    expect(armor.spell).toEqual({ tradition: 'arcane', level: 1, school: 'abjuration' });
  });
  it('armours the unarmoured mage as a mail coat would, and adds nothing to the warrior\'s own; no hit points more', () => {
    const b = battle(), bare = ac(b, 'mage'), mailed = ac(b, 'warrior');
    const hp = b.state.combatants.find(f => f.id === 'mage')!.hp;
    b.step({ actor: 'mage', ability: 'armor', target: 'mage' });
    expect(ac(b, 'mage')).toBe(bare - 4);
    const me = b.state.combatants.find(f => f.id === 'mage')!;
    expect([me.hp, me.statuses.some(s => s.tempHp)]).toEqual([hp, false]);
    for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
      b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
    }
    b.step({ actor: 'mage', ability: 'armor', target: 'warrior' });
    expect(ac(b, 'warrior')).toBe(mailed);
  });
});
