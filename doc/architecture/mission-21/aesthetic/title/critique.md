# The title passage, judged in motion (TO-01, TO-02, TO-03)

This covers the studio's mark, the title and the drawing of a country, into the first question of creation, at
1280×800 and 820×1180. The frames were taken in motion by `aesthetic/tools/zz-title.test.ts.txt`, copied to
`test/zz-title-browser.test.ts` to run.

## The frames

| File | What it shows |
|---|---|
| `*-passage.png` | The studio's mark into the title, a frame about every 1.2 s. |
| `*-focus.png` | Each way in as the keys reach it: at once, after 300 ms and after 900 ms. |
| `*-into-creation.png` | From New game to the first question, a frame about every 0.6 s. |
| `*-reduced-options.png` | Options focused under reduced motion. |

## What changed

**The ways in are the game's rows.** They are centred, each with a mark at its left.
- The one the hand or the keys are on has the strong gold mark and a warmed ground at once, in the same frame as the
  key. Nothing slides to it, and no box moves or changes size. The opening spec holds both: the boxes are equal
  before and after a hover, and only the marked way's mark is gold.
- The moving double diamond is gone.
- Gold here is ceremonial, the entry's alone. Inside the game it keeps its one meaning, the aim followed.
- The rows are the grammar creation's cards and play's rows use: a mark that says where you are, words, a quiet line.

**The sky answers the focus, never the menu.** Behind the title is a sky in layers:
- a deep gradient;
- forty fixed stars, the same each time, kept off the name;
- one light low on the horizon;
- a haze drifting over eighty seconds;
- a far ridge with the studio's seven towers on it, their lamps lit.

Which way in is chosen changes these over 0.7 to 1.1 s:

| Way in | Light | Ridge and lamps | Stars |
|---|---|---|---|
| New game | Moves right and cools to a far dawn | Comes a little nearer, the lamps brighten | — |
| Continue | Warms and comes close, a hearth | — | Dim |
| The encyclopedia | Rises pale, lamplight | The lamps dim | Brighten |
| Options | Goes quiet | — | — |

These are registered custom properties (`@property`) eased by CSS. The sky has no script loop, no particles and no
camera. The embers that used to rise are gone.

**One passage, not three screens.**
- The studio's seven towers, drawn in light on a horizon, become the far towers on the title's ridge. As the mark goes
  out, the sky comes up from that horizon, with no black between.
- New game keeps that sky, held as New game left it, while the country is drawn ("Drawing a region…" alone over it).
  The country's painting then rises from the same horizon as the first question comes.
- Any key or touch still skips straight to the ways in.
- Under reduced motion the title is there at once, the sky changes with no movement, and the country appears without
  rising.

## Against the doctrine's questions

**Did the opening invite curiosity?**
- More than it did: a far city's lamps on a ridge under stars, the light moving where you look.
- The name and the line under it are unchanged. The passage is about six seconds from the first frame to the ways in,
  and it can be skipped.

**Did the player understand where they were and what they could do?**
- Yes. Three or four ways in, one marked, nothing else on the screen but the build's stamp.

**Were the promoted choices interesting and distinct?**
- They are four at most and plainly different. The sky makes each feel like a different direction, which is the
  experiment's whole point.

**Did attending to something reveal worthwhile detail?**
- Only modestly here: the sky's change is felt more than read.
- At 820×1180 the change in the light is smaller on the screen, so the lamps and stars carry more of it.

**Did the presentation remain beautiful and unobtrusive?**
- At rest, yes: dark, legible and still.
- In motion, the one transition (the light easing to the focused way) never makes the menu wait. The opening spec
  checks the mark is in place in the same frame as the hover.

**Did the experience create a reason to continue?**
- New game now leads into the drawing of the country under the same sky, and the country comes up from the horizon
  the title showed.
- The first question still arrives as a deck of cards, unchanged until creation is drawn from the engine's
  CreationState (look-6).

## What it still needs

- **The ridge and towers are flat silhouettes.** A painter's horizon (a strip of the country's own painting, darkened,
  in place of the drawn ridge) would make the passage into creation seamless. It wants a painting chosen for it, not
  generated.
- **The loading words sit alone over the sky.** The engine's steps ("Drawing the world…") could appear as quiet lines
  on the horizon, as the setting-out page has them.
- **The tablet upright** frames the name and the menu in the upper half, with a tall sky between the menu and the
  ridge. A slightly lower title block would balance it.
