import type { World } from './world';
import type { Change, Module, Predicate, WorldRule } from './module';

// One that goes about a place: the rule that brings it to wherever the company is, the variable that rule binds to
// where the company stands, and its own die for each watch (dice(band) <= n, of a hundred).
interface Goer { rule: WorldRule; band: string; where: string; chance: number; ready: Predicate }

// Who may come to wherever the company is while time passes (OR-1857), read from a module's own rules, never from a
// flag an author sets: each that moves a band to wherever the company is (Assert at(band, ?p), where at(party, ?p)) on
// a die of its own each watch, and holds where the company stands but for its die (DeepSites' wanderers: the savage
// and the territorial of a level go about it, one watch in twenty each). The chance that any comes in so many
// minutes is over every watch they take (ten minutes a watch).
export class Goers {
  static readonly watch = 10;
  private static readonly read = new WeakMap<Module, Goer[]>();
  static chance(world: World, place: string, minutes: number): number {
    const here = this.goers(world.module).filter(g => world.test(g.ready, { [g.where]: place }));
    const watches = Math.ceil(minutes / this.watch);
    return 1 - here.reduce((stay, g) => stay * (1 - g.chance) ** watches, 1);
  }
  // Where the company is, as it would name the part of the place it is in: the level it is on.
  static part(world: World, place: string): string | undefined {
    const entities = world.module.entities, at = entities.find(e => e.id === place);
    return at?.space?.parent ? entities.find(e => e.id === at.space!.parent)?.name : undefined;
  }
  private static goers(module: Module): Goer[] {
    let goers = this.read.get(module);
    if (!goers) {
      goers = (module.rules ?? []).flatMap(rule => { const g = this.goer(rule); return g ? [g] : []; });
      this.read.set(module, goers);
    }
    return goers;
  }
  private static goer(rule: WorldRule): Goer | undefined {
    const where = this.party(rule.when);
    if (!where) { return undefined; }
    const band = rule.effects.find((e: Change) => e.kind === 'assert' && e.call.name === 'at' && e.call.args[1] === where
      && !e.call.args[0]!.startsWith('?') && e.call.args[0] !== 'party')?.call.args[0];
    const die = band ? this.die(rule.when, band) : undefined;
    if (!band || die === undefined) { return undefined; }
    return { rule, band, where, chance: Math.min(1, Math.max(0, die / 100)), ready: this.without(rule.when, band) };
  }
  // The variable a rule binds to where the company stands (at(party, ?p)).
  private static party(p: Predicate): string | undefined {
    switch (p.kind) {
      case 'call': return p.name === 'at' && p.args[0] === 'party' && p.args[1]?.startsWith('?') ? p.args[1] : undefined;
      case 'and': return this.party(p.left) ?? this.party(p.right);
      default: return undefined;
    }
  }
  // Its own die: dice(band) <= n.
  private static die(p: Predicate, band: string): number | undefined {
    if (p.kind === 'and') { return this.die(p.left, band) ?? this.die(p.right, band); }
    if (p.kind !== 'compare' || p.operator !== '<=' || p.left.kind !== 'call' || p.left.name !== 'dice'
      || p.left.args[0] !== band || p.right.kind !== 'number') { return undefined; }
    return p.right.value;
  }
  private static without(p: Predicate, band: string): Predicate {
    if (p.kind === 'and') { return { ...p, left: this.without(p.left, band), right: this.without(p.right, band) }; }
    return this.die(p, band) !== undefined ? { kind: 'boolean', value: true } : p;
  }
}
