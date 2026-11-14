# The interaction grammar

There is one way to play Westernesse, on every screen: the title, creation, the scene at rest, the lenses, talk, a
fight, the books. Each screen keeps its own composition (cards, dialogue, the tactical field, destinations). How the
player attends, chooses and returns is the same everywhere.

The design constraint is a game controller: nothing is relearned from one screen to the next. The tie-breaker for any
competing design is the doctrine's question (`DOCTRINE.md`): does it help the player forget the interface and become
interested in what happens next?

## What the engine owns, and what the page owns

**The engine owns:**
- which choices are legal now;
- which few it offers first (`Glance.offer`; `Offers.ranked` for creation, talk and the lenses);
- what each choice is (its type, aspects and marks);
- what choosing it does;
- which pages are no act (`Told.pages`);
- which fights are foregone (`Foregone`);
- what of a telling is said at once and what waits for a look (`ToldLines`).

**The page owns** how these look: composition, type, light, motion. It never decides a sequence, a legal choice or a
consequence. A field the page lacks is asked of the engine, not inferred.

**The terminal runs the same workflow** through the same projections. There are no browser-only rules and no
controller of the page's own.

## Focus

- **The pointer is the reticle** (IG-15). Wherever the hand is, the cursor is a small ring; over anything that can be
  chosen, four ticks close it; pressed, it tightens and fills at once. A long press, should an act use one again,
  fills it by steps. Touch has no cursor; the tint below does the work.
- **What the hand or the keys are on is lit in its own tone**, at once: a tint of its row's mark (the atlas colour,
  Indicator.of), ivory where it is nothing in particular, gold only for the followed step. Pressed, deeper. Never
  corners, never movement, never a box that changes size.
- **Every button has three states** (IG-16): at rest a row's ground and edge (a choice, not a link), lit under the
  hand, deeper pressed; the same on the title, creation, the scene, talk and the fight.
- **A hand that has not moved lights nothing** (IG-18). The next screen does not light the row under a resting
  pointer: what it rests on was never pointed at. It lights again as soon as the hand moves or presses.
- **Focus answers immediately.** Anything that responds to focus more slowly (a lens's painting, the observatory
  later) follows it and never holds it up.
- **The title answers nothing the hand does** (IG-11, IG-14). Its sky is still: no light following focus, no haze.
  Its one motion is the embers' own slow drift. The studio's mark cuts to the title.
- **Nothing moves under the hand** (IG-08, IG-12). A press never changes which cards are shown or where: the deck
  is the four and "N more", opened only by the player. A passage between screens is a cut or a short fade in place;
  nothing slides, scrolls or wipes.
- **Gold has two uses.** In play it means the aim followed and nothing else. The title's gold name is ceremonial,
  the entry's alone; no focus is gold.
- **One indicator, one colour** (TP-02). An act's mark, a likeness's pip, the place's mark and the rail's pips take
  the act's chief aspect by one precedence (gold, red, green, blue, violet, silver), never a gradient. A companion is
  its icon, never a colour (TP-03). The rest is said in hidden words.

## Choosing

- **A tap chooses.** A click, a tap, or Enter or Space on the focused row: one press, one choice, done at once.
- **A press is taken once, on its own screen** (IG-17). A key held down does its act once (the repeats of Enter, Space
  or a digit are dropped), and a press begun on one screen and let go on the next does nothing there.
- **Creation's cards are chosen at a tap, then Continue.** A held card had looked chosen and done nothing (BP-09).
- **Nothing is held, for now.** A search, a wait, a rest or a camp commits at a tap like everything else (IG-07: the
  hold did nothing at a click). A mark that fills while a costly act is pressed is the design for a future Energy cost,
  built once, in M22.
- **A grave act asks once before it is done.** Something that cannot be undone, a way with no coming back or a fight
  is chosen once, then again to do it.
- **A page with nothing to decide is no act.** The opening's beats and the page after the road meeting go on by
  themselves once read (a hairline fills under them), or at a touch or Enter.

## How many, and the rest

- **Four promoted, as an editorial default, not a quota.** Where there are four or more good choices, four are
  offered, each a different kind of act where it can be. Where there are fewer, there are fewer, and none is made up.
- **The scene's four are the engine's four** (`Glance.offer.primary`), the same four the terminal leads with.
- **The rest is one deliberate step away:** a lens's "All", talk's "Something else…", a fight's kinds.
- **What kind of thing a choice is** (to learn, to gain, worth a look, an aim) is its mark's to say. Those words are for
  a reader of the page alone (BP-08). A row's visible words are the act and what it adds.

## Inspecting further, and coming back

- **A lens changes attention, not place.** Talk, Go, Look and Wait open the people, the places, the things and time in
  the scene's own column, in place of the four. The way on stays beside them. Turning a lens on takes no time.
- **A thing's look unfolds in place.** What can be done with it opens beneath it, in the four or in a lens. It never
  turns the page to the thing (the look-4 regression).
- **The dice are behind a deliberate look.** An outcome is told in prose. How it fell ("How it fell", "The fight, blow
  by blow") is a quiet word away.
- **Back is predictable.**
  - Escape puts away what was opened last: a lens, an opened thing, the map over a town, a book.
  - Inside an enclosed place the way out is the compass's Out, in the column, and the rail's map mark is the compass.

## States

- **A fight is a more dangerous state of the same world.** Its rows are the same rows and its geometry holds still
  (CN-06).
- **A fight the page never had to ask about** (foregone, easily won) is told by its end: who fell, what it cost, the
  way on (BP-01).
- **No dead ends.** An interactive state with no valid continuation is an error, not a resting place. Every page has
  its way on: Continue, Go on, Out, or Back.

## Where each rule is held

| Rule | Spec |
|---|---|
| The four are the engine's | `test/small/offer-page` |
| A thing's look in place | `test/small/look-in-place` |
| Kind words off the page | `test/small/kind-words` |
| One indicator, one colour | `test/small/indicator-page` |
| A tap commits | `test/tap-browser` |
| A foregone fight and the dice | `test/small/foregone-page` |
| Reading pages | `test/small/reading-pages` |
| The compass | `test/small/compass-stage` |
| The fight's stable geometry | `test/fight-geometry-browser` |
| Nothing moves under the hand | `test/steady-start-browser` |
| The title's immediate focus, its still sky, its embers | `test/opening-browser` |
| The reticle cursor, the tint, nothing moves | `test/reticle-browser` |
| A press once, on its own screen; nothing lit under a still hand | `test/press-guard-browser` |
