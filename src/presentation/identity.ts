// The names the player is shown, each kept here and nowhere else. The game's: its mark on the title (and that mark read
// aloud as a word), the browser's tab, the head of Options, the encyclopedia's way back to the game, and what a file
// that is no save of it is told. The studio's: set beneath its mark, the seven towers, before the title. Neither is
// settled, so the address may ask for another to compare: ?name=Lanthorn on the title, ?studio=freehaven in the mark
// (and any other words, ?studio=Ivory%20Gate). The repository, its packages, the command line, the code and the data
// keep "kyrie" whatever the game comes to be called.
export class Identity {
  // The game's name as its mark sets it: in capitals, a space between words.
  static readonly game = 'KYRIE';
  // The studio's: the seven towers' mark lights a lamp on each lesser tower, and the seventh light is the star.
  static readonly studio = 'SEVENTH STAR';
  // The studio's names on the owner's list, and the namer's, by the word an address asks for them by.
  static readonly studios: ReadonlyMap<string, string> = new Map([['seventh-star', Identity.studio],
    ['freehaven', 'FREEHAVEN'], ['seven-lamps', 'SEVEN LAMPS']]);
  // As long a name as a mark will carry on a phone held upright.
  static readonly longest = 24;
  // The names this address asks for, or the game's and the studio's own.
  static named(query: URLSearchParams): { game: string; studio: string } {
    const studio = query.get('studio') ?? '';
    return { game: Identity.asked(query.get('name') ?? '') ?? Identity.game,
      studio: Identity.studios.get(Identity.slug(studio)) ?? Identity.asked(studio) ?? Identity.studio };
  }
  // A name asked for, kept to letters, figures, spaces, hyphens and apostrophes, in capitals; none if nothing is left.
  static asked(raw: string): string | undefined {
    const name = raw.replace(/[^\p{L}\p{N}' -]+/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, Identity.longest).trim();
    return name ? name.toLocaleUpperCase('en') : undefined;
  }
  // The name as a word, as a tab or a sentence has it: KYRIE is Kyrie, SEVEN LAMPS is Seven Lamps.
  static spoken(name = Identity.game): string {
    return name.toLocaleLowerCase('en').replace(/(^|[\s-])(\p{L})/gu,
      (_, before: string, first: string) => before + first.toLocaleUpperCase('en'));
  }
  // The seventh light the studio's mark kindles over its tallest tower: the star, or a lamp for a studio whose name is
  // its lamps (SEVEN LAMPS shows seven lamps, not six and a star).
  static seventh(studio: string): 'star' | 'lamp' { return /\bLAMPS\b/.test(studio) ? 'lamp' : 'star'; }
  private static slug(raw: string): string { return raw.trim().toLowerCase().replace(/[\s_]+/g, '-'); }
}
