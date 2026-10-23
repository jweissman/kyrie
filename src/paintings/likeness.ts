import likeness from '../../data/paintings/likeness.json';

// Who a portrait shows, as recorded by looking at it (data/paintings/seen.json, through bun scripts/paintings.ts).
export interface Sitter { sex: 'man' | 'woman'; age?: string; station?: string; era: string; face: number }
// Whom a painting is wanted for: as much as the world knows of them.
export interface Wanted { sex?: 'man' | 'woman'; age?: string; stations?: string[]; concept?: string }

// The painting shown beside someone: one of the corpus (data/paintings), chosen by what it shows, not by its file's
// name. It is not a picture of them; it is a painting of someone who could be: of their sex, their station and, where
// one fits, their very work (a fisher beside the painting of a fisherman, if it shows a fisherman of their sex). A
// country gives each of its people a painting of their own (see Portraits). Where the world names one (Likeness
// "fisherman" in Kyr), that is the one.
export class Likeness {
  static readonly ids = new Set((likeness as { ids: string[] }).ids);
  static readonly credits = (likeness as { credits: Record<string, string> }).credits;
  static readonly stations = (likeness as unknown as { stations: Record<string, string> }).stations;
  static readonly faces = (likeness as unknown as { faces: Record<string, number> }).faces;
  static readonly sitters = new Map(Object.entries((likeness as unknown as { sitters: Record<string, string> }).sitters)
    .map(([id, s]) => {
      const [sex, age, station, era, face] = s.split('|');
      return [id, { sex: sex as Sitter['sex'], ...age ? { age } : {}, ...station ? { station } : {}, era: era!,
        face: Number(face) }] as [string, Sitter];
    }));
  // Works of the same name, said differently by Orsino's backgrounds and the painters.
  static readonly synonyms: Record<string, string> = { smith: 'blacksmith', woodworker: 'carpenter', herdsman: 'shepherd',
    laborer: 'peasant', beadle: 'reeve', acolyte: 'deacon', stone_mason: 'mason', woodcutter: 'feller', skinner: 'furrier',
    innkeeper: 'tavernkeeper', herbwife: 'herbalist', woodwright: 'carpenter', fisher: 'fisherman', traveller: 'wanderer',
    wayfarer: 'wanderer', tracker: 'hunter', pilgrim: 'penitent', chandler: 'candlemaker', salter: 'merchant' };
  // The stations a family of work is painted in, first the likeliest.
  static readonly families: Record<string, string[]> = { trade: ['middling', 'labouring'],
    learning: ['learned', 'middling'], stage: ['player', 'artist'], faith: ['religious'], court: ['high'],
    arms: ['martial'], shadows: ['middling', 'labouring'], wild: ['labouring'] };
  static sitter(id: string): Sitter | undefined { return this.sitters.get(id); }
  // The best painting for someone among those not yet taken: their work's own painting if it shows someone of their
  // sex; else one of their sex and station, of their age if it can be, in an older manner before a newer; ties settled
  // by their own name, so the same person has the same painting.
  static choose(who: Wanted, key: string, taken: Set<string> = new Set()): string | undefined {
    const concept = who.concept && this.resolve(who.concept);
    let best: string | undefined, score = -Infinity;
    for (const [id, s] of this.sitters) {
      if (who.sex && s.sex !== who.sex) { continue; }
      const station = who.stations?.indexOf(s.station ?? '') ?? -1;
      const value = (id === concept ? 60 : 0) + (station >= 0 ? 20 - station * 6 : 0)
        + (who.age && s.age === who.age ? 6 : 0) + Likeness.eras[s.era]! - (taken.has(id) ? 80 : 0)
        + this.hash(`${key}:${id}`) / 2 ** 32;
      if (value > score) { score = value; best = id; }
    }
    return best;
  }
  static readonly eras: Record<string, number> = { early: 4, late: 3, modern: 0 };
  // A painting for someone the world has not given one, from the words it knows them by.
  static of(at: { own?: string; background?: string; profession?: string; role?: string; sex?: 'man' | 'woman';
    key?: string }): string | undefined {
    if (at.own && this.ids.has(at.own)) { return at.own; }
    const words = [at.profession, at.background, ...this.words(at.role ?? '')].filter((t): t is string => !!t);
    const concept = words.map(w => this.resolve(w)).find(Boolean);
    const station = concept && this.stations[concept];
    if (!at.sex && concept && this.sitters.has(concept)) { return concept; }
    return this.choose({ ...at.sex ? { sex: at.sex } : {}, ...concept ? { concept } : {},
      ...station ? { stations: [station] } : {} }, at.key ?? words.join(' '));
  }
  private static resolve(word: string): string | undefined {
    return [word, this.synonyms[word], word.replace(/_/g, '-')].find(id => id && this.ids.has(id));
  }
  private static words(role: string): string[] {
    return role.toLowerCase().replace(/[^a-z\- ]/g, ' ').split(/\s+/).filter(w => w.length > 3).reverse();
  }
  private static hash(text: string): number {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h = Math.imul(h ^ text.charCodeAt(i), 16777619); }
    return h >>> 0;
  }
  static src(id: string): string { return `paintings/${id}.webp`; }
  static large(id: string): string { return `paintings/large/${id}.webp`; }
  // Where to hold a painting when it is cropped: at the face, as a percentage of its height.
  static focus(id: string): number { return this.sitters.get(id)?.face ?? this.faces[id] ?? 30; }
}
