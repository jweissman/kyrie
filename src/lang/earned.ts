import { World } from './world';
import { ModuleWriter } from './module-writer';

// The game's own surfaces, each earned (compactification, the owner, 26 November: doc/design/
// direction-2026-11-26-compactification.md §4): the lenses and their diamond in act II, the encyclopedia once a
// library has been stood in, the journal and the log once a scholar or a scribe is of the company, and the world map
// not at all while compactification holds. The fact is the world's (core.kyr's earned), written by the engine alone
// (CreatureFacts) and only ever asserted: what is earned is kept. Every client reads it the same way (Screen.surfaces),
// and a world that keeps no earning (a fragment without the shared kernel) shows every surface, as before.
// A perk of the Atlas's tones will be a further writer (a perception perk the look lens, a trade perk the trade
// lens): a trait of category perk naming the surfaces it earns (earns: ['lens_look']), folded into `now` beside the
// level (OR-1243).
export type Lens = 'lens_talk' | 'lens_go' | 'lens_look' | 'lens_wait' | 'lens_search';
export type Surface = Lens | 'the_map' | 'the_encyclopedia' | 'the_journal';
// What the company is now, for what it earns: the highest level among it, whether one of it does the work of learning,
// and whether it stands in (or has stood in) a library.
export interface Earning { level: number; learning: boolean }
export class Earned {
  static readonly lenses: readonly Lens[] = ['lens_talk', 'lens_go', 'lens_look', 'lens_wait', 'lens_search'];
  static readonly surfaces: readonly Surface[] = [...Earned.lenses, 'the_map', 'the_encyclopedia', 'the_journal'];
  // Act II, as the owner set it ("level 4-6 at least"): the lenses, all of them, once any of the company reaches it.
  static readonly act = 4;
  // What the company earns now: never anything it has lost (see CreatureFacts, which only asserts).
  static now(world: World, company: string, at: Earning): Surface[] {
    return [...at.level >= Earned.act ? Earned.lenses : [], ...at.learning ? ['the_journal' as const] : [],
      ...Earned.library(world, company) ? ['the_encyclopedia' as const] : []];
  }
  // Whether the company stands in a library, or has stood in one.
  private static library(world: World, company: string): boolean {
    const here = world.one('at', company);
    return (!!here && Earned.kept(world, here))
      || world.related('been', company).some(r => Earned.kept(world, r.args[1]!));
  }
  private static kept(world: World, place: string): boolean {
    return world.holds(World.key(ModuleWriter.call('library', place)));
  }
  // What the company has earned, as the world keeps it; every surface where the world keeps no earning.
  static of(world: World, company: string | undefined): Surface[] {
    if (!company || !world.module.relations.some(r => r.name === 'earned')) { return [...Earned.surfaces]; }
    const held = new Set(world.related('earned', company).map(r => r.args[1]!));
    return Earned.surfaces.filter(s => held.has(s));
  }
  // Every surface asserted earned at once (the oracle's, and a spec's earned stage: never play's own writer); nothing
  // where the world keeps no earning.
  static every(world: World, company: string | undefined): World {
    if (!company || !world.module.relations.some(r => r.name === 'earned')) { return world; }
    return world.apply(Earned.surfaces.filter(s => !world.holds(World.key(ModuleWriter.call('earned', company, s))))
      .map(s => ({ kind: 'assert' as const, call: ModuleWriter.call('earned', company, s) })));
  }
  // The same, written into a game in play (the engine host's earn).
  static grant(game?: { world: World; playerActor?: string; commitWorld(world: World): void }) {
    if (game) { game.commitWorld(Earned.every(game.world, game.playerActor)); }
  }
  static has(surfaces: readonly Surface[] | undefined, surface: Surface): boolean {
    return !surfaces || surfaces.includes(surface);
  }
}
