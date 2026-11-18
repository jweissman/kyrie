import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Positions } from '../src/rules/positions';
import type { CombatEvent, Fighter } from '../src/model';

// Calm Emotions, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 24): a burst falling on friend and
// foe, a Will save to negate; whoever fails does nothing until harm or a blow breaks the calm, where Orsino's calm was
// a boon to every foe. This spec is its play-identity test.
const c = new Content('calm');
const calm = Content.abilities.find(a => a.id === 'calm_emotions')!;
const hardy = (f: Fighter): Fighter => ({ ...f, level: 3, hp: 400, maxHp: 400 });
const cleric = (): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters')), wisdom: 16,
  abilities: ['calm_emotions'], maxSlots: [0, 1], slots: [0, 1], prepared: [[], ['calm_emotions']],
  ready: [[], ['calm_emotions']] });
const battle = (seed: string) => {
  const b = new Battle({ id: 'calm', combatants: [hardy(c.character('warrior', 'warrior', 'fighters')), cleric(),
    hardy(c.character('warrior', 'g1', 'goblins')), hardy(c.character('warrior', 'g2', 'goblins'))],
  abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'cleric'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const saves = (events: CombatEvent[]) => events.flatMap(e => e.type === 'save' && !e.against ? [e] : []);
const calmed = (b: Battle) => b.state.combatants.filter(f => f.statuses.some(s => s.id === 'calmed')).map(f => f.id);
describe('Calm Emotions, by the SRD\'s numbers', () => {
  it('is a second-level enchantment of Nature, a burst saved against with Will at case 7\'s difficulty', () => {
    const e = calm.effects[0]!;
    expect([calm.spell!.level, calm.spell!.school, calm.spell!.domain, Positions.area(calm), e.save?.kind])
      .toEqual([2, 'enchantment', 'nature', 'burst', 'will']);
    const rolls = saves(battle('a').step({ actor: 'cleric', ability: 'calm_emotions', target: 'g1' }));
    expect(rolls.every(r => r.type === 'save' && r.difficulty === 16)).toBe(true);
    expect(rolls.map(r => r.target)).toEqual(expect.arrayContaining(['warrior', 'g1', 'g2']));
  });
  it('calms whoever fails and not whoever saves, a calmed one does nothing, and a blow breaks it', () => {
    let broken = 0;
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      const b = battle(seed), rolls = saves(b.step({ actor: 'cleric', ability: 'calm_emotions', target: 'g1' }));
      const failed = rolls.flatMap(r => r.type === 'save' && !r.success ? [r.target] : []);
      expect(calmed(b).sort()).toEqual([...failed].sort());
      const foe = failed.find(id => id.startsWith('g')), friend = b.state.combatants.find(f => f.id === 'warrior')!;
      if (!foe || calmed(b).includes('warrior')) { continue; }
      // The warrior strikes the calmed foe, and the calm on it breaks.
      for (let i = 0; i < 20 && b.state.actor !== 'warrior'; i++) {
        const events = b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
        if (events.some(e => e.type === 'skip' && e.actor === foe)) { expect(calmed(b)).toContain(foe); }
      }
      if (b.state.actor !== friend.id || !calmed(b).includes(foe)) { continue; }
      b.step({ actor: 'warrior', ability: 'melee', target: foe });
      if (!calmed(b).includes(foe)) { broken++; }
    }
    expect(broken).toBeGreaterThan(0);
  });
});
