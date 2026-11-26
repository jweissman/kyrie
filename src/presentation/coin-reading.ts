import type { Campaign } from '../campaign/campaign';
import type { Operator, Predicate, Value } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import type { PublicChoice } from './action-presentation';
import { PlayerView } from './player-view';
import { PlayerRevision } from './player-revision';

// A choice the company could make if it had the coin: a purchase, a toll, a hire, a bed. What it costs and what the
// company has.
export interface Short { choice: PublicChoice; action: Operator; cost: number; have: number }

// What the company cannot afford here, read as SkillReading reads what it lacks a skill for: the same legal commands
// grounded once in a world where the company has coin to spare, keeping those that open there and not here. Tessary's
// W21: Pounce's draft for six coin was never offered to a player with five, and nothing was said.
export class CoinReading {
  // The comparisons of the company's coin with a price in a requirement: quantity(actor, gold) >= price.
  private static prices(p: Predicate | undefined, out: { right: Value; actor: string }[] = []) {
    if (!p) { return out; }
    if (p.kind === 'compare' && ['>=', '>'].includes(p.operator) && p.left.kind === 'call'
      && p.left.name === 'quantity' && p.left.args[1] === 'gold') { out.push({ right: p.right, actor: p.left.args[0]! }); }
    if (p.kind === 'and' || p.kind === 'or') { this.prices(p.left, out); this.prices(p.right, out); }
    return out;
  }
  // Kept for the player's revision it was read in.
  static read(campaign: Campaign): Short[] {
    return PlayerRevision.of(campaign).reading('coin short', () => this.short(campaign));
  }
  private static short(campaign: Campaign): Short[] {
    const world = campaign.world, actor = campaign.playerActor;
    const priced = this.priced(campaign.module.actions);
    if (!actor || !priced.size || !world.module.measures.some(m => m.name === 'quantity')) { return []; }
    const have = world.number(ModuleWriter.call('quantity', actor, 'gold'));
    const rich = world.apply([{ kind: 'set', call: ModuleWriter.call('quantity', actor, 'gold'),
      value: { kind: 'number', value: have + 100000 } }]);
    const legal = new Set(campaign.offered().map(a => a.id));
    const opened = campaign.operators.applicable(rich, actor, priced).filter(op => !legal.has(op.id));
    // As the page would offer them: of what the company sees, named as it would name them (the architecture review's
    // A20: they bypassed what the page keeps from the company).
    const short = PlayerView.offer(campaign, opened).map(row => ({ ...row, have,
      cost: Math.max(0, ...this.prices(row.action.requires).filter(p => p.actor === actor)
        .map(p => world.number(p.right))) }));
    return short;
  }
  // The actions with a price, found once for a module's actions (again where they grow), not for every page.
  private static readonly pricing = new WeakMap<readonly Operator[], { length: number; priced: Set<string> }>();
  private static priced(actions: readonly Operator[]): Set<string> {
    const had = this.pricing.get(actions);
    if (had?.length === actions.length) { return had.priced; }
    const priced = new Set(actions.filter(a => this.prices(a.requires).length).map(a => a.id));
    this.pricing.set(actions, { length: actions.length, priced });
    return priced;
  }
  // Why it cannot be done: "It costs 6 coin, and you have 5."
  static why(s: Short): string { return `It costs ${s.cost} coin, and you have ${s.have}.`; }
}
