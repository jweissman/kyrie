# The one row: three treatments compared (M22 step 3)

Written for the owner, 16 November 2026. Before this step the game drew a row's states in two places:
- `menu.css` for play: a tint under the hand and the keys alike, with a sheen across it on hover;
- `touch.css` for creation, borrowed from the unadopted `?touch` experiment: the mark grows on focus, and the ground is
  swept on a press.

Hover and the keys' focus looked the same everywhere (button-discovery.md §3). Now there is one definition, `row.css`, for
the scene, talk, the map's menu, a fight's moves and creation's rows. The `?touch` and `?ix` press pipelines are gone.

## The treatments

All three were recorded through the same sequence on a1's first scene (1280×800):
1. at rest;
2. the hand over the second row;
3. the keys on the first;
4. both at once;
5. a press held 90 ms;
6. the act taken;
7. answered.

The contact sheet is [baseline/12-row-study.jpg](baseline/12-row-study.jpg). The videos and stills are in
`/var/tmp/kyrie/m22/row-study/`, made by `/var/tmp/kyrie/m22/tools/row-study.ts`.

| | Under the hand | The keys / considered | Pressed, held, taken |
|---|---|---|---|
| **A (landed)** | a light tint (7 %) only | a deeper tint (13 %), white words, the mark grown to the row's height in its tone at full light | 26 %, at once; the mark full; while the engine answers, the other rows fall to .42 after 80 ms |
| B "glass" (M21's) | 9 % tint and one sheen | the same 9 % tint | 26 % |
| C "light" | the words brighten; no ground | no ground; the mark | a faint 14 % ground |

## What the recording showed

- **B:** with the keys on one row and the hand on another, the two rows are indistinguishable. That is the defect the
  discovery measured. The sheen is motion on every hover, paid a hundred times a session.
- **C:** the quietest at rest, but the hand's place is nearly invisible over a busy painting, and a press barely
  registers. That trades away the legibility the doctrine asks of the foreground.
- **A:** the keys' row is unmistakable (a tall bright mark and white words) beside a hovered row (a faint ground and a short
  mark). A press is deeper at once. Nothing moves or changes size in any state. Its one motion is the mark's 140 ms ease
  back to rest; under reduced motion, none.

## Not yet

- The title's ways in and creation's cards keep their own compositions (uppercase centred ways; cards with edges). They
  share the press and hold, but their focus and hover are still one look.
- One row height: scene and talk rows are 46 px, creation's 44 px (52 px for a finger), the title's 54 px.
- **Sound** is still an address away (`?sound=1`). Whether the commit has a sound is a question for a person's ear, not a
  recording.
- **A person's hand** on A at desk and tablet. These stills and videos are evidence of what the page does, not that it
  feels right.
