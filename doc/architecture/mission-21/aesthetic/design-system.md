# Westernesse design system: a start (Mission 21, 12 November 2026)

This is the aesthetic investigator's proposal, on branch `m21-look`. It is not the owner's ruling, and nothing here
changes the game's default. The tokens are in `web/reader/look.css`. They are new names that do nothing until a rule uses
them. Every rule that draws differently is scoped to `:root[data-look]`, which `?look=veil|attend|plate` sets (see
`web/reader/look.ts`).

The system builds on `doc/design/foundations.md` and `web/reader/foundations.css`; it does not replace them. Those
files define the faces, the colours, a ten-step type scale and a few controls, and they are good. The measured problem
is that the rest of the tree does not use them:

- **38 distinct literal font sizes** (8 to 46 px, mostly in half-pixel steps) in **450** font declarations that name a size, against ten type
  tokens.
- **20 letter-spacing values** and **77 uppercase declarations**.
- **19 rules painting gold** that are not about the aim. Four of them reach gold through a token called `--blue`
  (`foundations.css`: `--blue: var(--gold)`). The character page's mana bar is gold for that reason.

This document says what the system is. `test/design-constraints.test.ts` holds those counts so that they can only fall.

## 1. Principles

1. **The world is the surface; the apparatus is one object.** At rest the painting fills the screen. Everything that
   can be read or touched sits in one panel, apart from who is present: the name, the telling, the menu and the
   tools. Who is present stands on the picture, because their likenesses belong to it. The top bar and the separate
   rail are what make the page read as a web app.
2. **A choice is a thing you do, not a link.** Every selectable act is one component (the choice row): the same
   height, the same indicator at the left, sentence case, and a key number at the right. Uppercase tracked words are
   kept for labels, never for choices.
3. **Colour is meaning, and only meaning.** Each opportunity carries one indicator. Gold means the one followed
   undertaking and nothing else. Every other surface is neutral. Radiance is rare: the followed step's line gives off a
   little light, and a focused or pressed control is lit with light, not gold.
4. **Tell little, offer much, unfold on attention.** The scene tells three sentences at a glance. What has changed and
   what an aim bears on are always told. The rest is one deliberate touch away, and it opens in place, not on a
   separate page.
5. **Each activity has its own layout, built from the same parts.** Rest, talk, fight, travel and the book are
   different compositions. They share the panel, the choice row, the type roles and the atlas.

## 2. Tokens

### Space: a 4 px grid, eight steps

| Token | px | Use |
|---|---|---|
| `--s1` | 4 | between an indicator and its word; between a label and the line under it |
| `--s2` | 8 | between rows in a menu; inside a tool row |
| `--s3` | 12 | between a heading and its line; between paragraphs of the telling |
| `--s4` | 16 | inside a panel on a phone |
| `--s5` | 24 | inside a panel; between the telling and the menu |
| `--s6` | 32 | between columns |
| `--s7` | 48 | between regions |
| `--s8` | 64 | the stage's own margins where the safe zone is smaller |

### Type: seven roles, two faces

The faces stay the owner's choice of 12 November: **Newsreader** for the telling and speech, and **Source Sans 3**
(humanist, variable, self-hosted) for what can be done. Jost (geometric) is in the repo, and `?face=jost` still swaps
it in. Against the paintings, Source Sans 3 is warmer, and the studies' reading of Jost as "colder" holds. The warmth
the brief asks for comes better from the paper composition (§6) and from removing capitals than from another face.

| Token | Value | Use |
|---|---|---|
| `--t-title` | Source Sans 3 300, 26–34 px / 1.12 | a place's or a person's name |
| `--t-tell-lead` | Newsreader 400, 17.5–19.5 px / 1.5 | the telling's first paragraph |
| `--t-tell` | Newsreader 400, 16–17.5 px / 1.55 | the telling; what was said |
| `--t-choice` | Source Sans 3 500, 15.5 px / 1.25 | a choice's words |
| `--t-aside` | Source Sans 3 400, 13 px / 1.35 | a choice's second line; a note; a cost |
| `--t-label` + `--track-label` | Source Sans 3 600, 10.5 px, capitals, .16 em | a section's label (People, The company); never a choice |
| `--t-key` | Source Sans 3 600, 10.5 px | a key number; a count |

Every other size in the sheets is debt. The rule: a component takes its size from a role, and a role that is missing is
added here before it is used.

### Surfaces

| Token | Use |
|---|---|
| `--panel-ground`, `--panel-blur`, `--panel-edge`, `--panel-radius` (14 px), `--panel-shadow` | the one panel over a painting |
| `--choice-ground`, `--choice-edge`, `--choice-ground-hot`, `--choice-edge-hot`, `--choice-radius` (10 px), `--choice-h` (46 px) | the choice row at rest and under the hand |
| `--indicator-w` (3 px) | the one indicator's width |
| `--paper-*` | the light composition (the book) |
| `--glow-step` | the followed step's light, the only glow at rest |
| `--ring-focus` | keyboard focus: light, never gold |

The corners are round (14 px for the panel, 10 px for a choice) where the current sheets use 2 px. A rounded,
blurred card over a painting reads as an object in the game. A square box with a hairline reads as a web form.

## 3. Layout rules

1. **The safe zone** stays the outer tenth (`--safe-*`). Only a painting, or a surface's background, goes past it.
   Everything readable or touchable stays inside. This is checked by `SafeZone.breaches` in the capture harness and in
   the existing browser specs.
2. **One panel at rest.** On a landscape screen it is at most `min(30rem, 40vw)` wide (veil) or a band across the
   foot (plate). On a phone or an iPad held upright it is a sheet across the zone's width, and at most the zone's
   height less the likenesses' row.
3. **At most four choices** in the scene's own menu (`--menu-max`), and at most five rows in a lens before
   "All N …". A menu never scrolls at rest. The telling may scroll inside the panel, but its first three sentences
   must be in view.
4. **Who is present stands on the picture, not in the panel.** The likenesses go on the side of the painting away from
   the panel. Danger stands at the right. On an upright screen they go above the sheet, never over its text. (The
   baseline's crowd on a phone drew 15 faces over the telling.)
5. **Nothing is a page of its own** that could be a lens (attend, §5) or a thing unfolded in place. The book is the
   exception: it is read, not lived, and it is the one light composition.

## 4. Components

| Component | Today | The system's one form | Status |
|---|---|---|---|
| **Choice row** (Menu) | led act (rounded line), conversation question (numbered box), fight move (tile), Go row (glyph + minutes), opener (capitals), lens tile (chip) | one row: indicator · words · aside · key. One grammar for "a thing you can do" | styled across scene, talk and fight under `data-look`; one shared component in TSX is the integration step |
| **Panel** | the focus column, the explorer, the book's sheet, the hex card, each its own | one surface (`--panel-*`): head, body that may scroll, menu, tool row | veil and plate |
| **Tabs** (attention) | the rail's Talk/Go/Look icons, whose pips cold players never decoded | words with counts over the menu: Here · People 15 · Things 6 · Ways 20, and a pip only where the lens holds something toned | attend |
| **Likeness** | a ring with name, 50–70 px, pip at the shoulder | unchanged; only those the company can turn to, or whose face is painted, are drawn (a departure from 7 November: see proposal §4) | veil and plate |
| **Sheet** | the book, the explorer, the hex card | the book as paper (§6); the rest folded into the panel | book: all looks |

## 5. The atlas, restated as rules a check can hold

| Rule | Mechanical form |
|---|---|
| Gold is the followed undertaking's next step, and nothing else | the stylesheet spec: gold only under selectors that say aim (`aimed`, `followed`, `continues`, `tone-gold`, …); 19 exceptions listed, may only shrink. At runtime: at most one gold-bearing choice on a page (the capture harness counts gold elements: 1 at rest, 2 once followed, the rail mark and the led act) |
| One indicator per opportunity | at most one `.pip` or `.prism-bar` per choice or likeness (runtime check, harness) |
| Facet colours: silver (worth a look), green (gain), blue (to learn), red (danger), violet (uncanny), coral (a companion) | `Emphasis.tones`; no new colour; overlaps as an OKLab gradient (`Emphasis.prism`) |
| Faint is not dim | faint: a soft pip, half opacity, ringed (perceived off along a way). Dim: the whole control lowered (nothing new). Shut: disabled, says why |
| A token's name says what it paints | `--blue` must not be gold; the aliases in `foundations.css` (`--blue`, `--red`, `--yellow`, `--river`) should go |

## 6. Dark and light

- **Dark (the stage):** rest, talk, fight and travel. These are lived, and the painting carries the colour.
- **Light (paper):** the book (character, notes, pack and story). These are read. Giving the book a different
  material says "you have stepped out of the scene to consult something", which is what the owner's "dossier"
  framing asks for (amendment 6, A). It is done by redefining the ink tokens inside `.book-frame` (`--ivory` becomes
  the ink, `--dim` the faded ink, and so on), so the book's own sheets change only where they hard-code a colour.
  The first render shows that the sheets read as paper, and that a few hard-coded greys and the item tiles' amber
  plates need their own paper values.

## 7. Constraints a machine can enforce

Ranked by value for cost. The ones marked **built** are in this branch.

| # | Constraint | Layer | Status |
|---|---|---|---|
| C1 | **Gold only where the aim is**, in the stylesheets | headless, ms (`test/design-constraints.test.ts`) | **built** (ratchet: 19 known, may only shrink) |
| C2 | **Literal type sizes and tracking may only fall**: 38 sizes and 20 trackings today; the design-system sheet holds at most 5 literals | headless, ms (same spec) | **built** |
| C3 | **The telling's budget**: three sentences counted at a glance, with change and aim-bearing lines always told and nothing cut mid-sentence | headless, ms (`test/scene-budget.test.ts`, pure `SceneBudget`) | **built** for the composition. The engine-side spec `test/scene-sentence-budget.test.ts` stays `.failing` until the narrator types its lines (proposal §5) |
| C4 | **Nothing touchable outside the safe zone** | browser (`SafeZone.breaches`); the harness reports per shot | exists; the harness reports it for every composition |
| C5 | **A choice's label does not wrap** | browser (line boxes per label); the harness counts wraps per shot | measured; to become a spec over the menu components once they are one component |
| C6 | **At most one gold choice per page; at most one indicator per choice** | headless over the screen model is possible: the glance's `Promoted.continues` is at most one, and the page draws gold only from it. Today's gold-walk specs hold the engine half | proposed |
| C7 | **At most four choices at rest; a lens at most five rows before "All"** | headless over `GlanceStage.foreground` (pure) | proposed |
| C8 | **No scrolling at rest except the telling** | browser (the harness lists every scrolled element) | measured |
| C9 | **`data-choice` only inside the one Menu component** | ESLint rule (proposal C of the M20 screens study) | proposed, after the Menu component exists |
