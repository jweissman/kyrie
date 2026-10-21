import type { World } from '../lang/world';
import type { WorldState } from '../lang/module';

// One merchant's side of the counter, as the world has it: what they sell (goods by the measure, and things laid
// out for sale), at what price and how many are left, what kinds of thing they buy and for how much, and their coin.
export interface Counter {
  id: string; name: string;
  sells: { name: string; price: number; stock: number }[];
  buys: { name: string; price: number }[];
  coin: number;
}

export class TradeModel {
  static at(world: World, here: string, names: Map<string, string>): Counter[] {
    const state = world.snapshot, { relations, measures } = state;
    const present = new Set(relations.filter(r => r.name === 'at' && r.args[1] === here).map(r => r.args[0]!));
    const merchants = [...new Set([
      ...relations.filter(r => r.name === 'sells' && present.has(r.args[0]!)).map(r => r.args[0]!),
      ...relations.filter(r => r.name === 'soldBy' && present.has(r.args[1]!)).map(r => r.args[1]!),
      ...measures.filter(m => m.call.name === 'pays' && m.value > 0 && present.has(m.call.args[0]!)).map(m => m.call.args[0]!),
    ])];
    return merchants.map(id => this.counter(state, id, names)).filter(c => c.sells.length || c.buys.length);
  }
  private static counter(state: WorldState, id: string, names: Map<string, string>): Counter {
    const { relations, measures } = state;
    const goods = relations.filter(r => r.name === 'sells' && r.args[0] === id).map(r => r.args[1]!)
      .map(g => ({ name: this.name(g, names), price: this.value(state, 'goodsPrice', id, g),
        stock: this.value(state, 'quantity', id, g) }));
    const laid = relations.filter(r => r.name === 'soldBy' && r.args[1] === id
      && relations.some(f => f.name === 'forSale' && f.args[0] === r.args[0])).map(r => r.args[0]!);
    const kinds = [...new Set(laid.map(i => this.kind(state, i)))];
    const things = kinds.map(k => {
      const of = laid.filter(i => this.kind(state, i) === k);
      return { name: this.name(k, names), price: this.value(state, 'price', of[0]!), stock: of.length };
    });
    const buys = measures.filter(m => m.call.name === 'pays' && m.call.args[0] === id && m.value > 0)
      .map(m => ({ name: this.name(m.call.args[1]!, names), price: m.value })).sort((a, b) => b.price - a.price);
    return { id, name: this.name(id, names), sells: [...goods, ...things], buys, coin: this.value(state, 'quantity', id, 'gold') };
  }
  private static kind(state: WorldState, item: string): string {
    return state.relations.find(r => r.name === 'itemKind' && r.args[0] === item)?.args[1] ?? item;
  }
  private static value(state: WorldState, name: string, ...args: string[]): number {
    return state.measures.find(m => m.call.name === name && m.call.args.every((a, i) => a === args[i]))?.value ?? 0;
  }
  private static name(id: string, names: Map<string, string>): string {
    const name = names.get(id) ?? id.replace(/^.*__/, '').replace(/_/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
