# The journey reader

A development tool for reading a recorded Westernesse playthrough as the player met it. It makes the whole journey,
not the single sentence, the thing a reviewer reads. It plays no game of its own: a journey is played by the runner
(`bin/kyrie run`, [src/cli/runner.ts](../../../../src/cli/runner.ts)) through the same PlaySession the page and the
terminal use, and the reader only keeps and lays out what the runner showed.

## A run

A run is a directory:

| file | what it is | written by |
|---|---|---|
| `captured.json` | **Captured.** What the player was shown when the journey was played: each step's scene lines and narration, the offer (the four, the led, the rest), the act chosen and where it stood in the offer, the aims, the narrator's exchange by kind, the world's changes, and the session transcript (its commands and digests). It carries the build (commit, and whether the tree had uncommitted changes). It is never written over. | `read record` |
| `notes.json` | The reviewer's notes, kept beside the run and not in the code. | `read note`, or by hand |
| `replay.json` | **Replay.** The capture's acts asked again of a fresh game under the code as it is now, labelled with its own build. It stops, and says where, at the first act that is no longer offered. | `read replay` |
| `reader.html`, `account.md` | The capture read in order (HTML with the inspector, provenance and notes; Markdown to read aloud). | `read record`, `read render` |
| `compare.html`, `compare.md` | Before and after: the capture beside the replay. | `read replay`, `read render` |

Every page says which of the two it shows, and at which build. Neither is ever shown in the other's place.

## How to use it

```sh
# Record a first hour (a capture already kept is not written over; --force records anew)
bin/kyrie read record <dir> --limit 45 --world iscoed --as human/warrior/Wenna
# Make the pages again: after editing notes.json, or to trace against changed sources. No game is played.
bin/kyrie read render <dir>
# Add a note: the step, a kind, the exact words quoted from that step, and what is wrong
bin/kyrie read note <dir> 4 diction "The smell reaches you before the sight does." "Says nothing that happens." \
  --suggest "The water smells." --by editor
# After a prose revision: replay the capture's acts under the code as it is now, and compare
bin/kyrie read replay <dir>
# Show one step through the page: the game as it stood just before the step, as a save file
bin/kyrie read scene <dir> 12
bun run web:build
LD_LIBRARY_PATH=… bun scripts/journey-scene.ts <the checkpoint it printed> --shot step-12.png
```

The runner's arguments after the directory are `bin/kyrie run`'s: a campaign file, or `--world <seed>` with `--as`
and `--origin`. The steps are chosen by a fixed policy, "fresh"
([src/cli/journey-capture.ts](../../../../src/cli/journey-capture.ts)): what pulls next, else the first of the led,
the four and the rest that has not been taken; never the same act twice, never the same words more than twice; ways
before talk and journeys by road last; a fight by its first offer. The policy is not a player. It finds the first
hour's ordinary text: arrivals, talk, notices, probing, a fight.

## The six parts

1. **The chronological account** (`account.md`, and the body of `reader.html`;
   [src/cli/journey-account.ts](../../../../src/cli/journey-account.ts)). The steps, grouped by the place they were
   taken in. Each shows the choice, the narration told, and what changed in the company's understanding: the
   exchange's notes ("Noted: …", "Aim: …"), and the aims taken up and let go since the step before. A sentence told
   before is marked † with the step where it was first told.
   *Not yet:* the world's changes appear only as raw facts in the inspector (`+ knows(party, …)`), not as
   consequences in words. A fight's turns are kept as the runner tells them, by blow.
2. **The step inspector** (each step's "inspect" fold in `reader.html`). The lines exactly as shown; the exchange
   line by line with its kind (speech, telling, event, change); the act chosen, by label and id, with where it stood
   (next, led, primary, rest, fight); the offer after the step, which is the offer the next step chose from (the
   offer before is the previous step's after, linked); what the offer gained and lost; the aim, its needs and next
   step; the world's changes; and where each sentence was written.
   *Not yet:* the runner's projection is the terminal's (TerminalScene). The page's own composition (prologue,
   painting, card order) is not in the capture. For that, use the scene view.
3. **The scene view** (`read scene`, [scripts/journey-scene.ts](../../../../scripts/journey-scene.ts)). The capture's
   transcript is played headless to just before the step, and each command is held to its recorded digest. The game
   is written as a save file, and the normal page opens it, either by hand (the title page opens a save file) or by
   the script, through `kyrieMono.resume`. The step's act is then done by its id, as a player's choice is. Nothing
   before the step is played in a browser. Held by
   [test/journey-scene-browser.test.ts](../../../../test/journey-scene-browser.test.ts): what the page tells is what
   the capture kept.
   *Not yet:* a step in the middle of a fight cannot be opened, because a checkpoint is only kept between commands.
   The fight's first step can. Under code that no longer reaches the recorded state, a checkpoint is refused rather
   than made. The page opened from a save shows its "taken up again" recap above the place.
4. **Source provenance** ([src/cli/prose-provenance.ts](../../../../src/cli/prose-provenance.ts)). See below.
5. **Editorial annotations** (`notes.json`, [src/cli/journey-notes.ts](../../../../src/cli/journey-notes.ts)). Each
   note has a step, the exact words quoted from what that step showed (a note is refused if the step does not show
   them), a kind (diction, duplication, causality, excess, emphasis, other), the note, and optionally a replacement
   and who wrote it. In `reader.html` the quoted words are marked in the prose.
   *Not yet:* no editor; notes are added by command or by hand. A quote that runs across two sentences is listed but
   not marked.
6. **Before and after** (`read replay`; `compare.html`, `compare.md`;
   [src/cli/journey-compare.ts](../../../../src/cli/journey-compare.ts)). Each step's narration in the capture beside
   the replay's, with deleted words struck and new ones underlined. Each note is marked "still shown" or "no longer
   shown" in the replay. Unchanged steps fold to one line. `compare.md` lists before and after in full for an
   editorial table: the original sentence, the replacement, and, from the notes, the reason.
   *Not yet:* the comparison is by step number. A revision that changes which acts are offered ends the replay at
   that step and does not realign the rest.

## Provenance: where it holds and where it doesn't

Every string in `data/**/*.kyr`, `data/**/*.kyrt`, `data/**/*.json`, `src/**/*.ts` and `web/engine/**/*.ts` (comment
lines aside, `data/sources` and generated bundles left out) is split into sentences and indexed. A sentence shown is
then matched against them:

- **exact**: the words as written. For Kyr, the file, the line, and the declaration (`Observe owain_waits`). For the
  JSON tables, the file, the line, and the key.
- **template**: a sentence with blanks (`{name}` in Kyr, the `.kyrt` templates and the tables; `${…}` in code),
  filled in.
- **partial**: a stretch of six words or more is written somewhere, and the rest is made elsewhere (a list joined, a
  clause added). This is a lead, not a finding.
- **none**: made by code that never writes the sentence whole. A verb joined to an item's name ("You take Bran's
  tally-stick"), a recruit's terms with the price filled in, the runner's fight lines.

What it cannot do:

- It reports where words are *written*, not which rule *chose* them. A sentence written in several places (voice
  tables share lines) lists every place, up to four.
- It traces against the sources as they stand when the page is made, not as they stood when the journey was played.
  After an edit, a captured sentence may no longer be found, and that is the point of the replay.
- Short sentences ("Time passes.") match wherever they are written, which is often everywhere. A template
  sentence needs ten letters of its own in one stretch to be matched at all.
- Fight lines are not traced.

On the example below, 96 of the 102 distinct sentences outside the fight were exact or template, 3 partial and 3
none: "You take Bran's tally-stick." (an item's name joined to a verb), "Ask Leif.'" (written `Ask {{t}_priest}.'` in
undertown.kyrt: a template with too few words of its own to be matched safely) and "Rats in the cellar are here." (made by the narrator).

## The example

[iscoed-drove/](iscoed-drove/) is `--world iscoed --as human/warrior/Wenna`, 45 steps by the policy. It goes from the
landing at Porthalen through the drove (customs-house, pens, the Black Rhyne), the Stone Horn's taproom (a recruit,
the tally-stick, the Merrowdale notice), the well-post's notices, and Porthalen Hall (hall, library, loggia, garden,
kitchen), down to the Hall cellar and the first turns of a fight with its rats.

- `captured.json` was recorded at the tool's own commit on its branch (8f7bb0c9, before it was rebased onto main).
  The game code it played was e04b4264's. Recording it twice gave the same narration step for step.
- `notes.json` has six notes, one each of causality, diction, duplication and excess, plus a second causality and a
  second diction. They are marked in `reader.html`.
- `replay.json` and `compare.html`/`compare.md` are a **demonstration**. The "after" was played in a throwaway
  worktree with three sentences revised by hand. Those changes are kept in
  [iscoed-drove/demo-revision.diff](iscoed-drove/demo-revision.diff) and were never landed, so the replay's label
  says "with changes not committed". Three of the 46 steps read otherwise, and three notes are no longer shown. A
  replay under main at the time changed nothing on this route. After the prose revision lands, run
  `bin/kyrie read replay doc/architecture/mission-22/journey-reader/iscoed-drove` to replace the demonstration with
  the real before-and-after.
- The scene view of step 22 ("Ask the steward of the Hall about the old road") was opened in the built page from a
  12 MB checkpoint made in 6 s. The page told the steward's answer word for word as captured. The checkpoint is not
  kept here; `read scene` makes it again.
