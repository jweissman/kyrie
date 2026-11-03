// Where one sentence ends and the next begins, said once for the whole page (the Grand Tour's friction 17: a place
// was recalled by "its first sentence", cut at "Mr." of "Mr. Pumphrey"; the narrator, the glance, spoken words, second
// person and the result's opening each split their own way). A stop, or a stop inside a closing quote, then space,
// then what begins a sentence; not after a title or an abbreviation that is followed by a name.
export class Sentences {
  static readonly titles = ['Mr', 'Mrs', 'Ms', 'Dr', 'St', 'Mt', 'Capt', 'Col', 'Gen', 'Lt', 'Sgt', 'Prof', 'Rev', 'Fr',
    'Br', 'Sr', 'Jr', 'No', 'vs', 'e.g', 'i.e', 'cf', 'etc'];
  private static readonly ends = /([.!?][’”'"]?)\s+/g;
  static split(text: string): string[] {
    const out: string[] = [];
    let start = 0;
    for (const m of text.matchAll(this.ends)) {
      const at = m.index + m[1]!.length, before = text.slice(start, m.index + 1);
      const next = text.charAt(m.index + m[0].length);
      if (!next || this.titled(before) || !/[A-Z‘“'"(0-9]/.test(next)) { continue; }
      out.push(text.slice(start, at).trim());
      start = m.index + m[0].length;
    }
    const rest = text.slice(start).trim();
    return rest ? [...out, rest] : out;
  }
  static first(text: string): string { return this.split(text)[0] ?? text; }
  // Whether what ends at this stop is a title or an abbreviation ("Mr.", "St.", "e.g."), not the end of a sentence.
  private static titled(before: string): boolean {
    const word = /([A-Za-z.]+)\.$/.exec(before)?.[1];
    return !!word && this.titles.includes(word);
  }
}
