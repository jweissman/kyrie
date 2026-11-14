# The first minute, as one instrument (IG-01)

This critique follows the owner's brief (`owner-first-minute.md`). It covers the studio's mark, the title, creation,
the opening's pages, the first scene and its first acts, read as one continuous interaction with one instrument:
focus, selection, preview, commitment, response, continuation.

**How it was seen.** A recording of the whole opening, unedited, at 1280×800, keyboard and mouse, by the harness
`aesthetic/tools/zz-record.test.ts.txt`.
- It was first taken from the local build (main 9f30672a with look-5c/5d/6), with a still at each moment.
- Then it was taken from the deployed page once look-6 landed (see the end).
- Videos are in `/var/tmp/kyrie/first-minute*/` (about 5 MB each, so not in the repository).

## Does it feel like operating a game, or navigating web pages?

**More like a game than it did, unevenly.**
- **The title's ways in** behave like a game's menu: focus answers in the frame of the key, and the sky answers it.
- **The scene's four and the lenses** read as one control surface: a column of rows under the painting, numbered,
  with the rail's icons beside them.
- **The web page shows through at the joins:**
  - creation's big ivory Continue button, and its corner words ("Another country", "Set out now", "Back");
  - talk's boxed "Trade";
  - the blurred photograph behind "Setting out…";
  - the books' tab row (improved, still a tab row).

## Is focus always obvious and stable?

**Not across screens.** Each screen marks focus its own way:
- **The title:** a gold mark at the row's left on a warmed ground.
- **Creation:** a card lifted and lit for the chosen one, and a second outline for the card the pointer or the keys
  are on. Two highlight states of nearly equal weight stand side by side (the "why" page: Coming home outlined,
  The brothers' errand lifted). A player can't tell at a glance which is chosen and which is merely pointed at.
- **The scene and talk:** the row's indicator bar plus a lighter ground, with the keys' highlight only after an arrow
  is pressed.

**IG-02.** Creation's cards should use the grammar's one focus mark (the row-mark's gold at the card's foot or edge
for the pointed-at card). The chosen state should be the card raised. Two states, two different kinds of mark, never
two outlines.

## Can it be read as controller inputs: move focus, confirm, back, inspect?

**Mostly.**
- **Move focus:** the arrows move through the title's ways, creation's cards (across and down) and the scene's rows.
  But the scene's arrows reach only what the glance leads with, and the rail's icons aren't on the same path.
- **Confirm:** Enter or Space everywhere (a held act asks for a hold).
- **Back:** Escape everywhere. Creation's Back is a corner word, not Escape's equal.
- **Inspect:** "Details" in creation, a lens in the scene, "How it fell" after an act. These are three words for one
  input.

**IG-03.** There is no single "inspect" verb. One quiet affordance with one key (`I`, or a long press where nothing
is held) should open Details on a card, the lens's All on a row and the dice on an outcome.

## Do title, creation and scene share one design language?

**In type and colour, yes:** the same serif for telling, the same small capitals for labels, gold kept for the entry
and the aim.

**In the control, not yet.**
- The title has rows.
- Creation has cards (rightly, its own composition), but its Continue is a different kind of button from any row.
- The scene has rows again.
- **IG-04.** Creation's Continue should be the grammar's row (its mark, its words, its key), as the title's New game
  is. Then the hand that pressed New game presses Continue the same way.

## What do timing, transitions, type, highlights, motion and sound add or take away?

**Timing:**
- The opening's reading pages now go on by themselves, with a line filling under them.
- The engine's answers come back in a few milliseconds, and the press is shown at once.
- Setting out takes about 13 seconds on the local build, on a blurred photograph with "Setting out…". That's the
  longest still moment of the first minute.
- **IG-05.** The setting-out wait should stand under the title's sky as the first drawing does (the look-5a title
  passage, held for look-7), with the engine's steps ("Drawing the world", "Placing its people") as quiet lines, not
  a blurred photograph.

**Transitions:** each screen arrives by a fade. None of them carries the one before into the next. The title passage
(held) is the one place that does, from the studio's horizon to the title's.

**Motion:** quiet throughout, which is right.

**Sound:** there is none. A single low tone on commit (a chosen card, a held act completing) would do more for
"operating a game" than any visual. It is out of scope for M21, and noted.

## Could an Energy-cost act later use a brief hold-to-commit with no separate system?

**Yes.**
- The ring that look-5b gives sustained acts is already an act's property (`Choice.hold`, from the engine) drawn by
  the one act atom: a ring at rest, filling while held, its time (`--hold-ms`) the act's own.
- An Energy cost would be a second reason for the engine to mark an act held. It could be a shorter hold,
  `Hold.ms.commitment` (650 ms, unused since BP-09 took it off the cards), with the ring in the act's own tone.
- No new component and no new colour. The page draws whatever the engine marks.

## The smallest intervention that makes the whole opening substantially better

**One focus mark across title, creation and scene (IG-02, IG-04).**
- The title already has it.
- Creation's cards and its Continue take the same mark and the same row.
- The four in the scene are already that row.

That one change makes the first three screens one instrument, and it's a styling change within the existing atoms,
not a redesign.

**Two smaller things the recording showed are fixed in 6532ef58:**
- talk's "· for you" was still on the visible page (BP-08 had missed the talk's own rows);
- the reading line under an opening page sat at the column's left, not centred under the words it times.

## Register

| Id | What | Where |
|---|---|---|
| IG-02 | One focus mark on creation's cards: the grammar's mark for the pointed-at card, raised for the chosen one, never two outlines | done in look-7 |
| IG-03 | One "inspect" input: Details, All and the dice by one key or press | aesthetic line, with the engine's grammar |
| IG-04 | Creation's Continue as the grammar's row, as New game is | done in look-7 |
| IG-05 | Setting out under the title's sky, the engine's steps as quiet lines | done in look-7, with the title passage |
| IG-06 | A low tone on commit (sound), later | M22 |
| IG-07 | No hold anywhere for now: every act commits at one tap (the owner's play of the live build) | done in look-9 |
| IG-08 | A press never moves a card: the deck fixed for the step (the engine's order, the page's fold) | engine 61b95ef8, page in look-11 |
| IG-09 | The one focus mark is a reticule: title, creation, the scene's rows and the fight's targets | done in look-10 |
| IG-11 | The title completely still: no light answering focus, no haze or embers; the reticule the one focus sign | done in look-12 |
| IG-12 | The start's vertical dissolve gone: every passage a cut or a fade in place | done in look-11 |
| IG-10 | The reticule on the map's chosen hex, drawn in the board's own layer | later |

## The deployed recording (e1de5734, main up to look-6)

The whole opening, unedited, was recorded from <https://jweissman.github.io/kyrie/> at 1280×800, keyboard and mouse,
by `aesthetic/tools/zz-record.test.ts.txt`.
- **The video** is `/var/tmp/kyrie/first-minute/969ea41465297cb907f6bc41d16e34f1.webm` (5.6 MB, about 58 s), kept out
  of the repository.
- **Its stills, one at each moment:** `live-e1de5734.png`.

**What the live opening still gets wrong.**
- The title is still the old moving double-diamond over drifting embers, and creation's focus is two outlines, so the
  first two screens speak two different control languages.
- In the first talk, "· for you" is still on the visible row. All of this is fixed in look-7, which is not yet
  deployed.
