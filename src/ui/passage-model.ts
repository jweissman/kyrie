import { ModuleWriter } from '../lang/module-writer';
import { KeptPredicates } from '../lang/kept-predicates';
import { ObservationText } from '../lang/observation-text';
import { ItemNames } from '../item-names';
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
  describe(id: string): string | undefined {
    const state = this.world.one('state', id);
    const o = this.world.module.observations?.find(x => x.when.kind === 'call' && x.when.name === 'state'
      && x.when.args[0] === id && x.when.args[1] === state);
    return o ? ObservationText.render(o.text, this.world) : undefined;
  }
  label(id: string): string { return ObservationText.label(this.world, id); }
  private shut(passage: string): string | undefined {
    const o = this.world.module.observations?.find(x => x.id === `${passage}__shut`);
    return o ? ObservationText.render(o.text, this.world) : undefined;
  }
  visible(passage: string): boolean { return this.world.test(this.call('visibleTo', passage, this.actor)); }
  ways(from: string): WayInfo[] {
    if (!this.supported()) { return []; }
    return this.world.related('connects').filter(r => r.args[1] === from && this.visible(r.args[0]!))
      .map(r => this.way(r.args[0]!, from, r.args[2]!));
  }
  private way(passage: string, from: string, to: string): WayInfo {
    const base = { passage, name: this.entities.get(passage)?.name ?? passage, from, to,
      oneWay: !this.world.test(this.call('connects', passage, to, from)) };
    const blocker = this.first(this.all(`blocker:${passage}`, this.call('on', '?t', passage), this.call('state', '?t', '?s'),
      this.call('blocksWhen', '?t', '?s')));
    if (blocker) {
      const t = blocker['?t']!;
      return { ...base, status: 'blocked', via: this.label(t), reason: this.describe(t) ?? `${this.label(t)} is in the way.` };
    }
    if (this.world.test(this.call('unopened', passage))) {
      return { ...base, status: 'blocked', via: base.name, reason: this.shut(passage) ?? `${this.label(passage)} does not open now.` };
    }
    const guard = this.first(this.all(`guard:${passage}`, this.call('guards', '?g', passage), this.call('able', '?g'),
      this.call('state', '?g', '?s'), this.call('blocksWhen', '?g', '?s')));
    if (guard) {
      const g = guard['?g']!;
      return { ...base, status: 'guarded', via: this.label(g), reason: this.describe(g) ?? `${this.label(g)} bars the way.` };
    }
    const hazard = this.first(this.all(`hazard:${passage}`, this.call('on', '?h', passage), this.call('state', '?h', '?s'),
      this.call('harmsWhen', '?h', '?s')));
    if (hazard) {
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
