import type { Operator, Predicate } from '../lang/module';
import type { World } from '../lang/world';
import { LocalObservations } from '../presentation/local-observations';

export interface Watch {
  predicate?: Predicate; held: boolean; present: Set<string>; heard: number; started: number;
  // For a watchful activity: what the company saw where it is as it began, by observation.
  seen?: string[];
}
// An activity the company can be interrupted in (a wait, a rest, a rite) passes a watch at a time. It stops when its
// interruption comes to hold having not held when it began (someone arrives), or when something happens that the
// company perceives where it is; a watchful one also when anyone comes or goes, or what is seen there changes. What
// stopped it is told.
export class Interruption {
  static begin(world: World, action: Operator, player: string | undefined, elapsed: number): Watch | undefined {
    if (!(action.interrupt || action.watchful) || !player) { return undefined; }
    return { ...action.interrupt ? { predicate: action.interrupt } : {},
      held: !!action.interrupt && world.test(action.interrupt), present: this.present(world, player), heard: 0,
      started: elapsed, ...action.watchful ? { seen: LocalObservations.read(world, player).map(o => o.id) } : {} };
  }
  // Why the activity stops after this watch, if it does.
  static check(watch: Watch, world: World, player: string, happenings: { text: string }[]): string | undefined {
    if (happenings.length > watch.heard) { return happenings.at(-1)!.text; }
    const changed = watch.seen && this.changed(watch, world, player);
    if (changed) { return changed; }
    if (!watch.predicate || watch.held || !world.test(watch.predicate)) { return undefined; }
    // Who has come, by name without the role: "The Mower comes where you are."
    const names = [...this.present(world, player)].filter(id => !watch.present.has(id));
    return names.length ? this.moved(world, names, 'comes') : 'Something changes where you are.';
  }
  // Someone has come or gone, or something seen here is new: what it is, as it is seen.
  private static changed(watch: Watch, world: World, player: string): string | undefined {
    const present = this.present(world, player);
    const came = [...present].filter(id => !watch.present.has(id));
    const went = [...watch.present].filter(id => !present.has(id));
    if (came.length) { return this.moved(world, came, 'comes'); }
    if (went.length) { return this.moved(world, went, 'goes'); }
    return LocalObservations.read(world, player).find(o => !watch.seen!.includes(o.id))?.text;
  }
  private static moved(world: World, ids: string[], verb: 'comes' | 'goes'): string {
    const who = ids.map(id => (world.module.entities.find(e => e.id === id)?.name ?? id).split(', ')[0]!).join(' and ');
    const plural = ids.length > 1, said = verb === 'comes' ? `${plural ? 'come' : 'comes'} where you are`
      : `${plural ? 'go' : 'goes'} away`;
    return `${who.charAt(0).toUpperCase()}${who.slice(1)} ${said}.`;
  }
  // What broke off a long activity is what is told; the time it ran is the clock's to say.
  static told(_watch: Watch, why: string, _elapsed: number): string { return why; }
  // The other groups where the company is.
  private static present(world: World, player: string): Set<string> {
    const rel = world.view.relations, here = world.one('at', player);
    const groups = new Set(world.module.entities.filter(e => e.type === 'group').map(e => e.id));
    return new Set(rel.filter(r => r.name === 'at' && r.args[1] === here && r.args[0] !== player
      && groups.has(r.args[0]!)).map(r => r.args[0]!));
  }
}
