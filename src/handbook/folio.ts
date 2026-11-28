// The backstage's one theme (OR-502, the coordinator's call on the owner's playtest of 24 November): every page
// read rather than lived (the company, the notes, the pack, the story, the Encyclopedia, the handbooks) is a parchment
// folio laid on the dark table, a margin of the dark about it, and none goes full-bleed bright. Set here once, for
// every client: the page's frame reads `theme` (the shell's data-backstage) and the folio's inks from `ink`; the
// Encyclopedia, built beside the game, is laid on the table by `book` as the Book's pages are (OR-1830), and the
// handbooks, the authors' instruments, by `css`. A page never chooses its own.
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
  // The table's inks, the game's own on its dark ground (web/reader/foundations.css: --ivory, --dim, --accent, --edge,
  // held equal by test/small/encyclopedia-register): what a book built beside the game writes on the table about its
  // paper (its head) is written in them, as the Book's head is.
  static readonly table = { ivory: '#E8E0D5', dim: '#B3ADA2', accent: '#EFE6D1', edge: 'rgba(236, 230, 217, .10)' };
  // The game's two faces (foundations.css: --do and --told, held equal), from the site's fonts beside the book: Source
  // Sans 3 names what can be done and where one is, Newsreader tells.
  static readonly faces = {
    do: "'Source Sans 3', 'Source Sans Pro', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    told: "'Newsreader', 'Iowan Old Style', 'Charter', Georgia, serif" };
  static readonly fonts = `
@font-face { font-family: 'Source Sans 3'; src: url(../fonts/source-sans-3-normal-latin.woff2) format('woff2'); font-weight: 200 900; font-display: swap; }
@font-face { font-family: 'Source Sans 3'; font-style: italic; src: url(../fonts/source-sans-3-italic-latin.woff2) format('woff2'); font-weight: 200 900; font-display: swap; }
@font-face { font-family: 'Newsreader'; src: url(../fonts/newsreader-normal-latin.woff2) format('woff2'); font-weight: 300 700; font-display: swap; }
@font-face { font-family: 'Newsreader'; font-style: italic; src: url(../fonts/newsreader-italic-latin.woff2) format('woff2'); font-weight: 300 700; font-display: swap; }
:root { --do: ${Folio.faces.do}; --told: ${Folio.faces.told}; }
`;
  // A book read beside the game laid as the Book's pages are (web/reader/folio.css; the owner, 27 November: "a UI that
  // actually harmonizes well with itself (the change in tone for the encyclopedia is really galling)"): the dark table
  // under the whole screen; its head a quiet line on the table at the safe zone, the way back a quiet word with its
  // sign and the pages its tabs, in the Book's words and inks; one parchment leaf under it that scrolls, the paper
  // filling it, its words beginning where the Book's do. Opened over the game (.within: EncyclopediaOverlay), the way
  // back is the game's own head's, and the book's head starts at the top of its frame.
  static readonly book = `${Folio.fonts}
:root { --safe-t: max(10vh, calc(env(safe-area-inset-top) + 8px)); --safe-r: max(10vw, calc(env(safe-area-inset-right) + 8px));
  --safe-l: max(10vw, calc(env(safe-area-inset-left) + 8px)); --folio-x: clamp(18px, 3.4vw, 48px);
  --ease: cubic-bezier(.2, .7, .2, 1); }
html, body { margin: 0; height: 100%; background: ${Folio.ink.table}; }
body { display: grid; grid-template-rows: auto minmax(0, 1fr); grid-template-columns: minmax(0, 1fr); height: 100dvh;
  overflow: hidden; }
.head { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; margin: 0;
  padding: var(--safe-t) var(--safe-r) 12px var(--safe-l); font: 400 13px/1.35 var(--do); }
.within .head { padding-top: 0; flex-wrap: nowrap; }
.within .head .sheets { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
/* A line of tabs that scrolls fades at its ends rather than cutting a word at the edge. */
.within .head .sheets { -webkit-mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent); }
.head .back-to { min-height: 40px; display: inline-flex; align-items: center; gap: 8px; padding: 0 18px 0 0;
  margin-right: 6px; border-right: 1px solid ${Folio.table.edge}; color: ${Folio.table.ivory}; text-decoration: none; }
.head .back-sign { font-size: 15px; opacity: .7; }
.within .head .back-to { display: none; }
.head .sheets { display: flex; flex: 1 1 0; flex-wrap: wrap; gap: 0 4px; min-width: 0; }
.head .sheet-key { position: relative; display: inline-flex; align-items: center; min-height: 40px; padding: 0 14px;
  color: ${Folio.table.dim}; text-decoration: none; white-space: nowrap; transition: color 120ms; }
.head .sheet-key::after { content: ''; position: absolute; left: 14px; right: 14px; bottom: 4px; height: 1px;
  background: ${Folio.table.accent}; transform: scaleX(0); transition: transform 220ms var(--ease); }
.head .sheet-key:hover, .head .sheet-key:focus-visible { color: ${Folio.table.ivory}; outline: none; text-decoration: none; }
.head .sheet-key[aria-current] { color: ${Folio.table.accent}; } .head .sheet-key[aria-current]::after { transform: scaleX(1); }
.leaf { min-height: 0; overflow-y: auto; overscroll-behavior: contain; display: flex; flex-direction: column;
  padding: 0 max(8px, calc(var(--safe-r) - var(--folio-x))) clamp(12px, 3vh, 32px)
  max(8px, calc(var(--safe-l) - var(--folio-x))); scrollbar-width: thin; animation: leaf-up 220ms var(--ease) both; }
.folio { flex: 1 0 auto; box-sizing: border-box; width: 100%; margin: 0; padding: clamp(22px, 3vw, 40px) var(--folio-x) 56px;
  color: ${Folio.ink.ink}; background: ${Folio.paper}; border: 1px solid rgba(42, 33, 25, .4);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, .5), 0 24px 70px rgba(0, 0, 0, .55); color-scheme: light; }
@keyframes leaf-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .leaf { animation: none; } .head .sheet-key::after { transition: none; } }
`;
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
