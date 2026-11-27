import { Installed } from '../ports/installed';
import type { PaintingFitRule, PaintingLooked } from '../ports/presentation';
import type { Screen } from './screen-types';

// What a painting may not show of a place (data/paintings/fit.json), read against what the painting shows (seen.json):
// a ruin is not painted with banners flying, a stormy evening not as a sunny square, a crypt four storeys down not as
// a hillside (R9-12, R10-08, R11-09, CP-01). The rules are the author's; this only reads them. A painting's words are
// what it shows and, looked for in each scene painting, its light, season and weather (CO-13: a temple in summer sun
// whose words said none of that stood for the shrine of Danu under snow).
// told: what the place's own description begins by saying it is (a shrine "A well-head with a carved lip").
export type Looked = PaintingLooked;
export type Seen = Pick<Screen, 'weather'> & { place: Pick<Screen['place'], 'name' | 'underground'> & { description?: string };
  expedition?: Pick<Screen['expedition'], 'daylight'> };
export class Fits {
  private static readonly none: PaintingFitRule[] = [];
  private static readonly compiled = new WeakMap<PaintingFitRule[], (PaintingFitRule & {
    forbidden: RegExp; answered?: RegExp })[]>();
  private static get rules() {
    const rules = Installed.current().presentation?.paintingFit ?? this.none;
    let compiled = this.compiled.get(rules);
    if (!compiled) {
      compiled = rules.map(r => ({ ...r, forbidden: new RegExp(r.forbids, 'i'),
        ...r.unless ? { answered: new RegExp(r.unless, 'i') } : {} }));
      this.compiled.set(rules, compiled);
    }
    return compiled;
  }
  // Whether a painting may stand for the place as it now is (its own words, and the kind's word for it, if any).
  static fits(screen: Seen, painting: string, words = ''): boolean {
    const shows = this.words(painting);
    return !this.rules.some(r => this.applies(r, screen, `${screen.place.name} ${words}`)
      && r.forbidden.test(shows) && !r.answered?.test(shows));
  }
  // What a painting was seen to show, as recorded (its light and weather read by PaintedSky).
  static looked(painting: string): Looked | undefined {
    return Installed.current().presentation?.paintingSeen?.[painting];
  }
  // All a painting was seen to show: its few words, and its light, season and weather where it shows them.
  static words(painting: string): string {
    const p = this.looked(painting);
    return p ? [p.shows, p.light, p.season, p.weather].filter(Boolean).join(' ') : '';
  }
  // The rules a place stands under now.
  private static applies(r: PaintingFitRule, screen: Seen, words: string): boolean {
    return (!r.place || new RegExp(r.place, 'i').test(words))
      && (!r.told || new RegExp(r.told, 'i').test(screen.place.description ?? ''))
      && (!r.weather || new RegExp(r.weather, 'i').test(screen.weather ?? ''))
      && (!r.daylight || new RegExp(r.daylight, 'i').test(screen.expedition?.daylight ?? ''))
      && (r.underground === undefined || r.underground === !!screen.place.underground);
  }
}
