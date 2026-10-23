// How a painting is credited where it is shown, from what its own file says: its painter, its title and its date,
// shortened to that (a museum's medium, size and accession note are not a credit), and nothing at all when what the
// file carries is not a credit (a scanner's settings, stray XML, a rights line, a photographer's name): a painting
// with no credit is shown as "Painter unrecorded", and no credit is ever guessed.
export class Credits {
  static readonly junk = [/</, /rdf:/, /\bchrome\b/, /\b\d{3,}x\d{3,}\b/, /^\(c\)/i, /\bSupplied by\b/, /;;;fot/];
  static readonly entities: Record<string, string> = { '&#39;': '’', '&amp;': '&', '&quot;': '"' };
  static clean(text: string): string | undefined {
    if (this.junk.some(re => re.test(text))) { return undefined; }
    const cut = Object.entries(this.entities).reduce((t, [e, c]) => t.replaceAll(e, c), text.trim())
      .replace(/^"(.*)"$/, '$1')
      // "… 1650. oil on canvas. Walters Art Museum (37.1917): …", "Girl at a mirror .*oil on canvas .*…"
      .replace(/\s*\.\*.*$/, '').replace(/[.,]\s+(oil|tempera|watercolou?r|ink|pastel|fresco|coloured lithograph)( on| painting|\.|$).*$/i, '')
      .replace(/^Wellcome Library, London, [A-Z]\d+\s+/, '').replace(/, 0(?=,|$)/g, '').trim();
    return cut.length ? cut : undefined;
  }
}
