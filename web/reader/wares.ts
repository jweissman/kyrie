import type { Choice } from '../../src/ui/choice-list';
import type { Counter } from '../../src/ui/trade-model';
import { Attending } from '../../src/ui/attention';

// What someone has for sale, each thing with the choice that buys it: a seller's wares had been a run-on line above
// what could be said, and buying a list opened inside the replies (the owner's interim report; play 7). A thing with
// no choice to buy it is still shown, as what is on the counter.
export interface Ware { name: string; price: number; stock: number; kind: string; good?: true; buy?: Choice }
export class Wares {
  // Each thing on the counter with the choice that buys it, matched by what it is (the kind the choice is done with),
  // never by its words (the architecture review's P0); a choice that buys for each of the company in turn is one.
  static of(counter: Counter | undefined, replies: Choice[]): { wares: Ware[]; rest: Choice[] } {
    if (!counter?.sells.length) { return { wares: [], rest: replies }; }
    const kinds = new Set(counter.sells.map(g => g.kind));
    const containers = replies.filter(c => !c.does && !!c.children?.length
      && Attending.all(c.children).filter(k => !k.children?.length).every(Wares.buying));
    const candidates = [...containers.flatMap(c => c.children!), ...replies.filter(c => !containers.includes(c))];
    const wares = counter.sells.map(g => {
      const buy = candidates.find(c => Wares.bought(c, kinds) === g.kind);
      return { ...g, ...buy ? { buy } : {} };
    });
    const used = new Set(wares.flatMap(w => w.buy ? [w.buy.id] : []));
    return { wares, rest: replies.filter(c => !containers.includes(c) && !used.has(c.id)) };
  }
  // The kind a choice buys: its own, or that of each of its buys (one for each of the company).
  private static bought(c: Choice, kinds: Set<string>): string | undefined {
    if (Wares.buying(c)) { return Wares.kind(c, kinds); }
    const each = !c.does && !!c.children?.length && c.children.every(Wares.buying);
    return each ? Wares.kind(c.children![0]!, kinds) : undefined;
  }
  static buying(this: void, c: Choice): boolean { return c.does === 'buy_item' || c.does === 'buy_goods'; }
  private static kind(c: Choice, kinds: Set<string>): string | undefined { return c.targets?.find(t => kinds.has(t)); }
}
