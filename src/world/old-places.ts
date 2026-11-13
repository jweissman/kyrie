import { CommonNames } from './common-names';
import { PlaceNames } from './place-names';
import type { Region, Site } from './region-writer';

// In the starting country an old place (a makers' work, or a ruin, barrow or tower built before the folk) is called
// first by its name in Common, made from what its old name means as the country's towns are named (Moonwatch, as
// Wrenbridge and Hollyholt; the owner, 14 November: built in Common, not glossed in English), and its old name is
// learned later, by reading it where it is cut on the place itself (T24-20, OPR-06, decided by the lead on the
// owner's word: the starting region once had a lot more Common names). Renamed after the country is drawn and its
// adventures placed, so nothing drawn from the names (the other countries', what is placed) changes.
export class OldPlaces {
  // Whether a site is old: a work, or of a kind built before the folk, with a meaning to say.
  static old(site: Site): boolean { return !!site.gloss && (!!site.work || PlaceNames.old.includes(site.kind)); }
  // The country's sites, each old one called by its Common meaning, its old name kept to be learned. Two that would
  // be called alike, or like a town, keep their old names (no traveller could tell Moonwatch from Moonwatch).
  static called(region: Region): Site[] {
    const said = region.sites.map(s => this.old(s) ? this.common(s) : undefined);
    const towns = new Set(region.settlements.map(t => t.name));
    return region.sites.map((s, i) => {
      const common = said[i];
      if (!common || said.filter(c => c === common).length > 1 || towns.has(common)) { return s; }
      return { ...s, name: common, old: s.name };
    });
  }
  // What its old name means, said in Common as the country's towns are: one word made of two by the languages
  // library's Common dictionary and the Common lexicon's joins (the moon watch is Moonwatch, the secret gate
  // Hiddengate); its words apart where they will not join (Sorrow Watch).
  static common(site: Site): string | undefined {
    const [feature, affix] = site.gloss?.trim().toLowerCase().split(/\s+/) ?? [];
    return CommonNames.meant({ feature, affix })[0]?.name ?? PlaceNames.inCommon({ feature, affix });
  }
}
