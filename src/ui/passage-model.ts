import { ModuleWriter } from '../lang/module-writer';
import { KeptPredicates } from '../lang/kept-predicates';
import { ObservationText } from '../lang/observation-text';
import { ItemNames } from '../item-names';
import { LocalObservations } from '../campaign/local-observations';
import type { Entity, Predicate } from '../lang/module';
import type { World } from '../lang/world';

export type WayStatus = 'open' | 'blocked' | 'hazard' | 'guarded' | 'needs';
export interface WayInfo {
  passage: string; name: string; from: string; to: string; oneWay: boolean; status: WayStatus;
  reason?: string; via?: string;
}

// Reads first-class passages (connects/on/guards/needs/revealedBy) for the player's side of the world: which ways the
// company knows from a place, and what physically stands in each. Reasons are the obstacle's own current description.
export class PassageModel {
  constructor(private world: World, private actor: string, private entities: Map<string, Entity>) {}
  supported(): boolean { return this.world.module.relations.some(r => r.name === 'connects'); }
  private first(p: Predicate): Record<string, string> | undefined {
    const next = this.world.solve(p, {}).next();
    return next.done ? undefined : next.value;
  }
  private call(name: string, ...args: string[]): Predicate { return ModuleWriter.call(name, ...args); }
  // The parts joined, kept by what they ask of which way (see KeptPredicates).
  private all(asked: string, ...parts: Predicate[]): Predicate {
    return KeptPredicates.of(`passage:${asked}`, () => parts.reduce((left, right) => ({ kind: 'and', left, right })));
  }
  // What bars a way, in its own words for the state it is in: a thing's, or a person's (whose words also ask that
  // they are able), not another place's that only mentions it (the hall's dead, guarding the stair, were described by
  // the bailey's footprints in the mud).
  describe(id: string): string | undefined {
    const state = this.world.one('state', id), observations = this.world.module.observations ?? [];
    const o = observations.find(x => x.about === id && PassageModel.asks(x.when, id, state))
      ?? observations.find(x => !x.about && x.when.kind === 'call' && PassageModel.asks(x.when, id, state));
    return o ? ObservationText.render(o.text, this.world) : undefined;
  }
  // Whether a condition asks that something is in a state (alone, or with more besides).
  private static asks(p: Predicate, id: string, state?: string): boolean {
    return p.kind === 'call' ? p.name === 'state' && p.args[0] === id && p.args[1] === state
      : p.kind === 'and' && (this.asks(p.left, id, state) || this.asks(p.right, id, state));
  }
  label(id: string): string { return ObservationText.label(this.world, id); }
  // A clause the rules have where the world declares it: that it does not hold.
  private unless(name: string, ...args: string[]): Predicate[] {
    return this.world.declares(name) ? [{ kind: 'not', value: this.call(name, ...args) }] : [];
  }
  private shut(passage: string): string | undefined {
    const o = this.world.module.observations?.find(x => x.id === `${passage}__shut`);
    return o ? ObservationText.render(o.text, this.world) : undefined;
  }
  visible(passage: string): boolean { return this.world.test(this.call('visibleTo', passage, this.actor)); }
  // The ways from a place, read once for each world and company (a world does not change; another is built for each
  // state): the page, its chart, its itineraries and the road ahead each ask of them, the chart and the itineraries of
  // every place the company knows. Asked afresh each time, they were three quarters of every turn in A Parliament
  // of Books, whose city has eighty rooms. For reading only.
  private static readonly read = new WeakMap<World, Map<string, readonly WayInfo[]>>();
  ways(from: string): readonly WayInfo[] {
    if (!this.supported()) { return []; }
    let kept = PassageModel.read.get(this.world);
    if (!kept) { kept = new Map(); PassageModel.read.set(this.world, kept); }
    const key = `${this.actor}\u0000${from}`;
    let ways = kept.get(key);
    if (!ways) {
      ways = this.world.relatedTo('connects', from).filter(r => this.visible(r.args[0]!))
        .map(r => this.way(r.args[0]!, from, r.args[2]!));
      kept.set(key, ways);
    }
    return ways;
  }
  private way(passage: string, from: string, to: string): WayInfo {
    const base = { passage, name: this.entities.get(passage)?.name ?? passage, from, to,
      oneWay: !this.world.test(this.call('connects', passage, to, from)) };
    // As the rules have it for this company (barredFor, watchedAgainst): what bars a way is no bar to whoever holds
    // its key, nor a guard to one it is allied with or tolerates, and a hazard not noticed is not named (the
    // architecture review's H5: a keyholder's way was told barred beside a Go across it).
    const blocker = this.first(this.all(`blocker:${passage}:${this.actor}`, this.call('on', '?t', passage),
      this.call('state', '?t', '?s'), this.call('blocksWhen', '?t', '?s'), ...this.unless('opens', this.actor, '?t')));
    // In the pitch dark what bars a way is felt or heard, not seen as it looks (A Winter in Carth's friction 11).
    const dark = this.world.declares('benighted') && this.world.test(this.call('benighted', this.actor));
    if (blocker) {
      const t = blocker['?t']!;
      return { ...base, status: 'blocked', via: this.label(t),
        reason: (dark ? undefined : this.describe(t)) ?? `${this.label(t)} is in the way.` };
    }
    if (this.world.test(this.call('unopened', passage))) {
      return { ...base, status: 'blocked', via: base.name, reason: this.shut(passage) ?? `${this.label(passage)} does not open now.` };
    }
    const guard = this.first(this.all(`guard:${passage}:${this.actor}`, this.call('guards', '?g', passage),
      this.call('able', '?g'), this.call('state', '?g', '?s'), this.call('blocksWhen', '?g', '?s'),
      this.call('at', '?g', '?p'), this.call('connects', passage, '?p', '?q'), ...this.unless('allied', '?g', this.actor),
      ...this.unless('tolerates', '?g', this.actor)));
    if (guard) {
      const g = guard['?g']!;
      return { ...base, status: 'guarded', via: this.label(g), reason: dark
        ? `In the dark you can hear ${this.label(g)} there.` : this.describe(g) ?? `${this.label(g)} bars the way.` };
    }
    const hazard = this.first(this.all(`hazard:${passage}`, this.call('on', '?h', passage), this.call('state', '?h', '?s'),
      this.call('harmsWhen', '?h', '?s')));
    if (hazard && LocalObservations.noticed(this.world, hazard['?h']!, this.actor)) {
      const h = hazard['?h']!;
      return { ...base, status: 'hazard', via: this.label(h), reason: this.describe(h) ?? `${this.label(h)} is dangerous.` };
    }
    // A way that needs something is open to a company with any one of what it needs (climbing, or a rope).
    const needs = this.world.related('needs').filter(r => r.args[0] === passage).map(r => r.args[1]!);
    if (needs.length && !needs.some(k => this.world.test(this.call('meets', this.actor, k)))) {
      // A skill by its name (climbing); a kind of thing as one of it (a coil of rope).
      const named = needs.map(k => this.entities.get(k)?.type === 'capability' ? this.label(k).toLowerCase()
        : ItemNames.called(this.label(k)));
      return { ...base, status: 'needs', via: this.label(needs[0]!), reason: `You would need ${named.join(' or ')}.` };
    }
    return { ...base, status: 'open' };
  }
}
