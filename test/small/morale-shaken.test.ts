import { describe, expect, it } from 'bun:test';
import { Battle } from '../../src/arena';
import { Content } from '../../src/content';
import { Environment } from '../../src/campaign/environment';
import type { CombatEvent, Terms } from '../../src/model';
import { Tiny } from '../support/tiny';

// A thinking band that is losing badly may break by itself (the SRD's morale, the DMG's optional rule): once half of
// it is down, each of it standing makes a DC 10 Wisdom save, once, and whoever fails it runs. Not every band: one its
// module waits on the fall of fights on (REV-16: authored fights wait on a band's fall), as does a savage or an
// obedient one, the dead and the made; an author's yields and breaks stand as they were. A band of beasts loses heart
// sooner, as the old games try a pack: at the first of it fallen, and again at half (OR-1855: five rats fought to the
// last over five rounds of a fight they never landed a bite in).
const fight = (kinds: string[], terms: Terms | undefined, seed: string) => {
  const hero = new Content('w').character('warrior', 'w', 'fighters', 'human');
  hero.hp = hero.maxHp = 200;
  const foes = kinds.map((k, i) => k === 'person' ? new Content(`f${i}`).character('commoner', `f${i}`, 'goblins', 'human')
    : new Content(`f${i}`).creature(k, `f${i}`, 'goblins', 1));
  foes.slice(0, Math.floor(foes.length / 2)).forEach(f => { f.hp = 0; });
  return new Battle({ id: 'm', combatants: [hero, ...foes], abilities: Content.abilities, ...terms ? { terms } : {} }, seed);
};
const saves = (b: Battle) => b.events.filter((e): e is Extract<CombatEvent, { type: 'save' }> => e.type === 'save'
  && e.kind === 'morale');
const fled = (b: Battle) => b.events.filter(e => e.type === 'flee' && e.success).map(e => 'actor' in e ? e.actor : '');
const band = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Person cutters "the cutpurses" at yard { Role "cutpurses". Ancestry human. Calling warrior. Level 1. Numbers 4. Temperament territorial. }
  Person brothers "the Skell brothers" at yard { Role "brothers". Ancestry human. Calling warrior. Level 1. Numbers 2. Temperament territorial. }
  Person zealots "the zealots" at yard { Role "zealots". Ancestry human. Calling warrior. Level 1. Numbers 2. Temperament savage. }
  Relation avenged(group).
  Rule brothers_fall when dead(brothers) and not avenged(party) { Assert avenged(party). }
  Goal false.`;

describe("a band's morale", () => {
  it('tests each of a thinking band standing once half of it is down, and whoever fails runs', () => {
    const runs = Array.from({ length: 12 }, (_, i) => fight(['person', 'person', 'person', 'person'], { morale: true }, `m${i}`));
    for (const b of runs) {
      const s = saves(b);
      expect(s.map(e => e.actor).sort()).toEqual(['f2', 'f3']);
      expect(s.every(e => e.difficulty === 10 && e.stat === 'wisdom')).toBe(true);
      expect(fled(b).sort()).toEqual(s.filter(e => !e.success).map(e => e.actor).sort());
    }
    // Over the seeds some lose heart and some hold.
    expect(runs.some(b => fled(b).length > 0)).toBe(true);
    expect(runs.some(b => saves(b).some(e => e.success))).toBe(true);
  });
  it('is tested once a fight, and never of the dead, nor of a band its author has said nothing of', () => {
    const b = fight(['person', 'person', 'person', 'person'], { morale: true }, 'once');
    while (!b.state.outcome) { b.step(b.chosen()); }
    expect(saves(b).length).toBe(2);
    expect(saves(fight(['zombie', 'zombie', 'zombie', 'zombie'], { morale: true }, 'z'))).toEqual([]);
    expect(saves(fight(['person', 'person', 'person', 'person'], undefined, 'n'))).toEqual([]);
  });
  it('tests a band of beasts at its first fallen, and again at half', () => {
    const half = fight(['wolf', 'wolf', 'wolf', 'wolf'], { morale: true }, 'w');
    expect(saves(half).map(e => e.actor).sort()).toEqual(['f2', 'f3']);
    for (let i = 0; i < 12; i++) {
      const hero = new Content('w').character('warrior', 'w', 'fighters', 'human');
      hero.hp = hero.maxHp = 200;
      const rats = [0, 1, 2, 3, 4, 5].map(n => new Content(`f${n}`).creature('rat', `f${n}`, 'goblins', 1));
      rats[0]!.hp = 0;
      const b = new Battle({ id: 'm', combatants: [hero, ...rats], abilities: Content.abilities, terms: { morale: true } },
        `r${i}`);
      // The first test, as the fight is joined with one of six down: each of the five standing.
      expect(saves(b).length).toBe(5);
      while (!b.state.outcome) { b.step(b.chosen()); }
      // And a second only if the band still stood when half of it was down: never more than one test of each.
      expect(saves(b).length).toBeLessThanOrEqual(8);
    }
  });
  it('is fought under by a band nothing waits on, and not by one whose fall is waited on or a savage one', async () => {
    const t = await Tiny.start(band, { party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] });
    const terms = (g: string) => Environment.terms(t.world, `t__${g}`);
    expect(terms('cutters')).toEqual({ morale: true });
    expect(terms('brothers')).toBeUndefined();
    expect(terms('zealots')).toBeUndefined();
  });
});
describe("a band's morale, told", () => {
  it('says who holds firm and who loses heart', async () => {
    const { CombatTelling } = await import('../../src/ui/combat-telling');
    const b = Array.from({ length: 12 }, (_, i) => fight(['person', 'person', 'person', 'person'], { morale: true }, `m${i}`))
      .find(x => fled(x).length === 1)!;
    const told = CombatTelling.exchanges(b.events, b.state).map(t => t.text).join(' ');
    expect(told).toMatch(/loses heart\./);
    expect(told).toMatch(/holds firm\./);
  });
});
