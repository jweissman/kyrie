# Three compositions, compared, and how to integrate one (Mission 21, 12 November 2026)

By the independent aesthetic investigator, on branch `m21-look`. It answers `critique.md` with three materially
different interactive compositions. Each is built in the real reader against real game states, behind an address
flag, so the game's default is untouched:

| Flag | Composition | One line |
|---|---|---|
| `?look=veil` | **V. Veil** | the painting whole and unshaded; everything else in one card over it |
| `?look=attend` | **A. Attend** | the scene as it is; lenses are words over the one menu, and they promote their kind of act into it instead of opening a page |
| `?look=plate` | **P. Plate** | the painting shown as a plate; the words in a band beneath, like a page of an illustrated book |

All three share the design system's pieces (`design-system.md`):

- one choice row, used for the scene's acts, a conversation's questions and a fight's moves;
- the seven type roles;
- the three-sentence budget for the telling (`SceneBudget`);
- the fight's phone strip;
- the book as paper.

Evidence:

- **Comparison sheets**, `shots/compare-<size>.jpg`: nine states down (opening, town, crowd, Go, Look, the
  conversation after an answer, the fight, the fight with Abilities opened, the pack) and the four drawings across
  (the game as it is, veil, attend, plate).
- **The measures of every shot**, `shots/measures-compositions.json`: 19 states × 4 sizes × 4 drawings.
- **Baseline pictures cited by the critique**, `shots/baseline-*.jpg`.

All of it comes from one walk per size: the harness redraws each state under each composition
(`kyrieMono.relook`). The full-size PNGs are in `/var/tmp/kyrie/m21-look/run2`, not committed. To make them again,
copy `tools/zz-look.test.ts.txt` to `test/zz-look.test.ts` and run it with `KYRIE_BROWSER=1` (about 7 minutes).

## 1. What each composition is, and how it behaves in the hard states

### V. Veil: one card over the whole picture

**Composition.**

- The painting runs edge to edge with no shade over its right half. A soft vignette sits only behind the card.
- One card, at the foot of the zone's left side, holds four things in this order:
  - the place's name and line (no separate title block);
  - the telling, under the budget, with "More of the place" in place;
  - the menu (at most four rows);
  - the tools (Talk, Go, Look, Wait, Search · Map, Book) as its foot row. There is no separate rail.
- Who is present stands on the painting at the card's other side, danger at the right.
- On a screen held upright, the faces stand at the top of the zone and the card is a sheet at its foot, clear of them.

**In the hard states.**

| State | What the shots show |
|---|---|
| Crowded green (`04-crowd`) | the faces stand on the painting's lower right, away from the words. The emblem discs for people with nothing to open are dropped; six emblem discs for people who *can* be talked to remain, a content gap (portraits), not a layout one |
| Upright iPad and phone | the clearest of the three: faces above, one card below, nothing over the words |
| Go and Look opened | still the explorer's lists, now inside the card: veil changes where things are, not what a lens is. Paired with attend's lenses, this is the recommendation |
| Conversation and fight | unchanged in composition; they take the choice row and the fight's column |
| Book | paper |

**Measured, at 1280×800.** The town's telling falls from **357 words in 18 sentences to 209 in 10**. The budgeted
setting is three sentences. The rest is what came of arriving and the brother's line, which the budget does not yet
cover (§5). On a phone, nothing overlaps the telling.

**What it costs.** The title and the rail move into the card, so specs that find `.world-bar` or position the rail
change. The card is one more surface over the painting than the cinematic view's shade, but it is the only one.

### A. Attend: lenses that promote, not pages

**Composition.**

- The cinematic scene is kept as it is: the painting, and the telling at the right.
- Over its menu stand four words: **Here · People 15 · Things 6 · Ways 20**. A pip appears only where a lens holds
  something toned. These words replace the rail's Talk, Go and Look icons; Wait, Search, Map and Book stay as icons.
- Choosing a lens never opens a page. The telling stays, and the menu shows that lens's best five, with "All N ways"
  beneath:
  - **People:** whom to turn to. Toned first, then whoever will talk. Touching a row opens the conversation.
  - **Ways:** the aim's way first, then those lit, then those sensed (faint), then the rest, idle last. Touching a
    row goes.
  - **Things:** what is at hand. A thing with one act is that act ("Drop the bar across the camp gate"). One with
    several unfolds in place: its sentence, then its acts beneath, in the same menu.
- The lens tiles over the painting are hidden. The menu is the lens's surface, and the tiles had said the same things
  twice.

This is the owner's first M21 direction, taken literally: "There shouldn't be separate explore/perceive page — they're
just lenses, they should leave the scene intact but more highly favor actions of those kinds to be promoted to the top
four actions. Otherwise it should be exactly the same."

**In the hard states.**

| State | What the shots show |
|---|---|
| Go | 20 ways become 5 rows and "All 20 ways"; **33 touchable things on screen become 9** (the final run), and nothing scrolls but the telling |
| Look | "Gather a handful of dandelion" and "aster" rank above the corn-store padlock: Things ranks by what the reader knows (a tone), and nothing promotes ordinary curiosity. The engine's promotion rule must rank this lens (see risks) |
| People | fifteen likenesses become five rows of "Talk to Osbert · your brother", "Look at the grey dog", "Talk to Bask · salter" and "All 13 people". The faces stay on the picture, and the rows say what each face is |
| Upright iPad | the first render drew the faces over the panel. Fixed by keeping the panel clear of two rows of faces |

**What it costs.** The words "People", "Things" and "Ways" are interface vocabulary. They are honest and
learnable, and they replace three glyphs whose pips nobody decoded, but they are not diegetic. The browser driver's
`opened()` path (Go… then a row) and about a dozen browser specs are built on the explorer, and they change with it.

### P. Plate: the picture as a plate, the words beneath

**Composition.**

- The painting is shown as a framed plate in the upper part of the screen. Its own blurred self (the shell's ambient)
  fills round it, so it is never cut to the screen's shape.
- Who is present stands in a line along the plate's lower edge, into the band.
- The band beneath holds the name and the telling at the left, and the tools and menu at the right.
- On a screen held upright, the plate is above and the band below, like a page of an illustrated book.

**In the hard states.**

| State | What the shots show |
|---|---|
| Crowded green at 1280 | the most beautiful of the three for the painting and the line-up: the faces read as a cast on the picture's edge |
| Telling in the band at 1280 | the band is about 368 px tall less the safe zone's 80 px at the foot. The telling gets about five lines, and scrolls even under the budget |
| Upright | natural, and the closest to the owner's gut note ("hovering a smaller modal… over a fullscreen painting" is veil; "showing [paintings] in full rather than cropping" is plate) |
| Phone | the plate is a strip and the band does the work |

**What it costs.** On a landscape screen, the safe zone's outer tenth taxes a band twice: at its foot, and in the
plate's inset. The first render put the tools past the zone (7 breaches a shot) until they moved to the band's top
right. The plate also crops the painting into a wide strip. Showing a landscape painting whole needs the band, and
the band then needs more height than a laptop has.

## 2. Comparison

| | Base (as it is) | Veil | Attend | Plate |
|---|---|---|---|---|
| Things on screen besides the painting | title block, telling, acts, rail, faces | one card, faces | title block, telling, tabs + menu, a 4-icon rail, faces | plate, band, faces |
| Telling at a glance (town, 1280) | 357 words / 18 sentences | 209 / 10 (setting 3) | 209 / 10 | 209 / 10 |
| Go opened: touchable things (1280) | 33 | 30 (lists in the card) | **9** | 20 |
| Look opened: touchable things (1280) | 21, the list scrolling 1 217 px in 490 | 21, in the card | **9**, nothing scrolls but the telling | 21 |
| Conversation after an answer, phone | one question in view (32 px of 250) | four in view | four in view | four in view |
| Fight, Abilities opened (1280) | **5 controls past the safe zone** | 4 | 4 | 4 |
| Crowd on an upright screen | faces over the words | **clear** | clear after fix | clear |
| Safe-zone breaches at rest | 0 | 0 | 0 | 7 a shot at first; 0 after moving the tools |
| Painting seen | cropped, right half shaded | **whole, unshaded** | cropped, right half shaded | whole as a plate, smaller |
| Changes interaction | – | no (layout) | **yes** (lenses) | no (layout) |
| Spec and driver impact | – | moderate (title and rail move) | high (explorer goes) | moderate |

The full measures, per shot, are in `shots/measures-compositions.json`.

## 3. Recommendation

**Integrate veil's composition with attend's lenses: one card over the whole painting, whose menu the lenses fill.**

- **Veil** is the strongest **layout**. It does the most to remove the web-app feel: no title block, no separate
  rail, no shade, one object. It holds at every size, including the crowded upright iPad, where the game as it is
  draws faces over the words.
- **Attend** is the strongest **interaction**. It is the only one of the three that changes what Go and Look *are*,
  and it is what the owner asked for. Its tabs sit naturally at the head of veil's menu, and its four-icon foot
  becomes veil's tool row.
- **Plate** is not recommended as the resting scene on a landscape screen: the safe zone and a laptop's height starve
  the band. Its idea is right for two places, and I would keep it for them:
  - the **opening** and **arrival in a new country**, where a painting shown whole with three sentences beneath is
    the moment;
  - **phones**, where veil's upright form is already nearly a plate.

Departures from standing rulings, with reasons:

1. **Faces with nothing to open and no portrait are not drawn** (veil and plate). This departs from 7 November's "everyone
   on the picture". That ruling protected people *with* something for the company. They keep their face and pip, and
   the People lens names everyone. Evidence: seven of fifteen discs on the green, and faces over the words on upright
   screens.
2. **The rail's Talk, Go and Look become words** (attend). This departs from 11 November's "tiny rail of icons". The
   icons' pips were never decoded by a cold player, and words with counts say what a lens holds before it is opened.
3. **The book becomes paper.** A material change for what is read, not lived. It is the "dossier" of amendment 6.

## 4. Integration plan

The order puts the least risk to the playability investigator's fixes first. Each step is behind the flag until it is
seen, then becomes the default by deleting the flag's selector prefix, not by rewriting.

| # | Step | Files | Risk to playability work | Gate |
|---|---|---|---|---|
| 1 | **One choice row**: a `Menu` and `ChoiceRow` in TSX, rendered by `GlanceStage.Acts`, the openers that act, `TalkStage`'s replies and leave, and `FightMoves`; the look.css row rules become the default | `stage/act.tsx` (or a new `stage/menu.tsx`), `glance.tsx`, `talk-stage.tsx`, `fight-moves.tsx`, `look.css` → `foundations.css` | **low**: `data-choice`, `data-action` and key numbers are kept, so the driver is unchanged | the frame, glance and fight browser specs; C5 (no wrapped label) as a spec over the row |
| 2 | **The telling's budget, typed**: the narrator emits typed lines (`lead`, `standing`, `life`, `changed`, `bearing`) from observation facets (`Observation.teaches`, `.about`, `.aspect`), and applies `SceneBudget` itself, so terminal and browser tell the same. The arrival's exchange comes inside the budget | `src/presentation/narrator.ts` (`Leaf.situation` typed), `scene-budget.ts`, `told.tsx` | **medium**: specs that read the telling's words change; clue chains must hold, measured by `tools/budget-measure.ts` | `test/scene-sentence-budget.test.ts` loses `.failing`; no clue held back |
| 3 | **The veil panel**: heading and rail into the scene's one card; the explorer, while it lasts, inside it | `world-stage.tsx`, `rest.css`, `look.css` | **medium**: specs that find `.world-bar` or measure the rail's place | `SafeZone` specs at four sizes; the harness's crowd shots |
| 4 | **Lenses that promote** (attend), replacing the explorer. First make **focus an engine concept** (M21 recommendation 8), so the lens and the thing unfolded are runtime state the terminal shares, and the promotion rule is the engine's (`Promotion`), not the reader's sorting | `src/ui/attention.ts`, `glance.ts` (promotion by lens), `stage/attention.tsx`, `explorer.tsx` deleted, driver `opened()` | **high**: the driver and about a dozen browser specs go through Go…; the playability fixes for "the way back" (PR-08, E206) live in the scene's openers and must be kept in Here | a headless spec that each lens's rows resolve to legal acts (the promise contract); the walker reaches the rats through lenses alone |
| 5 | **Activity layouts**: the fight's centre beat filled from round one, the order chips gone, the phone strip; the conversation's two edges (typographic page when unpainted, the choices' height on a phone); the book as paper with its hard-coded greys and amber plates given paper values | `fight-stage.tsx`, `fight.css`, `talk.css`, `book.css` | low | the fight and talk browser specs; render review at four sizes |
| 6 | **Retire the debt with the ratchets**: gold exceptions to zero, the colour aliases removed, literal sizes to the seven roles | all sheets | none | `test/design-constraints.test.ts` limits lowered with each step |

**What must not be lost:**

- the large-portrait conversation, carried over whole;
- the one indicator and gold's strictness;
- the way back kept in sight in a site (E206);
- the honest odds;
- every act still reachable by keys and by the driver's `data-choice`.

## 5. The narration budget experiment

**Prototype.** `SceneBudget.compose` is a pure function in `src/presentation/scene-budget.ts`, with a 14 ms spec in
`test/scene-budget.test.ts`. It tells three sentences:

1. the place's first sentence (what it is);
2. one sentence of its life now (who or what is about);
3. the place's next words in its own order.

What has changed and what an aim bears on are always told, beyond the three. The rest is held whole, never cut
mid-sentence, behind "More of the place", which unfolds in place. It is a cap, not a template. It writes nothing,
and so it imposes no formula on the prose.

**Seen in play.** The camp's three sentences are:

1. "Millholm is half houses and half wagons…"
2. "Cook-smoke drifts between them, smelling of cumin and charred onion."
3. "The alehouse dog, a rough-coated hound, sits by the door of Corrin's alehouse, thumping his tail on the step."

That is a place, a smell and a life, which is the sensory line the brief asks for, and it comes from the writing as it
stands. The held lines (the Mistmere, the herd, the swineherd, the lockup door, the notice's text) are each better met
by Look or by the act that reads the notice.

**What the presentation alone cannot do.** These are the content and engine changes it needs:

1. **Typed lines.** The page knows a line only as text. "Bearing on an aim" is guessed from capitalised names
   (`Told.ranked`), which is the label heuristic the owner has ruled out. The narrator holds the observation behind
   each line (`Observation.teaches`, `.about`, `.aspect`), and the leaf should carry them. The measurement script
   (`tools/budget-measure.ts`) counts clue-bearing observations the budget would hold back.
2. **The arrival's whole telling under one budget.** What came of arriving ("You know now…", the brother on the rail,
   the dog barking) is told outside the setting, and is most of what remains over budget (10 sentences at the camp).
   It needs its own budget, or to share the three.
3. **Authors' first sentences.** The budget works only if a place's first sentence says what the place is. At the camp
   and the causeway it does. The authoring trail should say so: the first sentence is what the place is, the second
   what one senses. That is a convention for authors, not a rule for the page.
4. **Notices out of the prose.** A notice's text in capitals inside the telling duplicates the act that reads it.
   The notice should be told as a thing ("A notice is nailed to the clerk's trestle by the well"), with its words
   when read.

**Measured over the engine's own sample** (`tools/budget-measure.ts`: the opening place and every room of the first
town, in a1 and kahitude; 160 scenes, the sample of `test/scene-sentence-budget.test.ts`):

| | Average sentences | Scenes of 5 or more | Clue-bearing observations held back (of 189) |
|---|---|---|---|
| As told today (`Narrator.leaf`) | 3.7 | 22 | 0 |
| Budget, untyped (the prototype) | **2.4** | **0** | **29** |
| Budget, typed: a paragraph with a facet-bearing observation always told | 2.6 | 9 | 0 |

The untyped budget passes both of the owner's checks, but it hides 29 observations that teach, are about someone, or
carry an aspect. That is the risk the retrospective named ("a hard three-sentence cut would hide clues"). The typed
budget keeps every one and meets the average, but 9 scenes still tell five or more: places like the landing at
Thornhaven and the camp at Millholm hold many facet-bearing paragraphs. Two changes, both needed:

1. **The engine types its lines** (above).
2. **Authors keep a facet-bearing observation to one sentence**, or let it be met by Look. `about` is also broad, since
   it marks any line about an entity; a narrower "clue" facet (`teaches`, or an aspect of knowledge) would hold back
   less.

## 6. What didn't work, candidly

- **Plate at laptop size.** It is beautiful in a still and cramped in use. The safe zone's foot costs the band a
  quarter of its height.
- **The budget alone does not make the scene short.** At 1280 the telling went from 18 sentences to 10, not to 3,
  because what came of arriving is told outside it. The prototype bounds the place's description; the arrival needs
  the engine change above.
- **Attend's Things lens ranks badly.** Plants come before the padlock. The reader has no curiosity ranking of its
  own, and it should not invent one: the ranking must come from the engine's promotion.
- **The emblem discs are a content problem.** Hiding them is a stopgap. Six talkable people at the camp have no face,
  and the page cannot fix that.
- **The book as paper is a first pass.** The item tiles' amber plates and some hard-coded greys need paper values,
  and the pack is still four tiles in a large field.
- **The fight is not solved.** The moves as a column are taller than the old row of tiles. "The fight so far" stands
  18–25 px past the zone's foot, and with Abilities open, 3–4 of its eight moves do too. The game as it is fails here
  as well (5 controls past the zone with Abilities open at 1280, measured for the first time by this walk). The fight
  needs its own composition: the moves beside the beat, the beat filled from round one, no order chips.
- **Choice labels still wrap.** One wrapping question in the conversation became a balanced two-line row (4 wraps
  against the base's 3 after an answer). One line per label is a content budget (about 40 characters), not a CSS rule.
- **The conversation was not recomposed.** It was the one page I was told not to lose. It takes the choice row; its
  phone height and its unpainted form are listed, not fixed.
