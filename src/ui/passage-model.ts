import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
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
  private all(...parts: Predicate[]): Predicate {
    return parts.reduce((left, right) => ({ kind: 'and', left, right }));
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
    const blocker = this.first(this.all(this.call('on', '?t', passage), this.call('state', '?t', '?s'),
      this.call('blocksWhen', '?t', '?s')));
    if (blocker) {
      const t = blocker['?t']!;
      return { ...base, status: 'blocked', via: this.label(t), reason: this.describe(t) ?? `${this.label(t)} is in the way.` };
    }
    if (this.world.test(this.call('unopened', passage))) {
      return { ...base, status: 'blocked', via: base.name, reason: this.shut(passage) ?? `${this.label(passage)} does not open now.` };
    }
    const guard = this.first(this.all(this.call('guards', '?g', passage), this.call('able', '?g'),
      this.call('state', '?g', '?s'), this.call('blocksWhen', '?g', '?s')));
    if (guard) {
      const g = guard['?g']!;
      return { ...base, status: 'guarded', via: this.label(g), reason: this.describe(g) ?? `${this.label(g)} bars the way.` };
    }
    const hazard = this.first(this.all(this.call('on', '?h', passage), this.call('state', '?h', '?s'),
      this.call('harmsWhen', '?h', '?s')));
    if (hazard) {
      const h = hazard['?h']!;
      return { ...base, status: 'hazard', via: this.label(h), reason: this.describe(h) ?? `${this.label(h)} is dangerous.` };
    }
    const need = this.first(this.call('needs', passage, '?k'));
    if (need && !this.world.test(this.call('meets', this.actor, need['?k']!))) {
      return { ...base, status: 'needs', via: this.label(need['?k']!), reason: `You would need ${this.label(need['?k']!).toLowerCase()}.` };
    }
    return { ...base, status: 'open' };
  }
}
