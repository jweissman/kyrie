// How a painting is credited where it is shown, from what its own file says: its painter, its title and its date,
// shortened to that (a museum's medium, size and accession note are not a credit), and nothing at all when what the
// file carries is not a credit (a scanner's settings, stray XML, a rights line, a photographer's name, a caption field
// that is only control bytes): a portrait with no credit is shown as "Painter unrecorded", the title's painting with
// none shows no credit, and no credit is ever guessed. A few the files carry wrongly or only in part are known from the
// collection that holds the painting, and are kept here (Credits.known).
export class Credits {
  static readonly junk = [/</, /rdf:/, /\bchrome\b/, /\b\d{3,}x\d{3,}\b/, /^\(c\)/i, /\bSupplied by\b/, /;;;fot/,
    /\p{Cc}/u];
  static readonly entities: Record<string, string> = { '&#39;': '’', '&amp;': '&', '&quot;': '"' };
  // Credits from the holder's own record, for a painting whose file names no painter: the Getty's Turner, whose file
  // gives only its title and the museum's rights line, and the Beaverbrook's, whose caption field is broken bytes.
  static readonly known: Readonly<Record<string, string>> = {
    city: 'J. M. W. Turner, Modern Rome – Campo Vaccino, 1839',
    indolence: 'J. M. W. Turner, The Fountain of Indolence, 1834' };
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
