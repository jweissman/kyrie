import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A warning the world keeps (BP-04, promise fidelity; the first blind playtest: a larger rat that "will not wait"
// could simply be walked past). A starving beast is told as "ribs showing; it will not wait to be sure of you", and is
// of a savage temper by its variation (data/catalog/variations.json): it falls on a company that comes to it. Its
// kind's temper had been taken without its variation, so a starving rat met the company as any wary rat did.
const lane = (variant: string) => `Place green "the green" is room at 0, 0 outdoors.
  Place lane "the lane" is room at 1, 0 outdoors.
  Passage g_l "the lane gate" is path between green and lane.
  Person rats "the rats" at lane { Role "rats". Species rat. ${variant} Numbers 2. Level 1. Lair lane. }
  Company party "You" of 1 at green.`;
describe('a starving beast', () => {
  it('falls on a company that comes to it, where a wary one of its kind does not', async () => {
    const fought = async (variant: string) => {
      const t = await Tiny.start(lane(variant)), event = await t.session.leg('go(t__g_l,t__lane)');
      return [t.world.one('temperament', 't__rats'), event.changes.includes('- able(t__rats)')];
    };
    expect(await fought('Variant starving.')).toEqual(['temper_savage', true]);
    expect(await fought('')).toEqual(['temper_wary', false]);
  });
});
