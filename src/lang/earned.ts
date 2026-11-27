import { World } from './world';
import { ModuleWriter } from './module-writer';

// The game's own surfaces, each earned by a find, never by a level (the owner's playtest of 27 November, superseding
// earn-1126's act II: "no lenses, no map, no rail until genuinely earned";
// doc/design/direction-2026-11-26-compactification.md §4): the world map once one of the company carries a map of the
// land (a map found, bought or brought), the encyclopedia once a library has been stood in, the journal and the log
// once a scholar or a scribe is of the company; and the lenses by a find that grants them, which nothing yet is
// (everything they gave is a row of the place's one menu: PlaceQuestion). The fact is the world's (core.kyr's earned),
// written by the engine alone (CreatureFacts) and only ever asserted: what is earned is kept. Every client reads it the
// same way (Screen.surfaces), and a world that keeps no earning (a fragment without the shared kernel) shows every
// surface, as before. A perk of the Atlas's tones will be the lenses' writer (a perception perk the look lens, a trade
// perk the trade lens): a trait of category perk naming the surfaces it earns (earns: ['lens_look']), folded into `now`
// beside the finds (OR-1243).
export type Lens = 'lens_talk' | 'lens_go' | 'lens_look' | 'lens_wait' | 'lens_search';
export type Surface = Lens | 'the_map' | 'the_encyclopedia' | 'the_journal';
// What the company is now, for what it earns: whether one of it does the work of learning, and whether one of it
// carries a map of the land.
export interface Earning { learning: boolean; mapped: boolean }
export class Earned {
  static readonly lenses: readonly Lens[] = ['lens_talk', 'lens_go', 'lens_look', 'lens_wait', 'lens_search'];
  static readonly surfaces: readonly Surface[] = [...Earned.lenses, 'the_map', 'the_encyclopedia', 'the_journal'];
  // The catalog's maps of the land (data/catalog/items): carried, any of them is a map found. A chart of the stars is
  // not one.
  static readonly maps: ReadonlySet<string> = new Set(['map', 'ancient_map', 'faded_map', 'tattered_map',
    'dead_mans_map']);
  // What the company earns now: never anything it has lost (see CreatureFacts, which only asserts).
  static now(world: World, company: string, at: Earning): Surface[] {
    return [...at.mapped ? ['the_map' as const] : [], ...at.learning ? ['the_journal' as const] : [],
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
