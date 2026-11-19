import { Attest, type Attested, type Witness } from './attest';

// A container's mark (an opener's row, a thing gathered by focus, the row that turns a page, a rail mark over its
// lens) is the fold of what its leaves bear, and can be made no other way (the opportunity architecture, AT-07 §4 I1
// and I2; the owner, 19 November: "a container lit by its own reasons" must not be constructible). A leaf is an act
// with no rows under it; it is made here alone, from the witnesses the glance issued for it (Attest), and an opener
// offered as a leaf is refused: its mark is its rows' fold. The brand is this module's own, so a leaf cannot be written
// as a literal anywhere else, and Fold.mark takes leaves, never witnesses.
declare const leafed: unique symbol;
export interface Leaf {
  readonly id: string; readonly witnesses: readonly Witness[];
  readonly [leafed]: true;
}
export class Fold {
  // A leaf: an act that does something of its own (a way gone by, though a door on it can be listened at), or one that
  // opens nothing; an opener (rows, and no command of its own) is refused.
  static leaf(c: { id: string; command?: string; children?: readonly unknown[] }, witnesses: readonly (Witness |
    undefined)[]): Leaf {
    if (c.children?.length && !c.command) {
      throw new Error(`Fold: ${c.id} opens rows; it is no leaf, its mark is their fold`);
    }
    return { id: c.id, witnesses: witnesses.filter((w): w is Witness => !!w) } as unknown as Leaf;
  }
  // The one constructor of a container's mark: the union of its leaves' witnesses.
  static mark(leaves: readonly Leaf[], gilded: boolean): Attested | undefined {
    return Attest.of(leaves.flatMap(l => l.witnesses), gilded);
  }
}
