import { Earned, type Surface } from '../lang/index';
import type { Screen } from '../ui/screen-types';
import type { Keep, Rail, RailLens } from './glance-types';

// The game's own surfaces as every client shows them (compactification, the owner, 26 November): each only once the
// company has earned it (Earned, Screen.surfaces). The rail's lenses by the lenses earned, none at first (act II earns
// them); the world map, by nothing while compactification holds; the encyclopedia by a library stood in; the journal
// and the story so far by a scholar or a scribe among the company. A screen that says nothing of them (made before
// earning was, or in a world that keeps none) shows them all.
export class Surfaces {
  static readonly lenses: readonly RailLens[] = ['talk', 'go', 'look', 'wait', 'search'];
  static has(screen: Pick<Screen, 'surfaces'> | undefined, surface: Surface): boolean {
    return Earned.has(screen?.surfaces, surface);
  }
  // The resting scene's rail: folded, with the lenses earned in it (Glance.rail), and always the company's own page,
  // kept within reach (Rail.keep, OR-1685).
  static rail(screen: Pick<Screen, 'surfaces'>): Rail {
    return { fold: 'folded', lenses: Surfaces.lenses.filter(l => Surfaces.has(screen, `lens_${l}`)), keep: Surfaces.keep };
  }
  static readonly keep: Keep = { view: 'company', label: 'Your character' };
  // Whether a lens stands on the rail: earned, or the rail said nothing of what is (a frame without the hint).
  static lens(rail: Rail | undefined, lens: RailLens): boolean { return !rail || rail.lenses.includes(lens); }
}
