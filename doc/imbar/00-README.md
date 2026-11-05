# Imbar: deep history, selective connection, and a workbook

*Branch `adventure/imbar-deep-time`, from `main` at `fb24f94` (the M19 builder's HEAD at the time). 5 November 2026.*

This commission asked for improved adventures first, and documents second. What follows is a short map of what was
done, where it is, how it was checked, and — at the end, without cushioning — what was not done.

## What changed in the game

| What | Where | Played evidence |
|---|---|---|
| **The Long Man**: the Hall's charter (an Aenean writ of *keeping*, not of holding), the reeve of the waters as the dale's auditor of the Hall, the sheaf in forty, Venn in a widow's debt, Dunnet as a prospective warden, and the parish bell given to the keeper as it was once before | `data/adventures/the-long-man/charter.kyr` (+ `module.json`, `placed.json`) | `test/the-long-man-charter.test.ts` (3 tests); transcripts `playtests/long-man-charter.md`, `playtests/long-man-bell.md` |
| **Fair Weather**: the hermit's cell is the Light's keeper's bench, a tally in three notations; "neither man nor dog nor cat" is the keeper's column; the Court cannot relieve what it did not appoint | `data/adventures/skeel/keeper.kyr` (+ `module.json`, `placed.json`) | `test/skeel-keeper.test.ts` (1 test); `test/fixtures/skeel/keeper.json`; `playtests/fair-weather-keeper.md` |
| **The Founders' Exchange**: a Deem-cast factor, carter and hands, placed as a herald to two countries; the Long Man's bronze goes to the factor; the carter ships it south while the company is away; Low Water's Halm has it on a cloth and says so | `data/goings-on/factors/*`, `data/scenarios/factors.scenario.json`, `data/adventures/countries.json` (heralds), `the-long-man/placed.kyr`, `low-water/placed.{kyr,json}`; 3-line change `src/world/world-assembler.ts` | `test/factors-handoff.test.ts` (3 tests: binding, the full handoff, the control); `playtests/factor-handoff.md` |
| **Reconciliations**: the Grand Tour's tide-engine is *Aenean-kept*, not *Aenean-built* (matching Low Water); Hollins is one family (Whitbread) | `the-grand-tour/{whelm,undertow}.kyr`, `hollins/*.kyr` | `test/the-grand-tour*.test.ts`, `test/hollins*.test.ts` pass |

Original forms are preserved as patches in `diffs/` (`git diff fb24f94..HEAD -- <dir>`) and in git history.

## The deliverables, by the brief's numbering

| # | Deliverable | Where |
|---|---|---|
| 1 | Comparative literary and setting-coherence audit | `01-audit.md` |
| 2 | Working historical treatment with epistemic status | `02-history.md` |
| 3 | Substantive implemented revisions | the table above; `diffs/` |
| 4 | Cross-campaign relationship and duplication audit; reconciliations; preserved differences | `01-audit.md` §1.2, §1.4, §1.5 |
| 5 | Character and companion dossiers | `05-dossiers.md` |
| 6 | The Imbar Campaign-Scenario Workbook, with a register and four causation chains | `06-workbook.md` |
| 7 | Kyr/Deem authorability report | `04-authorability.md` |
| 8 | One bounded authored/generated handoff | `04-authorability.md` §4.3; `playtests/factor-handoff.md`; `test/factors-handoff.test.ts` |
| 9 | Playthrough and editorial evidence | `playtests/`; `03-editorial-review.md` |
| 10 | Branch-integration report and honest assessment | this file, below |

## Branch integration report

**Compatibility with the M19 builder.** The branch touches one engine file (`src/world/world-assembler.ts`, 6 lines
including a comment): it places each distinct herald scenario once instead of once per country. It adds no engine
type or rule. All other changes are in `data/` (adventures, one scenario module, `countries.json`), `test/`, and
`doc/imbar/`. No existing file in `doc/architecture/` or `doc/design/` is edited. Merge conflicts are possible in
`data/adventures/countries.json` (the herald blocks on the `longman` and `lowwater` entries; I also re-serialised the
file with 1-space indent, matching the file's existing style, which should minimise the diff but is worth checking).

**Checks run.**

| Check | Result |
|---|---|
| `bin/kyrie lint` (every recommended campaign) | 0 errors; the only new advice are none; Quittance's 9 `unbound` warnings predate this branch (verified identical at `fb24f94`) |
| `eslint . --max-warnings=0` and `tsc --noEmit` (both configs) | clean after fixing three style errors in my own files |
| The seven new tests | pass |
| Regression: `the-long-man`, `skeel`, `skeel-placed`, `low-water`, `low-water-placed`, `merrow-to-ammerlin`, `frontier`, `goings-on`, `countries`, `world-assembly`, `hollins`, `the-grand-tour`, `the-grand-tour-outcomes` | pass (42 + 16 + 54 tests across the three batches) |
| Full `bun run check` | **see the end of this file**, written after the run completed |

**On the branch name.** The session was configured to develop on `claude/adoring-heisenberg-htfdt4`, and the brief
asked for an independent `adventure/...` branch. I developed on `adventure/imbar-deep-time`. The same commits are
available on whichever branch the owner chooses to merge; nothing was pushed to `main`.

## Honest assessment of what is unfinished

**Literary.**
- Two adventures were deeply revised, and one more (Low Water) received a scene; twenty were not touched. The
  corpus is not "Imbar-integrated"; two small works and one handoff are.
- The charter exposition is still a dump (`charter_read`, about 120 words). The editorial review names it as the
  first thing to change.
- The bell's cost is narrative, not mechanical. A hard-headed player loses nothing by giving it.
- Both revisions turn on the same device (a keeping whose reason was lost). The next author should choose a history
  that does *not* help.
- Companions: unchanged. The preset party cannot take authored lines (a tooling gap, not a literary choice).
- No cold-player pass; the playing was by labels, one build per route, mostly the preset cleric/warrior/ranger.
- The Third Night's bridge penny, Carth's missing Bishop, the Hive's Seventh Leaving, the Quiet's chronology and the
  Collegium naming are *recorded* as proposals, not done.

**Technical.**
- The Exchange's carter moves by rule, not by plan; no strategic antagonist was demonstrated (§4.4 of the report).
- Save/resume was not exercised.
- Kits cannot be requested from inside an adventure; I did not build that.
- Deem generation inside an *adventure* module (as opposed to a town scenario) was not tested.

**What I'm confident of.** The handoff is real: a thing taken from a dale by a barge is held by a person a generator
made, carried on by that person's own clock while the player is in another country, and found on a cloth in a third
adventure, and the control shows the same chain breaking when the player buys the lot back. The re-readings in
*The Long Man* and *Fair Weather* change what the player can do, not just what they know. The Aenean mystery is
neither explained nor shrunk.
