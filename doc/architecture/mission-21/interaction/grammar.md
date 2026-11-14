# A common interaction grammar: the proposal

Part 2 of the interaction research. This proposal extends `doc/design/GRAMMAR.md` and does not replace it. Everything
GRAMMAR.md says stands unless a numbered amendment at the end says otherwise. The evidence is in `study.md` and
`experiment.md`.

## The idea in one paragraph

**There is one instrument, and every screen plays it.** The engine decides what can be done, what each act costs and
what it does, and how much a moment weighs. The instrument decides only how a press is taken and how the answer is
paced:
- **The instrument answers at once,** at the hand and in sound, within a frame.
- **The world answers a beat later,** in prose, before the next choices.

The layouts stay their own (the title's column, creation's cards, the scene's four, talk's replies, the fight's
field). The states, the inputs and the pacing below are the same on all of them.

## The control's states

| State | What it is | Drawn | Leaves by |
|---|---|---|---|
| **rest** | a choice, not attended | the row's ground and edge; its mark | focus |
| **focused** | the one thing the hand, the keys or a controller are on | the row's tint, in its own tone (IG-15); its preview (risk, cost, what it opens) | press · focus moves · the screen changes |
| **pressed** | down on it (pointer, key, button), not yet committed | deeper tint at once; the reticle tightened and filled | release on it → *committed* · slide off → *rest* (nothing done) · a held act → *holding* |
| **holding** | a held act (the engine's `hold`) kept down | the ring filling at the hand and on the row, its time the act's own | full → *committed* · let go early → *let go* |
| **let go** | a hold released early | the ring draining from where it got to; "Hold" beside it a moment | → *focused* (≈250 ms) |
| **asked** | an irreversible act chosen once (`Grave.asks`) | what it cannot undo, said on the row | the same act again → *committed* · anything else → *rest* |
| **committed** | the command sent to the engine | the row *taken*: pressed, kept; the rest quiet and inert; the commit tone | the engine's answer → *answered* |
| **answered** | the world's answer told | the chosen words first, then what came of it | its register: at once → *continuing*; deliberately → *held moment* |
| **held moment** | an answer that weighs (a revelation, a reckoning, a loss) | the person, object or place kept; unrelated controls suppressed; one way on | a deliberate continue → *continuing* |
| **continuing** | the next choices let in | the next rows arrive after the answer; nothing lit under a hand that has not moved | focus → *focused* |

**[P]** Three states are guards, not looks:
- **committed** makes the rest inert until the engine answers;
- **continuing** ignores a press begun on the previous screen;
- **pressed** fires once, whatever a key's auto-repeat does.

All three are now in the game for everyone (`web/reader/press-guard.ts`, IG-17 and IG-18). Before them, a held
Enter committed a reply nobody read.

## Inputs: one verb set, every device

| Verb | Pointer | Touch | Keys | Controller (future) | Terminal |
|---|---|---|---|---|---|
| **move focus** | the hand moves (hover counts only after it has moved since the screen changed) | none; the touch is the focus | arrows (creation: across too) | d-pad or stick | the row number shown |
| **press / commit** | click: down then up on it | tap | Enter or Space, once per press; a digit for the four | A (cross) | the number, Enter |
| **hold** (held acts only) | keep down; full commits | keep touching | keep Enter or Space or the digit down | keep A down | a held act is a typed confirmation (`y`), never a timed one |
| **inspect** (IG-03) | right click, or the quiet word | long press where nothing is held | `I` | Y (triangle) | `?` then the number |
| **back** | the quiet "Back" or the compass's Out | the same | Escape | B (circle) | `b` |
| **continue** | anywhere on a reading page; the "Go on" row | the same | Enter or Space | A | Enter |
| **books** | the rail | the rail | C, J, I(ndex), H, M | menu or view | the letters |

Notes on the table:
- **Inspect needs one key.** `I` is the pack today. IG-03 needs one key across every screen, so either the pack
  moves to `P` or inspect takes `X`. **[J]** Inspect should win `I` (it's the verb, used everywhere); the pack is one
  book among four.
- **A long press is reserved.** Where an act is held, a long press is the hold. A long press on touch can only be
  inspect where nothing is held. This is why held acts must stay few.
- **Hover never commits and never previews something unattended.** The tint of a row the player didn't move to is
  noise (60 of 60 acts in the baseline).

## Pacing: the beat

Two durations, fixed, never scaled to the content:
- **the instrument's answer:** ≤ 1 frame (≈16 ms). Measured: median 10 ms in every version;
- **the world's beat:** the time between the answer told and the next rows. Version a gives none; version b gives
  140 ms, then a 220 ms fade-in. The engine's answer already takes about 200 ms.

Rules:
- **[P]** No busy sign under about 80 ms: the taken state's quieting of the other rows waits 80 ms, so a quick answer
  doesn't flicker.
- **[J]** Nothing on the press path slides, scales or bounces. Repetition turns motion into delay.
- **[H]** Version b's beat may read as deliberate at first and as drag by the hundredth act (see `experiment.md`).

## The dramatic register: when the game slows down

This takes the design review's §7 as an input. Every answer the engine tells has a register, and the register, not
the page, decides how play continues:

| Register | What it is | Continuation | Next choices |
|---|---|---|---|
| **ordinary** | most acts: a search, a wait, a question answered | at once | let in after the answer (the beat) |
| **speech** | someone speaks to the company | at once; the conversation keeps its column | the replies |
| **revelation** | an authored discovery (`revelation` lines, NAR-14) | **deliberate**: one "Go on" in the column | delayed until continued; the successor's lead is not promoted until then |
| **reckoning** | a cost come due: a debt called in, a vow kept or broken, a fight's end | **deliberate** | delayed; the person or the place kept on screen |
| **loss** | a death, a companion gone, a home lost | **deliberate**, and no lead promoted in the same screen | delayed; unrelated controls suppressed |

**The engine owns the register.**
- It already marks revelations (`narrator.ts`, line kind `revelation`) and pages that are no act (`Told.pages`).
  Reckoning and loss would be new marks on the exchange, from content (an authored aspect) or from the event (a
  member dead).
- The page never infers weight from words.
- The terminal shows a deliberate continuation as a bare `[Enter]` prompt, and delays its next list the same way.

**What deliberate continuation is:** the same row and the same press as any act ("Go on", numbered 1), alone in the
column. It's not a modal and not a webapp button, so CN-09 is the ordinary case of this.

**What it isn't:** a hold. Holding is for spending; reading is for continuing.

## Which acts are held

**Rule:** an act is held only if the engine marks it as spending a scarce daily budget. Today the candidates are the
engine's `Choice.hold === 'sustained'`: a wait, a search, a rest, a camp, a long look. With Energy, it would be those
that cost Energy.

Never held:
- speech;
- movement;
- looking;
- a fight's moves;
- creation's cards (BP-09);
- the title's ways in;
- anything the player does many times a minute.

**The hold's parameters:**
- 520 ms (version b; Destiny-like holds of 1 s are too long for a budget spent several times an hour);
- done when full;
- a drain of about 240 ms when let go early;
- "Hold" said on a tap;
- the ring at the hand (the drawn reticle) and on the row (for touch and keys);
- stepped fill under reduced motion;
- **an option to take held acts at a tap** (accessibility, [P]). Not built in the experiment; it belongs with the
  options page in M22.

## What the browser, the terminal and a controller share

**Shared, in the engine's projection (a frame or `Glance.offer`):**
- the acts, the four, their order and keys;
- which are held;
- which ask again;
- each act's cost (Energy later);
- the register of each told answer;
- whether continuation is deliberate;
- when a successor is promoted.

**Each client's own:**
- **The browser:** how a press is measured (milliseconds of a hold), the drawn reticle, the tint, the tone, the
  beat's durations.
- **The terminal:** the typed confirmation for a held act, the `[Enter]` prompt for a held moment, and no timing
  at all.
- **A controller (future):** the browser's own measurement, read from the Gamepad API through the same verbs. It
  needs no new page states, only a focus model that is the page's for every screen (see below).

## Architectural problems named, not fixed

1. **There are two focus models.**
   - Before play, focus is DOM focus walked over `[data-nav]` (`ReaderKeys.page`).
   - In play, it's a virtual cursor over `menu.choices` (`state.cursor`, `state.keyed`), with DOM focus following
     only sometimes.
   - The rail's icons are on neither path (IG-01).

   A controller needs one focus graph across every screen. Proposal (M22): one focus model over `[data-act],
   [data-nav]` in document order, grouped by region (column, rail, deck), with the cursor as its only state.
2. **The commit path is split three ways.**
   - Engine acts go through `ReaderApp.choose`.
   - Creation and the title use their own `onClick` handlers.
   - Openers (`aria-expanded`) are clicked as DOM.

   The tone and the guards had to be placed at both a window click listener and `choose` (`instrument/press.ts`).
   Proposal: one `commit(target)` that every press goes through, with the engine's acts as its main case.
3. **The same act has two ids over time.** Talking to the wagoner is `origin__carter#talk`, and later
   `talk_to(origin__carter)` (a promoted row the menu has no choice for). The harness had to match both. A
   controller's focus restoration and any "the same act again" rule need stable act ids.
4. **The register is not on the exchange.** Revelation is a line kind; reckoning and loss do not exist. The held
   moment needs the exchange to carry its weight (one field) and the successor (`Succession`) to respect it.
5. **Setting out is one blocking request** (`Campaign.load` composition, 12–17 s), so the opening cannot be continuous
   whatever the page does.

## Amendments to GRAMMAR.md (proposed)

1. **Focus:** add that hover counts as focus only once the hand has moved since the screen changed. *Adopted in
   `887bec7f` (IG-18).*
2. **Choosing:** add that a press commits once (a key's repeats are dropped), and that a press begun on one screen
   commits nothing on the next. *Adopted in `887bec7f` (IG-17).*
3. **Choosing:** replace "Nothing is held, for now" with "Held only where the engine marks an act as spending a daily
   budget: done when full (≈0.5 s), at the hand and on the row; a tap is answered 'Hold'; an option makes holds
   taps".
4. **New section, Pacing:**
   - the instrument's answer within a frame;
   - the act taken shown taken, the rest quiet after 80 ms;
   - the next choices after the answer.
5. **New section, Register:** ordinary, speech, revelation, reckoning, loss; the engine's to mark; deliberate
   continuation for the last three; no successor promoted under a loss.
6. **Inspecting further:** one inspect verb on one key (IG-03) on every screen: Details on a card, All in a lens, the
   dice under an outcome.
7. **Sound:** one commit tone (a held act's lower), a quiet family, off by an option.

Each would be held by a spec, as GRAMMAR.md's table does. The experiment's repetition harness is the starting point
for the guards in 2.
