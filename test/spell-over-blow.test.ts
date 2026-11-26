import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { Content } from '../src/content';
import { Tactics } from '../src/tactics';
import type { Fighter } from '../src/model';

// A spell that fells where a blow might miss is cast (OR-208; the World agent's ladder under Porthalen): a mage of
// four hit points with Siphon Life prepared, against two rats of one, had swung her staff by the game's own tactics,
// the blow and the spell scoring alike before the slot's cost, and died to them. By the SRD's reading of each, the
// spell lands (no attack roll; a save for half, and half of its 1d6 still fells a rat of one) where her staff's blow
// lands about half the time: the spell scores above the blow, net of its slot, and the fight played by tactics alone
// is won. Against a foe the spell would only scratch, the blow is as good and the slot is kept.
class Rats {
  static readonly content = new Content('spell-over-blow');
  static set(f: Fighter, hp: number): Fighter { return { ...f, hp, maxHp: hp }; }
  static mage(): Fighter {
    const base = this.set(this.content.character('mage', 'mage', 'fighters'), 4);
    // Siphon Life in the first of her first-level slots, in place of what the making prepared there.
    const prepared = (base.prepared ?? [[]]).map((level, i) => i === 0 ? ['siphon_life', ...level.slice(1)] : level);
    return { ...base, abilities: [...base.abilities, 'siphon_life'], prepared, ready: structuredClone(prepared) };
  }
  static rats(hp = 1): Fighter[] {
    return ['r1', 'r2'].map(id => this.set(this.content.creature('rat', id, 'goblins', 1), hp));
  }
}
describe('a spell that fells, over a blow that might miss', () => {
  it('casts Siphon Life at a rat of one rather than swing the staff', () => {
    const b = new Battle({ id: 'rats', combatants: [Rats.mage(), ...Rats.rats()], abilities: Content.abilities }, 'rats');
    const state = { ...b.state, actor: 'mage' };
    const cast = { actor: 'mage', ability: 'siphon_life', target: 'r1' }, swing = { actor: 'mage', ability: 'melee', target: 'r1' };
    expect(Tactics.score(state, cast)).toBeGreaterThan(Tactics.score(state, swing));
    expect(Tactics.choose(state, [swing, cast]).ability).toBe('siphon_life');
  });
  it('weighs a ranged touch that can miss against a spell that always lands', () => {
    const b = new Battle({ id: 'rats', combatants: [Rats.mage(), ...Rats.rats()], abilities: Content.abilities }, 'rats');
    const state = { ...b.state, actor: 'mage' };
    const cast = { actor: 'mage', ability: 'siphon_life', target: 'r1' };
    const splash = { actor: 'mage', ability: 'acid_splash', target: 'r1' };
    expect(Tactics.score(state, cast)).toBeGreaterThan(Tactics.score(state, splash));
    expect(Tactics.choose(state, [splash, cast]).ability).toBe('siphon_life');
  });
  it('keeps the slot against a foe the spell would only scratch', () => {
    const b = new Battle({ id: 'big', combatants: [Rats.mage(), ...Rats.rats(30)], abilities: Content.abilities }, 'big');
    const state = { ...b.state, actor: 'mage' };
    const cast = { actor: 'mage', ability: 'siphon_life', target: 'r1' }, swing = { actor: 'mage', ability: 'melee', target: 'r1' };
    expect(Tactics.choose(state, [swing, cast]).ability).toBe('melee');
  });
  // Her one first-level slot cast at the first rat, the staff for the second: 73 of 100 seeded fights won, where the
  // staff for both had won 51.
  it('wins most fights against two rats of one by the tactics alone, over seeded fights', () => {
    let won = 0;
    for (let i = 0; i < 100; i++) {
      const b = new Battle({ id: `rats${i}`, combatants: [Rats.mage(), ...Rats.rats()], abilities: Content.abilities },
        `rats:${i}`);
      while (!b.state.outcome) { b.step(b.chosen()); }
      if (b.state.outcome === 'fighters') { won++; }
    }
    expect(won).toBeGreaterThanOrEqual(65);
  });
});
