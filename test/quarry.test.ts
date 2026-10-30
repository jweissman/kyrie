import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { Content } from '../src/content';
import { Quarry } from '../src/quarry';
import { Tactics } from '../src/tactics';
import type { Fighter } from '../src/model';

// Whom a foe goes for (the audit's SLIP-07): every foe had struck whoever had the fewest hit points, so a mage behind
// a warrior was cut down first, whatever the warrior did. A beast goes for whoever struck it, or the nearest; a band
// for whoever has hurt it most, or the company's leader; a coward for the weakest only once the strong are down. And
// one of the company steps in front of a frail companion that something means to strike.
class Q {
  static readonly content = new Content('quarry');
  static set(f: Fighter, hp: number): Fighter { return { ...f, hp, maxHp: hp }; }
  static company(): Fighter[] {
    return [this.set(this.content.character('mage', 'mage', 'fighters'), 4),
      this.set(this.content.character('warrior', 'warrior', 'fighters'), 14)];
  }
  static battle(combatants: Fighter[], seed = 'quarry'): Battle {
    return new Battle({ id: 'quarry', combatants, abilities: Content.abilities }, seed);
  }
  // What a foe means to do as the round begins, and at whom.
  static meant(combatants: Fighter[], foe: string): string | undefined {
    return this.battle(combatants).state.intents?.[foe]?.target;
  }
}

describe('a foe chooses whom to strike as its kind would', () => {
  it('a beast goes for the nearest, the one in front, and then for whoever struck it', () => {
    const ghoul = Q.content.creature('ghoul', 'ghoul', 'goblins', 1);
    expect(Quarry.kind(ghoul)).toBe('beast');
    expect(Q.meant([...Q.company(), ghoul], 'ghoul')).toBe('warrior');
    expect(Q.meant([...Q.company(), { ...ghoul, struck: 'mage' }], 'ghoul')).toBe('mage');
  });
  it('a band goes for the company\'s leader, and then for whoever has hurt it most', () => {
    const robber = Q.content.character('commoner', 'robber', 'goblins');
    expect(Quarry.kind(robber)).toBe('band');
    const [mage, warrior] = Q.company();
    expect(Q.meant([mage!, warrior!, robber], 'robber')).toBe('mage');
    expect(Q.meant([mage!, { ...warrior!, harm: 5 }, robber], 'robber')).toBe('warrior');
    expect(Q.meant([{ ...mage!, harm: 6 }, { ...warrior!, harm: 5 }, robber], 'robber')).toBe('mage');
  });
  it('a coward goes for the weakest only once those stronger than itself are down', () => {
    const wolf = Q.set(Q.content.creature('wolf', 'wolf', 'goblins', 1), 8);
    expect(Quarry.kind(wolf)).toBe('coward');
    const thief = Q.set(Q.content.character('thief', 'thief', 'fighters'), 6);
    const [mage, warrior] = Q.company();
    expect(Q.meant([mage!, thief, warrior!, wolf], 'wolf')).toBe('warrior');
    expect(Q.meant([mage!, thief, { ...warrior!, hp: 0 }, wolf], 'wolf')).toBe('mage');
  });
  it('the company still finishes whoever is nearest falling', () => {
    const [mage, warrior] = Q.company();
    const ghouls = [Q.set(Q.content.creature('ghoul', 'g1', 'goblins', 1), 9),
      Q.set(Q.content.creature('ghoul', 'g2', 'goblins', 1), 2)];
    const state = { ...Q.battle([mage!, warrior!, ...ghouls]).state, actor: 'warrior' };
    const legal = ghouls.map(g => ({ actor: 'warrior', ability: 'melee', target: g.id }));
    expect(Tactics.choose(state, legal).target).toBe('g2');
  });
});

describe('a companion steps in front of a frail one', () => {
  it('a warrior guards the mage a foe means to strike, and not a cleric it could not put down', () => {
    const ghoul = { ...Q.content.creature('ghoul', 'ghoul', 'goblins', 1), struck: 'mage' };
    const [mage, warrior] = Q.company();
    const state = { ...Q.battle([mage!, warrior!, ghoul]).state, actor: 'warrior' };
    expect(state.intents?.ghoul?.target).toBe('mage');
    const legal = [{ actor: 'warrior', ability: 'guard', target: 'mage' },
      { actor: 'warrior', ability: 'melee', target: 'ghoul' }];
    expect(Tactics.choose(state, legal).ability).toBe('guard');
    const cleric = { ...Q.set(Q.content.character('cleric', 'mage', 'fighters'), 13), id: 'mage' };
    const hale = { ...Q.battle([cleric, warrior!, ghoul]).state, actor: 'warrior' };
    expect(Tactics.choose(hale, legal).ability).toBe('melee');
  });
  it('and the blow meant for the mage meets the warrior instead, the same fight for the same seed', () => {
    const fought = (seed: string) => {
      const battle = Q.battle([...Q.company(), Q.content.creature('ghoul', 'ghoul', 'goblins', 1),
        Q.content.creature('ghoul', 'ghoul2', 'goblins', 1)], seed);
      while (!battle.state.outcome) { battle.step(battle.chosen()); }
      return battle.events;
    };
    const seeds = Array.from({ length: 12 }, (_, i) => `quarry:${i}`);
    expect(fought(seeds[0]!)).toEqual(fought(seeds[0]!));
    const intercepted = seeds.filter(s => fought(s).some(e => e.type === 'intercept' && e.target === 'mage'));
    expect(intercepted.length).toBeGreaterThan(0);
    // The first blows of every fight are aimed at the one in front.
    for (const seed of seeds) {
      const first = fought(seed).find(e => e.type === 'attack' && e.actor.startsWith('ghoul'));
      expect(first?.type === 'attack' && first.target).toBe('warrior');
    }
  });
});
