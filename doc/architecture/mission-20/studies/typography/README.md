# Typography study: a warmer sans for the scene (12 November)

The owner asked for later design studies of a warmer, clean sans-serif or humanist typography. The composition had to
stay readable across different paintings and inside the viewport's safe zones. This is a study only: nothing here
changes the page. Each render is Millholm's green in a1 at 1280 by 800, with the faces swapped in by a style injected
over the page. The fonts used are the ones installed on the build machine.

| Render | Controls (`--do`) | Narration (`--told`) |
|---|---|---|
| `a_current.jpg` | Jost (geometric) | Newsreader (serif) |
| `b_lato_ui.jpg` | Lato (humanist) | Newsreader |
| `c_lato_all.jpg` | Lato | Lato |
| `d_ubuntu_ui.jpg` | Ubuntu (humanist) | Newsreader |

## What the renders show

- **Lato for the controls (b)** is the warmest change for the least risk. The led acts, the openers and the heading read
  softer than Jost's geometry, and nothing moves out of place.
- **Lato for the narration as well (c)** is cleaner on the painting. But its lines run longer than Newsreader's at the
  same size. The scene's column overflowed: the last line ("The grey dog barks…") was cut under the fade, and the
  first led act was pushed down. A sans narration needs a size step down (about 16 px against 18) or a wider measure,
  and the safe-zone specs should run against it.
- **Ubuntu (d)** is warmer still, but more mannered. Its distinctive letterforms compete with the painting more than
  Lato's do.

## If taken up (Mission 21)

1. Self-host the chosen face as Jost and Newsreader are (`web/reader/fonts`, `@font-face` in `foundations.css`). Its
   licence is OFL, like theirs.
2. Change `--do` first, alone; run the safe-zone, frame and glance browser specs; render the paintings that tested
   worst for contrast.
3. Try a sans `--told` only with its own size and measure, behind a query flag, and look at it in a cold round before
   keeping it.
