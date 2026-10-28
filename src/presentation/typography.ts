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
  static curl(text: string): string {
    return text
      .replace(/(^|[\s([{—–‘])"/g, '$1“').replace(/"/g, '”')
      .replace(Typography.elided, '$1’')
      .replace(/(^|[\s([{—–“])'/g, '$1‘').replace(/'/g, '’');
  }
}
