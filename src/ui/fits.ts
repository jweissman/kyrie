import { PresentationResources } from '../ports/presentation-resources';
import type { PaintingLook } from '../ports/presentation-resources';
import type { Screen } from './screen-types';

// What a painting may not show of a place (data/paintings/fit.json), read against what the painting shows (seen.json):
// a ruin is not painted with banners flying, a stormy evening not as a sunny square, a crypt four storeys down not as
// a hillside (R9-12, R10-08, R11-09, CP-01). The rules are the author's; this only reads them. A painting's words are
// what it shows and, looked for in each scene painting, its light, season and weather (CO-13: a temple in summer sun
// whose words said none of that stood for the shrine of Danu under snow).
// told: what the place's own description begins by saying it is (a shrine "A well-head with a carved lip").
interface Rule { id: string; place?: string; told?: string; weather?: string; daylight?: string; underground?: boolean;
  forbids: string; unless?: string }
export type Looked = PaintingLook;
export type Seen = Pick<Screen, 'weather'> & { place: Pick<Screen['place'], 'name' | 'underground'> & { description?: string };
  expedition?: Pick<Screen['expedition'], 'daylight'> };
export class Fits {
  private static readonly compiled = new WeakMap<object, {
    rules: (Rule & { forbidden: RegExp; answered?: RegExp })[]; seen: Record<string, PaintingLook> }>();
  private static resources(): { rules: (Rule & { forbidden: RegExp; answered?: RegExp })[];
    seen: Record<string, PaintingLook> } {
    const domain = PresentationResources.domain(), kept = this.compiled.get(domain);
    if (kept) { return kept; }
    const resources = PresentationResources.paintingFit();
    const made = { rules: (resources.rules as Rule[]).map(r => ({ ...r, forbidden: new RegExp(r.forbids, 'i'),
      ...r.unless ? { answered: new RegExp(r.unless, 'i') } : {} })), seen: resources.paintings };
    this.compiled.set(domain, made);
    return made;
  }
  // Whether a painting may stand for the place as it now is (its own words, and the kind's word for it, if any).
  static fits(screen: Seen, painting: string, words = ''): boolean {
    const shows = this.words(painting);
    return !this.resources().rules.some(r => this.applies(r, screen, `${screen.place.name} ${words}`)
      && r.forbidden.test(shows) && !r.answered?.test(shows));
  }
  // What a painting was seen to show, as recorded (its light and weather read by PaintedSky).
  static looked(painting: string): Looked | undefined { return this.resources().seen[painting]; }
  // All a painting was seen to show: its few words, and its light, season and weather where it shows them.
  static words(painting: string): string {
    const p = this.resources().seen[painting];
    return p ? [p.shows, p.light, p.season, p.weather].filter(Boolean).join(' ') : '';
  }
  // The rules a place stands under now.
  private static applies(r: Rule, screen: Seen, words: string): boolean {
    return (!r.place || new RegExp(r.place, 'i').test(words))
      && (!r.told || new RegExp(r.told, 'i').test(screen.place.description ?? ''))
      && (!r.weather || new RegExp(r.weather, 'i').test(screen.weather ?? ''))
      && (!r.daylight || new RegExp(r.daylight, 'i').test(screen.expedition?.daylight ?? ''))
      && (r.underground === undefined || r.underground === !!screen.place.underground);
  }
}
