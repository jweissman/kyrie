import type { Campaign } from '../campaign/campaign';
import type { Operator, Predicate } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { EntityIndex } from '../lang/entity-index';
import type { PublicChoice } from './action-presentation';
import { PlayerView } from './player-view';
import { PlayerRevision } from './player-revision';

// A service someone will not give the company: a bed, a cure, goods. What it is, and who refuses.
export interface Refused { choice: PublicChoice; action: Operator; host: string }

// What is refused the company here, read as CoinReading reads what it cannot afford: the same legal commands grounded
// once in a world where no one refuses it, keeping those that open there and not here. A refused service had simply
// gone from the page, and nothing said why (the Book of Faces' gate 4, BOF-15; Skeel's Mother Jago).
export class RefusalReading {
  // Who a requirement says must not be refusing: not refusesService(host, actor).
  private static hosts(p: Predicate | undefined, out: string[] = []): string[] {
    if (!p) { return out; }
    if (p.kind === 'not' && p.value.kind === 'call' && p.value.name === 'refusesService') { out.push(p.value.args[0]!); }
    if (p.kind === 'and' || p.kind === 'or') { this.hosts(p.left, out); this.hosts(p.right, out); }
    return out;
  }
  // The actions someone may refuse, found once for a module's actions (again where they grow), not for every page.
  private static readonly gating = new WeakMap<readonly Operator[], { length: number; gated: Set<string> }>();
  private static gated(actions: readonly Operator[]): Set<string> {
    const had = this.gating.get(actions);
    if (had?.length === actions.length) { return had.gated; }
    const gated = new Set(actions.filter(a => this.hosts(a.requires).length).map(a => a.id));
    this.gating.set(actions, { length: actions.length, gated });
    return gated;
  }
  // Kept for the player's revision it was read in.
  static read(campaign: Campaign): Refused[] {
    return PlayerRevision.of(campaign).reading('refused', () => this.refused(campaign));
  }
  private static refused(campaign: Campaign): Refused[] {
    const world = campaign.world, actor = campaign.playerActor;
    const refusals = actor ? world.related('refusesService').filter(r => r.args[1] === actor) : [];
    const gated = this.gated(campaign.module.actions);
    if (!actor || !refusals.length || !gated.size) { return []; }
    const served = world.apply(refusals.map(r => ({ kind: 'retract' as const,
      call: ModuleWriter.call('refusesService', ...r.args) })));
    const legal = new Set(campaign.offered().map(a => a.id)), refusing = new Set(refusals.map(r => r.args[0]!));
    const opened = campaign.operators.applicable(served, actor, gated).filter(op => !legal.has(op.id));
    // As the page would offer them, each with the one who refuses it.
    const refused = PlayerView.offer(campaign, opened).flatMap(row => {
      const host = this.hosts(row.action.requires).find(h => refusing.has(h));
      return host ? [{ ...row, host }] : [];
    });
    return refused;
  }
  // Why it cannot be had: "Mother Jago will not serve you."
  static why(campaign: Campaign, r: Refused): string {
    // By the name they go by, not with what they are ("Joan", not "Joan, the landlady of the Bell").
    const name = (EntityIndex.of(campaign.module.entities).byId.get(r.host)?.name ?? r.host).split(', ')[0]!;
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} will not serve you.`;
  }
}
