import type { Campaign } from '../../src/campaign/campaign';
import { ModuleWriter } from '../../src/lang/index';
import type { Reading } from './measures';
import type { Trip } from './expeditions';

// The economy's ladder (OR-1124, OR-1125; the owner, 26 November: "an economy that can only support 200 gold in
// purchases is not a serious adventuring economy"): the reference town's wares in rungs, and the expeditions the
// five-expedition player (scripts/quantity/expeditions.ts, the gold-follower's first descent and the delver's policy
// after it) needs to afford each.
// - A rung is a span of prices: what a start's purse buys (to 25), the first rung (26 to 250), the second (251 to
//   1,500), the long haul (above it). OR-1124's acceptance is the first rung opened after one or two expeditions, the
//   second after three to six, and none bought out by one.
// - Expeditions to a price: the first return whose purse holds it; past the last return, the purse's mean gain an
//   expedition carried on (a purse that gains nothing never affords it: `never`).
// - The company buys nothing dear on the way (the policy's purchases are a light, a ration, a firebomb and a pallet),
//   so its purse at each return is what it has saved.
// Where it is read over several lives, each one's purses (each) beside the median the rungs are read from.
export interface Ladder { start: number; wares: [string, number][]; coin: number[]; each?: Record<string, number[]> }
export interface Rung { n: number; name: string; floor: number; ceiling: number }
export class QuantityLadder {
  static readonly rungs: Rung[] = [{ n: 0, name: 'the start', floor: 0, ceiling: 25 },
    { n: 1, name: 'the first rung', floor: 26, ceiling: 250 },
    { n: 2, name: 'the second rung', floor: 251, ceiling: 1500 },
    { n: 3, name: 'the long haul', floor: 1501, ceiling: Infinity }];
  // Expeditions read as never: no ware there, or a purse that does not grow.
  static readonly never = 99;
  // The reference town's wares (each sold by one of its people), by kind at its price, cheapest first.
  static wares(c: Campaign, town = 'region__s1_'): [string, number][] {
    const w = c.world, seen = new Map<string, number>();
    for (const r of w.related('soldBy')) {
      const [item, by] = r.args as [string, string];
      if (!by.startsWith(town) || !w.test(ModuleWriter.call('forSale', item))) { continue; }
      const kind = w.one('itemKind', item) ?? item, price = w.number(ModuleWriter.call('price', item));
      if (price > 0) { seen.set(kind, Math.max(seen.get(kind) ?? 0, price)); }
    }
    return [...seen].sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1));
  }
  static of(start: number, wares: [string, number][], trips: Trip[]): Ladder {
    return { start, wares, coin: trips.map(t => t.coin) };
  }
  // The ladder over several lives (OR-1622): the purse at each return the median of theirs, a life that fell keeping
  // what it last came home with. One life's five expeditions are a lottery: s0's purse after five went 309, 15, 851
  // and 403 under changes each of which moved one act of its first expedition.
  static median(lives: Record<string, Ladder>): Ladder {
    const all = Object.values(lives), first = all[0]!, n = Math.max(...all.map(l => l.coin.length));
    const coin = Array.from({ length: n }, (_, i) => this.mid(all.map(l => l.coin[Math.min(i, l.coin.length - 1)]
      ?? l.start)));
    return { start: first.start, wares: first.wares, coin,
      each: Object.fromEntries(Object.entries(lives).map(([seed, l]) => [seed, l.coin])) };
  }
  static mid(xs: number[]): number {
    const s = [...xs].sort((a, b) => a - b), h = Math.floor(s.length / 2);
    return s.length % 2 ? s[h]! : Math.round((s[h - 1]! + s[h]!) / 2);
  }
  static on(l: Ladder, rung: Rung): [string, number][] {
    return l.wares.filter(([, p]) => p >= rung.floor && p <= rung.ceiling);
  }
  // Expeditions until the purse holds a price.
  static expeditions(l: Ladder, price: number): number {
    if (price <= l.start) { return 0; }
    const at = l.coin.findIndex(c => c >= price);
    if (at >= 0) { return at + 1; }
    const last = l.coin.at(-1) ?? l.start, gain = l.coin.length ? (last - l.start) / l.coin.length : 0;
    return gain > 0 ? Math.min(this.never, l.coin.length + Math.ceil((price - last) / gain)) : this.never;
  }
  // Expeditions to a rung's first ware, which opens it and is held by the rung's band; its dearest said beside it (a
  // rung's top held to the band that opens it would ask the rung bought out as soon as it opened: OR-1520).
  static rung(l: Ladder | undefined, n: number): Reading {
    if (!l) { return { value: null, note: 'not read' }; }
    const rung = this.rungs[n]!, on = this.on(l, rung);
    if (!on.length) { return { value: this.never, note: `no ware on ${rung.name}` }; }
    const [first, dearest] = [on[0]!, on.at(-1)!], opened = this.expeditions(l, first[1]);
    return { value: opened, note: `${on.length} wares, ${first[0]} ${first[1]} after ${opened}, `
      + `${dearest[0]} ${dearest[1]} after ${this.expeditions(l, dearest[1])}; purse ${l.start} then ${l.coin.join(', ')}`
      + this.lives(l) };
  }
  // What the fifth expedition brought home, and its share of the best one's (OR-1622: the dungeon had been spent by the
  // fourth, and the fifth brought 24).
  static fifth(l: Ladder | undefined): Reading {
    if (!l || l.coin.length < 5) { return { value: null, note: l ? `${l.coin.length} expeditions` : 'not read' }; }
    const purses = [l.start, ...l.coin], takes = purses.slice(1).map((c, i) => c - purses[i]!);
    const best = Math.max(...takes), fifth = takes[4]!;
    return { value: fifth, note: `takes ${takes.join(', ')}; the fifth ${best > 0 ? Math.round((100 * fifth) / best) : 0}% `
      + `of the best${this.lives(l)}` };
  }
  // Each life's purses, where the ladder is read over several.
  private static lives(l: Ladder): string {
    return l.each ? `; ${Object.entries(l.each).map(([seed, c]) => `${seed} ${c.join(', ')}`).join('; ')}` : '';
  }
  // The rungs with a ware on them, of the four.
  static rungsHeld(l: Ladder | undefined): Reading {
    if (!l) { return { value: null, note: 'not read' }; }
    const held = this.rungs.filter(r => this.on(l, r).length);
    return { value: held.length, note: this.rungs.map(r => `${r.name} ${this.on(l, r).length}`).join(', ') };
  }
  // The most one expedition brought home, against the shelf of each rung above the start (%): no rung is bought out
  // by one expedition.
  static bought(l: Ladder | undefined): Reading {
    if (!l) { return { value: null, note: 'not read' }; }
    const purses = [l.start, ...l.coin], take = Math.max(0, ...purses.slice(1).map((c, i) => c - purses[i]!));
    const shelves = this.rungs.slice(1).map(r => ({ r, worth: this.on(l, r).reduce((t, [, p]) => t + p, 0) }))
      .filter(x => x.worth > 0);
    const pct = shelves.map(x => Math.round((100 * take) / x.worth));
    return { value: pct.length ? Math.max(...pct) : null, note: `best take ${take}; ${shelves.map((x, i) =>
      `${x.r.name} ${x.worth} (${pct[i]}%)`).join(', ')}` };
  }
}
