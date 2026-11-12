# The screens, 12 November 2026: a contact sheet and what it shows

For Mission 21's aesthetic investigation. Written as evidence, not as a design: it records what the game's pages are,
how they are composed at four sizes, and what is wrong with them as rendered, with the few defects fixed the same day.

## How the sheets were made

One real game in a1 (the "Coming home" origin, a lone warrior), played through the browser by the test driver at
**1280×800** (a laptop), **1180×820** (an iPad held level), **820×1180** (an iPad upright) and **390×844** (a phone):
creation; the road in; Millholm's camp at rest; Go and Look opened; the Pack, Character, Notes and Story pages; Talk
turned on; a conversation (Bask, the salter); the corn-store cellar by torchlight; the rat fight, its end and after; the
map, a hex chosen, a hex reached; a town's hex; the town entered.

- `sheet-1280x800.jpg`, `sheet-1180x820.jpg`, `sheet-820x1180.jpg`, `sheet-390x844.jpg`: twenty states each.
- To make them again: copy `../../evidence-tools/screens/zz-sheet.test.ts.txt` to `test/zz-sheet.test.ts` and run
  `KYRIE_BROWSER=1 bun test test/zz-sheet.test.ts` (it writes PNGs to `$SHEET`, default `/var/tmp/kyrie/m20/sheet`, and
  prints every element that scrolls on each page); compose with the Python snippet in the same folder. Delete the copy.

## The pages and their parts

| Page | What composes it | Where its code is |
|---|---|---|
| Creation | a painting; a question; a row of cards (emblem, name, line); Details and Continue; the corner words | `web/reader/creation/*`, `frame.css` |
| The scene at rest (opening, town, cellar, site) | the painting edge to edge (darkened by the hour out of doors); the place's name and line top left; the telling on the painting at the right with a shade behind it; up to four led acts, each with a rounded line at its left in the tone of what it is; the rail of marks at the foot right | `world-stage.tsx`, `glance.tsx`, `scene-rail.tsx`, `rest.css` |
| Lenses | Talk: the likenesses across the painting's foot; Go and Look: small tiles there (at most six) | `lenses.tsx`, `scene-rail.tsx` |
| Go, Look (opened) | **still a list in the panel** ("Go", in-the-camp groups, minutes; "Look", things, then "About the place") beside the lens's tiles | `explorer.tsx`, `wayfinder.tsx`, `at-hand.tsx` |
| Conversation | the person's painting large at the left with their name over it; what was said; numbered questions; Trade apart; Take your leave | `talk-stage.tsx`, `talk.css` |
| The book (Character, Notes, Pack, Story) | a dark sheet over the painting, tabs across its top, Back first | `book.css`, `stage/*-page.tsx` |
| The fight | status line; the company left, foes right, each a card with its portrait as the left third; what just passed in the middle; the moves as tiles (Attack, Abilities, Other), "Let … fight this turn", "The fight so far" | `fight-stage.tsx`, `fight-moves.tsx`, `fight.css` |
| The map | the 3D hex board; the company's likeness; the hex card (where you are / journey to / across country) with Set out or Enter | `world-stage.tsx` (Board, Hex), `board-*.tsx`, `world.css`, `book.css` |

**Atlas paths** (how a tone reaches the screen): the one pip (`Pip`, beside a likeness, on a rail mark, before a way);
the rounded line at a led act's left (the prism bar for several aspects, `Emphasis.bar`); a way's left edge in Go
(`wf-row.toned`); the gold of the aim followed (route on the map, the way's edge, the led act). Faint is the soft pip;
dim is opacity. Nothing else carries a tone.

## What the sheets show

Fixed on 12 November (in the commits after `3299cccb`):

1. **The fight's actions scrolled at every size**: on a laptop "Let Hamo fight this turn" was cut in half and "Go on"
   cut off; on a phone the moves had 27 px of their 176. The moves now keep their room and the sides scroll.
2. **A beast's portrait in a fight** stood as a parchment square in a dark band, not filling its panel: the panel is
   now the parchment.
3. **The acting fighter** wore a double ring (border plus a 1 px ring plus glow) and a bright line between portrait and
   card: now its edge is lit softly and the line between stays neutral.
4. **The place's line ran into the telling** ("25 Haysel" into "wider than any rat") once the panel started at the
   safe zone's top: the heading now keeps to the painting's side.
5. Earlier the same day: the safe zone as the outer tenth (E218), Talk as a lens (E217), creation's cards growing to
   their words, the map's tools, the conversation's and the fight's margins inside the zone.

Still wrong, by severity (each seen in the sheets; the scroll measurements are the probe's):

| # | What | Where | Note |
|---|---|---|---|
| S1 | **Go and Look are still pages** in the panel: a list of every way or thing, beside the lens's tiles that say the same; Look's list scrolls (1 026 px in 490 at 1280×800; 1 362 in 488 on a phone) | 04, 05 at every size | the owner, 12 November: they should be lenses only (see proposal B) |
| S2 | **The telling overflows** the panel: a little on a laptop (opening 416/385, town 433/417), badly on a phone (opening 666/269, town 656/355) | 02, 03, 10 | narration volume against a fixed viewport: the first place says four paragraphs before its acts |
| S3 | **The fight on a phone**: foes' names cut ("The seco…"), the third foe below the fold of the sides, the moves two to a row | 13 at 390 | a phone's fight wants one column of foes as a strip, or the cards without their middle column |
| S4 | **Three menu styles**: led acts (rounded line at the left, borderless), conversation questions (numbered boxes), fight moves (tiles), Go rows (glyph and minutes) | 03, 11, 13, 04 | proposal A |
| S5 | **The book pages float**: a dark sheet with the painting showing at both sides (desk), its Story page nearly empty, its Pack a few tiles in a large field | 06–09 | not broken; the least composed pages |
| S6 | **The town's hex card on a phone scrolls** (380 in 336) | 19 at 390 | its second button half under the fold |
| S7 | **Talk persists** between places: on, it stays on, so the dead rats' likeness stood in the rat-runs after the fight | 15 | whether a lens should close on leaving a place is a design question |
| S8 | **A crowd of likenesses** (eleven at the camp) is two rows on a phone and a long row on a desk, mostly people with nothing to say (pips on two) | 10, 20 | who is drawn (salience) matters more than how |

## Three proposals from the owner (12 November), weighed

**A. The cinematic menu as the one selection menu, fights included.** The led act (name, a quiet second line, the
rounded line at its left in the tone of what it is, a key number) is the clearest control the game has, and it already
carries the atlas. Using it for the fight's moves (Attack, each ability, Other's contents) and for a conversation's
questions would give one grammar for "a thing you can do". What it takes: `FightMoves.View` renders `Act.View` already
(`className="move main"`), so the change is mostly `fight.css`'s `.moves` tiles becoming a column of led acts, and the
aiming state ("choose whom, on the field") staying as it is; the conversation's `.replies .act` are also `Act.View`
with a prism bar already (talk.css). Risk: the fight's moves are a row today because several (Abilities, Spells,
Items, Other) open panels; as a column of four they need the same "opens" mark. **Recommendation:** do it in M21's
aesthetic work as one component (`LedAct`), not page by page.

**B. Go and Look as lenses only, no page.** Turned on, a lens shows clickable portraits of the places (Go) or things
and people (Look) over the painting, and touching one inspects it or acts on it; the acts that matter are promoted into
the four (the glance's heuristic ranks them). What it takes: the tiles exist (`Lenses.Strip`); what each tile opens is
today the panel's list item (`Wayfinder.pick`, `AtHand.pick`), whose detail pane (what a way is, what can be done with a
thing) must move into the panel as a single selected item, not a list; places need pictures (scenery paintings for
quarters and buildings), which most lack; and the promotion heuristic (`Promotion.pick`) must already rank a found
thing's act or a way toward something new into the four, which it does for aims and teachings but not for ordinary
curiosity. Risk: a place with twenty ways has twenty tiles; the lens needs the same cap and order as Go's tiles (six,
the toned first) with "all ways" behind it. **Recommendation:** M21, after A, with the lens tile as the only way into
an item's detail; the browser driver's `opened()` path (which finds a choice through Go… or Look…) must change with it.

**C. Foundations: one menu, one safe frame, enforced (the owner, 12 November, evening).** The owner's question: why
not one main menu component rendered on resting and combat pages alike, combat's nested menu a variation; and
invariants enforced globally, not page by page. The diagnosis is that the atom is shared already (`Act.View` renders a
led act, a conversation's question and a fight's move) but the *menu* is not: `GlanceStage` (the led list, rounded
lines), `TalkStage`'s `.replies` (numbered boxes) and `FightMoves` (tiles, a toolbar and a panel) each lay out, number
and key their choices their own way, and the safe zone is a set of CSS variables each page must remember (the book, a
conversation on a phone and the fight broke it until mended one by one on 12 November). The structural version:

- **`Menu`**: the one component that renders choices: up to N, the one indicator at the left in the tone of what each
  is, a quiet second line, a number for its key, focus and arrows; an option with children opens them in place (the
  fight's Abilities, Spells, Items and Other; Trade; a way's acts), as a variation of the same component. The fight
  keeps only its aiming state ("choose whom, on the field") outside it.
- **`SafeFrame`**: the one page template; its content box is the safe zone. Only the painting draws outside it;
  anything else is clipped, and in development flagged. Pages render into it instead of positioning against `--safe-*`.
- **Enforced**: a contract test over rendered pages (no `[data-choice]` outside a `Menu`, nothing touchable outside the
  `SafeFrame`), and an ESLint rule that `className="act"` and `data-choice` appear only in `Menu`.

This is the foundation A and B are best built on, and M21's first aesthetic task in the builder's judgment.

None is begun here: the owner's brief of 12 November evening asks M20 to land, and M21 to take the aesthetic
investigation separately.
