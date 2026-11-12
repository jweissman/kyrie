import type { Campaign } from '../campaign/campaign';
import type { Operator } from '../lang/module';
import type { World } from '../lang/world';
import { ModuleWriter } from '../lang/module-writer';

// What could come of the acts offered now, a few decisions on (the forward-design record's third prototype): a bounded
// search over the company's own moves through hypothetical worlds (a World forks by what it changes, and nothing here
// is committed), each find kept with the chain of acts that reaches it, and said only where the company knows of it.
export interface Prospect {
  // The act offered now that begins it, every act of the chain in order, and the act it comes to.
  first: string; chain: string[]; gain: string;
  // What it comes to: a thing to take, where it lies.
  item: string; place: string;
  // Whether the company knows of it: it sees it, or a fact it holds leads to where it lies or names it.
  known: boolean;
}
export class Prospects {
  // What counts as coming to something, by the act's kind: a thing to be taken that cannot be taken now.
  static readonly gains = new Set(['take_item']);
  static of(campaign: Campaign, depth = 3, budget = 400): Prospect[] {
    const actor = campaign.playerActor!, start = campaign.world;
    const now = new Set(campaign.offered().filter(a => this.gains.has(a.schema ?? '')).map(a => a.id));
    const seen = new Set([start.key()]), found: Prospect[] = [];
    let frontier: { world: World; chain: Operator[] }[] = [{ world: start, chain: [] }], expanded = 0;
    for (let d = 0; d < depth && frontier.length && expanded < budget; d++) {
      const next: typeof frontier = [];
      for (const node of frontier) {
        for (const move of this.moves(campaign, node.world, actor)) {
          if (++expanded > budget) { break; }
          const chain = [...node.chain, move];
          if (this.gains.has(move.schema ?? '')) {
            if (!now.has(move.id) && node.chain.length) { found.push(this.prospect(campaign, chain, move)); }
            continue;
          }
          const world = this.step(campaign, node.world, move), key = world.key();
          if (!seen.has(key)) { seen.add(key); next.push({ world, chain }); }
        }
      }
      frontier = next;
    }
    return found;
  }
  // A move in a hypothetical world, and what the world's rules make of it at once: a rule that holds after the move and
  // did not before fires (a gate's opening, which is a rule's, not the act's), twice over at most. It is an
  // approximation of the campaign's tick (CampaignTick.answer): no clock, no creatures, no perceptions, and no rule
  // whose effects need a binding of its own; what it leaves out is the record's finding, not a contract.
  private static step(campaign: Campaign, world: World, move: Operator): World {
    const rules = (campaign.module.rules ?? []).filter(r => !JSON.stringify(r.effects).includes('"?'));
    let before = world, after = world.apply(move.success ?? []);
    for (let pass = 0; pass < 2; pass++) {
      const fired = rules.filter(r => after.test(r.when) && !before.test(r.when) && after.admits(r.effects));
      if (!fired.length) { break; }
      before = after;
      after = fired.reduce((w, r) => w.apply(r.effects), after);
    }
    return after;
  }
  // The company's own moves in a world, as the campaign's planner takes them: no fight or other resolution but the
  // taking of a thing, which is what is looked for.
  private static moves(campaign: Campaign, world: World, actor: string): Operator[] {
    return campaign.operators.applicable(world, actor).filter(a => !a.resolve || this.gains.has(a.schema ?? ''));
  }
  private static prospect(campaign: Campaign, chain: Operator[], gain: Operator): Prospect {
    const item = gain.bindings?.find ?? '', place = gain.bindings?.site ?? '', world = campaign.world;
    const actor = campaign.playerActor!, facts = world.related('knows', actor).map(r => r.args[1]!);
    const leads = world.relates('leadsTo') && world.related('leadsTo')
      .some(r => facts.includes(r.args[0]!) && (r.args[1] === place || r.args[1] === item));
    const seen = world.relates('noticed') && world.test(ModuleWriter.call('noticed', item, actor));
    return { first: chain[0]!.id, chain: chain.map(a => a.id), gain: gain.id, item, place, known: !!(leads || seen) };
  }
  // What the page may say of it: only what the company knows of (the record's knowledge-safety line).
  static told(campaign: Campaign, depth = 3): Prospect[] {
    return this.of(campaign, depth).filter(p => p.known);
  }
}
