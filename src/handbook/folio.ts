// The backstage's one theme (OR-502, the coordinator's call on the owner's playtest of 24 November): every page
// read rather than lived (the company, the notes, the pack, the story, the Encyclopedia, the handbooks) is a parchment
// folio laid on the dark table, a margin of the dark about it, and none goes full-bleed bright. Set here once, for
// every client: the page's frame reads `theme` (the shell's data-backstage) and the folio's inks from `ink`; the books
// built beside the game (the Encyclopedia, the handbooks) are laid on the table by `css`. A page never chooses its own.
// Its paper is toned down from the bright sheet it had been (the owner, 26 November: the Encyclopedia's "way too
// sharp"; luminance .80 to .69, its lit middle a third as bright), its inks darkened with it and measured on it: the
// body ink 10.8:1, the dim ink 6.2:1, the faint 5.4:1, the link 7.2:1, the sepia 6.1:1.
export type BackstageTheme = 'folio';
export class Folio {
  static readonly theme: BackstageTheme = 'folio';
  // Aged vellum (OR-1090, OR-1118, the owner and the second review, 26 November: the paper had been "a flashlight in
  // the dark", one flat cream under pure black ink): its luminance lowered again, .69 to .57, and its inks a dark brown
  // measured on it: the body ink 9.2:1, the dim 6.0, the faint 5.4, the link 6.5, the sepia 5.9 (and each above 4.5 on
  // the deeper ground).
  static readonly ink = { table: '#0A0B0E', paper: '#D3C5A6', deep: '#C6B795', ink: '#2A2119', dim: '#4A3F31',
    faint: '#51453A', link: '#6B2418', sepia: '#593C22', rule: 'rgba(42, 33, 25, .26)', hair: 'rgba(42, 33, 25, .13)' };
  // The grain: fractal noise drawn by the browser (no image file), laid over the paper by multiplying, faint.
  static readonly grain = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'220\' '
    + 'height=\'220\'%3E%3Cfilter id=\'g\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.85\' '
    + 'numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix values=\'0 0 0 0 .36 0 0 0 0 .27 0 0 0 0 .14 '
    + '0 0 0 .14 0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23g)\'/%3E%3C/svg%3E")';
  // The paper itself, in gradients and that grain: a soft light toward its middle, its edges and corners darkened with
  // age, a shadow where the leaf goes into its binding (the left), the laid lines very faint; nothing glossy.
  static readonly paper = `${Folio.grain}, `
    + 'linear-gradient(90deg, rgba(58, 40, 18, .26), rgba(58, 40, 18, .08) 18px, rgba(58, 40, 18, 0) 42px), '
    + 'radial-gradient(110% 85% at 52% 42%, rgba(255, 246, 222, .14), rgba(255, 246, 222, 0) 58%), '
    + 'radial-gradient(150% 125% at 50% 50%, rgba(0, 0, 0, 0) 55%, rgba(78, 54, 24, .26) 100%), '
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
