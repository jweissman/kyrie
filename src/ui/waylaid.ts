import type { World } from '../lang/world';
import type { Call, Module, Predicate, Value, WorldRule } from '../lang/module';
import { ObservationText } from '../lang/observation-text';

// A way watched after dark, read from the rule that falls on whoever is there: one that sets a band on the company
// where it stands on a way at night (the hobs' waylay: at(party, road) and dark() and fortune(raiders, road) <= 4; a
// roll on the watch's die is read the same), while the
// rest of what it asks holds (the raiders at home in their hall, able, not lying low). A camp there, or going onto it
// at night, says so before it is chosen: a cold player camped on the road to Gatesend, Weary with one ration, and the
// hobs came, nothing having said the road was watched (cold play 7, CL-58).
interface Lying { place: string; band: string; rest: Predicate[] }
export class Waylaid {
  private static readonly read = new WeakMap<Module, Lying[]>();
  // Each way watched now, and by whom: the band as the company would know it.
  static of(world: World): Map<string, string> {
    const watched = new Map<string, string>();
    for (const l of this.lying(world.module)) {
      if (!watched.has(l.place) && l.rest.every(p => world.test(p))) {
        watched.set(l.place, ObservationText.label(world, l.band));
      }
    }
    return watched;
  }
  static camp(band: string): string { return `${this.capital(band)} lie in wait by this way after dark.`; }
  static going(band: string): string { return `${this.capital(band)} lie in wait by that way after dark, and it is dark.`; }
  private static capital(s: string): string { return `${s.charAt(0).toUpperCase()}${s.slice(1)}`; }
  private static lying(module: Module): Lying[] {
    const known = this.read.get(module);
    if (known) { return known; }
    const found = (module.rules ?? []).flatMap(rule => this.waits(rule));
    this.read.set(module, found);
    return found;
  }
  // A rule that sets someone on the party at a place, after dark: its place, the band, and what else it asks but
  // the dice.
  private static waits(rule: WorldRule): Lying[] {
    const sets = rule.effects.find(e => e.kind === 'assert' && e.call.name === 'assails' && e.call.args[1] === 'party');
    const all = this.conjuncts(rule.when);
    const at = all.find((p): p is Call => p.kind === 'call' && p.name === 'at' && p.args[0] === 'party');
    const dark = all.some(p => p.kind === 'call' && p.name === 'dark');
    if (!sets || !at || !dark || [at.args[1], sets.call.args[0]].some(a => !a || a.startsWith('?'))) { return []; }
    const rest = all.filter(p => p !== at && !(p.kind === 'call' && p.name === 'dark') && !this.dice(p));
    return [{ place: at.args[1]!, band: sets.call.args[0]!, rest }];
  }
  private static conjuncts(p: Predicate): Predicate[] {
    return p.kind === 'and' ? [...this.conjuncts(p.left), ...this.conjuncts(p.right)] : [p];
  }
  private static dice(p: Predicate): boolean {
    return p.kind === 'compare' && [p.left, p.right].some(v => this.rolled(v));
  }
  private static rolled(v: Value): boolean {
    return v.kind === 'call' ? v.name === 'dice' || v.name === 'fortune' : v.kind === 'arith' && [v.left, v.right].some(x => this.rolled(x));
  }
}
