# The first touch: a working pass on the entrance and the primary control

This is the owner's 15 November direction for M22 (the entrance to Westernesse, and the act of choosing an intention),
taken one step further than the interaction research (`interaction/`). It builds on `interaction/study.md`,
`interaction/grammar.md`, `interaction/experiment.md` and `first-minute/critique.md`, and doesn't repeat them. It is a
working proof, not a report:
- two treatments of the primary control, running on real application state behind an address flag;
- creation recomposed in the game's own row grammar, with an observatory for the star sign;
- one fast spec and one browser spec holding the hard rules;
- unedited footage at desktop and tablet sizes, by keys, mouse and touch, and with reduced motion.

Nothing here is the default. Everything is behind `?touch=down` or `?touch=up`.

## 1. What is clumsy now (main at 79ec9fe8, the local build)

Stills are in `first-touch/` (`base-*.jpg`). They were taken from the deployed build's code, at 1280×800.

**The first fifteen seconds.**
- The studio's mark is 3.7 s, then 0.5 s of black, then 3.2 s of title reveal. With the page load, the first choice
  can be pressed at about 10.5 s (any key skips, which most players won't know).
- Then the title offers its ways in with New game lit but **not focused**. The first Down arrow lands on New game
  itself, so one key press does nothing visible. Lit (`aria-current`) and focused are two different states.
- The ways in are boxed buttons with a bar at the left. The Encyclopedia row is two lines tall ("In a new tab ↗"),
  breaking the one-line rule (`base-title.jpg`).

**Creation reads as a form, step by step:**
- **Why** is cards, then the next row of the page is Continue, a boxed button (`base-why.jpg`).
- **Ancestry** and **calling** are cards (right, the owner keeps them).
- **Sign** is cards again: twelve constellations as small glyphs behind "8 more" (`base-sign.jpg`). The sky is reduced
  to an icon.
- **Before** is cards with no sentence at all. On the deployed build, none of the four shown was marked chosen,
  because the chosen kind was outside the four (`base-before.jpg`).
- **Presenting** has no page of its own. It is a segmented toggle (WOMAN / MAN / NEITHER) above the name.
- **Name** is a text field, chips and a dice word (`base-name.jpg`).

That makes six different control vocabularies (card, boxed Continue, corner word, segmented toggle, chip, text field)
before the first act in the world. And each card step asks for two presses: the card, then Continue.

**The press is a click.**
- Every row commits on release (a browser click). With a 90 ms human press, the earliest the game can respond is 90 ms
  after the hand went down.
- The pressed state is the browser's `:active`, and it isn't held: the row looks pressed only while the finger is
  down, and then the page is busy with nothing marked as taken (outside `?ix=`).

**The first scene** (`base-scene.jpg`):
- "Wait / a while / ›" is a three-line row among one-line rows.
- The first goal's sentence is cut off under the rows.
- Every row is an outlined box, so focus is "a slightly brighter box".

**The wait.** Setting out takes 7–13 s on the local build (13 s in the first review run, 7 s in the filmed one). It is
still the longest still moment of the first minute. That's an engine matter (`interaction/recommendation.md`).

## 2. A few references, for behaviour

Different ones from `interaction/study.md`, chosen for press timing, focus and creation:
- **Console RPG menus** (Final Fantasy XIV, Persona 5, Dragon Quest XI on a pad):
  - the confirm button commits **on press, not release**, with its sound on the same frame;
  - focus is one cursor that never coexists with a second highlight;
  - repeat-held confirm never cascades into the next menu (the input is consumed per screen).
  - Persona 5's menus show the whole screen responding to the focused item while the list itself stays put.
- **Touch platforms** (iOS UIKit buttons, Android ripple):
  - commit on **touch-up inside**; sliding off cancels;
  - the pressed state is drawn at touch-down.
  - That is the right default for a finger, which may be starting a scroll.
- **Character creation with a preview pane** (Elden Ring, Baldur's Gate 3):
  - a plain list or grid of options, with the world (the body, the model, the sky) answering focus at once;
  - commit is a press;
  - back is always one button.
  - The richness is in the preview, not in the control.
- **Hold to confirm for destructive acts** (Celeste's and Hollow Knight's "delete save", Destiny's dismantle): a ring
  fills; letting go early does nothing; a tap explains.
- **Planetarium software and observatory UIs** (Stellarium's search-to-slew): the sky turns to what is named, over most
  of a second, with the constellation lines and label lit, and the rest dimmed but present.

**What transfers:**
- **[P]** On a pad or a key, commit on down. For a finger, commit on up inside.
- **[P]** One focus mark, set by whichever input moved last.
- **[J]** Ordinary choices quick and plain; the world, not the control, carries the richness.
- **[J]** Hold only what spends or ends something.

## 3. Hypothesis

**The opening reads as application forms because each decision brings its own widget, and because the press has no
body.** Make every decision the same act (a row is considered by focus and chosen by one press, which goes on), let
the scene answer focus rather than the control, and give the press a body: drawn the frame the hand goes down,
committed on the down where the input allows it. Then the entrance reads as one instrument played through, and the
thousandth press is still quick.

**Corollaries tested:**
1. Commit-on-down saves the whole human press time (about 90 ms) on every act, with no new duplicates.
2. Creation as rows, with cards kept for ancestry and calling, halves the presses and makes the opening one grammar.
3. The sign can be an exceptional moment that changes nothing about the workflow: the same rows, and a sky that follows
   them.

## 4. What was built (branch `touch`)

### The press: one pipeline, two treatments

`web/reader/instrument/gesture.ts` and `web/reader/instrument/touch.ts`.
- **Gesture** is a pure state machine for one press on one row. It decides only *when* a press commits:
  - struck on the down;
  - committed at down (`down`) or at release over the row (`up`; a finger is always up);
  - a held row commits only at full, a tap on it asks, a hold let go early does nothing;
  - nothing commits twice.
- **Touch** binds it to the page at window capture.
  - **Every row type takes part:** the scene's acts, talk's replies, the fight's moves, the title's ways in, and
    creation's rows and cards.
  - **The row is marked struck in the same frame** (`data-struck`).
  - **It commits by the row's own click,** so what a row does is unchanged and still the engine's.
  - **The browser's own trusted click is swallowed,** so one press makes one command.
- **Keys** use Enter or Space on the focused row, or on the play highlight. Digits still go through `ReaderKeys` (see
  §7).

The two treatments differ only in when a press commits:

| | `?touch=down` | `?touch=up` |
|---|---|---|
| mouse, pen | on the down (a game's button) | on release over the row; slide off to cancel |
| keys | on keydown | on keyup |
| finger | on release (it may be a scroll) | on release |

**Shared look** (`web/reader/touch.css`):
- **One line, one height** (44 px; 52 px for a coarse pointer). The aside sits on the same line and is cut short
  before it would wrap.
- **No box.** Focus is the row's mark growing to full height and brightening, with the row's tint behind it. It is
  instant on, 140 ms off.
- **Struck:** the row's ground is swept from the mark across, in the row's own tone, over 110 ms. Nothing changes size
  or place. While the engine answers, the other rows fall to .42 after 80 ms (as `?ix=`).
- **Held rows** (`data-touch-hold`):
  - a small open ring at the right;
  - held, the ring and the ground fill together over 650 ms, with the page's reticle at the hand;
  - let go early, both drain and "· hold" is said;
  - a tap asks, with the existing grave sentence, and a second press does it (the accessible way).
- **The commit tone** (`instrument/tone.ts`) sounds on commit; `&sound=0` silences it.

**What is held, by authoritative marks only:**
- an act the engine says is asked before it is done (`Grave.asks`: cannot be undone, or a fight that could be lost);
- setting out, the one commitment of the opening.

**Energy doesn't exist yet,** so no act is held for a cost. `ReaderApp.choose(choice, held)` takes the hold as the
asking.

### Creation composed in the row grammar

`web/reader/creation/composed-creation.tsx`, `composed-row.tsx`, `composed-options.tsx`, `observatory.tsx`. The
composition draws the engine's `CreationFlow` steps exactly as given (their order, their options, which is chosen),
and `app.opening.choose` is still the only thing that changes anything.
- **Every step is the same act.** Focus considers (the option is lit, its sentence said beneath, the sky turned). One
  press chooses and goes on, with no Continue.
  - On a touch screen there is no hover, so a first touch considers an unlit option that has a sentence, and a second
    touch chooses it, as the arrows and Enter do.
  - Back is Escape or the corner word, and returns to a step with its choice marked by a gold mark.
- **Why, before, presenting and name are rows**, one line each, with an aside (why: "Once a scribe"; presenting:
  "she, her"). The four the engine leads with come first, then "N more".
  - Presenting is its own step again, as the flow says.
  - The name is the table's names as rows, "Roll again", and "Or write your own" as a row with an input.
- **Ancestry and calling keep their cards.** The considered card is lit; the chosen card carries a small gold bar at
  its foot. There is never a second outline.
- **The sign is an observatory.**
  - Imbar's twelve constellations stand on one great ring of sky, drawn from `data/imbar/sky.json`'s own stars and
    lines, over a field of near stars that turn with them and far stars that don't.
  - Focus on a sign turns the ring the short way round over 900 ms, bringing the sign to the top of the dome, lit and
    named, with the rest dimmed. The rows answer at once; the sky follows.
  - Choosing flares the constellation for 340 ms before the page goes on. That is the only beat creation spends.
  - A constellation in the sky can be pointed at and chosen too, by the same choose.
  - Reduced motion: the ring jumps, nothing flares.
- **Setting out is the one held act.** "Set out into <the country>" holds for 650 ms. A tap says "Hold to set out, or
  press it again."
- **The title** focuses its first way in once it is offered, under `?touch`, so the first Enter is New game.

### The specs

- **`test/small/touch-gesture.test.ts`** (µs, in the push lane) holds both treatments:
  - a press commits once, whatever repeats;
  - a hold let go early never commits, and a tap only asks;
  - a finger always waits for release;
  - down commits at the down; up does not commit when slid off.
- **`test/touch-press-browser.test.ts`** (about 50 s, browser lane) holds:
  - arrows in creation ask the engine nothing;
  - setting out: a tap and a 330 ms hold begin nothing, and a full hold begins once;
  - hover and arrows over every row send nothing;
  - a wait is shown taken at the press, with every row's box unchanged;
  - a double click is one command;
  - in `up`, a press slid off does nothing.

## 5. How to try it

Build (`bun run web:build`) and open `site/mono.html`, or the deployed page once landed:

| Address | What |
|---|---|
| `mono.html?touch=down` | commit on the down (keys and mouse); composed creation; observatory |
| `mono.html?touch=up` | commit on release, slide off to cancel; the same creation |
| `&sound=0` | silences the commit tone |
| `&world=kite` | the small country the specs use (Brightbridge's road) |
| `&ident` | the studio's mark again (once a session otherwise) |

Compare with `mono.html` (the game as it is) and `?ix=a` / `?ix=b` (the research's versions).

## 6. Footage (unedited, Playwright, in `first-touch/`)

Recordings have no system cursor, so a dim ring stands in for the hand. The filled reticle seen during holds is the
page's own. Videos are at half size, to keep them small.

| What | File |
|---|---|
| The first fifteen seconds: stab, title, New game, the first creation choice (`down`, 1280×800, keys and mouse) | `first15-down-1280x800.webm` |
| The continuous opening: title → creation → observatory → set out (held) → the opening's pages → the first scene → talk, reply, leave, wait ×3 (`down`, 1280×800, keys and mouse) | `opening-down-1280x800.webm` |
| The same, by touch on a tablet held upright (820×1180) | `opening-down-820x1180-touch.webm` |
| The same, by touch on a tablet held sideways (1180×820) | `opening-down-1180x820-touch.webm` |
| The same, with reduced motion (1280×800) | `opening-down-1280x800-reduced.webm` |
| 20 repetitions (60 acts) of the primary control, then the accidents: `down` | `repeat-down.webm` |
| The same: `up` | `repeat-up.webm` |

Stills: `touch-*.jpg` (the composed steps, the observatory, holding, asked, the scene and talk) and `base-*.jpg` (§1).
The harnesses are in `first-touch/tools/` (`*.test.ts.txt`; copy to `test/` to run).

## 7. Findings over the 60-act sequences

The setup was the kite's first town at 1280×800. Each repetition is talk, then leave (by the hand and by the digit in
turn), then Wait › "A while". That makes 60 acts per treatment, followed by the accidents. The press is a 90 ms mouse
press, as a hand makes one. These runs were without video: recording roughly doubles the engine's round trip and
distorts the times.

| | the game as it is | `down` | `up` |
|---|---|---|---|
| acts / duplicates / missed | 60 / 0 / 0 | 60 / 0 / 0 | 60 / 0 / 0 |
| hand down → command sent (median) | 94 ms | **1 ms** | 95 ms |
| hand down → shown pressed (median) | `:active` only, at once, not held | 8–12 ms, held until answered | 7 ms, held |
| hand down → answer drawn (median, by the hand) | ≈265 ms | **≈165 ms** | ≈265 ms |
| key → answer drawn (digit, median) | 175 ms | 165–180 ms | 165 ms |
| a row moved under the hand, "A while" | 0 / 20 | 0 / 20 | 0 / 20 |
| hover and arrows over every row: commands / choices changed | 0 / no | 0 / no | 0 / no |
| double click on talk | 1 | 1 | 1 |
| Enter held 400 ms on talk | 1 | 1 | 1 |
| two clicks 90 ms apart | 1 | 1 | 1 |
| pressed on talk, slid off, let go | 0 | **1** | 0 |
| setting out: a tap / let go at 380 ms / Enter let go at 160 ms / held full | n/a | 0 / 0 / 0 / 1 | 0 / 0 / 0 / 1 |
| page errors | 0 | 0 | 0 |

**What it says:**
1. **Commit-on-down removes about 95 ms from every hand-made act,** roughly a third of the time from the hand to the
   answer. It is the largest responsiveness gain available without touching the engine, and it's free over a thousand
   repetitions.
   - Its one cost is the slide-off cancel: a mouse press slid off still commits. Pads, keys and every console game
     accept that.
   - A finger keeps release-commit in both treatments.
2. **`up` is the web's grammar, made solid.** It's as fast as the game is now, but the press is drawn and held, and a
   slide-off cancels. It's the safer default if the owner prefers the web's forgiveness to a game's immediacy.
3. **The guards hold under both** (no duplicate in any accident, and nothing done by focus). The interrupted hold never
   executes: a tap asks, a hold let go early drains.
4. **No reflow on the press path.** The strike is a background-size sweep: no box moves (0 of 20 waits, and the
   browser spec checks every row's box).
   - Talk changes composition by design, so its rows "move" in every version (see `interaction/experiment.md`).
5. **Composed creation takes 8 presses from New game to the hold, against 13 on the default** (each card step was a
   card and then Continue).
   - The filmed desktop run reaches "Set out" 23 s after New game, at a deliberate, considered pace.
6. **[H] The observatory is the moment the opening becomes a game.** The sky turning to the arrow is the first thing in
   the opening that answers attention rather than a click. It costs nothing on the press path, because the rows answer
   at once.
7. **[H] Hold-to-set-out reads as an entrance, not a toll.** It is held once a game. The only hold an ordinary player
   meets in the first minute is the one that means something.
8. **[J] One focus mark at a time in creation:** the considered option, set by whichever input moved last. In play,
   `.sel` (the keys' highlight) and `:hover` can still both be lit (see §8).

**Not tested by a person.** No one has heard the tone with these presses, or felt down versus up with a real mouse
and finger. The owner's hand on `?touch=down` and `?touch=up` is the test that remains.

## 8. The smallest architecture change the interaction needs

The experiment works without a rewrite, but it had to go round three things:

1. **No single commit path.**
   - Each row type commits through its own `onClick` (`Act.click`, `ChoiceRow.Button`, `Card.onChoose`, the title's
     handlers, creation's). `ReaderKeys` calls `app.choose` directly for digits and the highlight.
   - To change *when* a press commits, `Touch` had to sit at window capture, swallow trusted clicks and re-dispatch
     the row's click. Digits still commit on keydown in both treatments, and Playwright's `click()` reports the row
     "intercepted" under `down` (the harness presses by mouse down/up).
   - **The smallest change:** one entry point, `Press.commit(row, source)`, that every activation (pointer, Enter,
     digit, and later a pad's A) goes through. Rows register what they do, rather than each owning a click. This is
     `interaction/grammar.md`'s problem 2, now with the evidence that it's what a timing change needs.
2. **Three focus models.**
   - In play there is `state.cursor` with `keyed` (the keys' highlight), DOM focus, and CSS `:hover`, and they can
     disagree. Creation's cards had a fourth (chosen versus pointed-at).
   - The composition reduces creation to one: `lit`, set by focus or a moved hand.
   - **The smallest change in play:** one `lit` id per screen in app state, set by arrows, focus and a moved pointer,
     and CSS drawing only `[data-lit]`. This is a precondition for a controller.
3. **Rows' look is fought over by specificity.**
   - `menu.css` styles rows with `.choice-row.choice-row` under four roots, so any treatment has to out-specify it (the
     touch sheet uses three classes).
   - **The smallest change:** the row's states as custom properties (`--row-ground`, `--row-lit`, `--row-struck`) set
     in one place.

None of these is a UI rewrite; each is a refactor of one seam. In order: commit path, focus, then tokens.

## 9. Commoner

- **The commoner calling exists** (`data/catalog/classes.json`: "Commoner", hit die 4, fists, cloth, `adventuring:
  false`, Kyr's own, open to every ancestry). It isn't `playable`, so creation doesn't offer it.
- **To be the first, default, always-available beginning, it would need:**
  1. `playable: true` on it in `classes.json`, then the catalog, handbook and bundle rebuilds that every catalog edit
     needs.
  2. A card line and trade (`CardLines`), and its kit: "Bare hands" is honest, but the first undertown fight and the
     debt origins (50 coin owed) were balanced for a heroic calling.
  3. `CreationFlow` to lead the calling deck with it (a rank rule for `calling`, as `you` has its country's peoples
     first). `Creation.protagonist` would also need to start as one, which changes every fixture that sets out with
     the default company.
  4. **The rule that is missing:** how a commoner *becomes* a warrior, a cleric or a mage in play. Without a
     career-change rule, "commoner first" is a trap, not a beginning. That is the rules line's to write, not an
     interaction rule to invent.
- **Not done here.** The composition would show it first the moment it is playable (it draws the flow's order).

## 10. What M22 should inherit

- **Inherit:**
  - The **Gesture** (pure, specced) and the **strike**: drawn on the frame of the down, a background sweep with no
    reflow, the rest quiet at 80 ms.
  - **Commit-on-down for keys, pads and mouse; on-up for a finger.** The owner chooses between `down` and `up` for the
    mouse; the rest is settled by the evidence.
  - **Creation as one grammar:** consider by focus, choose by one press; cards for ancestry and calling only; the
    flow's own order; Back by Escape.
  - **The observatory**, as the pattern for exceptional moments: a read-only projection that answers focus, slowly,
    behind rows that answer at once.
  - **Holding only the irreversible and the entrance,** with a tap that asks. Energy joins this when the engine has it.
- **Refine, don't redo:**
  - the sky's art (a painted dome, the chosen sign's resolution into the portrait of the life);
  - the go page's composition (it is plain);
  - the title's time to first input (10.5 s with the mark);
  - the tone's sound.
- **Do first, in M22:** the three seams in §8, in that order, then a controller.
- **Don't polish yet:** the scene's row styling outside `?touch` (the lead's row work is landing), talk's "Something
  else…" and Trade (other widgets that should become rows), and the title's sky (the owner's embers-only ruling is
  the lead's).
