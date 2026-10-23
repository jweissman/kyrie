import likeness from '../../data/paintings/likeness.json';

// The painting shown beside someone in conversation: one of the corpus (data/paintings), chosen by what they do, not
// a picture of them: their own likeness where the world gives one (Likeness "fisherman" in Kyr); else the painting of
// their work, their background, or the word their role names them by.
export class Likeness {
  static readonly ids = new Set((likeness as { ids: string[] }).ids);
  static readonly credits = (likeness as { credits: Record<string, string> }).credits;
  // Works of the same name, said differently by Orsino's backgrounds and the painters.
  static readonly synonyms: Record<string, string> = { smith: 'blacksmith', woodworker: 'carpenter', herdsman: 'shepherd',
    laborer: 'peasant', beadle: 'reeve', acolyte: 'deacon', stone_mason: 'mason', woodcutter: 'feller', skinner: 'furrier',
    servant: 'servant', scribe: 'scribe', minstrel: 'minstrel', soldier: 'soldier', merchant: 'merchant',
    innkeeper: 'innkeeper', priest: 'priest', priestess: 'priestess', herbalist: 'herbalist', hunter: 'hunter',
    tracker: 'hunter', pilgrim: 'penitent', drover: 'herd', traveller: 'wanderer', wayfarer: 'wanderer', salter: 'merchant',
    chandler: 'candlemaker', herbwife: 'herbalist', furrier: 'furrier', woodwright: 'carpenter' };
  static of(at: { own?: string; background?: string; profession?: string; role?: string }): string | undefined {
    const tries = [at.own, at.profession, at.background, ...this.words(at.role ?? '')].filter((t): t is string => !!t);
    for (const t of tries) {
      for (const id of [t, this.synonyms[t], t.replace(/_/g, '-')]) { if (id && this.ids.has(id)) { return id; } }
    }
    return undefined;
  }
  private static words(role: string): string[] {
    return role.toLowerCase().replace(/[^a-z\- ]/g, ' ').split(/\s+/).filter(w => w.length > 3).reverse();
  }
  static src(id: string): string { return `paintings/${id}.webp`; }
}
