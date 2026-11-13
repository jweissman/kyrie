// The page is set as a book is: quotation marks and apostrophes curled the way a compositor would set them (‘ ’ “ ”),
// whatever the author typed. A mark that opens a quotation follows the start of a line, a space, an opening bracket
// or dash, or another opening mark; any other is a closing mark or an apostrophe. A word that has lost its head ('em,
// 'tis, rock 'n' roll, the winter of '86) keeps an apostrophe there: "'em" had become an opening quote (Hessel
// friction 11).
export class Typography {
  private static readonly heads = ['em', '[Tt](?:is|was|were|will|would)', 'til', 'till', 'neath', 'cause', 'cos',
    'gainst', 'bout', 'scuse', 'nuff', 'prentice', 'n', 'un', 'im', 'er', 'ad', 'ave', 'ow', 'ere', 'ead', 'alf', 'appen',
    'ome', 'ope', 'ouse', 'eard', '[0-9]{2}'];
  private static readonly elided = new RegExp(`(^|[\\s([{—–“‘])'(?=(?:${Typography.heads.join('|')})\\b)`, 'g');
  // A word set in italics as the author marked it, *so*: the runs of a text, each said plainly or stressed. The page
  // sets a stressed run in italics, and a plain client gives its words alone: "*habit*" had been shown as typed, its
  // stars and all (round 12, B: T24-19). A lone star is no mark, and is left as it is.
  static spans(text: string): { text: string; stressed?: true }[] {
    const out: { text: string; stressed?: true }[] = [];
    let at = 0;
    for (const m of text.matchAll(Typography.stress)) {
      if (m.index > at) { out.push({ text: text.slice(at, m.index) }); }
      out.push({ text: m[1]!, stressed: true });
      at = m.index + m[0].length;
    }
    if (at < text.length || !out.length) { out.push({ text: text.slice(at) }); }
    return out;
  }
  static plain(text: string): string { return text.replace(Typography.stress, '$1'); }
  private static readonly stress = /\*([^*\s](?:[^*]*[^*\s])?)\*/g;
  static curl(text: string): string {
    return text
      .replace(/(^|[\s([{—–‘])"/g, '$1“').replace(/"/g, '”')
      .replace(Typography.elided, '$1’')
      .replace(/(^|[\s([{—–“])'/g, '$1‘').replace(/'/g, '’');
  }
}
