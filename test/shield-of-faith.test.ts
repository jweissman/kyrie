import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';
import type { Fighter } from '../src/model';

// Shield of Faith, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 19): the caster or one ally two
// harder to hit for a minute a level (case 46), and a point more each six casting levels to +5 (case 59), a deflection
// added to worn armour, where Orsino's shielded was one harder to hit and ten hit points more. This spec is its
// play-identity test.
const c = new Content('faith');
const hardy = (f: Fighter): Fighter => ({ ...f, level: 3, hp: 300, maxHp: 300 });
const cleric = (level = 3): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters')), level,
  abilities: ['shield'],
  maxSlots: [1], slots: [1], prepared: [['shield']], ready: [['shield']] });
const battle = (level = 3) => {
  const b = new Battle({ id: 'faith', combatants: [hardy(c.character('warrior', 'warrior', 'fighters')), cleric(level),
    hardy(c.character('warrior', 'g1', 'goblins'))], abilities: Content.abilities }, 'faith', 200);
  for (let i = 0; i < 40 && b.state.actor !== 'cleric'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const ac = (b: Battle, id: string) =>
  Fighting.armorClass(Effects.combatant(b.state.combatants.find(f => f.id === id)!));
describe('Shield of Faith, by the SRD\'s numbers', () => {
  it('is offered on the caster or a companion, never a foe, and is a first-level abjuration of Law', () => {
    const b = battle(), shield = Content.abilities.find(a => a.id === 'shield')!;
    expect(b.legalCommands().filter(x => x.ability === 'shield').map(x => x.target).sort()).toEqual(['cleric', 'warrior']);
    expect([shield.spell, shield.effects.map(e => [e.kind, e.target])]).toEqual([
      { tradition: 'divine', level: 1, domain: 'law', school: 'abjuration' }, [['apply', 'ally']]]);
  });
  it('makes the armoured companion two harder to hit, for thirty rounds at the third level, no hit points more, the slot spent once', () => {
    const b = battle(), before = ac(b, 'warrior'), hp = b.state.combatants.find(f => f.id === 'warrior')!.hp;
    expect(b.state.combatants.find(f => f.id === 'warrior')!.equipment?.armorAc).toBeGreaterThan(0);
    b.step({ actor: 'cleric', ability: 'shield', target: 'warrior' });
    const warrior = b.state.combatants.find(f => f.id === 'warrior')!;
    expect(ac(b, 'warrior')).toBe(before - 2);
    expect(warrior.statuses.find(s => s.id === 'shield_of_faith')?.remaining).toBe(30);
    expect([warrior.hp, warrior.statuses.some(s => s.tempHp)]).toEqual([hp, false]);
    expect(b.state.combatants.find(f => f.id === 'cleric')!.slots).toEqual([0]);
  });
  it('makes them a point harder to hit each six casting levels, five at the eighteenth', () => {
    for (const [level, harder] of [[5, 2], [6, 3], [12, 4], [18, 5]] as const) {
      const b = battle(level), was = ac(b, 'warrior');
      b.step({ actor: 'cleric', ability: 'shield', target: 'warrior' });
      expect(was - ac(b, 'warrior')).toBe(harder);
    }
  });
});
