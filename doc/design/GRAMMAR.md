# The interaction grammar

*Revised 16 November 2026 to the owner's rulings (`doc/architecture/mission-21/owner-rulings-nov16.md` and its
amendment). Where the build does not yet comply, the rule says* Not yet. *This is the one contract; older documents that
differ are superseded where they differ.*

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
  chosen, four ticks close it; pressed, it tightens. Where a press is held (below), the cursor's own ring fills while the
  hand is down. Touch has no cursor; the tint below does the work.
- **What the hand or the keys are on is lit in its own tone**, at once: a tint of its row's mark (the atlas colour,
  Indicator.of), ivory where it is nothing in particular, gold only for the followed step. Never corners, never
  movement, never a box that changes size.
- **Rows are undressed** (the owner, 16 November): no box or edge at rest, on the title, creation, the scene, talk, the
  map's menu and the fight alike. A row is a choice by its mark and its line. *Not yet: the creation cards, the map's
  zoom, the Book's tabs, the fight log's toggles and some forty other boxed buttons (button-discovery.md); and hover and
  the keys' focus look the same (M22 step 3 gives each its own look, and a pressed state).*
- **A hand that has not moved lights nothing** (IG-18). The next screen does not light the row under a resting
  pointer: what it rests on was never pointed at. It lights again as soon as the hand moves or presses.
- **The keys are on a row from the start.** Where a screen marks a row as current (the title's New game, creation's
  considered option), that row has the keys' focus, so Enter does what the page shows (M22: the title's lit New game had
  not had it).
- **Focus answers immediately.** Anything that responds to focus more slowly (a lens's painting, the sign's sky) follows
  it and never holds it up.
- **The title answers nothing the hand does** (IG-11, IG-14). Its sky is still: no light following focus, no haze.
  Its one motion is the embers' own slow drift. The studio's mark cuts to the title.
- **Nothing moves under the hand** (IG-08, IG-12). A press never changes which rows are shown or where. A passage
  between screens is a cut or a short fade in place; nothing slides, scrolls or wipes.
- **Gold has two uses.** In play it means the aim followed and nothing else. The title's gold name is ceremonial,
  the entry's alone; no focus is gold.
- **One indicator, one colour** (TP-02; the colour atlas, 15 November). An act's mark, a likeness's pip, the place's
  mark and the rail's pips take the act's chief aspect by one precedence: gold, red, green, blue, violet. Silver and
  rose are retired: exploration and companionship are icons, never a colour (TP-03). The rest is said in hidden words.

## Choosing

- **A tap chooses**, for every act that is not held: a click, a tap, or Enter or Space on the focused row; one press,
  one choice, done at once.
- **A press is taken once, on its own screen** (IG-17). A key held down does its act once (the repeats of Enter, Space
  or a digit are dropped), and a press begun on one screen and let go on the next does nothing there.
- **Holding, only where it matters** (the owner's ruling 3, 16 November, and its amendment):
  - held: the title's New game and Continue; creation's cards and option rows, and setting out; and the acts the
    engine marks sustained (`Choice.hold`: a night's rest, a camp; grave acts with foreseeable consequences are
    candidates). Never decided by the page from a label.
  - not held: a row that only turns a page or rolls again, the Encyclopedia and Options, and every other act.
  - a ring is drawn only on a held row; no ring promises a hold where a tap already acts.
- **How each hand holds** (`Hold`, 520 ms):
  - the pointer holds until the cursor's ring is full; let go early, it does nothing and leaves nothing half made;
  - a finger or the keys may also tap once to arm the row and tap again to do it (the accessible equivalent of a
    hold; never a dexterity-only long press);
  - a held key commits at full, once;
  - an assistive technology's click (no hand) commits at once.
- **The input contract**, as built (M22 makes it one commit path for every surface; until then the title and creation
  bind it per row, `Hold.bind`):

  | | pointer | finger | keys | assistive click |
  |---|---|---|---|---|
  | tap, an ordinary act | commits on release over the row | commits on release | Enter or Space commits | commits |
  | tap, a held row | nothing; the ring drains | arms ("Hold"), 3 s | arms, 3 s | commits |
  | second tap, armed | (never armed) | commits | commits | |
  | held to full (520 ms) | commits, once | commits, once | commits, once | |
  | let go early, or slid off | nothing | arms | arms | |
  | a press slid off an ordinary row | nothing | nothing | | |
  | key repeat; a press across a change of screen | | dropped | dropped | |
  | a digit | | | the numbered row, as a tap (held where the row is) | |
  | Escape | | | puts away what was opened last | |

- **A grave act asks once before it is done.** Something that cannot be undone, a way with no coming back or a fight
  is chosen once, then again to do it.
- **A page with nothing to decide is no act.** The opening's beats and the page after the road meeting go on by
  themselves once read (a hairline fills under them), or at a touch or Enter.

## How many, and the rest

- **Four in the foreground, everywhere** (ruling 2): people, things, exits, time, spells, inventory, conversations,
  lenses, the fight. Where there are fewer good choices, there are fewer, and none is made up.
- **The scene's four are the engine's four** (`Glance.offer.primary`), the same four the terminal leads with.
- **Attending replaces the foreground.** Opening a lens, a person, a thing, the map or a spellbook puts its choices in
  place of the four; Escape or the way back returns them.
- **More than four are paged, never unfolded.** A pager ("More… n of N") turns the page; it is navigation, not an act.
  Nothing opens beneath a row, and there are no compound acts ("Spells ›" opening a list beside it, "Wait ›").
  *Not yet: the fight's kinds unfold a grid of spells; talk draws Trade and Take your leave beside its three and the
  pager; the sign's twelve are listed at once (M22 orientation §2).*
- **Broad acts before many similar ones.** One "What news is there?" in place of twenty topics of little distinct
  value; the specific topics stay reachable. A legal act is never dropped for presentation's sake.
- **What kind of thing a choice is** (to learn, to gain, an aim) is its mark's to say. Those words are for a reader of
  the page alone (BP-08). A row's visible words are the act and what it adds.

## Inspecting, and coming back

- **A lens changes attention, not place.** Talk, Go, Look and Wait open the people, the places, the things and time in
  the scene's own column, in place of the four. Turning a lens on takes no time.
- **A thing looked at replaces the four with its own**, in the same column; it never turns the page elsewhere (the
  look-4 regression) and never unfolds beneath its row.
- **Detail is disclosed, not acted** (ruling 1). How a fight's exchange fell ("How it fell") is a closed disclosure
  under the prose, reachable by the keys and a screen reader, never a fifth act. The odds before a consequential choice
  are words on the card, not behind hover alone.
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
| A tap commits; a hold only where marked | `test/tap-browser`, `test/hold-browser` |
| A foregone fight and the dice | `test/small/foregone-page` |
| Reading pages | `test/small/reading-pages` |
| The compass | `test/small/compass-stage` |
| The fight's stable geometry | `test/fight-geometry-browser` |
| Nothing moves under the hand | `test/steady-start-browser` |
| The title's immediate focus, the keys on New game, its still sky, its embers | `test/opening-browser` |
| The reticle cursor, the tint, nothing moves | `test/reticle-browser` |
| A press once, on its own screen; nothing lit under a still hand | `test/press-guard-browser` |
