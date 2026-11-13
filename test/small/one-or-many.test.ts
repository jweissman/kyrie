import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Voice } from '../../src/narrative/voice';

// What is said is said by whoever is there, one or many: a lone grave-robber spoken to had been told in a band's
// words, "'We want no trouble,' one of him says" (round 12, B: T24-19). How many speak is part of the moment (number),
// and a line of one of them is never said of one alone (Voice.fits).
const graves = (numbers: string) => `
  Place yard "the churchyard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Person robbers "${numbers ? 'three grave-robbers' : 'a grave-robber'}" at yard {
    Role "a man with a candle and a spade". Ancestry human. Temperament defensive. Pronouns ${numbers ? 'they' : 'he'}.
    ${numbers} }
  Observe y at yard when true "Leaning stones, and a candle among them.".
  Goal false.`;
const said = (t: Tiny) => t.journey.taken.at(-1)!.page;

describe('one, or many, spoken to', () => {
  it('is spoken of as one when alone, and as one of many in a band', async () => {
    const one = await Tiny.start(graves(''));
    await one.play('^Talk to');
    expect(said(one)).toContain('want no trouble');
    expect(said(one)).not.toMatch(/one of (him|her|it)\b/);
    const band = await Tiny.start(graves('Numbers 3.'));
    await band.play('^Talk to');
    expect(said(band)).toMatch(/one of them says/);
  });
  it('has no line of one of them that would be chosen for one alone', () => {
    const ofMany = Voice.tables.flatMap(t => t.lines).filter(l => Voice.ofMany(l));
    expect(ofMany.length).toBeGreaterThan(0);
    expect(ofMany.filter(l => Voice.fits(l, false)).map(l => l.id)).toEqual([]);
  });
});
