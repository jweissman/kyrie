import type { Campaign } from '../campaign/campaign';
import type { Module, Objective, WorldRule } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { KnownWays } from '../ui/known-ways';

// Where what the aim followed waits on comes true by the company standing somewhere (CL-65: the barrow's crown, held,
// is "brought up" by a rule that wants only the company in daylight with it: Rule _brought when at(party, ?p) and not
// unlit(?p) and not dark() and ownedItem(_heart, ?m)). No other lead reads such a place, so the hall with the crown in
// hand had said the barrow was still to be explored. The step is the nearest place the company knows the way to where
// such a rule would hold, the company moved there, as AimLeads.reckoned asks of an act; here, where only the night
// stands in its way, the step is to wait for the day.
export class AimPlaced {
  private static readonly ruled = new WeakMap<Module, Map<string, WorldRule[]>>();
  // The rules that make so what the aim reads, and want the company standing somewhere.
  static rules(module: Module, def: Objective, actor: string): WorldRule[] {
    const kept = this.ruled.get(module) ?? this.ruled.set(module, new Map()).get(module)!;
    if (kept.has(def.id)) { return kept.get(def.id)!; }
    const reads = new Set<string>();
    ModuleWriter.conditionCalls(def.when, c => { reads.add(c.name); return c; });
    // Only an author's own relation (installed, so named <module>__…): the shared rules' (been, where anyone has
    // stood) are true wherever the company goes, and had led the survey of a hold out of it.
    const found = (module.rules ?? []).filter(r => r.effects.some(e => e.kind === 'assert' && reads.has(e.call.name)
      && e.call.name.includes('__')) && this.stands(r, actor));
    kept.set(def.id, found);
    return found;
  }
  private static stands(r: WorldRule, actor: string): boolean {
    let placed = false;
    ModuleWriter.conditionCalls(r.when, c => {
      placed ||= c.name === 'at' && [actor, 'party'].includes(c.args[0]!) && c.args[1]!.startsWith('?');
      return c;
    });
    return placed;
  }
  // The place, or here (to be waited at, for the day), or none: where no such rule is, or none would hold anywhere.
  static of(campaign: Campaign, def: Objective): { place: string; day: boolean } | undefined {
    const actor = campaign.playerActor ?? 'party', w = campaign.world, here = w.one('at', actor);
    const rules = this.rules(campaign.module, def, actor);
    if (!here || !rules.length) { return undefined; }
    const at = { rules, actor, here };
    // Holding here already, it is come true, and nothing is to be gone to.
    if (this.holds(campaign, at, here, false)) { return undefined; }
    for (const day of w.test(ModuleWriter.call('dark')) ? [false, true] : [false]) {
      if (this.holds(campaign, at, here, day)) { return { place: here, day }; }
      const way = KnownWays.way(campaign, here, id => this.holds(campaign, at, id, day), { barred: true });
      const to = way?.legs.at(-1)?.to;
      if (to) { return { place: to, day }; }
    }
    return undefined;
  }
  // Whether one of the rules would hold, the company moved to a place (and, for the day, the night lifted).
  private static holds(campaign: Campaign, at: { rules: WorldRule[]; actor: string; here: string }, place: string,
    day: boolean): boolean {
    const moved = campaign.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', at.actor, at.here) },
      { kind: 'assert', call: ModuleWriter.call('at', at.actor, place) },
      ...day ? [{ kind: 'retract' as const, call: ModuleWriter.call('dark') }] : []]);
    return at.rules.some(r => moved.test(r.when));
  }
}
