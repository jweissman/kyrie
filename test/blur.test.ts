import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';
import type { Fighter } from '../src/model';

// Blur by the SRD's numbers (doc/architecture/mission-22/srd-proving-cases.md, case 49): second level, illusion, on
// the caster or one ally, concealment for a minute a casting level: one blow in five that would land goes astray.
const c = new Content('blur');
const blur = Content.abilities.find(a => a.id === 'blur')!;
const hardy = (f: Fighter, level = 3): Fighter => ({ ...f, level, hp: 300, maxHp: 300 });
const mage = (): Fighter => ({ ...hardy(c.character('mage', 'mage', 'fighters')), abilities: ['blur'],
  maxSlots: [0, 1], slots: [0, 1], prepared: [[], ['blur']], ready: [[], ['blur']] });
const battle = (seed: string) => {
  const b = new Battle({ id: 'blur', combatants: [mage(), hardy(c.character('warrior', 'w', 'fighters')),
    hardy(c.character('warrior', 'g1', 'goblins'))], abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
describe('Blur, by the SRD\'s numbers', () => {
  it('is a second-level illusion on the caster or a companion, a minute a casting level', () => {
    expect(blur.spell).toEqual({ tradition: 'arcane', level: 2, school: 'illusion' });
    expect(blur.effects).toEqual([{ kind: 'apply', status: 'concealed', target: 'ally',
      duration: { kind: 'deem', expression: '10 * #castingLevel' } }]);
    const b = battle('a');
    expect(b.legalCommands().filter(x => x.ability === 'blur').map(x => x.target).sort()).toEqual(['mage', 'w']);
  });
  it('turns one blow in five that would land, for thirty rounds at the third casting level', () => {
    const b = battle('b');
    b.step({ actor: 'mage', ability: 'blur', target: 'w' });
    const w = b.state.combatants.find(f => f.id === 'w')!;
    expect(w.statuses.find(s => s.id === 'concealed')?.remaining).toBe(30);
    const foe = Effects.combatant(b.state.combatants.find(f => f.id === 'g1')!);
    const plain = Fighting.chance(foe, Effects.combatant({ ...w, statuses: [] }));
    expect(Fighting.chance(foe, Effects.combatant(w))).toBeCloseTo(plain * 16 / 20, 5);
  });
});
