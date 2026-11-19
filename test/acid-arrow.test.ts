import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Lasting } from '../src/rules/lasting';
import { MechanicsText } from '../src/presentation/mechanics-text';
import type { CombatEvent, Fighter } from '../src/model';

// Acid Arrow by the SRD's numbers (doc/architecture/mission-22/srd-proving-cases.md, case 44), and a duration by the
// caster (Lasting): second level, a ranged touch, 2d4 acid, and the acid clinging 2d4 a round for a round every three
// casting levels (none at the first and second), its acid setting off none of Orsino's acid burn.
const c = new Content('acid-arrow');
const arrow = Content.abilities.find(a => a.id === 'acid_arrow')!;
const hardy = (f: Fighter): Fighter => ({ ...f, hp: 300, maxHp: 300 });
const mage = (level: number): Fighter => ({ ...hardy(c.character('mage', 'mage', 'fighters')), level,
  abilities: ['acid_arrow'], maxSlots: [0, 1], slots: [0, 1], prepared: [[], ['acid_arrow']], ready: [[], ['acid_arrow']] });
const battle = (seed: string, level: number) => {
  const b = new Battle({ id: 'acid', combatants: [mage(level), hardy(c.character('warrior', 'g1', 'goblins'))],
    abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const acid = (events: CombatEvent[]) => events.filter(e => e.type === 'damage' && e.damageType === 'acid');
const seeds = 'abcdefghijklmnop'.split('');
describe('a duration by the caster', () => {
  it('is settled by the casting level as it is laid, and said at the first and the tenth', () => {
    const laid = arrow.effects[1]!;
    const duration = laid.kind === 'apply' ? laid.duration : 0;
    expect([1, 2, 3, 6, 9, 18, 20].map(l => Lasting.at(duration, l))).toEqual([0, 0, 1, 2, 3, 6, 6]);
    expect(MechanicsText.duration(duration)).toBe('no turns at the first casting level, 3 turns at the tenth');
    expect(MechanicsText.duration(3)).toBe('3 turns');
  });
});
describe('Acid Arrow, by the SRD\'s numbers', () => {
  it('is a second-level conjuration shot as a ranged touch, which spell resistance does not answer', () => {
    expect(arrow.spell).toEqual({ tradition: 'arcane', level: 2, school: 'conjuration' });
    expect(arrow.effects[0]).toMatchObject({ kind: 'damage', damageType: 'acid', touch: 'ranged', triggers: false });
  });
  it('clings a round every three casting levels where the shot lands, and not where it misses', () => {
    for (const [level, rounds] of [[3, 1], [6, 2]] as const) {
      let landed = 0;
      for (const seed of seeds) {
        const b = battle(seed, level), events = b.step({ actor: 'mage', ability: 'acid_arrow', target: 'g1' });
        const touch = events.find(e => e.type === 'attack' && e.touch);
        const clinging = b.state.combatants.find(f => f.id === 'g1')!.statuses.find(s => s.id === 'acid_clinging');
        const hit = touch?.type === 'attack' && touch.success;
        expect(acid(events).length).toBe(hit ? 1 : 0);
        expect(clinging?.remaining).toBe(hit && rounds ? rounds : undefined);
        // Its acid sets off none of Orsino's acid burn.
        expect(events.some(e => e.type === 'status' && e.detail === 'acid_burn')).toBe(false);
        if (hit) { landed++; }
      }
      expect(landed).toBeGreaterThan(0);
    }
  });
  it('burns 2d4 at the end of its holder\'s turn while it clings, setting off no acid burn', () => {
    const clung = seeds.map(seed => battle(seed, 6)).find(b => {
      b.step({ actor: 'mage', ability: 'acid_arrow', target: 'g1' });
      return b.state.combatants.find(f => f.id === 'g1')!.statuses.some(s => s.id === 'acid_clinging');
    })!;
    const later = Array.from({ length: 4 }, () => clung.state.outcome ? [] : clung.step(clung.chosen())).flat();
    const ticks = acid(later).filter(e => e.type === 'damage' && e.target === 'g1');
    expect(ticks.length).toBeGreaterThan(0);
    for (const t of ticks) { expect(t.type === 'damage' && t.rolled >= 2 && t.rolled <= 8).toBe(true); }
    expect(later.some(e => e.type === 'status' && e.detail === 'acid_burn')).toBe(false);
  });
});
