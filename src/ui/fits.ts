import table from '../../data/paintings/fit.json';
import seen from '../../data/paintings/seen.json';
import type { Screen } from './screen-types';

// What a painting may not show of a place (data/paintings/fit.json), read against what the painting shows (seen.json):
// a ruin is not painted with banners flying, a stormy evening not as a sunny square, a crypt four storeys down not as
// a hillside (R9-12, R10-08, R11-09, CP-01). The rules are the author's; this only reads them.
interface Rule { id: string; place?: string; weather?: string; daylight?: string; underground?: boolean;
  forbids: string; unless?: string }
export type Seen = Pick<Screen, 'weather'> & { place: Pick<Screen['place'], 'name' | 'underground'>;
  expedition?: Pick<Screen['expedition'], 'daylight'> };
export class Fits {
  private static readonly rules = (table.rules as Rule[]).map(r => ({ ...r, forbidden: new RegExp(r.forbids, 'i'),
    ...r.unless ? { answered: new RegExp(r.unless, 'i') } : {} }));
  private static readonly shows = (seen as { paintings: Record<string, { shows?: string }> }).paintings;
  // Whether a painting may stand for the place as it now is (its own words, and the kind's word for it, if any).
  static fits(screen: Seen, painting: string, words = ''): boolean {
    const shows = this.shows[painting]?.shows ?? '';
    return !this.rules.some(r => this.applies(r, screen, `${screen.place.name} ${words}`)
      && r.forbidden.test(shows) && !r.answered?.test(shows));
  }
  // The rules a place stands under now.
  private static applies(r: Rule, screen: Seen, words: string): boolean {
    return (!r.place || new RegExp(r.place, 'i').test(words))
      && (!r.weather || new RegExp(r.weather, 'i').test(screen.weather ?? ''))
      && (!r.daylight || new RegExp(r.daylight, 'i').test(screen.expedition?.daylight ?? ''))
      && (r.underground === undefined || r.underground === !!screen.place.underground);
  }
}
