import { describe, expect, it } from 'bun:test';
import trade from '../data/generation/tables/trade.json';

// No trade buys a kind for more than it sells it for: the herb-wife sold an antidote for three and bought it back for
// five, coin for nothing over and over (round 7). What a trade buys back of its own wares is half their worth, by the
// rule of its trade (sell_ware), not a price of its own.
describe('the trades\' prices', () => {
  it('never pay more for a kind than the same trade asks for it', () => {
    type Trade = { stock?: [string, number, number][]; buys?: [string, number][] };
    const types = trade.merchantType.groups as unknown as Record<string, Trade>;
    const dear = Object.entries(types).flatMap(([name, t]) => {
      const asks = new Map((t.stock ?? []).map(([kind, price]) => [kind, price]));
      return (t.buys ?? []).filter(([kind, pays]) => asks.has(kind) && pays >= asks.get(kind)!)
        .map(([kind, pays]) => `${name}: ${kind} sold at ${asks.get(kind)}, bought at ${pays}`);
    });
    expect(dear).toEqual([]);
  });
});
