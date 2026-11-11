import { describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { ItemPlates } from '../src/paintings/item-plates';

// What is gathered from a plant is drawn in the pack (the owner's play of 10 November: flowers gathered had no images):
// by its own plate, else by its plant's painting. Those still with neither are named here, to be painted.
describe('a thing gathered from a plant', () => {
  it('has a picture in the pack, but for those still wanting one', () => {
    const wanting = ['betony'];
    const undrawn = Object.values(Canon.plants).map(p => p.yields)
      .filter((y): y is string => !!y && !ItemPlates.kind(y));
    expect(undrawn).toEqual(wanting);
  });
});
