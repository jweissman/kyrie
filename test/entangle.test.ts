import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';
import { Positions } from '../src/rules/positions';
import type { CombatEvent, Fighter } from '../src/model';

// Entangle, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 31): grass and roots rise in a burst,
// on friend and foe, a Reflex save at case 7's difficulty for a first-level spell, and whoever fails is held fast,
// striking and dodging badly, for a minute a casting level (case 46), where Orsino's held three against 15
// and the caster's whole level. This spec is its play-identity test.
const c = new Content('entangle');
const vines = Content.abilities.find(a => a.id === 'entangle')!;
const hardy = (f: Fighter): Fighter => ({ ...f, level: 3, hp: 400, maxHp: 400 });
const cleric = (): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters')), wisdom: 16,
  abilities: ['entangle'], maxSlots: [0, 1], slots: [0, 1], prepared: [[], ['entangle']], ready: [[], ['entangle']] });
const battle = (seed: string) => {
  const b = new Battle({ id: 'vines', combatants: [hardy(c.character('warrior', 'warrior', 'fighters')), cleric(),
    hardy(c.character('warrior', 'g1', 'goblins')), hardy(c.character('warrior', 'g2', 'goblins'))],
  abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'cleric'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const saves = (events: CombatEvent[]) => events.flatMap(e => e.type === 'save' && !e.against ? [e] : []);
const held = (b: Battle) => b.state.combatants.flatMap(f => f.statuses.filter(s => s.id === 'entangled')
  .map(s => [f.id, s.remaining]));
describe('Entangle, by the SRD\'s numbers', () => {
  it('is a first-level transmutation of Nature, a burst saved against with Reflex at case 7\'s difficulty', () => {
    const e = vines.effects[0]!;
    expect([vines.spell!.level, vines.spell!.school, vines.spell!.domain, Positions.area(vines), e.save?.kind])
      .toEqual([1, 'transmutation', 'nature', 'burst', 'reflex']);
    // Wisdom 16 and the third level: 11, 3 and 1; the warrior beside the foes is caught too.
    const rolls = saves(battle('a').step({ actor: 'cleric', ability: 'entangle', target: 'g1' }));
    expect(rolls.map(r => r.type === 'save' && [r.target, r.difficulty]))
      .toEqual([['warrior', 15], ['g1', 15], ['g2', 15]]);
  });
  it('holds whoever fails for a minute a level (thirty rounds at the third), two worse to hit, and not whoever saves', () => {
    const seen = new Set<boolean>();
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const b = battle(seed), rolls = saves(b.step({ actor: 'cleric', ability: 'entangle', target: 'g1' }));
      const failed = rolls.flatMap(r => r.type === 'save' && !r.success ? [r.target] : []);
      rolls.forEach(r => seen.add(r.type === 'save' && !!r.success));
      expect(held(b)).toEqual(failed.map(id => [id, 30]));
      for (const id of failed) {
        const f = b.state.combatants.find(x => x.id === id)!, mark = Effects.combatant(b.state.combatants[0]!);
        expect(Fighting.chance(Effects.combatant(f), mark))
          .toBeLessThan(Fighting.chance(Effects.combatant({ ...f, statuses: [] }), mark));
      }
    }
    expect([...seen].sort()).toEqual([false, true]);
  });
});
