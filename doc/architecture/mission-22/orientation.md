# Mission 22: orientation (Phase 0)

Written for the owner, 16 November 2026, evening. This is the Phase 0 deliverable of [brief.md](brief.md): what is
known, what conflicts, what is unverified, the highest-leverage interventions, and the order of work. The evidence is the
deployed build `e71acf63` (code identical to main), played in Chromium on the Pages URL, plus the repository. The
historical audit behind §4 and §6 is [obligations-audit.md](obligations-audit.md).

**What this is not.** A headless or scripted browser run is not a player. Nothing below says the opening is enjoyable.
It says what a press does, how long things take, and where the page breaks its own rules.

## 1. The baseline, measured on the deployed build

The runs are as follows. In each, the studio mark and the opening's beats are shown as a player sees them (`?ident&opening`;
automation is otherwise spared both).

- A human mage at desktop size (1280×800), driven by keyboard holds.
- A warrior on a tablet (820×1180), driven by touch.
- A mage in a1 through a conversation, the corn-store rats and a spell.
- The map opened in a1.

The recordings are unedited webm, with a timeline and measures beside each, in `/var/tmp/kyrie/m22/base/`. Key frames are
in [baseline/](baseline/). The tools are `/var/tmp/kyrie/m22/tools/record-opening.ts`, `record-play.ts` and `frames.ts`
(frames.ts decodes the video in Chromium).

| Moment | Desktop | Tablet (touch) | Notes |
|---|---:|---:|---|
| Navigation → the title drawn (no studio mark, cold) | 3.3 s | 2.8 s | `mono.js` is 5.5 MB compressed, about 20 MB parsed: one long task of 1.5 s |
| Navigation → the title usable by a hand (with the studio mark, cold) | 8.9 s | | the mark lasts about 3.8 s, then the dark |
| … → usable by the keys | about 12.3 s | | the 3.2 s reveal swallows a key (§2, defect 1) |
| Warm reload → the title | 0.4 s | 0.35 s | the browser keeps the script compiled |
| One creation step (hold released → next page) | under 0.3 s | under 0.3 s | seven steps: why, people, sign, calling, before, presenting, name |
| Hold on set-out → the first page | 8.8–10.4 s | 8.9 s | a blurred field and "Setting out…" with three named stages (frame 04) |
| The opening's beats (prose pages, no act) | about 13 s for two | | they go on by themselves or at a key |
| Navigation → the first gameplay choice, at a deliberate pace | about 48 s | | 9 s to the title, 15 s of creation, 9 s of setting out, 13 s of beats |
| A press → the page visibly answers (mutation + two frames) | 5–53 ms (median about 33) | 27–60 ms | already a game's figure |
| A gameplay act → the next choices drawn | 200–560 ms | 190–760 ms | talk 290–560 ms; a journey 760 ms |
| Page errors | 0 | 0 | in every run |

**The headless baseline** is the owner's own census (`scripts/opportunity-depth.ts`, 84 blind walks), re-run on current main
in §5.

## 2. Defects found by playing the baseline

| # | What | Where | Class |
|---|---|---|---|
| 1 | **A held Enter on the lit New game does nothing.** The title marks New game current but does not focus it (that was only under `?touch`), so a keyboard player must Tab first. During the 3.2 s reveal a key is also swallowed as "skip", whereas a pointer press on a way in is let through. | `title-page.tsx` | verified defect: **fixed on m22** (focus at the reveal, keys let through like the hand), held by a new case in `test/opening-browser` |
| 2 | **The fight unfolds a kind into a grid.** "Spells ›" and "Other ›" open nine spells beside the four, including disabled "beyond your level" spells. Attack is a two-step (choose, then aim). | fight stage (frame 09) | against ruling 2 and the 17 Nov "no compound act" rule |
| 3 | **Talk shows five rows.** Two topics, the pager, Trade and Take your leave (frame 07), with key hints numbered 6, 7 and 9. | talk stage | against "four foreground items" |
| 4 | **The sign page lists twelve rows** at once. | creation, sign (frame 03) | against "four foreground items" (the observatory is the candidate answer) |
| 5 | **Boxed widgets survive.** The warren's DANGER card (frame 08), the map's + − ◎ (frame 10), creation's "Back" and "Set out now" words, and the calling cards' boxed edges. | various | the 40-button census of button-discovery.md |
| 6 | **Rows truncate two asides.** "To the corn-store cellar · the way yo… · The rats … wil…"; the way out prints its route "a hole gnawed… › the trapd". | warren | prose economy in rows |
| 7 | **A person with no portrait shows a stray outlined circle** behind the name. | talk, Samwise | visual defect |
| 8 | **No commit sound by default.** `Tone` sounds only under `?ix` or `?touch`. | `instrument/tone.ts` | open design question (§3) |
| 9 | The date line ("SPRING, SUNNY, 23 WOLFMOON") sits faint over a bright painting beside the place line. The doctrine also asks not to repeat unchanged facts. | first scene | legibility |

What works, said plainly:
- The tablet opening is coherent. You take up the aim; the gold step leads to the landing; your brother's talk is
  specific; he joins.
- The first scene's prose invites.
- Press acknowledgement is fast and nothing reflows.
- Creation by holding works by touch, pointer and keys (once focused).

## 3. What conflicts: the documents against the rulings

The 16 November rulings (and their amendment: the title and creation are held) win. These documents still say otherwise:

- **`doc/design/GRAMMAR.md`** (Phase 0 reading #1) says:
  - "Nothing is held, for now";
  - cards are chosen "at a tap, then Continue";
  - the rest is behind a lens's "All" and talk's "Something else…";
  - "a thing's look unfolds in place";
  - rows have "a ground and edge" at rest;
  - silver is in the colour precedence.

  **To be rewritten to the rulings first (§7, step 1).**
- **`interaction/recommendation.md`** (assistant, M21) says to keep holds flagged until Energy exists. It was overruled by the
  owner's amendment; the title, creation, rest and camp are held now.
- **`first-touch.md` §10** says to inherit commit-on-down for the mouse. The owner later ruled that a mouse let go early does
  nothing, which is a hold, not a down-commit.
- **Four press mechanisms coexist in `web/reader/instrument/`:**
  - `Hold` (live);
  - `Press` (`?ix=a|b`);
  - `Touch`/`Gesture` (`?touch=down|up`);
  - `Reticle`.

  The ruling says to remove old mechanisms rather than except around them. Two flagged pipelines are M21 experiments with
  no owner adoption.
- **The commit path is still per-row `onClick`s.** There are 124 `onClick`s in the reader. `ReaderKeys` commits digits
  directly. Focus has three models (keys' cursor, DOM focus, `:hover`; creation has its own `lit`). These are first-touch.md
  §8's three seams, none of them done.
- **Attention is client state.** The engine does not know the map, a lens or a talk is open (interaction-contract.md, "Not
  yet").
- **The colour atlas** (colour-atlas.md, 15 Nov) retired silver and rose. GRAMMAR.md still lists them, and the owner's
  opportunity-depth census still reports exploration as "silver" and companionship as "rose" (they are icons now).
- **The register under-counts.** `register-state` skips the three-column tables of §49–50 (13 rows, at least 8 live). Some
  P0 rows were fixed under the old rule and reversed by the amendment (IG-07 "no hold", BP-09 "cards at a tap").

## 4. What is known, what is unverified

**Known, with evidence:**
- **The interaction is mechanically sound.** It is one press, taken once, on its own screen. Nothing moves under the hand.
  Every `[data-act]` is an observed act (test/interaction-contract-browser). Stale ids are refused (test/action-identity).
- **The browser and terminal share the command set.**
- The SRD proving cases, verified by code path, not catalogue:
  - **Healing:** works in and out of a fight.
  - **Spells outside a fight:** only allies' safe effects.
  - **Sleep:** cannot open or alter a confrontation (CF-03 unbegun).
  - **Raise Dead:** works in a fight and as a priest's service, not from a party cleric outside one.
  - **Plane Shift:** catalogue-only.
  - **Plane laws:** only ±1 spell DC in a fight.
  - Detail is in obligations-audit.md §6.
- **Kyr can already declare an item kind** (worth, weight, slot, description, a granted skill) but not its own effects,
  combat stats or icon. The handoff overstated the gap.

**Unverified:**
- Any person or blind agent playing the deployed first fifteen minutes (FH-01, P0).
- A real iPad, WebKit, phone or screen reader.
- Reduced motion beyond the title.
- A gamepad.
- Whether the tone helps.
- The hired companion's journey and fight (ruling 6's end-to-end route).

## 5. The headless baseline

*(Filled in below when the census on current main finishes.)*

## 6. Highest-leverage interventions

1. **The setting-out wait (9–10 s) and the first seconds (9–12 s to a usable title).**
   - These are the opening's worst moments, and no page design removes them.
   - Measured causes: the 20 MB single script (a 1.5 s compile before anything answers) and a full world composed after the
     last hold. The warm start in Node is 6.5 s: installs, `structuredClone`, compile (loading-boundaries.md §1).
   - Two levers are already half-built.
     1. **An engine `ready` request** prepares a start while the player reads. It fires only from the old `company` phase,
        never from the default composed creation. Wiring it from the "why" step would hide most of the wait behind
        creation's 15 s of human time, if the world does not depend on later choices; to be measured.
     2. **Splitting the title and creation into their own small script.**
2. **One commit path and one focus model** (first-touch §8). This is the precondition for every press refinement:
   - pressed and taken states;
   - the tone;
   - Inspect;
   - a gamepad;
   - removing `?ix` and `?touch`.
3. **The foreground rule enforced where it is broken:** the fight's kinds, talk's Trade and Leave, the sign's twelve. With a
   census spec, no screen may draw more than four acts plus one pager.
4. **The opportunity indicator made normative.** Hue is the kind of opportunity; the condition (near or far, new or known,
   spent) is value and intensity. Each condition is derived from what the character knows, and tested that way.
5. **The stewardship pass:**
   - make the register scripts count every row;
   - close or supersede the stale rows the audit found with evidence;
   - register the baseline defects and the nine unregistered promises.

## 7. The execution sequence

The working rules are M21's: trunk pushes to main after `check:fast`; heavy runs one at a time, on CI where possible; at
most two agents. The lead works the primary line; the parallel lines get one bounded agent at a time.

| Step | What | Done when |
|---|---|---|
| 0 (now) | Baseline, this report, the audit, defect 1 fixed | pushed |
| 1 | **Reconcile the contracts.** Rewrite GRAMMAR.md to the rulings and add the input contract (each hand × tap, hold, cancel, repeat, assistive). Mark the stale docs. Make the register scripts count every row. Register the defects of §2. | one grammar document, no competing one |
| 2 | **One commit path and one focus model.** Every row's activation goes through one `commit(row, source)`, with one `lit` per screen. The `?ix` and `?touch` pipelines are removed or folded into `Hold`. Discovery measures are re-run. | specs: one commit path (a census of handlers), no duplicate across 60 acts, keys and pointer and touch equal |
| 3 | **The row's states** (rest, lit by the keys versus the hand, pressed, taken, held, armed) as tokens, the same on the title, creation, scene, talk, map and fight. Two or three materially different treatments compared live (recorded), one landed. The tone tried with a sound option. | recorded comparison; owner-facing note |
| 4 | **The foreground rule everywhere:** the fight's kinds and spells as paged rows, talk at four, the sign as four-and-pager or the observatory, the map's controls. Terminal and runner parity checked. | census spec of acts per screen, ≤ 4 + pager |
| 5 | **The opportunity indicator appendix** (Phase 2), implemented for rows, nearby marks, map marks and known distant places, with condition tested by knowledge. | normative appendix + specs on six named cases |
| 6 | **First-touch performance:** set-out prepared during creation; the script split; measured cold, warm and at ×4 CPU. Then the sign/observatory and the transitions as one passage. | before/after table; the wait gone or an exact account |
| 7 | **Record the passage again** on Pages: desktop, tablet, phone, keys, touch, reduced motion. An independent (blind-agent) review of the recording is kept apart from a playthrough judgement. | acceptance item 1 |
| ∥ A | CF-03 (Sleep against a band, opening a fight; a persistent sleeping state) in a tiny world, then a party cleric's Raise Dead outside a fight | specs; srd-fidelity rows |
| ∥ B | An item kind with its own effect, declared in Kyr | spec; author note |
| ∥ C | The census by stage (exists → … → consequential) by aspect, calling and opening, with Wander's smallest proof examined | report + ratchets |
| ∥ D | Two authorial probes (a livelihood, a mystery), one of them on the opening's circumstances (debt with a real creditor) | friction carried to the register |
| ∥ E | Phase 6: the evidence pass over stale rows; the skipped and failing pins (5 skips, 5 `it.failing`) given rows or mended | register-state shrinking, every row accounted |

Phase 5 (the design prospectus: careers, instruments, the middle scale, fate) is written once, from the existing records,
after step 5, and builds nothing.
