import { Attest, type Attested, type Projected, type Witness } from './attest';
import type { Choice } from '../ui/choice-list';
import type { Aspect } from './glance-types';
import { Attending } from '../ui/attention';

// A container's mark (an opener's row, a thing gathered by focus, the row that turns a page, a rail mark over its
// lens, a likeness, a place on the map) is the fold of what its leaves bear, and can be made no other way (the
// opportunity architecture, AT-07 §4 I1 and I2; the owner, 19 November: "a container lit by its own reasons" must not
// be constructible). A leaf is an act with no rows under it; it is made here alone, from the witnesses the glance
// issued for it (Attest), and an opener offered as a leaf is refused: its mark is its rows' fold. The brand is this
// module's own, so a leaf cannot be written as a literal anywhere else, and Fold.mark takes leaves, never witnesses.
// This module is the only caller of Attest.of in the game (test/small/fold): every indicator the player sees is a
// Fold.mark.
declare const leafed: unique symbol;
export interface Leaf {
  readonly id: string; readonly witnesses: readonly Witness[];
  readonly [leafed]: true;
}
// How the page names a choice by its id (the menu's own), where it draws one.
export type Chosen = (id: string) => Choice | undefined;
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
  // A step of a way (a way gone by, a journey set out on): the first step of a route toward something, marked by its
  // own witness and by what is directional along it (the followed aim's way, someone perceived off along it), and by
  // nothing done elsewhere (AT-07 §4 I7: a remote opportunity reaches a container only through a leaf that goes
  // toward it).
  static step(id: string, witnesses: readonly (Witness | undefined)[]): Leaf {
    const ws = witnesses.filter((w): w is Witness => !!w);
    const stray = ws.find(w => w.id !== id && w.kind !== 'directional');
    if (stray) { throw new Error(`Fold: ${stray.id} is done here, not along the way ${id}`); }
    return { id, witnesses: ws } as unknown as Leaf;
  }
  // The one constructor of a container's mark: the union of its leaves' witnesses.
  static mark(leaves: readonly Leaf[], gilded: boolean): Attested | undefined {
    return Attest.of(leaves.flatMap(l => l.witnesses), gilded);
  }
  // The leaves of a choice as the glance projects it: an opener's rows (each by what the glance found in it), else the
  // choice itself by the glance's witness for it, or for what is within it; its gold only where it carries the aim on
  // (gilded), as the four draw it.
  static of(g: Projected | undefined, c: Choice | undefined, id: string, gilded: boolean): Leaf[] {
    if (c?.children?.length && !c.command) {
      return Attending.all(c.children).filter(k => !k.children?.length).map(k => Fold.leaf(k, Attest.within(g, k)));
    }
    // An act the glance leads with that no row of the page's names (a talk, as the engine leads with it): what it is
    // led for inside, each by its own act, never the act's own reasons (I2).
    const inside = c ? undefined : [...g?.acts ?? [], ...Object.values(g?.lenses ?? {}).flatMap(l => l.promoted)]
      .find(a => a.choice === id && a.inside?.length)?.inside;
    if (inside) {
      return inside.map(x => Fold.leaf({ id: x.command, command: x.command }, [Attest.witness(g, x.command)]));
    }
    const w = Attest.witness(g, id) ?? Attest.within(g, c ?? { id, label: '' } as Choice)[0];
    return [Fold.leaf(c ?? { id }, [gilded ? w : Attest.less(w, 'undertaking')])];
  }
  // What the glance leads with here, each act by its leaves (an opener by its rows): the place's own mark. Less the
  // journeys across the country (local), as the way back from the map carries it (the owner's trust contracts, C:
  // "Put away the map" had been blank beside a place with something to do).
  static led(g: Projected | undefined, chosen: Chosen, local = false): Leaf[] {
    return (g?.acts ?? []).filter(a => !local || !a.choice.startsWith('travel:'))
      .flatMap(a => Fold.of(g, chosen(a.choice), a.choice, true));
  }
  // A leaf as it bears one aspect alone (the followed aim's step, whatever else is done there).
  private static only(l: Leaf, aspect: Aspect): Leaf {
    return { id: l.id, witnesses: l.witnesses.flatMap(w => Attest.only(w, aspect) ?? []) } as unknown as Leaf;
  }
  // Someone here, as the acts with them the glance leads with are borne (Likenesses): the followed aim's next step
  // alone where it is one of them; and a danger seen in them, the scene's, which no act bears.
  static likeness(g: Projected | undefined, who: string, chosen: Chosen): Leaf[] {
    const acts = (g?.acts ?? []).filter(a => a.subject === who), on = acts.filter(a => a.continues);
    if (on.length) {
      return on.flatMap(a => Fold.of(g, chosen(a.choice), a.choice, true)).map(l => Fold.only(l, 'undertaking'));
    }
    const threat = Attest.only(Attest.subject(g, who), 'danger');
    return [...threat ? [Fold.leaf({ id: `subject:${who}` }, [threat])] : [],
      ...acts.flatMap(a => Fold.of(g, chosen(a.choice), a.choice, false))];
  }
}
