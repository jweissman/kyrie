import type { World } from '../lang/world';

// One merchant's side of the counter, as the world has it: what they sell (goods by the measure, and things laid
// out for sale), at what price and how many are left, what kinds of thing they buy and for how much, and their coin.
export interface Counter {
  id: string; name: string;
  // Each thing sold: its kind (a good's id, or an item's kind) and whether it is a good sold by the measure.
  sells: { name: string; price: number; stock: number; kind: string; good?: true }[];
  buys: { name: string; price: number }[];
  coin: number;
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
    return { id, name: this.name(id, names), sells: [...goods, ...things], buys, coin: this.value(world, 'quantity', id, 'gold') };
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
