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
  // A painting's credit from its file's painter, title and date, said as a person would say it: a painter filed
  // "Pezous, Jean [d.1885-04-18]" is Jean Pezous, and a title in capitals ("LE MIME CHARLES DEBUREAU…") is not shouted
  // (round 6: a portrait read as a museum's raw caption; the register's NP-17).
  static line(e: { id: string; artist?: string; title?: string; date?: string }): string | undefined {
    const artist = e.artist && this.painter(e.artist), title = e.title && this.titled(e.title);
    return this.known[e.id] ?? this.clean([artist, artist ? title?.replace(`, ${e.artist}`, '').replace(`, ${artist}`, '')
      : title, e.date].filter(Boolean).join(', '));
  }
  // A person filed by surname, not a holder ("Wellcome Library, London").
  static painter(artist: string): string {
    const bare = artist.replace(/\s*\[[^\]]*\]/g, '').trim(), filed = /^([^,]+), ([^,]+)$/.exec(bare);
    return filed && !/\b(Library|Museum|Gallery|School|Collection|Trust)\b/.test(bare) ? `${filed[2]} ${filed[1]}` : bare;
  }
  // In capitals, a title of words is set in title case, its small words small ("Portrait of José Nicolás de Azara").
  static readonly small = new Set(['of', 'the', 'a', 'an', 'and', 'in', 'on', 'at', 'de', 'du', 'des', 'la', 'le', 'les',
    'en', 'et', 'von', 'van', 'di', 'da', 'del']);
  static titled(title: string): string {
    if (/\p{Ll}|[\d_]/u.test(title) || title.split(/\s+/).length < 3) { return title; }
    return title.toLowerCase().split(' ').map((w, i) => i > 0 && this.small.has(w) ? w
      : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
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
