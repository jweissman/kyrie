import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// What one alone gathers is for them: a company of one is asked for no one ("Gather a handful of dandelion for Wenna",
// the lead's play of the reference opening, 27 November); a company of several still says whom it is for.
const green = (size: number) => `
  Place green "the green" is room at 0, 0.
  Company party "You" of ${size} at green.
  Thing willows "the willows" at green is scenery { State growing "Willows lean over the water.". }
  Initially Assert grows(willows).
  Item bark "a strip of willow bark" is willow_bark in willows.
  Initially Assert crop(bark, willows).
  Goal false.`;
const gathers = (t: Tiny) => t.journey.choices().filter(c => /^gather\(/.test(c.command)).map(c => c.label);

describe('a thing gathered', () => {
  it('is for no one named where the company is one', async () => {
    const t = await Tiny.start(green(1));
    expect(gathers(t)).toEqual(['Gather a strip of willow bark']);
  });
  it('is for whom it is, where the company is several', async () => {
    const t = await Tiny.start(green(2));
    expect(gathers(t).length).toBe(2);
    expect(gathers(t).every(l => / for /.test(l))).toBe(true);
  });
});
