import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';

// What Tessary Owes' 5 (AUT-24): every promise was written by hand, a relation, a deadline rule, a kept rule, a broken
// rule and a forsworn consequence. A Promise is one thing: made by a word, an aim while it stands, kept when its
// condition first holds, broken when its other does first, with what breaking it brings.
describe('a promise', () => {
  const probe = 'test/fixtures/probes/promise/probe.campaign.json';
  const aims = (j: Journey) => ScreenModel.build(j.campaign).objectives;
  it('is an aim while it stands, and kept when its condition holds', async () => {
    const j = await Journey.start(probe);
    await j.play('Promise the Comptroller');
    expect(aims(j)).toContain("Keep your promise to Comptroller Vane: to bring him the Factor's letter by nightfall.");
    await j.play("Factor's letter: Take", 'Give the Factor');
    expect(j.holds('promiseKept', 'p__letter_promise')).toBe(true);
    expect(aims(j).some(a => /Keep your promise/.test(a))).toBe(false);
  }, 30000);
  it('is broken when its other condition holds first, and brings what breaking it brings', async () => {
    const j = await Journey.start(probe);
    await j.play('Promise the Comptroller', '=18:10');
    expect(j.holds('promiseBroken', 'p__letter_promise')).toBe(true);
    expect(j.holds('p__forsworn', 'party')).toBe(true);
    expect(j.taken.map(t => t.told).join(' ')).toContain('a line is drawn through a promise you made');
  }, 30000);
});
