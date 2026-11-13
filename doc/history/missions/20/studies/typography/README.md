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
| `e_play_ui.jpg`, `e_play_ui_phone.jpg`, `e_play_ui_creation.jpg` | Play (Jonas Hecksher; the owner's suggestion) | Newsreader |
| `g_source_ui.jpg` | Source Sans 3 (humanist, variable) | Newsreader |

## What the renders show

- **Lato for the controls (b)** is the warmest change for the least risk. The led acts, the openers and the heading read
  softer than Jost's geometry, and nothing moves out of place.
- **Lato for the narration as well (c)** is cleaner on the painting. But its lines run longer than Newsreader's at the
  same size. The scene's column overflowed: the last line ("The grey dog barks…") was cut under the fade, and the
  first led act was pushed down. A sans narration needs a size step down (about 16 px against 18) or a wider measure,
  and the safe-zone specs should run against it.
- **Ubuntu (d)** is warmer still, but more mannered. Its distinctive letterforms compete with the painting more than
  Lato's do.

- **Play (e)**, at the owner's suggestion, is crisp, compact and legible at phone width, and nothing overflows.
  - Its squared, engineered letterforms give the page a technical game-interface voice.
  - The place's title ("The camp at Millholm") and the spaced capitals of the openers ("READ THE NOTICE ON THE
    WELL-POST", "SET OUT NOW") read as a console beside the painted scenes and Newsreader's serif narration.
  - It may suit the smallest machine-like text (key numbers, the rail, the date line) better than headings and
    choices.
  - (Loaded for the render from Google Fonts' latin subset, OFL. Not added to the site.)

## The call (12 November, midday)

**Source Sans 3 for the controls; Newsreader stays for the telling.**
- It is humanist and warm, like Lato, but variable (200 to 900).
- Every weight the sheets ask for (300, 500, 600) is its own, not faked from 400 and 700 as Lato's would be.
- Its letters stay quiet beside the paintings, where Play's do not.
- The safe-zone, frame, glance and opening browser specs pass with it.

The other faces stay one query away, to keep looking: `?face=jost` (the old one), `?face=lato`, `?face=play`. All are
self-hosted under the OFL in `web/reader/fonts`, and none is loaded unless asked for.

## The cinematic view (an experiment: `?view=cinematic`)

At the owner's ask, the scene is stripped down:
- the telling stands on the painting with no panel round it, over a soft shade at the right (`h_cinematic.jpg`);
- the few things to do are each marked only by a rounded line at the left, in the colour of what it is, or a faint
  neutral line.

On a phone the panel stays (`h_cinematic_phone.jpg`): the likenesses wrap to a second row there and would show through
the words. That second row is hidden under the panel in the ordinary view too, which is a fault of its own.

### Lenses (the owner, 12 November: who is here, where to go and what is at hand as layers of the one scene)

In the cinematic view the scene's layers are behind lenses on the rail, as the forward design's §G proposes:
- **Quiet** (`i_lens_quiet.jpg`): the painting, the telling, the few things to do; no likenesses.
- **Talk** (`i_lens_talk.jpg`): a new mark at the head of the rail, with the pip of whoever has something for the
  company, shows the likenesses.
- **Go** (`i_lens_go.jpg`) shows a tile for each way, by its direction and name, with the one pip of what it is (gold
  for the aim's, a soft rose where someone who might join is sensed), beside the Go panel.
- **Look** (`i_lens_look.jpg`) shows a tile for each thing at hand, by its picture where it has one.

A tile touched is chosen in the lens's panel.

What it lacks:
- **Pictures for places.** The tiles are a direction and a name: no painting is chosen for a place the company is not
  in.
- **Two layers at once.** It does not yet say which of the lenses has something (only Talk's and Go's marks carry a
  pip).

The next experiment would give each way the painting its place would have (`Scenery` for that place).

## If taken up (Mission 21)

1. Self-host the chosen face as Jost and Newsreader are (`web/reader/fonts`, `@font-face` in `foundations.css`). Its
   licence is OFL, like theirs.
2. Change `--do` first, alone; run the safe-zone, frame and glance browser specs; render the paintings that tested
   worst for contrast.
3. Try a sans `--told` only with its own size and measure, behind a query flag, and look at it in a cold round before
   keeping it.
