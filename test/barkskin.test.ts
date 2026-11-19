import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';
import type { Fighter } from '../src/model';

// Barkskin by the SRD's numbers (doc/architecture/mission-22/srd-proving-cases.md, case 50): second level,
// transmutation beside Nature, on the caster or one ally, two harder to hit added to worn armour (the SRD's natural
// armour +2) and a point each three casting levels past the third to +5 (case 59), ten minutes a casting level.
const c = new Content('barkskin');
const bark = Content.abilities.find(a => a.id === 'barkskin')!;
const hardy = (f: Fighter, level = 3): Fighter => ({ ...f, level, hp: 300, maxHp: 300 });
const cleric = (): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters')), abilities: ['barkskin'],
  maxSlots: [0, 1], slots: [0, 1], prepared: [[], ['barkskin']], ready: [[], ['barkskin']] });
const battle = (seed: string, level = 3) => {
  const b = new Battle({ id: 'bark', combatants: [{ ...cleric(), level },
    hardy(c.character('warrior', 'w', 'fighters')),
    hardy(c.character('warrior', 'g1', 'goblins'))], abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'cleric'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
describe('Barkskin, by the SRD\'s numbers', () => {
  it('is a second-level transmutation of Nature on the caster or a companion, ten minutes a casting level', () => {
    expect(bark.spell).toEqual({ tradition: 'divine', level: 2, domain: 'nature', school: 'transmutation' });
    expect(bark.effects).toEqual([{ kind: 'apply', status: 'barkskin', target: 'ally',
      amount: { kind: 'deem', expression: 'min(3, floor(max(0, #castingLevel - 3) / 3))' },
      duration: { kind: 'deem', expression: '100 * #castingLevel' } }]);
    expect(battle('a').legalCommands().filter(x => x.ability === 'barkskin').map(x => x.target).sort())
      .toEqual(['cleric', 'w']);
  });
  it('makes the armoured companion two harder to hit, for the fight', () => {
    const b = battle('b'), was = b.state.combatants.find(f => f.id === 'w')!;
    const before = Fighting.armorClass(Effects.combatant(was));
    b.step({ actor: 'cleric', ability: 'barkskin', target: 'w' });
    const w = b.state.combatants.find(f => f.id === 'w')!;
    expect(Fighting.armorClass(Effects.combatant(w))).toBe(before - 2);
    expect(w.statuses.find(s => s.id === 'barkskin')?.remaining).toBe(300);
  });
  it('makes them a point harder to hit each three casting levels past the third, five at the twelfth', () => {
    for (const [level, harder] of [[5, 2], [6, 3], [12, 5], [15, 5]] as const) {
      const b = battle('c', level), ac = () => Fighting.armorClass(Effects.combatant(b.state.combatants
        .find(f => f.id === 'w')!)), was = ac();
      b.step({ actor: 'cleric', ability: 'barkskin', target: 'w' });
      expect(was - ac()).toBe(harder);
    }
  });
});
