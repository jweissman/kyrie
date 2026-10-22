import type { Operator, Predicate } from '../lang/module';
import type { World } from '../lang/world';

export interface Watch { predicate: Predicate; held: boolean; present: Set<string>; heard: number; started: number }
// An activity the company can be interrupted in (a wait, a rest, a rite) passes a watch at a time. It stops when its
// interruption comes to hold having not held when it began (someone arrives), or when something happens that the
// company perceives where it is; what stopped it is told.
export class Interruption {
  static begin(world: World, action: Operator, player: string | undefined, elapsed: number): Watch | undefined {
    if (!action.interrupt || !player) { return undefined; }
    return { predicate: action.interrupt, held: world.test(action.interrupt), present: this.present(world, player),
      heard: 0, started: elapsed };
  }
  // Why the activity stops after this watch, if it does.
  static check(watch: Watch, world: World, player: string, happenings: { text: string }[]): string | undefined {
    if (happenings.length > watch.heard) { return happenings.at(-1)!.text; }
    if (watch.held || !world.test(watch.predicate)) { return undefined; }
    // Who has come, by name without the role: "The Mower comes where you are."
    const names = [...this.present(world, player)].filter(id => !watch.present.has(id))
      .map(id => (world.module.entities.find(e => e.id === id)?.name ?? id).split(', ')[0]!);
    if (!names.length) { return 'Something changes where you are.'; }
    const who = names.join(' and ');
    return `${who.charAt(0).toUpperCase()}${who.slice(1)} ${names.length === 1 ? 'comes' : 'come'} where you are.`;
  }
  // What broke off a long activity is what is told; the time it ran is the clock's to say.
  static told(_watch: Watch, why: string, _elapsed: number): string { return why; }
  // The other groups where the company is.
  private static present(world: World, player: string): Set<string> {
    const rel = world.snapshot.relations, here = rel.find(r => r.name === 'at' && r.args[0] === player)?.args[1];
    const groups = new Set(world.module.entities.filter(e => e.type === 'group').map(e => e.id));
    return new Set(rel.filter(r => r.name === 'at' && r.args[1] === here && r.args[0] !== player
      && groups.has(r.args[0]!)).map(r => r.args[0]!));
  }
}
