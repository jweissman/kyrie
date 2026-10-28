import type { Choice } from '../../src/ui/choice-list';
import type { Counter } from '../../src/ui/trade-model';

// What someone has for sale, each thing with the choice that buys it: a seller's wares had been a run-on line above
// what could be said, and buying a list opened inside the replies (the owner's interim report; play 7). A thing with
// no choice to buy it is still shown, as what is on the counter.
export interface Ware { name: string; price: number; stock: number; buy?: Choice }
export class Wares {
  static of(counter: Counter | undefined, replies: Choice[]): { wares: Ware[]; rest: Choice[] } {
    if (!counter?.sells.length) { return { wares: [], rest: replies }; }
    const group = replies.find(c => c.label === 'Buy' && c.children?.length);
    const buys = [...group?.children ?? [], ...replies.filter(c => /^Buy /.test(c.label) && !c.children?.length)];
    const wares = counter.sells.map(g => {
      const buy = buys.find(c => this.named(c.label) === this.named(g.name));
      return { ...g, ...buy ? { buy } : {} };
    });
    const used = new Set(wares.flatMap(w => w.buy ? [w.buy.id] : []));
    return { wares, rest: replies.filter(c => c !== group && !used.has(c.id)) };
  }
  // A thing's name as a buy choice says it and as the counter does: "Buy a torch", "A torch", "Torch".
  private static named(label: string): string {
    return label.replace(/^Buy /, '').replace(/^(a|an|the|some) /i, '').replace(/ — .*$/, '').toLowerCase().trim();
  }
}
