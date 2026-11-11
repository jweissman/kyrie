import { Canon } from '../canon/canon';
import { CanonValidation } from '../canon/canon-validation';
import { Likeness } from './likeness';
import type { World } from '../lang/world';

// A thing by its kind's plate (the owner's sheets: gear, arms, armour, consumables, valuables, stones), where one is
// cut: a stone found below by its stone's, a module's kind like another by that one's. What has none is told in words
// alone.
export class ItemPlates {
  static of(world: World, item: string): ReturnType<typeof Likeness.portrait> | undefined {
    const kind = world.one('itemKind', item);
    return kind ? ItemPlates.kind(kind) : undefined;
  }
  // A kind's plate, by the catalog's id for it (torch, ring_of_protection), a module's own kind by the kind it is.
  // A thing gathered from a plant with no plate of its own is drawn by its plant: forty-two of the fifty-four herbs and
  // simples gathered had been told in words alone in the pack (the owner's play of 10 November).
  static kind(kind: string): ReturnType<typeof Likeness.portrait> | undefined {
    const id = kind.replace(/^.*__/, ''), own = Canon.items[id]?.portrait;
    const plate = own && CanonValidation.paintings.has(own) ? own : ItemPlates.grown.get(id);
    return plate && CanonValidation.paintings.has(plate) ? Likeness.portrait(plate) : undefined;
  }
  // Each thing gathered from a plant, by the plant's painting.
  // (What is gathered, not what is cut: a willow pole is no picture of a willow.)
  static readonly grown = new Map(Object.values(Canon.plants).filter(p => p.yields && p.portrait)
    .map(p => [p.yields!, p.portrait!] as const));
}
