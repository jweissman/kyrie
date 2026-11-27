import type { Frame } from '../../src/creation/protocol';
import { MenuModel, type View } from '../../src/frame/menu-model';

// A fight's frame sent again with only its standing reckoned (OR-1351: DangerSense.later): the same turn, the same
// actor, the same exchanges told. It is no new moment, so the keyboard's place is kept: the row the cursor was on, by
// its id, in the frame as it now is; the first row only where that row is gone (a keyboard player had lost their place
// every blow).
export class FightRefresh {
  static is(was: Frame | undefined, now: Frame): boolean {
    const a = was?.combat, b = now.combat;
    return !!a && !!b && a.round === b.round && a.actor === b.actor && a.ours === b.ours && !a.outcome && !b.outcome
      && a.exchanges.length === b.exchanges.length;
  }
  // The cursor on the same row by its id where the row stands still; else the first.
  static cursor(was: Frame, now: Frame, keys: { cursor: number; view: View; open: string[] }): number {
    const { cursor, view, open } = keys;
    const id = MenuModel.build(was, view, open).choices[cursor]?.id;
    const at = id === undefined ? -1 : MenuModel.build(now, view, open).choices.findIndex(c => c.id === id);
    return Math.max(0, at);
  }
}
