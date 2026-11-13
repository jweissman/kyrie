import { PlaceNames } from './place-names';
import type { Region, Site } from './region-writer';

// In the starting country an old place (a makers' work, or a ruin, barrow or tower built before the folk) is called
// first by what its name means in Common, as the townsfolk would say it ("the drowned hall"), and its old name is
// learned later, by reading it where it is cut on the place itself (T24-20, OPR-06, decided by the lead on the
// owner's word: the starting region once had a lot more Common names). Renamed after the country is drawn and its
// adventures placed, so nothing drawn from the names (the other countries', what is placed) changes.
export class OldPlaces {
  // Whether a site is old: a work, or of a kind built before the folk, with a meaning to say.
  static old(site: Site): boolean { return !!site.gloss && (!!site.work || PlaceNames.old.includes(site.kind)); }
  // The country's sites, each old one called by its Common meaning, its old name kept to be learned. Two that would
  // be called alike keep their old names (no traveller could tell "the eagle spire" from "the eagle spire").
  static called(region: Region): Site[] {
    const said = region.sites.map(s => this.old(s) ? this.common(s.gloss!) : undefined);
    return region.sites.map((s, i) => {
      const common = said[i];
      if (!common || said.filter(c => c === common).length > 1) { return s; }
      return { ...s, name: common, old: s.name };
    });
  }
  // "drowned hall" is the drowned hall.
  static common(gloss: string): string { return `the ${gloss.toLowerCase().trim()}`; }
}
