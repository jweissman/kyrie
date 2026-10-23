// The page is set as a book is: quotation marks and apostrophes curled the way a compositor would set them (‘ ’ “ ”),
// whatever the author typed. A mark that opens a quotation follows the start of a line, a space, an opening bracket
// or dash, or another opening mark; any other is a closing mark or an apostrophe.
export class Typography {
  static curl(text: string): string {
    return text
      .replace(/(^|[\s([{—–‘])"/g, '$1“').replace(/"/g, '”')
      .replace(/(^|[\s([{—–“])'/g, '$1‘').replace(/'/g, '’');
  }
}
