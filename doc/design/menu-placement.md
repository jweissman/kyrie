# Where the primary action menu stands (OR-305)

The owner's cold play of 24 November asked for one page frame that owns the primary action menu: its place, layout
and behaviour. No page should decide them for itself. This file is the inventory on 24 November, the placement chosen,
and the order in which pages come onto it. `test/menu-placement-browser.test.ts` measures it, and
`test/support/menu-placement.ts` walks the pages.

## The inventory, 24 November

Each page's menu is the `[data-menu]` in view, measured by the box of its visible rows. The figures are left to right
in pixels at 1280×800 and 390×844, and the position is where the box stands on the screen.

| Page | Drawn by | 1280×800 | 390×844 | How it behaves |
|---|---|---|---|---|
| Title | `title-page.tsx`, FirstChoice.title | 460–820, centred, middle | 20–370, middle | Its own centred column under the name; the keys start on the first row |
| How a life begins | `begin-menu.tsx`, FirstChoice.step | 460–820, centred, middle | 20–370, middle | The title's column; the sentence under it says what the lit row means |
| A step of a life | `composed-creation.tsx` | 640–1126, right, top | 39–351, top | Its own column; cards and rows at the top, under the step's question |
| The scene | `glance.tsx` (ol.led) in the focus panel | 643–1124, right, under the telling | 57–333, foot (sheet) | The four, numbered 1–4; arrows and Enter |
| Its lenses (Go…, people) | `lens-focused.tsx`, `glance.tsx` | as the scene | as the scene | The lens's rows in the menu's place; Escape puts the lens away |
| A conversation | `talk-stage.tsx` | 614–1152, right, under what is said | 39–351, foot | Replies numbered; Take your leave last |
| The map | `map-menu.tsx` | 773–1131, on the card, bottom right | 60–330, foot | The card's rows; Put away the map |
| The Book | `sheet.tsx` (ol.led keep) | 168–1112, across the foot | 48–342, foot | One row across the sheet's width |
| Options | `options-page.tsx` | not a `[data-menu]` | not a `[data-menu]` | Settings rows and the paused game's two ways, in the opening's dark |
| A fight | `fight-moves.tsx`, PageFrame kind fight | not reached by the walk | not reached by the walk | Unfolding moves; the told column at `--panel-w` |
| The opening, the ending | `prologue-stage.tsx`, `book-stage.tsx` | not reached by the walk | not reached by the walk | Go on, and answers; the ending's two rows |

The menus stood in five columns at each size. The scene and a conversation were the same page in kind, yet stood
29 px apart at 1280 and 18 px apart on a phone.

All of them share one interaction contract, already held elsewhere:

- rows are ChoiceRow's;
- at most four rows are in view;
- 1–4 press a row;
- the arrows move between rows and Enter commits;
- a press is taken once and never held.

`test/action-census-browser.test.ts` and `test/small/page-controls.test.ts` hold this contract.

## The call: hard right, in the frame's column

**On a wide screen,** the menu stands in a column hard right. The column is `--menu-w` wide and `--menu-r` in from
the right edge, and its rows are inset by `--menu-inset`. All three tokens are defined on `.shell` in `frame.css`. The
menu stands under the page's narrative in that same column, so the story reads first and its acts follow. This is the
conversation's place, and the conversation is the one page rated right.

**On a narrow or upright screen,** the column is the screen within its safe zone, at the foot.

**In a fight,** the menu may take the left side, using the same measure and the same rows.

The trade-off:

- **Bottom-left would put the acts under the thumb.** But it would move the conversation, which is the page the owner
  kept, and it would part the acts from the narrative they answer.
- **Hard right keeps the reading order** and moves nothing a player already trusts.
- **The cost is height.** A row's height on the screen still depends on how long the narrative above it is. Pinning
  the menu to the foot of the column is a later step for this row's successor, if the owner wants it.

## Onto the frame

| When | Pages | Columns (1280 / 390) |
|---|---|---|
| Before, 24 November | none | 5 / 5 |
| First slice | the scene with its lenses, and a conversation: both take the column from the frame's tokens (`rest.css`, `talk.css`) | 4 / 4 |
| OR-380 | the title and how a life begins, creation, the map's card, the Book, Options, the opening, the ending, a fight (on the left) | down to 1 (2 with the fight) |

The spec's `held` is lowered as each page comes onto the frame, and is never raised.
