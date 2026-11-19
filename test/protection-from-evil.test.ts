import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';
import type { Fighter } from '../src/model';

// Protection from Evil, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 32): the caster or one ally
// warded for a minute a level (ten rounds a casting level, case 46): two harder to hit by a deflection added to worn
// armour, +2 to every save, proof
// against charm; where Orsino's was three rounds of proof against charm and fear, half of necrotic harm and +2 to
// saves, and no ward against blows. This spec is its play-identity test.
const c = new Content('warded');
const hardy = (f: Fighter): Fighter => ({ ...f, level: 3, hp: 300, maxHp: 300 });
const cleric = (): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters')),
  abilities: ['protection_from_evil'], maxSlots: [0, 1], slots: [0, 1], prepared: [[], ['protection_from_evil']],
  ready: [[], ['protection_from_evil']] });
const battle = () => {
  const b = new Battle({ id: 'warded', combatants: [hardy(c.character('warrior', 'warrior', 'fighters')), cleric(),
    hardy(c.character('warrior', 'g1', 'goblins'))], abilities: Content.abilities }, 'warded', 200);
  for (let i = 0; i < 40 && b.state.actor !== 'cleric'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const one = (b: Battle, id: string) => b.state.combatants.find(f => f.id === id)!;
const ac = (b: Battle, id: string) => Fighting.armorClass(Effects.combatant(one(b, id)));
describe('Protection from Evil, by the SRD\'s numbers', () => {
  it('is offered on the caster or a companion, never a foe, and is a first-level abjuration of Law', () => {
    const b = battle(), ward = Content.abilities.find(a => a.id === 'protection_from_evil')!;
    expect(b.legalCommands().filter(x => x.ability === 'protection_from_evil').map(x => x.target).sort())
      .toEqual(['cleric', 'warrior']);
    expect([ward.spell, ward.effects.map(e => [e.kind, e.target])]).toEqual([
      { tradition: 'divine', level: 1, domain: 'law', school: 'abjuration' }, [['apply', 'ally']]]);
  });
  it('wards the companion a minute a level (thirty rounds at the third): two harder to hit, +2 to every save, proof against charm, not fear', () => {
    const b = battle(), before = ac(b, 'warrior');
    const saves = (f: Fighter) => ['fortitude', 'reflex', 'will', 'fear'].map(k => Effects.saveModifier(f, k));
    const was = saves(one(b, 'warrior'));
    b.step({ actor: 'cleric', ability: 'protection_from_evil', target: 'warrior' });
    const warrior = one(b, 'warrior'), m = Effects.modifiers(warrior);
    expect(ac(b, 'warrior')).toBe(before - 2);
    expect(saves(warrior)).toEqual(was.map(n => n + 2));
    expect(warrior.statuses.find(s => s.id === 'warded_from_evil')?.remaining).toBe(30);
    expect([m.immune, m.resistances?.necrotic]).toEqual([['charm'], undefined]);
    expect(one(b, 'cleric').slots).toEqual([0, 0]);
  });
});
