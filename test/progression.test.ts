import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { Advancement } from '../src/rules/advancement';
import { Spellcasting } from '../src/rules/spellcasting';
import { Progression } from '../src/handbook/progression';
import { CombatProjection } from '../src/combat-projection';
import { CreatureStore } from '../src/creature-store';
import { Arena } from '../src/arena';
import { Tactics } from '../src/tactics';
import { Canon } from '../src/canon/canon';
import type { Creature } from '../src/creature';

// Progression to twentieth level: a level brings something in kind (a technique, a calling trait, a new level of
// spells, a feat), a companion made at a level holds what one trained to it holds, and a company of fifteenth level
// does what one of first level cannot.
class Party {
  static readonly members = [['Bran', 'human', 'warrior'], ['Ivo', 'human', 'mage'], ['Dori', 'dwarf', 'cleric']] as const;
  static made(level: number, seed = 'party'): Creature[] {
    const content = new Content(seed);
    return this.members.map(([name, raceId, classId]) => content.createCreature(`${name.toLowerCase()}-${level}`,
      { name, raceId, classId, level, ...classId === 'mage' ? { traits: ['evoker'] } : {},
        ...classId === 'cleric' ? { traits: ['vitalist'] } : {} }));
  }
  static fight(level: number, foe: string, seed: string) {
    const fighters = this.made(level, seed).map(c => CombatProjection.fighter(c, 'fighters'));
    const content = new Content(`${seed}:foe`);
    const enemy = CombatProjection.fighter(content.createCreature('foe', { raceId: foe }), 'goblins');
    return Arena.simulate({ id: `level-${level}`, abilities: structuredClone(Content.abilities),
      combatants: [...fighters, enemy] }, seed, Tactics.choose).state.outcome;
  }
}

describe('progression to twentieth level', () => {
  it('brings every calling something in kind at least every three levels', () => {
    expect(Progression.problems()).toEqual([]);
    const warrior = Progression.levels('warrior').filter(l => l.gains.length).map(l => l.level);
    expect(warrior).toEqual([3, 5, 7, 9, 10, 13, 17]);
    expect(Progression.levels('mage').at(16)!.gains).toEqual(['level 9 spells']);
  });
  it('gives a caster of seventeenth level ninth-level slots, and never offers a spell it has no slot for', () => {
    const [, ivo] = Party.made(17);
    expect(ivo!.base.maxSlots!.length).toBe(9);
    const bard = new Content('bard').createCreature('wren', { raceId: 'human', classId: 'bard', level: 17,
      traits: ['rhythm_rhyme'] });
    expect(Spellcasting.table('bard', 17, bard.base).length).toBe(6);
    bard.state.advances = { qualities: 0, spells: 1 };
    const levels = Advancement.learnable(bard).map(id => Canon.abilities[id]!.spell!.level);
    expect(Math.max(...levels, 0)).toBeLessThanOrEqual(6);
  });
  it('makes a companion at a level with what one trained to that level holds', () => {
    for (const [name, raceId, classId] of [['Nell', 'human', 'thief'], ['Elen', 'elf', 'ranger'], ['Bran', 'human', 'warrior']] as const) {
      const made = new Content('same').createCreature(name, { raceId, classId, level: 15 });
      const trained = new Content('same').createCreature(name, { raceId, classId });
      trained.state.experience = Advancement.threshold(15);
      Advancement.train(trained, 'seed');
      expect(trained.base.level).toBe(15);
      expect([...trained.base.abilities].sort()).toEqual([...made.base.abilities].sort());
      expect([...trained.traits ?? []].sort()).toEqual([...made.traits ?? []].sort());
    }
  });
  it('lets the store keep what a level brings, and nothing else', () => {
    const store = new CreatureStore([new Content('store').createCreature('bran', { raceId: 'human', classId: 'warrior' })]);
    const lease = store.acquire(['bran']);
    const next = lease.creatures[0]!;
    next.state.experience = Advancement.threshold(13);
    const events = Advancement.train(next, 'seed');
    expect(events.filter(e => e.type === 'learn').map(e => 'detail' in e && e.detail))
      .toEqual(['Dig In', 'Rapid Strike', 'Weapon master', 'Veteran']);
    lease.commit([next], { advancement: true });
    lease.release();
    expect(store.get('bran').traits).toContain('veteran');
    const cheat = store.acquire(['bran']);
    cheat.creatures[0]!.traits = [...cheat.creatures[0]!.traits ?? [], 'unbroken'];
    expect(() => cheat.commit(cheat.creatures, { advancement: true })).toThrow();
    cheat.release();
  });
  it('gives a fifteenth-level company what a first-level company lacks against a red dragon', () => {
    const seeds = ['a', 'b', 'c', 'd', 'e', 'f'];
    const wins = (level: number) => seeds.filter(s => Party.fight(level, 'red_dragon', `dragon-${s}`) === 'fighters').length;
    expect(wins(1)).toBe(0);
    expect(wins(15)).toBeGreaterThanOrEqual(4);
  }, 60000);
});
