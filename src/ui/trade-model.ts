import type { World } from '../lang/world';

// One merchant's side of the counter, as the world has it: what they sell (goods by the measure, and things laid
// out for sale), at what price and how many are left, what kinds of thing they buy and for how much, and their coin.
export interface Counter {
  id: string; name: string;
  // Each thing sold: its kind (a good's id, or an item's kind) and whether it is a good sold by the measure.
  sells: { name: string; price: number; stock: number; kind: string; good?: true }[];
  buys: { name: string; price: number }[];
  coin: number;
  // What the company carries that they would buy, by the sale's own terms, but have not the coin for now: said, not
  // left out (round 6: a dead man's box, a string of rings and thieves' tools dropped off a trader's list after four
  // sales, still in the pack, and nothing said why).
  short?: { name: string; pays: number }[];
}

// Read by the world's own indexes, never by copying it (the screen had copied every fact the world held for each room
// of a town, to find who sold what: two thirds of every command's half second, the owner's 5 November latency).
export class TradeModel {
  static at(world: World, here: string, names: Map<string, string>): Counter[] {
    const present = new Set(world.relatedTo('at', here).map(r => r.args[0]!));
    if (!present.size) { return []; }
    const merchants = [...new Set([
      ...world.related('sells').filter(r => present.has(r.args[0]!)).map(r => r.args[0]!),
      ...world.related('soldBy').filter(r => present.has(r.args[1]!)).map(r => r.args[1]!),
      ...world.measured('pays').filter(m => m.value > 0 && present.has(m.call.args[0]!)).map(m => m.call.args[0]!),
    ])];
    return merchants.map(id => this.counter(world, id, names)).filter(c => c.sells.length || c.buys.length);
  }
  private static counter(world: World, id: string, names: Map<string, string>): Counter {
    const goods = world.related('sells', id).map(r => r.args[1]!)
      .map(g => ({ name: this.name(g, names), price: this.value(world, 'goodsPrice', id, g),
        stock: this.value(world, 'quantity', id, g), kind: g, good: true as const }));
    const laid = world.relatedTo('soldBy', id).map(r => r.args[0]!).filter(i => world.related('forSale', i).length > 0);
    const kinds = [...new Set(laid.map(i => this.kind(world, i)))];
    const things = kinds.map(k => {
      const of = laid.filter(i => this.kind(world, i) === k);
      return { name: this.name(k, names), price: this.value(world, 'price', of[0]!), stock: of.length, kind: k };
    });
    const buys = world.measured('pays').filter(m => m.call.args[0] === id && m.value > 0)
      .map(m => ({ name: this.name(m.call.args[1]!, names), price: m.value })).sort((a, b) => b.price - a.price);
    const coin = this.value(world, 'quantity', id, 'gold'), short = this.short(world, id, coin, names);
    return { id, name: this.name(id, names), sells: [...goods, ...things], buys, coin,
      ...short.length ? { short } : {} };
  }
  // The company's things a dealer would take (sell_valuable, sell_ware: in valuables, or of their trade; not one they
  // pay for already) but cannot pay for with what they have.
  private static short(world: World, id: string, coin: number,
    names: Map<string, string>): { name: string; pays: number }[] {
    if (!world.relates('ownedItem') || !world.relates('memberOf')) { return []; }
    const ours = new Set(world.related('memberOf').filter(r => r.args[1] === 'party').map(r => r.args[0]!));
    const trades = new Set(world.relates('dealsIn') ? world.related('dealsIn', id).map(r => r.args[1]!) : []);
    const valuables = world.relates('buysValuables') && world.related('buysValuables', id).length > 0;
    return world.related('ownedItem').filter(r => ours.has(r.args[1]!)).map(r => r.args[0]!).flatMap(item => {
      const form = this.kind(world, item), pays = this.value(world, 'dealerPays', form);
      const valuable = world.relates('valuable') && world.related('valuable', form).length > 0;
      const takes = valuable ? valuables
        : world.relates('tradeOf') && world.related('tradeOf', form).some(t => trades.has(t.args[1]!));
      return takes && pays >= 1 && coin < pays && this.value(world, 'pays', id, form) < 1
        ? [{ name: this.name(item, names), pays }] : [];
    });
  }
  private static kind(world: World, item: string): string {
    return world.one('itemKind', item) ?? item;
  }
  private static value(world: World, name: string, ...args: string[]): number {
    return world.measured(name).find(m => m.call.args.every((a, i) => a === args[i]))?.value ?? 0;
  }
  private static name(id: string, names: Map<string, string>): string {
    const name = names.get(id) ?? id.replace(/^.*__/, '').replace(/_/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
