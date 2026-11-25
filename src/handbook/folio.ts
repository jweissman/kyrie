// The backstage's one theme (OR-502, the coordinator's call on the owner's playtest of 24 November): every page
// read rather than lived (the company, the notes, the pack, the story, the Encyclopedia, the handbooks) is a parchment
// folio laid on the dark table, a margin of the dark about it, and none goes full-bleed bright. Set here once, for
// every client: the page's frame reads `theme` (the shell's data-backstage) and the folio's inks from `ink`; the books
// built beside the game (the Encyclopedia, the handbooks) are laid on the table by `css`. A page never chooses its own.
// Its inks are measured on its paper: the body ink 12:1, the dim ink 6.4:1, the faint 4.8:1, the link 7.5:1.
export type BackstageTheme = 'folio';
export class Folio {
  static readonly theme: BackstageTheme = 'folio';
  static readonly ink = { table: '#0A0B0E', paper: '#EFE6D2', deep: '#E4D8BE', ink: '#2B241B', dim: '#5B4F3F',
    faint: '#6E6150', link: '#7A2E1F', sepia: '#6B4A2B', rule: 'rgba(43, 36, 27, .24)', hair: 'rgba(43, 36, 27, .12)' };
  // The paper itself: a laid sheet drawn in gradients (no image), a very faint grain, a thin ruled border.
  static readonly paper = 'radial-gradient(120% 90% at 50% 40%, rgba(255, 250, 236, .55), rgba(255, 250, 236, 0) 60%), '
    + 'radial-gradient(140% 120% at 50% 50%, rgba(0, 0, 0, 0) 62%, rgba(92, 66, 32, .16) 100%), '
    + `repeating-linear-gradient(0deg, rgba(92, 66, 32, .025) 0 1px, rgba(0, 0, 0, 0) 1px 3px), ${Folio.ink.paper}`;
  // A book built beside the game: the dark table under it, and its pages one folio on it (.folio), a margin of the
  // dark about it, narrow on a phone.
  static readonly css = `
html, body { background: ${Folio.ink.table}; }
body { padding: clamp(10px, 3vw, 40px) clamp(10px, 3vw, 40px) clamp(16px, 4vw, 56px); }
.folio { max-width: 1240px; margin: 0 auto; min-height: calc(100vh - 2 * clamp(10px, 3vw, 40px));
  color: ${Folio.ink.ink};
  background: ${Folio.paper}; border: 1px solid rgba(43, 36, 27, .35); box-shadow: 0 0 0 1px rgba(0, 0, 0, .5),
  0 30px 90px rgba(0, 0, 0, .6); color-scheme: light; }
`;
}
