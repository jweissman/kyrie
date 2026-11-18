import { Canon } from '../canon/canon';
import { Emblems } from './emblems';

type Spell = { tradition: 'arcane' | 'divine'; school?: string; domain?: string };

// The school or domain a spell is of, as its emblem (the owner, 18 November, OR-92: "we have glyphs/icons for the
// spell schools and we don't surface those"): the emblem of the way that teaches it, an evocation the evoker's bolt,
// a prayer of life the vitalist's. A divine spell is said by its domain, an arcane one by its school. The emblems are
// keyed by the way (data/paintings/emblems.json: schools, domains), so each way's spellAccess names what it opens.
// An icon, never a colour: it is drawn in ink, as every emblem is.
export class SpellSchools {
  private static ways?: Map<string, string>;
  // The emblem's id for a spell, by its id or its spell record; none where it has no school or domain drawn.
  static emblem(spell: string | Spell | undefined): string | undefined {
    const s = typeof spell === 'string' ? Canon.abilities[spell]?.spell : spell;
    if (!s) { return undefined; }
    const ways = SpellSchools.map(), key = s.tradition === 'divine' && s.domain ? `domain:${s.domain}`
      : s.school ? `school:${s.school}` : s.domain ? `domain:${s.domain}` : '';
    const id = ways.get(key);
    return id && Emblems.has(id) ? id : undefined;
  }
  // The emblem as a row's field (`emblem`), of the last spell among what an act is done with; none where none is.
  static field(ids?: string[]): { emblem?: string } {
    const emblem = SpellSchools.among(ids);
    return emblem ? { emblem } : {};
  }
  // Of the things an act is done with (Act.targets, in its action's order), the last spell's: what is prepared, not
  // what it is prepared in place of; what is cast, not who it is cast on.
  static among(ids?: string[]): string | undefined {
    return [...ids ?? []].reverse().map(id => SpellSchools.emblem(id)).find(Boolean);
  }
  private static map(): Map<string, string> {
    SpellSchools.ways ??= new Map(Object.entries(Canon.traits).flatMap(([id, t]) => {
      const a = t.spellAccess;
      return a?.domain ? [[`domain:${a.domain}`, id]] : a?.school && a.school !== 'all' ? [[`school:${a.school}`, id]] : [];
    }));
    return SpellSchools.ways;
  }
}
