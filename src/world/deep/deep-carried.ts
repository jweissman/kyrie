import table from '../../../data/generation/deep/hoards.json';
import treasure from '../../../data/generation/tables/treasure.json';
import type { DeepPurpose } from './deep-purposes';
import { DeepRooms } from './deep-rooms';
import { Stones } from './stones';

// What a band of newcomers to a deep site carries (OR-1622: newcomers moving into emptied rooms had brought nothing to
// take), rolled on Deem's `carried` template by what kind of thing they are and how deep their level is
// (data/generation/templates/treasure.json): how many things, of which of Orsino's treasure tiers, and how much coin.
// Each thing is Orsino's loot of that tier (a stone, a stone of its own: Stones). It waits with them beyond the
// workings, and is set down where they fall, in whichever room they had moved into: there to be taken only once they
// are beaten. Drawn by the band's own key, so that what else the site holds is as it was.
export interface Carried { things: number; tier: string; coin: number }
export class DeepCarried {
  static readonly q = JSON.stringify;
  static readonly kinds = new Set(Object.keys(treasure.carriedThings.groups));
  // The depths the template's tiers are written for; deeper is as the deepest.
  static readonly deepest = Object.keys(treasure.carriedTier.groups).length - 1;
  static readonly pairs = table.carried as [string, string][];
  static roll(key: string, kind: string, depth: number): Carried {
    const known = this.kinds.has(kind) ? kind : 'any';
    return Stones.carried(key, { kind: known, depth, deep: `d${Math.min(depth, this.deepest)}` }) as unknown as Carried;
  }
  static lines(at: { id: string; beyond: string; purpose: DeepPurpose; key: string; kind: string; depth: number;
    said?: string }): string[] {
    const { id, beyond, key } = at, roll = this.roll(key, at.kind, at.depth), q = this.q, lines: string[] = [];
    const things: string[] = [];
    for (let n = 0; n < roll.things; n++) {
      const kind = Stones.loot(roll.tier, `${key}:${n}`), item = `${id}_carried${n}`;
      if (!kind) { continue; }
      if (Stones.kinds.has(kind)) {
        const g = Stones.drawn(`${key}:${n}`, kind);
        lines.push(`  Kind ${g.kind} ${q(g.name)} like ${g.type} worth ${g.worth} described ${q(g.text)}.`,
          `  Item ${item} ${q(g.name)} is ${g.kind} at ${beyond}.`);
      } else { lines.push(`  Item ${item} ${q(DeepRooms.called(kind, at.purpose))} is ${kind} at ${beyond}.`); }
      things.push(item);
    }
    if (roll.coin > 0) {
      lines.push(...DeepRooms.coins(beyond, roll.coin, { id: `${id}_coins`, key, pairs: this.pairs }));
      things.push(`${id}_coins`);
    }
    return things.length ? [...lines, ...this.dropped(at, things)] : lines;
  }
  static readonly said = 'What they had brought down with them lies where they fell.';
  // Set down where they fall, in whichever room they had moved into.
  private static dropped(at: { id: string; beyond: string; said?: string }, things: string[]): string[] {
    const { id, beyond } = at, moved = things.map(x => `Retract at(${x}, ${beyond}). Assert at(${x}, ?r).`).join(' ');
    return [`  Relation ${id}_dropped().`,
      `  Rule ${id}_drops when dead(${id}) and at(${id}, ?r) and distinct(?r, ${beyond}) and not ${id}_dropped()`
        + ` says ${this.q(at.said ?? this.said)} { Assert ${id}_dropped(). ${moved} }`];
  }
}
