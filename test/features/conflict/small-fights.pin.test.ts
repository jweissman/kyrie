import { describe, expect, it } from 'bun:test';
import { Battle } from '../../../src/arena';
import { Content } from '../../../src/content';
import { FoeIntents } from '../../../src/foe-intents';
import { Tactics } from '../../../src/tactics';
import type { Fighter } from '../../../src/model';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Conflict › Small fights said truly and settled
// quickly (cold round A1, 28 November: OR-1851, OR-1855). Five rats were offered as "Easily won: Odile reckons they
// are no match for you" while the fight said "Together they could bring Odile down" of bites that land one in three
// for two or three; and they fought to the last over five rounds a warrior and a halfling won without a scratch. On a
// fragment of the rules, no world: a band of weak beasts is said as the chance it is, and loses heart as beasts do.
const company = () => {
  const odile = new Content('w').character('warrior', 'w', 'fighters', 'human');
  const reed = new Content('r').character('warrior', 'r', 'fighters', 'halfling');
  return [odile, reed];
};
const rats = (n: number): Fighter[] => Array.from({ length: n }, (_, i) => new Content(`f${i}`).creature('rat', `f${i}`,
  'goblins', 1));
const fought = (seed: string, morale: boolean) => {
  const b = new Battle({ id: 'rats', combatants: [...company(), ...rats(5)], abilities: Content.abilities,
    ...morale ? { terms: { morale: true, skittish: true } } : {} }, seed);
  for (let legal = b.legalCommands(); legal.length; legal = b.legalCommands()) {
    b.step(Tactics.choose(b.view, b.plain(legal)));
  }
  return b;
};
const median = (xs: number[]) => xs.toSorted((a, b) => a - b)[Math.floor(xs.length / 2)]!;

describe('Conflict › Small fights said truly and settled quickly', () => {
  it('does not tell five rats as able to bring down a warrior they cannot bite through', () => {
    const [odile] = company();
    odile!.hp = 10;
    odile!.equipment.armorAc = 0;
    const b = new Battle({ id: 'rats', combatants: [odile!, ...rats(5)], abilities: Content.abilities }, 'said');
    while (b.state.actor !== 'w' && !b.state.outcome) { b.step(b.chosen()); }
    expect((b.state.order ?? []).filter(id => id !== 'w').length).toBeGreaterThan(1);
    const said = FoeIntents.lines(b).join(' ');
    expect(said).toMatch(/scurry at .+ together, teeth first\./);
    expect(said).not.toMatch(/could bring/);
  });
  it('has a band of rats lose heart, and is over sooner for it', () => {
    const seeds = Array.from({ length: 24 }, (_, i) => `rats${i}`);
    const kept = seeds.map(s => fought(s, true)), last = seeds.map(s => fought(s, false));
    // Its rounds, one initiative a round (as FirstHourFights counts them).
    const rounds = (b: Battle) => b.events.filter(e => e.type === 'initiative').length;
    expect(kept.filter(b => b.events.some(e => e.type === 'flee')).length * 2).toBeGreaterThan(seeds.length);
    expect(median(kept.map(rounds))).toBeLessThanOrEqual(median(last.map(rounds)));
    expect(median(kept.map(rounds))).toBeLessThanOrEqual(3);
  });
});
