import { Earned, type Surface } from '../lang/index';
import type { Screen } from '../ui/screen-types';
import type { Aspect, Keep, Lens, Lensed, Rail, RailLens, RailTool } from './glance-types';
import { Emphasis, type Tone } from './emphasis';
import { Indicator } from './indicator';

// The game's own surfaces as every client shows them (compactification, the owner, 26 November): each only once the
// company has earned it (Earned, Screen.surfaces): the rail's lenses by a perk or the end of act I; the world map, by
// a map of the land carried; the encyclopedia by a library stood in; the journal and the story so far by a scholar or a
// scribe among the company. A screen that says nothing of them (made before earning was, or in a world that keeps none)
// shows them all.
export class Surfaces {
  static readonly lenses: readonly RailLens[] = ['talk', 'go', 'look', 'wait', 'search'];
  // The glance's lens each rail lens draws (the search glass turns the scene to what can be looked at: Look's).
  static readonly drawn: Readonly<Record<RailLens, Lens>> = { talk: 'people', go: 'places', look: 'things',
    wait: 'time', search: 'things' };
  // What lights the diamond: a coloured opportunity, or someone who might join (an icon, never a colour).
  static readonly lights: readonly Aspect[] = [...Emphasis.precedence, 'companionship'];
  static has(screen: Pick<Screen, 'surfaces'> | undefined, surface: Surface): boolean {
    return Earned.has(screen?.surfaces, surface);
  }
  // The resting scene's rail (OR-1880, the owner, 27 November, late): the compass and the book from the start; the
  // lenses had folded behind the diamond, the compass's Go never among them; the diamond lit by what they hold, dim
  // with nothing; and the lenses unfolded once act I is over, or while the diamond is lit.
  static rail(screen: Pick<Screen, 'surfaces' | 'party'>, lensed?: Partial<Record<Lens, Lensed>>): Rail {
    const lenses = Surfaces.lenses.filter(l => l !== 'go' && Surfaces.has(screen, `lens_${l}`));
    const held = new Set(lenses.flatMap(l => lensed?.[Surfaces.drawn[l]]?.aspects ?? []));
    const diamond = Surfaces.lights.filter(a => held.has(a));
    const over = Math.max(0, ...(screen.party ?? []).map(m => m.level)) >= Earned.act;
    return { fold: 'folded', lenses, keep: Surfaces.keep, tools: Surfaces.tools(), diamond,
      unfolded: lenses.length > 0 && (over || diamond.length > 0) };
  }
  // The diamond as every client draws it: the tones of what it holds, in the one precedence, the words for a reader,
  // and whether someone who might join is among it (an icon); the aim's gold only where the way is shown (gilded).
  static diamond(rail: Rail | undefined, gilded = true): { tones: Tone[]; words: string[]; companion: boolean } {
    const held = Emphasis.drawn(rail?.diamond, gilded);
    return { tones: Emphasis.ranked(held).flatMap(a => Emphasis.tones[a] ?? []), words: Indicator.words(held),
      companion: held.includes('companionship') };
  }
  // What the character has from the start: the compass, and the book. Nothing yet says a character cannot read
  // (OR-1881): when something does, the book is left out for them here, and every client with it.
  static tools(): RailTool[] { return ['compass', 'book']; }
  static readonly keep: Keep = { view: 'company', label: 'Your character' };
  // Whether a lens stands on the rail: had, or the rail said nothing of what is (a frame without the hint). The
  // compass's Go stands wherever the compass does.
  static lens(rail: Rail | undefined, lens: RailLens): boolean {
    return !rail || rail.lenses.includes(lens) || (lens === 'go' && Surfaces.tool(rail, 'compass'));
  }
  static tool(rail: Rail | undefined, tool: RailTool): boolean { return !rail || rail.tools.includes(tool); }
}
