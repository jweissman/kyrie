import type { Operator, Predicate } from '../lang/module';
import type { World } from '../lang/world';
import { LocalObservations } from './local-observations';
import { ModuleWriter } from '../lang/module-writer';

export interface Watch {
  predicate?: Predicate; held: boolean; present: Set<string>; heard: number; started: number;
  // For a watchful activity: what the company saw where it is as it began, by observation.
  seen?: string[];
  // What was seen where it is as any activity began: whoever comes is told as they are then seen.
  looked: string[];
  // Whether the company was in the dark as it began: a light can only give out on one that had it.
  dark?: boolean;
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
      started: elapsed, looked: LocalObservations.read(world, player).map(o => o.id), dark: this.dark(world, player),
      ...action.watchful ? { seen: LocalObservations.read(world, player).map(o => o.id) } : {} };
  }
  // Why the activity stops after this watch, if it does.
  static check(watch: Watch, world: World, player: string, happenings: { text: string }[]): string | undefined {
    if (happenings.length > watch.heard) { return happenings.at(-1)!.text; }
    const changed = watch.seen && this.changed(watch, world, player);
    if (changed) { return changed; }
    if (!watch.predicate || watch.held || !world.test(watch.predicate)) { return undefined; }
    // The light gone is said as itself, not as something changing; but only where there was a light to go. A watch
    // kept in the dark broken off by what came to it had been told as a light giving out (Half the Hive's friction 15,
    // HTH-15): what came is told instead, as it is seen or heard there.
    if (!watch.dark && this.dark(world, player)) {
      return 'Your light gives out, and there is no going on with it in the dark.';
    }
    // In the dark, what came is what is heard of it, not its name.
    const names = [...this.present(world, player)].filter(id => !watch.present.has(id));
    const heard = LocalObservations.read(world, player).find(o => !watch.looked.includes(o.id))?.text;
    if (heard && watch.dark) { return heard; }
    return names.length ? this.arrival(world, player, names, watch.looked) : heard ?? 'Something changes where you are.';
  }
  private static dark(world: World, player: string): boolean {
    return world.module.queries.some(q => q.name === 'benighted') && world.test(ModuleWriter.call('benighted', player));
  }
  // Someone has come or gone, or something seen here is new: what it is, as it is seen.
  private static changed(watch: Watch, world: World, player: string): string | undefined {
    const present = this.present(world, player);
    const came = [...present].filter(id => !watch.present.has(id));
    const went = [...watch.present].filter(id => !present.has(id));
    if (came.length) { return this.arrival(world, player, came, watch.looked); }
    if (went.length) { return this.moved(world, went, 'goes'); }
    return LocalObservations.read(world, player).find(o => !watch.seen!.includes(o.id))?.text;
  }
  // Who has come, as they are seen coming (the Mower walking the crest, stooping), where something new here is about
  // them (by the observation's own subject, never by finding their name in its words: the architecture review's P0);
  // else by name without the role: "The Mower comes where you are."
  private static arrival(world: World, player: string, ids: string[], looked: string[]): string {
    const seen = LocalObservations.read(world, player)
      .find(o => !looked.includes(o.id) && !!o.about && ids.includes(o.about));
    return seen?.text ?? this.moved(world, ids, 'comes');
  }
  private static bare(world: World, id: string): string {
    return (world.module.entities.find(e => e.id === id)?.name ?? id).split(', ')[0]!;
  }
  private static moved(world: World, ids: string[], verb: 'comes' | 'goes'): string {
    const who = ids.map(id => this.bare(world, id)).join(' and ');
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
    // Only those the company notices: Sister Ysolde, unseen, was said to come where it was (the review's A6).
    return new Set(rel.filter(r => r.name === 'at' && r.args[1] === here && r.args[0] !== player
      && groups.has(r.args[0]!) && LocalObservations.noticed(world, r.args[0]!, player)).map(r => r.args[0]!));
  }
}
